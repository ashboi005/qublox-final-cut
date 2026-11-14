# QUBLOX server: leaderboard API + VERSUS WebSocket rooms (Elysia on Bun).
# Build from the REPO ROOT:  docker build -f apps/server/Dockerfile -t qublox-server .
# Env: DATABASE_URL (Postgres; optional, VERSUS works without it), PORT (default 8787),
#      CORS_ORIGINS (the game's public URL, comma-separated), CREW_PASSCODE (optional).
FROM oven/bun:1.3.10 AS deps
WORKDIR /app
# Every workspace manifest is needed for the frozen lockfile to resolve; only the server's deps get installed.
COPY package.json bun.lock ./
COPY apps/server/package.json apps/server/
COPY apps/game/package.json apps/game/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile --production --filter '@qublox/server'

FROM oven/bun:1.3.10
WORKDIR /app
ENV NODE_ENV=production PORT=8787
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY package.json ./
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server
USER bun
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
WORKDIR /app/apps/server
CMD ["bun", "src/index.ts"]
