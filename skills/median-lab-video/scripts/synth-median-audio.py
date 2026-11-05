"""Generate @median-lab / Mathmethic studio-grade voice-over with
5-Mode Dynamic Multi-Speed Prosody ("fast", "emphasis", "normal", "question", "release"),
exact WordBoundary millisecond alignment, timeline.json, and mix.m4a.

5-Mode Dynamic Prosody Engine (Microsoft Dragon HD `en-US-AndrewMultilingualNeural`):
  - `fast`     : rate="+15%", pitch="+2Hz", gain=+0.6dB, gap_after=0.08s (energetic momentum & lists)
  - `normal`   : rate="+3%",  pitch="+0Hz", gain=+0.2dB, gap_after=0.14s (natural fluid storytelling)
  - `emphasis` : rate="-5%",  pitch="+3Hz", gain=+1.8dB, gap_before=0.18s, gap_after=0.22s (dramatic stress / nhấn)
  - `question` : rate="+1%",  pitch="+4Hz", gain=+1.0dB, gap_after=0.32s (inquisitive hook)
  - `release`  : rate="-7%",  pitch="-3Hz", gain=-0.2dB, gap_before=0.16s, taper=True (warm cadence drop / thả)

Usage:
  python median-lab-video/scripts/synth-median-audio.py <project_dir> [--lang en|vi] [--force]
"""
import asyncio
import json
import math
import re
import struct
import subprocess
import sys
import wave
from pathlib import Path

import edge_tts

sys.stdout.reconfigure(encoding="utf-8")

NEURAL_VOICES = {
    "en": "en-US-AndrewMultilingualNeural",
    "vi": "vi-VN-NamMinhNeural",
}

MODE_PROFILES = {
    "fast":     {"rate": "+15%", "pitch": "+2Hz", "gain_db": 0.6,  "pre": 0.03, "post": 0.08, "taper": False},
    "normal":   {"rate": "+3%",  "pitch": "+0Hz", "gain_db": 0.2,  "pre": 0.03, "post": 0.14, "taper": False},
    "emphasis": {"rate": "-5%",  "pitch": "+3Hz", "gain_db": 1.8,  "pre": 0.18, "post": 0.22, "taper": False},
    "question": {"rate": "+1%",  "pitch": "+4Hz", "gain_db": 1.0,  "pre": 0.06, "post": 0.30, "taper": False},
    "release":  {"rate": "-7%",  "pitch": "-3Hz", "gain_db": -0.2, "pre": 0.15, "post": 0.00, "taper": True},
}


def resolve_line_segments(line: dict, lang: str = "en") -> list[dict]:
    """Return explicit 5-mode segments if present, or auto-split text into prosodic clauses."""
    if "segments" in line and isinstance(line["segments"], list):
        out = []
        for idx, seg_item in enumerate(line["segments"]):
            mode = seg_item.get("mode", "normal")
            prof = MODE_PROFILES.get(mode, MODE_PROFILES["normal"]).copy()
            txt = seg_item["text"].strip()
            if idx == len(line["segments"]) - 1:
                prof["post"] = 0.0
            out.append({"text": txt, "mode": mode, **prof})
        return out

    text = (line.get("say") or line.get(lang) or line.get("en") or line.get("vi") or "").strip()
    raw_parts = re.split(r"\s*(?:—|\.\.\.|:)\s*", text)
    parts = [p.strip() for p in raw_parts if p.strip()]
    if len(parts) == 1:
        mode = "emphasis" if line.get("role") == "punchline" else ("question" if line.get("role") == "question" else "normal")
        prof = MODE_PROFILES[mode].copy()
        prof["post"] = 0.0
        return [{"text": parts[0], "mode": mode, **prof}]

    out = []
    for idx, p in enumerate(parts):
        mode = "normal" if idx == 0 else ("release" if idx == len(parts) - 1 else "emphasis")
        prof = MODE_PROFILES[mode].copy()
        if idx == len(parts) - 1:
            prof["post"] = 0.0
        out.append({"text": p, "mode": mode, **prof})
    return out


