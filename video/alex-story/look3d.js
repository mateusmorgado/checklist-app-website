// Optional "3D-ish" look (index.html?look=3d): stronger colours, soft lighting on every filled shape,
// a drop shadow under the characters and a painted-paper texture over the frame. The drawing and timing stay the same.
(function () {
  if (!/look=3d/.test(location.search)) return;
  document.documentElement.classList.add('look3d');
  // light from the top left: shapes get a soft shaded rim and a highlight, like rounded plastic
  const bevel = (id, blur, scale, spec) => `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${blur}" result="b"/>
    <feDiffuseLighting in="b" surfaceScale="${scale}" diffuseConstant="1.15" lighting-color="#fff" result="d"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>
    <feSpecularLighting in="b" surfaceScale="${scale}" specularConstant="${spec}" specularExponent="22" lighting-color="#fff" result="s"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting>
    <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
    <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.08" k2="0" k3="0" k4="0" result="lit"/>
    <feComposite in="lit" in2="SourceAlpha" operator="in" result="lit2"/>
    <feComposite in="lit2" in2="s2" operator="arithmetic" k1="0" k2="1" k3=".55" k4="0"/>
  </filter>`;
  const svg = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    ${bevel('bevS', 5, 5, .55)}${bevel('bevL', 9, 6, .35)}
  </defs></svg>`;
  const css = `
  .look3d #world { filter: saturate(1.4) contrast(1.06); }
  .look3d .alex :is(.skin, .tbody, .tank, .sll, .pl, .ps, .hair, .shoe, .stache, .vest .panel, .helmet path:not(.rib), .towel path:first-child, .jk .inner, .glasses rect, .it-drink .g),
  .look3d .bot :is(.b-skull, .b-face, .b-jacket, .b-sleeve, .b-leg, .b-shoe, .b-cup, .b-crown, .b-hand, .b-visor, .b-light, .b-badge),
  .look3d #helm path, .look3d .badge { filter: url(#bevS); }
  .look3d .layer svg :is(path, rect, circle, ellipse, polygon):not([fill="none"]):not([stroke="#fff"]) { filter: url(#bevL); }
  .look3d .layer svg > rect:first-child { filter: none; }
  .look3d .actor svg { filter: drop-shadow(8px 10px 0 rgba(20, 10, 40, .22)); }
  .look3d .grain { opacity: .38; mix-blend-mode: overlay; }
  .look3d .paper { position: absolute; inset: 0; pointer-events: none; z-index: 89; mix-blend-mode: multiply; opacity: .3;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Cfilter id='p' x='0' y='0' width='100%25' height='100%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.012 .02' numOctaves='4' seed='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .4  0 0 0 -.9 .62'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E"); background-size: 1280px 720px; }
  .look3d .vig { position: absolute; inset: 0; pointer-events: none; z-index: 88; background: radial-gradient(ellipse 75% 70% at 45% 40%, rgba(255,255,255,.10), transparent 55%, rgba(30, 10, 50, .32)); }
  `;
  document.addEventListener('DOMContentLoaded', () => {
    document.body.insertAdjacentHTML('afterbegin', svg);
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    const stage = document.getElementById('stage');
    stage.insertAdjacentHTML('beforeend', '<div class="vig"></div><div class="paper"></div>');
  });
})();
