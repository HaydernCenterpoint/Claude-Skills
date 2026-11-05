"""Build Melodic & Polyphonic Mathematical Sound Design for Mathmethic videos.

Zero white noise, zero chopped samples — 100% pure harmonic physical modeling:
  1. Pentatonic Marimba / Plucked Harp Scale (`note_C4`, `note_D4`, `note_F4`, `note_G4`, `note_A4`, `note_C5`):
     Climbs in pitch as mathematical steps progress (1d -> 2d -> 3d, N = 6 -> 12 -> 24 -> 48 -> 96,
     1 - 1/3 + 1/5 - 1/7, and the 4 Pillars of Pi).
  2. `golden-lock`  : Shimmering harmonic fifth + warm sub-lock when a proof or key constant lands.
  3. `odometer-run` : Rapid crystalline 8-note arpeggio cascade when digits race to 105 Trillion.
  4. `space-3d-open`: Deep 48 Hz sub-bass bloom + harmonic fifth glide when 3D coordinate space opens.
  5. `chapter-maj9` : Lush Felt-Piano + Warm Pad chord during 2.8s Chapter Cards.
  6. `wedge-snap`   : Tactile wooden puzzle-piece lock when the 16 disk wedges snap into a rectangle.

Usage:
  python median-lab-video/scripts/build-mathmethic-sfx.py <project_dir>
"""
import json
import math
import subprocess
import sys
import wave
from pathlib import Path
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
SR = 48000


def save_stereo_wav(path: Path, left: np.ndarray, right: np.ndarray, sr: int = SR):
    path.parent.mkdir(parents=True, exist_ok=True)
    inter = np.empty(left.size * 2, dtype=np.int16)
    inter[0::2] = np.clip(left * 32767.0, -32767, 32767).astype(np.int16)
    inter[1::2] = np.clip(right * 32767.0, -32767, 32767).astype(np.int16)
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(inter.tobytes())


def synth_marimba_note(freq: float, dur: float = 0.42, pan: float = 0.0) -> tuple[np.ndarray, np.ndarray]:
    """Physical-modeled warm rosewood marimba / harp pluck (1st, 4th, and 10th bar overtones)."""
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    env1 = (1.0 - np.exp(-t * 380.0)) * np.exp(-t * 11.0)
    env2 = (1.0 - np.exp(-t * 500.0)) * np.exp(-t * 28.0)
    env3 = (1.0 - np.exp(-t * 700.0)) * np.exp(-t * 55.0)
    # Soft sub-octave body thump
    sub_f = freq * 0.5 + 35.0 * np.exp(-t * 45.0)
    sub_ph = 2 * np.pi * np.cumsum(sub_f) / SR
    sig = (
        0.58 * np.sin(2 * np.pi * freq * t) * env1
        + 0.24 * np.sin(2 * np.pi * (freq * 2.0) * t + 0.3) * env2
        + 0.12 * np.sin(2 * np.pi * (freq * 3.98) * t + 0.7) * env3
        + 0.22 * np.sin(sub_ph) * env2
    ) * 0.44
    gain_l = math.sqrt(0.5 * (1.0 - pan))
    gain_r = math.sqrt(0.5 * (1.0 + pan))
    return (sig * gain_l).astype(np.float32), (np.roll(sig, 18) * gain_r).astype(np.float32)


