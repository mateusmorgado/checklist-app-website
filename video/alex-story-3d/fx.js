// Effects and loose props: thought bubble, sweat drops, stars, confetti, the BOOM, the butterfly.
import { THREE, C, DEG, rnd, cl, eo, ei, back, p, M, vinyl, gloss, glow, flat, T, cv, add, grp, sph, box, cap, extrude, starPts, decal, iconCanvas } from './lib.js';
import { at, sAt, K } from './sets.js';
import { makeHelmet } from './actors.js';

export function makeFx() {
  const F = { all: [] }, root = k => { const g = grp(null); g.visible = false; F.all.push(g); return g; };
  // ----- thought bubble: origin at its tail
  const th = F.think = root(), puff = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1, emissive: '#ffffff', emissiveIntensity: .32 });
  const body = grp(th, [.54, .72, 0]); add(body, sph(1, 24, 16), puff, [0, 0, 0], [0, 0, 0], [.6, .36, .22]);
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + .3; add(body, sph(1, 18, 12), puff, [Math.cos(a) * .47, Math.sin(a) * .27, 0], [0, 0, 0], [.27 + rnd(i) * .06, .24 + rnd(i + 4) * .05, .2]); }
  add(th, sph(.06, 12, 8), puff, [-.18, .08, 0]); add(th, sph(.1, 14, 10), puff, [-.03, .25, 0]);
  th.children.forEach(o => o.traverse(m => { m.castShadow = false; }));
  F.icons = {}; for (const n of ['towel', 'window', 'passport']) { F.icons[n] = decal(th, iconCanvas(n), 1.0, 1.0, [.58, .7, .24]); F.icons[n].material.emissive = new THREE.Color('#ffffff'); F.icons[n].material.emissiveMap = F.icons[n].tex; F.icons[n].material.emissiveIntensity = .35; }
  const xm = F.xmark = grp(th, [.6, .68, .32]), red = vinyl('#ff3b3b'); for (const s of [-1, 1]) add(xm, cap(.055, .78), red, [0, 0, 0], [0, 0, s * .85]);
  F.qmark = decal(th, cv(128, 128, (g) => { g.font = '800 110px "Bricolage Grotesque"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#fff'; g.strokeText('?', 64, 70); g.fillStyle = '#111'; g.fillText('?', 64, 70); }), .5, .5, [1.02, .8, .3]);
  F.showThink = (t, a, b, x, y, icon, mark) => {
    if (t < a || t > b) return; const k = back(p(t, a, a + .3)) * (1 - ei(p(t, b - .15, b))), z = 1.0, s = 1 / sAt(z);
    th.visible = true; th.position.set(...at(x + 38, y + 150 - Math.sin(t * 3) * 4, z)); th.scale.setScalar(Math.max(.001, k) * s);
    for (const n in F.icons) F.icons[n].visible = n === icon; xm.visible = mark === 'x' && t > a + .35; if (xm.visible) xm.scale.setScalar(back(p(t, a + .35, a + .55))); F.qmark.visible = mark === 'q'; F.qmark.rotation.z = Math.sin(t * 4) * .15;
  };
  // ----- sweat drops
  const dropGeo = new THREE.LatheGeometry([[0, .16], [.03, .1], [.085, 0], [.1, -.06], [.07, -.12], [0, -.14]].map(q => new THREE.Vector2(...q)), 16), dm = gloss('#6db7ff', { emissive: '#1d5fa8', emissiveIntensity: .4 });
  F.drops = [0, 1, 2, 3].map(() => { const g = root(); add(g, dropGeo, dm); return g; }); let nd = 0;
  F.drop = (x, y, s) => { const g = F.drops[nd++ % 4]; if (s <= .02) return; g.visible = true; g.position.set(...at(x, y, .7)); g.scale.setScalar(s * .95); };
  // ----- stars
  const stGeo = extrude(starPts(5, .13, .058), .05, .012), stY = vinyl(C.yellow, { emissive: '#7a6200' }), stW = vinyl('#ffffff', { emissive: '#666' });
  F.stars = [0, 1, 2, 3, 4, 5].map(() => { const g = root(); g.m = add(g, stGeo, stY); return g; }); let ns = 0;
  F.star = (pos, r, rot, white) => { const g = F.stars[ns++ % 6]; g.visible = true; g.position.set(...pos); g.scale.setScalar(r / 14); g.rotation.set(0, rot * .7, rot); g.m.material = white ? stW : stY; };
  // ----- confetti
  const CC = ['#ffe14d', '#6df5b9', '#ffffff', '#ffc2c2', '#6db7ff'].map(c => M(c, { roughness: .5, emissive: c, emissiveIntensity: .15, side: THREE.DoubleSide })), cb = box(.12, .17, .015), cd = new THREE.CylinderGeometry(.075, .075, .015, 12);
  F.conf = []; for (let i = 0; i < 56; i++) { const g = root(); add(g, i % 3 ? cb : cd, CC[i % 5], [0, 0, 0], i % 3 ? [0, 0, 0] : [Math.PI / 2, 0, 0]); F.conf.push(g); }
  F.confetti = (t, t0, ox, oy, n, spread) => {
    const dt = t - t0; if (dt < 0 || dt > 2.4) return;
    for (let i = 0; i < Math.min(n, 56); i++) { const a = -Math.PI / 2 + (rnd(i + t0) - .5) * spread, v = 380 + rnd(i * 3 + t0) * 520, x = ox + Math.cos(a) * v * dt, y = oy + Math.sin(a) * v * dt + 700 * dt * dt, g = F.conf[i], z = .5 + rnd(i * 5) * 2.5, w = dt * (4 + rnd(i * 7) * 8);
      g.visible = true; g.position.set(...at(x, y, z)); g.rotation.set(w * .8, w * .6, w); g.scale.setScalar(cl(1 - (dt - 1.6) / .8) * 1.9 / sAt(z) + .001); }
  };
  // ----- BOOM
  const bm = F.boom = root(), PC = ['#ffffff', '#ffe14d', '#ffc2c2', '#e8e8f0'].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 1, emissive: c, emissiveIntensity: .3 }));
  F.puffs = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rnd(i) * .4; F.puffs.push({ a, d: 90 + rnd(i + 3) * 110, r: 60 + rnd(i + 7) * 50, e: add(bm, sph(1, 20, 14), PC[i % 4], [0, 0, (rnd(i + 11) - .5) * 1.2]) }); }
  F.core = add(bm, sph(1, 24, 16), PC[0]); F.burst = add(bm, extrude(starPts(12, 1.36, .72), .12, .03), vinyl(C.yellow, { emissive: '#8a6a00', emissiveIntensity: .6 }), [0, 0, 1.3], [0, 0, 0], [1.3, 1, 1]);
  F.boomTxt = decal(bm, cv(640, 256, (g) => { g.font = '800 184px "Bricolage Grotesque"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = '#111'; g.strokeText('BOOM!', 320, 136); g.fillStyle = '#ff4a4a'; g.fillText('BOOM!', 320, 136); }), 3.6, 1.44, [0, 0, 1.5], [0, 0, 8 * DEG]);
  F.boomTxt.material.emissive = new THREE.Color('#ffffff'); F.boomTxt.material.emissiveMap = F.boomTxt.tex; F.boomTxt.material.emissiveIntensity = .5; bm.traverse(m => { m.castShadow = false; });
  F.showBoom = (k) => {
    bm.visible = true; bm.position.set(...at(640, 560, .6));
    F.puffs.forEach(q => { const r = q.r * eo(cl(k * 1.6)) * (1 + k * .4) / K; q.e.position.x = Math.cos(q.a) * q.d * eo(k) / K; q.e.position.y = Math.sin(q.a) * q.d * eo(k) * .7 / K; q.e.scale.setScalar(r + .001); });
    F.core.scale.setScalar(150 * eo(cl(k * 2)) / K + .001); const b = back(cl(k * 3)); F.burst.scale.set(1.3 * b * .8 + .001, b * .8 + .001, 1); F.burst.rotation.z = -k * 20 * DEG; F.boomTxt.scale.setScalar(b + .001);
  };
  // ----- butterfly
  const bf = F.fly = root(), wm = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: .5, side: THREE.DoubleSide, sheen: 1, emissive: c, emissiveIntensity: .12 });
  F.wings = [-1, 1].map(s => { const w = grp(bf); add(w, new THREE.CircleGeometry(.17, 20), wm('#ff6fb0'), [s * .18, .1, 0], [0, 0, s * -.5], [1, 1.3, 1]); add(w, new THREE.CircleGeometry(.11, 20), wm(C.yellow), [s * .13, -.1, 0]); return w; });
  add(bf, cap(.022, .2), M(C.ink)); bf.traverse(m => { if (m.isMesh) m.castShadow = true; });
  F.showFly = (pos, t) => { bf.visible = true; bf.position.set(...pos); bf.rotation.set(.25, .2, -Math.sin(t * 5) * 12 * DEG); const fl = .25 + Math.abs(Math.sin(t * 28)) * .75, a = Math.acos(fl); F.wings[0].rotation.y = a; F.wings[1].rotation.y = -a; };
  // ----- the helmet that flies off
  F.helm = root(); makeHelmet(F.helm).scale.setScalar(.92);
  F.begin = (scene) => { nd = 0; ns = 0; F.all.forEach(g => { g.visible = false; if (g.parent !== scene) scene.add(g); }); };
  return F;
}
