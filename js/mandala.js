/**
 * Mandala - Creates the rotating mandala with concentric rings and trigger points
 * Uses Canvas 2D for the main visualization
 */

class Mandala {
    // Predefined mandala patterns
    static PRESETS = {
        'Racing Thoughts': [
            { points: 32, radius: 0.95, speed: 1.0, type: 'melodic', color: '#4a9eff' },
            { points: 24, radius: 0.85, speed: 0.8, type: 'sparkle', color: '#ff6b9d' },
            { points: 20, radius: 0.75, speed: 1.2, type: 'melodic', color: '#50fa7b' },
            { points: 16, radius: 0.65, speed: 0.6, type: 'atmospheric', color: '#ffb86c' },
            { points: 14, radius: 0.55, speed: 1.4, type: 'melodic', color: '#bd93f9' },
            { points: 12, radius: 0.45, speed: 0.5, type: 'bass', color: '#ff5555' },
            { points: 10, radius: 0.35, speed: 1.6, type: 'sparkle', color: '#8be9fd' },
            { points: 8, radius: 0.25, speed: 0.4, type: 'atmospheric', color: '#f1fa8c' },
        ],
        'Calm Waters': [
            { points: 16, radius: 0.95, speed: 0.3, type: 'atmospheric', color: '#5588cc' },
            { points: 12, radius: 0.75, speed: 0.4, type: 'melodic', color: '#66aadd' },
            { points: 8, radius: 0.55, speed: 0.25, type: 'bass', color: '#4477aa' },
            { points: 6, radius: 0.35, speed: 0.35, type: 'sparkle', color: '#88ccff' },
        ],
        'Sacred Geometry': [
            { points: 6, radius: 0.95, speed: 0.5, type: 'melodic', color: '#ffd700' },
            { points: 6, radius: 0.80, speed: -0.5, type: 'melodic', color: '#ffb347' },
            { points: 12, radius: 0.65, speed: 0.7, type: 'sparkle', color: '#ff6b6b' },
            { points: 6, radius: 0.50, speed: -0.7, type: 'bass', color: '#c9b037' },
            { points: 12, radius: 0.35, speed: 0.9, type: 'atmospheric', color: '#bf9b30' },
            { points: 6, radius: 0.20, speed: -0.9, type: 'sparkle', color: '#ffeaa7' },
        ],
        'Fibonacci Spiral': [
            { points: 34, radius: 0.95, speed: 0.618, type: 'melodic', color: '#9b59b6' },
            { points: 21, radius: 0.85, speed: -0.618, type: 'sparkle', color: '#8e44ad' },
            { points: 13, radius: 0.70, speed: 0.618, type: 'melodic', color: '#a569bd' },
            { points: 8, radius: 0.55, speed: -0.618, type: 'atmospheric', color: '#bb8fce' },
            { points: 5, radius: 0.40, speed: 0.618, type: 'bass', color: '#d2b4de' },
            { points: 3, radius: 0.25, speed: -0.618, type: 'sparkle', color: '#e8daef' },
        ],
        'Cosmic Dance': [
            { points: 7, radius: 0.95, speed: 1.2, type: 'melodic', color: '#e74c3c' },
            { points: 11, radius: 0.82, speed: -0.9, type: 'sparkle', color: '#f39c12' },
            { points: 13, radius: 0.69, speed: 1.1, type: 'melodic', color: '#2ecc71' },
            { points: 17, radius: 0.56, speed: -0.8, type: 'atmospheric', color: '#3498db' },
            { points: 19, radius: 0.43, speed: 1.3, type: 'bass', color: '#9b59b6' },
            { points: 23, radius: 0.30, speed: -1.0, type: 'sparkle', color: '#1abc9c' },
        ],
        'Minimalist': [
            { points: 4, radius: 0.90, speed: 0.4, type: 'bass', color: '#ecf0f1' },
            { points: 8, radius: 0.60, speed: -0.6, type: 'melodic', color: '#bdc3c7' },
            { points: 4, radius: 0.30, speed: 0.8, type: 'sparkle', color: '#95a5a6' },
        ],
        'Dense Forest': [
            { points: 48, radius: 0.98, speed: 0.3, type: 'atmospheric', color: '#27ae60' },
            { points: 36, radius: 0.88, speed: -0.4, type: 'melodic', color: '#2ecc71' },
            { points: 28, radius: 0.78, speed: 0.5, type: 'sparkle', color: '#58d68d' },
            { points: 24, radius: 0.68, speed: -0.35, type: 'melodic', color: '#82e0aa' },
            { points: 20, radius: 0.58, speed: 0.45, type: 'atmospheric', color: '#abebc6' },
            { points: 16, radius: 0.48, speed: -0.55, type: 'bass', color: '#196f3d' },
            { points: 12, radius: 0.38, speed: 0.65, type: 'sparkle', color: '#d5f5e3' },
            { points: 8, radius: 0.28, speed: -0.75, type: 'melodic', color: '#a9dfbf' },
        ],
    };

