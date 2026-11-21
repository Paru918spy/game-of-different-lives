/* Compact authoring helper. Tiles are arrays: [type, stageIndex, title, text, extra?]
   type: info | win | barrier | choice (start and finish are the first and last tile)
   extra: { need:2|3 (barrier gate), fx:{hope,support}, opts:[[label,fx,result]...], reveal, ill:true } */
window.GOL = window.GOL || { characters: [] };
GOL.add = function (d) {
  const n = d.tiles.length;
  d.start = d.start || { hope: 6, support: 0 };
  d.avatar = { emoji: d.emoji || "🎲", color: d.color || "#555" };
  d.tiles = d.tiles.map((a, i) => {
    let type = a[0]; if (i === 0) type = "start"; if (i === n - 1) type = "finish";
    const x = a[4] || {}, t = { id: "t" + i, stage: a[1], type, title: a[2], text: a[3] };
    if (type === "barrier") {
      t.gate = { need: x.need || 2, label: x.label || "Getting past this barrier" };
      t.effects = x.fx || { hope: -1 };
    } else if (type === "win") t.effects = x.fx || { hope: 1 };
    else if (x.fx) t.effects = x.fx;
    if (x.ill) t.illustrative = true;
    if (type === "choice") {
      t.options = x.opts.map(o => ({ label: o[0], effects: o[1] || {}, result: o[2] }));
      t.reveal = x.reveal;
    }
    return t;
  });
  GOL.characters.push(d);
};

/* Illustrated portrait for fictional characters (flat SVG). */
GOL.illus = function (o) {
  const skin = o.skin || "#e0ac82", hair = o.hair || "#2b1d12", shirt = o.shirt || "#3b82f6", bg = o.bg || "#fde68a";
  let back = "", front = "";
  const st = o.style || "short";
  if (st === "long") back = `<path d="M26 52 Q24 18 50 16 Q76 18 74 52 L76 82 L24 82Z" fill="${hair}"/>`;
  if (st === "bun") back = `<circle cx="50" cy="12" r="9" fill="${hair}"/>`;
  if (st === "hijab") back = `<path d="M24 56 Q22 14 50 14 Q78 14 76 56 L80 96 L20 96Z" fill="${o.scarf || "#7c3aed"}"/>`;
  if (st === "curly") back = `<g fill="${hair}"><circle cx="30" cy="30" r="10"/><circle cx="42" cy="21" r="11"/><circle cx="58" cy="21" r="11"/><circle cx="70" cy="30" r="10"/></g>`;
  if (st === "short" || st === "bun" || st === "long") front = `<path d="M28 40 Q30 18 50 18 Q70 18 72 40 Q60 30 50 30 Q38 30 28 40Z" fill="${hair}"/>`;
  if (st === "grey") front = `<path d="M28 40 Q30 18 50 18 Q70 18 72 40 Q60 30 50 30 Q38 30 28 40Z" fill="#cfd4da"/>`;
  const glasses = o.glasses ? `<g fill="none" stroke="#222" stroke-width="2"><circle cx="41" cy="46" r="7"/><circle cx="59" cy="46" r="7"/><path d="M48 46h4"/></g>` : "";
  const beard = o.beard ? `<path d="M32 52 Q50 82 68 52 Q60 70 50 70 Q40 70 32 52Z" fill="${o.beard}"/>` : "";
  const chair = o.chair ? `<g stroke="#555" stroke-width="4" fill="none"><circle cx="22" cy="90" r="14"/><circle cx="78" cy="90" r="14"/></g>` : "";
  const hijabFace = st === "hijab" ? `<ellipse cx="50" cy="48" rx="19" ry="23" fill="${skin}"/>` : `<ellipse cx="50" cy="46" rx="21" ry="25" fill="${skin}"/>`;
  return `<svg viewBox="0 0 100 100" role="img" aria-label="${o.label || "Illustrated portrait"}">
    <rect width="100" height="100" fill="${bg}"/>${chair}
    <path d="M10 100 Q14 72 50 70 Q86 72 90 100Z" fill="${shirt}"/>
    <rect x="43" y="62" width="14" height="14" rx="4" fill="${skin}"/>${back}${hijabFace}${front}${beard}
    <circle cx="41" cy="46" r="2.6" fill="#222"/><circle cx="59" cy="46" r="2.6" fill="#222"/>
    <path d="M42 58 Q50 65 58 58" stroke="#7a3b2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>${glasses}</svg>`;
};

/* Portrait HTML: illustration (fictional) > photo with credit (real) > emoji fallback. */
GOL.portrait = function (c) {
  if (c.illus) return GOL.illus(c.illus);
  if (c.photo) {
    const emoji = c.avatar.emoji;
    return `<img src="${c.photo.file}" alt="Photo of ${c.name}" onerror="this.outerHTML='${emoji}'">`;
  }
  return c.avatar.emoji;
};

/* Small credit line (author, license, source link) for a real person's photo. */
GOL.credit = function (c) {
  const p = c.photo; if (!p) return "";
  const e = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  const lic = p.licenseUrl ? `<a href="${e(p.licenseUrl)}" target="_blank" rel="noopener">${e(p.license)}</a>` : e(p.license);
  return `<span class="credit">${p.note ? e(p.note) + " · " : "Photo: "}${e(p.author)} · ${lic} · <a href="${e(p.source)}" target="_blank" rel="noopener">Wikimedia Commons</a></span>`;
};
