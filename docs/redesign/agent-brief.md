You write figure profiles for the multiplayer redesign of the school game "Lebenswege – Game of Lives" (about diversity, disability, discrimination; audience from 12 years). Work in the repository at /home/user/repo.

1. Read `docs/redesign/profile-spec.md` completely. It is the contract.
2. For each of your figures read its single-player data (the `id` is in `js/characters/*.js`; use `grep -n 'id: "<id>"' js/characters/*.js`, hawking and parks have their own files) and `docs/characters.md`. Base facts on that data and on widely documented public facts you are sure about.
3. Write `data/profiles/<id>.json` for each of your figures (valid JSON, English text, double quotes).
4. Run `node tools/profiles-check.js <id>` for each and fix every error until it says ok.
5. Quality bar: an independent reviewer will judge accuracy, respect (no pity, no inspiration-porn, no stereotypes, strengths are real and not patronizing, barriers are external), educational value, and that every figure feels distinct (different zones, different tone). Zone effects must make sense for that figure's life, say why in `why`, and must not be copied from another figure. Do not reuse generic wording across figures.
6. Only create/overwrite the files of your own figures. Do not touch any other file. Do not run git commands.
7. Final answer: one short line per figure (advantage type, zones chosen) and any `flags` you set. Nothing else.
