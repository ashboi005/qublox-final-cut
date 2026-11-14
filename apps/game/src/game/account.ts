// Accounts (Better Auth on the game API) + the cloud save that follows a signed-in player between devices.
// Signed out, everything still works from browser storage; signing in merges that into the account.
import { createAuthClient } from 'better-auth/react';
import { SaveSchema, type LeaderboardRow, type RunSubmit, type Save } from '@qublox/shared';
import { achievements } from './achievements';
import { loadProgress, replaceCleared } from './progress';
import { onLocalSave } from './savehook';

export const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
/** Session cookies live on the API's domain; the client sends them with `credentials: 'include'`. */
export const authClient = createAuthClient({ baseURL: API });
export const useSession = authClient.useSession;

export type ServerConfig = { providers: { email: boolean; google: boolean; discord: boolean }; accounts: boolean };
let config: Promise<ServerConfig | null> | null = null;
/** What the server can do (which sign-in buttons to show). null = server unreachable. */
export function serverConfig() {
  config ??= fetch(`${API}/config`).then(r => (r.ok ? (r.json() as Promise<ServerConfig>) : null)).catch(() => { config = null; return null; });
  return config;
}

const call = (path: string, init?: RequestInit) => fetch(`${API}${path}`, { credentials: 'include', ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });

// ---- cloud save -------------------------------------------------------------------------------------
const localSave = (): Save => ({ cleared: loadProgress().cleared, achievements: achievements.snapshot() as Save['achievements'] });

/** Send this browser's save; the server merges it with the account's and returns the union, which we keep. */
export async function syncSave(): Promise<Save | null> {
  try {
    const r = await call('/save', { method: 'PUT', body: JSON.stringify(localSave()) });
    if (!r.ok) return null;
    const merged = SaveSchema.safeParse(await r.json());
    if (!merged.success) return null;
    replaceCleared(merged.data.cleared);
    achievements.replace(merged.data.achievements as Parameters<typeof achievements.replace>[0]);
    return merged.data;
  } catch { return null; }
}

let signedIn = false;
let timer: ReturnType<typeof setTimeout> | undefined;
/** Called by the session hook. While signed in, every local save change is pushed (debounced). */
export function setSignedIn(v: boolean) {
  signedIn = v;
  if (!v) clearTimeout(timer);
}
onLocalSave(() => {
  if (!signedIn) return;
  clearTimeout(timer);
  timer = setTimeout(() => void syncSave(), 1500);
});

// ---- leaderboard ------------------------------------------------------------------------------------
export async function postRun(run: RunSubmit): Promise<LeaderboardRow> {
  let r: Response;
  try { r = await call('/runs', { method: 'POST', body: JSON.stringify(run) }); }
  catch { throw new Error('Leaderboard server is offline. Start it with: bun run db:up && bun run dev:server'); }
  if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
  return (await r.json()) as LeaderboardRow;
}

// Google/Discord sign-in leaves the page, so a run waiting to be posted is parked here and posted on return.
const PENDING = 'qublox-pending-run';
export function parkRun(run: RunSubmit) { try { sessionStorage.setItem(PENDING, JSON.stringify(run)); } catch { /* ignore */ } }
export async function postParkedRun(): Promise<LeaderboardRow | null> {
  let run: RunSubmit | null = null;
  try { run = JSON.parse(sessionStorage.getItem(PENDING) ?? 'null') as RunSubmit | null; sessionStorage.removeItem(PENDING); } catch { /* ignore */ }
  if (!run) return null;
  try { return await postRun(run); } catch { return null; }
}
