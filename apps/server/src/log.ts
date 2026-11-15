// One-line, grep-friendly server logs: `2026-11-16T10:00:00.000Z INFO  [versus] start room=ABCD match=123 crews=ashwath,manya`.
// Read them in Coolify (the server's Logs tab). LOG_LEVEL=debug adds the chatty lines (heartbeats, every rematch tap).
// Never log secrets, passwords, tokens or emails: ids, room codes, counts and codes only.
type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN = ORDER[(process.env.LOG_LEVEL as Level) in ORDER ? (process.env.LOG_LEVEL as Level) : 'info'];

type Fields = Record<string, string | number | boolean | null | undefined | string[]>;
const fmt = (v: Fields[string]) => {
  if (Array.isArray(v)) return v.join(',');
  const s = String(v);
  return /[\s"=]/.test(s) ? JSON.stringify(s) : s;
};

export function log(level: Level, tag: string, event: string, fields: Fields = {}) {
  if (ORDER[level] < MIN) return;
  const kv = Object.entries(fields).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${fmt(v)}`).join(' ');
  const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} [${tag}] ${event}${kv ? ' ' + kv : ''}`;
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
}
/** A short, stable handle for a socket/user id in logs. */
export const short = (id: string | undefined) => (id ? id.slice(0, 8) : '-');
export const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e)).slice(0, 300);
