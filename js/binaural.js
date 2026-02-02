/**
 * Binaural Beats Generator
 * Creates stereo beats for brainwave entrainment (requires headphones)
 *
 * How it works:
 * - Two slightly different frequencies are played in each ear
 * - The brain perceives a "beat" at the difference frequency
 * - Example: 200Hz in left ear, 210Hz in right ear = 10Hz perceived beat (Alpha)
 */

class BinauralBeats {
    // Use same brainwave presets as isochronic
    static PRESETS = {
        'Deep Sleep (Delta)': { beatFreq: 2, baseFreq: 100, description: 'Deep relaxation, healing' },
        'Light Sleep (Delta)': { beatFreq: 3.5, baseFreq: 120, description: 'Light restorative sleep' },
        'Deep Meditation (Theta)': { beatFreq: 4.5, baseFreq: 150, description: 'Deep meditation' },
        'Creativity (Theta)': { beatFreq: 6, baseFreq: 180, description: 'Creative flow' },
        'Light Meditation (Theta)': { beatFreq: 7.5, baseFreq: 200, description: 'Relaxation' },
        'Relaxed Focus (Alpha)': { beatFreq: 10, baseFreq: 220, description: 'Calm alertness' },
        'Stress Relief (Alpha)': { beatFreq: 8.5, baseFreq: 200, description: 'Anxiety reduction' },
        'Super Learning (Alpha)': { beatFreq: 11, baseFreq: 250, description: 'Enhanced memory' },
        'Active Focus (Beta)': { beatFreq: 15, baseFreq: 300, description: 'Concentration' },
        'High Energy (Beta)': { beatFreq: 20, baseFreq: 350, description: 'Alertness' },
        'Problem Solving (Beta)': { beatFreq: 18, baseFreq: 320, description: 'Analytical thinking' },
        'Peak Performance (Gamma)': { beatFreq: 40, baseFreq: 400, description: 'High cognition' },
        'Flow State (Gamma)': { beatFreq: 38, baseFreq: 380, description: 'Peak awareness' },
        'Custom': { beatFreq: 10, baseFreq: 200, description: 'Custom settings' }
    };

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
        this.beatFrequency = 10; // Hz - the binaural beat frequency
        this.baseFrequency = 200; // Hz - the carrier frequency
        this.waveform = 'sine';
        this.currentPreset = 'Relaxed Focus (Alpha)';

