(function () {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  // links to the real app
  $$('[data-app]').forEach(a => { a.href = window.APP_URL + '/'; a.target = '_blank'; a.rel = 'noopener'; });

  // ---------- scroll reveal ----------
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 }) : null;
  $$('.reveal').forEach(e => (io ? io.observe(e) : e.classList.add('in')));

  // ---------- hero intro ----------
  const lines = $$('.lines .line'), confetti = $('#confetti');
  const COLORS = ['#ffe14d', '#6df5b9', '#ffffff', '#ffc2c2', '#6db7ff', '#ffb347'];
  function burst() {
    if (reduce) return; confetti.innerHTML = '';
    for (let i = 0; i < 46; i++) { const p = document.createElement('i'); const w = 8 + Math.random() * 10; p.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + w + 'px;height:' + (w * 1.4) + 'px;background:' + COLORS[i % COLORS.length] + ';border-radius:' + (i % 3 === 0 ? '50%' : '3px') + ';animation-delay:' + (Math.random() * .7) + 's;animation-duration:' + (1.8 + Math.random() * 1.4) + 's'; confetti.appendChild(p); }
    setTimeout(() => { confetti.innerHTML = ''; }, 4200);
  }
  let introRun = 0;
  async function intro() {
    const run = ++introRun; const ok = () => run === introRun;
    lines.forEach(l => l.classList.remove('show', 'struck')); $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.remove('in'));
    if (reduce) { lines.forEach(l => l.classList.add('show', 'struck')); lines[2].classList.remove('struck'); $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.add('in')); return; }
    await wait(300); if (!ok()) return; lines[0].classList.add('show');
    await wait(900); if (!ok()) return; lines[0].classList.add('struck');
    await wait(650); if (!ok()) return; lines[1].classList.add('show');
    await wait(900); if (!ok()) return; lines[1].classList.add('struck');
    await wait(750); if (!ok()) return; lines[2].classList.add('show'); burst();
    await wait(650); if (!ok()) return; $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.add('in'));
  }
  $('#replay').addEventListener('click', intro);
  intro();

  // mouse parallax for the stickers and the hero phone
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    const stk = $$('.stk'); const depth = [14, 22, 10, 18, 26, 12];
    addEventListener('pointermove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; stk.forEach((s, i) => { s.style.transform = 'translate(' + (x * depth[i % 6] * -2) + 'px,' + (y * depth[i % 6] * -2) + 'px)'; }); });
  }

  // 3D tilt for phones
  $$('.tilt').forEach(p => {
    if (reduce || !matchMedia('(pointer: fine)').matches) return; const host = p.parentElement;
    host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; p.style.transform = 'rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 10) + 'deg)'; });
    host.addEventListener('pointerleave', () => { p.style.transform = ''; });
  });

  // ---------- video ----------
  const box = $('#video-box'), vid = $('#ad');
  const missing = () => box.classList.add('missing');
  $('#ad source').addEventListener('error', missing);
  vid.addEventListener('error', missing);
  setTimeout(() => { if (vid.networkState === 3 || vid.error) missing(); }, 2500);

  // ---------- idea cards ----------
  const CARDS = [
    ['Trip packing', 'Never again the charger left on the bed.', '#ffe14d', 'M4 8h16v11H4zM9 8V5h6v3M4 13h16', ['Passport', 'Charger', 'Toothbrush']],
    ['Gym bag', 'Shoes, towel, water. Sauna? Then a flip-flops question.', '#6df5b9', 'M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12', ['Shoes', 'Water bottle', 'Towel']],
    ['Leaving home', 'The ten-second check at the door.', '#ffc2c2', 'M4 11l8-7 8 7M6 10v9h12v-9M10 19v-5h4v5', ['Keys', 'Wallet', 'Stove off']],
    ['Preflight', 'Borrow the pilots’ own habit for anything risky.', '#6db7ff', 'M21 15l-8-3V5a1 1 0 0 0-2 0v7l-8 3v2l8-1v4l-2 1v1l3-.5 3 .5v-1l-2-1v-4l8 1z', ['Check fuel', 'Check flaps', 'Check lights']],
    ['Groceries by voice', 'Say it in 17 seconds. It becomes a list.', '#ffb347', 'M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM6 11a6 6 0 0 0 12 0M12 17v4', ['Milk', 'Eggs', 'Bread']],
    ['Launch day', 'A release, a talk, an event. Same steps, every time.', '#ffe14d', 'M12 3c3 2 5 6 5 10l-2 3H9l-2-3c0-4 2-8 5-10zM9 19l-1 3 4-2 4 2-1-3', ['Tests green', 'Notes written', 'Ship it']],
    ['Morning routine', 'Start the day without thinking about it.', '#6df5b9', 'M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2', ['Water', 'Stretch', 'Plan the day']],
    ['School bag', 'For kids, and for the parents who pack it.', '#ffc2c2', 'M8 6a4 4 0 0 1 8 0M6 8h12v12H6zM9 14h6', ['Lunch', 'Homework', 'Gym kit']],
    ['Camping', 'Rain? A yes adds the umbrella to the run.', '#6db7ff', 'M2 20L12 4l10 16zM12 4v16M9 20l3-6 3 6', ['Tent', 'Stove', 'Rain jacket']],
    ['Moving day', 'Boxes, keys, meters, goodbyes.', '#ffb347', 'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10', ['Meters read', 'Keys back', 'Mail forwarded']],
  ];
  const cards = $('#cards');
  CARDS.forEach(([t, d, c, icon, items]) => {
    const li = document.createElement('li'); li.className = 'reveal'; li.style.setProperty('--ink-2', c);
    li.innerHTML = '<h3><span class="ic" style="--c:' + c + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + icon + '"/></svg></span>' + t + '</h3><p>' + d + '</p><ul class="mini">' + items.map(i => '<li><span>' + i + '</span><i class="bx"></i></li>').join('') + '</ul>';
    cards.appendChild(li); if (io) io.observe(li); else li.classList.add('in');
  });
  async function tickCard(li) {
    const its = $$('.mini li', li); its.forEach(x => x.classList.remove('on'));
    if (reduce) { its.forEach(x => x.classList.add('on')); return; }
    for (const x of its) { await wait(520); x.classList.add('on'); }
  }
  if ('IntersectionObserver' in window) { const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => tickCard(e.target), 500); io2.unobserve(e.target); } }), { threshold: .6 }); $$('#cards li').forEach(li => { io2.observe(li); li.addEventListener('pointerenter', () => tickCard(li)); }); }

  // ---------- flows ----------
  const F = window.FRAMES, FLOWS = [['run', 'Run it'], ['ask', 'Ask once'], ['voice', 'Say it'], ['build', 'Build it']];
  const screen = $('#flow-screen'), tap = $('#flow-tap'), phone = $('#flow-phone'), steps = $('#flow-steps'), tabs = $('#flow-tabs');
  const imgs = {}; let flow = 'run', idx = 0, timer = 0, visible = false, holdUntil = 0;
  const frameImg = f => { if (!imgs[f.img]) { const im = new Image(); im.src = 'img/frames/' + f.img + '.webp'; im.alt = ''; im.width = 780; im.height = 1688; im.decoding = 'async'; imgs[f.img] = im; } return imgs[f.img]; };
  function renderTabs() { tabs.innerHTML = ''; FLOWS.forEach(([k, n]) => { const b = document.createElement('button'); b.className = 'tab'; b.type = 'button'; b.role = 'tab'; b.textContent = n; b.setAttribute('aria-selected', k === flow ? 'true' : 'false'); b.addEventListener('click', () => { setFlow(k); holdUntil = Date.now() + 6000; }); tabs.appendChild(b); }); }
  function renderSteps() { steps.innerHTML = ''; F[flow].forEach((f, i) => { const li = document.createElement('li'); const b = document.createElement('button'); b.type = 'button'; b.textContent = f.note; b.addEventListener('click', () => { show(i); holdUntil = Date.now() + 7000; }); li.appendChild(b); steps.appendChild(li); }); }
  function show(i) {
    idx = i; const fr = F[flow];
    screen.innerHTML = ''; fr.forEach((f, k) => { const im = frameImg(f).cloneNode(); im.className = k === i ? 'on' : ''; screen.appendChild(im); });
    $$('button', steps).forEach((b, k) => { if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
  }
  function setFlow(k) { flow = k; renderTabs(); renderSteps(); show(0); F[k].forEach(frameImg); }
  async function tickFlow() {
    if (!visible || reduce || Date.now() < holdUntil) return;
    const fr = F[flow][idx];
    if (fr.tap) { tap.style.left = (fr.tap[0] * 100) + '%'; tap.style.top = (fr.tap[1] * 100) + '%'; tap.classList.remove('go'); void tap.offsetWidth; tap.classList.add('go'); await wait(750); }
    if (!visible) return;
    const next = idx + 1;
    if (next >= F[flow].length) { await wait(600); const keys = FLOWS.map(x => x[0]); setFlow(keys[(keys.indexOf(flow) + 1) % keys.length]); } else show(next);
  }
  setFlow('run');
  (function loop() { tickFlow().finally(() => setTimeout(loop, 2300)); })();
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { visible = e.isIntersecting; }), { threshold: .3 }).observe(phone); else visible = true;

  // ---------- looks ----------
  const NOTES = {
    Minimalist: ['Minimalist', 'Plain white, your phone’s own font, nothing extra. Space and weight do the work.'],
    Airbus: ['Cockpit: Airbus', 'Always dark, in B612, the typeface designed with Airbus for cockpit screens. Green normal, amber caution, cyan information.'],
    Boeing: ['Cockpit: Boeing', 'Black and white with a condensed face. A line turns green when it is done. Cyan labels.'],
    Embraer: ['Cockpit: Embraer', 'Softer graphite panels with rounded corners, in cyan and green.'],
    Mint: ['Modern: Mint & coral', 'Thick borders, hard shadows and grain, with coral buttons on mint.'],
    Blue: ['Modern: Electric blue', 'A saturated blue page, white cards, yellow buttons.'],
    Cream: ['Modern: Cream & mint', 'Peach cream, dark ink, mint buttons.'],
    Red: ['Modern: Bold red', 'This site. Loud, big and happy.'],
  };
  const lScreen = $('#looks-screen'), chipsEl = $('#look-chips'), note = $('#look-note'); let look = 7, lHold = 0;
  F.looks.forEach((l, i) => { const im = new Image(); im.src = 'img/frames/' + l.img + '.webp'; im.alt = l.name + ' look of the ChecklistPro home screen'; im.width = 780; im.height = 1688; lScreen.appendChild(im);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip-b'; b.role = 'tab'; b.textContent = l.name; b.addEventListener('click', () => { pickLook(i); lHold = Date.now() + 9000; }); chipsEl.appendChild(b); });
  function pickLook(i) { look = i; $$('img', lScreen).forEach((im, k) => im.classList.toggle('on', k === i)); $$('.chip-b', chipsEl).forEach((b, k) => b.setAttribute('aria-selected', k === i ? 'true' : 'false')); const n = NOTES[F.looks[i].name]; note.innerHTML = '<dt>' + n[0] + '</dt><dd>' + n[1] + '</dd>'; }
  pickLook(7);
  let lVis = false; if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { lVis = e.isIntersecting; }), { threshold: .3 }).observe($('#looks-phone'));
  setInterval(() => { if (lVis && !reduce && Date.now() > lHold) pickLook((look + 1) % F.looks.length); }, 2400);

  // ---------- counters ----------
  const STATS = [[3, 'designs'], [4, 'colour sets'], [3, 'cockpit styles'], [6, 'sounds'], [1, 'HTML file']];
  const stats = $('#stats'); STATS.forEach(([n, l]) => { const d = document.createElement('div'); d.className = 'stat'; d.innerHTML = '<b data-n="' + n + '">' + (reduce ? n : 0) + '</b><span>' + l + '</span>'; stats.appendChild(d); });
  if (!reduce && 'IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (!e.isIntersecting) return; o.unobserve(e.target); $$('b', e.target).forEach(b => { const n = +b.dataset.n; let c = 0; const t = setInterval(() => { c++; b.textContent = c; if (c >= n) clearInterval(t); }, 220); }); }), { threshold: .5 }).observe(stats);

  // ---------- live app ----------
  $('#load-live').addEventListener('click', () => {
    const box = $('#live-screen'); box.innerHTML = '<div class="live-ph"><p>Loading…</p></div>';
    const f = document.createElement('iframe'); f.title = 'ChecklistPro, live'; f.src = window.APP_LIVE; f.setAttribute('sandbox', 'allow-scripts allow-forms'); f.loading = 'lazy';
    f.addEventListener('load', () => { const p = $('.live-ph', box); if (p) p.remove(); }); box.appendChild(f); $('#load-live').textContent = 'Reload';
  });

  // ---------- journey overlay ----------
  const ov = $('#journey'); let lastFocus = null;
  function openJourney(push) {
    lastFocus = document.activeElement; window.Journey.build(); ov.hidden = false; document.body.classList.add('lock');
    requestAnimationFrame(() => { ov.classList.add('open'); setTimeout(() => { window.Journey.draw(true); }, 120); $('#close-journey').focus(); });
    if (push !== false && location.hash !== '#journey') history.pushState(null, '', '#journey');
  }
  function closeJourney(push) { ov.classList.remove('open'); document.body.classList.remove('lock'); setTimeout(() => { ov.hidden = true; }, 450); if (lastFocus) lastFocus.focus(); if (push !== false && location.hash === '#journey') history.pushState(null, '', location.pathname + location.search); }
  $('#open-journey').addEventListener('click', () => openJourney()); $('#open-journey-2').addEventListener('click', () => openJourney()); $('#close-journey').addEventListener('click', () => closeJourney());
  addEventListener('keydown', e => {
    if (!ov.classList.contains('open')) return;
    if (e.key === 'Escape') closeJourney();
    if (e.key === 'Tab') { const f = $$('button, a[href], [tabindex="0"]', ov).filter(x => !x.disabled); const first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }
  });
  addEventListener('popstate', () => { if (location.hash === '#journey') openJourney(false); else if (ov.classList.contains('open')) closeJourney(false); });
  if (location.hash === '#journey') openJourney(false);
  let rz = 0; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if (ov.classList.contains('open')) window.Journey.draw(false); }, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (ov.classList.contains('open')) window.Journey.draw(false); });
})();
