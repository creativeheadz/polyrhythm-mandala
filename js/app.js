/**
 * Main Application - Polyrhythm Visual Music Machine
 * Orchestrates the mandala, audio engine, background, and controls
 */

class PolyrhythmApp {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Create separate canvas for background
        this.bgCanvas = document.createElement('canvas');
        this.bgCtx = this.bgCanvas.getContext('2d');

        // Initialize components
        this.audioEngine = new AudioEngine();
        this.mandala = null;
        this.background = null;
        this.controls = null;
        this.ringEditor = null;
        this.isochronicTones = null;
        this.isochronicPanel = null;

        // Visual settings (configurable via side panel)
        this.visualSettings = {
            // Kinetic trails
            trailOpacity: 0.2,
            trailLength: 4,
            particleSize: 0.3,
            kineticGlow: 0.25,
            // Background circles
            bgOpacity: 0.5,
            bgLineWidth: 3,
            bgPulse: 0.5,
            // Mandala
            nodeSize: 1.0,
            flashIntensity: 1.0,
            connectionOpacity: 0.5
        };

        // Animation state
        this.isRunning = false;
        this.lastTime = 0;
        this.animationId = null;

        // Bind methods
        this.animate = this.animate.bind(this);
        this.onResize = this.onResize.bind(this);
        this.onStart = this.onStart.bind(this);
    }

    async init() {
        console.log('Initializing Polyrhythm App...');

        // Set up resize handler
        window.addEventListener('resize', this.onResize);
        this.onResize();

        // Initialize mandala and background (don't need audio yet)
        this.mandala = new Mandala(this.canvas, this.audioEngine);
        this.background = new Background(this.bgCanvas);

        // Resize components
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.mandala.resize(width, height);
        this.background.resize(width, height);

        // Set up start overlay click handler
        const overlay = document.getElementById('start-overlay');
        overlay.addEventListener('click', this.onStart);

        // Initialize side panel controls
        this.initSidePanel();

        console.log('App initialized - click to start audio');
    }

    initSidePanel() {
        // Toggle panel
        const toggle = document.getElementById('panel-toggle');
        const panel = document.getElementById('side-panel');

        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                panel.classList.toggle('collapsed');
            });
        }

        // Slider controls
        this.bindSlider('trail-opacity', (v) => { this.visualSettings.trailOpacity = v / 100; });
        this.bindSlider('trail-length', (v) => { this.visualSettings.trailLength = v; });
        this.bindSlider('particle-size', (v) => { this.visualSettings.particleSize = v / 100; });
        this.bindSlider('kinetic-glow', (v) => { this.visualSettings.kineticGlow = v / 100; });
        this.bindSlider('bg-opacity', (v) => {
            this.visualSettings.bgOpacity = v / 100;
            if (this.background) this.background.opacityMultiplier = v / 100;
        });
        this.bindSlider('bg-line-width', (v) => {
            this.visualSettings.bgLineWidth = v;
            if (this.background) this.background.lineWidthMultiplier = v / 3;
        });
        this.bindSlider('bg-pulse', (v) => {
            this.visualSettings.bgPulse = v / 100;
            if (this.background) this.background.pulseMultiplier = v / 100;
        });
        this.bindSlider('node-size', (v) => {
            this.visualSettings.nodeSize = v / 100;
            if (this.mandala) this.mandala.nodeSizeMultiplier = v / 100;
        });
        this.bindSlider('flash-intensity', (v) => {
            this.visualSettings.flashIntensity = v / 100;
            if (this.mandala) this.mandala.flashIntensity = v / 100;
        });
        this.bindSlider('connection-opacity', (v) => {
            this.visualSettings.connectionOpacity = v / 100;
            if (this.mandala) this.mandala.connectionOpacity = v / 100;
        });
    }

    bindSlider(id, callback) {
        const slider = document.getElementById(id);
        if (!slider) return;

        const valueDisplay = slider.parentElement.querySelector('.slider-value');

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            callback(value);

            // Update display
            if (valueDisplay) {
                if (id.includes('length')) {
                    valueDisplay.textContent = value;
                } else if (id === 'bg-line-width') {
                    valueDisplay.textContent = value;
                } else {
                    valueDisplay.textContent = value + '%';
                }
            }
        });
    }

    async onStart() {
        const overlay = document.getElementById('start-overlay');

        // Initialize audio (requires user interaction)
        try {
            await this.audioEngine.init();
            console.log('Audio engine started');

            // Initialize per-ring synths based on current mandala
            if (this.mandala && this.mandala.rings) {
                this.audioEngine.initializeForMandala(this.mandala.rings);
            }

            // Initialize controls (needs audio engine)
            this.controls = new Controls(this.audioEngine, this.mandala);

            // Initialize ring editor
            this.ringEditor = new RingEditor(this.audioEngine, this.mandala);

            // Initialize isochronic tones
            this.isochronicTones = new IsochronicTones();
            await this.isochronicTones.init(this.audioEngine.masterGain);
            this.isochronicPanel = new IsochronicPanel(this.isochronicTones);

            // Hide overlay
            overlay.classList.add('hidden');

            // Small delay to ensure audio context is fully ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Start animation loop
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.animate);

        } catch (error) {
            console.error('Failed to start audio:', error);
            // Still start the visuals even if audio fails
            overlay.classList.add('hidden');
            this.isRunning = true;
            this.lastTime = performance.now();
            requestAnimationFrame(this.animate);
        }
    }

    onResize() {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Resize main canvas
        this.canvas.width = width;
        this.canvas.height = height;

        // Resize background canvas
        this.bgCanvas.width = width;
        this.bgCanvas.height = height;

        // Resize components if initialized
        if (this.mandala) {
            this.mandala.resize(width, height);
        }
        if (this.background) {
            this.background.resize(width, height);
        }
    }

    animate(currentTime) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update components
        this.update(deltaTime);

        // Render
        this.render();

        // Update kinetic sound positions
        this.audioEngine.updateKineticSounds();

        // Continue loop
        this.animationId = requestAnimationFrame(this.animate);
    }

    update(deltaTime) {
        // Update mandala rotation and triggers
        if (this.mandala) {
            this.mandala.update(deltaTime);
        }

        // Update background ethereal circles
        if (this.background) {
            // Check if any triggers happened recently
            const triggered = this.audioEngine.kineticSounds.some(
                s => performance.now() - s.startTime < 100
            );
            this.background.update(deltaTime, triggered);
        }
    }

    render() {
        // Clear main canvas completely
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background ethereal circles (on separate canvas, then composite)
        if (this.background) {
            this.background.draw();
            this.ctx.drawImage(this.bgCanvas, 0, 0);
        }

        // Draw kinetic sound visualizations (moving sound particles)
        this.drawKineticVisuals();

        // Draw mandala
        if (this.mandala) {
            this.mandala.draw();
        }
    }

    drawKineticVisuals() {
        if (!this.mandala || !this.mandala.maxRadius) return;

        const settings = this.visualSettings;

        // Skip if all visuals are turned off
        if (settings.trailOpacity <= 0 && settings.particleSize <= 0 && settings.kineticGlow <= 0) {
            return;
        }

        // Get current positions of all moving sounds
        const positions = this.audioEngine.getKineticPositions();

        positions.forEach(pos => {
            // Safety check
            if (!isFinite(pos.x) || !isFinite(pos.y)) return;

            // Convert from audio space (-1 to 1) to screen space
            const scale = this.mandala.maxRadius * 1.5;
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const screenX = centerX + pos.x * scale;
            const screenY = centerY + pos.y * scale;

            // Size based on intensity and settings
            const baseSize = 4 + pos.intensity * 12;
            const size = baseSize * settings.particleSize;

            if (size <= 0) return;

            // Color configuration based on sound type
            let colorConfig;
            switch (pos.type) {
                case 'melodic':
                    colorConfig = { r: 74, g: 158, b: 255 };
                    break;
                case 'bass':
                    colorConfig = { r: 255, g: 85, b: 85 };
                    break;
                case 'atmospheric':
                    colorConfig = { r: 80, g: 250, b: 123 };
                    break;
                case 'sparkle':
                    colorConfig = { r: 139, g: 233, b: 253 };
                    break;
                default:
                    colorConfig = { r: 255, g: 255, b: 255 };
            }

            const { r, g, b } = colorConfig;
            const trailAlpha = settings.trailOpacity;

            // Draw trail (past positions showing movement path)
            if (pos.trail && pos.trail.length > 1 && trailAlpha > 0 && settings.trailLength > 0) {
                const visibleTrail = pos.trail.slice(0, settings.trailLength);

                if (visibleTrail.length > 0) {
                    this.ctx.beginPath();
                    const firstTrail = visibleTrail[0];
                    if (firstTrail && isFinite(firstTrail.x) && isFinite(firstTrail.y)) {
                        this.ctx.moveTo(
                            centerX + firstTrail.x * scale,
                            centerY + firstTrail.y * scale
                        );

                        visibleTrail.forEach((trailPoint) => {
                            if (trailPoint && isFinite(trailPoint.x) && isFinite(trailPoint.y)) {
                                const tx = centerX + trailPoint.x * scale;
                                const ty = centerY + trailPoint.y * scale;
                                this.ctx.lineTo(tx, ty);
                            }
                        });

                        this.ctx.lineTo(screenX, screenY);
                        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pos.intensity * trailAlpha})`;
                        this.ctx.lineWidth = 1 + pos.intensity * 2 * settings.particleSize;
                        this.ctx.lineCap = 'round';
                        this.ctx.stroke();
                    }
                }
            }

            // Draw outer glow (if enabled)
            if (settings.kineticGlow > 0) {
                const glowSize = size * 3 * settings.kineticGlow;
                if (isFinite(glowSize) && glowSize > 0) {
                    const gradient = this.ctx.createRadialGradient(
                        screenX, screenY, 0,
                        screenX, screenY, glowSize
                    );
                    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${pos.intensity * settings.kineticGlow * 0.5})`);
                    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

                    this.ctx.beginPath();
                    this.ctx.arc(screenX, screenY, glowSize, 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            }

            // Draw particle (simple ring style)
            if (settings.particleSize > 0) {
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pos.intensity * 0.6})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.stroke();

                // Small bright center
                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, size * 0.3, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${pos.intensity * 0.5})`;
                this.ctx.fill();
            }
        });
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.audioEngine) {
            this.audioEngine.stop();
        }
    }

    dispose() {
        this.stop();
        if (this.audioEngine) {
            this.audioEngine.dispose();
        }
        if (this.isochronicTones) {
            this.isochronicTones.dispose();
        }
        window.removeEventListener('resize', this.onResize);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new PolyrhythmApp();
    app.init();

    // Expose app globally for debugging
    window.polyrhythmApp = app;
});
