# Visual & Animation System ("Obsidian First-Principles Cinema")

Measured directly from 4K/1080p 60fps video streams and storyboard sprite sheets of `@median-lab` (`UXk8T9fpcWQ`, `fq_MonAqbMw`, `HI4JF--cae8`, `3d8rRx3LLTE`).

---

## 1. The Obsidian Canvas & Spatial Discipline

1. **Background Void (`#080808` – `#0c0c0c`)**:
   - Never use pure `#000000` flat black without texture, and never use colorful gradients or busy backgrounds.
   - Base canvas: `#080808` with a subtle center radial vignette (`radial-gradient(circle at 50% 50%, #121212 0%, #080808 72%, #040404 100%)`) and a faint static film/stardust noise overlay (`opacity: 0.035`).
2. **85%–92% Negative Space Rule**:
   - At any frame, **at most 1 to 3 visual groups** occupy the screen.
   - Never use dashboard UI cards, bordered boxes, chat bubbles, or multi-column text panels. Mathematical objects live directly in infinite dark space.
3. **Frameless Word-Synced English Subtitles & Pure White Stickman**:
   - Render clean, frameless word-synced **English subtitles** at the bottom safe zone (`Y = 998`, `26px BeVietnamPro Bold`, active word highlighted in `#38bdf8` / `#facc15` with drop shadow, no background box).
   - Render the Stickman presenter as a **pure matte-white normal stickman (`#f8fafc`)** — solid white circle head, no cape/scarf, no face/eyes/mouth, no baton/props, no glow.

---

## 2. Color Tokens (Monochrome by Default, Semantic Color by Necessity)

Measured RGB histograms across `@median-lab` videos show **99.9% achromatic grayscale** in single-concept scenes, with muted chromatic accents appearing **only** when encoding a conceptual distinction (e.g., scalar distance vs. vector displacement, positive vs. negative region, inside bound vs. outside bound).

```css
:root {
  /* Canvas */
  --bg-void: #080808;
  --bg-glow: #161616;

  /* Achromatic Hierarchy (95%+ of all pixels) */
  --chalk-primary: #ebebeb;    /* Active geometry, primary equation, main title */
  --chalk-secondary: #949494;  /* Secondary labels, sub-captions, axes, ticks */
  --chalk-muted: #525252;      /* Reference lines, dashed guides, inactive steps */
  --chalk-ghost: #262626;      /* Faint watermarks, background coordinate grids */

  /* Semantic Accents (Use ONLY when contrasting 2–3 concepts simultaneously) */
  --accent-blue: #6b8cae;      /* Concept A: Scalar / Distance / Inscribed / Input */
  --accent-blue-glow: rgba(107, 140, 174, 0.18);
  --accent-gold: #d4b46a;      /* Concept B: Vector / Displacement / Circumscribed / Output */
  --accent-gold-glow: rgba(212, 180, 106, 0.18);
  --accent-red: #c96b6b;       /* Refutation / Contradiction / Error highlight only */
}
```

---

## 3. Typography & Hierarchy

- **Primary Font**: `Be Vietnam Pro` or `Inter` / `Plus Jakarta Sans` (clean geometric sans-serif with crisp Vietnamese diacritics).
- **Math / Symbol Font**: Clean serif/math (`STIX Two Math`, `KaTeX_Main`, `Instrument Serif`, or clean geometric sans with proper Unicode math symbols `π`, `√`, `≤`, `≥`, `×`, `÷`, `Δ`, `→`, `∞`). Never use raw ASCII `*` or `/` for multiplication/division.

| Element | Size (1080p) | Weight | Color | Style Rules |
|---|---|---|---|---|
| **Chapter Kicker** | `16px` | `600` | `#787878` | Uppercase, `letter-spacing: 0.28em`, e.g., `PHẦN 1` / `PART 1`, centered `28px` above chapter title |
| **Chapter Title** | `46px` | `700` | `#ebebeb` | Sentence case (e.g., `Con số này đến từ đâu`), centered, optional faint `180px` watermark (`opacity: 0.05`) behind |
| **Hero Symbol / Formula** | `72px–120px` | `600` | `#ebebeb` | Centered or upper-third focal anchor (`π`, `(-1) × (-1) = 1`, `C / d = π`) |
| **Concept Header** | `28px–34px` | `700` | `#ebebeb` | Uppercase or sentence case (`QUY ƯỚC THẾ THÔI`, `SỰ QUAY`), paired with `18px` `#8c8c8c` subtitle below |
| **Geometric Label** | `20px–24px` | `500` | `#949494` | Positioned `14px–20px` offset from line/arc midpoint (`r = 1`, `N = 96`, `P(trong) < C < P(ngoài)`) |

---

## 4. The 8 Canonical `@median-lab` Animation Primitives (60fps)

All animations run at **60 FPS** (or smooth 30 FPS) using continuous easing (`power3.out`, `sine.inOut`, `cubic-bezier(0.22, 1, 0.36, 1)`). **Never use stepped `on2` (12fps), screen shakes, flashbangs, or RGB glitch filters.**

