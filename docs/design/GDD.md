# QUBLOX: FINAL CUT — game design (living doc, owned by Claude)

> Working title. Gemini may pitch better ones (task G06).
> Tag meanings: **[crew]** means the crew decided it (from the 2026-11-13 pitch sheet). **[claude]** means Claude's call, which can be changed.

## One line

The night before the biggest delivery of their lives, a corporate content AI called **BEIGE™** starts flattening the world into beige, templated slop. Qublox is the last maximalist building standing, and the crew has to fight, think and edit their way across a retro-futurist megacity to take back the Final Cut, and with it, colour.

## Pillars

1. **Every job is a superpower.** [crew] Developer, CEO, designers, editors, director: what they do in real life is how they fight and how they solve puzzles.
2. **The puzzle is the party.** [claude] Most rooms need two or three people's powers chained together. Swapping mid-air is a skill.
3. **Maximalism vs beige.** [claude] The theme is the mechanic: colour, fonts, noise and style are good; beige templates are the enemy. It's a parody of AI slop, made by AIs, which is part of the joke.
4. **Fair, not boring.** [crew] Short checkpoints, readable enemies, no grinding, every room teaches or twists something.

## Format

| | |
|---|---|
| Genre | Action-adventure: side-view platforming, combat, puzzles, light metroidvania backtracking. [crew + claude] |
| View | **Side view** [claude]. Pen-tool bridges, rewinds and jump-cut teleports read cleanly from the side, and isometric would roughly triple the art cost for the same fun. |
| Length | Prototype: Episode 0 and 1 (about 25 min). Full game: 5 episodes (about 2–3 h). [crew: "longer side"] |
| Difficulty | Fair. Checkpoint every room, 3 KO-able crew per party (a KO'd member is out until the next checkpoint), optional speedrun leaderboard. [crew] |
| Players | Solo first [crew]. Later: local/online **party mode**, where each player owns one crew member live. [crew, later] |
| Platform | Desktop browser, keyboard + gamepad. 480×270 internal resolution, integer-scaled. [claude] |

## Core loop

Explore a room → spot the obstacle → pick who handles it → swap → combo powers → fight the wave → checkpoint → next room. Each episode ends in a boss that tests every power you got in that episode.

## The tag-team swap (the twist) [claude]

- The party is **3 crew members**, picked at the Studio hub from everyone you've unlocked.
- Swap instantly with `1` `2` `3` (or `Q`/`E` to cycle, or the gamepad bumpers). You keep your momentum, so you can swap mid-jump.
- **Tag hop:** the first swap in each airtime gives the incoming member a boost (0.7× their jump). A jump plus a hop reaches 4-tile ledges (64px); 5-tile ledges (80px) still need a power.
- **Couple move:** swap straight between partners (`COUPLES` in crew.ts; Sehaj ⇄ Manvi) → heart pose, a heart shockwave (25 dmg within ~14 tiles) and +20 HP to the party. 20s cooldown.
- **Lost Footage:** 3 hidden tapes per episode (`@tape`), off the main path. Text by Gemini in `content/story/footage.json`; collecting all 15 unlocks `directors-cut`.
- **Tag-in attack:** the member who swaps in does a short entry attack. Swap combos ("tag chains") build the **STYLE** meter.
- Abilities use **cooldowns**, not a mana bar. Swapping lets you use another member's power while yours recharges.
- The STYLE meter has ranks D, C, B, A, S, then **MAXIMALIST**. Rank multiplies score (leaderboard) and decays when you play beige: repeating the same attack or standing still.

## The crew (playable) [crew roles + claude kit]

Names, roles and catchphrases are from the crew. Abilities and weaknesses are Claude's call. Gemini owns personality and lines; numbers live in code.

| Crew | Role → Class | Basic attack | Ability (cooldown) | Passive | Weakness | Catchphrase |
|---|---|---|---|---|---|---|
| **Ashwath** | Developer → **Backend Architect** (persona: see BRIEF). **Special, hold J: INFO DUMP** (9s): 6 ticks of psychic damage around him; enemies back off. **Passives:** MENTOR'S AURA (with him conscious in the party, everyone's abilities recharge 10% faster) · NIGHT OWL (real clock 1–4 AM: +25% damage and −25% recharge for him) · COSMIC EXISTENTIALIST (idle 7s: stares at the sky; telescope secret on the EP0 balcony). **Sprite** cans (`s`) instantly recharge the active ability. | Keyboard combo (3 hits, "CLACK") | **HACK** (6s): remotely toggles a terminal, door, turret or camera within range. Hacked enemy drones fight for you for 5s. | Sees hidden wiring (puzzle overlay) | **Merge conflict:** getting hit while hacking cancels it and stuns him for 1s | "Oyee pagalll!" |
| **Sayam** | CEO → **Boss** (persona: see BRIEF). **Special, hold J: BHAI, LISTEN** (9s): "10 personalities in one guy", so each use cycles to the next one. PHILOSOPHER (enemies within ~11 tiles stop to listen for 4s) · HYPE BHAI (party +30% damage for 6s) · THE ROAST, "get a load of this guy" (marks the nearest enemy/boss: +50% damage taken for 6s) · THE EMPATH, "bhai, you good?" (+15 HP to the conscious party) | Throws cash ("Le re!"), ranged | **BRIBE** (8s): drops a money bag. Non-boss enemies stop and chase it, and it also pays toll gates and NPCs. | Swapping *out* of Sayam buffs the next member's damage for 3s ("delegation") | Weakest jump; can't wall-climb ("I don't do manual work") | "Le re." |
| **Mansukh** | Graphic Designer + game dev → **Builder** (persona: see BRIEF). **Special, hold J: STAN MODE** (16s): BABYMONSTER comes on in his headphones and the lightstick comes out: 8s of double damage, longer reach, +25% run speed. **Passives:** RAGEBAIT (tags in already baiting: enemies within ~12 tiles are marked, +50% damage taken, 3s) · IDEAL PROCRASTINATION (idle 7s: he opens a new project/tab) · MULTITASKING (UNSTABLE) (every swing is a different hobby: STAB / TWEAK / NEW TAB / GG EZ / REMIX) | Pencil jab (cycling hit words) | **PEN TOOL** (7s): click two anchor points and a vector platform appears between them (max length 6 tiles, lasts 6s) | Can stand on any line art | **Client feedback:** "Make the logo bigger" enemies slow him | "Babymonnsterrr!" |
| **Manya** | Graphic Designer → **Colorist** | Paint splat, ranged arc | **FILL BUCKET** (5s): recolours an object. Red = solid, Blue = passable, Yellow = bouncy | Paint splats mark enemies (+damage taken) | **Beige** enemies resist her paint | (TBD by crew) |
| **Sehaj** | Video Editor → **Time-bender** | Razor-tool slash ("VAJJJ!") | **CTRL+Z** (10s): rewinds one object (or himself) 3 seconds, e.g. rebuilds a broken bridge, resets a fallen block, undoes damage. **Special, hold J: BEAST MODE** (8s): gym rat, so the shirt rips and he hurls a boulder (30 dmg; the only thing that smashes cracked walls `Z`) | Sees "ghost" trails of moving objects | **Render bar:** longest cooldown in the game | "Vajjj!" |
| **Brahmansh** | Video Editor → **Rogue** (persona: see BRIEF). **Special, hold J: UNHINGED** (12s): a chain of up to 6 jump-cut strikes through everything nearby while the camera wobbles (HOUSE OF SHAKES); invulnerable during it. **Passives:** ATTENTION TO DETAIL (hit an enemy during its wind-up = FRAME PERFECT, double damage) · EASILY ANNOYED (2 hits within 4s: ANNOYED, +30% damage for 5s). **Real voice lines** (his recordings): kills "parlaug bire", room/boss clear and VERSUS wins "gg thaa", UNHINGED "house of shakes", ANNOYED "kutti jaat lubaane" | Fast timeline-blade combo | **JUMP CUT** (4s): instant short teleport (4 tiles) that passes through thin walls and enemies | Double jump | Lowest HP | (TBD by crew) |
| **Manvi** | Creative + Comms (psychology student) → **Psychologist** | Mic-tap ("HAWWW") | **MIND GAMES** (9s): a KO'd crew member gets a pep talk and revives at 40% HP; enemies within ~9 tiles are confused for 4.5s (harmless, wander, bonk each other) | Couple move with Sehaj | No puzzle power: she doesn't code, so terminals are off-limits | "Yippieeee!" |
| **Mishthi** | Creative: art, props + decor, graphics, drawing → **Improviser** (persona: see BRIEF) | Improvised prop toss (ranged arc; a random prop each throw: VASE, FAIRY LIGHTS, GLUE GUN…) | **MASTERPIECE** (8s): the nearest enemy becomes a framed art installation for 6s: frozen, harmless, and **you can stand on it** (puzzle: build your own stepping stone). Bosses get CRITIQUED (+50% damage taken, 4s). **Special, hold J: AS IF I CARE?** (14s): 3.5s invulnerable; enemies that touch her get demoralised (confused) | SECRETLY CARING (tag her in: the member who tagged out gets +8 HP) · DRAMATIC SIGH (idle) | None yet (glass-ish: 95 HP). Castable from EP2 (the film studio's props department); a proper join scene comes with the story rework | "Oh my god wtf bhai." |
| **Tushar** | Director + Cinematographer → **Controller** | Clapperboard smack | **"CUT!"** (12s): freeze-frames every enemy, projectile and moving platform on screen for 3s | Camera flash on tag-in stuns | **Monkeys:** the Infinite Monkeys enemy type makes him panic (controls invert for 2s when one touches him) | "I hate monkeys." |

Party balance for Episode 0: Ashwath + Sayam start; Tushar joins at the end of EP0. Unlock order is in the episode table.

## World and story seed [claude, Gemini expands]

- **Neo-Amritsar, 2084**: the future as imagined in 1984. Raw concrete megablocks, CRT billboards, neon signage in five clashing fonts, chai stalls on maglev platforms.
- **BEIGE™** is the flagship product of **Templatr Corp.** An "AI creative suite" that turns everything it touches into inoffensive beige corporate content: rounded corners, stock smiles, Arial. Beige is spreading through the city like fog.
- Its workforce: **Infinite Monkeys** (on infinite typewriters, generating infinite content; Tushar's nemesis), **Stock Photo People** (frozen smiles), **Corporate Memphis Blobs** (flailing limbs), **Make-The-Logo-Bigger** clients, **Buffering Wheels**, **Reply-All drones**, and **Pop-up Ads**.
- Qublox HQ is the last fully saturated building. BEIGE stole the **Final Cut**, the master file of the crew's big film, and is about to release a beige version under its own name.
- Every episode is a district that BEIGE is draining. As you clear it, the colour floods back (a visible world change).

## Episodes [claude]

| # | Name | District / machine | New member | Puzzle focus | Boss |
|---|---|---|---|---|---|
| 0 | Cold Open | Qublox HQ (tutorial) | Ashwath, Sayam, then Tushar | Hack doors, bribe guards, swap basics | The Reply-All Drone |
| 1 | Render Farm | Overheating server towers | Sehaj | Rewind collapsing racks, freeze fans | BUFFERING WHEEL |
| 2 | The Set | Abandoned film studio | Mansukh + Manya | Build bridges, recolour sets | The Stock Photo Family |
| 3 | The Feed | Infinite-scroll social tower (vertical) | Brahmansh | Jump-cut through posts, outrun the scroll | The Algorithm |
| 4 | Templatr HQ | Beige monolith | everyone | All powers, party picks matter | BEIGE™ (multi-phase) |

**Prototype scope (Milestone 1):** EP0 + EP1 fully playable, with 4 crew, 2 bosses, dialogue, a leaderboard and procedural music.

## Combat feel [claude]

Hitstop of 50–80 ms on hit, screen shake proportional to the hit, comic onomatopoeia popping out (CLACK, VAJJJ!, LE RE, CUT!), knockback, i-frames. Enemies telegraph every attack for at least 300 ms. Coyote time, jump buffering, variable jump height.

## Leaderboard [crew]

Postgres. A run records the player name, episode, time, STYLE score, KOs and the party used. Boards: fastest time and highest STYLE, per episode. Proper per-member login comes with multiplayer; the prototype uses a name plus crew passcode.

## Multiplayer (later) [crew wish, claude plan]

Design rule from day one: **characters are driven by an `InputSource`, never straight from the keyboard.** Local keyboard, gamepad, an AI follower or a network peer all produce the same `InputFrame`. Party mode can then be host-authoritative over WebSocket (Bun server) without rewriting characters.

## Audio [crew: "generate through code"]

A WebAudio synth and sequencer (Claude) plays songs written as tracker-style JSON (Astra composes, in `content/audio/`). Chiptune-meets-synthwave, with one song per episode, plus boss themes and SFX presets.

## Open (needs the crew)

- Real sprite references and photos for all 7 crew (placeholders until then).
- Catchphrases for Manya and Brahmansh.
- Final title.
