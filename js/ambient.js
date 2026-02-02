/**
 * Ambient Soundscapes Module
 * Provides layerable background sounds: nature, drones, textures
 */

class AmbientSoundscapes {
    // Pre-defined ambient sounds using synthesis
    static SOUNDSCAPES = {
        'Rain': {
            type: 'noise',
            noiseType: 'pink',
            filter: { type: 'lowpass', frequency: 2000, Q: 1 },
            volume: -15,
            description: 'Gentle rainfall'
        },
        'Ocean Waves': {
            type: 'noise',
            noiseType: 'brown',
            filter: { type: 'lowpass', frequency: 800, Q: 0.5 },
            modulation: { type: 'lfo', rate: 0.1, depth: 0.3 },
            volume: -12,
            description: 'Rolling ocean waves'
        },
        'Wind': {
            type: 'noise',
            noiseType: 'white',
            filter: { type: 'bandpass', frequency: 1000, Q: 2 },
            modulation: { type: 'lfo', rate: 0.05, depth: 0.5 },
            volume: -18,
            description: 'Soft wind'
        },
        'Forest': {
            type: 'noise',
            noiseType: 'pink',
            filter: { type: 'highpass', frequency: 500, Q: 0.5 },
            volume: -20,
            description: 'Forest ambience'
        },
        'Deep Drone': {
            type: 'drone',
            frequency: 55,
            waveform: 'sine',
            harmonics: [1, 0.5, 0.25],
            volume: -10,
            description: 'Low meditative drone'
        },
        'Om Drone': {
            type: 'drone',
            frequency: 136.1, // Om frequency
            waveform: 'sine',
            harmonics: [1, 0.3, 0.15, 0.08],
            volume: -12,
            description: 'Sacred Om frequency (136.1 Hz)'
        },
        'Celestial Pad': {
            type: 'drone',
            frequency: 220,
            waveform: 'triangle',
            harmonics: [1, 0.4, 0.2],
            detune: 5,
            volume: -15,
            description: 'Ethereal pad texture'
        },
        'Crystal Bowl': {
            type: 'drone',
            frequency: 396, // Solfeggio frequency
            waveform: 'sine',
            harmonics: [1, 0.6, 0.3, 0.15],
            volume: -14,
            description: 'Singing bowl resonance'
        },
        'Binaural Base': {
            type: 'drone',
            frequency: 100,
            waveform: 'sine',
            harmonics: [1],
            volume: -16,
            description: 'Clean base for binaural'
        },
        'Tibetan Bowl': {
            type: 'drone',
            frequency: 528, // Solfeggio frequency
            waveform: 'sine',
            harmonics: [1, 0.5, 0.25, 0.12],
            volume: -14,
            description: 'Healing 528 Hz frequency'
        }
    };

    constructor() {
        this.isInitialized = false;
        this.activeLayers = new Map(); // Track active soundscapes
        this.masterVolume = 0.5;
        this.masterGain = null;
    }

    async init(outputGain) {
        if (this.isInitialized) return;

        this.outputGain = outputGain;

        // Master gain for all ambient sounds
        this.masterGain = new Tone.Gain(this.masterVolume).connect(outputGain);

        this.isInitialized = true;
        console.log('Ambient soundscapes module initialized');
    }

    /**
     * Start a soundscape layer
     */
    startLayer(name) {
        if (!this.isInitialized) return false;
        if (this.activeLayers.has(name)) return false; // Already playing

        const config = AmbientSoundscapes.SOUNDSCAPES[name];
        if (!config) return false;

        let layer;

        if (config.type === 'noise') {
            layer = this.createNoiseLayer(config);
        } else if (config.type === 'drone') {
            layer = this.createDroneLayer(config);
        }

        if (layer) {
            this.activeLayers.set(name, layer);
            // Fade in
            layer.gain.gain.rampTo(Tone.dbToGain(config.volume) * this.masterVolume, 2);
            console.log(`Started ambient layer: ${name}`);
            return true;
        }

        return false;
    }

