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
| `ashwath` | Ashwath | Developer / tech guy | Backend Architect (support-DPS hybrid) | Canon, by situation: fight starts "Khel khtm." · things go south "Ghee khtm." · crit "ts pmo sm gng icl fr" · someone says something insane "Oyeee pagaalllll!" · ragebaited "Abeeee yaarrr!" · a junior does something dumb but adorable "Diagnosis: skill issue." | **Persona from Ashwath himself:** Minecraft brain since 2014 (every problem is blocks to arrange). Night owl: commits at 1–4 AM, runs on tea (cozy vibes) and Sprite (fizzy pick-me-up). Talks 2× faster than humans, info-dumps distributed systems. Hackathon legend ("learned Flask in 3 days"). Has mentored 250–300 students and never minds repeating himself. Ex-Valorant Brimstone main (knows every smoke lineup). Cosmic existentialist: obsessed with space and aliens, sad that lifespans are too short to explore the universe. Owns a folder of 1800+ Reddit memes and an 800-day Reddit streak. **Real trophy:** his team won HACKERWRATH 3.0 (a 24-hour hackathon at GNDU, Amritsar; 1st position), so "Ship in 36 Hours" is earned |
| `sayam` | Sayam | CEO | Boss | "Le re." | Throws money at problems (literally) and delegates everything |
| `mansukh` | Mansukh | Graphic designer | Builder | "Babymonnsterrr!" | Pen-tool wizard; client feedback is his kryptonite |
| `manya` | Manya | Graphic designer | Colorist | (open, you may propose one) | Paint and colour; hates beige |
| `sehaj` | Sehaj | Video editor | Time-bender | "Vajj!" (canon) | **Persona from Sehaj himself:** an observer who doesn't speak much (few words, dry, well-timed). Gamer, gym enthusiast (strong), loves movies, tries to spread positivity and admits he sometimes fails. Loves his girl Manvi (calls her "Maana"). Ctrl+Z on reality; always waiting on renders |
| `brahmansh` | Brahmansh | Video editor | Rogue | (open, you may propose one) | Jump cuts and speed; glass cannon |
| `tushar` | Tushar | Director + cinematographer | Controller | "I hate monkeys." | Yells CUT! and freezes time; terrified of monkeys |
| `manvi` | Manvi | Creative work, art, communication (studying psychology) | Psychologist | "Yippieeee!" · "Whatcha doin?" · "Hawwww!" · "Dhumtanana!" (all canon) | Bubbly, fun-loving, empathetic, funny, mischievous, straightforward. Loves seeing people smile and having fun; does masti with her boyfriend Sehaj and friends |

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

Ids (all required): `first-swap` (swap crew for the first time), `maximalist` (reach MAXIMALIST STYLE), `no-ko-episode` (finish an episode with zero KOs), `monkey-business` (Tushar gets touched by a monkey), `le-re` (Sayam bribes 10 times), `rewind-reflect` (Sehaj CTRL+Zs a projectile back at someone), `ad-skipped` (jump-cut through a pop-up ad), `paint-the-town` (Manya repaints 50 blocks), `chai-addict` (drink 10 chai), `small-talk` (talk to every NPC), `beige-is-dead` (beat BEIGE™), `speedrun-ep0` (finish Episode 0 in under 4 minutes), `directors-cut` (find all 15 Lost Footage tapes).

### `content/story/footage.json`: Lost Footage tapes (the ids are fixed by code)

Three hidden VHS tapes per episode. Picking one up shows `📼 <title>: <caption>` as a toast, and the Achievements screen archives them.
They're the crew's lost raw footage, outtakes and behind-the-scenes clips from before BEIGE™, so they're mini lore and in-jokes.

```json
{ "tapes": [ { "id": "ep0-1", "title": "≤32 chars", "caption": "≤90 chars" } ] }
```

Ids (all 15): `ep0-1` `ep0-2` `ep0-3` `ep1-1` `ep1-2` `ep1-3` `ep2-1` `ep2-2` `ep2-3` `ep3-1` `ep3-2` `ep3-3` `ep4-1` `ep4-2` `ep4-3`.
Where they are (so the caption can fit the spot): ep0-1 secret ledge by the penthouse cubicles · ep0-2 mid-air over the maglev balcony drop · ep0-3 end of the gear-cage lighting truss · ep1-1 right above a boiling steam vent · ep1-2 a side ledge in the cache chamber · ep1-3 over the turbine trench catwalks · ep2-1 over the prop-warehouse chasm · ep2-2 above the lighting-grid pit · ep2-3 under a swinging boom mic · ep3-1 off the edge of the scroll base · ep3-2 near the paywall chai · ep3-3 mid-air in the rage-bait refinery · ep4-1 Templatr atrium mezzanine · ep4-2 above the shredder-room ledge · ep4-3 on top of Chad's keynote stage.

## Docs you own

- `docs/narrative/STORY_BIBLE.md`: the plot, episode by episode, what each character wants and the running gags.
- Anything else under `docs/narrative/` (except this file).
