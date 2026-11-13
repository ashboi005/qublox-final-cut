// Leaderboard API (Elysia + Postgres). Later: crew login + party-mode WebSocket rooms.
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { RunSubmitSchema, type LeaderboardRow } from '@qublox/shared';
import { migrate, sql } from './db';

const PORT = Number(process.env.PORT ?? 8787);
const PASSCODE = process.env.CREW_PASSCODE?.trim() || null;
const ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);

await migrate();

type Row = { id: number; player: string; episode: number; time_ms: number; style: number; kos: number; party: string[]; created_at: Date };
const toApi = (r: Row): LeaderboardRow => ({
  id: r.id, player: r.player, episode: r.episode, timeMs: r.time_ms, style: r.style, kos: r.kos,
  party: r.party as LeaderboardRow['party'], createdAt: r.created_at.toISOString(),
});

// Tiny in-memory rate limit: 20 posts per IP per 10 minutes.
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now(), recent = (hits.get(ip) ?? []).filter(t => now - t < 600_000);
  recent.push(now); hits.set(ip, recent);
  return recent.length > 20;
};

export const app = new Elysia()
  .use(cors({ origin: ORIGINS }))
  .get('/health', async () => { await sql`select 1`; return { ok: true }; })
  .get('/leaderboard', async ({ query }) => {
    const episode = query.episode ?? 0;
    const limit = Math.min(query.limit ?? 10, 50);
    const rows = query.by === 'style'
      ? await sql<Row[]>`select * from runs where episode = ${episode} order by style desc, time_ms asc limit ${limit}`
      : await sql<Row[]>`select * from runs where episode = ${episode} order by time_ms asc, style desc limit ${limit}`;
    return rows.map(toApi);
  }, {
    query: t.Object({
      episode: t.Optional(t.Numeric({ minimum: 0, maximum: 9 })),
      by: t.Optional(t.Union([t.Literal('time'), t.Literal('style')])),
      limit: t.Optional(t.Numeric({ minimum: 1, maximum: 50 })),
    }),
  })
  .post('/runs', async ({ body, status, server, request }) => {
    const ip = server?.requestIP(request)?.address ?? 'unknown';
    if (limited(ip)) return status(429, 'Too many runs posted. Try again in a few minutes.');
    const parsed = RunSubmitSchema.safeParse(body);
    if (!parsed.success) return status(400, parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
    const run = parsed.data;
    if (PASSCODE && run.passcode !== PASSCODE) return status(403, 'Wrong crew passcode.');
    const [row] = await sql<Row[]>`
      insert into runs (player, episode, time_ms, style, kos, party)
      values (${run.player}, ${run.episode}, ${run.timeMs}, ${run.style}, ${run.kos}, ${run.party})
      returning *`;
    return toApi(row!);
  })
  .listen(PORT);

console.log(`[server] leaderboard API on http://localhost:${PORT}`);
