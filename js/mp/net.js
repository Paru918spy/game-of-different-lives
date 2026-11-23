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

  /* Optional test override: ?peerhost=localhost&peerport=9000 (default: PeerJS cloud broker). */
  function peerOptions() {
    const q = new URLSearchParams(location.search), o = { debug: 0 };
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
    const H = { code: null, conns: {}, closed: false }; let peer = null, tries = 0;
    function open() {
      H.code = makeCode(); peer = new Peer(PREFIX + H.code, peerOptions());
      let opened = false;
      const t = setTimeout(() => { if (!opened && !H.closed) cb.onError(new Error("Could not reach the matchmaking service. Check your internet connection.")); }, 12000);
      peer.on("open", () => { opened = true; clearTimeout(t); cb.onReady && cb.onReady(H.code); });
      peer.on("error", e => { if (e.type === "unavailable-id" && tries++ < 5) { try { peer.destroy(); } catch (x) { } open(); } else if (!H.closed) cb.onError(new Error(friendly(e))); });
      peer.on("connection", conn => {
        conn.on("open", () => { H.conns[conn.peer] = conn; });
        conn.on("data", m => { if (m && typeof m === "object") cb.onMessage(conn.peer, m, conn); });
        conn.on("close", () => { delete H.conns[conn.peer]; cb.onLeave && cb.onLeave(conn.peer); });
        conn.on("error", () => { });
      });
    }
    H.sendTo = (peerId, msg) => { const c = H.conns[peerId]; if (c && c.open) c.send(msg); };
    H.broadcast = msg => Object.values(H.conns).forEach(c => c.open && c.send(msg));
    H.close = () => { H.closed = true; Object.values(H.conns).forEach(c => { try { c.send({ t: "bye" }); c.close(); } catch (e) { } }); try { peer && peer.destroy(); } catch (e) { } };
    load().then(open).catch(e => cb.onError(e));
    return H;
  }

  /* ---------- guest ---------- */
  function join(code, cb) {
    const G = { closed: false }; let peer = null, conn = null;
    code = String(code || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    load().then(() => {
      peer = new Peer(undefined, peerOptions());
      const t = setTimeout(() => { if (!G.connected && !G.closed) cb.onError(new Error("Could not reach the game. Check the code and your internet connection.")); }, 15000);
      peer.on("error", e => { if (!G.closed) cb.onError(new Error(friendly(e))); });
      peer.on("open", () => {
        conn = peer.connect(PREFIX + code, { reliable: true });
        conn.on("open", () => { G.connected = true; clearTimeout(t); cb.onOpen(); });
        conn.on("data", m => { if (m && typeof m === "object") cb.onMessage(m); });
        conn.on("close", () => { if (!G.closed) cb.onClose(); });
        conn.on("error", () => { });
      });
    }).catch(e => cb.onError(e));
    G.send = msg => { if (conn && conn.open) conn.send(msg); };
    G.close = () => { G.closed = true; try { conn && conn.close(); } catch (e) { } try { peer && peer.destroy(); } catch (e) { } };
    return G;
  }

  MP.Net = { host, join, load };
})(window);
