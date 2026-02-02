/**
 * Isochronic Panel - UI for controlling isochronic tones
 */

class IsochronicPanel {
    constructor(isochronicTones) {
        this.iso = isochronicTones;
        this.isOpen = false;

        this.createPanel();
        this.bindEvents();
    }

    createPanel() {
        this.panel = document.createElement('aside');
        this.panel.id = 'iso-panel';
        this.panel.className = 'collapsed';

        const presets = IsochronicTones.getPresetNames();

        this.panel.innerHTML = `
            <div class="iso-content">
                <div class="iso-header">
                    <h3>Isochronic Tones</h3>
                    <p class="iso-subtitle">Brainwave Entrainment</p>
                </div>

                <div class="iso-brainwave-display">
                    <div class="brainwave-indicator" id="brainwave-indicator">
                        <span class="brainwave-label">Alpha</span>
                        <span class="brainwave-freq">10 Hz</span>
                    </div>
                    <canvas id="iso-visualizer" width="200" height="60"></canvas>
                </div>

                <div class="iso-section">
                    <h4>Preset</h4>
                    <select id="iso-preset" class="iso-select">
                        ${presets.map(p => `<option value="${p}">${p}</option>`).join('')}
                    </select>
                    <p class="preset-description" id="preset-description">Calm alertness, learning</p>
                </div>

                <div class="iso-section">
                    <h4>Pulse Rate (Entrainment)</h4>
                    <div class="iso-slider-row">
                        <input type="range" id="iso-pulse-rate" min="1" max="50" value="10" step="0.5">
                        <span class="iso-value" id="pulse-rate-value">10 Hz</span>
                    </div>
                    <div class="brainwave-bands">
                        <span class="band delta">δ 1-4</span>
                        <span class="band theta">θ 4-8</span>
                        <span class="band alpha">α 8-12</span>
                        <span class="band beta">β 12-30</span>
                        <span class="band gamma">γ 30+</span>
                    </div>
                </div>

                <div class="iso-section">
                    <h4>Carrier Tone</h4>
                    <div class="iso-slider-row">
                        <input type="range" id="iso-carrier" min="50" max="500" value="200">
                        <span class="iso-value" id="carrier-value">200 Hz</span>
                    </div>
                </div>

                <div class="iso-section">
                    <h4>Volume</h4>
                    <div class="iso-slider-row">
                        <input type="range" id="iso-volume" min="0" max="100" value="30">
                        <span class="iso-value" id="volume-value">30%</span>
                    </div>
                </div>

                <div class="iso-section">
                    <h4>Tone Shape</h4>
                    <div class="iso-buttons">
                        <button class="iso-shape-btn active" data-shape="sine">Sine</button>
                        <button class="iso-shape-btn" data-shape="triangle">Triangle</button>
                    </div>
                </div>

                <div class="iso-section">
                    <h4>Pulse Shape</h4>
                    <div class="iso-buttons">
                        <button class="iso-pulse-btn active" data-pulse="square">Sharp</button>
                        <button class="iso-pulse-btn" data-pulse="sine">Smooth</button>
                    </div>
                </div>

                <div class="iso-controls">
                    <button id="iso-play" class="iso-play-btn">▶ Start</button>
                </div>

                <div class="iso-info">
                    <p><strong>How it works:</strong> Isochronic tones pulse at specific frequencies to encourage your brain to synchronize (entrain) to that rhythm.</p>
                </div>
            </div>
        `;

        // Create toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'iso-toggle';
        this.toggleBtn.innerHTML = '🧠';
        this.toggleBtn.title = 'Isochronic Tones';

        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.appendChild(this.panel);
            appElement.appendChild(this.toggleBtn);
        }

