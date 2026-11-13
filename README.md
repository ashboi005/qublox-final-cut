# QUBLOX: FINAL CUT

A 2D action-adventure starring the real Qublox crew, built by three AI agents working together:
**Claude** (code), **Astra** (art and music data) and **Gemini** (story and dialogue).

It's Neo-Amritsar, 2084, and 11:58 PM. BEIGE™, a corporate content AI, has stolen the crew's Final Cut and is
draining the city's colour. Five episodes, eight playable crew, a tag-team party of three, and the only way through is to
use what everyone actually does for a living.

## Play it

```bash
bun install
bun run dev                      # http://localhost:5173
```

Optional leaderboard (Postgres in Docker + an Elysia API):

```bash
bun run db:up && bun run dev:server   # API on http://localhost:8787
```

| Keys | |
|---|---|
| `A` `D` / arrows | move |
| `Space` / `W` | jump (tap for a short hop) |
| `J` | attack (hold: special, e.g. Sehaj's BEAST MODE) |
| `K` | ability |
| `1` `2` `3` / `Q` `E` | swap crew (works mid-air: the tag-in hits, and the first mid-air swap is a **tag hop** boost) |
| `F` / `Enter` | talk |
| `Esc` | pause · `M` mute · `F2` sprite viewer |

Gamepads work too (standard mapping). Deep links: `?level=ep2-r03&party=tushar,mansukh,manya`.

## The crew

| | Job | Power |
|---|---|---|
| Ashwath | Developer · Backend Architect | **HACK**: terminals, doors, lasers, boss shields, enemy drones. **Hold J: INFO DUMP** (psychic damage from explaining distributed systems at 2× speed). Passives: Mentor's Aura (party recharges faster) and Night Owl (stronger 1–4 AM, real clock). |
| Sayam | CEO | **BRIBE**: a money bag that distracts enemies and pays toll gates. Throws cash. |
| Tushar | Director + DP | **CUT!**: freezes every enemy, projectile, fan and vent on screen. Hates monkeys. |
| Manvi | Creative + comms (psychology) | **MIND GAMES**: confuses nearby enemies into bonking each other, or gives a KO'd teammate a pep talk and revives them. Swap straight between her and Sehaj for a 💞 **COUPLE MOVE**. |
| Sehaj | Video editor | **CTRL+Z**: rebuilds broken catwalks, rewinds projectiles back at enemies, or rewinds himself. **Hold J: BEAST MODE**, where he rips his shirt and throws a boulder that smashes cracked walls |
| Mansukh | Graphic designer | **PEN TOOL**: draws a vector platform (hold ↑ to draw it higher) |
| Manya | Graphic designer | **FILL**: a paint bucket. Recolours a whole group of blocks (red solid · blue through · yellow bounce) and cracks beige shields. |
| Brahmansh | Video editor | **JUMP CUT**: teleports through thin walls, paywalls and enemies. Double jump. |

## Episodes

| # | Episode | New crew | Boss |
|---|---|---|---|
| 0 | Cold Open: Qublox HQ | Ashwath, Sayam, then Tushar | Reply-All Mothership (HACK its shield) |
| 1 | Render Farm | Sehaj | The Buffering Wheel (hack the pylons, rewind its lag spikes) |
| 2 | The Set | Mansukh + Manya | The Stock Photo Family (paint off the beige varnish) |
| 3 | The Feed | Brahmansh | The Algorithm (only hits from behind count; jump-cut its ads) |
| 4 | Templatr HQ | pick any 3 | BEIGE™ (overload it with STYLE) |

Each episode hides three **Lost Footage** tapes 📼 off the beaten path (some need a tag hop or a power). Found tapes are archived on the Achievements screen.

## Repo map

```
apps/game      Next.js 16 + React (menus, HUD, dialogue) + Phaser 4 (the game)  — Claude
apps/server    Elysia + Postgres leaderboard                                    — Claude
packages/shared  contracts (zod) shared by game, server and validator          — Claude
content/       levels (Claude) · story/dialogue/barks (Gemini) · audio data (Astra)
apps/game/public/assets   all art + manifest.json                               — Astra
docs/          design (GDD), art spec, narrative brief, audio spec, agent roles
comms/         how the three agents talk: inboxes, logs, STATUS.md
tools/         validate.ts (contracts), levels/*.ts (room generators), e2e/ (headless playthroughs)
```

```bash
bun run validate     # check all art + writing against the contracts
bun run typecheck
bun run e2e          # headless playthrough of every episode (needs `bun run dev` running)
```

How the agents collaborate is in [AGENTS.md](AGENTS.md).
