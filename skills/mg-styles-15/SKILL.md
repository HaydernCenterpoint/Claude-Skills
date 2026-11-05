---
name: mg-styles-15
description: 15 canonical 10-second Motion Design style playbooks (Cel Boil, Isometric, Flat Vector, Line Art, Blender 3D, Morph, Paper Cutout, HUD/FUI, Mixed-Media Collage, Aurora Glass, Bauhaus, Synthwave, Pixel Art, Liquid Blobs, CJK Kinetic Hanzi), headless Chrome subframe motion-blur + Fritsch-Carlson time-warp renderer (harness/render.mjs), 48kHz procedural + 103-sample VCSL music/SFX studio (mgaudio), and 7-dimension Motionographer/Buck harsh rubric jury. Use when selecting or executing a distinct motion-graphics visual style, scoring procedural music + sync SFX in Python, or running multi-round style-fidelity critiques.
---

# MG-Styles-15 — 15 Motion Design Styles, Subframe Harness & `mgaudio` Synth (`mg-styles-15`)

Base directory: `~/.claude/skills/mg-styles-15`
REA Evidence ID: `ev_43befa453e08b1cebf6c8425a00591312e8c4a4eb6b501f7769a25b70cf39382`

## Overview

`mg-styles-15` provides **15 complete art-direction + technical execution specs** (`prompts/*.md` + reference code in `demos/*`), a **subframe motion-blur & monotone-cubic time-remap headless renderer** (`harness/render.mjs`), a **48 kHz stereo procedural + sampled soundtrack synthesizer** (`lib/audio/mgaudio` with 103 CC0 VCSL acoustic samples), and a **7-dimension harsh Motionographer/Buck critique rubric** (`rubric.md`).

> **Global Studio Override (Non-Negotiable):** Whenever **Stickman (Alex)** appears, render a pure matte-white (`#f8fafc`) stick figure with ZERO cape/scarf, ZERO face/eyes/mouth, ZERO baton/props, and ZERO glow. Whenever SFX are needed, query **Openverse** (`api.openverse.org/v1/audio/`) alongside `mgaudio` / `earshot-dsp.mjs`.

---

## 1. The 15 Canonical Motion Styles (`prompts/` & `demos/`)

| ID & Prompt File | Visual Identity & Core Stack | Music / Audio Pairing (`mgaudio.recipes`) |
|---|---|---|
| `01-flat-vector.md` | Crisp Kurzgesagt/Buck geometric flat vector, overshoot springs, layered parallax | `flat_vector` (bright marimba/pluck + crisp percussion) |
| `02-line-art.md` | Continuous monoline SVG path-trim (`stroke-dasharray="${p} 2"`), geometric reveals | `line_art` (delicate felt piano / plucked harp) |
| `03-isometric.md` | Axonometric `30°` architectural dioramas, orthographic depth-sorted assemblies | `isometric` (clockwork minimal synth + kalimba ticks) |
| `04-3d-render.md` | True Blender Cycles/EEVEE 3D materials, bevels, studio cyclorama & physically based light | `render_3d` (cinematic sub + glass/metal foley) |
| `05-cel-boil.md` | Hand-inked 12fps cel animation, turbulent `feDisplacementMap` boil, smear frames | `cel_boil` (playful upright bass + brush percussion) |
| `06-collage.md` | Torn paper edges, halftone stipple, stop-motion `6–12 fps` stepped posterize holds | `collage` (crate-dug breakbeat + paper rip/shutter clicks) |
| `07-liquid.md` | Gooey SVG alpha-threshold metaballs (`feColorMatrix`), elastic surface-tension splashes | `liquid` (resonant filter plucks + Minnaert bubble pops) |
| `08-morph.md` | Seamless topological path morphing, continuous match-cut transitions, zero hard cuts | `morph` (evolving harmonic pad + glide sweeps) |
| `09-bauhaus.md` | Primary-color Constructivist/Bauhaus grid (`#E63946`, `#1D3557`, `#F4A261`), bold geometric rhythm | `bauhaus` (percussive modernist woodblock + brass stabs) |
| `10-synthwave.md` | Perspective wireframe sun grid, chromatic aberration, scanlines, dual-radius neon bloom | `synthwave` (PolyBLEP Reese/arp + gated snare) |
| `12-aurora-glass.md` | Apple/Linear dark mode mesh aurora shaders + frosted `backdrop-filter` specular glass cards | `aurora_glass` (warm airy Rhodes + shimmer sub) |
| `18-hanazi.md` | Editorial kinetic typography (CJK/Latin), ink-bleed reveals, brutalist grid contrast | `hanzi` (taiko/koto pluck + crisp typographic hits) |
| `19-paperclip.md` | Multi-plane cut-paper shadowbox (`drop-shadow` elevation proportional to layer depth) | `paperclip` (acoustic guitar/celesta + paper slide foley) |
| `20-pixel.md` | Integer-scaled crisp `image-rendering: pixelated` sprites, palette cycling, zero subpixel blur | `pixel` (NES/YM2612 chiptune pulse + noise percussion) |
| `22-hud.md` | Precision FUI/HUD telemetry reticles, monospace data readouts, thin 1px hairlines, micro-ticks | `hud` (surgical high-tech micro-chirps + sub pulse) |

