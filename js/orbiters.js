/**
 * Orbiters System
 * Creates free-roaming nodes that move along internal trajectories
 * These add randomization and organic movement to the mandala
 */

class OrbitersSystem {
    // Movement pattern types
    static PATTERNS = {
        'circular': { name: 'Circular', description: 'Simple circular orbit' },
        'elliptical': { name: 'Elliptical', description: 'Oval-shaped path' },
        'spiral': { name: 'Spiral', description: 'Gradually expanding/contracting' },
        'lissajous': { name: 'Lissajous', description: 'Figure-8 and complex curves' },
        'pendulum': { name: 'Pendulum', description: 'Swinging back and forth' },
        'random-walk': { name: 'Random Walk', description: 'Brownian motion style' },
        'figure-eight': { name: 'Figure Eight', description: 'Infinity symbol path' },
        'rose': { name: 'Rose Curve', description: 'Flower petal pattern' }
    };

    constructor(mandala, audioEngine) {
        this.mandala = mandala;
        this.audioEngine = audioEngine;
        this.orbiters = [];
        this.maxOrbiters = 20;
        this.enabled = true;

        // Global settings
        this.settings = {
            speed: 1,
            size: 1,
            glow: 0.5,
            trailLength: 8,
            triggerOnCross: true,  // Trigger sound when crossing trigger line
            triggerOnCollide: false // Trigger when orbiters collide
        };

        // Trigger line angle (same as mandala)
        this.triggerAngle = -Math.PI / 2;
        this.triggerWidth = 0.08;
    }

    /**
     * Add an orbiter with specified pattern
     */
    addOrbiter(config = {}) {
        if (this.orbiters.length >= this.maxOrbiters) {
            this.orbiters.shift(); // Remove oldest
        }

        const orbiter = {
            id: Date.now() + Math.random(),
            // Position (relative to center, -1 to 1)
            x: config.x ?? (Math.random() - 0.5) * 1.5,
            y: config.y ?? (Math.random() - 0.5) * 1.5,
            // Velocity
            vx: 0,
            vy: 0,
            // Pattern
            pattern: config.pattern || this.randomPattern(),
            // Pattern parameters
            params: {
                a: config.a ?? 0.3 + Math.random() * 0.5, // Amplitude/radius
                b: config.b ?? 0.2 + Math.random() * 0.4, // Secondary amplitude
                freqX: config.freqX ?? 1 + Math.random() * 3, // X frequency
                freqY: config.freqY ?? 1 + Math.random() * 3, // Y frequency
                phase: config.phase ?? Math.random() * Math.PI * 2,
                speed: config.speed ?? 0.5 + Math.random() * 1.5,
                direction: config.direction ?? (Math.random() > 0.5 ? 1 : -1),
                petals: config.petals ?? Math.floor(3 + Math.random() * 5) // For rose curves
            },
            // Visual
            color: config.color || this.randomColor(),
            size: config.size ?? 4 + Math.random() * 4,
            alpha: 1,
            glow: config.glow ?? 0.3 + Math.random() * 0.4,
            // State
            age: 0,
            lifetime: config.lifetime ?? Infinity,
            trail: [],
            lastTriggerTime: 0,
            triggered: false,
            triggerFade: 0,
            // Ring association (optional - orbiter can belong to a ring)
            ringIndex: config.ringIndex ?? -1,
            // Sound type
            soundType: config.soundType || this.randomSoundType()
        };

        // Initialize position based on pattern
        this.updateOrbiterPosition(orbiter, 0);

        this.orbiters.push(orbiter);
        return orbiter;
    }

    /**
     * Add multiple orbiters at once
     */
    addOrbiters(count, pattern = null) {
        for (let i = 0; i < count; i++) {
            this.addOrbiter({
                pattern: pattern || this.randomPattern(),
                phase: (i / count) * Math.PI * 2 // Spread phases evenly
            });
        }
    }

    /**
     * Remove an orbiter
     */
    removeOrbiter(id) {
        this.orbiters = this.orbiters.filter(o => o.id !== id);
    }

    /**
     * Clear all orbiters
     */
    clear() {
        this.orbiters = [];
    }

