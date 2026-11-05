# Voice, Prosody & Audio Architecture (@median-lab)

Measured directly from `@median-lab` 48 kHz stereo Opus audio streams (`UXk8T9fpcWQ`, `fq_MonAqbMw`, `HI4JF--cae8`, `-Dj9-fDV4Fg`, `3d8rRx3LLTE`).

---

## 1. Acoustic & Prosodic Fingerprint (Measured Ground Truth)

| Metric | Measured `@median-lab` Value | Target Specification |
|---|---|---|
| **Fundamental Frequency ($F_0$)** | Median `133.3 Hz`, Mean `135.9 Hz`, P10–P90 `[108.8, 166.7] Hz` | Grounded, calm male baritone/tenor (`125–145 Hz` center), narrow pitch variance (`std ~20–25 Hz`) — zero hype inflection |
| **Speaking Rate (Vietnamese)** | `193 – 206 syllables/min` (`3.22 – 3.44 syllables/sec`) | `190 – 210 syllables/min` at natural `TEMPO = 1.00` |
| **Speaking Rate (English)** | Equivalent cognitive density | `140 – 155 words/min` at natural `TEMPO = 1.00` |
| **Playback Tempo Multiplier** | `1.00x` | **Always `1.00x`** (Never speed up with `atempo=1.08`) |
| **Short Clause Pauses (`0.35s – 0.80s`)** | `24.3 – 30.1 pauses/min` | One micro-pause every `6–9 words` (`0.45s – 0.65s`) |
| **Medium Cognitive Pauses (`0.80s – 1.80s`)** | `5.7 – 8.6 pauses/min` | After equations, key questions, or *"Hình dung thế này..."* (`1.0s – 1.5s`) |
| **Dramatic / Chapter Pauses (`≥ 1.80s`)** | `0.8 – 1.2 pauses/min` | Cold open (`1.0s` silence) + Chapter title cards (`3.0s – 3.8s`) |
| **Integrated Loudness ($I$)** | `-13.8 LUFS` | `-14.0 LUFS ± 0.5 LU` |
| **Loudness Range ($\text{LRA}$)** | `3.4 LU` (`-16.5` to `-13.2 LUFS`) | `3.0 – 4.5 LU` (tight, intimate broadcast compression) |
| **True Peak ($\text{TPK}$)** | `-2.2 dBFS` | `≤ -1.5 dBFS` |
| **Speech RMS vs. BGM Floor** | Speech `-14.2 dBFS` vs. BGM `-36.8 dBFS` (**`22.6 dB` separation**) | BGM sits **`20 – 23 dB` below speech** during narration, swelling gently by `+6 dB` (to `-30 dBFS`) only during `>2.5s` chapter pauses |

---

## 2. Voice Persona & TTS Engine Configuration

The `@median-lab` narrator never sounds like a salesperson, trailer announcer, or excited YouTuber. The voice sounds like **a calm, lucid thinker speaking quietly in an acoustically treated dark room late at night**—confident, unhurried, slightly warm, letting the weight of each logical deduction carry the authority.

### Primary Engine: Native Clause-Level Dragon HD Neural TTS (`en-US-AndrewMultilingualNeural` / `vi-VN-NamMinhNeural`)
- **Why Native Clause-Level Neural Synthesis Beats Monolithic TTS**:
  - Monolithic TTS calls read long sentences with a flat, uniform cadence (`F0 range ~25 Hz`).
  - `scripts/synth-median-audio.py` splits every sentence at rhetorical pivots (`—`, `...`, `:`, contrastive commas) into **3 Prosodic Clauses ("Nhấn – Nhá – Thả")** and synthesizes each clause natively with its own neural `rate`, `pitch`, and exact `WordBoundary` stream:
    1. **NHẤN (Opening / Thesis Setup)**: Native `rate="-2%"`, `pitch="+0Hz"`, `+1.0 dB` presence (`F0` rises up to `~160 Hz` on key concepts).
    2. **NHÁ (Rhetorical Suspension Breath)**: Injects a `220ms–240ms` contemplative silence at the pivot before the payoff clause.
    3. **THẢ (Resolution / Gravitas Release)**: Native `rate="-6% to -8%"`, `pitch="-3Hz"` (`F0` drops to `~85 Hz` deep baritone chest resonance) with a cosine exhale taper (`-1.4 dB` on final words) and zero time-stretch artifacts.
- **Measured Acoustic Output**:
  - Median $F_0$: **`115 – 118 Hz`** (warm grounded male baritone)
  - Dynamic Pitch Span ($P_{10} - P_{90}$): **`83 Hz – 161 Hz` (`~72 Hz` natural conversational range)**
  - Loudness: **`-14.0 LUFS`**, Loudness Range (`LRA`): **`4.1 LU`** (`-17.7` to `-13.6 LUFS`), True Peak: **`-4.6 dBFS`**.

---

## 3. The 4-Tier Pause Architecture (Timeline Scheduling Rules)

Do not butt voice lines tightly against each other (`0.12s` gaps feel frantic and prevent mathematical comprehension). When scheduling lines in `build-timeline.mjs`:

