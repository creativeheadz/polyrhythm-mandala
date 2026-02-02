/**
 * Audio Engine - Expanded with per-ring sound configuration
 * Supports multiple synth types, waveforms, scales, and envelopes
 */

class AudioEngine {
    // Available scales
    static SCALES = {
        'Pentatonic': ['C', 'D', 'E', 'G', 'A'],
        'Major': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
        'Minor': ['C', 'D', 'Eb', 'F', 'G', 'Ab', 'Bb'],
        'Dorian': ['C', 'D', 'Eb', 'F', 'G', 'A', 'Bb'],
        'Phrygian': ['C', 'Db', 'Eb', 'F', 'G', 'Ab', 'Bb'],
        'Lydian': ['C', 'D', 'E', 'F#', 'G', 'A', 'B'],
        'Mixolydian': ['C', 'D', 'E', 'F', 'G', 'A', 'Bb'],
        'Whole Tone': ['C', 'D', 'E', 'F#', 'G#', 'A#'],
        'Blues': ['C', 'Eb', 'F', 'Gb', 'G', 'Bb'],
        'Japanese': ['C', 'Db', 'F', 'G', 'Ab'],
        'Arabic': ['C', 'Db', 'E', 'F', 'G', 'Ab', 'B'],
        'Chromatic': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    };

    // Available waveforms
    static WAVEFORMS = ['sine', 'triangle', 'square', 'sawtooth', 'fatsine', 'fattriangle', 'fatsquare', 'fatsawtooth'];

