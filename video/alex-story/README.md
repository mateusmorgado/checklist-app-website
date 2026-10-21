# Alex story

The animated ad under the hero: Alex forgets everything until the co-pilot hands him Checklist Pro. 35 s, English and German.

- `index.html` + `story.js` draw every frame from the time alone (`window.seek(t)`); open it in a browser to play it live with the EN/DE soundtrack.
- `look3d.js` adds the 3D-ish look the site uses (stronger colours, soft lighting on every shape, drop shadows, paper texture); it switches on with `?look=3d`.
- `data.js` holds the voice loudness per line, which drives the mouths.
- `mix.py` synthesises the music and sound effects and mixes them with the ElevenLabs voice clips: `python3 mix.py <clips dir> .` writes `mix-en.wav` / `mix-de.wav` (encode to `.m4a` with ffmpeg).
- `subs.py` writes the English and German captions.
- `render.cjs` renders 1080p frames, adds both soundtracks and subtitles, and writes the 720p copies the site plays (`video/alex-story-en.mp4`, `video/alex-story-de.mp4`).
