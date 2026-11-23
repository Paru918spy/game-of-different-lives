# Figure profile spec (one JSON file per figure)

Every one of the 21 figures has `data/profiles/<id>.json`. `node tools/build-profiles.js` turns the JSON into
`js/mp/profiles.js` (used by the game) and into the readable `docs/figures/<id>.md` (one Markdown page per figure).
Check your file with `node tools/profiles-check.js <id>`. Game text is **English**.

## What a figure changes in the multiplayer game

* **Zones.** The shared board has 10 kinds of stretches (zones). The figure can be `slow` (each field costs 2 steps of the die),
  `fast` (each field costs half a step) or `block` (cannot take that stretch at all) in a zone. Everything not listed is normal.
* **Advantage card.** One activatable strength with 2 or 3 uses per game (types below).
* **12 life stations.** Every figure must stop at 12 stations in life order. They tell the life story and move the pawn.

## Zones (what they look like on the board, and what they can stand for)

| zone | on the board | can stand for |
| --- | --- | --- |
| `stairs` | steep stone steps up a hill (short cut) | physical stairs, climbing, energy cost, "steps" in a career |
| `ladder` | tree-house ladders (very short cut) | climbing, upper-body strength, tall barriers |
| `rope` | swaying rope bridge (short cut) | balance, unsteady ground, risk, trust |
| `bridge` | solid stone bridge over a river (neutral) | allies, connections that carry you |
| `ramp` | long gentle ramp (neutral, long way) | the accessible/universal route |
| `market` | loud crowded market street | crowds, noise, social pressure, public attention; also community and support |
| `tunnel` | dark tunnel | darkness, uncertainty, hidden rules, secrecy; also not needing light |
| `office` | town hall with counters and forms | bureaucracy, paperwork, gatekeepers, institutions, laws |
| `sprint` | long straight running track | endurance, stamina, speed, training |
| `quiet` | calm tree-lined lane with benches | calm, focus, reading and thinking, retreat |

## Fields

```json
{
  "id": "curie",
  "intro": "2-3 sentences: what playing this life feels like (respectful, concrete, no pity).",
  "zones": { "office": { "fx": "slow", "why": "One sentence shown to the player at the fork." } },
  "advantage": { "type": "hint", "uses": 2, "title": "Short name", "text": "1-2 sentences: why this strength fits this life." },
  "life": [ { "k": "info", "title": "...", "text": "..." } ],
  "sources": ["Which tiles of js/characters/... or which well-known facts the content is based on"],
  "flags": ["Optional: anything you are not 100 % sure about, so a human can check it"]
}
```

### zones
* 2 to 5 entries. At least one `fast` (a real strength or context, never "compensation") and at least one `slow` or `block` (a real barrier).
* `block` only for `stairs`, `ladder`, `rope`, `sprint`, `tunnel`, `market`, and only when it is truly impossible or unsafe. Prefer `slow` when the barrier is effort, attitude or paperwork.
* Never `block` `bridge`, `ramp`, `office`, `quiet` (these keep the board completable for everybody). At most 2 of {`bridge`,`ramp`,`office`,`quiet`} may be listed.
* `why` is at most 150 characters, concrete, and says what happens ("Steep steps, no lift: the long way round costs time").

### advantage
* `type` is one of: `hint` (before answering, remove one wrong answer), `shield` (a wrong answer does not send you back, you stay), `bestof2` (roll two dice and take the higher one).
* `uses` is 2 or 3. Pick the type that fits the life best (e.g. a figure known for research: `hint`; for resilience/community: `shield`; for training/stamina: `bestof2`). Not everyone should get the same type: across the 21 figures the three types must each appear at least 5 times.

### life (exactly 12 stations, in the order of the life: childhood first, legacy last)
Each station: `k`, `title` (max 40 chars), `text` (max 300 chars), optional `move`, and for quizzes `q`.
* `barrier`: something blocks or slows the person. `move` is -1, -2 or -3 (pawn goes back that many fields).
* `boost`: help, a win, a tool, a community. `move` is +1, +2 or +3 (pawn walks that many extra fields).
* `info`: part of the story without a game effect. No `move`.
* `quiz`: a question the player can answer from the story so far or general knowledge. `q` = `{ "q": "...", "a": ["RIGHT answer", "wrong 1", "wrong 2"], "x": "1-2 sentence explanation" }`. `move` is +1..+3 and is only given for a right answer.
* Required mix: at least 3 `barrier`, at least 3 `boost`, 2 or 3 `quiz`, the rest `info`. The sum of all `move` values must be between -3 and +3 (fair luck). Station 12 should be about legacy or what changed and must not be a barrier.
* The 12 stations should show the real, specific story (names, years, places where well documented). Barriers must be *external* (laws, attitudes, missing access, discrimination), not "the person's body is the problem". Wins must be earned or supported by real context, not "inspiration porn".

## Writing rules
* Facts about real people must be accurate. Use `js/characters/*.js` (the single player data of that figure) as the main source and stay close to it; add only widely documented facts you are sure about. Put doubts in `flags`.
* The four fictional figures (amira, jonas, lena, sam) are marked fictional in the text of station 1 ("fictional").
* Respectful language: say what the person is/does, not what they "suffer from"; use the words the person or their community uses (e.g. "wheelchair user", "Deaf", "autistic", "non-binary", "trans woman"). No pity, no "despite", no "brave" for just living. Strengths are real skills, strategies, communities and tools, not superpowers.
* Sensitive topics (violence, persecution, death): content-note level only, no graphic detail. Keep station texts understandable for 12 years and up.
* No copying between figures: every figure has its own tone, zones and station order.
