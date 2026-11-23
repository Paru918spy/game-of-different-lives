/* 3D view of the multiplayer board (Three.js r158, global THREE). Rendering and animation only: no game rules here.
   API: const sc = MP.Scene(canvas); sc.build(board); sc.setPlayers(players); sc.place(positions);
        await sc.move(pid, from, to); sc.setActive(pid); sc.mode("follow"|"overview"); sc.showFork(ids, cb); sc.clearFork();
        await sc.celebrate(pid); sc.pulse(nodeId); sc.resize(); sc.dispose(); sc.snap()                                           */
(function (root) {
  const MP = root.MP = root.MP || {};
  const CAT = () => MP.Engine.CATEGORY;

  function mulberry(seed) { let a = seed | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- canvas textures ---------- */
  function tileTexture(type) {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const cat = CAT()[type], col = cat.color;
    const grd = g.createRadialGradient(128, 110, 20, 128, 128, 128); grd.addColorStop(0, lighten(col, .35)); grd.addColorStop(1, col);
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
    g.lineWidth = 12; g.strokeStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke();
    g.fillStyle = "#fff"; g.strokeStyle = "rgba(0,0,0,.28)"; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round"; g.lineCap = "round";
    const txt = (s, size, dy) => { g.font = `900 ${size}px "Arial Rounded MT Bold",Arial,sans-serif`; g.lineWidth = 14; g.strokeText(s, 128, 132 + (dy || 0)); g.fillText(s, 128, 132 + (dy || 0)); };
    const dark = "rgba(0,0,0,.28)";
    if (type === "who") txt("?", 150);
    else if (type === "fact") txt("i", 150, 4);
    else if (type === "tf") { txt("T/F", 92); }
    else if (type === "words") txt("Aa", 100);
    else if (type === "task") { star(g, 128, 130, 78, 34); }
    else if (type === "story") { heart(g, 128, 128, 74); }
    else if (type === "bridge") { g.strokeStyle = "#fff"; g.lineWidth = 22; g.beginPath(); g.arc(128, 170, 70, Math.PI, 0); g.stroke(); g.beginPath(); g.moveTo(40, 176); g.lineTo(216, 176); g.stroke(); }
    else if (type === "start") { g.fillStyle = "#06c28f"; g.beginPath(); g.arc(128, 128, 96, 0, 7); g.fill(); txt("GO", 96); }
    else if (type === "finish") {
      const n = 6, s = 192 / n;
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? "#222" : "#fff"; g.fillRect(32 + i * s, 32 + j * s, s, s); }
    }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function star(g, cx, cy, R, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fillStyle = "#fff"; g.lineWidth = 12; g.strokeStyle = "rgba(0,0,0,.25)"; g.stroke(); g.fill(); }
  function heart(g, cx, cy, s) { g.beginPath(); g.moveTo(cx, cy + s * .7); g.bezierCurveTo(cx - s * 1.5, cy - s * .1, cx - s * .6, cy - s * 1.0, cx, cy - s * .3); g.bezierCurveTo(cx + s * .6, cy - s * 1.0, cx + s * 1.5, cy - s * .1, cx, cy + s * .7); g.closePath(); g.fillStyle = "#fff"; g.lineWidth = 12; g.strokeStyle = "rgba(0,0,0,.25)"; g.stroke(); g.fill(); }
  function lighten(hex, k) { const n = parseInt(hex.slice(1), 16), r = n >> 16, gg = (n >> 8) & 255, b = n & 255; const f = v => Math.round(v + (255 - v) * k); return `rgb(${f(r)},${f(gg)},${f(b)})`; }
  function woodTexture() {
    const c = document.createElement("canvas"); c.width = 512; c.height = 512; const g = c.getContext("2d"); const R = mulberry(7);
    g.fillStyle = "#8a5a33"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 70; i++) { g.strokeStyle = `rgba(${R() < .5 ? "60,30,10" : "190,130,80"},${.05 + R() * .12})`; g.lineWidth = 1 + R() * 5; g.beginPath(); const y = R() * 512; g.moveTo(0, y); g.bezierCurveTo(150, y + R() * 24 - 12, 350, y + R() * 24 - 12, 512, y + R() * 10); g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(8, 8); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function grassTexture() {
    const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d"); const R = mulberry(11);
    g.fillStyle = "#9fd36c"; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${R() < .5 ? "255,245,150" : "60,150,70"},${.06 + R() * .1})`; g.beginPath(); g.arc(R() * 512, R() * 512, 10 + R() * 46, 0, 7); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function labelSprite(text, color) {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128; const g = c.getContext("2d");
    g.fillStyle = "rgba(255,253,246,.96)"; rr(g, 8, 14, 496, 100, 50); g.fill(); g.lineWidth = 8; g.strokeStyle = color; g.stroke();
    g.fillStyle = "#3a2410"; g.font = '900 54px "Arial Rounded MT Bold",Arial,sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 256, 66);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); s.scale.set(3.6, .9, 1); s.renderOrder = 10; return s;
  }
  function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

  /* ---------- the scene ---------- */
  MP.Scene = function (canvas) {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf3d9a8);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
    const root = new THREE.Group(); scene.add(root);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xc9a66b, 0.95); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.05); sun.position.set(-18, 40, 22); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -42; sc.right = 42; sc.top = 30; sc.bottom = -30; sc.near = 10; sc.far = 110; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    scene.add(sun);

    const S = { board: null, tiles: [], pawns: {}, active: null, anims: [], fork: null, hover: -1, time: 0, speed: 1, mode: "follow",
      cam: { yaw: 0.0, pitch: 0.95, dist: 24, tx: 0, tz: 0, ty: 0, goalDist: 24, gtx: 0, gtz: 0 }, userRot: false, dead: false };
    const tileTex = {}; const mats = {};
    const mat = (k, f) => mats[k] || (mats[k] = f());

    function build(board) {
      S.board = board;
      while (root.children.length) root.remove(root.children[0]);
      S.tiles = []; S.pawns = {}; S.forkMarks = [];
      /* wooden table */
      const wood = woodTexture();
      const table = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), new THREE.MeshStandardMaterial({ map: wood, roughness: .85 })); table.rotation.x = -Math.PI / 2; table.position.y = -1.2; table.receiveShadow = true; root.add(table);
      /* board slab: wood frame + grass top */
      const bx0 = -30, bx1 = 36, bz0 = -22.5, bz1 = 13.5, w = bx1 - bx0, d = bz1 - bz0, cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 2.4, 1.2, d + 2.4), new THREE.MeshStandardMaterial({ color: 0xc08a4f, roughness: .7 })); frame.position.set(cx, -0.6, cz); frame.castShadow = frame.receiveShadow = true; root.add(frame);
      const gt = grassTexture(); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(3, 2);
      const grass = new THREE.Mesh(new THREE.BoxGeometry(w, .3, d), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 })); grass.position.set(cx, 0.05, cz); grass.receiveShadow = true; root.add(grass);
      /* paths */
      const sand = mat("sand", () => new THREE.MeshStandardMaterial({ color: 0xf1dfb0, roughness: .95 }));
      const edgeSet = new Set();
      board.nodes.forEach(n => n.next.forEach(m => { const k = n.id + "-" + m; if (edgeSet.has(k)) return; edgeSet.add(k);
        const a = board.nodes[n.id], b = board.nodes[m], len = Math.hypot(b.x - a.x, b.z - a.z);
        const seg = new THREE.Mesh(new THREE.BoxGeometry(len + 0.5, .1, 1.7), sand); seg.position.set((a.x + b.x) / 2, 0.24, (a.z + b.z) / 2); seg.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); seg.receiveShadow = true; root.add(seg);
        /* round joints */ }));
      board.nodes.forEach(n => { const j = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, .1, 24), sand); j.position.set(n.x, .24, n.z); j.receiveShadow = true; root.add(j); });
      /* tiles */
      board.nodes.forEach(n => {
        const type = n.type; if (!tileTex[type]) tileTex[type] = tileTexture(type);
        const cat = CAT()[type];
        const side = mat("side" + type, () => new THREE.MeshStandardMaterial({ color: new THREE.Color(cat.dark), roughness: .55 }));
        const top = mat("top" + type, () => new THREE.MeshStandardMaterial({ map: tileTex[type], roughness: .45 }));
        const m = new THREE.Mesh(new THREE.CylinderGeometry(.98, 1.05, .42, 40), [side, top, side]);
        m.position.set(n.x, .42, n.z); m.rotation.y = Math.PI * .5; m.castShadow = m.receiveShadow = true; m.userData.node = n.id; root.add(m);
        S.tiles[n.id] = m; m.userData.baseY = .42;
        if (type === "bridge") bridgeModel(n);
        if (type === "start") flagModel(n);
        if (type === "finish") finishModel(n);
      });
      /* branch labels */
      Object.entries(board.chains).forEach(([id, c]) => {
        if (!MP.Board.BRANCH_NAME[c.theme] || id.length < 2) return;
        const mid = board.nodes[c.ids[Math.floor(c.ids.length / 2)]];
        const col = c.theme === "north" ? "#f6b93b" : c.theme === "south" ? "#1e9be9" : "#ef476f";
        const s = labelSprite((c.theme === "north" ? "☀ " : c.theme === "south" ? "≈ " : "⚡ ") + MP.Board.BRANCH_NAME[c.theme], col);
        const out = c.theme === "north" ? -2.4 : c.theme === "south" ? 2.4 : 0; s.position.set(mid.x, 2.8, mid.z + out); root.add(s);
      });
      decorate(board);
      resetCamera();
    }

    function bridgeModel(n) {
      const g = new THREE.Group(); const gold = new THREE.MeshStandardMaterial({ color: 0xf6b93b, roughness: .4, metalness: .2 });
      const arch = new THREE.Mesh(new THREE.TorusGeometry(1.15, .13, 10, 24, Math.PI), gold); arch.position.y = .65; arch.castShadow = true; g.add(arch);
      [-1.15, 1.15].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.13, .15, .65, 10), gold); p.position.set(x, .33, 0); p.castShadow = true; g.add(p); });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, .1, .7), new THREE.MeshStandardMaterial({ color: 0xffe9a0 })); deck.position.y = .66; g.add(deck);
      const pv = S.board.nodes[n.prev[0]], nx = S.board.nodes[n.next[0]]; g.position.set(n.x, .6, n.z); g.rotation.y = -Math.atan2(nx.z - pv.z, nx.x - pv.x); root.add(g);
    }
    function flagModel(n) {
      const g = new THREE.Group(); const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 3.4, 8), new THREE.MeshStandardMaterial({ color: 0xffffff })); pole.position.y = 1.7; pole.castShadow = true; g.add(pole);
      const f = new THREE.Mesh(new THREE.BoxGeometry(1.6, .9, .05), new THREE.MeshStandardMaterial({ color: 0x06c28f })); f.position.set(.8, 2.9, 0); f.castShadow = true; g.add(f);
      g.position.set(n.x - 1.5, .6, n.z - 1.5); root.add(g); S.flag = f;
    }
    function finishModel(n) {
      const g = new THREE.Group(); const m = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 });
      [-1.6, 1.6].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.15, .18, 3.2, 12), m); p.position.set(x, 1.6, 0); p.castShadow = true; g.add(p); });
      const cv = document.createElement("canvas"); cv.width = 256; cv.height = 64; const c = cv.getContext("2d"); for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { c.fillStyle = (i + j) % 2 ? "#222" : "#fff"; c.fillRect(i * 16, j * 16, 16, 16); }
      const t = new THREE.CanvasTexture(cv); const ban = new THREE.Mesh(new THREE.BoxGeometry(3.6, .8, .12), new THREE.MeshStandardMaterial({ map: t })); ban.position.y = 3.2; ban.castShadow = true; g.add(ban);
      /* trophy */
      const gold = new THREE.MeshStandardMaterial({ color: 0xf6b93b, metalness: .5, roughness: .25 });
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(.5, .25, .6, 16), gold); cup.position.set(0, 1.05, -1.8); cup.castShadow = true; g.add(cup);
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .4, 8), gold); stem.position.set(0, .55, -1.8); g.add(stem);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(.4, .45, .2, 16), gold); base.position.set(0, .3, -1.8); g.add(base);
      g.position.set(n.x, .6, n.z); g.rotation.y = 0; root.add(g); S.trophy = cup;
    }

    function decorate(board) {
      const R = mulberry(42), pts = board.nodes.map(n => [n.x, n.z]);
      const free = (x, z, r) => pts.every(p => Math.hypot(p[0] - x, p[1] - z) > r);
      const green = [0x4cae4c, 0x5cc060, 0x3a9a4a], trunk = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
      const gm = green.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true }));
      const rockM = new THREE.MeshStandardMaterial({ color: 0xa8a39a, roughness: 1, flatShading: true });
      const roofM = new THREE.MeshStandardMaterial({ color: 0xd1495b, roughness: .8, flatShading: true }), wallM = new THREE.MeshStandardMaterial({ color: 0xfff0cf, roughness: .9 });
      const place = (obj, x, z, y) => { obj.position.set(x, y == null ? .2 : y, z); obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); root.add(obj); };
      const tree = (x, z, s) => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(.14 * s, .2 * s, .8 * s, 6), trunk); t.position.y = .4 * s; g.add(t);
        const m = gm[Math.floor(R() * 3)]; for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.1 - i * .25) * s, 1.1 * s, 7), m); c.position.y = (1.0 + i * .7) * s; g.add(c); } g.rotation.y = R() * 6; place(g, x, z); };
      const house = (x, z) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1, 1.3), wallM); b.position.y = .5; g.add(b); const r = new THREE.Mesh(new THREE.ConeGeometry(1.25, .85, 4), roofM); r.position.y = 1.4; r.rotation.y = Math.PI / 4; g.add(r); g.rotation.y = R() * 6; place(g, x, z); };
      const rock = (x, z, s) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(.55 * s, 0), rockM); m.scale.y = .7; m.rotation.set(R() * 3, R() * 3, R() * 3); place(m, x, z, .3 + .2 * s); };
      const pond = (x, z, r, c) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .08, 36), new THREE.MeshStandardMaterial({ color: c || 0x58b9f0, roughness: .15, metalness: .1 })); m.scale.z = .7; m.position.set(x, .24, z); m.receiveShadow = true; root.add(m); S.water = (S.water || []).concat(m); };
      /* mountains at the back */
      const mt = new THREE.MeshStandardMaterial({ color: 0xc58a55, roughness: 1, flatShading: true }), snow = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
      for (let i = 0; i < 9; i++) { const x = -26 + i * 7.6 + R() * 2, h = 3.5 + R() * 3, r = 2.2 + R() * 1.2; const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), mt); c.position.set(x, h / 2, -21 + R() * .8); c.castShadow = true; root.add(c); if (h > 5.5) { const s = new THREE.Mesh(new THREE.ConeGeometry(r * .38, h * .3, 5), snow); s.position.set(x, h * .86, c.position.z); root.add(s); } }
      /* big lake and a village in the open middle */
      pond(2, -0.8, 5.6, 0x58b9f0); pond(-12, 2.5, 2.4, 0x6cc6f6); pond(-4.5, -9.8, 0, 0);
      const spots = [[-16, 2], [-18, 6], [-24, -4], [-26, 2], [-8, 8], [3, 8.5], [14, 8.5], [32, -12], [33, 3], [32, 9], [-26, 9], [8, -1], [-8, -1]];
      spots.forEach(s => { if (free(s[0], s[1], 2.6)) house(s[0] + (R() - .5), s[1] + (R() - .5)); });
      let tries = 0, trees = 0;
      while (trees < 90 && tries++ < 900) { const x = -29 + R() * 64, z = -19 + R() * 31; if (!free(x, z, 2.4)) continue; if (Math.hypot((x - 2) / 7.2, (z + .8) / 5.2) < 1) continue; if (Math.hypot(x + 12, z - 2.5) < 3.8) continue; if (z < -17 && R() < .7) continue; tree(x, z, .8 + R() * .6); trees++; }
      for (let i = 0, t = 0; t < 26 && i < 400; i++) { const x = -29 + R() * 64, z = -19 + R() * 31; if (!free(x, z, 2.2) || Math.hypot((x - 2) / 7.2, (z + .8) / 5.2) < 1) continue; rock(x, z, .7 + R() * .9); t++; }
      /* sunflowers along the sunny trail, reeds along the river trail */
      const flowerM = new THREE.MeshStandardMaterial({ color: 0xffc83d }), reedM = new THREE.MeshStandardMaterial({ color: 0x3a8a4a });
      Object.values(board.chains).forEach(c => c.ids.forEach(id => { const n = board.nodes[id]; if (c.theme === "north") { const f = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), flowerM); f.position.set(n.x + 1.5, .6, n.z - 1.0); root.add(f); const s = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .5, 5), reedM); s.position.set(n.x + 1.5, .38, n.z - 1.0); root.add(s); }
        if (c.theme === "south") { const r = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.0, 5), reedM); r.position.set(n.x - 1.4, .7, n.z + 1.1); root.add(r); const r2 = r.clone(); r2.position.x += .25; r2.scale.y = .8; root.add(r2); } }));
    }

    /* ---------- pawns ---------- */
    function pawnMesh(colorHex) {
      const g = new THREE.Group();
      const m = new THREE.MeshStandardMaterial({ color: colorHex, roughness: .32, metalness: .08 });
      const prof = [[0.001, 0], [.5, 0], [.56, .06], [.5, .18], [.34, .42], [.24, .8], [.22, 1.0], [.34, 1.08], [.001, 1.1]].map(p => new THREE.Vector2(p[0], p[1]));
      const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), m); body.castShadow = true; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.38, 24, 18), m); head.position.y = 1.4; head.castShadow = true; g.add(head);
      const shine = new THREE.Mesh(new THREE.SphereGeometry(.09, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .7 })); shine.position.set(-.15, 1.56, .25); g.add(shine);
      const inner = new THREE.Group(); inner.add(g); const wrap = new THREE.Group(); wrap.add(inner); wrap.userData = { inner, body: g };
      /* marker above active pawn */
      const mk = new THREE.Mesh(new THREE.ConeGeometry(.3, .55, 4), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffa800, emissiveIntensity: .5 })); mk.rotation.x = Math.PI; mk.position.y = 2.5; mk.visible = false; wrap.add(mk); wrap.userData.marker = mk;
      const ring = new THREE.Mesh(new THREE.RingGeometry(.62, .78, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .03; ring.visible = false; wrap.add(ring); wrap.userData.ring = ring;
      return wrap;
    }
    function setPlayers(players) {
      Object.values(S.pawns).forEach(p => root.remove(p.mesh)); S.pawns = {};
      players.forEach(pl => { const hex = parseInt(MP.Engine.COLORS[pl.color].hex.slice(1), 16); const mesh = pawnMesh(hex); root.add(mesh); S.pawns[pl.id] = { id: pl.id, mesh, node: S.board.start, yaw: 0, busy: false, hop: 0 }; });
    }
    function slots(nodeId) {
      const here = Object.values(S.pawns).filter(p => p.node === nodeId && !p.moving).sort((a, b) => a.id - b.id);
      return here;
    }
    function slotPos(p, nodeId) {
      const n = S.board.nodes[nodeId], here = Object.values(S.pawns).filter(q => q.node === nodeId).sort((a, b) => a.id - b.id), k = here.indexOf(p), cnt = Math.max(here.length, 1);
      if (cnt === 1 || k < 0) return { x: n.x, z: n.z };
      const a = (k / cnt) * Math.PI * 2 + Math.PI / 4, r = cnt === 2 ? .42 : .5;
      return { x: n.x + Math.cos(a) * r, z: n.z + Math.sin(a) * r };
    }
    function arrange(nodeId) { Object.values(S.pawns).filter(p => p.node === nodeId && !p.moving).forEach(p => { const s = slotPos(p, nodeId); p.mesh.position.set(s.x, .63, s.z); }); }
    function place(positions) { Object.keys(positions).forEach(id => { S.pawns[id].node = positions[id]; }); Object.keys(positions).forEach(id => arrange(positions[id])); }
    function setActive(pid) { S.active = pid; Object.values(S.pawns).forEach(p => { const on = p.id === pid; p.mesh.userData.marker.visible = on; p.mesh.userData.ring.visible = on; }); if (S.pawns[pid] && S.mode === "follow") followPawn(pid); }
    function followPawn(pid) { const p = S.pawns[pid]; if (!p) return; S.cam.gtx = p.mesh.position.x; S.cam.gtz = p.mesh.position.z; }

    function tween(dur, fn) { return new Promise(res => S.anims.push({ t: 0, dur, fn, res })); }
    /* hop from tile to tile */
    async function move(pid, from, to) {
      const p = S.pawns[pid]; if (!p) return; const A = S.board.nodes[from], B = S.board.nodes[to];
      p.moving = true; p.node = to; arrange(from);
      const start = { x: p.mesh.position.x, z: p.mesh.position.z };
      const end = slotPos(Object.assign({}, p, { moving: false }), to);
      const target = Math.atan2(B.x - A.x, B.z - A.z);
      await tween(0.42, k => {
        const t = ease(k);
        p.mesh.position.x = lerp(start.x, end.x, t); p.mesh.position.z = lerp(start.z, end.z, t);
        p.mesh.position.y = .63 + Math.sin(Math.PI * k) * 1.05;
        let d = target - p.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); p.mesh.userData.body.rotation.y = p.yaw + d * Math.min(1, k * 2.2);
        const sq = k < .15 ? 1 - .22 * (k / .15) : k > .85 ? 1 - .22 * ((k - .85) / .15) : 1 + .16 * Math.sin(Math.PI * k);
        p.mesh.userData.inner.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
        if (S.active === pid && S.mode === "follow") followPawn(pid);
        if (k >= 1) { p.yaw = p.yaw + d; }
      });
      p.moving = false; p.mesh.position.y = .63; p.mesh.userData.inner.scale.set(1, 1, 1);
      /* landing squash */
      await tween(0.16, k => { const s = 1 - .2 * Math.sin(Math.PI * k); p.mesh.userData.inner.scale.set(1 + (1 - s) * .5, s, 1 + (1 - s) * .5); });
      p.mesh.userData.inner.scale.set(1, 1, 1); arrange(to); pulse(to);
    }
    function pulse(nodeId) { const m = S.tiles[nodeId]; if (!m) return; tween(0.4, k => { m.position.y = m.userData.baseY - Math.sin(Math.PI * Math.min(1, k * 1.3)) * .16; }); }
    async function celebrate(pid) {
      const p = S.pawns[pid]; if (!p) return; S.mode = "follow"; followPawn(pid); S.cam.goalDist = 13;
      await tween(2.4, k => { p.mesh.position.y = .63 + Math.abs(Math.sin(k * Math.PI * 4)) * 1.1; p.mesh.userData.body.rotation.y += .22; const s = 1 + .08 * Math.sin(k * 30); p.mesh.userData.inner.scale.set(s, 1 / s, s); });
      p.mesh.userData.inner.scale.set(1, 1, 1); p.mesh.position.y = .63;
    }

    /* ---------- fork markers & picking ---------- */
    function showFork(ids, cb) {
      clearFork(); S.fork = { ids, cb, marks: [] };
      ids.forEach(id => { const n = S.board.nodes[id]; const g = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, .1, 8, 36), new THREE.MeshBasicMaterial({ color: 0xffd23f })); ring.rotation.x = Math.PI / 2; ring.position.y = .5; g.add(ring);
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(.45, .9, 4), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffa800, emissiveIntensity: .6 })); arrow.rotation.x = Math.PI; arrow.position.y = 2.6; g.add(arrow);
        g.position.set(n.x, 0, n.z); root.add(g); S.fork.marks.push({ g, ring, arrow, id }); });
    }
    function clearFork() { if (S.fork) { S.fork.marks.forEach(m => root.remove(m.g)); S.fork = null; } S.hover = -1; canvas.style.cursor = "grab"; }
    function hoverFork(id) { S.hover = id; }

    /* ---------- camera ---------- */
    function boardCenter() { return { x: 3, z: -4.5 }; }
    function resetCamera() { S.cam.yaw = 0; S.cam.pitch = .95; setMode(S.mode, true); }
    function setMode(m, snap) {
      S.mode = m; const c = S.cam, asp = camera.aspect || 1.6;
      if (m === "overview") { const ctr = boardCenter(); c.gtx = ctr.x; c.gtz = ctr.z; c.goalDist = (asp < 1 ? 105 : asp < 1.5 ? 78 : 60); c.pitch = Math.max(c.pitch, 1.0); }
      else { c.goalDist = asp < 1 ? 28 : 22; if (S.active != null) followPawn(S.active); else { const s = S.board && S.board.nodes[S.board.start]; if (s) { c.gtx = s.x; c.gtz = s.z; } } }
      if (snap) { c.tx = c.gtx; c.tz = c.gtz; c.dist = c.goalDist; }
    }
    function updateCamera(dt) {
      const c = S.cam, k = 1 - Math.pow(.0015, dt);
      c.tx = lerp(c.tx, c.gtx, k); c.tz = lerp(c.tz, c.gtz, k); c.dist = lerp(c.dist, c.goalDist, k);
      const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
      camera.position.set(c.tx + Math.sin(c.yaw) * cp * c.dist, sp * c.dist, c.tz + Math.cos(c.yaw) * cp * c.dist);
      camera.lookAt(c.tx, 0.2, c.tz);
      S.curShift = lerp(S.curShift || 0, S.shift || 0, k);
      const W = canvas.clientWidth || 1, H = canvas.clientHeight || 1;
      if (Math.abs(S.curShift) > .5) camera.setViewOffset(W, H, S.curShift, 0, W, H); else if (camera.view && camera.view.enabled) camera.clearViewOffset();
    }

    /* ---------- input ---------- */
    const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
    let drag = null;
    function pickAt(ev) {
      const r = canvas.getBoundingClientRect(); mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(mouse, camera); const hits = ray.intersectObjects(S.tiles.filter(Boolean), false); return hits.length ? hits[0].object.userData.node : -1;
    }
    canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, yaw: S.cam.yaw, pitch: S.cam.pitch, moved: false, id: e.pointerId, tx: S.cam.gtx, tz: S.cam.gtz, pan: e.button === 2 || e.shiftKey }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
    canvas.addEventListener("pointermove", e => {
      if (drag && drag.id === e.pointerId) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
        if (drag.pan) { const s = S.cam.dist * .0016; S.cam.gtx = drag.tx - dx * s * Math.cos(S.cam.yaw) - dy * s * Math.sin(S.cam.yaw); S.cam.gtz = drag.tz + dx * s * Math.sin(S.cam.yaw) - dy * s * Math.cos(S.cam.yaw); if (drag.moved) S.userPan = true; }
        else { S.cam.yaw = drag.yaw - dx * .006; S.cam.pitch = Math.min(1.35, Math.max(.45, drag.pitch + dy * .005)); }
      } else if (S.fork) { const id = pickAt(e); S.hover = S.fork.ids.includes(id) ? id : -1; canvas.style.cursor = S.hover >= 0 ? "pointer" : "grab"; }
    });
    canvas.addEventListener("pointerup", e => { const was = drag; drag = null; canvas.style.cursor = S.hover >= 0 ? "pointer" : "grab"; if (was && !was.moved && S.fork) { const id = pickAt(e); if (S.fork.ids.includes(id)) { const cb = S.fork.cb; clearFork(); cb(id); } } });
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    canvas.addEventListener("wheel", e => { e.preventDefault(); S.cam.goalDist = Math.min(110, Math.max(9, S.cam.goalDist * (1 + Math.sign(e.deltaY) * .1))); }, { passive: false });

    /* ---------- main loop ---------- */
    let last = performance.now(), raf = 0;
    function tick(now) {
      if (S.dead) return; raf = requestAnimationFrame(tick);
      const dt = Math.min(.1, (now - last) / 1000) * S.speed; last = now; frame(dt);
    }
    function frame(dt) {
      S.time += dt;
      for (let i = S.anims.length - 1; i >= 0; i--) { const a = S.anims[i]; a.t += dt; const k = Math.min(1, a.t / a.dur); a.fn(k); if (k >= 1) { S.anims.splice(i, 1); a.res(); } }
      const T = S.time;
      /* idle animation: active pawn bobs and spins, others breathe */
      Object.values(S.pawns).forEach(p => { if (p.moving) return; const act = p.id === S.active;
        p.mesh.userData.inner.scale.y = 1 + Math.sin(T * 2.4 + p.id) * (act ? .045 : .02);
        if (act && !S.winnerAnim) { p.mesh.userData.body.rotation.y = p.yaw + Math.sin(T * 1.2) * .35; }
        const mk = p.mesh.userData.marker; if (mk.visible) { mk.position.y = 2.5 + Math.sin(T * 4) * .18; mk.rotation.y = T * 2; }
        const rg = p.mesh.userData.ring; if (rg.visible) { const s = 1 + Math.sin(T * 4) * .1; rg.scale.set(s, s, s); } });
      if (S.fork) S.fork.marks.forEach(m => { const hv = S.hover === m.id; m.arrow.position.y = 2.6 + Math.sin(T * 5) * .25; m.arrow.rotation.y = T * 2; const s = (hv ? 1.25 : 1) + Math.sin(T * 5) * .05; m.ring.scale.set(s, s, s); m.ring.material.color.setHex(hv ? 0xff5d8f : 0xffd23f); });
      if (S.flag) S.flag.rotation.y = Math.sin(T * 3) * .25;
      if (S.trophy) S.trophy.rotation.y = T;
      if (S.water) S.water.forEach((w, i) => { w.material.emissive = w.material.emissive || new THREE.Color(); w.position.y = .24 + Math.sin(T * 1.4 + i) * .012; });
      updateCamera(dt); renderer.render(scene, camera);
    }
    function resize() {
      const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); if (S.board) setMode(S.mode, false);
    }
    window.addEventListener("resize", resize);
    function start() { S.dead = false; last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); resize(); }
    function stop() { cancelAnimationFrame(raf); S.dead = true; }

    return {
      build, setPlayers, place, move, setActive, celebrate, pulse, showFork, clearFork, hoverFork, resize, start, stop,
      mode: m => { setMode(m); }, get currentMode() { return S.mode; },
      focus: id => { const n = S.board.nodes[id]; S.cam.gtx = n.x; S.cam.gtz = n.z; },
      setSpeed: v => { S.speed = v; }, setShift: px => { S.shift = px; },
      snap: (n) => { for (let i = 0; i < (n || 1); i++) frame(0.05); }, state: S, renderer, camera
    };
  };
})(window);
