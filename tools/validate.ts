// bun run validate: checks art + writing against the contracts.
// Errors fail (exit 1). Warnings are printed but pass.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { z } from '../packages/shared/src/index.ts';
import {
  BarksSchema, CastSchema, CREW_IDS, CREW_REQUIRED_ANIMS, CrewVoicesSchema, DialogueSchema,
  ENEMY_REQUIRED_ANIMS, FlavorSchema, ManifestSchema, QuipsSchema, SfxSchema, SongSchema, AchievementsSchema, FootageSchema, VersusLinesSchema, GlossarySchema,
} from '../packages/shared/src/index.ts';

const ROOT = join(import.meta.dir, '..');
const ASSETS = join(ROOT, 'apps/game/public/assets');
const CONTENT = join(ROOT, 'content');
const errors: string[] = [];
const warnings: string[] = [];
const ok: string[] = [];
const rel = (p: string) => relative(ROOT, p);

function readJson(path: string): unknown {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (e) { errors.push(`${rel(path)}: invalid JSON (${(e as Error).message})`); return undefined; }
}
function check<T extends z.ZodType>(schema: T, path: string): z.infer<T> | undefined {
  const data = readJson(path);
  if (data === undefined) return undefined;
  const r = schema.safeParse(data);
  if (!r.success) {
    for (const i of r.error.issues) errors.push(`${rel(path)} → ${i.path.join('.') || '(root)'}: ${i.message}`);
    return undefined;
  }
  ok.push(rel(path));
  return r.data;
}
/** Width/height from a PNG's IHDR chunk, or undefined if it isn't a PNG. */
function pngSize(path: string): { w: number; h: number; colorType: number } | undefined {
  const b = readFileSync(path);
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (b.length < 26 || sig.some((v, i) => b[i] !== v)) return undefined;
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), colorType: b[25]! };
}
const listJson = (dir: string) => existsSync(dir) ? readdirSync(dir).filter(f => f.endsWith('.json')).map(f => join(dir, f)) : [];
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

// ---------- Art ----------
const manifestPath = join(ASSETS, 'manifest.json');
const referenced = new Set<string>();
if (existsSync(manifestPath)) {
  const m = check(ManifestSchema, manifestPath);
  if (m) {
    const fileOk = (key: string, file: string) => {
      const p = join(ASSETS, file);
      referenced.add(p);
      if (!existsSync(p)) { errors.push(`manifest "${key}": file not found: ${file}`); return undefined; }
      const s = pngSize(p);
      if (!s) { errors.push(`manifest "${key}": ${file} is not a PNG`); return undefined; }
      if (s.colorType !== 6 && s.colorType !== 3) warnings.push(`manifest "${key}": ${file} has no alpha channel (expected RGBA)`);
      return s;
    };
    for (const [key, sp] of Object.entries(m.sprites)) {
      const s = fileOk(key, sp.file);
      const anims = Object.entries(sp.anims);
      const maxFrames = Math.max(0, ...anims.map(([, a]) => a.frames));
      const rows = Math.max(0, ...anims.map(([, a]) => a.row)) + 1;
      if (s) {
        if (s.w < maxFrames * sp.frameWidth) errors.push(`sprite "${key}": image is ${s.w}px wide but needs ≥ ${maxFrames}×${sp.frameWidth}=${maxFrames * sp.frameWidth}`);
        if (s.h !== rows * sp.frameHeight) errors.push(`sprite "${key}": image is ${s.h}px tall but ${rows} rows × ${sp.frameHeight} = ${rows * sp.frameHeight}`);
      }
      if ((CREW_IDS as readonly string[]).includes(key)) {
        if (sp.frameWidth !== 48 || sp.frameHeight !== 48) errors.push(`crew sprite "${key}": frames must be 48×48`);
        for (const [anim, min] of Object.entries(CREW_REQUIRED_ANIMS)) {
          const a = sp.anims[anim];
          if (!a) errors.push(`crew sprite "${key}": missing required anim "${anim}"`);
          else if (a.frames < min) errors.push(`crew sprite "${key}": anim "${anim}" needs ≥ ${min} frames (has ${a.frames})`);
        }
        if (sp.anims.attack && sp.anims.attack.hitFrame === undefined) errors.push(`crew sprite "${key}": attack needs a hitFrame`);
      } else if (sp.file.startsWith('sprites/enemies/')) {
        for (const anim of ENEMY_REQUIRED_ANIMS) if (!sp.anims[anim]) errors.push(`enemy sprite "${key}": missing required anim "${anim}"`);
      }
    }
    for (const [key, t] of Object.entries(m.tilesets)) {
      const s = fileOk(key, t.file);
      if (s && (s.w % 16 || s.h % 16)) errors.push(`tileset "${key}": ${s.w}×${s.h} is not a multiple of 16`);
      if (!existsSync(join(ROOT, `docs/art/tiles-${key}.md`))) warnings.push(`tileset "${key}": no docs/art/tiles-${key}.md index map yet`);
    }
    for (const [key, im] of Object.entries(m.images)) fileOk(key, im.file);
    for (const [key, p] of Object.entries(m.portraits)) {
      const s = fileOk(key, p.file);
      if (s && (s.h !== p.size || s.w !== p.size * p.emotions.length)) errors.push(`portrait "${key}": expected ${p.size * p.emotions.length}×${p.size} (one row, ${p.emotions.length} emotions), got ${s.w}×${s.h}`);
    }
    const missingCrew = CREW_IDS.filter(id => !m.sprites[id]);
    if (missingCrew.length) warnings.push(`crew without sprites yet (placeholders used): ${missingCrew.join(', ')}`);
  }
} else warnings.push('no apps/game/public/assets/manifest.json yet (all art is placeholder)');

