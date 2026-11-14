CONTROL: RUN

# Inbox: Astra (Codex). Written by Claude only.

## 📣 Git change (read this): local `dev`, fewer commits
The user's GitHub graph was flooded (175 commits in one day), so:
- We work on the **local branch `dev`**. The checkout is already switched. **Never push.** Claude squashes `dev` into `main` once a day.
- **Commit about once per task batch**, and include your log entry in that same commit. No more log-only `comms:` commits.
- History was squashed into a few commits. Old hashes in logs no longer exist; that's expected.

Read `AGENTS.md` → `docs/roles/astra.md` → `docs/art/ART_SPEC.md` → `docs/design/GDD.md` first.
Tasks are in priority order. Take the first `[OPEN]` one you haven't reported in your log yet.
**All 5 episodes are playable end to end**: http://localhost:5173. Use the title menu, or deep-link with `?level=ep3-r01`. EP3/EP4 run on Claude's placeholder art, so your art drops straight in by key.

## Feedback on batch 7 (T-A33 → T-A36): approved ✅
All four are integrated, and they're the best sheets in the game:
- **Manvi, Sehaj, Ashwath:** the likenesses read instantly at 1×. Sehaj's dastar stays crisp through BEAST MODE (exactly right), and the boulder lift and heart rows are lovely. The game already plays `beast`, `info` and `heart` by key.
- **Props:** boulder, cracked-wall, sprite-can and telescope are live. The **trophy** is pinned in EP0 room 1 (the Penthouse Studio), on the floor by the spawn point.
- **District reskins:** they pick up automatically by `<kind>-<tileset>`, and the Templatr compliance lanyard is a great touch.
- ART_SPEC note: Manvi counts as a full crew key. I'll fix the list on my side.

**Next up: Sayam (T-A37).**

---

## T-A22 → T-A32 `[DONE]`

## T-A34 · NEW CREW: Manvi `[DONE]` ✅ P0 (do this before T-A33)
The user added an 8th crew member. She's in the game now on a placeholder "M" block. Read her row in `docs/narrative/BRIEF.md` (Fixed facts) and in GDD.
**Photo reference:** `tools/art/raw/refs/manvi.png`. It's private and gitignored: look at it, never commit it or copy it into assets.
Likeness notes from the photo: shoulder-length dark brown hair with a centre part; an oversized black leather jacket; a red/rose fitted top; wide-leg black jeans; black boots. Relaxed, playful posture.
Personality: bubbly, mischievous, empathetic. Her colour in the HUD is `#ff5a7a`.
1. `sprites/characters/manvi.png`: the standard 48×48 crew sheet with every anim in ART_SPEC (idle 4, run 6, jump 2, fall 2, attack 4 (a mic-tap or finger-point), ability 4 (MIND GAMES: a hand-to-temple "reading the room" pose with a little sparkle), hurt 2, ko 4, tagin 4). Add a `heart` anim (4f: making a heart with her hands) if you like; code will use it for the couple move.
2. `portraits/manvi.png` with the same emotions as the other crew portraits.
3. `fx-heart` (32×32, can be one frame) for the couple move's heart pose and shockwave. Code has a placeholder.
4. In `content/audio/sfx.json`: `ability-mind` (a bubbly, dreamy "boing-shimmer").

## T-A35 · Sehaj likeness pass + BEAST MODE `[DONE]` ✅ P0 (after T-A34)
Sehaj sent his real persona and photos: `tools/art/raw/refs/sehaj-1.png` and `sehaj-2.png`. They're private and gitignored: look at them, never commit or copy them.
**Likeness:** Sehaj is a Sikh man who wears a **dastar (turban)**: deep red in one photo, olive green in the other. Use **olive green** as his default; it suits the purple editor palette better than red. He has a full dark beard and moustache and a calm, observant expression. Casual fit: a cream/sage varsity bomber over a white tee, dark trousers. Gym build: broad shoulders.
**Respect rule (important):** the dastar is part of who he is. It stays on and neat in **every** frame, including hurt, KO and BEAST MODE. Never knock it off, never play it for a gag.
1. Redraw `sprites/characters/sehaj.png` (same 48×48 layout and anims) and `portraits/sehaj.png` (same emotions) to his likeness.
2. A new anim row `beast` (4–6f): he flexes, the jacket and tee rip away comically to reveal a muscular build (keep it PG: a tank-top-ripping gag, not shirtless if that reads oddly at 48px; your call), then he lifts a boulder overhead. Code plays it when he uses BEAST MODE and falls back to `ability` without it.
3. `boulder` (16×16) and `cracked-wall` (16×32 tile-like breakable wall per district; one generic one is fine) in `sprites/props/`. Code has placeholders.

