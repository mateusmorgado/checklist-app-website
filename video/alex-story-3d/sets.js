// The sets. Each builder returns { scene, ...handles } and is only built the first time its scene is shown.
// Layout numbers are the original film's pixel positions (1280 x 720), placed at a depth with at(px, py, z).
import { THREE, C, DEG, rnd, M, vinyl, gloss, fabric, glow, flat, woodM, T, tex, cv, add, grp, rbox, box, sph, cyl, cap, tube, slab, extrude, rrShape, faceTex, decal, blob, iconCanvas, P2,
  N_FINE, N_SOFT, PLASTER, WOOD, WEAVE, KNIT, tilesCanvas, cobbleCanvas, gridCanvas, planksCanvas } from './lib.js';
import { makeGuy } from './actors.js';

export const D = 11.55, CY = 2.28, K = 125;
export const sAt = z => D / (D - z);
export const at = (px, py, z = 0) => { const s = sAt(z); return [(px - 640) / (K * s), CY - (py - 360) / (K * s), z]; };
export const len = (px, z = 0) => px / (K * sAt(z));
let ENV = null; export const setEnv = e => { ENV = e; };

function stage(o) {
  const scene = new THREE.Scene(); scene.environment = ENV; scene.environmentIntensity = o.env ?? .4;
  scene.background = o.bg; if (o.fog) scene.fog = new THREE.Fog(...o.fog);
  scene.add(new THREE.HemisphereLight(...(o.hemi || ['#ffffff', '#e9d6b8', .6])));
  const [pos, color, k, size = 10] = o.sun || [[-7, 10, 9], '#fff3e0', 3.0];
  const l = new THREE.DirectionalLight(color, k); l.position.set(...pos); l.castShadow = true; l.shadow.mapSize.set(2048, 2048);
  Object.assign(l.shadow.camera, { left: -size, right: size, top: size, bottom: -size, near: 1, far: 60 }); l.shadow.camera.updateProjectionMatrix(); l.shadow.bias = -.0006; l.shadow.normalBias = .04; scene.add(l); l.target.position.set(0, 1, -1); scene.add(l.target);
  if (o.rim) { const r = new THREE.DirectionalLight(o.rim[0], o.rim[1]); r.position.set(8, 5, -6); scene.add(r); }
  return scene;
}
const gradTex = stops => { const t = new THREE.CanvasTexture(cv(8, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, 8, 512); })); t.colorSpace = THREE.SRGBColorSpace; return t; };
const floor = (scene, mat, z0 = -3.2, z1 = 16, w = 60) => { const m = add(scene, new THREE.PlaneGeometry(w, z1 - z0), mat, [0, 0, (z0 + z1) / 2], [-Math.PI / 2, 0, 0]); m.castShadow = false; return m; };
const wall = (scene, mat, z, w = 40, h = 12) => { const m = add(scene, new THREE.PlaneGeometry(w, h), mat, [0, h / 2, z]); m.castShadow = false; return m; };
export function cloud(parent, pos, s, o = {}) { const g = grp(parent, pos), m = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, fog: false, emissive: '#bcd4ff', emissiveIntensity: .35, ...o }); [[0, 0, 0, 1], [1.1, -.1, 0, .8], [-1.1, -.15, .1, .75], [.45, .45, -.1, .8], [-.5, .35, 0, .65], [1.9, -.3, 0, .5], [-1.9, -.3, 0, .5]].forEach(([x, y, z, r]) => { const b = add(g, sph(1, 20, 14), m, [x, y, z], [0, 0, 0], [r, r * .8, r * .8]); b.castShadow = false; }); g.scale.setScalar(s); return g; }
const textCanvas = (w, h, draw) => cv(w, h, (g) => { g.textBaseline = 'middle'; g.textAlign = 'center'; draw(g, w, h); });
function pot(parent, pos, s = 1, kind = 0) {
  const g = grp(parent, pos); g.scale.setScalar(s); const leaf = M('#3fae5c', { roughness: .85, bumpMap: tex(N_FINE, 4, 4), bumpScale: 5, sheen: .3 });
  add(g, cyl(.36, .27, .55, 20), M('#d2553c', { roughness: .8, bumpMap: T.fine, bumpScale: 2 }), [0, .275, 0]);
  if (kind === 0) { add(g, cyl(.05, .06, .5, 8), M('#6b4127'), [0, .75, 0]); let sd = 70; for (let j = 0; j < 14; j++) { const th = rnd(sd++) * 6.28, ph = Math.acos(2 * rnd(sd++) - 1); add(g, sph(1, 12, 9), leaf, [Math.sin(ph) * Math.cos(th) * .22, 1.15 + Math.cos(ph) * .22, Math.sin(ph) * Math.sin(th) * .22], [0, 0, 0], .2 + rnd(sd++) * .08); } }
  else for (let j = 0; j < 5; j++) add(g, sph(1, 12, 9), leaf, [Math.sin(j * 1.3) * .14, .95, Math.cos(j * 1.3) * .08], [0, 0, (j - 2) * .28], [.11, .5, .06]);
  blob(parent, .6 * s, .4 * s, [pos[0], pos[2]], .5); return g;
}

