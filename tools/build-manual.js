/* node tools/build-manual.js  ->  manual.html (web page + print layout, English and German in one file)
   The board sketch is drawn from the real board data (js/mp/board.js), so it cannot drift from the game.
   PDFs: see tools/build-manual-pdf.sh (headless Chrome prints manual.html?lang=en|de). */
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
const B = require(path.join(root, "js/mp/board.js"));
const E = require(path.join(root, "js/mp/engine.js"));
const CAT = E.CATEGORY, ZONES = B.ZONES;
const board = B.build();

/* ---------- board sketch (inline SVG) ---------- */
const LETTER = { stairs: "A", ladder: "B", rope: "C", bridge: "D", ramp: "E", market: "F", tunnel: "G", office: "H", sprint: "I", quiet: "J" };
const SX = 13;
const allN = Object.values(board.nodes), PADX = 9, PADZ = 8;
const MINX = Math.min(...allN.map(n => n.x)) - PADX, MAXX = Math.max(...allN.map(n => n.x)) + PADX;
const MINZ = Math.min(...allN.map(n => n.z)) - PADZ - 2, MAXZ = Math.max(...allN.map(n => n.z)) + PADZ;
const OX = -MINX, OZ = -MINZ;
const px = n => ((n.x + OX) * SX).toFixed(1), pz = n => ((n.z + OZ) * SX).toFixed(1);
function boardSVG(L) {
  const nodes = allN, W = Math.round((MAXX - MINX) * SX), H = Math.round((MAXZ - MINZ) * SX);
  let s = `<svg class="boardsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${L.boardAlt}" xmlns="http://www.w3.org/2000/svg">`;
  s += `<defs><radialGradient id="bg${L.k}" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#fffdf6"/><stop offset="1" stop-color="#ffe9a8"/></radialGradient></defs>`;
  s += `<rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="34" fill="url(#bg${L.k})" stroke="#fff" stroke-width="6"/><rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="34" fill="none" stroke="#e0a82e" stroke-width="2" stroke-dasharray="3 9" opacity=".7"/>`;
  // roads: wide tinted underlay for routes, then the walking line
  let under = "", road = "";
  for (const n of nodes) for (const t of n.next) {
    const m = board.nodes[t], zone = m.zone || n.zone;
    const d = `M${px(n)} ${pz(n)}L${px(m)} ${pz(m)}`;
    if (zone) under += `<path d="${d}" stroke="${ZONES[zone].color}" stroke-width="22" stroke-linecap="round" opacity=".28"/>`;
    road += `<path d="${d}" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="${d}" stroke="#c9a66b" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 7"/>`;
  }
  s += `<g fill="none">${under}${road}</g>`;
  // fields
  for (const n of nodes) {
    if (n.type === "start" || n.type === "finish") continue;
    const c = CAT[n.type];
    if (n.type === "life") s += `<g><circle cx="${px(n)}" cy="${pz(n)}" r="17" fill="${c.color}" stroke="${c.dark}" stroke-width="3"/><text x="${px(n)}" y="${(+pz(n) + 5.5).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="800" fill="#4a2b00">${n.life}</text></g>`;
    else s += `<circle cx="${px(n)}" cy="${pz(n)}" r="9.5" fill="${c.color}" stroke="${c.dark}" stroke-width="2.5"/>`;
  }
  // route pills + fork tags
  for (const sec of board.sections) for (const r of sec.routes) {
    const mid = board.nodes[r.ids[Math.floor(r.ids.length / 2)]], z = ZONES[r.zone];
    // offset pill away from the road, towards the outside of the curve
    const a = board.nodes[r.first], b = board.nodes[r.last];
    const cx = (a.x + b.x) / 2, cz = (a.z + b.z) / 2, dx = mid.x - cx, dz = mid.z - cz, len = Math.hypot(dx, dz) || 1;
    const ox = mid.x + dx / len * 2.3, oz = mid.z + dz / len * 2.3;
    const X = ((ox + OX) * SX).toFixed(1), Z = ((oz + OZ) * SX).toFixed(1);
    s += `<g><rect x="${(X - 17).toFixed(1)}" y="${(Z - 13).toFixed(1)}" width="34" height="26" rx="13" fill="${z.color}" stroke="#fff" stroke-width="3"/><text x="${X}" y="${(+Z + 6).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">${LETTER[r.zone]}</text></g>`;
  }
  const J = board.junctions;
  ["1a", "2a", "3a", "4a", "5a", "6a"].forEach((k, i) => {
    const n = board.nodes[J[k]], X = +px(n), Z = +pz(n);
    const dx = n.x - 1, dz = n.z - 1, len = Math.hypot(dx, dz) || 1;
    const tx = X + dx / len * 44, tz = Z + dz / len * 34;
    s += `<g><rect x="${(tx - 40).toFixed(1)}" y="${(tz - 12).toFixed(1)}" width="80" height="24" rx="12" fill="#fff" stroke="#3a2410" stroke-width="2"/><text x="${tx.toFixed(1)}" y="${(tz + 5.5).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="800" fill="#3a2410">${L.fork} ${i + 1}</text></g>`;
  });
  // start + finish
  const S = board.nodes[board.start], F = board.nodes[board.finish];
  s += `<g><circle cx="${px(S)}" cy="${pz(S)}" r="27" fill="#fff" stroke="#0fb5a0" stroke-width="6"/><text x="${px(S)}" y="${(+pz(S) + 6).toFixed(1)}" text-anchor="middle" font-size="17" font-weight="800" fill="#077567">${L.start}</text></g>`;
  s += `<g><circle cx="${px(F)}" cy="${pz(F)}" r="40" fill="#ffe27a" stroke="#e08e0b" stroke-width="6"/><circle cx="${px(F)}" cy="${pz(F)}" r="31" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="4 5"/><text x="${px(F)}" y="${(+pz(F) + 6).toFixed(1)}" text-anchor="middle" font-size="17" font-weight="800" fill="#4a2b00">${L.finish}</text><path d="M${px(F)} ${(+pz(F) - 46).toFixed(1)}v-26" stroke="#3a2410" stroke-width="3"/><path d="M${px(F)} ${(+pz(F) - 72).toFixed(1)}h24l-7 8 7 8h-24z" fill="#ef476f" stroke="#b02a4d" stroke-width="2"/></g>`;
  // direction arrow near start
  s += `<text x="${(+px(S) + 8).toFixed(1)}" y="${(+pz(S) + 52).toFixed(1)}" font-size="14" font-weight="700" fill="#3a2410" text-anchor="middle">${L.go} ↑</text>`;
  return s + "</svg>";
}

