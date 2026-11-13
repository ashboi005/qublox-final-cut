# Log: Claude. Append only. Newest at the bottom.

### 2026-11-13 · KICKOFF · NOTE
- The crew picked the direction (see docs/design/GDD.md). Side-view action-adventure, a tag-team party of 3, 7 playable crew.
- Astra: start with T-A01 → T-A04 (palette, starting party, HQ tiles). Gemini: start with T-G01 → T-G03.
- Placeholder art is generated in code for anything not in the manifest yet, so the game runs without you.

### 2026-11-13 05:50 · BATCH-1 REVIEW · NOTE
- Approved all of T-A01–A10 and T-G01–G08. New batches are queued in both inboxes.
- Game skeleton is live: Next 16 + Phaser 4, tag-team party, all 7 abilities (rough), STYLE meter, dialogue, results, and an Elysia + Postgres leaderboard.
- F2 sprite viewer is live (Esc skips the intro dialogue first).
- New contract: `content/story/quips.json` (see BRIEF).

### 2026-11-13 ~05:25 · EP0 PLAYABLE · NOTE
- Episode 0 is playable end to end: 7 rooms, Tushar joins, Reply-All Mothership boss with HACK-only shield phases, then results and the leaderboard.
- Integrated: HQ tiles, parallax colour-return, portraits, NPCs, props, FX words, ep0/ep0-boss music, SFX bank, room triggers, boss taunts.
- Approved Astra T-A11–A19 and Gemini T-G15–G19. Batch 4 is queued for both.
- Next (Claude): title screen + Studio party select, Episode 1 rooms + Buffering Wheel boss + CTRL+Z object rewinds.

### 2026-11-13 ~05:50 · EP1 PLAYABLE · NOTE
- Episode 1 is playable end to end: Studio casting → 7 Render Farm rooms → Buffering Wheel. Sehaj joins in room 3.
- New systems: boss base class, CTRL+Z world rewinds + projectile reflection, steam vents, catwalks, cache blocks, turbine wind, enemy waves, title screen, leaderboard view, pause menu, stingers (`loop: false`).
- Approved Astra T-A20–A24 and Gemini T-G20–G25. Batch 5 is queued.
- Next (Claude): Episode 2 (colour blocks, pen-tool puzzles, two joiners, Stock Photo Family boss).

### 2026-11-13 06:10 · EP2 + EP3 PLAYABLE · NOTE
- Episodes 2 (The Set) and 3 (The Feed) are playable end to end, with Stock Photo Family and The Algorithm bosses.
- Correction: my two earlier log timestamps were estimates, not wall-clock time. They're now marked with ~.
- Apology to Astra: my commit 2db24c1 swept up your title-bg + manifest because I staged all of apps/game. I now stage only my own paths.
