# ChecklistPro: the promo site

A bold, animated one-page site for the [ChecklistPro app](https://github.com/mateusmorgado/checklist-app), in the app's own **Modern, Bold red** design.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
python3 -m http.server 8000   # then open http://localhost:8000
```

## What is on the page

1. **Hero**: "This is not a To-Do app. This is not a habits app. This is a checklist prompt app." Each line slams in, the first two get struck through, the last one lands with confetti. (`Replay` runs it again.)
2. **Video**: a 720p window for the ad. Drop the file at `video/ad-720p.mp4` (1280 x 720). Until it exists, a placeholder is shown.
3. **What will you check?**: ten ideas as cards that tick themselves.
4. **See how it flows**: an iPhone mockup that plays four real flows (run, ask, say it, build it) from screenshots of the real app, with a tap indicator.
5. **Make it yours**: the eight looks of the app (Minimalist, three cockpit styles, four Modern colours).
6. **Try the real thing**: the live app in a phone, loaded on tap. Set the address in `js/config.js` (`APP_URL`).
7. **From cockpits to your pocket**: why checklists matter.
8. **How it was made**: the button in the top bar opens a *work tree* of the whole conversation: ideas, decisions, features, bugs, parked branches and what shipped. Filter it by type. Link straight to it with `#journey`.

## Files

- `index.html`, `css/site.css`
- `js/site.js`: animations and interactions
- `js/journey.js`: the work tree (edit the `ROWS` list to add or change entries)
- `js/frames.js`, `img/frames/*.webp`: screenshots of the app and where the finger taps
- `js/config.js`: the app's address

## Deploy

Import this repository in Vercel as a new project (Framework: Other, no build command). Nothing else to set.

## Notes

- Animations stop under the system's reduced-motion setting.
- The app can be embedded in a chosen look with `?design=modern&palette=red&mode=light`.
