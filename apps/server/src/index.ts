// Game API (Elysia + Postgres): accounts (Better Auth at /api/auth/*), leaderboard, cloud saves, VERSUS rooms.
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { RunSubmitSchema, SaveSchema, mergeSaves, EMPTY_SAVE, type LeaderboardRow, type Save } from '@qublox/shared';
import { migrate, sql } from './db';
import { auth, migrateAuth, userOf, ORIGINS, PROVIDERS } from './auth';
import { fight } from './fight';
import { errMsg, log } from './log';

const PORT = Number(process.env.PORT ?? 8787);

// Accounts, the leaderboard and saves need Postgres; VERSUS (WebSocket rooms) doesn't, so a missing DB isn't fatal.
// The DB can come up after the server (e.g. both starting on a deploy), so keep retrying until it answers.
let dbReady = false;
async function connectDb(attempt = 1): Promise<void> {
  try { await migrate(); await migrateAuth(); dbReady = true; log('info', 'db', 'connected', { attempt }); }
  catch (e) {
    // First failure, then every ~minute while it keeps failing, so the logs show it's still down without flooding.
    if (attempt === 1 || attempt % 12 === 0) log('warn', 'db', 'unavailable', { attempt, retryEverySecs: 5, error: errMsg(e), off: 'accounts,leaderboard,saves' });
    setTimeout(() => void connectDb(attempt + 1), 5000);
  }
}
await connectDb();

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

// Request timing for the access log (only failures and slow requests are logged).
const started = new WeakMap<Request, number>();

export const app = new Elysia()
  .onRequest(({ request }) => { started.set(request, performance.now()); })
  .onAfterResponse({ as: 'global' }, ({ request, set }) => {
    const ms = Math.round(performance.now() - (started.get(request) ?? performance.now()));
    const status = Number(set.status ?? 200);
    const path = new URL(request.url).pathname;
    if (path === '/fight') return;   // the WebSocket upgrade; the relay logs its own lines
    if (status >= 400 || ms > 1500) log(status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info', 'http', `${request.method} ${path}`, { status, ms, origin: request.headers.get('origin') ?? undefined });
  })
  .onError({ as: 'global' }, ({ request, code, error }) => {
    log('error', 'http', 'error', { path: `${request.method} ${new URL(request.url).pathname}`, code: String(code), error: errMsg(error) });
  })
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
// Everything that decides how this deploy behaves, in one line (no secrets): check this first when something's off.
log('info', 'server', 'boot', {
  port: PORT, db: dbReady, authUrl: process.env.BETTER_AUTH_URL ?? 'unset', origins: ORIGINS, crossSiteCookies: process.env.CROSS_SITE_COOKIES === '1',
  google: PROVIDERS.google, discord: PROVIDERS.discord, secretSet: !!process.env.BETTER_AUTH_SECRET, commit: (process.env.SOURCE_COMMIT ?? 'dev').slice(0, 7), logLevel: process.env.LOG_LEVEL ?? 'info',
});
process.on('unhandledRejection', e => log('error', 'server', 'unhandled-rejection', { error: errMsg(e) }));
process.on('uncaughtException', e => log('error', 'server', 'uncaught-exception', { error: errMsg(e) }));