1. **Tier 0 — Cold Open Silence (`1.00s`)**:
   - The video starts with `1.00s` of pure dark canvas and silence (`< -65 dBFS`) while the first geometric primitive or symbol (`π`) gently draws in. Speech begins at `t = 1.00s`.
2. **Tier 1 — Intra-Line Clause Breath (`0.45s – 0.65s`)**:
   - Naturally produced by TTS at commas/periods; when splitting lines, enforce at least `0.50s` between normal consecutive declarative lines.
3. **Tier 2 — Cognitive / Visual Sink-In Pause (`1.00s – 1.60s`)**:
   - Insert after:
     - A Socratic question (*"Tại sao lại như vậy?"*, *"Why must it be 3.14?"*)
     - A visual setup cue (*"Bạn hình dung thế này."*, *"Nhưng bạn có thể làm thế này."*)
     - An equation or limit step completing on screen (`N = 6 → 12 → 24 → 96`)
     - A proof step landing (*"Xong bước hai."*, *"Kết quả tự rơi ra theo logic."*)
4. **Tier 3 — Chapter Transition Hold (`3.00s – 3.80s`)**:
   - Between major chapters (`PHẦN 1`, `PHẦN 2`, ...), leave a `3.2s – 3.8s` vocal silence. During this window, the chapter card fades in, holds for `2.0s`, and fades out while the ambient pad gently rises from `-36 dBFS` to `-28 dBFS` and settles back down before the next sentence starts.

---

## 4. Background Music (BGM) & Micro-SFX Rules

### Background Music: Minimalist Ambient Drone / Felt Piano
- **Genre**: Beatless ambient synth pad, warm analog drone, or sparse felt piano (inspired by Vincent Rubinetti / 3Blue1Brown ambient soundtrack).
- **Strictly Forbidden**: Kick drums, hi-hats, trap/hip-hop beats, synthwave drops, upbeat corporate ukuleles.
- **ElevenLabs Music Plan Prompt (`data/music-plan.json`)**:
  ```text
  Minimalist contemplative ambient soundtrack for a mathematics and physics documentary. Warm deep analog synth pads, subtle resonant glass harmonics, and sparse soft felt piano notes with long reverb tails. Beatless, no drums, no percussion, no rhythmic pulse, meditative, intellectual, mysterious, slow harmonic evolution in D minor / F major.
  ```

### Audio Mixing Chain (`ffmpeg`)
```text
voice: highpass=f=80, equalizer=f=135:t=q:w=1.2:g=2.0 (warm baritone body),
       acompressor=threshold=-20dB:ratio=3.5:attack=10:release=180:makeup=4dB,
       loudnorm=I=-14.0:TP=-2.0:LRA=3.5
bgm:   lowpass=f=3200 (keep upper mids clear for voice), volume=-22dB,
       sidechaincompress(threshold=0.02, ratio=2.5, attack=40, release=800)
### Diegetic Tactile Micro-SFX (`scripts/build-median-sfx.py`)
Every visual animation in `@median-lab` has a subtle, tactile physical sound (`-18 to -22 dBFS`, automatically ducked `-4.5 dB` when overlapping loud spoken vowels, ringing clearly in pauses):

| SFX Primitive | Duration | Acoustic Design | Visual Trigger |
|---|---|---|---|
| `chapter-swell` | `3.10s` | Warm harmonic fifth (`D2–A2–D3–A3–E4`) + soft low-passed air swell | Every `3.4s` Chapter Title Card (`PART 1` … `PART 6`) & 3D Torus finale |
| `chalk-draw` | `0.95s` | Band-passed slate friction + subtle harmonic rise (`240 → 420 Hz`) | Circles, polygons (`N=6`), grids, and 3D wireframes (Sphere, Pyramid, Saddle, Gravity Well) drawing in |
| `unwrap-sweep` | `1.60s` | Smooth octave glide (`165 → 277 Hz`) + soft air motion | Circumference `C` unrolling, disk area sweep, radian arc sweeps (`1 rad`, `π rad`, `2π rad`), 3D helix wave |
| `soft-pop` | `0.16s` | Warm wooden/glass marimba impulse (`210 → 450 Hz`) | Points, 3D stones (`1+1=2`), portrait nodes (`Archimedes`, `Lambert`, `Lindemann`), thesis numbers (`01–04`) |
| `strike-slash` | `0.28s` | Crisp double-stroke chalk slash + muted `145 Hz` thud | Every red refutation cross (`✕`) or horizontal strike-through (`2`, `4`, `a/b`, `CIRCLE?`, `C/d = π`) |
| `tick-step` | `0.09s` | Precision damped crystal/mechanical counter tick (`980 + 1960 Hz`) | Polygon doubling (`N = 6 → 12 → 24 → 48 → 96 → 12,288`), decimal streams, `360°` ticks |
| `spotlight-shift` | `0.55s` | Soft low-mid spatial whoosh + `392/587 Hz` harmonic focus ping | Selective Spotlight Dimming shifts (`Pendulum → Sound → AC`, `Sphere → Saddle → Well`, Quadrants `01–04`) |
| `theorem-chime` | `2.20s` | Contemplative suspended felt-piano / resonant bell chord | Key ontological revelations (`C/d = π`, `3.1408 < π < 3.1429`, `π = LIMIT`, `ROTATION`, `TRANSCENDENTAL`) |