const palettePath = join(ASSETS, 'palette.hex');
if (existsSync(palettePath)) {
  const lines = readFileSync(palettePath, 'utf8').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const bad = lines.filter(l => !/^#?[0-9a-fA-F]{6}$/.test(l));
  if (bad.length) errors.push(`palette.hex: invalid lines: ${bad.slice(0, 5).join(', ')}`);
  if (lines.length > 48) errors.push(`palette.hex: ${lines.length} colours (max 48)`);
  if (!bad.length && lines.length <= 48) ok.push(`palette.hex (${lines.length} colours)`);
}
for (const f of walk(ASSETS)) {
  if (f.endsWith('.png') && !referenced.has(f) && !f.endsWith('palette.png')) warnings.push(`unreferenced asset (not in manifest): ${rel(f)}`);
  if (statSync(f).size > 5 * 1024 * 1024) errors.push(`${rel(f)} is over 5 MB`);
}

// ---------- Writing ----------
const speakers = new Set<string>([...CREW_IDS, 'narrator']);
const castPath = join(CONTENT, 'story/cast.json');
if (existsSync(castPath)) check(CastSchema, castPath)?.cast.forEach(c => speakers.add(c.id));
const voicesPath = join(CONTENT, 'story/crew-voices.json');
if (existsSync(voicesPath)) check(CrewVoicesSchema, voicesPath);
const flavorPath = join(CONTENT, 'story/flavor.json');
if (existsSync(flavorPath)) check(FlavorSchema, flavorPath);
const achPath = join(CONTENT, 'story/achievements.json');
if (existsSync(achPath)) check(AchievementsSchema, achPath);
const quipsPath = join(CONTENT, 'story/quips.json');
if (existsSync(quipsPath)) check(QuipsSchema, quipsPath);
const footagePath = join(CONTENT, 'story/footage.json');
if (existsSync(footagePath)) check(FootageSchema, footagePath);
const versusPath = join(CONTENT, 'story/versus.json');
if (existsSync(versusPath)) check(VersusLinesSchema, versusPath);
const glossaryPath = join(CONTENT, 'story/glossary.json');
if (existsSync(glossaryPath)) check(GlossarySchema, glossaryPath);

const dialogueIds = new Map<string, string>();
for (const p of listJson(join(CONTENT, 'dialogue'))) {
  const d = check(DialogueSchema, p);
  if (!d) continue;
  const expected = p.split('/').pop()!.replace(/\.json$/, '');
  if (d.id !== expected) errors.push(`${rel(p)}: id "${d.id}" must match the file name "${expected}"`);
  if (dialogueIds.has(d.id)) errors.push(`${rel(p)}: duplicate dialogue id "${d.id}" (also in ${dialogueIds.get(d.id)})`);
  dialogueIds.set(d.id, rel(p));
  d.lines.forEach((l, i) => {
    if (!speakers.has(l.speaker)) errors.push(`${rel(p)} → lines.${i}: unknown speaker "${l.speaker}" (use a crew id, "narrator", or add them to content/story/cast.json)`);
  });
}
for (const p of listJson(join(CONTENT, 'barks'))) {
  const b = check(BarksSchema, p);
  if (b && `${b.id}.json` !== p.split('/').pop()) errors.push(`${rel(p)}: id "${b.id}" must match the file name`);
}

// ---------- Audio ----------
for (const p of listJson(join(CONTENT, 'audio/songs'))) {
  const song = check(SongSchema, p);
  if (song && `${song.id}.json` !== p.split('/').pop()) errors.push(`${rel(p)}: id "${song.id}" must match the file name`);
}
const sfxPath = join(CONTENT, 'audio/sfx.json');
if (existsSync(sfxPath)) check(SfxSchema, sfxPath);

// ---------- Report ----------
for (const o of ok) console.log(`  ✓ ${o}`);
for (const w of warnings) console.log(`  ! ${w}`);
for (const e of errors) console.log(`  ✗ ${e}`);
console.log(errors.length ? `\nFAILED: ${errors.length} error(s), ${warnings.length} warning(s)` : `\nOK: ${ok.length} file(s) valid, ${warnings.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
