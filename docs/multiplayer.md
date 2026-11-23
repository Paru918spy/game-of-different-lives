# Multiplayer mode

Single Player (the original game) walks through **one life in depth**. Multiplayer is the opposite: neutral coloured pawns race over **one big shared board** and answer questions, judge statements and try real-life actions about the **17 real people** and the barriers they faced. The 4 fictional characters are not used here.

## Rules

- 2 to 6 players, each with a pawn in their own colour (3D, hops from field to field).
- The board has **69 fields** and **three forks**:
  - fork 1: Sunny Trail (north), Short Cut (middle), River Trail (south)
  - fork 2: Sunny Trail or River Trail
  - fork 3: Sunny Trail, Short Cut or River Trail
  - The two long trails each carry a **bridge field** (move 3 more). The Short Cut is shorter but full of challenge fields. Shortest way: 42 fields, longest: 45.
- The colour of the field you stand on decides your card:

| Colour | Field | Card |
| --- | --- | --- |
| blue `?` | Who am I? | A clue about a person, pick one of 3 names |
| orange `i` | Life & Barriers | Multiple choice about a life story |
| green `T/F` | True or False? | A statement about a person |
| purple `Aa` | Words Matter | Everyday situations about respectful language and behaviour, with tempting wrong answers (not tied to one person) |
| red star | Action! | A real-life action with an optional timer: do something doable but challenging to feel a different perspective (honour system, can be skipped) |
| teal heart | Story Stop | No question: meet a person (photo, a milestone and a barrier from the Single Player data) |
| gold arch | Bridge | Lands you 3 fields further, automatically |

- **Right answer (or task done):** roll the die (1 to 6) and walk. At a fork you choose the branch (buttons, or click a glowing field).
- **Wrong answer:** you stay, see the right answer with a short explanation and the person's portrait, the next player is up. Every explanation tells a bit more of the person's life story. Questions are medium to hard; the wrong answers sound plausible.
- First pawn on the finish wins. A game with 2 players takes about 12 rounds (roughly 15 to 20 minutes).

## Files

| File | Purpose |
| --- | --- |
| `js/mp/board.js` | The board as a graph (nodes, forks, field types). Pure data, tested in Node |
| `js/mp/questions.js` | Question bank: 17 who-am-I (3 clues each, wrong names come from the same theme), 68 life questions, 99 true/false (12 of them about everyday behaviour), 28 words, 24 action cards. Facts follow `js/characters/*.js` |
| `js/mp/engine.js` | Game rules. Serialisable state and `dispatch(action) -> events`. No DOM, no 3D |
| `js/mp/scene.js` | Three.js view: board, pawns, hop animation, camera, fork markers |
| `js/mp/game.js` | UI: setup, cards, die, end screen, glue to the engine, online lobby |
| `js/mp/net.js` | Online play (PeerJS wrapper) |
| `css/mp.css` | Styles |

### Add or change questions
Edit `js/mp/questions.js`. In `fact` and `words` the **first** answer is the right one (the order is shuffled when a card is drawn). `p` is the id of a real character from `js/characters/`. Keep them accurate (check `js/characters/`), make the wrong answers believable and keep the explanation (`x`) to one to three kind sentences with a piece of the life story. For action cards: `sec` is an optional timer, `all` means everybody joins, `r` is the question to talk about afterwards, `p` the person it is inspired by. Actions must be safe, doable with pen and paper and skippable. To change the board, edit the chains in `js/mp/board.js` (`CHAINS`, `BRIDGES`, `RHYTHM`).

### Run the rule tests (Node, no browser)
The engine plays complete games with a random bot, run `node tools/mp-sim.js` (it also checks the question bank against the character data). Useful numbers: 2 players need about 12 to 17 rounds depending on how many answers are right.

## Playing from two (or more) devices

### How it works (implemented)
- One person chooses **Multiplayer, Host online game** and gets a 5-letter **room code** (and an invite link).
- Friends open the page on their own device, choose **Join with code**, type the code.
- The **host runs the engine**. A guest only sends its clicks ("answer 2", "roll", "choose fork B") and receives `{events, state}` back, then plays the same animations. Everyone sees the same board; only the player whose turn it is gets buttons.
- If a guest leaves, their turn is skipped automatically. If the host leaves, the game ends.
- Technology: **WebRTC data channels via PeerJS** (`vendor/peerjs.min.js`, MIT, loaded only for online play). PeerJS's free public broker (`0.peerjs.com`) only introduces the browsers to each other, then the game data flows directly browser to browser. **No account, no key, no server of our own.**
- The engine is deterministic and its state is plain JSON (about 1 KB), so a new transport is a small change in `net.js`.

### Limits of this approach
- The public PeerJS broker is a free best-effort service without a uptime promise. For a school project that is fine; for a real launch run your own (see below).
- Without a TURN relay, about 5 to 15 percent of connections fail (strict school or company networks, some mobile carriers). Then the guest sees "Could not reach the game".
- The host device must stay open. Reloading the host page ends the game (no save/restore yet).
- The state contains the answers (so the UI can show feedback). Someone with developer tools could peek. Irrelevant for a classroom game, but not for anything competitive.
- The page must be served over **https** (GitHub Pages, Netlify, Cloudflare Pages are all free). `file://` works for one device and for two tabs on the same computer, but friends cannot open your local file.

### Options if you need more (and effort)
| Option | Needs accounts or secrets | Effort | Notes |
| --- | --- | --- | --- |
| **PeerJS public broker** (built in) | none | done | Best fit for now |
| Own PeerJS server (`peer` on npm) on Render, Fly.io, Railway | one hosting account, no secret in the code | 1 to 2 hours | Same code, set `host`/`port` in `net.js` |
| Add a TURN relay (Metered, Cloudflare Calls TURN, own coturn) | account and a key | 2 to 4 hours | Fixes the strict-network failures |
| WebSocket relay on Cloudflare Workers + Durable Objects (or Firebase / Supabase Realtime) | account | 1 to 2 days | Most robust, enables reconnect, spectators, saved games |
| No server at all: manual signalling with copy/paste codes or QR | none | 1 day | Awkward to use, only for demos |

Recommended path: ship the built-in version, watch whether classes hit connection problems, then move to an own PeerJS server plus TURN (half a day) before thinking about a full backend.

### Test it locally
1. `cd` into the repository and run `python3 -m http.server 8080`.
2. Open `http://localhost:8080` in two browser windows (or two devices in the same Wi-Fi: `http://<your-ip>:8080`), Play, Multiplayer.
3. Window 1: **Host online game**, Create game. Window 2: **Join with code**.
4. Without internet access to `0.peerjs.com` you can run your own broker for the test: `npm i peer` and `npx peerjs --port 9000`, then add `?peerhost=localhost&peerport=9000` to both URLs.
