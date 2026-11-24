# Game of Different Lives (MVP prototype)

A board game in the spirit of "Spiel des Lebens" where you walk through the real life stories of people who faced barriers, prejudice and doubt. 21 lives are playable: 17 real people and 4 clearly labelled fictional characters.

## Run it on a Mac

No install, no server, no build step.

1. Unzip the folder.
2. Double-click `index.html` (opens in your default browser, Safari/Chrome/Firefox all work).

Optional, if you prefer a local server: open Terminal in the folder and run `python3 -m http.server 8000`, then go to http://localhost:8000.

## Game modes

Press **Play** and choose:

- **Single Player** (the walk through one life, described below)
- **Multiplayer** (2 to 6 players sit at a table, spin a wheel and become one of 21 figures with their own strengths and barriers on a shared board of about 100 fields with bridges, ladders, stairs and short cuts; quiz cards and tasks). It runs on one device or online between devices. See [docs/multiplayer.md](docs/multiplayer.md).

## How to play (Single Player)

- Press **Spin the wheel of fortune**. A realistic 3D wheel assigns you one of the 21 lives. You do not get to choose.
- The 3D board is built individually for that life. **Drag** to rotate, **right-drag or Shift+drag** to move, **scroll** to zoom. The camera follows your pawn (🎥), 🗺️ shows the whole board. Click a visited space to read it again.
- Roll the spinner (1, 2 or 3 spaces). Every space tells part of the real story with a photo (Wikimedia Commons, with credit) or an illustration. Each life now has 19 to 29 stations (see `js/extras.js` for the added everyday and in-between stations).
- **Barrier spaces** stop you. To get past, you must spin a **3** (same rule for every barrier). A miss costs a turn and Hope; the wheel is kept simple on purpose.
- **Bridges** 🌉 are shortcuts that Support makes possible (allies, mentors, technology, a community). Support is only spent on bridges: crossing costs 1 Support and skips the spaces between. Without Support the bridge stays closed.
- **Setbacks** ↩️ (red arrows): fail a barrier twice and the real-life consequences throw you back to an earlier space. Every life has its own bridges and setbacks, taken from that person's story.
- At the end you see the real story, your stats (turns lost, setbacks, bridges crossed and which barriers your bridges skipped), questions to reflect on, and sources.

## Game manual

`manual.html` is the illustrated manual (English and German, with a sketch of the board drawn from the real board data). PDFs: `manual/`. Rebuild with `node tools/build-manual.js && sh tools/build-manual-pdf.sh` (needs Chrome).

## Project layout

```
index.html            page (works offline from file://)
vendor/three.min.js   Three.js r158, bundled locally (MIT)
css/style.css         look and feel
js/game.js            game flow (wheel -> life -> 3D board -> ending)
js/wheel3d.js         realistic 3D wheel of fortune (also the move spinner)
js/board3d.js         3D board, road, bridges, setback arrows, pawn, camera controls
js/gfx.js             shared Three.js helpers
js/routes.js          per-life bridges and setbacks (edit these to change a life's path)
js/events.js          event pictures from Wikimedia Commons with credits (img/events/)
js/scenery.js         illustrated fallback scenes for events without a photo
js/thumbs.js          small embedded portraits (WebGL cannot read file:// images)
js/i18n.js            UI strings (English only)
js/characters/*.js    one file per playable life (content)
js/mp/                Multiplayer: board graph, question bank, engine, 3D scene, UI, online (PeerJS) - see docs/multiplayer.md
css/mp.css            Multiplayer styles
data/profiles/        One JSON per figure (multiplayer rules); docs/figures/ has the readable pages (generated)
tools/                mp-sim.js (rule test), profiles-check.js, build-profiles.js
.claude/agents/       Structure Agent and Independent Review Agent
vendor/peerjs.min.js  PeerJS 1.5.5 (MIT), only loaded for online play
js/core.js            authoring helper + portrait/illustration code
docs/                 design proposal, research notes, fact-check list
```

## Adding a character

Copy `js/characters/parks.js`, change the content, add a `<script>` line in `index.html`, then add its bridges and setbacks to `js/routes.js` (`b: [[fromTile, toTile, "why"]]`, `s: [[barrierTile, backToTile, "why"]]`), a thumbnail to `js/thumbs.js` and optionally event photos to `js/events.js`. Tile types: `start`, `info`, `win`, `barrier` (with `gate.need` 2 or 3), `choice` (with options and a `reveal`), `finish`. Anything not about a specific person must be flagged `illustrative: true`; fictional characters must say so on their card.

## Status and caveats

- **Event photos:** 30 freely licensed Wikimedia Commons photos are committed in `img/events/` (credits in `js/events.js`); events without a photo show an illustrated scene. `tools/fetch_event_photos.py` can fetch more.

- Facts come from well-documented public biographies, but **have not yet been fact-checked line by line**. See the checklist in `docs/characters.md` before publishing.
- Pictures: every real person has a portrait and several events have photos from Wikimedia Commons. Events without a suitable freely licensed photo show an illustrated scene. Fictional characters use illustrations.
- English only, by decision.
- Later packaging for a Mac app: wrap the folder with Tauri or Electron; nothing in the code needs a server.

## Photo credits
Event photos are in `img/events/` and credited in `js/events.js`. Portraits of real people are freely licensed files from Wikimedia Commons, stored in `img/people/`. Author, license and source link for each are in `js/photos.js` and are shown on every character card and ending screen. Fictional characters use original illustrations.
