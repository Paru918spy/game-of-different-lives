/* Rule check for the multiplayer engine (Node, no browser):  node tools/mp-sim.js
   Validates the question bank against the character data and lets a random bot play complete games. */
global.window = global;
const path = require("path"), J = f => path.join(__dirname, "..", "js", f);
["core", "characters/hawking", "characters/parks", "characters/group1", "characters/group2", "characters/group3", "characters/group4"].forEach(f => require(J(f + ".js")));
const B = require(J("mp/board.js")), Q = require(J("mp/questions.js")), E = require(J("mp/engine.js"));
const chars = GOL.characters.filter(c => !c.fictional), board = B.build();
const fail = m => { console.error("FAIL:", m); process.exit(1); };

if (board.nodes.length > 70) fail("board has more than 70 fields: " + board.nodes.length);
const reach = new Set(); (function dfs(i) { if (reach.has(i)) return; reach.add(i); board.nodes[i].next.forEach(dfs); })(board.start);
if (reach.size !== board.nodes.length) fail("unreachable fields");
if (board.nodes[board.finish].next.length) fail("finish has exits");
Q.who.concat(Q.fact, Q.tf).forEach(q => { if (q.p !== null && !chars.find(c => c.id === q.p)) fail("unknown person " + q.p); });
Q.fact.concat(Q.words).forEach(q => { if (q.a.length !== 3 || new Set(q.a).size !== 3) fail("bad answers: " + q.q); });
Q.tf.forEach(q => { if (typeof q.v !== "boolean" || !q.s || !q.x) fail("bad true/false: " + q.s); });
Q.who.forEach(q => { if (q.c.length < 2 || !q.x) fail("who-am-I needs clues and explanation: " + q.p); });
Q.fact.concat(Q.words).forEach(q => { if (!q.x || q.x.length > 330) fail("missing or too long explanation: " + q.q); });
Q.tasks.forEach(t => { if (!t.t || !t.d || !t.icon || !t.r || (t.sec && (t.sec < 10 || t.sec > 120)) || (t.p && !chars.find(c => c.id === t.p))) fail("bad action card: " + t.t); });
const dup = Q.fact.concat(Q.words).map(q => q.q).concat(Q.tf.map(q => q.s)); if (new Set(dup).size !== dup.length) fail("duplicate question text");
const covered = new Set(Q.who.map(q => q.p)); chars.forEach(c => { if (!covered.has(c.id)) fail("no who-am-I for " + c.id); });
console.log("board:", board.nodes.length, "fields, shortest way", B.distances(board).min, "longest", B.distances(board).max);
console.log("questions:", Object.fromEntries(Object.entries(Q).map(([k, v]) => [k, v.length])));

function game(n, seed, acc) {
  const S = E.create({ names: Array.from({ length: n }, (_, i) => "P" + i), seed, board, questions: Q, chars }); let guard = 0;
  while (S.phase !== "over") {
    if (++guard > 5000) fail("game does not finish");
    if (S.phase === "card") { const c = S.card;
      if (c.opts) { const want = Math.random() < acc, i = c.opts.findIndex(o => o.ok === want); E.dispatch(S, { t: "answer", i: i < 0 ? 0 : i }); }
      else if (c.kind === "task") E.dispatch(S, { t: "task", done: Math.random() < acc }); else E.dispatch(S, { t: "next" }); }
    else if (S.phase === "feedback") E.dispatch(S, { t: "next" });
    else if (S.phase === "roll") E.dispatch(S, { t: "roll" });
    else if (S.phase === "fork") E.dispatch(S, { t: "choose", node: S.fork.options[Math.floor(Math.random() * S.fork.options.length)] });
  }
  return S.round;
}
for (const [n, acc] of [[2, .85], [2, .6], [4, .85], [6, .85]]) {
  let r = 0; const N = 200; for (let i = 0; i < N; i++) r += game(n, i, acc);
  console.log(`${n} players, ${Math.round(acc * 100)}% right: ${(r / N).toFixed(1)} rounds on average`);
}
console.log("OK");