    /**
     * Stop a soundscape layer
     */
    stopLayer(name) {
        const layer = this.activeLayers.get(name);
        if (!layer) return false;

        // Fade out
        layer.gain.gain.rampTo(0, 2);

        setTimeout(() => {
            layer.sources.forEach(source => {
                try { source.stop(); } catch (e) {}
                source.dispose();
            });
            layer.nodes.forEach(node => node.dispose());
            layer.gain.dispose();
            this.activeLayers.delete(name);
        }, 2100);

        console.log(`Stopped ambient layer: ${name}`);
        return true;
    }

    /**
     * Toggle a soundscape layer
     */
    toggleLayer(name) {
        if (this.activeLayers.has(name)) {
            return this.stopLayer(name);
        } else {
            return this.startLayer(name);
        }
    }

    /**
     * Create a noise-based soundscape
     */
    createNoiseLayer(config) {
        const gain = new Tone.Gain(0).connect(this.masterGain);
        const nodes = [];
        const sources = [];

        // Create noise source
        const noise = new Tone.Noise(config.noiseType);
        sources.push(noise);

        // Create filter
        const filter = new Tone.Filter({
            type: config.filter.type,
            frequency: config.filter.frequency,
            Q: config.filter.Q
        });
        nodes.push(filter);

        // Connect: noise -> filter -> gain
        noise.connect(filter);
        filter.connect(gain);

        // Add modulation if specified (for waves/wind effect)
        if (config.modulation) {
            const lfo = new Tone.LFO({
                frequency: config.modulation.rate,
                min: config.filter.frequency * (1 - config.modulation.depth),
                max: config.filter.frequency * (1 + config.modulation.depth)
            });
            lfo.connect(filter.frequency);
            lfo.start();
            nodes.push(lfo);
        }

        noise.start();

        return { gain, nodes, sources };
    }

    /**
     * Create a drone-based soundscape
     */
    createDroneLayer(config) {
        const gain = new Tone.Gain(0).connect(this.masterGain);
        const nodes = [];
        const sources = [];

        // Create oscillators for each harmonic
        config.harmonics.forEach((amplitude, index) => {
            const freq = config.frequency * (index + 1);
            const osc = new Tone.Oscillator({
                frequency: freq + (config.detune || 0) * (index > 0 ? 1 : 0),
                type: config.waveform
            });

            const oscGain = new Tone.Gain(amplitude);
            osc.connect(oscGain);
            oscGain.connect(gain);

            sources.push(osc);
            nodes.push(oscGain);
            osc.start();
        });

        // Add subtle chorus/detune for richness
        if (config.detune) {
            const osc2 = new Tone.Oscillator({
                frequency: config.frequency - config.detune,
                type: config.waveform
            });
            const osc2Gain = new Tone.Gain(0.3);
            osc2.connect(osc2Gain);
            osc2Gain.connect(gain);
            sources.push(osc2);
            nodes.push(osc2Gain);
            osc2.start();
        }

        return { gain, nodes, sources };
    }

    /**
     * Set master volume for all ambient sounds
     */
    setMasterVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.rampTo(this.masterVolume, 0.1);
        }
    }

    /**
     * Get list of active layers
     */
    getActiveLayers() {
        return Array.from(this.activeLayers.keys());
    }

    /**
     * Check if a layer is active
     */
    isLayerActive(name) {
        return this.activeLayers.has(name);
    }

    /**
     * Stop all layers
     */
    stopAll() {
        for (const name of this.activeLayers.keys()) {
            this.stopLayer(name);
        }
    }

    /**
     * Get soundscape names
     */
    static getSoundscapeNames() {
        return Object.keys(AmbientSoundscapes.SOUNDSCAPES);
    }

    /**
     * Get soundscape info
     */
    static getSoundscapeInfo(name) {
        return AmbientSoundscapes.SOUNDSCAPES[name];
    }

    /**
     * Dispose
     */
    dispose() {
        this.stopAll();
        this.masterGain?.dispose();
    }
}

window.AmbientSoundscapes = AmbientSoundscapes;
