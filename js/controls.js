/**
 * Controls - Handles the dial controls and UI interactions
 */

class Controls {
    constructor(audioEngine, mandala) {
        this.audioEngine = audioEngine;
        this.mandala = mandala;

        // Store dial elements and their states
        this.dials = {};
        this.activeDial = null;
        this.startY = 0;
        this.startValue = 0;

        // Time tracking
        this.startTime = Date.now();
        this.isPlaying = true;

        this.init();
    }

    init() {
        this.initDials();
        this.initPlaybackControls();
        this.initTimeDisplay();
        this.initPresetSelector();
    }

    initPresetSelector() {
        const selector = document.getElementById('preset-selector');
        if (!selector) return;

        selector.addEventListener('change', (e) => {
            const presetName = e.target.value;
            if (this.mandala) {
                this.mandala.loadPreset(presetName);
            }
        });
    }

    initDials() {
        const dialElements = document.querySelectorAll('.dial');

        dialElements.forEach(dial => {
            const param = dial.dataset.param;
            const min = parseFloat(dial.dataset.min);
            const max = parseFloat(dial.dataset.max);
            const value = parseFloat(dial.dataset.value);

            this.dials[param] = {
                element: dial,
                min,
                max,
                value,
                knob: dial.querySelector('.dial-knob'),
                display: dial.querySelector('.dial-value')
            };

            // Set initial rotation
            this.updateDialVisual(param);

            // Mouse events for dial interaction
            dial.addEventListener('mousedown', (e) => this.onDialMouseDown(e, param));
        });

        // Global mouse events
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
    }

    onDialMouseDown(e, param) {
        e.preventDefault();
        this.activeDial = param;
        this.startY = e.clientY;
        this.startValue = this.dials[param].value;
        this.dials[param].element.style.borderColor = '#4a9eff';
    }

    onMouseMove(e) {
        if (!this.activeDial) return;

        const dial = this.dials[this.activeDial];
        const deltaY = this.startY - e.clientY;
        const range = dial.max - dial.min;
        const sensitivity = range / 100; // 100px for full range

        let newValue = this.startValue + (deltaY * sensitivity);
        newValue = Math.max(dial.min, Math.min(dial.max, newValue));

        dial.value = newValue;
        this.updateDialVisual(this.activeDial);
        this.applyParameter(this.activeDial, newValue);
    }

    onMouseUp() {
        if (this.activeDial) {
            this.dials[this.activeDial].element.style.borderColor = '#333';
            this.activeDial = null;
        }
    }

    updateDialVisual(param) {
        const dial = this.dials[param];
        if (!dial) return;

        const { min, max, value, knob, display } = dial;
        const normalized = (value - min) / (max - min);
        const rotation = -135 + (normalized * 270); // -135 to 135 degrees

        knob.style.transform = `translateX(-50%) rotate(${rotation}deg)`;
        display.textContent = Math.round(value);
    }

    applyParameter(param, value) {
        // Normalize value to 0-1 range for most parameters
        const dial = this.dials[param];
        const normalized = (value - dial.min) / (dial.max - dial.min);

        switch (param) {
            case 'mainVol':
                this.audioEngine.setMasterVolume(normalized);
                break;
            case 'pitch':
                this.audioEngine.setPitch(value);
                break;
            case 'revMix':
                this.audioEngine.setReverbMix(normalized);
                break;
            case 'revSize':
                this.audioEngine.setReverbSize(normalized);
                break;
            case 'speed':
                this.mandala.setSpeed(normalized * 2); // 0 to 2x speed
                break;
            case 'multiply':
                // Multiply affects the number of triggers
                break;
            case 'fx1':
                this.audioEngine.setFilterFrequency(normalized);
                break;
            case 'fx2':
                // Additional effect
                break;
            case 'glowAmt':
                this.mandala.setGlowAmount(normalized);
                break;
            case 'glowThresh':
                this.mandala.setGlowThreshold(normalized);
                break;
        }
    }

    initPlaybackControls() {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');
        const recordBtn = document.getElementById('record-btn');

        playBtn?.addEventListener('click', () => {
            this.isPlaying = true;
            this.audioEngine.play();
            this.updatePlaybackButtons('play');
        });

        pauseBtn?.addEventListener('click', () => {
            this.isPlaying = false;
            this.audioEngine.pause();
            this.updatePlaybackButtons('pause');
        });

        stopBtn?.addEventListener('click', () => {
            this.isPlaying = false;
            this.audioEngine.stop();
            this.startTime = Date.now();
            this.updatePlaybackButtons('stop');
        });

        recordBtn?.addEventListener('click', () => {
            // Recording functionality - future feature
            recordBtn.classList.toggle('active');
        });

        // Set initial state
        this.updatePlaybackButtons('play');
    }

    updatePlaybackButtons(state) {
        const playBtn = document.getElementById('play-btn');
        const pauseBtn = document.getElementById('pause-btn');
        const stopBtn = document.getElementById('stop-btn');

        playBtn?.classList.remove('active');
        pauseBtn?.classList.remove('active');
        stopBtn?.classList.remove('active');

        if (state === 'play') playBtn?.classList.add('active');
        if (state === 'pause') pauseBtn?.classList.add('active');
        if (state === 'stop') stopBtn?.classList.add('active');
    }

    initTimeDisplay() {
        // Update time display every 100ms
        setInterval(() => {
            this.updateTimeDisplay();
        }, 100);
    }

    updateTimeDisplay() {
        const elapsed = Date.now() - this.startTime;
        const seconds = Math.floor(elapsed / 1000) % 60;
        const minutes = Math.floor(elapsed / 60000) % 60;
        const hours = Math.floor(elapsed / 3600000);

        const display = document.getElementById('time-display');
        if (display) {
            display.textContent = `Time: ${hours}/${minutes}/${seconds}`;
        }
    }

    getIsPlaying() {
        return this.isPlaying;
    }
}

// Export for use in other modules
window.Controls = Controls;