async def synth_clause_neural(text: str, voice: str, rate: str, pitch: str, sr: int = 24000) -> tuple[bytes, list[tuple[str, float, float]]]:
    mp3_buf = bytearray()
    wb = []
    for attempt in range(4):
        try:
            mp3_buf.clear()
            wb.clear()
            comm = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch, boundary="WordBoundary")
            async with asyncio.timeout(20):
                async for ev in comm.stream():
                    if ev["type"] == "audio":
                        mp3_buf.extend(ev["data"])
                    elif ev["type"] == "WordBoundary":
                        ws = ev["offset"] * 1e-7
                        wd = max(0.04, ev["duration"] * 1e-7)
                        wb.append((ev["text"], ws, ws + wd))
            if mp3_buf:
                break
        except Exception as e:
            print(f"  [neural retry {attempt+1}/4]: {e}", flush=True)
            await asyncio.sleep(1.0)

    proc = subprocess.run(
        ["ffmpeg", "-hide_banner", "-v", "error", "-i", "pipe:0", "-ac", "1", "-ar", str(sr), "-f", "s16le", "pipe:1"],
        input=bytes(mp3_buf),
        capture_output=True,
        check=True,
    )
    return proc.stdout, wb


def trim_clause_pcm(
    pcm: bytes,
    wb: list[tuple[str, float, float]],
    sr: int,
    gain_db: float = 0.0,
    taper: bool = False,
) -> tuple[bytes, float, list[tuple[str, float, float]]]:
    n = len(pcm) // 2
    if n < 400:
        return pcm, n / sr, wb

    samples = list(struct.unpack(f"<{n}h", pcm))
    hop = int(0.010 * sr)
    n_frames = max(1, n // hop)
    env = [
        math.sqrt(sum(x * x for x in samples[i * hop : (i + 1) * hop]) / max(1, hop))
        for i in range(n_frames)
    ]
    peak = max(env) if env else 1.0
    thr = max(85.0, peak * 0.05)
    voiced = [i for i, v in enumerate(env) if v >= thr]
    if voiced:
        f_first = max(0, voiced[0] - 3)
        f_last = min(n_frames, voiced[-1] + 7)
    else:
        f_first, f_last = 0, n_frames

    trim_start_s = f_first * 0.010
    s0 = f_first * hop
    s1 = min(n, f_last * hop)
    trimmed = samples[s0:s1]
    m = len(trimmed)

    lin_gain = 10.0 ** (gain_db / 20.0)
    taper_start = int(m * 0.55) if taper else m
    taper_span = max(1, m - taper_start)

    for i in range(m):
        g = lin_gain
        if taper and i >= taper_start:
            u = (i - taper_start) / taper_span
            g *= 1.0 - 0.16 * (0.5 * (1.0 - math.cos(math.pi * u)))
        fade_n = min(int(0.012 * sr), m // 4)
        if i < fade_n:
            g *= 0.5 * (1.0 - math.cos(math.pi * i / max(1, fade_n)))
        elif i >= m - fade_n:
            g *= 0.5 * (1.0 - math.cos(math.pi * (m - 1 - i) / max(1, fade_n)))
        trimmed[i] = max(-32767, min(32767, int(trimmed[i] * g)))

    dur = m / sr
    shifted_wb = []
    for w_txt, ws, we in wb:
        n_ws = max(0.0, ws - trim_start_s)
        n_we = min(dur, max(n_ws + 0.04, we - trim_start_s))
        shifted_wb.append((w_txt, round(n_ws, 4), round(n_we, 4)))

    return struct.pack(f"<{m}h", *trimmed), dur, shifted_wb


async def synth_scene_vo(
    sc: dict,
    lang: str,
    vo_dir: Path,
    align_dir: Path,
    force: bool = False,
) -> dict:
    sid = sc["id"]
    raw_wav = vo_dir / f"{sid}.raw.wav"
    out_wav = vo_dir / f"{sid}.wav"
    align_out = align_dir / f"{sid}.json"
    if out_wav.exists() and align_out.exists() and not force:
        info = json.loads(align_out.read_text(encoding="utf8"))
        print(f"skip vo {sid} ({info.get('duration')}s)")
        return info

    sr = 24000
    voice = NEURAL_VOICES.get(lang, NEURAL_VOICES["en"])
    lead_in = float(sc.get("leadIn", 0.85 if sc.get("coldOpen") else 2.80))
    cursor = lead_in
    pcm_chunks = [b"\x00\x00" * int(cursor * sr)]
    words_all = []
    lines_meta = []

    for idx, line in enumerate(sc.get("lines", [])):
        clauses = resolve_line_segments(line, lang=lang)
        if not clauses:
            continue

        l_on = round(cursor, 4)
        line_words = []
        seg_spans = []
        full_text_parts = []

        for c_idx, c in enumerate(clauses):
            if c["pre"] > 0 and c_idx > 0:
                pcm_chunks.append(b"\x00\x00" * int(c["pre"] * sr))
                cursor = round(cursor + c["pre"], 4)

            seg_on = round(cursor, 4)
            c_pcm, c_wb = await synth_clause_neural(c["text"], voice, c["rate"], c["pitch"], sr=sr)
            trimmed_pcm, c_dur, shifted_wb = trim_clause_pcm(
                c_pcm, c_wb, sr=sr, gain_db=c["gain_db"], taper=c["taper"]
            )
            for w_txt, ws, we in shifted_wb:
                w_entry = {
                    "text": w_txt,
                    "start": round(cursor + ws, 4),
                    "end": round(cursor + we, 4),
                    "mode": c["mode"],
                }
                words_all.append(w_entry)
                line_words.append([w_txt, w_entry["start"], w_entry["end"], c["mode"]])

            pcm_chunks.append(trimmed_pcm)
            cursor = round(cursor + c_dur, 4)
            seg_off = round(cursor, 4)
            seg_spans.append({
                "text": c["text"],
                "mode": c["mode"],
                "on": seg_on,
                "off": seg_off,
            })
            full_text_parts.append(c["text"])

            if c["post"] > 0:
                pcm_chunks.append(b"\x00\x00" * int(c["post"] * sr))
                cursor = round(cursor + c["post"], 4)

        l_off = round(cursor, 4)
        pause_s = float(line.get("pause", 0.65))
        lines_meta.append({
            "index": idx,
            "text": " ".join(full_text_parts),
            "on": l_on,
            "off": l_off,
            "pause": pause_s,
            "segments": seg_spans,
            "words": line_words,
        })

        pcm_chunks.append(b"\x00\x00" * int(pause_s * sr))
        cursor = round(cursor + pause_s, 4)

    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(b"".join(pcm_chunks))

    # Studio Condenser Warm Baritone Mastering (soft-knee 1.5:1 ratio so +1.8dB 'emphasis' peaks truly pop!)
    af_chain = (
        "highpass=f=75,"
        "equalizer=f=125:t=q:w=1.1:g=2.0,"
        "equalizer=f=270:t=q:w=1.5:g=-1.2,"
        "equalizer=f=3600:t=q:w=1.4:g=1.4,"
        "acompressor=threshold=-22dB:ratio=1.5:attack=25:release=260:makeup=1.5dB,"
        "loudnorm=I=-14.0:TP=-1.8:LRA=7.5"
    )
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", str(raw_wav), "-af", af_chain, "-ar", str(sr), "-ac", "1", str(out_wav)],
        check=True,
    )
    raw_wav.unlink(missing_ok=True)
    info = {
        "id": sid,
        "leadIn": lead_in,
        "duration": round(cursor, 4),
        "lines": lines_meta,
        "words": words_all,
    }
    align_out.write_text(json.dumps(info, ensure_ascii=False, indent=2), encoding="utf8")
    print(f"vo [5-mode-dynamic] {sid}: {cursor:.2f}s ({len(lines_meta)} lines, {len(words_all)} words)", flush=True)
    return info


def build_master_timeline_and_mix(root: Path, script: dict, scene_infos: list[dict]):
    sr = 24000
    vo_dir = root / "assets/audio/vo"
    audio_dir = root / "assets/audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    global_cursor = 0.0
    scenes_timeline = {}
    all_pcm = []

    for sc, info in zip(script.get("scenes", []), scene_infos):
        sid = sc["id"]
        wav_path = vo_dir / f"{sid}.wav"
        with wave.open(str(wav_path), "rb") as wf:
            pcm = wf.readframes(wf.getnframes())
            dur = wf.getnframes() / wf.getframerate()

        sc_start = round(global_cursor, 4)
        sc_end = round(global_cursor + dur, 4)

        shifted_lines = []
        for ln in info["lines"]:
            shifted_segs = [
                {
                    "text": sg["text"],
                    "mode": sg["mode"],
                    "on": round(sc_start + sg["on"], 4),
                    "off": round(sc_start + sg["off"], 4),
                }
                for sg in ln.get("segments", [])
            ]
            shifted_lines.append({
                "index": ln["index"],
                "text": ln["text"],
                "on": round(sc_start + ln["on"], 4),
                "off": round(sc_start + ln["off"], 4),
                "pause": ln["pause"],
                "segments": shifted_segs,
                "words": [[w[0], round(sc_start + w[1], 4), round(sc_start + w[2], 4), w[3] if len(w) > 3 else "normal"] for w in ln["words"]],
            })

        scenes_timeline[sid] = {
            "id": sid,
            "kicker": sc.get("kicker", ""),
            "title": sc.get("title", ""),
            "watermark": sc.get("watermark", ""),
            "leadIn": info["leadIn"],
            "start": sc_start,
            "end": sc_end,
            "duration": round(dur, 4),
            "lines": shifted_lines,
        }
        all_pcm.append(pcm)
        global_cursor = sc_end

    all_pcm.append(b"\x00\x00" * int(1.0 * sr))
    total_dur = round(global_cursor + 1.0, 4)

    master_wav = audio_dir / "vo-master.raw.wav"
    with wave.open(str(master_wav), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(b"".join(all_pcm))

    mix_m4a = audio_dir / "mix.m4a"
    mix_mp3 = audio_dir / "mix.mp3"
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-v", "error", "-y",
            "-i", str(master_wav),
            "-af", "loudnorm=I=-14.0:TP=-1.8:LRA=7.5",
            "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "192k",
            str(mix_m4a),
        ],
        check=True,
    )
    subprocess.run(
        [
            "ffmpeg", "-hide_banner", "-v", "error", "-y",
            "-i", str(mix_m4a),
            "-ar", "48000", "-ac", "2", "-c:a", "libmp3lame", "-b:a", "192k",
            str(mix_mp3),
        ],
        check=True,
    )
    master_wav.unlink(missing_ok=True)

    timeline_data = {
        "duration": total_dur,
        "fps": 30,
        "scenes": scenes_timeline,
    }
    timeline_path = root / "data/timeline.json"
    timeline_path.write_text(json.dumps(timeline_data, ensure_ascii=False, indent=2), encoding="utf8")
    (root / "data/timeline.js").write_text("window.TIMING = " + timeline_path.read_text(encoding="utf8") + ";\n", encoding="utf8")
    print(f"Built timeline.json, timeline.js & mix.m4a: total duration = {total_dur:.2f}s ({len(scenes_timeline)} scenes)", flush=True)


async def main():
    if len(sys.argv) < 2:
        print("Usage: python synth-median-audio.py <project_dir> [--lang en|vi] [--force]")
        sys.exit(1)
    root = Path(sys.argv[1]).resolve()
    lang = "vi" if "--lang=vi" in sys.argv else "en"
    force = "--force" in sys.argv

    script_path = root / "data/script.json"
    script = json.loads(script_path.read_text(encoding="utf8"))
    vo_dir = root / "assets/audio/vo"
    align_dir = root / "data/align"
    vo_dir.mkdir(parents=True, exist_ok=True)
    align_dir.mkdir(parents=True, exist_ok=True)

    scene_infos = []
    for sc in script.get("scenes", []):
        info = await synth_scene_vo(sc, lang, vo_dir, align_dir, force=force)
        scene_infos.append(info)

    build_master_timeline_and_mix(root, script, scene_infos)


if __name__ == "__main__":
    asyncio.run(main())
