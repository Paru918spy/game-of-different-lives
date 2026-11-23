/* Balance check and tuning:  node tools/balance.js [--tune]
   1. Every figure plays alone many times (rounds to the finish) with a smart bot.
   2. Random groups of 4 play against each other: win rate per figure (fair = 25 %).
   --tune moves the strength of life-station barriers and boosts (never texts) until all figures need about the same number of rounds. */
global.window = global;
const fs = require("fs"), path = require("path"), root = path.join(__dirname, "..");
["core", "characters/hawking", "characters/parks", "characters/group1", "characters/group2", "characters/group3", "characters/group4"].forEach(f => require(path.join(root, "js", f + ".js")));
const B = require(path.join(root, "js/mp/board.js")), Q = require(path.join(root, "js/mp/questions.js")), E = require(path.join(root, "js/mp/engine.js"));
const IDS = require("./profiles-check.js").IDS, chars = GOL.characters.filter(c => !c.fictional), board = B.build();
const file = id => path.join(root, "data/profiles", id + ".json");
function load() { const P = {}; IDS.forEach(id => P[id] = JSON.parse(fs.readFileSync(file(id), "utf8"))); return P; }
let rngState = 12345; const rand = () => { rngState = (rngState + 0x6D2B79F5) | 0; let t = Math.imul(rngState ^ (rngState >>> 15), 1 | rngState); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const ACC = .8;
function play(P, figs, seed) {
  window.MP.Profiles = P;
  const S = E.create({ names: figs.map((_, i) => "P" + i), seed, board, questions: Q, chars, pool: figs.slice() }); let guard = 0;
  const dcache = {}; const dist = id => dcache[id] || (dcache[id] = B.distances(board, P[id].zones));
  while (S.phase !== "over" && guard++ < 8000) {
    const p = S.players[S.turn], adv = p.char && P[p.char].advantage.type;
    if (S.phase === "wheel") E.dispatch(S, { t: "spin" });
    else if (S.phase === "card") { const c = S.card, right = rand() < ACC;
      if (c.opts) {
        if (!right && adv === "skip" && p.left > 0 && !c.gate) { E.dispatch(S, { t: "skipq" }); continue; }
        if (adv === "hint" && p.left > 0 && c.opts.length === 3 && !c.hinted) { E.dispatch(S, { t: "hint" }); continue; }
        const i = c.opts.findIndex(o => o.ok === right && !o.gone); E.dispatch(S, { t: "answer", i: i < 0 ? c.opts.findIndex(o => !o.gone) : i });
      } else if (c.kind === "task") { if (!right && adv === "skip" && p.left > 0 && !c.all) E.dispatch(S, { t: "skipq" }); else E.dispatch(S, { t: "task", done: right }); }
      else E.dispatch(S, { t: "next" }); }
    else if (S.phase === "feedback") E.dispatch(S, { t: "next", shield: !S.card.result.ok && adv === "shield" && p.left > 0 });
    else if (S.phase === "roll") E.dispatch(S, { t: "roll", best: adv === "bestof2" && p.left > 0, lift: adv === "lift" && p.left > 0, comp: 3 });
    else if (S.phase === "fork") { const zf = P[p.char].zones, d = dist(p.char); const o = S.fork.allowed.slice().sort((a, b) => (B.cost(board.nodes[a], zf) + d.minOf(a)) - (B.cost(board.nodes[b], zf) + d.minOf(b))); E.dispatch(S, { t: "choose", node: o[0] }); }
  }
  return S;
}
function solo(P, N) { const out = {}; IDS.forEach(id => { let t = 0; for (let g = 0; g < N; g++) t += play(P, [id], g + 1).round; out[id] = t / N; }); return out; }
function group(P, N) { rngState = 777; const w = {}, n = {}; IDS.forEach(i => { w[i] = 0; n[i] = 0; });
  for (let g = 0; g < N; g++) { const pool = IDS.slice(); const figs = []; while (figs.length < 4) figs.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
    const S = play(P, figs, 1000 + g); figs.forEach(f => n[f]++); w[S.players[S.winner].char]++; }
  const o = {}; IDS.forEach(i => o[i] = w[i] / Math.max(1, n[i])); return o; }
const fmt = (o, d) => Object.entries(o).sort((a, b) => a[1] - b[1]).map(([k, v]) => k + " " + v.toFixed(d)).join(", ");
/* --tune adjusts ONLY balance.comp (game-balance steps, 0..14), never story texts, zones or life-station moves.
   Each figure gets the number of extra steps that brings its group win rate towards 25 %. */
if (process.argv.includes("--tune")) {
  const GN = +(process.argv[process.argv.indexOf("--tune") + 1]) || 4000;
  { /* pass 1: solo speed. Every figure gets the steps it needs to be as fast as the fastest figure with no compensation */
    for (let it = 0; it < 6; it++) {
      const P = load(); IDS.forEach(id => { P[id].balance.comp = it ? P[id].balance.comp : 0; }); const r = solo(P, 300), best = Math.min(...Object.values(r)); let ch = 0;
      IDS.forEach(id => { const d = r[id] - best; if (Math.abs(d) < .15) return; const nc = Math.max(0, Math.min(40, P[id].balance.comp + Math.round(d * 3.3))); if (nc !== P[id].balance.comp) { P[id].balance.comp = nc; ch++; } fs.writeFileSync(file(id), JSON.stringify(P[id], null, 1)); });
      console.log(`solo pass ${it}: spread ${(Math.max(...Object.values(r)) - best).toFixed(2)} rounds`); if (!ch) break;
    }
  }
  for (let it = 0; it < 16; it++) { /* pass 2: group win rate */
    const P = load(), g = group(P, GN); let changed = 0, worst = 0;
    IDS.forEach(id => { const d = g[id] - .25; worst = Math.max(worst, Math.abs(d)); if (Math.abs(d) < .015) return; const c = P[id].balance.comp;
      const step = Math.abs(d) > .05 ? 2 : 1, nc = Math.max(0, Math.min(40, c + (d < 0 ? step : -step))); if (nc !== c) { P[id].balance.comp = nc; fs.writeFileSync(file(id), JSON.stringify(P[id], null, 1)); changed++; } });
    console.log(`group round ${it}: worst deviation ${(worst * 100).toFixed(1)} points, ${changed} figures changed`); if (!changed) break;
  }
}
const P = load(); const r = solo(P, 800), g = group(P, 12000);
console.log("solo rounds (fewer = faster):", fmt(r, 2)); console.log("win rate in groups of 4 (fair 0.25):", fmt(g, 3));
const v = Object.values(g); console.log(`win rate range ${Math.min(...v).toFixed(3)} to ${Math.max(...v).toFixed(3)}; solo range ${Math.min(...Object.values(r)).toFixed(2)} to ${Math.max(...Object.values(r)).toFixed(2)}`);
