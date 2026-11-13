// Encodes the crew's raw voice notes (voicelines/<crew>/<label>, any format ffmpeg reads) into small, loudness-
// normalised, silence-trimmed mono MP3s at apps/game/public/voice/<crew>/<slug>.mp3, plus an index.json the game
// reads. Which clip plays when is decided in apps/game/src/game/voice.ts.
//   bun tools/voice/build.ts          (needs ffmpeg on PATH)
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CREW_IDS } from '../../packages/shared/src/index.ts';

const ROOT = join(import.meta.dir, '../..');
const SRC = join(ROOT, 'voicelines'), OUT = join(ROOT, 'apps/game/public/voice');
const slug = (s: string) => s.replace(/\.[a-z0-9]{2,4}$/i, '').normalize('NFKD').replace(/[^\x20-\x7e]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const label = (s: string) => s.replace(/\.[a-z0-9]{2,4}$/i, '').trim();

const index: Record<string, Record<string, { file: string; label: string; ms: number }>> = {};
if (!existsSync(SRC)) { console.log('no voicelines/ folder'); process.exit(0); }
for (const crew of readdirSync(SRC)) {
  const dir = join(SRC, crew);
  if (!statSync(dir).isDirectory()) continue;
  if (!(CREW_IDS as readonly string[]).includes(crew)) { console.warn(`skip ${crew}: not a crew id`); continue; }
  mkdirSync(join(OUT, crew), { recursive: true });
  for (const f of readdirSync(dir)) {
    if (f.startsWith('.')) continue;
    const id = slug(f);
    if (!id) { console.warn(`skip ${crew}/${f}: empty name`); continue; }
    const out = join(OUT, crew, `${id}.mp3`);
    const enc = Bun.spawnSync(['ffmpeg', '-y', '-v', 'error', '-i', join(dir, f),
      '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,loudnorm=I=-16:TP=-1.5:LRA=11',
      '-ac', '1', '-ar', '44100', '-b:a', '64k', out]);
    if (enc.exitCode !== 0) { console.error(`ffmpeg failed on ${crew}/${f}:\n${enc.stderr}`); process.exit(1); }
    const probe = Bun.spawnSync(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]);
    const ms = Math.round(Number(probe.stdout.toString().trim()) * 1000);
    (index[crew] ??= {})[id] = { file: `/voice/${crew}/${id}.mp3`, label: label(f), ms };
    console.log(`${crew}/${id}.mp3  ${ms}ms  ${(statSync(out).size / 1024).toFixed(1)} KB  ← "${label(f)}"`);
  }
}
writeFileSync(join(OUT, 'index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`wrote apps/game/public/voice/index.json`);
