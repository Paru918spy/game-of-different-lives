/* Game of Different Lives: game logic (no dependencies). */
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const COLS = 5, CW = 180, CH = 170, TW = 150, TH = 124, BW = COLS * CW;
  const ICON = { start: "🏠", info: "📖", win: "⭐", barrier: "🚧", choice: "🔀", finish: "🏁" };
  const TYPE_LABEL = { en: { start: "Start", info: "Story", win: "Milestone", barrier: "Barrier", choice: "Decision", finish: "Finish" } };

  let S = null; // game state
  const ui = () => GOL.ui;

  const view = ch => ch;

  /* ---------- character select ---------- */
  const FILTERS = [["all", "All lives", null], ["disability", "Disability", /disab|blind|deaf|autism|pain|wheelchair/i],
    ["race", "Race & racism", /race|racism|apartheid|segregation/i], ["gender", "Gender & identity", /gender|identity|sexuality|non-binary|queer/i],
    ["age", "Age", /\bage\b/i], ["fiction", "Fictional", "f"]];
  let filter = "all";
  function matches(c) {
    const f = FILTERS.find(x => x[0] === filter);
    if (!f || !f[2]) return true;
    return f[2] === "f" ? !!c.fictional : f[2].test(c.focus);
  }
  function renderSelect() {
    $("filters").innerHTML = FILTERS.map(f => `<button class="chipf${f[0] === filter ? " on" : ""}" data-f="${f[0]}">${f[1]}</button>`).join("");
    document.querySelectorAll("[data-f]").forEach(b => b.onclick = () => { filter = b.dataset.f; renderSelect(); });
    $("title").textContent = ui().title;
    document.title = ui().title;
    $("lead").textContent = ui().lead;
        $("note").textContent = ui().note;
    $("cards").innerHTML = GOL.characters.filter(matches).map(c => {
      const v = view(c);
      return `<article class="pcard" style="--c:${c.avatar.color}">
        <div class="avatar big-av">${GOL.portrait(c)}</div>
        ${c.fictional ? '<span class="tag">Fictional character</span>' : ""}<h3>${esc(v.name)}</h3><small>${esc(c.years)} · ${esc(c.focus)}</small>
        <p>${esc(v.tagline)}</p>${c.note ? `<small class="cn">${esc(c.note)}</small>` : ""}
        <button class="big" data-play="${c.id}">${ui().play}</button></article>`;
    }).join("");
    document.querySelectorAll("[data-play]").forEach(b => b.onclick = () => start(b.dataset.play));
  }

  /* ---------- board ---------- */
  function pos(i) {
    const row = Math.floor(i / COLS), c = i % COLS, col = row % 2 ? COLS - 1 - c : c;
    return { x: col * CW + CW / 2, y: row * CH + CH / 2 };
  }

  function renderBoard() {
    const tiles = S.ch.tiles, rows = Math.ceil(tiles.length / COLS), BH = rows * CH;
    const pts = tiles.map((_, i) => pos(i));
    const path = pts.map((p, i) => (i ? "L" : "M") + p.x + " " + p.y).join(" ");
    const hues = ["#f59e0b", "#10b981", "#ef4444", "#3b82f6", "#a855f7", "#14b8a6"];
    let html = `<svg class="road" width="${BW}" height="${BH}"><path d="${path}" class="road-edge"/><path d="${path}" class="road-line"/></svg>`;
    tiles.forEach((t, i) => {
      const p = pos(i);
      html += `<div class="tile t-${t.type}" id="tile${i}" style="left:${p.x - TW / 2}px;top:${p.y - TH / 2}px;width:${TW}px;height:${TH}px;--h:${hues[t.stage % hues.length]}">
        <span class="n">${i + 1}</span><span class="ic">${ICON[t.type]}</span><span class="tt">${esc(t.title)}</span></div>`;
    });
    html += `<div id="pawn" class="pawn" style="background:${S.base.avatar.color}">${S.base.avatar.emoji}</div>`;
    $("boardWrap").style.setProperty("--c", S.base.avatar.color);
    const b = $("board");
    b.style.width = BW + "px"; b.style.height = BH + "px";
    b.innerHTML = html;
    placePawn(false);
    fit();
  }

  function fit() {
    if (!S) return;
    const rows = Math.ceil(S.ch.tiles.length / COLS), BH = rows * CH;
    const w = $("boardWrap").clientWidth || BW, s = Math.min(1, w / BW);
    $("board").style.transform = `scale(${s})`;
    $("boardWrap").style.height = BH * s + "px";
  }
  window.addEventListener("resize", fit);

  function placePawn(animate = true) {
    const p = pos(S.pos), el = $("pawn");
    el.style.transition = animate ? "left .45s ease, top .45s ease" : "none";
    el.style.left = p.x - 22 + "px"; el.style.top = p.y - 70 + "px";
    document.querySelectorAll(".tile").forEach((t, i) => {
      t.classList.toggle("visited", i < S.pos);
      t.classList.toggle("here", i === S.pos);
    });
    const tile = S.ch.tiles[S.pos];
    $("chapter").textContent = S.ch.stages[tile.stage];
  }

  /* ---------- HUD ---------- */
  function renderHud() {
    const u = ui();
    $("hName").textContent = S.ch.name; $("hYears").textContent = S.base.years;
    $("avatar").innerHTML = GOL.portrait(S.base); $("avatar").style.background = S.base.avatar.color;
    $("chapLabel").textContent = u.chapter; $("hopeLabel").textContent = u.hope; $("supLabel").textContent = u.support;
    $("spin").textContent = S.busy ? u.spinning : u.spin; $("spin").disabled = S.busy;
    $("quit").textContent = u.quit;
    $("hopeBar").style.width = S.hope * 10 + "%";
    $("supDots").innerHTML = [0, 1, 2].map(i => `<span class="${i < S.support ? "on" : ""}"></span>`).join("");
    const t = S.ch.tiles[S.pos];
    $("status").textContent = S.blocked ? ui().gateText(t.gate.need, t.gate.label) : "";
  }

  /* ---------- wheel ---------- */
  function buildWheel() {
    const cols = ["#f59e0b", "#10b981", "#3b82f6"];
    let h = "";
    for (let k = 0; k < 6; k++) {
      const a0 = k * 60 * Math.PI / 180, a1 = (k + 1) * 60 * Math.PI / 180, r = 100;
      const x0 = r * Math.sin(a0), y0 = -r * Math.cos(a0), x1 = r * Math.sin(a1), y1 = -r * Math.cos(a1);
      const am = (k * 60 + 30) * Math.PI / 180, tx = 66 * Math.sin(am), ty = -66 * Math.cos(am);
      h += `<path d="M0 0 L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z" fill="${cols[k % 3]}" stroke="#fff" stroke-width="3"/>
            <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="central" font-size="30" font-weight="800" fill="#fff">${(k % 3) + 1}</text>`;
    }
    h += `<circle r="12" fill="#fff" stroke="#8b5e34" stroke-width="3"/>`;
    $("wheel").innerHTML = `<g id="wheelG" style="transform-origin:0 0;transition:transform 2s cubic-bezier(.15,.7,.1,1)">${h}</g>`;
  }
  let wheelRot = 0;
  async function spinWheel() {
    const k = Math.floor(Math.random() * 6);
    const target = -(k * 60 + 30);
    const delta = (((target - wheelRot) % 360) + 360) % 360;
    wheelRot += 360 * 4 + delta;
    $("wheelG").style.transform = `rotate(${wheelRot}deg)`;
    await sleep(2100);
    return (k % 3) + 1;
  }

  /* ---------- modal ---------- */
  function modal(html, cls) {
    return new Promise(resolve => {
      const m = $("modal"), c = $("modalCard");
      c.className = "card " + (cls || "");
      c.innerHTML = html;
      m.hidden = false;
      const done = (v) => { m.hidden = true; resolve(v); };
      c.querySelectorAll("[data-done]").forEach(b => b.onclick = () => done(b.dataset.done));
      const first = c.querySelector("button"); if (first) first.focus();
    });
  }

  function chips(e) {
    if (!e) return "";
    const u = ui(), out = [];
    if (e.hope > 0) out.push(`<span class="chip up">${u.hopeUp(e.hope)}</span>`);
    if (e.hope < 0) out.push(`<span class="chip down">${u.hopeDown(-e.hope)}</span>`);
    if (e.support > 0) out.push(`<span class="chip up">${u.support1}</span>`);
    return out.length ? `<div class="chips">${out.join("")}</div>` : "";
  }
  function apply(e) {
    if (!e) return;
    S.hope = clamp(S.hope + (e.hope || 0), 0, 10);
    S.support = clamp(S.support + (e.support || 0), 0, 3);
    renderHud();
  }

  function header(t, i) {
    const tl = TYPE_LABEL.en[t.type];
    return `<div class="ch-head h-${t.type}"><span>${ICON[t.type]} ${tl}</span><span>${ui().tile} ${i + 1} ${ui().of} ${S.ch.tiles.length}</span></div>
      <h2>${esc(t.title)}</h2>${t.illustrative || S.base.fictional ? `<div class="ill">${S.base.fictional ? "Fictional story" : ui().illustrative}</div>` : ""}`;
  }

  async function showTile(t, i) {
    const u = ui();
    if (t.type === "choice") {
      const pick = await modal(`${header(t, i)}<p>${esc(t.text)}</p><h4>${u.choose}</h4>
        <div class="opts">${t.options.map((o, k) => `<button class="opt" data-done="${k}">${esc(o.label)}</button>`).join("")}</div>`, "c-choice");
      const o = t.options[+pick];
      apply(o.effects);
      await modal(`${header(t, i)}<p><em>${esc(o.result)}</em></p>${chips(o.effects)}
        <div class="real"><h4>${u.realTitle}</h4><p>${esc(t.reveal)}</p></div>
        <button class="big" data-done="1">${u.gotIt}</button>`, "c-choice");
      return;
    }
    apply(t.effects);
    (SND[t.type] || SND.step)();
    let extra = "";
    if (t.gate) extra = `<div class="gate"><b>${u.gateTitle}</b><br>${esc(u.gateText(t.gate.need, t.gate.label))}</div>`;
    await modal(`${header(t, i)}<p>${esc(t.text)}</p>${chips(t.effects)}${extra}<button class="big" data-done="1">${u.gotIt}</button>`, "c-" + t.type);
  }

  /* ---------- sound (WebAudio, no files) ---------- */
  let muted = false, ac = null;
  function tone(freqs, dur = .18, type = "sine", vol = .08) {
    if (muted) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + i * dur * .8;
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
        o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + dur);
      });
    } catch (e) { /* audio unavailable */ }
  }
  const SND = { step: () => tone([440], .08, "triangle"), win: () => tone([523, 659, 784], .2), barrier: () => tone([196, 147], .25, "sawtooth", .05), spin: () => tone([330, 392, 440, 523], .1, "triangle") };
  $("mute").onclick = () => { muted = !muted; $("mute").textContent = muted ? "🔇" : "🔊"; };

  /* ---------- gameplay ---------- */
  function start(id) {
    const base = GOL.characters.find(c => c.id === id);
    S = { base, ch: view(base), pos: 0, hope: base.start.hope, support: base.start.support,
          turns: 0, barriers: 0, lost: 0, fails: 0, blocked: false, busy: false };
    $("screen-select").hidden = true; $("screen-end").hidden = true; $("screen-game").hidden = false;
    buildWheel(); renderBoard(); renderHud();
    modal(`<div class="ch-head h-start"><span>🏠 ${ui().chapter}</span></div><h2>${esc(S.ch.name)}</h2><p>${esc(S.ch.intro)}</p>${S.base.note ? `<p class="muted"><b>${esc(S.base.note)}</b></p>` : ""}
      <button class="big" data-done="1">${ui().gotIt}</button>`, "c-start").then(async () => {
      await showTile(S.ch.tiles[0], 0);
    });
  }

  async function spin() {
    if (S.busy) return;
    S.busy = true; renderHud();
    const u = ui();
    SND.spin();
    const r = await spinWheel();
    S.turns++;
    let steps = r;
    if (S.blocked) {
      const t = S.ch.tiles[S.pos], bonus = S.support + (S.fails >= 2 ? 1 : 0), need = t.gate.need;
      if (r + bonus >= need) {
        S.blocked = false; S.fails = 0;
        await modal(`<h2>${u.gateTitle}</h2><p>${u.gateSpin(r, bonus, need)}</p><p><b>${u.gatePass}</b></p><button class="big" data-done="1">${u.gotIt}</button>`, "c-win");
      } else {
        S.lost++; S.fails++; S.hope = clamp(S.hope - 1, 0, 10);
        await modal(`<h2>${u.gateTitle}</h2><p>${u.gateSpin(r, bonus, need)}</p><p><b>${u.gateFail}</b></p>
          <p class="muted">${u.withoutBarrier}</p>${S.fails >= 2 ? `<p class="muted">${u.gatePersist}</p>` : ""}${chips({ hope: -1 })}
          <button class="big" data-done="1">${u.gotIt}</button>`, "c-barrier");
        S.busy = false; renderHud(); return;
      }
    }
    for (let n = 0; n < steps; n++) {
      S.pos++; placePawn(); renderHud();
      await sleep(500);
      const t = S.ch.tiles[S.pos];
      await showTile(t, S.pos);
      if (t.type === "finish") return end();
      if (t.gate) { S.blocked = true; S.barriers++; break; }
    }
    S.busy = false; renderHud();
  }

  function end() {
    const u = ui(), e = S.ch.ending;
    $("screen-game").hidden = true; $("screen-end").hidden = false;
    $("screen-end").innerHTML = `<div class="endcard" style="--c:${S.base.avatar.color}">
      <div class="avatar big-av">${GOL.portrait(S.base)}</div>
      <small>${u.endTitle}</small><h2>${esc(S.ch.name)}</h2><h3>${esc(e.headline)}</h3>
      <div class="stats">
        <div><b>${S.turns}</b>${u.sTurns}</div><div><b>${S.barriers}</b>${u.sBarriers}</div>
        <div><b>${S.lost}</b>${u.sLost}</div><div><b>${S.hope}/10</b>${u.sHope}</div><div><b>${S.support}/3</b>${u.sSupport}</div>
      </div>
      <h4>${u.realStory}</h4><p>${esc(e.real)}</p>
      <h4>${u.reflect}</h4><ul>${e.reflect.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <h4>${u.sources}</h4><ul class="src">${S.base.sources.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <button class="big" id="again">${u.again}</button> <button class="link" id="replay">${u.replay}</button></div>`;
    $("again").onclick = home; $("replay").onclick = () => start(S.base.id);
    window.scrollTo(0, 0);
  }

  function home() {
    S = null;
    $("screen-game").hidden = true; $("screen-end").hidden = true; $("screen-select").hidden = false;
    $("modal").hidden = true;
  }

  /* ---------- wire up ---------- */
  $("spin").onclick = spin;
  $("quit").onclick = home;
  renderSelect();
  window.GOL.debug = { start, get state() { return S; } };
})();
