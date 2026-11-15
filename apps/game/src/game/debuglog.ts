// Client debug log: every line goes to the browser console AND a ring buffer, so a player can hand over
// "what just happened" without opening devtools: `window.__qubloxLog()` in the console, or the "Copy debug log"
// button on the VERSUS result screen. Important events (desync, long stalls, match summaries) also go to the
// server's logs (see net.ts → `report`).
type Fields = Record<string, string | number | boolean | null | undefined>;
const MAX = 400;
const lines: string[] = [];
let installed = false;

export function dlog(tag: string, event: string, fields: Fields = {}, level: 'info' | 'warn' | 'error' = 'info') {
  install();
  const kv = Object.entries(fields).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${typeof v === 'string' && /\s/.test(v) ? JSON.stringify(v) : v}`).join(' ');
  const line = `${new Date().toISOString().slice(11, 23)} ${level === 'info' ? '' : level.toUpperCase() + ' '}[${tag}] ${event}${kv ? ' ' + kv : ''}`;
  lines.push(line);
  if (lines.length > MAX) lines.splice(0, lines.length - MAX);
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.info)(line);
}

/** The whole buffer as text (newest last), with a header that identifies the build and browser. */
export function debugLogText() {
  const build = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'dev';
  const head = `QUBLOX debug log · build ${build} · ${typeof navigator !== 'undefined' ? navigator.userAgent : ''} · ${new Date().toISOString()}`;
  return [head, ...lines].join('\n');
}

function install() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  (window as unknown as { __qubloxLog: () => string }).__qubloxLog = () => { const t = debugLogText(); console.log(t); return t; };
  window.addEventListener('error', e => dlog('page', 'error', { message: e.message, at: `${e.filename?.split('/').pop()}:${e.lineno}` }, 'error'));
  window.addEventListener('unhandledrejection', e => dlog('page', 'unhandled-rejection', { reason: String((e.reason as Error)?.message ?? e.reason).slice(0, 200) }, 'error'));
}