    /**
     * Update all orbiters
     */
    update(deltaTime) {
        if (!this.enabled) return;

        const time = performance.now() / 1000;
        const currentTime = performance.now();

        this.orbiters.forEach((orbiter, index) => {
            // Update age
            orbiter.age += deltaTime;

            // Check lifetime
            if (orbiter.lifetime !== Infinity && orbiter.age > orbiter.lifetime) {
                orbiter.alpha -= deltaTime * 0.002;
                if (orbiter.alpha <= 0) {
                    this.orbiters.splice(index, 1);
                    return;
                }
            }

            // Store trail
            if (this.settings.trailLength > 0) {
                orbiter.trail.unshift({ x: orbiter.x, y: orbiter.y });
                if (orbiter.trail.length > this.settings.trailLength) {
                    orbiter.trail.pop();
                }
            }

            // Update position based on pattern
            this.updateOrbiterPosition(orbiter, time);

            // Check trigger zone
            if (this.settings.triggerOnCross) {
                this.checkTrigger(orbiter, currentTime);
            }

            // Fade trigger effect
            if (orbiter.triggerFade > 0) {
                orbiter.triggerFade -= deltaTime * 0.003;
                if (orbiter.triggerFade < 0) orbiter.triggerFade = 0;
            }
        });

        // Check collisions
        if (this.settings.triggerOnCollide) {
            this.checkCollisions(currentTime);
        }
    }

    /**
     * Update orbiter position based on its pattern
     */
    updateOrbiterPosition(orbiter, time) {
        const p = orbiter.params;
        const t = time * p.speed * this.settings.speed * p.direction + p.phase;

        switch (orbiter.pattern) {
            case 'circular':
                orbiter.x = Math.cos(t) * p.a;
                orbiter.y = Math.sin(t) * p.a;
                break;

            case 'elliptical':
                orbiter.x = Math.cos(t) * p.a;
                orbiter.y = Math.sin(t) * p.b;
                break;

            case 'spiral':
                const spiralRadius = p.a * (0.5 + 0.5 * Math.sin(t * 0.2));
                orbiter.x = Math.cos(t) * spiralRadius;
                orbiter.y = Math.sin(t) * spiralRadius;
                break;

            case 'lissajous':
                orbiter.x = Math.sin(t * p.freqX) * p.a;
                orbiter.y = Math.sin(t * p.freqY + p.phase) * p.b;
                break;

            case 'pendulum':
                const swing = Math.sin(t) * p.a;
                orbiter.x = Math.sin(swing) * p.b;
                orbiter.y = -Math.cos(swing) * p.b + p.b; // Pivot from top
                break;

            case 'random-walk':
                // Add small random displacement
                orbiter.vx += (Math.random() - 0.5) * 0.01;
                orbiter.vy += (Math.random() - 0.5) * 0.01;
                // Dampen
                orbiter.vx *= 0.98;
                orbiter.vy *= 0.98;
                // Apply
                orbiter.x += orbiter.vx;
                orbiter.y += orbiter.vy;
                // Constrain
                const maxDist = p.a;
                const dist = Math.sqrt(orbiter.x ** 2 + orbiter.y ** 2);
                if (dist > maxDist) {
                    orbiter.x *= maxDist / dist;
                    orbiter.y *= maxDist / dist;
                }
                break;

            case 'figure-eight':
                orbiter.x = Math.sin(t) * p.a;
                orbiter.y = Math.sin(t * 2) * p.b * 0.5;
                break;

            case 'rose':
                // Rose curve: r = cos(k*theta)
                const k = p.petals;
                const theta = t;
                const r = Math.cos(k * theta) * p.a;
                orbiter.x = r * Math.cos(theta);
                orbiter.y = r * Math.sin(theta);
                break;

            default:
                // Fallback to circular
                orbiter.x = Math.cos(t) * p.a;
                orbiter.y = Math.sin(t) * p.a;
        }
    }

    /**
     * Check if orbiter crosses trigger zone
     */
    checkTrigger(orbiter, currentTime) {
        const angle = Math.atan2(orbiter.y, orbiter.x);
        const normalizedAngle = this.normalizeAngle(angle);
        const angleDiff = Math.abs(this.normalizeAngle(normalizedAngle - this.triggerAngle));
        const isInTriggerZone = angleDiff < this.triggerWidth || angleDiff > (Math.PI * 2 - this.triggerWidth);

        const cooldown = 800;
        if (isInTriggerZone && currentTime - orbiter.lastTriggerTime > cooldown) {
            if (!orbiter.triggered) {
                orbiter.triggered = true;
                orbiter.triggerFade = 1;
                orbiter.lastTriggerTime = currentTime;
                this.triggerSound(orbiter);
            }
        } else {
            orbiter.triggered = false;
        }
    }

