/* Hair shells for the seated figures. The hair is one smooth skin laid over the same head shape (egg-shaped, see scene.js),
   thick on the crown and tapering to nothing at the hairline, so it is attached to the head and not a separate ball.
   Long hair and scarves hang down behind and beside the face. Pure geometry, no game rules. */
(function (root) {
  const MP = root.MP = root.MP || {};
  const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const lerp = (a, b, t) => a + (b - a) * t;

  /* defaults per style; every field can be overridden by look.hairSpec */
  const STYLES = {
    short: { vol: .55, hl: .5, hlSide: .1, back: -.25, noise: .12 },
    thin: { vol: .38, hl: .45, hlSide: .0, back: -.2, noise: .08 },
    crop: { vol: .55, hl: .5, hlSide: .1, back: -.25, noise: .12 },
    sidepart: { vol: .6, hl: .52, hlSide: .1, back: -.25, part: -.25, sweep: .14, quiff: .5 },
    quiff: { vol: .6, hl: .55, hlSide: .12, back: -.3, part: -.3, sweep: .16, quiff: .9 },
    curly: { vol: 1.1, hl: .45, hlSide: .0, back: -.35, noise: .2, freq: 34 },
    curlgray: { vol: .9, hl: .45, hlSide: .05, back: -.3, noise: .3, freq: 18 },
    afro: { vol: 2.0, hl: .46, hlSide: -.05, back: -.45, noise: .13, freq: 46, round: 1 },
    afrocrown: { vol: 1.9, hl: .46, hlSide: -.05, back: -.45, noise: .16, freq: 40, round: 1 },
    wild: { vol: 1.0, hl: .56, hlSide: -.1, back: -.4, noise: .45, freq: 12, up: .9 },
    mane: { vol: 1.0, hl: .56, hlSide: -.1, back: -.4, noise: .45, freq: 12, up: .9 },
    wavylong: { vol: .6, hl: .55, hlSide: .0, back: -1, hang: 9.5, flare: .7, wave: .5, part: -.2, sweep: .12 },
    longwave: { vol: .6, hl: .55, hlSide: .0, back: -1, hang: 9.5, flare: .7, wave: .5, part: -.2, sweep: .12 },
    long: { vol: .5, hl: .55, hlSide: .0, back: -1, hang: 11, flare: .25, wave: .08, part: 0 },
    wavy: { vol: .55, hl: .52, hlSide: .0, back: -1, hang: 5.5, flare: .5, wave: .35, part: -.15, sweep: .1 },
    bob: { vol: .55, hl: .52, hlSide: .0, back: -1, hang: 4.2, flare: .45, wave: .1 },
    updo: { vol: .5, hl: .5, hlSide: .05, back: -.2, bun: { y: 4.7, z: -1.6, r: 2.7 } },
    softupdo: { vol: .5, hl: .5, hlSide: .05, back: -.2, bun: { y: 4.2, z: -2.4, r: 2.8 } },
    bunsmall: { vol: .5, hl: .5, hlSide: .05, back: -.2, bun: { y: 5.0, z: -1.5, r: 2.0 } },
    bunwave: { vol: .55, hl: .5, hlSide: .0, back: -.25, noise: .15, bun: { y: 4.8, z: -2.2, r: 2.4 } },
    lowbun: { vol: .5, hl: .5, hlSide: .05, back: -.25, bun: { y: -1.3, z: -4.2, r: 2.6 } },
    roll: { vol: .55, hl: .5, hlSide: .05, back: -.2, bun: { y: 4.6, z: -1.2, r: 2.4 } },
    pomp: { vol: .6, hl: .55, hlSide: .1, back: -.25, quiff: 1.1, bun: { y: -1.6, z: -4.1, r: 2.3 } },
    drape: { vol: .6, hl: .62, hlSide: -.15, back: -1, hang: 12.5, flare: 1.0, wave: .25, cloth: 1 },
    headscarf: { vol: .6, hl: .62, hlSide: -.15, back: -1, hang: 12.5, flare: 1.0, wave: .25, cloth: 1 }
  };

  function specFor(look) {
    const hs = look.hairStyle, P = look.hairPanel || {}; let key = hs;
    if (hs === "panel") key = P.type === "updo" ? (look.hairSpecStyle || "updo") : P.type || "short";
    const base = STYLES[key]; if (!base) return null;
    const sp = Object.assign({}, base, look.hairSpec || {});
    if (hs === "panel" && P.vol) sp.vol += P.vol * .6;
    if (hs === "panel" && P.messy) { sp.noise = Math.max(sp.noise || 0, .35); sp.freq = 8; sp.vol += .4; }
    return sp;
  }

  /* egg shape shared with the head (scene.js passes its mapping in) */
  function build(THREE, sp, color, eggFn) {
    const geo = new THREE.SphereGeometry(1, 96, 64), ps = geo.attributes.position, n = ps.count, cols = new Float32Array(n * 3), c0 = new THREE.Color(color), cf = sp.fringe ? new THREE.Color(sp.fringe) : null, ct = sp.trim ? new THREE.Color(sp.trim) : null;
    const base = 4.4;
    for (let i = 0; i < n; i++) {
      const dx = ps.getX(i), dy = ps.getY(i), dz = ps.getZ(i), ax = Math.abs(dx);
      const nz = Math.sin(dx * (sp.freq || 7) + dy * 3.1) * .5 + Math.sin(dz * (sp.freq || 7) * 1.3 - dx * 4.3) * .3 + Math.sin(dy * (sp.freq || 7) * 1.7 + dz * 2.2) * .2;
      const tb = sm(-.15, .95, -dz), sb = sm(.35, .95, ax);
      let fl = lerp(sp.hl, sp.hlSide, sb);
      if (sp.part != null) fl += (dx > sp.part ? 1 : -1) * (sp.sweep || .1) * sm(.0, .5, dz + .3);
      let lim = lerp(fl, sp.back, tb);
      let m = sm(lim - .09, lim + .09, dy);
      const faceZone = dz > .12 && ax < .66 + (sp.hang ? 0 : 0);
      if (sp.hang) { if (faceZone) m = Math.min(m, sm(fl - .09, fl + .09, dy)); else m = 1; }
      let t = (sp.vol || .5) * m * (1 + (sp.noise || 0) * nz * 1.4);
      if (sp.round) t *= 1 + .1 * sm(.2, 1, dy);
      if (sp.sides) t *= 1 - sp.sides * sb * sm(-.2, .5, -dy + .3);
      if (sp.up) t += sp.up * sm(.35, 1, dy) * m * (1 + .6 * nz);
      if (sp.quiff) t += sp.quiff * sm(.1, 1, dy) * sm(-.1, .9, dz) * sm(-.9, .1, dx - (sp.part || 0)) * m;
      let off = m > .002 ? Math.max(.03, t) : -.12;
      let px, py, pz;
      if (sp.hang && dy < .18 && !faceZone && m > .002) {
        const k = (.18 - dy) / 1.18, hh = Math.hypot(dx, dz) || 1, r0 = base + off + (sp.flare || 0) * k * 1.6;
        const wave = (sp.wave || 0) * Math.sin(dy * 14 + ax * 3 + (dx > 0 ? 1 : 0)) * k;
        px = dx / hh * r0 + wave * 1.1 * Math.sign(dx || 1); pz = dz / hh * r0 * (dz > 0 ? .8 : .95);
        py = .75 - (sp.hang) * Math.pow(k, 1.08);
        const e = Math.max(0, 1 - Math.pow(k * 1.06, 8)); if (k > .98) { px *= .3; pz *= .3; }
        px *= (.55 + .45 * Math.min(1, e + .4)); void e;
      } else {
        const R = base + off; px = dx * R; py = dy * R; pz = dz * R;
        if (eggFn) { const q = eggFn(px, py, pz); px = q[0]; py = q[1]; pz = q[2]; }
      }
      ps.setXYZ(i, px, py, pz);
      const shade = (.72 + .28 * sm(0, .7, m)) * (1 + .16 * nz * (sp.noise ? 1 : .4)) * (1 + .1 * dy * (dz < 0 ? 1 : 0.3));
      if (cf && dz > .4 && m < (sp.fringeW || .7)) { cols[i * 3] = cf.r; cols[i * 3 + 1] = cf.g; cols[i * 3 + 2] = cf.b; continue; }
      if (ct && m < .97 && m > .002) { cols[i * 3] = ct.r; cols[i * 3 + 1] = ct.g; cols[i * 3 + 2] = ct.b; continue; }
      cols[i * 3] = c0.r * shade; cols[i * 3 + 1] = c0.g * shade; cols[i * 3 + 2] = c0.b * shade;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    ps.needsUpdate = true; geo.computeVertexNormals();
    return geo;
  }

  MP.Hair = { specFor, build, STYLES };
})(typeof window !== "undefined" ? window : globalThis);
