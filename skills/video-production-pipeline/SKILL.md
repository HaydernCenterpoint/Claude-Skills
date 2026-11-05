---
name: video-production-pipeline
description: Master v3.0 9-Stage REA Studio Video Production Orchestrator unifying Reverse-Engineer-Anything (REA) reference/UI deconstruction, Opus Motion Lab 8-field spec, Viewer-Read choreography, 10 specialized animation/video engines (directing-stickman-videos, median-lab-video, claude-animation-base, shorts-animator, scenario-kinetic-film, video-shotcraft, mg-styles-15, svg-video-engine, Blender/AE/Premiere MCPs, ffmpeg-skill), 4-Tier Hybrid Audio (Openverse + earshot-dsp + mgaudio + Neural/Kokoro/Gemini TTS), Subframe Shutter Blur, Optical-Flow/Hold Quantitative QA, and Clean-Context Harsh Jury review.
---

# Master v3.0 9-Stage REA Studio Video Production Pipeline (`video-production-pipeline`)

## 0. Non-Negotiable Studio Golden Rules

1. **Single Deterministic Master Clock (`t = frame / fps`)**:
   - Every visual and audio generator MUST be a pure, stateless function of `t = frame / fps` (exposed via `window.renderAt(t)` / `window.seekTo(t)` / Remotion `useCurrentFrame()`).
   - **STRICTLY FORBIDDEN:** Free-running `requestAnimationFrame` state accumulation (`x += vx`), `setInterval`, `Date.now()`, un-seeked CSS `@keyframes`, or unseeded `Math.random()`.
   - **12 fps Hand-Drawn Boil ("On Twos"):** Seed per-element boil with FNV-1a(`key`) × `Math.floor(t * 12)` (`boilSeed(key)` in `claude-animation-base` / `uTick` in `shorts-animator`) so static background props hold 2 frames cleanly even when moving foreground actors add draw calls.
2. **Pure Normal Matte-White Stickman (`#f8fafc` — ZERO Accessories, ZERO Face)**:
   - Whenever **Stickman (Alex)** appears in any engine, render a **clean, normal matte-white stick figure (`#f8fafc`)**: solid filled circular head (`ctx.fill()`), round-capped spine + 2-bone IK limbs (`3-1-3` Chaikin B-bone subdivision + `Styk` 3-tier stroke hierarchy `Torso 1.14× : Leg 1.00× : Arm 0.86×`).
   - **STRICTLY FORBIDDEN on Stickman:** NO cape or scarf (`không áo choàng / khăn`), NO face/eyes/mouth/lip-sync/soul-arc (`không khuôn mặt`), NO baton/wand/props (`không gậy chỉ bảng`), and NO glow/chalk dust.
3. **Openverse Sound Effects First (`https://api.openverse.org/v1/audio/`)**:
   - Whenever sound effects (SFX) are needed, query **Openverse** (`node rea-video-studio/openverse-sfx.mjs "<query>"` or `api.openverse.org/v1/audio/?q=...&license_type=commercial,modification`) to curate real organic CC0/CC-BY audio textures, layered tastefully with `earshot-dsp.mjs` physical Foley and `mgaudio` VCSL samples.
4. **100% English Voiceover & Subtitles Default (Unless User Explicitly Requests Another Language)**:
   - Default to 100% English scripts, 5-Mode Dynamic Neural Prosody (`en-US-AndrewMultilingualNeural` or Kokoro `bm_george`/`bf_emma`), and clean safe-zone subtitles.

---

## 1. Engine Routing Matrix (Pick the Right Studio Engine First)

