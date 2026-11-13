# QUBLOX: FINAL CUT · VERSUS (1v1 fighting mode)

The crew's request: a Tekken / Mortal Kombat-style 1v1. You create a room, get a code, your friend joins from anywhere, you both pick a crew member and fight with their real job-based powers. Big sprites, special moves and finishers.

## Status / stages

| Stage | What | State |
|---|---|---|
| 1 | Deterministic fight sim (shared), all 8 crew movesets, **local versus** (2 players, one keyboard / two pads), rounds, HUD | **built** |
| 2 | **Online**: Elysia WebSocket rooms with 4-letter codes, lobby + character select, **rollback netcode** (2-frame input delay, up to 8 frames of rollback), desync checksums | **built** |
| 3 | Hi-res fighter art from Astra (`fight-<crew>` sheets, 128px), stage backdrops, finisher cinematics, SFX/music | after the story mode is final |
| 4 | Crew login (per-member accounts), ranked ladder on the Postgres leaderboard | later |

## Why it's built this way

- **The sim is pure TypeScript with integer math** (`packages/shared/src/fight/`). There's no Phaser, no floats in the state and no `Math.random` (it uses a seeded RNG inside the state). The same inputs give the same frames on every machine, which is what rollback netcode needs. Phaser only *draws* the state.
- **Rollback, not delay-only.** Fighting games feel wrong when input waits for the network. Each client predicts the opponent's input (it repeats their last one), simulates immediately, and if the real input turns out different, it rewinds to that frame and re-simulates. The state is a small plain object, so a snapshot is one `structuredClone`.
- **The server only relays** (no simulation). Rooms are in memory and messages are zod-validated. Each client sends a checksum every 60 frames; a mismatch is reported as a desync.

## Controls

| | Online / P1 | Local P2 |
|---|---|---|
| move / jump / crouch | `A` `D` / `W` / `S` (or arrows) | arrows |
| block (hold) / parry (tap just before a hit) | `U` or hold **back** | `4` or hold back |
| light / heavy | `J` / `K` | `1` / `2` (numpad or row) |
| special | `L` | `3` |
| super (needs a full meter) | `I` | `0` |
| move list (pauses offline) | `Tab` | |

## Rules

- 2 rounds to win, 99-second timer (most HP wins on time-out). Each fighter has 1000 HP.
- The **meter** fills when you land hits (and a little when you take them). Super costs a full meter.
- **Fundamentals (everyone):** `J J J` 3-hit string (the 3rd knocks down) · `K` heavy · `↓+K` **sweep** (LOW, knocks down) · `→+K` **overhead** · air `J`/`K` (overheads) · `J+K` up close = **throw** (unblockable, knocks down, beats blocking).
- **Combos:** a light/heavy that connects (hit or block) can cancel into the next string hit, or into your special or super. Presses are buffered for 6 frames.
- **Blocking:** hold `U` or back. **Lows** must be crouch-blocked (hold ↓ too) and **overheads** stand-blocked; a hit that gets through a wrong-height block pops "LOW!"/"OVERHEAD!". Blocking takes 10% chip and drains a **guard bar**; empty guard = **GUARD BREAK** (dizzy ~1s). Tap `U` within 6 frames of a hit = **PARRY**: no chip, melee attackers stagger, +meter.
- **Knockdowns:** strings, sweeps, throws, launchers and supers knock you down; while down you're invulnerable, then you get up.

## Movesets (from each person's real job and persona)

| Crew | Special (`L`) | Super / finisher (`I`) |
|---|---|---|
| Ashwath | **INFO DUMP**: a close-range psychic multi-hit (3 ticks) | **SHIP IN 36 HOURS**: a hackathon countdown, then a full-screen deploy blast |
| Sayam | **LE RE**: throws a fast wad of cash (hit words: BHAI · CHUDA LAG GYA on the sweep) | **HOSTILE TAKEOVER**: cash rains on the opponent |
| Tushar | **CUT!**: freezes the opponent (short) if they're on screen | **THAT'S A WRAP**: a camera-flash dash strike |
| Sehaj | **BEAST MODE**: a slow, heavy boulder | **CTRL+Z**: rewinds himself 1.5s (position and HP) |
| Manvi | **MIND GAMES**: inverts the opponent's controls for 2s (needs mid-range) | **DHUMTANANA**: a heart shockwave across the stage, and heals her |
| Mansukh | **PEN TOOL**: draws a vector wall that blocks projectiles and movement | **STAN MODE**: BABYMONSTER comes on in his headphones; a lightstick swing (knocks down), then 6s of +50% damage and +50% walk speed |
| Manya | **SPLAT**: a paint arc; the puddle slows whoever stands in it | **FILL: YELLOW**: the floor turns bouncy and launches the opponent |
| Mishthi | **IMPROVISE**: lobs a random prop in an arc | **AS IF I CARE?**: 3s of total indifference: she takes no damage and melee attackers get IGNORED (staggered) |
| Brahmansh | **JUMP CUT**: teleports behind the opponent and strikes | **MONTAGE**: 6 rapid jump-cut strikes |

Balance numbers live in `packages/shared/src/fight/moves.ts`.

## Files

```
packages/shared/src/fight/   sim.ts (state + step), moves.ts (movesets), net.ts (message schemas)
apps/game/src/fight/          FightScene (render), rollback.ts (netcode session), input.ts
apps/game/src/ui/Versus.tsx   lobby: local / create room / join by code → character select → fight
apps/server/src/fight.ts      WebSocket rooms (/fight)
```

## Art ask for Astra (stage 3)

`fight-<crew>` sheets at 128×128 per frame, with rows: idle, walk, jump, crouch, block, light, heavy, special, super, hit, ko, win. Higher detail than the story sprites. Until then, the fight mode draws the story sprites at 2×.
