// Shared helpers for the 3D Alex story: deterministic noise, procedural textures, materials and small geometry builders.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE };

export const C = { red: '#ff4a4a', ink: '#141416', white: '#ffffff', yellow: '#ffd91f', mint: '#6df5b9', pink: '#ff9d9d', blue: '#6db7ff', navy: '#22307a', skin: '#eeb48c', hair: '#2a1a13' };
export const DEG = Math.PI / 180;
export const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const p = (t, a, b) => cl((t - a) / (b - a));
export const eo = x => 1 - Math.pow(1 - x, 3), ei = x => x * x * x, eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export const back = x => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const hold = (t, a, b, e = .25) => Math.min(eio(p(t, a, a + e)), 1 - eio(p(t, b - e, b)));
export const lerp = (a, b, x) => a + (b - a) * x;
export const sstep = (a, b, x) => { const t = cl((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---------- canvases ----------
export const cv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
export function noiseCanvas(size, period, octaves, seed, contrast = 1) {
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d'), im = g.createImageData(size, size);
  const h = (x, y, q, s) => rnd(((x % q + q) % q) * 57 + ((y % q + q) % q) * 131 + s * 17.3 + q);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let v = 0, amp = .5, q = period, tot = 0;
    for (let o = 0; o < octaves; o++) {
      const fx = x / size * q, fy = y / size * q, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy, sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const a = h(ix, iy, q, seed), b = h(ix + 1, iy, q, seed), cc = h(ix, iy + 1, q, seed), d = h(ix + 1, iy + 1, q, seed);
      v += amp * (a + (b - a) * sx + (cc - a) * sy + (a - b - cc + d) * sx * sy); tot += amp; amp *= .5; q *= 2;
    }
    v = cl((v / tot - .5) * contrast + .5) * 255; const i = (y * size + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); return c;
}
export function tex(canvas, rx = 1, ry = 1, color = false) {
  const t = new THREE.CanvasTexture(canvas); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4; if (color) t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const N_FINE = noiseCanvas(256, 32, 4, 3, 1.6), N_SOFT = noiseCanvas(256, 6, 4, 9, 1.4);
export const WEAVE = cv(64, 64, (g) => {
  g.fillStyle = '#555'; g.fillRect(0, 0, 64, 64);
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const hz = (i + j) % 2 === 0, x = i * 16, y = j * 16, gr = hz ? g.createLinearGradient(0, y, 0, y + 16) : g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, '#222'); gr.addColorStop(.5, '#fff'); gr.addColorStop(1, '#222'); g.fillStyle = gr; g.fillRect(x, y, 16, 16); }
});
export const KNIT = cv(64, 64, (g) => {
  g.fillStyle = '#777'; g.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 8; i++) { const gr = g.createLinearGradient(i * 8, 0, i * 8 + 8, 0); gr.addColorStop(0, '#333'); gr.addColorStop(.5, '#eee'); gr.addColorStop(1, '#333'); g.fillStyle = gr; g.fillRect(i * 8, 0, 8, 64); }
  g.globalAlpha = .35; for (let j = 0; j < 16; j++) { g.fillStyle = j % 2 ? '#000' : '#fff'; g.fillRect(0, j * 4, 64, 2); }
});
export const TERRY = noiseCanvas(128, 48, 2, 21, 2.2);
export const DENIM = cv(128, 128, (g) => {
  g.fillStyle = '#2f4285'; g.fillRect(0, 0, 128, 128); g.lineWidth = 1.6;
  for (let i = -128; i < 256; i += 5) { g.strokeStyle = i % 10 ? 'rgba(130,160,225,.4)' : 'rgba(20,30,80,.45)'; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 128, 128); g.stroke(); }
  g.globalAlpha = .25; g.globalCompositeOperation = 'overlay'; g.drawImage(N_FINE, 0, 0, 128, 128);
});
export const PLASTER = cv(256, 256, (g) => { g.fillStyle = '#f4f4f4'; g.fillRect(0, 0, 256, 256); g.globalAlpha = .16; g.globalCompositeOperation = 'multiply'; g.drawImage(N_SOFT, 0, 0); g.globalAlpha = .1; g.drawImage(N_FINE, 0, 0); });
export const WOOD = cv(256, 256, (g) => {
  g.fillStyle = '#7a4a2c'; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 140; i++) { g.strokeStyle = `rgba(${rnd(i * 3) > .5 ? '30,14,6' : '170,115,70'},${.12 + rnd(i * 5) * .25})`; g.lineWidth = .6 + rnd(i * 7) * 2; const x = rnd(i * 11) * 256; g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + rnd(i) * 10 - 5, 80, x + rnd(i + 1) * 10 - 5, 170, x + rnd(i + 2) * 8 - 4, 256); g.stroke(); }
});
export function tilesCanvas(bump) {
  return cv(256, 256, (g) => {
    g.fillStyle = bump ? '#000' : '#7a2a1c'; g.fillRect(0, 0, 256, 256); const cols = 4, rows = 4, tw = 256 / cols, th = 256 / rows;
    for (let j = rows; j >= -1; j--) for (let i = -1; i <= cols; i++) {
      const x = i * tw + (j % 2 ? tw / 2 : 0), y = j * th, k = rnd(((i + 8) % cols) * 7 + ((j + 8) % rows) * 13 + (((j % 2) + 2) % 2) * 3), gr = g.createLinearGradient(0, y - 6, 0, y + th + 14);
      if (bump) { gr.addColorStop(0, '#333'); gr.addColorStop(1, '#fff'); } else { const hue = 6 + k * 14, l = 46 + k * 12; gr.addColorStop(0, `hsl(${hue} 74% ${l - 16}%)`); gr.addColorStop(.75, `hsl(${hue} 80% ${l}%)`); gr.addColorStop(1, `hsl(${hue + 6} 86% ${l + 9}%)`); }
      g.fillStyle = gr; g.beginPath(); g.moveTo(x + 2, y - 8); g.lineTo(x + tw - 2, y - 8); g.lineTo(x + tw - 2, y + th - 14); g.quadraticCurveTo(x + tw - 2, y + th + 14, x + tw / 2, y + th + 14); g.quadraticCurveTo(x + 2, y + th + 14, x + 2, y + th - 14); g.closePath(); g.fill();
      if (!bump) { g.strokeStyle = 'rgba(70,16,8,.55)'; g.lineWidth = 2.5; g.stroke(); }
    }
  });
}
export function cobbleCanvas(bump) {
  return cv(512, 512, (g) => {
    g.fillStyle = bump ? '#000' : '#8d7a66'; g.fillRect(0, 0, 512, 512); const rows = 8, rh = 512 / rows;
    for (let j = 0; j < rows; j++) {
      const x = -(rnd(j * 3.1) * 50), widths = []; let tot = 0; while (tot < 512) { const w = 50 + rnd(j * 11 + widths.length * 5.3) * 46; widths.push(w); tot += w; }
      const sc = 512 / tot; let xx = 0;
      widths.forEach((w0, i) => {
        const w = w0 * sc, k = rnd(j * 17 + i * 29);
        for (const dx of [0, -512, 512]) {
          const X = xx + x + dx + 4, Y = j * rh + 4, Wd = w - 8, Hd = rh - 8;
          if (bump) { const gr = g.createRadialGradient(X + Wd / 2, Y + Hd / 2, 2, X + Wd / 2, Y + Hd / 2, Math.max(Wd, Hd) * .62); gr.addColorStop(0, '#fff'); gr.addColorStop(.6, '#ddd'); gr.addColorStop(1, '#555'); g.fillStyle = gr; }
          else { const l = 70 + k * 14, s = 22 + rnd(i * 3 + j) * 16, hu = 30 + rnd(i * 7 + j * 3) * 16, gr = g.createLinearGradient(X, Y, X + Wd * .4, Y + Hd); gr.addColorStop(0, `hsl(${hu} ${s}% ${l + 5}%)`); gr.addColorStop(1, `hsl(${hu - 6} ${s}% ${l - 7}%)`); g.fillStyle = gr; }
          g.beginPath(); g.roundRect(X, Y, Wd, Hd, 16); g.fill();
        }
        xx += w;
      });
    }
    if (!bump) { g.globalAlpha = .18; g.globalCompositeOperation = 'multiply'; g.drawImage(N_FINE, 0, 0, 512, 512); }
  });
}
// square grid of tiles (walls, floors): colour map + bump
export function gridCanvas(base, line, n = 4, bump = false) {
  return cv(256, 256, (g) => { const s = 256 / n; g.fillStyle = bump ? '#fff' : base; g.fillRect(0, 0, 256, 256); g.strokeStyle = bump ? '#000' : line; g.lineWidth = bump ? 6 : 4; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, 256); g.moveTo(0, i * s); g.lineTo(256, i * s); g.stroke(); } if (!bump) { g.globalAlpha = .08; g.globalCompositeOperation = 'multiply'; g.drawImage(N_SOFT, 0, 0); } });
}
export function planksCanvas(base = '#b98f6a') {
  return cv(256, 256, (g) => { g.fillStyle = base; g.fillRect(0, 0, 256, 256); for (let j = 0; j < 4; j++) { g.fillStyle = `rgba(${rnd(j) > .5 ? '255,220,170' : '60,30,10'},${.08 + rnd(j * 3) * .1})`; g.fillRect(0, j * 64, 256, 64); g.fillStyle = 'rgba(50,25,10,.55)'; g.fillRect(0, j * 64, 256, 3); g.fillRect((rnd(j * 7) * 200) | 0, j * 64, 3, 64); } g.globalAlpha = .3; g.globalCompositeOperation = 'multiply'; g.save(); g.scale(4, .25); g.drawImage(N_FINE, 0, 0); g.drawImage(N_FINE, 0, 256); g.drawImage(N_FINE, 0, 512); g.drawImage(N_FINE, 0, 768); g.restore(); });
}

