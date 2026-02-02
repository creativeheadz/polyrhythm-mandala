/**
 * Isochronic Tones Generator
 * Creates pulsing tones for brainwave entrainment
 *
 * Brainwave Frequencies:
 * - Delta (1-4 Hz): Deep sleep, healing, unconscious mind
 * - Theta (4-8 Hz): Meditation, creativity, intuition, REM sleep
 * - Alpha (8-12 Hz): Relaxation, calm focus, stress reduction
 * - Beta (12-30 Hz): Active thinking, focus, alertness
 * - Gamma (30-50 Hz): Higher cognition, peak awareness, insight
 */

class IsochronicTones {
    // Brainwave preset configurations
    static PRESETS = {
        'Deep Sleep (Delta)': { pulseRate: 2, carrierFreq: 100, description: 'Deep relaxation, healing sleep' },
        'Light Sleep (Delta)': { pulseRate: 3.5, carrierFreq: 120, description: 'Light restorative sleep' },
        'Deep Meditation (Theta)': { pulseRate: 4.5, carrierFreq: 150, description: 'Deep meditation, intuition' },
        'Creativity (Theta)': { pulseRate: 6, carrierFreq: 180, description: 'Creative flow, visualization' },
        'Light Meditation (Theta)': { pulseRate: 7.5, carrierFreq: 200, description: 'Light meditation, relaxation' },
        'Relaxed Focus (Alpha)': { pulseRate: 10, carrierFreq: 220, description: 'Calm alertness, learning' },
        'Stress Relief (Alpha)': { pulseRate: 8.5, carrierFreq: 200, description: 'Anxiety reduction, calm' },
        'Super Learning (Alpha)': { pulseRate: 11, carrierFreq: 250, description: 'Enhanced memory, absorption' },
        'Active Focus (Beta)': { pulseRate: 15, carrierFreq: 300, description: 'Concentration, productivity' },
        'High Energy (Beta)': { pulseRate: 20, carrierFreq: 350, description: 'Alertness, active thinking' },
        'Problem Solving (Beta)': { pulseRate: 18, carrierFreq: 320, description: 'Analytical thinking' },
        'Peak Performance (Gamma)': { pulseRate: 40, carrierFreq: 400, description: 'Insight, high cognition' },
        'Flow State (Gamma)': { pulseRate: 38, carrierFreq: 380, description: 'Peak awareness, presence' },
        'Custom': { pulseRate: 10, carrierFreq: 200, description: 'Custom settings' }
    };

    // Brainwave ranges for reference
    static BRAINWAVES = {
        delta: { min: 1, max: 4, label: 'Delta', color: '#8b5cf6' },
        theta: { min: 4, max: 8, label: 'Theta', color: '#06b6d4' },
        alpha: { min: 8, max: 12, label: 'Alpha', color: '#22c55e' },
        beta: { min: 12, max: 30, label: 'Beta', color: '#eab308' },
        gamma: { min: 30, max: 50, label: 'Gamma', color: '#ef4444' }
    };

    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.volume = 0.3;
        this.pulseRate = 10; // Hz - the entrainment frequency
        this.carrierFrequency = 200; // Hz - the audible tone frequency
        this.waveform = 'sine';
        this.currentPreset = 'Relaxed Focus (Alpha)';

