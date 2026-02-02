/**
 * Audio Engine - Kinetic Music Implementation
 * Optimized for powerful machines with clean audio routing
 */

class AudioEngine {
    constructor() {
        this.isInitialized = false;
        this.isPlaying = false;
        this.masterVolume = 0.7;
        this.reverbMix = 0.4;
        this.reverbSize = 0.2;

        // Pentatonic scale for harmonious sounds
        this.scale = ['C', 'D', 'E', 'G', 'A'];

        // Active kinetic sounds for visualization
        this.kineticSounds = [];
    }

    async init() {
        if (this.isInitialized) return;

        await Tone.start();
        console.log('Audio context started, sample rate:', Tone.context.sampleRate);

        // Simple master chain - no limiter (causes pumping), just clean gain
        this.masterGain = new Tone.Gain(this.masterVolume).toDestination();

        // Shared reverb (connected directly to master, not in series with other effects)
        this.reverb = new Tone.Reverb({
            decay: 3,
            wet: this.reverbMix,
            preDelay: 0.01
        }).connect(this.masterGain);
        await this.reverb.ready;

        // Create synths with independent routing
        this.createSynths();

        this.isInitialized = true;
        this.isPlaying = true;
        console.log('Audio engine initialized');
    }

    createSynths() {
        // Each synth has its own gain for mixing, routes to both dry and wet paths

        // Bell synth - main melodic sounds (direct to master for clarity)
        this.bellGain = new Tone.Gain(0.6).connect(this.masterGain);
        this.bellReverb = new Tone.Gain(0.3).connect(this.reverb);

        this.bellSynth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 16,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.005,
                decay: 0.8,
                sustain: 0.05,
                release: 1.2
            }
        });
        this.bellSynth.connect(this.bellGain);
        this.bellSynth.connect(this.bellReverb);

        // Pad synth - atmospheric (more reverb)
        this.padGain = new Tone.Gain(0.4).connect(this.masterGain);
        this.padReverb = new Tone.Gain(0.5).connect(this.reverb);

        this.padSynth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 8,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.1,
                decay: 1.0,
                sustain: 0.4,
                release: 1.5
            }
        });
        this.padSynth.connect(this.padGain);
        this.padSynth.connect(this.padReverb);

        // Bass synth - low end (mostly dry for punch)
        this.bassGain = new Tone.Gain(0.7).connect(this.masterGain);
        this.bassReverb = new Tone.Gain(0.15).connect(this.reverb);

        this.bassSynth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 6,
            oscillator: { type: 'triangle' },
            envelope: {
                attack: 0.01,
                decay: 0.5,
                sustain: 0.2,
                release: 0.8
            }
        });
        this.bassSynth.connect(this.bassGain);
        this.bassSynth.connect(this.bassReverb);

        // Sparkle synth - high ethereal (moderate reverb)
        this.sparkleGain = new Tone.Gain(0.35).connect(this.masterGain);
        this.sparkleReverb = new Tone.Gain(0.4).connect(this.reverb);

        this.sparkleSynth = new Tone.PolySynth(Tone.Synth, {
            maxPolyphony: 12,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.002,
                decay: 0.4,
                sustain: 0.02,
                release: 0.6
            }
        });
        this.sparkleSynth.connect(this.sparkleGain);
        this.sparkleSynth.connect(this.sparkleReverb);
    }

    /**
     * Create a kinetic trajectory for visualization
     */
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

    /**
     * Calculate position along a trajectory
     */
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

    /**
     * Play a trigger sound - NO throttling, let all notes play
     */
    playTrigger(type, ringIndex, noteIndex, position = { x: 0, y: 0, z: 0 }) {
        if (!this.isInitialized || !this.isPlaying) return;

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
            pannerObj: { trajectory }
        });

        // Calculate note
        const octaveOffset = Math.floor(ringIndex / 2);
        const scaleIndex = noteIndex % this.scale.length;
        const baseNote = this.scale[scaleIndex];
        const toneNow = Tone.now();

        // Play the appropriate synth
        switch (type) {
            case 'bass': {
                const octave = 2 + (ringIndex % 2);
                this.bassSynth.triggerAttackRelease(baseNote + octave, '2n', toneNow, 0.5);
                break;
            }
            case 'melodic': {
                const octave = 4 + octaveOffset;
                this.bellSynth.triggerAttackRelease(baseNote + octave, '4n', toneNow, 0.5);
                break;
            }
            case 'atmospheric': {
                const octave = 5 + (ringIndex % 2);
                this.padSynth.triggerAttackRelease(baseNote + octave, '1n', toneNow, 0.35);
                break;
            }
            case 'sparkle': {
                const octave = 6 + (noteIndex % 2);
                this.sparkleSynth.triggerAttackRelease(baseNote + octave, '8n', toneNow, 0.4);
                break;
            }
            default: {
                const octave = 4 + octaveOffset;
                this.bellSynth.triggerAttackRelease(baseNote + octave, '4n', toneNow, 0.45);
            }
        }
    }

    /**
     * Update - just cleanup old visualizations
     */
    updateKineticSounds() {
        if (!this.isInitialized) return;
        const now = performance.now();
        this.kineticSounds = this.kineticSounds.filter(s => now - s.startTime < s.duration + 500);
    }

    /**
     * Get positions for visualization
     */
    getKineticPositions() {
        const positions = [];
        const now = performance.now();

        for (const sound of this.kineticSounds) {
            const elapsed = now - sound.startTime;
            const progress = elapsed / sound.duration;

            if (progress >= 0 && progress < 1 && sound.pannerObj.trajectory) {
                const pos = this.getTrajectoryPosition(sound.pannerObj.trajectory, progress);

                // Trail points
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
        this.reverbSize = value;
        // Can't change decay on the fly easily, so we adjust wet mix as proxy
    }

    setPitch(semitones) {
        // Not implemented - would need pitch shifter
    }

    setFilterFrequency(value) {
        // Removed filter from chain for cleaner sound
    }

    play() {
        this.isPlaying = true;
    }

    pause() {
        this.isPlaying = false;
    }

    stop() {
        this.isPlaying = false;
        this.bellSynth?.releaseAll();
        this.padSynth?.releaseAll();
        this.bassSynth?.releaseAll();
        this.sparkleSynth?.releaseAll();
    }

    dispose() {
        this.stop();
        this.bellSynth?.dispose();
        this.padSynth?.dispose();
        this.bassSynth?.dispose();
        this.sparkleSynth?.dispose();
        this.bellGain?.dispose();
        this.padGain?.dispose();
        this.bassGain?.dispose();
        this.sparkleGain?.dispose();
        this.bellReverb?.dispose();
        this.padReverb?.dispose();
        this.bassReverb?.dispose();
        this.sparkleReverb?.dispose();
        this.reverb?.dispose();
        this.masterGain?.dispose();
    }
}

window.AudioEngine = AudioEngine;
