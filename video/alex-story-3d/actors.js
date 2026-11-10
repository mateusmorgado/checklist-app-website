// The cast: Alex (with all his outfits), the co-pilot robot, and the background people. All are small rigs posed from numbers.
import { THREE, C, DEG, rnd, sstep, M, vinyl, gloss, fabric, glow, T, tex, add, grp, rbox, box, sph, cyl, cap, tube, slab, extrude, boxZ, blob, KNIT, WEAVE, DENIM, TERRY, N_FINE } from './lib.js';

const col = c => new THREE.Color(c);
export function makeHelmet(parent) {
  const g = grp(parent), y = vinyl(C.yellow, { roughness: .25 });
  add(g, new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), y, [0, 0, 0], [0, 0, 0], [.56, .5, .53]);
  add(g, cyl(1, 1, .07, 32), y, [0, .0, .03], [0, 0, 0], [.63, 1, .62]);
  for (const x of [-.25, 0, .25]) add(g, new THREE.TorusGeometry(.5, .03, 6, 20, Math.PI), y, [x, 0, 0], [0, Math.PI / 2, 0], [1.04 * Math.sqrt(1 - x * x / .32), 1.0 * Math.sqrt(1 - x * x / .32), 1]);
  return g;
}

export function makeAlex() {
  const A = { root: grp(null) }, body = A.body = grp(A.root);
  const skin = M(C.skin, { roughness: .55, sheen: .6, sheenColor: col('#ff9a70'), sheenRoughness: .4, bumpMap: T.soft, bumpScale: .25 });
  const hair = M(C.hair, { roughness: .55, sheen: 1, sheenColor: col('#8a6a55'), sheenRoughness: .35, bumpMap: T.fine, bumpScale: 1.2 });
  const TOPS = { tee: fabric('#1c1c20', KNIT, 12), tank: fabric('#1c1c20', KNIT, 12), jacket: fabric('#4f86d6', WEAVE, 14), hawaii: fabric('#ff9430', KNIT, 12) };
  const PANTS = { shorts: fabric('#7d8aa3', WEAVE, 6), swim: fabric('#22b39c', WEAVE, 6) };
  const jeans = M('#ffffff', { roughness: .9, map: tex(DENIM, 3, 3, true), bumpMap: tex(DENIM, 3, 3), bumpScale: 1.2, sheen: .6, sheenColor: col('#9db4ff') });
  const shoe = vinyl('#fafafa', { roughness: .45 }), sole = M('#d9dbe2', { roughness: .8 }), ink = M(C.ink, { roughness: .6 });
  A.blob = blob(A.root, .62, .5, [0, .05], .6);
  // legs: pivot at the hip
  A.legs = [-1, 1].map(sx => {
    const g = grp(body, [sx * .15, .45, 0]), L = { g };
    L.jeans = add(g, cap(.095, .19), jeans, [0, -.15, 0]); L.skin = add(g, cap(.085, .19), skin, [0, -.15, 0]); L.shorts = add(g, cyl(.118, .125, .2, 20), PANTS.shorts, [0, -.03, 0]);
    add(g, rbox(.3, .16, .44, .075), shoe, [sx * .01, -.355, .07]); add(g, rbox(.305, .05, .445, .024), sole, [sx * .01, -.42, .07]); add(g, rbox(.2, .03, .12, .014), M('#e9e9ee', { roughness: .6 }), [sx * .01, -.285, .12], [-.5, 0, 0]);
    return L;
  });
  const up = A.upper = grp(body);
  A.torso = add(up, rbox(.88, .74, .58, .22, 8), TOPS.tee, [0, .74, 0]);
  const tz = (x, y) => boxZ(x, y - .74, .44, .37, .29, .22);
  // tee: collar and logo
  const tee = A.teeG = grp(up); add(tee, new THREE.TorusGeometry(.155, .028, 8, 28), M('#34343a', { roughness: .9 }), [0, 1.09, 0], [Math.PI / 2, 0, 0]);
  const lg = grp(tee, [.205, .79, .292]); add(lg, slab(.19, .19, .045, .03, .008), M(C.yellow, { roughness: .6 })); tube(lg, [[-.05, 0, .02], [-.015, -.035, .02], [.05, .045, .02]], .013, ink, 8);
  // tank top: bare shoulders and a scooped neck
  const tank = A.tankG = grp(up); for (const sx of [-1, 1]) add(tank, sph(.15), skin, [sx * .37, 1.0, 0], [0, 0, 0], [1, 1, 1.5]); add(tank, sph(1), skin, [0, 1.07, .14], [0, 0, 0], [.2, .13, .17]);
  // rain jacket: white lining and zip
  const jk = A.jacketG = grp(up); add(jk, slab(.24, .7, .05, .03, .008), fabric('#ffffff', KNIT, 6), [0, .75, .283]);
  for (const sx of [-1, 1]) { tube(jk, [[sx * .125, .98, .29], [sx * .125, .7, .3], [sx * .125, .42, .28]], .012, M('#1d3f7d'), 8); add(jk, box(.18, .02, .02), M('#1d3f7d'), [sx * .29, .65, tz(.29, .65) + .005]); }
  add(jk, new THREE.TorusGeometry(.17, .05, 8, 28), TOPS.jacket, [0, 1.1, 0], [Math.PI / 2, 0, 0]);
  // hawaii shirt: flowers and an open collar
  const hw = A.hawaiiG = grp(up), FL = ['#ffffff', C.yellow, C.yellow, '#ffffff', '#ff4a4a', '#ffffff', C.yellow, '#ff4a4a'];
  [[-.28, .87], [.26, .91], [-.14, .55], [.22, .57], [.04, .73], [-.33, .66], [.34, .74], [-.02, .47]].forEach(([x, y], i) => { const z = tz(x, y); add(hw, sph(1, 14, 10), M(FL[i], { roughness: .7 }), [x, y, z - .01], [0, 0, 0], [.06, .06, .025]); for (let k = 0; k < 5; k++) add(hw, sph(1, 8, 6), M(FL[i], { roughness: .7 }), [x + Math.cos(k * 1.257) * .055, y + Math.sin(k * 1.257) * .055, tz(x + Math.cos(k * 1.257) * .055, y + Math.sin(k * 1.257) * .055) - .012], [0, 0, 0], [.035, .035, .02]); });
  add(hw, extrude([[-.18, .37], [0, .13], [.18, .37], [.1, .38], [0, .23], [-.1, .38]], .04, .01), fabric('#ffffff', KNIT, 6), [0, .74, .255], [-.2, 0, 0]);
  // hi-vis vest
  const vest = A.vestG = grp(up), vm = fabric('#ff8a1f', WEAVE, 10), band = M(C.yellow, { roughness: .35, emissive: '#665500' });
  for (const sx of [-1, 1]) { add(vest, rbox(.35, .77, .64, .16), vm, [sx * .285, .74, 0]); add(vest, box(.36, .08, .65), band, [sx * .285, .63, 0]); }
  // towel over the shoulder
  const tw = A.towelG = grp(up), terry = M('#ffffff', { roughness: 1, bumpMap: tex(TERRY, 4, 4), bumpScale: 3, sheen: 1 });
  add(tw, rbox(.27, .62, .07, .03), terry, [.31, .85, .315]); add(tw, rbox(.27, .09, .7, .04), terry, [.31, 1.14, 0]); add(tw, rbox(.27, .5, .07, .03), terry, [.31, .9, -.315]); add(tw, box(.275, .05, .075), M(C.blue), [.31, .63, .315]);
  add(up, cyl(.11, .12, .14, 20), skin, [0, 1.11, 0]);
  // arms: pivot at the shoulder
  A.arms = [-1, 1].map(sx => {
    const g = grp(up, [sx * .49, 1.0, 0]), R = { g };
    add(g, cap(.088, .34), skin, [0, -.26, 0]); R.short = add(g, cap(.112, .1), TOPS.tee, [0, -.1, 0]); R.long = add(g, cap(.11, .3), TOPS.jacket, [0, -.24, 0]); add(g, sph(.105), skin, [0, -.55, 0]);
    R.hand = grp(g, [0, -.55, 0]); return R;
  });
  const hand = A.arms[1].hand;
  // things he holds (right hand)
  const tool = A.toolG = grp(hand); add(tool, rbox(.12, .18, .12, .04), vinyl('#ff4a4a'), [0, -.02, .05]); add(tool, cyl(.022, .022, .34, 10), M('#c9ced8', { metalness: .9, roughness: .25 }), [0, -.27, .05]);
  const drink = A.drinkG = grp(hand, [0, -.08, .1]), dg = grp(drink, [0, .12, 0]);
  add(dg, cyl(.15, .11, .26, 20), M('#ffffff', { roughness: .05, transparent: true, opacity: .35, clearcoat: 1 })); add(dg, cyl(.135, .105, .17, 20), M('#ffb347', { roughness: .2, emissive: '#7a3a00' }), [0, -.035, 0]);
  add(dg, new THREE.ConeGeometry(.17, .1, 12), M('#ff9ab8', { roughness: .6 }), [.07, .25, 0], [0, 0, -.25]); add(dg, cyl(.008, .008, .2, 6), M('#8a5a2b'), [.05, .16, 0], [0, 0, -.25]); add(dg, cyl(.014, .014, .3, 8), M('#ff4a4a'), [-.06, .12, 0], [0, 0, .3]);
  const phone = A.phoneG = grp(hand, [0, -.16, .08]); add(phone, slab(.3, .52, .06, .05, .012), gloss('#15161c')); add(phone, slab(.24, .44, .04, .012, .004), M('#ff4a4a', { roughness: .2, emissive: '#ff4a4a', emissiveIntensity: .35 }), [0, 0, .028]); add(phone, slab(.09, .09, .02, .012, .004), M(C.yellow, { emissive: C.yellow, emissiveIntensity: .3 }), [-.03, .1, .034]);
  // head: pivot at the neck
  const hp = A.head = grp(up, [0, 1.13, 0]), hd = grp(hp, [0, .4, 0]), HX = .5, HY = .43, HZ = .43, HR = .35, hz = (x, y) => boxZ(x, y, HX, HY, HZ, HR);
  const hg = rbox(1, .86, .86, HR, 12).clone(), pos = hg.attributes.position, cols = new Float32Array(pos.count * 3), cS = col(C.skin), cCheek = col('#ff7f7a'), cStub = col('#b98a6c'), cFade = col('#3d2c25'), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i); c.copy(cS);
    c.lerp(cStub, .5 * sstep(-.12, -.34, y) * sstep(-.05, .2, z));
    for (const sx of [-1, 1]) { const d = Math.hypot(x - sx * .34, y + .2, z - .33); c.lerp(cCheek, .8 * Math.exp(-d * d / .011)); }
    c.lerp(cFade, Math.min(1, sstep(.36, .47, Math.abs(x)) * sstep(-.02, .1, y) + sstep(.05, -.2, z) * sstep(-.3, -.12, y) + sstep(.26, .36, y)));
    cols.set([c.r, c.g, c.b], i * 3);
  }
  hg.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  const headMat = skin.clone(); headMat.color.set('#ffffff'); headMat.vertexColors = true; add(hd, hg, headMat);
  for (const sx of [-1, 1]) { add(hd, sph(1), skin, [sx * .51, -.05, -.02], [0, 0, 0], [.075, .14, .1]); add(hd, sph(1, 12, 8), M('#d99873', { roughness: .7 }), [sx * .545, -.05, 0], [0, 0, 0], [.04, .08, .055]); }
  const hairG = A.hairG = grp(hd); let sd = 40; const Rn = () => rnd(sd++);
  for (let i = 0; i < 150; i++) {
    const th = Rn() * Math.PI * 2, ph = Math.acos(1 - Rn() * 1.25), q = [Math.sin(ph) * Math.cos(th) * .47, .26 + Math.cos(ph) * .33, -.03 + Math.sin(ph) * Math.sin(th) * .44], r = .1 + Rn() * .07, rx = Rn() * 3, ry = Rn() * 3;
    if ((q[2] > .05 && q[1] < .3) || (q[1] < .06 && q[2] > -.25) || q[1] < -.12) continue;
    add(hairG, sph(1, 12, 9), hair, q, [rx, ry, 0], r);
  }
  for (let i = 0; i < 9; i++) { const x = -.36 + i * .09; add(hairG, sph(1, 12, 9), hair, [x, .3 + rnd(i + 5) * .04 + Math.cos(i * 2.1) * .02, hz(x, .3) - .03], [0, 0, 0], .085 + rnd(i) * .03); }
  A.helmetG = makeHelmet(hd); A.helmetG.position.set(0, .2, -.02); A.helmetG.rotation.x = -.06;
  // face
  const eyeM = gloss('#0c0c10'), glint = glow('#ffffff', 1.2), white = M('#ffffff', { roughness: .4 });
  A.eyes = []; A.spirals = []; A.brows = [];
  for (const sx of [-1, 1]) {
    const ez = hz(.2, -.02) - .012, e = grp(hd, [sx * .2, -.02, ez]); e.base = [sx * .2, -.02, ez]; A.eyes.push(e);
    add(e, sph(1), eyeM, [0, 0, 0], [0, 0, 0], [.088, .104, .05]); e.gl = grp(e); add(e.gl, sph(.03, 10, 8), glint, [.032, .042, .04], [0, 0, 0], [1, 1, .5]); add(e.gl, sph(.014, 8, 6), glint, [-.03, -.04, .04], [0, 0, 0], [1, 1, .5]);
    const sp = grp(hd, [sx * .2, -.02, ez + .02]); A.spirals.push(sp); add(sp, sph(1), white, [0, 0, 0], [0, 0, 0], [.115, .125, .035]);
    const pts = []; for (let k = 0; k <= 40; k++) { const a = k / 40 * Math.PI * 5, rr = .012 + k / 40 * .085; pts.push([Math.cos(a) * rr, Math.sin(a) * rr, .034]); } tube(sp, pts, .011, ink, 60);
    const bz = (x, y) => hz(x, y) + .012, b = grp(hd, [sx * .23, .13, 0]); b.base = .13; A.brows.push(b);
    tube(b, [[sx * .11, -.03, bz(.34, .1)], [sx * .01, .035, bz(.24, .165)], [-sx * .11, 0, bz(.12, .13)]], .03, hair, 10);
    tube(hd, [[0, -.215, hz(0, -.215) + .02], [sx * .1, -.2, hz(.1, -.2) + .025], [sx * .18, -.235, hz(.18, -.235) + .02], [sx * .265, -.25, hz(.265, -.25) + .012]], .036, hair, 12);
  }
  add(hd, sph(1, 12, 9), M('#e6a47c', { roughness: .5, sheen: .6, sheenColor: col('#ff9a70') }), [0, -.13, hz(0, -.13) + .005], [0, 0, 0], [.055, .045, .05]);
  const lip = M('#5a1c22', { roughness: .6 }), mz = hz(0, -.36);
  A.msmile = tube(hd, [[-.08, -.335, mz], [0, -.37, mz + .004], [.08, -.335, mz]], .014, lip, 10);
  A.mfrown = tube(hd, [[-.08, -.385, mz - .01], [0, -.35, mz + .004], [.08, -.385, mz - .01]], .014, lip, 10);
  A.mopen = add(hd, sph(1, 16, 10), M('#6a1620', { roughness: .35 }), [0, -.36, mz - .005], [0, 0, 0], [.06, .04, .03]);
  const gl = A.glassesG = grp(hd), gz = hz(.21, -.02) + .035, lens = gloss('#101014', { envMapIntensity: 2 });
  for (const sx of [-1, 1]) { add(gl, slab(.31, .21, .07, .05, .012), lens, [sx * .21, -.02, gz]); add(gl, box(.06, .012, .01), glint, [sx * .21 - .06, .03, gz + .028]); add(gl, box(.012, .02, .46), lens, [sx * .365, -.01, gz - .23]); }
  add(gl, box(.14, .03, .03), lens, [0, -.01, gz]);

  let lastCls = null;
  function outfit(cls) {
    if (cls === lastCls) return; lastCls = cls; const f = k => cls.includes(k);
    const top = f('o-tank') ? 'tank' : f('o-jacket') ? 'jacket' : f('o-hawaii') ? 'hawaii' : 'tee';
    A.torso.material = TOPS[top]; A.teeG.visible = top === 'tee'; A.tankG.visible = top === 'tank'; A.jacketG.visible = top === 'jacket'; A.hawaiiG.visible = top === 'hawaii';
    A.arms.forEach(a => { a.short.visible = top === 'tee' || top === 'hawaii'; a.short.material = TOPS[top]; a.long.visible = top === 'jacket'; });
    const short = f('p-shorts') || f('p-swim'); A.legs.forEach(l => { l.jeans.visible = !short; l.skin.visible = short; l.shorts.visible = short; l.shorts.material = PANTS[f('p-swim') ? 'swim' : 'shorts']; });
    A.vestG.visible = f('a-vest'); A.helmetG.visible = f('a-helmet'); A.hairG.visible = !f('a-helmet'); A.glassesG.visible = f('a-glasses'); A.towelG.visible = f('a-towel');
    A.toolG.visible = f('h-tool'); A.drinkG.visible = f('h-drink'); A.phoneG.visible = f('h-phone');
  }
  const BROW = { n: [0, 0], ann: [14, -.02], wor: [-14, .03], hap: [0, .05] };
  A.pose = (o) => {
    o = Object.assign({ x: 0, y: 0, z: 0, s: 1, rot: 0, yaw: 0, pitch: 0, cls: 'o-tee p-jeans', legL: 0, legR: 0, legLx: 0, legRx: 0, armL: 0, armR: 0, armLx: 0, armRx: 0, head: 0, headYaw: 0, headPitch: 0, crouch: 0, brows: 'n', eyes: 'n', look: [0, 0], mouth: 'smile', talk: 0, blink: false, eyeS: 1, glassY: 0, show: true, sx: 1, sy: 1, t: 0, shadow: 1 }, o);
    A.root.visible = o.show; if (!o.show) return;
    A.root.position.set(o.x, o.y, o.z); A.root.rotation.z = -o.rot * DEG; A.root.scale.set(o.s * o.sx, o.s * o.sy, o.s);
    body.rotation.set(o.pitch * DEG, o.yaw * DEG, 0); outfit(o.cls);
    A.legs[0].g.rotation.set(-o.legLx * DEG, 0, -o.legL * DEG); A.legs[1].g.rotation.set(-o.legRx * DEG, 0, -o.legR * DEG);
    A.upper.position.y = -o.crouch / 100;
    A.arms[0].g.rotation.set(-o.armLx * DEG, 0, -o.armL * DEG); A.arms[1].g.rotation.set(-o.armRx * DEG, 0, -o.armR * DEG);
    A.head.rotation.set(o.headPitch * DEG, o.headYaw * DEG, -o.head * DEG);
    const up = (o.rot + o.armR) * DEG; A.drinkG.rotation.z = up; A.phoneG.rotation.z = up;   // keep the drink and phone upright
    const [ba, by] = BROW[o.brows]; A.brows.forEach((b, i) => { const sx = i ? 1 : -1; b.rotation.z = sx * ba * DEG; b.position.y = b.base + by; });
    const spiral = o.eyes === 'spiral', sy = o.blink ? .1 : o.eyeS;
    A.eyes.forEach(e => { e.visible = !spiral; e.position.set(e.base[0] + o.look[0] * .03, e.base[1] - o.look[1] * .03, e.base[2]); e.scale.set(o.eyeS, sy, 1); e.gl.position.set(o.look[0] * .012, -o.look[1] * .012, 0); });
    A.spirals.forEach((s, i) => { s.visible = spiral; s.rotation.z = -o.t * 9 * (i ? 1 : -1); });
    const m = o.mouth, tk = o.talk, open = tk > .04 || m === 'open' || m === 'o';
    A.msmile.visible = !open && m !== 'frown'; A.mfrown.visible = !open && m === 'frown'; A.mopen.visible = open;
    if (open) { const ry = m === 'open' ? 8 + tk * 3 : m === 'o' && tk <= .04 ? 4.5 : 2 + tk * 7.5, rx = m === 'open' ? 8 : m === 'o' && tk <= .04 ? 4.5 : 5 + tk * 2.5; A.mopen.scale.set(rx / 100, ry / 100, .03); }
    A.glassesG.position.y = -o.glassY / 100; A.blob.material.opacity = .6 * o.shadow; A.blob.visible = o.shadow > 0;
  };
  return A;
}

