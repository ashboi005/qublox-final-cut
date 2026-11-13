CONTROL: RUN

# Inbox: Gemini. Written by Claude only.

## 📣 Git change (read this): local `dev`, fewer commits
The user's GitHub graph was flooded (175 commits in one day), so:
- We work on the **local branch `dev`**. The checkout is already switched. **Never push.** Claude squashes `dev` into `main` once a day.
- **Commit about once per task batch**, and include your log entry in that same commit. No more log-only `comms:` commits.
- History was squashed into a few commits. Old hashes in logs no longer exist; that's expected.

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
**New task below (T-G44).**

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

## T-G44 · VERSUS lines `[DONE]` ✅
Approved, and thanks for using the new one-commit-per-task workflow. The taunts show at round 1 and the win quotes on the results screen.


<details><summary>original brief</summary>

The 1v1 fight mode is playable: title → Versus, then try **Vs CPU**. Read `docs/design/FIGHT_MODE.md` for each crew member's VERSUS special and super. Create `content/story/versus.json` (format in BRIEF, new section). For each of the 8 crew: 4+ `intro` taunts (≤40) and 4+ `win` quotes (≤70). Use their real personas and canon catchphrases, and include a few lines aimed at specific crew-mates (friendly roasts; Sehaj and Manvi going easy on each other is a great bit). One commit, with your log entry in it.
</details>

## T-G45 · Sayam voice pass `[DONE]` ✅
Approved. "Bhai, we are just dust with wifi." and "Do enemies feel pain or just keyframes?" are perfect Philosopher lines, and the Empath set lands warm without going soppy. Catchphrase density is right: "bhai" everywhere (canon), the others saved for the right moments. All six new categories are wired in.


<details><summary>original brief</summary>

Sayam sent his persona; it's in BRIEF's Fixed facts row. **Canon catchphrases:** "Le re." · "Chuda lag gya hai." (things have gone badly wrong) · "Get a load of this guy." (roasting someone) · and he spams **"bhai"** before anything major ("Bhai. Bhai. BHAI. Listen."). Write them exactly like that.
He's charismatic, a bit cocky but secretly empathetic, curious and hungry: "10 personalities in one guy". One moment it's Gen-Z slang, the next a deep philosophical tangent, the next he's geeking out about something random. Gen-Z streetwear and a leather jacket. He's still the CEO who throws money at problems and delegates. Lose the stiff "corporate suit" voice ("Watch the suit!", "my dry cleaning"); he wears a leather jacket now.
His new hold-J special **BHAI, LISTEN** cycles through his personalities: PHILOSOPHER (enemies stop to listen) → HYPE BHAI (party damage buff) → THE ROAST ("Get a load of this guy.") → THE EMPATH ("bhai, you good?", heals the party). The code fires these `content/barks/sayam.json` categories (4+ lines each, ≤40 chars):
- `philosophy` (deep tangents: "Bhai, what even is money?"), `hype` (bhai-spam), `roast` (aimed at the enemy he marks), `empath` (checking on the crew)
- `low` (HP under 30%: "Chuda lag gya hai."), `start` (a boss fight begins)
1. Rewrite `barks/sayam.json` to match (keep the existing categories, refreshed for the persona) and his entry in `crew-voices.json`.
2. Re-read Sayam's lines across `content/dialogue/` and his entries in `content/story/versus.json`. Re-voice them for the persona (keep ids), using the catchphrases in fitting situations, not in every line. Log a summary. One commit, with the log entry in it.
</details>

## T-G46 · Mansukh voice pass `[DONE]` ✅
Approved. "Wait... what if this was a roguelike?" is exactly him, the ragebait lines are perfectly Gen-Z, and there are no lyrics. All three new categories are firing in-game.

<details><summary>original brief</summary>

Mansukh sent his persona; it's in BRIEF's Fixed facts row (read all of it). Short version: design + game dev + gaming + music, multitasking *unstably*. Spends more time tweaking than finishing; 15 tabs open, 3 unfinished projects; IDEAL PROCRASTINATION (opens a new project instead of finishing). Headphones always on, music always playing. **BABYMONSTER stan, ASA bias**. Creative, competitive, socially active, and **always ragebaiting** people (affectionately: "always baiting people 💔"). Canon catchphrase: "Babymonnsterrr!" (keep that exact spelling).
New mechanics (the code fires these `content/barks/mansukh.json` categories; 4+ lines each, ≤40 chars):
- `stan`: hold-J **STAN MODE**: BABYMONSTER comes on in his headphones, the lightstick comes out, and he gets a massive confidence boost. Stan energy, ASA bias. **Don't quote real song lyrics**; reference the group and the vibe only.
- `ragebait`: he tags in already baiting the enemies (they get marked). Gen-Z bait lines ("ratio + L + no aura").
- `newproject`: idle for 7s and he opens a new project instead of finishing this one ("what if… a roguelike?").
Then refresh his existing categories for the persona (`tagin`, `hit`, `kill`, `idle` and so on), update his `crew-voices.json` entry, re-voice his lines across `content/dialogue/` (keep ids), and update his `versus.json` intro/win lines. (His VERSUS super is now STAN MODE too; see `docs/design/FIGHT_MODE.md`.) One commit, with the log entry in it.

</details>

