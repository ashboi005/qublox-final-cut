# QUBLOX: FINAL CUT · Story v2 (structure)

The first story was written before the real crew sent their personas. v2 keeps the **plot spine** (BEIGE™ steals the Final Cut at 11:58 PM; five districts; the 9:00 AM deadline) and the **level layouts and puzzles**, and rebuilds the people inside it. Everyone now plays as themselves.

Owner of this file: Claude (structure, mechanics, who joins where). Gemini writes the Story Bible v2, every line and all the flavour text. Personas: `docs/narrative/BRIEF.md` → Fixed facts.

## Rules for v2

1. **Everyone plays as their real persona** (BRIEF rows), with their canon catchphrases used *in the right situations*, not sprayed everywhere.
2. **Powers are their real skills**, and the story should show them choosing to use those skills (Ashwath mentoring, Sayam's ten personalities, Tushar taking responsibility, Mishthi making art out of junk…).
3. **The party is now up to 4** (keys 1–4). Joins never push anyone out unless the party is already full.
4. **Each crew member gets one arc beat** they visibly change in, and **each pair with a real dynamic gets a moment** (below).
5. Tone unchanged: affectionate roast, slapstick, dark-ish jokes, pop culture. Never actually mean about a real person.

## Who joins where

| Ep | District | Start party | Joins (scene) |
|---|---|---|---|
| 0 Cold Open | Qublox HQ | Ashwath, Sayam | **Tushar** (ep0-tushar-joins, gear cage) |
| 1 Render Farm | Server towers | cast 2 (Ashwath required) | **Sehaj** (ep1-sehaj-joins), **Manvi** (ep1-manvi-joins) |
| 2 The Set | Film studio | cast 1 | **Mansukh + Manya** (ep2-designers-join, prop warehouse), **Mishthi** (**new: ep2-mishthi-joins**, r04 the Chroma Key Dressing Rooms: she's been hiding in wardrobe, turning BEIGE's props into art) |
| 3 The Feed | Infinite-scroll tower | cast 3 | **Brahmansh** (ep3-brahmansh-joins) |
| 4 Templatr HQ | Beige monolith | cast 4 | everyone, in the finale |

## Arc beats (one per person; Gemini writes them)

- **Ashwath** (Backend Architect, mentor, night owl, cosmic existentialist): spends EP0–2 fixing everything alone at 2× speed; learns to *teach* instead (a "dost, you do it" moment where he talks someone else through a hack). The telescope scene pays off in the EP4 ending: they're small, but they made something.
- **Sayam** (CEO, ten personalities): delegates everything; in EP4 every one of his personalities shows up at once and he finally does a thing himself (still refuses to wall-climb).
- **Tushar** (Wandering Generalist, the group's dad): takes on every problem ("fine, I'll do it myself") until he burns out mid-EP3; the crew does it *for* him. "Shaanttt hojaaa" is his CUT!. Still hates monkeys.
- **Sehaj** (quiet gym gamer, editor) and **Manvi** (bubbly psychology student, comms): the couple. Sehaj says almost nothing and lands every line; Manvi reads every room (and every enemy). Their moment: she gets him to say a full sentence; he CTRL+Zs a bad moment for her.
- **Mansukh** (designer + game dev, 15 tabs, BABYMONSTER stan, ragebaiter): keeps starting side projects mid-mission; finishes one in EP4 (the thing that matters).
- **Manya** (colorist; no persona yet): unchanged role. Saturation is defiance.
- **Brahmansh** (detail-obsessed editor, easily annoyed, unhinged at the after-party): annoyed by every continuity error BEIGE makes; his eye for the one bad frame finds the Final Cut's hidden backup.
- **Mishthi** (props + decor improviser, dramatic, "as if I care?", secretly caring): pretends none of this matters; the crew catches her caring (she's been quietly patching everyone up).

## Pairings worth a scene

Sehaj ↔ Manvi (couple) · Ashwath ↔ Brahmansh/juniors (mentor, "diagnosis: skill issue") · Sayam ↔ Tushar (CEO vs the guy who actually does it) · Mansukh ↔ Manya (designers; ragebait vs saturation) · Mishthi ↔ Manvi (drama vs psychology) · Tushar ↔ monkeys (forever).

## What changes in content (all Gemini)

- `docs/narrative/STORY_BIBLE.md` → v2 (premise kept; cast, arcs, running gags rebuilt; 9 crew).
- Every dialogue scene, re-voiced for v2 beats, keeping the same ids and triggers so levels don't change. **New:** `ep2-mishthi-joins`. Ending (`ep4-ending`) features all 9.
- `achievements.json`: names + descriptions for **all** ids, including the 14 new persona ones (list in `packages/shared/src/index.ts` / BRIEF).
- `footage.json`: the 15 Lost Footage tapes rewritten as real-crew in-jokes (same ids and spots).
- `quips.json`: title taglines, loading tips (they can mention the new powers), headlines and bylines.
- Episode recaps (`ep<n>-previously`) to match.

## Easter eggs

The user will send their own easter eggs; they go in here as they arrive. Built-in ones so far: the telescope (EP0 balcony), the HACKERWRATH trophy (EP0 penthouse), Night Owl hours (1–4 AM), the FABULOUS shades (Tushar's portrait), real voice lines.
