# QUBLOX: FINAL CUT — shared rules for every agent

Read this whole file before touching anything. It applies to every agent: Claude, Codex/Astra and Gemini.

## What we're building

A 2D side-view **action-adventure** browser game starring the real Qublox crew. You fight, solve puzzles and explore with a **tag-team party**: three crew members are in the party, you swap between them instantly, and each one's job-based power solves different problems.
Tone: a funny, sarcastic, slapstick parody with dark jokes and pop-culture references. Look: retro-futurist brutalism × maximalism, pixel art with comic-book energy.

The full design is in `docs/design/GDD.md`. Read it.

## The team (who owns what)

| Agent | Model | Role | Owns (only this agent writes here) |
|---|---|---|---|
| **Claude** | Opus 5.5 | Lead, all code, systems, level design, integration, task assignment | `apps/**` (except `apps/game/public/assets/**`), `packages/**`, `tools/**` (except `tools/art/**`), `scripts/**`, `docs/design/**`, `docs/audio/**`, `docs/roles/**`, `content/levels/**`, `content/schema/**`, `comms/inbox/**`, `comms/log/claude.md`, `comms/STATUS.md`, root config files |
| **Astra** | GPT-6 Astra (Codex) | Art director + artist: sprites, tiles, portraits, FX, palette, music *data* | `apps/game/public/assets/**`, `docs/art/**` (except `ART_SPEC.md`), `tools/art/**`, `content/audio/**`, `comms/log/codex.md` |
| **Gemini** | Gemini 3.8 Flash | World director + writer: story, dialogue, barks, names, flavor text, jokes | `content/story/**`, `content/dialogue/**`, `content/barks/**`, `docs/narrative/**` (except `BRIEF.md`), `comms/log/gemini.md` |

**Never edit a file you don't own.** If you need a change in someone else's file, ask for it in your log (see Comms). Claude is the only agent that changes code or the contracts.
Astra does **not** design UI layouts or write game code. Gemini does **not** write code or art.

## Comms protocol (how we talk)

Everything goes through markdown files in `comms/`. Each file has exactly **one writer**, so nobody ever overwrites anybody else.

```
comms/
  STATUS.md          Claude: the big picture, milestones, who's doing what
  inbox/codex.md     Claude → Astra: orders and answers.  Top line = CONTROL
  inbox/gemini.md    Claude → Gemini: orders and answers. Top line = CONTROL
  log/claude.md      Claude → everyone
  log/codex.md       Astra → everyone (append only)
  log/gemini.md      Gemini → everyone (append only)
```

### The work loop (Astra and Gemini)

1. Read `AGENTS.md`, your role file `docs/roles/<you>.md`, then your inbox.
2. Look at the `CONTROL:` line at the top of your inbox.
   - `CONTROL: RUN`: keep working.
   - `CONTROL: PAUSE`: finish your current file, log it, then wait (step 6).
   - `CONTROL: STOP`: log a final entry and end your session. **This is the only way you stop.**
3. Take the first task marked `[OPEN]` that you haven't already reported as `DONE`/`REVIEW` in your log. Tasks are listed in priority order.
4. Do it. Validate it (`bun run validate`). Commit it (see Git).
5. Append a log entry (format below), then go back to step 2 for the next task.
6. **No open tasks left? Don't stop.** Run `scripts/await-orders.sh <you>` (`codex` or `gemini`). It blocks until Claude changes your inbox (or exits after about 20 minutes with `STILL_WAITING`, in which case run it again). When it returns, go to step 2. Keep looping like this until `CONTROL: STOP`.

You never end your session on your own: not when your tasks are done, not when you're unsure, not when you're blocked. If you're blocked, log a `QUESTION` or `BLOCKED` entry, move on to the next open task, and if there's nothing left, wait for orders.

### Log entry format (append to the bottom of your log)

```md
### 2026-11-13 14:05 · T-A02 · REVIEW
- Did: ashwath + sayam sprite sheets, 48×48, all required anims
- Files: apps/game/public/assets/sprites/characters/ashwath.png, …/sayam.png, manifest.json
- Commit: a1b2c3d
- Notes: the attack anim is 5 frames, not 4, because the keyboard swing needed a follow-through
- QUESTION for claude: should Sayam's cash projectile be a separate sprite?
```

Status words: `DOING` (started on something big), `REVIEW` (done, waiting for Claude to check), `BLOCKED` (can't continue, say why), `QUESTION`, `NOTE`.
Only Claude marks a task `[DONE]`, in the inbox, after integrating it. If Claude reopens a task with feedback, it goes back to `[OPEN]` with a `Feedback:` line.

## Git rules

- We all work in this one checkout on the **local branch `dev`**. It is **never pushed**. Claude folds `dev` into `main` as one squashed commit per day (`scripts/squash-to-main.sh`) and the user pushes `main`. This keeps the user's GitHub contribution graph sane. Don't switch branches, rebase, reset, stash, force anything or push.
- **Commit less often:** about **one commit per task batch** (or per big task), not one per file or per log line. Put your log entry in the **same commit** as the work it describes: no separate `comms:` log-only commits.
- **Stage only your own paths**, by name. Never use `git add -A`, `git add .` or `git commit -a`.
  `git add apps/game/public/assets/sprites/characters/ashwath.png && git commit -m "art: ashwath sprite sheet"`
- Commit prefixes: `art:` (Astra), `story:` (Gemini), `code:`/`chore:`/`docs:` (Claude), `comms:` (Claude's inbox updates).
- If git says `index.lock` exists, another agent is committing. Wait 3 seconds and retry. Never delete the lock yourself.
- Never commit secrets, `.env` files, `node_modules`, or huge source files (>5 MB). Keep raw generations in `tools/art/raw/` (that folder is ignored by git).

## Contracts (the formats the game code reads)

The code only understands these formats. Stick to them exactly; `bun run validate` checks them.

- **Art:** `docs/art/ART_SPEC.md` covers sizes, palette rules, sheet layout and `manifest.json`.
- **Writing:** `docs/narrative/BRIEF.md` covers tone, the cast and the JSON formats for dialogue and barks.
- **Characters' mechanics** (abilities, stats) live in `docs/design/GDD.md` and in code. Gemini writes personality, not numbers.

If a contract is in your way, say so in your log. Don't work around it.

## Commands

```bash
bun install            # once
bun run dev            # play the game at http://localhost:5173
bun run validate       # check assets + content against the contracts. Run before every commit.
bun run typecheck      # Claude: type-check every package
bun run db:up          # Postgres for the leaderboard (docker)
bun run dev:server     # leaderboard API on http://localhost:8787
bun run e2e            # headless playthrough of all 5 episodes (needs `bun run dev` running)
```

Deep-link to any room to check your work in context: `http://localhost:5173/?level=ep3-r07&party=sayam,tushar,brahmansh`.

## Quality bar

Fun first, and it has to make you think. "Polished but not sterile": readable at a glance, juicy when you hit something, and funny. It's the crew's in-jokes, so be affectionate when you roast people. No slurs, nothing actually mean about real people, and nothing a crew member would be hurt by.
