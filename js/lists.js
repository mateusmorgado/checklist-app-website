// Saved lists: the core idea of the app. A list is made once, stays saved, and is picked whenever it is needed.
// The phone shows the library; a tap opens a list, its items tick off, the use counter goes up by one, and back it goes.
// Alex changes into the outfit for each list. It runs on its own while on screen and waits while scrolled away.
(function () {
  const $ = s => document.querySelector(s), root = document.documentElement;
  const stage = $('#ls-stage'); if (!stage) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scr = $('#ls-screen'), rowsEl = $('#ls-rows'), run = $('.ls-run'), itemsEl = $('#ls-items'), bar = $('#ls-bar'), count = $('#ls-count');
  const tap = $('#ls-tap'), puff = $('#ls-puff'), bubble = $('#ls-bubble'), say = $('#ls-say'), imgs = [...document.querySelectorAll('#ls-fig img')];
  const ICON = {
    gym: '<path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12"/>',
    holiday: '<path d="M4 8h16v11H4zM9 8V5h6v3M4 13h16"/>',
    leave: '<path d="M4 11l8-7 8 7M6 10v9h12v-9M10 19v-5h4v5"/>',
    mil: '<path d="M4 18h16M5 15.5L4 7l4.5 3.5L12 5l3.5 5.5L20 7l-1 8.5z"/>',
  };
  const T = {
    en: { h: 'My lists', hi: 'Hi, Alex!', n: n => n + ' saved lists', items: n => n + ' items', used: 'used ', times: '×', back: '‹ My lists', saved: '✓ Saved for next time', idle: 'Which list today?', next: 'Which one next?', open: 'Open the list: ' },
    de: { h: 'Meine Listen', hi: 'Hallo, Alex!', n: n => n + ' gespeicherte Listen', items: n => n + ' Punkte', used: '', times: '× genutzt', back: '‹ Meine Listen', saved: '✓ Fürs nächste Mal gespeichert', idle: 'Welche Liste heute?', next: 'Und jetzt welche?', open: 'Liste öffnen: ' },
  };
  const LISTS = [
    { k: 'gym', c: 'var(--yellow)', used: 48, fx: { 1: 'bottle', 3: 'headphones' },
      en: ['Gym', ['Towel', 'Water bottle', 'Gym shoes', 'Headphones', 'Padlock'], 'Leg day. No excuses.', 'Done. Same list on Thursday.'],
      de: ['Gym', ['Handtuch', 'Wasserflasche', 'Sportschuhe', 'Kopfhörer', 'Vorhängeschloss'], 'Beintag. Keine Ausreden.', 'Fertig. Donnerstag wieder.'] },
    { k: 'holiday', c: 'var(--blue)', used: 6, after: 'holiday-ok', fx: { 1: 'robot', 2: 'flipflops' },
      en: ['Holiday', ['Passport', 'Sunscreen', 'Flip-flops', 'Swimsuit', 'Sunglasses'], 'Out of office!', 'Packed. Nothing forgotten.'],
      de: ['Urlaub', ['Reisepass', 'Sonnencreme', 'Flip-Flops', 'Badehose', 'Sonnenbrille'], 'Bin im Urlaub!', 'Gepackt. Nichts vergessen.'] },
    { k: 'leave', c: 'var(--pink)', used: 212, fx: { 2: 'keys', 3: 'wallet' },
      en: ['Leaving the apartment', ['Stove off', 'Windows shut', 'Keys', 'Wallet', 'Phone'], 'Did I turn the stove off?', 'Door shut. Head clear.'],
      de: ['Wohnung verlassen', ['Herd aus', 'Fenster zu', 'Schlüssel', 'Geldbeutel', 'Handy'], 'Hab ich den Herd ausgemacht?', 'Tür zu. Kopf frei.'] },
    { k: 'mil', c: 'var(--orange)', used: 9, after: 'mil-ok', fx: { 0: 'pizza' },
      en: ['Mother-in-law visit', ['Hide the pizza boxes', 'Water the plant she gave us', 'Fix the wobbly shelf', 'Put her photo back up', 'Smile'], 'She’s here in 20 minutes!', 'Survived. Same list next month.'],
      de: ['Schwiegermutter kommt', ['Pizzakartons verstecken', 'Ihre Pflanze gießen', 'Wackliges Regal reparieren', 'Ihr Foto wieder aufstellen', 'Lächeln'], 'Sie ist in 20 Minuten da!', 'Überlebt. Nächsten Monat wieder.'] },
  ];
  // two more saved lists, just to show the library is full (not part of the demo)
  const MORE = [
    { used: 365, ic: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>', en: ['Morning routine', 6], de: ['Morgenroutine', 6] },
    { used: 31, ic: '<path d="M3 5h3l2.5 10h10L21 8H7M10 19.5h.01M17 19.5h.01"/>', en: ['Groceries', 12], de: ['Einkaufen', 12] },
  ];
  const lang = () => root.getAttribute('data-lang') === 'de' ? 'de' : 'en';
  let cur = -1, ticked = 0, line = 'idle', token = 0, vis = false, started = false;

  // ---- drawing ----
  function drawRows() {
    const t = T[lang()];
    $('#ls-hi').innerHTML = t.hi + '<small>' + t.n(LISTS.length + MORE.length) + '</small>';
    $('#ls-h').innerHTML = '<span>' + t.h + '</span>';
    $('#ls-more').innerHTML = MORE.map(m => { const d = m[lang()]; return '<li><span class="ls-tx"><b>' + d[0] + '</b><small>' + t.items(d[1]) + ' · ' + t.used + m.used + t.times + '</small></span><span class="ls-ic"><svg viewBox="0 0 24 24">' + m.ic + '</svg></span></li>'; }).join('');
    rowsEl.innerHTML = LISTS.map((L, i) => { const d = L[lang()];
      return '<li><button type="button" class="ls-row" data-i="' + i + '" aria-label="' + t.open + d[0] + '"><span class="ls-tx"><b>' + d[0] + '</b><small>' + t.items(d[1].length) + ' · ' + t.used + '<span class="ls-n">' + L.used + '</span>' + t.times + '</small></span><span class="ls-ic" style="--c:' + L.c + '"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[L.k] + '</svg></span></button></li>';
    }).join('');
  }
  function drawRun() {
    const t = T[lang()]; $('#ls-back').textContent = t.back; $('#ls-saved').textContent = t.saved;
    if (cur < 0) return; const d = LISTS[cur][lang()];
    $('#ls-title').textContent = d[0];
    const big = $('#ls-big'); big.style.setProperty('--c', LISTS[cur].c); big.innerHTML = '<svg viewBox="0 0 24 24">' + ICON[LISTS[cur].k] + '</svg>';
    itemsEl.innerHTML = d[1].map((s, i) => '<li' + (i < ticked ? ' class="on"' : '') + '><b class="ls-next">next</b><span>' + s + '</span><i class="a-box"></i></li>').join('');
    progress();
  }
  // like the app: ticked items turn green and fade, the next open one is yellow and tagged NEXT, a full bar turns green
  function progress() { const n = cur < 0 ? 0 : LISTS[cur][lang()][1].length; bar.style.width = (n ? ticked / n * 100 : 0) + '%'; count.textContent = ticked + ' / ' + n;
    [...itemsEl.children].forEach((li, k) => li.classList.toggle('next', k === ticked)); bar.parentNode.classList.toggle('full', n > 0 && ticked >= n); }
  function talk(key) { line = key; const l = lang(); let s;
    if (key === 'idle' || key === 'next') s = T[l][key]; else { const [i, w] = key.split(':'); s = LISTS[+i][l][w === 'done' ? 3 : 2]; }
    say.textContent = s; bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop');
  }
  function dress(k, anim) {
    imgs.forEach(im => { const on = im.dataset.k === k; im.classList.toggle('on', on); im.classList.remove('swap', 'hop', 'idle'); });
    const im = imgs.find(x => x.dataset.k === k); if (!im || reduce) return;
    void im.offsetWidth; im.classList.add(anim || 'swap');
    if (anim === 'flinch-in') { im.classList.remove('flinch-in'); im.classList.add('flinch'); setTimeout(() => im.classList.replace('flinch', 'idle'), 520); return; }
    if (anim !== 'hop') { puff.classList.remove('go'); void puff.offsetWidth; puff.classList.add('go'); }
    if (anim === 'swap' || !anim) setTimeout(() => { if (im.classList.contains('on') && im.classList.contains('swap')) { im.classList.remove('swap'); im.classList.add('idle'); } }, 520);
  }
  function view(v) { scr.dataset.view = v; }

  // ---- little moments around Alex: ticked things fly out of the phone at him, the co-pilot brings the sunscreen ----
  const alexBox = $('.ls-alex'), fly = $('#ls-fly');
  const onImg = () => imgs.find(x => x.classList.contains('on'));
  function flinch() { const im = onImg(); if (!im) return; im.classList.remove('swap', 'hop', 'idle', 'flinch'); void im.offsetWidth; im.classList.add('flinch'); setTimeout(() => { im.classList.remove('flinch'); im.classList.add('idle'); }, 520); }
  const curve = (a, c, b, n) => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; });
  function fx(kind, li) {
    if (reduce || !kind || !alexBox.offsetParent) return;
    const B = alexBox.getBoundingClientRect(), W = B.width, H = B.height, head = [W * .5, H * .26];
    if (kind === 'robot') {
      const r = document.createElement('img'); r.src = 'img/lists/robot-sun.webp'; r.alt = ''; r.className = 'ls-robot'; fly.appendChild(r);
      const side = innerWidth <= 700 ? -1 : 1; // on phones the robot comes from the left, away from the phone
      r.animate([{ transform: `translateX(${side * 140}%)`, opacity: 0 }, { transform: 'translateX(0) rotate(0)', opacity: 1, offset: .22 }, { transform: 'translateX(0) translateY(-4%) rotate(-3deg)', offset: .32 }, { transform: 'translateX(0) translateY(0) rotate(0)', offset: .42 }, { transform: 'translateX(0)', opacity: 1, offset: .78 }, { transform: `translateX(${side * 140}%)`, opacity: 0 }], { duration: 2300, easing: 'ease-in-out' }).onfinish = () => r.remove();
      r.style[side > 0 ? 'right' : 'left'] = '-46%';
      setTimeout(() => { const im = onImg(); if (im) { im.classList.remove('idle', 'hop'); void im.offsetWidth; im.classList.add('hop'); } }, 700);
      return;
    }
    const el = document.createElement('img'); el.src = 'img/lists/' + kind + '.webp'; el.alt = ''; el.className = 'ls-thing'; fly.appendChild(el);
    const sz = W * (kind === 'pizza' ? .5 : .4); el.style.width = el.style.height = sz + 'px';
    let from; if (li) { const r = li.getBoundingClientRect(); from = [r.left + r.width * .3 - B.left, r.top + r.height / 2 - B.top]; } else from = [-W * .4, H * .4];
    const dir = from[0] < head[0] ? 1 : -1; let pts, hit = 0, dur = 1150;
    if (kind === 'wallet' || kind === 'headphones') { // falls from above onto his head
      pts = [...curve([head[0] + W * .05, -H * .9], [head[0], -H * .3], head, 8), ...curve(head, [head[0] - dir * W * .3, head[1] - H * .2], [head[0] - dir * W * .42, H * .9], 8).slice(1)]; hit = 8; dur = 1300;
    } else if (kind === 'pizza') { // the boxes sail over him and away
      pts = curve(from, [head[0], -H * .55], [head[0] + dir * W * 1.4, -H * .05], 16); dur = 1500;
    } else { // thrown at him: bonk, then off it goes
      pts = [...curve(from, [(from[0] + head[0]) / 2, Math.min(from[1], head[1]) - H * .35], head, 8), ...curve(head, [head[0] + dir * W * .35, -H * .2], [head[0] + dir * W * .8, H * .95], 8).slice(1)]; hit = 8;
    }
    const n = pts.length - 1, spin = dir * (kind === 'pizza' ? 200 : 540);
    el.animate(pts.map((q, i) => ({ transform: `translate(${q[0] - sz / 2}px, ${q[1] - sz / 2}px) rotate(${spin * i / n}deg) scale(${i === 0 ? .4 : 1})`, opacity: i === n ? 0 : 1 })), { duration: dur, easing: 'linear' }).onfinish = () => el.remove();
    if (hit) setTimeout(() => {
      if (kind === 'wallet' && cur === 2) { dress('leave-bonk', 'flinch-in'); setTimeout(() => { if (onImg() && onImg().dataset.k === 'leave-bonk') dress('leave', 'flinch-in'); }, 1100); }
      else flinch();
      const star = document.createElement('i'); star.className = 'ls-bonk'; star.style.left = head[0] + 'px'; star.style.top = head[1] - H * .1 + 'px'; fly.appendChild(star); setTimeout(() => star.remove(), 600);
    }, dur * hit / n);
  }

  // ---- timing: waits only count while the section is on screen, and stop when something newer takes over ----
  const wait = (ms, my) => new Promise(res => {
    if (reduce) ms = Math.min(ms, 0); let left = ms;
    const step = () => { if (my !== token) return res(false); if (vis && !document.hidden) left -= 100; if (left <= 0) return res(true); setTimeout(step, 100); };
    setTimeout(step, ms <= 0 ? 0 : 100);
  });
  function ring(el) {
    if (reduce) return; const a = el.getBoundingClientRect(), s = scr.getBoundingClientRect();
    tap.style.left = (a.left - s.left + a.width * .78) + 'px'; tap.style.top = (a.top - s.top + a.height / 2) + 'px';
    tap.classList.remove('go'); void tap.offsetWidth; tap.classList.add('go');
  }

  async function play(i, auto) {
    const my = ++token;
    if (scr.dataset.view !== 'home') { view('home'); if (!await wait(500, my)) return; }
    const row = rowsEl.querySelector('[data-i="' + i + '"]');
    if (auto) { ring(row); row.classList.add('hit'); if (!await wait(450, my)) return row.classList.remove('hit'); }
    row.classList.remove('hit');
    cur = i; ticked = 0; run.classList.remove('done'); drawRun(); view('run');
    dress(LISTS[i].k); talk(i + ':start');
    const n = LISTS[i].en[1].length;
    if (!await wait(900, my)) return;
    for (let k = 0; k < n; k++) {
      ticked = k + 1; const li = itemsEl.children[k]; if (li) li.classList.add('on'); progress();
      const f = LISTS[i].fx && LISTS[i].fx[k]; fx(f, li);
      if (!await wait(f === 'robot' ? 2300 : f ? 1250 : k === n - 1 ? 350 : 620, my)) return;
    }
    run.classList.add('done'); LISTS[i].used++;
    const nEl = rowsEl.querySelector('[data-i="' + i + '"] .ls-n'); if (nEl) { nEl.textContent = LISTS[i].used; nEl.classList.add('bump'); }
    if (LISTS[i].after) dress(LISTS[i].after, 'swap'); else dress(LISTS[i].k, 'hop');
    talk(i + ':done');
    if (reduce) return; // no auto return: "My lists" brings the library back
    if (!await wait(2600, my)) return;
    view('home'); talk('next');
    if (!await wait(1400, my)) return;
    play((i + 1) % LISTS.length, true);
  }
  function home(resumeAfter) {
    const my = ++token; view('home'); talk('next');
    if (!reduce && resumeAfter) wait(resumeAfter, my).then(ok => { if (ok) play((cur + 1) % LISTS.length, true); });
  }

  drawRows(); drawRun(); talk('idle');
  rowsEl.addEventListener('click', e => { const b = e.target.closest('.ls-row'); if (b) play(+b.dataset.i, false); });
  $('#ls-back').addEventListener('click', () => home(5000));
  // the language switch re-draws the texts and keeps where the demo is
  new MutationObserver(() => { drawRows(); LISTS.forEach((L, i) => { const n = rowsEl.querySelector('[data-i="' + i + '"] .ls-n'); if (n) n.textContent = L.used; }); drawRun(); talk(line); }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  const start = () => { if (started || reduce) return; started = true; const my = ++token; wait(900, my).then(ok => { if (ok) play(0, true); }); };
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; if (vis) start(); }), { threshold: .35 }).observe(stage);
  else { vis = true; start(); }
})();
