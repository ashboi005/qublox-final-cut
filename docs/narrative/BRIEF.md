# Narrative brief: the contract between writing and code (owned by Claude)

Gemini owns the words: story, dialogue, barks, names, flavor text. This file covers the tone, the facts you can't change, and the **JSON formats** the game reads. `bun run validate` checks them.

## Tone

- **A funny, sarcastic parody** with slapstick and dark jokes, packed with pop-culture references (films, memes, tech culture, Bollywood, AI hype, agency life, client horror stories).
- The crew are close friends in real life. Roast them **affectionately**: a sitcom gang, not a bully. No slurs, nothing cruel about a real person's body, family or private life.
- The villain BEIGE™ is a parody of soulless AI content. Our game is made by AIs, and you're allowed to be self-aware about that.
- **Keep it short.** A line of dialogue is at most **90 characters**, which is about one breath. Nobody reads walls of text in an action game.
- Hinglish and Punjabi slang are welcome where they're natural ("oyee", "yaar", "scene", "jugaad"), but keep them readable for everyone.

## Fixed facts (don't change these)

See `docs/design/GDD.md`, which covers the episodes, BEIGE™/Templatr, the Final Cut and Neo-Amritsar 2084.

| id | Name | Job | Class | Catchphrase (canon) | Known trait |
|---|---|---|---|---|---|
| `ashwath` | Ashwath | Developer / tech guy | Backend Architect (support-DPS hybrid) | Canon, by situation: fight starts "Khel khtm." · things go south "Ghee khtm." · crit "ts pmo sm gng icl fr" · someone says something insane "Oyeee pagaalllll!" · ragebaited "Abeeee yaarrr!" · a junior does something dumb but adorable "Diagnosis: skill issue." · greeting/calling a friend "Dost" | **Persona from Ashwath himself:** Minecraft brain since 2014 (every problem is blocks to arrange). Night owl: commits at 1–4 AM, runs on tea (cozy vibes) and Sprite (fizzy pick-me-up). Talks 2× faster than humans, info-dumps distributed systems. Hackathon legend ("learned Flask in 3 days"). Has mentored 250–300 students and never minds repeating himself. Ex-Valorant Brimstone main (knows every smoke lineup). Cosmic existentialist: obsessed with space and aliens, sad that lifespans are too short to explore the universe. Owns a folder of 1800+ Reddit memes and an 800-day Reddit streak. **Real trophy:** his team won HACKERWRATH 3.0 (a 24-hour hackathon at GNDU, Amritsar; 1st position), so "Ship in 36 Hours" is earned |
| `sayam` | Sayam | CEO | Boss | Canon: "Le re." · "Chuda lag gya hai." (we're cooked / it's all gone wrong) · "Get a load of this guy." (roasting someone) · spams **"bhai"** before anything major ("Bhai. Bhai. BHAI. Listen.") | **Persona from Sayam himself:** charismatic, a bit cocky, but somehow empathetic; curious and hungry. Wildly paradoxical, like 10 different personalities inside one guy. Either drowning you in Gen-Z slang, going deep into a philosophical discussion, or geeking out about anything, anywhere. Gen-Z streetwear with a leather jacket. Still throws money at problems (literally) and delegates everything |
| `mansukh` | Mansukh | Graphic designer + game dev | Builder | "Babymonnsterrr!" | **Persona from Mansukh himself:** multitasks between design, game dev, gaming and music, but unstably. Game dev who spends more time tweaking than finishing; 15 tabs open and 3 unfinished projects; IDEAL PROCRASTINATION (opens a new project instead of finishing this one); somehow always has a new hobby. Always has music playing, headphones always on. **BABYMONSTER stan (ASA bias)**: their songs give him a massive confidence boost (STAN MODE). Creative, competitive, socially active, and always ragebaiting people (affectionately). Weapons: a pencil and a devil-horn lightstick. Pen-tool wizard; client feedback is his kryptonite |
| `manya` | Manya | Graphic designer | Colorist | (open, you may propose one) | Paint and colour; hates beige |
| `sehaj` | Sehaj | Video editor | Time-bender | "Vajj!" (canon) · "Fir khende bohota galla kad da" (canon: "and then you say I swear a lot"; a deadpan comeback). He **recorded** "vajj", that line and a weird laugh, and the game plays them | **Persona from Sehaj himself:** an observer who doesn't speak much (few words, dry, well-timed). Gamer, gym enthusiast (strong), loves movies, tries to spread positivity and admits he sometimes fails. Loves his girl Manvi (calls her "Maana"). Ctrl+Z on reality; always waiting on renders |
| `brahmansh` | Brahmansh | Video editor | Rogue | Canon (he **recorded** these; the game plays his real voice): "Ghdachh gulla tha" (written **"GG thaa 🔫"**, said when something's done/won) · "Parlaug bire" (sending someone off) · "Kutti jaat lubaane" (when he's annoyed; see the note below) · "House of shakes" | **Persona from Brahmansh himself:** niche-community humour, extrovert and accepting, **easily annoyed**, serious attention to detail (an editor who sees the one bad frame), and **unhinged at the after-party**. Jump cuts and speed; glass cannon |
| `tushar` | Tushar | Multidisciplinary creative + ops generalist: ideation, scripting, cinematography, directing, editing, product, tech, on-ground ops | Wildcard ("The Wandering Generalist") | Canon: "Shaanttt hojaaa" (calm down; it's also his CUT!) · "Prabhu" · "Behen di tang" · "Lann" (crude Punjabi; his own exclamation, use **rarely**, only from him, never aimed at a person). "I hate monkeys." stays as the running gag | **Persona from Tushar himself:** a quiet observer with a restless mind; enjoys being around people without being the centre. Curious, creative, ambitious, disciplined, adventurous, caring, occasionally sarcastic, **easily annoyed by stupidity**, surprisingly chaotic when comfortable. The unofficial parent of the friend group; leads through action, not authority; takes responsibility for problems that aren't his ("fine, I'll do it myself"); a little cocky about his potential but proves it by doing. Doesn't like staying in one place. **Style:** mehndi (henna) on one hand (tattoos are permanent, mehndi isn't, and it's cultural) and a shiny bracelet on the other, whatever he's wearing |
| `mishthi` | Mishthi | Creative work: art, props + decor, graphics, drawing | Improviser | Canon: "Oh my god wtf bhai" · "Dam bhai" · "As if I care?" | **Persona from Mishthi herself:** creative, curious, emotional; dramatic, sarcastic and a bit "depressed" (in the deadpan, dramatic-sigh way, played for comedy, never mocking real sadness), and genuinely caring underneath. Superpower: creative improvisation and adaptability, turning random things into art. Her caring side shows in actions, not words ("as if I care?" while patching you up) |
| `manvi` | Manvi | Creative work, art, communication (studying psychology) | Psychologist | "Yippieeee!" · "Whatcha doin?" · "Hawwww!" · "Dhumtanana!" (all canon) | Bubbly, fun-loving, empathetic, funny, mischievous, straightforward. Loves seeing people smile and having fun; does masti with her boyfriend Sehaj and friends |

**Note on "kutti jaat lubaane":** it's Brahmansh's own in-joke about his own community. Only Brahmansh says it, only as that exact catchphrase. Don't build new jokes about castes or communities around it, and don't put it in anyone else's mouth.
**Voice lines:** some crew recorded their catchphrases (`voicelines/<crew>/`). The game plays the real recording and shows its label as the caption, so for those moments your text bark is the fallback.

**Couple:** Sehaj and Manvi are a couple. When you swap straight from one to the other they do a **COUPLE MOVE**: a heart pose, a heart shockwave and a heal. Keep it sweet and PG; the friends roasting them for being cute is fair game.

Proposed catchphrases for the open slots are just suggestions. Mark them `"proposed": true`.

## Formats

All files are UTF-8 JSON. Ids are lowercase kebab-case. `speaker` must be a crew id, an id from `content/story/cast.json` (NPCs and villains you create), or `"narrator"`.

### `content/story/cast.json`: NPCs and villains you invent

```json
{
  "cast": [
    { "id": "beige", "name": "BEIGE™", "kind": "villain", "bio": "One line.", "voice": "How they talk, in one line." }
  ]
}
```

### `content/story/crew-voices.json`: how each crew member talks

```json
{
  "voices": [
    { "id": "ashwath", "voice": "One or two lines on how he talks.", "vocab": ["oyee", "pagal", "deploy"], "never": "Something he would never say.", "proposedCatchphrase": null }
  ]
}
```

### `content/dialogue/<episode>-<scene>.json`: a dialogue scene

```json
{
  "id": "ep0-cold-open",
  "episode": 0,
  "trigger": "Plays when the level starts. Describe where or when in words; Claude wires it up.",
  "lines": [
    { "speaker": "narrator", "text": "Neo-Amritsar, 2084. 11:58 PM. Delivery is at 9 AM." },
    { "speaker": "sayam", "emotion": "smug", "text": "Relax. I've delegated the panic to Ashwath." },
    { "speaker": "ashwath", "emotion": "panic", "text": "Oyee pagalll, the render server just turned BEIGE." }
  ]
}
```

- `emotion` is optional, one of: `neutral`, `smug`, `panic`, `angry`, `deadpan`, `happy`, `sad`, `shocked`.
- 3 to 14 lines per scene. Fewer and funnier is better.

### `content/barks/<id>.json`: short combat and world one-liners for a crew member

```json
{
  "id": "tushar",
  "barks": {
    "tagin":   ["Action!", "And… we're rolling."],
    "ability": ["CUT!", "Hold that frame!"],
    "hit":     ["My lens!"],
    "ko":      ["That's a wrap… for me."],
    "kill":    ["Print it."],
    "idle":    ["Is that… a monkey? No. Okay."],
    "monkey":  ["MONKEY. MONKEY. I HATE MONKEYS."]
  }
}
```

- Each bark is at most **40 characters**. Write 3–6 per category. The categories above are required; you may add more and Claude will wire up the ones that make sense.

### `content/story/flavor.json`: names and descriptions for enemies, items, places and signage

```json
{
  "enemies":  [{ "id": "infinite-monkey", "name": "Infinite Monkey", "desc": "Max 80 chars." }],
  "items":    [],
  "places":   [],
  "signage":  ["Short text for background billboards, posters and screens. Max 24 chars each."]
}
```

### `content/story/quips.json`: loading tips, game-over lines, results-screen roasts

```json
{
  "taglines": ["Rotates under the title logo. (≤40 chars)"],
  "loading":  ["Tip: Sayam can't jump. Sayam can pay someone to jump. (≤70 chars)"],
  "gameover": ["Creative differences. Everyone's KO'd. (≤60 chars)"],
  "results":  { "D": ["That was… a draft."], "C": [], "B": [], "A": [], "S": [], "MAXIMALIST": ["Cannes is calling."] },
  "headlines": { "0": ["NEO-AMRITSAR TIMES: LOCAL STUDIO REFUSES TO REPLY-ALL (≤70 chars)"], "1": [], "2": [], "3": [], "4": [] },
  "bylines":  ["By Pammi Aunty, Gossip Desk (≤48 chars)"]
}
```

### `content/story/achievements.json`: names and descriptions (the ids are fixed by code)

```json
{ "achievements": [ { "id": "first-swap", "name": "≤32 chars", "desc": "≤80 chars: how to get it, said funny" } ] }
```

Ids (all required): `first-swap` (swap crew for the first time), `maximalist` (reach MAXIMALIST STYLE), `no-ko-episode` (finish an episode with zero KOs), `monkey-business` (Tushar gets touched by a monkey), `le-re` (Sayam uses SMOOTH TALK 10 times), `rewind-reflect` (Sehaj CTRL+Zs a projectile back at someone), `ad-skipped` (jump-cut through a pop-up ad), `paint-the-town` (Manya repaints 50 blocks), `chai-addict` (drink 10 chai), `small-talk` (talk to every NPC), `beige-is-dead` (beat BEIGE™), `speedrun-ep0` (finish Episode 0 in under 4 minutes), `directors-cut` (find all 15 Lost Footage tapes).
**Persona achievements (story v2, also required):** `night-owl` (play while Ashwath's 1–4 AM Night Owl buff is on) · `sprite-fizz` (drink 5 Sprite cans) · `stargazer` (look through the EP0 balcony telescope) · `ten-personalities` (see all of Sayam's BHAI, LISTEN personalities) · `do-it-myself` (Tushar uses a borrowed ability during FINE, I'LL DO IT MYSELF) · `silent-observer` (Tushar spots 5 hidden things) · `light-weight` (Sehaj's boulder smashes a cracked wall) · `pep-talk` (Manvi revives a KO'd crew member) · `stan-mode` (Mansukh gets 5 KOs in one STAN MODE) · `frame-perfect` (Brahmansh lands 10 FRAME PERFECT hits) · `house-of-shakes` (UNHINGED catches 4+ enemies at once) · `gallery-opening` (stand on one of Mishthi's MASTERPIECE art installations) · `as-if-i-care` (5 enemies demoralised in one AS IF I CARE?) · `full-roster` (play as all 9 crew members).

### `content/story/footage.json`: Lost Footage tapes (the ids are fixed by code)

Three hidden VHS tapes per episode. Picking one up shows `📼 <title>: <caption>` as a toast, and the Achievements screen archives them.
They're the crew's lost raw footage, outtakes and behind-the-scenes clips from before BEIGE™, so they're mini lore and in-jokes.

```json
{ "tapes": [ { "id": "ep0-1", "title": "≤32 chars", "caption": "≤90 chars" } ] }
```

Ids (all 15): `ep0-1` `ep0-2` `ep0-3` `ep1-1` `ep1-2` `ep1-3` `ep2-1` `ep2-2` `ep2-3` `ep3-1` `ep3-2` `ep3-3` `ep4-1` `ep4-2` `ep4-3`.
Where they are (so the caption can fit the spot): ep0-1 secret ledge by the penthouse cubicles · ep0-2 mid-air over the maglev balcony drop · ep0-3 end of the gear-cage lighting truss · ep1-1 right above a boiling steam vent · ep1-2 a side ledge in the cache chamber · ep1-3 over the turbine trench catwalks · ep2-1 over the prop-warehouse chasm · ep2-2 above the lighting-grid pit · ep2-3 under a swinging boom mic · ep3-1 off the edge of the scroll base · ep3-2 near the paywall chai · ep3-3 mid-air in the rage-bait refinery · ep4-1 Templatr atrium mezzanine · ep4-2 above the shredder-room ledge · ep4-3 on top of Chad's keynote stage.

### `content/story/versus.json`: VERSUS (1v1 fight mode) lines

```json
{ "crew": { "ashwath": { "intro": ["≤40: pre-fight taunt, shown over their head at round 1"], "win": ["≤70: victory quote on the result screen"] } } }
```
Write for all 8 crew (`ashwath sayam tushar sehaj manvi mansukh manya brahmansh`). Their VERSUS moves are in `docs/design/FIGHT_MODE.md`.

### `content/story/glossary.json`: the Crew Glossary (title → The Crew)

A "classified HR personnel file" for each crew member. The screen already shows their animated sprite, portrait, stat bars and **every power** (story and VERSUS, generated from code), so don't list mechanics here. Write the personality: sarcastic, affectionate, funny, never actually mean.

```json
{
  "intro": "≤140: one line at the top of the screen (HR disclaimer energy)",
  "crew": {
    "mansukh": {
      "title": "≤40: an HR job title, e.g. 'Senior Vice President of Unfinished Projects'",
      "tagline": "≤90: a one-line roast or motto",
      "bio": "≤360: 2–4 sentences. The real persona, written as a deadpan HR file",
      "catchphrases": ["≤40 each, max 6: their CANON catchphrases only, exactly as in Fixed facts"],
      "facts": ["≤80 each, max 6: 'Known weakness: …', 'Last seen: …', 'HR complaints filed: 14'"],
      "threat": "≤48: 'Threat level: …'"
    }
  }
}
```
Crew with no persona from the user yet (Tushar, Manya, Brahmansh): write from what's in Fixed facts and keep their catchphrases to the canon ones (empty if none). They'll get a rewrite when their persona arrives.

## Docs you own

- `docs/narrative/STORY_BIBLE.md`: the plot, episode by episode, what each character wants and the running gags.
- Anything else under `docs/narrative/` (except this file).
