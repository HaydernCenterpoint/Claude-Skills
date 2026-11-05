---
name: howler-audio
description: Audio playback, sound sprites, spatial/3D audio, fades, and synchronization using Howler.js v2. Use when adding sound effects (SFX), background music (BGM), multi-track audio cues, spatial pan/3D audio, or audio sprites to web animations, interactive experiences, and video players.
---

# Howler.js Audio Guide

Howler.js wraps the Web Audio API (with HTML5 Audio fallback) for reliable cross-browser SFX, music beds, audio sprites, fades, and 3D spatial audio.

## Installation

```bash
npm install howler
npm install -D @types/howler
```

## Core Patterns

### 1. Basic Playback & Fading

```js
import { Howl, Howler } from 'howler';

const bgm = new Howl({
  src: ['assets/bgm.webm', 'assets/bgm.mp3'], // Provide WebM/Opus first, MP3 fallback
  loop: true,
  volume: 0.6,
  preload: true,
});

const id = bgm.play();
// Smoothly duck volume from 0.6 to 0.15 over 800ms during voiceover
bgm.fade(0.6, 0.15, 800, id);
```

### 2. Audio Sprites (Low-Latency UI & Animation SFX)

Pack all short SFX (whoosh, pop, click, impact) into a single audio file to eliminate network requests and sync jitter:

```js
const sfx = new Howl({
  src: ['assets/sfx-sprite.webm', 'assets/sfx-sprite.mp3'],
  sprite: {
    whoosh: [0, 450],       // [offset_ms, duration_ms]
    pop: [600, 220],
    impact: [1000, 900],
    riser: [2100, 1500, true], // [offset, duration, loop]
  },
});

// Trigger on GSAP / Anime.js / Motion timeline callback
sfx.play('whoosh');
```

### 3. Spatial / Stereo Panning (`howler.spatial`)

```js
const drone = new Howl({
  src: ['assets/drone.mp3'],
});

const soundId = drone.play();
// Stereo pan (-1.0 left to 1.0 right)
drone.stereo(-0.7, soundId);

// 3D position in scene coordinates (matches Three.js / R3F world space)
drone.pos(x, y, z, soundId);
drone.pannerAttr({
  panningModel: 'HRTF',
  refDistance: 1,
  rolloffFactor: 1,
  distanceModel: 'inverse',
}, soundId);
```

### 4. Deterministic Frame Rendering vs Live Preview

- **Live Preview / Interactive Web**: Trigger `Howl.play()` inside GSAP `.call(() => sfx.play('pop'))` or `requestAnimationFrame` cues.
- **Headless Frame-by-Frame Video Render (Puppeteer / Remotion / Motion Canvas)**: Headless frame capture does not record Web Audio API output in real-time. For offline MP4 export, either:
  1. Export a timestamp cue sheet (`[{ time: 1.25, sprite: 'whoosh', volume: 0.8 }]`) and mix audio deterministically via FFmpeg `adelay` + `amix` or Mediabunny, OR
  2. Use Remotion's `<Audio>` component / Motion Canvas project audio track for frame-accurate offline rendering.
