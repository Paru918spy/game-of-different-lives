# Game of Different Lives (MVP prototype)

A board game in the spirit of "Spiel des Lebens" where you walk through the real life stories of people who faced barriers, prejudice and doubt. 21 lives are playable: 17 real people and 4 clearly labelled fictional characters.

## Run it on a Mac

No install, no server, no build step.

1. Unzip the folder.
2. Double-click `index.html` (opens in your default browser, Safari/Chrome/Firefox all work).

Optional, if you prefer a local server: open Terminal in the folder and run `python3 -m http.server 8000`, then go to http://localhost:8000.

## How to play

- Pick a life. Press **Spin the wheel** (1, 2 or 3 spaces).
- Every space you pass tells part of the real story (milestones, barriers, decisions).
- **Barrier spaces** stop you. To get past, your spin (plus your **Support** bonus) must reach the number shown. Failing costs a turn and some Hope, which is the disadvantage made visible.
- **Support** is earned from friends, family, community and technology, and makes barriers easier.
- At the end you see the real story, your stats (including "turns lost to barriers"), questions to reflect on, and sources.

## Project layout

```
index.html            page
css/style.css         board-game look
js/game.js            game logic (vanilla JS, no dependencies)
js/i18n.js            UI strings (English only)
js/characters/*.js    one file per playable life (content)
js/core.js            authoring helper + portrait/illustration code
docs/game-design.md   design proposal
docs/characters.md    research notes, roster, suggestions, fact-check list
```

## Adding a character

Copy `js/characters/parks.js`, change the content, add a `<script>` line in `index.html`. Tile types: `start`, `info`, `win`, `barrier` (with `gate.need` 2 or 3), `choice` (with options and a `reveal`), `finish`. Anything not about a specific person must be flagged `illustrative: true`; fictional characters must say so on their card.

## Status and caveats

- Facts come from well-documented public biographies, but **have not yet been fact-checked line by line**. See the checklist in `docs/characters.md` before publishing.
- Portraits: real people use emoji placeholders until licensed photos are added (Wikimedia Commons, with credit; set `photo:{file,credit,license,url}` on the character). Fictional characters use illustrations.
- English only, by decision.
- Later packaging for a Mac app: wrap the folder with Tauri or Electron; nothing in the code needs a server.
