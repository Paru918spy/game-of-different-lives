/* Rule check for multiplayer v2 (Node, no browser):  node tools/mp-sim.js
   Validates board, figure profiles and questions, then lets random bots play complete games. */
global.window = global;
const path = require("path"), J = f => path.join(__dirname, "..", "js", f);
["core", "characters/hawking", "characters/parks", "characters/group1", "characters/group2", "characters/group3", "characters/group4"].forEach(f => require(J(f + ".js")));
const PR = require(J("mp/profiles.js")), B = require(J("mp/board.js")), Q = require(J("mp/questions.js")), E = require(J("mp/engine.js"));
const chars = GOL.characters.filter(c => !c.fictional), board = B.build();
const fail = m => { console.error("FAIL:", m); process.exit(1); };

/* board */
if (board.nodes.length < 95 || board.nodes.length > 108) fail("board should have about 100 fields: " + board.nodes.length);
const reach = new Set(); (function dfs(i) { if (reach.has(i)) return; reach.add(i); board.nodes[i].next.forEach(dfs); })(board.start);
if (reach.size !== board.nodes.length) fail("unreachable fields");
if (board.nodes[board.finish].next.length) fail("finish has exits");
if (board.life.length !== 12) fail("need 12 life stations");
board.sections.forEach(s => { const safe = s.routes.filter(r => ["bridge", "ramp", "quiet", "office"].includes(r.zone)); if (!safe.length) fail("fork " + s.id + " has no route that can never be blocked"); });
const D0 = B.distances(board);
console.log("board:", board.nodes.length, "fields, shortest way", D0.min, "longest", D0.max);
const types = {}; board.nodes.forEach(n => types[n.type] = (types[n.type] || 0) + 1); console.log("field types:", types);

/* figures: every figure must be able to reach the finish and be about as fast as everybody else */
const ids = Object.keys(PR); if (ids.length !== 21) fail("need 21 profiles");
ids.forEach(id => { if (!GOL.characters.find(c => c.id === id)) fail("unknown figure " + id); });
const eff = {}; ids.forEach(id => { const d = B.distances(board, PR[id].zones); eff[id] = d; if (!isFinite(d.min)) fail(id + " cannot finish");
  const ratio = d.min / D0.min; if (ratio < .8 || ratio > 1.3) fail(`${id}: effective shortest way ${d.min} vs ${D0.min} is not balanced`); });
console.log("effective shortest way per figure:", Object.entries(eff).map(([k, v]) => k + " " + v.min).join(", "));

/* questions */
Q.who.concat(Q.fact, Q.tf).forEach(q => { if (q.p !== null && !chars.find(c => c.id === q.p)) fail("unknown person " + q.p); });
Q.fact.concat(Q.words).forEach(q => { if (q.a.length !== 3 || new Set(q.a).size !== 3) fail("bad answers: " + q.q); });
Q.tf.forEach(q => { if (typeof q.v !== "boolean" || !q.s || !q.x) fail("bad true/false: " + q.s); });
console.log("questions:", Object.fromEntries(Object.entries(Q).map(([k, v]) => [k, v.length])));

let smart = false;
function game(n, seed, acc, stat) {
  const S = E.create({ names: Array.from({ length: n }, (_, i) => "P" + i), seed, board, questions: Q, chars }); let guard = 0;
  while (S.phase !== "over") {
    S.players.forEach(p => { const nd = board.nodes[p.pos]; if (p.char && B.blocked(nd.zone, PR[p.char].zones)) fail(p.char + " stands on a blocked route"); });
    if (++guard > 8000) fail("game does not finish (seed " + seed + ")");
    if (S.phase === "wheel") E.dispatch(S, { t: "spin" });
    else if (S.phase === "card") { const c = S.card, p = S.players[S.turn];
      if (c.opts) { const want = Math.random() < acc, i = c.opts.findIndex(o => o.ok === want && !o.gone); E.dispatch(S, { t: "answer", i: i < 0 ? c.opts.findIndex(o => !o.gone) : i }); }
      else E.dispatch(S, { t: "next" }); }
    else if (S.phase === "feedback") { const p = S.players[S.turn]; const sh = !S.card.result.ok && Math.random() < .5; E.dispatch(S, { t: "next", shield: sh }); }
    else if (S.phase === "roll") E.dispatch(S, { t: "roll", best: Math.random() < .5 });
    else if (S.phase === "fork") { if (!S.fork.allowed.length) fail("fork without allowed route");
      const zf = PR[S.players[S.turn].char].zones, d = B.distances(board, zf), opts = S.fork.allowed.slice().sort((a, b) => (B.cost(board.nodes[a], zf) + d.minOf(a)) - (B.cost(board.nodes[b], zf) + d.minOf(b)));
      E.dispatch(S, { t: "choose", node: smart ? opts[0] : opts[Math.floor(Math.random() * opts.length)] }); }
  }
  S.players.forEach(p => { if (stat) { (stat[p.char] = stat[p.char] || { w: 0, n: 0 }).n++; } }); if (stat) stat[S.players[S.winner].char].w++;
  return S.round;
}
const stat = {}; smart = true;
for (const [n, acc] of [[2, .85], [2, .6], [4, .85], [6, .85]]) {
  let r = 0; const N = 300; for (let i = 0; i < N; i++) r += game(n, i, acc, stat);
  console.log(`${n} players, ${Math.round(acc * 100)}% right: ${(r / N).toFixed(1)} rounds on average`);
}
const rate = Object.entries(stat).map(([k, v]) => [k, v.w / v.n]).sort((a, b) => b[1] - a[1]);
console.log("win rate by figure (random bots, fair is about 1/players): best", rate[0][0], rate[0][1].toFixed(2), "worst", rate[rate.length - 1][0], rate[rate.length - 1][1].toFixed(2));
console.log("OK");
