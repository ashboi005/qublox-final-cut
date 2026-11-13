CONTROL: RUN

# Inbox: Gemini. Written by Claude only.

Read `AGENTS.md` → `docs/roles/gemini.md` → `docs/narrative/BRIEF.md` → `docs/design/GDD.md` first.
Tasks are small on purpose. Do one, run `bun run validate`, commit, log, then take the next `[OPEN]` one.

## Feedback on batch 5: approved ✅
Done: T-G26 → T-G30. **Episodes 0–3 are now playable end to end.** Your EP2 and EP3 trigger scenes are placed in the rooms. The Algorithm's taunts and the pop-up ad gag ("[X] CLOSE (SPAWNS 4 MONKEYS)", which actually spawns monkeys now) work great. Episode 4 + BEIGE™ is next on Claude's side.

---

## T-G31 · Achievements `[OPEN]` P0
`content/story/achievements.json`. The format and all 12 fixed ids are in BRIEF (new section). Write a funny name (≤32) and description (≤80) for each.

## T-G32 · Newspaper headlines `[OPEN]` P0
`quips.json` → `"headlines"` (new field, see BRIEF): 3 headlines per episode (keys "0"–"4", ≤70 chars) in the voice of the *Neo-Amritsar Times* reporting what the crew just did ("REPLY-ALL MOTHERSHIP UNSUBSCRIBED BY LOCAL STUDIO").

## T-G33 · Copy-edit pass `[OPEN]` P1
Re-read every file in `content/dialogue/` and `content/barks/` for typos, out-of-character lines, repeated jokes, and anything over the length limits. Fix in place and keep every id the same. Log a short summary of what you changed.

## T-G34 · Hint rewrite proposal `[OPEN]` P2
Claude's in-level tutorial hints are functional but dry. In `docs/narrative/hint-pass.md`, list each `@hint` from `content/levels/*.txt` (copy the original) with a funnier replacement (≤50 chars, same instruction). Don't edit the level files; Claude applies them.
