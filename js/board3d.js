/* Interactive 3D board (Three.js). Each life gets its own winding road, scenery, bridges and setback arrows. */
GOL.Board3D = function (cv) {
  const T = GFX.T, V = (x, y, z) => new T.Vector3(x, y, z);
  const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: !!window.__GOL_SHOT });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = .8;
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, .5, 800);
  scene.environment = GFX.env(renderer); scene.environmentIntensity = .3;
  { const c = GFX.canvas(8, 256), g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#6ec6ff"); gr.addColorStop(.55, "#bfe8ff"); gr.addColorStop(1, "#fff3d6"); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); scene.background = GFX.tex(c); }
  scene.fog = new T.Fog(0xcfeaff, 200, 520);
  scene.add(new T.HemisphereLight(0xdff1ff, 0x7a6a4a, .45));
  const sun = new T.DirectionalLight(0xfff0d0, 1.7); sun.position.set(-26, 46, 22); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.0006; sun.shadow.normalBias = .05; scene.add(sun); scene.add(sun.target);

  const world = new T.Group(); scene.add(world);
  const B = { onHover: null, onPick: null, canvas: cv, ch: null, scene, world, camera: cam };
  let spinners = [], titleLabels = [], pts = [], tiles = [], pads = [], gates = {}, stars = [], bridges = [], setbacks = [], pawn, pawnPort, ring, confetti = [], clouds = [], waterTex, rngf, route, trees = [], running = false, raf = 0, clock = 0, visited = new Set(), size = { w: 60, d: 40 };

  /* ---------- camera controls ---------- */
  const C = { tgt: V(0, 0, 0), goal: V(0, 0, 0), az: .35, el: .95, dist: 60, gAz: .35, gEl: .95, gDist: 60, follow: true, lastUser: 0 };
  function placeCam() {
    const ce = Math.cos(C.el);
    cam.position.set(C.tgt.x + C.dist * ce * Math.sin(C.az), C.tgt.y + C.dist * Math.sin(C.el), C.tgt.z + C.dist * ce * Math.cos(C.az)); cam.lookAt(C.tgt);
  }
  const ptr = new Map(); let drag = null, moved = 0;
  cv.addEventListener("contextmenu", e => e.preventDefault());
  cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); ptr.set(e.pointerId, { x: e.clientX, y: e.clientY }); drag = { pan: e.button === 2 || e.shiftKey || e.ctrlKey || e.metaKey, pinch: 0 }; moved = 0; C.lastUser = performance.now(); cv.classList.add("grab"); });
  cv.addEventListener("pointermove", e => {
    const p = ptr.get(e.pointerId);
    if (!p) { hover(e); return; }
    const dx = e.clientX - p.x, dy = e.clientY - p.y; moved += Math.abs(dx) + Math.abs(dy); p.x = e.clientX; p.y = e.clientY; C.lastUser = performance.now();
    if (ptr.size === 2) { const [a, b] = [...ptr.values()], d = Math.hypot(a.x - b.x, a.y - b.y); if (drag.pinch) C.gDist = Math.max(10, Math.min(190, C.gDist * drag.pinch / d)); drag.pinch = d; panBy((dx) * .5, (dy) * .5); return; }
    if (drag && drag.pan) panBy(dx, dy); else { C.gAz -= dx * .006; C.gEl = Math.max(.2, Math.min(1.45, C.gEl + dy * .005)); }
  });
  const up = e => { ptr.delete(e.pointerId); if (!ptr.size) { cv.classList.remove("grab"); if (moved < 5 && e.type === "pointerup") pick(e); drag = null; } else if (drag) drag.pinch = 0; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", e => { e.preventDefault(); C.gDist = Math.max(10, Math.min(190, C.gDist * Math.exp(e.deltaY * .0012))); C.lastUser = performance.now(); }, { passive: false });
  function panBy(dx, dy) {
    const k = C.dist * .0016, r = V(Math.cos(C.az), 0, -Math.sin(C.az)), f = V(-Math.sin(C.az), 0, -Math.cos(C.az));
    C.goal.addScaledVector(r, -dx * k).addScaledVector(f, dy * k); C.goal.x = Math.max(-size.w / 2, Math.min(size.w / 2, C.goal.x)); C.goal.z = Math.max(-size.d / 2, Math.min(size.d / 2, C.goal.z)); C.follow = false; B.onFollow && B.onFollow(false);
  }
  const ray = new T.Raycaster(), m2 = new T.Vector2();
  function hitTile(e) { const r = cv.getBoundingClientRect(); m2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(m2, cam); const h = ray.intersectObjects(pads, false)[0]; return h ? h.object.userData.i : -1; }
  function hover(e) { const i = hitTile(e); cv.style.cursor = i >= 0 ? "pointer" : ""; B.onHover && B.onHover(i, e.clientX, e.clientY); }
  function pick(e) { const i = hitTile(e); if (i >= 0 && B.onPick) B.onPick(i); }
  B.setFollow = f => { C.follow = f; if (f) B.onFollow && B.onFollow(true); };
  B.overview = () => { C.follow = false; B.onFollow && B.onFollow(false); C.goal.set((pts.length ? pts.reduce((a, p) => a + p.x, 0) / pts.length : 0), 0, (pts.length ? pts.reduce((a, p) => a + p.z, 0) / pts.length : 0) + 3); C.gDist = fitDist(); C.gEl = 1.05; C.gAz = .12; C.lastUser = performance.now() + 120000; };
  const fitDist = () => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; pts.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }); const bw = Math.min(size.w, x1 - x0 + 16), bd = Math.min(size.d, z1 - z0 + 16); return Math.max(bw / (2 * Math.tan(cam.fov * Math.PI / 360) * cam.aspect), bd / (2 * Math.tan(cam.fov * Math.PI / 360))) * 1.3 + 6; };

  /* ---------- procedural textures ---------- */
  function woodTex() { const c = GFX.canvas(512, 512), g = c.getContext("2d"); g.fillStyle = "#8a5428"; g.fillRect(0, 0, 512, 512); const r = GFX.rng("wood");
    for (let i = 0; i < 240; i++) { g.strokeStyle = `rgba(${60 + r() * 60},${30 + r() * 30},10,${.06 + r() * .12})`; g.lineWidth = 1 + r() * 3; g.beginPath(); const y = r() * 512; g.moveTo(0, y); g.bezierCurveTo(170, y + r() * 24 - 12, 340, y + r() * 24 - 12, 512, y + r() * 10 - 5); g.stroke(); } return GFX.tex(c, true, [3, 1]); }
  function roadTex() { const c = GFX.canvas(256, 256), g = c.getContext("2d"); g.fillStyle = "#f3e1b3"; g.fillRect(0, 0, 256, 256); const r = GFX.rng("road");
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${150 + r() * 60},${120 + r() * 50},80,${.08 + r() * .12})`; g.beginPath(); g.arc(r() * 256, r() * 256, 1 + r() * 3, 0, 7); g.fill(); }
    g.fillStyle = "#fff"; g.globalAlpha = .55; for (let y = 0; y < 256; y += 64) g.fillRect(122, y + 8, 12, 34); return GFX.tex(c, true); }
  function numTex(n, col) { const c = GFX.canvas(128, 128), g = c.getContext("2d"); g.fillStyle = "#fff"; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = col; g.stroke(); g.fillStyle = "#3a2410"; g.font = '900 64px "Arial Rounded MT Bold","Avenir Next",Trebuchet MS,sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(n, 64, 68); return GFX.tex(c); }
  function waterTexture() { const c = GFX.canvas(256, 256), g = c.getContext("2d"); g.fillStyle = "#3fa7e0"; g.fillRect(0, 0, 256, 256); const r = GFX.rng("wat");
    for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(255,255,255,${.12 + r() * .25})`; g.lineWidth = 2; g.beginPath(); const x = r() * 256, y = r() * 256; g.moveTo(x, y); g.quadraticCurveTo(x + 14, y - 6, x + 28, y); g.stroke(); } const t = GFX.tex(c, true, [2, 1]); return t; }

  /* ---------- helpers ---------- */
  function ribbon(curvePts, width, y, mat, cast = false) {
    const pos = [], uv = [], idx = [], n = curvePts.length; let len = 0;
    for (let i = 0; i < n; i++) {
      const a = curvePts[Math.max(0, i - 1)], b = curvePts[Math.min(n - 1, i + 1)], tn = V(b.x - a.x, 0, b.z - a.z).normalize(), nx = V(-tn.z, 0, tn.x);
      if (i) len += curvePts[i].distanceTo(curvePts[i - 1]);
      const p = curvePts[i]; pos.push(p.x + nx.x * width / 2, y + p.y, p.z + nx.z * width / 2, p.x - nx.x * width / 2, y + p.y, p.z - nx.z * width / 2); uv.push(0, len / 6, 1, len / 6);
      if (i < n - 1) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    mat.side = T.DoubleSide; const m = new T.Mesh(g, mat); m.receiveShadow = true; m.castShadow = cast; return m;
  }
  const std = (color, o = {}) => new T.MeshStandardMaterial(Object.assign({ color, roughness: .6, metalness: .02 }, o));
  const shadowed = m => { m.castShadow = true; m.receiveShadow = true; return m; };
  function stripeTex() { const c = GFX.canvas(128, 32), g = c.getContext("2d"); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? "#fff" : "#e5484d"; g.fillRect(i * 16, 0, 16, 32); } return GFX.tex(c, true); }
  const TYPE = { start: 0x4ade80, info: 0x5aa9e6, win: 0xfbbf24, barrier: 0xef4444, choice: 0xa855f7, finish: 0xf8fafc };

  /* One look per life: colours and scenery change so no two boards feel the same. */
  const THEMES = [
    { n: "meadow", g1: 0x5aa05a, g2: 0x468a4f, leaves: [0x2f9e57, 0x3fb86a, 0x1f8a4c, 0x68c35a], sky: ["#6ec6ff", "#bfe8ff", "#fff3d6"], fog: 0xcfeaff, mtn: 0xa09486, snow: true, land: "windmill" },
    { n: "autumn", g1: 0x9a9a45, g2: 0x7d7d3a, leaves: [0xe0782a, 0xd9a21f, 0xc2492b, 0xe8c04a], sky: ["#ffb27a", "#ffe0b0", "#fff3d6"], fog: 0xffe6c4, mtn: 0x9a7a66, snow: false, land: "barn" },
    { n: "snow", g1: 0xe9f1f7, g2: 0xd4e3ee, leaves: [0x2f6f57, 0x3d8a6c, 0x24604b, 0x4a9a7c], sky: ["#a9c8ee", "#dcebfa", "#ffffff"], fog: 0xe3effa, mtn: 0xaab6c6, snow: true, land: "snowman", snowy: true },
    { n: "savanna", g1: 0xc9b25a, g2: 0xb09a47, leaves: [0x6d8f3a, 0x8aa648, 0x58782f, 0xa3b85a], sky: ["#ffcf7a", "#ffe9b8", "#fff6df"], fog: 0xffeccd, mtn: 0xb07a52, snow: false, land: "rock", palm: true },
    { n: "blossom", g1: 0x7ec27a, g2: 0x62ac6c, leaves: [0xff9ac2, 0xffb7d3, 0xf577a8, 0xffd0e2], sky: ["#a7d8ff", "#ffd9ec", "#fff3f8"], fog: 0xffe7f2, mtn: 0xb3a3b8, snow: true, land: "windmill" },
    { n: "city", g1: 0x8fb08a, g2: 0x7aa078, leaves: [0x4e9b62, 0x62b077, 0x3c8650, 0x78c08a], sky: ["#7fb6ee", "#cfe4fa", "#f3f6fb"], fog: 0xd7e6f6, mtn: 0x8d98ab, snow: false, land: "tower", city: true }
  ];
  /* ---------- build a board for one life ---------- */
  B.build = function (ch) {
    while (world.children.length) { const o = world.children.pop(); o.traverse(x => { x.geometry && x.geometry.dispose && x.geometry.dispose(); }); }
    pts = []; titleLabels = []; spinners = []; tiles = ch.tiles; pads = []; gates = {}; stars = []; bridges = []; setbacks = []; confetti = []; clouds = []; trees = []; visited = new Set(); B.ch = ch;
    const r = rngf = GFX.rng(ch.id), n = tiles.length, perRow = 4 + Math.floor(r() * 3), rows = Math.ceil(n / perRow), sp = 5.6 + r() * 1.2, rg = 7.2 + r() * 1.4, amp = 1.2 + r() * 1.6, ph = r() * 3;
    const shape = Math.max(0, GOL.characters.findIndex(c => c.id === ch.id)) % 4; ch.shape = ["serpentine", "spiral", "wave", "ring"][shape];
    const jit = () => (r() - .5) * 1.0;
    if (shape === 0) {
      for (let i = 0; i < n; i++) { const row = Math.floor(i / perRow), c = i % perRow, cc = row % 2 ? perRow - 1 - c : c;
        pts.push(V((cc - (perRow - 1) / 2) * sp + (r() - .5) * 1.4, 0, (row - (rows - 1) / 2) * rg + Math.sin(c * 1.3 + ph + row) * amp + (r() - .5) * 1.2)); }
      size = { w: (perRow - 1) * sp + 24, d: (rows - 1) * rg + 22 };
    } else if (shape === 1) {
      const k = 1.55, step = 6.2; let th = 0, rad = 8; const q = [];
      for (let i = 0; i < n; i++) { q.push(V(Math.cos(th) * rad + jit(), 0, Math.sin(th) * rad + jit())); th += step / rad; rad = 8 + k * th; }
      q.reverse().forEach(v => pts.push(v)); const R = rad + 3; size = { w: 2 * R + 20, d: 2 * R + 20 };
    } else if (shape === 2) {
      const dz = 5.4, amp2 = 8.5 + r() * 2;
      for (let i = 0; i < n; i++) pts.push(V((i - (n - 1) / 2) * dz + jit(), 0, Math.sin(i * .62 + ph) * amp2 + jit()));
      size = { w: (n - 1) * dz + 24, d: 2 * amp2 + 28 };
    } else {
      const R = Math.max(14, n * 6.2 / (2 * Math.PI * .92));
      for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / n * Math.PI * 2 * .92; pts.push(V(Math.cos(a) * R * 1.15 + jit(), 0, Math.sin(a) * R + jit())); }
      size = { w: 2 * R * 1.15 + 26, d: 2 * R + 26 };
    }
    const tint = new T.Color(ch.avatar.color), TH = THEMES[Math.max(0, GOL.characters.findIndex(c => c.id === ch.id)) % THEMES.length], grass = new T.Color(TH.g1).lerp(tint, .06), grass2 = new T.Color(TH.g2).lerp(tint, .05);
    { const c = GFX.canvas(8, 256), g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, TH.sky[0]); gr.addColorStop(.55, TH.sky[1]); gr.addColorStop(1, TH.sky[2]); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); scene.background = GFX.tex(c); scene.fog.color.setHex(TH.fog); }

    /* wooden frame + table */
    const wood = new T.MeshStandardMaterial({ map: woodTex(), roughness: .5, metalness: .05 });
    const frame = shadowed(new T.Mesh(new T.BoxGeometry(size.w + 5, 3.2, size.d + 5), wood)); frame.position.y = -1.66; world.add(frame);
    const gold = new T.MeshPhysicalMaterial({ color: 0xe9b643, metalness: 1, roughness: .25, clearcoat: .5 });
    [[0, -1], [0, 1]].forEach(([, k]) => { const bar = new T.Mesh(new T.BoxGeometry(size.w + 3.4, .5, .5), gold); bar.position.set(0, .05, k * (size.d / 2 + .6)); bar.castShadow = true; world.add(bar); });
    [-1, 1].forEach(k => { const bar = new T.Mesh(new T.BoxGeometry(.5, .5, size.d + 3.4), gold); bar.position.set(k * (size.w / 2 + .6), .05, 0); bar.castShadow = true; world.add(bar); });
    const table = new T.Mesh(new T.PlaneGeometry(600, 600), new T.MeshStandardMaterial({ map: (() => { const t = woodTex(); t.repeat.set(40, 40); return t; })(), color: 0xe9d9b8, roughness: .9 })); table.rotation.x = -Math.PI / 2; table.position.y = -3.3; table.receiveShadow = true; world.add(table);

    /* road samples, used for terrain flattening and prop placement */
    const curve = new T.CatmullRomCurve3(pts, false, "catmullrom", .5), samples = curve.getPoints(n * 14);
    const bridgeCtl = ch.bridges.map(b => { const A = pts[b.from], E = pts[b.to], mid = A.clone().add(E).multiplyScalar(.5), chord = E.clone().sub(A), nrm = V(-chord.z, 0, chord.x).normalize(); if (nrm.dot(mid) < 0) nrm.negate(); return { A, E, ctl: mid.addScaledVector(nrm, 3.4).setY(5.2), side: nrm }; });
    const bSamples = []; bridgeCtl.forEach(b => { for (let t = 0; t <= 1; t += .05) bSamples.push(new T.QuadraticBezierCurve3(b.A, b.ctl, b.E).getPoint(t).setY(0)); });
    const flat = samples.concat(bSamples);
    const dMin = (x, z) => { let m = 1e9; for (let i = 0; i < flat.length; i += 2) { const d = (flat[i].x - x) ** 2 + (flat[i].z - z) ** 2; if (d < m) m = d; } return Math.sqrt(m); };

    /* terrain with gentle hills away from the road */
    const seg = 90, tg = new T.PlaneGeometry(size.w, size.d, seg, Math.round(seg * size.d / size.w)); tg.rotateX(-Math.PI / 2);
    const P = tg.attributes.position, col = new Float32Array(P.count * 3), ph1 = r() * 9, ph2 = r() * 9;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), z = P.getZ(i), d = dMin(x, z), edge = Math.min(size.w / 2 - Math.abs(x), size.d / 2 - Math.abs(z)), k = Math.max(0, Math.min(1, (d - 3.4) / 5)), e = Math.min(1, edge / 6);
      const nz = Math.sin(x * .17 + ph1) * Math.cos(z * .15 + ph2) * .6 + Math.sin(x * .07 + z * .09 + ph2) * .9 + 1.0;
      const h = k * nz * 2.6 * (.3 + .7 * (1 - e * .5)) + (1 - e) * k * 1.8; P.setY(i, h);
      const c = grass.clone().lerp(grass2, Math.min(1, Math.max(0, .5 + Math.sin(x * .6) * Math.cos(z * .5) * .5))).lerp(new T.Color(0xd9c28a), d < 2.3 ? .55 * (1 - Math.max(0, d - 1.8) / .5) : 0).multiplyScalar(.9 + h * .07);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    tg.setAttribute("color", new T.BufferAttribute(col, 3)); tg.computeVertexNormals();
    const land = new T.Mesh(tg, new T.MeshStandardMaterial({ vertexColors: true, roughness: .92 })); land.receiveShadow = true; land.castShadow = true; world.add(land);
    const heightAt = (x, z) => { const d = dMin(x, z), edge = Math.min(size.w / 2 - Math.abs(x), size.d / 2 - Math.abs(z)), k = Math.max(0, Math.min(1, (d - 3.4) / 5)), e = Math.min(1, edge / 6); const nz = Math.sin(x * .17 + ph1) * Math.cos(z * .15 + ph2) * .6 + Math.sin(x * .07 + z * .09 + ph2) * .9 + 1.0; return k * nz * 2.6 * (.3 + .7 * (1 - e * .5)) + (1 - e) * k * 1.8; };

    /* road */
    const road = ribbon(samples, 4.2, .09, std(0xffffff, { map: roadTex(), roughness: .8 })); world.add(road);
    const edgeL = ribbon(samples, 4.8, .05, std(0x9b6b3a, { roughness: .9 })); world.add(edgeL);

    /* tiles */
    const tan = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)]; return V(b.x - a.x, 0, b.z - a.z).normalize(); };
    const stripe = stripeTex();
    tiles.forEach((t, i) => {
      const p = pts[i], col = TYPE[t.type], g = new T.Group(); g.position.copy(p); world.add(g);
      const pad = shadowed(new T.Mesh(new T.CylinderGeometry(1.9, 2.0, .4, 48), new T.MeshPhysicalMaterial({ color: col, roughness: .35, clearcoat: .8, emissive: col, emissiveIntensity: 0 }))); pad.position.y = .22; pad.userData.i = i; g.add(pad); pads.push(pad);
      const rim = new T.Mesh(new T.TorusGeometry(1.95, .11, 10, 56), std(0xffffff, { roughness: .3 })); rim.rotation.x = Math.PI / 2; rim.position.y = .37; g.add(rim);
      const num = new T.Mesh(new T.CircleGeometry(1.35, 32), new T.MeshBasicMaterial({ map: numTex(i + 1, "#" + new T.Color(col).getHexString()), transparent: true })); num.rotation.x = -Math.PI / 2; num.position.set(0, .48, 1.05); g.add(num);
      const tg2 = tan(i), nrm = V(-tg2.z, 0, tg2.x);
      if (t.type === "start") { const h = shadowed(new T.Mesh(new T.BoxGeometry(1.6, 1.3, 1.5), std(0xfde7c3))); h.position.set(-.1, 1.05, -.2); const rf = shadowed(new T.Mesh(new T.ConeGeometry(1.5, 1, 4), std(0xc0504d))); rf.position.set(-.1, 2.2, -.2); rf.rotation.y = Math.PI / 4; g.add(h, rf); }
      if (t.type === "finish") { const bn = new T.Mesh(new T.PlaneGeometry(4.6, 1), new T.MeshBasicMaterial({ map: checker(), side: T.DoubleSide })); bn.position.y = 3.6; g.add(bn); [-2.3, 2.3].forEach(x => { const po = shadowed(new T.Mesh(new T.CylinderGeometry(.14, .14, 4, 10), gold)); po.position.set(x, 2, 0); g.add(po); }); g.rotation.y = Math.atan2(tg2.x, tg2.z) + Math.PI / 2; const f = new T.Mesh(new T.ConeGeometry(.35, .8, 3), std(0xef4444)); f.position.y = 4.5; f.rotation.z = -Math.PI / 2; g.add(f); }
      if (t.type === "win") { const s = starMesh(); s.position.y = 2.1; g.add(s); stars.push(s); }
      if (t.type === "info") { const po = shadowed(new T.Mesh(new T.CylinderGeometry(.07, .09, 1.7, 8), std(0x334155))); po.position.set(1.1, 1.2, -.3); const lamp = new T.Mesh(new T.SphereGeometry(.28, 16, 12), new T.MeshStandardMaterial({ color: 0xfff1b8, emissive: 0xffd36b, emissiveIntensity: 1.4 })); lamp.position.set(1.1, 2.15, -.3); g.add(po, lamp); }
      if (t.type === "choice") { const po = shadowed(new T.Mesh(new T.CylinderGeometry(.09, .1, 2.3, 8), std(0x6b4a2b))); po.position.set(0, 1.5, -.5); g.add(po); [[.9, .45], [-.9, -.4]].forEach(([s, y], k) => { const a = shadowed(new T.Mesh(new T.BoxGeometry(1.3, .42, .1), std(k ? 0x22c55e : 0xf59e0b))); a.position.set(s * .5, 2.2 - k * .5, -.5); a.rotation.y = 0; const tip = new T.Mesh(new T.ConeGeometry(.3, .5, 3), a.material); tip.rotation.z = -Math.PI / 2 * Math.sign(s); tip.position.set(s * 1.2, 2.2 - k * .5, -.5); g.add(a, tip); }); }
      if (t.type === "barrier") {
        const gate = new T.Group(); gate.position.set(0, 0, 0); g.add(gate); gate.rotation.y = Math.atan2(tg2.x, tg2.z);
        [-1.65, 1.65].forEach(x => { const po = shadowed(new T.Mesh(new T.CylinderGeometry(.12, .14, 1.9, 10), std(0xf1f5f9))); po.position.set(x, 1, 1.4); gate.add(po); });
        const arm = new T.Group(); arm.position.set(-1.65, 1.6, 1.4); gate.add(arm); const bar = shadowed(new T.Mesh(new T.BoxGeometry(3.3, .26, .2), new T.MeshStandardMaterial({ map: stripe, roughness: .5 }))); bar.position.x = 1.65; arm.add(bar);
        [-.8, .8].forEach(x => { const co = shadowed(new T.Mesh(new T.ConeGeometry(.28, .7, 14), std(0xff7a1a))); co.position.set(x, .55, 2.3); gate.add(co); });
        gates[i] = arm;
      }
      if (t.gate) {  }
      const short = t.title.length > 22 ? t.title.slice(0, 20) + "…" : t.title, tl = GFX.label(short, { w: 5.2, size: 40, stroke: "#" + new T.Color(col).getHexString() }); tl.position.set(0, t.type === "finish" ? 6.2 : 5.5, 0); tl.visible = false; g.add(tl); titleLabels.push(tl);
    });
    ring = new T.Mesh(new T.TorusGeometry(2.4, .12, 10, 56), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9 })); ring.rotation.x = Math.PI / 2; ring.position.y = .5; world.add(ring);

    /* bridges: arched wooden bridge over a little stream */
    waterTex = waterTexture();
    ch.bridges.forEach((b, k) => {
      const bc = bridgeCtl[k], curve = new T.QuadraticBezierCurve3(bc.A, bc.ctl, bc.E), cps = curve.getPoints(30), g = new T.Group(); world.add(g);
      /* stream below */
      const mid = bc.A.clone().add(bc.E).multiplyScalar(.5).addScaledVector(bc.side, 1.7), dir = bc.E.clone().sub(bc.A), perp = V(-dir.z, 0, dir.x).normalize();
      const sA = mid.clone().addScaledVector(perp, 7), sB = mid.clone().addScaledVector(perp, -7);
      const stream = new T.CatmullRomCurve3([sA, mid.clone().addScaledVector(perp, 3).addScaledVector(dir.clone().normalize(), 1.6), mid, mid.clone().addScaledVector(perp, -3).addScaledVector(dir.clone().normalize(), -1.6), sB]).getPoints(30);
      const wmat = new T.MeshStandardMaterial({ map: waterTex, color: 0xffffff, roughness: .1, metalness: .1, transparent: true, opacity: .92 });
      const banks = ribbon(stream, 4.4, .02, std(0xd9c28a)), water = ribbon(stream, 3.4, .12, wmat); g.add(banks, water);
      const deckMat = new T.MeshStandardMaterial({ color: 0xc8874a, roughness: .55, emissive: 0xffa200, emissiveIntensity: 0 });
      const deck = ribbon(cps, 1.9, .28, deckMat, true); g.add(deck);
      const railMat = std(0x7a4a22, { roughness: .6 });
      [-1, 1].forEach(sd => { const rp = cps.map((p, i) => { const a = cps[Math.max(0, i - 1)], c = cps[Math.min(30, i + 1)], tn = V(c.x - a.x, 0, c.z - a.z).normalize(); return V(p.x - tn.z * sd * .95, p.y + .95, p.z + tn.x * sd * .95); });
        const tube = shadowed(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(rp), 40, .07, 6), railMat)); g.add(tube);
        for (let i = 1; i < 30; i += 3) { const p = cps[i], a = cps[i - 1], c = cps[i + 1], tn = V(c.x - a.x, 0, c.z - a.z).normalize(); const po = shadowed(new T.Mesh(new T.CylinderGeometry(.06, .06, 1, 6), railMat)); po.position.set(p.x - tn.z * sd * .95, p.y + .5, p.z + tn.x * sd * .95); g.add(po); } });
      /* supports */
      [.25, .75].forEach(t => { const p = curve.getPoint(t), po = shadowed(new T.Mesh(new T.CylinderGeometry(.18, .24, p.y, 8), railMat)); po.position.set(p.x, p.y / 2, p.z); g.add(po); });
            const lock = GFX.label("closed: needs Support", { w: 4.2, bg: "#e5e7eb", stroke: "#9ca3af", color: "#4b5563", size: 44 }); lock.position.copy(curve.getPoint(.5)).add(V(0, 2.6, 0)); g.add(lock);
      bridges.push({ curve, deckMat, lock, group: g, state: "closed", water: wmat });
    });

    /* setbacks: red arcs that show where a failure sends you back */
    ch.setbacks.forEach((s, k) => {
      const A = pts[s.at], E = pts[s.to], mid = A.clone().add(E).multiplyScalar(.5), chord = E.clone().sub(A), nrm = V(-chord.z, 0, chord.x).normalize(); if (nrm.dot(mid) > 0) nrm.negate();
      const ctl = mid.addScaledVector(nrm, 4.5).setY(4.5), dirv = E.clone().sub(A).normalize(), curve = new T.QuadraticBezierCurve3(A.clone().addScaledVector(dirv, 1.5).setY(1.0), ctl, E.clone().addScaledVector(dirv, -1.8).setY(1.0));
      const g = new T.Group(); world.add(g);
      const tube = new T.Mesh(new T.TubeGeometry(curve, 48, .2, 10), new T.MeshStandardMaterial({ color: 0xff2d4d, emissive: 0xff2d4d, emissiveIntensity: .6, transparent: true, opacity: .8, roughness: .35 })); g.add(tube);
      const head = new T.Mesh(new T.ConeGeometry(.7, 1.5, 16), new T.MeshStandardMaterial({ color: 0xff2d4d, emissive: 0xff2d4d, emissiveIntensity: .5 })); const end = curve.getPoint(1), tn = curve.getTangent(1); head.position.copy(end); head.quaternion.setFromUnitVectors(V(0, 1, 0), tn); g.add(head);
            setbacks.push({ curve, group: g, tube, at: s.at });
    });

    /* scenery */
    const trunkM = std(0x7a4a22), leafMs = TH.leaves.map(c => std(new T.Color(c), { roughness: .8 }));
    const spots = []; let tries = 0;
    while (spots.length < 130 && tries++ < 1500) { const x = (r() - .5) * (size.w - 3), z = (r() - .5) * (size.d - 3); if (dMin(x, z) > 3.6 && spots.every(s => (s.x - x) ** 2 + (s.z - z) ** 2 > 5)) spots.push({ x, z, k: r() }); }
    
    function landmark(kind) {
      const g = new T.Group(), W = std(0xffffff), RED = std(0xc0504d), WOOD = std(0x8b5a3a);
      if (kind === "windmill") { const b = shadowed(new T.Mesh(new T.CylinderGeometry(1, 1.6, 4.4, 10), std(0xf3e6cf))); b.position.y = 2.2; const c = shadowed(new T.Mesh(new T.ConeGeometry(1.4, 1.6, 10), RED)); c.position.y = 5.2; const bl = new T.Group(); bl.position.set(0, 4.2, 1.25); for (let i = 0; i < 4; i++) { const w = shadowed(new T.Mesh(new T.BoxGeometry(.5, 3.4, .08), W)); w.position.y = 1.7; const a = new T.Group(); a.rotation.z = i * Math.PI / 2; a.add(w); bl.add(a); } g.add(b, c, bl); spinners.push(bl); }
      else if (kind === "snowman") { [[1.1, 1.1], [.8, 2.4], [.55, 3.3]].forEach(([r2, y]) => { const m = shadowed(new T.Mesh(new T.SphereGeometry(r2, 18, 14), W)); m.position.y = y; g.add(m); }); const n = new T.Mesh(new T.ConeGeometry(.12, .6, 8), std(0xff7a1a)); n.position.set(0, 3.3, .6); n.rotation.x = Math.PI / 2; g.add(n); }
      else if (kind === "barn") { const b = shadowed(new T.Mesh(new T.BoxGeometry(3.6, 2.4, 2.8), RED)); b.position.y = 1.2; const rf = shadowed(new T.Mesh(new T.CylinderGeometry(0, 2.5, 1.5, 4), WOOD)); rf.position.y = 3.1; rf.rotation.y = Math.PI / 4; rf.scale.z = .8; const d = new T.Mesh(new T.BoxGeometry(1.2, 1.7, .1), W); d.position.set(0, .85, 1.42); g.add(b, rf, d); }
      else if (kind === "rock") { for (let i = 0; i < 3; i++) { const m = shadowed(new T.Mesh(new T.DodecahedronGeometry(1.2 + i * .5, 0), std(0xc98e5a, { flatShading: true }))); m.position.set(i * 1.3 - 1.3, 1 + (i === 1 ? 1.6 : 0), 0); g.add(m); } }
      else if (kind === "bus") { const b = shadowed(new T.Mesh(new T.BoxGeometry(5, 2, 2.2), std(0xf4b400))); b.position.y = 1.7; g.add(b); const st = shadowed(new T.Mesh(new T.BoxGeometry(5.02, .5, 2.24), std(0x2f6f4e))); st.position.y = 1.2; g.add(st); for (let i = 0; i < 4; i++) { const w = new T.Mesh(new T.BoxGeometry(.8, .6, 2.3), std(0xbfe3ff)); w.position.set(-1.7 + i * 1.15, 2.2, 0); g.add(w); } [-1.6, 1.6].forEach(x => { const wh = shadowed(new T.Mesh(new T.CylinderGeometry(.45, .45, 2.4, 14), std(0x222222))); wh.rotation.x = Math.PI / 2; wh.position.set(x, .5, 0); g.add(wh); }); }
      else if (kind === "telescope") { const b = shadowed(new T.Mesh(new T.CylinderGeometry(2, 2.4, 2.4, 16), std(0xeeeeee))); b.position.y = 1.2; g.add(b); const d = shadowed(new T.Mesh(new T.SphereGeometry(2, 20, 12, 0, 6.3, 0, 1.57), std(0x3b6ea8))); d.position.y = 2.4; g.add(d); const tb = shadowed(new T.Mesh(new T.CylinderGeometry(.35, .5, 3, 10), std(0xdddddd))); tb.position.set(0, 3.4, .6); tb.rotation.x = -.9; g.add(tb); }
      else if (kind === "stadium") { const f = shadowed(new T.Mesh(new T.BoxGeometry(6, .3, 4), std(0x4caf50))); f.position.y = .15; g.add(f); [[-3.4, 0], [3.4, 0]].forEach(([x]) => { const st = shadowed(new T.Mesh(new T.BoxGeometry(1, 1.8, 4.4), std(0xc0504d))); st.position.set(x, .9, 0); g.add(st); }); [-1, 1].forEach(k => { const m = shadowed(new T.Mesh(new T.CylinderGeometry(.1, .1, 5, 6), std(0xdddddd))); m.position.set(k * 3, 2.5, 2.3); g.add(m); const l = new T.Mesh(new T.BoxGeometry(1.2, .7, .3), std(0xfff3a0, { emissive: 0xfff3a0, emissiveIntensity: .6 })); l.position.set(k * 3, 5, 2.3); g.add(l); }); }
      else if (kind === "labtower") { const b = shadowed(new T.Mesh(new T.BoxGeometry(3.4, 2.6, 3), std(0xf1ece0))); b.position.y = 1.3; g.add(b); const ch = shadowed(new T.Mesh(new T.CylinderGeometry(.5, .6, 4, 10), std(0x8a6a55))); ch.position.set(1, 4.4, 0); g.add(ch); const fl = shadowed(new T.Mesh(new T.SphereGeometry(.9, 16, 12), std(0x7be0a8, { emissive: 0x2ecc71, emissiveIntensity: .5 }))); fl.position.set(-.8, 3.2, 0); g.add(fl); const nk = shadowed(new T.Mesh(new T.CylinderGeometry(.28, .28, 1, 8), std(0xcfe9ff))); nk.position.set(-.8, 4.1, 0); g.add(nk); }
      else if (kind === "stagehall") { const b = shadowed(new T.Mesh(new T.BoxGeometry(4.4, 2.6, 3), std(0xf6e3c0))); b.position.y = 1.3; g.add(b); for (let i = 0; i < 4; i++) { const c = shadowed(new T.Mesh(new T.CylinderGeometry(.2, .2, 2.6, 8), std(0xffffff))); c.position.set(-1.8 + i * 1.2, 1.3, 1.7); g.add(c); } const rf = shadowed(new T.Mesh(new T.CylinderGeometry(0, 3.2, 1.4, 4), RED)); rf.position.y = 3.3; rf.rotation.y = .78; g.add(rf); }
      else { const b = shadowed(new T.Mesh(new T.BoxGeometry(2, 7, 2), std(0xb9c6da))); b.position.y = 3.5; const sp = shadowed(new T.Mesh(new T.ConeGeometry(1.5, 2.5, 4), RED)); sp.position.y = 8.2; sp.rotation.y = Math.PI / 4; g.add(b, sp); for (let y = 1; y < 7; y += 1.2) { const w = new T.Mesh(new T.BoxGeometry(1.2, .4, 2.05), new T.MeshStandardMaterial({ color: 0x9fd3ff, emissive: 0x3a7fb5, emissiveIntensity: .4 })); w.position.y = y; g.add(w); } }
      return g;
    }
    spots.forEach((s, si) => {
      const y = heightAt(s.x, s.z), g = new T.Group(); g.position.set(s.x, y, s.z); world.add(g);
      if (si === 3 || si === 24 || si === 55) { const LL = { parks: "bus", hawking: "telescope", kaepernick: "stadium", curie: "labtower", beethoven: "stagehall", turing: "labtower", cox: "stagehall", heumann: "bus", king: "bus" }[ch.id]; g.add(landmark((si === 24 || si === 3) && LL ? LL : TH.land)); g.rotation.y = r() * 6; return; }
      if (TH.palm && s.k < .5) { const h = 2.6 + r(), tr = shadowed(new T.Mesh(new T.CylinderGeometry(.14, .22, h, 6), trunkM)); tr.position.y = h / 2; tr.rotation.z = (r() - .5) * .3; g.add(tr); for (let l = 0; l < 6; l++) { const lf = shadowed(new T.Mesh(new T.BoxGeometry(1.8, .06, .4), leafMs[0])); lf.position.set(Math.cos(l) * .8, h + .1, Math.sin(l) * .8); lf.rotation.y = -l; lf.rotation.z = -.3; g.add(lf); } return; }
      if (TH.city && s.k >= .62 && s.k < .9) { const hh = 2.2 + r() * 4, b = shadowed(new T.Mesh(new T.BoxGeometry(1.7, hh, 1.7), std(new T.Color().setHSL(.58 + r() * .08, .25, .72)))); b.position.y = hh / 2; g.add(b); for (let yy = .8; yy < hh - .3; yy += 1) { const w = new T.Mesh(new T.BoxGeometry(1.25, .35, 1.75), new T.MeshStandardMaterial({ color: 0x9fd3ff, emissive: 0x2d6a9f, emissiveIntensity: .25 })); w.position.y = yy; g.add(w); } return; }
      if (s.k < .62) { const h = 1.4 + r() * 1.6, tr = shadowed(new T.Mesh(new T.CylinderGeometry(.14, .2, h * .5, 6), trunkM)); tr.position.y = h * .25; g.add(tr);
        const lm = leafMs[Math.floor(r() * 4)]; for (let l = 0; l < 3; l++) { const c = shadowed(new T.Mesh(new T.ConeGeometry(1.05 - l * .25, h * .6, 8), lm)); c.position.y = h * .45 + l * h * .28; g.add(c); } g.scale.setScalar(.9 + r() * .5); trees.push(g); g.userData.ph = r() * 6; }
      else if (s.k < .74) { const rk = shadowed(new T.Mesh(new T.DodecahedronGeometry(.5 + r() * .7, 0), std(0x9aa3ad, { roughness: .9 }))); rk.position.y = .3; rk.rotation.set(r() * 3, r() * 3, 0); g.add(rk); }
      else if (s.k < .86) { const hh = 1.1 + r() * .5, ww = std(new T.Color().setHSL(r(), .45, .85)), b = shadowed(new T.Mesh(new T.BoxGeometry(1.8, hh, 1.5), ww)); b.position.y = hh / 2; const rf = shadowed(new T.Mesh(new T.ConeGeometry(1.45, 1, 4), std(0xc0504d))); rf.position.y = hh + .5; rf.rotation.y = Math.PI / 4; [-.45, .45].forEach(wx => { const wn = new T.Mesh(new T.BoxGeometry(.4, .4, .05), new T.MeshStandardMaterial({ color: 0x7ec8ff, emissive: 0x3a7fb5, emissiveIntensity: .3 })); wn.position.set(wx, hh * .6, .76); g.add(wn); }); const dr = new T.Mesh(new T.BoxGeometry(.4, .7, .05), std(0x7a4a22)); dr.position.set(0, .35, .76); const ch2 = new T.Mesh(new T.BoxGeometry(.25, .8, .25), std(0x8b5a3a)); ch2.position.set(.5, hh + .7, 0); g.add(b, rf, dr, ch2); g.rotation.y = r() * 6; }
      else { for (let f = 0; f < 5; f++) { const fl = new T.Mesh(new T.SphereGeometry(.14, 8, 6), std(new T.Color().setHSL(r(), .8, .6))); fl.position.set((r() - .5) * 1.4, .2, (r() - .5) * 1.4); g.add(fl); } }
    });
    /* mountains behind */
    for (let i = 0; i < 6; i++) { const x = -size.w / 2 + (i + .5) * size.w / 6 + (r() - .5) * 6, z = -size.d / 2 - 1 - r() * 3, h = 7 + r() * 8, m = shadowed(new T.Mesh(new T.ConeGeometry(4.5 + r() * 3, h, 6), std(TH.mtn, { roughness: .95, flatShading: true }))); m.position.set(x, h / 2 - .5, z); world.add(m);
      const cap = new T.Mesh(new T.ConeGeometry((4.5) * .38, h * .3, 6), std(0xffffff, { flatShading: true })); cap.visible = TH.snow; cap.position.set(x, h - h * .15 - .5, z); world.add(cap); }
    /* clouds */
    for (let i = 0; i < 7; i++) { const c = new T.Group(); for (let k = 0; k < 4; k++) { const s = new T.Mesh(new T.SphereGeometry(2 + r() * 1.5, 16, 12), new T.MeshStandardMaterial({ color: 0xffffff, roughness: 1, transparent: true, opacity: .93 })); s.position.set(k * 2.6 - 4, r() * .8, (r() - .5) * 2); s.scale.y = .55; c.add(s); } c.scale.setScalar(.5); c.position.set((r() - .5) * size.w * 1.6, 16 + r() * 8, -size.d / 2 - 6 - r() * 20); c.userData.v = .4 + r() * .5; world.add(c); clouds.push(c); }
    sun.shadow.camera.left = -size.w * .62; sun.shadow.camera.right = size.w * .62; sun.shadow.camera.top = size.d * .72; sun.shadow.camera.bottom = -size.d * .72; sun.shadow.camera.far = 160; sun.shadow.camera.updateProjectionMatrix();

    /* pawn */
    pawn = new T.Group(); world.add(pawn);
    const pm = new T.MeshPhysicalMaterial({ color: ch.avatar.color, roughness: .3, clearcoat: 1, metalness: .05 });
    const cone = shadowed(new T.Mesh(new T.ConeGeometry(.75, 1.5, 24), pm)); cone.position.y = .75; const head = shadowed(new T.Mesh(new T.SphereGeometry(.6, 24, 16), pm)); head.position.y = 1.85; const base = shadowed(new T.Mesh(new T.CylinderGeometry(.85, .9, .18, 24), std(0xffffff, { roughness: .3 }))); base.position.y = .09;
    pawn.add(base, cone, head);
    const pc = GFX.canvas(256, 256), pg = pc.getContext("2d"); pawnPort = { c: pc, g: pg, t: GFX.tex(pc) };
    const pspr = new T.Sprite(new T.SpriteMaterial({ map: pawnPort.t, transparent: true, depthTest: false })); pspr.scale.set(2.5, 2.5, 1); pspr.position.y = 4; pspr.renderOrder = 15; pawn.add(pspr);
    drawPawnPortrait(null, ch);
    GFX.loadImage(GOL.thumbOf(ch), im => drawPawnPortrait(im, ch));
    B.placePawn(0); C.goal.copy(pts[0]); C.tgt.copy(pts[0]); C.gDist = C.dist = (cv.clientWidth < 600 ? 92 : 42); C.gEl = C.el = .95; C.az = C.gAz = .35; C.follow = true;
    B.resize(); placeCam();
  };
  function drawPawnPortrait(im, ch) {
    const g = pawnPort.g; g.clearRect(0, 0, 256, 256); g.save(); g.beginPath(); g.arc(128, 128, 112, 0, 7); g.fillStyle = ch.avatar.color; g.fill(); g.clip(); if (im) g.drawImage(im, 16, 16, 224, 224); g.restore();
    g.lineWidth = 14; g.strokeStyle = "#fff"; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke(); g.lineWidth = 5; g.strokeStyle = ch.avatar.color; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.stroke(); pawnPort.t.needsUpdate = true;
  }
  function checker() { const c = GFX.canvas(256, 64), g = c.getContext("2d"); for (let y = 0; y < 4; y++) for (let x = 0; x < 16; x++) { g.fillStyle = (x + y) % 2 ? "#fff" : "#111827"; g.fillRect(x * 16, y * 16, 16, 16); } return GFX.tex(c); }
  function starMesh() {
    const s = new T.Shape(), R = .9, r = .4; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; s[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr); } s.closePath();
    const m = shadowed(new T.Mesh(new T.ExtrudeGeometry(s, { depth: .25, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 3 }), new T.MeshPhysicalMaterial({ color: 0xffc933, metalness: 1, roughness: .2, emissive: 0xff9d00, emissiveIntensity: .25, clearcoat: .6 }))); m.geometry.translate(0, 0, -.125); return m;
  }

  /* ---------- state helpers ---------- */
  B.placePawn = i => { pawn.position.copy(pts[i]).setY(.38); ring.position.set(pts[i].x, .5, pts[i].z); B.current = i; };
  B.focus = i => { if (C.follow) C.goal.copy(pts[i]); };
  B.markVisited = i => { visited.add(i); const m = pads[i].material; m.emissiveIntensity = .35; };
  B.openGate = i => { if (gates[i]) gates[i].userData.open = true; };
  B.setBridge = (k, state) => { const b = bridges[k]; if (!b) return; b.state = state; b.lock.visible = state === "closed"; b.deckMat.emissiveIntensity = state === "open" ? 1 : 0; b.deckMat.color.setHex(state === "closed" ? 0x9a8b7a : 0xc8874a); };
  B.snap = () => { C.tgt.copy(C.goal); C.az = C.gAz; C.el = C.gEl; C.dist = C.gDist; placeCam(); };
  B.tilePos = i => pts[i].clone();
  B.screenPos = i => { const v = pts[i].clone().setY(2); v.project(cam); const r = cv.getBoundingClientRect(); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height }; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  function tween(ms, fn, ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) { return new Promise(res => { const t0 = performance.now(); (function f() { const k = Math.min(1, (performance.now() - t0) / ms); fn(ease(k), k); k < 1 ? requestAnimationFrame(f) : res(); })(); }); }
  B.hop = async (from, to) => { const a = pts[from].clone().setY(.38), b = pts[to].clone().setY(.38);
    await tween(420, (e, k) => { pawn.position.lerpVectors(a, b, e); pawn.position.y = .38 + Math.sin(k * Math.PI) * 1.4; const s = 1 + Math.sin(k * Math.PI) * .12; pawn.scale.set(1 / s, s, 1 / s); }, t => t);
    pawn.scale.set(1, 1, 1); pawn.position.copy(b); ring.position.set(b.x, .5, b.z); B.current = to; if (C.follow) C.goal.copy(b); B.puff(b, 0xffffff, 10); };
  B.cross = async k => { const br = bridges[k], c = br.curve; await tween(1500, e => { const p = c.getPoint(e); pawn.position.set(p.x, p.y + .5, p.z); if (C.follow) C.goal.set(p.x, 0, p.z); }, t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const e = pts[br.to != null ? br.to : 0]; };
  B.arrive = i => { const b = pts[i].clone().setY(.38); pawn.position.copy(b); ring.position.set(b.x, .5, b.z); B.current = i; if (C.follow) C.goal.copy(b); B.puff(b, 0xffffff, 10); };
  B.slideBack = async k => { const sb = setbacks[k], c = sb.curve; B.puff(pawn.position, 0xef4444, 26);
    for (let s = 0; s < 3; s++) { await tween(70, e => { pawn.position.x += (s % 2 ? -1 : 1) * .06; }, t => t); }
    await tween(1700, e => { const p = c.getPoint(1 - e); pawn.position.set(p.x, p.y - .3 + Math.sin(e * Math.PI) * .6, p.z); pawn.rotation.z = Math.sin(e * 12) * .25; if (C.follow) C.goal.set(p.x, 0, p.z); }, t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); pawn.rotation.z = 0; };
  B.puff = (p, color, n = 40) => {
    const g = new T.BufferGeometry(), pos = new Float32Array(n * 3), vel = [], cols = new Float32Array(n * 3), pal = color ? [new T.Color(color)] : [0xff4d6d, 0xffc933, 0x4ade80, 0x38bdf8, 0xa855f7, 0xff8a3d].map(c => new T.Color(c));
    for (let i = 0; i < n; i++) { pos.set([p.x, (p.y || 0) + 1, p.z], i * 3); const a = Math.random() * 6.28, s = 2 + Math.random() * (color ? 3 : 6); vel.push(V(Math.cos(a) * s, 4 + Math.random() * 6, Math.sin(a) * s)); const c = pal[i % pal.length]; cols.set([c.r, c.g, c.b], i * 3); }
    g.setAttribute("position", new T.BufferAttribute(pos, 3)); g.setAttribute("color", new T.BufferAttribute(cols, 3));
    const pts2 = new T.Points(g, new T.PointsMaterial({ size: color ? .35 : .55, vertexColors: true, transparent: true, depthWrite: false })); world.add(pts2); confetti.push({ o: pts2, vel, t: 0 });
  };
  B.celebrate = i => { const p = pts[i]; for (let k = 0; k < 3; k++) setTimeout(() => B.puff(p.clone().add(V((k - 1) * 1.5, 1 + k, 0)), 0, 70), k * 160); };

  /* ---------- loop ---------- */
  B.resize = () => { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  B.start = () => { if (running) return; running = true; clock = performance.now(); loop(); }; B.stop = () => { running = false; cancelAnimationFrame(raf); };
  function loop() {
    if (!running) return; raf = requestAnimationFrame(loop); B.frame();
  }
  B.frame = () => {
    const now = performance.now(), dt = Math.min(.05, (now - clock) / 1000); clock = now; const t = now / 1000;
    if (!C.follow && B.autoFollow && now - C.lastUser > 6000) B.setFollow(true);
    if (C.follow && pawn) C.goal.copy(pawn.position).setY(0);
    const k = 1 - Math.pow(.0015, dt); C.tgt.lerp(C.goal, k); C.az += (C.gAz - C.az) * k; C.el += (C.gEl - C.el) * k; C.dist += (C.gDist - C.dist) * k; placeCam();
    titleLabels.forEach((l, i) => { l.visible = C.dist < 55 && B.current != null && i >= B.current && i <= B.current + 1; });
    if (ring) { const s = 1 + Math.sin(t * 4) * .07; ring.scale.set(s, s, s); ring.material.opacity = .55 + Math.sin(t * 4) * .3; }
    stars.forEach((s, i) => { s.rotation.y = t * 1.6 + i; s.position.y = 2.1 + Math.sin(t * 2 + i) * .12; });
    bridges.forEach(b => { if (b.state === "open") b.deckMat.emissiveIntensity = .5 + Math.sin(t * 5) * .45; if (b.water.map) b.water.map.offset.x = t * .05 % 1; });
    Object.values(gates).forEach(a => { const tgt = a.userData.open ? -1.25 : 0; a.rotation.z += (tgt - a.rotation.z) * Math.min(1, dt * 4); });
    spinners.forEach(b => { b.rotation.z = t * .8; });
    trees.forEach(g => { g.rotation.z = Math.sin(t * 1.3 + g.userData.ph) * .02; });
    clouds.forEach(c => { c.position.x += c.userData.v * dt; if (c.position.x > size.w * .8) c.position.x = -size.w * .8; });
    if (pawn && !B.busy) { pawn.children[2].position.y = 1.85 + Math.sin(t * 3) * .05; }
    for (let i = confetti.length - 1; i >= 0; i--) { const c = confetti[i]; c.t += dt; const P = c.o.geometry.attributes.position;
      for (let j = 0; j < c.vel.length; j++) { c.vel[j].y -= 14 * dt; P.setXYZ(j, P.getX(j) + c.vel[j].x * dt, Math.max(0, P.getY(j) + c.vel[j].y * dt), P.getZ(j) + c.vel[j].z * dt); } P.needsUpdate = true; c.o.material.opacity = Math.max(0, 1 - c.t / 1.8);
      if (c.t > 1.8) { world.remove(c.o); c.o.geometry.dispose(); confetti.splice(i, 1); } }
    const f0 = performance.now(); renderer.render(scene, cam); const f1 = performance.now(); B.perf = B.perf || { n: 0, slow: 0, ms: 0, worst: 0, t0: f1, fps: 0 }; const P = B.perf; P.n++; P.ms += f1 - f0; if (f1 - f0 > P.worst) P.worst = f1 - f0; if (dt > .034) P.slow++; if (f1 - P.t0 >= 1000) { P.fps = Math.round(P.n * 1000 / (f1 - P.t0)); P.avg = (P.ms / P.n).toFixed(1); P.calls = renderer.info.render.calls; P.tris = renderer.info.render.triangles; P.geo = renderer.info.memory.geometries; P.tex = renderer.info.memory.textures; P.slowS = P.slow; P.worstS = P.worst.toFixed(1); P.n = 0; P.ms = 0; P.slow = 0; P.worst = 0; P.t0 = f1; }
  };
  return B;
};