        // Tone.js nodes
        this.leftOsc = null;
        this.rightOsc = null;
        this.leftGain = null;
        this.rightGain = null;
        this.leftPanner = null;
        this.rightPanner = null;
        this.masterGain = null;
    }

    async init(masterGain) {
        if (this.isInitialized) return;

        this.masterOut = masterGain;

        // Create stereo signal chain
        // Left channel: baseFreq - beatFreq/2
        // Right channel: baseFreq + beatFreq/2
        // This creates the perception of beatFreq in the brain

        // Master gain for binaural
        this.masterGain = new Tone.Gain(0).connect(masterGain);

        // Left channel
        this.leftPanner = new Tone.Panner(-1).connect(this.masterGain);
        this.leftGain = new Tone.Gain(1).connect(this.leftPanner);
        this.leftOsc = new Tone.Oscillator({
            frequency: this.baseFrequency - this.beatFrequency / 2,
            type: this.waveform
        }).connect(this.leftGain);

        // Right channel
        this.rightPanner = new Tone.Panner(1).connect(this.masterGain);
        this.rightGain = new Tone.Gain(1).connect(this.rightPanner);
        this.rightOsc = new Tone.Oscillator({
            frequency: this.baseFrequency + this.beatFrequency / 2,
            type: this.waveform
        }).connect(this.rightGain);

        this.isInitialized = true;
        console.log('Binaural beats module initialized');
    }

    /**
     * Start playing binaural beats
     */
    start() {
        if (!this.isInitialized || this.isPlaying) return;

        this.leftOsc.start();
        this.rightOsc.start();
        this.masterGain.gain.rampTo(this.volume, 0.5);
        this.isPlaying = true;

        const leftFreq = this.baseFrequency - this.beatFrequency / 2;
        const rightFreq = this.baseFrequency + this.beatFrequency / 2;
        console.log(`Binaural beats started: ${leftFreq}Hz (L) / ${rightFreq}Hz (R) = ${this.beatFrequency}Hz beat`);
    }

    /**
     * Stop playing binaural beats
     */
    stop() {
        if (!this.isInitialized || !this.isPlaying) return;

        this.masterGain.gain.rampTo(0, 0.5);
        setTimeout(() => {
            this.leftOsc?.stop();
            this.rightOsc?.stop();
            this.isPlaying = false;
        }, 500);
        console.log('Binaural beats stopped');
    }

    /**
     * Set the beat frequency (entrainment frequency)
     * @param {number} freq - Frequency in Hz (1-50)
     */
    setBeatFrequency(freq) {
        this.beatFrequency = Math.max(1, Math.min(50, freq));
        this.updateOscillatorFrequencies();
    }

    /**
     * Set the base/carrier frequency
     * @param {number} freq - Frequency in Hz (50-500)
     */
    setBaseFrequency(freq) {
        this.baseFrequency = Math.max(50, Math.min(500, freq));
        this.updateOscillatorFrequencies();
    }

    /**
     * Update oscillator frequencies based on current settings
     */
    updateOscillatorFrequencies() {
        if (!this.leftOsc || !this.rightOsc) return;

        const leftFreq = this.baseFrequency - this.beatFrequency / 2;
        const rightFreq = this.baseFrequency + this.beatFrequency / 2;

        this.leftOsc.frequency.rampTo(leftFreq, 0.1);
        this.rightOsc.frequency.rampTo(rightFreq, 0.1);
    }

    /**
     * Set volume
     * @param {number} vol - Volume 0-1
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain && this.isPlaying) {
            this.masterGain.gain.rampTo(this.volume, 0.1);
        }
    }

    /**
     * Set waveform type
     * @param {string} type - 'sine', 'triangle'
     */
    setWaveform(type) {
        this.waveform = type;
        if (this.leftOsc) this.leftOsc.type = type;
        if (this.rightOsc) this.rightOsc.type = type;
    }

    /**
     * Load a preset configuration
     * @param {string} presetName - Name of the preset
     */
    loadPreset(presetName) {
        const preset = BinauralBeats.PRESETS[presetName];
        if (!preset) return;

        this.currentPreset = presetName;
        this.setBeatFrequency(preset.beatFreq);
        this.setBaseFrequency(preset.baseFreq);
    }

    /**
     * Get current brainwave band based on beat frequency
     */
    getCurrentBrainwave() {
        const freq = this.beatFrequency;
        for (const [key, band] of Object.entries(BinauralBeats.BRAINWAVES)) {
            if (freq >= band.min && freq < band.max) {
                return { key, ...band };
            }
        }
        if (freq >= 30) return { key: 'gamma', ...BinauralBeats.BRAINWAVES.gamma };
        return { key: 'delta', ...BinauralBeats.BRAINWAVES.delta };
    }

    /**
     * Get all preset names
     */
    static getPresetNames() {
        return Object.keys(BinauralBeats.PRESETS);
    }

    /**
     * Get preset info
     */
    static getPresetInfo(name) {
        return BinauralBeats.PRESETS[name];
    }

    /**
     * Dispose of all audio nodes
     */
    dispose() {
        this.stop();
        this.leftOsc?.dispose();
        this.rightOsc?.dispose();
        this.leftGain?.dispose();
        this.rightGain?.dispose();
        this.leftPanner?.dispose();
        this.rightPanner?.dispose();
        this.masterGain?.dispose();
    }
}

window.BinauralBeats = BinauralBeats;
