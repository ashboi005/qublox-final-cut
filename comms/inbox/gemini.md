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

## T-G50 · Tushar voice pass + glossary rewrite `[DONE]` ✅
Approved. "Quiet on set! Dad's here." and "Nobody saw that? Cool." are him exactly; "Shaanttt hojaaa!" as the CUT! line is perfect, and "lann" stays rare and never aimed at anyone, as asked.


<details><summary>original brief</summary>

Tushar sent his persona; it's in BRIEF's Fixed facts row (read all of it). **The Wandering Generalist**: a quiet observer with a restless mind, the friend group's unofficial parent, a jack of all trades (dev, director, strategist, creator, manager) who leads by doing, takes on responsibility that isn't his ("fine, I'll do it myself"), is easily annoyed by stupidity, a bit cocky about his potential, and surprisingly chaotic when comfortable. Mehndi on one hand, a shiny bracelet on the other.
**Canon catchphrases:** "Shaanttt hojaaa" (his CUT! line: calm down, everything freezes) · "Behen di tang" · "Lann". **"Lann" is crude:** use it at most once or twice in total, only from him, as an exclamation of frustration, never aimed at anyone. "I hate monkeys." stays as his running gag.
Mechanics the code fires (`content/barks/tushar.json`, 4+ lines each, ≤40 chars):
- `wildcard`: hold-J **FINE, I'LL DO IT MYSELF** (he recharges everyone and runs someone else's job himself)
- `observe`: SILENT OBSERVER, when he spots a hidden tape or cracked wall ("nobody saw that? cool.")
- `ability` is CUT! (lean on "Shaanttt hojaaa")
1. Refresh his existing categories for the persona (less "auteur", more the dad of the group who fixes everything), update `crew-voices.json`, re-voice his lines across `content/dialogue/` (keep ids; he's still the director on set) and his `versus.json` lines (his super is now FINE, I'LL DO IT MYSELF).
2. Rewrite his `glossary.json` file: title, tagline, bio, his canon catchphrases, facts (the mehndi + bracelet are fair game).
One commit, with the log entry in it.
</details>

## T-G51 · Two new canon catchphrases `[DONE]` ✅
Approved. "Prabhu, shaanttt hojaaa. Fine, I'll do it myself." is the perfect Tushar intro line, and "Dost, the render drive!" fits Ashwath.
Next: the **story rewrite** (T-G52 → T-G56). The user gave the go.

<details><summary>original brief</summary>

- **Tushar: "Prabhu"** (a fond/exasperated "my lord" at the crew: "Prabhu, what did you do."). Add it to his `glossary.json` catchphrases and work it into 2–3 of his barks (`tagin`, `idle`, `kill` are good spots) and one dialogue moment.
- **Ashwath: "Dost"** (friend/buddy; how he addresses crew). Add it to his `glossary.json` catchphrases and use it in 2–3 barks and one dialogue line. His BRIEF row now lists it.
Note: in-fight voice lines are more frequent now (story kills/abilities and VERSUS specials, big hits, KOs). When a crew member has a recording for a moment it plays and captions; otherwise your text bark shows. So the text barks matter in VERSUS too now: `kill` (taunt after landing a big hit), `hit` (taking one), `ko`, `ability` (VERSUS special) and `tagin` (VERSUS super). One commit, with the log entry in it.
</details>

---

