/**
 * Ambient Panel - UI for controlling ambient soundscapes
 */

class AmbientPanel {
    constructor(ambientSoundscapes) {
        this.ambient = ambientSoundscapes;
        this.isOpen = false;

        this.createPanel();
        this.bindEvents();
    }

    createPanel() {
        const appElement = document.getElementById('app');

        // Create toggle button
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'ambient-toggle';
        this.toggleBtn.textContent = '\u{1F3B5}'; // Musical note emoji
        this.toggleBtn.title = 'Ambient Soundscapes';
        appElement.appendChild(this.toggleBtn);

        // Create panel
        this.panel = document.createElement('div');
        this.panel.id = 'ambient-panel';
        this.panel.className = 'collapsed';

        const soundscapes = AmbientSoundscapes.getSoundscapeNames();

        // Group by type
        const noiseScapes = soundscapes.filter(name =>
            AmbientSoundscapes.getSoundscapeInfo(name).type === 'noise'
        );
        const droneScapes = soundscapes.filter(name =>
            AmbientSoundscapes.getSoundscapeInfo(name).type === 'drone'
        );

        this.panel.innerHTML = `
            <div class="ambient-content">
                <div class="ambient-header">
                    <h3>Ambient Soundscapes</h3>
                    <span class="ambient-subtitle">Layerable background sounds</span>
                </div>

                <div class="ambient-section">
                    <h4>Master Volume</h4>
                    <div class="ambient-slider-row">
                        <input type="range" id="ambient-volume" min="0" max="100" value="50">
                        <span class="ambient-value" id="ambient-volume-value">50%</span>
                    </div>
                </div>

                <div class="ambient-section">
                    <h4>Nature Sounds</h4>
                    <div class="ambient-grid">
                        ${noiseScapes.map(name => this.createSoundscapeButton(name)).join('')}
                    </div>
                </div>

                <div class="ambient-section">
                    <h4>Drones & Tones</h4>
                    <div class="ambient-grid">
                        ${droneScapes.map(name => this.createSoundscapeButton(name)).join('')}
                    </div>
                </div>

                <div class="ambient-section">
                    <h4>Active Layers</h4>
                    <div class="active-layers" id="active-layers">
                        <span class="no-layers">No layers active</span>
                    </div>
                </div>

                <div class="ambient-actions">
                    <button id="ambient-stop-all" class="ambient-action-btn">Stop All</button>
                </div>

                <div class="ambient-info">
                    <p>Layer multiple sounds together for a rich ambient experience.</p>
                </div>
            </div>
        `;

        appElement.appendChild(this.panel);
    }

    createSoundscapeButton(name) {
        const info = AmbientSoundscapes.getSoundscapeInfo(name);
        const icon = info.type === 'noise' ? this.getNoiseIcon(name) : this.getDroneIcon(name);

        return `
            <button class="soundscape-btn" data-soundscape="${name}" title="${info.description}">
                <span class="soundscape-icon">${icon}</span>
                <span class="soundscape-name">${name}</span>
            </button>
        `;
    }

    getNoiseIcon(name) {
        const icons = {
            'Rain': '\u{1F327}',
            'Ocean Waves': '\u{1F30A}',
            'Wind': '\u{1F4A8}',
            'Forest': '\u{1F332}'
        };
        return icons[name] || '\u{1F3B5}';
    }

    getDroneIcon(name) {
        const icons = {
            'Deep Drone': '\u{1F534}',
            'Om Drone': '\u{1F549}',
            'Celestial Pad': '\u{2728}',
            'Crystal Bowl': '\u{1F514}',
            'Binaural Base': '\u{1F7E2}',
            'Tibetan Bowl': '\u{1F514}'
        };
        return icons[name] || '\u{1F3B6}';
    }

    bindEvents() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', () => this.togglePanel());

        // Soundscape buttons
        this.panel.querySelectorAll('.soundscape-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const name = btn.dataset.soundscape;
                this.ambient.toggleLayer(name);
                btn.classList.toggle('active', this.ambient.isLayerActive(name));
                this.updateActiveLayers();
            });
        });

        // Volume slider
        const volumeSlider = this.panel.querySelector('#ambient-volume');
        const volumeValue = this.panel.querySelector('#ambient-volume-value');
        volumeSlider.addEventListener('input', (e) => {
            this.ambient.setMasterVolume(e.target.value / 100);
            volumeValue.textContent = e.target.value + '%';
        });

        // Stop all button
        this.panel.querySelector('#ambient-stop-all').addEventListener('click', () => {
            this.ambient.stopAll();
            this.panel.querySelectorAll('.soundscape-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.updateActiveLayers();
        });
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
        this.toggleBtn.classList.toggle('open', this.isOpen);
    }

    updateActiveLayers() {
        const container = this.panel.querySelector('#active-layers');
        const active = this.ambient.getActiveLayers();

        if (active.length === 0) {
            container.innerHTML = '<span class="no-layers">No layers active</span>';
        } else {
            container.innerHTML = active.map(name => `
                <span class="active-layer-tag">${name}</span>
            `).join('');
        }
    }
}

window.AmbientPanel = AmbientPanel;
