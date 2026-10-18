// The work tree: how ChecklistPro was made. Rows run in time order. lane 0 is the trunk (what shipped); other lanes are branches.
// A branch ends in a merge (the idea came back), an X (dropped or parked) or a dashed line (still open).
(function () {
  const TYPES = {
    idea: ['Idea', '#ffe14d'], decision: ['Decision', '#ffc2c2'], feature: ['Built', '#6df5b9'],
    bug: ['Caught', '#ffb347'], parked: ['Parked', '#e4e4e4'], ship: ['Shipped', '#6db7ff'],
  };
  const BRANCHES = {
    rn: { lane: 3, end: 'dead' }, ai: { lane: 1, end: 'merge' }, num: { lane: 2, end: 'open' }, sound: { lane: 3, end: 'merge' },
    timer: { lane: 3, end: 'dead' }, wstats: { lane: 2, end: 'dead' }, wvideo: { lane: 1, end: 'merge' }, wflows: { lane: 3, end: 'dead' }, agents: { lane: 3, end: 'dead' }, apk: { lane: 3, end: 'merge' }, future: { lane: 1, end: 'open' },
  };
  const R = (type, title, text, says, branch) => ({ type, title, text, says, branch });
  const ROWS = [
    R('idea', 'The spark', 'A checklist prompt app. Not a to-do list, not a habit tracker: lists you define ahead and run on demand, the way a pilot does.', 'It is a checklist prompt app. This is not a todo app, not a habits tracking app.'),
    R('idea', 'Start in React Native', 'First attempt: a React Native app with a browser preview.', null, 'rn'),
    R('bug', 'The preview showed no text', 'The first bundle rendered a blank screen.', 'The text does not appear.', 'rn'),
    R('decision', 'Back to plain React', 'One HTML file, React from a CDN, no build step. Faster to see, easier to change, and the whole app stays readable.', 'Actually. Just do normal react. This is insane.'),
    R('feature', 'Made for one thumb', 'Full screen, no page scroll, items grow upward from the bottom and the ticks sit on the right, all within reach of the right thumb.', 'Everything so it is close to the right finger.'),
    R('feature', 'The keyboard opens by itself', 'Creating a list focuses the name field so the phone keyboard is already up.', 'I want the text box to be automatically selected so the keyboard of the phone is prompted.'),
    R('decision', 'Ticked items stay put', 'First a ticked item jumped to the top after a second. Then the order changed under the finger, so it was reversed: nothing moves unless you move it.', 'Do not move items to the top when completing an action.'),
    R('feature', 'Hold and drag to reorder', 'Press and hold an item, then drag it to a new place.', 'Can you select and hold to change the order? If not, find an approach.'),
    R('bug', 'Drag stalled after one swap', 'A neighbouring row ended the drag. Fixed with a stable DOM order and CSS order for the visible position.', null),
    R('feature', 'Create, step by step', 'Name first, items on the next page, details per item, and Cancel and Save on the right.', 'Make it step by step in the creation. First enter the name, after points in the next page.'),
    R('idea', 'A day of research', 'Studies on checklists, and ideas on what a prompt app could add: if-then rules that change quantities and add items in order.', 'Suggest improvements to me. I am thinking about if and so statements that can change quantities.'),
    R('feature', 'Questions that change the list', 'A yes/no question before a run: “If I go to the sauna, add a towel.”', 'A question if I go to the sauna, yes or no, would ask for a towel.'),
    R('feature', 'Numbers and formulas', '“How many nights” with quantities like nights + 1: five nights, so six pairs of socks.', null, 'num'),
    R('decision', 'Yes or no, for now', 'Number questions were taken out of the editor until the quantity flow is properly designed. Saved ones still run.', 'In questions, remove the number function because it does not make sense yet.'),
    R('parked', 'Quantities, parked', 'If I stay five days, seven socks should enter. Still being thought through.', 'I still need to think on how the quantity workflow will look like.', 'num'),
    R('feature', 'Confirmation cue and Attention tone', 'Say each item out loud, or play a short tone, with the research behind both on a References page in citation style.', 'Call it Confirmation cue. Sound call it Attention Tone. Search for the research.'),
    R('decision', 'Does this already exist?', 'A market search, then a deeper one. The idea was different enough to keep going.', 'Is this app already existing somewhere on the internet?'),
    R('feature', 'Three designs', 'A Settings switch: Classic, Airplane (cockpit) and Modern (the latest web trend), with UX and accessibility research behind each.', 'I want in settings a toggle to change the app between three designs.'),
    R('idea', 'An AI quick list', 'Describe a checklist and have it written for you.', 'A quicklist option, connected to an AI api, so someone just creates one very quick.', 'ai'),
    R('idea', 'Urgency sounds', 'A heart monitor, cabin noise, sonar. Not comfort: a little pressure that helps you finish.', 'The idea is not comfort. It is the uncomfort, and this will bring people to finish the task.', 'sound'),
    R('parked', 'Parked, to save effort', 'The AI list waits: “much later”. The sounds were drafted and paused.', 'If you are stuck on something that is not going anywhere, maybe postpone for another day.', 'ai'),
    R('ship', 'A preview in the cloud', 'The app runs in a private preview, so ideas can be seen on a phone as they land.', 'Can you preview here, or do I need to do it myself?'),
    R('feature', 'A font for each design, and a logo', 'Serif, cockpit and grotesque faces, and a ChecklistPro mark drawn per design.', 'I want different fonts for each design. Also a logo at the top: ChecklistPro.'),
    R('decision', 'Classic becomes Minimalist', 'Not a paper look after all: plain white, system font, nothing extra.', 'The classic is not supposed to be classic, but minimalist.'),
    R('feature', 'The sounds ship', 'Heart monitor, cabin hum, sonar, metronome, alarm. Hard volume cap, a mute button, and the sound ends when every item is ticked.', null, 'sound'),
    R('idea', 'A timer?', 'A countdown in the checklist, and a box that fills as you finish.', 'You forgot to set a timer. I need a completion box that fills when completing tasks.', 'timer'),
    R('decision', 'Just the progress bar', 'No timer. A smooth bar that fills as items are ticked, with a Settings switch.', 'Just the completion bar. It should flow in an elegant way.', 'timer'),
    R('feature', 'The progress bar', 'It fills smoothly, turns green at the end, and in Modern it has moving stripes.', null),
    R('feature', 'List direction', 'Bottom to top by default, so the first item and the buttons sit near the thumb. Top to bottom for a normal list.', 'We need a toggle for the direction of the lists. Explain that this is so the button is closer to the finger.'),
    R('feature', 'Airbus, Boeing, Embraer', 'Three cockpit styles after research on each maker’s display conventions. Airbus is the original look.', 'I want two extra options, Airbus and Boeing. Find if each has a special way of doing this.'),
    R('feature', 'Four colour sets for Modern', 'Mint and coral, electric blue, cream and mint, and bold red, partly from a reference image.', 'For the modern, add an extra toggle for two other colours.'),
    R('feature', 'The Manifesto', 'A page on where checklists come from, pilots and then doctors, and how they can improve your life.', 'Add a manifesto: why this app is important, from pilot and doctor checklists.'),
    R('bug', 'Something very important was missing', 'The editor had Save but no plus button for a new item. Now Save sits next to Cancel and a plus sits on the other side.', 'There is a Save button, but no “+” for a new item.'),
    R('feature', 'Icons and a more fun Modern', 'Button icons, floating stickers, a pop on every tick, moving stripes and confetti at the end.', 'The modern should be more fun.'),
    R('feature', 'Install, and a gentle nudge', 'An Install app button in Settings, and a card on Home that comes back after five days.', 'I need an install App button on the top of Settings, and a popup that appears again after 5 days.'),
    R('decision', 'Never bigger than an iPad mini', 'On big screens the app stays a centred panel, so it never looks stretched.', 'Enforce phone view, so it does not look weird. Maximum iPad mini viewport.'),
    R('idea', 'An APK for Android?', 'Wrapping the page in an app. The answer: install it as a PWA, with an optional wrapper later.', 'How can I transform this into an APK for Android? Just to know.', 'apk'),
    R('feature', 'Voice quick list', 'Say a list out loud for up to 17 seconds. A Vercel function asks Gemini to turn it into a checklist, three uses per IP per day. The text lands in an editable box. Good for groceries.', 'The quicklist is AI voice only. Set a time limit of 17 seconds and 3 per IP.', 'ai'),
    R('feature', 'Checked in every design', 'Each change is tested in all three designs: contrast, 48 px tap targets, no overflow, and dozens of automated checks.', null),
    R('ship', 'Live on Vercel, on main', 'Deployed, installable and available offline, on a main branch you can follow.', 'I deployed the app on Vercel. If you make a main branch, it will be easier for me to see.'),
    R('idea', 'Agents hunting bugs', 'A fan-out of agents to hunt for bugs was planned, then paused to keep things simple.', null, 'agents'),
    R('ship', 'This website', 'A separate project to show the app, in the app’s own Modern design: bold red, big type, an iPhone and real flows.', 'Now I need a cool website based on the modern design to promote my app.'),
    R('idea', 'Advanced checklists and logs', 'Ask for a value when ticking, a mood from 1 to 5, or clean socks that count down each trip.', null, 'future'),
    R('idea', 'Voice challenge and response', 'Read each item aloud and answer by voice, like a two-pilot check.', null, 'future'),
  ];


  // the website's own story
  const WEB_ROWS = [
    R('idea', 'A site to promote the app', 'Built on the app’s Modern look: bold red, big type, iPhone mockups and real flows.', 'Now I need a cool website based on the modern design to promote my app.'),
    R('decision', 'A separate project', 'Its own repository and its own Vercel project. Plain HTML, CSS and JavaScript, no build step.', 'Create a separate project for this.'),
    R('feature', 'It starts with what it is not', 'Not a to-do app, not a habits app, both struck through. Then: a checklist prompt app.', 'It starts with what the app is not.'),
    R('bug', 'The phone covered the logo', 'The screenshots were taken again so the iPhone no longer hides the ChecklistPro logo.', 'The iPhone mockup covers the logo.'),
    R('feature', 'Lists that ask first', 'The ideas section got short and focused on the Pro part: a gym bag that asks “Sauna?” and “Squat day?”.', 'Focus on the Pro feature of conditionals.'),
    R('feature', 'A row of counters', 'Designs, colour sets, sounds, one HTML file. Counted, then cut.', 'Remove this.', 'wstats'),
    R('feature', 'Report a bug', 'A small contact form that emails the report, through a Vercel function and Resend.', 'Add a bug report link that is a contact form to my email.'),
    R('idea', 'Where should the video live?', 'YouTube would show the channel, GitHub is not made for video.', 'Video is too big. Where can I host it?', 'wvideo'),
    R('decision', 'A Google Cloud bucket', 'A public bucket served the ad for a while, until the video was small enough to ship with the site.', 'Google cloud bucket.', 'wvideo'),
    R('feature', 'A silent teaser', 'A short loop of scenes plays without sound until someone presses Play, then the ad starts from the beginning.', 'Can a little trailer with no audio keep playing in loop until someone presses play?'),
    R('feature', 'Flows on a phone', 'Real screenshots played as flows on an iPhone. Later replaced by the Pro powers.', null, 'wflows'),
    R('feature', 'The same click as the app', 'Every button makes the app’s click sound, with a toggle in the header.', 'Add the same button click sound to the website.'),
    R('bug', 'No preview image on WhatsApp', 'Share tags now use full addresses. Vercel’s login wall also kept the preview bots out.', 'When I share through WhatsApp there is no little image.'),
    R('feature', 'Four colour sets and German', 'The page switches colours like the app does, and the whole site speaks German.', 'Add the design toggle between the colours, add translation to German.'),
    R('feature', 'Lines that fall', 'The struck lines get knocked aside, wait at the edges and fall with gravity when you scroll. Three patterns, a new one on each visit.', 'Each refresh triggers a different one.'),
    R('feature', 'A co-pilot robot', 'A cartoon pilot reads every power back, gets thrown off by the buzz, and falls into the phone to show your data stays there.', 'Make a little robot dressed as a pilot.'),
    R('idea', 'Why a checklist?', 'A big WHY? turns into the answer: keep the thinking for things that matter (Forte, 2022).', 'A checklist is not for people who can’t remember.'),
    R('feature', 'Buttons you can press', 'Every button sinks into its shadow like a real key.', 'The button goes to the shadows.'),
    R('feature', 'Install, Impressum and a game', 'Install steps for every device, an Impressum, and Touchdown Checkbot, a landing game that opens on Play.', 'Add a cute but little play the game section.'),
    R('feature', 'This film', 'Eight seconds of back and forth while the app grows from a plain list to today.', 'Make an animation with the amount of back and forth with Claude.'),
    R('ship', 'Live on Vercel', 'checklist-app-website.vercel.app, pushed from main.', null),
  ];

  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const J = { built: false, set: 'app' };
  J.build = function () {
    if (J.built) return; J.built = true;
    J.fill('app');
  };
  J.fill = function (set) {
    J.set = set; const DATA = set === 'web' ? WEB_ROWS : ROWS;
    const rows = document.getElementById('tree-rows'), legend = document.getElementById('legend'), filters = document.getElementById('journey-filters');
    rows.innerHTML = ''; legend.innerHTML = ''; filters.innerHTML = '';
    // legend + filters
    Object.entries(TYPES).forEach(([k, [name, c]]) => { const s = el('span', null, '<i style="--c:' + c + '"></i>' + name); legend.appendChild(s); });
    const all = el('button', 'fchip', 'All'); all.type = 'button'; all.setAttribute('aria-pressed', 'true'); filters.appendChild(all);
    const chips = [all];
    const FILTERS = [['idea', 'Ideas'], ['decision', 'Decisions'], ['feature', 'Built'], ['bug', 'Caught'], ['parked', 'Parked'], ['ship', 'Shipped']];
    FILTERS.forEach(([k, n]) => { const b = el('button', 'fchip', n); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.dataset.type = k; filters.appendChild(b); chips.push(b); });
    chips.forEach(b => b.addEventListener('click', () => {
      chips.forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      const t = b.dataset.type || '';
      rows.querySelectorAll('.row').forEach(r => r.classList.toggle('dim', !!t && r.dataset.type !== t));
    }));
    // rows
    DATA.forEach((r, i) => {
      const lane = r.branch ? BRANCHES[r.branch].lane : 0, [name, color] = TYPES[r.type];
      const li = el('li', 'row ' + r.type); li.dataset.type = r.type; li.dataset.lane = lane; li.dataset.branch = r.branch || ''; li.style.setProperty('--c', color);
      const lanes = el('div', 'lanes'); const node = el('i', 'node' + (r.type === 'ship' ? ' big' : '')); node.style.left = 'calc(var(--lane-w) * ' + (lane + .5) + ')'; lanes.appendChild(node);
      const card = el('div', 'card2', '<span class="tag">' + name + '</span><h3>' + esc(r.title) + '</h3><p>' + esc(r.text) + '</p>' + (r.says ? '<q>' + esc(r.says) + '</q>' : ''));
      li.appendChild(lanes); li.appendChild(card); rows.appendChild(li);
    });
    // reveal as rows scroll into view
    const root = document.getElementById('journey-scroll');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { root, rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      rows.querySelectorAll('.row').forEach(r => io.observe(r));
    } else rows.querySelectorAll('.row').forEach(r => r.classList.add('in'));
  };

  // Draw the lines from the real positions of the dots.
  J.draw = function (animate) {
    const tree = document.getElementById('tree'), svg = document.getElementById('tree-svg');
    if (!tree || !J.built) return;
    tree.classList.add('measuring'); void tree.offsetWidth;
    const T = tree.getBoundingClientRect();
    const rowEls = [...document.querySelectorAll('#tree-rows .row')];
    const pts = rowEls.map(r => { const n = r.querySelector('.node').getBoundingClientRect(); return { x: n.left + n.width / 2 - T.left, y: n.top + n.height / 2 - T.top, lane: +r.dataset.lane, branch: r.dataset.branch }; });
    tree.classList.remove('measuring');
    svg.setAttribute('viewBox', '0 0 ' + T.width + ' ' + T.height); svg.innerHTML = '';
    const NS = 'http://www.w3.org/2000/svg', paths = [];
    const add = (d, cls) => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); if (cls) p.setAttribute('class', cls); svg.appendChild(p); paths.push(p); return p; };
    const trunk = pts.filter(p => p.lane === 0);
    if (trunk.length) add('M' + trunk[0].x + ' ' + trunk[0].y + trunk.slice(1).map(p => ' L' + p.x + ' ' + p.y).join(''), 'trunk');
    Object.keys(BRANCHES).forEach(b => {
      const idx = pts.map((p, i) => (p.branch === b ? i : -1)).filter(i => i >= 0); if (!idx.length) return;
      const first = idx[0], last = idx[idx.length - 1];
      let f = first - 1; while (f >= 0 && pts[f].lane !== 0) f--; if (f < 0) return;
      const F = pts[f], bp = idx.map(i => pts[i]), d = Math.min(60, (bp[0].y - F.y) / 2);
      let d0 = 'M' + F.x + ' ' + F.y + ' C' + F.x + ' ' + (F.y + d) + ' ' + bp[0].x + ' ' + (bp[0].y - d) + ' ' + bp[0].x + ' ' + bp[0].y;
      bp.slice(1).forEach(p => { d0 += ' L' + p.x + ' ' + p.y; });
      const end = BRANCHES[b].end, L = bp[bp.length - 1];
      if (end === 'merge') {
        let m = last + 1; while (m < pts.length && pts[m].lane !== 0) m++;
        if (m < pts.length) { const M = pts[m], dd = Math.min(60, (M.y - L.y) / 2); d0 += ' C' + L.x + ' ' + (L.y + dd) + ' ' + M.x + ' ' + (M.y - dd) + ' ' + M.x + ' ' + M.y; }
        add(d0, 'branch');
      } else if (end === 'dead') {
        add(d0 + ' L' + L.x + ' ' + (L.y + 34), 'branch');
        const x = L.x, y = L.y + 44; add('M' + (x - 9) + ' ' + (y - 9) + ' l18 18 M' + (x + 9) + ' ' + (y - 9) + ' l-18 18', 'x');
      } else { add(d0, 'branch'); add('M' + L.x + ' ' + L.y + ' L' + L.x + ' ' + (L.y + 70), 'open'); }
    });
    if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paths.forEach((p, i) => {
        if (p.classList.contains('dead') || p.classList.contains('open') || p.classList.contains('x')) { p.style.opacity = 0; p.style.transition = 'opacity .6s ' + (.4 + i * .08) + 's'; requestAnimationFrame(() => requestAnimationFrame(() => { p.style.opacity = 1; })); return; }
        const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
        p.getBoundingClientRect(); p.style.transition = 'stroke-dashoffset ' + Math.min(2.6, .8 + len / 1800) + 's cubic-bezier(.5,0,.2,1) ' + (i * .12) + 's';
        requestAnimationFrame(() => { p.style.strokeDashoffset = 0; });
      });
    }
  };
  window.Journey = J; window.JOURNEY_ROWS = ROWS;
})();