Before coding any style, read `~/.claude/skills/mg-styles-15/prompts/<id>.md` AND `~/.claude/skills/mg-styles-15/template.md`.

---

## 2. Subframe Motion-Blur & Time-Warp Harness (`harness/render.mjs`)

Any HTML scene exposing `window.__Duration`, `window.__FPS`, and `window.seekTo(t)` can be rendered with real shutter blur and non-linear editorial retiming:

```bash
# Render 1080p MP4 with 4-subframe 180-deg shutter motion blur + monotone-cubic speed ramp:
node ~/.claude/skills/mg-styles-15/harness/render.mjs \
  --url file:///absolute/path/to/index.html \
  --out out/master.mp4 \
  --subframes 4 --shutter 0.5 \
  --tmap "0:0,2.0:1.6,2.3:2.5,10:10" \
  --audio out/mix.wav
```

- **Subframe Shutter (`--subframes K --shutter S`)**: Renders `FPS × K` sub-steps and blends `K` frames via FFmpeg `tmix` + `select=not(mod(n,K))` for authentic motion blur on fast CSS/SVG/Canvas whips.
- **Monotone Cubic Retiming (`--tmap`)**: Uses Fritsch–Carlson Hermite interpolation so speed-ramps (`slow → snap → hold`) never overshoot or run time backward.
- **BT.709 Studio Encoding**: Encodes `-crf 14 -preset slow -pix_fmt yuv420p -vf scale=out_color_matrix=bt709:flags=lanczos -x264-params aq-mode=3:aq-strength=0.8:deblock=-1,-1` (eliminates dark-gradient banding and sRGB→Rec.709 color shift).

---

## 3. `mgaudio` 48 kHz Procedural + VCSL Sampled Audio Engine (`lib/audio/`)

Use `PYTHONPATH=~/.claude/skills/mg-styles-15/lib/audio` in Python to score chord-locked music beds + frame-accurate `sync` SFX:

```python
import sys
sys.path.insert(0, r"C:\Users\datmk\.claude\skills\mg-styles-15\lib\audio")
import mgaudio as A

cues = [
    {"t": 0.80, "kind": "whoosh", "dur": 0.28, "gain": 0.65},
    {"t": 1.60, "kind": "hit",    "pitch": "C2", "gain": 0.85},  # peak lands at t=1.60s
    {"t": 4.20, "kind": "riser",  "dur": 1.10, "gain": 0.55},    # riser ENDS right at t=4.20s
]
st = A.recipes.aurora_glass(duration=10.0, bpm=120, cues=cues)
mix = st.render(lufs=-16.0)
A.io.save_wav("out/mix.wav", mix)
report = A.qc.check(mix, cues=cues)  # verifies LUFS, Peak <= -1 dBFS, DC offset, onset sync, stereo corr
```

---

## 4. The 7-Dimension Harsh Jury Gate (`rubric.md`)

After rendering, spawn a **fresh subagent** (never self-grade in the author's context) with `rubric.md` + contact sheet + audio QC report to score `1–10` across:
1. `style_fidelity` | 2. `concept_wow` | 3. `motion_craft` | 4. `design_typography` | 5. `finish_texture` | 6. `sound_sync` | 7. `technical`.
Any dimension `< 7` or mean `< 8.0` triggers a targeted surgical revision pass (max 2 rounds).
