# Alex story

The animated ad under the hero: Alex forgets everything until the co-pilot hands him Checklist Pro. 35 s, English and German.

This is the original 2D version. The site now plays the 3D rebuild in `../alex-story-3d/`, which reuses the soundtracks, captions and `data.js` from this folder.

- `index.html` + `story.js` draw every frame from the time alone (`window.seek(t)`); open it in a browser to play it live with the EN/DE soundtrack.
- `look3d.js` adds the 3D-ish look the site uses (stronger colours, soft lighting on every shape, drop shadows, paper texture); it switches on with `?look=3d`.
- `data.js` holds the voice loudness per line, which drives the mouths.
- `mix.py` synthesises the music and sound effects and mixes them with the ElevenLabs voice clips: `python3 mix.py <clips dir> .` writes `mix-en.wav` / `mix-de.wav` (encode to `.m4a` with ffmpeg).
- `subs.py` writes the English and German captions.
- `render.cjs` renders 1080p frames, adds both soundtracks and subtitles, and writes 720p copies to `video/alex-story-en.mp4` and `video/alex-story-de.mp4`. Running it would put the 2D version back on the site, so use `../alex-story-3d/render.cjs` for the site files.