// ---------- 1: the German street ----------
function house(parent, x, w, h, rise, facade, opts = {}) {
  const G = grp(parent, [x, 0, -3.2]), Dp = 3.2, k = Math.abs(Math.round(x * 10 + 99));
  const wallM = M(facade, { roughness: .95, map: tex(PLASTER, w / 2, h / 2, true), bumpMap: tex(N_FINE, w * 1.5, h * 1.5), bumpScale: 1.5 }), wood = woodM();
  add(G, box(w, h, Dp), wallM, [0, h / 2, -Dp / 2]); add(G, box(w + .06, .32, Dp + .06), M('#b9ab9b', { roughness: .95, bumpMap: T.fine, bumpScale: 2 }), [0, .16, -Dp / 2]);
  const beam = (bx, by, bw, bh, rot = 0) => add(G, box(bw, bh, .1), wood, [bx, by, .03], [0, 0, rot]);
  const mid = h * .5 + .08, bays = w > 3.4 ? 3 : 2, bw = (w - .14) / bays;
  beam(0, h - .07, w, .14); beam(0, mid, w, .13); beam(0, .38, w, .12);
  for (let i = 0; i <= bays; i++) beam(-w / 2 + .07 + i * bw, h / 2 + .16, .13, h - .32);
  for (let i = 0; i < bays; i++) { const cx = -w / 2 + .07 + (i + .5) * bw; if ((i + k) % 2 === 0) { beam(cx - bw * .32, mid + .45, .09, .9, .5); beam(cx + bw * .32, mid + .45, .09, .9, -.5); } }
  const frame = M('#fbfbf6', { roughness: .5 }), glass = M('#35527c', { roughness: .04, metalness: .2, clearcoat: 1, envMapIntensity: 2.2 }), FL = ['#ff4a6a', '#ffd91f', '#ff8fc0', '#ffffff', '#ff6a3c'];
  const win = (cx, cy, ww = .6, wh = .74, flowers = true) => {
    const g = grp(G, [cx, cy, 0]); add(g, box(ww + .12, wh + .12, .12), frame, [0, 0, .03]); add(g, box(ww, wh, .04), glass, [0, 0, .08]); add(g, box(.035, wh, .05), frame, [0, 0, .095]); add(g, box(ww, .035, .05), frame, [0, .08, .095]);
    if (opts.shutter) for (const s of [-1, 1]) add(g, box(.22, wh + .1, .05), M(opts.shutter, { roughness: .6, bumpMap: tex(WOOD, 1, 1), bumpScale: 1 }), [s * (ww / 2 + .18), 0, .06]);
    if (flowers) { add(g, box(ww + .14, .14, .18), woodM('#c98a5a'), [0, -wh / 2 - .12, .15]); for (let i = 0; i < 7; i++) { const fx = -ww / 2 + (i + .5) * ww / 7, q = rnd(i * 3 + cx * 10 + cy * 7 + k); add(g, sph(1, 8, 6), M('#2f9e55', { roughness: .8 }), [fx, -wh / 2 - .04 + q * .03, .14 + rnd(i + k) * .06], [0, 0, 0], .06 + q * .03); add(g, sph(1, 8, 6), M(FL[(i + k) % FL.length], { roughness: .6 }), [fx + .02, -wh / 2 + .03 + q * .05, .19 + rnd(i * 2 + k) * .05], [0, 0, 0], .045 + q * .02); } }
  };
  for (let i = 0; i < bays; i++) { const cx = -w / 2 + .07 + (i + .5) * bw; win(cx, mid + (h - mid) / 2 - .02); if (i !== (opts.door ?? 0)) win(cx, .38 + (mid - .38) / 2, .6, .7, false); }
  const dx = -w / 2 + .07 + ((opts.door ?? 0) + .5) * bw, dc = opts.doorColor || '#2f7d5b', dm = vinyl(dc, { roughness: .4, bumpMap: tex(WOOD, 1, 1), bumpScale: .8 });
  add(G, box(.7, 1.12, .1), dm, [dx, .6, .03]); add(G, cyl(.35, .35, .1, 24, false, -Math.PI / 2, Math.PI), dm, [dx, 1.15, .03], [Math.PI / 2, Math.PI / 2, 0]);
  add(G, sph(.04, 8, 6), M('#ffcf2e', { metalness: 1, roughness: .2 }), [dx + .22, .6, .1]); add(G, box(1, .1, .4), M('#c9bdaa', { roughness: .9 }), [dx, .05, .2]);
  const tilesMat = (rx, ry, rot = 0) => { const tm = tex(tilesCanvas(false), rx, ry, true), tb = tex(tilesCanvas(true), rx, ry); tm.rotation = tb.rotation = rot; return M('#ffffff', { roughness: .62, map: tm, bumpMap: tb, bumpScale: 4, clearcoat: .15, clearcoatRoughness: .5 }); };
  const run = Dp / 2;
  if (opts.gable) {
    const gr = rise * 1.45, a2 = Math.atan2(gr, w / 2), L2 = Math.hypot(gr, w / 2) + .3;
    add(G, extrude([[-w / 2, 0], [w / 2, 0], [0, gr]], Dp, 0), M(facade, { roughness: .95, map: tex(PLASTER, .5, .5, true) }), [0, h, -Dp / 2]);
    for (const s of [-1, 1]) { add(G, box(L2, .12, Dp + .5), tilesMat(L2 * 1.2, (Dp + .4) * 1.2, s * Math.PI / 2), [s * Math.cos(a2) * (L2 / 2), h + gr - Math.sin(a2) * (L2 / 2) + .07, -Dp / 2 + .05], [0, 0, -s * a2]); add(G, box(L2, .13, .1), wood, [s * Math.cos(a2) * (L2 / 2), h + gr - Math.sin(a2) * (L2 / 2) - .04, .25], [0, 0, -s * a2]); beam(s * w * .2, h + gr * .22, .09, gr * .5, s * .5); }
    beam(0, h + gr * .46, w * .52, .11); beam(0, h + gr * .3, .11, gr * .62); win(0, h + gr * .23, .38, .4, false);
  } else {
    const a = Math.atan2(rise, run), L = Math.hypot(rise, run) + .35, roof = tilesMat(w * 1.15, L * 1.2);
    for (const s of [1, -1]) add(G, box(w + .14, .12, L), roof, [0, h + rise - Math.sin(a) * (L / 2) + .06, -run + s * Math.cos(a) * (L / 2)], [s * a, 0, 0]);
    add(G, box(w + .2, .1, .16), wood, [0, h + .02, .16]);
    const tri = new THREE.Shape(); tri.moveTo(-run, 0); tri.lineTo(run, 0); tri.lineTo(0, rise); tri.closePath();
    for (const s of [-1, 1]) add(G, new THREE.ShapeGeometry(tri), new THREE.MeshPhysicalMaterial({ color: facade, roughness: .95, side: THREE.DoubleSide }), [s * (w / 2 - .001), h, -run], [0, Math.PI / 2, 0]);
    if (opts.chimney) { add(G, box(.45, 1.1, .45), M('#b5553c', { roughness: .9, bumpMap: T.fine, bumpScale: 3 }), [opts.chimney, h + rise * .75, -run + .1]); add(G, box(.55, .1, .55), M('#6e625a'), [opts.chimney, h + rise * .75 + .57, -run + .1]); }
    if (opts.dormer != null) { const dg = grp(G, [opts.dormer, h + rise * .42, -run * .42]); add(dg, box(.8, .7, .9), wallM); add(dg, box(.5, .46, .06), frame, [0, -.02, .45]); add(dg, box(.4, .36, .04), glass, [0, -.02, .475]); for (const s of [-1, 1]) add(dg, box(.64, .07, 1.1), roof, [s * .23, .44, .02], [0, 0, -s * .6]); }
  }
}
export function buildStreet() {
  const scene = stage({ bg: gradTex([[0, '#3f9df6'], [.3, '#86ccff'], [.55, '#dcf2ff'], [1, '#fff1d6']]), fog: ['#cfe6ff', 22, 90], hemi: ['#bcdcff', '#f1c99a', .6], sun: [[-9, 8.5, 6], '#ffedc8', 4.3, 12], rim: ['#9fd0ff', .9] });
  const world = grp(scene);
  const g = add(world, new THREE.PlaneGeometry(120, 40), M('#ffffff', { roughness: .78, map: tex(cobbleCanvas(false), 58, 20, true), bumpMap: tex(cobbleCanvas(true), 58, 20), bumpScale: 6 }), [8, 0, 4], [-Math.PI / 2, 0, 0]); g.castShadow = false;
  add(world, box(120, .1, 1.1), M('#b8aa98', { roughness: .9 }), [8, .05, -2.7]);
  const FAC = ['#fff1cf', '#ffd0a0', '#ffe3dc', '#dff0ff', '#ffe99a', '#f0dcff', '#e3f7e0'], SH = ['#2f7d5b', '#27357a', '#c8402f', '#2a8c8c', null, '#7a4a9a'], DC = ['#2f7d5b', '#8a3a2a', '#27357a', '#c8402f', '#2a8c8c'];
  let x = -12, i = 0;
  while (x < 19) { const w = 3.0 + rnd(i * 3.7) * 1.2, h = 2.8 + rnd(i * 5.1 + 2) * .8, rise = 1.35 + rnd(i * 7.3 + 1) * .55; house(world, x + w / 2, w, h, rise, FAC[(i * 3 + 1) % FAC.length], { shutter: SH[(i * 2 + 1) % SH.length], door: i % 2, doorColor: DC[i % DC.length], chimney: i % 3 === 0 ? w * .25 : 0, dormer: i % 3 === 1 ? 0 : null, gable: i % 3 === 2 }); x += w; i++; }
  cloud(scene, [-13, 11.5, -40], 2.4); cloud(scene, [3, 13, -45], 3.1); cloud(scene, [15, 10.6, -38], 2.2); cloud(scene, [-2, 10, -50], 1.6);
  const iron = M('#1d2a26', { roughness: .45, metalness: .6 });
  for (const lx of [-4.6, 5.8, 14]) { const lamp = grp(world, [lx, 0, -2.3]); add(lamp, cyl(.05, .07, 3.0, 12), iron, [0, 1.5, 0]); add(lamp, cyl(.12, .16, .3, 12), iron, [0, .15, 0]); add(lamp, cyl(.2, .12, .34, 6), M('#fff2c2', { roughness: .2, emissive: '#ffd27a', emissiveIntensity: .9 }), [0, 3.15, 0]); add(lamp, new THREE.ConeGeometry(.28, .2, 6), iron, [0, 3.42, 0]); blob(world, .5, .3, [lx, -2.3], .5); }
  for (const tx of [-9.5, 1.2, 10.2]) pot(world, [tx, 0, -2.2], 1.25, 0);
  return { scene, world };
}

