# Multiplayer mode

Single Player (the original game) walks through **one life in depth**. Multiplayer is the opposite: neutral coloured pawns race over **one big shared board** and answer questions, judge statements and try real-life actions about the **17 real people** and the barriers they faced. The 4 fictional characters are not used here.

## Rules (version 2: shared table, 21 figures)

- 2 to 6 players sit around a table in the colour of their pawn. At the start **everybody spins the wheel of lives** and becomes one of the 21 figures (nobody gets the same one).
- The board has **101 fields**: a main road with **12 life stations** and **6 forks**. Each fork offers three routes of different kinds: stairs, tree ladders, rope bridge, stone bridge, long ramp, busy market, dark tunnel, town hall, race track, quiet lane. Short cuts are shorter but have more checkpoints and setbacks.
- **Figures differ.** Every figure has a few routes that are *closed* (every field you walk is exactly one step, no matter the route), and one **strength card** with 2 or 3 uses: 💡 *hint* (remove a wrong answer), 🛡 *shield* (a wrong answer does not send you back), 🎲 *second chance* (roll two dice, keep the higher), 🚀 *lift* (add 2 to your roll), 🎟 *free pass* (count a question as right). Everything is in `docs/figures/<id>.md`.
- **Fields** (colour of the tile):

| Field | What happens |
| --- | --- |
| ❓ Quiz (Who am I? / Life & Barriers / True or False? / Words Matter) | Question card. Right: stay. Wrong: back to the last safe field (turn start or last stop) |
| 🎬 Action | A real-life action, honour system |
| 📖 Life station 1 to 12 (and story stops) | You must stop once. Your figure's story: barrier (back 1 to 3), boost (forward 1 to 3), story, or a question for a bonus. Story stops only tell about a person |
| 🚧 Hurdle | You must stop and answer. Right: go on with the rest of your roll. Wrong: stay, the rest of the roll is lost |
| 🍀 Luck (tailwind / setback / roll again) | Move 2 or 3 fields forward, 2 or 3 back, or roll once more |

- **Your turn:** roll, walk, choose a route at forks (routes closed for your figure are greyed out and explain why), then the card of the field you landed on.
- About one question card in five is a random **⚡ DOUBLE** card: right answer = walk the same number again.
- **Balance:** `node tools/balance.js` lets bots play thousands of games. In groups of 4 every figure wins between 20 % and 30 % (fair is 25 %); alone every figure needs 13.4 to 13.9 rounds. `--tune` adjusts the strength of life-station barriers and boosts and the number of strength uses (never the story texts).
- First pawn on the finish wins. A game with 2 players takes about 12 to 15 rounds.

## Files

| File | Purpose |
| --- | --- |
| `js/mp/board.js` | The board as a graph (101 nodes, 6 forks, 10 route kinds, life stations). Pure data, tested in Node |
| `js/mp/profiles.js` | GENERATED from `data/profiles/*.json` by `node tools/build-profiles.js`. Per figure: route effects, strength card, 12 life stations |
| `data/profiles/<id>.json` | Source of truth for one figure. Spec: `docs/redesign/profile-spec.md`. Check with `node tools/profiles-check.js` |
| `docs/figures/<id>.md` | One readable page per figure (generated) |
| `js/mp/questions.js` | Question bank: 17 who-am-I (3 clues each, wrong names come from the same theme), 68 life questions, 99 true/false (12 of them about everyday behaviour), 28 words, 24 action cards. Facts follow `js/characters/*.js` |
| `js/mp/engine.js` | Game rules (phases wheel, roll, fork, card, feedback, over). Serialisable state and `dispatch(action) -> events`. No DOM, no 3D |
| `js/mp/scene.js` | Three.js view: room, table, seated players, board with route scenery, pawns, camera (zoom and pan limited), fork markers |
| `js/mp/game.js` | UI: setup, cards, die, end screen, glue to the engine, online lobby |
| `js/mp/net.js` | Online play (PeerJS wrapper) |
| `vendor/qrcode.js` | QR codes (MIT, drawn locally): host room and mode screen. `img/qr-play.png` is a printable QR for the public site |
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

## Realism, balance and figures at the table (v3)

- Every slowdown or speed-up on the board comes from a documented event of the drawn person (see `docs/figures/<id>.md`, section "Documented events"). The zone legend is fixed for all figures.
- There are no hidden bonus steps. You walk exactly what you roll.
- Each player sits at the table as the person they drew (outfit, hair, accessories such as the wheelchair or the football helmet), once the wheel has chosen.
