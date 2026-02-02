/**
 * Particle Systems Module
 * Creates particles that emit from trigger points and flow outward
 */

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 300;

        // Particle settings
        this.settings = {
            enabled: true,
            emitCount: 5,        // Particles per trigger
            speed: 2,           // Base speed
            speedVariance: 1,   // Speed randomness
            size: 3,            // Base size
            sizeVariance: 2,    // Size randomness
            lifetime: 2000,     // ms
            gravity: 0,         // Downward pull
            drag: 0.98,         // Velocity decay
            fadeOut: true,      // Fade as they age
            glow: true,         // Add glow effect
            trails: true,       // Leave trails
            trailLength: 5,
            spiralOut: true,    // Spiral outward from center
            colorMode: 'inherit' // 'inherit', 'rainbow', 'white'
        };
    }

    /**
     * Emit particles from a trigger point
     * @param {number} x - Screen X position
     * @param {number} y - Screen Y position
     * @param {string} color - Hex color
     * @param {string} type - Sound type for behavior variation
     * @param {number} centerX - Mandala center X
     * @param {number} centerY - Mandala center Y
     */
    emit(x, y, color, type = 'melodic', centerX, centerY) {
        if (!this.settings.enabled) return;

        const count = this.settings.emitCount;
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= this.maxParticles) {
                // Remove oldest particle
                this.particles.shift();
            }

            const particle = this.createParticle(x, y, color, type, centerX, centerY);
            this.particles.push(particle);
        }
    }

    createParticle(x, y, color, type, centerX, centerY) {
        // Calculate angle from center for spiral effect
        const angleFromCenter = Math.atan2(y - centerY, x - centerX);

        // Base velocity direction (outward from center with some randomness)
        let vx, vy;
        if (this.settings.spiralOut) {
            // Spiral outward
            const outwardAngle = angleFromCenter + (Math.random() - 0.5) * 0.5;
            const speed = this.settings.speed + (Math.random() - 0.5) * this.settings.speedVariance;
            vx = Math.cos(outwardAngle) * speed;
            vy = Math.sin(outwardAngle) * speed;
        } else {
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const speed = this.settings.speed + (Math.random() - 0.5) * this.settings.speedVariance;
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
        }

        // Type-based behavior modifications
        let behaviorMod = {};
        switch (type) {
            case 'bass':
                behaviorMod = { size: 1.5, speed: 0.7, gravity: 0.02 };
                break;
            case 'sparkle':
                behaviorMod = { size: 0.6, speed: 1.5, lifetime: 0.7 };
                break;
            case 'atmospheric':
                behaviorMod = { size: 1.2, speed: 0.5, drag: 0.99 };
                break;
            case 'melodic':
            default:
                behaviorMod = { size: 1, speed: 1, lifetime: 1 };
        }

        const size = (this.settings.size + (Math.random() - 0.5) * this.settings.sizeVariance) * behaviorMod.size;

        return {
            x,
            y,
            vx: vx * (behaviorMod.speed || 1),
            vy: vy * (behaviorMod.speed || 1),
            size: Math.max(1, size),
            color: this.getParticleColor(color),
            lifetime: this.settings.lifetime * (behaviorMod.lifetime || 1),
            age: 0,
            type,
            trail: this.settings.trails ? [{ x, y }] : null,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1
        };
    }

    getParticleColor(baseColor) {
        switch (this.settings.colorMode) {
            case 'rainbow':
                return `hsl(${Math.random() * 360}, 80%, 60%)`;
            case 'white':
                return '#ffffff';
            case 'inherit':
            default:
                return baseColor;
        }
    }

    update(deltaTime) {
        const dt = deltaTime / 16; // Normalize to 60fps

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update age
            p.age += deltaTime;

            // Remove if too old
            if (p.age >= p.lifetime) {
                this.particles.splice(i, 1);
                continue;
            }

            // Store trail point
            if (p.trail && this.settings.trails) {
                p.trail.unshift({ x: p.x, y: p.y });
                if (p.trail.length > this.settings.trailLength) {
                    p.trail.pop();
                }
            }

            // Apply gravity
            p.vy += this.settings.gravity * dt;

            // Apply drag
            p.vx *= this.settings.drag;
            p.vy *= this.settings.drag;

            // Update position
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Update rotation
            p.rotation += p.rotationSpeed * dt;
        }
    }

    draw() {
        if (!this.settings.enabled) return;

        this.particles.forEach(p => {
            const lifeRatio = 1 - (p.age / p.lifetime);
            const alpha = this.settings.fadeOut ? lifeRatio : 1;
            const size = p.size * (0.5 + lifeRatio * 0.5);

            // Draw trail
            if (p.trail && p.trail.length > 1 && this.settings.trails) {
                this.ctx.beginPath();
                this.ctx.moveTo(p.trail[0].x, p.trail[0].y);

                for (let i = 1; i < p.trail.length; i++) {
                    this.ctx.lineTo(p.trail[i].x, p.trail[i].y);
                }

                const trailAlpha = alpha * 0.3;
                this.ctx.strokeStyle = this.colorWithAlpha(p.color, trailAlpha);
                this.ctx.lineWidth = size * 0.5;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }

            // Draw glow
            if (this.settings.glow && alpha > 0.3) {
                const glowSize = size * 3;
                const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                gradient.addColorStop(0, this.colorWithAlpha(p.color, alpha * 0.4));
                gradient.addColorStop(1, this.colorWithAlpha(p.color, 0));

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = this.colorWithAlpha(p.color, alpha);
            this.ctx.fill();
        });
    }

    colorWithAlpha(color, alpha) {
        // Handle hex colors
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // Handle hsl colors
        if (color.startsWith('hsl')) {
            return color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
        }
        return color;
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
    }

    /**
     * Update settings
     */
    setSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    /**
     * Get particle count
     */
    getCount() {
        return this.particles.length;
    }
}

window.ParticleSystem = ParticleSystem;
