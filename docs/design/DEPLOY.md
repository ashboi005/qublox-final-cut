# Deploying QUBLOX: FINAL CUT (Coolify on the VPS)

Three pieces. Each Coolify resource below builds from **this repo, base directory `/` (the repo root)**, with its own Dockerfile path.

| Piece | What it is | Where |
|---|---|---|
| **db** | Postgres 17 (accounts, leaderboard, cloud saves) | Coolify → New resource → Database → PostgreSQL |
| **server** | Elysia on Bun: accounts (Better Auth, `/api/auth/*`), leaderboard, cloud saves + **VERSUS WebSocket rooms** (`/fight`) | Dockerfile `apps/server/Dockerfile`, port **8787** |
| **game** | Next.js frontend (standalone build on Node) | Dockerfile `apps/game/Dockerfile`, port **3000** |

The WebSockets live in **server**, not in the frontend. The frontend is a normal Next app (≈1.2 MB of art/audio, Phaser in the JS bundle), so it could also go on Vercel (see the end). The server can't: it holds long-lived WebSocket rooms in memory, so it needs an always-on box: the VPS.

## 1. Database

Create a PostgreSQL 17 resource. Copy its **internal** connection URL (e.g. `postgres://user:pass@<db-uuid>:5432/postgres`). Tables (`runs`, `saves`, and Better Auth's `user`/`session`/`account`/`verification`) are created automatically on server boot. An external Postgres works the same way: just point `DATABASE_URL` at it.

## 2. Server (`api.yourdomain`)

- Build pack: **Dockerfile**, Dockerfile location `apps/server/Dockerfile`, base directory `/`.
- Ports exposes: `8787`. Domain: `https://api.yourdomain` (Coolify's proxy handles TLS and WebSocket upgrades; nothing extra needed).
- Environment variables (runtime):
  - `DATABASE_URL` = the internal URL from step 1
  - `CORS_ORIGINS` = `https://yourdomain` (the game's URL; comma-separate several)
  - `BETTER_AUTH_SECRET` = **required**; generate with `openssl rand -base64 32` (the server refuses to start in production without it)
  - `BETTER_AUTH_URL` = `https://api.yourdomain`
  - Optional sign-in buttons (each shows up in the game only when both values are set):
    - `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`: Google Cloud Console → APIs & Services → Credentials → OAuth client ID (Web). Authorised redirect URI: `https://api.yourdomain/api/auth/callback/google`
    - `DISCORD_CLIENT_ID` + `DISCORD_CLIENT_SECRET`: discord.com/developers → New Application → OAuth2. Redirect: `https://api.yourdomain/api/auth/callback/discord`
  - Email + password sign-in is always on (no emails are sent, so there's no verification or password reset yet).
- Health check: the image has one built in (`GET /health` → `{"ok":true,"db":true}`).
- **Run one replica.** VERSUS rooms are in memory; two replicas behind a load balancer would split players into different rooms.

## 3. Game (`yourdomain`)

- Build pack: **Dockerfile**, Dockerfile location `apps/game/Dockerfile`, base directory `/`.
- Ports exposes: `3000`. Domain: `https://yourdomain`.
- Environment variable **`NEXT_PUBLIC_API_URL` = `https://api.yourdomain`**, ticked as **"Build Variable"**. Next bakes it into the client at build time; VERSUS turns it into `wss://api.yourdomain/fight`. Changing it means a **redeploy** (rebuild), not just a restart.

## Checks after deploying

1. `https://api.yourdomain/health` → `{"ok":true,"db":true}`
2. Open `https://yourdomain` → title screen → Story starts EP0.
3. Leaderboard screen loads (empty is fine). Title → **Sign in** (top right) → create an account → the chip shows your name. Finish an episode → **Post run as …**.
4. VERSUS → Online room on two devices: create a room on one, join with the code on the other.

If the browser console shows CORS errors, `CORS_ORIGINS` on the server doesn't exactly match the game's origin (scheme + host, no trailing slash).

**Put the game and the API on the same domain** (`yourdomain` + `api.yourdomain`). Login cookies are set by the API and the browser only sends them to it from the same site. On unrelated domains (say, Vercel's `*.vercel.app` + your VPS), set `CROSS_SITE_COOKIES=1` on the server, and expect Safari to block it anyway; a custom domain for both is the fix.

## Building locally

```bash
docker build -f apps/server/Dockerfile -t qublox-server .
docker build -f apps/game/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:8787 -t qublox-game .
docker run -p 8787:8787 -e DATABASE_URL=postgres://qublox:qublox@host.docker.internal:5433/qublox -e CORS_ORIGINS=http://localhost:3000 -e BETTER_AUTH_SECRET=$(openssl rand -base64 32) -e BETTER_AUTH_URL=http://localhost:8787 qublox-server
docker run -p 3000:3000 qublox-game
```

To try the production frontend next to `bun run dev` without Docker: `cd apps/game && NEXT_DIST_DIR=.next-prod npx next build`, then run `.next-prod/standalone/apps/game/server.js` with Node (copy `.next-prod/static` and `public/` next to it, as the Dockerfile does).

## Alternative: frontend on Vercel

It works: import the repo, root directory `apps/game`, framework Next.js, env `NEXT_PUBLIC_API_URL=https://api.yourdomain`. The `/api/content` route ships the `content/` folder via `outputFileTracingIncludes` in `next.config.ts`. The server (and its WebSockets) still runs on the VPS, and `CORS_ORIGINS` must list the Vercel URL. Give the Vercel project a subdomain of your own domain, or logins won't stick (see the cookie note above). Keeping both on the VPS is simpler (one place, one bill, no cross-provider latency), so that's the default.
