// render.mjs: Drive studio-svg.html (or studio.html) in headless Chrome for contact sheets, stills, clips, and parallel MP4 rendering.
//   node render.mjs --sheet=0.5,1.2,2.0,2.8,3.5,4.2 [--cols=3] [--w=640] --out=out/check.jpg
//   node render.mjs --stills=0.8,2.5,4.0 --out=out/stills
//   node render.mjs --clip=0:6 --fps=24 --out=out/clip.mp4
//   node render.mjs --frames=0:60 --workers=4 --fps=24
//   node render.mjs --encode --fps=24 [--audio=assets/song.mp3] --out=out/video.mp4

import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const idx = a.indexOf('=');
  if (idx === -1) return [a.replace(/^--/, ''), true];
  return [a.slice(0, idx).replace(/^--/, ''), a.slice(idx + 1)];
}));

const CHROME = args.chrome || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const HTML_FILE = args.html || (existsSync('studio-svg.html') ? 'studio-svg.html' : 'studio.html');
const DUR = +(args.dur || 60);
const fps = +(args.fps || 24);
const FRAMES_DIR = args.framesDir || 'out/frames';
const AUDIO_FILE = args.audio || (existsSync('assets/song.mp3') ? 'assets/song.mp3' : null);

const run = (cmd, a) => new Promise((ok, bad) => {
  const p = spawn(cmd, a, { stdio: 'inherit' });
  p.on('close', c => c ? bad(new Error(`${cmd} exited ${c}`)) : ok());
});

if (args.encode) {
  const out = args.out || 'out/video.mp4';
  mkdirSync(dirname(out), { recursive: true });
  const n = readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length;
  console.log(`Encoding ${n} frames → ${out}`);
  const ffArgs = ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`];
  if (AUDIO_FILE && existsSync(AUDIO_FILE)) {
    ffArgs.push('-i', AUDIO_FILE, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest');
  }
  ffArgs.push('-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
  await run('ffmpeg', ffArgs);
  console.log('Wrote ' + out);
  process.exit(0);
}

const launchBrowser = () => puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  protocolTimeout: 0,
  args: [
    '--allow-file-access-from-files',
    '--force_high_performance_gpu',
    '--ignore-gpu-blocklist',
    '--use-angle=d3d11',
    '--enable-gpu-rasterization',
    '--window-size=1920,1080',
    '--disable-renderer-backgrounding',
    '--disable-background-timer-throttling'
  ]
});

const browsers = [];
async function openPage(tag = '') {
  const b = await launchBrowser();
  browsers.push(b);
  const page = await b.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve(HTML_FILE)).href + '?render', { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction('window.ready === true', { timeout: 120000 });
  return page;
}

const frameOf = async (page, t, type, q) => {
  const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};
const times = s => String(s).split(',').map(Number);

if (args.sheet) {
  const page = await openPage(), out = args.out || 'out/sheet.jpg';
  mkdirSync(dirname(out), { recursive: true });
  const { url, ms } = await page.evaluate((ts, c, w) => window.renderSheet(ts, c, w), times(args.sheet), +(args.cols || 3), +(args.w || 640));
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'out/stills';
  mkdirSync(out, { recursive: true });
  for (const s of times(args.stills)) {
    const t0 = Date.now(), buf = await frameOf(page, s, 'image/png');
    const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`;
    writeFileSync(f, buf);
    console.log(`${f}  ${Date.now() - t0} ms`);
  }
} else if (args.frames) {
  const [a, b] = String(args.frames).split(':').map(Number), workers = +(args.workers || 4);
  mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.round(b * fps) - 1;
  const todo = [];
  for (let i = first; i <= last; i++) {
    const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
    if (!existsSync(f) || statSync(f).size < 1000) todo.push(i);
  }
  console.log(`${todo.length} frames to render (${last - first + 1 - todo.length} already done), ${workers} workers`);
  let next = 0, done = 0;
  const start = Date.now();
  await Promise.all(Array.from({ length: workers }, async (_, w) => {
    const page = await openPage('#' + w);
    while (next < todo.length) {
      const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`;
      const buf = await frameOf(page, i / fps, 'image/jpeg', 0.94);
      writeFileSync(f + '.tmp', buf);
      renameSync(f + '.tmp', f);
      if (++done % 24 === 0 || done === todo.length) {
        const el = (Date.now() - start) / 1000;
        console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective`);
      }
    }
  }));
} else {
  const page = await openPage();
  const [a, b] = args.clip ? String(args.clip).split(':').map(Number) : [0, DUR];
  const out = args.out || 'out/clip.mp4';
  mkdirSync(dirname(out), { recursive: true });
  const ffArgs = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-'];
  if (AUDIO_FILE && existsSync(AUDIO_FILE)) {
    ffArgs.push('-ss', String(a), '-t', String(b - a), '-i', AUDIO_FILE, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest');
  }
  ffArgs.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out);
  const ff = spawn('ffmpeg', ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((b - a) * fps), start = Date.now();
  for (let i = 0; i < n; i++) {
    const buf = await frameOf(page, a + i / fps, 'image/jpeg', 0.92);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 24 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`);
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  console.log(`Wrote ${out}`);
}
await Promise.all(browsers.map(b => b.close()));