// ---------- 2: locker room ----------
export function buildLocker() {
  const scene = stage({ bg: new THREE.Color('#d6f2ea'), hemi: ['#ffffff', '#b8d8e8', .75], sun: [[-5, 10, 9], '#fff6ea', 2.6, 10], rim: ['#bfe6ff', .6] });
  wall(scene, M('#ffffff', { roughness: .25, clearcoat: .6, map: tex(gridCanvas('#d6f2ea', '#a9d6c8', 4), 14, 4.2, true), bumpMap: tex(gridCanvas(0, 0, 4, true), 14, 4.2), bumpScale: 2 }), -3.25);
  floor(scene, M('#ffffff', { roughness: .3, clearcoat: .3, map: tex(gridCanvas('#8aa0b8', '#7890a8', 2), 30, 10, true) }), -3.25, 16);
  for (let i = -1; i < 11; i++) {
    const g = grp(scene, [-6.37 + i * 1.45 + .69, 0, -2.9]), blue = vinyl(i % 2 ? '#6db7ff' : '#4f9fef', { roughness: .3 });
    add(g, box(1.45, .72, .66), M('#5d6f86', { roughness: .6 }), [0, .36, 0]); add(g, rbox(1.37, 3.82, .6, .04, 2), blue, [0, 2.63, 0]);
    for (let j = 0; j < 3; j++) add(g, box(.8, .035, .03), M('#274a78'), [0, 4.14 - j * .14, .3]);
    add(g, sph(.07, 10, 8), M(C.yellow, { metalness: .6, roughness: .3 }), [.48, 2.57, .32]); add(g, box(.4, .22, .02), M('#ffffff', { roughness: .5 }), [0, 3.45, .305]);
  }
  const bench = (x, z, w, h) => { const g = grp(scene, [x, 0, z]); add(g, rbox(w, .14, .7, .04, 2), woodM('#f0b878', w, 1), [0, h, 0]); for (const s of [-1, 1]) add(g, box(.12, h, .5), M('#9aa3b5', { metalness: .6, roughness: .35 }), [s * (w / 2 - .35), h / 2, 0]); blob(scene, w / 2, .5, [x, z], .45); };
  bench(-3.7, -1.7, 3.6, .55); bench(-.43, 1.15, 4.1, .42);
  // backpack on the front bench
  const pk = grp(scene, [.25, .49, 1.15]), mint = fabric('#5ee8ae', WEAVE, 10);
  add(pk, rbox(1.0, 1.0, .5, .24), mint, [0, .5, 0]); add(pk, rbox(.6, .32, .14, .06), fabric('#48c992', WEAVE, 6), [0, .3, .28]); add(pk, cyl(.14, .14, .7, 16), vinyl('#6db7ff'), [-.02, .95, -.05], [0, 0, -.2]); add(pk, rbox(.2, .5, .1, .04), vinyl(C.yellow), [.25, .95, .1]);
  add(pk, new THREE.TorusGeometry(.2, .035, 8, 20, Math.PI), fabric('#48c992', WEAVE, 4), [-.3, 1.0, 0]); tube(pk, [[-.5, .62, .2], [0, .78, .27], [.5, .62, .2]], .015, M('#2f9e77'), 12);
  // the guys in the back
  const g1 = makeGuy({ sit: true, top: '#ff8a1f', skin: '#c98d68', hair: '#2b1d17' }); g1.root.position.set(-4.1, .2, -1.6); g1.root.scale.setScalar(.9); g1.root.rotation.y = .25; scene.add(g1.root);
  const g2 = makeGuy({ top: '#6df5b9', towelWaist: true, skin: '#f0c8a8', hair: '#c98a3b' }); g2.root.position.set(2.3, 0, -1.5); g2.root.scale.setScalar(.92); g2.root.rotation.y = .5; scene.add(g2.root);
  const g3 = makeGuy({ back: true, towelShoulder: true, skin: '#e8b088', hair: '#4a3020' }); g3.root.position.set(3.55, 0, -1.6); g3.root.scale.setScalar(.92); g3.root.rotation.y = Math.PI - .35; scene.add(g3.root);
  return { scene, g1, g2, g3 };
}