| Video Archetype / Request | Primary Skill(s) | Core Rendering & Motion Stack |
|---|---|---|
| **1. Stickman Storytelling, Explainers & Autopilot Films** | `directing-stickman-videos` + `opus-motion-lab` | **Mode A (Director A1–A5):** 5-Stage High-Completion Heartbeat Engine + Styles 1–5 (Classic Minimalist, Modern Beanie 2A/2B, Prehistoric 3, Cozy 4, Historical 5) + Omni Flash 10s `[0–3s]/[3–7s]/[7–10s]` beat prompts.<br>**Mode A6 (Amber Noir):** Veo 3.1 Fast 8s reference-guided shots + Gemini Puck voice + `a6_finish.py` uppercase active-word captions.<br>**Mode B (Autopilot B1):** `@napi-rs/canvas` local renderer (`autopilot.mjs validate/preview/approve/render`), `#FDFDFC` warm grid, Caveat/NotoSans captions, Whisper `align_captions.py` & content-addressed shot cache (while keeping pure matte-white `#f8fafc` faceless Alex for math videos). |
| **2. First-Principles Math / Physics / Science Explainer** | `median-lab-video` + `svg-video-engine` | Interleaved frameless 2D geometry + synchronous `Three.js` 3D manifolds + Wikipedia primary-source cards + 5-mode prosody |
| **3. Hand-Painted 2D Cartoon / Expressive Character Story** | `claude-animation-base` | `p5.js` + `p5.brush` WebGL2 (`marker`/`charcoal`/`cpencil`/`rotring`), `boilSeed(key)` 12fps boil, 31 acted `emotions()`, 5-view `turn()`, `--crop-at` QA |
| **4. Faceless Painted Vertical Short (TikTok / Reels / Shorts)** | `shorts-animator` | 2D `kit.js` scene primitives → WebGL2 GPU `paint.js` shader (`oil`, `watercolor`, `pastel`, `ink`, `gouache`) on twos + Kokoro local TTS + procedural score |
| **5. High-Energy Beat-Grid Launch Film / Game Teaser / Trailer (60fps / 4K)** | `scenario-kinetic-film` | 14 kinetic blocks (`Words`, `Strike`, `Fly`, `Stretch`, `Graph`, `Counters`, `Rewind`, `Logo`…), variable `Archivo` (`wdth 62–125`), dynamic `180°–600°` shutter blur + dual-radius bloom + grain |
| **6. Cinematic SaaS / Web / App Product Promo** | `video-shotcraft` | 124 Remotion shot recipe cards (`references/shots/*`), CSS `zoom` sharp 2.5D UI planes (`Q2`), Ink Press template, interactive `workbench` (`:5198`), JianYing draft export |
| **7. Distinct Art-Directed Motion Piece (15 Canonical Styles)** | `mg-styles-15` | 15 style prompts (`01-flat-vector` … `22-hud`), `harness/render.mjs` subframe `tmix` + Fritsch–Carlson `--tmap` speed-ramp, `mgaudio` 48kHz + 103 VCSL samples |
| **8. Resolution-Independent Vector / Diagram Timeline** | `svg-video-engine` | Pure `f(t)` SVG scene graph (`core-svg.js`), safe `pathLength="1"` stroke reveals, `morphPath`, embedded base64 `@font-face` |
| **9. 3D Cinema, Hybrid 2D/3D, Turntables & VFX Plates (116 Blender Skills)** | `blender-director` (94-skill Art/Style/Cinematography pack) + `blender-core` (`EL4CTEO` 22-skill Blender 5.2 `bpy` & Mesh QA pack) + `after-effects` + `premiere-pro` | **Art & Shot Direction (`arjun988`):** `blender-director` brief → 39 style/world/era packs (`anime-style`, `painterly-style`, `hd-2d-style`, `stop-motion-craft-style`, `isometric-style`, `noir-style`, `visual-console-eras`…) → `camera-cinematography` (`CAM_*` + `EMPTY_CamTarget_*`) → `compositing` (AgX multilayer EXR + Glare + Mist) → `reference-image-match` 3-pass loop.<br>**5.2 Execution & Numerical QA (`EL4CTEO` + Live MCP):** `mcp__blender__get_scene_info(fields=["ground","topology","settings"])`, locale-safe `n.type == "BSDF_PRINCIPLED"`, `mcp__blender__look(mode="angles" \| "frames")`, `blender-asset-qa` |
| **10. Footage Editing, Reframing, Captions, Sync & Delivery Mastering** | `ffmpeg-skill` | 42 Python 3.10+ stdlib tools (`probe.py`, `cut.py`, `fit.py`, `caption.py`, `loudness.py`, `sync.py`, `multicam.py`, `export.py`, `check.py`, `look.py`) + FCPXML/EDL/OTIO |

---

## 2. The 9-Stage Closed-Loop REA Studio Pipeline

