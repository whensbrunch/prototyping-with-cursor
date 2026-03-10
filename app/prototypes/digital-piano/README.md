# Digital piano (cyberpunk)

A small digital piano prototype with a cyberpunk aesthetic. Play notes by clicking the keys or using your computer keyboard.

## What’s in this prototype

- **Two octaves** (C3 to C5): white and black keys in a standard piano layout.
- **Sound**: Uses the Web Audio API (no extra dependencies). Short sine tones on key press.
- **Keyboard shortcuts**: White keys map to `A`–`N` (bottom row). Black keys map to `Q`–`P` (top row).
- **Particle visualizer**: Every key press emits particles that respond to the note.
  - Higher notes create lighter particles that travel upward.
  - Lower notes create heavier particles with stronger downward gravity.
  - Velocity (input intensity) changes burst size and speed.
  - Chords naturally create overlapping bursts.
  - Particles fade into the background over time.
- **Sustain pedal**: Hold `Space` or `Shift` to sustain note releases and keep particles lingering longer.
- **Particle tuning sliders**:
  - Amount, Speed, Gravity, Size, and Lifespan to shape behavior.
  - Glow Intensity and Trail Fade to shape the visual look.
- **Styling**: Dark background with cyan and magenta neon-style borders and glow; subtle scanline overlay.

## How to run

1. From the project root, install dependencies (if you haven’t already):
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000/prototypes/digital-piano](http://localhost:3000/prototypes/digital-piano) in your browser.

You can also go to the [homepage](http://localhost:3000) and click the “Digital piano” card to reach this prototype.