        // Tone.js nodes
        this.oscillator = null;
        this.tremolo = null;
        this.gain = null;
        this.filter = null;
    }

    async init(masterGain) {
        if (this.isInitialized) return;

        this.masterGain = masterGain;

        // Create the signal chain:
        // Oscillator -> Filter -> Tremolo (creates the pulsing) -> Gain -> Master

        // Main gain for volume control
        this.gain = new Tone.Gain(0).connect(masterGain);

        // Low-pass filter to soften the tone
        this.filter = new Tone.Filter({
            frequency: 1000,
            type: 'lowpass',
            rolloff: -12
        }).connect(this.gain);

        // Tremolo creates the isochronic pulsing effect
        // The frequency of the tremolo IS the entrainment frequency
        this.tremolo = new Tone.Tremolo({
            frequency: this.pulseRate,
            depth: 1, // Full depth for true on/off pulsing
            spread: 0,
            type: 'square' // Square wave for sharp on/off (isochronic style)
        }).connect(this.filter);
        this.tremolo.start();

        // Carrier oscillator - the tone that gets pulsed
        this.oscillator = new Tone.Oscillator({
            frequency: this.carrierFrequency,
            type: this.waveform
        }).connect(this.tremolo);

        this.isInitialized = true;
        console.log('Isochronic tones module initialized');
    }

    /**
     * Start playing isochronic tones
     */
    start() {
        if (!this.isInitialized || this.isPlaying) return;

        this.oscillator.start();
        this.gain.gain.rampTo(this.volume, 0.5);
        this.isPlaying = true;
        console.log(`Isochronic tones started: ${this.pulseRate}Hz pulse, ${this.carrierFrequency}Hz carrier`);
    }

    /**
     * Stop playing isochronic tones
     */
    stop() {
        if (!this.isInitialized || !this.isPlaying) return;

        this.gain.gain.rampTo(0, 0.5);
        setTimeout(() => {
            if (this.oscillator) {
                this.oscillator.stop();
            }
            this.isPlaying = false;
        }, 500);
        console.log('Isochronic tones stopped');
    }

    /**
     * Set the pulse rate (entrainment frequency)
     * @param {number} rate - Frequency in Hz (1-50)
     */
    setPulseRate(rate) {
        this.pulseRate = Math.max(1, Math.min(50, rate));
        if (this.tremolo) {
            this.tremolo.frequency.rampTo(this.pulseRate, 0.1);
        }
    }

    /**
     * Set the carrier frequency (the audible tone)
     * @param {number} freq - Frequency in Hz (50-500)
     */
    setCarrierFrequency(freq) {
        this.carrierFrequency = Math.max(50, Math.min(500, freq));
        if (this.oscillator) {
            this.oscillator.frequency.rampTo(this.carrierFrequency, 0.1);
        }
    }

    /**
     * Set volume
     * @param {number} vol - Volume 0-1
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.gain && this.isPlaying) {
            this.gain.gain.rampTo(this.volume, 0.1);
        }
    }

    /**
     * Set waveform type
     * @param {string} type - 'sine', 'triangle', 'square', 'sawtooth'
     */
    setWaveform(type) {
        this.waveform = type;
        if (this.oscillator) {
            this.oscillator.type = type;
        }
    }

    /**
     * Set pulse shape (tremolo waveform)
     * @param {string} shape - 'square' for sharp isochronic, 'sine' for smoother
     */
    setPulseShape(shape) {
        if (this.tremolo) {
            this.tremolo.type = shape;
        }
    }

    /**
     * Load a preset configuration
     * @param {string} presetName - Name of the preset
     */
    loadPreset(presetName) {
        const preset = IsochronicTones.PRESETS[presetName];
        if (!preset) return;

        this.currentPreset = presetName;
        this.setPulseRate(preset.pulseRate);
        this.setCarrierFrequency(preset.carrierFreq);
    }

    /**
     * Get current brainwave band based on pulse rate
     */
    getCurrentBrainwave() {
        const rate = this.pulseRate;
        for (const [key, band] of Object.entries(IsochronicTones.BRAINWAVES)) {
            if (rate >= band.min && rate < band.max) {
                return { key, ...band };
            }
        }
        if (rate >= 30) return { key: 'gamma', ...IsochronicTones.BRAINWAVES.gamma };
        return { key: 'delta', ...IsochronicTones.BRAINWAVES.delta };
    }

    /**
     * Get all preset names
     */
    static getPresetNames() {
        return Object.keys(IsochronicTones.PRESETS);
    }

    /**
     * Get preset info
     */
    static getPresetInfo(name) {
        return IsochronicTones.PRESETS[name];
    }

    /**
     * Dispose of all audio nodes
     */
    dispose() {
        this.stop();
        this.oscillator?.dispose();
        this.tremolo?.dispose();
        this.filter?.dispose();
        this.gain?.dispose();
    }
}

window.IsochronicTones = IsochronicTones;
