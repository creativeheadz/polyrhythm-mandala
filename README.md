# Polyrhythm Mandala

A visual music machine that creates generative polyrhythmic compositions through an interactive rotating mandala interface.

![Polyrhythm Mandala](screenshot.png)

## Features

- **Rotating Mandala**: Concentric rings of trigger points rotating at different speeds create complex polyrhythmic patterns
- **Visual Triggers**: Nodes light up when crossing the trigger line, creating a mesmerizing visual display
- **Kinetic Sound Visualization**: Sound trajectories visualized as moving particles with trails
- **Pentatonic Harmony**: All sounds use a pentatonic scale (C, D, E, G, A) ensuring musical coherence
- **Multiple Sound Types**:
  - Bell synths for melodic tones
  - Pad synths for atmospheric sounds
  - Bass synths for low-end warmth
  - Sparkle synths for high ethereal textures
- **Preset Mandalas**: 7 pre-configured patterns including "Racing Thoughts", "Calm Waters", "Sacred Geometry", "Fibonacci Spiral", and more
- **Configurable Controls**:
  - Master volume, reverb mix, and reverb size dials
  - Visual settings panel for customizing particle trails, glow, and background effects
- **Ethereal Background**: Floating ring circles that pulse and fade

## Technology

- **Tone.js** - Web Audio synthesis and effects
- **Canvas 2D** - Real-time visualization
- **Vanilla JavaScript** - No framework dependencies

## Usage

1. Open `index.html` in a modern web browser
2. Click anywhere to start the audio engine
3. Watch and listen as the mandala creates evolving polyrhythmic patterns
4. Use the preset dropdown to switch between different mandala configurations
5. Adjust dials to control volume and reverb
6. Open the side panel (arrow on right edge) to fine-tune visual settings

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

Built with [Tone.js](https://tonejs.github.io/) for audio synthesis.

Inspired by kinetic/acousmatic music principles where sound movement through space is a central musical element.