def synth_sfx_library(sfx_dir: Path) -> dict[str, tuple[np.ndarray, np.ndarray]]:
    sfx_dir.mkdir(parents=True, exist_ok=True)
    lib = {}

    # 1. Pentatonic scale notes (D minor / F major pentatonic: D4, F4, G4, A4, C5, D5)
    scale_freqs = [
        ("note_1", 293.66, -0.30),  # D4
        ("note_2", 349.23, -0.15),  # F4
        ("note_3", 392.00,  0.00),  # G4
        ("note_4", 440.00,  0.15),  # A4
        ("note_5", 523.25,  0.25),  # C5
        ("note_6", 587.33,  0.35),  # D5
    ]
    for name, f, pan in scale_freqs:
        lib[name] = synth_marimba_note(f, dur=0.45, pan=pan)

    # 2. chapter-maj9 (2.5s): Warm Felt-Piano + Sub-Bass Chord for 2.8s Chapter Cards
    dur = 2.5
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    notes = [
        (73.42,  0.34, 1.1,  0.00),  # D2
        (146.83, 0.26, 1.3, -0.20),  # D3
        (220.00, 0.20, 1.5,  0.20),  # A3
        (349.23, 0.16, 1.8, -0.35),  # F4
        (440.00, 0.12, 2.1,  0.35),  # A4
        (659.25, 0.08, 2.5,  0.10),  # E5
    ]
    ch_l = np.zeros_like(t)
    ch_r = np.zeros_like(t)
    for idx, (f, amp, dec, pan) in enumerate(notes):
        onset = idx * 0.035  # gentle harp-like rolled chord!
        t_rel = np.maximum(0.0, t - onset)
        mask = (t >= onset).astype(np.float32)
        env = mask * (1.0 - np.exp(-t_rel * 75.0)) * np.exp(-t_rel * dec)
        gl = math.sqrt(0.5 * (1.0 - pan))
        gr = math.sqrt(0.5 * (1.0 + pan))
        ch_l += amp * np.sin(2 * np.pi * f * t_rel) * env * gl
        ch_r += amp * np.sin(2 * np.pi * (f * 1.0008) * t_rel + 0.25 * idx) * env * gr
    fade = np.sin(np.pi * (t / dur)) ** 0.4
    lib["chapter-maj9"] = ((ch_l * fade * 0.48).astype(np.float32), (ch_r * fade * 0.48).astype(np.float32))

    # 3. golden-lock (1.4s): Shimmering two-note harmonic lock (A4 -> D5 + D2 sub-cushion) when a proof lands
    dur = 1.4
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    env_a = (1.0 - np.exp(-t * 180.0)) * np.exp(-t * 3.8)
    t2 = np.maximum(0.0, t - 0.09)
    m2 = (t >= 0.09).astype(np.float32)
    env_b = m2 * (1.0 - np.exp(-t2 * 180.0)) * np.exp(-t2 * 2.4)
    sub_env = (1.0 - np.exp(-t * 90.0)) * np.exp(-t * 3.2)
    lk_l = (
        0.30 * np.sin(2 * np.pi * 440.0 * t) * env_a
        + 0.36 * np.sin(2 * np.pi * 587.33 * t2) * env_b
        + 0.16 * np.sin(2 * np.pi * 880.0 * t2) * env_b
        + 0.32 * np.sin(2 * np.pi * 73.42 * t) * sub_env
    ) * 0.44
    lk_r = (
        0.26 * np.sin(2 * np.pi * 440.5 * t + 0.2) * env_a
        + 0.40 * np.sin(2 * np.pi * 587.8 * t2 + 0.4) * env_b
        + 0.16 * np.sin(2 * np.pi * 880.6 * t2 + 0.6) * env_b
        + 0.32 * np.sin(2 * np.pi * 73.42 * t) * sub_env
    ) * 0.44
    lib["golden-lock"] = (lk_l.astype(np.float32), lk_r.astype(np.float32))

    # 4. space-3d-open (1.1s): Deep 48 Hz sub-bass bloom + harmonic fifth rise when 3D space opens
    dur = 1.1
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    env = np.sin(np.pi * (t / dur)) ** 1.4 * np.exp(-t * 1.1)
    f_glide = 98.0 + 48.83 * (1.0 - np.cos(np.pi * (t / dur))) * 0.5
    ph = 2 * np.pi * np.cumsum(f_glide) / SR
    sub = np.sin(2 * np.pi * 49.0 * t) * np.exp(-t * 2.2) * 0.38
    sp_l = (sub + (0.45 * np.sin(ph) + 0.28 * np.sin(ph * 1.5) + 0.14 * np.sin(ph * 2.0)) * env) * 0.42
    sp_r = (sub + (0.45 * np.sin(ph + 0.25) + 0.28 * np.sin(ph * 1.5 + 0.5) + 0.14 * np.sin(ph * 2.0 + 0.7)) * env) * 0.42
    lib["space-3d-open"] = (sp_l.astype(np.float32), sp_r.astype(np.float32))

    # 5. wedge-snap (0.28s): Double wooden puzzle-click when disk wedges lock into a rectangle
    dur = 0.28
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    e1 = (1.0 - np.exp(-t * 450.0)) * np.exp(-t * 32.0)
    t_b = np.maximum(0.0, t - 0.065)
    mb = (t >= 0.065).astype(np.float32)
    e2 = mb * (1.0 - np.exp(-t_b * 450.0)) * np.exp(-t_b * 26.0)
    ws_l = (0.48 * np.sin(2 * np.pi * 246.94 * t) * e1 + 0.55 * np.sin(2 * np.pi * 329.63 * t_b) * e2) * 0.44
    ws_r = (0.42 * np.sin(2 * np.pi * 246.94 * t) * e1 + 0.60 * np.sin(2 * np.pi * 330.0 * t_b + 0.3) * e2) * 0.44
    lib["wedge-snap"] = (ws_l.astype(np.float32), ws_r.astype(np.float32))

    # 6. odometer-run (1.2s): Rapid 8-note crystalline harmonic cascade (for 105 Trillion digit counter!)
    dur = 1.2
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    arp_freqs = [293.66, 349.23, 440.0, 523.25, 587.33, 698.46, 880.0, 1174.66]
    od_l = np.zeros_like(t)
    od_r = np.zeros_like(t)
    for i, f in enumerate(arp_freqs):
        t0 = i * 0.11
        tr = np.maximum(0.0, t - t0)
        mk = (t >= t0).astype(np.float32)
        ev = mk * (1.0 - np.exp(-tr * 500.0)) * np.exp(-tr * 16.0)
        pan = -0.35 + (i / 7.0) * 0.70
        gl = math.sqrt(0.5 * (1.0 - pan))
        gr = math.sqrt(0.5 * (1.0 + pan))
        od_l += 0.34 * np.sin(2 * np.pi * f * tr) * ev * gl
        od_r += 0.34 * np.sin(2 * np.pi * (f * 1.001) * tr + 0.2) * ev * gr
    lib["odometer-run"] = (od_l.astype(np.float32), od_r.astype(np.float32))

    for name, (l_arr, r_arr) in lib.items():
        save_stereo_wav(sfx_dir / f"{name}.wav", l_arr, r_arr, sr=SR)

    return lib


