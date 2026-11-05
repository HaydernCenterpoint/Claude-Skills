---
name: claude-animation-base
description: Hand-painted flat-2D cartoon animation engine (p5.js + p5.brush + WebGL2) with FNV-1a 12fps boilSeed("key") on-twos ink boil, 31 acted emotion presets, 5-angle character turnarounds, Catmull-Rom arcs, camera-tracked crop zoom QA (--sheet, --strip, --crop, --crop-at), and viewer-read choreography. Use when building hand-drawn 2D cartoons, illustrated music videos, expressive character acting, watercolor/marker/charcoal animated stories, or p5.brush scenes.
---

# ClaudeAnimationBase — Hand-Painted 2D Cartoon Engine (`claude-animation-base`)

Base directory: `~/.claude/skills/claude-animation-base`
REA Evidence ID: `ev_66a91496a93ab7801affb3a0c417a0a872268778ae8b8302317004b56b6adf29`

## Overview

`ClaudeAnimationBase` is a deterministic, code-driven **1920×1080 hand-painted 2D cartoon studio** built on `p5.js` + `p5.brush` (WebGL2) and parallel `puppeteer-core` + `ffmpeg` rendering. Every stroke is painted with physical bristle/marker/charcoal brushes, held **on twos (`BOIL = 12 fps`)** via keyed FNV-1a deterministic seeding (`boilSeed(key)`), and verified through camera-aware multi-zoom contact sheets (`--sheet`, `--strip`, `--crop`, `--crop-at`).

> **Global Studio Override (Non-Negotiable):** If the user asks for **Stickman (Alex)** inside or alongside this engine, Alex MUST remain a pure normal matte-white stick figure (`#f8fafc`) with ZERO cape/scarf, ZERO face/eyes/mouth, ZERO baton/props, and ZERO glow. For SFX, search Openverse (`api.openverse.org/v1/audio/`) alongside synthesized Foley.

---

## 1. Core Engine Primitives (`src/core.js`)

| Group | Primitives | What It Solves |
|---|---|---|
| **Deterministic Boil (`on twos`)** | `BOIL = 12`, `boilFrame`, `boilSeed(key)`, `hash(n)`, `jit(amt)` | Reseeds `brush.seed()` and `randomSeed()` with FNV-1a(`key`) × `Math.floor(t * 12)`. Static background props keep an identical 2-frame hold even when moving foreground characters change draw-call counts. |
| **Brush & Paint Layering** | `paint(fillCol, alpha, strokeCol, weight, fn, brushName)`, `inkLine(col, weight, fn, brushName)`, `glow(x, y, r, col, alpha)`, `ribbon(pts, halfW, fillCol, strokeCol, weight)` | Wraps `p5.brush` (`marker`, `cpencil`, `charcoal`, `rotring`, `2B`, `HB`, `pen`, `spray`) with clean state restore and zero bleed bugs. |
| **Curves, Rigging & Arcs** | `poly(pts, closed)`, `blob(r, lobes, wob, phase)`, `through(pts, u, closed)` (Catmull-Rom), `limb(x, y, a1, l1, a2, l2, fn)`, `ik2(dx, dy, l1, l2, flip)`, `squash(sx, sy, fn)` | Gives every walk, reach, tail, and throw an arc (`through()`) + volume-conserving squash & stretch (`sx * sy ≈ 1`) + 2-bone analytical IK (`ik2`). |
| **Timing & Beat Sync** | `BPM`, `BEAT_T0`, `beatOf(t)`, `barOf(t)`, `pulse(t, decay)`, `seg(t, a, b, ease)`, `env(t, i0, i1, o0, o1, eIn, eOut)`, `spring(u, damp, freq)`, `anticipate(u, dip)` | Beats, bar pulses, closed-form underdamped springs, and wind-up anticipation (`u` dips negative before launching forward). |
| **Camera & Transitions** | `cam(cx, cy, zoom, rotDeg, shakeAmt, t)`, `LAST_CAM`, `iris(u, cx, cy, col)`, `irisShape(kind, u, cx, cy, col, rot)`, `brushWipe(u, col, dir)`, `matchCut(t, tCut, hold, outShot, inShot)` | Tracks world-to-screen transforms in `LAST_CAM` so `--crop-at=wx,wy,ww,wh` auto-follows moving characters across camera pans/zooms. |

---

## 2. Viewer-Read Timing Law ("Write the Reads")

Read [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) for the complete 12-principle reference. Never divide shot duration evenly across actions:

1. **One Read at a Time**: While the hero acts, everything else drops to `idle` boil. Simultaneous motions cancel each other out.
2. **Fast Actions, Slow Meanings**:
   - Snap / whip / blink / impact: `0.10–0.20 s` (`3–5 frames`)
   - Anticipation wind-up: `0.20–0.35 s`
   - Settle / overshoot decay: `0.25–0.40 s`
   - **Emotional / Story Read Hold**: `0.60–1.20 s` (nothing competes while the viewer registers what just changed).
3. **Lead the Eye (`0.25 s` pre-arrival)**: Land a gaze shift, shadow, or light pool at the target coordinates `~6 frames` before the cut or entrance.
4. **Acted Emotions (`emotions()` + `take()`)**: Use 31 two-beat emotion curves (`joy`, `grief`, `shock`, `scheming`, `smug`, `exhausted`, `awe`, etc.) that compress into a squint/anticipation before opening into overshoot and breathing settle.
5. **5-Key Turnarounds (`turn()` / `spinView()`)**: Draw 5 distinct views (`front`, `3/4R`, `sideR`, `back`, `3/4L`) rather than horizontally scaling a flat drawing (`scale(cos θ, 1)`).

---

## 3. Scaffold & Multi-Zoom Visual QA Workflow

1. **Scaffold a New Cartoon Project**:
   Copy `studio.html`, `render.mjs`, `package.json`, and `src/core.js` into your project directory, run `npm install`, and register chapters in `src/chapters/c01_*.js`.
2. **Fast Contact Sheet (`--sheet`)**:
   ```bash
   node render.mjs --sheet=0.5,1.2,2.0,3.4,4.8,6.0 --cols=3 --out=out/check_sheet.jpg
   ```
3. **24fps Strip Across One Action (`--strip`) — Mandatory for Snaps, Takes & Cuts**:
   ```bash
   node render.mjs --strip=2.0:3.2:12 --cols=4 --out=out/check_strip.jpg
   ```
4. **Camera-Aware Detail Crop (`--crop` / `--crop-at`) — Mandatory for Hands, Props & Faces**:
   ```bash
   # Screen-space crop (x,y,w,h in 1920x1080):
   node render.mjs --strip=2.2:2.8:8 --crop=660,240,600,600 --cols=4 --out=out/check_face.jpg
   # World-space crop following LAST_CAM pan/zoom automatically:
   node render.mjs --strip=2.2:2.8:8 --crop-at=960,480,500,500 --cols=4 --out=out/check_world.jpg
   ```
5. **Parallel Full Render & Audio Mux**:
   ```bash
   node render.mjs --frames=0:60 --workers=4 --fps=24
   node render.mjs --encode --fps=24 --audio=assets/mix.wav --out=out/final.mp4
   ```