    constructor(canvas, audioEngine, preset = 'Racing Thoughts') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.audioEngine = audioEngine;

        // Mandala configuration
        this.centerX = 0;
        this.centerY = 0;
        this.maxRadius = 300;
        this.rotation = 0;
        this.rotationSpeed = 0.002; // Base rotation speed
        this.speedMultiplier = 1;
        this.currentPreset = preset;

        // Ring configuration - each ring has different properties
        this.rings = [];
        this.loadPreset(preset);

        // Trigger line configuration
        this.triggerAngle = -Math.PI / 2; // Vertical line at top
        this.triggerWidth = 0.05; // Width of trigger zone in radians

        // Visual settings
        this.glowAmount = 0.39;
        this.glowThreshold = 0.5;
        this.baseHue = 180; // Starting hue for colors

        // Configurable from side panel
        this.nodeSizeMultiplier = 1.0;
        this.flashIntensity = 1.0;
        this.connectionOpacity = 0.5;

        // Track triggered notes to prevent retriggering
        this.triggeredNotes = new Set();
        this.lastTriggerTime = {};

        // Connection lines between nodes
        this.showConnections = true;

        // Reactive state (set by app.js when isochronic tones play)
        this.reactiveState = {
            pulsePhase: 0,
            pulseIntensity: 0,
            breathScale: 1,
            glowPulse: 0,
            enabled: true
        };

        // Callback for particle emission
        this.onTrigger = null;