# 📖 STORY v2: the rewrite (the user gave the go)
Read `docs/design/STORY_V2.md` first (Claude's structure: who joins where, one arc beat per person, the pairings). Then BRIEF's Fixed facts (all 9 personas, canon catchphrases and their situations). Keep every **dialogue id and trigger** the same (levels point at them); change what's inside. One commit per task, with your log entry in it. Do them in order.

## T-G52 · Story Bible v2 `[DONE]` ✅
Approved: nine casts, the v2 beats with the join scenes, the arcs and seven persona gags. One change: gag 1 still has Sayam throwing cash, and that's gone now (see T-G57); make his gag the bhai-spam and talking his way through things. Fix it in the bible when you do T-G57.
<details><summary>original brief</summary>

Rewrite `docs/narrative/STORY_BIBLE.md` for 9 crew: keep the premise and villain; rebuild the cast section, the per-episode beats (with the join scenes from STORY_V2), the **arcs** (one beat each, from STORY_V2) and **5–7 running gags** that come from the real personas (Sayam's bhai-spam, Tushar's "fine, I'll do it myself" + monkeys, Mansukh's new-project tabs, Brahmansh noticing continuity errors, Mishthi's dramatic sighs, Ashwath's 2× speed info-dumps, Sehaj's one-word answers…). This is the reference for T-G53–T-G56.
</details>

## T-G53 · EP0 + EP1 dialogue, re-voiced `[DONE]` ✅
Approved. The cold open sets everyone up fast, and "Prabhu, shaanttt hojaaa. Fine, I'll do it myself." plus the Sehaj/Manvi intro ("Vajj. Hey, Maana.") are exactly right. Leftover money bits (written before the Sayam re-kit) go in T-G57: `ep0-tushar-joins` ("threw twenty grand at them"), `ep0-r03-turnstile`, `ep0-npc-intern-bunty`, and the "expensing" lines are fine as jokes but he no longer pays for things.
<details><summary>original brief</summary>

Every `ep0-*` and `ep1-*` scene. EP0 sets up the crew as people (Ashwath and Sayam at 11:58 PM; Tushar's intro in the gear cage). EP1: Sehaj and Manvi's joins, the couple's first moment. Seed the arcs.
</details>

## T-G54 · EP2 dialogue + Mishthi's join `[DONE]` ✅ (the rest moved to T-G58)
<details><summary>notes</summary>

Feedback: `ep2-mishthi-joins` is **approved** and great ("It's called 'Intern, Startled'", "Here, drink water. You all look tragic."). But only 3 of the 12 existing EP2 scenes were re-voiced. Still to do for v2 (same ids/triggers): `ep2-intro`, `ep2-previously`, `ep2-designers-join`, `ep2-r01-greenscreen-interns`, `ep2-r03-color-blocks`, `ep2-r04-mirror-smiles`, `ep2-r05-fake-saloon`, `ep2-r06-no-shadows`, `ep2-npc-stuntman-jaggu`. Then log it as T-G54 REVIEW again. (The same goes for T-G55: **every** `ep3-*` and `ep4-*` file.)

Every `ep2-*` scene, plus a **new** `content/dialogue/ep2-mishthi-joins.json`: it plays when the party clears the Chroma Key Dressing Rooms (r04) and finds Mishthi in the wardrobe dept, where she's been turning BEIGE's props into art. Use her catchphrases ("oh my god wtf bhai" fits a first look at the crew), and her secretly-caring side. 6–10 lines.
</details>

## T-G55 · EP3 + EP4 dialogue + the ending `[DONE]` ✅ (the rest moved to T-G58)
Approved what's here. The ending is lovely: every one of the 9 gets a beat, and the telescope payoff ("Eighty years isn't enough… But we made this together.") lands.
<details><summary>original brief</summary>

Every `ep3-*` and `ep4-*` scene. Pay off the arcs (Tushar's burnout and the crew doing it for him in EP3; in EP4 Sayam doing it himself, Mansukh finishing a project, Brahmansh finding the backup, Mishthi caught caring). `ep4-ending`: all 9 crew, the 8:59 AM deploy, the telescope payoff.
</details>

## T-G56 · Achievements, Lost Footage, quips, recaps `[DONE]` ✅
Approved: all 28 achievements named ("Ten in a Leather Jacket", "Avant-Garde Vernissage" 👌), and the tapes are proper in-jokes. Money leftovers go in T-G57: the `le-re` achievement ("Deploy Sayam's Bribe"), the tagline "Le re! Pay your way to victory.", and the "Sayam counts rupees" tape caption.
<details><summary>original brief</summary>

- `content/story/achievements.json`: names + descriptions for **every** id, including the 14 new persona achievements (list and triggers in BRIEF).
- `content/story/footage.json`: rewrite all 15 tapes as real-crew in-jokes (same ids; their hiding spots are listed in BRIEF).
- `content/story/quips.json`: new title taglines, loading tips (mention the new powers and the 4-person party, keys 1–4), headlines and bylines.
- `ep1-previously` … `ep4-previously` recaps to match v2.
</details>

## T-G57 · Sayam's lines: no more money `[DONE]` ✅
Approved: a full-repo grep finds no bribes, rupees or cash tosses left.
<details><summary>notes</summary>

Feedback: barks, versus, glossary and "Silver-Tongued CEO" are approved. A grep still finds these, so fix them (talking/pitching instead of paying):
- `content/dialogue/ep0-tutorial-hints.json`: "Sayam's BRIBE distracts guards and pays tolls." → SMOOTH TALK
- `content/story/quips.json`: the tagline "Le re! Pay your way to victory.", the tip "Bribe bags distract…", and the headline "TURNSTILE BRIBERY SURGE: CEO THROWS RUPEES…"
- `content/story/footage.json`: "…while Sayam counts rupees."
- `content/story/flavor.json`: "Increases Sayam's Bribe attraction duration…"
- `content/story/versus.json`: "Sayam, you can't bribe this hitbox!"
- `docs/narrative/STORY_BIBLE.md`: running gag 1 (cash toss)
(The turnstile "budget is twelve rupees" joke is fine; it's not Sayam paying.)

The user asked for Sayam's money moves to go. His K is now **SMOOTH TALK** (a hype speaker + a pitch; enemies crowd round to listen; toll bots get talked into opening), his J throws **speech-bubble one-liners**, and in VERSUS his special is **GET A LOAD OF THIS GUY** (a roast that ROASTS the opponent), his super is **TEN PERSONALITIES**, and his finisher is **BHAI, LISTEN…** (the loser falls asleep mid-monologue). Update his `barks/sayam.json` (`ability`, `kill`, `select`, `results`: talking, not paying), his `versus.json` lines and his glossary file, and in your v2 dialogue have him talk his way through things instead of throwing cash. "Le re." still works as a catchphrase ("here, take it": a line, not a bribe). The `le-re` achievement (10 uses of his K) needs a new name/description for SMOOTH TALK.
</details>

## T-G58 · Story v2 sweep: the scenes T-G54/T-G55 didn't reach `[DONE]` ✅
Approved: every EP2–EP4 scene is v2 now, and Mishthi is in 16 of them ("Vertical format was a mistake. Two hundred floors of reels?" 😂). Sayam's "zero revenue, zero aura, and tragic pitch deck" at Chad is great.
<details><summary>original brief</summary>

v2 means **every** scene speaks with the real personas and seeds/pays off the arcs from the Story Bible. These weren't re-voiced yet (same ids and triggers; rewrite what's inside):
- `ep2-designers-join`
- `ep2-intro`
- `ep2-npc-stuntman-jaggu`
- `ep2-previously`
- `ep2-r01-greenscreen-interns`
- `ep2-r03-color-blocks`
- `ep2-r04-mirror-smiles`
- `ep2-r05-fake-saloon`
- `ep2-r06-no-shadows`
- `ep3-boss-intro`
- `ep3-boss-outro`
- `ep3-boss-taunts`
- `ep3-brahmansh-joins`
- `ep3-intro`
- `ep3-npc-influencer-roxy`
- `ep3-previously`
- `ep3-r01-repost-monkeys`
- `ep3-r02-infinite-scroll`
- `ep3-r04-echo-drones`
- `ep3-r05-fake-close-btn`
- `ep3-tutorial-hints`
- `ep4-beige-phase2`
- `ep4-boss-taunts`
- `ep4-intro`
- `ep4-npc-rebel-intern-simran`
- `ep4-previously`
- `ep4-r01-beige-smocks`
- `ep4-r03-alignment-token`
- `ep4-r04-sanitizer-foam`
- `ep4-r05-chad-keynote`
For each: the real personas and catchphrases in the right moments; the arcs (Ashwath teaching, Tushar's burnout in EP3, Sayam talking not paying, Mansukh's tabs, Brahmansh's continuity eye, Mishthi caught caring); include **Mishthi** in scenes from EP2 r04 onwards and **Manvi/Sehaj** from EP1 onwards where it fits (they're in the party now that it holds 4). Do them in episode order; one commit per episode is fine. Log each batch.
</details>

## T-G59 · Last sweep: EP0/EP1 leftovers + boss taunts → story FINAL `[DONE]` ✅
**Story v2 is FINAL.** "Sayam, ten personalities are nine redundant FTEs!" 😂 Thank you, this was a big rewrite.
**No open tasks.** Next: the user's own easter eggs, when they send them. Wait with `scripts/await-orders.sh gemini`.
<details><summary>original brief</summary>

These 14 weren't touched since v2 started. Re-voice them the same way (real personas, arcs, Manvi/Sehaj in EP1 where the party has them). Boss taunt sets: the bosses can now roast the *real* crew (Ashwath's night-owl hours, Sayam's ten personalities, Tushar's monkeys, Mansukh's tabs, Brahmansh's continuity, Mishthi's indifference…):
- `ep0-boss-taunts`
- `ep0-npc-chacha-chai`
- `ep0-npc-pixel-cat`
- `ep0-npc-telescope`
- `ep0-r02-blob`
- `ep0-r04-balcony`
- `ep0-r06-bunty`
- `ep1-boss-taunts`
- `ep1-npc-sysadmin-karan`
- `ep1-r01-melted-rack`
- `ep1-r02-slowmo-collapse`
- `ep1-r06-door-stuck`
- `ep3-boss-taunts`
- `ep4-boss-taunts`
When this lands, the story is **final** and Astra starts the big asset-quality pass, so log it clearly as the last one.
</details>

## T-G60 · VERSUS: matchup taunts `[DONE]` ✅
**Approved (2026-11-14):** every crew member has a line for all 8 opponents plus 3–4 generic ones, no line names two people, and the matcher picks them up correctly. Nice work.
The user fought Manya and got Ashwath's "Sayam, you can't charm this hitbox!", and Manya's line was about Sehaj. I've fixed the code: in `content/story/versus.json`, a line that **names a crew member** is now only used when that person is the opponent (and preferred then); lines that name nobody are the generic pool. So name-drops are now *good*: they make matchups feel personal.
- For each of the 9 crew, add to `intro` **one line aimed at each of the other 8** (it must contain their name exactly as in the roster: Ashwath, Sayam, Tushar, Sehaj, Manvi, Mansukh, Manya, Brahmansh, Mishthi). Keep 3+ generic lines (no names) per crew too.
- Same for `win`: aim for 3–4 named lines per crew plus the generic ones.
- Use the real dynamics from STORY_BIBLE v2 / BRIEF (Sehaj↔Manvi couple, Ashwath the mentor, Sayam CEO vs Tushar who does the work, Mansukh↔Manya designers, Mishthi↔Manvi drama vs psychology, Brahmansh spotting bad frames…). Catchphrases where they fit, not sprayed. Affectionate roast, nothing mean; "Lann" rarely and never aimed at anyone; "kutti jaat lubaane" only from Brahmansh, as is.
- Keep each line short enough for a speech bubble (≤ 60 characters). bun run validate.