        this.cacheElements();
        this.setupVisualizer();
    }

    cacheElements() {
        this.elements = {
            preset: document.getElementById('iso-preset'),
            presetDescription: document.getElementById('preset-description'),
            pulseRate: document.getElementById('iso-pulse-rate'),
            pulseRateValue: document.getElementById('pulse-rate-value'),
            carrier: document.getElementById('iso-carrier'),
            carrierValue: document.getElementById('carrier-value'),
            volume: document.getElementById('iso-volume'),
            volumeValue: document.getElementById('volume-value'),
            playBtn: document.getElementById('iso-play'),
            brainwaveIndicator: document.getElementById('brainwave-indicator'),
            visualizer: document.getElementById('iso-visualizer')
        };
    }

    setupVisualizer() {
        this.visCanvas = this.elements.visualizer;
        this.visCtx = this.visCanvas.getContext('2d');
        this.visPhase = 0;
        this.animateVisualizer();
    }

    animateVisualizer() {
        if (!this.visCtx) return;

        const ctx = this.visCtx;
        const w = this.visCanvas.width;
        const h = this.visCanvas.height;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        // Get current brainwave color
        const brainwave = this.iso.getCurrentBrainwave();
        const color = brainwave.color;

        // Draw pulsing wave
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        const pulseRate = this.iso.pulseRate;
        const carrierFreq = this.iso.carrierFrequency / 50; // Scale down for visualization

        for (let x = 0; x < w; x++) {
            const t = (x / w) * Math.PI * 4 + this.visPhase;
            // Carrier wave modulated by pulse
            const pulse = Math.sin(t * pulseRate / 10) > 0 ? 1 : 0;
            const carrier = Math.sin(t * carrierFreq) * pulse;
            const y = h / 2 + carrier * (h / 3) * (this.iso.isPlaying ? 1 : 0.3);
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = this.iso.isPlaying ? color : 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Animate phase
        if (this.iso.isPlaying) {
            this.visPhase += 0.1;
        }

        requestAnimationFrame(() => this.animateVisualizer());
    }

    bindEvents() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', () => this.togglePanel());

        // Preset selection
        this.elements.preset.addEventListener('change', (e) => {
            this.iso.loadPreset(e.target.value);
            this.updateDisplay();
        });

        // Pulse rate
        this.elements.pulseRate.addEventListener('input', (e) => {
            this.iso.setPulseRate(parseFloat(e.target.value));
            this.elements.preset.value = 'Custom';
            this.updateDisplay();
        });

        // Carrier frequency
        this.elements.carrier.addEventListener('input', (e) => {
            this.iso.setCarrierFrequency(parseFloat(e.target.value));
            this.elements.preset.value = 'Custom';
            this.updateDisplay();
        });

        // Volume
        this.elements.volume.addEventListener('input', (e) => {
            this.iso.setVolume(e.target.value / 100);
            this.elements.volumeValue.textContent = e.target.value + '%';
        });

        // Tone shape buttons
        document.querySelectorAll('.iso-shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.iso-shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.iso.setWaveform(btn.dataset.shape);
            });
        });

        // Pulse shape buttons
        document.querySelectorAll('.iso-pulse-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.iso-pulse-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.iso.setPulseShape(btn.dataset.pulse);
            });
        });

        // Play/Stop button
        this.elements.playBtn.addEventListener('click', () => {
            if (this.iso.isPlaying) {
                this.iso.stop();
                this.elements.playBtn.textContent = '▶ Start';
                this.elements.playBtn.classList.remove('playing');
            } else {
                this.iso.start();
                this.elements.playBtn.textContent = '⏹ Stop';
                this.elements.playBtn.classList.add('playing');
            }
        });
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
        this.toggleBtn.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            this.updateDisplay();
        }
    }

    updateDisplay() {
        // Update slider values
        this.elements.pulseRate.value = this.iso.pulseRate;
        this.elements.pulseRateValue.textContent = this.iso.pulseRate.toFixed(1) + ' Hz';

        this.elements.carrier.value = this.iso.carrierFrequency;
        this.elements.carrierValue.textContent = this.iso.carrierFrequency + ' Hz';

        // Update brainwave indicator
        const brainwave = this.iso.getCurrentBrainwave();
        const indicator = this.elements.brainwaveIndicator;
        indicator.querySelector('.brainwave-label').textContent = brainwave.label;
        indicator.querySelector('.brainwave-freq').textContent = this.iso.pulseRate.toFixed(1) + ' Hz';
        indicator.style.borderColor = brainwave.color;
        indicator.style.color = brainwave.color;

        // Update preset description
        const preset = IsochronicTones.getPresetInfo(this.iso.currentPreset);
        if (preset) {
            this.elements.presetDescription.textContent = preset.description;
        }

        // Highlight active brainwave band
        document.querySelectorAll('.brainwave-bands .band').forEach(band => {
            band.classList.remove('active');
        });
        const activeBand = document.querySelector(`.brainwave-bands .band.${brainwave.key}`);
        if (activeBand) {
            activeBand.classList.add('active');
        }
    }
}

window.IsochronicPanel = IsochronicPanel;