        // Custom nodes support (for alternative shapes)
        this.customNodes = null;
        this.useCustomNodes = false;
    }

    loadPreset(presetName) {
        const preset = Mandala.PRESETS[presetName] || Mandala.PRESETS['Racing Thoughts'];
        this.currentPreset = presetName;
        this.createRingsFromConfig(preset);
    }

    createRingsFromConfig(ringConfigs) {
        this.rings = ringConfigs.map((config, index) => ({
            ...config,
            radiusRatio: config.radius,
            index,
            currentRotation: Math.random() * Math.PI * 2,
            nodes: this.createNodes(config.points, config.radius, config.color),
            triggered: new Array(config.points).fill(false),
            triggerTime: new Array(config.points).fill(0)
        }));
        // Reset trigger times
        this.lastTriggerTime = {};
    }

    getPresetNames() {
        return Object.keys(Mandala.PRESETS);
    }

    createNodes(count, radiusRatio, color) {
        const nodes = [];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            nodes.push({
                angle,
                baseAngle: angle,
                radiusRatio,
                color,
                brightness: 0.5,
                size: 6 + Math.random() * 4,
                triggered: false,
                triggerFade: 0
            });
        }
        return nodes;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.centerX = width / 2;
        this.centerY = height / 2;
        this.maxRadius = Math.min(width, height) * 0.4;
    }

    update(deltaTime) {
        const currentTime = performance.now();

        // Update each ring's rotation
        this.rings.forEach((ring, ringIndex) => {
            // Each ring rotates at its own speed
            const direction = ringIndex % 2 === 0 ? 1 : -1; // Alternate directions
            ring.currentRotation += this.rotationSpeed * ring.speed * this.speedMultiplier * direction;

            // Check triggers for each node
            ring.nodes.forEach((node, nodeIndex) => {
                const nodeAngle = this.normalizeAngle(ring.currentRotation + node.baseAngle);

                // Check if node is in trigger zone
                const angleDiff = Math.abs(this.normalizeAngle(nodeAngle - this.triggerAngle));
                const isInTriggerZone = angleDiff < this.triggerWidth || angleDiff > (Math.PI * 2 - this.triggerWidth);

                // Trigger logic with cooldown
                const noteKey = `${ringIndex}-${nodeIndex}`;
                const lastTrigger = this.lastTriggerTime[noteKey] || 0;
                const cooldown = 500; // ms between triggers

                if (isInTriggerZone && currentTime - lastTrigger > cooldown) {
                    if (!ring.triggered[nodeIndex]) {
                        ring.triggered[nodeIndex] = true;
                        ring.triggerTime[nodeIndex] = currentTime;
                        node.triggered = true;
                        node.triggerFade = 1;
                        this.lastTriggerTime[noteKey] = currentTime;

                        // Calculate position for spatial audio and particles
                        const radius = ring.radiusRatio * this.maxRadius;
                        const screenX = this.centerX + Math.cos(nodeAngle) * radius;
                        const screenY = this.centerY + Math.sin(nodeAngle) * radius;
                        const x = Math.cos(nodeAngle) * ring.radiusRatio;
                        const y = Math.sin(nodeAngle) * ring.radiusRatio;
                        const z = (ringIndex - this.rings.length / 2) / this.rings.length;

                        // Play sound (only if audio engine is ready)
                        if (this.audioEngine && this.audioEngine.isInitialized) {
                            this.audioEngine.playTrigger(ring.type, ringIndex, nodeIndex, { x, y, z });
                        }

                        // Emit particles
                        if (this.onTrigger) {
                            this.onTrigger(screenX, screenY, node.color, ring.type);
                        }
                    }
                } else {
                    ring.triggered[nodeIndex] = false;
                }

                // Fade out trigger effect
                if (node.triggerFade > 0) {
                    node.triggerFade -= deltaTime * 0.002;
                    if (node.triggerFade < 0) node.triggerFade = 0;
                }
            });
        });
    }

    normalizeAngle(angle) {
        while (angle < 0) angle += Math.PI * 2;
        while (angle >= Math.PI * 2) angle -= Math.PI * 2;
        return angle;
    }

    draw() {
        // Safety check - don't draw if canvas not properly sized
        if (!this.canvas.width || !this.canvas.height || !this.maxRadius) return;

        // Don't clear here - app.js handles canvas clearing
        // Just draw mandala elements on top

        // Draw outer boundary circle
        this.drawBoundaryCircle();

        // Draw connection lines between nodes
        if (this.showConnections) {
            this.drawConnections();
        }

        // Draw rings and nodes (or custom nodes if active)
        if (this.useCustomNodes && this.customNodes) {
            this.drawCustomNodes();
        } else {
            this.rings.forEach((ring, ringIndex) => {
                this.drawRing(ring, ringIndex);
            });
        }

        // Draw trigger line
        this.drawTriggerLine();

        // Draw center glow
        this.drawCenterGlow();
    }

    drawBoundaryCircle() {
        if (!isFinite(this.centerX) || !isFinite(this.centerY) || !isFinite(this.maxRadius)) return;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.maxRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawConnections() {
        if (!isFinite(this.maxRadius) || !isFinite(this.centerX) || !isFinite(this.centerY)) return;
        this.ctx.lineWidth = 0.5;

        this.rings.forEach((ring) => {
            const radius = ring.radiusRatio * this.maxRadius;

            // Draw lines between adjacent nodes on the same ring
            ring.nodes.forEach((node, i) => {
                const nextNode = ring.nodes[(i + 1) % ring.nodes.length];
                const angle1 = ring.currentRotation + node.baseAngle;
                const angle2 = ring.currentRotation + nextNode.baseAngle;

                const x1 = this.centerX + Math.cos(angle1) * radius;
                const y1 = this.centerY + Math.sin(angle1) * radius;
                const x2 = this.centerX + Math.cos(angle2) * radius;
                const y2 = this.centerY + Math.sin(angle2) * radius;

                const alpha = 0.1 + (node.triggerFade + nextNode.triggerFade) * 0.2;

                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.strokeStyle = `rgba(150, 150, 200, ${alpha})`;
                this.ctx.stroke();
            });
        });

        // Draw cross-ring connections (creates the web pattern)
        for (let r = 0; r < this.rings.length - 1; r++) {
            const ring1 = this.rings[r];
            const ring2 = this.rings[r + 1];
            const radius1 = ring1.radiusRatio * this.maxRadius;
            const radius2 = ring2.radiusRatio * this.maxRadius;

            // Connect some nodes between rings
            ring1.nodes.forEach((node, i) => {
                if (i % 2 === 0) {
                    const angle1 = ring1.currentRotation + node.baseAngle;
                    const nearestIndex = Math.floor((node.baseAngle / (Math.PI * 2)) * ring2.nodes.length);
                    const nearestNode = ring2.nodes[nearestIndex % ring2.nodes.length];
                    const angle2 = ring2.currentRotation + nearestNode.baseAngle;

                    const x1 = this.centerX + Math.cos(angle1) * radius1;
                    const y1 = this.centerY + Math.sin(angle1) * radius1;
                    const x2 = this.centerX + Math.cos(angle2) * radius2;
                    const y2 = this.centerY + Math.sin(angle2) * radius2;

                    const alpha = 0.05 + (node.triggerFade + nearestNode.triggerFade) * 0.15;

                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.strokeStyle = `rgba(100, 120, 180, ${alpha})`;
                    this.ctx.stroke();
                }
            });
        }
    }

    drawRing(ring, ringIndex) {
        // Safety check for valid dimensions
        if (!this.maxRadius || !this.centerX || !this.centerY) return;
        if (!isFinite(this.maxRadius) || !isFinite(this.centerX) || !isFinite(this.centerY)) return;

        // Apply breathing scale from reactive state
        const breathScale = this.reactiveState?.breathScale || 1;
        const glowPulse = this.reactiveState?.glowPulse || 0;

        const radius = ring.radiusRatio * this.maxRadius * breathScale;
        if (!isFinite(radius) || radius <= 0) return;

        // Draw ring circle with reactive glow
        const ringGlow = 0.2 + glowPulse * 0.3;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, radius, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(80, 80, 120, ${ringGlow})`;
        this.ctx.lineWidth = 1 + glowPulse * 2;
        this.ctx.stroke();

        // Draw nodes
        ring.nodes.forEach((node, nodeIndex) => {
            const angle = ring.currentRotation + node.baseAngle;
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;

            // Safety check
            if (!isFinite(x) || !isFinite(y)) return;

            // Node size grows when triggered + reactive pulse
            const reactiveSize = 1 + glowPulse * 0.3;
            const size = Math.max(1, (node.size + (node.triggerFade || 0) * 15) * reactiveSize);

            // Draw glow if triggered OR if reactive pulse is active
            const effectiveGlow = Math.max(node.triggerFade || 0, glowPulse * 0.5);
            if (effectiveGlow > 0.1 && this.glowAmount > 0) {
                const glowSize = Math.max(1, size * (2 + this.glowAmount * 3));
                if (isFinite(glowSize) && glowSize > 0) {
                    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
                    gradient.addColorStop(0, this.hexToRgba(node.color, effectiveGlow * this.glowAmount));
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            }

            // Draw node circle
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);

            // Color based on trigger state + reactive brightness
            const baseAlpha = 0.6 + (node.triggerFade || 0) * 0.4 + glowPulse * 0.2;
            this.ctx.fillStyle = this.hexToRgba(node.color, Math.min(1, baseAlpha));
            this.ctx.fill();

            // Draw node border
            this.ctx.strokeStyle = this.hexToRgba(node.color, 0.8 + glowPulse * 0.2);
            this.ctx.lineWidth = 1.5 + glowPulse;
            this.ctx.stroke();
        });
    }

    drawTriggerLine() {
        if (!isFinite(this.maxRadius) || !isFinite(this.centerX) || !isFinite(this.centerY)) return;
        const lineLength = this.maxRadius * 1.1;
        const x1 = this.centerX;
        const y1 = this.centerY - lineLength;
        const x2 = this.centerX;
        const y2 = this.centerY;

        // Draw trigger line with gradient
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw trigger zone indicator at top
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY - lineLength, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fill();
    }

    drawCenterGlow() {
        if (!isFinite(this.maxRadius) || !isFinite(this.centerX) || !isFinite(this.centerY)) return;

        const glowPulse = this.reactiveState?.glowPulse || 0;
        const breathScale = this.reactiveState?.breathScale || 1;

        // Center glow expands and brightens with isochronic pulse
        const glowRadius = this.maxRadius * (0.15 + glowPulse * 0.1) * breathScale;
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, glowRadius
        );

        // Brighter center when pulsing
        const centerAlpha = 0.3 + glowPulse * 0.4;
        const midAlpha = 0.1 + glowPulse * 0.2;

        gradient.addColorStop(0, `rgba(100, 100, 200, ${centerAlpha})`);
        gradient.addColorStop(0.5, `rgba(80, 80, 150, ${midAlpha})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, glowRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    drawCustomNodes() {
        const breathScale = this.reactiveState?.breathScale || 1;
        const glowPulse = this.reactiveState?.glowPulse || 0;
        const currentTime = performance.now();

        this.customNodes.forEach((node, index) => {
            // Convert normalized coordinates (-1 to 1) to screen coordinates
            const x = this.centerX + node.x * this.maxRadius * breathScale;
            const y = this.centerY + node.y * this.maxRadius * breathScale;

            if (!isFinite(x) || !isFinite(y)) return;

            // Initialize trigger state if needed
            if (node.triggerFade === undefined) {
                node.triggerFade = 0;
                node.lastTriggerTime = 0;
            }

            // Check trigger zone (top of mandala)
            const angle = Math.atan2(node.y, node.x);
            const angleDiff = Math.abs(this.normalizeAngle(angle - this.triggerAngle));
            const isInTriggerZone = angleDiff < this.triggerWidth * 2 || angleDiff > (Math.PI * 2 - this.triggerWidth * 2);

            const cooldown = 800;
            if (isInTriggerZone && currentTime - node.lastTriggerTime > cooldown) {
                if (!node.triggered) {
                    node.triggered = true;
                    node.triggerFade = 1;
                    node.lastTriggerTime = currentTime;

                    // Play sound
                    if (this.audioEngine && this.audioEngine.isInitialized) {
                        this.audioEngine.playTrigger(node.type, node.ring, index % 8, { x: node.x, y: node.y, z: 0 });
                    }

                    // Emit particles
                    if (this.onTrigger) {
                        this.onTrigger(x, y, node.color, node.type);
                    }
                }
            } else {
                node.triggered = false;
            }

            // Fade trigger effect
            if (node.triggerFade > 0) {
                node.triggerFade -= 0.016 * 2; // Roughly 60fps
                if (node.triggerFade < 0) node.triggerFade = 0;
            }

            // Node size
            const baseSize = 6 + (node.ring || 0) * 0.5;
            const reactiveSize = 1 + glowPulse * 0.3;
            const size = Math.max(1, (baseSize + node.triggerFade * 15) * reactiveSize);

            // Draw glow
            const effectiveGlow = Math.max(node.triggerFade, glowPulse * 0.5);
            if (effectiveGlow > 0.1 && this.glowAmount > 0) {
                const glowSize = Math.max(1, size * (2 + this.glowAmount * 3));
                if (isFinite(glowSize) && glowSize > 0) {
                    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
                    gradient.addColorStop(0, this.hexToRgba(node.color, effectiveGlow * this.glowAmount));
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

                    this.ctx.beginPath();
                    this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            }

            // Draw node
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            const baseAlpha = 0.6 + node.triggerFade * 0.4 + glowPulse * 0.2;
            this.ctx.fillStyle = this.hexToRgba(node.color, Math.min(1, baseAlpha));
            this.ctx.fill();
            this.ctx.strokeStyle = this.hexToRgba(node.color, 0.8 + glowPulse * 0.2);
            this.ctx.lineWidth = 1.5 + glowPulse;
            this.ctx.stroke();
        });
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Settings
    setSpeed(value) {
        this.speedMultiplier = value;
    }

    setGlowAmount(value) {
        this.glowAmount = value;
    }

    setGlowThreshold(value) {
        this.glowThreshold = value;
    }
}

// Export for use in other modules
window.Mandala = Mandala;
