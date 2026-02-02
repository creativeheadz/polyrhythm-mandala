/**
 * Color Themes Panel UI
 * Provides interface for selecting and customizing color themes
 */

class ColorThemesPanel {
    constructor(colorThemes, mandala, background) {
        this.colorThemes = colorThemes;
        this.mandala = mandala;
        this.background = background;
        this.isOpen = false;

        this.createPanel();
        this.setupEventListeners();
    }

    createPanel() {
        const appElement = document.getElementById('app');

        // Create toggle button (separate from panel for visibility)
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'theme-toggle';
        this.toggleBtn.textContent = '\u{1F3A8}'; // Palette emoji
        this.toggleBtn.title = 'Color Themes';
        appElement.appendChild(this.toggleBtn);

        // Create panel
        this.panel = document.createElement('div');
        this.panel.id = 'theme-panel';
        this.panel.className = 'collapsed';
        this.panel.innerHTML = `
            <div class="theme-content">
                <div class="theme-header">
                    <h3>Color Themes</h3>
                    <span class="theme-subtitle">Visual palette customization</span>
                </div>

                <div class="theme-section">
                    <h4>Preset Themes</h4>
                    <div class="theme-grid" id="theme-grid">
                        ${this.createThemeButtons()}
                    </div>
                </div>

                <div class="theme-section">
                    <h4>Current: <span id="current-theme-name">Default</span></h4>
                    <div class="theme-preview" id="theme-preview">
                        ${this.createThemePreview('Default')}
                    </div>
                </div>

                <div class="theme-section">
                    <h4>Custom Colors</h4>
                    <div class="custom-colors">
                        <div class="color-picker-row">
                            <label>Background</label>
                            <input type="color" id="custom-bg-color" value="#0a0a12">
                        </div>
                        <div class="color-picker-row">
                            <label>Primary</label>
                            <input type="color" id="custom-primary-color" value="#4a9eff">
                        </div>
                        <div class="color-picker-row">
                            <label>Secondary</label>
                            <input type="color" id="custom-secondary-color" value="#ff6b9d">
                        </div>
                        <div class="color-picker-row">
                            <label>Accent</label>
                            <input type="color" id="custom-accent-color" value="#50fa7b">
                        </div>
                        <button class="apply-custom-btn" id="apply-custom-theme">Apply Custom</button>
                    </div>
                </div>

                <div class="theme-info">
                    <p>Themes affect mandala nodes, background circles, and glow effects.</p>
                </div>
            </div>
        `;

        appElement.appendChild(this.panel);
    }

    createThemeButtons() {
        const themes = ColorThemes.getThemeNames();
        return themes.map(name => {
            const theme = ColorThemes.getTheme(name);
            const previewColors = theme.rings.slice(0, 4).map(c =>
                `<span class="color-dot" style="background: ${c}"></span>`
            ).join('');

            return `
                <button class="theme-btn ${name === 'Default' ? 'active' : ''}"
                        data-theme="${name}"
                        title="${name}">
                    <div class="theme-btn-colors">${previewColors}</div>
                    <span class="theme-btn-name">${name}</span>
                </button>
            `;
        }).join('');
    }

    createThemePreview(themeName) {
        const theme = ColorThemes.getTheme(themeName);
        return `
            <div class="preview-bg" style="background: ${theme.background}">
                ${theme.rings.slice(0, 6).map((color, i) => `
                    <div class="preview-ring" style="
                        border-color: ${color};
                        width: ${80 - i * 12}px;
                        height: ${80 - i * 12}px;
                    "></div>
                `).join('')}
                <div class="preview-glow" style="background: ${theme.glow}"></div>
            </div>
        `;
    }

    setupEventListeners() {
        // Toggle panel
        this.toggleBtn.addEventListener('click', () => this.togglePanel());

        // Theme buttons
        this.panel.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const themeName = e.currentTarget.dataset.theme;
                this.selectTheme(themeName);
            });
        });

        // Custom theme apply button
        const applyBtn = this.panel.querySelector('#apply-custom-theme');
        applyBtn.addEventListener('click', () => this.applyCustomTheme());

        // Custom color pickers - live preview
        ['custom-bg-color', 'custom-primary-color', 'custom-secondary-color', 'custom-accent-color'].forEach(id => {
            const picker = this.panel.querySelector(`#${id}`);
            picker.addEventListener('input', () => this.updateCustomPreview());
        });
    }

    togglePanel() {
        this.isOpen = !this.isOpen;
        this.panel.classList.toggle('collapsed', !this.isOpen);
        this.toggleBtn.classList.toggle('open', this.isOpen);
    }

    selectTheme(themeName) {
        // Update active button
        this.panel.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });

        // Update preview
        const preview = this.panel.querySelector('#theme-preview');
        preview.innerHTML = this.createThemePreview(themeName);

        // Update name display
        this.panel.querySelector('#current-theme-name').textContent = themeName;

        // Apply theme
        this.colorThemes.applyTheme(themeName, this.mandala, this.background);
    }

    applyCustomTheme() {
        const bgColor = this.panel.querySelector('#custom-bg-color').value;
        const primaryColor = this.panel.querySelector('#custom-primary-color').value;
        const secondaryColor = this.panel.querySelector('#custom-secondary-color').value;
        const accentColor = this.panel.querySelector('#custom-accent-color').value;

        // Generate a full palette from the custom colors
        const rings = this.generatePalette(primaryColor, secondaryColor, accentColor);

        this.colorThemes.createCustomTheme({
            background: bgColor,
            rings: rings,
            glow: primaryColor,
            trigger: '#ffffff',
            connections: secondaryColor
        });

        this.selectTheme('Custom');
    }

    generatePalette(primary, secondary, accent) {
        // Generate 8 colors from the 3 base colors
        return [
            primary,
            secondary,
            accent,
            this.lightenColor(primary, 20),
            this.lightenColor(secondary, 20),
            this.darkenColor(primary, 20),
            this.lightenColor(accent, 15),
            this.mixColors(primary, secondary, 0.5)
        ];
    }

    lightenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    darkenColor(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    mixColors(hex1, hex2, ratio) {
        const num1 = parseInt(hex1.replace('#', ''), 16);
        const num2 = parseInt(hex2.replace('#', ''), 16);
        const R = Math.round((num1 >> 16) * (1 - ratio) + (num2 >> 16) * ratio);
        const G = Math.round(((num1 >> 8) & 0xFF) * (1 - ratio) + ((num2 >> 8) & 0xFF) * ratio);
        const B = Math.round((num1 & 0xFF) * (1 - ratio) + (num2 & 0xFF) * ratio);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    updateCustomPreview() {
        // Could add live preview here if desired
    }
}

window.ColorThemesPanel = ColorThemesPanel;
