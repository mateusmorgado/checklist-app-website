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
    lines.slice(0, 2).forEach(l => { l.getAnimations().forEach(x => x.cancel()); l.classList.remove('parked', 'dropping', 'dropped'); l.removeAttribute('style'); }); hero.classList.remove('parked'); lines[2].classList.remove('squash');
  }
  // Three ways for the struck lines to land, and to fall when the page is scrolled. Each page load (and each Replay) takes the next one.
  // A line is placed by its centre (x, y) and angle r. Path points are offsets from the resting place, at a share o of the time.
  const deg = Math.PI / 180;
  const ext = (L, h, r) => ({ x: Math.abs(L / 2 * Math.cos(r * deg)) + Math.abs(h / 2 * Math.sin(r * deg)), y: Math.abs(L / 2 * Math.sin(r * deg)) + Math.abs(h / 2 * Math.cos(r * deg)) });
  const FALLS = [
    { name: 'props', shift: true, lines: [
      { r: -76, at: (e, W, H) => [10 + e.x, H - 20 - e.y], ms: 900, delay: 0, path: [{ o: .55, x: 40, y: -70, r: -118 }, { o: .8, x: -6, y: 6, r: -70 }], drop: { x: -.18, r: -170, delay: 0 } },
      { r: 98, at: (e, W, H) => [W - 10 - e.x, H * .4], ms: 1050, delay: 200, path: [{ o: .5, x: -90, y: -60, r: 190 }, { o: .8, x: 8, y: 0, r: 88 }], drop: { x: .3, r: 380, delay: 260 } } ] },
    { name: 'floor', shift: false, lines: [
      { r: -3, at: (e, W, H) => [24 + e.x, H - 10 - e.y], ms: 1300, delay: 0, path: [{ o: .35, x: 80, y: -260, r: -38, ease: 'ease-in' }, { o: .74, x: 0, y: 0, r: 5, ease: 'ease-out' }, { o: .86, x: 0, y: -18, r: -7, ease: 'ease-in' }], drop: { x: -.55, r: -55, delay: 120 } },
      { r: 7, at: (e, W, H) => [W - 24 - e.x, H - 14 - e.y], ms: 1450, delay: 160, path: [{ o: .38, x: -120, y: -380, r: 62, ease: 'ease-in' }, { o: .76, x: 0, y: 0, r: -4, ease: 'ease-out' }, { o: .88, x: 0, y: -24, r: 12, ease: 'ease-in' }], drop: { x: .5, r: 80, delay: 0 } } ] },
    { name: 'hang', shift: true, lines: [
      { r: -102, at: (e, W, H) => [10 + e.x, 100 + e.y], ms: 1500, delay: 0, path: [{ o: .35, x: 120, y: -30, r: -230 }, { o: .62, x: 0, y: 0, r: -84 }, { o: .8, x: 0, y: 0, r: -112 }, { o: .92, x: 0, y: 0, r: -98 }], drop: { x: 0, r: -190, delay: 0 } },
      { r: 4, at: (e, W, H) => [24 + e.x, H - 10 - e.y], ms: 1300, delay: 120, path: [{ o: .45, x: 420, y: -320, r: 170, ease: 'ease-in' }, { o: .8, x: 0, y: 0, r: -5, ease: 'ease-out' }, { o: .9, x: 0, y: -14, r: 7, ease: 'ease-in' }], drop: { x: -.6, r: -40, delay: 300 } } ] },
  ];
  let fallIdx = 0;
  const nextFall = () => { try { fallIdx = (parseInt(localStorage.getItem('cp-fall') || '-1', 10) + 1) % FALLS.length; localStorage.setItem('cp-fall', fallIdx); } catch (e) { fallIdx = (fallIdx + 1 + Math.floor(Math.random() * 2)) % FALLS.length; } };
  nextFall();
  function park() {
    const P = FALLS[fallIdx], PX = 28, hr = hero.getBoundingClientRect(), f = lines.slice(0, 2).map(l => ({ l, r: l.getBoundingClientRect() }));
    f.forEach(({ l, r }) => {
      const ph = document.createElement('div'); ph.className = 'line-ph'; ph.style.height = r.height + 'px'; ph.style.marginBottom = getComputedStyle(l).marginBottom; l.parentNode.insertBefore(ph, l);
      l.style.cssText = 'position:absolute;z-index:4;margin:0;left:' + (r.left - hr.left) + 'px;top:' + (r.top - hr.top) + 'px;white-space:nowrap;transform-origin:50% 50%;transition:none';
      lot.appendChild(l); parked.push({ l, ph });
    });
    if (P.shift) hero.classList.add('parked');
    const W = document.documentElement.clientWidth, H = Math.min(hero.offsetHeight, innerHeight);
    f.forEach(({ l }, i) => {
      const spec = P.lines[i], k = PX / parseFloat(getComputedStyle(l).fontSize), L = l.offsetWidth * k, h = l.offsetHeight * k;
      const start = { left: l.style.left, top: l.style.top, fontSize: getComputedStyle(l).fontSize, transform: 'rotate(0deg)' };
      const [cx, cy] = spec.at(ext(L, h, spec.r), W, H), place = (x, y, r) => ({ left: (cx + x - L / 2) + 'px', top: (cy + y - h / 2) + 'px', fontSize: PX + 'px', transform: 'rotate(' + r + 'deg)' });
      const end = place(0, 0, spec.r);
      l.classList.add('parked'); l.dataset.rot = spec.r; Object.assign(l.style, end);
      if (reduce) return;
      const frames = [Object.assign({ offset: 0, easing: 'ease-out' }, start)].concat(spec.path.map(p => Object.assign({ offset: p.o, easing: p.ease || 'ease-in-out' }, place(p.x, p.y, p.r))), [Object.assign({ offset: 1 }, end)]);
      l.animate(frames, { duration: spec.ms, delay: spec.delay, fill: 'backwards' });
    });
    parked.forEach(({ ph }) => { ph.style.height = '0px'; ph.style.marginBottom = '0px'; });
    if (reduce) return;
    // only a scroll down after the lines have landed lets them go
    let y0 = null;
    dropArm = () => { if (y0 == null || scrollY - y0 < 40) return; removeEventListener('scroll', dropArm); dropArm = null; drop(); };
    addEventListener('scroll', dropArm, { passive: true });
    setTimeout(() => { y0 = scrollY; }, 1500);
  }
  function drop() {
    // the lines move to a fixed layer, so they fall through the screen while the page scrolls
    const P = FALLS[fallIdx], fall = document.createElement('div'); fall.className = 'lines falling'; fall.setAttribute('aria-hidden', 'true'); document.body.appendChild(fall);
    const hr = hero.getBoundingClientRect(), away = innerHeight + 700;
    let left = parked.length;
    parked.forEach(({ l }, i) => {
      const d = P.lines[i].drop, r = +l.dataset.rot;
      l.style.left = (parseFloat(l.style.left) + hr.left) + 'px'; l.style.top = (parseFloat(l.style.top) + hr.top) + 'px';
      fall.appendChild(l); l.classList.add('dropping');
      const a = l.animate([{ transform: 'translate(0, 0) rotate(' + r + 'deg)' }, { offset: .1, transform: 'translate(0, -10px) rotate(' + (r + (d.r > r ? -3 : 3)) + 'deg)' }, { transform: 'translate(' + (d.x * away) + 'px, ' + away + 'px) rotate(' + d.r + 'deg)' }],
        { duration: 1500, delay: d.delay, easing: 'cubic-bezier(.45, 0, .9, .5)', fill: 'forwards' });
      a.onfinish = () => { l.classList.add('dropped'); if (--left === 0) { parked.forEach(p => { p.l.getAnimations().forEach(x => x.cancel()); lot.appendChild(p.l); }); fall.remove(); } };
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
  $('#replay').addEventListener('click', () => { nextFall(); intro(); });
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
  // the hero's Watch the video button scrolls down and starts the film with sound; the arrow only scrolls down
  const toVideo = () => box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  $('#watch-btn').addEventListener('click', e => { e.preventDefault(); toVideo(); startMain(); });
  $('#hero-down').addEventListener('click', e => { e.preventDefault(); toVideo(); });
  const atTop = () => document.body.classList.toggle('at-top', scrollY < 40);
  atTop(); addEventListener('scroll', atTop, { passive: true });
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
    addLi.filter(li => li.dataset.if === key).forEach((li, i) => { setTimeout(() => li.classList.toggle('in', yes), silent || reduce ? 0 : i * 170); });
    tg[key].setAttribute('aria-pressed', yes ? 'true' : 'false'); $('b', tg[key]).textContent = yes ? 'Yes' : 'No';
    setTimeout(() => { const n = 3 + addLi.filter(li => li.classList.contains('in')).length; count.textContent = n + ' items'; count.classList.remove('bump'); void count.offsetWidth; count.classList.add('bump'); }, silent || reduce ? 10 : 420);
  }
  function point(el, pressed) { const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect(); cur.style.left = (r.left - s.left + r.width * .62) + 'px'; cur.style.top = (r.top - s.top + r.height * .55) + 'px'; }
  // after the demo, a hand taps at the Sauna button to invite a No, and the two sauna items tremble; the first real tap ends it
  const demoCard = $('#cond-demo'), nudge = on => demoCard.classList.toggle('nudge', on);
  const dw = ms => wait(ms * .55); // the demo runs at this speed
  async function demo() {
    const run = ++demoRun, ok = () => run === demoRun; nudge(false);
    Object.values(tg).forEach(b => { b.disabled = true; b.setAttribute('aria-pressed', 'false'); $('b', b).textContent = 'No'; });
    addLi.forEach(li => li.classList.remove('in')); count.textContent = '3 items'; ask.classList.remove('show'); cur.classList.remove('show', 'press'); hint.classList.remove('done');
    if (reduce) { setAnswer('sauna', true, true); setAnswer('squat', true, true); Object.values(tg).forEach(b => { b.disabled = false; }); hint.classList.add('done'); nudge(true); return; }
    cur.style.left = '86%'; cur.style.top = '96%'; await dw(700); if (!ok()) return;
    for (const [key, text, icon, color] of [['sauna', 'Sauna?', ICON_SAUNA, 'var(--yellow)'], ['squat', 'Squat day?', ICON_BAR, 'var(--pink)']]) {
      dq.textContent = text; dic.innerHTML = icon; dic.style.background = color; $('#d-yes').classList.remove('picked'); ask.classList.add('show'); cur.classList.add('show');
      await dw(800); if (!ok()) return; point($('#d-yes')); await dw(900); if (!ok()) return;
      cur.classList.add('press'); $('#d-yes').classList.add('picked'); await dw(280); if (!ok()) return; cur.classList.remove('press'); await dw(260); if (!ok()) return;
      ask.classList.remove('show'); await dw(420); if (!ok()) return; setAnswer(key, true); await dw(key === 'sauna' ? 400 : 1200); if (!ok()) return;
    }
    cur.classList.remove('show'); await dw(900); if (!ok()) return;
    Object.values(tg).forEach(b => { b.disabled = false; }); hint.classList.add('done');
    await dw(600); if (ok() && tg.sauna.getAttribute('aria-pressed') === 'true') nudge(true);
  }
  tg.sauna.addEventListener('click', () => nudge(false));
  tg.squat.addEventListener('click', () => nudge(false));
  tg.sauna.addEventListener('click', () => setAnswer('sauna', tg.sauna.getAttribute('aria-pressed') !== 'true'));
  tg.squat.addEventListener('click', () => setAnswer('squat', tg.squat.getAttribute('aria-pressed') !== 'true'));
  $('#demo-replay').addEventListener('click', demo);
  if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); demo(); } }), { threshold: .45 }).observe($('#cond-demo')); else demo();

  // ---------- reference cards: placed by the reference, below it when there is room ----------
  $$('.cite-wrap').forEach(w => {
    const pop = $('.book-pop', w), btn = $('.cite', w);
    // beside the reference when there is room, so the card never sits on the text; otherwise below, then above
    const place = () => {
      const r = btn.getBoundingClientRect(), W = Math.min(440, innerWidth - 32); pop.style.width = W + 'px';
      const h = pop.offsetHeight, fitsY = y => y >= 8 && y + h <= innerHeight - 8, sideY = Math.max(8, Math.min(r.top - 12, innerHeight - h - 8));
      let mode, x, y;
      if (r.right + 18 + W <= innerWidth - 12) { mode = 'side'; x = r.right + 18; y = sideY; }
      else if (r.left - 18 - W >= 12) { mode = 'side-l'; x = r.left - 18 - W; y = sideY; }
      else { x = Math.max(16, Math.min(r.left - 12, innerWidth - W - 16)); mode = fitsY(r.bottom + 14) || !fitsY(r.top - 14 - h) ? 'below' : 'up'; y = mode === 'below' ? r.bottom + 14 : r.top - 14 - h; }
      pop.classList.remove('up', 'side', 'side-l'); if (mode !== 'below') pop.classList.add(mode);
      pop.style.setProperty('--px', x + 'px'); pop.style.setProperty('--py', y + 'px');
      pop.style.setProperty('--ax', Math.max(16, Math.min(W - 34, r.left + r.width / 2 - x - 9)) + 'px');
      pop.style.setProperty('--ay', Math.max(14, Math.min(h - 32, r.top + r.height / 2 - y - 9)) + 'px');
    };
    w.addEventListener('pointerenter', place); w.addEventListener('focusin', place); btn.addEventListener('click', place);
    // the whole card opens the search too, not only the chip
    if (btn.href) { pop.style.cursor = 'pointer'; pop.addEventListener('click', () => window.open(btn.href, '_blank', 'noopener')); }
    addEventListener('scroll', () => { if (w.matches(':hover, :focus-within, .open')) place(); }, { passive: true });
  });

  // ---------- once the hero's Open the app button scrolls away, it flies into an app icon in the corner;
  // at the bottom of the page the icon flies on into the big button next to "Check it. Run it. Done." ----------
  (function () {
    const cta = $('.hero .cta-row .btn.yellow'), fab = $('#fab-app'), foot = $('#foot-cta'); if (!cta || !fab) return;
    let heroGone = false, footIn = false, shown = false, ghost = null;
    const fabRect = () => { fab.style.transition = 'none'; fab.style.transform = 'none'; const b = fab.getBoundingClientRect(); fab.style.transform = ''; void fab.offsetWidth; fab.style.transition = ''; return b; };
    function fly(a, b, text, fromRad, toRad, done) {
      if (ghost) ghost.remove(); const g = ghost = document.createElement('div'); g.className = 'fab-ghost'; g.textContent = text; g.setAttribute('aria-hidden', 'true'); document.body.appendChild(g);
      const box = (r, rad, extra) => Object.assign({ left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: rad }, extra);
      const mid = { left: (a.left + b.left) / 2, top: Math.min(a.top, b.top) + Math.abs(b.top - a.top) * .45, width: (a.width + b.width) / 2, height: (a.height + b.height) / 2 };
      g.animate([box(a, fromRad, { color: text ? 'var(--ink)' : 'transparent', transform: 'rotate(0deg)' }), box(mid, '18px', { color: 'transparent', transform: 'rotate(-12deg)', offset: .5 }), box(b, toRad, { color: 'transparent', transform: 'rotate(0deg)' })],
        { duration: 650, easing: 'cubic-bezier(.6, 0, .3, 1)', fill: 'forwards' }).onfinish = () => { g.remove(); if (ghost === g) ghost = null; done(); };
    }
    function update() {
      const want = heroGone && !footIn;
      if (want && !shown) {
        shown = true;
        const hint = () => { if (shown) { fab.classList.add('show', 'hint'); setTimeout(() => fab.classList.remove('hint'), 2200); } };
        if (reduce) fab.classList.add('show'); else if (cta.getBoundingClientRect().bottom < 120) fly(cta.getBoundingClientRect(), fabRect(), cta.textContent, '14px', '18px', hint); else hint();
      } else if (!want && shown) {
        shown = false;
        if (footIn && foot && !reduce) { const a = fabRect(); fab.classList.remove('show', 'hint'); fly(a, foot.getBoundingClientRect(), '', '18px', '18px', () => { foot.classList.remove('wait'); foot.classList.remove('bump'); void foot.offsetWidth; foot.classList.add('bump'); }); }
        else { fab.classList.remove('show', 'hint'); if (ghost) { ghost.remove(); ghost = null; } }
      }
      if (footIn && foot && (!ghost || reduce)) foot.classList.remove('wait');
    }
    new IntersectionObserver(es => es.forEach(e => { heroGone = !e.isIntersecting && e.boundingClientRect.top < 0; update(); }), { threshold: 0, rootMargin: '-80px 0px 0px 0px' }).observe(cta);
    if (foot) new IntersectionObserver(es => es.forEach(e => { footIn = e.isIntersecting; update(); }), { threshold: .6 }).observe(foot);
  })();

  // ---------- install: the card for this device stands out ----------
  (function () {
    const ua = navigator.userAgent, os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : /Android/.test(ua) ? 'android' : /Windows/.test(ua) ? 'windows' : /Macintosh/.test(ua) ? 'mac' : '';
    const card = os && $('.inst[data-os="' + os + '"]'); if (card) { card.classList.add('mine'); card.insertAdjacentHTML('afterbegin', '<span class="inst-you">Your device</span>'); }
  })();

  // ---------- Impressum ----------
  (function () {
    const m = $('#imprint'); let last = null;
    const open = () => { last = document.activeElement; m.hidden = false; document.body.classList.add('lock'); requestAnimationFrame(() => { m.classList.add('open'); $('#close-imprint').focus(); }); };
    const close = () => { m.classList.remove('open'); document.body.classList.remove('lock'); setTimeout(() => { m.hidden = true; }, 300); if (last) last.focus(); };
    $('#open-imprint').addEventListener('click', open); $('#close-imprint').addEventListener('click', close);
    m.addEventListener('pointerdown', e => { if (e.target === m) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
  })();

  // ---------- why a checklist: a big WHY? turns into the answer, line by line ----------
  (function () {
    const st = $('#wq-stage'), ls = $$('.wq-l', st), cw = $('.cite-wrap', st), cite = $('#wq-cite'); let wr = 0;
    const sec = $('#why-q');
    // at the end everything but the last line folds away and the yellow band shrinks around it
    function focus(now) {
      ls.slice(0, -1).forEach(l => { l.style.height = l.offsetHeight + 'px'; });
      void st.offsetHeight; sec.classList.add('final'); st.classList.add('final');
      ls.slice(0, -1).forEach(l => { l.style.height = '0px'; });
      if (now) sec.classList.add('instant');
    }
    async function play() {
      const r = ++wr, ok = () => r === wr;
      sec.classList.remove('final', 'instant'); st.className = 'wq-stage'; ls.forEach(l => { l.classList.remove('in', 'fin'); l.style.height = ''; });
      if (reduce) { st.classList.add('s-lines', 'done'); ls.forEach(l => l.classList.add('in', 'fin')); focus(true); return; }
      await wait(200); if (!ok()) return; st.classList.add('s-why');
      await wait(1700); if (!ok()) return; st.classList.replace('s-why', 's-lines');
      for (const l of ls) { await wait(650); if (!ok()) return; l.classList.add('in'); setTimeout(() => l.classList.add('fin'), 1000); await wait(1250); if (!ok()) return; }
      await wait(1800); if (!ok()) return; focus();
      await wait(900); if (!ok()) return; st.classList.add('done');
    }
    $('#wq-replay').addEventListener('click', play);
    // tap opens the book card on touch screens; hover and focus open it everywhere
    cite.addEventListener('click', e => { e.stopPropagation(); const o = cw.classList.toggle('open'); cite.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    document.addEventListener('click', e => { if (!cw.contains(e.target)) { cw.classList.remove('open'); cite.setAttribute('aria-expanded', 'false'); } });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { cw.classList.remove('open'); cite.setAttribute('aria-expanded', 'false'); if (cw.contains(document.activeElement)) cite.blur(); } });
    if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); play(); } }), { threshold: .4 }).observe(st); else play();
  })();

  // ---------- pro powers: animated scenes in the phone, a pilot robot reads the chosen power back ----------
  const F = window.FRAMES;
  (function () {
    const stage = $('#pw-stage'), scr = $('#pw-screen'), tapEl = $('#pw-tap'), conf = $('#pw-conf'), pts = $$('.pw-pt'), scenes = {};
    $$('.scn', scr).forEach(s => { scenes[s.dataset.scene] = s; });
    const pilot = $('#pilot'), say = $('#pilot-say'), balloon = $('#balloon');
    const de = () => document.documentElement.lang === 'de';
    let cur = 0, run = 0, visible = false, sayRun = 0;
    const live = r => r === run;
    // musical notes fly out of the phone while the tone plays
    const notesEl = $('#pw-notes'), wrap = $('.pw-phonewrap', stage);
    const NOTE = ['<svg viewBox="0 0 24 24"><path d="M9 18a3.2 3.2 0 1 1-2-3V4.5l12-2.5v13a3.2 3.2 0 1 1-2-3V6.3L9 8z"/></svg>', '<svg viewBox="0 0 24 24"><path d="M11 18a3.4 3.4 0 1 1-2-3.1V2.5h2c.3 3.4 6 4.6 5.6 9.3-1.3-2.4-3.4-3.6-5.6-3.6z"/></svg>'];
    let noteT = 0;
    function notes(on) {
      clearInterval(noteT); if (!on || reduce) return;
      noteT = setInterval(() => {
        if (!visible) return; const left = Math.random() < .5, n = document.createElement('i'), sz = 48 + Math.random() * 34;
        n.className = 'note ' + ['', 'w', 'm'][Math.floor(Math.random() * 3)]; n.innerHTML = NOTE[Math.random() < .5 ? 0 : 1];
        n.style.cssText = 'width:' + sz + 'px;height:' + sz + 'px;top:' + (8 + Math.random() * 34) + '%;' + (left ? 'left' : 'right') + ':' + (4 + Math.random() * 10) + 'px;--dx:' + ((left ? -1 : 1) * (90 + Math.random() * 110)) + 'px;--dy:' + (-(30 + Math.random() * 140)) + 'px;--r:' + ((left ? -1 : 1) * (15 + Math.random() * 35)) + 'deg';
        notesEl.appendChild(n); setTimeout(() => n.remove(), 1900);
      }, 380);
    }
    // the phone buzzes and throws the co-pilot off; he lands and reads the power back again
    function buzz(r, again) {
      if (reduce) return; wrap.classList.remove('buzz'); void wrap.offsetWidth; wrap.classList.add('buzz'); setTimeout(() => wrap.classList.remove('buzz'), 800);
      setTimeout(() => { if (!live(r)) return; gesture('thrown'); speak(de() ? 'Hoppla!' : 'Whoa!'); }, 120);
      if (again) setTimeout(() => { if (live(r)) speak(again); }, 1500);
    }
    const SP = .62; // the whole loop runs at this speed
    const nap = (ms, r) => new Promise((res, rej) => setTimeout(() => (live(r) ? res() : rej(0)), reduce ? 0 : ms * SP));

    function tapOn(el, fx = .5, fy = .5) {
      const s = scr.getBoundingClientRect(), b = el.getBoundingClientRect();
      tapEl.style.left = ((b.left + b.width * fx - s.left) / s.width * 100) + '%'; tapEl.style.top = ((b.top + b.height * fy - s.top) / s.height * 100) + '%';
      tapEl.classList.remove('go'); void tapEl.offsetWidth; tapEl.classList.add('go');
    }
    function confetti() {
      if (reduce) return; conf.innerHTML = ''; const C = [cv('--yellow'), cv('--mint'), '#fff', cv('--pink'), cv('--blue')];
      for (let i = 0; i < 22; i++) { const p = document.createElement('i'); p.style.cssText = 'left:' + (Math.random() * 96) + '%;background:' + C[i % C.length] + ';animation-delay:' + (Math.random() * .35) + 's;border-radius:' + (i % 3 ? '1px' : '50%'); conf.appendChild(p); }
      setTimeout(() => { conf.innerHTML = ''; }, 2400);
    }

    // the robot
    async function speak(text) {
      const me = ++sayRun; balloon.classList.remove('pop'); void balloon.offsetWidth; balloon.classList.add('pop');
      if (reduce) { say.textContent = text; return; }
      pilot.classList.add('talk'); say.textContent = '';
      for (let i = 1; i <= text.length; i++) { if (me !== sayRun) return; say.textContent = text.slice(0, i); await wait(text[i - 1] === ' ' ? 22 : 34); }
      if (me === sayRun) pilot.classList.remove('talk');
    }
    function gesture(c) { if (reduce) return; pilot.classList.remove(c); void pilot.offsetWidth; pilot.classList.add(c); setTimeout(() => pilot.classList.remove(c), 1600); }
    (function blink() { setTimeout(() => { if (!reduce) { pilot.classList.add('blink'); setTimeout(() => pilot.classList.remove('blink'), 140); } blink(); }, 2200 + Math.random() * 2800); })();
    if (!reduce && matchMedia('(pointer: fine)').matches) {
      const glints = $$('.b-glints circle', pilot);
      addEventListener('pointermove', e => { if (!visible) return; const r = pilot.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height * .34), d = Math.hypot(dx, dy) || 1; glints.forEach(g => { g.style.transform = 'translate(' + (dx / d * 3.5) + 'px,' + (dy / d * 3.5) + 'px)'; }); });
    }
    const QUIPS = { en: ['Roger that!', 'Cleared for takeoff!', 'All checks complete!', 'Seatbelts on!'], de: ['Roger!', 'Startfreigabe erteilt!', 'Alle Checks erledigt!', 'Anschnallen, bitte!'] };
    let quip = 0;
    pilot.addEventListener('click', () => { gesture('wave'); const q = QUIPS[de() ? 'de' : 'en']; speak(q[quip++ % q.length]); });

    // scenes
    const SCENES = {
      async tone(r, s) {
        const items = $$('.a-items li', s), bar = $('.a-bar', s), count = $('.a-count', s);
        items.forEach(li => li.classList.remove('on')); bar.style.width = '0'; count.textContent = '0 / 4'; s.classList.remove('done');
        if (reduce) { items.forEach(li => li.classList.add('on')); bar.style.width = '100%'; count.textContent = '4 / 4'; s.classList.add('done'); return; }
        stage.classList.add('tone-on'); notes(true);
        const name = $('.pw-pt[data-scene="tone"] .pw-name').textContent.trim() + '. Check!';
        await nap(1300, r); buzz(r, name); await nap(1700, r);
        for (let k = 0; k < items.length; k++) {
          tapOn($('.a-box', items[k])); await nap(320, r);
          items[k].classList.add('on'); bar.style.width = ((k + 1) / items.length * 100) + '%'; count.textContent = (k + 1) + ' / ' + items.length;
          await nap(1250, r);
          if (k === 1) { buzz(r, name); await nap(1500, r); }
        }
        s.classList.add('done'); stage.classList.remove('tone-on'); notes(false); confetti();
        await nap(2600, r);
      },
      async res(r, s) {
        const cards = $$('.r-card', s), src = $('.r-src', s), num = $('.r-num', s);
        cards.forEach(c => c.classList.remove('in')); src.classList.remove('in'); num.textContent = '0';
        if (reduce) { cards.forEach(c => c.classList.add('in')); src.classList.add('in'); num.textContent = '66'; return; }
        await nap(500, r); cards[0].classList.add('in');
        await nap(1700, r); cards[1].classList.add('in');
        const t0 = performance.now(); await new Promise(res => { (function step(t) { const p = Math.min(1, (t - t0) / 700); num.textContent = Math.round(66 * (1 - Math.pow(1 - p, 3))); if (p < 1 && live(r)) requestAnimationFrame(step); else res(); })(t0); });
        await nap(900, r); cards[2].classList.add('in');
        await nap(1700, r); src.classList.add('in');
        await nap(2600, r);
      },
      async ai(r, s) {
        const typed = $('.ai-typed', s), time = $('.ai-time', s), items = $$('.ai-list .a-items li', s);
        const words = de() ? 'Milch, Eier, Brot … ein paar Äpfel und Kaffee.' : 'Milk, eggs, bread… some apples and coffee.';
        s.dataset.step = 'home'; s.classList.remove('listening'); typed.textContent = ''; time.textContent = '0:17'; items.forEach(li => li.classList.remove('in'));
        if (reduce) { s.dataset.step = 'list'; items.forEach(li => li.classList.add('in')); return; }
        await nap(1100, r); tapOn($('.ai-bolt', s)); await nap(420, r);
        s.dataset.step = 'rec'; await nap(500, r); s.classList.add('listening');
        let sec = 17; const tick = setInterval(() => { if (!live(r) || sec <= 12) return clearInterval(tick); sec--; time.textContent = '0:' + String(sec).padStart(2, '0'); }, 900);
        for (let i = 1; i <= words.length; i++) { await nap(words[i - 1] === ' ' ? 40 : 72, r); typed.textContent = words.slice(0, i); }
        await nap(600, r); clearInterval(tick); tapOn($('.ai-stop', s)); await nap(380, r);
        s.classList.remove('listening'); s.dataset.step = 'think'; await nap(1500, r);
        s.dataset.step = 'list'; await nap(350, r);
        for (const li of items) { li.classList.add('in'); await nap(200, r); }
        await nap(800, r); tapOn($('.ai-save', s)); await nap(300, r); confetti();
        await nap(2200, r);
      },
    };

    // the bar under the chosen power runs for about as long as its scene
    const DUR = { tone: 8600, res: 6000, ai: 8200 };
    async function select(i) {
      cur = i; const r = ++run, b = pts[i], key = b.dataset.scene, s = scenes[key];
      pts.forEach((p, k) => { p.setAttribute('aria-pressed', k === i ? 'true' : 'false'); p.classList.remove('run'); });
      b.style.setProperty('--dur', DUR[key] + 'ms'); void b.offsetWidth; if (!reduce) b.classList.add('run');
      Object.values(scenes).forEach(x => x.classList.toggle('on', x === s)); stage.classList.remove('tone-on'); notes(false); tapEl.classList.remove('go');
      gesture('salute'); speak($('.pw-name', b).textContent.trim() + '. Check!');
      try { await SCENES[key](r, s); } catch (e) { return; }
      if (live(r) && visible && !reduce) select((cur + 1) % pts.length);
    }
    pts.forEach((b, i) => b.addEventListener('click', () => select(i)));
    // start when the stage comes into view, pause when it leaves
    const onView = v => { visible = v; if (v) select(cur); else { run++; notes(false); pts.forEach(p => p.classList.remove('run')); stage.classList.remove('tone-on'); } };
    if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting !== visible) onView(e.isIntersecting); }), { threshold: .35 }).observe(stage); else onView(true);
  })();

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
