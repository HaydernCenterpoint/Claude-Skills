---
name: opus-motion-lab
description: "Studio-grade code-driven motion design & audio-visual QA playbook distilled from Florence's Opus 5.5 Motion Lab. Enforces the 8-field Directed Motion Prompt spec, closed-form stateless spring(t, zeta, f), Motion Hierarchy (1 hero + 50-70% secondary + <5% ambient), ?t= URL frame freeze, Onion-Skin & Speed-Graph diagnostics, Dual-PMREM / 180-deg shutter 3D loops, and +1-frame cosine-crest / phone-band / -2.2 dBTP audio mastering. Use when building launch videos, motion-graphic loops, 3D product shots, kinetic typography, or code-rendered animations."
---

# Opus Motion Lab — Studio Motion Video Engineering

Code does not generate pixels; **code paints pixels as a pure function `f(t)`**. Every adjective left in a brief (`"premium"`, `"cool"`, `"modern"`, `"dynamic"`) hands a design decision back to generic model defaults. Replace every adjective with a physical number, curve, frame index, or decibel target.

---

## 1. Engine Selection Rule

Pick the engine in `OUTPUT` before writing a single frame:
- **Plain HTML + CSS / Canvas / SVG (`< 10s` single loop, zero install):** Kinetic type, UI cards, vector loops.
- **HyperFrames (HTML + GSAP → MP4, Apache 2.0):** Multi-scene beat-synced launch videos, explainers, web-native layouts.
- **Remotion (React + TypeScript → MP4):** Multi-minute films, data-driven/parameterized video series, reusable component libraries.
- **Three.js (`0.160.0+` / `r186`, WebGL GPU):** 3D product films, raymarched SDF morphs, voxel/mascot stages, shaders, PBR studio lighting.

---

## 2. The 8-Field Directed Motion Spec (Mandatory Pre-Flight)

Before coding any motion piece, lock all 8 fields explicitly:

```text
GOAL:    One sentence stating what the viewer feels or understands.
OUTPUT:  Engine + pinned library versions + W×H (1920×1080 16:9, 1080×1080 1:1, 1080×1350 4:5, 1080×1920 9:16).
TIME:    Duration (s) × FPS = Total frames N. Loop: yes (render 0..N-1; frame N-1 flows into 0) or no. BPM.
MODEL:   (If 3D/Character) Exact dimensions/units, bevel radii, invariant character proportions.
LOOK:    Hex palette + 1 accent, font + weight + px + tracking, PBR roughness/clearcoat/metalness, 3-point + PMREM studio lights.
MOTION:  Shared tokens only (cubic-bezier, spring damping ratio ζ, durations in frames, stagger overlap 30–50%).
SHOTS:   Frame ranges [f0..f1], ONE hero move per shot, explicit handoff (hard cut on beat by default, match cut, or mask wipe).
BANNED:  Explicit list of AI-slop defaults forbidden in this build (extended after Round 1).
QA:      renderAt(t) contract + stills at named hit frames + contact sheet + onion-skin/speed-graph + numeric scene audit.
```

### Default Ban List (Extend After Every First Render)
- Purple/blue dark-space gradients, glow orbs, neon halos, lens flares, unrequested bloom.
- Decorative floating particles.
- Everything fading in at once, or generic `fade + slide-up` on every element.
- Centered-everything layouts.
- Generic 360° spinning turntables.
- Text moving while the viewer is trying to read it.

---

## 3. The Render Contract (Non-Negotiable Determinism)