// ---------- 3: the front door ----------
export function buildDoor() {
  const scene = stage({ bg: new THREE.Color('#f3d9b1'), hemi: ['#dcecff', '#e8cfa8', .65], sun: [[-8, 9, 8], '#ffe9c4', 3.8, 10], rim: ['#bfe6ff', .5] });
  const Z = -2, plaster = M('#f6d9ac', { roughness: .95, map: tex(PLASTER, 8, 3, true), bumpMap: tex(N_FINE, 20, 8), bumpScale: .5 }), trim = M('#e2c191', { roughness: .8 }), glass = M('#bfe6ff', { roughness: .05, clearcoat: 1, envMapIntensity: 2, emissive: '#2a5a80' }), frame = M('#fbfbf6', { roughness: .5 });
  wall(scene, plaster, Z, 40, 14);
  floor(scene, M('#ffffff', { roughness: .85, map: tex(gridCanvas('#cdc5b6', '#b3aa9a', 2), 24, 8, true), bumpMap: tex(gridCanvas(0, 0, 2, true), 24, 8), bumpScale: 2 }), Z, 16);
  for (const y of [3.31, 1.25]) add(scene, box(40, .07, .06), trim, [0, y, Z + .02]);
  // door surround, dark hallway, transom, number, bell
  add(scene, slab(2.9, 3.6, .7, .3, .04), trim, [1.5, 1.6, Z + .1]); add(scene, box(2.4, 2.84, .1), flat('#2a1d18'), [1.5, 1.42, Z + .2]);
  add(scene, slab(2.3, .42, .2, .1, .02), glass, [1.5, 3.03, Z + .24]); add(scene, box(2.44, .09, .2), trim, [1.5, 2.83, Z + .26]);
  const plate = add(scene, slab(1.1, .3, .06, .08, .02), [M('#ffffff', { map: faceTex(textCanvas(220, 60, (g) => { g.fillStyle = '#27357a'; g.fillRect(0, 0, 220, 60); g.fillStyle = '#fff'; g.font = '700 44px "Space Grotesk"'; g.fillText('12', 110, 32); }), 1.1, .3) }), M('#27357a')], [1.5, 3.62, Z + .14]);
  add(scene, slab(.38, .6, .06, .1, .02), M('#c9ced8', { metalness: .7, roughness: .3 }), [3.2, 1.75, Z + .05]); for (const y of [1.88, 1.67]) add(scene, sph(.05, 10, 8), M('#ffffff'), [3.2, y, Z + .1]);
  const leaves = [-1, 1].map(s => {
    const h = grp(scene, [1.5 + s * 1.2, 0, Z + .22]), green = vinyl('#2f7d5b', { roughness: .35, bumpMap: tex(WOOD, 1, 2), bumpScale: .6 });
    add(h, box(1.19, 2.8, .1), green, [-s * .6, 1.4, 0]); add(h, slab(.85, 1.1, .08, .06, .015), glass, [-s * .6, 2.05, .04]); add(h, slab(.85, 1.0, .08, .06, .015), vinyl('#3c9872', { roughness: .4 }), [-s * .6, .78, .04]);
    add(h, sph(.07, 10, 8), M('#ffcf2e', { metalness: 1, roughness: .2 }), [-s * 1.03, 1.25, .09]); return h;
  });
  add(scene, box(3.8, .32, .6), M('#b8b0a2', { roughness: .9 }), [1.5, .16, Z + .3]); add(scene, box(4.4, .16, 1.1), M('#a9a091', { roughness: .9 }), [1.5, .08, Z + .55]);
  // windows: one upstairs is open, its curtain flapping
  const win = (x, y, w, h, open) => {
    const g = grp(scene, [x, y, Z]); add(g, box(w + .16, h + .16, .1), frame, [0, 0, .02]); add(g, box(w + .3, .13, .28), trim, [0, -h / 2 - .12, .1]);
    if (!open) { add(g, box(w, h, .04), glass, [0, 0, .06]); add(g, box(.05, h, .06), frame, [0, 0, .08]); add(g, box(w, .05, .06), frame, [0, 0, .08]); return null; }
    add(g, box(w, h, .04), flat('#2a1d18'), [0, 0, .06]);
    const sash = grp(g, [w / 2, 0, .1]); sash.rotation.y = -1.15; add(sash, box(w * .5, h, .05), frame, [w * .25, 0, 0]); add(sash, box(w * .5 - .12, h - .12, .06), glass, [w * .25, 0, 0]);
    const cur = grp(g, [-w * .1, h / 2, .12]); add(cur, rbox(w * .75, h * .95, .05, .02, 2), fabric('#ffb5c0', WEAVE, 6), [0, -h * .47, 0]); return cur;
  };
  let curtain = null; [-4.18, -1.92, 3.15, 5.12].forEach((x, i) => { const c = win(x, 4.35, 1.41, 1.5, i === 2); if (c) curtain = c; }); win(-4.18, 1.82, 1.41, 1.69); win(5.12, 1.82, 1.41, 1.69);
  pot(scene, [-4.4, 0, -1.5], 1.2, 1); pot(scene, [4.65, 0, -1.5], 1.2, 0);
  return { scene, leaves, curtain };
}

// ---------- 4: airport check-in ----------
export function buildAirport() {
  const scene = stage({ bg: new THREE.Color('#cfe5fb'), hemi: ['#ffffff', '#c8d6ea', .8], sun: [[-4, 11, 9], '#ffffff', 2.4, 10], rim: ['#bfe6ff', .6] });
  const Z = -3.2, wm = M('#d3e7fb', { roughness: .8 }), ink = M('#1f2a44', { roughness: .5 });
  // wall with a big window
  const wx0 = -6.13, wx1 = -.41, wy0 = 2.18, wy1 = 5.55, piece = (x0, x1, y0, y1) => add(scene, box(x1 - x0, y1 - y0, .3), wm, [(x0 + x1) / 2, (y0 + y1) / 2, Z]);
  piece(-25, wx0, 0, 12); piece(wx1, 25, 0, 12); piece(wx0, wx1, 0, wy0); piece(wx0, wx1, wy1, 12);
  add(scene, box(wx1 - wx0, wy1 - wy0, .04), M('#bfe6ff', { roughness: .02, transparent: true, opacity: .22, clearcoat: 1 }), [(wx0 + wx1) / 2, (wy0 + wy1) / 2, Z]);
  for (const x of [wx0, wx0 + 1.9, wx0 + 3.8, wx1]) add(scene, box(.09, wy1 - wy0, .36), ink, [x, (wy0 + wy1) / 2, Z]); for (const y of [wy0, wy1]) add(scene, box(wx1 - wx0 + .09, .09, .36), ink, [(wx0 + wx1) / 2, y, Z]);
  const sky = add(scene, new THREE.PlaneGeometry(40, 20), new THREE.MeshBasicMaterial({ map: gradTex([[0, '#58aef7'], [1, '#d8f0ff']]), fog: false }), [-6, 5, -14]); sky.castShadow = false;
  cloud(scene, [-9, 5.6, -11], .8); cloud(scene, [-3.5, 3.6, -12], .6);
  // the plane outside
  const plane = grp(scene), pw = vinyl('#ffffff'), pr = vinyl('#ff4a4a');
  add(plane, cap(.2, 1.7), pw, [0, 0, 0], [0, 0, Math.PI / 2]); add(plane, extrude([[-.2, 0], [.25, 0], [-.05, .55], [-.25, .55]], .05, .01), pr, [-.75, .12, 0]); add(plane, rbox(.5, .05, 2.2, .02, 2), pr, [.05, -.03, 0], [0, -.25, 0]); add(plane, rbox(.25, .04, .8, .015, 2), pr, [-.85, .05, 0]); add(plane, sph(1, 12, 8), gloss('#6db7ff'), [.78, .06, 0], [0, 0, 0], [.2, .13, .17]);
  // departures board
  const bc = cv(1040, 420, (g) => { g.fillStyle = '#1b2440'; g.fillRect(0, 0, 1040, 420); for (let r = 0; r < 5; r++) for (let c = 0; c < 14; c++) if (rnd(r * 20 + c) > .18) { g.fillStyle = c > 10 ? '#6df5b9' : '#ffe14d'; g.beginPath(); g.roundRect(40 + c * 70, 44 + r * 72, 56, 52, 6); g.fill(); } }), bt = faceTex(bc, 5.3, 2.15);
  add(scene, slab(5.3, 2.15, .12, .2, .03), [new THREE.MeshStandardMaterial({ map: bt, emissiveMap: bt, emissive: '#ffffff', emissiveIntensity: .75, roughness: .4 }), M('#1b2440')], [3.27, 4.37, Z + .25]);
  floor(scene, M('#ffffff', { roughness: .18, clearcoat: .5, map: tex(gridCanvas('#e9ecf2', '#cfd5e0', 2), 20, 7, true) }), Z, 16);
  // desk, sign, clerk
  add(scene, rbox(3.9, 1.75, 1.0, .06, 2), vinyl('#27357a', { roughness: .4 }), [3.6, .875, -1.8]); add(scene, rbox(4.25, .3, 1.2, .08, 2), vinyl('#6db7ff'), [3.6, 1.9, -1.8]);
  const sc = textCanvas(480, 104, (g) => { g.fillStyle = '#ffd91f'; g.fillRect(0, 0, 480, 104); g.fillStyle = '#111'; g.font = '800 60px "Bricolage Grotesque"'; g.fillText('CHECK-IN', 240, 56); });
  add(scene, slab(2.4, .52, .1, .1, .02), [M('#ffffff', { map: faceTex(sc, 2.4, .52), emissive: '#3a3000', roughness: .4 }), M(C.yellow)], [3.6, 2.75, -1.8]); for (const s of [-1, 1]) add(scene, cyl(.03, .03, .5, 8), ink, [3.6 + s * .9, 2.3, -1.8]);
  const g4 = makeGuy({ top: '#27357a', skin: '#c98d68', hair: '#111' }); g4.root.position.set(1.1, 0, -1.4); g4.root.rotation.y = -.5; scene.add(g4.root);
  // queue posts and belt in front
  const chrome = M('#c9ced8', { metalness: .9, roughness: .2 });
  for (const x of [-3.7, -.46]) { add(scene, cyl(.05, .05, .9, 12), chrome, [x, .45, 1.6]); add(scene, cyl(.2, .22, .06, 20), chrome, [x, .03, 1.6]); add(scene, sph(.08, 12, 8), chrome, [x, .93, 1.6]); }
  add(scene, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[-3.7, .82, 1.6], [-2.08, .62, 1.6], [-.46, .82, 1.6]].map(q => new THREE.Vector3(...q))), 20, .045, 6), fabric('#2f6fe0', WEAVE, 20));
  // his suitcase
  const cs = grp(scene, [-3.36, 0, .3]), red = vinyl('#ff4a4a', { roughness: .3 });
  add(cs, rbox(.94, 1.17, .42, .12), red, [0, .7, 0]); for (const x of [-.3, .3]) add(cs, box(.03, .8, .43), M('#c2302f'), [x, .7, 0]); add(cs, new THREE.TorusGeometry(.16, .03, 8, 16, Math.PI), ink, [0, 1.28, 0]);
  add(cs, cyl(.13, .13, .03, 20), M(C.yellow), [0, .9, .215], [Math.PI / 2, 0, 0]); add(cs, slab(.34, .2, .04, .03, .008), M(C.mint), [-.1, .45, .22], [0, 0, .17]); for (const x of [-.3, .3]) add(cs, cyl(.07, .07, .08, 12), ink, [x, .07, 0], [0, 0, Math.PI / 2]);
  blob(scene, .7, .4, [-3.36, .3], .5); blob(scene, 2.3, .8, [3.6, -1.8], .4);
  return { scene, plane, g4 };
}

