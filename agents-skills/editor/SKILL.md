---
name: editor
description: Understand, generate, and edit footage with Diffusion Studio. Analyze video/audio/images, generate them with AI, and compose video compositions. Use when the user asks for /editor, Diffusion Studio, dapi, video editing, clipping, captions, timeline composition, or media analysis.
---

# Diffusion Studio Editor

Diffusion Studio is a video editor running locally on this machine (Vite on :5173, MCP on :3274).

Workspace: `C:\Users\datmk\OneDrive\Desktop\Workspace\Editor`
CLI: `node C:\Users\datmk\OneDrive\Desktop\Workspace\Editor\apps\cli\dist\index.js <command>`

## Quick verification & connection

Ensure Diffusion Studio is running. If not:
```powershell
cd C:\Users\datmk\OneDrive\Desktop\Workspace\Editor
npm run dev
```

Test status:
```powershell
node C:\Users\datmk\OneDrive\Desktop\Workspace\Editor\apps\cli\dist\index.js context
```

# Footage analysis

How to understand source material before editing it. Inspect only the modalities the decision turns on — speech, action, music, graphics, or atmosphere may lead, so there is no fixed priority. Sample the picture against what the audio tells you.

- **Always probe first.** `media probe <file>` reports the container and its tracks, telling you up front whether the file has a video track, an audio track, or both. Everything after branches on that.
- **Get the lay of the land.** Render a `media waveform <file>` (audio) and a `media filmstrip <file>` (video) for a fast, cheap overview of where the loud and quiet stretches fall, and where the visual scene changes are. A filmstrip shows coarse structure and scene state, not crop, framing, readability, or an exact cut frame.
- **Listen to the audio.** Run `media listen <file>` with a prompt tailored to the context (what you actually need to know), and explicitly ask the model to include timestamps in its answer.
- **Transcribe speech.** For speech, `media transcribe <file>` writes the full transcript with word-level start/end times to a JSON file and returns its path — search the file for the line you need and read its times from there, rather than loading it whole.
- **Sample the video against the audio.** Use `media grab <file>` to pull frames. When the audio has already pointed you at specific moments, feed those timestamps straight in from the transcript or listen output as `times` (e.g. `00:32`, `00:45`). When you need a visual pass without such cues, reach for `auto`: it scans the footage and keeps only the frames where the picture settles into a new visual state, dropping near-duplicates.

# The editing loop

- **Write the brief first.** For anything nontrivial, capture the edit as a markdown file: it is the plan every save works toward and the thing to check the result against.
- **Lay down the A-roll.** Assemble the primary footage as JSX and save. Get the spine of the edit right before anything else.
- **Layer the rest on top.** Once the A-roll holds, add B-roll and secondary assets (sound effects, captions, overlays) in the same source.
- **Symlink or place media** into the project's `assets/` folder and name it by library path (`assets/b-roll/drone.mp4` is `"b-roll/drone.mp4"`); local and remote paths work too.
- `context` reports which folder the app actually has open, where the playhead sits, and where every `generate.*` declaration stands — poll it to wait for generations without blocking.

**The source is the document.** A project is a folder of JSX; `open <dir>` opens the folder, then write the files and save. Saving recompiles and re-renders the canvas.

# Compositing guidelines

- Video is its own medium, with its own rules; it is watched, not read.
- Don't darken, blur, or cover the picture to make something on top of it legible.
- Let visuals, sound, and voice carry context; let text punctuate rather than explain.
- Choose easing from the intended weight, energy, and continuity of the action.

# Verification

- Run `check <id>` on the scene first. It catches black frames, clips that never become visible, zero-duration or fully transparent nodes, and assets that failed to load or generate.
- Use `capture <id>` on the scene to inspect the rendered frames.
- Reconcile captured frames with the brief.
- Use `screenshot` to inspect the full UI of Diffusion Studio when needed.
- DO NOT export/render the full scene unless explicitly requested.
- Render final video via `export <id> [output.mp4]`.

