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
  const cv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function burst() {
    if (reduce) return; confetti.innerHTML = ''; const COLORS = [cv('--yellow'), cv('--mint'), '#ffffff', cv('--pink'), cv('--blue'), cv('--orange')];
    for (let i = 0; i < 46; i++) { const p = document.createElement('i'); const w = 8 + Math.random() * 10; p.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + w + 'px;height:' + (w * 1.4) + 'px;background:' + COLORS[i % COLORS.length] + ';border-radius:' + (i % 3 === 0 ? '50%' : '3px') + ';animation-delay:' + (Math.random() * .7) + 's;animation-duration:' + (1.8 + Math.random() * 1.4) + 's'; confetti.appendChild(p); }
    setTimeout(() => { confetti.innerHTML = ''; }, 4200);
  }
  let introRun = 0;
  // The two struck lines are shoved to the left edge by the big line and wait there. They fall like gravity when the page is scrolled.
  const hero = $('.hero'), canPark = () => innerWidth >= 900;
  const lot = document.createElement('div'); lot.className = 'lines parking'; lot.setAttribute('aria-hidden', 'true'); hero.appendChild(lot);
  let parked = [], dropArm = null;
  function unpark() {
    if (dropArm) { removeEventListener('scroll', dropArm); dropArm = null; }
    parked.forEach(p => { p.ph.parentNode.insertBefore(p.l, p.ph); p.ph.remove(); }); parked = []; $$('.falling').forEach(f => f.remove());
    lines.slice(0, 2).forEach(l => { l.classList.remove('parked', 'dropping', 'dropped'); l.removeAttribute('style'); }); hero.classList.remove('parked'); lines[2].classList.remove('squash');
  }
  function park() {
    const hr = hero.getBoundingClientRect(), f = lines.slice(0, 2).map(l => ({ l, r: l.getBoundingClientRect() }));
    f.forEach(({ l, r }, i) => {
      const ph = document.createElement('div'); ph.className = 'line-ph'; ph.style.height = r.height + 'px'; ph.style.marginBottom = getComputedStyle(l).marginBottom; l.parentNode.insertBefore(ph, l);
      l.style.cssText = 'position:absolute;z-index:4;margin:0;left:' + (r.left - hr.left) + 'px;top:' + (r.top - hr.top) + 'px;white-space:nowrap;transform-origin:0 0;transition:none';
      lot.appendChild(l); parked.push({ l, ph });
    });
    void hero.offsetHeight;
    // they come to rest leaning in the two bottom corners, like props: / on the left, \ on the right
    const PX = 28, A = 76 * Math.PI / 180, cw = document.documentElement.clientWidth, base = Math.min(hero.offsetHeight, innerHeight) - 36;
    f.forEach(({ l }, i) => {
      const right = i === 1, L = l.offsetWidth * PX / parseFloat(getComputedStyle(l).fontSize);
      l.classList.add('parked'); l.style.transition = ''; l.style.fontSize = PX + 'px';
      l.style.setProperty('--rot', right ? '76deg' : '-76deg'); l.style.setProperty('--end', right ? '150deg' : '-150deg'); l.style.setProperty('--dx', right ? '.12' : '-.12');
      if (right) { l.style.left = (cw - 10 - L * Math.cos(A)) + 'px'; l.style.top = (base - L * Math.sin(A)) + 'px'; l.style.transform = 'rotate(76deg)'; }
      else { l.style.left = '8px'; l.style.top = base + 'px'; l.style.transform = 'rotate(-76deg)'; }
      l.style.transitionDelay = (i * 120) + 'ms';
    });
    hero.classList.add('parked');
    parked.forEach(({ ph }) => { ph.style.height = '0px'; ph.style.marginBottom = '0px'; });
    if (reduce) return;
    // only a scroll down after the lines have landed lets them go
    let y0 = null;
    dropArm = () => { if (y0 == null || scrollY - y0 < 40) return; removeEventListener('scroll', dropArm); dropArm = null; drop(); };
    addEventListener('scroll', dropArm, { passive: true });
    setTimeout(() => { y0 = scrollY; }, 1000);
  }
  function drop() {
    // the lines move to a fixed layer, so they fall through the screen while the page scrolls
    const fall = document.createElement('div'); fall.className = 'lines falling'; fall.setAttribute('aria-hidden', 'true'); document.body.appendChild(fall);
    const hr = hero.getBoundingClientRect(), away = innerHeight + 700;
    parked.forEach(({ l }, i) => {
      l.style.left = (parseFloat(l.style.left) + hr.left) + 'px'; l.style.top = (parseFloat(l.style.top) + hr.top) + 'px'; l.style.transitionDelay = '';
      fall.appendChild(l); l.classList.add('dropping'); l.style.setProperty('--away', away + 'px'); l.style.animationDelay = (i * 160) + 'ms';
      l.addEventListener('animationend', () => { l.classList.add('dropped'); if (parked.every(p => p.l.classList.contains('dropped'))) parked.forEach(p => lot.appendChild(p.l)), fall.remove(); }, { once: true });
    });
  }
  async function intro() {
    const run = ++introRun; const ok = () => run === introRun;
    unpark(); lines.forEach(l => { l.classList.remove('show', 'struck', 'fell', 'gone'); l.style.height = ''; }); $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.remove('in'));
    if (reduce) { lines.forEach(l => l.classList.add('show', 'struck')); lines[2].classList.remove('struck'); if (canPark()) park(); else lines.slice(0, 2).forEach(l => l.classList.add('gone')); $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.add('in')); return; }
    await wait(300); if (!ok()) return; lines[0].classList.add('show');
    await wait(900); if (!ok()) return; lines[0].classList.add('struck');
    await wait(650); if (!ok()) return; lines[1].classList.add('show');
    await wait(900); if (!ok()) return; lines[1].classList.add('struck');
    await wait(750); if (!ok()) return; lines[2].classList.add('show'); burst();
    await wait(240); if (!ok()) return;
    // the big line hits the struck ones: it squashes on impact and springs back while they are shoved aside
    if (canPark()) { lines[2].classList.add('squash'); lines[2].addEventListener('animationend', () => lines[2].classList.remove('squash'), { once: true }); park(); } else { lines.slice(0, 2).forEach(l => { l.style.height = l.offsetHeight + 'px'; void l.offsetHeight; l.classList.add('fell'); }); await wait(450); if (!ok()) return; lines.slice(0, 2).forEach(l => l.classList.add('gone')); }
    await wait(500); if (!ok()) return; $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.add('in'));
  }
  $('#replay').addEventListener('click', intro);
  intro();

  // mouse parallax for the stickers and the hero phone
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    const stk = $$('.stk'); const depth = [14, 22, 10, 18, 26, 12];
    addEventListener('pointermove', e => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; stk.forEach((s, i) => { s.style.transform = 'translate(' + (x * depth[i % 6] * -2) + 'px,' + (y * depth[i % 6] * -2) + 'px)'; }); });
  }

  // ---------- hero phone: every look, swiped through ----------
  (function () {
    const track = $('#hero-swipe'), scr = track.parentElement, nameEl = $('#swipe-name'), dotsEl = $('#swipe-dots'), L = window.FRAMES.looks;
    let cur = 0, timer = 0, x0 = null, dx = 0, w = 1, pause = 0;
    L.forEach((l, i) => { const im = new Image(); im.src = 'img/frames/' + l.img + '.webp'; im.alt = ''; im.width = 780; im.height = 1688; im.draggable = false; track.appendChild(im); const d = document.createElement('i'); dotsEl.appendChild(d); });
    const go = i => { cur = (i + L.length) % L.length; track.style.transform = 'translateX(' + (-cur * 100) + '%)'; nameEl.textContent = L[cur].name === 'Minimalist' || L[cur].name.startsWith('Air') || L[cur].name === 'Boeing' || L[cur].name === 'Embraer' ? L[cur].name : 'Modern ' + L[cur].name; $$('i', dotsEl).forEach((d, k) => d.classList.toggle('on', k === cur)); };
    go(0);
    const loop = () => { clearInterval(timer); if (reduce) return; timer = setInterval(() => { if (document.hidden || Date.now() < pause) return; go(cur + 1); }, 2400); };
    loop();
    scr.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; w = scr.offsetWidth; pause = Date.now() + 6000; track.classList.add('drag'); scr.classList.add('drag'); scr.setPointerCapture(e.pointerId); });
    scr.addEventListener('pointermove', e => { if (x0 == null) return; dx = e.clientX - x0; track.style.transform = 'translateX(' + (-cur * w + dx) + 'px)'; });
    const end = () => { if (x0 == null) return; const moved = dx; x0 = null; track.classList.remove('drag'); scr.classList.remove('drag'); track.style.transform = ''; go(Math.abs(moved) > w * .18 ? cur + (moved < 0 ? 1 : -1) : cur); pause = Date.now() + 6000; };
    scr.addEventListener('pointerup', end); scr.addEventListener('pointercancel', end);
  })();

  // 3D tilt for phones
  $$('.tilt').forEach(p => {
    if (reduce || !matchMedia('(pointer: fine)').matches) return; const host = p.parentElement;
    host.addEventListener('pointermove', e => { const r = host.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; p.style.transform = 'rotateY(' + (x * 14) + 'deg) rotateX(' + (-y * 10) + 'deg)'; });
    host.addEventListener('pointerleave', () => { p.style.transform = ''; });
  });

  // ---------- colour set switch ----------
  (function () {
    const root = document.documentElement, meta = document.querySelector('meta[name="theme-color"]'), btns = $$('#swatches button[data-p]');
    const icon = document.querySelector('link[rel="icon"]'), base = icon && icon.getAttribute('href');
    // the tab icon takes the colours of the chosen set
    const setIcon = () => { if (!icon) return; const c = n => getComputedStyle(root).getPropertyValue(n).trim(), svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="' + c('--red') + '"/><rect x="10" y="10" width="40" height="40" rx="10" fill="#111"/><rect x="15" y="15" width="40" height="40" rx="10" fill="' + c('--yellow') + '" stroke="#111" stroke-width="4.5"/><path d="M24 35.5l7 7 14.5-16" fill="none" stroke="#111" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>'; icon.href = root.dataset.palette === 'red' ? base : 'data:image/svg+xml,' + encodeURIComponent(svg); };
    const paint = p => { root.setAttribute('data-palette', p); setIcon(); btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.p === p ? 'true' : 'false')); if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--red').trim()); };
    paint(root.getAttribute('data-palette') || 'red');
    $('#to-top').addEventListener('click', () => { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    btns.forEach(b => b.addEventListener('click', () => { paint(b.dataset.p); try { localStorage.setItem('cp-palette', b.dataset.p); } catch (e) {} }));
  })();

  // ---------- video: a silent teaser loops until someone presses play, then the full ad starts from the beginning ----------
  const box = $('#video-box'), vid = $('#ad'), teaser = $('#teaser'), playBtn = $('#play-main');
  if (window.VIDEO_SRC && window.VIDEO_SRC !== 'video/ad-720p.mp4') { $('#ad source').src = window.VIDEO_SRC; vid.load(); }
  if (window.TEASER_SRC && window.TEASER_SRC !== 'video/teaser.mp4') { $('#teaser source').src = window.TEASER_SRC; teaser.load(); }
  let teaserOk = true, mainOk = true;
  const checkMissing = () => { if (!teaserOk && !mainOk) box.classList.add('missing'); };
  $('#teaser source').addEventListener('error', () => { teaserOk = false; teaser.hidden = true; box.classList.add('no-teaser'); checkMissing(); });
  $('#ad source').addEventListener('error', () => { mainOk = false; if (vid.hidden === false) { vid.hidden = true; box.classList.remove('playing'); } box.classList.add('main-missing'); checkMissing(); });
  const wantsMotion = !reduce && !(navigator.connection && navigator.connection.saveData);
  const playTeaser = () => { if (!teaserOk || box.classList.contains('playing') || !wantsMotion) return; const p = teaser.play(); if (p && p.catch) p.catch(() => {}); };
  if (wantsMotion) { teaser.autoplay = true; playTeaser(); }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) playTeaser(); else teaser.pause(); }), { threshold: .25 }).observe(box);
  function startMain() {
    if (!mainOk) { box.classList.add('missing', 'main-missing'); return; }
    teaser.pause(); teaser.hidden = true; vid.hidden = false; box.classList.add('playing');
    vid.preload = 'auto'; vid.currentTime = 0; const p = vid.play(); if (p && p.catch) p.catch(() => {});
  }
  function backToTeaser() { vid.pause(); vid.hidden = true; box.classList.remove('playing'); if (teaserOk) { teaser.hidden = false; playTeaser(); } }
  playBtn.addEventListener('click', startMain); teaser.addEventListener('click', startMain);
  vid.addEventListener('ended', backToTeaser);
  setTimeout(() => { if (teaser.networkState === 3) { teaserOk = false; teaser.hidden = true; box.classList.add('no-teaser'); checkMissing(); } }, 2500);

  // ---------- idea cards: small ones tick themselves ----------
  async function tickCard(li) {
    const its = $$('.mini li', li); its.forEach(x => x.classList.remove('on'));
    if (reduce) { its.forEach(x => x.classList.add('on')); return; }
    for (const x of its) { await wait(520); x.classList.add('on'); }
  }
  if ('IntersectionObserver' in window) { const io2 = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { setTimeout(() => tickCard(e.target), 500); io2.unobserve(e.target); } }), { threshold: .6 }); $$('[data-tick]').forEach(li => { io2.observe(li); li.addEventListener('pointerenter', () => tickCard(li)); }); }
  else $$('[data-tick]').forEach(li => $$('.mini li', li).forEach(x => x.classList.add('on')));

  // ---------- the Pro part: yes/no questions add items ----------
  const ICON_SAUNA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2.5c-1.6 2 1.6 3 0 5.5M12 2.5c-1.6 2 1.6 3 0 5.5M17 2.5c-1.6 2 1.6 3 0 5.5M3 14h18M5 14v6M19 14v6M3 20h18M8 14v-2h8v2"/></svg>';
  const ICON_BAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1.5 10v4M4.5 7v10M7.5 9.5v5M16.5 9.5v5M19.5 7v10M22.5 10v4M7.5 12h9"/></svg>';
  const stage = $('#d-stage'), ask = $('#d-ask'), cur = $('#d-cursor'), dq = $('#d-q'), dic = $('#d-ic'), count = $('#d-count'), hint = $('#d-hint');
  const tg = { sauna: $('#t-sauna'), squat: $('#t-squat') }, addLi = $$('#d-list .add'); let demoRun = 0;
  function setAnswer(key, yes, silent) {
    addLi.filter(li => li.dataset.if === key).forEach((li, i) => { setTimeout(() => li.classList.toggle('in', yes), silent || reduce ? 0 : i * 380); });
    tg[key].setAttribute('aria-pressed', yes ? 'true' : 'false'); $('b', tg[key]).textContent = yes ? 'Yes' : 'No';
    setTimeout(() => { const n = 3 + addLi.filter(li => li.classList.contains('in')).length; count.textContent = n + ' items'; count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump'); }, silent || reduce ? 10 : 900);
  }
  function point(el, pressed) { const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); cur.style.left = (r.left - s.left + r.width * .62) + 'px'; cur.style.top = (r.top - s.top + r.height * .55) + 'px'; }
  async function demo() {
    const run = ++demoRun, ok = () => run === demoRun;
    Object.values(tg).forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', 'false'); $('b', b).textContent = 'No'; });
    addLi.forEach(li => li.classList.remove('in')); count.textContent = '3 items'; ask.classList.remove('show'); cur.classList.remove('show', 'press'); hint.classList.remove('done');
    if (reduce) { setAnswer('sauna', true, true); setAnswer('squat', true, true); Object.values(tg).forEach(b => { b.disabled = false; }); hint.classList.add('done'); return; }
    cur.style.left = '86%'; cur.style.top = '96%'; await wait(700); if (!ok()) return;
    for (const [key, text, icon, color] of [['sauna', 'Sauna?', ICON_SAUNA, 'var(--yellow)'], ['squat', 'Squat day?', ICON_BAR, 'var(--pink)']]) {
      dq.textContent = text; dic.innerHTML = icon; dic.style.background = color; $('#d-yes').classList.remove('picked'); ask.classList.add('show'); cur.classList.add('show');
      await wait(800); if (!ok()) return; point($('#d-yes')); await wait(900); if (!ok()) return;
      cur.classList.add('press'); $('#d-yes').classList.add('picked'); await wait(280); if (!ok()) return; cur.classList.remove('press'); await wait(260); if (!ok()) return;
      ask.classList.remove('show'); await wait(420); if (!ok()) return; setAnswer(key, true); await wait(key === 'sauna' ? 400 : 1200); if (!ok()) return;
    }
    cur.classList.remove('show'); await wait(900); if (!ok()) return;
    Object.values(tg).forEach(b => { b.disabled = false; }); hint.classList.add('done');
  }
  tg.sauna.addEventListener('click', () => setAnswer('sauna', tg.sauna.getAttribute('aria-pressed') !== 'true'));
  tg.squat.addEventListener('click', () => setAnswer('squat', tg.squat.getAttribute('aria-pressed') !== 'true'));
  $('#demo-replay').addEventListener('click', demo);
  if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); demo(); } }), { threshold: .45 }).observe($('#cond-demo')); else demo();

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

  // ---------- live app link: a pulsing finger-tap where to press ----------
  (function () { const ring = $('#live-ring'); const t = (window.FRAMES && window.FRAMES.run && window.FRAMES.run[0].tap) || [.6, .85]; ring.style.left = (t[0] * 100) + '%'; ring.style.top = (t[1] * 100) + '%'; })();

  // ---------- button click sound: the same quiet, physical click as the app's Modern design ----------
  let clickCtx = null, clickNoise = null, soundOn = true;
  try { soundOn = localStorage.getItem('cp-sound') !== 'off'; } catch (e) {}
  function playClick() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      if (!clickCtx || clickCtx.state === 'closed') { clickCtx = new AC(); clickNoise = null; }
      const c = clickCtx; if (c.state !== 'running' && c.resume) { const p = c.resume(); if (p && p.catch) p.catch(() => {}); }
      if (!clickNoise) { clickNoise = c.createBuffer(1, Math.ceil(c.sampleRate * 0.08), c.sampleRate); const d = clickNoise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
      const t = c.currentTime + 0.003, master = c.createGain(); master.gain.value = 0.085; master.connect(c.destination); const nodes = [master];
      const snap = (at, freq, q, peak, len) => { const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = clickNoise; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
        g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + 0.0008); g.gain.exponentialRampToValueAtTime(0.0001, at + len); src.connect(bp); bp.connect(g); g.connect(master); src.start(at, 0, len + 0.01); nodes.push(src, bp, g); };
      snap(t, 2600, 1.4, 0.9, 0.012); snap(t + 0.052, 4000, 2, 0.28, 0.007);
      const osc = c.createOscillator(), og = c.createGain(); osc.type = 'sine'; osc.frequency.setValueAtTime(210, t); osc.frequency.exponentialRampToValueAtTime(95, t + 0.05);
      og.gain.setValueAtTime(0.0001, t); og.gain.exponentialRampToValueAtTime(0.55, t + 0.002); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.055); osc.connect(og); og.connect(master); osc.start(t); osc.stop(t + 0.07); nodes.push(osc, og);
      osc.onended = () => { nodes.forEach(n => { try { n.disconnect(); } catch (e) {} }); };
    } catch (e) {}
  }
  window.__playClick = playClick;
  const sbtn = $('#sound-toggle');
  function paintSound() { sbtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false'); sbtn.setAttribute('aria-label', 'Click sounds: ' + (soundOn ? 'on. Press to turn off.' : 'off. Press to turn on.')); sbtn.classList.toggle('off', !soundOn); }
  paintSound();
  sbtn.addEventListener('click', () => { soundOn = !soundOn; try { localStorage.setItem('cp-sound', soundOn ? 'on' : 'off'); } catch (e) {} paintSound(); if (soundOn) playClick(); });
  document.addEventListener('click', e => {
    const t = e.target && e.target.closest ? e.target.closest('button, a.btn, a.phone-link, [role="tab"], .fchip, .tab, .chip-b') : null;
    if (t && !t.disabled && t.id !== 'sound-toggle' && soundOn) playClick();
  }, true);

  // ---------- report a bug ----------
  const rep = $('#report'), rform = $('#report-form'), rstat = $('#r-status'); let rLast = null;
  function openReport() { rLast = document.activeElement; rep.hidden = false; document.body.classList.add('lock'); rstat.textContent = ''; rstat.className = 'r-status'; requestAnimationFrame(() => { rep.classList.add('open'); $('#r-msg').focus(); }); }
  function closeReport() { rep.classList.remove('open'); document.body.classList.remove('lock'); setTimeout(() => { rep.hidden = true; }, 300); if (rLast) rLast.focus(); }
  $('#open-report').addEventListener('click', openReport); $('#close-report').addEventListener('click', closeReport);
  rep.addEventListener('pointerdown', e => { if (e.target === rep) closeReport(); });
  addEventListener('keydown', e => { if (!rep.classList.contains('open')) return; if (e.key === 'Escape') closeReport();
    if (e.key === 'Tab') { const f = $$('button, input:not(.hp), textarea', rep).filter(x => !x.disabled); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } } });
  rform.addEventListener('submit', async e => {
    e.preventDefault(); const msg = $('#r-msg').value.trim(), email = $('#r-email').value.trim(), send = $('#r-send');
    const say = (t, bad) => { rstat.textContent = t; rstat.className = 'r-status ' + (bad ? 'bad' : 'good'); };
    if (msg.length < 5) { say('Please write a few words about it.', true); $('#r-msg').focus(); return; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { say('That email does not look right. Leave it empty if you prefer.', true); $('#r-email').focus(); return; }
    send.disabled = true; say('Sending…');
    try {
      const res = await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        kind: (rform.elements.kind.value || 'Bug'), message: msg, email, website: rform.elements.website.value,
        context: { page: location.href.split('#')[0], screen: innerWidth + 'x' + innerHeight, dpr: devicePixelRatio, lang: navigator.language, ua: navigator.userAgent } }) });
      if (res.ok) { say('Sent. Thank you!'); rform.reset(); setTimeout(closeReport, 1800); }
      else if (res.status === 429) say('That is a lot of reports for today. Please try again tomorrow.', true);
      else if (res.status === 503 || res.status === 404 || res.status === 405) say('The form is not connected yet. Please try again later.', true);
      else say('That did not send. Please try again in a moment.', true);
    } catch (err) { say('That did not send. Check your connection and try again.', true); }
    send.disabled = false;
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