// ---------- 5: construction site ----------
export function buildSite() {
  const scene = stage({ bg: gradTex([[0, '#5db4f5'], [.5, '#bfe6ff'], [1, '#e9f6ff']]), fog: ['#d5ecff', 25, 80], hemi: ['#cfe6ff', '#d9a66a', .65], sun: [[-8, 9, 7], '#ffeccb', 4.0, 11], rim: ['#bfe6ff', .7] });
  const dirt = M('#ffffff', { roughness: .95, map: tex(cv(256, 256, (g) => { g.fillStyle = '#d3a36a'; g.fillRect(0, 0, 256, 256); g.globalAlpha = .16; g.globalCompositeOperation = 'multiply'; g.drawImage(N_SOFT, 0, 0); g.drawImage(N_FINE, 0, 0); }), 14, 6, true), bumpMap: tex(N_FINE, 30, 12), bumpScale: 2.5 });
  floor(scene, dirt, -60, 16, 120);
  const pit = add(scene, new THREE.CircleGeometry(1, 40), M('#8a6440', { roughness: 1, bumpMap: tex(N_FINE, 6, 6), bumpScale: 5 }), [.4, .01, -.6], [-Math.PI / 2, 0, 0], [3.0, 2.2, 1]); pit.castShadow = false;
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28 + .2; if (Math.sin(a) > .55) continue; add(scene, sph(1, 10, 7), dirt, [.4 + Math.cos(a) * 3.1, .02, -.6 - Math.sin(a) * 2.3], [0, 0, 0], [.5 + rnd(i) * .3, .16 + rnd(i * 3) * .1, .4]); }
  // hoarding fence and far blocks
  for (let i = -8; i < 9; i++) add(scene, box(1.9, 1.7 + rnd(i + 20) * .1, .08), M('#e8bd86', { roughness: .85, bumpMap: tex(WOOD, 1, 1), bumpScale: 1.5 }), [i * 2, .85, -7], [0, 0, (rnd(i + 9) - .5) * .03]);
  [[-9, 5, 4, '#8fa9d6'], [-3, 7, 3.4, '#a3b9e0'], [9.5, 4.5, 5, '#98b0da'], [15, 6.5, 3.5, '#a3b9e0']].forEach(([x, h, w, c]) => add(scene, box(w, h, 3), M(c, { roughness: 1 }), [x, h / 2, -20]));
  cloud(scene, [-10, 9.5, -36], 2.2); cloud(scene, [8, 11, -40], 2.6);
  // crane
  const cr = grp(scene, [5.5, 0, -9]), ym = vinyl('#f2b800', { roughness: .45 });
  for (const [x, z] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]]) add(cr, box(.07, 6.4, .07), ym, [x, 3.2, z]);
  for (let j = 0; j < 14; j++) { add(cr, box(.05, .75, .05), ym, [0, .25 + j * .45, .3], [0, 0, (j % 2 ? 1 : -1) * .93]); add(cr, box(.62, .05, .05), ym, [0, .47 + j * .45, .3]); }
  add(cr, box(5.6, .09, .09), ym, [-2.3, 6.25, .2]); add(cr, box(5.6, .09, .09), ym, [-2.3, 6.25, -.2]); add(cr, box(5.2, .07, .07), ym, [-2.3, 6.75, 0]); add(cr, box(1.8, .09, .5), ym, [1.2, 6.25, 0]); add(cr, box(.8, .6, .6), M('#8b93a5', { roughness: .8 }), [1.8, 6.0, 0]);
  for (let j = 0; j < 11; j++) add(cr, box(.05, .72, .05), ym, [-4.9 + j * .5, 6.5, 0], [0, 0, (j % 2 ? 1 : -1) * .5]);
  add(cr, cyl(.012, .012, 1.8, 6), M('#111'), [-3.8, 5.35, 0]); add(cr, box(.6, .45, .5), M('#c9ced8', { roughness: .7 }), [-3.8, 4.25, 0]);
  // generator
  const gen = grp(scene, [-4.85, 0, -4]); add(gen, rbox(2.8, 1.3, 1.2, .08, 2), vinyl('#c9ced8', { roughness: .5 }), [0, .75, 0]); for (const x of [-.75, .25]) { add(gen, cyl(.44, .44, .1, 28), M('#8f98aa', { metalness: .5, roughness: .4 }), [x, .78, .62], [Math.PI / 2, 0, 0]); add(gen, cyl(.24, .24, .12, 24), M('#5f6878', { metalness: .5, roughness: .4 }), [x, .78, .64], [Math.PI / 2, 0, 0]); }
  for (const x of [-1.1, 1.1]) add(gen, cyl(.16, .16, .2, 14), M('#22252e'), [x, .12, .3], [Math.PI / 2, 0, 0]);
  // barrier and cone
  const stripes = cv(256, 64, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#ff4a4a'; for (let i = -1; i < 6; i++) { g.beginPath(); g.moveTo(i * 56, 0); g.lineTo(i * 56 + 26, 0); g.lineTo(i * 56 + 50, 64); g.lineTo(i * 56 + 24, 64); g.fill(); } });
  const br = grp(scene, [-4.2, 0, -1]); add(br, slab(2.0, .4, .04, .08, .015), [M('#ffffff', { map: faceTex(stripes, 2.0, .4), roughness: .5 }), M('#ffffff')], [0, .7, 0]); for (const x of [-.8, .8]) add(br, box(.1, .55, .1), M('#9aa3b5', { metalness: .5 }), [x, .27, 0]);
  const cone = grp(scene, [4.6, 0, -1.2]); add(cone, new THREE.ConeGeometry(.33, .95, 24), vinyl('#ff8a1f'), [0, .52, 0]); add(cone, cyl(.2, .245, .13, 24), M('#ffffff'), [0, .4, 0]); add(cone, cyl(.105, .15, .13, 24), M('#ffffff'), [0, .68, 0]); add(cone, box(.8, .06, .8), vinyl('#ff8a1f'), [0, .03, 0]);
  blob(scene, .7, .5, [4.6, -1.2], .5); blob(scene, 1.2, .4, [-4.2, -1], .4); blob(scene, 1.9, .9, [-4.85, -4], .5);
  // the old bomb, in front
  const rust = cv(512, 256, (g) => { g.fillStyle = '#7d7650'; g.fillRect(0, 0, 512, 256); g.globalAlpha = .3; g.globalCompositeOperation = 'multiply'; g.drawImage(N_SOFT, 0, 0, 512, 256); g.globalCompositeOperation = 'source-over'; for (let i = 0; i < 22; i++) { g.globalAlpha = .55 + rnd(i) * .35; g.fillStyle = rnd(i * 3) > .5 ? '#b5643c' : '#8f4a2a'; g.beginPath(); g.ellipse(rnd(i * 7) * 512, rnd(i * 11) * 256, 14 + rnd(i * 5) * 34, 8 + rnd(i * 13) * 16, rnd(i) * 3, 0, 7); g.fill(); } });
  const bomb = grp(scene, [-.1, .43, .95]), bm = M('#ffffff', { roughness: .7, metalness: .35, map: tex(rust, 1, 1, true), bumpMap: tex(N_FINE, 3, 2), bumpScale: 3 }), olive = M('#5e5a3c', { roughness: .7, metalness: .3 });
  add(bomb, cap(.42, 1.5), bm, [0, 0, 0], [0, 0, Math.PI / 2]); for (const x of [-.45, .55, .7]) add(bomb, new THREE.TorusGeometry(.425, .02, 6, 28), olive, [x, 0, 0], [0, Math.PI / 2, 0]);
  add(bomb, cyl(.3, .4, .5, 20), olive, [1.2, 0, 0], [0, 0, Math.PI / 2]); for (let i = 0; i < 4; i++) add(bomb, box(.55, .5, .04), olive, [1.3, 0, 0], [i * Math.PI / 4 + Math.PI / 8, 0, 0], [1, 2, 1]); add(bomb, new THREE.TorusGeometry(.5, .03, 6, 24), olive, [1.5, 0, 0], [0, Math.PI / 2, 0]);
  tube(bomb, [[-.95, .3, .1], [-1.08, .5, .12], [-.98, .66, .12]], .018, M('#22252e'), 10); const light = add(bomb, sph(.075, 12, 8), glow('#ff4d6d', 2.5), [-.98, .68, .12]);
  blob(scene, 1.7, .6, [-.1, .95], .6);
  return { scene, bomb, light };
}

