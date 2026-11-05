// core-svg.js: Deterministic 1920×1080 SVG + Canvas2D Hybrid Video Engine
// Pure function of time t (seconds): supports parallel out-of-order headless Chrome rendering.

const W = 1920, H = 1080, SVG_NS = 'http://www.w3.org/2000/svg';
let BPM = 120, BEAT = 60 / BPM, OFF = 0.0, BOIL = 12, DUR = 60.0;
const TAU = Math.PI * 2;

const PAL = {
  bgDk: '#090D1E', bgMid: '#131B38', ink: '#0B0F19',
  argon: '#3B82F6', argonDk: '#1D4ED8', argonLt: '#67E8F9',
  violet: '#8B5CF6', magenta: '#EC4899', rose: '#F43F5E',
  gold: '#FBBF24', cream: '#FEF9C3', white: '#F8FAFC',
  mint: '#10B981', lime: '#84CC16', orange: '#F97316',
  cyan: '#06B6D4', red: '#EF4444', slate: '#334155'
};

// ---------- Math, Easing & Beat Helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const backOut = x => { x = clamp(x); const s = 1.85; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (TAU / 3)) + 1; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const frac = x => x - Math.floor(x);
const seg = (t, a, b) => clamp((t - a) / (b - a));
const bpOf = t => (t - OFF) / BEAT;
const beatN = t => Math.floor(bpOf(t));
const pulse = (t, k = 6) => Math.exp(-frac(bpOf(t)) * k);
const pulse2 = (t, k = 6) => Math.exp(-frac(bpOf(t) * 2) * k);
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
const B = n => OFF + n * BEAT;

let T = 0, _seed = 1;
const rnd = () => { _seed = (_seed * 16807) % 2147483647; return (_seed - 1) / 2147483646; };
const jit = (a = 1) => (rnd() * 2 - 1) * a;

function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) {
      const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return keys[keys.length - 1][1];
}

function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (ch(16) << 16) + (ch(8) << 8) + ch(0)).toString(16).slice(1);
}

const shakeXY = (t, amt) => {
  const f = Math.floor(t * 24);
  return [(hash(f * 1.7) - 0.5) * 2 * amt, (hash(f * 2.3 + 9) - 0.5) * 2 * amt];
};

// ---------- SVG Immediate-Mode Scene Graph ----------
let svgEl = null, stageBg = null, stageRoot = null, stageFx = null, stageDefs = null, boilTurb = null;
let outC = null, ctx = null;
let _parentStack = [];
let _textQueue = [];
let _gradCounter = 0;
let _camState = { cx: W / 2, cy: H / 2, zoom: 1, rot: 0 };

const currentParent = () => _parentStack[_parentStack.length - 1] || stageRoot;

function el(tag, attrs = {}, parent = currentParent()) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v !== null && v !== undefined && v !== false) node.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(node);
  return node;
}

function group(attrs = {}, fn) {
  const g = el('g', attrs);
  if (fn) {
    _parentStack.push(g);
    try { fn(g); } finally { _parentStack.pop(); }
  }
  return g;
}

function bone(x, y, deg = 0, fn, extraAttrs = {}) {
  const tf = `translate(${x.toFixed(2)}, ${y.toFixed(2)}) rotate(${deg.toFixed(2)})`;
  return group({ ...extraAttrs, transform: tf }, fn);
}

function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rotDeg = 0) {
  _camState = { cx, cy, zoom, rot: rotDeg };
  const tf = `translate(${W / 2}, ${H / 2}) scale(${zoom.toFixed(4)}) rotate(${rotDeg.toFixed(3)}) translate(${(-cx).toFixed(2)}, ${(-cy).toFixed(2)})`;
  const g = el('g', { transform: tf });
  _parentStack.push(g);
  return g;
}

function camEnd() {
  if (_parentStack.length > 1) _parentStack.pop();
  _camState = { cx: W / 2, cy: H / 2, zoom: 1, rot: 0 };
}

// ---------- SVG Gradients & Background ----------
function linearGrad(stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
  const id = `lg_${++_gradCounter}`;
  const lg = el('linearGradient', { id, x1, y1, x2, y2 }, stageDefs);
  for (const [offset, color, opacity = 1] of stops) {
    el('stop', { offset: typeof offset === 'number' ? `${offset * 100}%` : offset, 'stop-color': color, 'stop-opacity': opacity }, lg);
  }
  return `url(#${id})`;
}