### Primitive 1: Chapter Card with Contemplative Hold (`3.2s – 3.8s`)
- Fade out all previous geometry (`0.5s`).
- During a `3.5s` voice pause, fade in the tracked kicker (`PHẦN 2`) and sentence-case title (`Cách Archimedes bắt được pi`) with a subtle `y: 12 → 0` rise (`0.7s power3.out`), hold for `2.0s`, and fade out (`0.6s`) before the next spoken sentence begins.

### Primitive 2: Progressive Geometric Construction (`strokeDashoffset`)
- Every circle, line segment, triangle, and axis is drawn progressively in sync with speech:
  - Point pops in (`scale: 0 → 1`, `0.25s back.out(1.6)`).
  - Radius line extends (`strokeDashoffset: len → 0`, `0.5s power2.out`).
  - Circle sweeps around (`0° → 360°`, `0.9s sine.inOut`) as the radius vector rotates.
  - Stroke weights: primary geometry `2.2px–2.8px` (`#ebebeb`), secondary construction lines/spokes `1.0px–1.4px` (`#525252` or `rgba(235,235,235,0.28)`), dashed reference lines `stroke-dasharray: 5 5` (`#787878`).

### Primitive 3: Geometric Unwrapping & Continuous Projection
- **Circle Unwrap (`C = πd`)**: A circle's rim detaches and unrolls smoothly into a horizontal straight line segment `C` directly above a dashed diameter line `d`, visually demonstrating that `C` is slightly longer than `3 × d` (`3.14159...`).
- **Unit Circle to Sine Wave (`Ở đâu có sự quay, ở đó có π`)**: A unit circle on the left rotates continuously while a horizontal projection line traces a smooth sine wave to the right (`1 chu kỳ = 2π`), accompanied by 3 minimal line-art icons below (`Con lắc`, `Sóng âm`, `Dòng điện AC`) that illuminate one by one as each is named.

### Primitive 4: Limit Morphing & Exhaustion (`N = 6 → 12 → 24 → 96 → ∞`)
- To visualize a limit or calculus process:
  - Draw the base circle (`#ebebeb`, `2px`).
  - Draw the inscribed polygon (`#949494`, `1.5px`) and circumscribed polygon (`#686868`, `1.5px`) with radial spokes from the center (`rgba(255,255,255,0.15)`) and a soft radial glow (`radial-gradient`) at the center.
  - Display a clean counter in the top-right of the diagram (`N = 6`) and the bounding inequality below (`P(trong) < C < P(ngoài)`).
  - On each spoken number (`12`, `24`, `96`), morph the polygon vertices smoothly toward the circle while updating `N = 12 → 24 → 96` and tightening the numerical bounds (`3.1408 < π < 3.1429`).

### Primitive 5: Epistemic Strike-Through Refutation
- When refuting a naive guess or misconception:
  - Display the candidate value or label (`2`, `4`, `a/b phân số`, `HÌNH TRÒN?`).
  - On the exact word of refutation (*"không phải"*, *"sai"*), animate a crisp diagonal cross (`✕`) or horizontal strike-through line across the text, dim the refuted item to `opacity: 0.32`, and reveal the true concept below or beside it (`SỰ QUAY`).

### Primitive 6: Selective Spotlight Dimming ("Spotlight Focus")
- When 2 or 3 related elements coexist on screen (e.g., `QUÃNG ĐƯỜNG` at top, `ĐỘ DỜI` in middle, number line at bottom; or a 3-step algebraic proof):
  - Instead of deleting the other elements, dim non-active elements to `opacity: 0.22` (`0.35s sine.out`) and place a soft elliptical radial glow (`rgba(255,255,255,0.12)` or semantic `var(--accent-gold-glow)`) behind the active label while the narrator explains it.
  - When the narrator moves to the next concept, smoothly shift the `1.0` opacity and radial spotlight to the new target.

### Primitive 7: Grayscale Historical Portrait & Timeline Node
- When introducing a mathematician or scientist (Archimedes, Brahmagupta, Lambert, Lindemann, Euler, Newton):
  - Render a monochrome portrait (grayscale with subtle engraving/halftone contrast, framed in a thin `1px solid #333` rectangle or circle).
  - Place clean typographic metadata beside or below:
    - Name: `22px` bold `#ebebeb` (`ARCHIMEDES`, `Johann Lambert`)
    - Lifespan & Place: `14px` `#787878` (`287 – 212 TCN · Syracuse, Hy Lạp`)
    - Contribution tag: `16px` `#ebebeb` (`π là số VÔ TỈ`)
  - When comparing multiple eras, connect nodes along a thin horizontal timeline axis (`1px solid #383838` with `6px` `#ebebeb` dots at each year `1761 ────────●────────● 1882`).

### Primitive 8: Step-by-Step Algebraic Derivation Alignment
- Never dump a 5-line proof all at once.
- Align equations vertically around the `=` sign.
- Reveal line $k$ on the spoken cue while dimming lines $1 \dots k-1$ to `opacity: 0.45`.
- Highlight the specific term being transformed (e.g., `(b + (-b))` collapsing to `0`) with a subtle bracket or underline draw-in before writing the next line.
