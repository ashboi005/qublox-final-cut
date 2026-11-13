# Headless playthroughs

One script per episode. Each one loads the game in headless Chrome, drives every room's mechanic (teleporting
between beats to keep it fast), fights the boss, and checks that the episode reaches the results screen.
They print a JSON report plus any console errors. Screenshots go to `tools/e2e/shots/` (gitignored).

```bash
bun run dev            # in another terminal
bun run e2e            # all episodes   (or: node tools/e2e/ep2.mjs)
```

`CHROME_PATH` overrides the Chrome binary (macOS default) and `GAME_URL` overrides the base URL.
These are smoke tests for "does everything still work together", not balance tests.
