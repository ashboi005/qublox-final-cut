// Serves /content (levels, dialogue, barks, story) fresh from disk on every request,
// so Gemini's writing and Claude's levels show up on a page reload without a rebuild.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const CONTENT = path.resolve(process.cwd(), '../../content');

function readDir(dir: string, ext: string): Record<string, string> {
  const full = path.join(CONTENT, dir);
  if (!existsSync(full)) return {};
  const out: Record<string, string> = {};
  for (const f of readdirSync(full)) if (f.endsWith(ext)) out[f.slice(0, -ext.length)] = readFileSync(path.join(full, f), 'utf8');
  return out;
}
function parseAll(files: Record<string, string>): { ok: Record<string, unknown>; errors: string[] } {
  const ok: Record<string, unknown> = {};
  const errors: string[] = [];
  for (const [k, v] of Object.entries(files)) {
    try { ok[k] = JSON.parse(v); } catch { errors.push(k); }
  }
  return { ok, errors };
}

export function GET() {
  const dialogue = parseAll(readDir('dialogue', '.json'));
  const barks = parseAll(readDir('barks', '.json'));
  const story = parseAll(readDir('story', '.json'));
  const songs = parseAll(readDir('audio/songs', '.json'));
  const audio = parseAll(readDir('audio', '.json'));
  return Response.json({
    levels: readDir('levels', '.txt'),
    dialogue: dialogue.ok,
    barks: barks.ok,
    story: story.ok,
    songs: songs.ok,
    sfx: audio.ok.sfx ?? null,
    errors: [...dialogue.errors.map(e => `dialogue/${e}`), ...barks.errors.map(e => `barks/${e}`), ...story.errors.map(e => `story/${e}`)],
  }, { headers: { 'Cache-Control': process.env.NODE_ENV === 'production' ? 'public, max-age=300' : 'no-store' } });
}