export function makeRobot() {
  const B = { root: grp(null) }, all = B.all = grp(B.root), white = vinyl('#f6f7fb'), navy = fabric(C.navy, WEAVE, 14), grey = vinyl('#cfd3de', { metalness: .5, roughness: .35 }), yellow = vinyl(C.yellow), black = gloss('#0b0c12'), gold = M('#ffcf2e', { metalness: .9, roughness: .28 }), dark = M('#15161c', { roughness: .4 });
  B.blob = blob(B.root, .62, .5, [0, .05], .6);
  for (const sx of [-1, 1]) { add(all, cap(.09, .24), grey, [sx * .15, .33, 0]); add(all, rbox(.3, .16, .44, .075), gloss('#15161c', { roughness: .2 }), [sx * .16, .08, .07]); }
  const up = grp(all); add(up, rbox(.88, .74, .58, .22, 8), navy, [0, .74, 0]);
  add(up, extrude([[-.15, .33], [.15, .33], [0, .03]], .04, .012), fabric('#ffffff', KNIT, 8), [0, .745, .265], [-.16, 0, 0]);
  add(up, extrude([[-.04, .3], [.04, .3], [.07, .08], [0, 0], [-.07, .08]], .025, .01), fabric('#15161c', WEAVE, 10), [0, .73, .307], [-.14, 0, 0]);
  for (const y of [.61, .48]) add(up, sph(1, 12, 8), gold, [0, y, .292], [0, 0, 0], [.034, .034, .016]);
  for (const s of [-1, 1]) tube(up, [[.21, .845, .296], [.21 + s * .04, .875, .296], [.21 + s * .1, .86, .294]], .011, gold, 8);
  add(up, sph(.022, 8, 6), gold, [.21, .85, .298]); add(up, cyl(.12, .13, .16, 20), grey, [0, 1.13, 0]);
  B.arms = [-1, 1].map(sx => { const g = grp(up, [sx * .49, 1.0, 0]); add(g, cap(.108, .3), navy, [0, -.24, 0]); add(g, new THREE.TorusGeometry(.111, .014, 8, 24), gold, [0, -.39, 0], [Math.PI / 2, 0, 0]); add(g, sph(.105), white, [0, -.56, 0]); return g; });
  const hp = B.head = grp(up, [0, 1.13, 0]), hd = grp(hp, [0, .39, 0]);
  add(hd, rbox(1.1, .76, .9, .26, 10), white); add(hd, slab(.86, .52, .17, .09, .02), black, [0, -.02, .435]);
  const eye = glow(C.mint, 2.2), sz = .484; B.eyes = []; B.glints = [];
  for (const sx of [-1, 1]) {
    const e = grp(hd, [sx * .18, .01, sz]); B.eyes.push(e); add(e, sph(1), eye, [0, 0, 0], [0, 0, 0], [.09, .11, .012]);
    const g = add(e, sph(1, 10, 8), glow('#ffffff', 2), [.03, .04, .01], [0, 0, 0], [.03, .03, .008]); B.glints.push(g);
    add(hd, sph(1, 12, 8), glow('#ff8f8f', 1.1), [sx * .33, -.14, sz], [0, 0, 0], [.06, .035, .008]);
    add(hd, rbox(.17, .36, .36, .08), yellow, [sx * .6, -.01, 0]); add(hd, cyl(.12, .12, .03, 20), M('#e0b400', { roughness: .5 }), [sx * .69, -.01, 0], [0, 0, Math.PI / 2]);
  }
  B.mouth = add(hd, sph(1, 16, 10), eye, [0, -.17, sz], [0, 0, 0], [.07, .026, .01]);
  tube(hd, [[-.62, -.17, .08], [-.6, -.3, .3], [-.42, -.31, .47], [-.29, -.27, .52]], .014, dark, 16); add(hd, sph(.048, 12, 8), M('#15161c', { roughness: .9, bumpMap: T.fine, bumpScale: 2 }), [-.27, -.265, .525]);
  const cp = grp(hd, [0, .3, 0]); cp.rotation.x = -.1;
  add(cp, cyl(1, 1, .14, 36), navy, [0, .06, 0], [0, 0, 0], [.55, 1, .48]); add(cp, cyl(1, 1, .04, 36), gold, [0, .05, 0], [0, 0, 0], [.557, 1, .487]);
  add(cp, cyl(.68, .55, .13, 36), navy, [0, .19, 0], [0, 0, 0], [1, 1, .86]); add(cp, sph(1), navy, [0, .255, 0], [0, 0, 0], [.68, .09, .585]);
  add(cp, cyl(.52, .52, .03, 36, false, -Math.PI / 2, Math.PI), black, [0, .01, .3], [.3, 0, 0], [1, 1, .62]);
  add(cp, sph(1, 12, 8), gold, [0, .19, .535], [0, 0, 0], [.06, .06, .03]); for (const s of [-1, 1]) tube(cp, [[s * .06, .19, .535], [s * .13, .225, .525], [s * .2, .2, .505]], .013, gold, 8);
  add(cp, cyl(.013, .013, .2, 8), dark, [0, .42, 0]); B.light = add(cp, sph(.058, 12, 8), glow('#ff3b5f', 2.6), [0, .54, 0]);
  B.pose = (o) => {
    o = Object.assign({ x: 0, y: 0, z: 0, s: 1, rot: 0, yaw: 0, armL: 0, armR: 0, armLx: 0, armRx: 0, head: 0, headYaw: 0, talk: 0, blink: false, look: [0, 0], show: true, bob: 0, t: 0 }, o);
    B.root.visible = o.show; if (!o.show) return;
    B.root.position.set(o.x, o.y, o.z); B.root.rotation.set(0, o.yaw * DEG, -o.rot * DEG); B.root.scale.setScalar(o.s); all.position.y = -o.bob / 100;
    B.arms[0].rotation.set(-o.armLx * DEG, 0, -o.armL * DEG); B.arms[1].rotation.set(-o.armRx * DEG, 0, -o.armR * DEG); B.head.rotation.set(0, o.headYaw * DEG, -o.head * DEG);
    B.mouth.scale.set((7 - o.talk * 1.6) / 100, (2.6 + o.talk * 7.4) / 100, .01);
    B.eyes.forEach(e => e.scale.y = o.blink ? .1 : 1); B.glints.forEach(g => g.position.set(.03 + o.look[0] * .03, .04 - o.look[1] * .03, .01));
    B.light.material.emissiveIntensity = 1.6 + 1.6 * (.5 + .5 * Math.sin(o.t * 9)) + o.talk * 2;
  };
  return B;
}