/* ---------- texts ---------- */
const zoneInfo = {
  en: {
    stairs: ["Stairway", "Buildings and transport: can you get in?"], ladder: ["Tree ladders", "Schools and training: the way up"], rope: ["Rope bridge", "A shaky way: threats and violence"],
    bridge: ["Stone bridge", "Allies, family, community and mentors"], ramp: ["Long ramp", "Aids and accessible design"], market: ["Busy market", "Work, money and the public eye"],
    tunnel: ["Dark tunnel", "Isolation and communication barriers"], office: ["Town hall", "Laws, papers and authorities"], sprint: ["Race track", "Sport, stamina and competition"], quiet: ["Quiet lane", "Calm and focus: study, craft, creative work"]
  },
  de: {
    stairs: ["Treppe", "Gebäude und Verkehr: Kommst du rein?"], ladder: ["Baumleitern", "Schule und Ausbildung: der Weg nach oben"], rope: ["Hängebrücke", "Ein wackliger Weg: Drohungen und Gewalt"],
    bridge: ["Steinbrücke", "Verbündete, Familie, Gemeinschaft und Mentoren"], ramp: ["Lange Rampe", "Hilfsmittel und barrierefreie Gestaltung"], market: ["Trubeliger Markt", "Arbeit, Geld und Öffentlichkeit"],
    tunnel: ["Dunkler Tunnel", "Isolation und Verständigungsbarrieren"], office: ["Rathaus", "Gesetze, Papiere und Behörden"], sprint: ["Rennbahn", "Sport, Ausdauer und Wettkampf"], quiet: ["Ruhiger Weg", "Ruhe und Fokus: lernen, basteln, kreativ arbeiten"]
  }
};
const fieldInfo = {
  en: {
    life: ["Life station", "A moment from the life of your figure (numbered 1 to 12). You stop here once. Story stops on the road work the same way, without a question."],
    quiz: ["Quiz", "One question card. Four kinds: Who am I?, Life & Barriers, True or False?, Words Matter. Right: stay. Wrong: back to your last safe field."],
    gate: ["Hurdle", "You have to stop and answer. Right: go on with the rest of your roll. Wrong: you stay, the rest of the roll is lost."],
    luck: ["Luck", "Tailwind (2 or 3 fields forward), setback (2 or 3 back) or roll again. The card tells you what happened."]
  },
  de: {
    life: ["Lebensstation", "Ein Moment aus dem Leben deiner Figur (nummeriert 1 bis 12). Hier hältst du einmal an. Geschichten-Stopps auf der Straße funktionieren genauso, ohne Frage."],
    quiz: ["Quiz", "Eine Fragekarte. Vier Arten: Wer bin ich?, Leben & Barrieren, Wahr oder falsch?, Worte zählen. Richtig: du bleibst. Falsch: zurück zum letzten sicheren Feld."],
    gate: ["Hürde", "Du musst anhalten und antworten. Richtig: mit dem Rest des Wurfs weiter. Falsch: du bleibst stehen, der Rest des Wurfs verfällt."],
    luck: ["Glück", "Rückenwind (2 oder 3 Felder vor), Rückschlag (2 oder 3 zurück) oder nochmal würfeln. Die Karte sagt dir, was passiert ist."]
  }
};
const fieldOrder = ["quiz", "life", "gate", "luck"], GRP = E.GROUPS;
const zoneOrder = ["stairs", "ladder", "rope", "bridge", "ramp", "market", "tunnel", "office", "sprint", "quiet"];