    /**
     * Check for collisions between orbiters
     */
    checkCollisions(currentTime) {
        for (let i = 0; i < this.orbiters.length; i++) {
            for (let j = i + 1; j < this.orbiters.length; j++) {
                const a = this.orbiters[i];
                const b = this.orbiters[j];

                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const minDist = (a.size + b.size) * 0.02; // Scaled to world coords

                if (dist < minDist) {
                    // Collision!
                    if (currentTime - a.lastTriggerTime > 500) {
                        a.triggerFade = 1;
                        a.lastTriggerTime = currentTime;
                        this.triggerSound(a);
                    }
                    if (currentTime - b.lastTriggerTime > 500) {
                        b.triggerFade = 1;
                        b.lastTriggerTime = currentTime;
                        this.triggerSound(b);
                    }
                }
            }
        }
    }

    /**
     * Trigger sound for an orbiter
     */
    triggerSound(orbiter) {
        if (!this.audioEngine || !this.audioEngine.isInitialized) return;

        // Use ring index if associated, otherwise use random ring
        const ringIndex = orbiter.ringIndex >= 0 ? orbiter.ringIndex :
            Math.floor(Math.random() * (this.mandala?.rings?.length || 4));

        this.audioEngine.playTrigger(
            orbiter.soundType,
            ringIndex,
            Math.floor(Math.random() * 8), // Random note index
            { x: orbiter.x, y: orbiter.y, z: 0 }
        );

        // Emit particles if mandala has trigger callback
        if (this.mandala?.onTrigger && this.mandala.maxRadius) {
            const screenX = this.mandala.centerX + orbiter.x * this.mandala.maxRadius;
            const screenY = this.mandala.centerY + orbiter.y * this.mandala.maxRadius;
            this.mandala.onTrigger(screenX, screenY, orbiter.color, orbiter.soundType);
        }
    }

    /**
     * Draw all orbiters
     */
    draw(ctx, centerX, centerY, maxRadius) {
        if (!this.enabled || !ctx) return;

        this.orbiters.forEach(orbiter => {
            const x = centerX + orbiter.x * maxRadius;
            const y = centerY + orbiter.y * maxRadius;

            // Draw trail
            if (orbiter.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(
                    centerX + orbiter.trail[0].x * maxRadius,
                    centerY + orbiter.trail[0].y * maxRadius
                );
                orbiter.trail.forEach((point, i) => {
                    ctx.lineTo(
                        centerX + point.x * maxRadius,
                        centerY + point.y * maxRadius
                    );
                });
                ctx.strokeStyle = this.colorWithAlpha(orbiter.color, orbiter.alpha * 0.3);
                ctx.lineWidth = orbiter.size * 0.3 * this.settings.size;
                ctx.lineCap = 'round';
                ctx.stroke();
            }

            // Draw glow
            if (this.settings.glow > 0 || orbiter.triggerFade > 0) {
                const glowIntensity = (this.settings.glow + orbiter.triggerFade) * orbiter.glow;
                const glowSize = orbiter.size * (2 + orbiter.triggerFade * 2) * this.settings.size;

                const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
                gradient.addColorStop(0, this.colorWithAlpha(orbiter.color, glowIntensity * orbiter.alpha));
                gradient.addColorStop(1, this.colorWithAlpha(orbiter.color, 0));

                ctx.beginPath();
                ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Draw orbiter body
            const size = orbiter.size * (1 + orbiter.triggerFade * 0.5) * this.settings.size;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fillStyle = this.colorWithAlpha(orbiter.color, orbiter.alpha * 0.8);
            ctx.fill();
            ctx.strokeStyle = this.colorWithAlpha(orbiter.color, orbiter.alpha);
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Inner bright core
            ctx.beginPath();
            ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = this.colorWithAlpha('#ffffff', orbiter.alpha * (0.5 + orbiter.triggerFade * 0.5));
            ctx.fill();
        });
    }

    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }

    colorWithAlpha(color, alpha) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        return color;
    }

    randomPattern() {
        const patterns = Object.keys(OrbitersSystem.PATTERNS);
        return patterns[Math.floor(Math.random() * patterns.length)];
    }

    randomColor() {
        const colors = [
            '#ff6b9d', '#4a9eff', '#50fa7b', '#ffb86c',
            '#bd93f9', '#ff5555', '#8be9fd', '#f1fa8c'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    randomSoundType() {
        const types = ['melodic', 'sparkle', 'atmospheric', 'bass'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Get pattern names
     */
    static getPatternNames() {
        return Object.keys(OrbitersSystem.PATTERNS);
    }

    /**
     * Get orbiter count
     */
    getCount() {
        return this.orbiters.length;
    }

    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Dispose / cleanup
     */
    dispose() {
        this.clear();
        this.enabled = false;
    }
}

window.OrbitersSystem = OrbitersSystem;
