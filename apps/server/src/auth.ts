// Accounts (Better Auth): email + password always; Google / Discord when their client id + secret are set.
// Sessions are cookies on the API's domain. The game lives on a sibling subdomain (same site), so the browser
// sends them along with `credentials: 'include'` fetches.
import { betterAuth } from 'better-auth';
import { getMigrations } from 'better-auth/db/migration';
import { Pool } from 'pg';
import { DATABASE_URL } from './db';

export const ORIGINS = (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map(s => s.trim()).filter(Boolean);

const env = (k: string) => process.env[k]?.trim() || undefined;
const google = env('GOOGLE_CLIENT_ID') && env('GOOGLE_CLIENT_SECRET') ? { clientId: env('GOOGLE_CLIENT_ID')!, clientSecret: env('GOOGLE_CLIENT_SECRET')! } : null;
const discord = env('DISCORD_CLIENT_ID') && env('DISCORD_CLIENT_SECRET') ? { clientId: env('DISCORD_CLIENT_ID')!, clientSecret: env('DISCORD_CLIENT_SECRET')! } : null;

if (process.env.NODE_ENV === 'production' && !env('BETTER_AUTH_SECRET')) {
  throw new Error('BETTER_AUTH_SECRET is not set. Generate one with `openssl rand -base64 32` and add it to the server env.');
}

/** Which sign-in buttons the game should show. */
export const PROVIDERS = { email: true, google: !!google, discord: !!discord };

export const auth = betterAuth({
  appName: 'QUBLOX: FINAL CUT',
  // BETTER_AUTH_URL (the API's public URL, e.g. https://api.yourdomain) and BETTER_AUTH_SECRET are read from env.
  baseURL: env('BETTER_AUTH_URL') ?? `http://localhost:${process.env.PORT ?? 8787}`,
  database: new Pool({ connectionString: DATABASE_URL, max: 5 }),
  trustedOrigins: ORIGINS,
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
  socialProviders: { ...(google ? { google } : {}), ...(discord ? { discord } : {}) },
  account: { accountLinking: { enabled: true, trustedProviders: ['google', 'discord'] } },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  // Only when the game and API are on unrelated domains (not sibling subdomains): cookies must be SameSite=None.
  ...(env('CROSS_SITE_COOKIES') === '1' ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
  telemetry: { enabled: false },
});

/** Create/upgrade Better Auth's tables (user, session, account, verification). Idempotent. */
export async function migrateAuth() {
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
}

/** The signed-in user for a request, or null. */
export async function userOf(headers: Headers) {
  const s = await auth.api.getSession({ headers });
  return s?.user ?? null;
}