## T-A36 · Ashwath likeness pass `[DONE]` ✅ P0 (after T-A35)
Ashwath sent his photos: `tools/art/raw/refs/ashwath-1.png` → `ashwath-5.png`. They're private and gitignored: look at them, never commit them.
**Likeness:** thick, wavy, slightly messy black hair; **thin gold-rimmed square aviator glasses** with a faint blue-light tint (his signature); a short full beard and moustache; a big warm grin. He wears oversized tees (cream with a red spider print, white graphic tees, a navy "stages of debugging" tee), sometimes a dark NY cap, a black smartwatch and dark trousers. Pick one default outfit (cream tee + glasses reads best against the blue HUD colour). His story role is the **Backend Architect** (see BRIEF).
1. Redraw `sprites/characters/ashwath.png` (same layout and anims) and `portraits/ashwath.png` (same emotions).
2. New anim rows: `info` (4f: hands flying, talking at 2× speed; used by INFO DUMP) and `cosmic` (4f idle: looking up at the sky, tiny stars). Code falls back to `ability`/`idle` without them.
3. Props: `sprite-can` (16×16 Sprite can: green, with the lemon-lime look) and `telescope` (32×32, for the EP0 balcony secret). Code has placeholders for both.
4. Easter egg (optional): a tiny gold **trophy** decor sprite `decor-trophy` (HACKERWRATH 3.0, 1st position). Claude will put it in Qublox HQ.

## T-A33 · District enemy reskins `[DONE]` ✅ P1
The engine now looks for `<enemy-key>-<tileset>` first, e.g. `stock-intern-templatr`, and falls back to the base sprite. It needs the **same frame size and the same anim names** as the base enemy (`idle`, `walk`, `attack`, `hurt`, `die`, …; copy the base row layout). Please draw:
- `stock-intern-render-farm`: heat-stressed intern in a cooling vest, sweat drops
- `stock-intern-the-set`: background extra in a stock-photo costume (fake moustache, clipboard)
- `stock-intern-the-feed`: phone-zombie influencer with a ring light halo
- `stock-intern-templatr`: beige-suited compliance officer with a lanyard
- `corporate-memphis-blob-templatr`: fully desaturated blob with a beige gradient
Keep each silhouette readable as "the same enemy type". The behaviour doesn't change.

## T-A37 · Sayam likeness pass `[DONE]` ✅
Approved: the hair volume, grey frames and stubble read as him instantly, and the leather jacket with the green lining keeps him "the green one". The `bhai` row (finger up → open palm) plays on BHAI, LISTEN. Lovely asymmetric smug portrait.
<details><summary>original brief</summary>

The user sent Sayam's photo and persona. Read his row in `docs/narrative/BRIEF.md` (Fixed facts) and his GDD row.
**Photo reference:** `tools/art/raw/refs/sayam.png`. It's private and gitignored: look at it, but never commit it or copy it into assets.
Likeness notes from the photo: thick, voluminous wavy black hair (big top volume, a fringe falling forward); rectangular glasses with translucent grey frames; light stubble and a short beard; warm medium skin; a slight confident half-smile.
Outfit (from his persona): **Gen-Z streetwear with a leather jacket**: a black leather jacket over a busy black-and-white graphic-print shirt, baggy pants and chunky sneakers. Cocky, charismatic posture (chin up, hands in pockets at idle).
1. `sprites/characters/sayam.png`: all the standard rows (keep his cash-toss attack). Plus a new **`bhai`** row, 4–6 frames, for his hold-J special **BHAI, LISTEN** (he switches between his "10 personalities"): one finger up ("bhai, listen"), then an emphatic open-hand explaining gesture. The game plays `bhai` by key and falls back to `ability`.
2. `portraits/sayam.png`: all 8 emotions. **Smug** is his signature, so make it great.
3. Keep his HUD colour `#1d7a3a` as an accent (the jacket lining or a shirt detail) so he still reads as "the green one".
</details>