    // Synth presets with their characteristic settings
    static SYNTH_PRESETS = {
        'Bell': {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.8, sustain: 0.05, release: 1.2 },
            volume: -8
        },
        'Pad': {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.2, decay: 1.0, sustain: 0.5, release: 1.5 },
            volume: -10
        },
        'Bass': {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 0.8 },
            volume: -6
        },
        'Pluck': {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0.0, release: 0.3 },
            volume: -8
        },
        'Sparkle': {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.002, decay: 0.4, sustain: 0.02, release: 0.6 },
            volume: -12
        },
        'Organ': {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.3 },
            volume: -10
        },
        'String': {
            oscillator: { type: 'sawtooth' },
            envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 1.0 },
            volume: -12
        },
        'Brass': {
            oscillator: { type: 'square' },
            envelope: { attack: 0.05, decay: 0.2, sustain: 0.7, release: 0.4 },
            volume: -14
        },
        'Chime': {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 2.0, sustain: 0.0, release: 2.0 },
            volume: -10
        },
        'Sub': {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.02, decay: 0.8, sustain: 0.4, release: 1.0 },
            volume: -4
        }
    };

    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.masterVolume = 0.7;
        this.reverbMix = 0.4;
        this.globalScale = 'Pentatonic';

        // Per-ring synth configurations
        this.ringConfigs = [];

        // Active synths per ring
        this.ringSynths = [];

        // Active kinetic sounds for visualization
        this.kineticSounds = [];
    }

    async init() {
        if (this.isInitialized) return;

        await Tone.start();
        console.log('Audio context started, sample rate:', Tone.context.sampleRate);

        // Master chain
        this.masterGain = new Tone.Gain(this.masterVolume).toDestination();

        // Shared reverb
        this.reverb = new Tone.Reverb({
            decay: 3,
            wet: this.reverbMix,
            preDelay: 0.01
        }).connect(this.masterGain);
        await this.reverb.ready;

        // Delay for some presets
        this.delay = new Tone.FeedbackDelay({
            delayTime: '8n',
            feedback: 0.2,
            wet: 0.15
        }).connect(this.masterGain);

        this.isInitialized = true;
        this.isPlaying = true;
        console.log('Audio engine initialized with expanded sound library');
    }

    /**
     * Configure a ring's sound settings
     * @param {number} ringIndex - Which ring to configure
     * @param {Object} config - Sound configuration
     */
    setRingConfig(ringIndex, config) {
        // Dispose old synth if exists
        if (this.ringSynths[ringIndex]) {
            this.ringSynths[ringIndex].synth?.dispose();
            this.ringSynths[ringIndex].dryGain?.dispose();
            this.ringSynths[ringIndex].wetGain?.dispose();
        }

        // Store config
        this.ringConfigs[ringIndex] = {
            synthPreset: config.synthPreset || 'Bell',
            waveform: config.waveform || 'sine',
            scale: config.scale || 'Pentatonic',
            octave: config.octave ?? 4,
            attack: config.attack ?? 0.005,
            decay: config.decay ?? 0.8,
            sustain: config.sustain ?? 0.1,
            release: config.release ?? 1.0,
            volume: config.volume ?? 0.7,
            reverbSend: config.reverbSend ?? 0.3,
            delaySend: config.delaySend ?? 0,
            noteDuration: config.noteDuration || '4n',
            muted: config.muted || false
        };

        // Create new synth for this ring
        this.createRingSynth(ringIndex);
    }

    /**
     * Create a synth for a specific ring based on its config
     */
    createRingSynth(ringIndex) {
        if (!this.isInitialized) return;

        const config = this.ringConfigs[ringIndex];
        if (!config) return;

        const preset = AudioEngine.SYNTH_PRESETS[config.synthPreset] || AudioEngine.SYNTH_PRESETS['Bell'];

        // Create gains for dry and wet routing
        const dryGain = new Tone.Gain(config.volume * (1 - config.reverbSend)).connect(this.masterGain);
        const wetGain = new Tone.Gain(config.volume * config.reverbSend).connect(this.reverb);
        const delayGain = new Tone.Gain(config.volume * config.delaySend).connect(this.delay);

        // Create synth with configured settings
        const synth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 8,
            oscillator: {
                type: config.waveform || preset.oscillator.type
            },
            envelope: {
                attack: config.attack,
                decay: config.decay,
                sustain: config.sustain,
                release: config.release
            },
            volume: preset.volume
        });

        synth.connect(dryGain);
        synth.connect(wetGain);
        if (config.delaySend > 0) {
            synth.connect(delayGain);
        }

        this.ringSynths[ringIndex] = {
            synth,
            dryGain,
            wetGain,
            delayGain
        };
    }

    /**
     * Get default config for a ring based on its index
     */
    getDefaultRingConfig(ringIndex, totalRings) {
        const position = ringIndex / Math.max(1, totalRings - 1); // 0 = outer, 1 = inner

        // Vary preset based on ring position
        const presets = ['Sparkle', 'Bell', 'Pluck', 'Pad', 'String', 'Organ', 'Brass', 'Bass', 'Sub', 'Chime'];
        const presetIndex = Math.floor(position * (presets.length - 1));

        // Higher octaves for outer rings, lower for inner
        const octave = Math.round(6 - position * 4); // 6 to 2

        return {
            synthPreset: presets[presetIndex],
            waveform: 'sine',
            scale: 'Pentatonic',
            octave: octave,
            attack: 0.005 + position * 0.1,
            decay: 0.4 + position * 0.6,
            sustain: 0.1 + position * 0.3,
            release: 0.8 + position * 0.7,
            volume: 0.6,
            reverbSend: 0.2 + position * 0.3,
            delaySend: 0,
            noteDuration: position < 0.3 ? '8n' : position < 0.7 ? '4n' : '2n',
            muted: false
        };
    }

    /**
     * Initialize synths for all rings in a mandala
     */
    initializeForMandala(rings) {
        // Clear existing synths
        this.ringSynths.forEach(rs => {
            rs?.synth?.dispose();
            rs?.dryGain?.dispose();
            rs?.wetGain?.dispose();
            rs?.delayGain?.dispose();
        });
        this.ringSynths = [];
        this.ringConfigs = [];

        // Create synth for each ring
        rings.forEach((ring, index) => {
            const config = this.getDefaultRingConfig(index, rings.length);
            // Use ring's type to influence preset
            if (ring.type === 'bass') config.synthPreset = 'Bass';
            else if (ring.type === 'sparkle') config.synthPreset = 'Sparkle';
            else if (ring.type === 'atmospheric') config.synthPreset = 'Pad';
            else if (ring.type === 'melodic') config.synthPreset = 'Bell';

            this.setRingConfig(index, config);
        });
    }

    /**
     * Get a ring's current configuration
     */
    getRingConfig(ringIndex) {
        return this.ringConfigs[ringIndex] || this.getDefaultRingConfig(ringIndex, 8);
    }

    /**
     * Get all available options for the editor
     */
    static getOptions() {
        return {
            scales: Object.keys(AudioEngine.SCALES),
            waveforms: AudioEngine.WAVEFORMS,
            synthPresets: Object.keys(AudioEngine.SYNTH_PRESETS),
            noteDurations: ['16n', '8n', '4n', '2n', '1n']
        };
    }

    /**
     * Play a trigger sound for a specific ring
     */
    playTrigger(type, ringIndex, noteIndex, position = { x: 0, y: 0, z: 0 }) {
        if (!this.isInitialized || !this.isPlaying) return;

        const config = this.ringConfigs[ringIndex];
        if (!config || config.muted) return;

        const ringSynth = this.ringSynths[ringIndex];
        if (!ringSynth || !ringSynth.synth) return;

        const now = performance.now();

        // Safe position
        const safePosition = {
            x: Number.isFinite(position.x) ? position.x : 0,
            y: Number.isFinite(position.y) ? position.y : 0,
            z: Number.isFinite(position.z) ? position.z : 0
        };

        // Create trajectory for visualization
        const trajectoryTypes = ['orbital', 'spiral', 'oscillate', 'expand', 'rise'];
        const trajType = trajectoryTypes[(ringIndex + noteIndex) % trajectoryTypes.length];
        const trajectory = this.createTrajectory(trajType, safePosition, {
            duration: 1500 + ringIndex * 300,
            speed: 1 + (noteIndex % 3) * 0.3
        });

        // Store for visualization
        this.kineticSounds.push({
            trajectory,
            startTime: now,
            duration: trajectory.duration,
            type,
            ringIndex,
            pannerObj: { trajectory }
        });

        // Get scale for this ring
        const scale = AudioEngine.SCALES[config.scale] || AudioEngine.SCALES['Pentatonic'];
        const scaleIndex = noteIndex % scale.length;
        const baseNote = scale[scaleIndex];
        const octave = config.octave;
        const note = baseNote + octave;

        // Play the note
        const toneNow = Tone.now();
        ringSynth.synth.triggerAttackRelease(note, config.noteDuration, toneNow, config.volume);
    }

    // Trajectory methods (unchanged)
    createTrajectory(type, startPos, options = {}) {
        const duration = options.duration || 2000;
        const speed = options.speed || 1;

        switch (type) {
            case 'orbital':
                return {
                    type: 'orbital',
                    startAngle: Math.atan2(startPos.y, startPos.x),
                    radius: Math.sqrt(startPos.x ** 2 + startPos.y ** 2) || 1,
                    speed: speed * 0.002,
                    z: startPos.z || 0,
                    duration
                };

            case 'spiral':
                return {
                    type: 'spiral',
                    startAngle: Math.atan2(startPos.y, startPos.x),
                    startRadius: Math.sqrt(startPos.x ** 2 + startPos.y ** 2) || 1,
                    endRadius: options.endRadius || 0.2,
                    speed: speed * 0.003,
                    z: startPos.z || 0,
                    duration
                };

            case 'oscillate':
                return {
                    type: 'oscillate',
                    centerX: startPos.x,
                    centerY: startPos.y,
                    amplitude: options.amplitude || 1,
                    frequency: speed * 0.005,
                    axis: options.axis || 'x',
                    z: startPos.z || 0,
                    duration
                };

            case 'expand':
                return {
                    type: 'expand',
                    startRadius: 0.1,
                    endRadius: options.endRadius || 2,
                    angle: Math.atan2(startPos.y, startPos.x),
                    z: startPos.z || 0,
                    duration
                };

            case 'rise':
                return {
                    type: 'rise',
                    x: startPos.x,
                    y: startPos.y,
                    startZ: startPos.z || -1,
                    endZ: options.endZ || 1,
                    duration
                };

            default:
                return {
                    type: 'static',
                    x: startPos.x,
                    y: startPos.y,
                    z: startPos.z || 0,
                    duration
                };
        }
    }

    getTrajectoryPosition(trajectory, progress) {
        const t = Math.min(1, Math.max(0, progress));

        switch (trajectory.type) {
            case 'orbital': {
                const angle = trajectory.startAngle + (t * Math.PI * 2 * trajectory.speed * trajectory.duration);
                return {
                    x: Math.cos(angle) * trajectory.radius,
                    y: Math.sin(angle) * trajectory.radius,
                    z: trajectory.z
                };
            }

            case 'spiral': {
                const angle = trajectory.startAngle + (t * Math.PI * 4);
                const radius = trajectory.startRadius + (trajectory.endRadius - trajectory.startRadius) * t;
                return {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                    z: trajectory.z
                };
            }

            case 'oscillate': {
                const swing = Math.sin(t * Math.PI * 2 * trajectory.frequency * trajectory.duration) * trajectory.amplitude;
                return trajectory.axis === 'x'
                    ? { x: trajectory.centerX + swing, y: trajectory.centerY, z: trajectory.z }
                    : { x: trajectory.centerX, y: trajectory.centerY + swing, z: trajectory.z };
            }

            case 'expand': {
                const radius = trajectory.startRadius + (trajectory.endRadius - trajectory.startRadius) * t;
                return {
                    x: Math.cos(trajectory.angle) * radius,
                    y: Math.sin(trajectory.angle) * radius,
                    z: trajectory.z
                };
            }

            case 'rise': {
                return {
                    x: trajectory.x,
                    y: trajectory.y,
                    z: trajectory.startZ + (trajectory.endZ - trajectory.startZ) * t
                };
            }

            default:
                return { x: trajectory.x || 0, y: trajectory.y || 0, z: trajectory.z || 0 };
        }
    }

    updateKineticSounds() {
        if (!this.isInitialized) return;
        const now = performance.now();
        this.kineticSounds = this.kineticSounds.filter(s => now - s.startTime < s.duration + 500);
    }

    getKineticPositions() {
        const positions = [];
        const now = performance.now();

        for (const sound of this.kineticSounds) {
            const elapsed = now - sound.startTime;
            const progress = elapsed / sound.duration;

            if (progress >= 0 && progress < 1 && sound.pannerObj.trajectory) {
                const pos = this.getTrajectoryPosition(sound.pannerObj.trajectory, progress);

                const trail = [];
                for (let i = 1; i <= 8; i++) {
                    const trailProgress = Math.max(0, progress - (i * 0.03));
                    const trailPos = this.getTrajectoryPosition(sound.pannerObj.trajectory, trailProgress);
                    trail.push({
                        x: trailPos.x,
                        y: trailPos.y,
                        z: trailPos.z,
                        alpha: (1 - i / 8) * 0.5
                    });
                }

                positions.push({
                    x: pos.x || 0,
                    y: pos.y || 0,
                    z: pos.z || 0,
                    type: sound.type,
                    ringIndex: sound.ringIndex,
                    progress,
                    intensity: 1 - progress,
                    trajectoryType: sound.pannerObj.trajectory.type,
                    trail
                });
            }
        }

        return positions;
    }

    // Parameter setters
    setMasterVolume(value) {
        this.masterVolume = value;
        if (this.masterGain) {
            this.masterGain.gain.rampTo(value, 0.05);
        }
    }

    setReverbMix(value) {
        this.reverbMix = value;
        if (this.reverb) {
            this.reverb.wet.rampTo(value, 0.1);
        }
    }

    setReverbSize(value) {
        // Adjust reverb character
    }

    setGlobalScale(scaleName) {
        this.globalScale = scaleName;
        // Update all rings to use this scale
        this.ringConfigs.forEach((config, index) => {
            if (config) {
                config.scale = scaleName;
            }
        });
    }

    setPitch(semitones) {
        // Could implement pitch shifting
    }

    setFilterFrequency(value) {
        // Could add filter
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    stop() {
        this.isPlaying = false;
        this.ringSynths.forEach(rs => {
            rs?.synth?.releaseAll();
        });
    }

    dispose() {
        this.stop();
        this.ringSynths.forEach(rs => {
            rs?.synth?.dispose();
            rs?.dryGain?.dispose();
            rs?.wetGain?.dispose();
            rs?.delayGain?.dispose();
        });
        this.reverb?.dispose();
        this.delay?.dispose();
        this.masterGain?.dispose();
    }

    /**
     * Export current configuration as JSON
     */
    exportConfig() {
        return {
            masterVolume: this.masterVolume,
            reverbMix: this.reverbMix,
            ringConfigs: this.ringConfigs
        };
    }

    /**
     * Import configuration from JSON
     */
    importConfig(config) {
        if (config.masterVolume !== undefined) this.setMasterVolume(config.masterVolume);
        if (config.reverbMix !== undefined) this.setReverbMix(config.reverbMix);
        if (config.ringConfigs) {
            config.ringConfigs.forEach((rc, index) => {
                if (rc) this.setRingConfig(index, rc);
            });
        }
    }
}

window.AudioEngine = AudioEngine;
