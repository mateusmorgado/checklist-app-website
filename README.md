# ChecklistPro: the promo site

A bold, animated one-page site for the [ChecklistPro app](https://github.com/mateusmorgado/checklist-app), in the app's own **Modern, Bold red** design.

Plain HTML, CSS and JavaScript. No build step, no dependencies.

```
python3 -m http.server 8000   # then open http://localhost:8000
```

## What is on the page

Live at **https://checklist.morgado.tech**; the app itself is at https://app.checklist.morgado.tech.

1. **Hero**: "This is not a To-Do app. This is not a habits app. This is a checklist prompt app." Each line slams in, the first two get struck through, the last one lands with confetti. A pointer then picks a colour set for the page. The phone swipes through the app's eight looks. (`Replay` runs it again.)
2. **The story**: an animated ad with Alex and the co-pilot (`video/alex-story-en.mp4` / `-de.mp4`, captions in `.vtt`). A silent teaser loops until someone presses *Play with sound*; flag tabs in the window bar switch the language. Sources and render steps are in `video/alex-story/`.
3. **Not just a list**: four Pro powers (attention tone, research, AI quick list, stored on the device), each played in a phone and read back by the co-pilot. Tap a tone to hear it; the study chips open a book or paper card.
4. **Lists that ask first**: two simple lists tick themselves, then a Gym bag shows conditionals: a cursor answers Yes to "Sauna?" and "Squat day?", and towel, flip-flops and squat shoes join the list. Afterwards you can flip each answer yourself.
5. **Why a checklist** and **Inspiration**: the Forte quote and The Checklist Manifesto.
6. **The film**: the real-life ad (`video/ad-720p.mp4` / `ad-720p-de.mp4`) behind a silent teaser that only loads when it scrolls into view. Addresses can be changed in `js/config.js` (`TEASER_SRC`, `VIDEO_SRC`).
7. **Make it yours**: spin the drum to see the eight looks of the app (Minimalist, three cockpit styles, four Modern colours). The phone links to the live app.
8. **Put it on your device**: install steps for iPhone, Android, Windows and Mac.
9. **Land the plane**: a small 3D landing game (`game/`), loaded only when someone presses Play.
10. **How it was made**: the button in the top bar opens a *work tree* of the whole conversation: ideas, decisions, features, bugs, parked branches and what shipped, for the app and for this website (with a stop-motion of the site, one screenshot per commit, in `img/evo/`). Filter it by type. Link straight to it with `#journey`.

## Files

- `index.html`, `css/site.css`
- `js/site.js`: animations and interactions
- `js/journey.js`: the work tree (edit the `ROWS` list to add or change entries)
- `js/evo.js`, `img/evo/*.webp`: the website's stop-motion in the work tree
- `js/frames.js`, `img/frames/*.webp`: screenshots of the app's looks
- `js/i18n.js`, `js/i18n-data.js`: the German version
- `js/config.js`: the app's address and the video files
- `api/report.js`: the Report a bug form
- `game/`: the landing game
- `video/`: the videos, captions and the story's sources

## Report a bug

The footer has a **Report a bug** button that opens a small contact form (bug, idea or other, a message and an optional email). It posts to `api/report.js`, a Vercel function that emails the report to you with [Resend](https://resend.com). In Vercel, add these environment variables to this project:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | your Resend API key |
| `REPORT_TO` | the email address that should receive reports |
| `REPORT_FROM` | optional. Default `ChecklistPro <onboarding@resend.dev>`, which Resend only delivers to the email you registered with. Use a verified domain to send to any address. |

Limits: 5 reports per IP per day, a hidden spam trap field, 2000 characters. Without the variables the form says it is not connected yet.

## Deploy

Import this repository in Vercel as a new project (Framework: Other, no build command). Nothing else to set.

## Notes

- Animations stop under the system's reduced-motion setting.
- The app can be embedded in a chosen look with `?design=modern&palette=red&mode=light`.

## Language and colours

- The **DE / EN** button in the nav switches the page to German. English text in the HTML is the key; `js/i18n-data.js` holds the German strings, `js/i18n.js` swaps them in the browser (also for text the page writes itself). Add a line to `i18n-data.js` when you add English text. German is picked on first visit when the browser language is German. User quotes in the work tree stay in English.
- The four dots at the bottom switch the page colours (red, blue, mint, cream). The phones keep showing the Bold red look. `?palette=blue&lang=de` also works.
- The hero phone swipes through all eight looks by itself; drag it to swipe by hand.
