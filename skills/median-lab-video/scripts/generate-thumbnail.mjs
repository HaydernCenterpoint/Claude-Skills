// generate-thumbnail.mjs: Render 1920x1080 @median-lab Obsidian 2D+3D Thumbnail
// Usage:
//   node median-lab-video/scripts/generate-thumbnail.mjs <out_dir>
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

const browser = await puppeteer.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--allow-file-access-from-files", "--window-size=1920,1080", "--force_high_performance_gpu"],
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    @font-face {
      font-family: "BeVietnamPro";
      src: url("${fontBoldUrl}") format("truetype");
      font-weight: 600 700;
    }
    @font-face {
      font-family: "BeVietnamPro";
      src: url("${fontExtraBoldUrl}") format("truetype");
      font-weight: 800;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1920px; height: 1080px; overflow: hidden; background: #060606; }
    canvas { display: block; width: 1920px; height: 1080px; }
  </style>
</head>
<body>
  <canvas id="c" width="1920" height="1080"></canvas>
  <script>
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    const W = 1920, H = 1080, TAU = Math.PI * 2;

    function project3D(x, y, z, cx, cy, scale, rx, ry, fov = 750) {
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      const p = fov / (fov + z2);
      return { x: cx + x2 * scale * p, y: cy + y1 * scale * p, z: z2 };
    }

    window.drawThumb = (line1, line2) => {
      ctx.clearRect(0, 0, W, H);

      // 1. Deep Obsidian Void + Radial Bloom behind Hero Pi
      const cx = 1050, cy = 450;
      ctx.fillStyle = "#060606";
      ctx.fillRect(0, 0, W, H);

      const bgGlow = ctx.createRadialGradient(cx, cy, 20, cx, cy, 880);
      bgGlow.addColorStop(0, "#2b2b2b");
      bgGlow.addColorStop(0.38, "#141414");
      bgGlow.addColorStop(0.75, "#080808");
      bgGlow.addColorStop(1, "#040404");
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, W, H);

      // 2. Subtle stardust film grain
      for (let i = 0; i < 420; i++) {
        const h1 = Math.sin(i * 127.1) * 43758.5453;
        const h2 = Math.sin(i * 311.7) * 43758.5453;
        const x = (h1 - Math.floor(h1)) * W;
        const y = (h2 - Math.floor(h2)) * H;
        const r = 0.5 + ((i * 17) % 10) * 0.12;
        ctx.fillStyle = "rgba(255,255,255," + (0.02 + ((i * 29) % 10) * 0.006) + ")";
        ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
      }

      // 3. Faint background concentric waves
      for (let r = 140; r <= 960; r += 85) {
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      }

      // 4. 3D Wireframe Sphere Envelope & Geodesic Grid (3D + 2D synthesis)
      const R = 395;
      const rx = 0.42, ry = -0.52;
      for (let i = 1; i < 8; i++) {
        const phi = (i / 8 - 0.5) * Math.PI;
        const rLat = Math.cos(phi), yLat = Math.sin(phi);
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
          const th = (j / 72) * TAU;
          const p = project3D(rLat * Math.cos(th), yLat, rLat * Math.sin(th), cx, cy, R, rx, ry);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = i === 4 ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.09)";
        ctx.lineWidth = i === 4 ? 1.8 : 1.1;
        ctx.stroke();
      }
      for (let i = 0; i < 10; i++) {
        const th = (i / 10) * Math.PI;
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
          const a = (j / 72) * TAU;
          const p = project3D(Math.cos(a) * Math.cos(th), Math.sin(a), Math.cos(a) * Math.sin(th), cx, cy, R, rx, ry);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // 5. 2D Archimedes Geometric Construction Lattice
      ctx.strokeStyle = "rgba(255,255,255,0.44)";
      ctx.lineWidth = 2.0;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.7071, 0, TAU); ctx.stroke();

      for (const rot of [0, Math.PI / 4]) {
        ctx.beginPath();
        for (let i = 0; i <= 4; i++) {
          const a = rot + (i * Math.PI) / 2 + Math.PI / 4;
          const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // Crosshair axes extending past circle
      ctx.strokeStyle = "rgba(255,255,255,0.28)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - R - 110, cy); ctx.lineTo(cx + R + 110, cy);
      ctx.moveTo(cx, cy - R - 75); ctx.lineTo(cx, cy + R + 75);
      ctx.stroke();

      // Glowing node on upper-left intersection (signature @median-lab detail)
      const nodeAng = -Math.PI * 0.75;
      const nx = cx + R * Math.cos(nodeAng), ny = cy + R * Math.sin(nodeAng);
      const ng = ctx.createRadialGradient(nx, ny, 2, nx, ny, 52);
      ng.addColorStop(0, "rgba(255,255,255,0.98)");
      ng.addColorStop(0.3, "rgba(255,255,255,0.32)");
      ng.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = ng;
      ctx.beginPath(); ctx.arc(nx, ny, 52, 0, TAU); ctx.fill();

      // Sine wave projection trailing to the right
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.26)";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i <= 120; i++) {
        const u = i / 120;
        const x = cx + R * 0.72 + u * 440;
        const y = cy - Math.sin(u * TAU * 1.5) * 145;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();

      // 6. Hero Luminous Serif Pi Symbol (tilted -5 deg, 3D inner shading + outer bloom)
      ctx.save();
      ctx.translate(cx + 12, cy + 28);
      ctx.rotate(-0.085);
      ctx.font = "italic 720px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(255, 255, 255, 0.58)";
      ctx.shadowBlur = 68;
      ctx.fillStyle = "rgba(255,255,255,0.38)";
      ctx.fillText("π", 0, 0);

      ctx.shadowBlur = 24;
      const piGrad = ctx.createLinearGradient(-180, -260, 210, 240);
      piGrad.addColorStop(0, "#ffffff");
      piGrad.addColorStop(0.35, "#dedede");
      piGrad.addColorStop(0.7, "#8e8e8e");
      piGrad.addColorStop(1, "#ffffff");
      ctx.fillStyle = piGrad;
      ctx.fillText("π", 0, 0);

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth = 3.5;
      ctx.strokeText("π", 0, 0);
      ctx.restore();

      // 7. Smooth Radial Vignette at Bottom-Left (Zero hard edges)
      const textVig = ctx.createRadialGradient(260, 960, 40, 260, 960, 720);
      textVig.addColorStop(0, "rgba(4,4,4,0.82)");
      textVig.addColorStop(0.55, "rgba(4,4,4,0.42)");
      textVig.addColorStop(1, "rgba(4,4,4,0)");
      ctx.fillStyle = textVig;
      ctx.fillRect(0, 0, W, H);

      // 8. Bottom-Left Two-Deck @median-lab Typography
      ctx.save();
      ctx.fillStyle = "#f2f2f2";
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,0.88)";
      ctx.shadowBlur = 18;

      ctx.font = "600 72px BeVietnamPro, sans-serif";
      ctx.fillText(line1, 68, 866);

      ctx.font = "800 116px BeVietnamPro, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(line2, 64, 994);
      ctx.restore();

      // 9. Top-Right "median" Wordmark (with signature stylized epsilon "∈")
      ctx.save();
      ctx.fillStyle = "#f2f2f2";
      ctx.font = "600 84px BeVietnamPro, sans-serif";
      ctx.textBaseline = "alphabetic";
      ctx.textAlign = "left";
      ctx.fillText("m", 1500, 108);
      ctx.strokeStyle = "#f2f2f2";
      ctx.lineWidth = 6.5;
      ctx.lineCap = "round";
      const ex = 1612, ey = 84, er = 21;
      ctx.beginPath();
      ctx.arc(ex, ey, er, 0.32 * Math.PI, 1.68 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex - er + 2, ey);
      ctx.lineTo(ex + er - 4, ey);
      ctx.stroke();
      ctx.fillText("dian", 1640, 108);
      ctx.restore();

      return canvas.toDataURL("image/png");
    };
    document.fonts.ready.then(() => { window.ready = true; });
  </script>
</body>
</html>`;

await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction("window.ready === true");

const enUrl = await page.evaluate(() => window.drawThumb("THE TRUE NATURE", "OF NUMBER PI"));
writeFileSync(join(outDir, "thumbnail-en.png"), Buffer.from(enUrl.split(",")[1], "base64"));

const viUrl = await page.evaluate(() => window.drawThumb("BẢN CHẤT THẬT", "CỦA SỐ PI"));
writeFileSync(join(outDir, "thumbnail-vi.png"), Buffer.from(viUrl.split(",")[1], "base64"));

await browser.close();
console.log("Saved thumbnail-en.png and thumbnail-vi.png to", outDir);
process.exit(0);
