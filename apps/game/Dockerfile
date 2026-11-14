# QUBLOX game: the Next.js frontend (standalone output on Node).
# Build from the REPO ROOT:
#   docker build -f apps/game/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.example.com -t qublox-game .
# NEXT_PUBLIC_API_URL is baked into the client bundle at BUILD time (the server's public URL; VERSUS derives
# its wss:// address from it), so in Coolify mark it as a build variable.
FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g bun@1.3.10
COPY package.json bun.lock ./
COPY apps/game/package.json apps/game/
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile --filter '@qublox/game'
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY content ./content
COPY apps/game ./apps/game
ARG NEXT_PUBLIC_API_URL=http://localhost:8787
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL NEXT_TELEMETRY_DISABLED=1
RUN cd apps/game && npx next build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# Standalone server (monorepo layout preserved), its static files, public assets, and /content (read by /api/content).
COPY --from=build /app/apps/game/.next/standalone ./
COPY --from=build /app/apps/game/.next/static ./apps/game/.next/static
COPY --from=build /app/apps/game/public ./apps/game/public
COPY --from=build /app/content ./content
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
WORKDIR /app/apps/game
CMD ["node", "server.js"]
