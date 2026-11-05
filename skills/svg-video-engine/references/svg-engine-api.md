# SVG Video Engine API Reference (`references/svg-engine-api.md`)

Complete patterns for declarative SVG scene construction, stroke reveal, motion paths, shape morphing, 2-bone FK/IK character rigging, SVG filters, and hybrid SVG+Canvas compositing.

---

## 1. Declarative Immediate-Mode SVG Scene Graph

Instead of hand-coding hundreds of static `<g id="...">` elements in HTML and mutating them imperatively across 40 shots, `core-svg.js` clears `<g id="stage-root">` each frame (`renderFrame(t)`) and lets the active shot `fn(t, lt, dur)` build clean SVG nodes on the fly using lightweight stack helpers:

```js
// Open a transformed group, populate children in fn(), and pop automatically
group({ transform: `translate(${x}, ${y}) rotate(${deg})`, opacity: 0.9 }, () => {
  circ(0, 0, 80, { fill: PAL.gold, stroke: PAL.ink, sw: 6 });
  drawPath('M -40 -10 Q 0 -50 40 -10', seg(lt, 0.2, 0.9), { stroke: PAL.white, sw: 8 });
});
```

### Transform Stack Helpers
- `group(attrs, fn)` — Pushes a `<g>` onto the parent stack, runs `fn()`, pops `<g>`, returns the `<g>` element.
- `bone(x, y, deg, fn, attrs)` — Shorthand for `<g transform="translate(x, y) rotate(deg)">` for hierarchical character rigs.
- `camBegin(cx, cy, zoom, rotDeg)` / `camEnd()` — Pushes a camera `<g>` that maps world point `(cx, cy)` to screen center `(960, 540)` with `scale(zoom)` and `rotate(rotDeg)`.

---

## 2. Safe Stroke Drawing (`drawPath` & Trim Paths)

### Why Naive `stroke-dasharray="1"` Fails
In SVG, `stroke-dasharray="1"` expands to `1 on, 1 off` (period `2`). When `stroke-dashoffset="1"`, the previous ON dash shifts into `[0, 1]`, drawing the **entire path** when progress is `0`! Furthermore, `stroke-linecap="round"` draws a circular dot of diameter `stroke-width` at `(x0, y0)` even when dash length is `0`.

### Correct Trim-Path Implementation (`drawPath`)
Supports both simple `0..1` reveal and `[startU, endU]` trim-path windows (like After Effects *Trim Paths*):

```js
function drawPath(d, progressOrRange, o = {}) {
  const [u0, u1] = Array.isArray(progressOrRange)
    ? [clamp(progressOrRange[0]), clamp(progressOrRange[1])]
    : [0, clamp(progressOrRange)];
  const len = Math.max(0, u1 - u0);
  if (len <= 0.001) return null; // Prevents round-cap zero-length dot!

  return el('path', {
    d,
    fill: o.fill || 'none',
    stroke: o.stroke || PAL.white,
    'stroke-width': o.sw ?? 6,
    'stroke-linecap': o.cap || 'round',
    'stroke-linejoin': o.join || 'round',
    pathLength: 1,
    // Dash length = len, Gap = 2 (always > 1 so pattern never repeats inside [0,1])
    'stroke-dasharray': `${len.toFixed(4)} 2`,
    'stroke-dashoffset': (-u0).toFixed(4),
    opacity: o.alpha ?? 1,
    filter: o.filter || null
  });
}
```

---

## 3. Exact Motion Along Path & Tangent Alignment (`pointOnPath`)

Use a cached offscreen `<path>` map so `getTotalLength()` and `getPointAtLength()` are fast and never re-parse the same `d` string twice:

```js
const _pathCache = new Map();

function getCachedPath(d) {
  let entry = _pathCache.get(d);
  if (!entry) {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', d);
    const len = p.getTotalLength();
    entry = { p, len };
    _pathCache.set(d, entry);
  }
  return entry;
}

function pointOnPath(d, u, eps = 1.5) {
  const { p, len } = getCachedPath(d);
  const dist = clamp(u) * len;
  const pt = p.getPointAtLength(dist);
  const p1 = p.getPointAtLength(Math.max(0, dist - eps));
  const p2 = p.getPointAtLength(Math.min(len, dist + eps));
  const angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
  return { x: pt.x, y: pt.y, angleDeg, len };
}
```

---

## 4. Analytical 2-Bone IK & Hierarchical FK Rigging

