/* Realistic 3D wheel of fortune (also used, smaller, as the move spinner). */
GOL.Wheel = function (cv, entries, opt = {}) {
  const T = GFX.T, N = entries.length, seg = Math.PI * 2 / N, R = 3, compact = !!opt.compact, simple = !!opt.simple;
  const renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, preserveAspectRatio: true });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new T.Scene(); scene.environment = GFX.env(renderer); scene.environmentIntensity = .35;
  const cam = new T.PerspectiveCamera(32, 1, .1, 100); cam.position.set(0, compact ? .6 : .9, compact ? 14.5 : 15.5); cam.lookAt(0, compact ? .1 : .3, 0);
  scene.add(new T.HemisphereLight(0xfff4e0, 0x6a4a2a, .3));
  const sun = new T.DirectionalLight(0xffffff, 1.9); sun.position.set(-2, 12, 9); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 }); sun.shadow.bias = -.0004; scene.add(sun);
  const fill = new T.PointLight(0xffd9a0, 18, 30); fill.position.set(5, 2, 9); scene.add(fill);

  /* face texture */
  const S = 2048, fc = GFX.canvas(S, S), fx = fc.getContext("2d"), faceTex = GFX.tex(fc), imgs = {};
  function drawFace() {
    const c = S / 2; fx.clearRect(0, 0, S, S);
    for (let i = 0; i < N; i++) {
      const e = entries[i], a0 = -(i + .5) * seg, a1 = -(i - .5) * seg;
      fx.beginPath(); fx.moveTo(c, c); fx.arc(c, c, c - 4, a0, a1); fx.closePath();
      const g = fx.createRadialGradient(c, c, 60, c, c, c); g.addColorStop(0, e.color); g.addColorStop(.62, e.color); g.addColorStop(1, e.dark || e.color);
      fx.fillStyle = g; fx.fill(); fx.lineWidth = 5; fx.strokeStyle = "rgba(255,255,255,.85)"; fx.stroke();
      fx.save(); fx.translate(c, c); fx.rotate(-i * seg);
      fx.fillStyle = e.text || "#fff"; fx.textAlign = "right"; fx.textBaseline = "middle";
      if (opt.portraits) {
        { let fs = 84; do { fx.font = '800 ' + fs + 'px "Arial Rounded MT Bold","Avenir Next",Trebuchet MS,sans-serif'; fs -= 4; } while (fs > 40 && fx.measureText(e.label).width > 420); } fx.shadowColor = "rgba(0,0,0,.35)"; fx.shadowBlur = 6;
        fx.lineWidth = 12; fx.strokeStyle = "rgba(40,20,0,.75)"; fx.lineJoin = "round"; fx.strokeText(e.label, c - 350, 0, 430); fx.fillText(e.label, c - 350, 0, 430); fx.shadowBlur = 0;
        const px = c - 215, pr = 135; fx.save(); fx.beginPath(); fx.arc(px, 0, pr, 0, 7); fx.closePath(); fx.fillStyle = "#fff"; fx.fill(); fx.clip();
        if (imgs[i]) fx.drawImage(imgs[i], px - pr, -pr, pr * 2, pr * 2); else { fx.fillStyle = "#fff6"; fx.fillRect(px - pr, -pr, pr * 2, pr * 2); }
        fx.restore(); fx.beginPath(); fx.arc(px, 0, pr, 0, 7); fx.lineWidth = 10; fx.strokeStyle = "#fff"; fx.stroke();
      } else {
        fx.rotate(Math.PI / 2); fx.textAlign = "center"; fx.font = '900 400px "Arial Rounded MT Bold","Avenir Next",Trebuchet MS,sans-serif'; fx.shadowColor = "rgba(0,0,0,.35)"; fx.shadowBlur = 20; fx.fillText(e.label, 14, -(c - 520)); fx.shadowBlur = 0;
      }
      fx.restore();
    }
    faceTex.needsUpdate = true;
  }
  drawFace();
  entries.forEach((e, i) => { if (e.img) GFX.loadImage(e.img, im => { if (im) { imgs[i] = im; drawFace(); } }); else if (e.svg) GFX.svgImage(e.svg, im => { imgs[i] = im; drawFace(); }); });

  /* materials */
  const gold = new T.MeshPhysicalMaterial(simple ? { color: 0xa89c8a, metalness: .25, roughness: .5, envMapIntensity: .5 } : { color: 0xd9951a, metalness: 1, roughness: .28, clearcoat: .4, envMapIntensity: 1.1 });
  const wood = new T.MeshStandardMaterial({ color: simple ? 0x6b5a4a : 0x7a3f1a, roughness: .5, metalness: .05 });
  const red = new T.MeshPhysicalMaterial({ color: 0xe11d48, roughness: .25, clearcoat: 1, metalness: .1 });
  const group = new T.Group(); scene.add(group); group.position.y = 1.35; group.rotation.x = -.06;
  const wheel = new T.Group(); group.add(wheel);
  const face = new T.Mesh(new T.CircleGeometry(R, 128), new T.MeshPhysicalMaterial({ map: faceTex, roughness: .55, clearcoat: .25, clearcoatRoughness: .3, metalness: 0, envMapIntensity: .1, color: 0xdddddd })); face.position.z = .26; face.receiveShadow = true; wheel.add(face);
  const body = new T.Mesh(new T.CylinderGeometry(R + .05, R + .05, .5, 96), wood); body.rotation.x = Math.PI / 2; body.castShadow = true; wheel.add(body);
  const rim = new T.Mesh(new T.TorusGeometry(R + .18, .3, 24, 128), gold); rim.position.z = .2; rim.castShadow = true; wheel.add(rim);
  const rimIn = new T.Mesh(new T.TorusGeometry(R - .02, .06, 12, 128), gold); rimIn.position.z = .3; wheel.add(rimIn);
  const glass = new T.Mesh(new T.CircleGeometry(R - .02, 96), new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .1, roughness: 0, metalness: 0, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 3, depthWrite: false })); glass.position.z = .62; glass.visible = !simple; wheel.add(glass);
  /* pegs */
  const pegGeo = new T.CylinderGeometry(.055, .07, .34, 12), pegs = new T.Group(); wheel.add(pegs);
  for (let i = 0; i < N; i++) { const a = (i + .5) * seg, p = new T.Mesh(pegGeo, gold); p.rotation.x = Math.PI / 2; p.position.set(Math.cos(a) * (R - .12), Math.sin(a) * (R - .12), .42); pegs.add(p); const ball = new T.Mesh(new T.SphereGeometry(.09, 12, 8), gold); ball.position.copy(p.position); ball.position.z += .17; pegs.add(ball); }
  for (let i = 0; i < N; i++) { const a = (i + .5) * seg, d = new T.Mesh(new T.BoxGeometry(R - .75, .07, .16), gold); d.position.set(Math.cos(a) * (R + .6) / 2, Math.sin(a) * (R + .6) / 2, .31); d.rotation.z = a; wheel.add(d); }
  /* hub */
  const hub = new T.Mesh(new T.SphereGeometry(.55, 32, 16), gold); hub.scale.z = .6; hub.position.z = .45; hub.castShadow = true; wheel.add(hub);
  const cap = new T.Mesh(new T.SphereGeometry(.24, 24, 12), red); cap.scale.z = .7; cap.position.z = .74; wheel.add(cap);
  /* light bulbs on outer rim (fixed, not rotating) */
  const bulbs = [], NB = simple ? 0 : compact ? 24 : 36, bulbGeo = new T.SphereGeometry(.12, 14, 10);
  for (let i = 0; i < NB; i++) { const a = i / NB * Math.PI * 2, m = new T.MeshStandardMaterial({ color: 0xfff1b8, emissive: 0xffb300, emissiveIntensity: 1.2, roughness: .2 }); const b = new T.Mesh(bulbGeo, m);
    b.position.set(Math.cos(a) * (R + .18), Math.sin(a) * (R + .18), .52); group.add(b); bulbs.push(m); }
  /* pointer flapper (fixed at the top, deflected by the pegs) */
  const flapPivot = new T.Group(); flapPivot.position.set(0, R + .35, .75); group.add(flapPivot);
  const shp = new T.Shape(); shp.moveTo(-.2, 0); shp.lineTo(.2, 0); shp.lineTo(.07, -.95); shp.lineTo(-.07, -.95); shp.closePath();
  const flap = new T.Mesh(new T.ExtrudeGeometry(shp, { depth: .12, bevelEnabled: true, bevelSize: .03, bevelThickness: .03, bevelSegments: 3 }), red); flap.castShadow = true; flapPivot.add(flap);
  const pivBall = new T.Mesh(new T.SphereGeometry(.2, 20, 12), gold); pivBall.position.z = .08; flapPivot.add(pivBall);
  if (!compact && !simple) { const hc = GFX.canvas(256, 256), hg = hc.getContext("2d"), gr = hg.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, "rgba(255,240,170,.9)"); gr.addColorStop(.5, "rgba(255,200,90,.35)"); gr.addColorStop(1, "rgba(255,200,90,0)"); hg.fillStyle = gr; hg.fillRect(0, 0, 256, 256);
    const halo = new T.Sprite(new T.SpriteMaterial({ map: GFX.tex(hc), transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .4 })); halo.scale.set(10, 10, 1); halo.position.set(0, 1.35, -1.2); scene.add(halo); }
  /* stand */
  const stand = new T.Group(); scene.add(stand);
  const legGeo = new T.BoxGeometry(.75, 3.4, .6);
  [[-1, .3], [1, -.3]].forEach(([s, ang]) => { const l = new T.Mesh(legGeo, wood); l.position.set(s * 1.5, -1.3, -.3); l.rotation.z = s * -.32; l.castShadow = true; stand.add(l); const col = new T.Mesh(new T.CylinderGeometry(.5, .5, .16, 20), gold); col.position.set(s * 1.1, -.05, -.3); col.rotation.z = Math.PI / 2; stand.add(col); });
  const baseM = new T.Mesh(new T.BoxGeometry(5.6, .5, 2.4), wood); baseM.position.set(0, -3.0, -.3); baseM.castShadow = true; baseM.receiveShadow = true; stand.add(baseM);
  const trim = new T.Mesh(new T.BoxGeometry(5.62, .14, .04), gold); trim.position.set(0, -2.95, .92); stand.add(trim); [-2.5, 2.5].forEach(x => { const f = new T.Mesh(new T.SphereGeometry(.22, 16, 10), gold); f.position.set(x, -3.2, .7); stand.add(f); });
  const floor = new T.Mesh(new T.PlaneGeometry(40, 40), new T.ShadowMaterial({ opacity: .28 })); floor.rotation.x = -Math.PI / 2; floor.position.y = -3.25; floor.receiveShadow = true; scene.add(floor);
  if (compact) { stand.visible = false; floor.visible = false; group.position.y = .2; }

  /* state */
  let rot = Math.PI / 2 - 0 * seg, flapA = 0, flapV = 0, last = -1, spinning = false, tAnim = null, running = false, raf = 0, clock = performance.now();
  wheel.rotation.z = rot;
  const idxAt = r => ((Math.floor((Math.PI / 2 - r) / seg + .5) % N) + N) % N;
  const api = {
    onTick: null, canvas: cv, renderer,
    spin(winner, ms = 6500) {
      return new Promise(res => {
        const jitter = (Math.random() - .5) * seg * .7, base = Math.PI / 2 - winner * seg - jitter;
        const turns = 5 + Math.floor(Math.random() * 3); let fin = base; while (fin > rot - turns * Math.PI * 2) fin -= Math.PI * 2;
        tAnim = { from: rot, to: fin, t0: performance.now(), ms, res }; spinning = true;
      });
    },
    skip() { if (tAnim) tAnim.t0 = performance.now() - tAnim.ms; },
    get spinning() { return spinning; }, winnerIndex: () => idxAt(rot),
    start() { if (running) return; running = true; clock = performance.now(); loop(); }, stop() { running = false; cancelAnimationFrame(raf); },
    resize() { const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w / h < .9 ? 46 : 36; cam.updateProjectionMatrix(); },
    renderOnce() { api.resize(); renderer.render(scene, cam); },
    dispose() { api.stop(); renderer.dispose(); }
  };
  function loop() {
    if (!running) return; raf = requestAnimationFrame(loop);
    const now = performance.now(), dt = Math.min(.05, (now - clock) / 1000); clock = now;
    if (tAnim) {
      const k = Math.min(1, (now - tAnim.t0) / tAnim.ms), e = 1 - Math.pow(1 - k, 4);
      rot = tAnim.from + (tAnim.to - tAnim.from) * e; wheel.rotation.z = rot;
      if (k >= 1) { spinning = false; const r = tAnim.res; tAnim = null; r(idxAt(rot)); }
    }
    const cur = Math.floor((Math.PI / 2 - rot) / seg + .5);
    if (last !== cur) { if (last !== -1 && tAnim) { flapV = -9 - Math.min(8, Math.abs(rot - (api._pr || rot)) * 90); if (api.onTick) api.onTick(); } last = cur; }
    api._pr = rot;
    flapV += (-90 * flapA - 7 * flapV) * dt; flapA += flapV * dt; flapA = Math.max(-.7, Math.min(.25, flapA)); flapPivot.rotation.z = flapA;
    const t = now / 1000;
    bulbs.forEach((m, i) => { const on = spinning ? ((Math.floor(t * 14) + i) % 3 === 0) : (Math.sin(t * 2.2 + i * .7) > -.2); m.emissiveIntensity = on ? 2.2 : .25; m.color.setHex(on ? 0xfff6c9 : 0x8a7a4a); });
    if (!spinning && !tAnim && !compact) group.rotation.y = Math.sin(t * .5) * .12; else if (!compact) group.rotation.y *= .9;
    if (!spinning && Math.abs(flapV) + Math.abs(flapA) < .03 && now - (api._lr || 0) < (compact ? 500 : 40)) return;
    api._lr = now; renderer.render(scene, cam);
  }
  api.resize(); window.addEventListener("resize", api.resize);
  return api;
};
