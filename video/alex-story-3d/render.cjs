// Renders the 3D film frame by frame, then writes everything the site uses.
// Needs Node, Playwright (Chromium) and ffmpeg. Serve the repo root (python3 -m http.server 8000), then:
//   node render.cjs      (env: URL = page address, WORKERS = parallel browsers, OUT = work folder, W = render width)
// Frames are kept in OUT/frames, so an interrupted run picks up where it stopped.
const { chromium } = require(process.env.PW || 'playwright');
const { execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
const FPS = 30, LEN = 35, DIR = __dirname, OUT = process.env.OUT || path.join(DIR, 'out'), FR = path.join(OUT, 'frames'), W = +(process.env.W || 1920), N = +(process.env.WORKERS || 3);
const URL = (process.env.URL || 'http://localhost:8000/video/alex-story-3d/index.html') + `?render&w=${W}`;
const name = i => path.join(FR, `f${String(i).padStart(5, '0')}.jpg`);
const ff = a => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a], { stdio: 'inherit' });
(async () => {
  fs.mkdirSync(FR, { recursive: true }); const n = LEN * FPS, t0 = Date.now(); let done = 0;
  const todo = []; for (let i = 0; i < n; i++) if (!fs.existsSync(name(i))) todo.push(i);
  const per = Math.ceil(todo.length / N);
  await Promise.all(Array.from({ length: N }, async (_, k) => {
    const mine = todo.slice(k * per, (k + 1) * per); if (!mine.length) return;
    // SwiftShader keeps the picture identical on machines without a GPU
    const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } }); page.on('pageerror', e => console.log('page error', e.message));
    await page.goto(URL); await page.waitForFunction(() => window.ready, null, { timeout: 600000 });
    for (const i of mine) { const u = await page.evaluate(t => window.grab(t, .97), i / FPS); fs.writeFileSync(name(i), Buffer.from(u.split(',')[1], 'base64')); if (++done % 30 === 0) console.log(`${done}/${todo.length} frames, ${Math.round((Date.now() - t0) / 1000)} s`); }
    await browser.close();
  }));
  const old = x => path.join(DIR, '..', 'alex-story', x), site = x => path.join(DIR, '..', x), master = path.join(OUT, 'frames.mp4');
  // 1080p master without sound
  ff(['-framerate', String(FPS), '-i', path.join(FR, 'f%05d.jpg'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', master]);
  // 1080p with both soundtracks and soft subtitles, for sharing
  ff(['-i', master, '-i', old('mix-en.m4a'), '-i', old('mix-de.m4a'), '-i', old('subs-en.srt'), '-i', old('subs-de.srt'),
    '-map', '0:v', '-map', '1:a', '-map', '2:a', '-map', '3', '-map', '4', '-c:v', 'copy', '-c:a', 'copy', '-c:s', 'mov_text',
    '-metadata:s:a:0', 'language=eng', '-metadata:s:a:0', 'title=English', '-metadata:s:a:1', 'language=ger', '-metadata:s:a:1', 'title=Deutsch',
    '-metadata:s:s:0', 'language=eng', '-metadata:s:s:1', 'language=ger', '-disposition:a:0', 'default', '-disposition:a:1', '0',
    '-t', String(LEN), '-movflags', '+faststart', path.join(OUT, 'alex-story-dual-audio.mp4')]);
  // the 720p copies the site plays, one per language
  for (const l of ['en', 'de']) ff(['-i', master, '-i', old(`mix-${l}.m4a`), '-map', '0:v', '-map', '1:a', '-vf', 'scale=1280:720:flags=lanczos',
    '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-t', String(LEN), '-movflags', '+faststart', site(`alex-story-${l}.mp4`)]);
  // the silent loop that plays before someone presses play: airport, bomb to bed, door, gym, beach, all ticked
  const cuts = [[11.8, 12.7], [14.9, 18.5], [26.7, 29.7], [31.9, 32.9]].map(([a, b]) => `between(n,${Math.round(a * FPS)},${Math.round(b * FPS) - 1})`).join('+');
  ff(['-i', master, '-vf', `select='${cuts}',setpts=N/${FPS}/TB,scale=1280:720:flags=lanczos`, '-an', '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', site('alex-teaser.mp4')]);
  // the still shown before the film loads
  ff(['-i', name(2 * FPS), '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libwebp', '-quality', '70', path.join(DIR, '..', '..', 'img', 'alex-poster.webp')]);
  console.log('wrote the site videos, teaser and poster; the 1080p files are in', OUT);
})();
