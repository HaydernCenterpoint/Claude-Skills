---
name: median-lab-video
description: Use when asked to create, plan, script, animate, or voice an educational science, math, physics, chemistry, probability, or deep-reasoning explainer video in the @median-lab or Mathmethic style, or when an explainer requires first-principles epistemic reasoning, interleaved 2D and 3D mathematical animations, Wikipedia primary-source cards, 5-mode dynamic voice pacing, and melodic mathematical sound design.
---

# Median-Lab & Mathmethic Epistemic Video Skill (Claude Motion Integrated)

## Overview

Produce first-principles mathematics, physics, and science explainer videos combining:
1. **100% English Voiceover & English Subtitles (MANDATORY DEFAULT)**:
   - Voiceover MUST be 100% English (`en-US-AndrewMultilingualNeural`, 5-Mode Dynamic Prosody: `fast`, `emphasis`, `normal`, `question`, `release`).
   - Every video MUST include clean, frameless word-synced **English Subtitles** at the bottom safe zone (`Y ≈ 998`).
2. **Pure Normal Stickman Presenter (`#f8fafc` — ZERO Accessories, ZERO Face)**:
   - The Stickman presenter (Alex) MUST be a **normal, pure matte-white stick figure (`#f8fafc`)** with a solid white circular head (`ctx.fill()`) and smooth C² 2-bone IK limbs.
   - **STRICTLY FORBIDDEN on the Stickman:** NO cape or scarf (`không áo choàng / khăn`), NO facial features (`không khuôn mặt / mắt / mũi / miệng / lip-sync / soul-arc`), NO handheld baton/wand (`không gậy chỉ bảng`), and NO glow/chalk filters.
3. **Epistemic First-Principles Reasoning ("Siêu Suy Luận")** + **Primary-Source Wikipedia Visual Cards**
4. **Interleaved 2D Constructive Geometry & 3D Mathematical Space** + **Melodic Polyphonic Mathematical Sound Design (`-14.0 LUFS`)**

---

## Claude Motion Ecosystem Integration (Skill Routing)

This skill is natively wired into the **Claude Motion 20-Tool Ecosystem**. Load the matching Claude Motion sub-skill when building each layer:

| Production Layer | Claude Motion Skills to Combine | Integration Contract |
|---|---|---|
| **0. Master Orchestrator** | **REQUIRED SUB-SKILL:** `video-production-pipeline` | All 2D, SVG, GSAP, and Three.js layers MUST slave to a single deterministic master clock `t = frame / fps` exposed via `window.renderAt(t, type, q)` and `window.renderSheet(times, cols, w)`. |
| **1. Epistemic Script & Pacing** | `median-lab-video` ([epistemic-reasoning-script.md](references/epistemic-reasoning-script.md)), `motion-design` | 6-Act First-Principles Arc + 5-Mode Dynamic Voice Segments (`fast`, `emphasis`, `normal`, `question`, `release`) + Wikipedia REST API primary-source fetching (`assets/wiki/`). |
| **2. 2D Vector, Stickman & Constructive Math** | `svg-video-engine`, `directing-stickman-videos`, `gsap-timeline`, `gsap-core`, `animejs`, `motion-canvas` | Use safe SVG stroke reveals (`pathLength="1"`, `stroke-dasharray="${p} 2"`, hide when `p <= 0.001`), polygon morphing (`morphPath`), 2-bone analytical IK stick figures (`solveIK2Bone`), or paused timelines (`tl.time(t)`). |
| **3. 3D Mathematical Space & Shaders** | `threejs-fundamentals`, `threejs-geometry`, `threejs-shaders`, `threejs-postprocessing` (or `r3f-*` in `remotion-best-practices`) | Use 3D coordinate space (`(x, y, z)`) for 3D volumes, extruded prisms/cylinders, 3D helical phase space `(cos ωt, sin ωt, t)`, and curved manifolds (`Sphere K>0`, `Saddle K<0`, `Gravity Well`). Render synchronously inside `renderAt(t)`. |
| **4. Cards, Thumbnails & Banners** | `satori`, `svgo` + `scripts/generate-mathmethic-thumbnails.mjs` & `scripts/generate-channel-banner.mjs` | Generate `1920×1080` A/B test thumbnails (`< 2 MB` JPG) and `2560×1440` YouTube banners (`1546×423` safe zone). |
| **5. Voice, Melodic SFX & Mastering** | `scripts/synth-median-audio.py`, `scripts/build-mathmethic-sfx.py`, `howler-audio`, `ffmpeg` | 5-Mode Dragon HD Neural TTS (`en-US-AndrewMultilingualNeural` / `vi-VN-NamMinhNeural`) + Pentatonic Marimba/Harp mathematical SFX + FFmpeg `-14.0 LUFS` mastering. |

---

## Core Architecture (The 4 Pillars)

