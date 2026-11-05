/**
 * Opus Motion Lab — Stateless Deterministic Motion & Audio Timing Primitives
 * Every function is a pure function of time `t` (seconds) or frame index `f`.
 */

export const EASE = Object.freeze({
  enter:   'cubic-bezier(0.16, 1, 0.3, 1)',    // ease-out-expo: text & logo reveals
  premium: 'cubic-bezier(0.22, 1, 0.36, 1)',   // ease-out-quint: calm studio entrances
  move:    'cubic-bezier(0.76, 0, 0.24, 1)',   // ease-in-out-quart: moves & camera pushes
  exit:    'cubic-bezier(0.7, 0, 0.84, 0)',    // ease-in-expo: fast exits (40-50% shorter)
  pop:     'cubic-bezier(0.34, 1.56, 0.64, 1)' // ease-out-back: playful overshoot
});

export const MS = Object.freeze({
  feedback: 150,
  move: 400,
  hero: 750,
  exit: 220
});

export const STAGGER = Object.freeze({
  letter: 30,
  word: 90,
  item: 60,
  overlapRatio: 0.4 // start next element when previous is 30-50% done
});

/** Universal damping ratio from stiffness k, damping d, mass m (1.0 = critical/no bounce) */
export const dampingRatio = (k, d, m = 1) => d / (2 * Math.sqrt(k * m));

/**
 * Closed-form stateless spring progress from 0 -> 1 at elapsed time `t` (seconds).
 * Requires zero frame-to-frame simulation: frame 84 renders directly without frames 0..83.
 * @param {number} t - Elapsed time in seconds since spring trigger
 * @param {number} zeta - Damping ratio (1.0 no bounce, 0.75-0.85 premium, 0.5 playful, 0.22 loose cartoon)
 * @param {number} f - Natural frequency in Hz (default 2.0)
 */
export function spring(t, zeta = 0.7, f = 2) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f;
  if (zeta >= 1) {
    if (zeta === 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    const s = Math.sqrt(zeta * zeta - 1);
    const r1 = -w * (zeta - s);
    const r2 = -w * (zeta + s);
    return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
  }
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}

/** Drift-free beat-to-frame converter (never accumulate rounded beat intervals) */
export const beatFrame = (beatIndex, fps, bpm, beat0Sec = 0) =>
  Math.round((beat0Sec + (beatIndex * 60) / bpm) * fps);

/** Minimum readable hold duration in seconds for `wordCount` words */
export const minReadHoldSec = (wordCount) => 0.3 * wordCount + 0.5;

/** Seamless loop normalized phase in [0, 1) for frames 0..N-1 */
export const loopPhase = (frame, totalFrames) => ((frame % totalFrames) + totalFrames) % totalFrames / totalFrames;

/** Deterministic Mulberry32 PRNG seeded by integer (e.g., frame index) */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Exact sample index for the +1 Frame Audio Sync Law ("Light beats sound") */
export const hitPeakSample = (visualFrame, fps = 60, sampleRate = 48000) =>
  Math.round(((visualFrame + 1) / fps) * sampleRate);

/**
 * Synthesize a cosine-phase tonal transient whose primary waveform crest lands
 * on `peakSample` with zero waveshaper lag.
 */
export function addCosineCrestTone(buf, sampleRate, peakSample, freqHz, amp, attackSec = 0.001, decaySec = 0.08) {
  const attackSamples = Math.max(1, Math.round(attackSec * sampleRate));
  const decaySamples = Math.max(1, Math.round(decaySec * sampleRate));
  const start = Math.max(0, peakSample - attackSamples);
  const end = Math.min(buf.length - 1, peakSample + decaySamples * 5);
  const twoPiF = (2 * Math.PI * freqHz) / sampleRate;
  for (let i = start; i <= end; i++) {
    const dt = i - peakSample;
    const env = dt < 0
      ? 0.5 * (1 + Math.cos((Math.PI * dt) / attackSamples))
      : Math.exp(-dt / decaySamples);
    buf[i] += amp * env * Math.cos(twoPiF * dt);
  }
}

/** Drop-in HTML snippet for ?t=2.5 deterministic frame freezing */
export const URL_FREEZE_SNIPPET = `<script>
(function () {
  var q = new URLSearchParams(location.search);
  if (!q.has('t')) return;
  var t = parseFloat(q.get('t')) || 0;
  function freeze() {
    if (typeof window.renderAt === 'function') window.renderAt(t);
    document.getAnimations().forEach(function (a) { a.pause(); a.currentTime = t * 1000; });
  }
  freeze();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(freeze);
  window.addEventListener('load', freeze);
})();
</script>`;
