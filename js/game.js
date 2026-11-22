/* Game of Different Lives: game flow. A wheel of fortune assigns a life; a 3D board tells it. */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const ICON = { start: "🏠", info: "📖", win: "⭐", barrier: "🚧", choice: "🔀", finish: "🏁" };
  const TYPE_LABEL = { start: "Start", info: "Story", win: "Milestone", barrier: "Barrier", choice: "Decision", finish: "Finish" };
  const ui = () => GOL.ui;
  let S = null, board = null, spinner = null, wheel = null, wheelEntries = [], order = [], lifeIdx = -1;

  /* ---------- sound (WebAudio, no files) ---------- */
  let muted = false, ac = null;
  function tone(freqs, dur = .18, type = "sine", vol = .08) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * dur * .8;
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur); });
    } catch (e) { /* audio unavailable */ }
  }
  const SND = { step: () => tone([440], .08, "triangle"), win: () => tone([523, 659, 784, 1046], .2), barrier: () => tone([196, 147], .25, "sawtooth", .05),
    spin: () => tone([330, 392, 440, 523], .1, "triangle"), tick: () => tone([1500 + Math.random() * 300], .03, "square", .025), bridge: () => tone([392, 523, 659, 784, 988], .14, "triangle"),
    back: () => tone([330, 262, 220, 165], .16, "sawtooth", .05), fanfare: () => tone([523, 523, 659, 784, 659, 784, 1046], .16, "triangle", .09) };
  $("mute").onclick = () => { muted = !muted; $("mute").textContent = muted ? "🔇" : "🔊"; };

  /* ---------- home: the wheel of fortune ---------- */
  const PALETTE = [["#ef476f", "#b02a4d"], ["#ffa62b", "#c57400"], ["#ffd23f", "#c9a000"], ["#06c28f", "#038a65"], ["#1e9be9", "#0b63a8"], ["#7b5cd6", "#523a9e"], ["#ff7bac", "#c94a7c"]];
  const shortName = c => c.fictional ? c.name : c.name.replace(/ Jr\.$/, "").split(" ").slice(-1)[0];
  function showAbout(on) { $("screen-about").hidden = !on; $("screen-home").hidden = on; if (!on && wheel) { wheel.resize(); wheel.start(); } window.scrollTo(0, 0); }
  function buildLogo() {
    const words = ["Game", "of", "Different", "Lives"], cols = ["#ef476f", "#ffa62b", "#ffd23f", "#06c28f", "#1e9be9", "#7b5cd6", "#ff7bac"]; let k = 0;
    document.querySelectorAll(".abrand").forEach(el => { let j = 0; el.innerHTML = words.map(w => `<span class="w">${[...w].map(ch => `<b style="--c:${cols[j++ % 7]};--d:${(j % 5) * -.3}s">${ch}</b>`).join("")}</span>`).join(" "); el.setAttribute("aria-label", "Game of Different Lives"); });
    $("logo").innerHTML = words.map(w => `<span class="w">${[...w].map(ch => `<b style="--c:${cols[k++ % 7]};--d:${(k % 5) * -.3}s">${ch}</b>`).join("")}</span>`).join(" ");
    $("lead").textContent = ui().lead;
    $("note").textContent = ui().note;
    $("how").innerHTML = ui().how.map((h, i) => `<li><a href="#step-${i}" data-i="${i}">${h[0]}</a></li>`).join("");
    $("how").querySelectorAll("a").forEach(a => a.onclick = async e => { e.preventDefault(); const i = +a.dataset.i, h = ui().how[i]; if (i === 0) { $("spinLife").scrollIntoView({ behavior: "smooth", block: "center" }); $("spinLife").focus(); return; } await modal(`<div class="body"><h2>${h[0]}</h2><p>${h[1]}</p><button class="big" data-done="1">${ui().close}</button></div>`); });
    $("spinLife").textContent = ui().spinLife;
  }
  function initWheel() {
    order = GOL.characters.map((_, i) => i).sort(() => Math.random() - .5);
    wheelEntries = order.map((ci, k) => { const c = GOL.characters[ci], p = PALETTE[k % PALETTE.length]; return { label: shortName(c), color: p[0], dark: p[1], img: GOL.thumbOf(c) }; });
    if (wheel) wheel.dispose();
    wheel = GOL.Wheel($("wheelCv"), wheelEntries, { portraits: true, simple: true });
    wheel.onTick = SND.tick; wheel.start();
  }
  let spinningLife = false;
  async function spinLife() {
    if (spinningLife) return; spinningLife = true; $("spinLife").disabled = true; $("spinLife").textContent = ui().spinning;
    for (let again = true; again;) {
      lifeIdx = Math.floor(Math.random() * order.length);
      SND.spin(); await wheel.spin(lifeIdx, GOL.fast ? 300 : 4800);
      SND.fanfare(); await sleep(300);
      again = (await reveal(GOL.characters[order[lifeIdx]])) === "again";
      if (again) { $("spinLife").textContent = ui().spinning; await sleep(250); }
    }
    spinningLife = false; $("spinLife").disabled = false; $("spinLife").textContent = ui().spinLife;
  }
  async function reveal(c) {
    const tags = (c.fictional ? `<span class="tag">Fictional character</span>` : "");
    const pick = await modal(`<div class="reveal" style="--c:${c.avatar.color}">
      <div class="avatar big-av">${GOL.portrait(c)}</div>
      <small class="kick">${ui().revealKick}</small>${tags}<h2>${esc(c.name)}</h2><small>${esc(c.years)} · ${esc(c.focus)}</small>
      <p>${esc(c.tagline)}</p>${c.note ? `<p class="muted"><b>${esc(c.note)}</b></p>` : ""}${GOL.credit(c) ? `<div class="credit-row">${GOL.credit(c)}</div>` : ""}
      <button class="big gold" data-done="1">${ui().begin}</button><button class="again" data-done="again">↻ ${ui().spinAgain}</button></div>`, "c-reveal");
    if (pick === "again") return "again";
    start(c.id);
  }

  /* ---------- modal ---------- */
  function modal(html, cls) {
    return new Promise(resolve => {
      const m = $("modal"), c = $("modalCard");
      c.className = "card " + (cls || ""); c.innerHTML = html; m.hidden = false; c.scrollTop = 0;
      const done = v => { m.hidden = true; resolve(v); };
      c.querySelectorAll("[data-done]").forEach(b => b.onclick = () => done(b.dataset.done));
      const first = c.querySelector("button"); if (first) first.focus();
    });
  }
  function chips(e) {
    if (!e) return ""; const u = ui(), out = [];
    if (e.hope > 0) out.push(`<span class="chip up">${u.hopeUp(e.hope)}</span>`);
    if (e.hope < 0) out.push(`<span class="chip down">${u.hopeDown(-e.hope)}</span>`);
    if (e.support > 0) out.push(`<span class="chip up">${u.support1}</span>`);
    return out.length ? `<div class="chips">${out.join("")}</div>` : "";
  }
  function apply(e) { if (!e) return; S.hope = clamp(S.hope + (e.hope || 0), 0, 10); S.support = clamp(S.support + (e.support || 0), 0, 3); renderHud(); }

  /* ---------- event pictures: real photo with credit, or an illustrated scene ---------- */
  function figure(t, i) {
    const ev = (GOL.events[S.base.id] || {})[i];
    if (ev) {
      const lic = ev.licenseUrl ? `<a href="${esc(ev.licenseUrl)}" target="_blank" rel="noopener">${esc(ev.license)}</a>` : esc(ev.license);
      return `<figure class="pic photo"><img src="${esc(ev.file)}" alt="${esc(ev.alt || t.title)}" onerror="this.parentNode.outerHTML=GOL.sceneFig(${i})"><figcaption><span class="credit">${esc(ev.author)} · ${lic} · <a href="${esc(ev.source)}" target="_blank" rel="noopener">Wikimedia Commons</a></span></figcaption></figure>`;
    }
    return `<figure class="pic scene">${GOL.scene(t, S.base.avatar.color, S.ch.id)}<figcaption><span class="credit">${ui().illustrationNote}</span></figcaption></figure>`;
  }
  GOL.sceneFig = i => `<figure class="pic scene">${GOL.scene(S.ch.tiles[i], S.base.avatar.color, S.ch.id)}</figure>`;
  function header(t, i) {
    return `<div class="ch-head h-${t.type}"><span>${ICON[t.type]} ${TYPE_LABEL[t.type]}</span><span>${ui().tile} ${i + 1} ${ui().of} ${S.ch.tiles.length}</span></div>`;
  }
  const ill = t => (t.illustrative || S.base.fictional) ? `<div class="ill">${S.base.fictional ? "Fictional story" : ui().illustrative}</div>` : "";

  const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  const FACE = { 1: "", 2: "rotateY(-90deg)", 3: "rotateX(-90deg)", 4: "rotateX(90deg)", 5: "rotateY(90deg)", 6: "rotateY(180deg)" };
  function diceHtml(r, need, ok) {
    const f = k => `<div class="df f${k}">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<i${PIPS[k].includes(i) ? ' class="on"' : ""}></i>`).join("")}</div>`;
    return `<div class="diceRow"><div class="dieWrap"><div class="die" style="--end:${FACE[r] || ""}">${[1, 2, 3, 4, 5, 6].map(f).join("")}</div></div><div class="needTag ${ok ? "ok" : "no"}"><span>${ok ? "🔓" : "🔒"}</span><b>need ${need}</b><small>you spun ${r}</small></div></div>`;
  }
  async function showTile(t, i, replay) {
    const u = ui(), fig = figure(t, i);
    if (t.type === "choice" && !replay) {
      const pick = await modal(`${fig}<div class="body">${header(t, i)}<h2>${esc(t.title)}</h2>${ill(t)}<p>${esc(t.text)}</p><h4>${u.choose}</h4>
        <div class="opts">${t.options.map((o, k) => `<button class="opt" data-done="${k}">${esc(o.label)}</button>`).join("")}</div></div>`, "c-choice");
      const o = t.options[+pick]; apply(o.effects);
      await modal(`${fig}<div class="body">${header(t, i)}<h2>${esc(t.title)}</h2><p><em>${esc(o.result)}</em></p>${chips(o.effects)}
        <div class="real"><h4>${u.realTitle}</h4><p>${esc(t.reveal)}</p></div><button class="big" data-done="1">${u.gotIt}</button></div>`, "c-choice");
      return;
    }
    if (replay) { await modal(`${fig}<div class="body">${header(t, i)}<h2>${esc(t.title)}</h2>${ill(t)}<p>${esc(t.text)}</p>${t.reveal ? `<div class="real"><h4>${u.realTitle}</h4><p>${esc(t.reveal)}</p></div>` : ""}<button class="big" data-done="1">${u.close}</button></div>`, "c-" + t.type); return; }
    apply(t.effects); (SND[t.type] || SND.step)();
    if (t.type === "win" || t.type === "finish") board.celebrate(i);
    let extra = "";
    if (t.gate) extra = `<div class="gate"><b>${u.gateTitle}</b><br>${esc(u.gateText(3, t.gate.label))}</div>`;
    await modal(`${fig}<div class="body">${header(t, i)}<h2>${esc(t.title)}</h2>${ill(t)}<p>${esc(t.text)}</p>${chips(t.effects)}${extra}<button class="big" data-done="1">${u.gotIt}</button></div>`, "c-" + t.type);
  }

  /* ---------- HUD ---------- */
  function renderHud() {
    const u = ui(); if (!S) return;
    $("hName").textContent = S.ch.name; $("hYears").textContent = S.base.years;
    $("avatar").innerHTML = GOL.portrait(S.base); $("avatar").style.background = S.base.avatar.color;
    $("chapLabel").textContent = u.chapter; $("hopeLabel").textContent = u.hope; $("supLabel").textContent = u.support;
    $("spin").textContent = S.busy ? u.spinning : u.spin; $("spin").disabled = S.busy;
    $("hopeBar").style.width = S.hope * 10 + "%";
    $("supDots").innerHTML = [0, 1, 2].map(i => `<span class="${i < S.support ? "on" : ""}"></span>`).join("");
    const t = S.ch.tiles[S.pos]; $("chapter").innerHTML = `${S.ch.stages[t.stage]} <em class="stn">${S.pos + 1}/${S.ch.tiles.length}</em><i class="prog"><b style="width:${Math.round((S.pos + 1) / S.ch.tiles.length * 100)}%"></b></i>`;
    $("status").textContent = S.blocked ? u.gateText(3, t.gate.label) : u.yourTurn;
    $("quit").title = u.quit;
    refreshBridges();
  }
  function refreshBridges() { S.ch.bridges.forEach((b, k) => board.setBridge(k, S.used.has(k) ? "used" : (S.support > 0 ? "open" : "closed"))); }
  function buildLegend() {
    $("legend").innerHTML = ["start", "win", "barrier", "choice"].map(k => `<span><i class="lg lg-${k}"></i>${TYPE_LABEL[k]}</span>`).join("") + `<span><i class="lg lg-bridge"></i>Bridge</span><span><i class="lg lg-back"></i>Setback</span>`;
    $("hint").textContent = ui().hint;
  }

  /* ---------- gameplay ---------- */
  async function start(id) {
    const base = GOL.characters.find(c => c.id === id);
    S = { base, ch: base, pos: 0, hope: base.start.hope, support: base.start.support, turns: 0, barriers: 0, lost: 0, fails: 0, bonus: 0, blocked: false, busy: false,
          seen: new Set([0]), passed: new Set(), done: new Set(), used: new Set(), skipped: new Set(), bridges: 0, backs: 0 };
    $("screen-home").hidden = true; $("screen-end").hidden = true; $("screen-game").hidden = false; document.body.classList.add("ingame");
    wheel.stop();
    if (!board) { board = GOL.Board3D($("boardCv")); board.onHover = hoverTip; board.onPick = pickTile; board.onFollow = f => $("follow").classList.toggle("on", f); board.autoFollow = true; }
    if (!spinner) { spinner = GOL.Wheel($("spinCv"), [1, 2, 3, 1, 2, 3].map((n, i) => ({ label: String(n), color: ["#ef476f", "#1e9be9", "#06c28f"][i % 3], dark: ["#b02a4d", "#0b63a8", "#038a65"][i % 3] })), { compact: true }); spinner.onTick = SND.tick; }
    board.build(base); board.markVisited(0); board.start(); spinner.start(); renderHud(); buildLegend();
    await sleep(400);
    await modal(`<div class="body"><div class="ch-head h-start"><span>🏠 ${ui().chapter}</span></div><h2>${esc(S.ch.name)}</h2><p>${esc(S.ch.intro)}</p>${S.base.note ? `<p class="muted"><b>${esc(S.base.note)}</b></p>` : ""}
      <button class="big" data-done="1">${ui().gotIt}</button></div>`, "c-start");
    if (!S) return;
    await showTile(S.ch.tiles[0], 0);
  }

  async function spin() {
    if (!S || S.busy) return;
    S.busy = true; board.busy = true; renderHud();
    const u = ui(); SND.spin();
    const idx = GOL.force && GOL.force.length ? GOL.force.shift() - 1 : Math.floor(Math.random() * 6); await spinner.spin(idx, GOL.fast ? 300 : 1900); const r = (idx % 3) + 1;
    S.turns++; let steps = r;
    if (S.blocked) {
      const t = S.ch.tiles[S.pos], bonus = 0, need = 3;
      if (r >= need) {
        S.blocked = false; S.fails = 0; S.bonus = 0; S.passed.add(S.pos); board.openGate(S.pos); SND.win();
        await modal(`<div class="body"><h2>${u.gateTitle}</h2>${diceHtml(r, need, true)}<p><b>${u.gatePass}</b></p><button class="big" data-done="1">${u.gotIt}</button></div>`, "c-win");
      } else {
        S.lost++; S.fails++; S.hope = clamp(S.hope - 1, 0, 10); SND.barrier(); document.body.classList.add("hurt"); setTimeout(() => document.body.classList.remove("hurt"), 700);
        const k = S.ch.setbacks.findIndex(s => s.at === S.pos && !S.done.has(s.at));
        if (S.fails >= 2 && k >= 0) { await setback(k, r, bonus, need); S.busy = false; board.busy = false; renderHud(); return; }
        await modal(`<div class="body"><h2>${u.gateTitle}</h2>${diceHtml(r, need, false)}<p><b>${u.gateFail}</b></p>
          <p class="muted">${u.withoutBarrier}</p>${chips({ hope: -1 })}<button class="big" data-done="1">${u.gotIt}</button></div>`, "c-barrier");
        S.busy = false; board.busy = false; renderHud(); return;
      }
    }
    for (let n = 0; n < steps; n++) {
      const from = S.pos; S.pos++; SND.step(); await board.hop(from, S.pos); renderHud();
      const t = S.ch.tiles[S.pos], first = !S.seen.has(S.pos);
      if (first) { S.seen.add(S.pos); board.markVisited(S.pos); await showTile(t, S.pos); }
      if (t.type === "finish") { S.busy = false; return end(); }
      if (t.gate && !S.passed.has(S.pos)) { S.blocked = true; if (first) S.barriers++; else await modal(`<div class="body"><h2>${u.gateTitle}</h2><p>${esc(u.gateText(3, t.gate.label))}</p><button class="big" data-done="1">${u.gotIt}</button></div>`, "c-barrier"); break; }
      const bk = S.ch.bridges.findIndex((b, k) => b.from === S.pos && !S.used.has(k));
      if (bk >= 0) { const crossed = await offerBridge(bk); if (crossed) { if (S.pos === S.ch.tiles.length - 1) { S.busy = false; return end(); } const nt = S.ch.tiles[S.pos]; if (nt.gate && !S.passed.has(S.pos)) { S.blocked = true; S.barriers++; break; } } }
    }
    S.busy = false; board.busy = false; renderHud();
  }

  async function offerBridge(k) {
    const b = S.ch.bridges[k], u = ui(), skipped = []; for (let i = b.from + 1; i < b.to; i++) skipped.push(S.ch.tiles[i]);
    const can = S.support > 0; board.setBridge(k, can ? "open" : "closed");
    const list = skipped.length ? `<p class="muted">${u.bridgeSkips(skipped.map(x => x.title))}</p>` : "";
    const pic = `<figure class="pic scene">${GOL.sceneNamed("bridge", S.base.avatar.color)}</figure>`;
    if (!can) { await modal(`${pic}<div class="body"><div class="ch-head h-bridge"><span>🌉 ${u.bridge}</span></div><h2>${u.bridgeClosedTitle}</h2><p>${esc(b.label)}</p><p>${u.bridgeClosed}</p><button class="big" data-done="1">${u.gotIt}</button></div>`, "c-barrier"); return false; }
    SND.bridge();
    const pick = await modal(`${pic}<div class="body"><div class="ch-head h-bridge"><span>🌉 ${u.bridge}</span></div><h2>${u.bridgeTitle}</h2><p>${esc(b.label)}</p>${list}
      <div class="opts"><button class="opt" data-done="go">${u.bridgeCross}</button><button class="opt" data-done="stay">${u.bridgeWalk}</button></div></div>`, "c-win");
    if (pick !== "go") return false;
    S.support = clamp(S.support - 1, 0, 3); S.used.add(k); S.bridges++; for (let i = b.from + 1; i < b.to; i++) { S.skipped.add(i); S.seen.add(i); board.markVisited(i); }
    renderHud(); await board.cross(k); S.pos = b.to; board.arrive(b.to); board.markVisited(b.to); renderHud();
    if (!S.seen.has(b.to)) { S.seen.add(b.to); await showTile(S.ch.tiles[b.to], b.to); }
    return true;
  }

  async function setback(k, r, bonus, need) {
    const sb = S.ch.setbacks[k], u = ui(); S.done.add(sb.at); S.backs++; SND.back();
    await modal(`<figure class="pic scene">${GOL.sceneNamed("storm", S.base.avatar.color)}</figure><div class="body"><div class="ch-head h-barrier"><span>↩️ ${u.setback}</span></div><h2>${u.setbackTitle}</h2><p>${u.gateSpin(r, bonus, need)}</p><p>${esc(sb.label)}</p>
      <p class="muted">${u.setbackNote}</p>${chips({ hope: -1 })}<button class="big" data-done="1">${u.goBack}</button></div>`, "c-barrier");
    await board.slideBack(k); S.pos = sb.to; S.blocked = false; S.fails = 0; board.arrive(sb.to); renderHud();
  }

  /* ---------- hover / click on tiles ---------- */
  function hoverTip(i, x, y) {
    const tip = $("tip");
    if (i < 0 || !S) { tip.hidden = true; return; }
    const t = S.ch.tiles[i], seen = S.seen.has(i);
    tip.hidden = false; tip.style.left = x + 14 + "px"; tip.style.top = y + 14 + "px";
    tip.innerHTML = `<b>${i + 1}. ${seen || i === 0 ? esc(t.title) : "?"}</b><small>${TYPE_LABEL[t.type]}${seen ? " · " + ui().clickReplay : ""}</small>`;
  }
  async function pickTile(i) { if (!S || S.busy || !S.seen.has(i) || !$("modal").hidden) return; await showTile(S.ch.tiles[i], i, true); }

  /* ---------- end ---------- */
  function end() {
    const u = ui(), e = S.ch.ending; board.stop(); spinner.stop(); document.body.classList.remove("ingame");
    $("screen-game").hidden = true; $("screen-end").hidden = false;
    const skippedBarriers = [...S.skipped].map(i => S.ch.tiles[i]).filter(t => t.type === "barrier");
    $("screen-end").innerHTML = `<div class="endcard" style="--c:${S.base.avatar.color}">
      <div class="avatar big-av">${GOL.portrait(S.base)}</div>
      <small>${u.endTitle}</small><h2>${esc(S.ch.name)}</h2><h3>${esc(e.headline)}</h3>
      <div class="stats">
        <div><b>${S.turns}</b>${u.sTurns}</div><div><b>${S.barriers}</b>${u.sBarriers}</div><div><b>${S.lost}</b>${u.sLost}</div>
        <div><b>${S.backs}</b>${u.sBacks}</div><div><b>${S.bridges}</b>${u.sBridges}</div><div><b>${S.hope}/10</b>${u.sHope}</div>
      </div>
      ${skippedBarriers.length ? `<div class="real"><h4>${u.skippedTitle}</h4><p>${u.skippedText(skippedBarriers.map(t => t.title))}</p></div>` : ""}
      <h4>${u.realStory}</h4><p>${esc(e.real)}</p>
      <h4>${u.reflect}</h4><ul>${e.reflect.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <h4>${u.sources}</h4><ul class="src">${S.base.sources.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <button class="big gold" id="again">${u.again}</button> <button class="link" id="replay">${u.replay}</button></div>`;
    $("again").onclick = home; $("replay").onclick = () => start(S.base.id);
    window.scrollTo(0, 0); SND.fanfare();
    for (let i = 0; i < 70; i++) { const d = document.createElement("i"); d.className = "cf"; d.style.left = Math.random() * 100 + "vw"; d.style.background = ["#ef476f", "#ffa62b", "#ffd23f", "#06c28f", "#1e9be9", "#7b5cd6"][i % 6]; d.style.animationDuration = 2.5 + Math.random() * 2.5 + "s"; d.style.animationDelay = Math.random() * 1.2 + "s"; document.body.appendChild(d); setTimeout(() => d.remove(), 7000); }
  }
  function home() {
    if (board) board.stop(); if (spinner) spinner.stop(); S = null; document.body.classList.remove("ingame");
    $("screen-game").hidden = true; $("screen-end").hidden = true; $("screen-home").hidden = false; $("modal").hidden = true; $("tip").hidden = true;
    initWheel();
  }

  /* ---------- wire up ---------- */
  $("playNow").onclick = $("playNow2").onclick = $("playNow3").onclick = () => showAbout(false); $("aboutLink").onclick = e => { e.preventDefault(); showAbout(true); };
  const TOPIC_ICON = { no: '<circle cx="12" cy="12" r="9"/><path d="M6 18L18 6"/>', rainbow: '<circle cx="12" cy="9" r="4"/><path d="M12 13v8M9 18h6M15 6l5-4M17 2h3v3"/>', globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>', chair: '<circle cx="9" cy="4" r="2"/><path d="M9 7v7h6l3 6M9 11h5"/><circle cx="9" cy="17" r="4"/>', scale: '<path d="M12 3v17M7 20h10M4 7h16M4 7l-2 7h6zM20 7l-2 7h6z"/>', hands: '<path d="M12 21C5 15 3 12 3 8.500a4.500 4.500 0 018-2.700A4.500 4.500 0 0121 8.500C21 12 19 15 12 21z"/>', circles: '<circle cx="9" cy="10" r="5"/><circle cx="15" cy="10" r="5"/><circle cx="12" cy="15" r="5"/>', ring: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="2.500"/><path d="M7 17q5-6 10 0"/>' };
  /* ---------- topic info pages ---------- */
  const TOPICS = {
    discrimination: ["Discrimination", "Treating people worse than others because of a characteristic such as origin, gender, disability, age, religion or sexual orientation, without a good reason.", ["Unequal treatment", "Prejudice", "Exclusion"], "In the game: Turing, Jonas, Kaepernick"],
    gender: ["Gender identity", "A person’s inner sense of their own gender, for example woman, man, both or neither. It can differ from the sex recorded at birth.", ["Self-determination", "Respect", "Names and pronouns"], "In the game: Cox, Sam"],
    racism: ["Racism", "Treating people as unequal because of their origin, skin colour or culture, through prejudice and insults, but also through unfair rules and structures.", ["Prejudice", "Segregation", "Structures"], "In the game: Parks, King, Mandela, Johnson"],
    disability: ["Disability", "A long-term physical, mental, sensory or learning impairment. Barriers in buildings, rules and attitudes are what turn it into exclusion.", ["Access", "Attitudes", "Support"], "In the game: Hawking, Keller, Heumann, Grandin, Beethoven"],
    equal: ["Equal opportunities", "Everyone gets a fair chance at education, work and taking part in society, whatever their background. Fair does not always mean the same: some people need more support.", ["Fairness", "Access", "Support"], "In the game: Malala, Curie, Johnson"],
    tolerance: ["Tolerance", "Respecting people, beliefs and ways of living that differ from our own, even if we do not share them. It ends where others are harmed or excluded.", ["Respect", "Openness", "Limits"], "In the game: all 21 lives"],
    diversity: ["Diversity", "The variety of people in a society: origin, gender, age, abilities, beliefs and ways of life. Diversity is a strength when everyone has a voice.", ["Variety", "Perspectives", "Strength"], "In the game: all 21 lives"],
    inclusion: ["Inclusion", "Everyone can take part fully from the start. Society adapts to people, not people to society.", ["Belonging", "Participation", "Accessibility"], "In the game: all 21 lives"]
  };
  const TKEYS = Object.keys(TOPICS);
  function showTopic(k) {
    const t = TOPICS[k]; if (!t) return; const i = TKEYS.indexOf(k);
    $("screen-about").hidden = true; $("screen-home").hidden = true; $("screen-topic").hidden = false; window.scrollTo(0, 0);
    $("tTitle").textContent = t[0]; $("tDef").textContent = t[1]; $("tKeys").innerHTML = t[2].map(x => `<span>${x}</span>`).join(""); $("tGame").textContent = t[3];
    const ic = document.querySelector(`.tp[data-topic="${k}"] svg`); $("tIcon").innerHTML = ic ? ic.outerHTML : "";
    $("tPrev").onclick = e => { e.preventDefault(); showTopic(TKEYS[(i + TKEYS.length - 1) % TKEYS.length]); }; $("tNext").onclick = e => { e.preventDefault(); showTopic(TKEYS[(i + 1) % TKEYS.length]); };
  }
  document.querySelectorAll(".tp[data-topic]").forEach(t => { t.onclick = () => showTopic(t.dataset.topic); t.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); showTopic(t.dataset.topic); } }; });
  $("tBack").onclick = e => { e.preventDefault(); $("screen-topic").hidden = true; showAbout(true); const el = $("a-topics"); el && el.scrollIntoView(); };
  $("tPlay").onclick = () => { $("screen-topic").hidden = true; showAbout(false); };
  document.querySelectorAll(".tp").forEach(t => { t.insertAdjacentHTML("afterbegin", `<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round">${TOPIC_ICON[t.dataset.ic] || ""}</svg>`); });
  $("spin").onclick = spin; $("spinCv").addEventListener("click", () => spinner && spinner.skip()); $("wheelCv").addEventListener("click", () => wheel && wheel.skip()); $("spinLife").addEventListener("dblclick", () => wheel && wheel.skip()); $("spinLife").onclick = spinLife; $("quit").onclick = home;
  $("follow").onclick = () => board.setFollow(!$("follow").classList.contains("on"));
  $("overview").onclick = () => board.overview();
  window.addEventListener("keydown", e => { if (e.code === "Space" && !e.repeat && $("modal").hidden) { e.preventDefault(); if (S && !$("screen-game").hidden) spin(); else if (!$("screen-home").hidden) spinLife(); } });
  buildLogo(); initWheel();
  /* preload event photos once the home screen is idle so cards open instantly */
  setTimeout(() => { try { Object.values(GOL.events || {}).forEach(o => Object.values(o).forEach(e => { const im = new Image(); im.decoding = "async"; im.src = e.file; })); } catch (e) {} }, 2500);
  /* FPS overlay: press F (or open index.html?fps) */
  (function () { let el = null, id = 0; const show = on => { if (!on) { el && el.remove(); el = null; clearInterval(id); return; } el = document.createElement("div"); el.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:200;background:#000c;color:#9f9;font:12px/1.4 monospace;padding:6px 8px;border-radius:6px;pointer-events:none;white-space:pre"; document.body.appendChild(el); id = setInterval(() => { const P = board && board.perf; if (P && P.fps != null) el.textContent = `${P.fps} fps  frame ${P.avg} ms (worst ${P.worstS})\nslow frames/s ${P.slowS}\ndraw calls ${P.calls}  tris ${P.tris}\ngeometries ${P.geo}  textures ${P.tex}`; }, 500); };
    window.addEventListener("keydown", e => { if (e.key === "f" || e.key === "F") show(!el); }); if (/[?&]fps/.test(location.search)) show(true); })();
  window.GOL.debug = { start, end, spin, showTile, offerBridge, setback, spinLife, home, get state() { return S; }, get board() { return board; }, get wheel() { return wheel; }, modal };
})();
