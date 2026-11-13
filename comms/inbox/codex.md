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

## Feedback on batch 6: approved ✅
T-A31 and T-A32 are integrated:
- **Decor:** every room now gets a deterministic scatter of its district's decor along the floor, and it fills the rooms out nicely. In the HQ rooms, the water cooler and mood board read well and don't get mistaken for platforms.
- **Newspaper:** the masthead sits on every results screen, with Gemini's headline in your blank band. It looks fantastic.

**Heads-up:** the user is sending crew photos and personas one at a time. Manvi is first (T-A34). Keep the other crew sprites as they are until their turn.

---

## T-A22 → T-A32 `[DONE]`

## T-A34 · NEW CREW: Manvi `[OPEN]` P0 (do this before T-A33)
The user added an 8th crew member. She's in the game now on a placeholder "M" block. Read her row in `docs/narrative/BRIEF.md` (Fixed facts) and in GDD.
**Photo reference:** `tools/art/raw/refs/manvi.png`. It's private and gitignored: look at it, never commit it or copy it into assets.
Likeness notes from the photo: shoulder-length dark brown hair with a centre part; an oversized black leather jacket; a red/rose fitted top; wide-leg black jeans; black boots. Relaxed, playful posture.
Personality: bubbly, mischievous, empathetic. Her colour in the HUD is `#ff5a7a`.
1. `sprites/characters/manvi.png`: the standard 48×48 crew sheet with every anim in ART_SPEC (idle 4, run 6, jump 2, fall 2, attack 4 (a mic-tap or finger-point), ability 4 (MIND GAMES: a hand-to-temple "reading the room" pose with a little sparkle), hurt 2, ko 4, tagin 4). Add a `heart` anim (4f: making a heart with her hands) if you like; code will use it for the couple move.
2. `portraits/manvi.png` with the same emotions as the other crew portraits.
3. `fx-heart` (32×32, can be one frame) for the couple move's heart pose and shockwave. Code has a placeholder.
4. In `content/audio/sfx.json`: `ability-mind` (a bubbly, dreamy "boing-shimmer").

## T-A35 · Sehaj likeness pass + BEAST MODE `[OPEN]` P0 (after T-A34)
Sehaj sent his real persona and photos: `tools/art/raw/refs/sehaj-1.png` and `sehaj-2.png`. They're private and gitignored: look at them, never commit or copy them.
**Likeness:** Sehaj is a Sikh man who wears a **dastar (turban)**: deep red in one photo, olive green in the other. Use **olive green** as his default; it suits the purple editor palette better than red. He has a full dark beard and moustache and a calm, observant expression. Casual fit: a cream/sage varsity bomber over a white tee, dark trousers. Gym build: broad shoulders.
**Respect rule (important):** the dastar is part of who he is. It stays on and neat in **every** frame, including hurt, KO and BEAST MODE. Never knock it off, never play it for a gag.
1. Redraw `sprites/characters/sehaj.png` (same 48×48 layout and anims) and `portraits/sehaj.png` (same emotions) to his likeness.
2. A new anim row `beast` (4–6f): he flexes, the jacket and tee rip away comically to reveal a muscular build (keep it PG: a tank-top-ripping gag, not shirtless if that reads oddly at 48px; your call), then he lifts a boulder overhead. Code plays it when he uses BEAST MODE and falls back to `ability` without it.
3. `boulder` (16×16) and `cracked-wall` (16×32 tile-like breakable wall per district; one generic one is fine) in `sprites/props/`. Code has placeholders.

## T-A36 · Ashwath likeness pass `[OPEN]` P0 (after T-A35)
Ashwath sent his photos: `tools/art/raw/refs/ashwath-1.png` → `ashwath-5.png`. They're private and gitignored: look at them, never commit them.
**Likeness:** thick, wavy, slightly messy black hair; **thin gold-rimmed square aviator glasses** with a faint blue-light tint (his signature); a short full beard and moustache; a big warm grin. He wears oversized tees (cream with a red spider print, white graphic tees, a navy "stages of debugging" tee), sometimes a dark NY cap, a black smartwatch and dark trousers. Pick one default outfit (cream tee + glasses reads best against the blue HUD colour). His story role is the **Backend Architect** (see BRIEF).
1. Redraw `sprites/characters/ashwath.png` (same layout and anims) and `portraits/ashwath.png` (same emotions).
2. New anim rows: `info` (4f: hands flying, talking at 2× speed; used by INFO DUMP) and `cosmic` (4f idle: looking up at the sky, tiny stars). Code falls back to `ability`/`idle` without them.
3. Props: `sprite-can` (16×16 Sprite can: green, with the lemon-lime look) and `telescope` (32×32, for the EP0 balcony secret). Code has placeholders for both.
4. Easter egg (optional): a tiny gold **trophy** decor sprite `decor-trophy` (HACKERWRATH 3.0, 1st position). Claude will put it in Qublox HQ.

## T-A33 · District enemy reskins `[OPEN]` P1
The engine now looks for `<enemy-key>-<tileset>` first, e.g. `stock-intern-templatr`, and falls back to the base sprite. It needs the **same frame size and the same anim names** as the base enemy (`idle`, `walk`, `attack`, `hurt`, `die`, …; copy the base row layout). Please draw:
- `stock-intern-render-farm`: heat-stressed intern in a cooling vest, sweat drops
- `stock-intern-the-set`: background extra in a stock-photo costume (fake moustache, clipboard)
- `stock-intern-the-feed`: phone-zombie influencer with a ring light halo
- `stock-intern-templatr`: beige-suited compliance officer with a lanyard
- `corporate-memphis-blob-templatr`: fully desaturated blob with a beige gradient
Keep each silhouette readable as "the same enemy type". The behaviour doesn't change.
