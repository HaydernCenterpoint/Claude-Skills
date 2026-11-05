// generate-channel-banner.mjs: Render 2560x1440 YouTube Channel Banners & 800x800 Avatar for "Mathmethic"
// Strictly adheres to YouTube's 1546x423 central safe zone while extending 2D+3D math across the full 2560x1440 4K TV canvas.
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../../PDoomVideo/package.json"));
const puppeteer = require("puppeteer-core");

const outDir = resolve(process.argv[2] || "Pi/assets/videos/pi-median-lab/renders");
mkdirSync(outDir, { recursive: true });

const fontBoldUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-median-lab/assets/fonts/BeVietnamPro-Bold.ttf")).href;
const fontExtraBoldUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-median-lab/assets/fonts/BeVietnamPro-ExtraBold.ttf")).href;
const fontMonoUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-median-lab/assets/fonts/JetBrainsMono-Regular.ttf")).href;
const fontMonoBoldUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-median-lab/assets/fonts/JetBrainsMono-Bold.ttf")).href;

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--allow-file-access-from-files", "--window-size=2560,1440", "--force_high_performance_gpu"],
});

const page = await browser.newPage();

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @font-face { font-family: "BeVietnamPro"; src: url("${fontBoldUrl}") format("truetype"); font-weight: 600 700; }
    @font-face { font-family: "BeVietnamPro"; src: url("${fontExtraBoldUrl}") format("truetype"); font-weight: 800; }
    @font-face { font-family: "JetBrainsMono"; src: url("${fontMonoUrl}") format("truetype"); font-weight: 400 500; }
    @font-face { font-family: "JetBrainsMono"; src: url("${fontMonoBoldUrl}") format("truetype"); font-weight: 700; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #060606; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
  <canvas id="c" width="2560" height="1440"></canvas>
  <script>
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    const TAU = Math.PI * 2;

    const COL = {
      void: "#060606",
      chalk: "#f2f2f2",
      sec: "#969696",
      muted: "#4a4a4a",
      blue: "#6b8cae",
      gold: "#d4b46a",
    };

    function project3D(x, y, z, cx, cy, scale, rx, ry, fov = 820) {
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      const p = fov / Math.max(150, fov + z2);
      return { x: cx + x2 * scale * p, y: cy + y1 * scale * p, z: z2, s: p };
    }

    function drawStardust(W, H, count = 650) {
      for (let i = 0; i < count; i++) {
        const h1 = Math.sin(i * 127.1 + 19.3) * 43758.5453;
        const h2 = Math.sin(i * 311.7 + 73.1) * 43758.5453;
        const x = (h1 - Math.floor(h1)) * W;
        const y = (h2 - Math.floor(h2)) * H;
        const r = 0.5 + ((i * 17) % 10) * 0.13;
        ctx.fillStyle = "rgba(255,255,255," + (0.018 + ((i * 29) % 10) * 0.007) + ")";
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }
    }

    function draw3DTorus(cx, cy, scale, rx, ry, R_maj = 1.25, r_min = 0.36, uSteps = 24, vSteps = 44, color = COL.blue, alpha = 0.38) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      for (let i = 0; i < uSteps; i++) {
        const u = (i / uSteps) * TAU;
        ctx.beginPath();
        for (let j = 0; j <= vSteps; j++) {
          const v = (j / vSteps) * TAU;
          const x = (R_maj + r_min * Math.cos(v)) * Math.cos(u);
          const y = r_min * Math.sin(v);
          const z = (R_maj + r_min * Math.cos(v)) * Math.sin(u);
          const p = project3D(x, y, z, cx, cy, scale, rx, ry);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.globalAlpha = alpha;
        ctx.stroke();
      }
      for (let j = 0; j < 10; j++) {
        const v = (j / 10) * TAU;
        ctx.beginPath();
        for (let i = 0; i <= 64; i++) {
          const u = (i / 64) * TAU;
          const x = (R_maj + r_min * Math.cos(v)) * Math.cos(u);
          const y = r_min * Math.sin(v);
          const z = (R_maj + r_min * Math.cos(v)) * Math.sin(u);
          const p = project3D(x, y, z, cx, cy, scale, rx, ry);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.globalAlpha = alpha * 0.65;
        ctx.stroke();
      }
      ctx.restore();
    }

    function draw3DSphere(cx, cy, radius, rx, ry, color = COL.chalk, eqColor = COL.gold, alpha = 0.45) {
      ctx.save();
      for (let i = 1; i < 8; i++) {
        const phi = (i / 8 - 0.5) * Math.PI;
        const rLat = Math.cos(phi), yLat = Math.sin(phi);
        const isEq = i === 4;
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
          const th = (j / 72) * TAU;
          const p = project3D(rLat * Math.cos(th), yLat, rLat * Math.sin(th), cx, cy, radius, rx, ry);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = isEq ? eqColor : color;
        ctx.lineWidth = isEq ? 2.2 : 1.1;
        ctx.globalAlpha = alpha * (isEq ? 0.95 : 0.42);
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const th = (i / 12) * Math.PI;
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
          const a = (j / 72) * TAU;
          const p = project3D(Math.cos(a) * Math.cos(th), Math.sin(a), Math.cos(a) * Math.sin(th), cx, cy, radius, rx, ry);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.0;
        ctx.globalAlpha = alpha * 0.35;
        ctx.stroke();
      }
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.stroke();
      ctx.restore();
    }

    function drawArchimedes2DLattice(cx, cy, R, alpha = 0.45) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = COL.chalk;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

      // Inscribed & circumscribed hexagons and dodecagons
      for (const [n, col, lw] of [[6, COL.blue, 1.6], [12, COL.gold, 1.2]]) {
        ctx.strokeStyle = col;
        ctx.lineWidth = lw;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * TAU - Math.PI / 2;
          const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Radial spokes & extended axes
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.0;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * TAU;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + R * Math.cos(a), cy + R * Math.sin(a));
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - R * 1.35, cy); ctx.lineTo(cx + R * 1.35, cy);
      ctx.moveTo(cx, cy - R * 1.35); ctx.lineTo(cx, cy + R * 1.35);
      ctx.stroke();

      // Glowing intersection node
      const nx = cx + R * Math.cos(-Math.PI * 0.75);
      const ny = cy + R * Math.sin(-Math.PI * 0.75);
      const ng = ctx.createRadialGradient(nx, ny, 2, nx, ny, 34);
      ng.addColorStop(0, "rgba(255,255,255,0.95)");
      ng.addColorStop(0.35, "rgba(212,180,106,0.35)");
      ng.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.arc(nx, ny, 34, 0, TAU); ctx.fill();
      ctx.restore();
    }

    /* ========================================================================
     * EDITION 1: "Obsidian 2D + 3D Mathematical Universe" (2560 x 1440)
     * Safe zone: x in [507, 2053], y in [508.5, 931.5] (center 1280, 720)
     * ======================================================================== */
    window.renderBanner1 = () => {
      const W = 2560, H = 1440;
      canvas.width = W; canvas.height = H;
      ctx.fillStyle = "#060606";
      ctx.fillRect(0, 0, W, H);

      // Deep radial spotlight centered at (1280, 720)
      const gCenter = ctx.createRadialGradient(1280, 720, 40, 1280, 720, 1250);
      gCenter.addColorStop(0, "#1c1e22");
      gCenter.addColorStop(0.42, "#0d0e10");
      gCenter.addColorStop(0.80, "#070707");
      gCenter.addColorStop(1, "#030303");
      ctx.fillStyle = gCenter;
      ctx.fillRect(0, 0, W, H);

      // Left Blue Glow (2D Geometry Side) & Right Gold Glow (3D Manifold Side)
      const gLeft = ctx.createRadialGradient(740, 720, 20, 740, 720, 560);
      gLeft.addColorStop(0, "rgba(107, 140, 174, 0.14)");
      gLeft.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gLeft; ctx.fillRect(0, 0, W, H);

      const gRight = ctx.createRadialGradient(1820, 720, 20, 1820, 720, 560);
      gRight.addColorStop(0, "rgba(212, 180, 106, 0.14)");
      gRight.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gRight; ctx.fillRect(0, 0, W, H);

      drawStardust(W, H, 700);

      // 3D Perspective Coordinate Grid spanning bottom of TV canvas & safe zone
      ctx.save();
      for (let i = -14; i <= 14; i++) {
        const u = i * 0.25;
        ctx.strokeStyle = i === 0 ? "rgba(235,235,235,0.16)" : "rgba(255,255,255,0.04)";
        ctx.lineWidth = i === 0 ? 1.4 : 0.9;
        const pA = project3D(u, 0.72, -2.5, 1280, 720, 420, 0.36, 0);
        const pB = project3D(u, 0.72, 2.5, 1280, 720, 420, 0.36, 0);
        ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      }
      for (let j = -8; j <= 8; j++) {
        const v = j * 0.32;
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 0.9;
        const pA = project3D(-3.5, 0.72, v, 1280, 720, 420, 0.36, 0);
        const pB = project3D(3.5, 0.72, v, 1280, 720, 420, 0.36, 0);
        ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y); ctx.stroke();
      }
      ctx.restore();

      // Continuous Sine + Cosine Phase Wave spanning across the entire 2560px horizon
      ctx.save();
      ctx.strokeStyle = "rgba(107, 140, 174, 0.20)";
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const u = (x - 1280) / 340;
        const env = Math.exp(-(u * u) / 14.0);
        const y = 720 - Math.sin(u * 2.4) * 145 * env;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = "rgba(212, 180, 106, 0.16)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const u = (x - 1280) / 340;
        const env = Math.exp(-(u * u) / 14.0);
        const y = 720 - Math.cos(u * 2.4) * 115 * env;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // Left Safe-Zone Wing (x = 710, y = 720): 2D Archimedes Polygon & Unit Circle Lattice
      drawArchimedes2DLattice(705, 720, 162, 0.68);

      // Right Safe-Zone Wing (x = 1855, y = 720): 3D Torus + 3D Geodesic Sphere
      draw3DTorus(1855, 720, 132, 0.55, -0.45, 1.28, 0.32, 20, 36, COL.blue, 0.36);
      draw3DSphere(1855, 720, 124, 0.45, -0.52, COL.chalk, COL.gold, 0.68);

      // Outer TV Canvas Geometric Accents (top & bottom mathematical constellations for 4K TV viewers)
      draw3DTorus(420, 310, 110, 0.48, 0.35, 1.2, 0.35, 16, 32, COL.sec, 0.16);
      drawArchimedes2DLattice(2140, 310, 125, 0.22);
      drawArchimedes2DLattice(420, 1130, 125, 0.22);
      draw3DSphere(2140, 1130, 115, 0.42, 0.6, COL.sec, COL.blue, 0.22);

      // Faint Mathematical Formulas in the outer TV field
      ctx.save();
      ctx.font = "500 22px JetBrainsMono, monospace";
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.textAlign = "center";
      ctx.fillText("e^(iπ) + 1 = 0", 680, 360);
      ctx.fillText("∫ e^(-x²) dx = √π", 1880, 360);
      ctx.fillText("C / d = π  (K = 0)", 680, 1085);
      ctx.fillText("ζ(2) = π² / 6", 1880, 1085);
      ctx.restore();

      // Soft Elliptical Center Radial Backing (zero hard rectangle edges!)
      ctx.save();
      ctx.translate(1280, 720);
      ctx.scale(1.65, 0.85);
      const centerBacking = ctx.createRadialGradient(0, 0, 20, 0, 0, 310);
      centerBacking.addColorStop(0, "rgba(6, 6, 6, 0.88)");
      centerBacking.addColorStop(0.58, "rgba(6, 6, 6, 0.48)");
      centerBacking.addColorStop(1, "rgba(6, 6, 6, 0)");
      ctx.fillStyle = centerBacking;
      ctx.beginPath();
      ctx.arc(0, 0, 320, 0, TAU);
      ctx.fill();
      ctx.restore();

      // Top Kicker above Wordmark (inside safe zone: y = 605)
      ctx.save();
      ctx.font = "700 17px JetBrainsMono, monospace";
      ctx.fillStyle = COL.gold;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "7px";
      ctx.fillText("2D  &  3D  MATHEMATICAL  CINEMA", 1280, 598);
      ctx.restore();

      // Main Channel Wordmark: "Mathmethic" (Centered at 1280, 698 — 100% inside 1546x423 safe zone!)
      ctx.save();
      ctx.font = "800 118px BeVietnamPro, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "-2px";

      // Soft outer glow
      ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
      ctx.shadowBlur = 38;
      const wg = ctx.createLinearGradient(920, 630, 1640, 760);
      wg.addColorStop(0, "#ffffff");
      wg.addColorStop(0.52, "#f0f0f0");
      wg.addColorStop(1, "#d9b86c");
      ctx.fillStyle = wg;
      ctx.fillText("Mathmethic", 1280, 698);
      ctx.restore();

      // Minimalist Horizontal Divider with Central Golden Ratio / Pi Node (y = 778)
      ctx.save();
      ctx.strokeStyle = "rgba(235,235,235,0.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(980, 778); ctx.lineTo(1245, 778);
      ctx.moveTo(1315, 778); ctx.lineTo(1580, 778);
      ctx.stroke();
      ctx.fillStyle = COL.gold;
      ctx.font = "italic 700 28px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("π", 1280, 778);
      ctx.restore();

      // Bottom Subtitle / Epistemic Motto (y = 824 — well above safe zone bottom 931.5)
      ctx.save();
      ctx.font = "600 19px JetBrainsMono, monospace";
      ctx.fillStyle = COL.sec;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "5px";
      ctx.fillText("FIRST PRINCIPLES  ·  PROOF, NOT CONVENTION  ·  PURE LOGIC", 1280, 826);
      ctx.restore();

      return canvas.toDataURL("image/png");
    };

    /* ========================================================================
     * EDITION 2: "Minimalist Emblem + 3D Hyperbolic & Spherical Horizon"
     * ======================================================================== */
    window.renderBanner2 = () => {
      const W = 2560, H = 1440;
      canvas.width = W; canvas.height = H;
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, W, H);

      const gCenter = ctx.createRadialGradient(1280, 720, 20, 1280, 720, 1180);
      gCenter.addColorStop(0, "#202020");
      gCenter.addColorStop(0.45, "#0c0c0c");
      gCenter.addColorStop(1, "#040404");
      ctx.fillStyle = gCenter;
      ctx.fillRect(0, 0, W, H);

      drawStardust(W, H, 650);

      // Giant subtle concentric geometric rings behind the entire safe zone
      for (let r = 180; r <= 960; r += 110) {
        ctx.strokeStyle = "rgba(255,255,255,0.035)";
        ctx.lineWidth = 1.0;
        ctx.beginPath(); ctx.arc(1280, 720, r, 0, TAU); ctx.stroke();
      }

      // Left Emblem inside Safe Zone (x = 815, y = 720): Interlocking 2D Polygon + 3D Sphere + Luminous ∑ / π Monogram
      const ex = 815, ey = 720;
      const eg = ctx.createRadialGradient(ex, ey, 10, ex, ey, 220);
      eg.addColorStop(0, "rgba(212, 180, 106, 0.22)");
      eg.addColorStop(0.5, "rgba(107, 140, 174, 0.10)");
      eg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = eg;
      ctx.beginPath(); ctx.arc(ex, ey, 220, 0, TAU); ctx.fill();

      draw3DSphere(ex, ey, 148, 0.42, -0.48, COL.chalk, COL.gold, 0.72);
      drawArchimedes2DLattice(ex, ey, 148, 0.65);

      ctx.save();
      ctx.font = "italic 700 132px Georgia, serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(255,255,255,0.55)";
      ctx.shadowBlur = 32;
      ctx.fillText("π", ex, ey + 6);
      ctx.restore();

      // Right Typography Lockup inside Safe Zone (x = 1045..1980, y = 720)
      ctx.save();
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.font = "700 17px JetBrainsMono, monospace";
      ctx.fillStyle = COL.gold;
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "6px";
      ctx.fillText("THE ESSENCE OF MATHEMATICS", 1035, 622);

      ctx.font = "800 124px BeVietnamPro, sans-serif";
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "-2px";
      ctx.shadowColor = "rgba(255,255,255,0.3)";
      ctx.shadowBlur = 30;
      ctx.fillStyle = "#ffffff";
      ctx.fillText("Mathmethic", 1030, 715);

      ctx.shadowBlur = 0;
      ctx.font = "500 21px JetBrainsMono, monospace";
      ctx.fillStyle = COL.sec;
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "3px";
      ctx.fillText("2D & 3D INTUITION  ·  PROOFS  ·  FIRST PRINCIPLES", 1035, 812);
      ctx.restore();

      return canvas.toDataURL("image/png");
    };

    /* ========================================================================
     * BONUS: 800 x 800 YouTube Channel Avatar / Profile Emblem for "Mathmethic"
     * ======================================================================== */
    window.renderAvatar = () => {
      const W = 800, H = 800;
      canvas.width = W; canvas.height = H;
      ctx.fillStyle = "#060606";
      ctx.fillRect(0, 0, W, H);

      const cx = 400, cy = 400;
      const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, 390);
      bg.addColorStop(0, "#24262b");
      bg.addColorStop(0.55, "#0d0e11");
      bg.addColorStop(1, "#050505");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      drawStardust(W, H, 180);
      draw3DSphere(cx, cy, 275, 0.42, -0.48, COL.chalk, COL.gold, 0.72);
      drawArchimedes2DLattice(cx, cy, 275, 0.65);

      // Stylized "M" + "π" Geometric Monogram at Center
      ctx.save();
      ctx.font = "800 245px BeVietnamPro, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(255,255,255,0.5)";
      ctx.shadowBlur = 42;
      const mg = ctx.createLinearGradient(240, 240, 560, 560);
      mg.addColorStop(0, "#ffffff");
      mg.addColorStop(0.6, "#e8e8e8");
      mg.addColorStop(1, "#d4b46a");
      ctx.fillStyle = mg;
      ctx.fillText("M", cx, cy - 8);

      ctx.shadowBlur = 0;
      ctx.font = "700 22px JetBrainsMono, monospace";
      ctx.fillStyle = COL.gold;
      if (ctx.letterSpacing !== undefined) ctx.letterSpacing = "7px";
      ctx.fillText("MATHMETHIC", cx + 4, cy + 168);
      ctx.restore();

      return canvas.toDataURL("image/png");
    };

    document.fonts.ready.then(() => { window.ready = true; });
  </script>
</body>
</html>`;

await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction("window.ready === true");

const b1 = await page.evaluate(() => window.renderBanner1());
writeFileSync(join(outDir, "mathmethic-banner-1.png"), Buffer.from(b1.split(",")[1], "base64"));

const b2 = await page.evaluate(() => window.renderBanner2());
writeFileSync(join(outDir, "mathmethic-banner-2.png"), Buffer.from(b2.split(",")[1], "base64"));

const av = await page.evaluate(() => window.renderAvatar());
writeFileSync(join(outDir, "mathmethic-avatar.png"), Buffer.from(av.split(",")[1], "base64"));

await browser.close();
console.log("Generated mathmethic-banner-1.png, mathmethic-banner-2.png, and mathmethic-avatar.png in", outDir);
process.exit(0);
