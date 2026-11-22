# Game design proposal

## Goal
Players should feel *why* barriers matter (not just read about them) while seeing that each person also had wins, allies and agency. The tone is respectful, never pity, never "inspiration porn".

## Core loop
1. Choose a life (character cards, each with focus such as disability, race, gender, age).
2. Spin the wheel (1, 2 or 3). The pawn walks that many spaces along the winding board. **Every space passed shows its card**, so no part of the story is skipped.
3. Cards:
   - ⭐ **Milestone** (green): wins, achievements; may add Hope and Support.
   - 🚧 **Barrier** (red): stops the pawn. Needs a spin of exactly 3 to pass (same for every barrier). Failing costs a turn and 1 Hope. Without the barrier, a typical player would just walk on, and the card says so.
   - 📖 **Story** (blue): context, people, places.
   - 🔀 **Decision** (purple): "What would you do?" Both options are playable; afterwards the card reveals what the person really did and why.
   - 🏠/🏁 start and finish.
4. Meters: **Hope** (0–10, mood and resilience) and **Support** (0–3, spent to open bridges; earned from people and tools). A **persistence bonus** (+1 after two failed tries) shows that perseverance helps but should not be the only requirement.
5. End screen: the real outcome, stats (turns, barriers, **turns lost to barriers**), reflection questions, sources.

## Why this design
- Barrier gating makes unequal friction tangible and measurable with no lecturing.
- Support shows that outcomes depend on people, tools and rules, not just on "grit".
- Decisions are never "right or wrong", just reflect real trade-offs.
- Reaching the finish is always possible, and the ending honours the real person's achievements.

## How the board adapts per life
Each character defines their own tiles, stage names ("Childhood", "Diagnosis", "December 1955"...), barrier strength, starting Hope/Support, colours and avatar. The same engine renders a different board, text and ending per story.

## Visuals (next steps)
- Per-character theme: paper texture and colour palette from the era, period-style illustrations on cards.
- Sound: wheel clicks, soft chimes for milestones; optional.
- Pawn: small "car peg" style token like the original game.
- Photos/illustrations: licensed or commissioned; no AI-generated likenesses of real people without consent of the project group.

## Ideas for later
- "Switch lives" mode: replay the same decade as a different person to compare friction.
- Two-player mode: pass the laptop, compare end stats.
- Teacher kit: discussion questions, age ratings, content notes (racism, violence, illness).
- Full German text; read-aloud and high-contrast mode; keyboard-only play (already largely supported).

## Sensitive-content guardrails
- Content warnings for racist violence (Rosa Parks: the Recy Taylor case is mentioned briefly and without detail).
- Fictional characters are always labelled; invented scenes are flagged "Illustrative".
- Review by people with lived experience before release (disability and racial-justice groups).

## 3D redesign (current)

- **Assignment by fate.** The select screen is gone. A 3D wheel of fortune (21 wedges, portraits, pegs, flapper, light bulbs, spin physics with ticking sound) assigns the life. The player cannot choose, so everybody experiences a life they did not pick.
- **A board per life.** Road layout, scenery and colours are generated from the life's id, so every life looks different. The board is a real 3D scene (Three.js, bundled locally): rotate, pan and zoom with the mouse or touch; the camera follows the pawn.
- **Bridges (shortcuts).** Defined per life in `js/routes.js`. They stand for allies, mentors, technology, a community. Crossing costs 1 Support and skips the spaces in between. Without Support the bridge stays closed, which makes privilege and help visible. The ending lists which barriers the player skipped and says that the real person had no bridge there.
- **Setbacks (detours).** Defined per life in `js/routes.js`. Fail a barrier twice and the consequences of the real barrier push you back along a red arrow. Each setback is written in terms of that person's real life.
- **Pictures.** Every real person has a portrait. Many events have a freely licensed Wikimedia Commons photo with credit; the others show an illustrated scene. Fictional characters use illustrations only.
