/**
 * Utilities Module
 * Contains: Tap Tempo, Touch Triggers, Session Timer, Breathing Guide, Focus Mode
 */

// ===== TAP TEMPO =====
class TapTempo {
    constructor(callback) {
        this.taps = [];
        this.maxTaps = 8;
        this.timeoutMs = 2000; // Reset if no tap for 2 seconds
        this.callback = callback;
        this.timeout = null;
    }

    tap() {
        const now = performance.now();

        // Clear old taps
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => this.reset(), this.timeoutMs);

        // Add tap
        this.taps.push(now);

        // Keep only recent taps
        if (this.taps.length > this.maxTaps) {
            this.taps.shift();
        }

        // Calculate tempo if we have enough taps
        if (this.taps.length >= 2) {
            const intervals = [];
            for (let i = 1; i < this.taps.length; i++) {
                intervals.push(this.taps[i] - this.taps[i - 1]);
            }
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const bpm = 60000 / avgInterval;

            if (this.callback && bpm >= 20 && bpm <= 300) {
                this.callback(Math.round(bpm));
            }
        }

        return this.taps.length;
    }

    reset() {
        this.taps = [];
    }

    getTapCount() {
        return this.taps.length;
    }
}

// ===== SESSION TIMER =====
class SessionTimer {
    constructor() {
        this.duration = 0; // in seconds
        this.elapsed = 0;
        this.isRunning = false;
        this.interval = null;
        this.onTick = null;
        this.onComplete = null;
        this.onFadeStart = null;
        this.fadeOutDuration = 10; // seconds
    }