// ---------- 6: falling through the sky, then the bedroom ----------
export function buildSky() {
  const scene = stage({ bg: gradTex([[0, '#4ea6ff'], [1, '#cfeaff']]), hemi: ['#ffffff', '#bcdcff', 1.0], sun: [[-6, 9, 9], '#fff6e0', 3.2, 10] });
  const clouds = []; for (let i = 0; i < 9; i++) clouds.push(cloud(scene, [0, 0, 0], .5 + rnd(i + 2) * .6, { emissiveIntensity: .5 }));
  const lines = []; for (let i = 0; i < 14; i++) { const m = add(scene, box(.05, 1, .02), flat('#ffffff', { transparent: true, opacity: .75 })); m.castShadow = false; lines.push(m); }
  return { scene, clouds, lines };
}
export function buildBedroom() {
  const scene = stage({ bg: new THREE.Color('#d9c8ff'), hemi: ['#f3ecff', '#d2b08a', .7], sun: [[-7, 10, 8], '#fff0d8', 3.0, 9], rim: ['#bfe6ff', .5] });
  const Z = -3; wall(scene, M('#d9c8ff', { roughness: .95, bumpMap: tex(N_FINE, 20, 8), bumpScale: 1 }), Z);
  floor(scene, M('#ffffff', { roughness: .45, clearcoat: .3, map: tex(planksCanvas('#b98f6a'), 10, 5, true), bumpMap: tex(planksCanvas('#b98f6a'), 10, 5), bumpScale: .6 }), Z, 16);
  add(scene, box(40, .25, .06), M('#ffffff', { roughness: .6 }), [0, .125, Z + .03]);
  const frame = M('#fbfbf6', { roughness: .5 });
  add(scene, box(2.8, 2.4, .1), frame, [-3.93, 3.89, Z + .03]); add(scene, box(2.62, 2.22, .04), M('#bfe6ff', { roughness: .05, clearcoat: 1, emissive: '#9fdcff', emissiveIntensity: .55 }), [-3.93, 3.89, Z + .07]); add(scene, box(.06, 2.22, .06), frame, [-3.93, 3.89, Z + .1]); add(scene, box(2.62, .06, .06), frame, [-3.93, 3.89, Z + .1]);
  add(scene, rbox(3.1, .26, .22, .06, 2), fabric('#ffb5c0', WEAVE, 8), [-3.93, 5.12, Z + .12]);
  const pic = cv(400, 280, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 400, 280); g.strokeStyle = '#ff4a4a'; g.lineWidth = 9; g.lineJoin = 'round'; g.beginPath(); g.moveTo(60, 180); g.lineTo(200, 80); g.lineTo(280, 140); g.lineTo(340, 60); g.stroke(); g.fillStyle = '#ffd91f'; g.beginPath(); g.arc(300, 80, 28, 0, 7); g.fill(); });
  add(scene, slab(2.0, 1.41, .04, .1, .03), [M('#ffffff', { map: faceTex(pic, 2.0, 1.41), roughness: .6 }), woodM('#f0c890')], [3.63, 4.1, Z + .06], [0, 0, .03]);
  // nightstand and lamp
  const ns = grp(scene, [4.76, 0, -2.2]); add(ns, rbox(1.14, 1.7, .9, .05, 2), woodM('#f0b878'), [0, .85, 0]); add(ns, box(.9, .5, .03), woodM('#d99a5a'), [0, 1.2, .455]); add(ns, sph(.05, 10, 8), M('#ffcf2e', { metalness: 1, roughness: .2 }), [0, 1.2, .49]);
  add(ns, rbox(.6, .3, .4, .08), vinyl('#ffffff'), [0, 1.85, 0]); add(ns, cyl(.025, .025, .5, 8), M('#555'), [0, 2.2, 0]); add(ns, cyl(.2, .34, .42, 24, true), new THREE.MeshStandardMaterial({ color: '#ffe14d', emissive: '#ffcc33', emissiveIntensity: .8, side: THREE.DoubleSide, roughness: .8 }), [0, 2.6, 0]);
  blob(scene, .9, .6, [4.76, -2.2], .5);
  // the bed
  const bed = grp(scene, [0, 0, -.1]), wood = woodM('#f0b878', 1, 2);
  add(bed, rbox(.3, 1.95, 2.6, .1), wood, [-2.87, .97, 0]); add(bed, rbox(.3, 1.4, 2.6, .1), wood, [2.87, .7, 0]); add(bed, box(5.6, .3, 2.4), wood, [0, .35, 0]);
  const soft = grp(bed, [0, .5, 0]);
  add(soft, rbox(5.5, .5, 2.4, .14), fabric('#ffffff', KNIT, 10), [0, .27, 0]); add(soft, rbox(4.15, .58, 2.48, .16), fabric('#6df5b9', KNIT, 14), [.72, .28, 0]);
  for (let i = 0; i < 16; i++) { const x = -1.0 + (i % 8) * .5 + (i > 7 ? .25 : 0); add(soft, sph(1, 12, 8), M('#ffffff', { roughness: .8 }), i > 7 ? [x, .2, 1.245] : [x, .575, .75 - (i % 2) * .5], [0, 0, 0], i > 7 ? [.08, .08, .02] : [.08, .02, .08]); }
  add(soft, rbox(1.25, .34, 1.6, .15), fabric('#ffffff', KNIT, 8), [-1.95, .62, 0], [0, 0, -.08]);
  blob(scene, 3.2, 1.6, [0, -.1], .55);
  return { scene, soft };
}

