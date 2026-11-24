/* Multiplayer board v2: ~100 fields, 6 forks (each fork 3 routes of different kinds) between 12 life stations.
   Pure data + layout (no THREE here, so it can be unit-tested in Node).
   Node: { id, x, y, z, type, zone, chain, sec, k, n, next:[ids], prev:[ids], life? }
   Field types: who | fact | tf | words | task | story | fwd | back | again | gate | life | start | finish
   Zones (kind of stretch): stairs ladder rope bridge ramp market tunnel office sprint quiet (null on the main road)
   The main road is the same for everybody. The figure you play decides which routes are slow, fast or blocked (see profiles). */
(function (root) {
  const MP = root.MP = root.MP || {};

  /* Fixed legend: every route kind means the same area of life for EVERY figure. A figure is only slowed, sped up or
     blocked on a route if that figure's documented life shows it (see data/profiles/<id>.json: evidence + zones[].ev). */
  const ZONES = {
    stairs: { label: "Stairway", icon: "🪜", color: "#c9a66b", hint: "Buildings and transport: can you get in?", domain: "Physical access: buildings, transport, mobility" },
    ladder: { label: "Tree ladders", icon: "🌳", color: "#8b5a2b", hint: "Schools and training: the way up", domain: "Education and training" },
    rope: { label: "Rope bridge", icon: "🪢", color: "#b8864b", hint: "A shaky way: threats and violence", domain: "Safety: threats, harassment, violence" },
    bridge: { label: "Stone bridge", icon: "🌉", color: "#9aa7b8", hint: "Allies, family, community and mentors", domain: "Support: allies, family, community, mentors" },
    ramp: { label: "Long ramp", icon: "↗", color: "#7fb069", hint: "Adapted ways: aids and accessible design", domain: "Aids and accessible design" },
    market: { label: "Busy market", icon: "🎪", color: "#ef476f", hint: "Work, money and the public eye", domain: "Work, money, media and public life" },
    tunnel: { label: "Dark tunnel", icon: "🕳", color: "#4b4f66", hint: "Isolation and communication barriers", domain: "Isolation, silence and communication barriers" },
    office: { label: "Town hall", icon: "🏛", color: "#6c7ae0", hint: "Laws, papers and authorities", domain: "Laws, papers, courts and authorities" },
    sprint: { label: "Race track", icon: "🏁", color: "#e76f51", hint: "Sport, stamina and competition", domain: "Sport, stamina and competition" },
    quiet: { label: "Quiet lane", icon: "🌳", color: "#3aa17e", hint: "Calm and focus: study, craft, think", domain: "Calm and focus: study, craft, creative work" }
  };


  /* ---- layout ----------------------------------------------------------------------------------------------- */
  /* Junctions: [x, z]. "a" = fork (split), "b" = where the routes meet again. Every junction is a life station. */
  const J = {
    S: [-31, 17.5],
    "1a": [-28.5, 8.5], "1b": [-28.5, -5],
    "2a": [-21, -16.5], "2b": [-6, -16.5],
    "3a": [2.5, -16.5], "3b": [17, -16.5],
    "4a": [27, -10], "4b": [30.5, 4],
    "5a": [25, 14], "5b": [9, 15],
    "6a": [-3, 15], "6b": [-9.5, 3.5],
    F: [1, 1]
  };
  /* Main road between the forks. */
  const TRUNKS = [
    { id: "r0", from: "S", to: "1a", n: 2, bulge: 2.5 },
    { id: "r1", from: "1b", to: "2a", n: 2, bulge: -2 },
    { id: "r2", from: "2b", to: "3a", n: 1, bulge: 0 },
    { id: "r3", from: "3b", to: "4a", n: 2, bulge: 1 },
    { id: "r4", from: "4b", to: "5a", n: 1, bulge: -1.5 },
    { id: "r5", from: "5b", to: "6a", n: 2, bulge: 1.5 },
    { id: "r6", from: "6b", to: "F", n: 3, bulge: 3, wave: 2 }
  ];
  /* Forks: three routes each. bulge = sideways curve (positive = right of travel direction), wave = S-curve. n = fields. */
  const SECTIONS = [
    { id: "s1", from: "1a", to: "1b", routes: [
      { zone: "stairs", n: 3, bulge: 0 }, { zone: "market", n: 4, bulge: -5.5 }, { zone: "ramp", n: 5, bulge: -11.5 }] },
    { id: "s2", from: "2a", to: "2b", routes: [
      { zone: "ladder", n: 3, bulge: 0 }, { zone: "tunnel", n: 4, bulge: 5.5 }, { zone: "bridge", n: 5, bulge: -6.5 }] },
    { id: "s3", from: "3a", to: "3b", routes: [
      { zone: "rope", n: 4, bulge: 0 }, { zone: "quiet", n: 4, bulge: 5.5 }, { zone: "ramp", n: 5, bulge: -7.5 }] },
    { id: "s4", from: "4a", to: "4b", routes: [
      { zone: "stairs", n: 3, bulge: 0 }, { zone: "sprint", n: 4, bulge: -5.5 }, { zone: "bridge", n: 5, bulge: 8 }] },
    { id: "s5", from: "5a", to: "5b", routes: [
      { zone: "ladder", n: 3, bulge: 0 }, { zone: "office", n: 4, bulge: -5.5 }, { zone: "quiet", n: 6, bulge: 8 }] },
    { id: "s6", from: "6a", to: "6b", routes: [
      { zone: "rope", n: 3, bulge: 0 }, { zone: "market", n: 4, bulge: 5.5 }, { zone: "ramp", n: 5, bulge: -7.5 }] }
  ];
  /* Field recipes per route kind. "q" = a question (who/fact/tf/words, rotated); "fwd2" = move 2 extra; "back3" = move 3 back. */
  const RECIPE = {
    stairs: ["q", "gate", "back2", "q", "q"],
    ladder: ["gate", "q", "back3", "q"],
    rope: ["q", "back2", "gate", "q"],
    sprint: ["task", "fwd2", "q", "task", "fwd3"],
    tunnel: ["who", "tf", "again", "q"],
    market: ["words", "task", "tf", "fwd2", "words"],
    office: ["gate", "fact", "gate", "words"],
    quiet: ["who", "story", "tf", "again", "fact", "fwd2"],
    bridge: ["fact", "story", "fwd2", "tf", "words", "fwd3"],
    ramp: ["tf", "story", "fwd2", "words", "fact", "fwd2"]
  };
  const ROAD = ["q", "story", "q", "task", "q", "q", "words", "q"];   // main road fields
  const ELEV = {                                                   // height profile along a route (t from 0 to 1)
    stairs: t => 2.4 * Math.sin(Math.PI * t), ladder: t => 3.4 * Math.min(1, t * 5, (1 - t) * 5), rope: t => .9 - .55 * Math.sin(Math.PI * t),
    bridge: t => 1.3 * Math.pow(Math.sin(Math.PI * t), .7), ramp: t => 1.0 * Math.sin(Math.PI * t)
  };
  const QCYCLE = ["fact", "tf", "who", "words", "tf", "fact", "words", "who"];

  /* Smooth polyline (Chaikin). */
  function chaikin(pts, passes) {
    for (let p = 0; p < passes; p++) {
      const o = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]); }
      o.push(pts[pts.length - 1]); pts = o;
    }
    return pts;
  }
  /* Sideways curved line from a to b. */
  function curve(a, b, bulge, wave) {
    const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz) || 1, px = dz / len, pz = -dx / len, pts = [];
    const N = 8;
    for (let i = 0; i <= N; i++) { const t = i / N, off = (bulge || 0) * Math.sin(Math.PI * t) + (wave || 0) * Math.sin(2 * Math.PI * t); pts.push([a[0] + dx * t + px * off, a[1] + dz * t + pz * off]); }
    return pts;
  }
  /* `count` points evenly spaced along the polyline (both ends excluded) + their t in 0..1 */
  function sample(pts, count) {
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    const out = [];
    for (let k = 1; k <= count; k++) {
      let want = total * k / (count + 1), i = 0;
      while (i < seg.length - 1 && want > seg[i]) { want -= seg[i]; i++; }
      const t = want / seg[i]; out.push({ x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, z: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t, t: k / (count + 1) });
    }
    return { pts: out, total };
  }

  function build() {
    const nodes = [], by = {}; let qi = 0;
    const add = n => { n.id = nodes.length; n.next = []; n.prev = []; n.y = n.y || 0; nodes.push(n); return n; };
    const q = () => QCYCLE[qi++ % QCYCLE.length];
    const parse = spec => { if (spec === "q") return { type: q() }; const m = /^(fwd|back)(\d)$/.exec(spec); if (m) return { type: m[1], n: +m[2] }; return { type: spec }; };
    /* junction nodes */
    add({ x: J.S[0], z: J.S[1], type: "start", key: "S" }); by.S = 0;
    let lifeNo = 0;
    SECTIONS.forEach(s => { ["from", "to"].forEach(w => { const key = s[w]; if (by[key] != null) return; add({ x: J[key][0], z: J[key][1], type: "life", key, life: ++lifeNo }); by[key] = nodes.length - 1; }); });
    add({ x: J.F[0], z: J.F[1], type: "finish", key: "F" }); by.F = nodes.length - 1;
    /* life numbers must follow the order of the road: 1a,1b,2a,2b,... (added in that order above) */
    const chains = {}, sections = [], link = (ids) => { for (let i = 0; i < ids.length - 1; i++) { nodes[ids[i]].next.push(ids[i + 1]); nodes[ids[i + 1]].prev.push(ids[i]); } };
    TRUNKS.forEach((c, ci) => {
      const a = nodes[by[c.from]], b = nodes[by[c.to]], poly = chaikin(curve([a.x, a.z], [b.x, b.z], c.bulge, c.wave), 1), s = sample(poly, c.n), ids = [];
      s.pts.forEach((p, k) => { const sp = parse(ROAD[(ci * 3 + k) % ROAD.length]); const n = add(Object.assign({ x: p.x, z: p.z, chain: c.id, zone: null, k }, sp)); ids.push(n.id); });
      link([a.id].concat(ids, [b.id])); chains[c.id] = { ids, from: a.id, to: b.id, zone: null, length: s.total };
    });
    SECTIONS.forEach((s, si) => {
      const a = nodes[by[s.from]], b = nodes[by[s.to]], sec = { id: s.id, split: a.id, merge: b.id, routes: [] };
      s.routes.forEach((r, ri) => {
        const poly = chaikin(curve([a.x, a.z], [b.x, b.z], r.bulge, r.wave), 1), sm = sample(poly, r.n), ids = [], rec = RECIPE[r.zone];
        sm.pts.forEach((p, k) => {
          let spec = rec[k % rec.length]; if (k >= rec.length) spec = "q";
          const sp = parse(spec), el = ELEV[r.zone] ? ELEV[r.zone](p.t) : 0;
          const n = add(Object.assign({ x: p.x, z: p.z, y: el, chain: s.id + r.zone, zone: r.zone, sec: si, k }, sp)); ids.push(n.id);
        });
        const id = s.id + r.zone; link([a.id].concat(ids, [b.id]));
        chains[id] = { ids, from: a.id, to: b.id, zone: r.zone, length: sm.total, sec: si };
        sec.routes.push({ id, zone: r.zone, ids, first: ids[0], last: ids[ids.length - 1] });
      });
      sections.push(sec);
    });
    /* nodes on the road next to a section edge get their elevation from the first/last route node: keep road flat */
    const life = nodes.filter(n => n.type === "life").sort((x, y) => x.life - y.life).map(n => n.id);
    return { nodes, start: by.S, finish: by.F, chains, sections, junctions: by, life, width: 76, height: 48 };
  }

  /* Cost of a node in "steps" for a figure: zone effects from its profile. fast = .75, slow = 1.5, normal = 1. */
  const COST = { fast: .75, slow: 1.5 };
  function cost() { return 1; }   // every field is exactly one step
  const blocked = (zone, zfx) => !!(zone && zfx && zfx[zone] && zfx[zone].fx === "block");

  /* Shortest / longest number of fields from a node to the finish (for UI and tests). zfx = effects of a figure (optional) */
  function distances(b, zfx) {
    const memoMin = {}, memoMax = {};
    const edge = (from, to) => cost(b.nodes[to], zfx);
    const ok = (from, to) => !(b.nodes[from].type === "life" && b.nodes[to].zone && blocked(b.nodes[to].zone, zfx));
    const min = id => { if (id === b.finish) return 0; if (memoMin[id] != null) return memoMin[id]; const o = b.nodes[id].next.filter(n => ok(id, n)); return memoMin[id] = Math.min.apply(null, o.map(n => edge(id, n) + min(n))); };
    const max = id => { if (id === b.finish) return 0; if (memoMax[id] != null) return memoMax[id]; const o = b.nodes[id].next.filter(n => ok(id, n)); return memoMax[id] = Math.max.apply(null, o.map(n => edge(id, n) + max(n))); };
    return { min: min(b.start), max: max(b.start), minOf: min, maxOf: max };
  }

  MP.Board = { build, distances, cost, blocked, ZONES, SECTIONS, TRUNKS, JUNCTIONS: J, RECIPE };
  if (typeof module !== "undefined") module.exports = MP.Board;
})(typeof window !== "undefined" ? window : global);
