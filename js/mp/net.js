/* Online play between devices: a thin wrapper around PeerJS (WebRTC data channels).
   No account and no key: PeerJS's free public broker only introduces the devices to each other,
   after that all game data flows directly between the browsers. The HOST device runs the engine,
   guests send their actions and receive the resulting events + state.
   (See docs/multiplayer.md for the design, limits and alternatives.)

   const h = MP.Net.host({ onLobby, onAction, onLeave, onError });  h.code, h.send(pid,msg), h.broadcast(msg), h.close()
   const g = MP.Net.join(code, name, { onMsg, onClose, onError });  g.send(msg), g.close()                                 */
(function (root) {
  const MP = root.MP = root.MP || {};
  const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const PREFIX = "gdl-";
  const makeCode = () => Array.from({ length: 5 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");

  /* STUN finds the public address; TURN relays the (tiny, encrypted) game data when two devices cannot reach each other directly.
     That is the usual case between a phone on mobile data and a laptop on Wi-Fi, so TURN is what makes QR joining work for everybody. */
  const ICE = [
    { urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302", "stun:stun.cloudflare.com:3478"] },
    { urls: ["turn:eu-0.turn.peerjs.com:3478", "turn:us-0.turn.peerjs.com:3478"], username: "peerjs", credential: "peerjsp" },
    { urls: ["turn:openrelay.metered.ca:80", "turn:openrelay.metered.ca:443", "turns:openrelay.metered.ca:443?transport=tcp"], username: "openrelayproject", credential: "openrelayproject" }
  ];

  /* Optional test override: ?peerhost=localhost&peerport=9000 (default: PeerJS cloud broker). */
  function peerOptions() {
    const q = new URLSearchParams(location.search), o = { debug: 0, config: { iceServers: ICE, iceCandidatePoolSize: 4 } };
    if (q.get("peerhost")) { o.host = q.get("peerhost"); o.port = +(q.get("peerport") || 9000); o.path = "/"; o.secure = false; }
    return o;
  }
  let loading = null;
  function load() {
    if (window.Peer) return Promise.resolve();
    if (loading) return loading;
    return loading = new Promise((res, rej) => {
      const s = document.createElement("script"); s.src = "vendor/peerjs.min.js"; s.onload = res; s.onerror = () => { loading = null; rej(new Error("Could not load the online play library.")); };
      document.head.appendChild(s);
    });
  }
  const friendly = e => {
    const t = e && e.type || "";
    if (t === "peer-unavailable") return "No game found with this code. Check the code and try again.";
    if (t === "network" || t === "server-error" || t === "socket-error" || t === "socket-closed") return "Could not reach the matchmaking service. Check your internet connection.";
    if (t === "browser-incompatible") return "This browser does not support online play.";
    return (e && e.message) || "Connection problem.";
  };

  /* ---------- host ---------- */
  function host(cb) {
    const H = { code: null, conns: {}, closed: false }; let peer = null, tries = 0, ping = 0;
    function open() {
      H.code = makeCode(); peer = new Peer(PREFIX + H.code, peerOptions());
      let opened = false;
      const t = setTimeout(() => { if (!opened && !H.closed) cb.onError(new Error("Could not reach the matchmaking service. Check your internet connection.")); }, 15000);
      peer.on("open", () => { opened = true; clearTimeout(t); cb.onReady && cb.onReady(H.code); });
      /* The broker connection drops when the host's tab sleeps (phone locked, tab in background). Without it nobody new can join, so reconnect at once. */
      peer.on("disconnected", () => { if (H.closed || !opened) return; let n = 0; const re = () => { if (H.closed || !peer || !peer.disconnected || n++ > 30) return; try { peer.reconnect(); } catch (e) { } setTimeout(re, 2000); }; re(); });
      peer.on("error", e => {
        if (e.type === "unavailable-id" && tries++ < 5) { try { peer.destroy(); } catch (x) { } open(); }
        else if (!H.closed && !opened) cb.onError(new Error(friendly(e)));       // after the room is open, single failed guests must not kill the lobby
      });
      peer.on("connection", conn => {
        conn.on("open", () => { H.conns[conn.peer] = conn; });
        conn.on("data", m => { if (m && typeof m === "object") { if (m.t === "ping") { try { conn.send({ t: "pong" }); } catch (e) { } return; } cb.onMessage(conn.peer, m, conn); } });
        conn.on("close", () => { if (H.conns[conn.peer] === conn) { delete H.conns[conn.peer]; cb.onLeave && cb.onLeave(conn.peer); } });
        conn.on("error", () => { });
      });
    }
    H.sendTo = (peerId, msg) => { const c = H.conns[peerId]; if (c && c.open) c.send(msg); };
    H.broadcast = msg => Object.values(H.conns).forEach(c => c.open && c.send(msg));
    H.close = () => { H.closed = true; clearInterval(ping); Object.values(H.conns).forEach(c => { try { c.send({ t: "bye" }); c.close(); } catch (e) { } }); try { peer && peer.destroy(); } catch (e) { } };
    load().then(open).catch(e => cb.onError(e));
    return H;
  }

  /* ---------- guest ---------- */
  /* Tries up to 3 times (the host may still be registering, mobile networks are slow to warm up) and reports progress through cb.onStatus(text),
     so the join screen never just sits there. */
  function join(code, cb) {
    const G = { closed: false }; let peer = null, conn = null, attempt = 0, timer = 0, keep = 0;
    const status = t => cb.onStatus && cb.onStatus(t);
    code = String(code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const fail = e => { if (G.closed) return; clearTimeout(timer); cb.onError(e); };
    function connect() {
      if (G.closed) return;
      if (conn) { try { conn.close(); } catch (e) { } conn = null; }
      status(attempt ? `Still trying to reach the game… (attempt ${attempt + 1} of 3)` : "Looking for the game…");
      clearTimeout(timer);
      timer = setTimeout(() => retry(new Error("Could not reach the game. Check the code and your internet connection. If you are on mobile data, try Wi-Fi.")), 20000);
      conn = peer.connect(PREFIX + code, { reliable: true });
      conn.on("open", () => { G.connected = true; clearTimeout(timer); status("Connected!"); cb.onOpen(); keep = setInterval(() => { try { conn.open && conn.send({ t: "ping" }); } catch (e) { } }, 15000); });
      conn.on("data", m => { if (m && typeof m === "object") { if (m.t === "pong") return; cb.onMessage(m); } });
      conn.on("close", () => { clearInterval(keep); if (!G.closed && G.connected) cb.onClose(); });
      conn.on("error", () => { });
    }
    function retry(err) {
      if (G.closed || G.connected) return;
      if (++attempt < 3) setTimeout(connect, 1500); else fail(err);
    }
    status("Loading online play…");
    load().then(() => {
      if (G.closed) return;
      let regTimer = setTimeout(() => fail(new Error("Could not reach the matchmaking service. Check your internet connection.")), 15000);
      status("Contacting the matchmaking service…");
      peer = new Peer(undefined, peerOptions());
      peer.on("error", e => {
        if (G.closed) return;
        if (e.type === "peer-unavailable") { retry(new Error(friendly(e))); return; }     // host not registered (yet): try again, then say so
        if (!G.connected) fail(new Error(friendly(e)));
      });
      peer.on("open", () => { clearTimeout(regTimer); connect(); });
    }).catch(fail);
    G.send = msg => { if (conn && conn.open) conn.send(msg); };
    G.close = () => { G.closed = true; clearTimeout(timer); clearInterval(keep); try { conn && conn.close(); } catch (e) { } try { peer && peer.destroy(); } catch (e) { } };
    return G;
  }

  MP.Net = { host, join, load };
})(window);