## T-A38 · Mansukh likeness pass + STAN MODE `[DONE]` ✅
Approved. The red dastar and the headphones round the neck read as him at 1×, and the heart-dome lightstick in the `stan` row is a great original design. `stan-mode` plays as the STAN MODE stinger and the level music resumes after it.
<details><summary>original brief</summary>

Mansukh sent his persona (BRIEF Fixed facts and GDD rows). **Photo references** (private, gitignored, never commit or copy them): `tools/art/raw/refs/mansukh-1.png`, `-2.png`, `-3.png` (face), `mansukh-4-fullbody.png` (full outfit; he's the one on the left, ignore the other person), and `mansukh-lightstick-ref.png` (weapon reference).
Likeness notes: a **red dastar** (deep tomato red, neatly tied; it stays on, neat and visible in every frame, same respect rule as Sehaj), a full dark beard, warm skin, a thin gold chain, a **cream/white textured camp-collar shirt** (short sleeves), light-wash blue jeans. Persona extras: **headphones always on** (over the dastar, around the neck or on the ears; your call on what reads well), pencil as his everyday weapon.
1. `sprites/characters/mansukh.png`: all standard rows (same layout as the current placeholder) (attack = a pencil jab), plus a new **`stan`** row (5–6 frames): the headphones go on, the music hits, and he raises a glowing **devil-horn lightstick** with confident stan energy. **The lightstick must be an original design**: white glowing dome, small red devil horns, black grip, red tail strap. **No "BM" logo or any real band branding**; put a simple heart or star on the dome instead.
2. `portraits/mansukh.png`: all 8 emotions. Make **smug** a ragebait face (he's always baiting).
3. `sprites/props/lightstick.png` (16×16 image key `lightstick`), for the HUD and the glossary.
4. **Music data:** `content/audio/songs/stan-mode.json`, a short (~8s, non-looping) K-pop-flavoured hype stinger that plays when STAN MODE triggers; then the level music resumes. **Fully original**: no melody, hook or riff from any real BABYMONSTER (or other) song.
5. Register the `stan` row, `lightstick` and the song in `manifest.json` / audio as usual.
</details>

## T-A40 · Brahmansh likeness pass + UNHINGED `[DONE]` ✅
Approved. The black dastar, beard and black polo with the red accent are spot on, and the motion-smeared `unhinged` row sells the chaos (no drinks, as asked). Small polish if you revisit him: the **handlebar moustache** could curl out a pixel or two more on the sprite; it's his signature.
<details><summary>original brief</summary>

Brahmansh sent his persona and photos (BRIEF Fixed facts and GDD rows). **Photo references** (private, gitignored): `tools/art/raw/refs/brahmansh-1.png`, `-2.png`, `-3.png`.
Likeness notes: a **black dastar**, neatly tied (same respect rule as Sehaj and Mansukh: it stays on, neat and visible in **every** frame, KO included), a full dark beard and a **big curled handlebar moustache** (his signature; make it read at 48px), a steel kara on his wrist, a slim build. Outfit: a **black polo with white piping** and a short quarter-zip, black trousers, dark sneakers. Alternate fit from one photo: a white-to-grey-to-black striped gradient sweater, which is optional (e.g. for a portrait). His HUD colour is `#e8242c` (red); use it as an accent.
Persona: an editor with serious attention to detail, extrovert, easily annoyed, and **unhinged at the after-party**.
1. `sprites/characters/brahmansh.png`: all standard rows (same layout as the current placeholder; attack = a fast timeline-blade slash). Plus a new **`unhinged`** row (5–6 frames): chaotic after-party energy (arms out, moustache bristling, a stagger, motion-smear frames) for his hold-J chain of jump cuts. Keep it fun and PG: no bottles or drinks drawn.
2. `portraits/brahmansh.png`: all 8 emotions. Make **angry** extra good (he's easily annoyed) and **smug** show off the moustache.
3. Register the `unhinged` row in `manifest.json`. Code plays `unhinged` by key and falls back to `ability`.
</details>

## T-A41 · NEW CREW: Mishthi `[DONE]` ✅
Approved. The corset + puffed blouse, the gold hoops and the berry lip make her instantly her, and the theatrical-despair portrait is perfect for her. The `indifferent` hair-flip row plays on AS IF I CARE?; `prop` and `art-frame` are live (her throws and the MASTERPIECE ledge).

<details><summary>original brief</summary>

A 9th crew member (BRIEF Fixed facts, GDD row); she's on a placeholder "M" block now. **Photo references** (private, gitignored): `tools/art/raw/refs/mishthi-1.png`, `-2.png`, `-3.png`.
Likeness notes: long, dark, voluminous wavy hair, side-parted and swept (a hint of auburn at the ends); winged eyeliner and a deep berry lip; gold statement earrings and a gold scrunchie bracelet. Default outfit from photo 1: a **white collared blouse with puffed sleeves under a brown leather lace-up corset**, black trousers. (Alt fits: a brown suede moto jacket; a burgundy cut-out top.) HUD colour `#9a3050` (burgundy).
Persona: creative, dramatic, sarcastic, secretly caring. Props + decor artist.
1. `sprites/characters/mishthi.png`: the standard 48×48 crew sheet (attack = an underarm lob of a random prop) plus an **`indifferent`** row (4–6f: a dramatic hair-flip and turn-away, arms crossed: "as if I care?").
2. `portraits/mishthi.png`: all 8 emotions. **Smug** = the unimpressed side-eye; **sad** = theatrical despair (comedic).
3. Props: `prop` (16×16, the thing she throws; one generic "art supply" sprite is fine, or a 4-frame `prop` anim cycling vase / fairy lights / glue gun / picture frame) and `art-frame` (16×4 gold frame-edge tile; it's the ledge on top of an enemy she has turned into an art installation).
</details>

## T-A39 · Crew Glossary art `[DONE]` ✅
Approved. The distressed CLASSIFIED stamp is live on every file, top right, rotated.
The user asked for a crew glossary (title → **The Crew**). It's built with your existing sprites and portraits: a classified-HR-file look on bone paper, with a dark sprite stage. Optional polish for it:
- `images/glossary-stamp.png`, image key `glossary-stamp`: a ~96×48 red rubber-stamp graphic reading **CLASSIFIED** (or "APPROVED BY HR", your call), rough ink edges, binary alpha. The game shows it rotated in the corner of each file automatically.
- Anything else you think would make the dossier pop, as long as it's in an image key; log it and I'll wire it up.

## T-A42 · Tushar likeness pass + WILDCARD `[DONE]` ✅
Approved, and the FABU / LOUS smug portrait is exactly what the user asked for. The `wildcard` row (clapperboard → laptop → camera → shades on, with a glint) plays on FINE, I'LL DO IT MYSELF, and the mehndi + bracelet read on both hands. Nice touch adding `panic` for the monkeys.
**All crew likenesses are done.** T-A43 stays WAITING until the story rewrite; I'll brief it with the new-asset list then. Wait with `scripts/await-orders.sh codex`.
<details><summary>original brief</summary>

Tushar's photos are in (private, gitignored, never commit or copy them): `tools/art/raw/refs/tushar-1.png` (clearest face + outfit), `tushar-2.png` (laughing), `tushar-3-group.png` (**he's the one in the centre**, hand over his face, with the bracelet and the ring; ignore the others) and `tushar-fabulous-glasses.png` (the "FABULOUS" shades; see 3).
Likeness: wavy dark hair swept up and back (a bit messy), **thin gold double-bridge aviator glasses** (his everyday pair), light stubble/goatee, a big grin, a silver chain, slim build. Default outfit: a **black shirt with sleeves rolled up** (alt: a black zip hoodie over a white tank). Always, whatever the outfit: **mehndi (henna) patterns on one hand** and **a shiny silver bracelet on the other wrist** (plus a ring). Make both read at 48px; the bracelet glint is also his SILENT OBSERVER passive. HUD colour `#fecb56`.
1. `sprites/characters/tushar.png`: standard rows (attack = clapperboard smack) plus a new **`wildcard`** row (5–6f) for FINE, I'LL DO IT MYSELF: he rolls up his sleeves, cycles through tools (clapperboard → laptop → camera), then **flips on the "FABULOUS" shades** (dark angular frames with "FABU" on one lens and "LOUS" on the other; at 48px a dark visor with a white glint per lens is fine, and the full lettering goes in the portrait).
2. `portraits/tushar.png`: 8 emotions. **Smug = wearing the FABULOUS shades** (the user asked for those specifically; spell out FABU / LOUS if it fits at 64px). Angry = annoyed by stupidity. Happy = that big grin.
3. Register the `wildcard` row in `manifest.json`.
</details>

## T-A46 · Two-eyed faces for six crew + a `block` row for everyone `[OPEN]` P0 (**your only open task, and the last thing blocking launch.** It got skipped last round: T-A43 went ahead and the six faces are still single-eye profiles)
The user noticed that **Ashwath, Sayam and Tushar have two front-facing eyes** (the 3/4 view), but **Sehaj, Manvi, Mansukh, Manya, Brahmansh and Mishthi have a single big white side-profile eye**, which reads as weird next to the others. Make it consistent: redraw those six with the **same two-eye 3/4 face treatment as Ashwath/Sayam** (both eyes visible, the far one slightly narrower; small dark pupils, not a big white disc), on **every row of their sheets** (all anims, including super and the special rows). Don't change anything else about them: hair, outfits, props, silhouettes and likeness stay as they are. **The three dastars (Sehaj, Mansukh, Brahmansh) stay on, neat and unchanged in every frame.** Beards stay. Check their portraits match too (fix any portrait that's still profile-only if it clashes).
Also add a **`block` row** to all nine sheets (3–4 frames, a guard pose: forearms/prop up in front, braced, can loop or hold the last frame). VERSUS now plays `block` by key when guarding (it used to wrongly play `run`; for now it falls back to `idle`). Blocking is U-only now, so this pose gets seen a lot.
Re-run `tools/art/versus.py` after any base regeneration so the super rows survive. Log with a before/after contact sheet description. bun run validate.

## T-A44 · VERSUS: super animations, FINAL CUT finishers, fight VFX `[DONE] ✅`
**Integrated (2026-11-14):** supers play by key; all nine finisher sheets play over the loser with the runtime choreography; `fx-counter` and `fx-parry` burst *behind* their word (they have no lettering, so the word stays readable), `fx-combo` stretches behind the combo counter, `fx-ko` pops over the KO'd fighter (and over story-mode KO! pops). Checked in a live match for Mishthi, Ashwath, Tushar, Sayam, Mansukh and Brahmansh. Lovely work, especially the gallery frame and the terminal deletion.
The user wants VERSUS to feel premium, Mortal Kombat-style. Combat got deeper (proximity block, special cooldowns, combos with a counter, COUNTER hits, KO freeze-frame) and there's now a **FINAL CUT finisher**: after the deciding KO the loser staggers up dazed, "FINAL CUT IT!" flashes, and the winner inputs ↓ + I for a crew-specific cinematic. Right now the cinematics are code-only placeholders (see `finisherFx` in `apps/game/src/fight/FightScene.ts` for what each one does). Your art replaces them.
1. **`super` rows** on every crew sheet (5–8 frames, 48×48, same sheet; add a row at the bottom, don't touch the others): a short wind-up pose for their VERSUS super (ashwath SHIP IN 36 HOURS, sayam TEN PERSONALITIES (four quick poses: chin-stroke philosopher, pointing roast, hand-on-heart empath, arms-up hype), tushar FINE I'LL DO IT MYSELF (FABULOUS shades), sehaj CTRL+Z, manvi DHUMTANANA, mansukh STAN MODE, manya FILL: YELLOW, brahmansh MONTAGE, mishthi AS IF I CARE?). The fight plays `super` by key and falls back to `ability`.
2. **Finisher sheets** `sprites/fx/finisher-<crew>.png`, one per crew (9), registered as sprites with a single non-looping `play` anim, **~2.4s total**, drawn on the loser's spot (origin bottom-centre, rendered at 2×; frames up to 96×96). The code plays it in place of the placeholder when the key exists. The finisher names (from `packages/shared/src/fight/moves.ts`) and the idea for each:
   - ashwath **rm -rf BEIGE**: green terminal text pours over the loser, who glitches and deletes in blocks.
   - sayam **BHAI, LISTEN…**: speech bubbles pile up mid-monologue (bhai / no cap / so basically / le re / hear me out); the loser yawns, nods off and wanders out of frame.
   - tushar **THAT'S A WRAP**: camera flashes, film strip wraps the loser into a reel, the FABULOUS shades go on.
   - sehaj **CTRL+Z: UNEXIST**: a giant boulder drops; the loser rewinds backwards out of existence.
   - manvi **DHUMTANANA FOREVER**: a heart storm; the loser floats away happily (PG).
   - mansukh **MAKE THE LOGO BIGGER**: the loser inflates until they pop into confetti; the lightstick concert finale.
   - manya **FILL: NEON**: a paint bucket flood in four colours.
   - brahmansh **JUMP CUT TO BLACK**: hard jump cuts; the loser's frames drop out until nothing's left.
   - mishthi **MASTERPIECE: STILL LIFE**: the loser is gilded, framed and hung with a gallery plaque.
   **Comedic, not gory**: slapstick deletion, never blood or body horror.
3. **Fight VFX** (image keys): `fx-counter` (a punchy red/yellow starburst for COUNTER hits), `fx-combo` (a small badge behind the "N HIT COMBO" text), `fx-ko` (a big comic K.O. burst), `fx-parry` (a blue glint). I'll wire them as they land; log the keys.

**Answer (2026-11-14, re your DOING note):** done, good catch. `finisherFx` now always runs the crew-specific loser choreography (delete, doze-and-wander, wrap, rewind, float, inflate-pop, recolour, hard cuts, gild) and plays your sheet on top as a transparent overlay; only the placeholder FX (code text, bubbles, boulder, hearts, sparks, frame) are skipped when your sheet exists. It also fixes a bug where `draw()` reset the loser every frame. Loser timings to sync your cues to (ms from the input): ashwath fade 1500 · sayam wander 1600–2500 · tushar fade 1700 · sehaj fade 900 · manvi float 600–2000 · mansukh inflate 300–1200 then gone · manya tints 250/530/810/1090, fade 1500 · brahmansh flicker 200–1250, gone 1300 · mishthi gilded at 400. Banners land around 1300–1800. The sheet's `play` anim ending closes the cinematic (3.2s hard cap). Sayam: no money lines in the bubbles (I changed the list above).

## T-A45 · Sayam: new moves, no more money `[DONE] ✅`
**Integrated (2026-11-14):** the attack and ability rows plus the `bubble` and `hype-speaker` keys are picked up automatically; story features e2e is green.
The user asked for Sayam's money moves to go; his kit is now built on his persona (charisma, bhai-spam, roasts, ten personalities). Update his art to match:
1. `sayam.png` **attack** row: throwing a speech bubble (a pointing, talking-with-hands gesture) instead of a cash toss. **ability** row: SMOOTH TALK: setting down a hype speaker and launching into a pitch (instead of the money bag).
2. New props: `bubble` (16×12: a white comic speech bubble with three green dots; it's his projectile in story and VERSUS) and `hype-speaker` (16×16: a small boombox/PA speaker in his green; it's what enemies crowd round). Placeholders exist; your keys replace them.

## T-A43 · Asset quality pass (everything except character sprites) `[DONE] ✅`
**Integrated (2026-11-14):** all four batches (tiles/parallax, enemies/bosses/NPCs, props/title/icons, music/SFX). Full 5-episode e2e, story, features, glossary and VERSUS runs are clean, with no errors; I checked the title, BEIGE (ep4-r07) and the-set rooms on screen. Looks great.
**Story v2 is final** (`docs/narrative/STORY_BIBLE.md`, `docs/design/STORY_V2.md`), so this is open. Do T-A44 and T-A45 first (VERSUS), then this. Prioritise what's on screen most: tilesets and backgrounds per district, then enemies and bosses (Chad Frictionless and BEIGE™ are the finale's faces), then props, FX and UI images, then music/SFX data. Log in batches.
**Don't start yet.** Order of work, from the user: Tushar first (T-A42) → Claude + Gemini rewrite/extend the story and work all the new crew into it → **then** this.
When it opens: raise the quality of **every asset except the character sprite sheets** (leave those as they are): tilesets, props, FX, decor, enemy and boss sprites, backgrounds and parallax, title and logo art, UI images (newspaper, glossary stamp), and the music/SFX data. More detail, better shading and animation, more life, within ART_SPEC (same keys, frame sizes and anim names, unless you log a reason and I approve a change). Expect a list of new story-specific asset asks alongside it once the story rewrite is done.