function radialGrad(stops, cx = 0.5, cy = 0.5, r = 0.5) {
  const id = `rg_${++_gradCounter}`;
  const rg = el('radialGradient', { id, cx, cy, r }, stageDefs);
  for (const [offset, color, opacity = 1] of stops) {
    el('stop', { offset: typeof offset === 'number' ? `${offset * 100}%` : offset, 'stop-color': color, 'stop-opacity': opacity }, rg);
  }
  return `url(#${id})`;
}

function bg(topCol, botCol, midCol = null) {
  const stops = midCol ? [[0, topCol], [0.55, midCol], [1, botCol]] : [[0, topCol], [1, botCol]];
  const fill = linearGrad(stops, 0, 0, 0, 1);
  return el('rect', { x: -400, y: -400, width: W + 800, height: H + 800, fill }, stageBg);
}

// ---------- SVG Shape Primitives ----------
function styleAttrs(o = {}) {
  return {
    fill: o.fill === undefined ? PAL.argon : (o.fill || 'none'),
    stroke: o.stroke === undefined ? PAL.ink : (o.stroke || 'none'),
    'stroke-width': o.stroke === null || o.sw === 0 ? null : (o.sw ?? 5),
    'stroke-linecap': o.cap || 'round',
    'stroke-linejoin': o.join || 'round',
    opacity: o.alpha ?? 1,
    filter: o.filter ? `url(#${o.filter})` : null,
    transform: o.transform || null
  };
}

function rect(x, y, w, h, rx = 0, o = {}) {
  return el('rect', { x, y, width: Math.max(0, w), height: Math.max(0, h), rx, ry: o.ry ?? rx, ...styleAttrs(o) });
}

function circ(cx, cy, r, o = {}) {
  return el('circle', { cx, cy, r: Math.max(0, r), ...styleAttrs(o) });
}

function ell(cx, cy, rx, ry, o = {}) {
  return el('ellipse', { cx, cy, rx: Math.max(0, rx), ry: Math.max(0, ry), ...styleAttrs(o) });
}

function line(x1, y1, x2, y2, o = {}) {
  return el('line', {
    x1, y1, x2, y2,
    fill: 'none',
    stroke: o.stroke || PAL.white,
    'stroke-width': o.sw ?? 5,
    'stroke-linecap': o.cap || 'round',
    opacity: o.alpha ?? 1,
    filter: o.filter ? `url(#${o.filter})` : null
  });
}

function poly(pts, closed = true, o = {}) {
  const d = polyToPath(pts, closed);
  return el('path', { d, ...styleAttrs(o) });
}

function path(d, o = {}) {
  return el('path', { d, ...styleAttrs(o) });
}

function star(cx, cy, rOuter, rInner = rOuter * 0.42, points = 5, rotDeg = 0, o = {}) {
  const pts = [];
  const rotRad = (rotDeg * Math.PI) / 180;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = rotRad + (i * Math.PI) / points - Math.PI / 2;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts, true, o);
}

// ---------- Safe Stroke Reveal & Motion Paths ----------
function drawPath(d, progressOrRange, o = {}) {
  const [u0, u1] = Array.isArray(progressOrRange)
    ? [clamp(progressOrRange[0]), clamp(progressOrRange[1])]
    : [0, clamp(progressOrRange)];
  const len = Math.max(0, u1 - u0);
  if (len <= 0.001) return null; // Prevents round-cap dot at progress=0

  return el('path', {
    d,
    fill: o.fill || 'none',
    stroke: o.stroke || PAL.argonLt,
    'stroke-width': o.sw ?? 6,
    'stroke-linecap': o.cap || 'round',
    'stroke-linejoin': o.join || 'round',
    pathLength: 1,
    'stroke-dasharray': `${len.toFixed(4)} 2`,
    'stroke-dashoffset': (-u0).toFixed(4),
    opacity: o.alpha ?? 1,
    filter: o.filter ? `url(#${o.filter})` : null,
    transform: o.transform || null
  });
}

