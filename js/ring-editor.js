/**
 * Ring Editor - UI for configuring per-ring sound settings
 */

class RingEditor {
    constructor(audioEngine, mandala) {
        console.log('RingEditor constructor called');
        this.audioEngine = audioEngine;
        this.mandala = mandala;
        this.selectedRing = 0;
        this.isOpen = false;

        this.createPanel();
        this.bindEvents();
        console.log('RingEditor created, panel:', this.panel);
    }

    createPanel() {
        // Create the editor panel
        this.panel = document.createElement('aside');
        this.panel.id = 'ring-editor';
        this.panel.className = 'collapsed';

        const options = AudioEngine.getOptions();

        this.panel.innerHTML = `
            <div class="editor-content">
                <div class="editor-header">
                    <h3>Ring Sound Editor</h3>
                    <div class="ring-selector">
                        <button class="ring-nav" id="prev-ring">◀</button>
                        <span id="ring-indicator">Ring 1</span>
                        <button class="ring-nav" id="next-ring">▶</button>
                    </div>
                </div>

                <div class="ring-preview" id="ring-preview">
                    <canvas id="ring-preview-canvas" width="120" height="120"></canvas>
                </div>

                <div class="editor-sections">
                    <!-- Synth Selection -->
                    <div class="editor-section">
                        <h4>Synth Type</h4>
                        <select id="synth-preset" class="editor-select">
                            ${options.synthPresets.map(p => `<option value="${p}">${p}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Waveform -->
                    <div class="editor-section">
                        <h4>Waveform</h4>
                        <div class="waveform-buttons" id="waveform-buttons">
                            ${options.waveforms.slice(0, 4).map(w => `
                                <button class="waveform-btn" data-waveform="${w}" title="${w}">
                                    ${this.getWaveformIcon(w)}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Scale -->
                    <div class="editor-section">
                        <h4>Scale</h4>
                        <select id="ring-scale" class="editor-select">
                            ${options.scales.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Octave -->
                    <div class="editor-section">
                        <h4>Octave</h4>
                        <div class="octave-control">
                            <button class="octave-btn" id="octave-down">−</button>
                            <span id="octave-value">4</span>
                            <button class="octave-btn" id="octave-up">+</button>
                        </div>
                    </div>

                    <!-- Note Duration -->
                    <div class="editor-section">
                        <h4>Duration</h4>
                        <div class="duration-buttons" id="duration-buttons">
                            ${options.noteDurations.map(d => `
                                <button class="duration-btn" data-duration="${d}">${d}</button>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Envelope -->
                    <div class="editor-section">
                        <h4>Envelope</h4>
                        <div class="envelope-sliders">
                            <div class="mini-slider">
                                <label>A</label>
                                <input type="range" id="env-attack" min="0" max="100" value="5">
                            </div>
                            <div class="mini-slider">
                                <label>D</label>
                                <input type="range" id="env-decay" min="0" max="100" value="40">
                            </div>
                            <div class="mini-slider">
                                <label>S</label>
                                <input type="range" id="env-sustain" min="0" max="100" value="20">
                            </div>
                            <div class="mini-slider">
                                <label>R</label>
                                <input type="range" id="env-release" min="0" max="100" value="50">
                            </div>
                        </div>
                        <canvas id="envelope-canvas" width="180" height="60"></canvas>
                    </div>

                    <!-- Volume & Reverb -->
                    <div class="editor-section">
                        <h4>Mix</h4>
                        <div class="mix-sliders">
                            <div class="slider-row">
                                <label>Vol</label>
                                <input type="range" id="ring-volume" min="0" max="100" value="70">
                                <span class="slider-val" id="vol-val">70%</span>
                            </div>
                            <div class="slider-row">
                                <label>Reverb</label>
                                <input type="range" id="ring-reverb" min="0" max="100" value="30">
                                <span class="slider-val" id="rev-val">30%</span>
                            </div>
                            <div class="slider-row">
                                <label>Delay</label>
                                <input type="range" id="ring-delay" min="0" max="100" value="0">
                                <span class="slider-val" id="del-val">0%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Mute & Solo -->
                    <div class="editor-section">
                        <div class="mute-solo">
                            <button id="ring-mute" class="mute-btn">M</button>
                            <button id="ring-solo" class="solo-btn">S</button>
                            <button id="ring-test" class="test-btn">Test</button>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="editor-section actions">
                        <button id="copy-to-all" class="action-btn">Copy to All</button>
                        <button id="randomize-ring" class="action-btn">Randomize</button>
                    </div>

                    <!-- Save/Load -->
                    <div class="editor-section">
                        <h4>Presets</h4>
                        <div class="preset-actions">
                            <button id="save-config" class="action-btn small">Save</button>
                            <button id="load-config" class="action-btn small">Load</button>
                            <button id="export-config" class="action-btn small">Export</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const appElement = document.getElementById('app');
        console.log('Appending ring-editor to app element:', appElement);
        if (appElement) {
            appElement.appendChild(this.panel);

            // Create toggle button separately (fixed position, always visible)
            this.toggleBtn = document.createElement('button');
            this.toggleBtn.id = 'ring-editor-toggle';
            this.toggleBtn.textContent = '🎹';
            appElement.appendChild(this.toggleBtn);

            console.log('Ring editor panel and toggle appended successfully');
        } else {
            console.error('Could not find #app element!');
        }

        // Cache DOM elements
        this.cacheElements();
    }

    cacheElements() {
        this.elements = {
            toggle: this.toggleBtn,
            ringIndicator: document.getElementById('ring-indicator'),
            prevRing: document.getElementById('prev-ring'),
            nextRing: document.getElementById('next-ring'),
            synthPreset: document.getElementById('synth-preset'),
            scale: document.getElementById('ring-scale'),
            octaveValue: document.getElementById('octave-value'),
            octaveUp: document.getElementById('octave-up'),
            octaveDown: document.getElementById('octave-down'),
            envAttack: document.getElementById('env-attack'),
            envDecay: document.getElementById('env-decay'),
            envSustain: document.getElementById('env-sustain'),
            envRelease: document.getElementById('env-release'),
            envelopeCanvas: document.getElementById('envelope-canvas'),
            volume: document.getElementById('ring-volume'),
            reverb: document.getElementById('ring-reverb'),
            delay: document.getElementById('ring-delay'),
            volVal: document.getElementById('vol-val'),
            revVal: document.getElementById('rev-val'),
            delVal: document.getElementById('del-val'),
            muteBtn: document.getElementById('ring-mute'),
            soloBtn: document.getElementById('ring-solo'),
            testBtn: document.getElementById('ring-test'),
            copyToAll: document.getElementById('copy-to-all'),
            randomize: document.getElementById('randomize-ring'),
            saveConfig: document.getElementById('save-config'),
            loadConfig: document.getElementById('load-config'),
            exportConfig: document.getElementById('export-config'),
            previewCanvas: document.getElementById('ring-preview-canvas')
        };
    }

    bindEvents() {
        // Toggle panel
        this.elements.toggle.addEventListener('click', () => this.togglePanel());

        // Ring navigation
        this.elements.prevRing.addEventListener('click', () => this.selectRing(this.selectedRing - 1));
        this.elements.nextRing.addEventListener('click', () => this.selectRing(this.selectedRing + 1));

        // Synth preset
        this.elements.synthPreset.addEventListener('change', (e) => this.updateSynthPreset(e.target.value));

        // Waveform buttons
        document.querySelectorAll('.waveform-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateWaveform(btn.dataset.waveform));
        });

        // Scale
        this.elements.scale.addEventListener('change', (e) => this.updateConfig({ scale: e.target.value }));

        // Octave
        this.elements.octaveUp.addEventListener('click', () => this.adjustOctave(1));
        this.elements.octaveDown.addEventListener('click', () => this.adjustOctave(-1));

        // Duration buttons
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.addEventListener('click', () => this.updateDuration(btn.dataset.duration));
        });