1. **Pure Function of `t`:** Every pixel at time `t` (seconds) depends ONLY on `t`. `renderAt(84 / fps)` called twice or out-of-order across workers MUST produce byte-identical output.
2. **Forbidden APIs:** Zero `Date.now()`, `performance.now()`, `setTimeout`, `setInterval`, CSS `transition`, or unseeded `Math.random()`. Seed all noise/grain by frame index `i`.
3. **URL Frame-Freeze Hook (`?t=2.5`):** Always include the `?t=` query hook before `</body>` that awaits `document.fonts.ready`, suppresses `requestAnimationFrame`, calls `window.renderAt(t)`, and pauses/seeks `document.getAnimations()` to `t * 1000`.
4. **Seamless Loop Indexing:** Render frames `0` to `N - 1` ONLY — NEVER frame `N` (`frame N === frame 0`, which causes a 2-frame stutter at the seam). Drive cyclic motion from `phase = frame / N` with integer cycle counts and circular noise sampling `(cos(2π·phase), sin(2π·phase))`. Ensure `frame 0` is already a complete, shareable thumbnail composition.

---

## 4. Motion Numbers & Stateless Token System (`assets/motion-tokens.mjs`)

Import shared tokens (`assets/motion-tokens.mjs`); **ban inline magic numbers**.

### Easing Curves (Andrey Sitnik Standard)
| Token | `cubic-bezier` | Role |
|---|---|---|
| `EASE.enter` (`ease-out-expo`) | `(0.16, 1, 0.3, 1)` | Text, title & logo reveals |
| `EASE.premium` (`ease-out-quint`) | `(0.22, 1, 0.36, 1)` | Calm, high-craft entrances |
| `EASE.move` (`ease-in-out-quart`) | `(0.76, 0, 0.24, 1)` | On-screen repositions & camera pushes |
| `EASE.exit` (`ease-in-expo`) | `(0.7, 0, 0.84, 0)` | Fast exits (**40–50% shorter** than entrance, e.g., 400 ms in → 200–240 ms out) |
| `EASE.pop` (`ease-out-back`) | `(0.34, 1.56, 0.64, 1)` | Playful badge/icon pop with overshoot |
| `linear` | `(0, 0, 1, 1)` | **ONLY** continuous rotation, progress bars, and loop `phase` |

### Universal Spring Damping Ratio (`ζ = d / (2 · √(k · m))`)
Evaluate analytically via closed-form `spring(t, zeta, freqHz)` — zero state accumulation:
- **`ζ = 1.0` (Critically damped, zero bounce):** UI panels, typography, opacity/color-adjacent reveals. *(Rule: position & scale may bounce; opacity & color NEVER bounce.)*
- **`ζ = 0.70 – 0.85`:** Premium industrial/product motion.
- **`ζ = 0.40 – 0.60`:** Playful props, tactile lids, character hops (`0.55`).
- **`ζ < 0.30`:** Exaggerated cartoon follow-through (e.g., `ζ = 0.22, f = 2.2 Hz` for loose arm settle).

### Durations, Stagger, Hierarchy & Beat Grid
- **Durations:** UI feedback `100–200 ms`; UI moves `200–500 ms` (`10 frames @ 24fps`); Hero reveals `600–900 ms` (`18 frames @ 24fps`).
- **Stagger & Overlap:** Letters `1 frame (20–40 ms)`, words `60–120 ms`, list items `40–80 ms`. Start the next item when the previous is **30–50% complete** (100% sequential = robotic; 0% = flat).
- **Motion Hierarchy (One Hero Per Shot):**
  - **Hero:** `100%` travel, primary focus (other elements wait, hold still, or dim to `40%`).
  - **Secondary:** `50–70%` of hero travel, delayed `100–200 ms`.
  - **Ambient:** `< 5%` travel on a continuous slow sine.
- **Drift-Free Beat Grid:**
  - `beatFrame(n, fps, bpm) = Math.round(n * fps * 60 / bpm)` — **NEVER** add a rounded frame interval repeatedly (`14.06` rounded to `14` drifts 2+ frames by beat 32).
  - **Cut on the beat; change layout on the bar (every 4 beats).**
- **Half-Frame Early Release on Beats:** When an anticipation crouch/press ends on beat frame `F_beat`, start the spring at `(F_beat - 0.5) / fps` so `F_beat` already renders the first moving frame instead of an extra frozen pose.
- **Text Hold & Accessibility:** Hold readable text for `>= 0.3s * wordCount + 0.5s` with a `2%` slow camera creep so the hold stays alive. Maintain `>= 4.5:1` WCAG contrast on every frame and `<= 3` flashes/sec.

