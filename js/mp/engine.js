/* Multiplayer game engine: pure, serialisable state + dispatch(action) -> events.
   No DOM, no THREE. The UI renders `state` and animates the returned `events`.
   Because every change goes through dispatch(), the same engine can later run on a host device
   while other devices send their actions over the network (see docs/multiplayer.md).

   Turn flow
     roll      the player rolls 1-6 and the pawn walks at once
     fork      while walking the player has to choose a branch
     card      the pawn has landed: a card of that field's category (question, statement, action, story)
     feedback  after the answer: right/wrong + explanation. Right: the pawn stays (a DOUBLE card moves it the same number of
               steps again). Wrong: the pawn walks back to where the turn started. Then the next player rolls.
     over      somebody reached the finish                                                    */
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
    bridge: { label: "Bridge", color: "#f6b93b", dark: "#b97b0a", hint: "A helping hand: move 3 fields forward" },
    start: { label: "Start", color: "#fff6e0", dark: "#c9a66b", hint: "" },
    finish: { label: "Finish", color: "#fff6e0", dark: "#c9a66b", hint: "" }
  };
  const BRIDGE_STEPS = 3;

  function rnd(S) { /* mulberry32 on S.rng */
    S.rng = (S.rng + 0x6D2B79F5) | 0; let t = S.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  function shuffle(S, a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd(S) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* opts: { names:[...], seed, board, questions, chars:[real characters with tiles], first?:boolean } */
  function create(opts) {
    const board = opts.board, Q = opts.questions;
    const S = {
      v: 1, rng: (opts.seed == null ? Math.floor(Math.random() * 2 ** 31) : opts.seed) | 0,
      players: opts.names.map((n, i) => ({ id: i, name: n, color: i, pos: board.start, correct: 0, wrong: 0, asked: 0, steps: 0, bridges: 0 })),
      turn: 0, round: 1, phase: "roll", card: null, dice: null, fork: null, winner: null, log: [], path: [], bonus: false,
      decks: {}, storyDeck: []
    };
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
    if (type === "finish" || type === "bridge") type = "story";
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

  /* ---------- movement ---------- */
  function walk(S, n, ev) {
    const B = S._board, p = S.players[S.turn];
    while (n > 0) {
      const node = B.nodes[p.pos];
      if (!node.next.length) break;
      if (node.next.length > 1) { S.phase = "fork"; S.fork = { remaining: n, options: node.next.slice() }; ev.push({ e: "fork", p: p.id, options: node.next.slice() }); return; }
      step(S, node.next[0], ev); n--;
      if (S.players[S.turn].pos === B.finish) break;
    }
    land(S, ev);
  }
  function step(S, to, ev) {
    const p = S.players[S.turn]; ev.push({ e: "step", p: p.id, from: p.pos, to }); S.path.push(p.pos); p.pos = to; p.steps++;
  }
  function land(S, ev) {
    const B = S._board, p = S.players[S.turn], node = B.nodes[p.pos];
    S.fork = null;
    if (p.pos === B.finish) { S.phase = "over"; S.winner = p.id; ev.push({ e: "win", p: p.id }); return; }
    if (node.type === "bridge") { p.bridges++; ev.push({ e: "bridge", p: p.id, node: p.pos }); walk(S, BRIDGE_STEPS, ev); return; }
    if (S.bonus) { S.bonus = false; endTurn(S, ev); return; }            // DOUBLE bonus walk: no second card
    S.card = drawCard(S, node.type); S.phase = "card"; ev.push({ e: "card", p: p.id, node: p.pos });
  }
  /* wrong answer: walk back along the way just taken */
  function walkBack(S, ev) {
    const p = S.players[S.turn];
    while (S.path.length) { const to = S.path.pop(); ev.push({ e: "step", p: p.id, from: p.pos, to, back: true }); p.pos = to; }
    ev.push({ e: "back", p: p.id });
  }
  function endTurn(S, ev) {
    S.turn = (S.turn + 1) % S.players.length; if (S.turn === 0) S.round++;
    S.dice = null; S.fork = null; S.path = []; S.bonus = false; S.card = null;
    const p = S.players[S.turn];
    S.phase = "roll"; ev.push({ e: "turn", p: p.id });
  }

  /* ---------- actions ---------- */
  /* action: {t:"answer", i} | {t:"task", done} | {t:"next"} | {t:"roll"} | {t:"choose", node} */
  function dispatch(S, a) {
    const ev = [], p = S.players[S.turn];
    if (S.phase === "over") return ev;
    if (a.t === "skip") { endTurn(S, ev); return ev; }          // used when a player is away (online play)
    if (S.phase === "card") {
      const c = S.card;
      if (a.t === "answer" && c.opts) {
        const o = c.opts[a.i]; if (!o) return ev;
        c.result = { i: a.i, ok: o.ok }; p.asked++; o.ok ? p.correct++ : p.wrong++;
        S.phase = "feedback"; ev.push({ e: "answer", p: p.id, ok: o.ok, i: a.i });
      } else if (a.t === "task" && c.kind === "task") {
        c.result = { ok: !!a.done }; p.asked++; a.done ? p.correct++ : p.wrong++;
        S.phase = "feedback"; ev.push({ e: "answer", p: p.id, ok: !!a.done });
      } else if (a.t === "next" && c.kind === "story") { ev.push({ e: "story", p: p.id }); endTurn(S, ev); }
    } else if (S.phase === "feedback" && a.t === "next") {
      if (S.card.result.ok) {
        ev.push({ e: "next", p: p.id });
        if (S.card.double && S.dice) { S.bonus = true; ev.push({ e: "double", p: p.id, n: S.dice }); walk(S, S.dice, ev); } else endTurn(S, ev);
      } else { walkBack(S, ev); endTurn(S, ev); }
    } else if (S.phase === "roll" && a.t === "roll") {
      S.dice = 1 + Math.floor(rnd(S) * 6); S.path = [];
      ev.push({ e: "roll", p: p.id, v: S.dice });
      walk(S, S.dice, ev);
    } else if (S.phase === "fork" && a.t === "choose" && S.fork.options.includes(a.node)) {
      const n = S.fork.remaining; S.phase = "roll"; S.fork = null;
      step(S, a.node, ev); S.fork = null;
      if (S.players[S.turn].pos === S._board.finish) land(S, ev); else walk(S, n - 1, ev);
    }
    return ev;
  }

  MP.Engine = { create, attach, snapshot, dispatch, COLORS, CATEGORY, BRIDGE_STEPS };
  if (typeof module !== "undefined") module.exports = MP.Engine;
})(typeof window !== "undefined" ? window : global);