| Pillar | Standard | Reference / Script |
|---|---|---|
| **1. Epistemic Reasoning & Wikipedia Evidence** | 6-Act First-Principles Arc + Real historical portraits/artifacts fetched from `https://en.wikipedia.org/api/rest_v1/page/summary/<Title>` | [epistemic-reasoning-script.md](references/epistemic-reasoning-script.md) |
| **2. Color-Coded 2D ↔ 3D Visuals** | **Obsidian Edition** (`#080808` monochrome + `#6b8cae`/`#d4b46a`) OR **Mathmethic Colorful Edition** (`#060913` cosmic indigo + semantic Cyan `#38bdf8`, Coral `#fb7185`, Gold `#facc15`, Emerald `#34d399`, Violet `#a78bfa`). Pure frameless 2D for equations/proofs interleaved with 3D Coordinate Space for 3D examples. | [visual-animation-system.md](references/visual-animation-system.md) |
| **3. 5-Mode Dynamic Voice Delivery** | Split each sentence into `segments` with explicit modes: `fast` (`+15%` rate for lists/momentum), `emphasis` (`-5%` rate, `+3Hz`, `+1.8 dB`, `180ms` pre-hold for key insights), `normal` (`+3%`), `question` (`+4Hz`), `release` (`-7%`, `-3Hz`, exhale taper). | [voice-prosody-audio.md](references/voice-prosody-audio.md) & [scripts/synth-median-audio.py](scripts/synth-median-audio.py) |
| **4. Melodic Mathematical Sound Design** | Zero white noise, zero chopped samples. Pure physical-modeled Pentatonic Marimba/Harp scales (`D4→F4→G4→A4→C5→D5`) climbing with mathematical steps (`1d, 2d, 3d`, `N=6→96`), `golden-lock` chords, `wedge-snap`, `odometer-run`, and `48 Hz` `space-3d-open` sub-blooms. | [scripts/build-mathmethic-sfx.py](scripts/build-mathmethic-sfx.py) |

---

## Production Recipe (Step-by-Step)

1. **Fetch Primary Facts & Wikipedia Visuals**:
   - Query `https://en.wikipedia.org/api/rest_v1/page/summary/<Title>` into `assets/wiki/` (run Python with `-I` on untrusted downloads).
2. **Author 5-Mode Dynamic Script (`data/script.json`)**:
   - Structure each scene's `lines[]` into `segments: [{ "text": "...", "mode": "fast|emphasis|normal|question|release" }]`.
3. **Synthesize Voice & Melodic Mathematical SFX**:
   ```bash
   python median-lab-video/scripts/synth-median-audio.py <project_dir> --lang=en --force
   python median-lab-video/scripts/build-mathmethic-sfx.py <project_dir>
   ```
4. **Build Interleaved 2D & 3D Scene (`index.html`) + Visual QA Sheet**:
   - Slave all 2D/SVG/GSAP/Three.js animations to `window.renderAt(t)` and inspect a 16-frame contact sheet before full rendering:
   ```bash
   node render.mjs --sheet=18,38,48,68,99,114,141,165,182,212,232,256,276,304,342,355 --cols=4 --w=560 --out=snapshots/check_sheet.jpg
   ```
5. **Parallel GPU Render, FFmpeg Remux & Thumbnail/Banner Generation**:
   ```bash
   node render.mjs --frames --workers=6 --fps=30
   node render.mjs --encode --fps=30 --out=renders/video.mp4
   node median-lab-video/scripts/generate-mathmethic-thumbnails.mjs <renders_dir>
   node median-lab-video/scripts/generate-channel-banner.mjs <renders_dir>
   ```

## Rationalization Table & Red Flags

| Excuse / Temptation | Reality |
|---|---|
| "I'll use a single uniform speed for the entire TTS voice-over." | **Forbidden.** Uniform TTS speed sounds robotic. Always use the 5-Mode Dynamic Segment Engine (`fast` for lists/acceleration, `emphasis` with `180ms` pre-hold for key numbers, `normal` for transitions, `release` for conclusions). |
| "I'll use `rng.standard_normal()` white noise or slice random clips from YouTube for SFX." | **Forbidden.** White noise causes static hiss and sliced clips leak breaths/BGM fragments. Use `build-mathmethic-sfx.py`'s pure harmonic physical modeling (pentatonic marimba/harp scales + sub-bass cushions). |
| "I'll wrap every 2D equation or circle inside a rectangular UI box." | **Forbidden.** Keep 2D equations and geometric proofs frameless in the dark void; switch into 3D Coordinate Space (`draw3DMathSpace` / Three.js) specifically when demonstrating 3D mathematical or physical examples. |
| "I'll use free-running `requestAnimationFrame` or un-seeked GSAP/Three.js clocks." | **Breaks parallel rendering.** Every Claude Motion tool (GSAP, Anime.js, SVG, Three.js) must compute state purely from `t` inside `window.renderAt(t)`. |
| "I'll add a cape/scarf, eyes/mouth/face, or a laser baton to the stickman." | **STRICTLY FORBIDDEN.** Always draw a pure normal matte-white stickman (`#f8fafc`, solid white circle head, 2 arms, 2 legs, curved spine) with ZERO cape/scarf, ZERO facial features, and ZERO handheld props. |
| "I'll write the voiceover or subtitles in Vietnamese or omit English subtitles." | **STRICTLY FORBIDDEN.** Unless explicitly overridden by the user, all scripts, voiceovers (`en-US-AndrewMultilingualNeural`), and bottom word-synced subtitles MUST be 100% English. |
