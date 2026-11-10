// "Alex is a quite distracted person", rebuilt in real 3D. Same script, timing and gags as the 2D film (story.js),
// so the existing voice tracks, music and subtitles still fit. Every frame is a pure function of time: window.seek(t).
import { THREE, C, DEG, rnd, cl, p, eo, ei, eio, back, hold, lerp } from './lib.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { makeAlex, makeRobot } from './actors.js';
import * as SETS from './sets.js';
import { at, sAt, D, CY, K } from './sets.js';
import { makeFx } from './fx.js';

const Q = new URLSearchParams(location.search), W = +(Q.get('w') || 1920), H = Math.round(W * 9 / 16), FAST = Q.has('fast'), LEN = 35;
await document.fonts.load('800 80px "Bricolage Grotesque"', 'Checklist Pro 3× BOOM! CHECK-IN Open the app ?'); await document.fonts.load('700 28px "Space Grotesk"', 'Towel Windows closed Passport 0123 /'); await document.fonts.ready;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.toneMapping = THREE.NeutralToneMapping;
SETS.setEnv(new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture);
const camera = new THREE.PerspectiveCamera(28, 16 / 9, .5, 400); camera.position.set(0, CY, D); camera.lookAt(0, CY, 0);
const out = document.createElement('canvas'); out.width = W; out.height = H; out.style.cssText = 'width:100vw;height:56.25vw;max-height:100vh;max-width:177.78vh;display:block;margin:auto'; document.body.appendChild(out); const ctx = out.getContext('2d');

const A = makeAlex(), R = makeRobot(), FX = makeFx();
const built = {}, B = { street: SETS.buildStreet, locker: SETS.buildLocker, door: SETS.buildDoor, airport: SETS.buildAirport, site: SETS.buildSite, sky: SETS.buildSky, bedroom: SETS.buildBedroom, studio: SETS.buildStudio, gym: SETS.buildGym, beach: SETS.buildBeach, phone: SETS.buildPhone, end: SETS.buildEnd };
const get = n => built[n] || (built[n] = B[n]());

