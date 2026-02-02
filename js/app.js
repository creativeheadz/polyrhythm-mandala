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
        this.binauralBeats = null;
        this.isochronicPanel = null;
        this.colorThemes = null;
        this.colorThemesPanel = null;
        this.particleSystem = null;
        this.mandala3D = null;
        this.is3DMode = false;
        this.ambientSoundscapes = null;
        this.ambientPanel = null;
        this.wellnessPanel = null;
        this.touchTriggers = null;

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

        // Reactive visualizer state (syncs with isochronic tones)
        this.reactiveState = {
            pulsePhase: 0,
            pulseIntensity: 0,
            breathScale: 1,
            glowPulse: 0,
            enabled: true
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

            // Initialize isochronic tones and binaural beats
            this.isochronicTones = new IsochronicTones();
            await this.isochronicTones.init(this.audioEngine.masterGain);

            this.binauralBeats = new BinauralBeats();
            await this.binauralBeats.init(this.audioEngine.masterGain);

            this.isochronicPanel = new IsochronicPanel(this.isochronicTones, this.binauralBeats);

            // Initialize color themes
            this.colorThemes = new ColorThemes();
            this.colorThemesPanel = new ColorThemesPanel(this.colorThemes, this.mandala, this.background);

            // Initialize ambient soundscapes
            this.ambientSoundscapes = new AmbientSoundscapes();
            await this.ambientSoundscapes.init(this.audioEngine.masterGain);
            this.ambientPanel = new AmbientPanel(this.ambientSoundscapes);

            // Initialize particle system
            this.particleSystem = new ParticleSystem(this.canvas);
            // Connect mandala triggers to particle emissions
            this.mandala.onTrigger = (x, y, color, type) => {
                this.particleSystem.emit(x, y, color, type, this.mandala.centerX, this.mandala.centerY);
            };

            // Initialize 3D mandala
            this.mandala3D = new Mandala3D(document.getElementById('canvas-container'));
            this.mandala3D.init(this.mandala);

            // Initialize wellness tools (timer, breathing, focus mode)
            this.wellnessPanel = new WellnessPanel(this.audioEngine);

            // Initialize touch triggers for clicking on nodes
            this.touchTriggers = new TouchTriggers(this.mandala, this.audioEngine);
            this.create3DToggle();

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
        if (this.mandala3D) {
            this.mandala3D.resize(width, height);
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
        // Update reactive visualizer state (sync with isochronic tones)
        this.updateReactiveState(deltaTime);

        // Update mandala rotation and triggers
        if (this.mandala) {
            this.mandala.update(deltaTime);
            // Pass reactive state to mandala for breathing effect
            this.mandala.reactiveState = this.reactiveState;
        }

        // Update background ethereal circles
        if (this.background) {
            // Check if any triggers happened recently
            const triggered = this.audioEngine.kineticSounds.some(
                s => performance.now() - s.startTime < 100
            );
            this.background.update(deltaTime, triggered);
            // Pass reactive state for background pulsing
            this.background.reactiveState = this.reactiveState;
        }

        // Update particle system
        if (this.particleSystem) {
            this.particleSystem.update(deltaTime);
        }

        // Update 3D mandala
        if (this.mandala3D) {
            this.mandala3D.reactiveState = this.reactiveState;
            this.mandala3D.update(deltaTime);
        }
    }

    create3DToggle() {
        const btn = document.createElement('button');
        btn.id = 'toggle-3d';
        btn.textContent = '3D';
        btn.title = 'Toggle 3D Mode';
        btn.addEventListener('click', () => this.toggle3DMode());
        document.getElementById('app').appendChild(btn);
    }

    toggle3DMode() {
        this.is3DMode = this.mandala3D.toggle();
        const btn = document.getElementById('toggle-3d');
        btn.classList.toggle('active', this.is3DMode);

        // Show/hide 2D canvas
        this.canvas.style.display = this.is3DMode ? 'none' : 'block';
    }

    updateReactiveState(deltaTime) {
        if (!this.reactiveState.enabled) {
            this.reactiveState.breathScale = 1;
            this.reactiveState.glowPulse = 0;
            return;
        }

        // Sync with isochronic tones if playing
        if (this.isochronicTones && this.isochronicTones.isPlaying) {
            const pulseRate = this.isochronicTones.pulseRate;
            const time = performance.now() / 1000;

            // Calculate pulse phase (0 to 1, repeating at pulse rate)
            this.reactiveState.pulsePhase = (time * pulseRate) % 1;

            // Square wave for isochronic (sharp on/off) or sine for smooth
            const pulseShape = this.isochronicTones.tremolo?.type || 'square';
            if (pulseShape === 'square') {
                // Sharp on/off pulse
                this.reactiveState.pulseIntensity = this.reactiveState.pulsePhase < 0.5 ? 1 : 0;
            } else {
                // Smooth sine pulse
                this.reactiveState.pulseIntensity = (Math.sin(this.reactiveState.pulsePhase * Math.PI * 2) + 1) / 2;
            }

            // Breathing scale effect (subtle expansion/contraction)
            const breathAmount = 0.03; // 3% scale change
            this.reactiveState.breathScale = 1 + (this.reactiveState.pulseIntensity * breathAmount);

            // Glow pulse synchronized with the tone
            this.reactiveState.glowPulse = this.reactiveState.pulseIntensity * 0.5;
        } else {
            // Gradual return to neutral when not playing
            this.reactiveState.pulseIntensity *= 0.95;
            this.reactiveState.breathScale = 1 + (this.reactiveState.breathScale - 1) * 0.95;
            this.reactiveState.glowPulse *= 0.95;
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

        // Draw particles (on top of everything) - only in 2D mode
        if (this.particleSystem && !this.is3DMode) {
            this.particleSystem.draw();
        }

        // Render 3D scene if active
        if (this.mandala3D && this.is3DMode) {
            this.mandala3D.render();
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
        if (this.binauralBeats) {
            this.binauralBeats.dispose();
        }
        if (this.ambientSoundscapes) {
            this.ambientSoundscapes.dispose();
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
