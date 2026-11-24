/* Painted faces and torsos for the seated figures (2D canvas, no libraries). Pure drawing, no game rules.
   look = profile.look: skin, hair, eyes, brow{c,t,a}, nose, mouth, lips, lipstick, wrinkles, stubble, beard{style,c}, glasses{type,c},
        shadow (eye shadow), blush, lashes, face{w,h}; torso: kind, c1, c2, c3, number.
   Head units: the head patch is 2R wide with R = 4.45; x right, y up, eyes at y = .5, mouth at y = -1.9.            */
(function (root) {
  const MP = root.MP = root.MP || {};
  const S = 57.5, X = x => 256 + x * S, Y = y => 256 - y * S;
  const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };
  const cv = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h || w; return c; };

  function paintFace(L) {
    const c = cv(512), g = c.getContext("2d"), skin = L.skin, dark = mix(skin, "#000000", .35), light = mix(skin, "#ffffff", .22), wr = L.wrinkles || 0;
    g.fillStyle = skin; g.fillRect(0, 0, 512, 512);
    const gr = g.createRadialGradient(X(0), Y(.3), 20, X(0), Y(0), 270); gr.addColorStop(0, light); gr.addColorStop(.55, skin); gr.addColorStop(1, mix(skin, "#000000", .12)); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.lineCap = "round"; g.lineJoin = "round";
    const line = (pts, w, col, a) => { g.strokeStyle = col; g.globalAlpha = a == null ? 1 : a; g.lineWidth = w * S; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.stroke(); g.globalAlpha = 1; };
    const curve = (a, b, c2, w, col, al) => { g.strokeStyle = col; g.globalAlpha = al == null ? 1 : al; g.lineWidth = w * S; g.beginPath(); g.moveTo(X(a[0]), Y(a[1])); g.quadraticCurveTo(X(b[0]), Y(b[1]), X(c2[0]), Y(c2[1])); g.stroke(); g.globalAlpha = 1; };
    const ell = (x, y, rx, ry, col, al) => { g.fillStyle = col; g.globalAlpha = al == null ? 1 : al; g.beginPath(); g.ellipse(X(x), Y(y), rx * S, ry * S, 0, 0, 7); g.fill(); g.globalAlpha = 1; };
    /* blush and cheek shading */
    if (L.blush) [-1, 1].forEach(s => ell(s * 2.6, -.9, 1.2, .8, L.blush, .35));
    [-1, 1].forEach(s => ell(s * 3.7, -.4, .9, 2.2, dark, .12));
    /* age: forehead lines, eye bags, folds */
    if (wr > 0) { for (let i = 0; i < 3; i++) curve([-2 + i * .1, 2.5 + i * .55], [0, 2.7 + i * .55 + wr * .2], [2 - i * .1, 2.5 + i * .55], .1 + wr * .05, dark, wr * .5);
      [-1, 1].forEach(s => { curve([s * 1.0, -.1], [s * 1.7, -.4], [s * 2.5, -.1], .1, dark, wr * .5); curve([s * 1.2, -.9], [s * 1.6, -2.2], [s * 1.3, -3.1], .12, dark, wr * .55); curve([s * 2.9, .6], [s * 3.3, .4], [s * 3.5, 0], .08, dark, wr * .5); curve([s * 2.9, .4], [s * 3.4, .1], [s * 3.6, -.4], .08, dark, wr * .4); }); }
    /* nose */
    const nz = L.nose || 1; curve([-.3 * nz, 1.1], [-.55 * nz, -.2], [-.8 * nz, -.9], .1, dark, .4); curve([.3 * nz, 1.1], [.55 * nz, -.2], [.8 * nz, -.9], .1, dark, .25);
    ell(0, -.55 * nz, .45 * nz, .42 * nz, light, .5); ell(-.45 * nz, -1.0, .24 * nz, .17 * nz, mix(skin, "#2a0f08", .6), .8); ell(.45 * nz, -1.0, .24 * nz, .17 * nz, mix(skin, "#2a0f08", .6), .8);
    curve([-.85 * nz, -.95], [0, -1.35 * nz], [.85 * nz, -.95], .12, dark, .5);
    /* sunglasses or eyes */
    const gl = L.glasses, sun = gl && gl.type === "sun";
    const ey = L.eyeY == null ? .5 : L.eyeY, ew = L.eyeW || 1;
    if (!sun) [-1, 1].forEach(s => {
      const x = s * 1.7; if (L.shadow) ell(x, ey + .35, 1.15 * ew, .75, L.shadow, .45);
      g.save(); g.beginPath(); g.ellipse(X(x), Y(ey), 1.0 * ew * S, .52 * (L.eyeOpen || 1) * S, 0, 0, 7); g.clip();
      g.fillStyle = "#f6f2ec"; g.fillRect(0, 0, 512, 512); ell(x + s * -.05, ey, .46 * ew, .46, L.eyes || "#3a2a1a"); ell(x - s * .05, ey, .22, .22, "#0a0a0a"); ell(x + .15, ey + .18, .1, .1, "#ffffff", .9); g.restore();
      line([[x - 1.0 * ew, ey + .05], [x - .4 * ew, ey + .5 * (L.eyeOpen || 1)], [x + .5 * ew, ey + .55 * (L.eyeOpen || 1)], [x + 1.0 * ew, ey + .1]], .16, "#1a1210", .95);
      if (L.lashes) line([[x + s * 1.0 * ew, ey + .1], [x + s * 1.3 * ew, ey + .35]], .12, "#1a1210");
      curve([x - 1.0 * ew, ey - .1], [x, ey - .62 * (L.eyeOpen || 1)], [x + 1.0 * ew, ey - .1], .07, dark, .6);
    });
    const bw = L.brow || { c: L.hair, t: 1, a: 1 };
    [-1, 1].forEach(s => { const bt = .13 * (bw.t || 1) + .05, y0 = ey + 1.0 + (bw.y || 0); curve([s * .75, y0 - .05], [s * 1.8, y0 + .35 * (bw.a == null ? 1 : bw.a)], [s * 2.8, y0 - .15], bt * 2.1, bw.c || L.hair, .95); });
    /* mouth */
    const my = -1.95, mw = L.mouthW || 1.25, lips = L.lips || mix(skin, "#a0403a", .45), mt = L.mouth || "smile";
    if (mt === "grin") { g.fillStyle = "#5a1f1f"; g.beginPath(); g.moveTo(X(-mw), Y(my + .2)); g.quadraticCurveTo(X(0), Y(my - 2.3), X(mw), Y(my + .2)); g.quadraticCurveTo(X(0), Y(my + .6), X(-mw), Y(my + .2)); g.fill();
      g.fillStyle = "#fbfaf5"; g.beginPath(); g.moveTo(X(-mw * .85), Y(my + .15)); g.quadraticCurveTo(X(0), Y(my - 1.5), X(mw * .88), Y(my + .15)); g.quadraticCurveTo(X(0), Y(my + .5), X(-mw * .88), Y(my + .15)); g.fill();
      curve([-mw, my + .2], [0, my - 1.35], [mw, my + .2], .14, lips, .9); }
    else if (mt === "smile") { curve([-mw, my + .15], [0, my - .75], [mw, my + .15], .24, lips); curve([-mw * .8, my + .08], [0, my + .15], [mw * .8, my + .08], .08, dark, .6); }
    else if (mt === "smirk") { curve([-mw, my], [0, my - .3], [mw, my + .3], .24, lips); }
    else { curve([-mw, my], [0, my - .12], [mw, my], .26, lips); curve([-mw * .8, my + .05], [0, my + .12], [mw * .8, my + .05], .06, dark, .5); }
    if (L.lipstick) { curve([-mw, my + .1], [0, my - .35], [mw, my + .1], .38, L.lipstick, .9); }
    /* facial hair */
    [].concat(L.beard || []).forEach(bd => { const bc = bd.c; g.fillStyle = bc; g.globalAlpha = bd.a == null ? 1 : bd.a;
      if (bd.style === "stubble") { g.globalAlpha = .38; for (let i = 0; i < 1400; i++) { const x = (Math.random() * 2 - 1) * 3.6, y = -4.3 + Math.random() * 3.6; if (Math.hypot(x / 3.7, (y + 2.2) / 2.5) < 1 && y < -0.7) { g.fillRect(X(x), Y(y), 2, 2); } } g.globalAlpha = 1; }
      else if (bd.style === "short") { g.beginPath(); g.moveTo(X(-4.3), Y(-.4)); g.quadraticCurveTo(X(-4.2), Y(-4.2), X(0), Y(-4.9)); g.quadraticCurveTo(X(4.2), Y(-4.2), X(4.3), Y(-.4)); g.quadraticCurveTo(X(3.2), Y(-1.3), X(2.0), Y(-1.5)); g.quadraticCurveTo(X(0), Y(-1.15), X(-2.0), Y(-1.5)); g.quadraticCurveTo(X(-3.2), Y(-1.3), X(-4.3), Y(-.4)); g.fill(); g.globalAlpha = 1; g.fillStyle = L.lips || "#7a3a35"; curve([-mw * .8, my], [0, my - .2], [mw * .8, my], .26, "#7a3a35", .9); }
      else if (bd.style === "mustache") { g.beginPath(); g.moveTo(X(0), Y(-1.2)); g.quadraticCurveTo(X(-1.6), Y(-1.0), X(-2.0), Y(-1.9)); g.quadraticCurveTo(X(-1.0), Y(-1.5), X(0), Y(-1.65)); g.quadraticCurveTo(X(1.0), Y(-1.5), X(2.0), Y(-1.9)); g.quadraticCurveTo(X(1.6), Y(-1.0), X(0), Y(-1.2)); g.fill(); }
      else if (bd.style === "full") { g.beginPath(); g.moveTo(X(-4.4), Y(.2)); g.quadraticCurveTo(X(-4.6), Y(-4.6), X(0), Y(-5.4)); g.quadraticCurveTo(X(4.6), Y(-4.6), X(4.4), Y(.2)); g.quadraticCurveTo(X(3.4), Y(-1.3), X(2.0), Y(-1.5)); g.quadraticCurveTo(X(0), Y(-1.2), X(-2.0), Y(-1.5)); g.quadraticCurveTo(X(-3.4), Y(-1.3), X(-4.4), Y(.2)); g.fill();
        g.fillStyle = lips; curve([-mw * .8, my], [0, my - .2], [mw * .8, my], .24, "#7a3a35", .9); g.globalAlpha = .2; g.fillStyle = "#ffffff"; for (let i = 0; i < 40; i++) { g.fillRect(X(-3 + Math.random() * 6), Y(-2.5 - Math.random() * 2.6), 2, 14); } g.globalAlpha = 1; }
      else if (bd.style === "goatee") { g.beginPath(); g.ellipse(X(0), Y(-3.4), 1.5 * S, 1.2 * S, 0, 0, 7); g.fill(); }
      g.globalAlpha = 1; });
    /* glasses */
    if (gl) { const col = gl.c || "#222"; if (sun) { [-1, 1].forEach(s => { g.fillStyle = col; g.beginPath(); g.roundRect(X(s * 1.7 - 1.45), Y(ey + 1.0), 2.9 * S, 1.9 * S, 14); g.fill(); g.fillStyle = "rgba(255,255,255,.18)"; g.fillRect(X(s * 1.7 - 1.1), Y(ey + .8), .5 * S, .9 * S); }); line([[-.3, ey + .2], [.3, ey + .2]], .18, col); line([[-3.4, ey + .3], [-4.4, ey + .6]], .2, col); line([[3.4, ey + .3], [4.4, ey + .6]], .2, col); }
      else { g.strokeStyle = col; g.lineWidth = (gl.t || .2) * S; [-1, 1].forEach(s => { g.beginPath(); if (gl.type === "round") g.ellipse(X(s * 1.7), Y(ey), 1.45 * S, 1.35 * S, 0, 0, 7); else g.roundRect(X(s * 1.7 - 1.5), Y(ey + 1.0), 3.0 * S, 2.0 * S, 18); g.stroke(); g.fillStyle = "rgba(255,255,255,.1)"; g.fill(); }); line([[-.25, ey + .25], [.25, ey + .25]], .16, col); line([[-3.2, ey + .3], [-4.4, ey + .4]], .16, col); line([[3.2, ey + .3], [4.4, ey + .4]], .16, col); } }
    return c;
  }

  /* torso front (cylinder patch: u = around, v = from top (shoulders) to bottom (waist)); drawn as a flat shirt front */
  function paintTorso(L) {
    const c = cv(512), g = c.getContext("2d"), k = L.kind || "shirt", c1 = L.c1 || L.top, c2 = L.c2 || "#ffffff", c3 = L.c3 || "#222222";
    g.fillStyle = c1; g.fillRect(0, 0, 512, 512);
    const poly = (pts, col) => { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill(); };
    const V = (col, w, d) => poly([[256 - w, 0], [256 + w, 0], [256, d]], col);
    if (k === "suit") { V(c2, 70, 250); poly([[256, 90], [226, 130], [256, 330], [286, 130]], c3); poly([[256 - 70, 0], [256, 250], [256 - 130, 0]], mix(c1, "#000000", .25)); poly([[256 + 70, 0], [256, 250], [256 + 130, 0]], mix(c1, "#000000", .25)); }
    else if (k === "blazer") { V(c2, 85, 260); poly([[256 - 85, 0], [256, 260], [256 - 150, 0]], mix(c1, "#000000", .2)); poly([[256 + 85, 0], [256, 260], [256 + 150, 0]], mix(c1, "#000000", .2)); g.fillStyle = c3; [300, 380, 450].forEach(y => { g.beginPath(); g.arc(256, y, 9, 0, 7); g.fill(); }); }
    else if (k === "western") { g.fillStyle = c3; for (let i = 0; i < 26; i++) { g.beginPath(); g.arc(80 + (i % 7) * 58, 70 + Math.floor(i / 7) * 90, 18, 0, 7); g.fill(); g.strokeStyle = c3; g.lineWidth = 6; g.beginPath(); g.arc(110 + (i % 7) * 58, 100 + Math.floor(i / 7) * 90, 26, 0, 3.6); g.stroke(); } poly([[256 - 24, 0], [256 + 24, 0], [256 + 18, 430], [256 - 18, 430]], c2); V(c3, 60, 90); }
    else if (k === "jersey") { g.fillStyle = L.stripe || "#d4af37"; g.fillRect(0, 0, 512, 44); g.fillRect(0, 70, 512, 18); V(L.neck || c3, 60, 80); g.fillStyle = c2; g.font = "900 300px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(L.number || "7", 256, 290); g.strokeStyle = L.stripe || "#d4af37"; g.lineWidth = 14; g.strokeText(L.number || "7", 256, 290); }
    else if (k === "madiba") { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? c2 : c3; g.fillRect(i * 64, 0, 64, 512); } g.globalAlpha = .6; for (let y = 20; y < 512; y += 64) for (let x = 32; x < 512; x += 64) { poly([[x, y - 22], [x + 22, y], [x, y + 22], [x - 22, y]], c1); } g.globalAlpha = 1; V(mix(c1, "#000000", .2), 50, 130); }
    else if (k === "lace") { g.fillStyle = mix(c1, "#000000", .06); for (let y = 6; y < 512; y += 18) for (let x = (y / 18) % 2 ? 6 : 15; x < 512; x += 18) { g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill(); } g.fillStyle = c1; g.fillRect(0, 0, 512, 90); g.strokeStyle = mix(c1, "#000000", .15); g.lineWidth = 5; for (let x = 20; x < 512; x += 32) { g.beginPath(); g.arc(x, 92, 16, 0, Math.PI); g.stroke(); } }
    else if (k === "tehuana") { g.fillStyle = c2; for (let x = 0; x < 512; x += 64) { g.fillRect(x, 0, 32, 512); } g.fillStyle = c3; for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(30 + (i % 6) * 90, 60 + Math.floor(i / 6) * 140, 22, 0, 7); g.fill(); g.fillStyle = i % 2 ? "#ffd23f" : "#ff7a3d"; g.beginPath(); g.arc(30 + (i % 6) * 90, 60 + Math.floor(i / 6) * 140, 10, 0, 7); g.fill(); g.fillStyle = c3; } g.fillStyle = "#c9742f"; for (let i = 0; i < 12; i++) { g.beginPath(); g.arc(70 + i * 33, 40 + Math.abs(Math.sin(i / 1.7)) * 36, 15, 0, 7); g.fill(); } }
    else if (k === "cravat") { poly([[256 - 150, 0], [256 + 150, 0], [256 + 110, 260], [256, 370], [256 - 110, 260]], c2); poly([[256 - 70, 110], [256 + 70, 110], [256 + 40, 430], [256 - 40, 430]], c3); g.strokeStyle = "rgba(0,0,0,.18)"; g.lineWidth = 4; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(256 - 100 + i * 36, 10); g.lineTo(256 - 70 + i * 24, 220); g.stroke(); } }
    else if (k === "pattern") { g.fillStyle = c2; for (let i = 0; i < 40; i++) { g.beginPath(); g.arc((i * 83) % 512, (i * 131) % 512, 22 + (i % 3) * 8, 0, 7); g.fill(); g.fillStyle = i % 2 ? c3 : "#ff4f9a"; } poly([[256 - 24, 0], [256 + 24, 0], [256, 90]], "#1a1a1a"); }
    else if (k === "coat") { V(c2, 40, 120); poly([[256 - 40, 0], [256, 150], [256 - 120, 0]], mix(c1, "#000000", .25)); poly([[256 + 40, 0], [256, 150], [256 + 120, 0]], mix(c1, "#000000", .25)); g.fillStyle = c3; [220, 320, 420].forEach(y => { g.beginPath(); g.arc(256, y, 10, 0, 7); g.fill(); }); }
    else if (k === "neckerchief") { V(mix(c1, "#ffffff", .1), 70, 150); poly([[256 - 90, 0], [256 + 90, 0], [256 + 40, 140], [256, 220], [256 - 40, 140]], c2); g.fillStyle = c3; for (let i = 0; i < 20; i++) g.fillRect(190 + (i * 37) % 130, 10 + (i * 53) % 190, 12, 12); }
    else if (k === "hoodie") { V(mix(c1, "#000000", .2), 80, 70); g.fillStyle = c2; g.fillRect(246, 70, 6, 120); g.fillRect(262, 70, 6, 120); g.fillStyle = mix(c1, "#000000", .12); g.fillRect(150, 350, 212, 120); }
    else if (k === "dress") { const mg = g.createLinearGradient(0, 0, 512, 512); mg.addColorStop(0, mix(c1, "#ffffff", .35)); mg.addColorStop(.5, mix(c1, "#000000", .15)); mg.addColorStop(1, mix(c1, "#ffffff", .3)); g.fillStyle = mg; g.fillRect(0, 0, 512, 512); V(mix(c1, "#ffffff", .1), 75, 120); if (L.beads) { g.fillStyle = L.beads; for (let i = 0; i < 16; i++) { const t = i / 15 * Math.PI; g.beginPath(); g.arc(256 + Math.cos(t) * 90 * -1, 20 + Math.sin(t) * 110, 9, 0, 7); g.fill(); } } if (L.sparkle) { g.fillStyle = L.sparkle; for (let i = 0; i < 90; i++) g.fillRect(Math.random() * 512, Math.random() * 512, 5, 5); } }
    else if (k === "runner") { poly([[0, 0], [150, 0], [190, 250], [190, 512], [0, 512]], mix(c1, "#000000", .1)); poly([[512, 0], [362, 0], [322, 250], [322, 512], [512, 512]], mix(c1, "#000000", .1)); g.fillStyle = c2; g.fillRect(190, 120, 132, 14); g.font = "900 70px Arial"; g.textAlign = "center"; g.fillText("100", 256, 210); }
    else { V(c2, 60, 100); poly([[256 - 20, 0], [256, 60], [256 + 20, 0]], mix(c2, "#000000", .1)); }
    /* soft shading so it reads as a body */
    const sh = g.createLinearGradient(0, 0, 512, 0); sh.addColorStop(0, "rgba(0,0,0,.28)"); sh.addColorStop(.3, "rgba(0,0,0,0)"); sh.addColorStop(.7, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,.28)"); g.fillStyle = sh; g.fillRect(0, 0, 512, 512);
    return c;
  }
  MP.Avatars = { paintFace, paintTorso, mix };
})(typeof window !== "undefined" ? window : global);
