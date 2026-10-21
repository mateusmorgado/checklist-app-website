// The Alex story: builds the drawings once, then render(t) sets every frame from the time alone.
(function () {
  const LEN = 35;
  const $ = s => document.querySelector(s);
  const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const p = (t, a, b) => cl((t - a) / (b - a));
  const eo = x => 1 - Math.pow(1 - x, 3), ei = x => x * x * x, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const back = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const hold = (t, a, b, e = .25) => Math.min(eio(p(t, a, a + e)), 1 - eio(p(t, b - e, b)));
  const lerp = (a, b, x) => a + (b - a) * x;
  const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const NS = 'http://www.w3.org/2000/svg';

  // ---------- characters ----------
  const ALEX = `<svg class="alex" viewBox="-20 -40 240 300">
  <ellipse class="shadow" cx="100" cy="242" rx="54" ry="7"/>
  <g class="legL"><rect class="skin" x="76" y="188" width="18" height="38" rx="8"/><rect class="pl" x="76" y="188" width="18" height="38" rx="8"/><rect class="ps" x="73" y="186" width="24" height="22" rx="6"/><rect class="shoe" x="66" y="222" width="32" height="15" rx="7.5"/><path class="sole" d="M68 232h28"/></g>
  <g class="legR"><rect class="skin" x="106" y="188" width="18" height="38" rx="8"/><rect class="pl" x="106" y="188" width="18" height="38" rx="8"/><rect class="ps" x="103" y="186" width="24" height="22" rx="6"/><rect class="shoe" x="102" y="222" width="32" height="15" rx="7.5"/><path class="sole" d="M104 232h28"/></g>
  <g class="upper">
  <g class="armL"><rect class="skin" x="42" y="140" width="18" height="50" rx="9"/><rect class="sll" x="40" y="134" width="22" height="54" rx="10"/><rect class="sls" x="40" y="134" width="22" height="26" rx="10"/><circle class="skin" cx="51" cy="194" r="10"/></g>
  <rect class="tskin skin" x="56" y="126" width="88" height="74" rx="22"/>
  <rect class="tbody" x="56" y="126" width="88" height="74" rx="22"/>
  <path class="tank" d="M68 130h10q22 24 44 0h10v48q0 22-22 22H90q-22 0-22-22z"/>
  <path class="collar" d="M84 128q16 14 32 0"/>
  <g class="logo" transform="translate(112 150)"><rect class="lg" x="0" y="0" width="17" height="17" rx="4"/><path class="tick" d="M4 9l3.5 3.5L13.5 5"/></g>
  <g class="hw"><circle cx="72" cy="150" r="6" fill="#fff"/><circle cx="126" cy="146" r="6" fill="#ffe14d"/><circle cx="86" cy="182" r="6" fill="#ffe14d"/><circle cx="122" cy="180" r="6" fill="#fff"/><circle cx="104" cy="164" r="5" fill="#ff4a4a"/><path class="lapel" d="M82 126L100 150L118 126L110 125L100 140L90 125Z"/></g>
  <g class="jk"><rect class="inner" x="88" y="128" width="24" height="72"/><path class="zip" d="M88 140v58M112 140v58M64 172h18M118 172h18"/></g>
  <g class="vest"><path class="panel" d="M58 140q0-14 18-14h12v74H72q-14 0-14-14z"/><path class="panel" d="M142 140q0-14-18-14h-12v74h16q14 0 14-14z"/><rect class="band" x="58" y="170" width="30" height="8"/><rect class="band" x="112" y="170" width="30" height="8"/></g>
  <g class="towel"><path d="M118 126h22q8 0 8 8v62h-22v-62q0-8-8-8z"/><path class="st" d="M128 180h18"/></g>
  <rect class="skin" x="89" y="114" width="22" height="16" rx="4"/>
  <g class="head">
    <ellipse class="skin" cx="44" cy="90" rx="10" ry="15"/><ellipse class="skin" cx="156" cy="90" rx="10" ry="15"/>
    <path class="ear" d="M44 84q-4 6 1 12M156 84q4 6-1 12"/>
    <path class="skin" d="M50 64Q50 42 100 42Q150 42 150 64V96Q150 128 100 128Q50 128 50 96Z"/>
    <path class="stub" d="M62 104Q66 126 100 127Q134 126 138 104Q120 118 100 118Q80 118 62 104Z"/>
    <path class="fade" d="M50 74Q48 54 60 46L64 70Z"/><path class="fade" d="M150 74Q152 54 140 46L136 70Z"/>
    <path class="hair" d="M52 66Q46 40 62 30Q64 18 80 18Q88 8 102 12Q116 6 126 16Q142 16 144 30Q156 40 148 66Q140 54 128 52Q118 58 104 52Q92 58 80 52Q68 58 62 52Q56 58 52 66Z"/>
    <path class="curl" d="M70 34q6-6 12 0M96 24q6-6 12 0M118 32q6-6 12 0M84 42q5-5 10 0M108 44q5-5 10 0"/>
    <path class="brow browL" d="M66 74Q76 68 88 72"/><path class="brow browR" d="M112 72Q124 68 134 74"/>
    <g class="eyes"><ellipse class="eye" cx="80" cy="87" rx="8.5" ry="10"/><ellipse class="eye" cx="120" cy="87" rx="8.5" ry="10"/>
      <g class="glints"><circle class="glint" cx="83" cy="83" r="3"/><circle class="glint" cx="123" cy="83" r="3"/><circle class="glint" cx="77" cy="91" r="1.4"/><circle class="glint" cx="117" cy="91" r="1.4"/></g></g>
    <g class="spiral"><path d="M80 87m-2 0a2 2 0 1 1 4 0a4 4 0 1 1-8 0a6 6 0 1 1 12 0a8 8 0 1 1-16 0"/><path d="M120 87m-2 0a2 2 0 1 1 4 0a4 4 0 1 1-8 0a6 6 0 1 1 12 0a8 8 0 1 1-16 0"/></g>
    <ellipse class="cheek" cx="64" cy="104" rx="6" ry="3.5"/><ellipse class="cheek" cx="136" cy="104" rx="6" ry="3.5"/>
    <path class="nose" d="M97 98q3 4 6 0"/>
    <path class="mline msmile" d="M92 119q8 5 16 0"/><path class="mline mfrown" d="M92 123q8-5 16 0"/><ellipse class="mopen" cx="100" cy="121" rx="6" ry="4"/>
    <path class="stache" d="M100 106Q90 104 84 108Q78 112 74 110Q77 116 86 114Q94 111 100 111Q106 111 114 114Q123 116 126 110Q122 112 116 108Q110 104 100 106Z"/>
    <g class="glasses"><rect x="64" y="77" width="30" height="20" rx="7"/><rect x="106" y="77" width="30" height="20" rx="7"/><path d="M94 85h12" fill="none"/><path class="shine" d="M70 82l6 0M112 82l6 0"/></g>
    <g class="helmet"><path d="M46 62Q46 14 100 14Q154 14 154 62Z"/><path d="M38 58H162V68H38Z"/><path class="rib" d="M100 16V58M76 20V58M124 20V58"/></g>
  </g>
  <g class="armR"><rect class="skin" x="140" y="140" width="18" height="50" rx="9"/><rect class="sll" x="138" y="134" width="22" height="54" rx="10"/><rect class="sls" x="138" y="134" width="22" height="26" rx="10"/>
    <g class="it-tool"><rect class="s" x="146" y="198" width="6" height="34" rx="2"/><rect class="h" x="143" y="186" width="12" height="16" rx="4"/></g>
    <g class="it-drink"><path class="u" d="M160 168q14-14 28 0z"/><path class="st" d="M174 168l-6 20"/><path class="g" d="M154 186h30l-4 26h-22z"/><path class="j" d="M156 194h26l-3 16h-20z"/><path class="g" d="M154 186h30l-4 26h-22z" fill="none"/></g>
    <g class="it-phone"><rect class="c" x="152" y="166" width="30" height="52" rx="6"/><rect class="sc" x="156" y="174" width="22" height="38" rx="3"/><rect class="k" x="160" y="180" width="8" height="8" rx="2"/></g>
    <circle class="skin" cx="149" cy="194" r="10"/></g>
  </g></svg>`;

  const ROBOT = `<svg class="bot" viewBox="0 0 200 250">
  <ellipse class="b-shadow" cx="100" cy="242" rx="54" ry="7"/>
  <g class="r-all">
    <rect class="b-leg" x="76" y="190" width="18" height="36" rx="8"/><rect class="b-leg" x="106" y="190" width="18" height="36" rx="8"/>
    <rect class="b-shoe" x="66" y="222" width="32" height="15" rx="7.5"/><rect class="b-shoe" x="102" y="222" width="32" height="15" rx="7.5"/>
    <g class="r-arml"><rect class="b-sleeve" x="40" y="136" width="22" height="52" rx="11"/><path class="b-cuff" d="M41 176h20"/><circle class="b-hand" cx="51" cy="194" r="10"/></g>
    <rect class="b-jacket" x="56" y="126" width="88" height="74" rx="22"/>
    <path class="b-shirt" d="M84 128L100 158L116 128Z"/><path class="b-tie" d="M96 134h8l3 22-7 8-7-8z"/>
    <circle class="b-btn" cx="100" cy="176" r="3.4"/><circle class="b-btn" cx="100" cy="189" r="3.4"/>
    <path class="b-wing" d="M115 150q6-5 12-1q6-4 12 1"/>
    <rect class="b-neck" x="88" y="116" width="24" height="14" rx="4"/>
    <g class="r-head">
      <rect class="b-cup" x="33" y="70" width="17" height="36" rx="8.5"/><rect class="b-cup" x="150" y="70" width="17" height="36" rx="8.5"/>
      <rect class="b-skull" x="45" y="48" width="110" height="76" rx="26"/>
      <rect class="b-face" x="57" y="62" width="86" height="52" rx="17"/>
      <g class="r-eyes"><ellipse class="b-eye" cx="82" cy="85" rx="9" ry="11"/><ellipse class="b-eye" cx="118" cy="85" rx="9" ry="11"/>
        <g class="b-glints r-glints"><circle cx="85" cy="81" r="3.2"/><circle cx="121" cy="81" r="3.2"/></g></g>
      <ellipse class="b-cheek" cx="67" cy="100" rx="6" ry="3.5"/><ellipse class="b-cheek" cx="133" cy="100" rx="6" ry="3.5"/>
      <ellipse class="b-mouth r-mouth" cx="100" cy="103" rx="7" ry="2.6"/>
      <path class="b-boom" d="M41 104q3 14 30 9"/><circle class="b-mic" cx="73" cy="112" r="4"/>
      <line class="b-ant" x1="100" y1="24" x2="100" y2="9"/><circle class="b-light r-light" cx="100" cy="8" r="5.5"/>
      <path class="b-crown" d="M38 40Q100 8 162 40L152 56H48Z"/><path class="b-band" d="M48 50H152"/>
      <path class="b-visor" d="M50 57H150Q144 70 100 70Q56 70 50 57Z"/>
      <path class="b-badge-w" d="M83 37q8-6 13-1M117 37q-8-6-13-1"/><circle class="b-badge" cx="100" cy="37" r="5.5"/>
    </g>
    <g class="r-armr"><rect class="b-sleeve" x="138" y="136" width="22" height="52" rx="11"/><path class="b-cuff" d="M139 176h20"/><circle class="b-hand" cx="149" cy="194" r="10"/></g>
  </g></svg>`;

  function rigAlex(el) {
    el.innerHTML = ALEX; const q = s => el.querySelector(s);
    return { el, svg: q('svg'), legL: q('.legL'), legR: q('.legR'), upper: q('.upper'), armL: q('.armL'), armR: q('.armR'), head: q('.head'), browL: q('.browL'), browR: q('.browR'), eyes: q('.eyes'), glints: q('.glints'), msmile: q('.msmile'), mfrown: q('.mfrown'), mopen: q('.mopen'), glasses: q('.glasses'), shadow: q('.shadow'), spiral: q('.spiral') };
  }
  const A = rigAlex($('#alex')), A2 = rigAlex($('#alex2'));
  $('#robot').innerHTML = ROBOT;
  const R = (() => { const el = $('#robot'), q = s => el.querySelector(s); return { el, all: q('.r-all'), armL: q('.r-arml'), armR: q('.r-armr'), head: q('.r-head'), mouth: q('.r-mouth'), eyes: q('.r-eyes'), glints: q('.r-glints'), light: q('.r-light'), shadow: q('.b-shadow') }; })();

  const rot = (el, d, x, y) => el.setAttribute('transform', 'rotate(' + d + ' ' + x + ' ' + y + ')');
  const BROWS = { n: ['', ''], ann: ['rotate(14 77 72) translate(0 2)', 'rotate(-14 123 72) translate(0 2)'], wor: ['rotate(-14 77 72) translate(0 -3)', 'rotate(14 123 72) translate(0 -3)'], hap: ['translate(0 -5)', 'translate(0 -5)'] };
  function poseAlex(X, o) {
    o = Object.assign({ x: 640, y: 640, s: 1, rot: 0, cls: 'o-tee p-jeans', legL: 0, legR: 0, armL: 0, armR: 0, head: 0, crouch: 0, brows: 'n', eyes: 'n', look: [0, 0], mouth: 'smile', talk: 0, blink: false, eyeS: 1, glassY: 0, show: true, sx: 1, sy: 1, shadow: 1 }, o);
    X.el.style.display = o.show ? 'block' : 'none'; if (!o.show) return;
    X.el.style.transform = 'translate(' + (o.x - 150) + 'px,' + (o.y - 352) + 'px) rotate(' + o.rot + 'deg) scale(' + (o.s * o.sx) + ',' + (o.s * o.sy) + ')';
    X.svg.setAttribute('class', 'alex ' + o.cls + (o.eyes === 'spiral' ? ' e-spiral' : ''));
    rot(X.legL, o.legL, 85, 192); rot(X.legR, o.legR, 115, 192);
    X.upper.setAttribute('transform', 'translate(0 ' + o.crouch + ')');
    rot(X.armL, o.armL, 51, 142); rot(X.armR, o.armR, 149, 142); rot(X.head, o.head, 100, 124);
    X.browL.setAttribute('transform', BROWS[o.brows][0]); X.browR.setAttribute('transform', BROWS[o.brows][1]);
    const sy = o.blink ? .1 : o.eyeS;
    X.eyes.setAttribute('transform', 'translate(' + (o.look[0] * 3) + ' ' + (o.look[1] * 3) + ') translate(100 87) scale(' + o.eyeS + ' ' + sy + ') translate(-100 -87)');
    X.glints.setAttribute('transform', 'translate(' + (o.look[0] * 1.5) + ' ' + (o.look[1] * 1.5) + ')');
    let m = o.mouth; const tk = o.talk;
    X.msmile.style.display = 'none'; X.mfrown.style.display = 'none'; X.mopen.style.display = 'none';
    if (tk > .04 || m === 'open' || m === 'o') {
      X.mopen.style.display = 'inline';
      const ry = m === 'open' ? 8 + tk * 3 : m === 'o' && tk <= .04 ? 4.5 : 2 + tk * 7.5, rx = m === 'open' ? 8 : m === 'o' && tk <= .04 ? 4.5 : 5 + tk * 2.5;
      X.mopen.setAttribute('ry', ry); X.mopen.setAttribute('rx', rx);
    } else (m === 'frown' ? X.mfrown : X.msmile).style.display = 'inline';
    X.glasses.setAttribute('transform', 'translate(0 ' + o.glassY + ')');
    X.shadow.style.opacity = o.shadow;
  }
  function poseRobot(o) {
    o = Object.assign({ x: 640, y: 640, s: 1, rot: 0, armL: 0, armR: 0, head: 0, talk: 0, blink: false, look: [0, 0], show: true, bob: 0 }, o);
    R.el.style.display = o.show ? 'block' : 'none'; if (!o.show) return;
    R.el.style.transform = 'translate(' + (o.x - 130) + 'px,' + (o.y - 315) + 'px) rotate(' + o.rot + 'deg) scale(' + o.s + ')';
    R.all.setAttribute('transform', 'translate(0 ' + o.bob + ')');
    rot(R.armL, o.armL, 51, 142); rot(R.armR, o.armR, 149, 142); rot(R.head, o.head, 100, 124);
    R.mouth.setAttribute('ry', 2.6 + o.talk * 7.4); R.mouth.setAttribute('rx', 7 - o.talk * 1.6);
    R.eyes.setAttribute('transform', o.blink ? 'translate(0 85) scale(1 .1) translate(0 -85)' : '');
    R.glints.setAttribute('transform', 'translate(' + o.look[0] * 3 + ' ' + o.look[1] * 3 + ')');
  }

  // voice loudness drives the mouths: the louder of the English and German take at that moment
  function talk(who, t) {
    let v = 0;
    VO.lines.forEach(l => { if (l.who !== who) return; const i = Math.floor((t - l.t) * 60); if (i < 0) return; v = Math.max(v, l.en[i] || 0, l.de[i] || 0); });
    return v;
  }
  const BLINK = [1.2, 2.9, 5.6, 8.9, 12.1, 14.2, 20.4, 22.1, 24.0, 25.8, 31.2, 34.0];
  const blinking = t => BLINK.some(b => t > b && t < b + .12);
  const walk = (t, f, amp = 1) => { const s = Math.sin(t * Math.PI * 2 * f); return { legL: 24 * s * amp, legR: -24 * s * amp, armL: -20 * s * amp, armR: -20 * s * amp, lift: -Math.abs(Math.cos(t * Math.PI * 2 * f)) * 7 * amp }; };

  // ---------- backgrounds built once ----------
  function el(tag, attrs, parent) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
  // half-timbered houses
  const HOUSE_W = [];
  (function () {
    const g = $('#s1-houses'), FAC = ['#fff3d6', '#ffd9a8', '#ffe9e0', '#e6f3ff', '#fff0b8', '#f6e1ff'], ROOF = ['#e2553f', '#c94a3a', '#d9603f'];
    let x = 0; let html = '';
    for (let i = 0; i < 9; i++) {
      const w = 200 + Math.round(rnd(i) * 70), h = 250 + Math.round(rnd(i + 9) * 110), top = 560 - h, beam = '#6b3f2a';
      const f = FAC[i % FAC.length], r = ROOF[i % ROOF.length], rh = w * .62;
      let s = `<g><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="${f}"/>`;
      // beams
      const floors = Math.floor(h / 95);
      for (let k = 1; k <= floors; k++) s += `<rect x="${x}" y="${560 - k * 95}" width="${w}" height="9" fill="${beam}"/>`;
      s += `<rect x="${x}" y="${top}" width="9" height="${h}" fill="${beam}"/><rect x="${x + w - 9}" y="${top}" width="9" height="${h}" fill="${beam}"/><rect x="${x + w / 2 - 4}" y="${top}" width="9" height="${h - 95}" fill="${beam}"/>`;
      for (let k = 1; k < floors; k++) { const y0 = 560 - (k + 1) * 95 + 9, y1 = 560 - k * 95; s += `<path d="M${x + 9} ${y0}L${x + 40} ${y1}M${x + w - 9} ${y0}L${x + w - 40} ${y1}" stroke="${beam}" stroke-width="8" fill="none"/>`; }
      // windows
      for (let k = 1; k < floors; k++) { const wy = 560 - (k + 1) * 95 + 24; [x + w * .25 - 20, x + w * .75 - 20].forEach(wx => { s += `<rect x="${wx}" y="${wy}" width="40" height="52" rx="4" fill="#bfe6ff"/><path d="M${wx + 20} ${wy}v52M${wx} ${wy + 24}h40" fill="none"/><rect x="${wx - 4}" y="${wy + 52}" width="48" height="10" rx="3" fill="#e2553f"/><circle cx="${wx + 8}" cy="${wy + 50}" r="5" fill="#ff7ab6" stroke="none"/><circle cx="${wx + 28}" cy="${wy + 50}" r="5" fill="#ffe14d" stroke="none"/>`; }); }
      // door on the ground floor
      s += `<path d="M${x + w / 2 - 26} 560V${506}q0-26 26-26q26 0 26 26V560Z" fill="#8a5a2b"/>`;
      s += `<rect x="${x + 14}" y="490" width="36" height="44" rx="4" fill="#bfe6ff"/>`;
      s += `<path d="M${x - 14} ${top}L${x + w / 2} ${top - rh}L${x + w + 14} ${top}Z" fill="${r}"/><rect x="${x + w / 2 - 16}" y="${top - rh * .55}" width="32" height="36" rx="4" fill="#bfe6ff"/></g>`;
      html += s; HOUSE_W.push(w); x += w + 6;
    }
    HOUSE_W.total = x;
    g.innerHTML = '<g id="h1">' + html + '</g><g id="h2" transform="translate(' + x + ' 0)">' + html + '</g>';
    // far roofs and a church tower
    $('#s1-far').innerHTML = `<g fill="#c7c3f0"><path d="M120 560V300L170 220L220 300V560Z"/><path d="M160 220V160" fill="none"/><path d="M0 560V380L80 330L160 380V560ZM600 560V360L700 300L800 360V560ZM900 560V400L1000 340L1100 400V560ZM1150 560V330L1210 270L1270 330V560Z"/><circle cx="170" cy="270" r="18" fill="#fff"/></g>`;
    let st = ''; for (let r = 0; r < 4; r++) for (let c = 0; c < 30; c++) st += `<rect x="${c * 60 + (r % 2) * 30}" y="${580 + r * 34}" width="50" height="24" rx="10" fill="none" stroke="#cbbca2" stroke-width="3"/>`;
    $('#s1-stones').innerHTML = st;
    let cl = ''; [[120, 90, 1], [520, 60, .8], [900, 120, 1.1], [1250, 70, .9]].forEach(([x, y, s]) => { cl += `<g transform="translate(${x} ${y}) scale(${s})" class="ink"><path d="M0 40q0-30 30-28q10-26 44-18q26-10 40 16q30 0 28 30z" fill="#fff"/></g>`; });
    $('#s1-clouds').innerHTML = cl;
  })();
  // locker room
  (function () {
    let d = ''; for (let x = 0; x <= 1280; x += 64) d += `M${x} 0V600`; for (let y = 0; y <= 600; y += 64) d += `M0 ${y}H1280`; $('#s2-tiles').setAttribute('d', d);
    let s = ''; for (let i = 0; i < 9; i++) { const x = i * 148 - 10; s += `<rect x="${x}" y="130" width="140" height="390" rx="6" fill="${i % 2 ? '#6db7ff' : '#5aa6f2'}"/><path d="M${x + 30} 170h80M${x + 30} 184h80M${x + 30} 198h80" fill="none" stroke-width="3"/><circle cx="${x + 120}" cy="330" r="7" fill="#ffe14d"/><rect x="${x + 50}" y="230" width="40" height="22" rx="4" fill="#fff"/>`; }
    $('#s2-lockers').innerHTML = s;
    // backpack on the front bench
    $('#s2-pack').innerHTML = `<g transform="translate(600 470)"><rect x="40" y="10" width="40" height="120" rx="10" fill="#6db7ff" transform="rotate(12 60 70)"/><path d="M0 60q0-50 70-50t70 50v100H0z" fill="#6df5b9"/><rect x="30" y="100" width="80" height="44" rx="10" fill="#5ad9a3"/><path d="M0 60q70-30 140 0" fill="none"/><rect x="88" y="-10" width="26" height="60" rx="8" fill="#ffe14d"/><path d="M20 30q-30-40 10-60l20 20" fill="#5ad9a3"/></g>`;
  })();
  function guy(o) {
    const k = o.skin || '#e8b088', hr = o.hair || '#4a3020', tp = o.top || '#ff8a1f', bt = o.bottom || '#3a4f8f';
    if (o.back) return `<g class="guy">
      <rect x="76" y="188" width="18" height="38" rx="8" fill="${k}"/><rect x="106" y="188" width="18" height="38" rx="8" fill="${k}"/>
      <rect x="66" y="222" width="32" height="15" rx="7.5" fill="#fff"/><rect x="102" y="222" width="32" height="15" rx="7.5" fill="#fff"/>
      <rect x="42" y="138" width="18" height="54" rx="9" fill="${k}"/><rect x="140" y="138" width="18" height="54" rx="9" fill="${k}"/>
      <rect x="56" y="126" width="88" height="72" rx="22" fill="${k}"/><path d="M100 136v34" fill="none" stroke-width="2.5"/>
      <g id="${o.id}-butt"><circle cx="86" cy="196" r="17" fill="${k}"/><circle cx="114" cy="196" r="17" fill="${k}"/><path d="M100 186v24" fill="none"/></g>
      ${o.towelShoulder ? `<path d="M118 124h22q8 0 8 8v60h-22v-60q0-8-8-8z" fill="#fff"/><path d="M128 176h18" stroke="#ff4a4a" stroke-width="4" fill="none"/>` : ''}
      <rect x="89" y="114" width="22" height="16" rx="4" fill="${k}"/>
      <ellipse cx="50" cy="88" rx="9" ry="13" fill="${k}"/><ellipse cx="150" cy="88" rx="9" ry="13" fill="${k}"/>
      <path d="M52 100Q48 36 100 36Q152 36 148 100Q148 126 100 126Q52 126 52 100Z" fill="${hr}"/></g>`;
    const sit = o.sit;
    return `<g class="guy">
      ${sit ? `<rect x="76" y="196" width="18" height="30" rx="8" fill="${bt}"/><rect x="66" y="222" width="32" height="15" rx="7.5" fill="#fff"/>
        <g id="${o.id}-leg"><rect x="106" y="188" width="18" height="44" rx="8" fill="${k}"/><rect x="104" y="186" width="22" height="18" rx="6" fill="${bt}"/><rect x="104" y="220" width="22" height="20" rx="6" fill="#fff"/><path d="M106 226h18M106 233h18" stroke="#ff4a4a" stroke-width="3" fill="none"/></g>`
        : `<rect x="76" y="188" width="18" height="38" rx="8" fill="${o.towelWaist ? k : bt}"/><rect x="106" y="188" width="18" height="38" rx="8" fill="${o.towelWaist ? k : bt}"/><rect x="66" y="222" width="32" height="15" rx="7.5" fill="#fff"/><rect x="102" y="222" width="32" height="15" rx="7.5" fill="#fff"/>`}
      <g id="${o.id}-armL"><rect x="42" y="138" width="18" height="54" rx="9" fill="${k}"/><rect x="40" y="134" width="22" height="24" rx="9" fill="${tp}"/><circle cx="51" cy="194" r="10" fill="${k}"/></g>
      <rect x="56" y="126" width="88" height="74" rx="22" fill="${tp}"/>
      ${o.towelWaist ? `<rect x="52" y="168" width="96" height="40" rx="10" fill="#fff"/><path d="M60 180h80" stroke="#6db7ff" stroke-width="5" fill="none"/>` : ''}
      <g id="${o.id}-armR"><rect x="140" y="138" width="18" height="54" rx="9" fill="${k}"/><rect x="138" y="134" width="22" height="24" rx="9" fill="${tp}"/><circle cx="149" cy="194" r="10" fill="${k}"/></g>
      <rect x="89" y="114" width="22" height="16" rx="4" fill="${k}"/>
      <ellipse cx="50" cy="88" rx="9" ry="13" fill="${k}"/><ellipse cx="150" cy="88" rx="9" ry="13" fill="${k}"/>
      <rect x="52" y="44" width="96" height="82" rx="32" fill="${k}"/>
      <path d="M52 78Q48 32 100 32Q152 32 148 78Q138 56 100 58Q62 56 52 78Z" fill="${hr}"/>
      <circle cx="82" cy="88" r="5" fill="#111" stroke="none"/><circle cx="118" cy="88" r="5" fill="#111" stroke="none"/>
      <ellipse id="${o.id}-mouth" cx="100" cy="108" rx="7" ry="3" fill="#7a1f2b"/></g>`;
  }
  const place = (x, y, s, inner, id) => `<g id="${id}" transform="translate(${x - 100 * s} ${y - 242 * s}) scale(${s})">${inner}</g>`;
  $('#s2-guys').innerHTML = place(200, 560, .78, guy({ id: 'g1', sit: true, top: '#ff8a1f', skin: '#c98d68', hair: '#2b1d17' }), 'g1') +
    place(900, 612, .82, guy({ id: 'g2', top: '#6df5b9', towelWaist: true, skin: '#f0c8a8', hair: '#c98a3b' }), 'g2') +
    place(1030, 612, .82, guy({ id: 'g3', back: true, towelShoulder: true, skin: '#e8b088', hair: '#4a3020' }), 'g3');
  $('#s4-guy').innerHTML = place(760, 640, .9, guy({ id: 'g4', back: false, top: '#27357a', skin: '#c98d68', hair: '#111' }), 'g4');
  // airport board and window
  (function () { let s = ''; for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) if (rnd(r * 20 + c) > .18) s += `<rect x="${720 + c * 35}" y="${72 + r * 36}" width="28" height="26" rx="3" fill="${c > 10 ? '#6df5b9' : '#ffe14d'}" opacity=".9"/>`; $('#s4-board').innerHTML = s; })();
  // upstairs windows at the front door, one left open
  $('#s3-wins').innerHTML = [120, 360, 900, 1110].map((x, i) => `<rect x="${x}" y="60" width="150" height="160" rx="6" fill="${i === 2 ? '#3b2a24' : '#bfe6ff'}"/>${i === 2 ? `<path id="s3-curt" d="" fill="#ffc2c2"/><rect x="${x + 150}" y="60" width="60" height="160" fill="#bfe6ff" transform="skewY(14)" style="transform-origin:${x + 150}px 60px"/>` : `<path d="M${x + 75} 60v160M${x} 140h150" fill="none"/>`}<rect x="${x - 10}" y="220" width="170" height="14" rx="4" fill="#e2c191"/>`).join('') +
    [120, 1110].map(x => `<rect x="${x}" y="320" width="150" height="180" rx="6" fill="#bfe6ff"/><path d="M${x + 75} 320v180M${x} 410h150" fill="none"/>`).join('');
  // rays behind the co-pilot, the phone and the end card
  ['#s7-rays', '#s9-rays', '#sE-rays'].forEach(s => { let d = ''; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, b = a + Math.PI / 18; d += `M640 360L${640 + Math.cos(a) * 1400} ${360 + Math.sin(a) * 1400}L${640 + Math.cos(b) * 1400} ${360 + Math.sin(b) * 1400}Z`; } $(s).innerHTML = `<path d="${d}" fill="#fff"/>`; });
  // falling: clouds and speed lines
  (function () { let s = '', l = ''; for (let i = 0; i < 9; i++) s += `<g class="ink" id="fc${i}"><path d="M0 40q0-30 30-28q10-26 44-18q26-10 40 16q30 0 28 30z" fill="#fff"/></g>`; for (let i = 0; i < 14; i++) l += `<path id="fl${i}" d="M0 0v120"/>`; $('#s6-clouds').innerHTML = s; $('#s6-lines').innerHTML = l; })();
  // phone items
  const ITEMS = [['Towel', 'towel'], ['Windows closed', 'window'], ['Passport', 'passport']];
  const ICON = {
    towel: '<g class="ink"><rect x="18" y="14" width="64" height="62" rx="8" fill="#fff"/><path d="M18 32h64M18 58h64" stroke="#6db7ff" stroke-width="8"/><rect x="18" y="14" width="64" height="62" rx="8" fill="none"/></g>',
    window: '<g class="ink"><rect x="14" y="10" width="72" height="70" rx="6" fill="#bfe6ff"/><path d="M50 10v70M14 45h72" fill="none"/><path d="M86 10L102 24V92L86 80Z" fill="#fff"/></g>',
    passport: '<g class="ink"><rect x="24" y="8" width="54" height="74" rx="6" fill="#8b1e3f"/><circle cx="51" cy="38" r="14" fill="none" stroke="#ffe14d"/><path d="M37 38h28M51 24v28" fill="none" stroke="#ffe14d" stroke-width="2.5"/><rect x="36" y="62" width="30" height="6" rx="3" fill="#ffe14d" stroke="none"/></g>',
  };
  $('#s9-items').innerHTML = ITEMS.map(([n, ic], i) => `<g id="it${i}" class="ink" transform="translate(430 ${240 + i * 130})"><rect class="card" x="0" y="0" width="420" height="104" rx="8" fill="#fff"/><g transform="translate(14 14) scale(.8)">${ICON[ic]}</g><text x="96" y="63" font-family="Space Grotesk" font-weight="700" font-size="28" fill="#111" stroke="none">${n}</text><rect x="342" y="26" width="52" height="52" rx="8" fill="#fff"/><path class="tk" d="M352 52l12 12 22-24" fill="none" stroke-width="8" stroke-dasharray="60" stroke-dashoffset="60"/></g>`).join('');
  // boom cloud
  const PUFFS = []; (function () { const g = $('#boom'); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rnd(i) * .4; PUFFS.push({ a, d: 90 + rnd(i + 3) * 110, r: 60 + rnd(i + 7) * 50, c: ['#fff', '#ffe14d', '#ffc2c2', '#e8e8f0'][i % 4], e: el('circle', { class: 'ink', 'stroke-width': 4 }, g) }); } PUFFS.core = el('circle', { fill: '#fff', stroke: '#111', 'stroke-width': 4 }, g); const star = el('path', { fill: '#ffe14d', stroke: '#111', 'stroke-width': 5, d: (() => { let d = ''; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 90 : 170; d += (i ? 'L' : 'M') + (Math.cos(a) * r * 1.3) + ' ' + Math.sin(a) * r; } return d + 'Z'; })() }, g); PUFFS.star = star; const tx = el('text', { x: 0, y: 26, 'text-anchor': 'middle', 'font-family': 'Bricolage Grotesque', 'font-weight': 800, 'font-size': 92, fill: '#ff4a4a', stroke: '#111', 'stroke-width': 4 }, g); tx.textContent = 'BOOM!'; PUFFS.text = tx; })();

  // ---------- frame ----------
  const CUTS = [3.6, 6.9, 10.35, 12.7, 16.5, 19.2, 26.7, 27.7, 28.7, 29.7, 33.35];
  const WIPES = [3.6, 6.9, 10.35, 12.7, 19.2, 33.35], FLASH = [15.75, 17.45, 26.7, 27.7, 28.7, 29.7];
  const LAYERS = [['s1'], ['s2', 's2f'], ['s3'], ['s4', 's4f'], ['s5', 's5f'], ['s6'], ['s7', 's7f'], ['s3'], ['s8b', 's8bf'], ['s8c'], ['s9'], ['sE']];
  const allLayers = [...document.querySelectorAll('.layer')];
  const world = $('#world'), fx = $('#fx').getContext('2d');
  const think = $('#think');
  let thinkIcon = '';
  function showThink(t, a, b, x, y, icon, mark) {
    if (t < a || t > b) return false;
    if (thinkIcon !== icon) { thinkIcon = icon; $('#think-ic').innerHTML = ICON[icon]; }
    $('#think-x').style.display = mark === 'x' && t > a + .35 ? '' : 'none'; $('#think-q').style.display = mark === 'q' ? '' : 'none';
    const k = back(p(t, a, a + .3)) * (1 - ei(p(t, b - .15, b)));
    think.style.display = 'block'; think.style.transform = 'translate(' + x + 'px,' + (y + Math.sin(t * 3) * 4) + 'px) scale(' + k + ')'; return true;
  }
  function confetti(t, t0, ox, oy, n, spread) {
    const dt = t - t0; if (dt < 0 || dt > 2.4) return; const C = ['#ffe14d', '#6df5b9', '#fff', '#ffc2c2', '#6db7ff'];
    for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + (rnd(i + t0) - .5) * spread, v = 380 + rnd(i * 3 + t0) * 520, x = ox + Math.cos(a) * v * dt, y = oy + Math.sin(a) * v * dt + 700 * dt * dt;
      fx.save(); fx.translate(x, y); fx.rotate(dt * (4 + rnd(i * 7) * 8)); fx.globalAlpha = cl(1 - (dt - 1.6) / .8); fx.fillStyle = C[i % 5]; fx.strokeStyle = '#111'; fx.lineWidth = 3;
      if (i % 3) { fx.fillRect(-7, -10, 14, 20); fx.strokeRect(-7, -10, 14, 20); } else { fx.beginPath(); fx.arc(0, 0, 8, 0, 7); fx.fill(); fx.stroke(); } fx.restore(); }
  }
  function starShape(x, y, r, rotA, col) { fx.save(); fx.translate(x, y); fx.rotate(rotA); fx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * .45 : r; fx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } fx.closePath(); fx.fillStyle = col; fx.strokeStyle = '#111'; fx.lineWidth = 3; fx.fill(); fx.stroke(); fx.restore(); }
  function drop(x, y, s) { fx.save(); fx.translate(x, y); fx.scale(s, s); fx.beginPath(); fx.moveTo(0, -16); fx.quadraticCurveTo(12, 2, 0, 10); fx.quadraticCurveTo(-12, 2, 0, -16); fx.fillStyle = '#6db7ff'; fx.strokeStyle = '#111'; fx.lineWidth = 3; fx.fill(); fx.stroke(); fx.restore(); }
  // where Alex's head is on screen, for the bubbles, drops and stars (no rotation)
  const headAt = (x, y, s) => [x, y - 255 * s * 1.25];

  function render(t) {
    const sc = CUTS.filter(c => t >= c).length;
    let lay = LAYERS[sc];
    if (sc === 5) lay = t < 17.45 ? ['s6'] : ['s6b', 's6p', 's6f'];
    allLayers.forEach(l => l.classList.toggle('on', lay.includes(l.id)));
    fx.clearRect(0, 0, 1280, 720);
    think.style.display = 'none'; $('#butterfly').style.display = 'none'; $('#boom').style.display = 'none'; $('#hand').style.display = 'none'; $('#helm').style.display = 'none'; A2.el.style.display = 'none';
    let cam = { z: 1, ox: 640, oy: 360, sx: 0, sy: 0 };
    const at = talk('alex', t), rt = talk('robot', t), bl = blinking(t);
    let robot = { show: false };

    if (sc === 0) { // ---- 1: walking through a German town
      const off = (t * 170) % HOUSE_W.total; $('#s1-houses').setAttribute('transform', 'translate(' + (-off) + ' 0)');
      $('#s1-far').setAttribute('transform', 'translate(' + (-(t * 40) % 1280) + ' 0)'); $('#s1-stones').setAttribute('transform', 'translate(' + (-(t * 170) % 60) + ' 0)');
      $('#s1-clouds').setAttribute('transform', 'translate(' + (-t * 12) + ' 0)');
      const w = walk(t, 1.8);
      poseAlex(A, { x: 470, y: 640, s: .95, cls: 'o-tee p-jeans', legL: w.legL, legR: w.legR, armL: w.armL, armR: w.armR, crouch: w.lift, head: Math.sin(t * 1.3) * 5, look: [Math.sin(t * 1.1) * .7, -.6], mouth: 'smile', brows: 'hap', blink: bl });
      const up = back(p(t, .3, .7)) * (1 - ei(p(t, 3.25, 3.6)));
      robot = { x: 1010, y: 690 + (1 - up) * 420, s: 1.05, armL: 95 * hold(t, .6, 3.2, .25) + Math.sin(t * 6) * 6, armR: -20, talk: rt, look: [-1, 0], blink: bl, bob: Math.sin(t * 3) * 3, rot: -4 };
      cam = { z: lerp(1, 1.06, eio(p(t, 0, 3.6))), ox: 700, oy: 420 };
    }
    if (sc === 1) { // ---- 2: locker room, no towel
      const lean = 1 - eio(p(t, 4.0, 4.25));
      const shrug = hold(t, 5.1, 6.6, .2);
      poseAlex(A, { x: 520, y: 660, s: 1, cls: 'o-tank p-shorts', rot: lean * 10, head: lean * 12 + Math.sin(t * 9) * at * 3, armR: lean * (-50 + Math.sin(t * 14) * 12) + shrug * -55, armL: shrug * 55, look: lean ? [1, 1] : [0, 0], brows: t > 4.05 ? 'ann' : 'n', mouth: t > 4.05 ? 'frown' : 'smile', talk: at, blink: bl });
      showThink(t, 4.4, 6.85, 210, 120, 'towel', 'x');
      // the guys in the back
      $('#g1-leg') && $('#g1-leg').setAttribute('transform', 'rotate(' + (-70 + Math.sin(t * 5) * 8) + ' 115 194)');
      $('#g2-mouth').setAttribute('ry', 2 + Math.abs(Math.sin(t * 11)) * 5 * (Math.sin(t * 1.7) > 0 ? 1 : 0));
      $('#g2-armR').setAttribute('transform', 'rotate(' + (-40 + Math.sin(t * 4) * 20) + ' 149 142)');
      $('#g3-butt').setAttribute('transform', 'translate(100 196) scale(1 ' + (1 + Math.sin(t * 9) * .03) + ') translate(-100 -196)');
      cam = { z: lerp(1, 1.14, eio(p(t, 4.05, 4.4))), ox: 520, oy: 380 };
    }
    if (sc === 2 || sc === 7) { // ---- 3: the front door (and the happy exit in the montage)
      const door = $('#s3-door');
      if (sc === 2) {
        const shut = t < 7.15 ? .12 : Math.min(1, back(p(t, 7.15, 7.3)));
        door.setAttribute('transform', 'translate(672 0) scale(' + shut + ' 1) translate(-672 0)');
        const moving = t < 7.5, w = walk(Math.min(t, 7.45), 2.2);
        const x = lerp(760, 400, eo(p(t, 6.9, 7.5)));
        const freeze = p(t, 7.45, 7.55);
        poseAlex(A, { x, y: 650, s: 1, cls: 'o-jacket p-jeans', legL: w.legL, legR: w.legR, armL: w.armL, armR: w.armR, crouch: moving ? w.lift : 0, rot: freeze ? Math.sin((t - 7.45) * 40) * 3 * (1 - p(t, 7.5, 7.8)) : 0, look: t > 7.7 ? [.8, -1] : [0, 0], brows: t > 7.6 ? 'wor' : 'n', mouth: t > 7.6 ? 'frown' : 'smile', talk: at, blink: bl, eyeS: t > 7.5 && t < 7.7 ? 1.25 : 1 });
        if (t > 7.7) { const k = (t - 7.7) % 1.1; drop(...[x + 110, 300 + k * 60], 1.2 * cl(1 - k)); }
        showThink(t, 8.0, 10.3, 110, 90, 'window', 'q');
        const curt = $('#s3-curt'); const w2 = Math.sin(t * 6) * 20; curt && curt.setAttribute('d', `M900 60h150v40q-${40 + w2} 60 -${20 - w2 * .5} 120h-130z`);
        cam = { z: lerp(1, 1.1, eio(p(t, 7.5, 7.9))), ox: 520, oy: 360 };
      } else {
        door.setAttribute('transform', 'translate(672 0) scale(.12 1) translate(-672 0)');
        const k = p(t, 26.7, 27.7), hop = Math.abs(Math.sin(k * Math.PI * 2.2));
        poseAlex(A, { x: lerp(800, 520, k), y: 650 - hop * 90, s: 1, cls: 'o-jacket p-jeans h-phone', armL: 150 + Math.sin(t * 20) * 10, armR: -150, legL: -hop * 20, legR: hop * 20, brows: 'hap', mouth: 'open', blink: false, shadow: 1 - hop * .6 });
        for (let i = 0; i < 4; i++) starShape(lerp(800, 520, k) + Math.cos(t * 4 + i * 1.6) * 170, 300 + Math.sin(t * 4 + i * 1.6) * 80, 14, t * 3, '#ffe14d');
      }
    }
    if (sc === 3) { // ---- 4: airport, no passport
      const pat = hold(t, 10.45, 11.5, .1), pp = Math.sin(t * 22);
      const panic = p(t, 10.75, 10.85);
      poseAlex(A, { x: 400, y: 660, s: 1, cls: 'o-hawaii p-swim a-glasses', armL: pat * (18 + pp * 14), armR: pat * (-18 - pp * 14) + panic * (1 - pat) * -150, head: pat * pp * 3, eyeS: 1 + panic * .25, brows: panic ? 'wor' : 'hap', mouth: panic ? 'open' : 'smile', talk: at, glassY: panic * 22, blink: bl, rot: Math.sin(t * 30) * panic * 1.5 });
      $('#s4-case').setAttribute('transform', 'translate(150 500)');
      $('#s4-plane').setAttribute('transform', 'translate(' + lerp(-100, 640, p(t, 10.35, 12.7)) + ' ' + lerp(260, 120, p(t, 10.35, 12.7)) + ') rotate(-10)');
      if (panic) { for (let i = 0; i < 3; i++) { const k = ((t - 10.8) * 1.6 + i / 3) % 1; drop(400 + (i - 1) * 140 * k + (i - 1) * 40, 260 - k * 40 + k * k * 120, 1.1 * (1 - k)); } }
      showThink(t, 11.0, 12.65, 140, 80, 'passport', 'x');
      cam = { z: t < 10.78 ? 1 : lerp(1.06, 1.2, eo(p(t, 10.78, 10.95))), ox: 420, oy: 330, sx: panic ? Math.sin(t * 50) * 2 : 0 };
    }
    if (sc === 4) { // ---- 5: the old bomb and a butterfly
      const boom = t >= 15.75, fly = p(t, 15.85, 16.5);
      // butterfly path: in from the left, around his head, away to the right
      const bk = p(t, 12.95, 15.4); const bx = bk < .35 ? lerp(-60, 330, bk / .35) : bk < .8 ? 380 + Math.cos((bk - .35) / .45 * Math.PI * 2) * 120 : lerp(500, 1300, (bk - .8) / .2);
      const by = bk < .35 ? lerp(260, 310, bk / .35) + Math.sin(t * 7) * 18 : bk < .8 ? 300 + Math.sin((bk - .35) / .45 * Math.PI * 2) * 60 : lerp(300, 60, (bk - .8) / .2);
      if (t < 15.5) { const b = $('#butterfly'); b.style.display = 'block'; b.style.transform = 'translate(' + (bx - 40) + 'px,' + (by - 35) + 'px) rotate(' + Math.sin(t * 5) * 12 + 'deg)'; const fl = .25 + Math.abs(Math.sin(t * 28)) * .75; $('#bfl').setAttribute('transform', 'scale(' + fl + ' 1)'); $('#bfr').setAttribute('transform', 'scale(' + fl + ' 1)'); }
      const hx = 380, hy = 640 - 260;
      const lx = cl((bx - hx) / 160, -1, 1), ly = cl((by - hy) / 120, -1, 1);
      const dreamy = p(t, 13.3, 13.5);
      if (!boom) poseAlex(A, { x: 380, y: 650, s: 1, cls: 'o-tee p-jeans a-vest a-helmet h-tool', legL: 38, legR: -38, crouch: 34, armR: lerp(-70, -20, dreamy) + Math.sin(t * 2) * 6 * dreamy, armL: 10, head: dreamy * lx * 8, look: t > 13 ? [lx, ly] : [1, 1], brows: dreamy ? 'hap' : 'n', mouth: 'smile', talk: at, blink: bl });
      else poseAlex(A, { x: lerp(380, 1000, eo(fly)), y: 650 - Math.sin(fly * Math.PI * .9) * 760 - fly * 200, s: 1, rot: fly * 620, cls: 'o-tee p-jeans a-vest a-helmet', eyes: 'spiral', mouth: 'open', talk: at, armL: 150, armR: -150, legL: 30, legR: -30, shadow: 0 });
      const shake = t > 14.9 && !boom ? Math.sin(t * 60) * 3 * p(t, 14.9, 15.7) : 0;
      $('#s5-bomb').setAttribute('transform', 'translate(' + shake + ' 0)' + (boom ? ' scale(0)' : ''));
      $('#s5-light').setAttribute('fill', (Math.floor(t * (t > 14.9 ? 10 : 3)) % 2) ? '#ff4d6d' : '#5a1020');
      if (boom) { const k = p(t, 15.75, 16.5), bm = $('#boom'); bm.style.display = 'block'; bm.style.transform = 'translate(340px,280px)';
        PUFFS.forEach((q, i) => { const r = q.r * eo(cl(k * 1.6)) * (1 + k * .4); q.e.setAttribute('cx', Math.cos(q.a) * q.d * eo(k)); q.e.setAttribute('cy', Math.sin(q.a) * q.d * eo(k) * .7); q.e.setAttribute('r', r); q.e.setAttribute('fill', q.c); });
        PUFFS.core.setAttribute('r', 150 * eo(cl(k * 2))); PUFFS.star.setAttribute('transform', 'scale(' + back(cl(k * 3)) * .8 + ') rotate(' + k * 20 + ')'); PUFFS.text.setAttribute('transform', 'scale(' + back(cl(k * 3)) + ') rotate(-8)'); }
      showThink(t, 99, 0);
      cam = { z: lerp(1, 1.12, eio(p(t, 13.2, 13.6))) * (boom ? 1 : 1), ox: 420, oy: 380, sx: boom ? Math.sin(t * 70) * 14 * (1 - p(t, 15.75, 16.4)) : 0, sy: boom ? Math.cos(t * 60) * 10 * (1 - p(t, 15.75, 16.4)) : 0 };
    }
    if (sc === 5) { // ---- 6: falling from the sky onto his bed
      if (t < 17.45) {
        for (let i = 0; i < 9; i++) { const c = $('#fc' + i), y = ((rnd(i) * 900 - (t - 16.5) * 1400) % 900 + 900) % 900 - 120; c.setAttribute('transform', 'translate(' + (rnd(i + 4) * 1200) + ' ' + y + ') scale(' + (.8 + rnd(i + 2)) + ')'); }
        for (let i = 0; i < 14; i++) { const y = ((rnd(i + 30) * 720 - (t - 16.5) * 2400) % 820 + 820) % 820 - 100; $('#fl' + i).setAttribute('transform', 'translate(' + (rnd(i + 40) * 1280) + ' ' + y + ')'); }
        poseAlex(A, { x: 640 + Math.sin(t * 5) * 80, y: 520, s: .9, rot: (t - 16.5) * 700, cls: 'o-tee p-jeans a-vest a-helmet', eyes: 'spiral', mouth: 'open', talk: at, armL: 150 + Math.sin(t * 25) * 20, armR: -150 + Math.sin(t * 25) * 20, legL: Math.sin(t * 20) * 30, legR: -Math.sin(t * 20) * 30, shadow: 0 });
        cam = { z: 1.05, ox: 640, oy: 360, sx: Math.sin(t * 40) * 4 };
      } else {
        const land = p(t, 17.45, 17.75), bounce = t > 17.75 ? Math.exp(-(t - 17.75) * 6) * Math.sin((t - 17.75) * 22) : 0;
        const y = t < 17.75 ? lerp(-260, 470, ei(land)) : 470 - bounce * 26;
        poseAlex(A, { x: 650, y, s: .95, rot: -90, cls: 'o-tee p-jeans a-vest' + (t < 17.75 ? ' a-helmet' : ''), eyes: t > 17.75 ? 'spiral' : 'n', mouth: t > 17.75 ? 'o' : 'open', talk: t < 17.75 ? at : 0, armL: 20, armR: -30, legL: 6, legR: -6, shadow: 0, head: Math.sin(t * 4) * 6 * (t > 17.8) });
        $('#s6-bed').setAttribute('transform', 'translate(0 520) scale(1 ' + (1 - bounce * .05 - (t > 17.73 && t < 17.8 ? .06 : 0)) + ') translate(0 -520)');
        if (t > 17.75) { const k = p(t, 17.75, 18.4), h = $('#helm'); if (k < 1) { h.style.display = 'block'; h.style.transform = 'translate(' + lerp(330, 900, k) + 'px,' + (430 - Math.sin(k * Math.PI) * 330 + k * 200) + 'px) rotate(' + k * 520 + 'deg)'; } }
        if (t > 17.85) { const hx = 300, hy = 470; for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; starShape(hx + Math.cos(a) * 80, hy - 70 + Math.sin(a) * 24, 16, t * 4, i % 2 ? '#ffe14d' : '#fff'); } }
        cam = { z: lerp(1.15, 1.25, p(t, 17.8, 19.2)), ox: 470, oy: 450, sy: t > 17.75 && t < 18 ? Math.sin(t * 80) * 8 : 0 };
      }
    }
    if (sc === 6) { // ---- 7: the co-pilot returns, now he has the app
      $('#s7-rays').setAttribute('transform', 'rotate(' + t * 8 + ' 640 360)');
      const up = back(p(t, 19.25, 19.6));
      robot = { x: 250, y: 680 + (1 - up) * 500, s: 1.3, talk: rt, armL: 140 * hold(t, 19.5, 20.6, .2) + Math.sin(t * 12) * 12 * hold(t, 19.5, 20.6, .2), armR: -100 * hold(t, 20.9, 25.6, .3) + Math.sin(t * 3) * 6, blink: bl, look: [1, -.2], bob: Math.sin(t * 3) * 3 };
      const ain = back(p(t, 19.45, 19.85));
      const thumb = hold(t, 24.5, 26.4, .2);
      poseAlex(A, { x: lerp(1500, 1070, ain), y: 670, s: 1.02, cls: 'o-tee p-jeans h-phone', armR: -120 - thumb * 30 + Math.sin(t * 2) * 5, armL: thumb * 150, brows: 'hap', mouth: t > 24.5 ? 'open' : 'smile', blink: bl, head: Math.sin(t * 2.4) * 4, look: [-.6, 0], crouch: Math.sin(t * 6) * 2 });
      [['#b1', 20.2, 455, 110], ['#b2', 21.5, 430, 320], ['#b3', 22.85, 600, 320], ['#b4', 24.55, 770, 320]].forEach(([s, a, x, y]) => {
        const k = back(p(t, a, a + .35)), b = $(s); b.style.transform = 'translate(' + x + 'px,' + (y + Math.sin(t * 3 + x) * 5) + 'px) scale(' + k + ') rotate(' + (1 - k) * -14 + 'deg)'; b.style.opacity = t > a ? 1 : 0; });
      cam = { z: lerp(1.08, 1, eo(p(t, 19.2, 19.8))), ox: 640, oy: 360 };
    }
    if (sc === 8) { // ---- 8b: gym squat with a heavy bar
      const k = p(t, 27.75, 28.65), d = Math.sin(k * Math.PI);
      poseAlex(A, { x: 640, s: 1, cls: 'o-tank p-shorts a-towel', y: 650 + 10 * d, legL: 42 * d, legR: -42 * d, crouch: 24 * d, armL: 122, armR: -122, head: Math.sin(t * 30) * 2 * d, brows: d > .3 ? 'ann' : 'hap', mouth: d > .3 ? 'frown' : 'smile', blink: false });
      const barY = 650 + 10 * d - 352 + (116 + 40) * 1.25 + 24 * d * 1.25;
      $('#bar').setAttribute('transform', 'translate(640 ' + barY + ') rotate(' + Math.sin(t * 9) * 1.5 + ')');
      if (d > .5) drop(760, 290 + d * 40, 1);
      cam = { z: 1.04, ox: 640, oy: 400 };
    }
    if (sc === 9) { // ---- 8c: beach with a drink
      let d = 'M0 380'; for (let x = 0; x <= 1280; x += 40) d += 'L' + x + ' ' + (380 + Math.sin(x / 80 + t * 4) * 8); d += 'L1280 400L0 400Z'; $('#s8c-wave').setAttribute('d', d);
      const sip = hold(t, 29.0, 29.6, .15);
      poseAlex(A, { x: 880, y: 574, s: .95, rot: -64, cls: 'o-hawaii p-swim a-glasses h-drink', armR: -100 - sip * 50, armL: 150 + Math.sin(t * 2) * 6, legL: 8, legR: -14 + Math.sin(t * 3) * 10, mouth: sip > .5 ? 'o' : 'smile', brows: 'hap', shadow: 0, head: 26 });
      cam = { z: 1.02, ox: 640, oy: 360 };
    }
    if (sc === 10) { // ---- 9: three taps on the phone
      $('#s9-rays').setAttribute('transform', 'rotate(' + t * 8 + ' 640 360)');
      const TAPS = [30.3, 31.05, 32.05];
      const done = TAPS.filter(x => t > x + .05).length;
      TAPS.forEach((x, i) => { const g = $('#it' + i); g.querySelector('.tk').setAttribute('stroke-dashoffset', 60 * (1 - p(t, x, x + .15))); g.querySelector('.card').setAttribute('fill', t > x + .05 ? '#e9fff4' : '#fff'); g.setAttribute('transform', 'translate(430 ' + (240 + i * 130) + ') ' + (t > x && t < x + .25 ? 'translate(210 52) scale(' + (1 + Math.sin(p(t, x, x + .25) * Math.PI) * .05) + ') translate(-210 -52)' : '')); });
      $('#s9-bar').setAttribute('width', 350 * done / 3); $('#s9-count').textContent = done + ' / 3';
      // the finger: comes up, taps each box, leaves
      let tx = 920, ty = 900; const box = i => [430 + 368, 240 + i * 130 + 52];
      for (let i = 0; i < 3; i++) { const a = TAPS[i] - .35; if (t >= a) { const [bx, by] = box(i); const from = i ? box(i - 1) : [900, 900]; const k = eo(p(t, a, TAPS[i] - .05)); tx = lerp(from[0], bx, k); ty = lerp(from[1], by, k) + (t > TAPS[i] - .05 && t < TAPS[i] + .12 ? 10 : 0); } }
      if (t > 32.4) { const k = ei(p(t, 32.4, 32.9)); ty += k * 600; }
      const hd = $('#hand'); hd.style.display = 'block'; hd.style.transform = 'translate(' + (tx - 82) + 'px,' + (ty - 27) + 'px)';
      confetti(t, 32.15, 640, 360, 50, 3);
      const up = back(p(t, 29.85, 30.15));
      robot = { x: 170, y: 760 + (1 - up) * 400, s: 1.15, rot: 8, talk: rt, armL: 0, armR: -150 * hold(t, 30.2, 33.2, .2) + Math.sin(t * 10) * 10, look: [1, -.5], blink: bl };
      cam = { z: lerp(1.15, 1, eo(p(t, 29.7, 30.2))), ox: 640, oy: 360 };
    }
    if (sc === 11) { // ---- end card
      $('#sE-rays').setAttribute('transform', 'rotate(' + t * 8 + ' 640 360)');
      const b = back(p(t, 33.45, 33.8)), c = back(p(t, 33.75, 34.05));
      $('#eBrand').style.transform = 'scale(' + b + ') rotate(' + (1 - b) * -8 + 'deg)'; $('#eCta').style.transform = 'scale(' + c + ')';
      const ai = back(p(t, 33.6, 34)), ri = back(p(t, 33.7, 34.1));
      poseAlex(A, { x: 170, y: 720 + (1 - ai) * 400, s: .85, cls: 'o-tee p-jeans', armL: 140 + Math.sin(t * 14) * 18, brows: 'hap', mouth: 'smile', blink: bl });
      robot = { x: 1110, y: 720 + (1 - ri) * 400, s: 1, armR: -140 + Math.sin(t * 14) * 18, look: [-1, 0], blink: bl };
      confetti(t, 33.5, 640, 330, 54, 3);
    }
    if (sc === 10) A.el.style.display = 'none';
    poseRobot(robot);

    // camera
    world.style.transformOrigin = cam.ox + 'px ' + cam.oy + 'px';
    world.style.transform = 'translate(' + (cam.sx || 0) + 'px,' + (cam.sy || 0) + 'px) scale(' + cam.z + ')';
    // transitions
    let wx = 3000; WIPES.forEach(c => { if (Math.abs(t - c) < .22) wx = lerp(-1900, 1500, (t - (c - .22)) / .44); }); $('#wipe').style.transform = 'translateX(' + wx + 'px) skewX(-14deg)';
    let fl = 0; FLASH.forEach(f => { if (t >= f && t < f + .2) fl = Math.max(fl, 1 - (t - f) / .2); }); $('#flash').style.opacity = fl;
  }

  // ---------- playback ----------
  window.LEN = LEN; window.seek = render;
  const stage = $('#stage');
  function fit() { const s = Math.min(innerWidth / 1280, innerHeight / 720); stage.style.transform = 'translate(' + ((innerWidth - 1280 * s) / 2) + 'px,' + ((innerHeight - 720 * s) / 2) + 'px) scale(' + s + ')'; }
  if (location.search.includes('render')) { document.documentElement.classList.add('render'); render(0); return; }
  addEventListener('resize', fit); fit(); render(12);
  let lang = 'en', playing = false, t0 = 0;
  $('#lang').addEventListener('click', () => { lang = lang === 'en' ? 'de' : 'en'; $('#lang').textContent = lang.toUpperCase(); });
  $('#play').addEventListener('click', () => {
    const au = $('#vo-' + lang); $('#play').hidden = true; playing = true; t0 = performance.now(); au.currentTime = 0; au.play().catch(() => {});
    (function loop() { if (!playing) return; const t = !au.paused && au.currentTime > 0 ? au.currentTime : (performance.now() - t0) / 1000; render(Math.min(t, LEN)); if (t < LEN) requestAnimationFrame(loop); else { playing = false; $('#play').hidden = false; } })();
  });
})();
