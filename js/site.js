(function () {
  // jump (not glide) to the top on load
  if (location.hash !== '#journey') { const h = document.documentElement, sb = h.style.scrollBehavior; h.style.scrollBehavior = 'auto'; scrollTo(0, 0); h.style.scrollBehavior = sb; }
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
    for (let i = 0; i < 30; i++) { const p = document.createElement('i'); const w = 8 + Math.random() * 10; p.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + w + 'px;height:' + (w * 1.4) + 'px;background:' + COLORS[i % COLORS.length] + ';border-radius:' + (i % 3 === 0 ? '50%' : '3px') + ';animation-delay:' + (Math.random() * .7) + 's;animation-duration:' + (1.8 + Math.random() * 1.4) + 's'; confetti.appendChild(p); }
    setTimeout(() => { confetti.innerHTML = ''; }, 4200);
  }
  let introRun = 0;
  // The two struck lines are shoved to the left edge by the big line and wait there. They fall like gravity when the page is scrolled.
  const hero = $('.hero'), canPark = () => innerWidth >= 900 && innerWidth > innerHeight;
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
    lines.slice(0, 2).forEach(l => l.classList.remove('hit'));
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
  // after the headline lands: the header slides in, then the line under it is typed out, then the rest follows in order
  async function typeSub(ok) {
    const b = document.body, src = $('.hero .sub-src'), out = $('.hero .sub-type');
    $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.add('in'));
    b.classList.add('typing'); b.classList.remove('intro');
    const txt = src.textContent; out.textContent = '';
    await wait(450);
    for (let k = 1; k <= txt.length; k++) { if (!ok()) { b.classList.remove('typing'); return; } out.textContent = txt.slice(0, k); await wait(txt[k - 1] === ' ' ? 8 : 16); }
    await wait(150); if (!ok()) return; b.classList.add('caret-hold'); b.classList.remove('typing');
    setTimeout(() => { b.classList.remove('caret-hold'); out.textContent = ''; }, 2000); // the cursor keeps blinking for two seconds
    // the header comes last, dropping in from the top once the rest is in place
    await wait(900); b.classList.remove('intro-first');
  }
  // on small screens the headline plays in the middle of the screen, then rises to its place
  const lineBox = $('.lines'); let lift = 0;
  function centerLines(instant) {
    if (canPark() || reduce || scrollY > 40) { lift = 0; lineBox.style.transform = ''; return; }
    if (instant) lineBox.style.transition = 'none';
    const r = lineBox.getBoundingClientRect(), top = r.top - lift;
    lift = Math.max(0, innerHeight / 2 - (top + r.height / 2)); lineBox.style.transform = 'translateY(' + lift + 'px)';
    if (instant) { void lineBox.offsetWidth; lineBox.style.transition = ''; }
  }
  function liftLines() { lift = 0; lineBox.style.transform = ''; }
  async function intro() {
    const run = ++introRun; const ok = () => run === introRun;
    // the text, buttons, arrow and colour chips wait until the headline has landed
    document.body.classList.remove('typing', 'caret-hold'); document.body.classList.add('intro'); document.documentElement.classList.remove('booting'); if (run === 1) document.body.classList.add('intro-first');
    unpark(); lines.forEach(l => { l.classList.remove('show', 'struck', 'fell', 'gone', 'hit', 'broke'); l.style.height = ''; }); $$('.hero .sub, .hero .cta-row').forEach(e => e.classList.remove('in'));
    if (reduce) { lines.forEach(l => l.classList.add('show', 'struck')); lines[2].classList.remove('struck'); if (canPark()) park(); else lines.slice(0, 2).forEach(l => l.classList.add('gone')); ($$('.hero .sub, .hero .cta-row').forEach(e => e.classList.add('in')), document.body.classList.remove('intro', 'intro-first')); return; }
    centerLines(true);
    await wait(300); if (!ok()) return; lines[0].classList.add('show');
    await wait(900); if (!ok()) return; lines[0].classList.add('struck');
    await wait(650); if (!ok()) return; lines[1].classList.add('show');
    // the second line flies up into the first: both knock and stay tilted, each its own way
    await wait(230); if (!ok()) return; lines.slice(0, 2).forEach(l => l.classList.add('hit')); hero.classList.remove('shake'); void hero.offsetWidth; hero.classList.add('shake');
    await wait(900); if (!ok()) return; lines[1].classList.add('struck');
    await wait(750); if (!ok()) return; lines[2].classList.add('show'); burst();
    await wait(240); if (!ok()) return;
    // the big line hits the struck ones: it squashes on impact and springs back while they are shoved aside
    // the impact knocks the big line apart for a moment: "Checklist prompt" tips over, "app" lands almost upright, then both snap back
    lines[2].classList.remove('broke'); void lines[2].offsetWidth; lines[2].classList.add('broke'); setTimeout(() => lines[2].classList.remove('broke'), 1300);
    if (!canPark()) lines.slice(0, 2).forEach(l => l.classList.remove('hit'));
    if (canPark()) { lines[2].classList.add('squash'); lines[2].addEventListener('animationend', () => lines[2].classList.remove('squash'), { once: true }); park(); } else { lines.slice(0, 2).forEach(l => { l.style.height = l.offsetHeight + 'px'; void l.offsetHeight; l.classList.add('fell'); }); await wait(450); if (!ok()) return; lines.slice(0, 2).forEach(l => l.classList.add('gone')); }
    await wait(500); if (!ok()) return; centerLines();
    await wait(700); if (!ok()) return; if (lift) { liftLines(); await wait(750); if (!ok()) return; } typeSub(ok);
  }
  $('#replay').addEventListener('click', () => { nextFall(); intro(); });
  intro();

  // mouse parallax for the stickers and the hero phone
  const stk = $$('.stk'), depth = [14, 22, 10, 18, 26, 12];
  const drift = (x, y) => stk.forEach((s, i) => { s.style.transform = 'translate(' + (x * depth[i % 6] * -2) + 'px,' + (y * depth[i % 6] * -2) + 'px)'; });
  if (!reduce && matchMedia('(pointer: fine)').matches) addEventListener('pointermove', e => drift(e.clientX / innerWidth - .5, e.clientY / innerHeight - .5));
  // on phones the stickers follow the tilt of the phone instead (iPhone asks for permission on the first tap)
  if (!reduce && !matchMedia('(pointer: fine)').matches && 'DeviceOrientationEvent' in window) {
    let base = null, raf = 0, gx = 0, gy = 0;
    const onTilt = e => {
      if (e.beta == null || e.gamma == null) return; if (base == null) base = e.beta;
      gx = Math.max(-1, Math.min(1, e.gamma / 30)) * .8; gy = Math.max(-1, Math.min(1, (e.beta - base) / 30)) * .8;
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; drift(gx, gy); });
    };
    const listen = () => addEventListener('deviceorientation', onTilt);
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      const ask = () => { removeEventListener('pointerdown', ask); DeviceOrientationEvent.requestPermission().then(r => { if (r === 'granted') listen(); }).catch(() => {}); };
      addEventListener('pointerdown', ask);
    } else listen();
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
    // the chosen chip sits on top of the stack; the others pile up behind it in order
    const stack = p => { let r = 1; btns.forEach((b, k) => { b.style.setProperty('--k', k); b.style.setProperty('--i', b.dataset.p === p ? 0 : r++); }); };
    const paint = p => { stack(p); root.setAttribute('data-palette', p); setIcon(); btns.forEach(b => b.setAttribute('aria-pressed', b.dataset.p === p ? 'true' : 'false')); if (meta) meta.setAttribute('content', getComputedStyle(root).getPropertyValue('--red').trim()); };
    paint(root.getAttribute('data-palette') || 'red');
    $('#to-top').addEventListener('click', () => { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    // on phones the dots sit in a little pile; the first tap fans them out, the next one picks a colour
    const sw = $('#sw-set'), hover = matchMedia('(hover: hover) and (pointer: fine)'); let fold = 0;
    // open as a row at the top of the page, folds into the stack once "Lists that ask first" comes up
    const ideas = $('#ideas'), early = () => sw.classList.toggle('early', !ideas || ideas.getBoundingClientRect().top > innerHeight * .7);
    early(); addEventListener('scroll', early, { passive: true }); addEventListener('resize', early);
    const isOpen = () => sw.classList.contains('early') || sw.classList.contains('open') || (hover.matches && sw.matches(':hover'));
    btns.forEach(b => b.addEventListener('click', () => {
      if (!isOpen()) { sw.classList.add('open'); clearTimeout(fold); fold = setTimeout(() => sw.classList.remove('open'), 5000); return; }
      paint(b.dataset.p); try { localStorage.setItem('cp-palette', b.dataset.p); } catch (e) {}
      clearTimeout(fold); fold = setTimeout(() => sw.classList.remove('open'), 900);
    }));
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
      if (w.dataset.pop === 'below') { x = Math.max(16, Math.min(r.left - 12, innerWidth - W - 16)); mode = 'below'; y = r.bottom + 14; }
      else if (r.right + 18 + W <= innerWidth - 12) { mode = 'side'; x = r.right + 18; y = sideY; }
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

  // ---------- install: the cards collapse into a pile, get shuffled as if searching, and land on this device's card ----------
  (function () {
    const ua = navigator.userAgent, os = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? 'ios' : /Android/.test(ua) ? 'android' : /Windows/.test(ua) ? 'windows' : /Macintosh/.test(ua) ? 'mac' : '';
    const grid = $('.inst-grid'), cards = $$('.inst', grid), mine = os && $('.inst[data-os="' + os + '"]');
    if (mine) mine.insertAdjacentHTML('afterbegin', '<span class="inst-you">Your device</span>');
    if (!grid || reduce || !mine) { if (mine) mine.classList.add('mine'); return; }
    let done = false;
    async function search() {
      if (done) return; done = true;
      const g = grid.getBoundingClientRect(), cx = g.left + g.width / 2, cy = g.top + Math.min(g.height, 260) / 2;
      const off = cards.map(c => { const r = c.getBoundingClientRect(); return [cx - (r.left + r.width / 2), cy - (r.top + r.height / 2)]; });
      grid.classList.add('piling');
      cards.forEach((c, i) => { c.style.transform = 'translate(' + off[i][0] + 'px,' + off[i][1] + 'px) rotate(' + ((i % 2 ? 1 : -1) * (3 + i * 2)) + 'deg)'; c.style.zIndex = i + 1; });
      await wait(700);
      // flip through the pile, fast then slower
      const order = []; for (let k = 0; k < 9; k++) order.push(cards[k % cards.length]); order.push(mine);
      let z = 20;
      for (let k = 0; k < order.length; k++) {
        const c = order[k], i = cards.indexOf(c);
        c.style.zIndex = ++z; c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip');
        c.style.transform = 'translate(' + off[i][0] + 'px,' + off[i][1] + 'px) rotate(' + ((k % 2 ? 1 : -1) * 4) + 'deg)';
        await wait(110 + k * k * 9);
      }
      // bam
      mine.classList.add('mine', 'bam'); mine.style.transform = 'translate(' + off[cards.indexOf(mine)][0] + 'px,' + off[cards.indexOf(mine)][1] + 'px) scale(1.12) rotate(-2deg)';
      await wait(1300);
      grid.classList.remove('piling'); grid.classList.add('fanning');
      cards.forEach(c => { c.style.transform = ''; c.classList.remove('flip'); });
      setTimeout(() => { grid.classList.remove('fanning'); mine.classList.remove('bam'); cards.forEach(c => { c.style.zIndex = ''; }); }, 900);
    }
    new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); search(); } }), { rootMargin: '-25% 0px -25% 0px' }).observe(grid);
  })();

  // ---------- the game: loaded into its window only when someone presses Play ----------
  (function () {
    const m = $('#game-modal'), f = $('#game-frame'); let last = null;
    const open = () => { last = document.activeElement; if (!f.src) f.src = 'game/index.html'; m.hidden = false; document.body.classList.add('lock'); setTimeout(() => f.focus(), 300); };
    const close = () => { m.hidden = true; document.body.classList.remove('lock'); f.src = ''; f.removeAttribute('src'); if (last) last.focus(); };
    $('#open-game').addEventListener('click', open); $('#close-game').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
  })();

  // ---------- small screens: the header folds into a menu ----------
  (function () {
    const nav = $('.nav'), btn = $('#menu-btn'), panel = $('#nav-panel');
    const set = o => { nav.classList.toggle('open', o); panel.hidden = !o; btn.setAttribute('aria-expanded', o ? 'true' : 'false'); };
    btn.addEventListener('click', e => { e.stopPropagation(); set(panel.hidden); });
    panel.addEventListener('click', e => { if (e.target.closest('a, button')) set(false); });
    $('#np-journey').addEventListener('click', () => $('#open-journey').click());
    document.addEventListener('click', e => { if (!panel.hidden && !panel.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) { set(false); btn.focus(); } });
  })();

  // ---------- quick taps still show the button going down into its shadow ----------
  (function () {
    const SEL = '.pw-arrow, .btn, .tab, .chip-b, .fchip, .pw-tab, .d-toggles button, .tone-btn, .cite, .foot-cta, .fab-app, .to-top';
    addEventListener('pointerdown', e => {
      const b = e.target.closest(SEL); if (!b || b.disabled) return; const t0 = performance.now(); b.classList.add('pressed');
      const up = () => { removeEventListener('pointerup', up); removeEventListener('pointercancel', up); setTimeout(() => b.classList.remove('pressed'), Math.max(0, 110 - (performance.now() - t0))); };
      addEventListener('pointerup', up); addEventListener('pointercancel', up);
    }, { passive: true });
  })();

  // ---------- past the video the header folds into just the menu button, top right ----------
  (function () {
    const vid = $('#video');
    const check = () => document.body.classList.toggle('compact', !!vid && vid.getBoundingClientRect().bottom < 0);
    check(); addEventListener('scroll', check, { passive: true }); addEventListener('resize', check);
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

  // ---------- grey band: slides in from the left, then the words are typed; the cursor keeps blinking until WHY? starts ----------
  (function () {
    const band = $('.focus-band'), inner = band && $('.focus-in', band); if (!inner) return;
    let clone = null, caret = null, started = false;
    function finish() { if (clone) { clone.remove(); clone = null; } inner.style.visibility = ''; }
    async function type() {
      if (started) return; started = true;
      if (reduce) { inner.classList.remove('fb-wait'); return; }
      clone = inner.cloneNode(true); clone.classList.add('fb-type'); clone.setAttribute('aria-hidden', 'true'); clone.setAttribute('data-no-i18n', '');
      const tw = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT), nodes = []; let n;
      while ((n = tw.nextNode())) if (n.nodeValue.trim()) nodes.push([n, n.nodeValue]);
      nodes.forEach(([node]) => { node.nodeValue = ''; });
      caret = document.createElement('i'); caret.className = 'fb-caret'; nodes[0][0].parentNode.insertBefore(caret, nodes[0][0].nextSibling);
      inner.style.visibility = 'hidden'; inner.classList.remove('fb-wait'); inner.parentNode.appendChild(clone);
      void clone.offsetWidth; clone.classList.remove('fb-wait'); await wait(600);
      for (const [node, full] of nodes) {
        node.parentNode.insertBefore(caret, node.nextSibling);
        for (let k = 1; k <= full.length; k++) { if (!clone) return; node.nodeValue = full.slice(0, k); await wait(full[k - 1] === ' ' ? 6 : 13); }
      }
    }
    document.addEventListener('wq-start', finish);
    if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); type(); } }), { rootMargin: '-30% 0px -30% 0px' }).observe(band);
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
      const r = ++wr, ok = () => r === wr; document.dispatchEvent(new Event('wq-start'));
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
    if ('IntersectionObserver' in window) new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) { o.disconnect(); play(); } }), { rootMargin: '-42% 0px -42% 0px' }).observe(st); else play(); // starts only when the yellow band reaches the middle of the screen
  })();

  // ---------- pro powers: animated scenes in the phone, a pilot robot reads the chosen power back ----------
  const F = window.FRAMES;
  (function () {
    const stage = $('#pw-stage'), scr = $('#pw-screen'), tapEl = $('#pw-tap'), conf = $('#pw-conf'), tabs = $$('.pw-tab'), cards = $$('.pw-card'), deck = $('#pw-deck'), scenes = {};
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
      async safe(r, s) {
        const arena = $('#safe-arena', s); arena.innerHTML = ''; s.classList.remove('locked', 'stamped');
        if (reduce) { s.classList.add('locked', 'stamped'); return; }
        await nap(1300, r);
        // the co-pilot jumps into the phone
        const bot = $('.bot', pilot), pr = bot.getBoundingClientRect(), sr = scr.getBoundingClientRect();
        pilot.style.setProperty('--dx', (sr.left + sr.width / 2 - (pr.left + pr.width / 2)) + 'px'); pilot.style.setProperty('--dy', (sr.top + sr.height * .35 - (pr.top + pr.height / 2)) + 'px');
        pilot.classList.remove('home'); pilot.classList.add('dive');
        await nap(1500, r);
        const mini = document.createElement('div'); mini.className = 'mini-bot'; mini.appendChild(bot.cloneNode(true)); arena.appendChild(mini);
        const W = sr.width, H = sr.height, bw = W * .34, bh = bw * 1.25, at = (x, y, rot) => ({ transform: 'translate(' + x + 'px,' + y + 'px) rotate(' + (rot || 0) + 'deg)' });
        const bonk = (x, y, txt) => { const b = document.createElement('span'); b.className = 'bonk'; b.textContent = txt; b.style.left = x + 'px'; b.style.top = y + 'px'; arena.appendChild(b); scr.classList.remove('glass-hit'); void scr.offsetWidth; scr.classList.add('glass-hit'); setTimeout(() => b.remove(), 800); };
        const hop = (frames, ms) => mini.animate(frames, { duration: ms * SP, easing: 'cubic-bezier(.35, 0, .4, 1)', fill: 'forwards' }).finished;
        await hop([at(0, -bh), at(0, H * .42, 0), at(0, H * .36), at(0, H * .42)], 900); if (!live(r)) return;
        speak(de() ? 'Hey! Wo bin ich?' : 'Hey! Where am I?');
        await hop([at(0, H * .42), at(0, -6, -8)], 520); if (!live(r)) return; bonk(W * .32, 4, 'BONK!');
        await hop([at(0, -6, -8), at(0, H * .42, 0)], 520); if (!live(r)) return;
        await hop([at(0, H * .42), at(-W * .5 + bw * .5 - 4, H * .3, -20)], 480); if (!live(r)) return; bonk(4, H * .3, 'BONK!');
        await hop([at(-W * .5 + bw * .5, H * .3, -20), at(W * .5 - bw * .5 + 4, H * .32, 20)], 640); if (!live(r)) return; bonk(W - W * .3, H * .32, 'BONK!');
        speak(de() ? 'Ich komme nicht raus!' : 'I can’t get out!');
        await hop([at(W * .5 - bw * .5, H * .32, 20), at(0, H * .42, 0)], 620); if (!live(r)) return;
        s.classList.add('locked'); await nap(400, r); s.classList.add('stamped');
        speak(de() ? 'Deine Listen auch nicht. Sicher!' : 'Neither can your lists. Safe!');
        await nap(3200, r);
      },
    };
    // a tone button plays a short sample of that attention tone
    let actx = null, stopTone = null;
    function playTone(kind, btn) {
      if (stopTone) { const same = btn.classList.contains('playing'); stopTone(); if (same) return; }
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
      const t0 = actx.currentTime + .02, out = actx.createGain(); out.gain.value = .09; out.connect(actx.destination);
      const tone = (f, at, len, type, vol) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, at); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(vol || 1, at + .008); g.gain.exponentialRampToValueAtTime(.001, at + len); o.connect(g); g.connect(out); o.start(at); o.stop(at + len + .05); return o; };
      let len = 2.6;
      if (kind === 'heart') for (let i = 0; i < 4; i++) tone(980, t0 + i * .82, .14, 'sine', .9);
      if (kind === 'sonar') for (let i = 0; i < 2; i++) { const o = tone(1240, t0 + i * 1.3, 1.2, 'sine', .8); o.frequency.exponentialRampToValueAtTime(1150, t0 + i * 1.3 + 1.2); tone(1240, t0 + i * 1.3 + .38, .9, 'sine', .25); }
      if (kind === 'metro') for (let i = 0; i < 6; i++) tone(i % 3 ? 1500 : 2100, t0 + i * .45, .05, 'square', .5);
      if (kind === 'alarm') for (let i = 0; i < 6; i++) tone(i % 2 ? 660 : 880, t0 + i * .32, .28, 'square', .35);
      if (kind === 'cabin') {
        const n = actx.createBufferSource(), buf = actx.createBuffer(1, actx.sampleRate * 3, actx.sampleRate), d = buf.getChannelData(0); let last = 0;
        for (let i = 0; i < d.length; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
        const f = actx.createBiquadFilter(), g = actx.createGain(); f.type = 'lowpass'; f.frequency.value = 420; n.buffer = buf; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(1, t0 + .4); g.gain.setValueAtTime(1, t0 + 2.2); g.gain.linearRampToValueAtTime(0, t0 + 2.6);
        n.connect(f); f.connect(g); g.connect(out); n.start(t0); n.stop(t0 + 2.7); tone(118, t0, 2.6, 'sine', .25);
      }
      btn.classList.add('playing');
      const timer = setTimeout(() => stopTone && stopTone(), len * 1000);
      stopTone = () => { clearTimeout(timer); out.gain.setTargetAtTime(0, actx.currentTime, .03); setTimeout(() => out.disconnect(), 200); btn.classList.remove('playing'); stopTone = null; };
    }
    $$('.tone-btn').forEach(b => b.addEventListener('click', () => playTone(b.dataset.tone, b)));

    // the cards sit in a deck: the chosen one on top, the next ones peeking out behind it
    const DUR = { tone: 8600, res: 6000, ai: 8200, safe: 9800 };
    const n = cards.length;
    function layDeck(i, from) {
      cards.forEach((c, k) => { const d = (k - i + n) % n; c.dataset.k = Math.min(d, 3); const on = d === 0; c.inert = !on; c.setAttribute('aria-hidden', on ? 'false' : 'true'); c.classList.remove('run'); });
      if (from != null && from !== i && !reduce) { const old = cards[from]; old.classList.add('leaving'); setTimeout(() => { old.classList.add('back-in'); old.classList.remove('leaving'); void old.offsetWidth; old.classList.remove('back-in'); }, 520); }
    }
    // every card takes the height of the tallest, so the deck edges line up
    function fitDeck() { cards.forEach(c => { c.style.bottom = 'auto'; }); const h = Math.max(...cards.map(c => c.offsetHeight)); cards.forEach(c => { c.style.bottom = ''; }); deck.style.height = h + 'px'; }
    // each card says which one comes next
    cards.forEach((c, k) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'pw-next'; b.addEventListener('click', () => select((k + 1) % cards.length)); c.appendChild(b); });
    const nameNext = () => cards.forEach((c, k) => { $('.pw-next', c).textContent = (de() ? 'Weiter: ' : 'Next: ') + $('.pw-name', cards[(k + 1) % cards.length]).textContent.trim() + ' ›'; });
    async function select(i) {
      const from = cur; cur = i; const r = ++run, key = cards[i].dataset.scene, s = scenes[key];
      tabs.forEach((t, k) => t.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
      layDeck(i, from); nameNext(); const c = cards[i]; c.style.setProperty('--dur', DUR[key] + 'ms'); void c.offsetWidth; if (!reduce) c.classList.add('run');
      Object.values(scenes).forEach(x => x.classList.toggle('on', x === s)); stage.classList.remove('tone-on'); notes(false); tapEl.classList.remove('go');
      if (pilot.classList.contains('dive')) { pilot.classList.remove('dive'); pilot.classList.add('home'); setTimeout(() => pilot.classList.remove('home'), 700); }
      gesture('salute'); speak($('.pw-name', c).textContent.trim() + '. Check!');
      try { await SCENES[key](r, s); } catch (e) { return; }
      if (live(r) && visible && !reduce) select((cur + 1) % n);
    }
    tabs.forEach((b, i) => b.addEventListener('click', () => select(i)));
    $('#pw-prev').addEventListener('click', () => select((cur + n - 1) % n)); $('#pw-next').addEventListener('click', () => select((cur + 1) % n));
    // swipe the deck left or right
    let sx = null;
    deck.addEventListener('pointerdown', e => { if (e.target.closest('button, a')) return; sx = e.clientX; });
    deck.addEventListener('pointerup', e => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) select((cur + (dx < 0 ? 1 : n - 1)) % n); });
    layDeck(0); fitDeck(); addEventListener('resize', fitDeck); if ('ResizeObserver' in window) { const ro = new ResizeObserver(fitDeck); cards.forEach(c => ro.observe(c)); }
    // start when the stage comes into view, pause when it leaves
    const onView = v => { visible = v; if (v) select(cur); else { run++; notes(false); cards.forEach(p => p.classList.remove('run')); stage.classList.remove('tone-on'); } };
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
  // a wheel of looks: spin it (drag, swipe, arrow keys or tap a slice) and the look under the pin lands on the phone
  const lScreen = $('#looks-screen'), wheel = $('#wheel'), wName = $('#wheel-name'), wKind = $('#wheel-kind'); let look = 7, lHold = 0, angle = 0;
  const SW = { Minimalist: '#ffffff', Airbus: '#0b1e2d', Boeing: '#151515', Embraer: '#2b3138', Mint: '#7be8a4', Blue: '#2f8bff', Cream: '#fdf0e9', Red: '#ff4a4a' };
  const N = F.looks.length, step = 360 / N;
  wheel.style.background = 'conic-gradient(from ' + (-step / 2) + 'deg, ' + F.looks.map((l, i) => SW[l.name] + ' ' + (i * step) + 'deg ' + ((i + 1) * step) + 'deg').join(', ') + ')';
  F.looks.forEach((l, i) => {
    const im = new Image(); im.src = 'img/frames/' + l.img + '.webp'; im.alt = l.name + ' look of the ChecklistPro home screen'; im.width = 780; im.height = 1688; lScreen.appendChild(im);
    const lab = document.createElement('button'); lab.type = 'button'; lab.className = 'wheel-lab'; lab.textContent = l.name; lab.style.setProperty('--a', (i * step) + 'deg');
    lab.style.color = ['Airbus', 'Boeing', 'Embraer'].includes(l.name) ? '#fff' : '#111';
    lab.addEventListener('click', e => { if (moved) return; spinTo(i); lHold = Date.now() + 9000; }); wheel.appendChild(lab);
  });
  function pickLook(i) {
    look = i; $$('img', lScreen).forEach((im, k) => im.classList.toggle('on', k === i));
    const n = NOTES[F.looks[i].name][0].split(': '); wKind.textContent = n.length > 1 ? n[0] : ''; wName.textContent = n[n.length - 1];
    wheel.setAttribute('aria-valuenow', i + 1); wheel.setAttribute('aria-valuetext', NOTES[F.looks[i].name][0]);
  }
  // the slice under the pin (at the top) is the chosen one
  const idxAt = a => ((Math.round(-a / step) % N) + N) % N;
  function spinTo(i, turns) {
    let target = -i * step; const cur = angle;
    while (target > cur + 1) target -= 360; while (target < cur - 359) target += 360;   // always spin forward, the short way round
    if (turns) target -= 360 * turns;
    angle = target; wheel.style.transition = ''; wheel.style.transform = 'rotate(' + angle + 'deg)'; pickLook(i);
    wheel.parentNode.classList.remove('land'); void wheel.offsetWidth; wheel.parentNode.classList.add('land');
  }
  let drag = null, moved = false;
  const ang = e => { const r = wheel.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
  wheel.addEventListener('pointerdown', e => { drag = { a0: ang(e), start: angle, t: performance.now(), last: angle }; moved = false; wheel.style.transition = 'none'; wheel.setPointerCapture(e.pointerId); lHold = Date.now() + 9000; });
  wheel.addEventListener('pointermove', e => { if (!drag) return; let d = ang(e) - drag.a0; if (d > 180) d -= 360; if (d < -180) d += 360; if (Math.abs(d) > 3) moved = true; drag.last = angle; angle = drag.start + d; drag.v = (angle - drag.last); wheel.style.transform = 'rotate(' + angle + 'deg)'; const i = idxAt(angle); if (i !== look) pickLook(i); });
  const release = () => { if (!drag) return; const fling = (drag.v || 0) * 6; drag = null; wheel.style.transition = ''; angle += fling; const i = idxAt(angle); angle = -i * step + Math.round((angle + i * step) / 360) * 360; wheel.style.transform = 'rotate(' + angle + 'deg)'; pickLook(i); wheel.parentNode.classList.remove('land'); void wheel.offsetWidth; wheel.parentNode.classList.add('land'); setTimeout(() => { moved = false; }, 50); };
  wheel.addEventListener('pointerup', release); wheel.addEventListener('pointercancel', release);
  wheel.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { spinTo((look + 1) % N); lHold = Date.now() + 9000; e.preventDefault(); } if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { spinTo((look + N - 1) % N); lHold = Date.now() + 9000; e.preventDefault(); } });
  angle = -7 * step; wheel.style.transform = 'rotate(' + angle + 'deg)'; pickLook(7);
  let lVis = false; if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { lVis = e.isIntersecting; }), { threshold: .3 }).observe($('#looks-phone'));
  setInterval(() => { if (lVis && !reduce && Date.now() > lHold && !drag) spinTo((look + 1) % N); }, 2600);


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
  // ---------- the film at the top of the work tree: prompts and plans fly back and forth while the app takes shape ----------
  const film = (function () {
    const box = $('#jf'), chat = $('#jf-chat'), fill = $('#jf-fill'), sts = $$('.jf-st'), dds = $$('.jf-stats dd'), rows = (window.JOURNEY_ROWS || []).filter(r => r.says || r.title);
    const mark = $('.journey-intro .claude-mark') ? $('.journey-intro .claude-mark').outerHTML : '';
    const CODE = ['+ <div className="stack">', '+ const items = list.filter(i => i.on)', '- items.sort(byDone)', '+ .item { min-height: 56px }', '+ onPointerDown={startDrag}', '+ <Question if="sauna" add={towel} />', '+ playTone("heart", 0.6)', '- position: absolute', '+ :root[data-design="modern"] {', '+ localStorage.setItem(KEY, json)', '+ fetch("/api/quick", { audio })', '+ confetti({ from: "bottom" })', '+ <Progress value={done / all} />', '+ @media (max-width: 380px)', '- setTimeout(moveToTop, 1000)', '+ aria-pressed={on}'];
    const esc = x => String(x).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    // 8 seconds: calm, rush to the paper design, calm for 3 s, rush to today, calm again
    const T = 8000, STAGE_AT = [0, 2500, 6500];
    const gap = t => (t > 1500 && t < 2500) || (t > 5500 && t < 6500) ? 70 : 520;
    const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    let raf = 0, timer = 0, alive = false, n = 0;
    const add = (cls, html) => { const b = document.createElement('div'); b.className = 'jf-b ' + cls; b.innerHTML = html; chat.appendChild(b); while (chat.children.length > 14) chat.firstChild.remove(); };
    function msg(t) {
      const r = rows[Math.min(rows.length - 1, Math.floor(t / T * rows.length))], kind = n % 4; n++;
      if (kind === 0 && r.says) add('u', '“' + esc(r.says) + '”');
      else if (kind <= 1) add('c', mark + '<b>Plan:</b> ' + esc(r.title));
      else { const c = CODE[n % CODE.length]; add('code' + (c[0] === '-' ? ' del' : ''), esc(c)); }
    }
    function finish() {
      alive = false; cancelAnimationFrame(raf); clearTimeout(timer); box.classList.add('done'); fill.style.width = '100%';
      sts.forEach((s, k) => { s.classList.add('on'); s.classList.toggle('now', k === 2); }); dds.forEach(d => { d.textContent = (d.dataset.pre || '') + d.dataset.to; });
    }
    function run() {
      const t0 = performance.now(); chat.innerHTML = ''; n = 0; box.classList.remove('done'); dds.forEach(d => { d.textContent = (d.dataset.pre || '') + '0'; });
      const tick = () => { if (!alive) return; const t = performance.now() - t0; if (t >= T) return; msg(t); timer = setTimeout(tick, gap(t)); };
      tick();
      const frame = () => {
        if (!alive) return; const t = performance.now() - t0, p = Math.min(1, t / T);
        fill.style.width = (p * 100) + '%';
        const st = t >= STAGE_AT[2] ? 2 : t >= STAGE_AT[1] ? 1 : 0; sts.forEach((s, k) => { s.classList.toggle('on', k <= st); s.classList.toggle('now', k === st); });
        dds.forEach(d => { d.textContent = (d.dataset.pre || '') + Math.round(+d.dataset.to * ease(p)); });
        if (t >= T) { add('c', mark + '<b>Shipped.</b> ChecklistPro, today.'); finish(); return; }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    return {
      start() { if (reduce) { finish(); return; } if (alive) return; alive = true; run(); },
      stop() { alive = false; cancelAnimationFrame(raf); clearTimeout(timer); },
    };
  })();
  // ---------- the website's stop-motion: one screenshot per commit, played like a flip book ----------
  const flip = (function () {
    const img = $('#jw-img'), time = $('#jw-time'), fill = $('#jw-fill'), tabs = $$('.jw-tab'), dds = $$('.jw-stats dd'), E = window.EVO || {};
    const order = ['hero', 'page']; let c = 'hero', i = 0, t = 0, alive = false, counted = false;
    Object.values(E).forEach(list => list.forEach(([f]) => { const im = new Image(); im.src = 'img/evo/' + f; }));
    const show = () => { const list = E[c], [f, tm] = list[i]; img.src = 'img/evo/' + f; const isColour = !/\d:\d/.test(tm); time.textContent = isColour ? tm : ''; time.hidden = !isColour; fill.style.width = ((i + 1) / list.length * 100) + '%'; };
    function step() {
      if (!alive) return; show(); const list = E[c];
      if (!counted) { const p = (order.indexOf(c) * list.length + i + 1) / (order.length * list.length); dds.forEach(d => { d.textContent = (d.dataset.pre || '') + Math.round(+d.dataset.to * Math.min(1, p * 3)); }); if (p >= 1 / 3) counted = true; }
      // about 8 seconds per part, a short hold on the latest frame, then the next part
      if (i < list.length - 1) { const colour = !/\d:\d/.test(list[i][1]); i++; t = setTimeout(step, colour ? 750 : 6000 / list.length); } else t = setTimeout(() => { pick(order[(order.indexOf(c) + 1) % order.length]); }, 1800);
    }
    function pick(k) { c = k; i = 0; tabs.forEach(b => b.setAttribute('aria-pressed', b.dataset.c === k ? 'true' : 'false')); clearTimeout(t); if (reduce) { i = E[c].length - 1; show(); return; } step(); }
    tabs.forEach(b => b.addEventListener('click', () => { alive = true; pick(b.dataset.c); }));
    return { start() { if (alive) return; alive = true; counted = false; pick('hero'); }, stop() { alive = false; clearTimeout(t); } };
  })();
  function openJourney(push) {
    if (window.Journey.set === 'web') flip.start(); else film.start();
    lastFocus = document.activeElement; window.Journey.build(); ov.hidden = false; document.body.classList.add('lock');
    requestAnimationFrame(() => { ov.classList.add('open'); setTimeout(() => { window.Journey.draw(true); }, 120); $('#close-journey').focus(); });
    if (push !== false && location.hash !== '#journey') history.pushState(null, '', '#journey');
  }
  function closeJourney(push) { film.stop(); flip.stop(); ov.classList.remove('open'); document.body.classList.remove('lock'); setTimeout(() => { ov.hidden = true; }, 450); if (lastFocus) lastFocus.focus(); if (push !== false && location.hash === '#journey') history.pushState(null, '', location.pathname + location.search); }
  // switch the tree between the app's story and this website's story
  $$('.jt-opt').forEach(b => b.addEventListener('click', () => {
    const set = b.dataset.set; if (window.Journey.set === set) return;
    $$('.jt-opt').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    ov.classList.toggle('web', set === 'web'); if (set === 'web') { film.stop(); flip.start(); } else { flip.stop(); film.start(); }
    window.Journey.fill(set); $('#journey-scroll').scrollTop = 0; setTimeout(() => window.Journey.draw(true), 60);
  }));
  // phones: the filter chips fold behind a Filter button
  $('#jb-filter').addEventListener('click', () => { const o = ov.classList.toggle('filters-open'); $('#jb-filter').setAttribute('aria-expanded', o ? 'true' : 'false'); });
  $('#journey-filters').addEventListener('click', e => { if (e.target.closest('.fchip')) { ov.classList.remove('filters-open'); $('#jb-filter').setAttribute('aria-expanded', 'false'); } });
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