### Forward Kinematics (`bone`)
For waving, swinging, or dancing limbs driven by beat oscillators:
```js
// Shoulder at (-45, -120), upper arm length 70, forearm length 65
bone(-45, -120, shoulderDeg, () => {
  line(0, 0, 0, 70, { stroke: PAL.argon, sw: 18 });
  bone(0, 70, elbowDeg, () => {
    line(0, 0, 0, 65, { stroke: PAL.argonLt, sw: 14 });
    circ(0, 65, 11, { fill: PAL.white, stroke: PAL.ink, sw: 4 });
  });
});
```

### Analytical 2-Bone Inverse Kinematics (`ik2Bone`)
When a character's hand must grab a prop at world/body coordinates `(tx, ty)` or feet must plant on the ground while the body squats:

```js
// Solves shoulder angle, elbow position (ex, ey), and wrist position (wx, wy)
// bend = 1 or -1 flips the elbow/knee bend direction
function ik2Bone(sx, sy, tx, ty, L1, L2, bend = 1) {
  const dx = tx - sx, dy = ty - sy;
  const dist = Math.min(L1 + L2 - 0.001, Math.max(Math.abs(L1 - L2) + 0.001, Math.hypot(dx, dy)));
  const baseAngle = Math.atan2(dy, dx);
  const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
  const angle1 = baseAngle + bend * Math.acos(cosA);
  const ex = sx + Math.cos(angle1) * L1;
  const ey = sy + Math.sin(angle1) * L1;
  const ux = sx + (dx / (Math.hypot(dx, dy) || 1)) * dist;
  const uy = sy + (dy / (Math.hypot(dx, dy) || 1)) * dist;
  const angle2 = Math.atan2(uy - ey, ux - ex);
  return {
    sx, sy, ex, ey, wx: ux, wy: uy,
    deg1: angle1 * (180 / Math.PI),
    deg2: (angle2 - angle1) * (180 / Math.PI),
    d: `M ${sx.toFixed(1)} ${sy.toFixed(1)} L ${ex.toFixed(1)} ${ey.toFixed(1)} L ${ux.toFixed(1)} ${uy.toFixed(1)}`
  };
}
```

---

## 5. Shape Morphing & Smooth Catmull-Rom Splines

### Resampled Path Morphing (`morphPaths(dA, dB, u, samples = 64)`)
Morphs between **any two SVG path strings** (`dA` and `dB`) by uniform arc-length resampling:
```js
function morphPaths(dA, dB, u, n = 64, closed = true) {
  const A = getCachedPath(dA), B = getCachedPath(dB), k = clamp(u);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const f = i / (closed ? n : n - 1);
    const pa = A.p.getPointAtLength(f * A.len);
    const pb = B.p.getPointAtLength(f * B.len);
    pts.push([lerp(pa.x, pb.x, k), lerp(pa.y, pb.y, k)]);
  }
  return polyToPath(pts, closed);
}
```

### Smooth Catmull-Rom Spline (`smoothPath(pts, closed, tension)`)
Converts a sparse array of `[[x, y], ...]` points into a smooth cubic bezier SVG `d` string (`C ...`), ideal for dynamic tentacles, ribbons, waves, and organic blobs.

---

## 6. SVG Filters: Glow, Drop-Shadow, and 12fps Hand-Drawn Boil

`studio-svg.html` pre-defines reusable `<defs>` filters updated deterministically each frame:
- `filter="url(#glow)"` — Soft bloom glow (`feGaussianBlur` + `feMerge`).
- `filter="url(#boil)"` — Hand-drawn ink wobble (`feTurbulence` whose `seed` attribute is set to `Math.floor(t * 12)` on every frame + `feDisplacementMap`). Gives crisp vector art the lively warmth of traditional 12fps animation without mutating path coordinates!
- `filter="url(#shadow)"` — Crisp comic drop-shadow.

---

## 7. Hybrid SVG + Canvas Text Overlay (Why & How)

When `XMLSerializer` serializes `<svg>` into a `Blob` (`image/svg+xml`) and draws it via `new Image()` onto `<canvas>`, Chromium isolates the SVG image from external network/font sheets for security.

**Best Practice in `core-svg.js`:**
1. Render all vector backgrounds, characters, rigs, motion paths, morphs, gradients, and filters inside `<svg id="stage-svg">`.
2. Rasterize `<svg id="stage-svg">` onto the persistent `1920×1080` `<canvas id="out">`.
3. Draw kinetic typography (`letter()`, `sfx()`, `drawKaraoke()`) directly onto `ctx` (or after `svgToCanvas`) where `document.fonts` web fonts (`Permanent Marker`, `Shantell Sans`, `Inter`, etc.) are 100% available and hardware-accelerated!