        // Envelope sliders
        ['envAttack', 'envDecay', 'envSustain', 'envRelease'].forEach(id => {
            this.elements[id].addEventListener('input', () => this.updateEnvelope());
        });

        // Mix sliders
        this.elements.volume.addEventListener('input', () => {
            this.elements.volVal.textContent = this.elements.volume.value + '%';
            this.updateConfig({ volume: this.elements.volume.value / 100 });
        });

        this.elements.reverb.addEventListener('input', () => {
            this.elements.revVal.textContent = this.elements.reverb.value + '%';
            this.updateConfig({ reverbSend: this.elements.reverb.value / 100 });
        });

        this.elements.delay.addEventListener('input', () => {
            this.elements.delVal.textContent = this.elements.delay.value + '%';
            this.updateConfig({ delaySend: this.elements.delay.value / 100 });
        });

        // Mute/Solo/Test
        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        this.elements.soloBtn.addEventListener('click', () => this.toggleSolo());
        this.elements.testBtn.addEventListener('click', () => this.testSound());

        // Actions
        this.elements.copyToAll.addEventListener('click', () => this.copyToAllRings());
        this.elements.randomize.addEventListener('click', () => this.randomizeRing());

        // Save/Load
        this.elements.saveConfig.addEventListener('click', () => this.saveToStorage());
        this.elements.loadConfig.addEventListener('click', () => this.loadFromStorage());
        this.elements.exportConfig.addEventListener('click', () => this.exportToFile());
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
        this.toggleBtn.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            this.refresh();
        }
    }

    selectRing(index) {
        const ringCount = this.mandala?.rings?.length || 8;
        this.selectedRing = Math.max(0, Math.min(ringCount - 1, index));
        this.refresh();
    }

    refresh() {
        if (!this.mandala?.rings) return;

        const ringCount = this.mandala.rings.length;
        this.elements.ringIndicator.textContent = `Ring ${this.selectedRing + 1} / ${ringCount}`;

        // Get current config for this ring
        const config = this.audioEngine.getRingConfig(this.selectedRing);

        // Update all UI elements
        this.elements.synthPreset.value = config.synthPreset;
        this.elements.scale.value = config.scale;
        this.elements.octaveValue.textContent = config.octave;

        // Update waveform buttons
        document.querySelectorAll('.waveform-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.waveform === config.waveform);
        });

        // Update duration buttons
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.duration === config.noteDuration);
        });

        // Update envelope sliders
        this.elements.envAttack.value = config.attack * 500;
        this.elements.envDecay.value = config.decay * 50;
        this.elements.envSustain.value = config.sustain * 100;
        this.elements.envRelease.value = config.release * 50;

        // Update mix sliders
        this.elements.volume.value = config.volume * 100;
        this.elements.reverb.value = config.reverbSend * 100;
        this.elements.delay.value = (config.delaySend || 0) * 100;
        this.elements.volVal.textContent = Math.round(config.volume * 100) + '%';
        this.elements.revVal.textContent = Math.round(config.reverbSend * 100) + '%';
        this.elements.delVal.textContent = Math.round((config.delaySend || 0) * 100) + '%';

        // Update mute button
        this.elements.muteBtn.classList.toggle('active', config.muted);

        // Draw envelope visualization
        this.drawEnvelope();

        // Draw ring preview
        this.drawRingPreview();
    }

    updateSynthPreset(preset) {
        const presetConfig = AudioEngine.SYNTH_PRESETS[preset];
        if (presetConfig) {
            this.updateConfig({
                synthPreset: preset,
                waveform: presetConfig.oscillator.type,
                attack: presetConfig.envelope.attack,
                decay: presetConfig.envelope.decay,
                sustain: presetConfig.envelope.sustain,
                release: presetConfig.envelope.release
            });
            this.refresh();
        }
    }

    updateWaveform(waveform) {
        this.updateConfig({ waveform });
        document.querySelectorAll('.waveform-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.waveform === waveform);
        });
    }

    updateDuration(duration) {
        this.updateConfig({ noteDuration: duration });
        document.querySelectorAll('.duration-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.duration === duration);
        });
    }

    adjustOctave(delta) {
        const current = parseInt(this.elements.octaveValue.textContent);
        const newOctave = Math.max(1, Math.min(8, current + delta));
        this.elements.octaveValue.textContent = newOctave;
        this.updateConfig({ octave: newOctave });
    }

    updateEnvelope() {
        this.updateConfig({
            attack: this.elements.envAttack.value / 500,
            decay: this.elements.envDecay.value / 50,
            sustain: this.elements.envSustain.value / 100,
            release: this.elements.envRelease.value / 50
        });
        this.drawEnvelope();
    }

    updateConfig(changes) {
        const currentConfig = this.audioEngine.getRingConfig(this.selectedRing);
        const newConfig = { ...currentConfig, ...changes };
        this.audioEngine.setRingConfig(this.selectedRing, newConfig);
    }

    drawEnvelope() {
        const canvas = this.elements.envelopeCanvas;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, w, h);

        // Get values
        const a = this.elements.envAttack.value / 100;
        const d = this.elements.envDecay.value / 100;
        const s = this.elements.envSustain.value / 100;
        const r = this.elements.envRelease.value / 100;

        // Draw ADSR curve
        ctx.beginPath();
        ctx.moveTo(0, h);

        // Attack
        const attackX = a * w * 0.25;
        ctx.lineTo(attackX, h * 0.1);

        // Decay
        const decayX = attackX + d * w * 0.25;
        const sustainY = h - (s * h * 0.8);
        ctx.lineTo(decayX, sustainY);

        // Sustain
        const sustainX = decayX + w * 0.25;
        ctx.lineTo(sustainX, sustainY);

        // Release
        const releaseX = sustainX + r * w * 0.25;
        ctx.lineTo(releaseX, h);

        ctx.strokeStyle = '#4a9eff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Fill
        ctx.lineTo(0, h);
        ctx.fillStyle = 'rgba(74, 158, 255, 0.2)';
        ctx.fill();
    }

    drawRingPreview() {
        if (!this.mandala?.rings?.[this.selectedRing]) return;

        const canvas = this.elements.previewCanvas;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        const ring = this.mandala.rings[this.selectedRing];
        const radius = 45;

        // Draw ring circle
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = ring.color || '#4a9eff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw nodes
        ring.nodes.forEach((node, i) => {
            const angle = ring.currentRotation + node.baseAngle;
            const x = cx + Math.cos(angle) * radius;
            const y = cy + Math.sin(angle) * radius;

            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fillStyle = ring.color || '#4a9eff';
            ctx.fill();
        });
    }

    toggleMute() {
        const config = this.audioEngine.getRingConfig(this.selectedRing);
        this.updateConfig({ muted: !config.muted });
        this.elements.muteBtn.classList.toggle('active', !config.muted);
    }

    toggleSolo() {
        // Solo this ring (mute all others)
        const isSoloed = this.elements.soloBtn.classList.toggle('active');

        this.mandala.rings.forEach((ring, index) => {
            const config = this.audioEngine.getRingConfig(index);
            if (isSoloed) {
                this.audioEngine.setRingConfig(index, { ...config, muted: index !== this.selectedRing });
            } else {
                this.audioEngine.setRingConfig(index, { ...config, muted: false });
            }
        });
    }

    testSound() {
        if (!this.audioEngine.isInitialized) return;

        // Play a test note on this ring
        const config = this.audioEngine.getRingConfig(this.selectedRing);
        const ringSynth = this.audioEngine.ringSynths[this.selectedRing];

        if (ringSynth?.synth) {
            const scale = AudioEngine.SCALES[config.scale] || AudioEngine.SCALES['Pentatonic'];
            const note = scale[0] + config.octave;
            ringSynth.synth.triggerAttackRelease(note, config.noteDuration, Tone.now(), config.volume);
        }
    }

    copyToAllRings() {
        const config = this.audioEngine.getRingConfig(this.selectedRing);
        this.mandala.rings.forEach((ring, index) => {
            if (index !== this.selectedRing) {
                this.audioEngine.setRingConfig(index, { ...config });
            }
        });
    }

    randomizeRing() {
        const options = AudioEngine.getOptions();
        const randomConfig = {
            synthPreset: options.synthPresets[Math.floor(Math.random() * options.synthPresets.length)],
            waveform: options.waveforms[Math.floor(Math.random() * 4)],
            scale: options.scales[Math.floor(Math.random() * options.scales.length)],
            octave: Math.floor(Math.random() * 5) + 2,
            attack: Math.random() * 0.2,
            decay: Math.random() * 1.5 + 0.1,
            sustain: Math.random(),
            release: Math.random() * 2,
            volume: 0.4 + Math.random() * 0.4,
            reverbSend: Math.random() * 0.6,
            delaySend: Math.random() * 0.3,
            noteDuration: options.noteDurations[Math.floor(Math.random() * options.noteDurations.length)],
            muted: false
        };
        this.audioEngine.setRingConfig(this.selectedRing, randomConfig);
        this.refresh();
    }

    saveToStorage() {
        const config = this.audioEngine.exportConfig();
        const mandalConfig = {
            preset: this.mandala.currentPreset,
            audio: config
        };
        localStorage.setItem('polyrhythm-config', JSON.stringify(mandalConfig));
        alert('Configuration saved!');
    }

    loadFromStorage() {
        const saved = localStorage.getItem('polyrhythm-config');
        if (saved) {
            const config = JSON.parse(saved);
            if (config.audio) {
                this.audioEngine.importConfig(config.audio);
                this.refresh();
                alert('Configuration loaded!');
            }
        } else {
            alert('No saved configuration found.');
        }
    }

    exportToFile() {
        const config = {
            preset: this.mandala.currentPreset,
            audio: this.audioEngine.exportConfig(),
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `polyrhythm-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    getWaveformIcon(type) {
        const icons = {
            'sine': '∿',
            'triangle': '△',
            'square': '⊓',
            'sawtooth': '⋀',
            'fatsine': '∿∿',
            'fattriangle': '△△',
            'fatsquare': '⊓⊓',
            'fatsawtooth': '⋀⋀'
        };
        return icons[type] || type;
    }
}

window.RingEditor = RingEditor;