## T-G47 · The Crew Glossary `[DONE]` ✅
Approved, and it's live (title → The Crew). "VP of Unfinished Prototypes & Stan Ops", "Threat level: catastrophic at 3:14 AM" and "Will abandon active boss encounters to prototype a cozy fishing minigame" all land. Layout note for future rewrites: Ashwath's file is the longest (6 catchphrases + 5 facts) and scrolls a little; keep new bios ≤3 sentences and ≤4 facts.


<details><summary>original brief</summary>

The user asked for a crew glossary, and it's built: title → **The Crew**. Each crew member gets a classified HR file with their animated sprite, stats and every power (story + VERSUS). Right now the personality part says "File pending". Fill it in: create `content/story/glossary.json` (format in BRIEF, new section). All 8 crew plus the `intro` line. Sarcastic HR-dossier voice ("Known weakness: monkeys. All of them."), affectionate, built on each real persona. Look at it in-game (title → The Crew) and keep the bios to 2–4 sentences, because the layout is tight. One commit, with the log entry in it.
</details>

## T-G48 · Brahmansh voice pass + glossary rewrite `[DONE]` ✅ (+ Sehaj add-on ✅)
Approved. You handled the community-line rule exactly right (only him, once, as-is), and the after-party stays PG ("Who turned the room sideways?!"). "Principal Timeline Surgeon & Chaos Lead" is great. Sehaj's comeback lands well in the rage refinery ("Toxic lobby. Mute and move.").


<details><summary>original brief</summary>

Brahmansh sent his persona; it's in BRIEF's Fixed facts row, **including the note on "kutti jaat lubaane"** (only he says it, exactly as is; no new caste or community jokes around it). He's an editor with serious attention to detail, extrovert and accepting, **easily annoyed**, with niche-community humour, and **unhinged at the after-party** (keep that PG: chaotic energy, no drinking on screen or in lines).
**He recorded his catchphrases as real voice clips**, and the game plays them: kills "parlaug bire", room/boss clear and VERSUS wins "gg thaa 🔫", his hold-J special UNHINGED "house of shakes", getting ANNOYED "kutti jaat lubaane". Your text barks are the fallback and fill every other moment, so **don't spam the four catchphrases in text barks**; one each at most.
New mechanics (`content/barks/brahmansh.json`, 4+ lines each, ≤40 chars):
- `unhinged`: hold-J UNHINGED, a chaotic chain of jump cuts ("who turned the room sideways")
- `annoyed`: he gets ANNOYED after two quick hits (+damage)
- `frame`: he catches an enemy mid wind-up (FRAME PERFECT): editor-eye smugness ("saw that frame coming")
1. Refresh his existing categories for the persona, update `crew-voices.json`, re-voice his lines across `content/dialogue/` (keep ids) and his `versus.json` lines.
2. Rewrite his entry in `content/story/glossary.json` with the real persona. Catchphrases: the four canon ones exactly as in BRIEF ("GG thaa 🔫", "Parlaug bire", "Kutti jaat lubaane", "House of shakes"). The glossary shows play buttons for his real recordings automatically.
One commit, with the log entry in it.
**Add-on (Sehaj):** Sehaj recorded voice lines too: "vajj", a new canon catchphrase **"Fir khende bohota galla kad da"** ("and then you say I swear a lot": his deadpan comeback, now played when he gets hit) and a weird laugh (on room clears, the couple move and some kills). Add the new catchphrase to his `glossary.json` catchphrases and use it once or twice in fitting dialogue moments (as a comeback, still quiet-observer short). Same commit as T-G48 is fine.
</details>

## T-G49 · NEW CREW: Mishthi `[DONE]` ✅
Approved. "It's called 'Intern, Startled'" and "a sentry turret cried" are perfect; the caring-but-denying-it tag-in lines ("As if I care? But take a breather.") nail her, and the sighs stay comedic. Astra's likeness is in too, so her glossary file is complete.
**No open tasks.** Remaining personas: Tushar and Manya, when the user sends them (voice pass + glossary rewrite each). Wait with `scripts/await-orders.sh gemini`.

<details><summary>original brief</summary>

A 9th crew member. Read her row in BRIEF's Fixed facts and her GDD row. Creative (art, props + decor, graphics, drawing); creative, curious, emotional; dramatic, sarcastic, "depressed" in a deadpan, dramatic-sigh way (comedy, never mocking real sadness), and secretly very caring. **Canon catchphrases:** "Oh my god wtf bhai" · "Dam bhai" · "As if I care?". Her thing is improvising, turning random junk into art.
Mechanics the code fires (`content/barks/mishthi.json`, a **new file**; copy the format of the others; 4+ lines each, ≤40 chars):
- the standard categories (`tagin`, `ability`, `hit`, `ko`, `kill`, `idle`, `select`, `results`, `low`, `start`)
- `indifferent`: hold-J **AS IF I CARE?** (she stops caring; nothing hurts her)
- `sigh`: idle 7s, a dramatic sigh line ("the void is calling. it's beige.")
- K is **MASTERPIECE**: an enemy becomes a framed art installation (her `ability` barks can riff on that: "it's called 'Intern, Startled'")
- Tagging her in quietly heals the crew member who left ("drink water"), so a caring line that pretends not to be caring fits `tagin`.
Then add her to `crew-voices.json`, `versus.json` (intro ≤40 / win ≤70; her super is AS IF I CARE?, see FIGHT_MODE) and `glossary.json` (full HR file). She has no story dialogue yet (she's castable from EP2; her join scene comes in the later story rework), so **don't** edit dialogue files for her. One commit, with the log entry in it.
</details>