const LANGS = {
  en: {
    k: "en", htmlLang: "en", boardAlt: "Sketch of the game board with start, six forks with three routes each, twelve life stations and the finish",
    fork: "Fork", start: "START", finish: "FINISH", go: "go",
    tag: "Game manual", title: "Lebenswege – Game of Lives", sub: "Walk in someone else's shoes. Cross barriers. Find bridges.",
    chips: ["2 to 6 players", "21 lives", "101 fields", "1 goal: fairness"],
    coverNote: "Real people, real stories. Fictional characters are always marked.",
    nav: { play: "Play", back: "← Back to the game", pdf: "Download PDF", other: "Deutsch", otherHref: "manual.html?lang=de" },
    h1: "The idea", idea: [
      "You do not play yourself. A <b>wheel of lives</b> decides who you become: one of 21 people, most of them real, who met barriers, prejudice or doubt and found their way anyway.",
      "On the board you feel what that means. Some roads are open to you, some are closed. Questions and story stops show what these lives were really like.",
      "The goal is not only to win the race. It is to <b>understand</b>: Equal dignity. Equal chances."],
    needT: "What you need", need: ["A phone, tablet or computer with a browser. No install, no account.", "2 to 6 players. One device for everybody, or one device each.", "About 30 to 45 minutes (a 2-player game is 12 to 15 rounds)."],
    startT: "Start in three ways", modes: [
      ["📱", "One device", "Press <b>Play</b>, then <b>Multiplayer</b> and <b>One device</b>. Choose 2 to 6 players, enter names and start. Pass the device around."],
      ["🌐", "Host online game", "One person chooses <b>Host online game</b> and shares the <b>5-letter code</b> or lets friends scan the QR code."],
      ["🔑", "Join with code", "Friends open the page, choose <b>Join with code</b>, type the code and wait in the lobby. The host starts the game."]],
    qrNote: "Scan to open the game", soloT: "Alone? Choose Single Player: you spin the wheel and walk through one life in detail.",
    boardT: "The board at a glance", boardLead: "A big loop of <b>101 fields</b>. Everyone starts at the same place and runs for the finish in the middle. Six times the road splits: you choose one of three routes.",
    callouts: [["Same road for all", "The main road and its fields are the same for everybody."], ["Forks", "Six forks with three routes each. Short cuts are quicker but have more hurdles and setbacks."], ["Life stations", "The 12 gold numbers tell your figure's story and move you."], ["Your figure matters", "Some routes are slow, fast or closed for you, because of what your real person experienced."]],
    legendRoutes: "Routes at a fork (letters on the board)", legendFields: "Fields (colours on the board)", fieldsT: "What the fields do",
    turnT: "Your turn", turn: [
      ["Roll", "Roll the die and walk exactly that many fields. Every field is one step, on every route."],
      ["Choose at forks", "At a fork pick one of three routes. Routes that are closed for your figure are greyed out and tell you why."],
      ["Read the card", "The field where you stop decides what happens: a question, a story, a push forward or back."],
      ["Right or wrong", "Right answer: you stay. Wrong answer: back to your last safe field (start of your turn or last stop). Then it is the next player's turn."]],
    specialT: "Good to know", special: [
      ["⚡ DOUBLE card", "About one card in five is a double card. Answer right and you walk the same number of fields again."],
      ["🚧 Hurdles and life stations", "They stop you once. Hurdles only let you pass with a right answer. A life station moves you forward or back, tells a story, or asks a bonus question."],
      ["🏁 Winning", "The first pawn that reaches the finish wins. You do not need an exact roll."]],
    figT: "Your figure and its strength", figLead: "At the start every player spins the wheel and becomes a different figure. Open the 📖 button in the game to see your routes, strength and life stations.",
    fx: [["⛔ Closed", "You cannot choose this route, and the game tells you why."]],
    strT: "One strength card (2 or 3 uses)", str: [["💡", "Hint", "Removes a wrong answer."], ["🛡️", "Shield", "A wrong answer does not send you back."], ["🎲", "Second chance", "Roll two dice, keep the higher one."], ["🚀", "Lift", "Add 2 to your roll."], ["🎟️", "Free pass", "Count one question as right."]],
    fair: "Everything that closes a route or sets you back comes from a documented event in the life of your figure. There are no hidden bonus steps: you walk exactly what you roll.",
    talkT: "Talk about it", talk: ["After the game: Which barrier surprised you? Which bridge helped most?", "Which words did you not know were hurtful? What would you do differently tomorrow?", "Every life page names its sources. Real photos come from Wikimedia Commons with credit."],
    singleT: "Single Player in short", single: ["Spin the wheel: you get one life. You do not choose.", "Roll the spinner (1, 2 or 3 fields). Every field tells a piece of the real story.", "Barrier fields stop you: you need a 3 to pass. A miss costs a turn and Hope.", "Bridges are shortcuts that cost 1 Support. Two failed barriers can throw you back (setback).", "At the end you see the real story, your stats and questions to reflect on."],
    footer: "A school project on diversity, tolerance and inclusion · Play: paru918spy.github.io/game-of-different-lives", pg: "Page"
  },
  de: {
    k: "de", htmlLang: "de", boardAlt: "Skizze des Spielbretts mit Start, sechs Weggabelungen mit je drei Wegen, zwölf Lebensstationen und dem Ziel",
    fork: "Gabel", start: "START", finish: "ZIEL", go: "los",
    tag: "Spielanleitung", title: "Lebenswege – Game of Lives", sub: "Geh in fremden Schuhen. Überwinde Barrieren. Finde Brücken.",
    chips: ["2 bis 6 Spieler", "21 Leben", "101 Felder", "1 Ziel: Fairness"],
    coverNote: "Echte Menschen, echte Geschichten. Erfundene Figuren sind immer gekennzeichnet.",
    nav: { play: "Spielen", back: "← Zurück zum Spiel", pdf: "PDF herunterladen", other: "English", otherHref: "manual.html?lang=en" },
    h1: "Die Idee", idea: [
      "Du spielst nicht dich selbst. Ein <b>Lebensrad</b> entscheidet, wer du wirst: eine von 21 Personen, die meisten echt, die auf Barrieren, Vorurteile oder Zweifel gestoßen sind und trotzdem ihren Weg gefunden haben.",
      "Auf dem Brett spürst du, was das bedeutet. Manche Wege sind für dich offen, manche langsamer, manche versperrt. Fragen und Geschichten-Stopps zeigen, wie diese Leben wirklich waren.",
      "Das Ziel ist nicht nur, das Rennen zu gewinnen. Es geht ums <b>Verstehen</b>: gleiche Würde, gleiche Chancen."],
    needT: "Was du brauchst", need: ["Handy, Tablet oder Computer mit Browser. Keine Installation, kein Konto.", "2 bis 6 Spieler. Ein Gerät für alle oder jede Person ein eigenes.", "Etwa 30 bis 45 Minuten (ein Spiel zu zweit dauert 12 bis 15 Runden)."],
    startT: "Drei Wege zu starten", modes: [
      ["📱", "Ein Gerät", "Tippe auf <b>Play</b>, dann auf <b>Multiplayer</b> und <b>One device</b>. Wähle 2 bis 6 Spieler, gib Namen ein und starte. Das Gerät wandert reihum."],
      ["🌐", "Online-Spiel hosten", "Eine Person wählt <b>Host online game</b> und teilt den <b>5-stelligen Code</b> oder lässt Freunde den QR-Code scannen."],
      ["🔑", "Mit Code beitreten", "Freunde öffnen die Seite, wählen <b>Join with code</b>, geben den Code ein und warten in der Lobby. Der Host startet das Spiel."]],
    qrNote: "Scannen und Spiel öffnen", soloT: "Allein? Wähle Single Player: Du drehst das Rad und gehst ein Leben im Detail durch.",
    boardT: "Das Spielbrett im Überblick", boardLead: "Eine große Runde aus <b>101 Feldern</b>. Alle starten am selben Ort und laufen zum Ziel in der Mitte. Sechsmal teilt sich der Weg: Du wählst einen von drei Wegen.",
    callouts: [["Gleiche Straße für alle", "Die Hauptstraße und ihre Felder sind für alle gleich."], ["Gabeln", "Sechs Gabeln mit je drei Wegen. Abkürzungen sind schneller, haben aber mehr Hürden und Rückschläge."], ["Lebensstationen", "Die 12 goldenen Zahlen erzählen die Geschichte deiner Figur und bewegen dich."], ["Deine Figur zählt", "Manche Wege sind für dich langsam, schnell oder versperrt, weil deine echte Person das so erlebt hat."]],
    legendRoutes: "Wege an einer Gabel (Buchstaben auf dem Brett)", legendFields: "Felder (Farben auf dem Brett)", fieldsT: "Was die Felder bewirken",
    turnT: "Dein Zug", turn: [
      ["Würfeln", "Würfle und gehe genau so viele Felder. Jedes Feld ist ein Schritt, auf jedem Weg."],
      ["An Gabeln wählen", "An einer Gabel suchst du einen von drei Wegen aus. Für deine Figur gesperrte Wege sind grau und erklären, warum."],
      ["Karte lesen", "Das Feld, auf dem du stehen bleibst, entscheidet: eine Frage, eine Geschichte, ein Schub vor oder zurück."],
      ["Richtig oder falsch", "Richtige Antwort: du bleibst stehen. Falsche Antwort: zurück zum letzten sicheren Feld (Zugbeginn oder letzter Halt). Dann ist die nächste Person dran."]],
    specialT: "Gut zu wissen", special: [
      ["⚡ DOUBLE-Karte", "Etwa jede fünfte Karte ist eine Double-Karte. Antwortest du richtig, gehst du noch einmal so viele Felder."],
      ["🚧 Hürden und Lebensstationen", "Sie halten dich einmal an. Hürden lassen dich nur mit richtiger Antwort weiter. Eine Lebensstation schiebt dich vor oder zurück, erzählt eine Geschichte oder stellt eine Bonusfrage."],
      ["🏁 Gewinnen", "Wer als Erste oder Erster das Ziel erreicht, gewinnt. Du brauchst keine genaue Augenzahl."]],
    figT: "Deine Figur und ihre Stärke", figLead: "Zu Beginn dreht jeder das Rad und wird zu einer anderen Figur. Mit dem 📖-Knopf im Spiel siehst du deine Wege, deine Stärke und deine Lebensstationen.",
    fx: [["⛔ Versperrt", "Du kannst diesen Weg nicht wählen, das Spiel sagt dir warum."]],
    strT: "Eine Stärkekarte (2 oder 3 Einsätze)", str: [["💡", "Hinweis", "Streicht eine falsche Antwort."], ["🛡️", "Schutzschild", "Eine falsche Antwort schickt dich nicht zurück."], ["🎲", "Zweite Chance", "Würfle zwei Würfel, die höhere Zahl zählt."], ["🚀", "Schub", "Addiere 2 zu deinem Wurf."], ["🎟️", "Freifahrtschein", "Eine Frage zählt als richtig."]],
    fair: "Alles, was einen Weg versperrt oder dich zurückwirft, geht auf ein belegtes Ereignis im Leben deiner Figur zurück. Es gibt keine versteckten Bonusschritte: Du gehst genau, was du würfelst.",
    talkT: "Redet darüber", talk: ["Nach dem Spiel: Welche Barriere hat dich überrascht? Welche Brücke hat am meisten geholfen?", "Welche Worte waren dir als verletzend nicht bewusst? Was machst du morgen anders?", "Jede Lebensseite nennt ihre Quellen. Echte Fotos stammen von Wikimedia Commons mit Namensnennung."],
    singleT: "Single Player in Kürze", single: ["Dreh das Rad: Du bekommst ein Leben. Du wählst nicht selbst.", "Drehe den Spinner (1, 2 oder 3 Felder). Jedes Feld erzählt ein Stück der echten Geschichte.", "Barrierefelder halten dich auf: Zum Passieren brauchst du eine 3. Ein Fehlversuch kostet einen Zug und Hoffnung (Hope).", "Brücken sind Abkürzungen und kosten 1 Unterstützung (Support). Zwei gescheiterte Barrieren können dich zurückwerfen (Rückschlag).", "Am Ende siehst du die echte Geschichte, deine Werte und Fragen zum Nachdenken."],
    footer: "Ein Schulprojekt zu Vielfalt, Toleranz und Inklusion · Spielen: paru918spy.github.io/game-of-different-lives", pg: "Seite"
  }
};

