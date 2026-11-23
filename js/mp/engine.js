/* Multiplayer game engine v2: pure, serialisable state + dispatch(action) -> events. No DOM, no THREE.
   Turn flow
     wheel     (start only) every player spins the wheel and gets one of 21 figures
     roll      roll the die (a figure with "second chance" may roll two and keep the higher one)
     fork      while walking the player picks a route; routes the figure cannot take are not offered
     card      the pawn stopped: question / action / story / checkpoint / life station / ... of that field
     feedback  right or wrong with explanation. Right: stay. Wrong: back to the last safe field (turn start or last stop).
     over      somebody reached the finish
   Walking: every field costs 1 step. A figure's zone effects change that (slow 2, fast 0.5, block = route cannot be chosen).
   Life stations and checkpoints stop the pawn once per player, the rest of the roll is kept.                                        */
(function (root) {
  const MP = root.MP = root.MP || {};
  const COLORS = [
    { name: "Red", hex: "#ef476f", dark: "#b02a4d" }, { name: "Blue", hex: "#1e9be9", dark: "#0b63a8" },
    { name: "Green", hex: "#06c28f", dark: "#038a65" }, { name: "Yellow", hex: "#f6b93b", dark: "#b97b0a" },
    { name: "Purple", hex: "#7b5cd6", dark: "#523a9e" }, { name: "Orange", hex: "#ff8a3d", dark: "#c25a12" }
  ];
  const CATEGORY = {
    who: { label: "Who am I?", color: "#1e9be9", dark: "#0b63a8", hint: "Guess the person from the clue" },
    fact: { label: "Life & Barriers", color: "#ff8a3d", dark: "#c25a12", hint: "A question about a life story" },
    tf: { label: "True or False?", color: "#06c28f", dark: "#038a65", hint: "Is the statement true?" },
    words: { label: "Words Matter", color: "#7b5cd6", dark: "#523a9e", hint: "Respectful words and behaviour" },
    task: { label: "Action!", color: "#ef476f", dark: "#b02a4d", hint: "Try it for real, then roll" },
    story: { label: "Story Stop", color: "#0fb5a0", dark: "#077567", hint: "Meet a person. No question, you can stay!" },
    fwd: { label: "Tailwind", color: "#7bc043", dark: "#4d8a22", hint: "Move extra fields forward" },
    back: { label: "Setback", color: "#d9534f", dark: "#8f2724", hint: "Move back" },
    again: { label: "Roll again", color: "#f6b93b", dark: "#b97b0a", hint: "Roll once more" },
    gate: { label: "Checkpoint", color: "#4f5d95", dark: "#2f3a66", hint: "Answer right to go on" },
    life: { label: "Life station", color: "#e0a82e", dark: "#9a6d0a", hint: "A moment of your own life story" },
    start: { label: "Start", color: "#fff6e0", dark: "#c9a66b", hint: "" },
    finish: { label: "Finish", color: "#fff6e0", dark: "#c9a66b", hint: "" }
  };
  const FLAVOR = {
    fwd: { sprint: "Strong tailwind on the track!", market: "A stall owner shows you a quick way through.", bridge: "The bridge is empty, you hurry across.", ramp: "Smooth ground: you pick up speed.", quiet: "You find a good rhythm in the calm.", _: "A friendly neighbour gives you a lift!" },
    back: { stairs: "You slip on a wet step.", ladder: "A rung is missing. You climb back down.", rope: "The bridge sways and you step back.", _: "Roadworks! You have to turn back." }
  };

  function rnd(S) { /* mulberry32 on S.rng */
    S.rng = (S.rng + 0x6D2B79F5) | 0; let t = S.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffle(S, a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(S) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* opts: { names:[...], seed, board, questions, chars:[real characters with tiles], first?:boolean } */
  function create(opts) {
    const board = opts.board, Q = opts.questions, PR = opts.profiles || MP.Profiles;
    const S = {
      v: 2, rng: (opts.seed == null ? Math.floor(Math.random() * 2 ** 31) : opts.seed) | 0,
      players: opts.names.map((n, i) => ({ id: i, name: n, color: i, char: null, pos: board.start, trail: [], seen: {}, left: 0, correct: 0, wrong: 0, asked: 0, steps: 0, life: 0, used: 0, comp: 0 })),
      turn: 0, round: 1, phase: "wheel", card: null, dice: null, fork: null, winner: null, path: [], bonus: false, rem: 0, anchor: { len: 0 },
      decks: {}, storyDeck: [], pool: []
    };
    S.pool = shuffle(S, opts.pool || Object.keys(PR));
    S._board = board; S._Q = Q; S._chars = opts.chars;       // non-serialised helpers (re-attach with attach())
    return S;
  }
  function attach(S, board, Q, chars) { S._board = board; S._Q = Q; S._chars = chars; return S; }
  function snapshot(S) { const c = Object.assign({}, S); delete c._board; delete c._Q; delete c._chars; return JSON.parse(JSON.stringify(c)); }

  function charById(S, id) { return S._chars.find(c => c.id === id); }
  function deckDraw(S, key, size) {
    let d = S.decks[key];
    if (!d || !d.length) d = S.decks[key] = shuffle(S, Array.from({ length: size }, (_, i) => i));
    return d.shift();
  }
  function realNames(S) { return S._chars.map(c => ({ id: c.id, name: c.name })); }

  /* About one question or action card in five is a DOUBLE card (random): answer right and you walk twice as far. */
  const DOUBLE_CHANCE = 0.2;
  function drawCard(S, type) {
    const c = drawCard0(S, type);
    if (c.kind !== "story") c.double = rnd(S) < DOUBLE_CHANCE;
    return c;
  }
  function drawCard0(S, type) {
    const Q = S._Q;
    if (type === "start") type = "who";
    if (type === "finish") type = "story";
    if (type === "who") {
      const q = Q.who[deckDraw(S, "who", Q.who.length)];
      const clue = q.c[Math.floor(rnd(S) * q.c.length)];
      /* wrong names come from the same theme (e.g. other scientists), so guessing is harder */
      const G = Q.groups || {}, near = new Set();
      Object.keys(G).forEach(k => { if (G[k].includes(q.p)) G[k].forEach(id => near.add(id)); });
      const all = realNames(S).filter(c => c.id !== q.p), close = shuffle(S, all.filter(c => near.has(c.id))), far = shuffle(S, all.filter(c => !near.has(c.id)));
      const others = close.concat(far).slice(0, 2);
      const opts = shuffle(S, [{ text: charById(S, q.p).name, ok: true }].concat(others.map(o => ({ text: o.name, ok: false }))));
      return { kind: "who", p: q.p, q: "Who am I?", clue, opts, x: q.x || null, reveal: q.p };
    }
    if (type === "fact" || type === "words") {
      const arr = Q[type], q = arr[deckDraw(S, type, arr.length)];
      const opts = shuffle(S, q.a.map((t, i) => ({ text: t, ok: i === 0 })));
      return { kind: type, p: q.p || null, q: q.q, opts, x: q.x, reveal: q.p || null };
    }
    if (type === "tf") {
      const q = Q.tf[deckDraw(S, "tf", Q.tf.length)];
      return { kind: "tf", p: q.p, q: q.s, opts: [{ text: "True", ok: q.v }, { text: "False", ok: !q.v }], x: q.x, reveal: q.p };
    }
    if (type === "task") {
      const q = Q.tasks[deckDraw(S, "task", Q.tasks.length)];
      return { kind: "task", q: q.t, icon: q.icon, d: q.d, sec: q.sec || 0, all: !!q.all, r: q.r || null, p: q.p || null };
    }
    /* story */
    if (!S.storyDeck.length) S.storyDeck = shuffle(S, S._chars.map(c => c.id));
    const id = S.storyDeck.shift(), c = charById(S, id);
    const tiles = c.tiles.filter(t => t.type === "win" || t.type === "info");
    const t = tiles[Math.floor(rnd(S) * tiles.length)];
    const bar = c.tiles.filter(t => t.type === "barrier");
    const b = bar[Math.floor(rnd(S) * bar.length)];
    return { kind: "story", p: id, q: c.name, years: c.years, tagline: c.tagline, focus: c.focus, win: t && { title: t.title, text: t.text }, barrier: b && { title: b.title, text: b.text } };
  }

  /* ---------- helpers ---------- */
  const cur = S => S.players[S.turn];
  const prof = p => p.char && MP.Profiles[p.char];
  const zfx = p => (prof(p) || {}).zones || {};
  const flav = (t, zone) => (FLAVOR[t][zone] || FLAVOR[t]._);
  const stops = (p, node) => (node.type === "life" || node.type === "gate") && !p.seen[node.id];
  function pushTo(S, p, to, ev) { ev.push({ e: "step", p: p.id, from: p.pos, to }); p.trail.push(p.pos); p.pos = to; p.steps++; }
  function popBack(S, p, k, ev) {
    while (k-- > 0 && p.trail.length) { const to = p.trail.pop(); ev.push({ e: "step", p: p.id, from: p.pos, to, back: true }); p.pos = to; }
  }
  function endTurn(S, ev) {
    S.turn = (S.turn + 1) % S.players.length; if (S.turn === 0) S.round++;
    S.dice = null; S.fork = null; S.bonus = false; S.card = null; S.rem = 0; S.phase = "roll";
    const p = cur(S); S.anchor = { len: p.trail.length }; ev.push({ e: "turn", p: p.id });
  }
  function anchor(S) { S.anchor = { len: cur(S).trail.length }; }

  /* ---------- movement ---------- */
  /* walk n steps. `forced` = first node when the player has just chosen a route */
  function walk(S, n, ev, forced) {
    const B = S._board, p = cur(S), fx = zfx(p);
    while (n > 1e-9 || forced != null) {
      const node = B.nodes[p.pos]; let to = forced;
      if (to == null) {
        if (!node.next.length) break;
        const allowed = node.next.filter(id => !MP.Board.blocked(B.nodes[id].zone, fx));
        if (node.next.length > 1 && allowed.length > 1) { S.phase = "fork"; S.fork = { remaining: n, options: node.next.slice(), allowed }; ev.push({ e: "fork", p: p.id, options: node.next.slice(), allowed }); return; }
        to = allowed.length ? allowed[0] : node.next[0];
      }
      forced = null;
      pushTo(S, p, to, ev); n -= MP.Board.cost(B.nodes[to], fx);
      if (to === B.finish) break;
      if (stops(p, B.nodes[to])) { S.rem = Math.max(0, n); stopAt(S, ev); return; }
    }
    S.rem = 0; land(S, ev);
  }
  /* mandatory stop at a life station or checkpoint */
  function stopAt(S, ev) {
    const B = S._board, p = cur(S), node = B.nodes[p.pos]; p.seen[node.id] = 1;
    if (node.type === "life") {
      const st = prof(p).life[node.life - 1]; p.life++;
      const c = { kind: "life", lk: node.life, k: st.k, title: st.title, text: st.text, move: st.move || 0, p: p.char };
      if (st.q) { c.q = st.q.q; c.x = st.q.x; c.opts = shuffle(S, st.q.a.map((t, i) => ({ text: t, ok: i === 0 }))); }
      S.card = c; S.phase = "card"; ev.push({ e: "card", p: p.id, node: p.pos }); return;
    }
    const g = drawCard(S, ["fact", "tf", "words", "who"][Math.floor(rnd(S) * 4)]); g.gate = true; g.double = false;
    S.card = g; S.phase = "card"; ev.push({ e: "card", p: p.id, node: p.pos });
  }
  function land(S, ev) {
    const B = S._board, p = cur(S), node = B.nodes[p.pos]; S.fork = null;
    if (p.pos === B.finish) { S.phase = "over"; S.winner = p.id; ev.push({ e: "win", p: p.id }); return; }
    if (S.bonus) { endTurn(S, ev); return; }                       // quiet landing after a bonus walk: no card
    const t = node.type;
    if (t === "fwd") { ev.push({ e: "fx", p: p.id, kind: "fwd", n: node.n, text: flav("fwd", node.zone) }); S.bonus = true; walk(S, node.n, ev); return; }
    if (t === "back") { ev.push({ e: "fx", p: p.id, kind: "back", n: node.n, text: flav("back", node.zone) }); popBack(S, p, node.n, ev); endTurn(S, ev); return; }
    if (t === "again") { ev.push({ e: "fx", p: p.id, kind: "again", text: "Roll again!" }); S.dice = null; S.phase = "roll"; anchor(S); S.bonus = false; return; }
    if (t === "life" || t === "gate") { endTurn(S, ev); return; }          // already visited: nothing happens
    if (t === "start") { endTurn(S, ev); return; }
    S.card = drawCard(S, t); S.phase = "card"; ev.push({ e: "card", p: p.id, node: p.pos });
  }
  /* after a life station or checkpoint is resolved: keep walking with the rest of the roll */
  function resume(S, ev, extra) {
    const n = (S.rem || 0) + (extra || 0); S.card = null; S.rem = 0; anchor(S);
    if (n > 0) walk(S, n, ev); else endTurn(S, ev);
  }

  /* ---------- actions ---------- */
  /* {t:"spin"} | {t:"roll", best?} | {t:"choose", node} | {t:"answer", i} | {t:"hint"} | {t:"task", done} | {t:"next", shield?} | {t:"skip"} */
  function dispatch(S, a) {
    const ev = [], p = cur(S);
    if (S.phase === "over") return ev;
    if (S.phase === "wheel") {
      if (a.t !== "spin" && a.t !== "skip") return ev;
      const id = S.pool.shift(), pr = MP.Profiles[id]; p.char = id; p.left = pr.advantage.uses; p.comp = (pr.balance && pr.balance.comp) || 0;
      ev.push({ e: "assign", p: p.id, char: id, order: S.players.map(q => q.char) });
      if (S.turn < S.players.length - 1) { S.turn++; ev.push({ e: "wheelTurn", p: S.turn }); }
      else { S.turn = 0; S.phase = "roll"; S.anchor = { len: 0 }; ev.push({ e: "turn", p: 0 }); }
      return ev;
    }
    if (a.t === "skip") { if (S.phase === "card" || S.phase === "feedback" || S.phase === "fork") { S.card = null; S.fork = null; popBack(S, p, p.trail.length - S.anchor.len, ev); } endTurn(S, ev); return ev; }
    if (S.phase === "card") {
      const c = S.card;
      if (a.t === "hint" && c.opts && c.opts.length === 3 && !c.hinted && p.left > 0 && prof(p).advantage.type === "hint") {
        const bad = c.opts.map((o, i) => i).filter(i => !c.opts[i].ok && !c.opts[i].gone); c.opts[bad[Math.floor(rnd(S) * bad.length)]].gone = true; c.hinted = true; p.left--; p.used++;
        ev.push({ e: "adv", p: p.id, type: "hint" }); return ev;
      }
      if (a.t === "skipq" && p.left > 0 && prof(p).advantage.type === "skip" && (c.opts || c.kind === "task") && c.kind !== "story" && !c.gate && !(c.kind === "task" && c.all)) {
        p.left--; p.used++; c.result = { i: -1, ok: true, skipped: true }; p.asked++; p.correct++; S.phase = "feedback";
        ev.push({ e: "adv", p: p.id, type: "skip" }); ev.push({ e: "answer", p: p.id, ok: true, i: -1 }); return ev;
      }
      if (a.t === "answer" && c.opts) {
        const o = c.opts[a.i]; if (!o || o.gone) return ev;
        c.result = { i: a.i, ok: o.ok }; p.asked++; o.ok ? p.correct++ : p.wrong++;
        S.phase = "feedback"; ev.push({ e: "answer", p: p.id, ok: o.ok, i: a.i });
      } else if (a.t === "task" && c.kind === "task") {
        c.result = { ok: !!a.done }; p.asked++; a.done ? p.correct++ : p.wrong++;
        S.phase = "feedback"; ev.push({ e: "answer", p: p.id, ok: !!a.done });
      } else if (a.t === "next" && c.kind === "story") { ev.push({ e: "story", p: p.id }); endTurn(S, ev); }
      else if (a.t === "next" && c.kind === "life" && !c.opts) {
        ev.push({ e: "life", p: p.id, k: c.k, move: c.move });
        if (c.k === "barrier") { popBack(S, p, -c.move, ev); S.rem = 0; anchor(S); endTurn(S, ev); }
        else resume(S, ev, c.k === "boost" ? c.move : 0);
      }
    } else if (S.phase === "feedback" && a.t === "next") {
      const c = S.card, ok = c.result.ok;
      if (c.kind === "life") { ev.push({ e: "life", p: p.id, k: c.k, move: ok ? c.move : 0 }); resume(S, ev, ok ? c.move : 0); }
      else if (c.gate) { if (ok) { ev.push({ e: "next", p: p.id }); resume(S, ev, 0); } else { ev.push({ e: "gateFail", p: p.id }); S.rem = 0; anchor(S); endTurn(S, ev); } }
      else if (ok) {
        ev.push({ e: "next", p: p.id });
        if (c.double && S.dice) { S.bonus = true; ev.push({ e: "double", p: p.id, n: S.dice }); walk(S, S.dice, ev); } else endTurn(S, ev);
      } else if (a.shield && p.left > 0 && prof(p).advantage.type === "shield") { p.left--; p.used++; ev.push({ e: "adv", p: p.id, type: "shield" }); endTurn(S, ev); }
      else { popBack(S, p, p.trail.length - S.anchor.len, ev); ev.push({ e: "back", p: p.id }); endTurn(S, ev); }
    } else if (S.phase === "roll" && a.t === "roll") {
      let d = 1 + Math.floor(rnd(S) * 6), d2 = null;
      if (a.best && p.left > 0 && prof(p).advantage.type === "bestof2") { d2 = 1 + Math.floor(rnd(S) * 6); p.left--; p.used++; }
      S.dice = d2 ? Math.max(d, d2) : d; S.bonus = false;
      if (a.lift && p.left > 0 && prof(p).advantage.type === "lift") { S.dice += 2; p.left--; p.used++; }
      /* game balance (not part of the story): each point of "comp" adds one step, applied automatically, at most 3 per roll */
      const cu = Math.max(0, Math.min(3, p.comp)); if (cu) { S.dice += cu; p.comp -= cu; }
      ev.push({ e: "roll", p: p.id, v: S.dice, d1: d, d2, lift: !!(a.lift && S.dice > Math.max(d, d2 || 0)), comp: cu });
      walk(S, S.dice, ev);
    } else if (S.phase === "fork" && a.t === "choose" && S.fork.allowed.includes(a.node)) {
      const n = S.fork.remaining; S.phase = "roll"; S.fork = null;
      walk(S, n, ev, a.node);
    }
    return ev;
  }

  MP.Engine = { create, attach, snapshot, dispatch, COLORS, CATEGORY };
  if (typeof module !== "undefined") module.exports = MP.Engine;
})(typeof window !== "undefined" ? window : global);