const _pathCache = new Map();
function getCachedPath(d) {
  let entry = _pathCache.get(d);
  if (!entry) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('d', d);
    entry = { p, len: p.getTotalLength() };
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

// ---------- Shape Morphing & Smooth Splines ----------
function polyToPath(pts, closed = true) {
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ') + (closed ? ' Z' : '');
}

function smoothPath(pts, closed = false, tension = 0.5) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const getPt = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  const count = closed ? n : n - 1;
  for (let i = 0; i < count; i++) {
    const p0 = getPt(i - 1), p1 = getPt(i), p2 = getPt(i + 1), p3 = getPt(i + 2);
    const c1x = p1[0] + ((p2[0] - p0[0]) * tension) / 3;
    const c1y = p1[1] + ((p2[1] - p0[1]) * tension) / 3;
    const c2x = p2[0] - ((p3[0] - p1[0]) * tension) / 3;
    const c2y = p2[1] - ((p3[1] - p1[1]) * tension) / 3;
    d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return closed ? d + ' Z' : d;
}

function morphPaths(dA, dB, u, samples = 64, closed = true, o = {}) {
  const A = getCachedPath(dA), B = getCachedPath(dB), k = clamp(u);
  const pts = [];
  for (let i = 0; i < samples; i++) {
    const f = i / (closed ? samples : samples - 1);
    const pa = A.p.getPointAtLength(f * A.len);
    const pb = B.p.getPointAtLength(f * B.len);
    pts.push([lerp(pa.x, pb.x, k), lerp(pa.y, pb.y, k)]);
  }
  return path(polyToPath(pts, closed), o);
}

// ---------- Analytical 2-Bone IK Solver ----------
function ik2Bone(sx, sy, tx, ty, L1, L2, bend = 1) {
  const dx = tx - sx, dy = ty - sy;
  const rawDist = Math.hypot(dx, dy) || 0.0001;
  const dist = Math.min(L1 + L2 - 0.001, Math.max(Math.abs(L1 - L2) + 0.001, rawDist));
  const baseAngle = Math.atan2(dy, dx);
  const cosA = clamp((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist), -1, 1);
  const angle1 = baseAngle + bend * Math.acos(cosA);
  const ex = sx + Math.cos(angle1) * L1;
  const ey = sy + Math.sin(angle1) * L1;
  const wx = sx + (dx / rawDist) * dist;
  const wy = sy + (dy / rawDist) * dist;
  const angle2 = Math.atan2(wy - ey, wx - ex);
  return {
    sx, sy, ex, ey, wx, wy,
    deg1: angle1 * (180 / Math.PI),
    deg2: (angle2 - angle1) * (180 / Math.PI),
    d: `M ${sx.toFixed(2)} ${sy.toFixed(2)} L ${ex.toFixed(2)} ${ey.toFixed(2)} L ${wx.toFixed(2)} ${wy.toFixed(2)}`
  };
}

// ---------- Canvas2D Typography Overlay (Preserves Web Fonts) ----------
function letter(txt, x, y, size = 48, color = PAL.white, o = {}) {
  _textQueue.push({ txt, x, y, size, color, o, cam: o.screen ? null : { ..._camState } });
}

function flushLetters() {
  for (const item of _textQueue) {
    const { txt, x, y, size, color, o, cam } = item;
    const popScale = o.pop !== undefined ? backOut(o.pop) : 1;
    if (popScale <= 0.01) continue;
    ctx.save();
    if (cam) {
      ctx.translate(W / 2, H / 2);
      ctx.scale(cam.zoom, cam.zoom);
      if (cam.rot) ctx.rotate((cam.rot * Math.PI) / 180);
      ctx.translate(-cam.cx, -cam.cy);
    }
    ctx.translate(x, y);
    if (o.rot) ctx.rotate((o.rot * Math.PI) / 180);
    ctx.scale(popScale, popScale);
    ctx.globalAlpha = clamp(o.alpha ?? 1);
    ctx.font = `${o.weight || 800} ${size}px ${o.font || '"Shantell Sans", "Inter", system-ui, sans-serif'}`;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.baseline || 'middle';
    if (o.sw !== 0) {
      ctx.lineWidth = o.sw ?? Math.max(4, size * 0.14);
      ctx.lineJoin = 'round';
      ctx.strokeStyle = o.stroke || PAL.ink;
      ctx.strokeText(txt, 0, 0);
    }
    ctx.fillStyle = color;
    ctx.fillText(txt, 0, 0);
    ctx.restore();
  }
  _textQueue.length = 0;
}

// ---------- Chapter Registry & Timeline ----------
const CH = [];
function chapter(name, start, end, shots) {
  CH.push({ name, start, end, shots });
  CH.sort((a, b) => a.start - b.start);
}

// Persistent SVG -> Image -> Canvas rasterizer (zero GPU memory leak)
const _svgImg = new Image();
_svgImg.decoding = 'sync';

function clearChildren(node) {
  while (node && node.firstChild) node.removeChild(node.firstChild);
}

function clearDynamicGrads() {
  if (!stageDefs) return;
  const dyn = stageDefs.querySelectorAll('[id^="lg_"], [id^="rg_"]');
  dyn.forEach(n => n.remove());
  _gradCounter = 0;
}

function buildFrameDOM(t) {
  T = t;
  const boilFrame = Math.floor(t * BOIL);
  _seed = 1000 + boilFrame * 7919;
  if (boilTurb) boilTurb.setAttribute('seed', String((boilFrame % 997) + 1));

  clearChildren(stageBg);
  clearChildren(stageRoot);
  clearChildren(stageFx);
  clearDynamicGrads();
  _parentStack = [stageRoot];
  _textQueue = [];
  _camState = { cx: W / 2, cy: H / 2, zoom: 1, rot: 0 };

  const ch = CH.find(c => t >= c.start && t < c.end) || CH[CH.length - 1];
  if (ch && ch.shots.length) {
    let i = 0;
    while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
    const t0 = ch.shots[i][0];
    const end = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end;
    ch.shots[i][1](t, t - t0, end - t0);
  }
}

async function renderFrame(t) {
  buildFrameDOM(t);
  const xml = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    await new Promise((res, rej) => {
      _svgImg.onload = res;
      _svgImg.onerror = rej;
      _svgImg.src = url;
    });
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(_svgImg, 0, 0, W, H);
    flushLetters();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- Headless Render Contract (render.mjs) ----------
window.renderAt = async (t, type = 'image/jpeg', q = 0.92) => {
  await renderFrame(t);
  return outC.toDataURL(type, q);
};

window.renderSheet = async (times, cols = 3, w = 640) => {
  const h = Math.round((w * 9) / 16), rows = Math.ceil(times.length / cols);
  const sc = document.createElement('canvas');
  sc.width = cols * w;
  sc.height = rows * h;
  const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now();
    await renderFrame(times[i]);
    ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(outC, x, y, w, h);
    c.fillStyle = 'rgba(0,0,0,0.72)';
    c.fillRect(x, y, 110, 28);
    c.fillStyle = '#67E8F9';
    c.font = 'bold 15px monospace';
    c.fillText(times[i].toFixed(2) + 's', x + 8, y + 19);
  }
  return { url: sc.toDataURL('image/jpeg', 0.9), ms };
};

window.gpuInfo = () => 'SVG + Canvas2D Hybrid Hardware Accelerated';

// ---------- Browser Interactive Player ----------
function initPlayerUI() {
  const scrub = document.getElementById('scrub');
  const tt = document.getElementById('tt');
  const playBtn = document.getElementById('play');
  const au = document.getElementById('au');
  if (scrub) scrub.max = String(DUR);
  let playing = false, busy = false;

  const updateAt = async t => {
    if (busy) return;
    busy = true;
    const t0 = performance.now();
    await renderFrame(t);
    const dt = Math.round(performance.now() - t0);
    if (tt) tt.textContent = `${t.toFixed(2)}s / ${DUR.toFixed(1)}s  ·  ${dt} ms/frame`;
    busy = false;
  };

  if (scrub) {
    scrub.addEventListener('input', () => {
      const t = parseFloat(scrub.value);
      if (au && au.src) au.currentTime = t;
      updateAt(t);
    });
  }

  let lastTs = 0;
  function tick(ts) {
    if (!playing) return;
    const dt = lastTs ? (ts - lastTs) / 1000 : 0;
    lastTs = ts;
    const cur = au && au.src && !au.paused ? au.currentTime : (parseFloat(scrub.value) + dt);
    if (cur >= DUR) {
      playing = false;
      if (playBtn) playBtn.textContent = '▶ Play';
      return;
    }
    if (scrub) scrub.value = String(cur);
    updateAt(cur);
    requestAnimationFrame(tick);
  }

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      playing = !playing;
      playBtn.textContent = playing ? '⏸ Pause' : '▶ Play';
      lastTs = 0;
      if (au && au.src) {
        if (playing) { au.currentTime = parseFloat(scrub.value); au.play(); }
        else au.pause();
      }
      if (playing) requestAnimationFrame(tick);
    });
  }

  updateAt(0);
}

window.addEventListener('DOMContentLoaded', async () => {
  svgEl = document.getElementById('stage-svg');
  stageBg = document.getElementById('stage-bg');
  stageRoot = document.getElementById('stage-root');
  stageFx = document.getElementById('stage-fx');
  stageDefs = document.getElementById('stage-defs');
  boilTurb = document.getElementById('boil-turb');
  outC = document.getElementById('out');
  ctx = outC.getContext('2d');

  try {
    await Promise.race([
      Promise.all([
        document.fonts.load('800 48px "Shantell Sans"'),
        document.fonts.load('800 48px "Inter"')
      ]),
      new Promise(r => setTimeout(r, 2000))
    ]);
  } catch (e) {}

  window.ready = true;
  if (!location.search.includes('render')) initPlayerUI();
});
