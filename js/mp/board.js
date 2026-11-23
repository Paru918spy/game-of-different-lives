/* Multiplayer board: a graph of 70 fields with several forks.
   Pure data + layout (no THREE here, so it can be unit-tested in Node).
   Each node: { id, x, z, type, next:[ids], prev:[ids], chain, label? }
   Field types: who | fact | tf | words | task | story | bridge | start | finish */
(function (root) {
  const MP = root.MP = root.MP || {};

  /* Chains are polylines between two junctions with n fields in between. */
  const J = { S: [-22, -9], J1: [-13, -9], J2: [-1.5, -9], J3: [7.5, -9], J4: [20, -9], J5: [21, 4], J6: [11, 4], F: [-10, 7] };
  const CHAINS = [
    { id: "c1", from: "S", to: "J1", n: 3, via: [], theme: "start" },
    { id: "n1", from: "J1", to: "J2", n: 6, via: [[-11, -13.5], [-7, -15], [-3.5, -13.5]], theme: "north" },
    { id: "m1", from: "J1", to: "J2", n: 4, via: [], theme: "short" },
    { id: "s1", from: "J1", to: "J2", n: 6, via: [[-11, -4.5], [-7, -3], [-3.5, -4.5]], theme: "south" },
    { id: "c2", from: "J2", to: "J3", n: 3, via: [], theme: "road" },
    { id: "n2", from: "J3", to: "J4", n: 6, via: [[10, -13.5], [14, -15], [17.5, -13.5]], theme: "north" },
    { id: "s2", from: "J3", to: "J4", n: 6, via: [[10, -4.5], [14, -3], [17.5, -4.5]], theme: "south" },
    { id: "c3", from: "J4", to: "J5", n: 8, via: [[25, -9], [28.5, -6], [28.5, -0.5], [25.5, 4]], theme: "road" },
    { id: "n3", from: "J5", to: "J6", n: 4, via: [[18, 0.2], [14, 0.2]], theme: "north" },
    { id: "m3", from: "J5", to: "J6", n: 3, via: [], theme: "short" },
    { id: "s3", from: "J5", to: "J6", n: 4, via: [[18, 7.8], [14, 7.8]], theme: "south" },
    { id: "c4", from: "J6", to: "F", n: 8, via: [[3, 4], [-4, 6.2]], theme: "road" }
  ];
  /* Which chain gets a bridge (reward) field, and where (index inside the chain, 0-based). */
  const BRIDGES = { n1: 3, s1: 2, n2: 2, s2: 3, n3: 1, s3: 2, c3: 4, c4: 3 };
  /* Category rhythm, rotated per chain so neighbouring branches differ. */
  const RHYTHM = ["who", "tf", "fact", "words", "tf", "fact", "task", "who", "fact", "tf", "words", "fact"];
  const BRANCH_NAME = { north: "Sunny Trail", south: "River Trail", short: "Short Cut" };

  function polylineSample(pts, count) {
    /* Returns `count` points evenly spaced along the polyline, excluding both ends. */
    const seg = []; let total = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
    const out = [];
    for (let k = 1; k <= count; k++) {
      let want = total * k / (count + 1), i = 0;
      while (i < seg.length - 1 && want > seg[i]) { want -= seg[i]; i++; }
      const t = want / seg[i];
      out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]);
    }
    return { pts: out, total };
  }

  /* Smooth the polyline slightly so curves look round (Chaikin, 2 passes). */
  function chaikin(pts, passes) {
    for (let p = 0; p < passes; p++) {
      const o = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1];
        o.push([a[0] * .75 + b[0] * .25, a[1] * .75 + b[1] * .25], [a[0] * .25 + b[0] * .75, a[1] * .25 + b[1] * .75]);
      }
      o.push(pts[pts.length - 1]); pts = o;
    }
    return pts;
  }

  function build() {
    const nodes = [], byKey = {};
    const add = (n) => { n.id = nodes.length; n.next = []; n.prev = []; nodes.push(n); return n; };
    const junc = (key, type, extra) => { const n = add(Object.assign({ x: J[key][0], z: J[key][1], type, junction: key }, extra)); byKey[key] = n.id; return n; };
    junc("S", "start", { label: "Start" });
    junc("J1", "story"); junc("J2", "story"); junc("J3", "story"); junc("J4", "story"); junc("J5", "story"); junc("J6", "story");
    junc("F", "finish", { label: "Finish" });
    const chainInfo = {};
    CHAINS.forEach((c, ci) => {
      const a = nodes[byKey[c.from]], b = nodes[byKey[c.to]];
      const poly = chaikin([[a.x, a.z]].concat(c.via, [[b.x, b.z]]), c.via.length ? 2 : 0);
      const s = polylineSample(poly, c.n);
      const ids = [];
      s.pts.forEach((p, k) => {
        let type = RHYTHM[(ci * 5 + k) % RHYTHM.length];
        if (c.theme === "short") type = (k % 2 === 0) ? "task" : (k === 1 ? "tf" : "who");   // the short cut is full of tasks
        if (BRIDGES[c.id] === k) type = "bridge";
        const n = add({ x: p[0], z: p[1], type, chain: c.id, theme: c.theme, k });
        ids.push(n.id);
      });
      const full = [a.id].concat(ids, [b.id]);
      for (let i = 0; i < full.length - 1; i++) { nodes[full[i]].next.push(full[i + 1]); nodes[full[i + 1]].prev.push(full[i]); }
      chainInfo[c.id] = { ids, from: a.id, to: b.id, theme: c.theme, length: s.total, spacing: s.total / (c.n + 1) };
    });
    /* Keep at most 2 identical categories in a row on every chain. */
    return { nodes, start: byKey.S, finish: byKey.F, chains: chainInfo, junctions: byKey, width: 60, height: 36 };
  }

  /* Shortest and longest distance (fields) from a node to the finish, used by UI hints and tests. */
  function distances(b) {
    const memoMin = {}, memoMax = {};
    const min = id => { if (id === b.finish) return 0; if (memoMin[id] != null) return memoMin[id]; return memoMin[id] = 1 + Math.min.apply(null, b.nodes[id].next.map(min)); };
    const max = id => { if (id === b.finish) return 0; if (memoMax[id] != null) return memoMax[id]; return memoMax[id] = 1 + Math.max.apply(null, b.nodes[id].next.map(max)); };
    return { min: min(b.start), max: max(b.start), minOf: min, maxOf: max };
  }

  MP.Board = { build, distances, BRANCH_NAME, CHAINS, JUNCTIONS: J };
  if (typeof module !== "undefined") module.exports = MP.Board;
})(typeof window !== "undefined" ? window : global);