    start(durationMinutes) {
        this.duration = durationMinutes * 60;
        this.elapsed = 0;
        this.isRunning = true;

        this.interval = setInterval(() => {
            this.elapsed++;

            if (this.onTick) {
                this.onTick(this.getTimeRemaining(), this.getProgress());
            }

            // Trigger fade out near end
            if (this.duration - this.elapsed === this.fadeOutDuration) {
                if (this.onFadeStart) {
                    this.onFadeStart(this.fadeOutDuration);
                }
            }

            if (this.elapsed >= this.duration) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
    }

    stop() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    pause() {
        this.isRunning = false;
        clearInterval(this.interval);
    }

    resume() {
        if (this.elapsed < this.duration) {
            this.isRunning = true;
            this.interval = setInterval(() => {
                this.elapsed++;
                if (this.onTick) {
                    this.onTick(this.getTimeRemaining(), this.getProgress());
                }
                if (this.elapsed >= this.duration) {
                    this.stop();
                    if (this.onComplete) this.onComplete();
                }
            }, 1000);
        }
    }

    getTimeRemaining() {
        const remaining = Math.max(0, this.duration - this.elapsed);
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        return { mins, secs, total: remaining };
    }

    getProgress() {
        return this.duration > 0 ? this.elapsed / this.duration : 0;
    }

    formatTime(time) {
        return `${time.mins}:${time.secs.toString().padStart(2, '0')}`;
    }
}

// ===== BREATHING GUIDE =====
class BreathingGuide {
    static PATTERNS = {
        'Relaxing 4-7-8': { inhale: 4, hold: 7, exhale: 8, holdOut: 0 },
        'Box Breathing': { inhale: 4, hold: 4, exhale: 4, holdOut: 4 },
        'Energizing': { inhale: 4, hold: 0, exhale: 4, holdOut: 0 },
        'Calming': { inhale: 5, hold: 2, exhale: 7, holdOut: 0 },
        'Deep Breath': { inhale: 6, hold: 3, exhale: 6, holdOut: 3 }
    };

    constructor() {
        this.pattern = BreathingGuide.PATTERNS['Box Breathing'];
        this.isRunning = false;
        this.phase = 'inhale'; // inhale, hold, exhale, holdOut
        this.phaseTime = 0;
        this.cycleCount = 0;
        this.onPhaseChange = null;
        this.onProgress = null;
    }

    setPattern(name) {
        if (BreathingGuide.PATTERNS[name]) {
            this.pattern = BreathingGuide.PATTERNS[name];
        }
    }

    start() {
        this.isRunning = true;
        this.phase = 'inhale';
        this.phaseTime = 0;
        this.cycleCount = 0;
        this.lastUpdate = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    animate() {
        if (!this.isRunning) return;

        const now = performance.now();
        const delta = (now - this.lastUpdate) / 1000;
        this.lastUpdate = now;

        this.phaseTime += delta;

        // Get current phase duration
        const phaseDurations = {
            inhale: this.pattern.inhale,
            hold: this.pattern.hold,
            exhale: this.pattern.exhale,
            holdOut: this.pattern.holdOut
        };

        const currentPhaseDuration = phaseDurations[this.phase];

        // Progress within current phase
        const progress = currentPhaseDuration > 0 ? Math.min(1, this.phaseTime / currentPhaseDuration) : 1;

        if (this.onProgress) {
            this.onProgress(this.phase, progress, this.getBreathScale());
        }

        // Check for phase transition
        if (this.phaseTime >= currentPhaseDuration) {
            this.phaseTime = 0;
            this.nextPhase();
        }

        requestAnimationFrame(() => this.animate());
    }

    nextPhase() {
        const phases = ['inhale', 'hold', 'exhale', 'holdOut'];
        let currentIndex = phases.indexOf(this.phase);

        // Find next phase with non-zero duration
        do {
            currentIndex = (currentIndex + 1) % phases.length;
            if (currentIndex === 0) this.cycleCount++;
        } while (this.pattern[phases[currentIndex]] === 0 && currentIndex !== phases.indexOf(this.phase));

        this.phase = phases[currentIndex];

        if (this.onPhaseChange) {
            this.onPhaseChange(this.phase, this.cycleCount);
        }
    }

    getBreathScale() {
        // Returns a value 0-1 representing breath expansion
        switch (this.phase) {
            case 'inhale':
                return this.phaseTime / this.pattern.inhale;
            case 'hold':
                return 1;
            case 'exhale':
                return 1 - (this.phaseTime / this.pattern.exhale);
            case 'holdOut':
                return 0;
            default:
                return 0.5;
        }
    }

    static getPatternNames() {
        return Object.keys(BreathingGuide.PATTERNS);
    }
}

// ===== FOCUS MODE =====
class FocusMode {
    constructor() {
        this.isActive = false;
        this.hiddenElements = [];
        this.onToggle = null;
    }

    toggle() {
        if (this.isActive) {
            this.exit();
        } else {
            this.enter();
        }
        return this.isActive;
    }

    enter() {
        this.isActive = true;

        // Hide UI elements
        const elementsToHide = [
            '#control-bar',
            '#side-panel',
            '#panel-toggle',
            '#ring-editor',
            '#ring-editor-toggle',
            '#iso-panel',
            '#iso-toggle',
            '#theme-panel',
            '#theme-toggle',
            '#ambient-panel',
            '#ambient-toggle',
            '#toggle-3d'
        ];

        elementsToHide.forEach(selector => {
            const el = document.querySelector(selector);
            if (el) {
                el.dataset.focusHidden = el.style.display || '';
                el.style.display = 'none';
                this.hiddenElements.push(el);
            }
        });

        // Make canvas fullscreen
        const container = document.getElementById('canvas-container');
        if (container) {
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100vw';
            container.style.height = '100vh';
        }

        // Add exit button
        this.createExitButton();

        // Request actual fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
        }

        document.body.classList.add('focus-mode');

        if (this.onToggle) this.onToggle(true);
    }

    exit() {
        this.isActive = false;

        // Restore hidden elements
        this.hiddenElements.forEach(el => {
            el.style.display = el.dataset.focusHidden || '';
            delete el.dataset.focusHidden;
        });
        this.hiddenElements = [];

        // Restore canvas container
        const container = document.getElementById('canvas-container');
        if (container) {
            container.style.position = '';
            container.style.top = '';
            container.style.left = '';
            container.style.width = '';
            container.style.height = '';
        }

        // Remove exit button
        const exitBtn = document.getElementById('focus-exit-btn');
        if (exitBtn) exitBtn.remove();

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }

        document.body.classList.remove('focus-mode');

        if (this.onToggle) this.onToggle(false);
    }

    createExitButton() {
        const btn = document.createElement('button');
        btn.id = 'focus-exit-btn';
        btn.textContent = 'Exit Focus';
        btn.addEventListener('click', () => this.exit());
        document.body.appendChild(btn);

        // Auto-hide after 3 seconds, show on mouse move
        let hideTimeout;
        const hide = () => { btn.style.opacity = '0'; };
        const show = () => {
            btn.style.opacity = '1';
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(hide, 3000);
        };

        document.addEventListener('mousemove', show);
        hideTimeout = setTimeout(hide, 3000);
    }
}

// ===== TOUCH TRIGGERS =====
class TouchTriggers {
    constructor(mandala, audioEngine) {
        this.mandala = mandala;
        this.audioEngine = audioEngine;
        this.enabled = true;
        this.canvas = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.canvas = document.getElementById('main-canvas');
        if (!this.canvas) return;

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: false });
    }

    handleClick(e) {
        if (!this.enabled || !this.mandala) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.triggerAtPosition(x, y);
    }

    handleTouch(e) {
        if (!this.enabled || !this.mandala) return;
        e.preventDefault();

        const rect = this.canvas.getBoundingClientRect();
        for (let touch of e.touches) {
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.triggerAtPosition(x, y);
        }
    }

    triggerAtPosition(x, y) {
        // Find nearest node
        const nearest = this.findNearestNode(x, y);
        if (!nearest) return;

        const { ring, node, ringIndex, nodeIndex, distance } = nearest;

        // Only trigger if close enough
        const threshold = 30;
        if (distance > threshold) return;

        // Trigger visual effect
        node.triggerFade = 1;

        // Play sound
        if (this.audioEngine && this.audioEngine.isInitialized) {
            const nodeAngle = ring.currentRotation + node.baseAngle;
            const normX = Math.cos(nodeAngle) * ring.radiusRatio;
            const normY = Math.sin(nodeAngle) * ring.radiusRatio;
            const z = (ringIndex - this.mandala.rings.length / 2) / this.mandala.rings.length;

            this.audioEngine.playTrigger(ring.type, ringIndex, nodeIndex, { x: normX, y: normY, z });
        }

        // Emit particles
        if (this.mandala.onTrigger) {
            this.mandala.onTrigger(x, y, node.color, ring.type);
        }
    }

    findNearestNode(x, y) {
        if (!this.mandala || !this.mandala.rings) return null;

        let nearest = null;
        let minDist = Infinity;

        this.mandala.rings.forEach((ring, ringIndex) => {
            const radius = ring.radiusRatio * this.mandala.maxRadius;

            ring.nodes.forEach((node, nodeIndex) => {
                const angle = ring.currentRotation + node.baseAngle;
                const nodeX = this.mandala.centerX + Math.cos(angle) * radius;
                const nodeY = this.mandala.centerY + Math.sin(angle) * radius;

                const dist = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = { ring, node, ringIndex, nodeIndex, distance: dist };
                }
            });
        });

        return nearest;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Export all utilities
window.TapTempo = TapTempo;
window.SessionTimer = SessionTimer;
window.BreathingGuide = BreathingGuide;
window.FocusMode = FocusMode;
window.TouchTriggers = TouchTriggers;
