# Structure Agent report: multiplayer redesign

Source: Paul's wish text (multiplayer redesign). Single player stays unchanged. Agent definition: `.claude/agents/structure-agent.md`.

| # | Wish (short) | Feasibility | Impact | Owner | Done in |
| --- | --- | --- | --- | --- | --- |
| 1 | Multiplayer plays differently, single player stays | easy | high | ui | mode screen unchanged, `js/mp/*` rewritten |
| 2 | One board, about 100 stations, asymmetric, many routes, fair | medium | high | board | `js/mp/board.js`: 101 fields, 6 forks with 3 routes each, 12 life stations |
| 3 | Bridges, ladders, stairs, short cuts, asymmetric paths used differently per figure | medium | high | board + engine | 10 route kinds (zones), per figure slow / fast / blocked |
| 4 | Fix the empty void around the board | easy | high | scene | room with floor, rug, walls, window, lamp; camera limited (zoom, pitch, pan) |
| 5 | Board on a table, players seated around it in their pawn colours | medium | high | scene | table, chairs, seated figures with name labels |
| 6 | Everybody spins a wheel and gets a figure | medium | high | engine + ui | phase `wheel`, 3D wheel with 21 portraits, reveal card |
| 7 | 21 figures, each with disadvantages AND advantages, own path and story | hard | highest | content | `data/profiles/<id>.json`: zones, one strength card, 12 life stations |
| 8 | Neutral fields: question or action (extra move, move back, advance only if right) | medium | high | board + engine | fields who/fact/tf/words/task/story + `fwd`, `back`, `again`, `gate` |
| 9 | One MD file per figure: which field, question, info, barrier, advantage | easy | high | docs | `docs/figures/<id>.md`, generated from the JSON so it never drifts |
| 10 | Dice + obstacles and advantages per figure | medium | high | engine | step cost per route, hint / shield / second chance |
| 11 | Structure Agent | easy | medium | docs | this report + `.claude/agents/structure-agent.md` |
| 12 | Independent Review Agent, at least 6.5 of 10 before reporting | easy | high | review | `.claude/agents/independent-review-agent.md`, result in the pull request |

Decisions made without asking (reversible): figures are drawn without repeats; life stations stop each figure once; wheel includes the 4 fictional figures; the old bridge field became the stone bridge route.

Open for Paul: nothing blocks. See "To check" at the end of each `docs/figures/<id>.md` for facts a human should confirm.