```
[Stage 0: REA EVIDENCE & REFERENCE DECONSTRUCTION (`reverse-engineer-anything` + `studio.py deconstruct`)]
   ├─ Product/Web Target ─► REA `analyze_javascript_application` / `inspect_web_page` / `capture_browser_scenario`
   │                        (Extracts real colors, fonts, DOM copy, routes, JSON shapes & 2x/4x crisp UI stills)
   └─ Reference Video/Track ─► `python rea-video-studio/studio.py deconstruct <ref>`
                               (Measures exact BPM, downbeats, drop rise, optical-flow px/f, hold %, cut rate, LUFS)
       │
       ▼
[Stage 1: ENGINE SELECTION, 8-FIELD OPUS SPEC & VIEWER-READ CHOREOGRAPHY]
   • Lock `GOAL / OUTPUT / TIME / MODEL / LOOK / MOTION / SHOTS / BANNED / QA` (`opus-motion-lab`)
   • Write the Reads (`claude-animation-base`): 1 Hero Read at a time | Fast snaps (0.1–0.2s) | Slow meaning holds (0.6–1.2s) | 0.25s eye-lead
   • Drift-free beat math: `frame = Math.round(beat * fps * 60 / BPM)` (never accumulate rounded deltas)
       │
       ▼
[Stage 2: DETERMINISTIC SCENE IMPLEMENTATION & ANTI-BLUR GEOMETRY]
   • Pure `f(t)` state; `?t=` URL frame freeze; loop frames `0 .. N-1`
   • 3D CSS Sharpness Law (`video-shotcraft Q2`): NEVER `scale()` inside `preserve-3d`; use layout `zoom: S` + `Tx = 960/S - cx` + 2x/4x hires rasterize
   • Typography Law (`Q11`): Minimum effective pixel height >= 56 px at 1080p (`fontSize * effectiveScale >= 56`); tabular-nums on counters
       │
       ▼
[Stage 3: MULTI-ZOOM VISUAL REA LOOP GATE (`--sheet`, `--strip`, `--crop-at`, `--onion`, `--diff`)] ◄─┐
   • Full contact sheet (`--sheet` / `SA frames` / `look.py`)                                         │ Fix geometry,
   • Action frame strip (`--strip`) + World-tracked detail zoom (`--crop-at`)                         │ tangents, clip
   • Onion-Skin + Speed Graph (`--onion`) + Single-frame pixel diff (`--diff`)                        │ or contrast
       ├────────────────────────────────────────── FAIL ──────────────────────────────────────────────┘
       ▼ PASS
[Stage 4: 4-TIER HYBRID SOUND DESIGN & VOICE SYNTHESIS (`48 kHz Stereo WAV`)]
   • Tier 1: Openverse real acoustic textures (`node rea-video-studio/openverse-sfx.mjs "<query>"`)
   • Tier 2: `earshot-dsp.mjs` Forge v2 physical Foley (3-band SVF whoosh + receding wake, Bessel thud, <300Hz sub, Kalimba/Pop)
   • Tier 3: `mgaudio` chord-locked music + 103 VCSL samples (`mg-styles-15`) or `beat_grid.py`-locked track
   • Tier 4: 5-Mode Neural TTS (`median-lab-video`) or Kokoro local TTS (`shorts-animator`)
   • Sync Laws: `+1 frame` cosine-phase impact crest + Risers END at `t_cut` + AAC ~2048-sample (`~43ms`) priming compensation (`S5`)
       │
       ▼
[Stage 5: ACOUSTIC & SPECTROGRAM REA GATE (`verify-sfx-loop.mjs` + `mgaudio.qc`)] ◄───────────────────┐
   • WAV Ceiling `-2.2 dBFS` (so AAC stays <= `-1.0 dBTP`), `-14..-16 LUFS`, `PhoneBand >= -8 dB`,    │ Re-voice SVF
     `Sub<60Hz < 55%`, `Crest >= 3.5`, `DC/Edge <= -40 dB`, `Clips = 0`, Onset delta <= `1.5 frames`  │ or gain stage
       ├────────────────────────────────────────── FAIL ──────────────────────────────────────────────┘
       ▼ PASS
[Stage 6: SUBFRAME SHUTTER BLUR, BLOOM, GRAIN & PARALLEL GPU RENDER]
   • Headless Chrome (`--run-all-compositor-stages-before-draw`, 1920x1300 clipped to 1920x1080, `clip.scale = dpr`)
   • Dynamic shutter motion blur (`180°` default, up to `600°` / 24 sub-samples on whips, NEVER crossing hard cuts)
   • Quarter-res dual-radius bloom + deterministic grain + BT.709 Lanczos `aq-mode=3` H.264 Level `4.2` (1080p) / `5.2` (4K)
       │
       ▼
[Stage 7: QUANTITATIVE OPTICAL-FLOW, HOLD, GLITCH & PLATFORM COMPLIANCE GATE] ◄───────────────────────┐
   • Run: `python rea-video-studio/studio.py audit <video.mp4> --profile <kinetic|explainer|short|product>`
   • Checks: `audit.py` (0 stale/frozen frames, 0 unintended luma spikes), `dyn.py` (optical flow),   │ Fix dead holds,
     `holds.py` (parked stretches), `check.py` (frame count, H.264 level, BT.709, faststart, LUFS)    │ codec or level
       ├────────────────────────────────────────── FAIL ──────────────────────────────────────────────┘
       ▼ PASS
[Stage 8: CLEAN-CONTEXT HARSH JURY SUBAGENT (`mg-styles-15/rubric.md` × `video-shotcraft/final-review.md`)]
   • Spawn fresh `Agent` (unanchored) with contact sheet + QA JSON to score 7 Buck/Motionographer axes (1–10)
   • Any score < 7 or mean < 8.0 triggers surgical revision (max 2 rounds) before final handoff.
```