// simple background people
export function makeGuy(o) {
  const k = M(o.skin || '#e8b088', { roughness: .6, sheen: .5, sheenColor: col('#ff9a70') }), hr = M(o.hair || '#4a3020', { roughness: .6, bumpMap: T.fine, bumpScale: 1.5 }), tp = o.back ? k : fabric(o.top || '#ff8a1f', KNIT, 10), bt = o.towelWaist || o.back ? k : fabric(o.bottom || '#3a4f8f', WEAVE, 8);
  const G = { root: grp(null) }, r = G.root, shoe = vinyl('#fafafa', { roughness: .5 }), terry = M('#ffffff', { roughness: 1, bumpMap: tex(TERRY, 4, 4), bumpScale: 3 });
  blob(r, .6, .45, [0, .03], .5);
  if (o.sit) {
    add(r, cap(.095, .14), bt, [-.15, .3, 0]); add(r, rbox(.3, .16, .44, .075), shoe, [-.15, .08, .07]);
    const lg = G.leg = grp(r, [.15, .45, 0]); add(lg, cap(.085, .22), k, [0, -.2, 0]); add(lg, cyl(.118, .12, .18, 16), bt, [0, -.03, 0]); add(lg, rbox(.24, .2, .4, .07), shoe, [0, -.4, .06]); add(lg, box(.245, .03, .3), M('#ff4a4a'), [0, -.36, .1]); add(lg, box(.245, .03, .3), M('#ff4a4a'), [0, -.42, .1]);
  } else for (const sx of [-1, 1]) { add(r, cap(.095, .19), bt, [sx * .15, .3, 0]); add(r, rbox(.3, .16, .44, .075), shoe, [sx * .16, .08, .07]); }
  add(r, rbox(.88, .74, .58, .22, 6), tp, [0, .74, 0]);
  if (o.towelWaist) { add(r, rbox(.98, .42, .68, .1), terry, [0, .5, 0]); add(r, box(.99, .05, .69), M(C.blue), [0, .56, 0]); }
  if (o.back) { G.butt = grp(r, [0, .41, -.2]); for (const sx of [-1, 1]) add(G.butt, sph(.175), k, [sx * .13, 0, 0]); }
  if (o.towelShoulder) { add(r, rbox(.27, .6, .07, .03), terry, [-.31, .85, -.315]); add(r, rbox(.27, .09, .7, .04), terry, [-.31, 1.14, 0]); add(r, box(.275, .05, .075), M('#ff4a4a'), [-.31, .65, -.315]); }
  G.arms = [-1, 1].map(sx => { const g = grp(r, [sx * .49, 1.0, 0]); add(g, cap(.088, .34), k, [0, -.26, 0]); if (!o.back) add(g, cap(.112, .08), tp, [0, -.09, 0]); add(g, sph(.105), k, [0, -.55, 0]); return g; });
  add(r, cyl(.11, .12, .14, 16), k, [0, 1.11, 0]);
  const hd = grp(r, [0, 1.52, 0]); add(hd, rbox(.96, .82, .82, .32, 8), k); for (const sx of [-1, 1]) add(hd, sph(1, 12, 8), k, [sx * .49, -.03, 0], [0, 0, 0], [.07, .13, .09]);
  add(hd, sph(1), hr, [0, .2, -.06], [0, 0, 0], [.5, .3, .46]); add(hd, sph(1), hr, [0, .02, -.2], [0, 0, 0], [.5, .42, .3]);
  for (const sx of [-1, 1]) add(hd, sph(.05, 12, 8), gloss('#0c0c10'), [sx * .18, -.03, .4]);
  G.mouth = add(hd, sph(1, 12, 8), M('#6a1620'), [0, -.23, .4], [0, 0, 0], [.07, .03, .03]);
  return G;
}
