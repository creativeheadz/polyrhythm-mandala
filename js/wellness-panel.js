/**
 * Wellness Panel - Session Timer & Breathing Guide UI
 */

class WellnessPanel {
    constructor(audioEngine) {
        this.audioEngine = audioEngine;
        this.sessionTimer = new SessionTimer();
        this.breathingGuide = new BreathingGuide();
        this.focusMode = new FocusMode();
        this.tapTempo = new TapTempo((bpm) => this.onTapTempo(bpm));
        this.isOpen = false;

        this.createPanel();
        this.bindEvents();
        this.setupCallbacks();
    }

    createPanel() {
        const appElement = document.getElementById('app');

        // Toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'wellness-toggle';
        this.toggleBtn.textContent = '\u{1F9D8}'; // Meditation emoji
        this.toggleBtn.title = 'Wellness Tools';
        appElement.appendChild(this.toggleBtn);

        // Panel
        this.panel = document.createElement('div');
        this.panel.id = 'wellness-panel';
        this.panel.className = 'collapsed';

        const breathPatterns = BreathingGuide.getPatternNames();

        this.panel.innerHTML = `
            <div class="wellness-content">
                <div class="wellness-header">
                    <h3>Wellness Tools</h3>
                    <span class="wellness-subtitle">Timer, Breathing & Focus</span>
                </div>

                <div class="wellness-section">
                    <h4>Session Timer</h4>
                    <div class="timer-display" id="timer-display">
                        <span class="timer-time">00:00</span>
                        <span class="timer-status">Not started</span>
                    </div>
                    <div class="timer-presets">
                        <button class="timer-preset-btn" data-minutes="5">5m</button>
                        <button class="timer-preset-btn" data-minutes="10">10m</button>
                        <button class="timer-preset-btn" data-minutes="15">15m</button>
                        <button class="timer-preset-btn" data-minutes="20">20m</button>
                        <button class="timer-preset-btn" data-minutes="30">30m</button>
                    </div>
                    <div class="timer-controls">
                        <button id="timer-start" class="timer-control-btn">Start</button>
                        <button id="timer-stop" class="timer-control-btn">Stop</button>
                    </div>
                </div>

                <div class="wellness-section">
                    <h4>Breathing Guide</h4>
                    <div class="breathing-display" id="breathing-display">
                        <div class="breath-circle" id="breath-circle"></div>
                        <span class="breath-phase" id="breath-phase">Ready</span>
                    </div>
                    <select id="breath-pattern" class="wellness-select">
                        ${breathPatterns.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                    <div class="breathing-controls">
                        <button id="breathing-start" class="breathing-control-btn">Start</button>
                        <button id="breathing-stop" class="breathing-control-btn">Stop</button>
                    </div>
                </div>

                <div class="wellness-section">
                    <h4>Tap Tempo</h4>
                    <button id="tap-tempo-btn" class="tap-tempo-btn">TAP</button>
                    <span class="tap-result" id="tap-result">Tap to set tempo</span>
                </div>

                <div class="wellness-section">
                    <h4>Focus Mode</h4>
                    <button id="focus-mode-btn" class="focus-btn">Enter Focus Mode</button>
                    <p class="focus-info">Hide all UI for distraction-free experience</p>
                </div>
            </div>
        `;

        appElement.appendChild(this.panel);

        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            timerDisplay: this.panel.querySelector('#timer-display'),
            timerTime: this.panel.querySelector('.timer-time'),
            timerStatus: this.panel.querySelector('.timer-status'),
            timerStart: this.panel.querySelector('#timer-start'),
            timerStop: this.panel.querySelector('#timer-stop'),
            breathCircle: this.panel.querySelector('#breath-circle'),
            breathPhase: this.panel.querySelector('#breath-phase'),
            breathPattern: this.panel.querySelector('#breath-pattern'),
            breathStart: this.panel.querySelector('#breathing-start'),
            breathStop: this.panel.querySelector('#breathing-stop'),
            tapBtn: this.panel.querySelector('#tap-tempo-btn'),
            tapResult: this.panel.querySelector('#tap-result'),
            focusBtn: this.panel.querySelector('#focus-mode-btn')
        };
    }

    bindEvents() {
        // Toggle
        this.toggleBtn.addEventListener('click', () => this.togglePanel());

        // Timer presets
        this.panel.querySelectorAll('.timer-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mins = parseInt(btn.dataset.minutes);
                this.startTimer(mins);
                this.panel.querySelectorAll('.timer-preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Timer controls
        this.elements.timerStart.addEventListener('click', () => {
            if (!this.sessionTimer.isRunning && this.sessionTimer.duration > 0) {
                this.sessionTimer.resume();
            }
        });

        this.elements.timerStop.addEventListener('click', () => {
            this.sessionTimer.stop();
            this.elements.timerStatus.textContent = 'Stopped';
        });

        // Breathing
        this.elements.breathPattern.addEventListener('change', (e) => {
            this.breathingGuide.setPattern(e.target.value);
        });

        this.elements.breathStart.addEventListener('click', () => {
            this.breathingGuide.start();
        });

        this.elements.breathStop.addEventListener('click', () => {
            this.breathingGuide.stop();
            this.elements.breathPhase.textContent = 'Ready';
            this.elements.breathCircle.style.transform = 'scale(0.5)';
        });

        // Tap Tempo
        this.elements.tapBtn.addEventListener('click', () => {
            const count = this.tapTempo.tap();
            this.elements.tapBtn.classList.add('tapped');
            setTimeout(() => this.elements.tapBtn.classList.remove('tapped'), 100);
        });

        // Focus Mode
        this.elements.focusBtn.addEventListener('click', () => {
            this.focusMode.toggle();
        });
    }

    setupCallbacks() {
        // Timer callbacks
        this.sessionTimer.onTick = (time, progress) => {
            this.elements.timerTime.textContent = this.sessionTimer.formatTime(time);
            this.elements.timerStatus.textContent = `${Math.round(progress * 100)}% complete`;
        };

        this.sessionTimer.onComplete = () => {
            this.elements.timerStatus.textContent = 'Session complete!';
            // Could play a gentle sound here
        };

        this.sessionTimer.onFadeStart = (seconds) => {
            this.elements.timerStatus.textContent = `Fading out in ${seconds}s...`;
            // Start fading audio
            if (this.audioEngine && this.audioEngine.masterGain) {
                this.audioEngine.masterGain.gain.rampTo(0, seconds);
            }
        };

        // Breathing callbacks
        this.breathingGuide.onProgress = (phase, progress, scale) => {
            this.elements.breathCircle.style.transform = `scale(${0.5 + scale * 0.5})`;
        };

        this.breathingGuide.onPhaseChange = (phase, cycles) => {
            const labels = {
                inhale: 'Breathe In',
                hold: 'Hold',
                exhale: 'Breathe Out',
                holdOut: 'Hold'
            };
            this.elements.breathPhase.textContent = labels[phase] || phase;
            this.elements.breathPhase.className = `breath-phase ${phase}`;
        };

        // Focus mode callback
        this.focusMode.onToggle = (isActive) => {
            this.elements.focusBtn.textContent = isActive ? 'Exit Focus Mode' : 'Enter Focus Mode';
        };
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
        this.toggleBtn.classList.toggle('open', this.isOpen);
    }

    startTimer(minutes) {
        this.sessionTimer.stop();
        this.sessionTimer.start(minutes);
        this.elements.timerStatus.textContent = 'Running...';
    }

    onTapTempo(bpm) {
        this.elements.tapResult.textContent = `${bpm} BPM`;
        // Convert BPM to speed multiplier (60 BPM = 1x)
        const speedMultiplier = bpm / 60;
        // Could update mandala speed here if desired
    }
}

window.WellnessPanel = WellnessPanel;