---

## 5. Disney Principles as Exact Frame Numbers (Character & 3D Mascot Spec)

Translate feelings and principles directly into frame counts and scale tuples:
- **Anticipation:** `11-frame` crouch `(scaleX 1.20, scaleY 0.75)` before normal jump; `18-frame` deep crouch before big flip; `3-frame` reverse press (`1.5°`, `2%` squash) before mechanical lid snap.
- **Squash & Stretch (Volume-Preserving):** Takeoff stretch `(0.85 × 1.28)`, landing squash `(1.25 × 0.70)` → settle with `spring(t, 0.55, 3.0)`.
- **Overlapping Action:** Arms lag body by `4 frames`; legs lag by `6 frames`; paired objects stagger by `4 frames`.
- **Follow-Through:** Limbs/stems continue past body stop (`f = 2.2 Hz, ζ = 0.22–0.50`).
- **Exaggeration for Feed Viewport:** Push key poses **10–30% further** than desktop preview feels necessary so silhouettes read on mobile feeds.

---

## 6. Studio 3D & Shader Craft (Three.js Traps & Upgrades)

1. **Three.js `r160+` `TextGeometry` Trap:** Extrusion depth is `height` (e.g., `height: 0.12`), **NOT** `depth` (`depth` silently defaults to `50`!). Always pin exact Three.js version in `importmap`.
2. **Camera Discipline:** Product/studio FOV `18°–35°` (general 3D `35°–50°`), **never parked**; parallax layers at `1.0` (FG), `0.5` (MG), `0.2` (BG).
3. **Dual-PMREM Specular Glint:** Never light a sweeping glint strip in the diffuse environment (floods 170k+ pixels). Use a static studio PMREM for diffuse/irradiance and a **second specular-only PMREM** for sweeping glint strips + a dark camera-side negative-fill panel with a thin `-6°` horizon strip so chrome faces don't turn flat charcoal.
4. **Smooth-Min SDF Reveals:** Grow splitting/merging metaballs from negative radius (`-0.4`) so `smin` pull fades in without surface pops; reveal glyphs inside expanding spheres (`smax 0.05`) rather than linear `mix(sphere, glyph)` (which passes through flat coins).
5. **180° Shutter Subframe Motion Blur + 4× Jitter:** Average `4–8` subframes across `[t, t + 0.5/fps]` in **linear light** with quarter-pixel camera jitter offsets from `frac(t * fps)`.

---

## 7. The 4-Tool Visual & Numeric QA Loop ("Render, Look, Measure, Fix")

Never trust the first render (`2–4` focused review rounds of `1–2` notes per round is standard):
1. **Named Hit Stills:** Render stills around key beats (`0, 24, 48, 72, 96` and `hit - 1, hit, hit + 1`), view via `Read`, and verify viewer readability against `SHOTS`.
2. **4×3 Contact Sheet:**
   ```bash
   ffmpeg -framerate 24 -i out/frames/%04d.png -vf "select='not(mod(n\,12))',scale=400:-1,tile=4x3" -frames:v 1 out/contact.png
   ```
   Flag any tile where two unranked elements compete for attention.
3. **Onion-Skin & Speed Graph:**
   - Stack frames `f0..f1` at `25%` alpha: uniform spacing = robotic linear motion; spacing tightening near keys = healthy easing.
   - Plot hero `x(f), y(f), scale(f)` per frame to catch linear segments or dead sharp corners.
   - When a bug at frame `k` resists fixing, render `k - 1` and `k + 1` side-by-side and diff visually before editing a single line.
4. **Automated Scene Numeric Audit:** Run a headless script across all `0..N-1` frames asserting exact invariants (foot Y == pad Y on landing frames, zero UI/label bounding-box overlap, contrast `>= 4.5:1`).

---

## 8. Sample-Exact Audio Scoring & Social Export ("Light Beats Sound")

