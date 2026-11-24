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
    else if (type === "fwd") { g.strokeStyle = "#fff"; g.lineWidth = 26; [70, 128].forEach(x => { g.beginPath(); g.moveTo(x, 70); g.lineTo(x + 54, 130); g.lineTo(x, 190); g.stroke(); }); }
    else if (type === "back") { g.strokeStyle = "#fff"; g.lineWidth = 26; [186, 128].forEach(x => { g.beginPath(); g.moveTo(x, 70); g.lineTo(x - 54, 130); g.lineTo(x, 190); g.stroke(); }); }
    else if (type === "again") { g.strokeStyle = "#fff"; g.lineWidth = 24; g.beginPath(); g.arc(128, 132, 58, -Math.PI * .1, Math.PI * 1.55); g.stroke(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(178, 60); g.lineTo(190, 118); g.lineTo(136, 96); g.closePath(); g.fill(); }
    else if (type === "gate") { g.fillStyle = "#fff"; for (let k = 0; k < 4; k++) g.fillRect(58 + k * 40, 70, 22, 120); g.fillStyle = col; g.fillRect(50, 120, 156, 22); g.fillStyle = "#fff"; g.fillRect(50, 122, 156, 8); }
    else if (type === "life") { g.fillStyle = "#fff"; g.beginPath(); g.arc(128, 84, 30, 0, 7); g.fill(); g.beginPath(); g.moveTo(66, 190); g.quadraticCurveTo(66, 118, 128, 118); g.quadraticCurveTo(190, 118, 190, 190); g.closePath(); g.fill(); }
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
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9d5b5); scene.fog = new THREE.Fog(0xe9d5b5, 230, 520);
    const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 900);
    const root = new THREE.Group(); scene.add(root);
    const hemi = new THREE.HemisphereLight(0xffffff, 0xc9a66b, 0.95); scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.05); sun.position.set(-30, 90, 45); sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096); const sc = sun.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 52; sc.bottom = -52; sc.near = 20; sc.far = 260; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
    scene.add(sun);

    const S = { board: null, tiles: [], pawns: {}, active: null, anims: [], fork: null, hover: -1, time: 0, speed: 1, mode: "follow",
      cam: { yaw: 0.0, pitch: 0.95, dist: 24, tx: 0, tz: 0, ty: 0, goalDist: 24, gtx: 0, gtz: 0 }, userRot: false, dead: false };
    const FLOOR = -40;
    const tileTex = {}; const mats = {};
    const mat = (k, f) => mats[k] || (mats[k] = f());

    /* ---------- small geometry helpers ---------- */
    const geo = {};
    const G = (k, f) => geo[k] || (geo[k] = f());
    const M = (hex, o) => mat("m" + hex + JSON.stringify(o || {}), () => new THREE.MeshStandardMaterial(Object.assign({ color: hex, roughness: .8 }, o || {})));
    const add = (o, shadow) => { if (shadow !== false) o.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); root.add(o); return o; };
    function beam(a, b, w, h, material) {       // box from point a to b (each [x,y,z]); width w sideways, height h
      const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], len = Math.hypot(dx, dy, dz);
      const m = new THREE.Mesh(G("box", () => new THREE.BoxGeometry(1, 1, 1)), material); m.scale.set(len, h, w);
      m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      const q = new THREE.Quaternion(); q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(dx, dy, dz).normalize()); m.quaternion.copy(q); m.castShadow = m.receiveShadow = true; root.add(m); return m;
    }
    const topY = n => .42 + (n.y || 0);
    const dirOf = n => { const nx = S.board.nodes[n.next[0]] || n, pv = S.board.nodes[n.prev[0]] || n; return Math.atan2(nx.z - pv.z, nx.x - pv.x); };
    const sideOf = (n, off) => { const a = dirOf(n); return [n.x - Math.sin(a) * off, n.z + Math.cos(a) * off]; };

    function build(board) {
      S.board = board;
      while (root.children.length) root.remove(root.children[0]);
      S.tiles = []; S.pawns = {}; S.forkMarks = []; S.water = []; S.seats = {};
      room(); tableAndSlab(board);
      const sand = M(0xf1dfb0, { roughness: .95 });
      /* path ribbons between fields (zone coloured, follow the height) */
      const seen = new Set();
      board.nodes.forEach(n => n.next.forEach(m => { const k = n.id + "-" + m; if (seen.has(k)) return; seen.add(k);
        const a = n, b = board.nodes[m], z = b.zone || a.zone, col = z ? parseInt(MP.Board.ZONES[z].color.slice(1), 16) : 0xf1dfb0;
        if (z === "rope" || z === "bridge") return;                       // these get their own deck
        beam([a.x, topY(a) - .17, a.z], [b.x, topY(b) - .17, b.z], z === "ladder" ? 1.1 : 1.8, .12, z ? M(lighten2(col), { roughness: .9 }) : sand); }));
      board.nodes.forEach(n => { if (n.zone === "rope" || n.zone === "bridge" || n.zone === "ladder") return; const j = new THREE.Mesh(G("jc", () => new THREE.CylinderGeometry(.9, .9, .12, 24)), n.zone ? M(lighten2(parseInt(MP.Board.ZONES[n.zone].color.slice(1), 16)), { roughness: .9 }) : sand); j.position.set(n.x, topY(n) - .17, n.z); j.receiveShadow = true; root.add(j); });
      /* tiles */
      board.nodes.forEach(n => {
        const type = n.type; if (!tileTex[type]) tileTex[type] = tileTexture(type);
        const cat = CAT()[type];
        const side = mat("side" + type, () => new THREE.MeshStandardMaterial({ color: new THREE.Color(cat.dark), roughness: .55 }));
        const top = mat("top" + type, () => new THREE.MeshStandardMaterial({ map: tileTex[type], roughness: .45 }));
        const m = new THREE.Mesh(new THREE.CylinderGeometry(.98, 1.05, .42, 40), [side, top, side]);
        m.position.set(n.x, topY(n), n.z); m.rotation.y = Math.PI * .5; m.castShadow = m.receiveShadow = true; m.userData.node = n.id; root.add(m);
        S.tiles[n.id] = m; m.userData.baseY = topY(n);
        if (n.y > .2 && n.zone !== "rope" && n.zone !== "bridge") { const col = new THREE.Mesh(G("col" + n.zone, () => new THREE.CylinderGeometry(n.zone === "ladder" ? .35 : .85, n.zone === "ladder" ? .45 : 1.0, 1, 14)), n.zone === "ladder" ? M(0x7a4f24) : M(0xb8aa94, { roughness: 1 })); const h = n.y + .2; col.scale.y = h; col.position.set(n.x, .2 + h / 2 - .02, n.z); col.castShadow = col.receiveShadow = true; root.add(col); }
        if (type === "start") flagModel(n);
        if (type === "finish") finishModel(n);
        if (type === "life") lifeModel(n);
        if (type === "gate") gateModel(n);
      });
      /* routes: their own scenery and labels */
      board.sections.forEach(sec => sec.routes.forEach(r => routeModel(r, board)));
      decorate(board);
      resetCamera();
    }
    const lighten2 = hex => { const c = new THREE.Color(hex); c.lerp(new THREE.Color(0xffffff), .35); return c.getHex(); };

    /* ---------- the room: floor, rug, walls, window, lamp ---------- */
    function room() {
      const wall = new THREE.MeshStandardMaterial({ color: 0xf0dcc0, roughness: 1 }), wain = new THREE.MeshStandardMaterial({ color: 0xa8714a, roughness: .85 });
      const floorTex = woodTexture(); floorTex.repeat.set(36, 36);
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(520, 440), new THREE.MeshStandardMaterial({ map: floorTex, roughness: .9, color: 0xd9b48a })); floor.rotation.x = -Math.PI / 2; floor.position.y = FLOOR; floor.receiveShadow = true; root.add(floor);
      const rug = new THREE.Mesh(new THREE.CircleGeometry(92, 64), new THREE.MeshStandardMaterial({ map: rugTexture(), roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(1, FLOOR + .06, 0); rug.scale.y = .78; rug.receiveShadow = true; root.add(rug);
      const HW = 210, HD = 170, H = 130;
      [[0, -HD, 0, HW * 2], [0, HD, Math.PI, HW * 2], [-HW, 0, Math.PI / 2, HD * 2], [HW, 0, -Math.PI / 2, HD * 2]].forEach(w => {
        const g = new THREE.Group(); const up = new THREE.Mesh(new THREE.PlaneGeometry(w[3], H), wall); up.position.y = FLOOR + H / 2 + 14; const low = new THREE.Mesh(new THREE.PlaneGeometry(w[3], 28), wain); low.position.y = FLOOR + 14; low.position.z = .1;
        g.add(up, low); g.position.set(w[0], 0, w[1]); g.rotation.y = w[2]; root.add(g); });
      /* big window on the back wall with warm light, pictures, bunting */
      const sky = new THREE.Mesh(new THREE.PlaneGeometry(70, 46), new THREE.MeshBasicMaterial({ color: 0xcfeaff })); sky.position.set(-70, FLOOR + 78, -HD + .3); root.add(sky);
      const frameM = M(0xffffff); [[0, 23, 72, 2.4], [0, -23, 72, 2.4], [-35, 0, 2.4, 48], [35, 0, 2.4, 48], [0, 0, 2.4, 46], [0, 0, 70, 2]].forEach(f => { const b = new THREE.Mesh(new THREE.BoxGeometry(f[2], f[3], 1.6), frameM); b.position.set(-70 + f[0], FLOOR + 78 + f[1], -HD + 1); root.add(b); });
      [[60, 0xef476f], [95, 0x1e9be9], [130, 0xf6b93b]].forEach((p, i) => { const fr = new THREE.Mesh(new THREE.BoxGeometry(30, 38, 1.4), M(0x6b4423)); fr.position.set(p[0] - 40, FLOOR + 78, -HD + 1); root.add(fr); const pic = new THREE.Mesh(new THREE.PlaneGeometry(25, 33), new THREE.MeshBasicMaterial({ color: p[1] })); pic.position.set(p[0] - 40, FLOOR + 78, -HD + 1.8); root.add(pic);
        const sun = new THREE.Mesh(new THREE.CircleGeometry(5, 20), new THREE.MeshBasicMaterial({ color: 0xffffff })); sun.position.set(p[0] - 40, FLOOR + 83, -HD + 1.9); root.add(sun); });
      const colors = [0xef476f, 0xffd23f, 0x06c28f, 0x1e9be9, 0x7b5cd6, 0xff8a3d];
      for (let i = 0; i < 30; i++) { const t = new THREE.Mesh(new THREE.ConeGeometry(2.6, 5, 3), new THREE.MeshStandardMaterial({ color: colors[i % 6], side: THREE.DoubleSide })); t.rotation.x = Math.PI; const x = -100 + i * 7; t.position.set(x, FLOOR + 118 - Math.sin(i / 29 * Math.PI) * -6 - 12 + Math.sin(i / 29 * Math.PI) * 10, -HD + 4); root.add(t); }
      /* hanging lamp over the table */
      const shade = new THREE.Mesh(new THREE.ConeGeometry(14, 8, 28, 1, true), new THREE.MeshStandardMaterial({ color: 0xffd23f, side: THREE.DoubleSide, emissive: 0x6b4a00, roughness: .6 })); shade.position.set(1, 78, 0); root.add(shade);
      const cord = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, 60, 6), M(0x333333)); cord.position.set(1, 112, 0); root.add(cord);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(2.4, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfff3b0 })); bulb.position.set(1, 76, 0); root.add(bulb);
      /* plants and a bookshelf in the corners so the room does not look empty */
      [[-150, -120], [150, -120], [-150, 120], [150, 120], [0, -150]].forEach((p, i) => { const pot = new THREE.Mesh(new THREE.CylinderGeometry(7, 5, 10, 14), M(0xc2693f)); pot.position.set(p[0], FLOOR + 5, p[1]); root.add(pot);
        for (let k = 0; k < 7; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(7, 10, 8), M(i % 2 ? 0x3a9a4a : 0x4cae4c, { flatShading: true })); l.position.set(p[0] + Math.sin(k * 1.9) * 5, FLOOR + 14 + k * 3.6, p[1] + Math.cos(k * 1.9) * 5); l.scale.set(1, .7, 1); root.add(l); } });
      const shelf = new THREE.Group(); shelf.add(new THREE.Mesh(new THREE.BoxGeometry(60, 70, 14), M(0x8a5a33)));
      for (let r = 0; r < 4; r++) for (let k = 0; k < 14; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(2.8, 11 + (k * 7 % 4), 9), M([0xef476f, 0x1e9be9, 0xf6b93b, 0x06c28f, 0x7b5cd6][(k + r) % 5])); b.position.set(-26 + k * 3.9, -26 + r * 17, 4.2); shelf.add(b); }
      shelf.position.set(150, FLOOR + 36, -HD + 12); root.add(shelf);
    }
    function rugTexture() {
      const c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d"); g.fillStyle = "#b8434f"; g.fillRect(0, 0, 512, 512);
      ["#f4e2b8", "#2b6f87", "#f4e2b8", "#d98a3d"].forEach((col, i) => { g.strokeStyle = col; g.lineWidth = 10 + (i === 1 ? 14 : 0); g.beginPath(); g.arc(256, 256, 236 - i * 36, 0, 7); g.stroke(); });
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; g.fillStyle = i % 2 ? "#f4e2b8" : "#2b6f87"; g.beginPath(); g.arc(256 + Math.cos(a) * 100, 256 + Math.sin(a) * 100, 14, 0, 7); g.fill(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    }
    /* ---------- table + the board on top ---------- */
    function tableAndSlab(board) {
      const TX = 1, TW = 112, TD = 80, topT = 2.2;
      const wood = woodTexture(); wood.repeat.set(5, 4);
      const top = new THREE.Mesh(new THREE.BoxGeometry(TW, topT, TD), new THREE.MeshStandardMaterial({ map: wood, roughness: .6, color: 0xe6c08f })); top.position.set(TX, -1.2 - topT / 2, 0); top.castShadow = top.receiveShadow = true; root.add(top);
      const edge = new THREE.Mesh(new THREE.BoxGeometry(TW + 1.2, .7, TD + 1.2), M(0x7b4a24)); edge.position.set(TX, -1.2 - topT + .2, 0); edge.receiveShadow = true; root.add(edge);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(s => { const leg = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.3, -1.2 - topT - FLOOR, 16), M(0x7b4a24)); leg.position.set(TX + s[0] * (TW / 2 - 6), (-1.2 - topT + FLOOR) / 2, s[1] * (TD / 2 - 6)); leg.castShadow = true; root.add(leg); });
      const bx0 = -37, bx1 = 40, bz0 = -26, bz1 = 26, w = bx1 - bx0, d = bz1 - bz0, cx = (bx0 + bx1) / 2, cz = (bz0 + bz1) / 2;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 2.4, 1.2, d + 2.4), M(0xc08a4f, { roughness: .7 })); frame.position.set(cx, -0.6, cz); frame.castShadow = frame.receiveShadow = true; root.add(frame);
      const gt = grassTexture(); gt.wrapS = gt.wrapT = THREE.RepeatWrapping; gt.repeat.set(4, 3);
      const grass = new THREE.Mesh(new THREE.BoxGeometry(w, .3, d), new THREE.MeshStandardMaterial({ map: gt, roughness: 1 })); grass.position.set(cx, 0.05, cz); grass.receiveShadow = true; root.add(grass);
      S.slab = { x0: bx0, x1: bx1, z0: bz0, z1: bz1 };
    }

    /* ---------- one route (a stretch between two forks): its landscape and its label ---------- */
    function routeModel(r, board) {
      const ns = r.ids.map(id => board.nodes[id]), z = r.zone, mid = ns[Math.floor(ns.length / 2)], first = board.nodes[r.ids[0]], last = board.nodes[r.ids[r.ids.length - 1]];
      const Z = MP.Board.ZONES[z], stone = M(0xb9b2a4, { roughness: 1 }), wood = M(0x8b5a2b), rope = M(0xd7b97a, { roughness: 1 });
      const pts = [board.nodes[board.sections.find(s => s.routes.includes(r)).split]].concat(ns, [board.nodes[board.sections.find(s => s.routes.includes(r)).merge]]);
      const P = n => [n.x, topY(n) - .17, n.z];
      if (z === "stairs") {
        ns.forEach(n => { for (let k = 0; k < 3; k++) { const o = sideOf(n, 0), st = new THREE.Mesh(G("box", () => new THREE.BoxGeometry(1, 1, 1)), stone); st.scale.set(2.4, .22, .8); st.position.set(n.x + Math.cos(dirOf(n)) * (k - 1) * .75, topY(n) - .02 - (2 - k) * .02, n.z + Math.sin(dirOf(n)) * (k - 1) * .75); st.rotation.y = -dirOf(n) + Math.PI / 2; root.add(st); } });
        for (let i = 0; i < pts.length - 1; i++) [-1.3, 1.3].forEach(sd => { const a = pts[i], b = pts[i + 1], oa = sideOf(a, sd), ob = sideOf(b, sd); beam([oa[0], topY(a) + .5, oa[1]], [ob[0], topY(b) + .5, ob[1]], .14, .14, M(0x8b5a2b)); });
        const hill = new THREE.Mesh(G("hill", () => new THREE.SphereGeometry(1, 20, 12, 0, 6.283, 0, Math.PI / 2)), M(0x7fa660, { roughness: 1, flatShading: true })); hill.scale.set(7.5, 2.6, 5.5); hill.position.set(mid.x, -.3, mid.z); hill.rotation.y = -dirOf(mid) ; hill.castShadow = hill.receiveShadow = true; root.add(hill); hill.position.y = -.3; hill.material = M(0x93b87a, { roughness: 1, flatShading: true });
        hill.scale.set(5, 1.6, 4.2); hill.position.y = -.6;
      } else if (z === "ladder") {
        ns.forEach(n => { const plat = new THREE.Mesh(G("pl", () => new THREE.CylinderGeometry(1.6, 1.6, .22, 16)), wood); plat.position.set(n.x, topY(n) - .3, n.z); plat.castShadow = true; root.add(plat); });
        for (let i = 0; i < pts.length - 1; i++) [-.45, .45].forEach(sd => { const a = pts[i], b = pts[i + 1], oa = sideOf(a, sd), ob = sideOf(b, sd); beam([oa[0], topY(a) - .3, oa[1]], [ob[0], topY(b) - .3, ob[1]], .12, .12, wood);
          if (sd < 0) for (let k = 1; k < 5; k++) { const t = k / 5, q0 = sideOf(a, -.45), q1 = sideOf(a, .45), r0 = sideOf(b, -.45), r1 = sideOf(b, .45); const y = topY(a) - .3 + (topY(b) - topY(a)) * t; beam([q0[0] + (r0[0] - q0[0]) * t, y, q0[1] + (r0[1] - q0[1]) * t], [q1[0] + (r1[0] - q1[0]) * t, y, q1[1] + (r1[1] - q1[1]) * t], .1, .1, wood); } });
        const tx = mid.x + Math.sin(dirOf(mid)) * 3.2, tz = mid.z - Math.cos(dirOf(mid)) * 3.2;
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.7, 1, 5.2, 10), wood); trunk.position.set(tx, 2.6, tz); trunk.castShadow = true; root.add(trunk);
        [0, 1, 2].forEach(k => { const c = new THREE.Mesh(new THREE.SphereGeometry(2.4 - k * .4, 12, 10), M(0x3f9d4c, { flatShading: true })); c.position.set(tx, 5.6 + k * 1.3, tz); c.castShadow = true; root.add(c); });
      } else if (z === "rope") {
        const sag = n => topY(n) - .3;
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; beam([a.x, sag(a) - .05, a.z], [b.x, sag(b) - .05, b.z], 1.5, .14, wood); [-.95, .95].forEach(sd => { const oa = sideOf(a, sd), ob = sideOf(b, sd); beam([oa[0], sag(a) + 1.1, oa[1]], [ob[0], sag(b) + 1.1, ob[1]], .07, .07, rope); }); }
        ns.forEach(n => { [-.95, .95].forEach(sd => { const o = sideOf(n, sd); const p = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 1.2, 6), rope); p.position.set(o[0], sag(n) + .55, o[1]); root.add(p); }); });
        [pts[0], pts[pts.length - 1]].forEach(n => [-1.1, 1.1].forEach(sd => { const o = sideOf(n, sd), p = new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, 2.4, 8), wood); p.position.set(o[0], 1.3, o[1]); p.castShadow = true; root.add(p); }));
        const dir = dirOf(mid), rav = new THREE.Mesh(new THREE.BoxGeometry(3.4 + Math.abs(first.z - last.z) * 0, .12, 9.5), M(0x3b2a1e, { roughness: 1 })); rav.position.set(mid.x, .27, mid.z); rav.rotation.y = -dir; root.add(rav);
        for (let k = 0; k < 6; k++) { const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(.5, 0), M(0x6f655a, { flatShading: true })); const o = sideOf(mid, (k - 2.5) * 1.5); rk.position.set(o[0] + Math.cos(dir) * (k % 2 ? 1.9 : -1.9), .5, o[1] + Math.sin(dir) * (k % 2 ? 1.9 : -1.9)); root.add(rk); }
      } else if (z === "bridge") {
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; beam(P(a), P(b), 2.0, .24, stone); [-1.05, 1.05].forEach(sd => { const oa = sideOf(a, sd), ob = sideOf(b, sd); beam([oa[0], topY(a) + .1, oa[1]], [ob[0], topY(b) + .1, ob[1]], .25, .6, stone); }); }
        const dir = dirOf(mid), river = new THREE.Mesh(new THREE.BoxGeometry(4.6, .1, 13), new THREE.MeshStandardMaterial({ color: 0x58b9f0, roughness: .15, metalness: .1 })); river.position.set(mid.x, .25, mid.z); river.rotation.y = -dir; river.receiveShadow = true; root.add(river); S.water.push(river);
        const arch = new THREE.Mesh(G("arch", () => new THREE.TorusGeometry(1, .2, 8, 24, Math.PI)), stone); arch.scale.set(Math.max(2.6, Math.abs(Math.hypot(ns[ns.length - 1].x - ns[0].x, ns[ns.length - 1].z - ns[0].z)) * .55), 1.0, 1.3); arch.position.set(mid.x, .1, mid.z); arch.rotation.y = -dir; root.add(arch);
      } else if (z === "ramp") {
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; [-1.05, 1.05].forEach(sd => { const oa = sideOf(a, sd), ob = sideOf(b, sd); beam([oa[0], topY(a) + .1, oa[1]], [ob[0], topY(b) + .1, ob[1]], .12, .5, M(0xe9f3dc)); }); }
        for (let i = 1; i < pts.length - 1; i += 2) { const n = pts[i], o = sideOf(n, 1.8), l = new THREE.Mesh(new THREE.CylinderGeometry(.08, .1, 1.7, 6), M(0x555555)); l.position.set(o[0], topY(n) + .3, o[1]); root.add(l); const bulb = new THREE.Mesh(new THREE.SphereGeometry(.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff3b0 })); bulb.position.set(o[0], topY(n) + 1.2, o[1]); root.add(bulb); }
      } else if (z === "market") {
        const cols = [0xef476f, 0xffd23f, 0x1e9be9, 0x06c28f, 0xff8a3d];
        ns.forEach((n, i) => [-1, 1].forEach((sd, j) => { if ((i + j) % 2 && i % 2) return; const o = sideOf(n, sd * 3.0), g = new THREE.Group(); const c = new THREE.Mesh(new THREE.BoxGeometry(2.1, .9, 1.2), wood); c.position.y = .5; g.add(c);
          const aw = new THREE.Mesh(new THREE.ConeGeometry(1.7, .9, 4), M(cols[(i * 2 + j) % 5], { flatShading: true })); aw.rotation.y = Math.PI / 4; aw.position.y = 2.0; g.add(aw); [-.9, .9].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.7, 5), wood); p.position.set(x, 1.1, .5); g.add(p); });
          [0, 1, 2].forEach(k => { const f = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), M([0xe63946, 0xffb703, 0x70c050][k])); f.position.set(-.6 + k * .6, 1.05, 0); g.add(f); });
          g.position.set(o[0], .2, o[1]); g.rotation.y = -dirOf(n) + (sd > 0 ? Math.PI : 0); add(g); }));
        ns.forEach((n, i) => { const o = sideOf(n, (i % 2 ? 1 : -1) * 1.9); const px = new THREE.Group(); const body = new THREE.Mesh(G("pb", () => new THREE.CylinderGeometry(.22, .3, .8, 8)), M(cols[(i + 2) % 5])); body.position.y = .6; const head = new THREE.Mesh(G("ph", () => new THREE.SphereGeometry(.22, 8, 6)), M(0xf1c9a0)); head.position.y = 1.2; px.add(body, head); px.position.set(o[0] + Math.sin(i) * .4, .2, o[1]); add(px); });
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], oa = sideOf(a, 0), ob = sideOf(b, 0); const f = (t) => [oa[0] + (ob[0] - oa[0]) * t, oa[1] + (ob[1] - oa[1]) * t]; for (let k = 0; k < 4; k++) { const q = f(k / 4 + .1); const fl = new THREE.Mesh(new THREE.ConeGeometry(.22, .45, 3), M(cols[(i + k) % 5])); fl.rotation.x = Math.PI; fl.position.set(q[0], 3.1 - Math.sin(k / 3 * Math.PI) * .25, q[1]); root.add(fl); } }
      } else if (z === "tunnel") {
        const dark = new THREE.MeshStandardMaterial({ color: 0x4b4f66, roughness: 1, transparent: true, opacity: .55, side: THREE.DoubleSide });
        const len = Math.hypot(pts[pts.length - 1].x - pts[0].x, pts[pts.length - 1].z - pts[0].z) * .8;
        const tun = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, len, 18, 1, true, 0, Math.PI), dark); tun.rotation.set(0, 0, Math.PI / 2); const holder = new THREE.Group(); holder.add(tun); holder.position.set(mid.x, 0, mid.z); holder.rotation.y = -Math.atan2(last.z - first.z, last.x - first.x); add(holder);
        const mt = new THREE.MeshStandardMaterial({ color: 0x555a73, roughness: 1, flatShading: true });
        [first, last].forEach((n, k) => { const o = [n.x, n.z]; const arch = new THREE.Mesh(new THREE.TorusGeometry(2.8, .5, 8, 20, Math.PI), mt); arch.position.set(o[0], .3, o[1]); arch.rotation.y = -dirOf(n) + Math.PI / 2; add(arch); });
        ns.forEach((n, i) => { const o = sideOf(n, 0); const lamp = new THREE.Mesh(new THREE.SphereGeometry(.18, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffe08a })); lamp.position.set(o[0], 1.9, o[1]); root.add(lamp); });
        const hill = new THREE.Mesh(G("hill", () => new THREE.SphereGeometry(1, 20, 12, 0, 6.283, 0, Math.PI / 2)), new THREE.MeshStandardMaterial({ color: 0x7e8a6a, roughness: 1, flatShading: true, transparent: true, opacity: .4 })); hill.scale.set(len / 2 + 1, 3.6, 4.6); hill.position.set(mid.x, -.3, mid.z); hill.rotation.y = -Math.atan2(last.z - first.z, last.x - first.x); root.add(hill);
      } else if (z === "office") {
        const o = sideOf(mid, 6.2), g = new THREE.Group(); const body = new THREE.Mesh(new THREE.BoxGeometry(8, 4, 3.6), M(0xeadfc8)); body.position.y = 2; g.add(body);
        const roof = new THREE.Mesh(new THREE.ConeGeometry(5.3, 1.8, 4), M(0x6c7ae0, { flatShading: true })); roof.rotation.y = Math.PI / 4; roof.scale.z = .5; roof.position.y = 4.9; g.add(roof);
        for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 4, 8), M(0xffffff)); c.position.set(-3.2 + k * 1.6, 2, 1.95); g.add(c); }
        const clock = new THREE.Mesh(new THREE.CircleGeometry(.6, 20), M(0xffffff)); clock.position.set(0, 4.9, 1.85); g.add(clock);
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 3, 6), M(0xffffff)); pole.position.set(3.4, 6.2, 0); g.add(pole); const fl = new THREE.Mesh(new THREE.BoxGeometry(1.1, .6, .05), M(0x6c7ae0)); fl.position.set(3.95, 7.2, 0); g.add(fl);
        g.position.set(o[0], .2, o[1]); g.rotation.y = -dirOf(mid) + (o[1] > mid.z ? Math.PI : 0) + Math.PI; add(g);
        ns.forEach((n, i) => { const q = sideOf(n, (i % 2 ? 1 : -1) * 2.3), d = new THREE.Mesh(new THREE.BoxGeometry(1.5, .8, .9), wood); d.position.set(q[0], .65, q[1]); d.rotation.y = -dirOf(n); d.castShadow = true; root.add(d); const paper = new THREE.Mesh(new THREE.BoxGeometry(.5, .06, .7), M(0xffffff)); paper.position.set(q[0], 1.08, q[1]); root.add(paper); });
      } else if (z === "sprint") {
        for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; [-1.15, 1.15].forEach(sd => { const oa = sideOf(a, sd), ob = sideOf(b, sd); beam([oa[0], topY(a) - .08, oa[1]], [ob[0], topY(b) - .08, ob[1]], .12, .06, M(0xffffff)); }); }
        [first, last].forEach(n => { [-1.9, 1.9].forEach(sd => { const o = sideOf(n, sd), p = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 3.4, 8), M(0xffffff)); p.position.set(o[0], 1.9, o[1]); root.add(p); });
          const o1 = sideOf(n, 0), ban = new THREE.Mesh(new THREE.BoxGeometry(4, .7, .1), M(0xe76f51)); ban.position.set(o1[0], 3.4, o1[1]); ban.rotation.y = -dirOf(n) + Math.PI / 2; root.add(ban); });
        ns.forEach((n, i) => { const o = sideOf(n, 2.6 * (i % 2 ? 1 : -1)), f = new THREE.Mesh(new THREE.ConeGeometry(.4, 1.2, 4), M([0xe76f51, 0xffd23f][i % 2])); f.position.set(o[0], .8, o[1]); root.add(f); });
      } else if (z === "quiet") {
        ns.forEach((n, i) => { [-1, 1].forEach(sd => { if ((i + (sd > 0 ? 1 : 0)) % 2) return; const o = sideOf(n, sd * 2.7), g = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, 1.6, 6), wood); t.position.y = .8; g.add(t); [0, 1].forEach(k => { const c = new THREE.Mesh(new THREE.SphereGeometry(1.15 - k * .3, 10, 8), M(0x3f9d4c, { flatShading: true })); c.position.y = 2.1 + k * .9; g.add(c); }); g.position.set(o[0], .2, o[1]); add(g); });
          if (i % 2) { const o = sideOf(n, 1.9), b = new THREE.Mesh(new THREE.BoxGeometry(1.4, .3, .5), wood); b.position.set(o[0], .55, o[1]); b.rotation.y = -dirOf(n); b.castShadow = true; root.add(b); } });
      }
      const lab = labelSprite(Z.icon + " " + Z.label, Z.color); const lo = sideOf(mid, z === "market" || z === "quiet" ? 0 : 0); lab.position.set(lo[0], topY(mid) + 3.7 + (z === "ladder" ? 1.5 : 0), lo[1]); root.add(lab); S.labels = (S.labels || []).concat(lab);
    }
    function gateModel(n) {
      const g = new THREE.Group(), red = M(0xd9534f), wh = M(0xffffff);
      [-1.4, 1.4].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.14, .16, 2.4, 8), wh); p.position.set(x, 1.2, 0); g.add(p); });
      for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(.5, .22, .14), k % 2 ? wh : red); s.position.set(-1.25 + k * .5, 2.3, 0); g.add(s); }
      g.position.set(n.x, topY(n) - .1, n.z); g.rotation.y = -dirOf(n) + Math.PI / 2; add(g);
    }
    function lifeModel(n) {
      const g = new THREE.Group(), gold = new THREE.MeshStandardMaterial({ color: 0xf2b632, metalness: .5, roughness: .3 });
      const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.6, .5, 28), gold); ped.position.y = .1; g.add(ped);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, 2.6, 8), gold); col.position.set(1.5, 1.4, 0); g.add(col);
      g.position.set(n.x, topY(n) - .35, n.z); add(g);
      const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"); x.fillStyle = "#f2b632"; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = "#fff"; x.stroke(); x.fillStyle = "#fff"; x.font = '900 70px "Arial Rounded MT Bold",Arial,sans-serif'; x.textAlign = "center"; x.textBaseline = "middle"; x.strokeStyle = "rgba(0,0,0,.35)"; x.lineWidth = 8; x.strokeText(n.life, 64, 70); x.fillText(n.life, 64, 70);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); s.scale.set(1.5, 1.5, 1); s.position.set(n.x + 1.5, topY(n) + 2.3, n.z); s.renderOrder = 10; root.add(s);
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

    /* ---------- scenery on the open grass ---------- */
    function decorate(board) {
      const R = mulberry(42), pts = board.nodes.map(n => [n.x, n.z]), sl = S.slab;
      const free = (x, z, r) => pts.every(p => Math.hypot(p[0] - x, p[1] - z) > r) && x > sl.x0 + 2 && x < sl.x1 - 2 && z > sl.z0 + 2 && z < sl.z1 - 2;
      const gm = [0x4cae4c, 0x5cc060, 0x3a9a4a].map(c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true })), trunk = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
      const rockM = new THREE.MeshStandardMaterial({ color: 0xa8a39a, roughness: 1, flatShading: true });
      const roofM = new THREE.MeshStandardMaterial({ color: 0xd1495b, roughness: .8, flatShading: true }), wallM = new THREE.MeshStandardMaterial({ color: 0xfff0cf, roughness: .9 });
      const place = (obj, x, z, y) => { obj.position.set(x, y == null ? .2 : y, z); obj.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); root.add(obj); };
      const tree = (x, z, s) => { const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.CylinderGeometry(.14 * s, .2 * s, .8 * s, 6), trunk); t.position.y = .4 * s; g.add(t);
        const m = gm[Math.floor(R() * 3)]; for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry((1.1 - i * .25) * s, 1.1 * s, 7), m); c.position.y = (1.0 + i * .7) * s; g.add(c); } g.rotation.y = R() * 6; place(g, x, z); };
      const house = (x, z) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 1.4), wallM); b.position.y = .55; g.add(b); const r = new THREE.Mesh(new THREE.ConeGeometry(1.4, .95, 4), roofM); r.position.y = 1.55; r.rotation.y = Math.PI / 4; g.add(r); g.rotation.y = R() * 6; place(g, x, z); };
      const rock = (x, z, s) => { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(.55 * s, 0), rockM); m.scale.y = .7; m.rotation.set(R() * 3, R() * 3, R() * 3); place(m, x, z, .3 + .2 * s); };
      /* the biggest open spot becomes a lake */
      let best = null; for (let x = -26; x < 36; x += 1.5) for (let z = -18; z < 20; z += 1.5) { const d = Math.min.apply(null, pts.map(p => Math.hypot(p[0] - x, p[1] - z))); if (!best || d > best.d) best = { x, z, d }; }
      const lr = Math.min(6.5, Math.max(3, best.d - 2.8)); const lake = new THREE.Mesh(new THREE.CylinderGeometry(lr, lr, .08, 40), new THREE.MeshStandardMaterial({ color: 0x58b9f0, roughness: .15, metalness: .1 })); lake.scale.z = .75; lake.position.set(best.x, .24, best.z); lake.receiveShadow = true; root.add(lake); S.water.push(lake);
      const lakeFree = (x, z) => Math.hypot((x - best.x) / (lr + 1.5), (z - best.z) / ((lr + 1.5) * .75)) > 1;
      for (let i = 0, h = 0; h < 14 && i < 500; i++) { const x = sl.x0 + 3 + R() * (sl.x1 - sl.x0 - 6), z = sl.z0 + 3 + R() * (sl.z1 - sl.z0 - 6); if (!free(x, z, 5.2) || !lakeFree(x, z)) continue; house(x, z); h++; }
      for (let i = 0, t = 0; t < 120 && i < 2500; i++) { const x = sl.x0 + 2 + R() * (sl.x1 - sl.x0 - 4), z = sl.z0 + 2 + R() * (sl.z1 - sl.z0 - 4); if (!free(x, z, 4.2) || !lakeFree(x, z)) continue; tree(x, z, .8 + R() * .6); t++; }
      for (let i = 0, t = 0; t < 30 && i < 600; i++) { const x = sl.x0 + 2 + R() * (sl.x1 - sl.x0 - 4), z = sl.z0 + 2 + R() * (sl.z1 - sl.z0 - 4); if (!free(x, z, 3.2) || !lakeFree(x, z)) continue; rock(x, z, .7 + R() * .9); t++; }
      const mt = new THREE.MeshStandardMaterial({ color: 0xc58a55, roughness: 1, flatShading: true }), snow = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, flatShading: true });
      [[-34.5, -24], [37.5, -24], [-34.5, 24], [37.5, 24], [4, -24.5], [20, 24.3]].forEach((p, i) => { if (!free(p[0], p[1], 0)) return; const h = 4.6 + R() * 2.5, r = 2.6 + R(); const c = new THREE.Mesh(new THREE.ConeGeometry(r, h, 5), mt); c.position.set(p[0], h / 2, p[1]); c.castShadow = true; root.add(c); const s = new THREE.Mesh(new THREE.ConeGeometry(r * .4, h * .32, 5), snow); s.position.set(p[0], h * .86, p[1]); root.add(s); });
    }

    /* ---------- the seated players around the table ---------- */
    function seatSpot(i, n) {
      const TW = 112, TD = 80, cx = 1, ang = Math.PI / 2 + (i * 2 * Math.PI / n) + (n === 2 ? 0 : 0.0);
      const dx = Math.cos(ang), dz = Math.sin(ang), t = Math.min(TW / 2 / Math.max(Math.abs(dx), 1e-6), TD / 2 / Math.max(Math.abs(dz), 1e-6));
      return { x: cx + dx * (t + 15), z: dz * (t + 15), face: Math.atan2(-dx, -dz) };
    }
    function seatFigure(hex) {
      const g = new THREE.Group(), wood = M(0x8b5a2b), col = new THREE.MeshStandardMaterial({ color: hex, roughness: .35, metalness: .06 });
      const chair = new THREE.Group(); const seat = new THREE.Mesh(new THREE.BoxGeometry(17, 1.6, 17), M(0xb5793f)); seat.position.y = 0; chair.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(17, 15, 1.4), M(0xb5793f)); back.position.set(0, 8, -8.2); chair.add(back);
      [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(l => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 19, 8), wood); c.position.set(l[0], -9.8, l[1]); chair.add(c); });
      g.add(chair);
      const body = new THREE.Group(); const prof = [[0.001, 0], [.5, 0], [.56, .06], [.5, .18], [.34, .42], [.24, .8], [.22, 1.0], [.34, 1.08], [.001, 1.1]].map(p => new THREE.Vector2(p[0], p[1]));
      const lathe = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), col); lathe.scale.set(12, 12, 12); lathe.position.y = 1; body.add(lathe);
      const head = new THREE.Mesh(new THREE.SphereGeometry(.38 * 12, 24, 18), col); head.position.y = 1 + 1.4 * 12; body.add(head);
      [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(1.15, 12, 10), M(0xffffff)); e.position.set(s * 1.9, 1 + 1.5 * 12 + .5, 4.2); body.add(e); const pu = new THREE.Mesh(new THREE.SphereGeometry(.6, 10, 8), M(0x222222)); pu.position.set(s * 1.9, 1 + 1.5 * 12 + .5, 5.1); body.add(pu); });
      const smile = new THREE.Mesh(new THREE.TorusGeometry(1.6, .22, 6, 14, Math.PI), M(0x6b2a2a)); smile.position.set(0, 1 + 1.4 * 12 - 1.4, 4.45); smile.rotation.z = Math.PI; body.add(smile);
      [-1, 1].forEach(s => { const arm = beamLocal(body, [s * 5.6, 12, 2], [s * 5.6, 12, 14], 1.6, col); const hand = new THREE.Mesh(new THREE.SphereGeometry(1.7, 10, 8), col); hand.position.set(s * 5.6, 12, 14.5); body.add(hand); });
      const mk = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4, 4), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffa800, emissiveIntensity: .6 })); mk.rotation.x = Math.PI; mk.position.y = 1 + 1.4 * 12 + 9; mk.visible = false; body.add(mk);
      g.add(body); g.userData = { body, marker: mk, baseY: 0 }; return g;
    }
    /* ---------- seated figure that looks like the drawn person (data: profile.look) ---------- */
    function avatarFigure(hex, look) {
      const A = MP.Avatars, SC = 1.9, g = new THREE.Group(), wood = M(0x8b5a2b), mt = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .65 }, o || {}));
      const tex = cv => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
      const skin = mt(look.skin), hairM = mt(look.hair, { roughness: .8 }), top = mt(look.top), bot = mt(look.bottom), cloth = look.outfit, hs = look.hairStyle, T = look.torso || { kind: "shirt" };
      const wrap = new THREE.Group(), body = new THREE.Group(); wrap.add(body); body.scale.set(SC, SC, SC);
      const add = (geo, m, x, y, z, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); (parent || body).add(o); return o; };
      /* chair */
      const chair = new THREE.Group(), cm = mt(hex, { roughness: .4 }); chair.scale.set(1.35, 1.35, 1.35);
      chair.add(new THREE.Mesh(new THREE.BoxGeometry(17, 1.6, 17), cm)); const bk = new THREE.Mesh(new THREE.BoxGeometry(17, 17, 1.4), cm); bk.position.set(0, 9, -8.2); chair.add(bk);
      [[-7, -7], [7, -7], [-7, 7], [7, 7]].forEach(l => { const c = new THREE.Mesh(new THREE.CylinderGeometry(.9, .9, 24, 8), wood); c.position.set(l[0], -12.8, l[1]); chair.add(c); });
      g.add(chair);
      /* torso: back and sleeves in the body colour, painted front patch */
      const torso = add(new THREE.CylinderGeometry(4.6, 5.2, 11, 28), top, 0, 6.1, 0); torso.scale.z = .72;
      const tf = add(new THREE.CylinderGeometry(4.64, 5.24, 11, 28, 1, true, -1.2, 2.4), new THREE.MeshStandardMaterial({ map: tex(A.paintTorso(Object.assign({ top: look.top }, T))), roughness: .7 }), 0, 6.1, 0); tf.scale.z = .72;
      add(new THREE.CylinderGeometry(1.7, 2, 2.2, 14), skin, 0, 12.2, .3); add(new THREE.SphereGeometry(5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), top, 0, 11.4, 0).scale.set(1.0, .38, .74);
      /* head: skin ellipsoid + painted face patch (front) */
      const F = look.face || {}, HY = 17.2, head = new THREE.Group(); head.position.set(0, HY, .5); head.scale.set(F.w || 1, F.h || 1.1, .96); body.add(head);
      head.add(new THREE.Mesh(new THREE.SphereGeometry(4.4, 36, 28), skin));
      const R = 4.46, fg = new THREE.SphereGeometry(R, 56, 40, Math.PI / 2 - 1.05, 2.1, .38, 2.45), pos = fg.attributes.position, uv = fg.attributes.uv;
      for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getX(i) / (2 * R) + .5, pos.getY(i) / (2 * R) + .5);
      head.add(new THREE.Mesh(fg, new THREE.MeshStandardMaterial({ map: tex(A.paintFace(look)), roughness: .75 })));
      [-1, 1].forEach(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), skin); e.position.set(s * 4.35, -.2, .2); e.scale.set(.55, 1.1, .8); head.add(e); if (look.earrings) { const r = new THREE.Mesh(new THREE.SphereGeometry(.55, 8, 6), mt(look.earrings, { metalness: .8, roughness: .3 })); r.position.set(s * 4.5, -1.7, .3); head.add(r); } });
      /* hair (children of head so it follows its shape) */
      const hadd = (geo, m, x, y, z, rx) => { const o = new THREE.Mesh(geo, m || hairM); o.position.set(x, y, z); if (rx) o.rotation.x = rx; head.add(o); return o; };
      const cap = (r, tilt, th, m) => hadd(new THREE.SphereGeometry(r, 32, 20, 0, Math.PI * 2, 0, th || 1.5), m, 0, .15, -.2, tilt == null ? -.35 : tilt);
      const curls = (n, r0, y0, rr, m) => { for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + .3; hadd(new THREE.SphereGeometry(rr, 10, 8), m, Math.cos(a) * r0, y0 + (i % 3) * .5, Math.sin(a) * r0 * .9 - .8); } };
      if (hs === "short") cap(4.75, -.4);
      else if (hs === "sidepart") { cap(4.75, -.5, 1.5); hadd(new THREE.SphereGeometry(2.6, 14, 10), null, -1.4, 4.3, 1.6).scale.set(1.5, .85, 1.1); }
      else if (hs === "thin") { cap(4.6, -.5, 1.35); }
      else if (hs === "curly") { cap(4.7, -.5, 1.45); curls(11, 4.2, 2.3, 1.45); }
      else if (hs === "curlgray") { cap(4.65, -.5, 1.4); curls(12, 4.25, 1.6, 1.15); }
      else if (hs === "afro") hadd(new THREE.SphereGeometry(6.4, 28, 20), null, 0, 1.6, -1.6).scale.set(1, .98, .92);
      else if (hs === "afrocrown") { hadd(new THREE.SphereGeometry(5.9, 28, 20), null, 0, 2.2, -3.0); ["#ff4f9a", "#ffd23f", "#ff7a3d", "#58d68d", "#b57bff", "#ff4f9a", "#4aa3ff", "#ffd23f", "#ff7a3d"].forEach((c, i, arr) => { const a = (i / arr.length) * Math.PI * 1.5 + Math.PI * .25; hadd(new THREE.SphereGeometry(1.15, 8, 6), mt(c), Math.cos(a + Math.PI) * 4.6 * -1, 4.9 + Math.sin(a) * .6, 1.4 - Math.abs(Math.cos(a)) * 1.0); }); hadd(new THREE.TorusGeometry(4.6, .4, 6, 24), mt("#2e8b57"), 0, 4.3, -.1, Math.PI / 2 - .35).scale.set(1, 1.05, 1); }
      else if (hs === "wild") { cap(4.9, -.4, 1.55); curls(10, 4.6, 2.6, 2.0); hadd(new THREE.SphereGeometry(2.6, 10, 8), null, -2.6, -1, -1.6); hadd(new THREE.SphereGeometry(2.6, 10, 8), null, 2.6, -1, -1.6); }
      else if (hs === "wavylong") { cap(4.8, -.5, 1.5); [-1, 1].forEach(s => { hadd(new THREE.CylinderGeometry(1.4, 1.1, 11, 10), null, s * 4.5, -5.2, -.2).scale.z = 1.5; hadd(new THREE.SphereGeometry(1.5, 10, 8), null, s * 4.6, -11.2, -.2); }); hadd(new THREE.BoxGeometry(9.8, 14, 2.2), null, 0, -5.4, -4.4); }
      else if (hs === "long") { cap(4.8, -.5, 1.5); [-1, 1].forEach(s => hadd(new THREE.CylinderGeometry(1.1, 1.0, 10, 10), null, s * 4.5, -5, -.4).scale.z = 1.4); hadd(new THREE.BoxGeometry(9.8, 13, 2), null, 0, -5, -4.4); }
      else if (hs === "bunwave") { cap(4.8, -.45, 1.5); hadd(new THREE.SphereGeometry(2.4, 12, 10), null, 0, 4.9, -2.8); [-1, 1].forEach(s => hadd(new THREE.SphereGeometry(1.7, 10, 8), null, s * 3.9, 2.2, 1.0).scale.set(.8, 1.4, 1)); }
      else if (hs === "updo") { cap(4.8, -.45, 1.5); hadd(new THREE.SphereGeometry(3.2, 14, 10), null, 0, 4.5, -.4); [-1, 1].forEach(s => hadd(new THREE.SphereGeometry(1.8, 10, 8), null, s * 3.9, 2.4, 1.2).scale.set(.8, 1.3, 1)); }
      else if (hs === "centerbraid") { cap(4.7, -.5, 1.5); hadd(new THREE.TorusGeometry(4.5, 1, 8, 28, Math.PI), null, 0, 1.2, .1, 0).rotation.z = 0; [-1, 1].forEach(s => { hadd(new THREE.CylinderGeometry(.9, .8, 10, 8), null, s * 4.5, -3.8, 0); }); ["#ff4f9a", "#ffd23f", "#ff7a3d", "#58d68d", "#e8445a"].forEach((c, i) => { const a = (i / 4 - .5) * 1.9; hadd(new THREE.SphereGeometry(1.2, 8, 6), mt(c), Math.sin(a) * 4.4, 4.9 - Math.abs(a) * .5, 1.6 + Math.cos(a) * 1.2); }); }
      else if (hs === "braidcap") { hadd(new THREE.SphereGeometry(4.75, 28, 18, 0, Math.PI * 2, 0, 1.5), mt(0x161616), 0, .35, -.1, -.4); [-1, 1].forEach(s => [0, 1, 2, 3].forEach(i => hadd(new THREE.CylinderGeometry(.7, .55, 10, 6), mt(0x1a1410), s * (4.0 + i * .55), -4.2, -.2 - i * 1.1))); }
      else if (hs === "headscarf") { const sc = mt(look.scarf || look.top); hadd(new THREE.SphereGeometry(5.1, 30, 20, 0, Math.PI * 2, 0, 1.95), sc, 0, .15, -.45, -.5); hadd(new THREE.CylinderGeometry(4.3, 6.4, 8, 24, 1, true), sc, 0, -4.6, -1.0).scale.z = .9; }
      else if (hs === "turban") { const tc = mt(look.hat || "#9ea3a8"); hadd(new THREE.SphereGeometry(5.1, 26, 16, 0, Math.PI * 2, 0, 1.55), tc, 0, .9, -.2, -.42); for (let i = 0; i < 4; i++) { const t = hadd(new THREE.TorusGeometry(4.5 - i * .15, 1.1, 8, 26), tc, 0, 2.4 + i * 1.0, -.4, Math.PI / 2 - .38); t.scale.set(1, 1.1, 1); } hadd(new THREE.SphereGeometry(2.6, 12, 10), tc, 0, 6.6, -.8); }
      else if (hs === "helmet") { hadd(new THREE.SphereGeometry(4.9, 22, 16), null, 0, .8, -2.4); }
      /* extra beard volume under the chin (white beard of Fauja Singh) */
      if (look.beardVolume) hadd(new THREE.SphereGeometry(3.7, 18, 14), mt(look.beardVolume), 0, -3.9, 1.6).scale.set(1.05, 1.5, .9);
      if (cloth === "football") { const gold = mt(0xb3995d, { roughness: .35, metalness: .15 }), red = mt(0xb3112f, { roughness: .4 });
        const hm = hadd(new THREE.SphereGeometry(5.1, 28, 18, 0, Math.PI * 2, 0, 1.5), gold, 0, .6, -.6, -.3); hadd(new THREE.BoxGeometry(1.2, .5, 10), red, 0, 5.9, -.5);
        [-1, 1].forEach(s => hadd(new THREE.BoxGeometry(.5, 3.4, 2.6), gold, s * 4.7, -.9, .1)); hadd(new THREE.BoxGeometry(6.4, .35, .35), mt(0xdddddd), 0, -3.6, 4.3);
        [-1, 1].forEach(s => add(new THREE.SphereGeometry(3.1, 12, 10), top, s * 5.8, 11, 0).scale.set(1, .8, 1)); }
      /* legs on the chair */
      const shin = cloth === "runner" ? skin : bot;
      [-1, 1].forEach(s => { beamLocal(body, [s * 2.7, 1.9, 0], [s * 2.7, 1.9, 9.5], 3.4, bot); beamLocal(body, [s * 2.7, 1.9, 9.5], [s * 2.7, -6.5, 10], 3, shin); add(new THREE.BoxGeometry(3.4, 1.6, 5), mt(cloth === "football" ? 0xf2f2f2 : 0x2a2420), s * 2.7, -7.2, 11.4); });
      if (cloth === "dress" || cloth === "coat") add(new THREE.CylinderGeometry(4.6, 8.4, 9, 24, 1, true), cloth === "dress" ? top : bot, 0, 2.6, 2.8).scale.set(1, 1, 1.35);
      /* arms */
      [-1, 1].forEach(s => { beamLocal(body, [s * 5.8, 10.8, 0], [s * 5.4, 6, 8], 2.9, top); beamLocal(body, [s * 5.4, 6, 8], [s * 3.6, 8.6, 15], 2.5, top); add(new THREE.SphereGeometry(1.7, 10, 8), skin, s * 3.6, 8.6, 15.4); });
      if (cloth === "wheelchair") { [-1, 1].forEach(s => { const w = new THREE.Mesh(new THREE.TorusGeometry(9.5, .9, 8, 32), mt(0x2a2a2a)); w.position.set(s * 10.4, 5.5, -.5); w.rotation.y = Math.PI / 2; chair.add(w); const hr = new THREE.Mesh(new THREE.TorusGeometry(7.6, .35, 6, 28), mt(0xbfbfbf)); hr.position.set(s * 11.5, 5.5, -.5); hr.rotation.y = Math.PI / 2; chair.add(hr); add(new THREE.BoxGeometry(1, 1, 18), mt(0x8a8f99), s * 8.6, 1.6, 0, chair); }); }
      if (look.prop === "football") add(new THREE.SphereGeometry(3.2, 14, 10), mt(0x8b4a1c), 6.5, 10, 16.5).scale.set(1, .8, 1.35);
      if (look.prop === "book" || look.prop === "score") add(new THREE.BoxGeometry(6, 1.2, 8), mt(look.prop === "score" ? 0xf4efe0 : 0x2c5ea8), -6.5, 8, 16.5);
      if (look.prop === "flask") { add(new THREE.CylinderGeometry(2.4, 2.4, 3.4, 12), mt(0x4cc3b0, { transparent: true, opacity: .8 }), 6.5, 9.6, 16.5); add(new THREE.CylinderGeometry(.8, .8, 3, 8), mt(0x4cc3b0, { transparent: true, opacity: .8 }), 6.5, 12.6, 16.5); }
      if (look.prop === "bag") add(new THREE.BoxGeometry(5.6, 4, 2.4), mt(0x5a3a22), 7, 8.8, 15.8);
      if (look.prop === "mic") { add(new THREE.CylinderGeometry(.35, .35, 5, 8), mt(0x222222), 3.6, 11.5, 15.4); add(new THREE.SphereGeometry(1.1, 10, 8), mt(0x777777), 3.6, 14.4, 15.4); }
      const mk = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4, 4), new THREE.MeshStandardMaterial({ color: 0xffd23f, emissive: 0xffa800, emissiveIntensity: .6 })); mk.rotation.x = Math.PI; mk.position.y = 30; mk.visible = false; wrap.add(mk);
      /* player colour: a sash across the chest */
      const sash = add(new THREE.TorusGeometry(5.1, .55, 6, 24, Math.PI), mt(hex, { roughness: .35 }), 0, 1.6, 0); sash.rotation.z = Math.PI; sash.scale.set(1, .5, .8); sash.position.y = 1.0; sash.visible = cloth !== "football";
      wrap.position.y = 0; g.add(wrap); wrap.position.y = 1.5; g.userData = { body: wrap, marker: mk, baseY: 0 }; return g;
    }
    function setFigure(pid, look) {
      const s = S.seats[pid]; if (!s || !look) return; const vis = s.g.userData.marker.visible, hex = parseInt(s.color.slice(1), 16);
      root.remove(s.g); const f = avatarFigure(hex, look); f.position.set(s.x, FLOOR + 27, s.z); f.rotation.y = s.face; f.userData.marker.visible = vis;
      f.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); root.add(f); s.g = f;
    }
    function beamLocal(parent, a, b, w, material) { const m = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), 8), material); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.rotation.x = Math.PI / 2; parent.add(m); return m; }
    function seatLabel(text, sub, color) {
      const c = document.createElement("canvas"); c.width = 640; c.height = 200; const g = c.getContext("2d");
      g.fillStyle = "rgba(255,253,246,.96)"; rr(g, 10, 10, 620, 180, 60); g.fill(); g.lineWidth = 10; g.strokeStyle = color; g.stroke(); g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#3a2410";
      g.font = '900 78px "Arial Rounded MT Bold",Arial,sans-serif'; g.fillText(text, 320, sub ? 78 : 100, 590); if (sub) { g.font = '700 50px "Arial Rounded MT Bold",Arial,sans-serif'; g.fillStyle = "#7a5a3a"; g.fillText(sub, 320, 140, 590); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); s.scale.set(22, 6.9, 1); s.renderOrder = 11; return s;
    }
    function setSeats(players) {
      Object.values(S.seats).forEach(s => root.remove(s.g)); S.seats = {};
      players.forEach((pl, i) => { const hex = parseInt(MP.Engine.COLORS[pl.color].hex.slice(1), 16), f = seatFigure(hex), sp = seatSpot(i, players.length);
        f.position.set(sp.x, FLOOR + 27, sp.z); f.rotation.y = sp.face; f.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); root.add(f);
        const lab = seatLabel(pl.name, "", MP.Engine.COLORS[pl.color].hex); lab.position.set(sp.x, FLOOR + 27 + 56, sp.z); lab.userData.cid = pl.id; root.add(lab);
        S.seats[pl.id] = { g: f, lab, x: sp.x, z: sp.z, face: sp.face, color: MP.Engine.COLORS[pl.color].hex }; });
    }
    function setLabel(pid, name, sub) { const s = S.seats[pid]; if (!s) return; const n = seatLabel(name, sub, s.color); n.position.copy(s.lab.position); root.remove(s.lab); s.lab = n; root.add(n); }

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
    const ny = id => (S.board.nodes[id].y || 0);
    function setPlayers(players) {
      setSeats(players);
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
    function arrange(nodeId) { Object.values(S.pawns).filter(p => p.node === nodeId && !p.moving).forEach(p => { const s = slotPos(p, nodeId); p.mesh.position.set(s.x, .63 + ny(nodeId), s.z); }); }
    function place(positions) { Object.keys(positions).forEach(id => { S.pawns[id].node = positions[id]; }); Object.keys(positions).forEach(id => arrange(positions[id])); }
    function setActive(pid) { S.active = pid; Object.values(S.pawns).forEach(p => { const on = p.id === pid; p.mesh.userData.marker.visible = on; p.mesh.userData.ring.visible = on; const st = S.seats[p.id]; if (st) st.g.userData.marker.visible = on; }); if (S.pawns[pid] && S.mode === "follow") followPawn(pid); }
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
        p.mesh.position.y = lerp(.63 + ny(from), .63 + ny(to), t) + Math.sin(Math.PI * k) * 1.05;
        let d = target - p.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); p.mesh.userData.body.rotation.y = p.yaw + d * Math.min(1, k * 2.2);
        const sq = k < .15 ? 1 - .22 * (k / .15) : k > .85 ? 1 - .22 * ((k - .85) / .15) : 1 + .16 * Math.sin(Math.PI * k);
        p.mesh.userData.inner.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
        if (S.active === pid && S.mode === "follow") followPawn(pid);
        if (k >= 1) { p.yaw = p.yaw + d; }
      });
      p.moving = false; p.mesh.position.y = .63 + ny(to); p.mesh.userData.inner.scale.set(1, 1, 1);
      /* landing squash */
      await tween(0.16, k => { const s = 1 - .2 * Math.sin(Math.PI * k); p.mesh.userData.inner.scale.set(1 + (1 - s) * .5, s, 1 + (1 - s) * .5); });
      p.mesh.userData.inner.scale.set(1, 1, 1); arrange(to); pulse(to);
    }
    function pulse(nodeId) { const m = S.tiles[nodeId]; if (!m) return; tween(0.4, k => { m.position.y = m.userData.baseY - Math.sin(Math.PI * Math.min(1, k * 1.3)) * .16; }); }
    async function celebrate(pid) {
      const p = S.pawns[pid]; if (!p) return; S.mode = "follow"; followPawn(pid); S.cam.goalDist = 13;
      await tween(2.4, k => { p.mesh.position.y = .63 + ny(p.node) + Math.abs(Math.sin(k * Math.PI * 4)) * 1.1; p.mesh.userData.body.rotation.y += .22; const s = 1 + .08 * Math.sin(k * 30); p.mesh.userData.inner.scale.set(s, 1 / s, s); });
      p.mesh.userData.inner.scale.set(1, 1, 1); p.mesh.position.y = .63 + ny(p.node);
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
    function boardCenter() { return { x: 1, z: -.5 }; }
    function resetCamera() { S.cam.yaw = 0; S.cam.pitch = .95; setMode(S.mode, true); }
    function setMode(m, snap) {
      S.mode = m; const c = S.cam, asp = camera.aspect || 1.6;
      if (m === "overview") { const ctr = boardCenter(); c.gtx = ctr.x; c.gtz = ctr.z; c.goalDist = (asp < 1 ? 160 : asp < 1.5 ? 135 : 118); c.pitch = Math.max(c.pitch, 1.0); }
      else { c.goalDist = asp < 1 ? 28 : 22; if (S.active != null) followPawn(S.active); else { const s = S.board && S.board.nodes[S.board.start]; if (s) { c.gtx = s.x; c.gtz = s.z; } } }
      if (snap) { c.tx = c.gtx; c.tz = c.gtz; c.dist = c.goalDist; }
    }
    function updateCamera(dt) {
      const c = S.cam, k = 1 - Math.pow(.0015, dt);
      c.gtx = Math.max(-40, Math.min(44, c.gtx)); c.gtz = Math.max(-28, Math.min(28, c.gtz)); c.goalDist = Math.min(S.maxDist || 150, c.goalDist);
      c.tx = lerp(c.tx, c.gtx, k); c.tz = lerp(c.tz, c.gtz, k); c.dist = lerp(c.dist, c.goalDist, k);
      const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
      camera.position.set(c.tx + Math.sin(c.yaw) * cp * c.dist, sp * c.dist, c.tz + Math.cos(c.yaw) * cp * c.dist);
      camera.lookAt(c.tx, 0.2, c.tz);
      if (S.peekSeat != null && S.seats[S.peekSeat]) { const st = S.seats[S.peekSeat]; camera.position.set(st.x + Math.sin(st.face) * 70 + 6, FLOOR + 90, st.z + Math.cos(st.face) * 70); camera.lookAt(st.x, FLOOR + 52, st.z); }
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
        else { S.cam.yaw = drag.yaw - dx * .006; S.cam.pitch = Math.min(1.4, Math.max(.5, drag.pitch + dy * .005)); }
      } else if (S.fork) { const id = pickAt(e); S.hover = S.fork.ids.includes(id) ? id : -1; canvas.style.cursor = S.hover >= 0 ? "pointer" : "grab"; }
    });
    canvas.addEventListener("pointerup", e => { const was = drag; drag = null; canvas.style.cursor = S.hover >= 0 ? "pointer" : "grab"; if (was && !was.moved && S.fork) { const id = pickAt(e); if (S.fork.ids.includes(id)) { const cb = S.fork.cb; clearFork(); cb(id); } } });
    canvas.addEventListener("contextmenu", e => e.preventDefault());
    canvas.addEventListener("wheel", e => { e.preventDefault(); S.cam.goalDist = Math.min(S.maxDist || 150, Math.max(9, S.cam.goalDist * (1 + Math.sign(e.deltaY) * .1))); }, { passive: false });

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
      Object.values(S.seats || {}).forEach((st, i) => { const on = st.g.userData.marker.visible; st.g.userData.body.position.y = on ? Math.abs(Math.sin(T * 3)) * 1.2 : Math.sin(T * 1.5 + i) * .25; if (on) st.g.userData.marker.rotation.y = T * 2; });
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
      build, setPlayers, setLabel, setFigure, place, move, setActive, celebrate, pulse, showFork, clearFork, hoverFork, resize, start, stop,
      mode: m => { setMode(m); }, get currentMode() { return S.mode; },
      peek: pid => { S.peekSeat = pid == null ? null : pid; },
      focus: id => { const n = S.board.nodes[id]; S.cam.gtx = n.x; S.cam.gtz = n.z; },
      setSpeed: v => { S.speed = v; }, setShift: px => { S.shift = px; },
      snap: (n) => { for (let i = 0; i < (n || 1); i++) frame(0.05); }, state: S, renderer, camera
    };
  };
})(window);
