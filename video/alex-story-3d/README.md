# Alex story, 3D version

The film the site plays under the hero. It is the same 35 s story as `../alex-story/` (same script, timing, voices, music and gags), rebuilt as real 3D with three.js: vinyl-toy characters, fabric and plaster textures, soft shadows and depth of field.

- `index.html` + `film.js` draw every frame from the time alone (`window.seek(t)`); open the page in a browser to play it live with the EN soundtrack, or add `?lang=de` for German. `?fast` skips anti-aliasing and depth of field for quick previews.
- `lib.js` holds the palette, materials, procedural textures and shape helpers. `actors.js` builds Alex, the co-pilot and the background people. `sets.js` builds the twelve sets. `fx.js` has the thought bubbles, stars, confetti and the BOOM.
- three.js 0.170 comes from the jsDelivr CDN through the import map in `index.html`.
- The soundtracks, captions and mouth data are shared with the 2D version and stay in `../alex-story/` (`mix-en.m4a`, `mix-de.m4a`, `subs-*.srt`, `data.js`).
- `render.cjs` renders the 1080p frames in headless Chromium and writes what the site uses: `video/alex-story-en.mp4`, `video/alex-story-de.mp4`, the silent loop `video/alex-teaser.mp4` and the still `img/alex-poster.webp`. A full render takes about 45 minutes on four CPU cores and can be resumed.

      python3 -m http.server 8000        # from the repo root
      node video/alex-story-3d/render.cjs
