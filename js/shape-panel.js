/**
 * Shape Panel - UI for controlling mandala shapes and orbiters
 */

class ShapePanel {
    constructor(mandala, audioEngine, orbitersSystem) {
        this.mandala = mandala;
        this.audioEngine = audioEngine;
        this.orbiters = orbitersSystem;
        this.shapes = new MandalaShapes(mandala);
        this.isOpen = false;

        this.createPanel();
        this.bindEvents();
    }

    createPanel() {
        const appElement = document.getElementById('app');

        // Toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'shape-toggle';
        this.toggleBtn.textContent = '✧';
        this.toggleBtn.title = 'Shapes & Orbiters';
        appElement.appendChild(this.toggleBtn);

        // Panel
        this.panel = document.createElement('div');
        this.panel.id = 'shape-panel';
        this.panel.className = 'collapsed';

        const patterns = OrbitersSystem.getPatternNames();
        const shapeNames = MandalaShapes.getShapeNames();

        this.panel.innerHTML = `
            <div class="shape-content">
                <div class="shape-header">
                    <h3>Shapes & Orbiters</h3>
                    <span class="shape-subtitle">Geometric patterns & trajectories</span>
                </div>

                <div class="shape-section">
                    <h4>Mandala Shape</h4>
                    <div class="shape-grid">
                        ${shapeNames.map(name => {
                            const info = MandalaShapes.getShapeInfo(name);
                            return `<button class="mandala-shape-btn${name === 'circular' ? ' active' : ''}" data-shape="${name}" title="${info.description}">
                                <span class="shape-icon">${info.icon}</span>
                                <span class="shape-name">${info.name}</span>
                            </button>`;
                        }).join('')}
                    </div>
                </div>

                <div class="shape-section">
                    <h4>Orbiters</h4>
                    <div class="orbiter-controls">
                        <div class="orbiter-count">
                            Active: <span id="orbiter-count">0</span>
                        </div>
                        <div class="orbiter-buttons">
                            <button id="add-orbiter" class="shape-btn">+ Add</button>
                            <button id="add-5-orbiters" class="shape-btn">+ Add 5</button>
                            <button id="clear-orbiters" class="shape-btn danger">Clear</button>
                        </div>
                    </div>
                    <div class="orbiter-pattern">
                        <label>Pattern</label>
                        <select id="orbiter-pattern" class="shape-select">
                            <option value="random">Random</option>
                            ${patterns.map(p => `<option value="${p}">${OrbitersSystem.PATTERNS[p].name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="shape-section">
                    <h4>Orbiter Settings</h4>
                    <div class="shape-slider-row">
                        <label>Speed</label>
                        <input type="range" id="orbiter-speed" min="0" max="200" value="100">
                        <span class="shape-value">100%</span>
                    </div>
                    <div class="shape-slider-row">
                        <label>Size</label>
                        <input type="range" id="orbiter-size" min="20" max="200" value="100">
                        <span class="shape-value">100%</span>
                    </div>
                    <div class="shape-slider-row">
                        <label>Glow</label>
                        <input type="range" id="orbiter-glow" min="0" max="100" value="50">
                        <span class="shape-value">50%</span>
                    </div>
                    <div class="shape-slider-row">
                        <label>Trail</label>
                        <input type="range" id="orbiter-trail" min="0" max="20" value="8">
                        <span class="shape-value">8</span>
                    </div>
                    <div class="shape-checkboxes">
                        <label>
                            <input type="checkbox" id="orbiter-trigger-cross" checked>
                            Trigger on cross
                        </label>
                        <label>
                            <input type="checkbox" id="orbiter-trigger-collide">
                            Trigger on collide
                        </label>
                    </div>
                </div>

                <div class="shape-section">
                    <h4>Quick Presets</h4>
                    <div class="preset-grid">
                        <button class="preset-btn" data-preset="chaotic">🌀 Chaotic</button>
                        <button class="preset-btn" data-preset="orbital">🪐 Orbital</button>
                        <button class="preset-btn" data-preset="dance">💃 Dance</button>
                        <button class="preset-btn" data-preset="meditative">🧘 Meditative</button>
                        <button class="preset-btn" data-preset="fireworks">🎆 Fireworks</button>
                        <button class="preset-btn" data-preset="swarm">🐝 Swarm</button>
                    </div>
                </div>

                <div class="shape-section">
                    <h4>Enable/Disable</h4>
                    <div class="toggle-row">
                        <span>Orbiters Active</span>
                        <button id="toggle-orbiters" class="toggle-btn active">ON</button>
                    </div>
                </div>

                <div class="shape-info">
                    <p>Orbiters are free-roaming nodes that follow various trajectories, adding randomization to the musical output.</p>
                </div>
            </div>
        `;

        appElement.appendChild(this.panel);
    }

    bindEvents() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', () => this.togglePanel());

        // Mandala shape buttons
        this.panel.querySelectorAll('.mandala-shape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const shapeName = btn.dataset.shape;
                this.applyMandalaShape(shapeName);
                // Update active state
                this.panel.querySelectorAll('.mandala-shape-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Add orbiters
        this.panel.querySelector('#add-orbiter').addEventListener('click', () => {
            const pattern = this.panel.querySelector('#orbiter-pattern').value;
            this.orbiters.addOrbiter({
                pattern: pattern === 'random' ? null : pattern
            });
            this.updateCount();
        });

        this.panel.querySelector('#add-5-orbiters').addEventListener('click', () => {
            const pattern = this.panel.querySelector('#orbiter-pattern').value;
            this.orbiters.addOrbiters(5, pattern === 'random' ? null : pattern);
            this.updateCount();
        });

        this.panel.querySelector('#clear-orbiters').addEventListener('click', () => {
            this.orbiters.clear();
            this.updateCount();
        });

        // Sliders
        this.bindSlider('orbiter-speed', (v) => {
            this.orbiters.settings.speed = v / 100;
        });
        this.bindSlider('orbiter-size', (v) => {
            this.orbiters.settings.size = v / 100;
        });
        this.bindSlider('orbiter-glow', (v) => {
            this.orbiters.settings.glow = v / 100;
        });
        this.bindSlider('orbiter-trail', (v) => {
            this.orbiters.settings.trailLength = v;
        }, false);

        // Checkboxes
        this.panel.querySelector('#orbiter-trigger-cross').addEventListener('change', (e) => {
            this.orbiters.settings.triggerOnCross = e.target.checked;
        });
        this.panel.querySelector('#orbiter-trigger-collide').addEventListener('change', (e) => {
            this.orbiters.settings.triggerOnCollide = e.target.checked;
        });

        // Presets
        this.panel.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadPreset(btn.dataset.preset);
            });
        });

        // Toggle orbiters
        this.panel.querySelector('#toggle-orbiters').addEventListener('click', (e) => {
            const enabled = !this.orbiters.enabled;
            this.orbiters.setEnabled(enabled);
            e.target.textContent = enabled ? 'ON' : 'OFF';
            e.target.classList.toggle('active', enabled);
        });

        // Update count periodically
        setInterval(() => this.updateCount(), 500);
    }

    bindSlider(id, callback, percent = true) {
        const slider = this.panel.querySelector(`#${id}`);
        const valueDisplay = slider.parentElement.querySelector('.shape-value');

        slider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            callback(value);
            valueDisplay.textContent = percent ? value + '%' : value;
        });
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
        this.toggleBtn.classList.toggle('open', this.isOpen);
    }

    updateCount() {
        const countEl = this.panel.querySelector('#orbiter-count');
        if (countEl) {
            countEl.textContent = this.orbiters.getCount();
        }
    }

    loadPreset(presetName) {
        this.orbiters.clear();

        switch (presetName) {
            case 'chaotic':
                this.orbiters.addOrbiters(10, 'random-walk');
                this.orbiters.addOrbiters(5, 'lissajous');
                this.orbiters.settings.speed = 1.5;
                this.orbiters.settings.triggerOnCollide = true;
                break;

            case 'orbital':
                for (let i = 0; i < 8; i++) {
                    this.orbiters.addOrbiter({
                        pattern: 'circular',
                        a: 0.2 + i * 0.1,
                        speed: 0.5 + i * 0.2,
                        direction: i % 2 === 0 ? 1 : -1
                    });
                }
                this.orbiters.settings.speed = 0.8;
                break;

            case 'dance':
                this.orbiters.addOrbiters(6, 'figure-eight');
                this.orbiters.addOrbiters(4, 'pendulum');
                this.orbiters.settings.speed = 1.2;
                break;

            case 'meditative':
                for (let i = 0; i < 5; i++) {
                    this.orbiters.addOrbiter({
                        pattern: 'elliptical',
                        a: 0.3 + i * 0.12,
                        b: 0.2 + i * 0.08,
                        speed: 0.3,
                        phase: i * Math.PI / 2.5
                    });
                }
                this.orbiters.settings.speed = 0.5;
                this.orbiters.settings.glow = 0.8;
                break;

            case 'fireworks':
                this.orbiters.addOrbiters(12, 'rose');
                this.orbiters.settings.speed = 1.5;
                this.orbiters.settings.glow = 1;
                this.orbiters.settings.trailLength = 15;
                break;

            case 'swarm':
                this.orbiters.addOrbiters(15, 'random-walk');
                this.orbiters.settings.speed = 2;
                this.orbiters.settings.size = 0.6;
                this.orbiters.settings.triggerOnCollide = true;
                break;
        }

        this.updateCount();
        this.updateUIFromSettings();
    }

    updateUIFromSettings() {
        this.panel.querySelector('#orbiter-speed').value = this.orbiters.settings.speed * 100;
        this.panel.querySelector('#orbiter-size').value = this.orbiters.settings.size * 100;
        this.panel.querySelector('#orbiter-glow').value = this.orbiters.settings.glow * 100;
        this.panel.querySelector('#orbiter-trail').value = this.orbiters.settings.trailLength;
        this.panel.querySelector('#orbiter-trigger-cross').checked = this.orbiters.settings.triggerOnCross;
        this.panel.querySelector('#orbiter-trigger-collide').checked = this.orbiters.settings.triggerOnCollide;

        // Update displayed values
        this.panel.querySelectorAll('.shape-slider-row').forEach(row => {
            const input = row.querySelector('input');
            const value = row.querySelector('.shape-value');
            if (input && value) {
                value.textContent = input.id === 'orbiter-trail' ? input.value : input.value + '%';
            }
        });
    }

    /**
     * Apply a mandala shape - generates alternative node positions
     */
    applyMandalaShape(shapeName) {
        if (!this.mandala) return;

        if (shapeName === 'circular') {
            // Reset to default circular mandala
            this.mandala.customNodes = null;
            this.mandala.useCustomNodes = false;
            console.log('Reset to circular mandala');
            return;
        }

        // Generate custom node positions
        const nodes = this.shapes.generateShape(
            shapeName,
            this.mandala.centerX,
            this.mandala.centerY,
            this.mandala.maxRadius,
            this.mandala.rings.length
        );

        if (nodes && nodes.length > 0) {
            this.mandala.customNodes = nodes;
            this.mandala.useCustomNodes = true;
            console.log(`Applied ${shapeName} shape with ${nodes.length} nodes`);
        }
    }
}

window.ShapePanel = ShapePanel;
