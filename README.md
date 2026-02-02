# Polyrhythm Mandala

A visual music machine that creates generative polyrhythmic compositions through an interactive rotating mandala interface.

![Polyrhythm Mandala](screenshot.png)

## Features

### Core Mandala
- **Rotating Mandala**: Concentric rings of trigger points rotating at different speeds create complex polyrhythmic patterns
- **Visual Triggers**: Nodes light up when crossing the trigger line, creating a mesmerizing visual display
- **Kinetic Sound Visualization**: Sound trajectories visualized as moving particles with trails
- **Pentatonic Harmony**: All sounds use a pentatonic scale (C, D, E, G, A) ensuring musical coherence
- **3D Mode**: Toggle between 2D canvas and immersive 3D Three.js visualization

### Sound Types
- **Bell synths** for melodic tones
- **Pad synths** for atmospheric sounds
- **Bass synths** for low-end warmth
- **Sparkle synths** for high ethereal textures

### Brainwave Entrainment
- **Isochronic Tones**: Rhythmic pulsing tones for brainwave entrainment
  - Delta (0.5-4 Hz) - Deep sleep
  - Theta (4-8 Hz) - Meditation
  - Alpha (8-13 Hz) - Relaxation
  - Beta (13-30 Hz) - Focus
  - Gamma (30-50 Hz) - Peak awareness
- **Binaural Beats**: Stereo frequency differential for entrainment (headphones required)
- **Reactive Visualizer**: Mandala pulses and breathes in sync with entrainment tones

### Ambient Soundscapes
Layerable background sounds for immersive experiences:
- **Nature**: Rain, Ocean Waves, Wind, Forest
- **Drones**: Deep Drone, Om (136.1 Hz), Celestial Pad, Crystal Bowl, Tibetan Bowl (528 Hz)

### Shapes & Orbiters
- **Mandala Shapes**: 8 geometric patterns to choose from
  - Circular (default), Hexagonal, Spiral, Flower of Life, Star, Lissajous, Grid, Tree
- **Orbiters**: Free-roaming nodes with trajectory-based movement
  - 8 patterns: Circular, Elliptical, Spiral, Lissajous, Pendulum, Random Walk, Figure-Eight, Rose Curve
  - Trigger sounds when crossing the trigger line or colliding
  - Quick presets: Chaotic, Orbital, Dance, Meditative, Fireworks, Swarm

### Wellness Tools
- **Session Timer**: Timed meditation sessions (5-30 min) with audio fade-out
- **Breathing Guide**: Guided breathing patterns (Box Breathing, 4-7-8, Energizing, Calming, Deep Breath)
- **Focus Mode**: Hide all UI for distraction-free experience
- **Tap Tempo**: Set tempo by tapping

### Visual Customization
- **Color Themes**: 12 preset palettes (Cyberpunk, Nature, Ocean, Sunset, Ethereal, Fire, Ice, Forest, Neon, Pastel, Monochrome, Rainbow)
- **Particle System**: Burst effects on triggers with trails and glow
- **Per-Ring Sound Editor**: Customize each ring's sound type, scale, and more
- **Visual Settings Panel**: Fine-tune trails, glow, node size, and background effects

## Technology

- **Tone.js** - Web Audio synthesis and effects
- **Three.js** - 3D visualization
- **Canvas 2D** - 2D real-time visualization
- **Vanilla JavaScript** - No framework dependencies

## Usage

1. Open `index.html` in a modern web browser
2. Click anywhere to start the audio engine
3. Watch and listen as the mandala creates evolving polyrhythmic patterns

### Controls
- **Preset Dropdown**: Switch between 7 mandala configurations
- **Dials**: Adjust volume, pitch, reverb, speed, and glow
- **Side Panel** (⚙): Visual settings for trails, particles, and background
- **Ring Editor** (🎹): Per-ring sound customization
- **Isochronic Panel** (🧠): Brainwave entrainment controls
- **Ambient Panel** (🎵): Layerable background sounds
- **Theme Panel** (🎨): Color theme selection
- **Shape Panel** (✧): Mandala shapes and orbiters
- **Wellness Panel** (🧘): Timer, breathing guide, and focus mode
- **3D Button**: Toggle 3D visualization mode

## Sound Architecture

Each ring triggers sounds based on its distance from center:
- **Outer rings**: Higher pitched, sparkle-type sounds
- **Middle rings**: Melodic bell tones
- **Inner rings**: Deep bass and atmospheric pads

The audio engine uses parallel dry/wet routing for clean sound:
- Direct signal path for clarity and punch
- Separate reverb sends for spatial depth

## Preset Descriptions

| Preset | Description |
|--------|-------------|
| Racing Thoughts | Fast, chaotic patterns with many nodes |
| Calm Waters | Slow, meditative with fewer elements |
| Sacred Geometry | Balanced, symmetrical arrangements |
| Fibonacci Spiral | Node counts following the Fibonacci sequence |
| Cosmic Dance | Medium complexity with varied speeds |
| Minimalist | Sparse, contemplative design |
| Dense Forest | Rich, layered complexity |

## Browser Support

Requires a modern browser with Web Audio API support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

Built with [Tone.js](https://tonejs.github.io/) for audio synthesis and [Three.js](https://threejs.org/) for 3D graphics.

Inspired by kinetic/acousmatic music principles where sound movement through space is a central musical element.
