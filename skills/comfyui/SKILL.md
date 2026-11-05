---
name: comfyui
description: Local ComfyUI diffusion workflows for images, video, audio, and 3D node graphs. Use when the user asks for ComfyUI, Stable Diffusion, Flux, Wan, LTX, Hunyuan, custom nodes, or a local node-graph generator. For a one-off image in Grok, prefer bundled imagine/image_gen unless they named ComfyUI.
---

# ComfyUI

Checkout: `C:\Users\datmk\.local\agent-tools\ComfyUI`

GPU on this machine: NVIDIA GeForce RTX 4060 Laptop (8 GB). Keep models small (quantized / 8-bit / distilled). Do not download huge video checkpoints unless asked.

## When to use

- User wants ComfyUI, node graphs, local SD/Flux/Wan.
- Repeatable local image/video pipelines.

## When not to use

- Simple one-shot image in Grok chat → bundled `imagine` / `image_gen`.
- Native PowerPoint → `ppt-master`.
- Architecture diagrams → `archify`.

## Run

If `python C:\Users\datmk\.local\agent-tools\ComfyUI\main.py` is not already running:

```powershell
cd C:\Users\datmk\.local\agent-tools\ComfyUI
python main.py --listen 127.0.0.1 --port 8188
```

API: `http://127.0.0.1:8188`

If dependencies are missing, install from that folder with the CUDA torch extra, then `pip install -r requirements.txt`. Do not start a full model download unless the user asked.

## Agent behavior

1. Confirm the task is local diffusion, not Grok Imagine.
2. Prefer existing checkpoints in `models/`.
3. Keep workflows API-runnable JSON.
4. 8 GB VRAM: avoid unquantized 30B+ video models.