// ---------- 7 / 9 / end: the red studio ----------
function cyclorama(scene, y0 = 0) {
  const g = new THREE.PlaneGeometry(70, 60, 90, 160), q = g.attributes.position, Rr = 4, zb = -7;
  for (let i = 0; i < q.count; i++) { const s = q.getY(i) + 30, fl = 30; let y, z; if (s < fl) { z = 23 - s; y = 0; } else if (s < fl + Rr * Math.PI / 2) { const a = (s - fl) / Rr; z = zb - Math.sin(a) * Rr; y = Rr - Math.cos(a) * Rr; } else { z = zb - Rr; y = Rr + (s - fl - Rr * Math.PI / 2); } q.setXYZ(i, q.getX(i), y + y0, z); }
  g.computeVertexNormals();
  // rays are painted as the camera sees them, so they stay a clean graphic but take real light and shadow
  const cam = new THREE.PerspectiveCamera(28, 16 / 9, .5, 300); cam.position.set(0, CY, D); cam.lookAt(0, CY, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const uv = g.attributes.uv, v = new THREE.Vector3(); for (let i = 0; i < q.count; i++) { v.fromBufferAttribute(q, i).project(cam); uv.setXY(i, v.x * .5 * 16 / 9 / 2.1 + .5, v.y * .5 / 2.1 + .5); }
  const rays = new THREE.CanvasTexture(cv(1024, 1024, (c2, w, h) => { c2.fillStyle = '#f23a36'; c2.fillRect(0, 0, w, h); c2.fillStyle = '#fb574d'; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, b = a + Math.PI / 18; c2.beginPath(); c2.moveTo(w / 2, h / 2); c2.lineTo(w / 2 + Math.cos(a) * 1500, h / 2 + Math.sin(a) * 1500); c2.lineTo(w / 2 + Math.cos(b) * 1500, h / 2 + Math.sin(b) * 1500); c2.fill(); } const gr = c2.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * .45); gr.addColorStop(0, 'rgba(255,170,120,.4)'); gr.addColorStop(1, 'rgba(255,64,64,0)'); c2.fillStyle = gr; c2.fillRect(0, 0, w, h); }));
  rays.colorSpace = THREE.SRGBColorSpace; rays.center.set(.5, .5);
  const m = add(scene, g, M('#ffffff', { roughness: .85, map: rays, bumpMap: tex(N_FINE, 30, 30), bumpScale: .6 })); m.castShadow = false; return rays;
}
export function tile(parent, w, h, canvas, pos, face = '#ffffff') {
  const g = grp(parent, pos), inner = grp(g);
  add(inner, slab(w, h, .17, .16, .03), gloss(C.ink, { roughness: .35 }), [-.08, .08, -.12]); add(inner, slab(w + .05, h + .05, .19, .1, .02), gloss(C.ink, { roughness: .35 }), [0, 0, -.035]);
  add(inner, slab(w, h, .17, .16, .03), [gloss('#ffffff', { roughness: .18, map: faceTex(canvas, w, h) }), gloss(face, { roughness: .18 })]);
  g.inner = inner; return g;
}
export const brandCanvas = () => cv(1024, 330, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 1024, 330); g.lineJoin = 'round'; g.strokeStyle = '#111'; g.font = '800 112px "Bricolage Grotesque"'; g.textBaseline = 'middle';
  const tw = g.measureText('Checklist').width, pw = g.measureText('Pro').width, tot = 110 + 26 + tw + 16 + pw + 36; let x = (1024 - tot) / 2;
  g.fillStyle = '#ffd91f'; g.lineWidth = 11; g.beginPath(); g.roundRect(x, 110, 110, 110, 24); g.fill(); g.stroke(); g.lineWidth = 15; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 26, 168); g.lineTo(x + 47, 189); g.lineTo(x + 85, 142); g.stroke(); x += 136;
  g.fillStyle = '#111'; g.fillText('Checklist', x, 168); x += tw + 16; g.fillStyle = '#ffd91f'; g.lineWidth = 10; g.beginPath(); g.roundRect(x, 98, pw + 36, 136, 18); g.fill(); g.stroke(); g.fillStyle = '#111'; g.fillText('Pro', x + 18, 168); });