def build_mathmethic_cues(tl: dict) -> list[dict]:
    S = tl["scenes"]
    cues = []

    def add(t: float, sfx: str, vol: float = 0.75, note: str = ""):
        cues.append({"t": round(max(0.0, t), 3), "sfx": sfx, "vol": round(vol, 3), "note": note})

    # === SCENE 1: s01-visual-intuition ===
    sc1 = S["s01-visual-intuition"]
    L1 = sc1["lines"]
    add(0.15, "golden-lock", 0.78, "Cold open: Golden Pi & Wheel appear")
    add(L1[0]["segments"][2]["on"], "note_1", 0.72, "Diameter = 1 meter bar")
    add(L1[1]["segments"][0]["on"] + 0.3, "space-3d-open", 0.72, "Cyan wheel rim unpeels")
    # "one, two, three... plus a tiny golden gap" -> climbing pentatonic notes + golden lock!
    t_123 = L1[1]["segments"][2]["on"]
    add(t_123 + 0.05, "note_1", 0.78, "1d bar")
    add(t_123 + 0.35, "note_2", 0.80, "2d bar")
    add(t_123 + 0.65, "note_3", 0.82, "3d bar")
    add(L1[1]["segments"][3]["on"] + 0.15, "golden-lock", 0.86, "+ 0.14159 golden sliver!")
    add(L1[2]["segments"][1]["on"], "note_5", 0.74, "C / d = Pi")
    # L3: 16 wedges slicing & snapping into a rectangle (A = πr²)
    add(L1[3]["segments"][1]["on"] + 0.2, "note_2", 0.70, "Slice disk into 16 wedges")
    add(L1[3]["segments"][1]["on"] + 1.8, "wedge-snap", 0.84, "Wedges snap together like teeth")
    add(L1[3]["segments"][3]["on"] + 0.1, "golden-lock", 0.86, "Area = Pi r^2")
    # L4: 3D Sphere spin
    add(L1[4]["segments"][0]["on"] + 0.2, "space-3d-open", 0.82, "Spin disk into 3D Sphere V = 4/3 πr³")

    # === SCENE 2: s02-ancient-to-archimedes ===
    sc2 = S["s02-ancient-to-archimedes"]
    L2 = sc2["lines"]
    add(sc2["start"] + 0.18, "chapter-maj9", 0.90, "CHAPTER 02 Card")
    add(L2[0]["segments"][1]["on"] + 0.2, "note_1", 0.68, "Babylon 3.125")
    add(L2[0]["segments"][2]["on"] + 0.3, "note_2", 0.72, "Wikipedia Rhind Papyrus appears")
    add(L2[1]["segments"][1]["on"] + 0.2, "golden-lock", 0.76, "Wikipedia Archimedes portrait appears")
    add(L2[2]["segments"][1]["on"] + 0.3, "note_2", 0.74, "Cyan inner hexagon")
    add(L2[2]["segments"][2]["on"] + 0.1, "note_4", 0.78, "Coral outer hexagon")
    # L3: "from six, to twelve, twenty-four, forty-eight, and ninety-six sides!" -> 5-note ascending scale!
    t_poly = L2[3]["segments"][1]["on"]
    add(t_poly + 0.20, "note_1", 0.76, "N = 6")
    add(t_poly + 0.95, "note_2", 0.78, "N = 12")
    add(t_poly + 1.70, "note_3", 0.80, "N = 24")
    add(t_poly + 2.50, "note_4", 0.82, "N = 48")
    add(t_poly + 3.30, "note_6", 0.88, "N = 96!")
    add(L2[3]["segments"][2]["on"] + 0.2, "golden-lock", 0.84, "3.1408 < Pi < 3.1429")
    add(L2[4]["segments"][0]["on"] + 0.3, "space-3d-open", 0.78, "Zu Chongzhi portrait + 3D Prism-to-Cylinder limit")
    add(L2[4]["segments"][1]["on"] + 0.2, "golden-lock", 0.84, "355 / 113 Milu fraction")

    # === SCENE 3: s03-infinite-series-race ===
    sc3 = S["s03-infinite-series-race"]
    L3 = sc3["lines"]
    add(sc3["start"] + 0.18, "chapter-maj9", 0.90, "CHAPTER 03 Card")
    add(L3[0]["segments"][1]["on"] + 0.1, "golden-lock", 0.78, "Calculus unlocks infinite series")
    # L1: "one minus one third, plus one fifth, minus one seventh" -> alternating marimba notes!
    t_ser = L3[1]["segments"][1]["on"]
    add(t_ser + 0.15, "note_4", 0.74, "+ 1")
    add(t_ser + 0.95, "note_2", 0.74, "- 1/3")
    add(t_ser + 1.85, "note_3", 0.76, "+ 1/5")
    add(t_ser + 2.65, "note_5", 0.78, "- 1/7 -> Pi/4")
    add(L3[2]["segments"][0]["on"] + 0.2, "note_2", 0.72, "Wikipedia Isaac Newton portrait")
    add(L3[2]["segments"][1]["on"] + 0.2, "note_4", 0.74, "Wikipedia Leonhard Euler portrait")
    add(L3[2]["segments"][2]["on"] + 0.2, "golden-lock", 0.84, "Euler's Identity e^(iπ) + 1 = 0")
    add(L3[3]["segments"][0]["on"] + 0.3, "note_5", 0.76, "Wikipedia Srinivasa Ramanujan portrait")
    add(L3[3]["segments"][1]["on"] + 0.2, "golden-lock", 0.86, "+8 digits per term!")
    add(L3[4]["segments"][0]["on"] + 0.2, "space-3d-open", 0.78, "Wikipedia ENIAC computer photo")
    add(L3[4]["segments"][1]["on"] + 0.3, "odometer-run", 0.88, "2,037 -> 1 Billion -> 105 Trillion digits!")

    # === SCENE 4: s04-waves-and-3d-helix ===
    sc4 = S["s04-waves-and-3d-helix"]
    L4 = sc4["lines"]
    add(sc4["start"] + 0.18, "chapter-maj9", 0.90, "CHAPTER 04 Card")
    add(L4[1]["segments"][1]["on"] + 0.2, "golden-lock", 0.80, "1 Radian arc wraps along radius")
    add(L4[2]["segments"][0]["on"] + 0.3, "note_3", 0.74, "Half turn = Pi rad, Full turn = 2Pi rad")
    add(L4[2]["segments"][1]["on"] + 0.2, "space-3d-open", 0.86, "Open 3D Phase Space (cos ωt, sin ωt, t)")
    add(L4[3]["segments"][1]["on"] + 0.2, "note_4", 0.76, "Cyan Sine wall shadow")
    add(L4[3]["segments"][1]["on"] + 2.4, "note_5", 0.76, "Coral Cosine floor shadow")
    t_apps = L4[4]["segments"][0]["on"]
    add(t_apps + 0.3, "note_1", 0.70, "Pendulum")
    add(t_apps + 1.3, "note_2", 0.70, "Musical note")
    add(t_apps + 2.3, "note_3", 0.72, "AC current")
    add(t_apps + 3.3, "note_4", 0.74, "Wi-Fi & MRI")
    add(L4[4]["segments"][1]["on"] + 0.2, "golden-lock", 0.82, "Pi runs the show")

    # === SCENE 5: s05-irrational-and-curved-3d ===
    sc5 = S["s05-irrational-and-curved-3d"]
    L5 = sc5["lines"]
    add(sc5["start"] + 0.18, "chapter-maj9", 0.90, "CHAPTER 05 Card")
    add(L5[0]["segments"][0]["on"] + 0.2, "note_2", 0.74, "Wikipedia Johann Lambert (1761)")
    add(L5[0]["segments"][1]["on"] + 0.2, "note_4", 0.76, "Wikipedia Ferdinand von Lindemann (1882)")
    add(L5[0]["segments"][2]["on"] + 0.2, "wedge-snap", 0.80, "Squaring the circle IMPOSSIBLE")
    add(L5[1]["segments"][0]["on"] + 0.2, "space-3d-open", 0.78, "Wikipedia Voyager 1 spacecraft")
    add(L5[1]["segments"][1]["on"] + 0.05, "golden-lock", 0.88, "Just 15 decimal places!")
    add(L5[2]["segments"][1]["on"] + 0.2, "golden-lock", 0.86, "39 digits -> width of 1 hydrogen atom!")
    add(L5[3]["segments"][1]["on"] + 0.3, "space-3d-open", 0.84, "3D Curved Sphere (C/d < Pi)")
    add(L5[4]["segments"][0]["on"] + 0.2, "space-3d-open", 0.84, "3D Hyperbolic Saddle (C/d > Pi)")
    add(L5[4]["segments"][1]["on"] + 0.3, "space-3d-open", 0.86, "3D Black Hole Spacetime Funnel")

    # === SCENE 6: s06-grand-synthesis ===
    sc6 = S["s06-grand-synthesis"]
    L6 = sc6["lines"]
    add(sc6["start"] + 0.18, "chapter-maj9", 0.90, "CHAPTER 06 Card")
    add(L6[1]["segments"][0]["on"] + 0.1, "note_1", 0.78, "Pillar 1 (Cyan): Limit of Polygons")
    add(L6[1]["segments"][1]["on"] + 0.1, "note_3", 0.80, "Pillar 2 (Gold): Unit of Rotation")
    add(L6[2]["segments"][0]["on"] + 0.1, "note_4", 0.82, "Pillar 3 (Violet): Transcendental Infinity")
    add(L6[2]["segments"][1]["on"] + 0.1, "note_6", 0.86, "Pillar 4 (Emerald): Flat 3D Space")
    add(L6[3]["segments"][0]["on"] + 0.1, "space-3d-open", 0.84, "3D Torus + Sphere Finale")
    add(L6[3]["segments"][2]["off"] + 0.1, "chapter-maj9", 0.95, "Final lingering chord")

    cues.sort(key=lambda x: x["t"])
    return cues