0. **Openverse SFX Search Rule:** Whenever sound effects are needed, search **Openverse** (`https://api.openverse.org/v1/audio/?q=<query>&license_type=commercial,modification`) to find the best real audio candidates (filtering for clean duration, CC0/permissive license, and clean transients) and use them for tasteful sound design alongside or in place of DSP layers.
1. **The `+1 Frame` Sync Law:** Every sound hit MUST peak **1 frame AFTER** its visual event (`peakSample = Math.round((frame + 1) * sampleRate / fps)`). Sound arriving early feels broken immediately; 1 frame after picture feels physical.
2. **Cosine-Phase Crest Alignment:** Never start percussive/tonal hit oscillators at `sin(0)` or through laggy `4×` oversampled waveshapers (delays waveform peak by `4–11 ms`). Start hit partials in **cosine phase** (with `0.5–1.0 ms` click-free ramp or attack ending on a cosine crest at exact `peakSample`) so the largest waveform lobe lands on `frame + 1`.
3. **Phone-Band Loudness (`200 Hz – 6 kHz`) & Hit-Over-Bed Margin:**
   - Overall `-14 LUFS` is deceptive if `>70%` of energy sits `< 60 Hz`. High-pass/balance sub energy so the `200 Hz – 6 kHz` phone band sits within `3–4 dB` of full-mix LUFS.
   - Measure K-weighted first-`60 ms` level of each hit against the bed: **every hit must sit `+3 to +6 dB` over the bed**; roll off harsh partials `> 8 kHz`; verify mono compatibility.
4. **AAC True-Peak Headroom (`-2.2 dBTP`) & Loop Seam Hygiene:**
   - Lossy AAC encoding lifts True Peak by `+0.8 to +1.0 dB`. Limit the 48 kHz stereo master WAV to **`-2.2 dBTP`** at **`-14 LUFS`** so the decoded MP4 stays strictly `<= -1.0 dBTP`.
   - Subtract per-channel DC offset (`mean = 0`). Keep the unpadded WAV for multi-loop concatenation, and apply a `2 ms` (`96-sample @ 48kHz`) raised-cosine fade to ends of single-play MP4s to prevent AAC `16 ms` padding clicks.
5. **Social Export & 24fps GIF Timing Trap:**
   - **MP4 (X / Social):** `libx264 -profile:v high -pix_fmt yuv420p -crf 18 -movflags +faststart`, audio `aac -b:a 192k -ar 48000`. Verify loop seam via `ffmpeg -stream_loop 2 -i out/anim.mp4 -c copy out/loop_check.mp4`.
   - **GIF (X Articles, `<= 15 MB`, `<= 350 frames`, `1200 px` wide):** Single global palette (`palettegen=stats_mode=diff` + `paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`). At `24 fps` (`41.67 ms`), GIF's `10 ms` delay unit runs 4% fast if rounded to `40 ms` — alternate **`5 frames @ 40 ms + 1 frame @ 50 ms`** (`250 ms` per 6 frames = exact `24.00 fps`).

---

## 9. Translation Table: Vague Feedback → Deterministic Edits

| Vague Note | Exact Code Change |
|---|---|
| `"Make it pop"` | Scale `1.0 → 1.08 → 1.0` over `6 frames`, peaking on `beatFrame + 0`. |
| `"Make it feel premium"` | `EASE.premium` (`0.22, 1, 0.36, 1`) on entrances, `spring(t, 0.8, 2)` on moves, zero text overshoot. |
| `"It drags"` | Shorten each hold by `1 beat` (`fps * 60 / BPM` frames) so all downstream cuts stay on the beat grid. |
| `"It feels busy"` | Enforce 1 hero move; delay secondary moves `+150 ms` and cut travel to `60%`; strip `30%` of non-guiding motion. |
| `"Flicker / jitter"` | Remove timers/CSS transitions; replace `Math.random` with frame-seeded PRNG; snap resting text to integer px. |
| `"Banding in GIF"` | Use flat colors or add `1.5–2%` frame-seeded dither/grain; single global `palettegen`. |
