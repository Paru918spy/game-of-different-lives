/* Small shared helpers for the 3D parts (Three.js is bundled in vendor/three.min.js). */
window.GFX = (function () {
  const T = window.THREE;
  function rng(seed) { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    let a = h >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function canvas(w, h) { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function tex(c, srgb = true, rep) { const t = new T.CanvasTexture(c); if (srgb) t.colorSpace = T.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  /* Soft studio environment so metals and glossy paint reflect something nice. */
  function env(renderer) {
    const s = new T.Scene(), c = canvas(512, 256), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#9fd6ff"); gr.addColorStop(.5, "#fff3dc"); gr.addColorStop(1, "#c9a36b"); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
    s.add(new T.Mesh(new T.SphereGeometry(50, 32, 16), new T.MeshBasicMaterial({ map: tex(c), side: T.BackSide })));
    [[20, 25, 10, 0xffffff, 18], [-25, 18, 15, 0xfff2cc, 12], [0, 12, -30, 0xffd9a0, 14]].forEach(a => { const m = new T.Mesh(new T.PlaneGeometry(a[4], a[4] * .6), new T.MeshBasicMaterial({ color: a[3], side: T.DoubleSide })); m.position.set(a[0], a[1], a[2]); m.lookAt(0, 0, 0); s.add(m); });
    const p = new T.PMREMGenerator(renderer), rt = p.fromScene(s, .02); p.dispose(); return rt.texture;
  }
  /* Easy camera-facing label sprite. */
  function label(text, o = {}) {
    const c = canvas(512, 128), g = c.getContext("2d"); g.font = `800 ${o.size || 52}px "Arial Rounded MT Bold","Avenir Next",Trebuchet MS,sans-serif`; g.textAlign = "center"; g.textBaseline = "middle";
    const w = Math.min(500, g.measureText(text).width + 50); g.fillStyle = o.bg || "rgba(255,255,255,.92)"; rr(g, 256 - w / 2, 14, w, 100, 50); g.fill(); g.lineWidth = 6; g.strokeStyle = o.stroke || "#e8a33d"; g.stroke();
    g.fillStyle = o.color || "#3a2410"; g.fillText(text, 256, 66);
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex(c), transparent: true, depthTest: false })); sp.scale.set(o.w || 4, (o.w || 4) / 4, 1); sp.renderOrder = 20; return sp;
  }
  function svgImage(svg, cb) { const i = new Image(); i.onload = () => cb(i); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); return i; }
  function loadImage(src, cb) { const i = new Image(); i.onload = () => cb(i); i.onerror = () => cb(null); i.src = src; }
  return { T, rng, canvas, tex, rr, env, label, svgImage, loadImage };
})();
