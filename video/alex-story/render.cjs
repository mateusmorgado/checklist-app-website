// Renders index.html to alex-story.mp4 frame by frame, then adds the English and German
// soundtracks (mix-en.m4a, mix-de.m4a) and soft subtitles (subs-en.srt, subs-de.srt), then the 720p
// one-language copies the site plays (video/alex-story-en.mp4, -de.mp4) with their captions.
// Needs Node, Playwright (or playwright-core with a Chromium) and ffmpeg. From the repo root:
//   python3 -m http.server 8000 &   then   node video/alex-story/render.cjs
const { chromium } = require(process.env.PW || 'playwright');
const { spawn, execFileSync } = require('child_process');
const path = require('path');
const FPS = 30, DIR = __dirname, TMP = path.join(DIR, 'frames.mp4'), OUT = path.join(DIR, 'alex-story.mp4');
const URL = (process.env.SITE || 'http://localhost:8000') + '/video/alex-story/index.html?render&look=3d';

(async () => {
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const LEN = await page.evaluate(() => window.LEN);
  const n = Math.round(LEN * FPS);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', TMP], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.seek(t), i / FPS);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 60 === 0) process.stdout.write(`frame ${i}/${n}\n`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await browser.close();
  const f = x => path.join(DIR, x);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', TMP, '-i', f('mix-en.m4a'), '-i', f('mix-de.m4a'), '-i', f('subs-en.srt'), '-i', f('subs-de.srt'),
    '-map', '0:v', '-map', '1:a', '-map', '2:a', '-map', '3', '-map', '4', '-c:v', 'copy', '-c:a', 'copy', '-c:s', 'mov_text',
    '-metadata:s:a:0', 'language=eng', '-metadata:s:a:0', 'title=English', '-metadata:s:a:1', 'language=ger', '-metadata:s:a:1', 'title=Deutsch',
    '-metadata:s:s:0', 'language=eng', '-metadata:s:s:0', 'title=English', '-metadata:s:s:1', 'language=ger', '-metadata:s:s:1', 'title=Deutsch',
    '-disposition:a:0', 'default', '-disposition:a:1', '0', '-disposition:s:0', '0', '-disposition:s:1', '0',
    '-t', String(LEN), '-movflags', '+faststart', OUT], { stdio: 'inherit' });
  console.log('wrote', OUT);
  ['en', 'de'].forEach((l, i) => {
    const web = path.join(DIR, '..', 'alex-story-' + l + '.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', OUT, '-map', '0:v', '-map', '0:a:' + i, '-vf', 'scale=1280:720', '-c:v', 'libx264', '-crf', '22', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', web], { stdio: 'inherit' });
    require('fs').copyFileSync(f('subs-' + l + '.vtt'), path.join(DIR, '..', 'alex-story-' + l + '.vtt'));
    console.log('wrote', web);
  });
})();