const rp = new RenderPass(new THREE.Scene(), camera), composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(W, H, { samples: FAST ? 0 : 4, type: THREE.HalfFloatType }));
composer.addPass(rp);
const bokeh = FAST ? null : new BokehPass(rp.scene, camera, { focus: D, aperture: .00017, maxblur: .006 }); if (bokeh) composer.addPass(bokeh);
composer.addPass(new OutputPass());
composer.addPass(new ShaderPass({ uniforms: { tDiffuse: { value: null } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
  fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; float h(vec2 q){ return fract(sin(dot(q, vec2(12.9898, 78.233))) * 43758.5453); }
    void main(){ vec4 c = texture2D(tDiffuse, vUv); vec2 q = vUv - .5; float v = smoothstep(.35, .95, length(q * vec2(1., .82)) * 1.5);
      c.rgb = mix(c.rgb, c.rgb * vec3(.55, .5, .62), v * .26); float l = dot(c.rgb, vec3(.299, .587, .114)); c.rgb = mix(vec3(l), c.rgb, 1.1);
      c.rgb = c.rgb * c.rgb * (3. - 2. * c.rgb) * .35 + c.rgb * .65; c.rgb += (h(gl_FragCoord.xy) - .5) * .02; gl_FragColor = c; }` }));

// ---------- helpers from the original ----------
const VO = window.VO;
function talk(who, t) { let v = 0; VO.lines.forEach(l => { if (l.who !== who) return; const i = Math.floor((t - l.t) * 60); if (i < 0) return; v = Math.max(v, l.en[i] || 0, l.de[i] || 0); }); return v; }
const BLINK = [1.2, 2.9, 5.6, 8.9, 12.1, 14.2, 20.4, 22.1, 24.0, 25.8, 31.2, 34.0], blinking = t => BLINK.some(b => t > b && t < b + .12);
const walk = (t, f, amp = 1) => { const s = Math.sin(t * Math.PI * 2 * f); return { s: s * amp, lift: Math.abs(Math.cos(t * Math.PI * 2 * f)) * .07 * amp }; };
const X = px => (px - 640) / K, Yg = (py, g) => (g - py) / K;
// spin around the middle of the body instead of the feet
const spun = (o, pivot = 1.1) => { const a = -o.rot * DEG, s = o.s || 1; o.x += Math.sin(a) * pivot * s; o.y += pivot * s - Math.cos(a) * pivot * s; return o; };
const CUTS = [3.6, 6.9, 10.35, 12.7, 16.5, 19.2, 26.7, 27.7, 28.7, 29.7, 33.35], WIPES = [3.6, 6.9, 10.35, 12.7, 19.2, 33.35], FLASH = [15.75, 17.45, 26.7, 27.7, 28.7, 29.7];
const robotIn = (px, s, up, from) => ({ x: (lerp(from, px, cl(up, 0, 1.08)) - 640) / (K * s), y: Math.sin(cl(up) * Math.PI) * .45, z: D * (1 - 1 / s), s: 1 });

// ---------- the phone screen ----------
const ITEMS = [['Towel', 'towel'], ['Windows closed', 'window'], ['Passport', 'passport']], TAPS = [30.3, 31.05, 32.05];
import { ICON, P2 } from './lib.js';
function drawScreen(S, t) {
  const g = S.canvas.getContext('2d'); g.setTransform(2, 0, 0, 2, 0, 0); g.lineJoin = g.lineCap = 'round'; g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.fillStyle = '#ff4a4a'; g.fillRect(0, 0, 476, 856);
  const rr = (x, y, w, h, r, fill, lw = 3.5) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = '#111'; g.stroke(); } };
  rr(28, 70, 34, 34, 7, '#ffe14d', 3); g.lineWidth = 4; g.beginPath(); g.moveTo(36, 88); g.lineTo(42, 94); g.lineTo(54, 81); g.stroke();
  g.fillStyle = '#111'; g.font = '800 30px "Bricolage Grotesque"'; g.fillText('Checklist', 74, 98); const tw = g.measureText('Checklist').width; rr(74 + tw + 6, 70, 62, 38, 5, '#ffe14d', 3); g.fillStyle = '#111'; g.fillText('Pro', 74 + tw + 12, 99);
  const done = TAPS.filter(x => t > x + .05).length;
  rr(28, 134, 350, 22, 4, '#fff'); if (done) rr(28, 134, 350 * done / 3, 22, 4, '#6df5b9'); g.fillStyle = '#111'; g.font = '700 22px "Space Grotesk"'; g.fillText(done + ' / 3', 394, 154);
  ITEMS.forEach(([n, ic], i) => {
    const x = TAPS[i], k = t > x && t < x + .25 ? 1 + Math.sin(p(t, x, x + .25) * Math.PI) * .05 : 1; g.save(); g.translate(28 + 210, 198 + i * 130 + 52); g.scale(k, k); g.translate(-210, -52);
    rr(0, 0, 420, 104, 8, t > x + .05 ? '#e9fff4' : '#fff'); g.save(); g.translate(14, 14); g.scale(.8, .8); ICON[ic](g); g.restore();
    g.fillStyle = '#111'; g.font = '700 28px "Space Grotesk"'; g.fillText(n, 96, 63); rr(342, 26, 52, 52, 8, '#fff');
    const d = p(t, x, x + .15); if (d > 0) { g.lineWidth = 8; g.strokeStyle = '#111'; g.setLineDash([60, 60]); g.lineDashOffset = 60 * (1 - d); g.beginPath(); g.moveTo(352, 52); g.lineTo(364, 64); g.lineTo(386, 40); g.stroke(); g.setLineDash([]); }
    g.restore();
  });
  S.tex.needsUpdate = true;
}

// ---------- one frame ----------
function render(t) {
  t = cl(t, 0, LEN - .001);
  const sc = CUTS.filter(c => t >= c).length, at_ = talk('alex', t), rt = talk('robot', t), bl = blinking(t);
  let cam = { z: 1, ox: 640, oy: 360 }, S, alex = { show: false }, robot = { show: false };
  const name = ['street', 'locker', 'door', 'airport', 'site', t < 17.45 ? 'sky' : 'bedroom', 'studio', 'door', 'gym', 'beach', 'phone', 'end'][sc];
  S = get(name); const scene = S.scene; FX.begin(scene); if (A.root.parent !== scene) scene.add(A.root); if (R.root.parent !== scene) scene.add(R.root);

  if (sc === 0) { // ---- 1: walking through a German town
    S.world.position.x = -t * 1.36; const w = walk(t, 1.8);
    alex = { x: X(470), y: w.lift * .5, s: .95, yaw: 52, legLx: 30 * w.s, legRx: -30 * w.s, armLx: -26 * w.s, armRx: 26 * w.s, armL: 6, armR: -6, head: Math.sin(t * 1.3) * 5, headYaw: -30 + Math.sin(t * 1.1) * 22, headPitch: -6, look: [Math.sin(t * 1.1) * .7, -.6], brows: 'hap', blink: bl };
    const up = back(p(t, .3, .7)) * (1 - ei(p(t, 3.25, 3.6)));
    robot = { ...robotIn(1010, 1.05, up, 1560), rot: -4, yaw: -22, armL: 95 * hold(t, .6, 3.2, .25) + Math.sin(t * 6) * 6, armLx: 20, armR: -20, talk: rt, look: [-1, 0], blink: bl, bob: Math.sin(t * 3) * 3 };
    cam = { z: lerp(1, 1.06, eio(p(t, 0, 3.6))), ox: 700, oy: 420 };
  }
  if (sc === 1) { // ---- 2: locker room, no towel
    const lean = 1 - eio(p(t, 4.0, 4.25)), shrug = hold(t, 5.1, 6.6, .2);
    alex = { x: X(520), cls: 'o-tank p-shorts', rot: lean * 8, pitch: lean * 22, yaw: lean * 30, head: lean * 12 + Math.sin(t * 9) * at_ * 3, armR: lean * (-30 + Math.sin(t * 14) * 12) + shrug * -55, armRx: lean * 55, armL: shrug * 55, look: lean ? [1, 1] : [0, 0], brows: t > 4.05 ? 'ann' : 'n', mouth: t > 4.05 ? 'frown' : 'smile', talk: at_, blink: bl };
    FX.showThink(t, 4.4, 6.85, 210, 120, 'towel', 'x');
    S.g1.leg.rotation.x = -(62 + Math.sin(t * 5) * 8) * DEG; S.g1.arms.forEach((a, i) => a.rotation.x = -(48 + Math.sin(t * 5 + i) * 6) * DEG);
    S.g2.mouth.scale.y = (2 + Math.abs(Math.sin(t * 11)) * 5 * (Math.sin(t * 1.7) > 0 ? 1 : 0)) / 100; S.g2.arms[1].rotation.z = (40 - Math.sin(t * 4) * 20) * DEG; S.g2.arms[1].rotation.x = -.5;
    S.g3.butt.children.forEach((b, i) => b.position.y = Math.sin(t * 9 + i * Math.PI) * .025);
    cam = { z: lerp(1, 1.14, eio(p(t, 4.05, 4.4))), ox: 520, oy: 380 };
  }
  if (sc === 2 || sc === 7) { // ---- 3: the front door (and the happy exit in the montage)
    const swing = shut => { const a = (1 - shut) * 84 * DEG; S.leaves[0].rotation.y = a; S.leaves[1].rotation.y = -a; };
    S.curtain.rotation.set(-(.45 + Math.sin(t * 6) * .3), 0, Math.sin(t * 6 + 1) * .12);
    if (sc === 2) {
      swing(t < 7.15 ? .12 : Math.min(1.04, back(p(t, 7.15, 7.3))));
      const moving = t < 7.5, w = walk(Math.min(t, 7.45), 2.2), x = lerp(760, 400, eo(p(t, 6.9, 7.5))), freeze = p(t, 7.45, 7.55), turn = 1 - eio(p(t, 7.4, 7.65));
      alex = { x: X(x), y: moving ? w.lift * .5 : 0, cls: 'o-jacket p-jeans', yaw: -62 * turn, legLx: 30 * w.s * turn, legRx: -30 * w.s * turn, armLx: -26 * w.s * turn, armRx: 26 * w.s * turn, rot: freeze ? Math.sin((t - 7.45) * 40) * 3 * (1 - p(t, 7.5, 7.8)) : 0,
        look: t > 7.7 ? [.8, -1] : [0, 0], headYaw: t > 7.7 ? 24 * eio(p(t, 7.7, 7.95)) : 0, headPitch: t > 7.7 ? -12 * eio(p(t, 7.7, 7.95)) : 0, brows: t > 7.6 ? 'wor' : 'n', mouth: t > 7.6 ? 'frown' : 'smile', talk: at_, blink: bl, eyeS: t > 7.5 && t < 7.7 ? 1.25 : 1 };
      if (t > 7.7) { const k = (t - 7.7) % 1.1; FX.drop(x + 105, 290 + k * 60, 1.2 * cl(1 - k)); }
      FX.showThink(t, 8.0, 10.3, 110, 90, 'window', 'q');
      cam = { z: lerp(1, 1.1, eio(p(t, 7.5, 7.9))), ox: 520, oy: 360 };
    } else {
      swing(.12); const k = p(t, 26.7, 27.7), hop = Math.abs(Math.sin(k * Math.PI * 2.2)), x = lerp(800, 520, k);
      alex = { x: X(x), y: hop * .72, cls: 'o-jacket p-jeans h-phone', yaw: -18, armL: 150 + Math.sin(t * 20) * 10, armR: -150, legL: -hop * 20, legR: hop * 20, brows: 'hap', mouth: 'open', shadow: 1 - hop * .6 };
      for (let i = 0; i < 4; i++) FX.star(at(x + Math.cos(t * 4 + i * 1.6) * 170, 300 + Math.sin(t * 4 + i * 1.6) * 80, .4 + Math.sin(t * 4 + i * 1.6) * .5), 15, t * 3, i % 2);
    }
  }
  if (sc === 3) { // ---- 4: airport, no passport
    const pat = hold(t, 10.45, 11.5, .1), pp = Math.sin(t * 22), panic = p(t, 10.75, 10.85), q = p(t, 10.35, 12.7);
    alex = { x: X(400), cls: 'o-hawaii p-swim a-glasses', armL: pat * (18 + pp * 14), armLx: pat * 22, armR: pat * (-18 - pp * 14) + panic * (1 - pat) * -150, armRx: pat * 22, head: pat * pp * 3, headPitch: pat * (1 - panic) * 14, eyeS: 1 + panic * .25, brows: panic ? 'wor' : 'hap', mouth: panic ? 'open' : 'smile', talk: at_, glassY: panic * 22, blink: bl, rot: Math.sin(t * 30) * panic * 1.5 };
    S.plane.position.set(...at(lerp(-100, 640, q) + 80, lerp(260, 120, q), -7)); S.plane.rotation.z = 10 * DEG; S.g4.arms[0].rotation.z = -(20 + Math.sin(t * 3) * 6) * DEG;
    if (panic) for (let i = 0; i < 3; i++) { const k = ((t - 10.8) * 1.6 + i / 3) % 1; FX.drop(400 + (i - 1) * 140 * k + (i - 1) * 40, 250 - k * 40 + k * k * 120, 1.1 * (1 - k)); }
    FX.showThink(t, 11.0, 12.65, 140, 80, 'passport', 'x');
    cam = { z: t < 10.78 ? 1 : lerp(1.06, 1.2, eo(p(t, 10.78, 10.95))), ox: 420, oy: 330, sx: panic ? Math.sin(t * 50) * 2 : 0 };
  }
  if (sc === 4) { // ---- 5: the old bomb and a butterfly
    const boom = t >= 15.75, fly = p(t, 15.85, 16.5), bk = p(t, 12.95, 15.4);
    const bx = bk < .35 ? lerp(-60, 330, bk / .35) : bk < .8 ? 380 + Math.cos((bk - .35) / .45 * Math.PI * 2) * 120 : lerp(500, 1300, (bk - .8) / .2);
    const by = bk < .35 ? lerp(260, 310, bk / .35) + Math.sin(t * 7) * 18 : bk < .8 ? 300 + Math.sin((bk - .35) / .45 * Math.PI * 2) * 60 : lerp(300, 60, (bk - .8) / .2);
    if (t < 15.5) FX.showFly(at(bx, by, bk < .35 || bk >= .8 ? .5 : .5 + Math.sin((bk - .35) / .45 * Math.PI * 2 + 1.2) * .9), t);
    const lx = cl((bx - 380) / 160, -1, 1), ly = cl((by - 390) / 120, -1, 1), dreamy = p(t, 13.3, 13.5);
    if (!boom) alex = { x: X(380), cls: 'o-tee p-jeans a-vest a-helmet h-tool', yaw: 24 * (1 - dreamy), legL: 38, legR: -38, crouch: 34, y: -.06, armR: lerp(-62, -20, dreamy) + Math.sin(t * 2) * 6 * dreamy, armRx: 40 * (1 - dreamy * .6), armL: 10, head: dreamy * lx * 8, headYaw: dreamy * lx * 26, headPitch: dreamy * ly * 14, look: t > 13 ? [lx, ly] : [1, 1], brows: dreamy ? 'hap' : 'n', talk: at_, blink: bl };
    else alex = spun({ x: X(lerp(380, 1000, eo(fly))), y: (Math.sin(fly * Math.PI * .9) * 760 + fly * 200) / K, rot: fly * 620, pitch: fly * 300, cls: 'o-tee p-jeans a-vest a-helmet', eyes: 'spiral', mouth: 'open', talk: at_, armL: 150, armR: -150, legL: 30, legR: -30, shadow: 0 });
    const shake = t > 14.9 && !boom ? Math.sin(t * 60) * 3 * p(t, 14.9, 15.7) : 0;
    S.bomb.position.x = -.1 + shake / K; S.bomb.rotation.z = shake * .004; S.bomb.visible = !boom; S.light.material.emissiveIntensity = (Math.floor(t * (t > 14.9 ? 10 : 3)) % 2) ? 3 : .12;
    if (boom) FX.showBoom(p(t, 15.75, 16.5));
    cam = { z: lerp(1, 1.12, eio(p(t, 13.2, 13.6))), ox: 420, oy: 380, sx: boom ? Math.sin(t * 70) * 14 * (1 - p(t, 15.75, 16.4)) : 0, sy: boom ? Math.cos(t * 60) * 10 * (1 - p(t, 15.75, 16.4)) : 0 };
  }
  if (sc === 5) { // ---- 6: falling from the sky onto his bed
    if (t < 17.45) {
      S.clouds.forEach((c, i) => { const y = ((rnd(i) * 900 - (t - 16.5) * 1400) % 900 + 900) % 900 - 120; c.position.set(...at(rnd(i + 4) * 1280, y, -6 + rnd(i + 9) * 7.5)); });
      S.lines.forEach((l, i) => { const y = ((rnd(i + 30) * 720 - (t - 16.5) * 2400) % 820 + 820) % 820 - 40; l.position.set(...at(rnd(i + 40) * 1280, y, -2 + rnd(i + 3) * 4)); });
      alex = spun({ x: X(640 + Math.sin(t * 5) * 80), y: .55, s: .9, rot: (t - 16.5) * 520, pitch: Math.sin(t * 7) * 35, yaw: Math.sin(t * 4.3) * 40, cls: 'o-tee p-jeans a-vest a-helmet', eyes: 'spiral', mouth: 'open', talk: at_, armL: 150 + Math.sin(t * 25) * 20, armR: -150 + Math.sin(t * 25) * 20, legL: Math.sin(t * 20) * 30, legR: -Math.sin(t * 20) * 30, shadow: 0 });
      cam = { z: 1.05, ox: 640, oy: 360, sx: Math.sin(t * 40) * 4 };
    } else {
      const land = p(t, 17.45, 17.75), bounce = t > 17.75 ? Math.exp(-(t - 17.75) * 6) * Math.sin((t - 17.75) * 22) : 0, sq = 1 - bounce * .05 - (t > 17.73 && t < 17.8 ? .06 : 0);
      const y = 1.5 + (t < 17.75 ? lerp(5.8, 0, ei(land)) : bounce * .2) - (1 - sq) * 1.1, ax = -.3;
      alex = { x: ax, y, s: .95, rot: -90, yaw: 52, cls: 'o-tee p-jeans a-vest' + (t < 17.75 ? ' a-helmet' : ''), eyes: t > 17.75 ? 'spiral' : 'n', mouth: t > 17.75 ? 'o' : 'open', talk: t < 17.75 ? at_ : 0, armL: 20, armR: -30, legL: 6, legR: -6, shadow: 0, head: Math.sin(t * 4) * 6 * (t > 17.8) };
      S.soft.scale.y = sq;
      if (t > 17.75) { const k = p(t, 17.75, 18.4); if (k < 1) { FX.helm.visible = true; FX.helm.position.set(...at(lerp(330, 900, k) + 60, 430 - Math.sin(k * Math.PI) * 330 + k * 200 + 40, .3)); FX.helm.rotation.set(k * 4, 0, -k * 520 * DEG); } }
      if (t > 17.85) for (let i = 0; i < 4; i++) { const a = t * 5 + i * Math.PI / 2; FX.star([ax - 1.48 + Math.cos(a) * .62, y + .72 + Math.sin(a) * .1, .15 + Math.sin(a) * .5], 16, t * 4, i % 2); }
      cam = { z: lerp(1.15, 1.25, p(t, 17.8, 19.2)), ox: 470, oy: 450, sy: t > 17.75 && t < 18 ? Math.sin(t * 80) * 8 : 0 };
    }
  }
  if (sc === 6) { // ---- 7: the co-pilot returns, now he has the app
    S.rays.rotation = t * 8 * DEG;
    const up = back(p(t, 19.25, 19.6)), wv = hold(t, 19.5, 20.6, .2);
    robot = { ...robotIn(250, 1.3, up, -330), yaw: 20, talk: rt, armL: 140 * wv + Math.sin(t * 12) * 12 * wv, armR: -100 * hold(t, 20.9, 25.6, .3) + Math.sin(t * 3) * 6, armRx: 25 * hold(t, 20.9, 25.6, .3), blink: bl, look: [1, -.2], bob: Math.sin(t * 3) * 3 };
    const ain = back(p(t, 19.45, 19.85)), thumb = hold(t, 24.5, 26.4, .2);
    alex = { x: X(lerp(1500, 1070, ain)), s: 1.02, yaw: -16, cls: 'o-tee p-jeans h-phone', armR: -120 - thumb * 30 + Math.sin(t * 2) * 5, armL: thumb * 150, brows: 'hap', mouth: t > 24.5 ? 'open' : 'smile', blink: bl, head: Math.sin(t * 2.4) * 4, headYaw: -8, look: [-.6, 0], crouch: Math.sin(t * 6) * 2 };
    [20.2, 21.5, 22.85, 24.55].forEach((a, i) => { const k = back(p(t, a, a + .35)), g = S.tiles[i]; g.visible = t > a; g.scale.setScalar(Math.max(.001, k)); g.inner.rotation.z = (1 - k) * 14 * DEG; g.inner.position.y = Math.sin(t * 3 + i * 1.7) * .04; });
    cam = { z: lerp(1.08, 1, eo(p(t, 19.2, 19.8))), ox: 640, oy: 360 };
  }
  if (sc === 8) { // ---- 8b: gym squat with a heavy bar
    const k = p(t, 27.75, 28.65), d = Math.sin(k * Math.PI);
    alex = { x: 0, y: -.08 * d, cls: 'o-tank p-shorts a-towel', legL: 42 * d, legR: -42 * d, crouch: 24 * d, armL: 122, armR: -122, armLx: -18, armRx: -18, head: Math.sin(t * 30) * 2 * d, brows: d > .3 ? 'ann' : 'hap', mouth: d > .3 ? 'frown' : 'smile' };
    S.bar.position.set(0, 1.25 - .32 * d, -.3); S.bar.rotation.z = -Math.sin(t * 9) * 1.5 * DEG;
    if (d > .5) FX.drop(760, 290 + d * 40, 1);
    cam = { z: 1.04, ox: 640, oy: 400 };
  }
  if (sc === 9) { // ---- 8c: beach with a drink
    S.foam.forEach((m, i) => { m.position.z = -11.6 + Math.sin(i / 2.5 + t * 4) * .3 + Math.sin(i * 1.7) * .15; });
    const sip = hold(t, 29.0, 29.6, .15);
    alex = { x: X(880), y: .62, s: .95, rot: -64, yaw: 22, cls: 'o-hawaii p-swim a-glasses h-drink', armR: -100 - sip * 50, armRx: 20, armL: 150 + Math.sin(t * 2) * 6, legL: 8, legR: -14 + Math.sin(t * 3) * 10, mouth: sip > .5 ? 'o' : 'smile', brows: 'hap', shadow: 0, head: 26 };
    cam = { z: 1.02, ox: 640, oy: 360 };
  }
  if (sc === 10) { // ---- 9: three taps on the phone
    S.rays.rotation = t * 8 * DEG; drawScreen(S, t);
    let tx = 920, ty = 900, press = 0; const bxy = i => [430 + 368, 240 + i * 130 + 52];
    for (let i = 0; i < 3; i++) { const a = TAPS[i] - .35; if (t >= a) { const [bx, by] = bxy(i), from = i ? bxy(i - 1) : [900, 900], k = eo(p(t, a, TAPS[i] - .05)); tx = lerp(from[0], bx, k); ty = lerp(from[1], by, k); press = t > TAPS[i] - .05 && t < TAPS[i] + .12 ? 1 : 0; } }
    if (t > 32.4) ty += ei(p(t, 32.4, 32.9)) * 600;
    S.hand.position.set(X(tx), CY - (ty + press * 6 - 360) / K - 1.4, press ? .2 : .5);
    FX.confetti(t, 32.15, 640, 360, 50, 3);
    const up = back(p(t, 29.85, 30.15)), s = 1.15;
    robot = { x: (170 - 640) / (K * s), y: -.55 - (1 - up) * 2.8, z: D * (1 - 1 / s), rot: 8, yaw: 14, talk: rt, armR: -150 * hold(t, 30.2, 33.2, .2) + Math.sin(t * 10) * 10, look: [1, -.5], blink: bl };
    cam = { z: lerp(1.15, 1, eo(p(t, 29.7, 30.2))), ox: 640, oy: 360 };
  }
  if (sc === 11) { // ---- end card
    S.rays.rotation = t * 8 * DEG;
    const b = back(p(t, 33.45, 33.8)), c = back(p(t, 33.75, 34.05)), ai = back(p(t, 33.6, 34)), ri = back(p(t, 33.7, 34.1));
    S.brand.scale.setScalar(Math.max(.001, b)); S.brand.inner.rotation.z = (1 - b) * 8 * DEG; S.cta.scale.setScalar(Math.max(.001, c));
    alex = { x: X(170), y: -.4 - (1 - ai) * 3.2, s: .85, yaw: 14, armL: 140 + Math.sin(t * 14) * 18, brows: 'hap', blink: bl };
    robot = { x: X(1110), y: -.4 - (1 - ri) * 3.2, yaw: -14, armR: -140 + Math.sin(t * 14) * 18, look: [-1, 0], blink: bl };
    FX.confetti(t, 33.5, 640, 330, 54, 3);
  }
  A.pose({ show: true, t, ...alex }); R.pose({ show: true, t, ...robot });

  // camera: the original zoom, pan and shake, as a view offset
  const z = cam.z || 1, x0 = (-(cam.sx || 0) - cam.ox) / z + cam.ox, y0 = (-(cam.sy || 0) - cam.oy) / z + cam.oy;
  camera.setViewOffset(1280, 720, x0, y0, 1280 / z, 720 / z);
  rp.scene = scene; if (bokeh) bokeh.scene = scene; composer.render();

  // wipes and flashes on top
  const f = W / 1280; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(renderer.domElement, 0, 0);
  let wx = 3000; WIPES.forEach(c => { if (Math.abs(t - c) < .22) wx = lerp(-1900, 1500, (t - (c - .22)) / .44); });
  if (wx < 3000) {
    ctx.save(); ctx.scale(f, f); ctx.translate(wx + 850, 360); ctx.transform(1, 0, Math.tan(-14 * DEG), 1, 0, 0); ctx.translate(-850, -360);
    for (let x = 0; x < 1700; x += 396) [['#ffe14d', 120], ['#111', 12], ['#6df5b9', 120], ['#111', 12], ['#fff', 120], ['#111', 12]].reduce((xx, [col, w]) => { if (xx < 1700) { ctx.fillStyle = col; ctx.fillRect(xx, -100, Math.min(w + 1, 1700 - xx), 920); } return xx + w; }, x);
    ctx.fillStyle = '#111'; ctx.fillRect(-8, -100, 8, 920); ctx.fillRect(1700, -100, 8, 920); ctx.restore();
  }
  let fl = 0; FLASH.forEach(q => { if (t >= q && t < q + .2) fl = Math.max(fl, 1 - (t - q) / .2); });
  if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
}

window.LEN = LEN; window.seek = render;
window.grab = (t, q = .93) => { render(t); renderer.getContext().finish(); return out.toDataURL('image/jpeg', q); };
render(+(Q.get('t') || 0)); window.ready = true;

// ---------- playback in the browser ----------
if (!Q.has('render')) {
  const btn = document.getElementById('play'); let playing = false;
  btn.addEventListener('click', () => { if (playing) return; playing = true; btn.hidden = true; const au = document.getElementById(Q.get('lang') === 'de' ? 'vo-de' : 'vo-en'); au.currentTime = 0; au.play().catch(() => { }); const t0 = performance.now();
    (function loop() { const t = !au.paused && au.currentTime > 0 ? au.currentTime : (performance.now() - t0) / 1000; render(Math.min(t, LEN)); if (t < LEN) requestAnimationFrame(loop); else { playing = false; btn.hidden = false; } })(); });
} else document.getElementById('play').hidden = true;