/* ---------- page markup ---------- */
const heroSrc = (fs.readFileSync(path.join(root, "index.html"), "utf8").match(/<svg class="ahero-art"[\s\S]*?<\/svg>/) || [""])[0].replace('class="ahero-art"', 'class="coverart"');
const heroFor = code => heroSrc.replace(/id="(pg\d|br|gl)"/g, `id="${code}$1"`).replace(/url\(#(pg\d|br|gl)\)/g, `url(#${code}$1)`);
const chip = (c, d) => `<i class="chip" style="background:${c};border-color:${d}"></i>`;

function doc(L, code) {
  const zi = zoneInfo[code], fi = fieldInfo[code];
  const zonesHtml = zoneOrder.map(z => `<li><span class="pill" style="background:${ZONES[z].color}">${LETTER[z]}</span><div><b>${zi[z][0]}</b><small>${zi[z][1]}</small></div></li>`).join("");
  const fieldsHtml = fieldOrder.map(k => `<li><span class="dot" style="background:${GRP[k].color};border-color:${GRP[k].dark}">${k === "life" ? "1–12" : ""}</span><div><b>${fi[k][0]}</b><small>${fi[k][1]}</small></div></li>`).join("");
  const legendFieldsShort = fieldOrder.map(k => `<span class="lg"><i style="background:${GRP[k].color};border-color:${GRP[k].dark}"></i>${fi[k][0]}</span>`).join("");
  return `
<div class="doc" lang="${L.htmlLang}" data-doc="${code}">
<section class="page cover"><div class="cvtop"><span class="tagpill">${L.tag}</span></div>
  <h1>${L.title.split(" ").map((w, i) => `<b style="--c:${["#ef476f", "#f6b93b", "#0fb5a0", "#1e9be9", "#7b5cd6"][i % 5]}">${w}</b>`).join(" ")}</h1>
  <p class="cvsub">${L.sub}</p>${heroFor(code)}
  <ul class="chips">${L.chips.map((c, i) => `<li style="--c:${["#ef476f", "#1e9be9", "#0fb5a0", "#7b5cd6"][i]}">${c}</li>`).join("")}</ul>
  <div class="cvqr"><img class="qr" src="img/qr-play.png" alt="QR"><div><b>${L.qrNote}</b><p>paru918spy.github.io/<wbr>game-of-different-lives</p></div></div>
  <p class="cvnote">${L.coverNote}</p></section>

<section class="page p2"><h2><span class="num">1</span>${L.h1}</h2>
  <div class="two"><div class="txt">${L.idea.map(t => `<p>${t}</p>`).join("")}</div>
  <aside class="need"><h3>${L.needT}</h3><ul>${L.need.map(t => `<li>${t}</li>`).join("")}</ul></aside></div>
  <h2><span class="num">2</span>${L.startT}</h2>
  <div class="modes">${L.modes.map((m, i) => `<div class="mode m${i}"><div class="mi">${m[0]}</div><b>${m[1]}</b><p>${m[2]}</p></div>`).join("")}</div>
  <div class="qrline"><img class="qr" src="img/qr-play.png" alt="QR"><div><b>${L.qrNote}</b><p>paru918spy.github.io/<wbr>game-of-different-lives</p><p class="solo">${L.soloT}</p></div></div>
  <div class="foot">${L.footer}</div></section>

<section class="page p3"><h2><span class="num">3</span>${L.boardT}</h2><p class="lead">${L.boardLead}</p>
  <div class="boardwrap">${boardSVG(L)}</div>
  <div class="callouts">${L.callouts.map((c, i) => `<div class="co c${i}"><b>${c[0]}</b><span>${c[1]}</span></div>`).join("")}</div>
  <div class="mini"><div><h4>${L.legendRoutes}</h4><div class="lgrid">${zoneOrder.map(z => `<span class="lg"><em class="pill" style="background:${ZONES[z].color}">${LETTER[z]}</em>${zi[z][0]}</span>`).join("")}</div></div>
  <div><h4>${L.legendFields}</h4><div class="lgrid">${legendFieldsShort}</div></div></div>
  <div class="foot">${L.footer}</div></section>

<section class="page p4"><h2><span class="num">4</span>${L.fieldsT}</h2>
  <ul class="info fields">${fieldsHtml}</ul>
  <h3 class="sub3">${L.legendRoutes}</h3>
  <ul class="info zones">${zonesHtml}</ul>
  <div class="foot">${L.footer}</div></section>

<section class="page p5"><h2><span class="num">5</span>${L.turnT}</h2>
  <ol class="turn">${L.turn.map((t, i) => `<li class="t${i}"><span class="tn">${i + 1}</span><div><b>${t[0]}</b><p>${t[1]}</p></div></li>`).join("")}</ol>
  <h2><span class="num">6</span>${L.specialT}</h2>
  <div class="grid2">${L.special.map((t, i) => `<div class="sp s${i}"><b>${t[0]}</b><p>${t[1]}</p></div>`).join("")}</div>
  <div class="foot">${L.footer}</div></section>

<section class="page p6"><h2><span class="num">7</span>${L.figT}</h2><p class="lead">${L.figLead}</p>
  <div class="fxrow">${L.fx.map((f, i) => `<div class="fx f${i}"><b>${f[0]}</b><p>${f[1]}</p></div>`).join("")}</div>
  <h3 class="sub3">${L.strT}</h3>
  <div class="strs">${L.str.map(s => `<div class="st"><span>${s[0]}</span><b>${s[1]}</b><p>${s[2]}</p></div>`).join("")}</div>
  <p class="fair">${L.fair}</p>
  <h2><span class="num">8</span>${L.talkT}</h2>
  <ul class="talk">${L.talk.map(t => `<li>${t}</li>`).join("")}</ul>
  <div class="single"><h3>🎡 ${L.singleT}</h3><ol>${L.single.map(t => `<li>${t}</li>`).join("")}</ol></div>
  <div class="foot">${L.footer}</div></section>
</div>`;
}

const css = fs.readFileSync(path.join(__dirname, "manual.css"), "utf8");
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Game manual · Lebenswege – Game of Lives</title>
<meta name="description" content="Illustrated manual for Lebenswege – Game of Lives: idea, start, board sketch, fields and rules. English and German.">
<style>
${css}
</style>
</head>
<body>
<header class="mbar"><a class="brand" href="index.html">Lebenswege – Game of Lives</a>
  <nav><a id="otherLang" href="manual.html?lang=de">Deutsch</a><a id="pdfLink" class="btn ghost" href="manual/Game-of-Different-Lives-Manual-EN.pdf" download>Download PDF</a><a id="backLink" class="btn" href="index.html">← Back to the game</a></nav></header>
<main>
${doc(LANGS.en, "en")}
${doc(LANGS.de, "de")}
</main>
<script>
(function () {
  var q = /[?&]lang=(en|de)/.exec(location.search), lang = q ? q[1] : "";
  if (!lang) { try { lang = localStorage.getItem("gol-lang") || ""; } catch (e) {} }
  if (!lang) lang = /^de/i.test(navigator.language || "") ? "de" : "en";
  var T = { en: { other: "Deutsch", otherHref: "manual.html?lang=de", pdf: "Download PDF", pdfHref: "manual/Game-of-Different-Lives-Manual-EN.pdf", back: "← Back to the game", title: "Game manual · Lebenswege – Game of Lives" },
            de: { other: "English", otherHref: "manual.html?lang=en", pdf: "PDF herunterladen", pdfHref: "manual/Game-of-Different-Lives-Spielanleitung-DE.pdf", back: "← Zurück zum Spiel", title: "Spielanleitung · Lebenswege – Game of Lives" } };
  var t = T[lang]; document.documentElement.lang = lang; document.body.setAttribute("data-lang", lang); document.title = t.title;
  var o = document.getElementById("otherLang"); o.textContent = t.other; o.href = t.otherHref;
  var p = document.getElementById("pdfLink"); p.textContent = t.pdf; p.href = t.pdfHref;
  document.getElementById("backLink").textContent = t.back;
  try { localStorage.setItem("gol-lang", lang); } catch (e) {}
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(root, "manual.html"), html);
console.log("manual.html written", html.length, "bytes");