// ---------- materials ----------
export const T = { fine: tex(N_FINE, 3, 3), soft: tex(N_SOFT, 2, 2) };
export const M = (color, o = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: .5, ...o });
export const vinyl = (color, o = {}) => M(color, { roughness: .32, clearcoat: .55, clearcoatRoughness: .25, bumpMap: T.soft, bumpScale: .35, ...o });
export const gloss = (color, o = {}) => M(color, { roughness: .08, clearcoat: 1, clearcoatRoughness: .05, ...o });
export const fabric = (color, bump = WEAVE, rep = 16, o = {}) => M(color, { roughness: .92, sheen: 1, sheenRoughness: .5, sheenColor: new THREE.Color(color).lerp(new THREE.Color('#ffffff'), .35), bumpMap: tex(bump, rep, rep), bumpScale: 1.6, ...o });
export const glow = (color, k = 1.6) => new THREE.MeshStandardMaterial({ color: '#000', emissive: color, emissiveIntensity: k, roughness: .4 });
export const flat = (color, o = {}) => new THREE.MeshBasicMaterial({ color, ...o });
export const woodM = (tint = '#ffffff', rx = 1, ry = 1) => M(tint, { roughness: .75, map: tex(WOOD, rx, ry, true), bumpMap: tex(WOOD, rx, ry), bumpScale: 1.2 });

