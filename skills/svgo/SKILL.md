---
name: svgo
description: Optimize, sanitize, and prepare SVG files using SVGO v4 (CLI and Node.js API) for web, video, and stroke/morph animations (GSAP DrawSVG, Anime.js, Motion, Remotion). Use when optimizing SVG assets, preserving IDs/viewBox/paths for animation, stripping bloat from Illustrator/Figma exports, or configuring svgo.config.mjs.
---

# SVGO (SVG Optimizer v4)

Optimize SVG assets without breaking animation targets (IDs, classes, `viewBox`, or path geometry).

## CLI Usage

```bash
# Optimize single file
svgo input.svg -o output.svg

# Optimize folder recursively
svgo -f ./assets/svg -o ./assets/svg-min

# Multipass optimization
svgo --multipass input.svg -o output.svg
```

## Animation-Safe Configuration (`svgo.config.mjs`)

Default `preset-default` merges paths, strips `id` attributes, and converts shapes (`<rect>`, `<circle>`) or strips `viewBox` in older configs. For animated SVGs (GSAP, Anime.js, Remotion, Motion), preserve structure:

```js
export default {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Keep IDs for selector targeting (#clawd-eye, #logo-path)
          cleanupIds: false,
          // Keep group structure for hierarchical transforms
          collapseGroups: false,
          // Keep separate paths so each element can animate independently
          mergePaths: false,
          // Keep hidden elements that may be revealed during timeline
          removeHiddenElems: false,
          // Keep shape elements or convert to path intentionally (see convertShapeToPath)
          convertShapeToPath: false,
        },
      },
    },
    'removeDimensions', // Rely on viewBox for responsive scaling
  ],
};
```

### When You Need Stroke-Dash / Morphing (`convertShapeToPath`)
If using `stroke-dashoffset` line drawing or path morphing on `<rect>`, `<circle>`, `<polygon>`, enable `convertShapeToPath: { convertArcs: true }` so all primitives become `<path d="...">`.

## Node.js Programmatic API

```js
import { optimize } from 'svgo';

const result = optimize(svgString, {
  path: 'icon.svg',
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          cleanupIds: false,
          mergePaths: false,
          collapseGroups: false,
        },
      },
    },
  ],
});

const optimizedSvg = result.data;
```