def mix_vo_and_sfx(root: Path):
    tl_path = root / "data/timeline.json"
    tl = json.loads(tl_path.read_text(encoding="utf-8"))

    sfx_dir = root / "assets/audio/sfx"
    lib = synth_sfx_library(sfx_dir)
    cues = build_mathmethic_cues(tl)
    (root / "data/sfx-cues.json").write_text(json.dumps(cues, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Synthesized 11 melodic & tactile primitives & scheduled {len(cues)} mathematical cues.")

    vo_dir = root / "assets/audio/vo"
    all_vo = []
    for sid in tl["scenes"]:
        wav_p = vo_dir / f"{sid}.wav"
        raw = subprocess.check_output([
            "ffmpeg", "-hide_banner", "-v", "error", "-i", str(wav_p),
            "-ar", str(SR), "-ac", "1", "-f", "f32le", "pipe:1",
        ])
        all_vo.append(np.frombuffer(raw, dtype=np.float32))
    all_vo.append(np.zeros(int(1.0 * SR), dtype=np.float32))
    vo = np.concatenate(all_vo)

    n_total = vo.size
    left = vo.copy()
    right = vo.copy()

    hop = 480
    vo_rms = np.zeros(n_total, dtype=np.float32)
    for i in range(0, n_total - hop, hop):
        vo_rms[i : i + hop] = float(np.sqrt(np.mean(vo[i : i + hop] ** 2)))
    vo_duck = np.where(vo_rms > 0.038, 0.45, 1.0).astype(np.float32)
    kernel = np.ones(int(0.05 * SR), dtype=np.float32) / int(0.05 * SR)
    vo_duck = np.convolve(vo_duck, kernel, mode="same")

    for c in cues:
        sfx_name = c["sfx"]
        vol = float(c["vol"]) * 0.48
        idx0 = int(float(c["t"]) * SR)
        if idx0 >= n_total:
            continue
        s_l, s_r = lib[sfx_name]
        end = min(n_total, idx0 + s_l.size)
        span = end - idx0
        if span <= 0:
            continue
        duck_curve = 1.0 if sfx_name == "chapter-maj9" else vo_duck[idx0:end]
        left[idx0:end] += s_l[:span] * vol * duck_curve
        right[idx0:end] += s_r[:span] * vol * duck_curve

    master_wav = root / "assets/audio/master-with-sfx.tmp.wav"
    save_stereo_wav(master_wav, left, right, sr=SR)

    mix_m4a = root / "assets/audio/mix.m4a"
    mix_mp3 = root / "assets/audio/mix.mp3"
    subprocess.run([
        "ffmpeg", "-hide_banner", "-v", "error", "-y",
        "-i", str(master_wav),
        "-af", "loudnorm=I=-14.0:TP=-1.5:LRA=7.0",
        "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k",
        str(mix_m4a),
    ], check=True)
    subprocess.run([
        "ffmpeg", "-hide_banner", "-v", "error", "-y",
        "-i", str(mix_m4a),
        "-ar", "48000", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k",
        str(mix_mp3),
    ], check=True)
    master_wav.unlink(missing_ok=True)
    print(f"Mastered {mix_m4a.name} & {mix_mp3.name} with {len(cues)} melodic mathematical SFX cues!")


if __name__ == "__main__":
    proj = Path(sys.argv[1] if len(sys.argv) > 1 else "Pi/assets/videos/pi-mathmethic").resolve()
    mix_vo_and_sfx(proj)
