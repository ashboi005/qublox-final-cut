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
| `ashwath` | Ashwath | Developer / tech guy | Hacker | "Oyee pagalll!" | Fixes everything, panics about merge conflicts |
| `sayam` | Sayam | CEO | Boss | "Le re." | Throws money at problems (literally) and delegates everything |
| `mansukh` | Mansukh | Graphic designer | Builder | "Babymonnsterrr!" | Pen-tool wizard; client feedback is his kryptonite |
| `manya` | Manya | Graphic designer | Colorist | (open, you may propose one) | Paint and colour; hates beige |
| `sehaj` | Sehaj | Video editor | Time-bender | "Vajjj!" | Ctrl+Z on reality; always waiting on renders |
| `brahmansh` | Brahmansh | Video editor | Rogue | (open, you may propose one) | Jump cuts and speed; glass cannon |
| `tushar` | Tushar | Director + cinematographer | Controller | "I hate monkeys." | Yells CUT! and freezes time; terrified of monkeys |

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
  "headlines": { "0": ["NEO-AMRITSAR TIMES: LOCAL STUDIO REFUSES TO REPLY-ALL (≤70 chars)"], "1": [], "2": [], "3": [], "4": [] }
}
```

### `content/story/achievements.json`: names and descriptions (the ids are fixed by code)

```json
{ "achievements": [ { "id": "first-swap", "name": "≤32 chars", "desc": "≤80 chars: how to get it, said funny" } ] }
```

Ids (all required): `first-swap` (swap crew for the first time), `maximalist` (reach MAXIMALIST STYLE), `no-ko-episode` (finish an episode with zero KOs), `monkey-business` (Tushar gets touched by a monkey), `le-re` (Sayam bribes 10 times), `rewind-reflect` (Sehaj CTRL+Zs a projectile back at someone), `ad-skipped` (jump-cut through a pop-up ad), `paint-the-town` (Manya repaints 50 blocks), `chai-addict` (drink 10 chai), `small-talk` (talk to every NPC), `beige-is-dead` (beat BEIGE™), `speedrun-ep0` (finish Episode 0 in under 4 minutes).

## Docs you own

- `docs/narrative/STORY_BIBLE.md`: the plot, episode by episode, what each character wants and the running gags.
- Anything else under `docs/narrative/` (except this file).