// ---------- geometry ----------
export function add(parent, geo, mat, pos = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  const m = new THREE.Mesh(geo, mat); m.position.set(...pos); m.rotation.set(...r); m.scale.set(...(typeof s === 'number' ? [s, s, s] : s)); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
export const grp = (parent, pos = [0, 0, 0], r = [0, 0, 0]) => { const g = new THREE.Group(); g.position.set(...pos); g.rotation.set(...r); if (parent) parent.add(g); return g; };
const geoCache = new Map();
const cached = (k, f) => { if (!geoCache.has(k)) geoCache.set(k, f()); return geoCache.get(k); };
export const rbox = (w, h, d, r, seg = 6) => cached(`rb${w},${h},${d},${r},${seg}`, () => new RoundedBoxGeometry(w, h, d, seg, r));
export const box = (w, h, d) => cached(`b${w},${h},${d}`, () => new THREE.BoxGeometry(w, h, d));
export const sph = (r = 1, a = 24, b = 16) => cached(`s${r},${a},${b}`, () => new THREE.SphereGeometry(r, a, b));
export const cyl = (rt, rb, h, seg = 28, ...a) => cached(`c${rt},${rb},${h},${seg},${a}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, ...a));
export const cap = (r, len) => cached(`k${r},${len}`, () => new THREE.CapsuleGeometry(r, len, 8, 20));
export function tube(parent, pts, r, mat, seg = 20) {
  const g = grp(parent); add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(q => new THREE.Vector3(...q))), seg, r, 8), mat); add(g, sph(r, 10, 8), mat, pts[0]); add(g, sph(r, 10, 8), mat, pts[pts.length - 1]); return g;
}
export function rrShape(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2; r = Math.min(r, w / 2, h / 2);
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.absarc(x + w - r, y + r, r, -Math.PI / 2, 0); s.lineTo(x + w, y + h - r); s.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2);
  s.lineTo(x + r, y + h); s.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI); s.lineTo(x, y + r); s.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5); return s;
}
// rounded rectangle plate, centred; material group 0 = front and back faces, 1 = rim
export function slab(w, h, r, depth, bevel = .02) {
  const g = new THREE.ExtrudeGeometry(rrShape(w - 2 * bevel, h - 2 * bevel, r), { depth: depth - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 10 }); g.translate(0, 0, -depth / 2 + bevel); return g;
}
export function extrude(pts, depth, bevel = .01) { const s = new THREE.Shape(); pts.forEach((q, i) => i ? s.lineTo(q[0], q[1]) : s.moveTo(q[0], q[1])); s.closePath(); const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: bevel > 0, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 2 }); g.translate(0, 0, -depth / 2); return g; }
export const starPts = (n, ro, ri) => { const a = []; for (let i = 0; i < n * 2; i++) { const an = i / (n * 2) * Math.PI * 2 + Math.PI / 2, rr = i % 2 ? ri : ro; a.push([Math.cos(an) * rr, Math.sin(an) * rr]); } return a; };
// texture that covers the front of a slab exactly
export const faceTex = (canvas, w, h) => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / w, 1 / h); t.offset.set(.5, .5); t.anisotropy = 4; return t; };
// a flat picture on a transparent plane (icons, signs)
export function decal(parent, canvas, w, h, pos = [0, 0, 0], r = [0, 0, 0]) {
  const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: .6, alphaTest: .02 })); m.position.set(...pos); m.rotation.set(...r); m.receiveShadow = true; parent.add(m); m.tex = t; return m;
}
// height of a rounded box surface (front, +z) at local x,y
export const boxZ = (x, y, hx, hy, hz, r) => { const dx = Math.max(0, Math.abs(x) - (hx - r)), dy = Math.max(0, Math.abs(y) - (hy - r)); return (hz - r) + Math.sqrt(Math.max(0, r * r - dx * dx - dy * dy)); };
const BLOB = new THREE.CanvasTexture(cv(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(20,10,35,1)'); gr.addColorStop(.45, 'rgba(20,10,35,.55)'); gr.addColorStop(1, 'rgba(20,10,35,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }));
export function blob(parent, rx, rz, pos = [0, 0], o = .5) { const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: BLOB, transparent: true, depthWrite: false, opacity: o })); m.rotation.x = -Math.PI / 2; m.position.set(pos[0], .012, pos[1]); m.renderOrder = 2; parent.add(m); return m; }

// ---------- drawing icons with the original SVG paths ----------
export const P2 = (g, d, fill, lw, stroke) => { const q = new Path2D(d); if (fill) { g.fillStyle = fill; g.fill(q); } if (lw !== 0) { g.lineWidth = lw || 3.5; g.strokeStyle = stroke || '#111'; g.stroke(q); } };
export const ICON = {
  towel: g => { P2(g, 'M26 14h48q8 0 8 8v46q0 8-8 8H26q-8 0-8-8V22q0-8 8-8z', '#fff'); P2(g, 'M18 32h64M18 58h64', null, 8, '#6db7ff'); P2(g, 'M26 14h48q8 0 8 8v46q0 8-8 8H26q-8 0-8-8V22q0-8 8-8z'); },
  window: g => { P2(g, 'M20 10h60q6 0 6 6v58q0 6-6 6H20q-6 0-6-6V16q0-6 6-6z', '#bfe6ff'); P2(g, 'M50 10v70M14 45h72'); P2(g, 'M86 10L102 24V92L86 80Z', '#fff'); },
  passport: g => { P2(g, 'M30 8h42q6 0 6 6v62q0 6-6 6H30q-6 0-6-6V14q0-6 6-6z', '#8b1e3f'); g.beginPath(); g.arc(51, 38, 14, 0, 7); g.lineWidth = 3.5; g.strokeStyle = '#ffe14d'; g.stroke(); P2(g, 'M37 38h28M51 24v28', null, 2.5, '#ffe14d'); g.fillStyle = '#ffe14d'; g.beginPath(); g.roundRect(36, 62, 30, 6, 3); g.fill(); },
  pack: g => { P2(g, 'M24 34q0-16 26-16t26 16v44q0 8-8 8H32q-8 0-8-8z', '#6df5b9'); P2(g, 'M38 18q0-10 12-10t12 10'); P2(g, 'M34 50h32v22h-32z', '#fff'); P2(g, 'M58 64l8 8 16-18', null, 8); P2(g, 'M58 64l8 8 16-18', null, 3.4, '#6df5b9'); },
  bolt: g => { P2(g, 'M46 8L18 56h24l-6 36 34-52H46z', '#ffd91f'); g.fillStyle = '#111'; g.font = '800 34px "Bricolage Grotesque"'; g.fillText('3×', 58, 94); },
  cal: g => { P2(g, 'M22 22h56q8 0 8 8v50q0 8-8 8H22q-8 0-8-8V30q0-8 8-8z', '#fff'); P2(g, 'M22 22h56q8 0 8 8v10H14V30q0-8 8-8z', '#ff4a4a'); P2(g, 'M32 14v16M68 14v16'); P2(g, 'M34 64l10 10 22-22', null, 7); },
};
export const iconCanvas = (name, bg = null, size = 512) => cv(size, size, (g) => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, size, size); } const k = size / 512; g.translate(96 * k, 96 * k); g.scale(3.2 * k, 3.2 * k); g.lineJoin = g.lineCap = 'round'; ICON[name](g); });