const studio = (y0) => { const scene = stage({ bg: new THREE.Color('#f23a36'), env: .35, hemi: ['#ffffff', '#ff8a70', .5], sun: [[-7, 10, 9], '#fff3e0', 2.6, 10], rim: ['#ffd0a0', 1.4] }); return { scene, rays: cyclorama(scene, y0) }; };
export function buildStudio() {
  const S = studio(0);
  S.tiles = [tile(S.scene, 2.75, 1.25, brandCanvas(), at(620, 185, -.5)), ...['pack', 'bolt', 'cal'].map((n, i) => tile(S.scene, 1.25, 1.25, iconCanvas(n, '#fff'), at(505 + i * 170, 395, -.5)))];
  S.tiles.forEach((t, i) => { if (i) t.rotation.y = [.2, 0, -.2][i - 1]; });
  return S;
}
export function buildPhone() {
  const S = studio(-3), ph = S.phone = grp(S.scene, [0, 1.4, 0]); ph.rotation.set(-.03, -.1, 0);
  add(ph, slab(4.16, 7.2, .56, .36, .06), gloss('#121318', { roughness: .15 }));
  const SW = 476, SH = 856, c = S.canvas = cv(SW * 2, SH * 2, () => { }), t = S.tex = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.repeat.set(1 / 3.808, 1 / 6.848); t.offset.set(.5, .5);
  add(ph, slab(3.808, 6.848, .42, .04, .01), [new THREE.MeshStandardMaterial({ map: t, emissiveMap: t, emissive: '#ffffff', emissiveIntensity: .55, roughness: .25 }), M('#ff4a4a')], [0, 0, .18]);
  add(ph, slab(.96, .24, .12, .03, .008), gloss('#121318'), [0, 3.2, .205]);
  // the tapping hand: fingertip at the group's origin
  const hand = S.hand = grp(ph), skin = M(C.skin, { roughness: .55, sheen: .6, sheenColor: new THREE.Color('#ff9a70') }), hg = grp(hand, [0, 0, .12], [.5, 0, -.12]); hg.scale.setScalar(1.35);
  add(hg, cap(.13, .62), skin, [0, -.42, 0]); add(hg, rbox(.72, .78, .3, .14), skin, [.2, -1.2, -.02]);
  for (let i = 0; i < 3; i++) add(hg, cap(.115, .16), skin, [.2 + i * .19, -.82 - i * .03, .1], [.5, 0, 0]);
  add(hg, cap(.12, .3), skin, [-.25, -1.12, .08], [0, 0, .6]); add(hg, cap(.3, 2.2), skin, [.3, -2.9, -.1], [0, 0, .08]);
  return S;
}
export function buildEnd() {
  const S = studio(-3);
  S.brand = tile(S.scene, 6.6, 2.13, brandCanvas(), at(640, 280, -.5));
  const cta = textCanvas(512, 128, (g) => { g.fillStyle = '#ffd91f'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#111'; g.font = '800 54px "Bricolage Grotesque"'; g.fillText('Open the app', 256, 68); });
  S.cta = tile(S.scene, 2.7, .68, cta, at(640, 472, -.3), C.yellow);
  return S;
}

// ---------- 8b: gym ----------
export function buildGym() {
  const scene = stage({ bg: new THREE.Color('#ffe14d'), hemi: ['#ffffff', '#c9b060', .7], sun: [[-6, 10, 9], '#fff6e0', 2.8, 10], rim: ['#bfe6ff', .6] });
  const Z = -3, steel = M('#9aa3b5', { metalness: .8, roughness: .3 }), dark = M('#22242e', { roughness: .6 });
  wall(scene, M('#ffdf3d', { roughness: .9, bumpMap: tex(N_FINE, 20, 8), bumpScale: 1 }), Z);
  floor(scene, M('#2b2d42', { roughness: .7, bumpMap: tex(N_FINE, 40, 20), bumpScale: 2 }), Z, 16);
  const streaks = cv(420, 380, (g) => { g.fillStyle = '#cfeaff'; g.fillRect(0, 0, 420, 380); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineCap = 'round'; g.lineWidth = 12; g.beginPath(); g.moveTo(60, 40); g.lineTo(140, 10); g.moveTo(100, 120); g.lineTo(220, 70); g.stroke(); });
  add(scene, slab(4.23, 3.83, .1, .12, .03), [M('#ffffff', { map: faceTex(streaks, 4.23, 3.83), roughness: .05, clearcoat: 1, envMapIntensity: 2.5 }), dark], [-3.53, 3.19, Z + .07]);
  for (const x of [2.18, 4.62]) { add(scene, box(.23, 4.35, .23), steel, [x, 2.17, -2]); add(scene, box(.5, .08, 1.2), dark, [x, .04, -2]); } add(scene, box(2.7, .15, .15), M('#6b7280', { metalness: .7, roughness: .35 }), [3.4, 2.8, -2]);
  add(scene, box(1.9, .12, .5), M('#6b7280', { metalness: .7, roughness: .35 }), [3.4, .75, -2.3]); for (const x of [2.6, 4.2]) add(scene, box(.1, .75, .4), steel, [x, .37, -2.3]);
  for (let i = 0; i < 4; i++) { const x = 2.75 + i * .43; add(scene, cyl(.17, .17, .12, 16), dark, [x, .98, -2.15], [Math.PI / 2, 0, 0]); add(scene, cyl(.17, .17, .12, 16), dark, [x, .98, -2.45], [Math.PI / 2, 0, 0]); add(scene, cyl(.04, .04, .3, 8), steel, [x, .98, -2.3], [Math.PI / 2, 0, 0]); }
  // the barbell
  const bar = grp(scene); add(bar, cyl(.055, .055, 4.8, 16), M('#c9ced8', { metalness: .95, roughness: .2 }), [0, 0, 0], [0, 0, Math.PI / 2]);
  for (const s of [-1, 1]) [[2.16, .64, .3, '#ff4a4a'], [1.86, .53, .26, '#16171d'], [1.62, .4, .18, '#6db7ff']].forEach(([x, r, w, c]) => add(bar, cyl(r, r, w, 28), vinyl(c, { roughness: .4 }), [s * x, 0, 0], [0, 0, Math.PI / 2]));
  return { scene, bar };
}

// ---------- 8c: beach ----------
export function buildBeach() {
  const scene = stage({ bg: gradTex([[0, '#4aa8f5'], [.5, '#9fdcff'], [.5001, '#2fb7c8'], [1, '#2fb7c8']]), hemi: ['#cfeaff', '#ffe0a3', .8], sun: [[7, 9, 6], '#fff0c8', 4.0, 10], rim: ['#ffffff', .6] });
  const sea = add(scene, new THREE.PlaneGeometry(400, 300), M('#22b3c9', { roughness: .12, clearcoat: 1, bumpMap: tex(N_SOFT, 60, 80), bumpScale: 3 }), [0, -.02, -161.5], [-Math.PI / 2, 0, 0]); sea.castShadow = false;
  const sandC = cv(256, 256, (g) => { g.fillStyle = '#ffe0a3'; g.fillRect(0, 0, 256, 256); g.globalAlpha = .22; g.globalCompositeOperation = 'multiply'; g.drawImage(N_FINE, 0, 0); g.drawImage(N_SOFT, 0, 0); });
  const sand = add(scene, new THREE.PlaneGeometry(120, 30), M('#ffffff', { roughness: 1, map: tex(sandC, 20, 6, true), bumpMap: tex(N_FINE, 60, 16), bumpScale: 4 }), [0, 0, 3], [-Math.PI / 2, 0, 0]); sand.castShadow = false;
  const foam = []; for (let i = 0; i < 64; i++) { const m = add(scene, sph(1, 8, 6), M('#ffffff', { roughness: .6, emissive: '#bfe9ee', emissiveIntensity: .3 }), [-32 + i, .02, -12], [0, 0, 0], [.75, .1, .5]); m.castShadow = false; foam.push(m); }
  const sun = add(scene, sph(2.6, 28, 18), new THREE.MeshBasicMaterial({ color: '#ffe14d', fog: false }), [15.7, 10.6, -40]); sun.castShadow = false;
  cloud(scene, [-12, 9, -38], 2); cloud(scene, [2, 11.5, -44], 2.6);
  // palm
  const palm = grp(scene, [-5.3, 0, -5]), trunk = M('#c98a4b', { roughness: .9, bumpMap: tex(gridCanvas(0, 0, 4, true), 1, 12), bumpScale: 4 });
  add(palm, new THREE.TubeGeometry(new THREE.CatmullRomCurve3([[0, 0, 0], [-.3, 1.6, 0], [-.1, 3.2, 0], [.45, 4.3, 0]].map(q => new THREE.Vector3(...q))), 20, .17, 10), trunk);
  const leaf = M('#3fcf6f', { roughness: .7, side: THREE.DoubleSide, sheen: .5 }), top = grp(palm, [.45, 4.3, 0]);
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .3, l = grp(top, [0, 0, 0], [0, a, 0]); add(l, sph(1, 12, 6), leaf, [1.0, -.12, 0], [0, 0, -.35], [1.15, .05, .3]); add(l, sph(1, 10, 6), leaf, [1.9, -.62, 0], [0, 0, -.8], [.5, .04, .2]); }
  for (let i = 0; i < 3; i++) add(top, sph(.13, 10, 8), M('#6b4127'), [Math.cos(i * 2.1) * .14, -.14, Math.sin(i * 2.1) * .14]);
  blob(scene, 1.6, .8, [-4.6, -5], .35);
  // lounger
  const lg = grp(scene, [0, 0, -.05]), cloth = fabric('#ff8a1f', WEAVE, 10), stick = woodM('#f0c890');
  add(lg, rbox(2.6, .12, 1.15, .04, 2), cloth, [1.78, .56, 0]); add(lg, rbox(1.5, .12, 1.15, .04, 2), cloth, [-.14, .83, 0], [0, 0, -.36]);
  for (const z of [-.5, .5]) { add(lg, box(.07, .56, .07), stick, [.75, .28, z]); add(lg, box(.07, .56, .07), stick, [2.9, .28, z]); add(lg, box(.07, 1.1, .07), stick, [-.72, .52, z], [0, 0, .12]); }
  blob(scene, 2.2, .8, [1.2, -.05], .5);
  return { scene, foam };
}
