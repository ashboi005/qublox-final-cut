// Game API (Elysia + Postgres): accounts (Better Auth at /api/auth/*), leaderboard, cloud saves, VERSUS rooms.
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { RunSubmitSchema, SaveSchema, mergeSaves, EMPTY_SAVE, type LeaderboardRow, type Save } from '@qublox/shared';
import { migrate, sql } from './db';
import { auth, migrateAuth, userOf, ORIGINS, PROVIDERS } from './auth';
import { fight } from './fight';

const PORT = Number(process.env.PORT ?? 8787);

// Accounts, the leaderboard and saves need Postgres; VERSUS (WebSocket rooms) doesn't, so a missing DB isn't fatal.
let dbReady = false;
try { await migrate(); await migrateAuth(); dbReady = true; } catch (e) { console.warn('[server] Postgres unavailable, accounts/leaderboard/saves disabled:', (e as Error).message); }

type Row = { id: number; player: string; episode: number; time_ms: number; style: number; kos: number; party: string[]; created_at: Date };
const toApi = (r: Row): LeaderboardRow => ({
  id: r.id, player: r.player, episode: r.episode, timeMs: r.time_ms, style: r.style, kos: r.kos,
  party: r.party as LeaderboardRow['party'], createdAt: r.created_at.toISOString(),
});
const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) => e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');

// Tiny in-memory rate limit: 20 runs per account per 10 minutes.
const hits = new Map<string, number[]>();
const limited = (key: string) => {
  const now = Date.now(), recent = (hits.get(key) ?? []).filter(t => now - t < 600_000);
  recent.push(now); hits.set(key, recent);
  return recent.length > 20;
};

export const app = new Elysia()
  .use(cors({ origin: ORIGINS, credentials: true, allowedHeaders: ['Content-Type', 'Authorization'], methods: ['GET', 'POST', 'PUT', 'OPTIONS'] }))
  .mount(auth.handler)
  .use(fight)
  .get('/health', async () => { if (dbReady) await sql`select 1`; return { ok: true, db: dbReady }; })
  .get('/config', () => ({ providers: PROVIDERS, accounts: dbReady }))
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
  .post('/runs', async ({ body, status, request }) => {
    const user = await userOf(request.headers);
    if (!user) return status(401, 'Sign in to post runs.');
    if (limited(user.id)) return status(429, 'Too many runs posted. Try again in a few minutes.');
    const parsed = RunSubmitSchema.safeParse(body);
    if (!parsed.success) return status(400, issues(parsed.error));
    const run = parsed.data;
    const player = (user.name || user.email.split('@')[0] || 'crew').trim().slice(0, 24);
    const [row] = await sql<Row[]>`
      insert into runs (player, episode, time_ms, style, kos, party, user_id)
      values (${player}, ${run.episode}, ${run.timeMs}, ${run.style}, ${run.kos}, ${run.party}, ${user.id})
      returning *`;
    return toApi(row!);
  })
  .get('/save', async ({ status, request }) => {
    const user = await userOf(request.headers);
    if (!user) return status(401, 'Not signed in.');
    const [row] = await sql<{ data: unknown }[]>`select data from saves where user_id = ${user.id}`;
    const parsed = SaveSchema.safeParse(row?.data ?? EMPTY_SAVE);
    return parsed.success ? parsed.data : EMPTY_SAVE;
  })
  // The client sends its whole local save; the server merges it with what it has and returns the result.
  .put('/save', async ({ body, status, request }) => {
    const user = await userOf(request.headers);
    if (!user) return status(401, 'Not signed in.');
    const parsed = SaveSchema.safeParse(body);
    if (!parsed.success) return status(400, issues(parsed.error));
    return await sql.begin(async tx => {
      const [row] = await tx<{ data: unknown }[]>`select data from saves where user_id = ${user.id} for update`;
      const prev = SaveSchema.safeParse(row?.data ?? EMPTY_SAVE);
      const merged: Save = mergeSaves(prev.success ? prev.data : EMPTY_SAVE, parsed.data);
      await tx`insert into saves (user_id, data, updated_at) values (${user.id}, ${tx.json(merged)}, now())
               on conflict (user_id) do update set data = excluded.data, updated_at = now()`;
      return merged;
    });
  })
  .listen(PORT);

console.log(`[server] game API on http://localhost:${PORT} (sign-in: email${PROVIDERS.google ? ', google' : ''}${PROVIDERS.discord ? ', discord' : ''})`);
