/* Multiplayer UI: mode screen, setup (one device / host online / join online), cards, die, forks, end screen.
   All rules live in MP.Engine, all 3D in MP.Scene, all networking in MP.Net. This file connects them with the DOM.

   Data flow (same for one device and online):
     user clicks -> submit(action) -> host/local engine dispatch -> {events, snapshot} -> enqueue()
     enqueue() plays the events (animations) and then renders the snapshot `V`.
   Online, the host broadcasts {events, snapshot} to the guests, which call enqueue() as well.        */
(function () {
  "use strict";
  const MP = window.MP, E = MP.Engine, $ = id => document.getElementById(id);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const FAST = /[?&]fast/.test(location.search);
  const sleep = ms => new Promise(r => setTimeout(r, FAST ? ms / 8 : ms));
  const SCREENS = ["screen-about", "screen-home", "screen-topic", "screen-game", "screen-end", "screen-mode", "screen-mpsetup", "screen-mp"];
  const chars = () => GOL.characters.filter(c => !c.fictional);
  const char = id => GOL.characters.find(c => c.id === id);
  const ICON = { who: "?", fact: "i", tf: "✓✗", words: "Aa", task: "★", story: "♥", fwd: "»", back: "«", again: "↻", gate: "!", life: "★" };
  const ZN = () => MP.Board.ZONES, PR = () => MP.Profiles;
  const prof = p => p && p.char && PR()[p.char];
  const ADVICON = { hint: "💡", shield: "🛡", bestof2: "🎲", lift: "🚀", skip: "🎟" };
  const shortName = c => c.name.replace(/ Jr\.$/, "").split(" ").pop();
  const clone = o => JSON.parse(JSON.stringify(o));

  /* G: authoritative state (local or host). V: what is shown on this screen. mode: local | host | guest. me: my player id online. */
  let useComp = false, G = null, V = null, board = null, dist = null, scene = null, mode = "local", me = null, net = null, lobby = [];
  let queue = [], playing = false, count = 2, names = [], muted = false, ac = null, ended = false;

  /* ---------- sound ---------- */
  function tone(freqs, dur = .15, type = "sine", vol = .07) {
    if (muted) return;
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * dur * .8; o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur); });
    } catch (e) { /* no audio */ }
  }
  const SND = { hop: () => tone([420 + Math.random() * 60], .07, "triangle", .05), right: () => tone([523, 659, 784], .14, "triangle"), wrong: () => tone([220, 175], .2, "sawtooth", .04),
    roll: () => tone([1200 + Math.random() * 400], .03, "square", .02), bridge: () => tone([392, 523, 659, 784, 988], .12, "triangle"), win: () => tone([523, 523, 659, 784, 659, 784, 1046], .16, "triangle", .09), turn: () => tone([660], .09, "sine", .04) };

  /* ---------- navigation ---------- */
  function show(id) { SCREENS.forEach(s => $(s).hidden = s !== id); document.body.classList.toggle("ingame", id === "screen-mp"); window.scrollTo(0, 0); }
  const goSingle = $("playNow").onclick;                       // original handler from game.js: opens the wheel
  const goMode = e => { if (e && e.preventDefault) e.preventDefault(); leave(); show("screen-mode"); };
  $("playNow").onclick = $("playNow2").onclick = $("playNow3").onclick = $("tPlay").onclick = goMode;
  $("modeLink").onclick = goMode;
  $("modeAbout").onclick = e => { e.preventDefault(); $("aboutLink").click(); };
  $("modeSingle").onclick = () => { goSingle(); };
  $("modeMulti").onclick = () => { openSetup("local"); };
  $("setupBack").onclick = goMode;
  function leave() { if (net) { net.close(); net = null; } if (scene) scene.stop(); G = V = null; queue = []; playing = false; mode = "local"; me = null; hidePanels(); resetLobby(); }

  /* ---------- setup: one device ---------- */
  function pawnChip(i) { const c = E.COLORS[i]; return `<span class="pchip" style="--c:${c.hex};--d:${c.dark}" title="${c.name}"><i></i></span>`; }
  function buildLocal() {
    $("mpCount").innerHTML = [2, 3, 4, 5, 6].map(n => `<button class="cnt${n === count ? " on" : ""}" data-n="${n}" aria-pressed="${n === count}">${n}</button>`).join("");
    $("mpCount").querySelectorAll("button").forEach(b => b.onclick = () => { readNames(); count = +b.dataset.n; buildLocal(); });
    $("mpNames").innerHTML = Array.from({ length: count }, (_, i) => `<label class="pn">${pawnChip(i)}<input maxlength="14" value="${esc(names[i] || "Player " + (i + 1))}" data-i="${i}" aria-label="Name of player ${i + 1}"></label>`).join("");
  }
  function readNames() { document.querySelectorAll("#mpNames input").forEach(inp => names[+inp.dataset.i] = inp.value.trim() || ("Player " + (+inp.dataset.i + 1))); }
  $("mpStart").onclick = () => { readNames(); startLocal(names.slice(0, count)); };

  function openSetup(pane) {
    buildLocal(); setPane(pane || "local"); show("screen-mpsetup");
  }
  function setPane(p) {
    document.querySelectorAll(".tab").forEach(t => { const on = t.dataset.pane === p; t.classList.toggle("on", on); t.setAttribute("aria-selected", on); });
    ["local", "host", "join"].forEach(k => $("pane-" + k).hidden = k !== p);
  }
  document.querySelectorAll(".tab").forEach(t => t.onclick = () => setPane(t.dataset.pane));

  /* ---------- game start ---------- */
  function prepare() {
    board = MP.Board.build(); dist = MP.Board.distances(board);
    if (!scene) scene = MP.Scene($("mpCv"));
    show("screen-mp"); $("mpEnd").hidden = true; ended = false; queue = []; playing = false;
  }
  function mount(snap) {
    V = E.attach(clone(snap), board, MP.Questions, chars());
    scene.build(board); scene.setPlayers(V.players); labelSeats();
    const pos = {}; V.players.forEach(p => pos[p.id] = p.pos); scene.place(pos);
    scene.setActive(V.turn); scene.mode("follow"); scene.start(); if (FAST) scene.setSpeed(4);
    setFollowBtn(true); buildLegend(); render();
    banner(V.phase === "wheel" ? "Spin the wheel of lives!" : `${esc(V.players[V.turn].name)} starts!`, 1500);
  }
  function startLocal(list, seed) {
    const keepNet = false; leave(); mode = "local"; prepare();
    G = E.create({ names: list, seed, board, questions: MP.Questions, chars: chars() });
    mount(E.snapshot(G));
  }

  /* ---------- actions ---------- */
  const mine = () => mode === "local" || (V && V.turn === me);
  function submit(a) {
    if (!V || playing || queue.length || !mine()) return;
    hidePanels();
    if (mode === "guest") { net.send({ t: "act", a }); return; }
    commit(a);
  }
  /* local/host only: run the engine, tell guests, animate here */
  function commit(a) {
    let ev = E.dispatch(G, a); if (!ev.length) return;
    while (G.phase !== "over" && G.players[G.turn].away) ev = ev.concat(E.dispatch(G, { t: "skip" }));   // never wait for a player who left
    const snap = E.snapshot(G);
    if (mode === "host" && net) net.broadcast({ t: "upd", ev, snap });
    enqueue(ev, snap);
  }
  function enqueue(ev, snap) { queue.push({ ev, snap }); pump(); }
  async function pump() {
    if (playing) return; playing = true;
    try {
      while (queue.length) { const it = queue.shift(); V = E.attach(clone(it.snap), board, MP.Questions, chars()); hidePanels(); await play(it.ev); }
    } finally { playing = false; }
    render();
  }

  async function play(ev) {
    for (const e of ev) {
      if (e.e === "answer") { e.ok ? SND.right() : SND.wrong(); renderPlayers(); }
      else if (e.e === "roll") await showRoll(e);
      else if (e.e === "step") { SND.hop(); await scene.move(e.p, e.from, e.to); }
      else if (e.e === "back") { banner("↩ Not quite: back to where you started", 1500); await sleep(500); }
      else if (e.e === "assign") await playAssign(e);
      else if (e.e === "wheelTurn") { scene.setActive(e.p); renderPlayers(); }
      else if (e.e === "fx") { SND[e.kind === "back" ? "wrong" : "bridge"](); banner(`${e.kind === "fwd" ? "» " + esc(e.text) + ` Move ${e.n} more!` : e.kind === "back" ? "« " + esc(e.text) + ` Back ${e.n}.` : "↻ " + esc(e.text)}`, 1700); await sleep(1000); }
      else if (e.e === "life") { if (e.move) { e.move > 0 ? SND.bridge() : SND.wrong(); banner(e.move > 0 ? `★ Boost! ${e.move} more field${e.move > 1 ? "s" : ""}` : `🚧 Barrier! Back ${-e.move} field${e.move < -1 ? "s" : ""}`, 1500); await sleep(800); } }
      else if (e.e === "adv") { SND.right(); banner(e.type === "hint" ? "💡 Hint: one wrong answer is gone" : e.type === "skip" ? "🎟 Free pass: counted as right!" : "🛡 Shield: you stay!", 1300); renderPlayers(); }
      else if (e.e === "gateFail") { SND.wrong(); banner("⛔ The checkpoint stays closed. The rest of your roll is lost.", 1700); await sleep(700); }
      else if (e.e === "double") { SND.bridge(); banner(`⚡ DOUBLE! Move ${e.n} more field${e.n > 1 ? "s" : ""}`, 1500); await sleep(900); }
      else if (e.e === "turn") { scene.setActive(e.p); SND.turn(); renderPlayers(); banner(turnText(V.players[e.p]), 1500); await sleep(650); }
      else if (e.e === "win") { SND.win(); renderPlayers(); await scene.celebrate(e.p); showEnd(); }
    }
  }
  const turnText = p => `<span class="pdot" style="--c:${E.COLORS[p.color].hex}"></span>${esc(p.name)}’s turn${mode !== "local" && p.id === me ? " (you!)" : ""}`;

  /* ---------- rendering ---------- */
  function hidePanels() { ["mpCardWrap", "mpDock", "mpFork"].forEach(id => $(id).hidden = true); if (scene) { scene.clearFork(); scene.setShift(0); } }
  function render() {
    if (!V) return; renderPlayers(); hidePanels();
    if (V.phase === "over") return;
    if (V.phase === "wheel") { renderWheel(); return; }
    $("mpWheel").hidden = true;
    if (V.phase === "card" || V.phase === "feedback") renderCard();
    else if (V.phase === "roll") renderRoll();
    else if (V.phase === "fork") renderFork();
  }
  function banner(html, ms) { const b = $("mpBanner"); b.innerHTML = html; b.hidden = false; b.classList.remove("in"); void b.offsetWidth; b.classList.add("in"); clearTimeout(banner.t); banner.t = setTimeout(() => b.hidden = true, (ms || 1400) / (FAST ? 8 : 1)); }

  function renderPlayers() {
    const total = dist.min;
    $("mpPlayers").innerHTML = V.players.map(p => {
      const c = E.COLORS[p.color], rem = dist.minOf(p.pos), pr = Math.max(0, Math.min(1, 1 - rem / total)), ch = p.char && char(p.char), pf = prof(p);
      return `<div class="pl${p.id === V.turn && V.phase !== "over" ? " act" : ""}${p.away ? " away" : ""}" style="--c:${c.hex}"><span class="pdot"></span><div class="pi"><b>${esc(p.name)}${mode !== "local" && p.id === me ? " (you)" : ""}${p.away ? " · away" : ""}</b>${ch ? `<small class="pfig">${esc(shortName(ch))}${pf ? ` · ${ADVICON[pf.advantage.type]}${p.left}` : ""}</small>` : ""}<div class="pbar"><i style="width:${Math.round(pr * 100)}%"></i></div></div><span class="pc" title="Right answers">✔ ${p.correct}</span></div>`;
    }).join("");
  }
  function buildLegend() {
    $("mpLegend").innerHTML = ["who", "fact", "tf", "words", "task", "story", "fwd", "back", "again", "gate", "life"].map(k => `<span><i style="background:${E.CATEGORY[k].color}"></i>${E.CATEGORY[k].label}</span>`).join("");
  }
  const chip = p => `<span class="who-chip" style="--c:${E.COLORS[p.color].hex}"><span class="pdot"></span>${esc(p.name)}</span>`;
  const waitNote = p => `<p class="mp-wait">⏳ ${esc(p.name)} is playing. Watch the board!</p>`;

  function portrait(id) { const c = char(id); if (!c) return ""; return `<figure class="mp-port"><div class="pic">${GOL.portrait(c)}</div><figcaption><b>${esc(c.name)}</b><small>${esc(c.years)} · ${esc(c.focus)}</small></figcaption></figure>`; }

  let timerId = 0;
  const nextLabel = (c, res) => c.kind === "life" ? (res.ok && c.move ? `Continue (+${c.move})` : "Continue") : c.gate ? (res.ok ? "Go on!" : "Stay here") : res.ok ? (c.double ? "⚡ Move ahead again!" : "Stay here · Next player") : "↩ Back to my last safe field";
  function renderCard() {
    const c = V.card, p = V.players[V.turn], cat = E.CATEGORY[c.kind], fb = V.phase === "feedback", res = c.result, my = mine();
    const primary = (id, label) => my ? `<button class="big mp-primary" id="${id}">${label}</button>` : waitNote(p);
    const pf = prof(p); let body = "";
    if (c.kind === "life") {
      const ch = char(c.p), tagk = { barrier: ["🚧 Barrier", "warn"], boost: ["⭐ Boost", "ok"], info: ["📖 Your story", ""], quiz: ["❓ Question", ""] }[c.k];
      body = `<div class="mp-story"><div class="pic">${GOL.portrait(ch)}</div><div><h2>${esc(c.title)}</h2><p class="yrs">${esc(ch.name)} · station ${c.lk} of 12</p></div></div>
        <div class="mp-note ${tagk[1]}"><b>${tagk[0]}${c.move && c.k !== "quiz" ? ` · ${c.move > 0 ? "+" : ""}${c.move} field${Math.abs(c.move) > 1 ? "s" : ""}` : ""}</b><p>${esc(c.text)}</p></div>`;
      if (c.opts) {
        body += `<p class="mp-q">${esc(c.q)}</p><div class="mp-opts">` + c.opts.map((o, i) => { let cls = "mp-opt"; if (o.gone) cls += " gone"; else if (fb) { if (o.ok) cls += " right"; else if (res.i === i) cls += " wrong"; else cls += " dim"; }
          return `<button class="${cls}" data-i="${i}" ${fb || !my || o.gone ? "disabled" : ""}><span class="k">${i + 1}</span>${esc(o.text)}</button>`; }).join("") + `</div><p class="mp-small">A right answer gives +${c.move} field${c.move > 1 ? "s" : ""}.</p>`;
        if (!fb && !my) body += waitNote(p);
        if (fb) body += `<div class="mp-result ${res.ok ? "ok" : "no"}">${res.ok ? "✔ Right!" : "✖ Not quite."} <span>${esc(c.x)}</span></div>` + primary("mpNext", nextLabel(c, res));
      } else body += primary("mpNext", c.k === "barrier" ? `Continue (back ${-c.move})` : c.k === "boost" ? `Continue (+${c.move})` : "Continue");
    } else if (c.kind === "story") {
      const ch = char(c.p);
      body = `<div class="mp-story"><div class="pic">${GOL.portrait(ch)}</div><div><h2>${esc(c.q)}</h2><p class="yrs">${esc(c.years)} · ${esc(c.focus)}</p><p class="tag">${esc(c.tagline)}</p></div></div>
        ${c.win ? `<div class="mp-note ok"><b>⭐ ${esc(c.win.title)}</b><p>${esc(c.win.text)}</p></div>` : ""}${c.barrier ? `<div class="mp-note warn"><b>🚧 ${esc(c.barrier.title)}</b><p>${esc(c.barrier.text)}</p></div>` : ""}
        <p class="mp-small">Story stop: no question. You can stay on this field!</p>${primary("mpNext", "Next player")}`;
    } else if (c.kind === "task") {
      const who = c.all ? "👥 Everyone joins in" : "🙋 " + esc(p.name) + " does it";
      body = `<div class="mp-task"><div class="tic">${c.icon}</div><h2>${esc(c.q)}</h2><span class="mp-who">${who}</span><p>${esc(c.d)}</p>${c.sec && !fb ? `<button class="mp-timer" id="mpTimer" data-s="${c.sec}">⏱ Start ${c.sec}s timer</button>` : ""}</div>` + (fb
        ? `<div class="mp-result ${res.ok ? "ok" : "no"}">${res.ok ? "Great, you did it!" : "No problem. Maybe next time."}${res.ok && c.r ? `<span>💭 Talk about it: ${esc(c.r)}</span>` : ""}</div>${res.ok && c.p ? portrait(c.p) : ""}${primary("mpNext", nextLabel(c, res))}`
        : (my ? `<p class="mp-small">Do it for real. The others decide if it counts. A good try is enough!</p><div class="mp-btns"><button class="big mp-primary" id="mpDone">We did it ✔</button><button class="mp-skip" id="mpSkip">Skip (go back)</button></div>${pf && pf.advantage.type === "skip" && p.left > 0 && !c.all ? `<button class="mp-adv" id="mpSkipQ">🎟 ${esc(pf.advantage.title)} (${p.left} left): count this as done</button>` : ""}` : waitNote(p)));
    } else {
      const opts = c.opts.map((o, i) => { let cls = "mp-opt"; if (o.gone) cls += " gone"; else if (fb) { if (o.ok) cls += " right"; else if (res.i === i) cls += " wrong"; else cls += " dim"; }
        return `<button class="${cls}" data-i="${i}" ${fb || !my || o.gone ? "disabled" : ""}><span class="k">${i + 1}</span>${esc(o.text)}</button>`; }).join("");
      body = (c.gate ? `<div class="mp-note warn"><b>⛔ Checkpoint</b><p>Answer right to pass. Wrong: you stay here and the rest of your roll is lost.</p></div>` : "") + (c.kind === "who" ? `<p class="mp-clue">“${esc(c.clue)}”</p><p class="mp-q">Who am I?</p>` : `<p class="mp-q">${esc(c.q)}</p>`) + `<div class="mp-opts ${c.kind === "tf" ? "two" : ""}">${opts}</div>`;
      if (!fb && my && pf && pf.advantage.type === "skip" && p.left > 0 && !c.gate) body += `<button class="mp-adv" id="mpSkipQ">🎟 ${esc(pf.advantage.title)} (${p.left} left): count this as answered right</button>`;
      if (!fb && my && pf && pf.advantage.type === "hint" && p.left > 0 && c.opts.length === 3 && !c.hinted) body += `<button class="mp-adv" id="mpHint">💡 Use my hint (${p.left} left): remove one wrong answer</button>`;
      if (!fb && !my) body += waitNote(p);
      if (fb) {
        body += `<div class="mp-result ${res.ok ? "ok" : "no"}">${res.ok ? "✔ Right!" : "✖ Not quite."}${c.x ? ` <span>${esc(c.x)}</span>` : ""}</div>`;
        if (c.reveal) body += portrait(c.reveal);
        if (!res.ok && !c.gate && my && pf && pf.advantage.type === "shield" && p.left > 0) body += `<button class="mp-adv" id="mpShield">🛡 Use my shield (${p.left} left): stay here</button>`;
        body += primary("mpNext", nextLabel(c, res));
      }
    }
    const w = $("mpCardWrap"), card = $("mpCard");
    card.className = "mp-card k-" + c.kind + (fb ? " fb" : ""); card.style.setProperty("--c", cat.color); card.style.setProperty("--d", cat.dark);
    const dbBadge = c.double && !fb ? `<div class="mp-double">⚡ DOUBLE card! Answer right (or do it) and you move ahead again by the same number of steps. Wrong: you go back.</div>` : "";
    card.innerHTML = dbBadge + `<div class="mp-chead"><span class="ci">${ICON[c.kind] || ""}</span><div><b>${cat.label}</b><small>${esc(cat.hint)}</small></div>${chip(p)}</div><div class="mp-cbody">${body}</div>`;
    w.hidden = false; const cb = card.querySelector(".mp-cbody"); if (cb) cb.scrollTop = 0; scene.setShift(window.innerWidth >= 1000 ? window.innerWidth * .2 : 0);
    card.querySelectorAll(".mp-opt").forEach(b => b.onclick = () => submit({ t: "answer", i: +b.dataset.i }));
    const n = $("mpNext"); if (n) n.onclick = () => submit({ t: "next" });
    const sk = $("mpSkipQ"); if (sk) sk.onclick = () => submit({ t: "skipq" });
    const hb = $("mpHint"); if (hb) hb.onclick = () => submit({ t: "hint" });
    const sb = $("mpShield"); if (sb) sb.onclick = () => submit({ t: "next", shield: true });
    clearInterval(timerId); const tm = $("mpTimer");
    if (tm) tm.onclick = () => {
      let left = +tm.dataset.s; tm.disabled = true; tm.textContent = "⏱ " + left + "s";
      timerId = setInterval(() => { left--; const t = $("mpTimer"); if (!t) return clearInterval(timerId); if (left <= 0) { clearInterval(timerId); t.textContent = "⏰ Time is up!"; t.classList.add("up"); } else t.textContent = "⏱ " + left + "s"; }, 1000);
    };
    const d = $("mpDone"); if (d) d.onclick = () => submit({ t: "task", done: true });
    const s = $("mpSkip"); if (s) s.onclick = () => submit({ t: "task", done: false });
  }

  /* ---------- die ---------- */
  function pips(n) { const on = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }[n] || []; return Array.from({ length: 9 }, (_, i) => `<i${on.includes(i) ? ' class="p"' : ""}></i>`).join(""); }
  const dieHTML = n => `<div class="mpdie" id="mpDie" aria-label="Die showing ${n}">${pips(n)}</div>`;
  function renderRoll() {
    const p = V.players[V.turn], d = $("mpDock"), my = mine();
    const pf = prof(p), two = my && pf && pf.advantage.type === "bestof2" && p.left > 0;
    d.innerHTML = `<div class="dk-t">${chip(p)} <span class="dk-m">${my ? "Roll the die and move!" : "is about to roll…"}</span></div>${dieHTML(6)}${my ? `<button class="big gold mp-primary" id="mpRoll">Roll 🎲</button>` : ""}${my && pf && pf.advantage.type === "lift" && p.left > 0 ? `<button class="mp-adv" id="mpRoll2">🚀 ${esc(pf.advantage.title)}: roll and add 2 (${p.left} left)</button>` : ""}${two ? `<button class="mp-adv" id="mpRoll2">🎲🎲 ${esc(pf.advantage.title)}: roll two, keep the higher (${p.left} left)</button>` : ""}`;
    d.hidden = false; const r = $("mpRoll"); const cp = () => (useComp ? 3 : 0); if (r) r.onclick = () => { const c = cp(); useComp = false; submit({ t: "roll" }); }; const r2 = $("mpRoll2"); if (r2) r2.onclick = () => { const c = cp(); useComp = false; submit({ t: "roll", best: two, lift: !two }); };
  }
  async function showRoll(e) {
    const p = V.players[e.p], d = $("mpDock");
    d.innerHTML = `<div class="dk-t">${chip(p)} <span class="dk-m">rolls…</span></div>${dieHTML(6)}`; d.hidden = false;
    const die = $("mpDie"); die.classList.add("tumble");
    for (let i = 0; i < 9; i++) { die.innerHTML = pips(1 + Math.floor(Math.random() * 6)); SND.roll(); await sleep(85 + i * 12); }
    die.classList.remove("tumble"); die.innerHTML = pips(e.v); die.classList.add("land"); SND.right(); d.querySelector(".dk-m").textContent = e.comp ? `${e.d2 ? "Best die " + Math.max(e.d1, e.d2) : e.d1}${e.lift ? " + 2" : ""} + ${e.comp} game balance = ${e.v}!` : e.lift ? `${e.d1} + 2 = ${e.v}!` : e.d2 ? `${e.d1} and ${e.d2}: you keep ${e.v}!` : `${e.v} step${e.v > 1 ? "s" : ""}!`;
    await sleep(450);
  }

  /* ---------- forks ---------- */
  function renderFork() {
    const p = V.players[V.turn], f = V.fork, el = $("mpFork"), my = mine(), pf = prof(p), Z = ZN();
    const opts = f.options.map(id => { const n = board.nodes[id], z = Z[n.zone] || { icon: "➜", label: "Keep going", hint: "" }, fx = pf && pf.zones[n.zone], ok = f.allowed.includes(id), len = board.chains[n.chain] ? board.chains[n.chain].ids.length : 0;
      const tag = fx ? { fast: "⚡ fast for you", slow: "🐢 slow for you", block: "⛔ closed for you" }[fx.fx] : "";
      return `<button class="fk th-${n.zone} ${fx ? "fx-" + fx.fx : ""}" data-id="${id}" ${my && ok ? "" : "disabled"}><span class="fi">${z.icon}</span><b>${z.label}</b><small>${len} fields · ${z.hint}</small>${tag ? `<em>${tag}</em><small class="why">${esc(fx.why)}</small>` : ""}</button>`; }).join("");
    el.innerHTML = `<div class="fk-t">${chip(p)} <span>${my ? "Choose your way!" : "is choosing a way…"} ${Math.ceil(f.remaining)} step${f.remaining > 1 ? "s" : ""} to go.${my ? " You can also click a glowing field." : ""}</span></div><div class="fk-b">${opts}</div>`; el.hidden = false;
    scene.mode("follow"); scene.focus(p.pos); setFollowBtn(true);
    if (my) { el.querySelectorAll(".fk:not([disabled])").forEach(b => { const id = +b.dataset.id; b.onclick = () => choose(id); b.onmouseenter = () => scene.hoverFork(id); b.onmouseleave = () => scene.hoverFork(-1); }); scene.showFork(f.allowed, choose); }
  }
  function choose(id) { if (!V || V.phase !== "fork") return; scene.clearFork(); submit({ t: "choose", node: id }); }

  /* ---------- wheel of lives ---------- */
  const PAL = [["#ef476f", "#b02a4d"], ["#1e9be9", "#0b63a8"], ["#06c28f", "#038a65"], ["#f6b93b", "#b97b0a"], ["#7b5cd6", "#523a9e"], ["#ff8a3d", "#c25a12"]];
  let wheel = null, wheelOrder = [];
  function ensureWheel() {
    if (wheel) { wheel.resize(); return; }
    wheelOrder = GOL.characters.slice();
    const entries = wheelOrder.map((c, k) => ({ label: shortName(c), color: PAL[k % 6][0], dark: PAL[k % 6][1], img: GOL.thumbOf(c) }));
    wheel = GOL.Wheel($("mpWheelCv"), entries, { portraits: true, simple: true }); wheel.onTick = () => SND.roll(); wheel.start();
  }
  function renderWheel() {
    const p = V.players[V.turn], w = $("mpWheel"), my = mine(); w.hidden = false; $("mpWheelRev").hidden = true; w.classList.remove("rev"); ensureWheel();
    $("mpWheelTitle").innerHTML = `${chip(p)} ${my ? "spins the wheel of lives" : "is about to spin…"}`;
    $("mpWheelAct").innerHTML = my ? `<button class="big gold mp-primary" id="mpSpin">Spin the wheel!</button>` : `<p class="mp-wait">⏳ ${esc(p.name)} is spinning. Everybody gets a different life.</p>`;
    const b = $("mpSpin"); if (b) b.onclick = () => submit({ t: "spin" });
    setTimeout(() => wheel && wheel.resize(), 30);
  }
  async function playAssign(e) {
    const pl = V.players[e.p], c = char(e.char), w = $("mpWheel"); w.hidden = false; $("mpWheelRev").hidden = true; ensureWheel(); $("mpWheelAct").innerHTML = ""; $("mpWheelTitle").innerHTML = `${chip(pl)} spins…`;
    SND.roll(); await wheel.spin(wheelOrder.findIndex(x => x.id === e.char), FAST ? 300 : 4200); SND.win();
    const pf = PR()[e.char], rev = $("mpWheelRev"); rev.style.setProperty("--c", c.avatar.color);
    rev.innerHTML = `<div class="reveal2" style="--c:${c.avatar.color}"><div class="avatar big-av">${GOL.portrait(c)}</div><div class="rtxt"><small class="kick">${esc(pl.name)} becomes</small><h2>${esc(c.name)}</h2><small>${esc(c.years)} · ${esc(c.focus)}</small>${c.fictional ? `<span class="tag">Fictional character</span>` : ""}
      <p>${esc(pf.intro)}</p>${zoneChips(pf)}<p class="advline">${ADVICON[pf.advantage.type]} <b>${esc(pf.advantage.title)}</b> · ${pf.advantage.uses}×: ${esc(pf.advantage.text)}</p>${(pf.balance || {}).comp ? `<p class="advline">⚖ <b>Game balance</b> · ${pf.balance.comp} extra steps (a game rule, not part of the story, so every figure has the same chance to win)</p>` : ""}${c.note ? `<p class="muted"><b>${esc(c.note)}</b></p>` : ""}<button class="big gold" id="mpRevOk">Let’s go!</button></div></div>`;
    rev.hidden = false; w.classList.add("rev"); scene.setLabel(e.p, pl.name, shortName(c)); scene.setFigure(e.p, pf.look);
    await new Promise(res => { const t = setTimeout(res, FAST ? 200 : 9000); $("mpRevOk").onclick = () => { clearTimeout(t); res(); }; });
    rev.hidden = true; w.classList.remove("rev"); if (e.order.filter(Boolean).length === V.players.length) w.hidden = true;
  }
  function labelSeats() { V.players.forEach(p => { if (p.char) { scene.setLabel(p.id, p.name, shortName(char(p.char))); scene.setFigure(p.id, PR()[p.char].look); } }); }
  function evLine(pf, id) { const e = (pf.evidence || []).find(x => x.id === id); return e ? `<small class="evl">Documented (${esc(e.y)}): ${esc(e.ev)} <i>Source: ${esc(pf.sources[e.src])}</i></small>` : ""; }
  function zoneChips(pf) {
    const Z = ZN(), t = { fast: "⚡", slow: "🐢", block: "⛔" };
    return `<div class="zchips">${Object.keys(pf.zones).map(z => `<span class="zc fx-${pf.zones[z].fx}" title="${esc(pf.zones[z].why)}">${t[pf.zones[z].fx]} ${Z[z].icon} ${Z[z].label}</span>`).join("")}</div>`;
  }
  /* "My figure" panel: routes, strength, the 12 life stations and which ones are done */
  function showFigure() {
    if (!V) return; const p = V.players[mode === "local" ? V.turn : (me != null ? me : V.turn)], pf = prof(p), c = pf && char(p.char); if (!pf) return;
    const K = { barrier: "🚧", boost: "⭐", info: "📖", quiz: "❓" }, Z = ZN(), fxw = { fast: "fast", slow: "slow", block: "closed" };
    const I = $("mpInfo"); I.hidden = false;
    I.innerHTML = `<div class="mp-infocard" style="--c:${c.avatar.color}"><button class="mp-x" id="mpInfoX" aria-label="Close">✕</button><div class="reveal2" style="box-shadow:none;border:0;padding:0"><div class="avatar big-av">${GOL.portrait(c)}</div><div class="rtxt"><small class="kick">${esc(p.name)} plays</small><h2>${esc(c.name)}</h2><small>${esc(c.years)} · ${esc(c.focus)}</small><p>${esc(pf.intro)}</p></div></div>
      <h3>Routes that are different for you</h3><ul class="zl">${Object.keys(pf.zones).map(z => `<li class="fx-${pf.zones[z].fx}"><b>${Z[z].icon} ${Z[z].label} (${esc(Z[z].domain)}): ${fxw[pf.zones[z].fx]}.</b> ${esc(pf.zones[z].why)}${evLine(pf, pf.zones[z].ev)}</li>`).join("")}</ul>
      <h3>Your strength</h3><p>${ADVICON[pf.advantage.type]} <b>${esc(pf.advantage.title)}</b> · ${p.left} of ${pf.advantage.uses} left. ${esc(pf.advantage.text)}</p>${p.comp !== undefined && (pf.balance || {}).comp ? `<h3>Game balance</h3><p>⚖ ${p.comp} of ${pf.balance.comp} balance steps left. <small>This is a rule of the game, not a statement about the person: all figures should have the same chance to win, so the balance steps are added to your rolls automatically (up to 3 per roll) until they are used up.</small></p>` : ""}
      <h3>Your 12 life stations</h3><ol class="ll">${pf.life.map((t, i) => { const done = p.seen && Object.keys(p.seen).some(id => board.nodes[id] && board.nodes[id].life === i + 1); return `<li class="${done ? "done" : ""}">${done ? `${K[t.k]} <b>${esc(t.title)}</b>` : `<span>Station ${i + 1}: not reached yet</span>`}</li>`; }).join("")}</ol></div>`;
    $("mpInfoX").onclick = () => I.hidden = true;
  }
  $("mpFigure").onclick = showFigure;

  /* ---------- end ---------- */
  function showEnd() {
    ended = true;
    const w = V.players[V.winner], rank = V.players.slice().sort((a, b) => (b.id === V.winner) - (a.id === V.winner) || dist.minOf(a.pos) - dist.minOf(b.pos));
    const rows = rank.map((p, i) => `<tr class="${p.id === V.winner ? "win" : ""}"><td>${i + 1}</td><td><span class="pdot" style="--c:${E.COLORS[p.color].hex}"></span>${esc(p.name)}</td><td>${p.char ? esc(shortName(char(p.char))) : ""}</td><td>${p.correct}</td><td>${p.asked}</td><td>${p.steps}</td></tr>`).join("");
    const again = mode === "guest" ? `<p class="mp-small">Waiting for the host to start another round…</p>` : `<button class="big gold" id="mpAgain">Play again</button>`;
    $("mpEnd").innerHTML = `<div class="mp-endcard"><div class="trophy">🏆</div><p class="eyebrow">We have a winner</p><h2>${esc(w.name)} reached the finish!</h2>
      <table><thead><tr><th></th><th>Player</th><th>Figure</th><th>Right</th><th>Cards</th><th>Steps</th></tr></thead><tbody>${rows}</tbody></table>
      <p class="mp-reflect">Every life station and card was about a real or fictional person who faced barriers and prejudice. Which life surprised you most? Try the Single Player mode to walk through one life in depth.</p>
      <div class="mp-btns">${again}<button class="mp-skip" id="mpMenu">Back to the menu</button></div></div>`;
    $("mpEnd").hidden = false; hidePanels();
    for (let i = 0; i < 60; i++) { const d = document.createElement("i"); d.className = "cf"; d.style.left = Math.random() * 100 + "vw"; d.style.background = ["#ef476f", "#ffa62b", "#ffd23f", "#06c28f", "#1e9be9", "#7b5cd6"][i % 6]; d.style.animationDelay = Math.random() * 1.5 + "s"; $("mpEnd").appendChild(d); setTimeout(() => d.remove(), 6000); }
    const ag = $("mpAgain"); if (ag) ag.onclick = () => { if (mode === "host") hostStart(); else startLocal(V.players.map(p => p.name)); };
    $("mpMenu").onclick = goMode;
  }

  /* ---------- hud buttons & keys ---------- */
  function setFollowBtn(on) { $("mpFollow").classList.toggle("on", on); $("mpOverview").classList.toggle("on", !on); }
  $("mpFollow").onclick = () => { scene.mode("follow"); setFollowBtn(true); };
  $("mpOverview").onclick = () => { scene.mode("overview"); setFollowBtn(false); };
  $("mpMute").onclick = () => { muted = !muted; $("mpMute").textContent = muted ? "🔇" : "🔊"; };
  $("mpQuit").onclick = () => { if (confirm(mode === "local" ? "Leave this game and go back to the menu?" : "Leave this online game?")) goMode(); };
  window.addEventListener("keydown", e => {
    if ($("screen-mp").hidden || !V) return;
    if (e.key === " " || e.key === "Enter") { const b = document.querySelector("#screen-mp .mp-primary:not([hidden])"); if (b && b.offsetParent && document.activeElement && document.activeElement.tagName !== "BUTTON") { e.preventDefault(); b.click(); } }
    else if (/^[1-3]$/.test(e.key)) { const b = document.querySelector(`#mpCard .mp-opt[data-i="${+e.key - 1}"]:not([disabled])`); if (b) b.click(); }
  });
  window.addEventListener("resize", () => scene && scene.resize());

  /* =====================  ONLINE  ===================== */
  const lobbyHTML = (list, you) => list.map((p, i) => `<div class="lb">${pawnChip(i)}<b>${esc(p.name)}</b>${p.host ? "<em>host</em>" : ""}${i === you ? "<em class=\"me\">you</em>" : ""}</div>`).join("") || "<p class=\"mp-small\">Nobody yet</p>";
  function resetLobby() { lobby = []; $("hostForm").hidden = false; $("hostRoom").hidden = true; $("joinForm").hidden = false; $("joinRoom").hidden = true; ["hostErr", "joinErr"].forEach(i => $(i).hidden = true); $("hostCreate").disabled = false; $("joinGo").disabled = false; }
  function netErr(which, msg) {
    const el = $(which + "Err"); if (net) { net.close(); net = null; } resetLobby(); el.textContent = msg; el.hidden = false;
    if (G || V) { /* game is running: show on end overlay instead */ }
  }

  /* --- host --- */
  const sendLobby = () => { lobby.forEach((p, i) => { if (!p.host) net.sendTo(p.peer, { t: "lobby", players: lobby.map(x => ({ name: x.name, host: !!x.host })), you: i }); }); };
  const showHostLobby = () => { $("hostLobby").innerHTML = lobbyHTML(lobby, 0); $("hostGo").disabled = lobby.length < 2; $("hostGo").textContent = lobby.length < 2 ? "Waiting for friends…" : "Start the game"; };
  $("hostCreate").onclick = () => {
    $("hostCreate").disabled = true; $("hostErr").hidden = true;
    const name = $("hostName").value.trim() || "Player 1"; lobby = [{ name, host: true, peer: null }];
    net = MP.Net.host({
      onReady: code => { $("hostForm").hidden = true; $("hostRoom").hidden = false; $("roomCode").textContent = code; drawQR($("qrHost"), `${siteUrl()}?join=${code}`); showHostLobby(); },
      onError: e => netErr("host", e.message),
      onMessage: (peer, m) => {
        if (m.t === "hello") {
          let i = lobby.findIndex(p => p.peer === peer);
          if (G && i < 0) { net.sendTo(peer, { t: "full", why: "This game has already started." }); return; }
          if (i < 0 && lobby.length >= 6) { net.sendTo(peer, { t: "full", why: "This game is full (6 players)." }); return; }
          if (i < 0) lobby.push({ name: String(m.name || "Player").slice(0, 14), peer });
          showHostLobby(); sendLobby();
        } else if (m.t === "act" && G && G.phase !== "over") {
          const pid = lobby.findIndex(p => p.peer === peer);
          if (pid >= 0 && pid === G.turn && m.a && ["answer", "task", "next", "roll", "choose", "spin", "hint", "skipq"].includes(m.a.t)) commit(m.a);
        }
      },
      onLeave: peer => {
        const i = lobby.findIndex(p => p.peer === peer); if (i < 0) return;
        if (!G) { lobby.splice(i, 1); showHostLobby(); sendLobby(); }
        else { G.players[i].away = true; if (G.turn === i && G.phase !== "over") commit({ t: "skip" }); else { const snap = E.snapshot(G); net.broadcast({ t: "upd", ev: [], snap }); enqueue([], snap); } }
      }
    });
  };
  $("hostCancel").onclick = () => { if (net) net.close(); net = null; resetLobby(); };
  /* QR codes are drawn locally (vendor/qrcode.js), no external service. On file:// or localhost the public address is used. */
  const PUBLIC_URL = "https://paru918spy.github.io/game-of-different-lives/";
  const siteUrl = () => /^https?:$/.test(location.protocol) && !/^(localhost|127\.|0\.0\.0\.0)/.test(location.hostname) ? location.origin + location.pathname : PUBLIC_URL;
  function drawQR(el, text) {
    try { const q = window.qrcode(0, "M"); q.addData(text); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 6, margin: 2, scalable: true }); el.title = text; } catch (e) { el.textContent = text; }
  }
  drawQR($("qrSite"), siteUrl());
  $("copyLink").onclick = async () => {
    const link = `${siteUrl()}?join=${$("roomCode").textContent}`;
    try { await navigator.clipboard.writeText(link); $("copyMsg").textContent = " Copied!"; } catch (e) { $("copyMsg").textContent = " " + link; }
  };
  function hostStart() {
    mode = "host"; me = 0; prepare();
    G = E.create({ names: lobby.map(p => p.name), board, questions: MP.Questions, chars: chars() });
    const snap = E.snapshot(G); net.broadcast({ t: "start", snap }); mount(snap);
  }
  $("hostGo").onclick = () => { if (lobby.length >= 2) hostStart(); };

  /* --- guest --- */
  $("joinGo").onclick = () => {
    const code = $("joinCode").value.trim(); if (code.length < 5) { netErr("join", "Please type the 5-letter code from the host."); return; }
    $("joinGo").disabled = true; $("joinErr").hidden = true; const name = $("joinName").value.trim() || "Player";
    net = MP.Net.join(code, {
      onOpen: () => { net.send({ t: "hello", name }); $("joinForm").hidden = true; $("joinRoom").hidden = false; },
      onError: e => netErr("join", e.message),
      onClose: () => {
        if (!V) { netErr("join", "The host closed the game."); return; }
        if (!ended) { const b = $("mpEnd"); b.innerHTML = `<div class="mp-endcard"><h2>The host left the game</h2><p class="mp-reflect">The game cannot continue without the host.</p><div class="mp-btns"><button class="big gold" id="mpMenu">Back to the menu</button></div></div>`; b.hidden = false; $("mpMenu").onclick = goMode; }
      },
      onMessage: m => {
        if (m.t === "lobby") { me = m.you; $("joinLobby").innerHTML = lobbyHTML(m.players, m.you); }
        else if (m.t === "full") netErr("join", m.why);
        else if (m.t === "start") { mode = "guest"; G = null; prepare(); mount(m.snap); }
        else if (m.t === "upd" && V) enqueue(m.ev, m.snap);
      }
    });
  };
  $("joinCancel").onclick = () => { if (net) net.close(); net = null; resetLobby(); };
  $("joinCode").oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); };

  /* ---------- debug / test hooks ---------- */
  MP.debug = { get G() { return G; }, get V() { return V; }, get scene() { return scene; }, get mode() { return mode; }, board: () => board, start: (n, seed) => { names = []; startLocal(Array.from({ length: n || 2 }, (_, i) => "Player " + (i + 1)), seed); }, submit, show, E,
    teleport: (pid, node, phase) => { G.players[pid].pos = node; G.turn = pid; if (phase) G.phase = phase; const snap = E.snapshot(G); V = E.attach(clone(snap), board, MP.Questions, chars()); const pos = {}; V.players.forEach(p => pos[p.id] = p.pos); scene.place(pos); scene.setActive(pid); render(); } };
  if (/[?&]mp=(\d)/.test(location.search)) { const n = +RegExp.$1; window.addEventListener("load", () => MP.debug.start(n, 7)); }
  else if (/[?&]mode\b/.test(location.search)) window.addEventListener("load", () => show("screen-mode"));
  else if (/[?&]join=([A-Za-z0-9]{5})/.test(location.search)) { const code = RegExp.$1.toUpperCase(); window.addEventListener("load", () => { openSetup("join"); $("joinCode").value = code; }); }
})();
