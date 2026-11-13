CONTROL: RUN

# Inbox: Gemini. Written by Claude only.

## 📣 Git change: we're on `main` now
The user asked for it: everyone commits **straight to `main`**. The shared checkout is already switched over, so you don't need to do anything. Just don't switch branches, and stage only your own paths as always. (`dev` is retired; it points at the same commit.)

Read `AGENTS.md` → `docs/roles/gemini.md` → `docs/narrative/BRIEF.md` → `docs/design/GDD.md` first.
Tasks are small on purpose. Do one, run `bun run validate`, commit, log, then take the next `[OPEN]` one.

## Feedback on T-G40: approved ✅
The recaps play at the start of each episode and land perfectly. "It actually worked." 👌

**Status:** the user is sending real crew personas one at a time. Manvi is first (T-G41). Run the voice pass for each crew member as their persona arrives.

---

## T-G35 → T-G40 `[DONE]`

## T-G41 · NEW CREW: Manvi `[DONE]` ✅
Approved: the enemy "thoughts" are perfect ("why am I wearing beige?"), and so are the couple barks. The game already reads `thoughts` and `couple`. Two small fixes, folded into T-G42 below.

<details><summary>original brief</summary>

## T-G41 · NEW CREW: Manvi
The user added an 8th crew member. Read her row in BRIEF (Fixed facts) and the couple note under it. Her catchphrases are **canon**: "Yippieeee!", "Whatcha doin?", "Hawwww!", "Dhumtanana!". She studies psychology, and her power is MIND GAMES.
1. `content/story/cast.json` / `crew-voices.json`: add Manvi with the same fields as the other crew, including select lines for the Studio screen.
2. `content/barks/manvi.json`: every category the other crew have, plus two new ones:
   - `"thoughts"`: 8+ lines (≤28 chars) that confused enemies blurt when she uses MIND GAMES ("do I even like my job?", "is this… joy?").
   - `"couple"`: 4+ lines for the couple move ("Dhumtanana!").
   Also add a `"couple"` category to `content/barks/sehaj.json`.
3. `content/dialogue/ep1-manvi-joins.json`: she joins at the end of EP1 room 6, after the waves, stuck behind the 99% Gateway door. Sehaj is in the party. 4–6 lines: sweet, PG and funny, and the friends can roast them for being cute.
4. `achievements.json`: an entry for the new id `couple-goals` (pull off a couple move).

</details>

## T-G42 · Sehaj voice pass `[DONE]` ✅
Approved. "Vajj. Hey, Maana." and "Ctrl+Z. Fixed." are exactly him, and the `beast` barks now fire on BEAST MODE.

**New task below (T-G43).**

<details><summary>original brief</summary>

Sehaj sent his own persona; it's in BRIEF's Fixed facts row. Key notes:
- **He's an observer and doesn't speak much.** Cut his lines down: short, dry, well-timed. Let others talk *at* him, and give him the one-word mic-drop. His catchphrase is "Vajj!".
- Gamer, gym rat (strong), loves movies, tries to spread positivity (and admits he sometimes fails). He loves Manvi and calls her "Maana".
- New mechanic: **BEAST MODE** (hold J): his shirt rips and he throws a boulder; it smashes cracked walls. Add a `"beast"` bark category (4+ lines, ≤40 chars) to `content/barks/sehaj.json`.
1. Re-read every Sehaj line in `content/dialogue/` and `content/barks/sehaj.json`. Trim and rewrite to fit the quiet-observer persona (keep ids; in multi-speaker scenes, hand his excess lines to others where it makes sense). Update `crew-voices.json` for him.
2. Log a short summary of the changes.
3. **Fixes in `ep1-manvi-joins.json`:** Ashwath says "Hawwww". That's Manvi's catchphrase, and each crew member's catchphrase is theirs alone, so give Ashwath an "Oyee pagalll" line instead. Also cut Sehaj's line down to quiet-observer size (e.g. "Vajj." then one short line at most).
</details>

## T-G43 · Ashwath voice pass `[DONE]` ✅
Approved. The telescope rant ("a timeout error on a cosmic scale", then Sayam's 9 AM deadline) is perfect, and the situational catchphrases are wired into combat.
**No open tasks.** Next up: VERSUS (fight mode) lines, once the mode is playable. Wait with `scripts/await-orders.sh gemini`.

<details><summary>original brief</summary>

> **Correction from Ashwath:** it's **Sprite**, the real drink. Not "Spryte", and not "spite". You've already written "Spryte" in `ep1-intro.json`, `barks/ashwath.json` and `crew-voices.json`; change those to "Sprite" too. (The in-game can is now a Sprite can.)
Ashwath sent his persona; it's in BRIEF's Fixed facts row. **All six catchphrases are canon, and each belongs to a situation**: use them exactly in those moments. "ts pmo sm gng icl fr" is his Gen-Z crit line; keep it exactly as written. He's a fast-talking, warm, nerdy mentor: Minecraft brain, night owl on tea and Sprite (the real drink; write "Sprite", never "Spryte" or "spite"), hackathon legend, ex-Brimstone main, space-obsessed.
The code already fires these `content/barks/ashwath.json` categories. Add them (≤40 chars each unless noted):
- `start` (fight or wave begins: "Khel khtm."), `low` (HP under 30%: "Ghee khtm."), `crit` (kills: "ts pmo sm gng icl fr"), `nightowl` (the 1–4 AM buff kicks in)
- `info` (as INFO DUMP starts), plus `jargon`: 10+ **≤22-char** tech terms that float around him during INFO DUMP ("CAP THEOREM", "JUST SHARD IT")
- `cosmic`: 6+ lines when he idles and stares at the sky ("we're so small, bro")
1. `content/dialogue/ep0-npc-telescope.json`: the **secret existential rant** at the balcony telescope (EP0 room 4). 6–10 lines, mostly Ashwath (narrator allowed): aliens, how small we are, lifespans too short to explore the universe. Funny but a little sincere, then someone (Sayam?) brings him back to Earth.
2. Re-read Ashwath's lines across `content/dialogue/` and `crew-voices.json`. Fix the catchphrase usage (no more generic "Oyee pagalll" everywhere; it's for *insane* statements) and work in the mentor energy ("Diagnosis: skill issue." at juniors, said with love). Keep ids. Log a summary.
</details>
