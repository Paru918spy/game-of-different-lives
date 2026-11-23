/* Validate figure profiles: node tools/profiles-check.js [id ...]   (no id = all 21) */
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "data", "profiles");
const IDS = ["wonder", "king", "kaepernick", "curie", "heumann", "keller", "grandin", "kahlo", "malala", "cox", "johnson", "singh", "mandela", "beethoven", "turing", "amira", "jonas", "lena", "sam", "hawking", "parks"];
const ZONES = ["stairs", "ladder", "rope", "bridge", "ramp", "market", "tunnel", "office", "sprint", "quiet"];
const BLOCKABLE = ["stairs", "ladder", "rope", "sprint", "tunnel", "market"], NEUTRALISH = ["bridge", "ramp", "office", "quiet"];
const TYPES = ["hint", "shield", "bestof2"];
function check(id, P) {
  const err = [], e = m => err.push(id + ": " + m), s = (v, max, what) => { if (typeof v !== "string" || !v.trim()) e(what + " missing"); else if (v.length > max) e(what + " too long (" + v.length + " > " + max + "): " + v.slice(0, 40)); };
  if (P.id !== id) e("id must be " + id);
  s(P.intro, 500, "intro");
  const z = P.zones || {}, zk = Object.keys(z);
  if (zk.length < 2 || zk.length > 5) e("zones: 2 to 5 entries, found " + zk.length);
  zk.forEach(k => { if (!ZONES.includes(k)) e("unknown zone " + k); const f = z[k] && z[k].fx; if (!["slow", "fast", "block"].includes(f)) e("zone " + k + ": bad fx"); if (f === "block" && !BLOCKABLE.includes(k)) e("zone " + k + " cannot be blocked"); s(z[k] && z[k].why, 150, "zone " + k + " why"); });
  if (!zk.some(k => z[k].fx === "fast")) e("zones: need at least one fast");
  if (!zk.some(k => z[k].fx === "slow" || z[k].fx === "block")) e("zones: need at least one slow or block");
  if (zk.filter(k => NEUTRALISH.includes(k)).length > 2) e("zones: at most 2 of bridge/ramp/office/quiet");
  const a = P.advantage || {}; if (!TYPES.includes(a.type)) e("advantage.type"); if (![2, 3].includes(a.uses)) e("advantage.uses must be 2 or 3"); s(a.title, 40, "advantage.title"); s(a.text, 260, "advantage.text");
  const L = P.life || []; if (L.length !== 12) e("life needs exactly 12 stations, found " + L.length);
  let net = 0, cnt = { barrier: 0, boost: 0, info: 0, quiz: 0 };
  L.forEach((t, i) => {
    const w = "life " + (i + 1); if (!cnt.hasOwnProperty(t.k)) { e(w + ": bad k " + t.k); return; } cnt[t.k]++; s(t.title, 40, w + " title"); s(t.text, 300, w + " text");
    const m = t.move || 0;
    if (t.k === "barrier" && !(m >= -3 && m <= -1 && Number.isInteger(m))) e(w + ": barrier move must be -1..-3");
    if (t.k === "boost" && !(m >= 1 && m <= 3 && Number.isInteger(m))) e(w + ": boost move must be 1..3");
    if (t.k === "info" && m) e(w + ": info has no move");
    if (t.k === "quiz") { if (!(m >= 1 && m <= 3 && Number.isInteger(m))) e(w + ": quiz move must be 1..3"); const q = t.q || {}; s(q.q, 200, w + " q.q"); s(q.x, 300, w + " q.x");
      if (!Array.isArray(q.a) || q.a.length !== 3 || new Set(q.a).size !== 3 || q.a.some(x => typeof x !== "string" || !x || x.length > 110)) e(w + ": q.a needs 3 different answers (max 110 chars)"); }
    else if (t.q) e(w + ": only quiz has q");
    if (t.k === "barrier" || t.k === "boost") net += m;   // quiz boosts are only for right answers: they do not count into luck
  });
  if (cnt.barrier < 3) e("need at least 3 barriers"); if (cnt.boost < 3) e("need at least 3 boosts"); if (cnt.quiz < 2 || cnt.quiz > 3) e("need 2 or 3 quizzes, found " + cnt.quiz);
  if (net < -3 || net > 3) e("sum of barrier+boost moves must be -3..+3, is " + net);
  if (L[11] && L[11].k === "barrier") e("station 12 must not be a barrier");
  if (!Array.isArray(P.sources) || !P.sources.length) e("sources missing");
  return err;
}
module.exports = { check, IDS, ZONES };
if (require.main === module) {
const ids = process.argv.slice(2).length ? process.argv.slice(2) : IDS; let bad = 0;
ids.forEach(id => { let P; try { P = JSON.parse(fs.readFileSync(path.join(DIR, id + ".json"), "utf8")); } catch (x) { console.log(id + ": cannot read/parse: " + x.message); bad++; return; }
  const er = check(id, P); er.forEach(m => console.log("  " + m)); bad += er.length; if (!er.length) console.log(id + ": ok"); });
if (ids.length === IDS.length) { const t = {}; ids.forEach(id => { try { const a = JSON.parse(fs.readFileSync(path.join(DIR, id + ".json"), "utf8")).advantage.type; t[a] = (t[a] || 0) + 1; } catch (x) {} }); Object.keys(t).length && console.log("advantage types:", t); TYPES.forEach(k => { if ((t[k] || 0) < 5) { console.log("  need at least 5 of advantage type " + k); bad++; } }); }
process.exit(bad ? 1 : 0);
}