---

## 3. High-Leverage REA Techniques for Video Creation

1. **Zero-Hallucination Product Videos via REA Static + Runtime Extraction**:
   - Instead of inventing generic SaaS boxes when asked to promote an app/repo/website:
     - Run `mcp__rea__analyze_javascript_application` (`detail: "summary"`) + `mcp__rea__inspect_analysis_view` on local app code/ASAR to recover real routes, feature names, IPC/API surfaces, and theme tokens.
     - Or run `mcp__rea__capture_browser_scenario` / `mcp__rea__inspect_web_page` / `mcp__rea__capture_web_screenshot` against the running app to capture pixel-authentic 2×/4× UI states for `video-shotcraft` 2.5D planes and `scenario-kinetic-film` `Picture`/`Hero` blocks.
2. **Empirical Style Cloning via `studio.py deconstruct` + `rectify2.py`**:
   - When given a reference video or screen-recorded showcase, never eyeball pacing:
     - Flatten tilted laptop/phone mockups in reference footage with `~/.claude/skills/scenario-kinetic-film/scripts/rectify2.py` (homography rectification) to measure real typography scale and layout margins.
     - Measure exact cut frequency (`cuts_per_10s`), optical-flow velocity (`median_flow`, `p90_flow`), hold budget (`still_share`), and music drop alignment (`beat_grid.py`) with `python rea-video-studio/studio.py deconstruct <reference.mp4>`.
3. **Pixel-Diff & Reference-Match Convergence (2D Web + 3D Blender)**:
   - Compare before/after 2D frames with `mcp__rea__compare_web_screenshots` or `render.mjs --diff=fA,fB` to prove zero unintended visual drift.
   - For 3D shots (`blender-director` + `~/.claude/skills/references/reference-image-match.md`): write the Reference Analysis first, match `CAM_*` + `EMPTY_CamTarget_*` before adding Tier-2 panel breaks or Tier-3 greebles, keep emissive animations on per-instance `MAT_LightInst_*` (never shared hull materials), inspect multi-angle + timeline strips via `mcp__blender__look(mode="angles")` and `mcp__blender__look(mode="frames", view="camera", frame_count=9)`, and verify numerical topology/ground contact via `blender-asset-qa` + `qa-review` (`SHIP / NO-SHIP`).

---

## 4. Standard Studio Commands (`rea-video-studio/studio.py`)

```bash
# 1. Verify entire 10-engine video toolchain & installed skills:
python "C:/Users/datmk/OneDrive/Desktop/Video  Builder/rea-video-studio/studio.py" doctor

# 2. Reverse-engineer a reference video or music track into quantitative targets:
python "C:/Users/datmk/OneDrive/Desktop/Video  Builder/rea-video-studio/studio.py" deconstruct path/to/reference.mp4 --bpm 128

# 3. Search Openverse for CC0 / CC-BY sound effects (Mandatory SFX rule):
node "C:/Users/datmk/OneDrive/Desktop/Video  Builder/rea-video-studio/openverse-sfx.mjs" "cinematic whoosh impact" --download ./audio/sfx

# 4. Run full Quantitative QA Gate (Glitch Audit + Optical Flow + Holds + Codec/LUFS/Safe-Zone Sheet):
python "C:/Users/datmk/OneDrive/Desktop/Video  Builder/rea-video-studio/studio.py" audit renders/final.mp4 --profile kinetic --platform youtube --bpm 128
```
