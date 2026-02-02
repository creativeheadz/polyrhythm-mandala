/**
 * Color Themes Module
 * Provides preset color palettes and a customizer for the mandala
 */

class ColorThemes {
    static THEMES = {
        'Default': {
            background: '#0a0a12',
            rings: ['#4a9eff', '#ff6b9d', '#50fa7b', '#ffb86c', '#bd93f9', '#ff5555', '#8be9fd', '#f1fa8c'],
            glow: '#6464c8',
            trigger: '#ffffff',
            connections: '#9696c8'
        },
        'Cyberpunk': {
            background: '#0d0221',
            rings: ['#ff00ff', '#00ffff', '#ff3366', '#ffff00', '#00ff00', '#ff6600', '#9933ff', '#00ffcc'],
            glow: '#ff00ff',
            trigger: '#00ffff',
            connections: '#ff00ff'
        },
        'Nature': {
            background: '#0a1a0a',
            rings: ['#228b22', '#32cd32', '#90ee90', '#8fbc8f', '#556b2f', '#6b8e23', '#9acd32', '#00ff7f'],
            glow: '#228b22',
            trigger: '#adff2f',
            connections: '#2e8b57'
        },
        'Ocean': {
            background: '#001428',
            rings: ['#006994', '#40e0d0', '#00ced1', '#20b2aa', '#5f9ea0', '#4682b4', '#87ceeb', '#b0e0e6'],
            glow: '#00ced1',
            trigger: '#e0ffff',
            connections: '#4682b4'
        },
        'Sunset': {
            background: '#1a0a0a',
            rings: ['#ff4500', '#ff6347', '#ff7f50', '#ffa500', '#ffd700', '#ff8c00', '#dc143c', '#ff1493'],
            glow: '#ff4500',
            trigger: '#ffd700',
            connections: '#ff6347'
        },
        'Monochrome': {
            background: '#0a0a0a',
            rings: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#d0d0d0', '#b0b0b0'],
            glow: '#ffffff',
            trigger: '#ffffff',
            connections: '#808080'
        },
        'Chakra': {
            background: '#0a0510',
            rings: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00bfff', '#4b0082', '#9400d3', '#ff1493'],
            glow: '#9400d3',
            trigger: '#ffffff',
            connections: '#8a2be2'
        },
        'Aurora': {
            background: '#050a14',
            rings: ['#00ff87', '#00e5ff', '#a855f7', '#ec4899', '#14b8a6', '#06b6d4', '#8b5cf6', '#22c55e'],
            glow: '#00ff87',
            trigger: '#e0ffff',
            connections: '#06b6d4'
        },
        'Lava': {
            background: '#140500',
            rings: ['#ff0000', '#ff4400', '#ff6600', '#ff8800', '#ffaa00', '#cc0000', '#ee2200', '#ff3300'],
            glow: '#ff4400',
            trigger: '#ffcc00',
            connections: '#aa0000'
        },
        'Ice': {
            background: '#050a14',
            rings: ['#e0ffff', '#b0e0e6', '#87ceeb', '#add8e6', '#b0c4de', '#a0d2db', '#cae4ed', '#d4f1f9'],
            glow: '#e0ffff',
            trigger: '#ffffff',
            connections: '#87ceeb'
        },
        'Neon': {
            background: '#000000',
            rings: ['#39ff14', '#ff073a', '#00f7ff', '#ff00ff', '#ffff00', '#ff6600', '#7b00ff', '#00ff00'],
            glow: '#39ff14',
            trigger: '#ffffff',
            connections: '#ff00ff'
        },
        'Pastel': {
            background: '#1a1a2e',
            rings: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba', '#ffdfba', '#e0bbe4', '#957dad', '#d291bc'],
            glow: '#e0bbe4',
            trigger: '#ffffff',
            connections: '#d291bc'
        }
    };

    constructor() {
        this.currentTheme = 'Default';
        this.customTheme = null;
        this.onThemeChange = null; // Callback for theme changes
    }

    /**
     * Get available theme names
     */
    static getThemeNames() {
        return Object.keys(ColorThemes.THEMES);
    }

    /**
     * Get a theme by name
     */
    static getTheme(name) {
        return ColorThemes.THEMES[name] || ColorThemes.THEMES['Default'];
    }

    /**
     * Apply a theme to the app
     */
    applyTheme(themeName, mandala, background) {
        const theme = ColorThemes.THEMES[themeName];
        if (!theme) return false;

        this.currentTheme = themeName;

        // Apply background color
        document.body.style.backgroundColor = theme.background;

        // Apply colors to mandala rings
        if (mandala && mandala.rings) {
            mandala.rings.forEach((ring, index) => {
                const colorIndex = index % theme.rings.length;
                ring.color = theme.rings[colorIndex];
                ring.nodes.forEach(node => {
                    node.color = theme.rings[colorIndex];
                });
            });

            // Store theme colors for mandala effects
            mandala.themeColors = {
                glow: theme.glow,
                trigger: theme.trigger,
                connections: theme.connections
            };
        }

        // Apply to background circles
        if (background && background.circles) {
            const bgColors = theme.rings.map(hex => this.hexToHsl(hex));
            background.circles.forEach((circle, index) => {
                const colorIndex = index % bgColors.length;
                circle.color = bgColors[colorIndex];
            });
        }

        // Trigger callback if set
        if (this.onThemeChange) {
            this.onThemeChange(themeName, theme);
        }

        return true;
    }

    /**
     * Create a custom theme from user colors
     */
    createCustomTheme(colors) {
        this.customTheme = {
            background: colors.background || '#0a0a12',
            rings: colors.rings || ColorThemes.THEMES['Default'].rings,
            glow: colors.glow || colors.rings?.[0] || '#6464c8',
            trigger: colors.trigger || '#ffffff',
            connections: colors.connections || '#9696c8'
        };

        // Add to themes temporarily
        ColorThemes.THEMES['Custom'] = this.customTheme;
        return this.customTheme;
    }

    /**
     * Convert hex color to HSL object
     */
    hexToHsl(hex) {
        // Remove # if present
        hex = hex.replace('#', '');

        const r = parseInt(hex.substring(0, 2), 16) / 255;
        const g = parseInt(hex.substring(2, 4), 16) / 255;
        const b = parseInt(hex.substring(4, 6), 16) / 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    /**
     * Get contrasting text color for a background
     */
    getContrastColor(hexColor) {
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }
}

window.ColorThemes = ColorThemes;
