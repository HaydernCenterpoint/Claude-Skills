// generate-mathmethic-thumbnails.mjs: Render two 1920x1080 (<2MB JPG & PNG) YouTube Thumbnails for A/B Testing
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(resolve(__dirname, "../../PDoomVideo/package.json"));
const puppeteer = require("puppeteer-core");

const outDir = resolve(process.argv[2] || "Pi/assets/videos/pi-mathmethic/renders");
mkdirSync(outDir, { recursive: true });

const fontBoldUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-mathmethic/assets/fonts/BeVietnamPro-Bold.ttf")).href;
const fontExtraBoldUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-mathmethic/assets/fonts/BeVietnamPro-ExtraBold.ttf")).href;
const fontMonoBoldUrl = pathToFileURL(resolve(__dirname, "../../Pi/assets/videos/pi-mathmethic/assets/fonts/JetBrainsMono-Bold.ttf")).href;

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
    @font-face { font-family: "BeVietnamPro"; src: url("${fontBoldUrl}") format("truetype"); font-weight: 700; }
    @font-face { font-family: "BeVietnamPro"; src: url("${fontExtraBoldUrl}") format("truetype"); font-weight: 800; }
    @font-face { font-family: "JetBrainsMono"; src: url("${fontMonoBoldUrl}") format("truetype"); font-weight: 700; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { width: 1920px; height: 1080px; overflow: hidden; background: #060913; }
    canvas { display: block; width: 1920px; height: 1080px; }
  </style>
</head>
<body>
  <canvas id="c" width="1920" height="1080"></canvas>
  <script>
    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    const W = 1920, H = 1080, TAU = Math.PI * 2;
    const COL = { cyan: "#38bdf8", coral: "#fb7185", gold: "#facc15", emerald: "#34d399", violet: "#a78bfa", chalk: "#f8fafc" };

    function project3D(x, y, z, cx, cy, scale, rx, ry, fov = 750) {
      let y1 = y * Math.cos(rx) - z * Math.sin(rx);
      let z1 = y * Math.sin(rx) + z * Math.cos(rx);
      let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      const p = fov / (fov + z2);
      return { x: cx + x2 * scale * p, y: cy + y1 * scale * p, z: z2 };
    }

    function drawBrandTopRight() {
      ctx.save();
      ctx.font = "800 58px BeVietnamPro, sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "alphabetic";
      const g = ctx.createLinearGradient(1480, 50, 1850, 95);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(1, "#facc15");
      ctx.fillStyle = g;
      ctx.shadowColor = "rgba(250, 204, 21, 0.35)";
      ctx.shadowBlur = 18;
      ctx.fillText("Mathmethic", 1852, 96);
      ctx.restore();
    }

    window.drawThumbA = (mime = "image/jpeg") => {
      ctx.clearRect(0, 0, W, H);
      const cx = 1060, cy = 455;
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0b1224");
      bg.addColorStop(1, "#04060d");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      const g1 = ctx.createRadialGradient(cx - 120, cy, 20, cx - 120, cy, 780);
      g1.addColorStop(0, "rgba(56, 189, 248, 0.28)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

      const g2 = ctx.createRadialGradient(cx + 120, cy, 20, cx + 120, cy, 760);
      g2.addColorStop(0, "rgba(250, 204, 21, 0.25)");
      g2.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);

      for (let i = 0; i < 360; i++) {
        const h1 = Math.sin(i * 127.1) * 43758.5453;
        const h2 = Math.sin(i * 311.7) * 43758.5453;
        ctx.fillStyle = i % 4 === 0 ? "rgba(56,189,248,0.22)" : "rgba(255,255,255,0.08)";
        ctx.beginPath();
        ctx.arc((h1 - Math.floor(h1)) * W, (h2 - Math.floor(h2)) * H, 1.1, 0, TAU);
        ctx.fill();
      }

      const R = 395, rx = 0.42, ry = -0.52;
      for (let i = 1; i < 8; i++) {
        const phi = (i / 8 - 0.5) * Math.PI;
        const rLat = Math.cos(phi), yLat = Math.sin(phi);
        ctx.beginPath();
        for (let j = 0; j <= 72; j++) {
          const th = (j / 72) * TAU;
          const p = project3D(rLat * Math.cos(th), yLat, rLat * Math.sin(th), cx, cy, R, rx, ry);
          if (j === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = i === 4 ? "rgba(250, 204, 21, 0.65)" : "rgba(56, 189, 248, 0.22)";
        ctx.lineWidth = i === 4 ? 2.8 : 1.4;
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
        ctx.strokeStyle = i === 0 ? "rgba(251, 113, 133, 0.45)" : "rgba(56, 189, 248, 0.16)";
        ctx.lineWidth = i === 0 ? 2.2 : 1.1;
        ctx.stroke();
      }

      ctx.strokeStyle = COL.gold; ctx.lineWidth = 3.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();

      for (const [n, col, lw] of [[6, COL.cyan, 2.6], [8, COL.coral, 2.2]]) {
        ctx.strokeStyle = col; ctx.lineWidth = lw;
        ctx.beginPath();
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * TAU - Math.PI / 2;
          const x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      for (const [col, phOff, amp] of [[COL.cyan, 0, 150], [COL.coral, Math.PI / 2, 120]]) {
        ctx.strokeStyle = col; ctx.lineWidth = 3.2;
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const u = i / 120;
          const x = cx + R * 0.68 + u * 480;
          const y = cy - Math.sin(u * TAU * 1.5 + phOff) * amp;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      const nodeAng = -Math.PI * 0.75;
      const nx = cx + R * Math.cos(nodeAng), ny = cy + R * Math.sin(nodeAng);
      const ng = ctx.createRadialGradient(nx, ny, 2, nx, ny, 56);
      ng.addColorStop(0, "#ffffff");
      ng.addColorStop(0.35, "rgba(250, 204, 21, 0.65)");
      ng.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(nx, ny, 56, 0, TAU); ctx.fill();

      ctx.save();
      ctx.translate(cx + 12, cy + 28);
      ctx.rotate(-0.085);
      ctx.font = "italic 710px Georgia, serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(250, 204, 21, 0.65)";
      ctx.shadowBlur = 70;
      const piGrad = ctx.createLinearGradient(-180, -260, 210, 240);
      piGrad.addColorStop(0, "#ffffff");
      piGrad.addColorStop(0.45, "#fef08a");
      piGrad.addColorStop(0.85, "#facc15");
      piGrad.addColorStop(1, "#ffffff");
      ctx.fillStyle = piGrad;
      ctx.fillText("π", 0, 0);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3.5;
      ctx.strokeText("π", 0, 0);
      ctx.restore();

      const textVig = ctx.createRadialGradient(280, 960, 40, 280, 960, 740);
      textVig.addColorStop(0, "rgba(4, 6, 14, 0.88)");
      textVig.addColorStop(0.55, "rgba(4, 6, 14, 0.48)");
      textVig.addColorStop(1, "rgba(4, 6, 14, 0)");
      ctx.fillStyle = textVig; ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 18;
      ctx.font = "700 70px BeVietnamPro, sans-serif";
      ctx.fillStyle = COL.cyan;
      ctx.fillText("THE TRUE NATURE", 68, 864);
      ctx.font = "800 118px BeVietnamPro, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("OF NUMBER PI", 64, 994);
      ctx.restore();

      drawBrandTopRight();
      return canvas.toDataURL(mime, 0.94);
    };

    window.drawThumbB = (mime = "image/jpeg") => {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, "#0b1224");
      bg.addColorStop(1, "#04060d");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      const g1 = ctx.createRadialGradient(960, 420, 20, 960, 420, 860);
      g1.addColorStop(0, "rgba(56, 189, 248, 0.22)");
      g1.addColorStop(0.5, "rgba(250, 204, 21, 0.14)");
      g1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);

      const x0 = 240, D = 370, C_len = D * Math.PI;
      const wheelX = x0 + C_len, wheelY = 290, R = 148;

      ctx.save();
      ctx.strokeStyle = COL.cyan; ctx.lineWidth = 8;
      ctx.shadowColor = COL.cyan; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.arc(wheelX, wheelY, R, 0, TAU); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = COL.coral; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(wheelX - R, wheelY); ctx.lineTo(wheelX + R, wheelY); ctx.stroke();

      const trackY = wheelY + R + 24;
      ctx.strokeStyle = COL.cyan; ctx.lineWidth = 9;
      ctx.shadowColor = COL.cyan; ctx.shadowBlur = 20;
      ctx.beginPath(); ctx.moveTo(x0, trackY); ctx.lineTo(x0 + C_len, trackY); ctx.stroke();
      ctx.shadowBlur = 0;

      const barY = trackY + 34;
      for (let b = 0; b < 3; b++) {
        ctx.fillStyle = COL.coral;
        ctx.beginPath(); ctx.roundRect(x0 + b * D + 4, barY, D - 8, 64, 10); ctx.fill();
        ctx.fillStyle = "#060913";
        ctx.font = "800 34px JetBrainsMono, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText((b + 1) + "d", x0 + b * D + D / 2, barY + 32);
      }
      const sx = x0 + 3 * D, sw = C_len - 3 * D;
      ctx.fillStyle = COL.gold;
      ctx.shadowColor = COL.gold; ctx.shadowBlur = 32;
      ctx.beginPath(); ctx.roundRect(sx + 2, barY - 8, sw + 8, 80, 8); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = COL.gold;
      ctx.font = "700 44px JetBrainsMono, monospace";
      ctx.fillText("+ 0.14159...", sx + 85, barY + 132);
      ctx.restore();

      ctx.save();
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.shadowColor = "rgba(0,0,0,0.9)"; ctx.shadowBlur = 18;
      ctx.font = "700 68px BeVietnamPro, sans-serif";
      ctx.fillStyle = COL.gold;
      ctx.fillText("WHY IS PI = 3.14159...?", 68, 864);
      ctx.font = "800 114px BeVietnamPro, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText("THE HIDDEN CODE", 64, 994);
      ctx.restore();

      drawBrandTopRight();
      return canvas.toDataURL(mime, 0.94);
    };

    document.fonts.ready.then(() => { window.ready = true; });
  </script>
</body>
</html>`;

await page.setContent(html, { waitUntil: "load" });
await page.waitForFunction("window.ready === true");

const jpgA = await page.evaluate(() => window.drawThumbA("image/jpeg"));
writeFileSync(join(outDir, "pi-mathmethic-thumbnail-A.jpg"), Buffer.from(jpgA.split(",")[1], "base64"));

const jpgB = await page.evaluate(() => window.drawThumbB("image/jpeg"));
writeFileSync(join(outDir, "pi-mathmethic-thumbnail-B.jpg"), Buffer.from(jpgB.split(",")[1], "base64"));

await browser.close();
console.log("Generated pi-mathmethic-thumbnail-A.jpg & pi-mathmethic-thumbnail-B.jpg in", outDir);
process.exit(0);
