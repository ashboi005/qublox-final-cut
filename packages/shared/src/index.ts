// Contracts shared by the game, the server and the validator.
// The human-readable versions live in docs/art/ART_SPEC.md and docs/narrative/BRIEF.md.
import { z } from 'zod';

export const CREW_IDS = ['ashwath', 'sayam', 'mansukh', 'manya', 'sehaj', 'brahmansh', 'tushar', 'manvi', 'mishthi'] as const;
export type CrewId = (typeof CREW_IDS)[number];
export const isCrewId = (s: string): s is CrewId => (CREW_IDS as readonly string[]).includes(s);

export const EMOTIONS = ['neutral', 'smug', 'panic', 'angry', 'deadpan', 'happy', 'sad', 'shocked'] as const;
export type Emotion = (typeof EMOTIONS)[number];

/** Animations every playable crew sheet must provide, with minimum frame counts. */
export const CREW_REQUIRED_ANIMS: Record<string, number> = {
  idle: 4, run: 6, jump: 2, fall: 2, attack: 4, ability: 4, hurt: 2, ko: 4, tagin: 4,
};
export const ENEMY_REQUIRED_ANIMS = ['idle', 'move', 'telegraph', 'attack', 'hurt', 'die'] as const;

const kebab = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase kebab-case');
const relPng = z.string().regex(/^[a-z0-9_\-/]+\.png$/, 'must be a relative .png path using lowercase, digits, - _ /');

// ---------- Art manifest ----------
export const AnimSchema = z.object({
  row: z.number().int().min(0),
  frames: z.number().int().min(1),
  fps: z.number().positive().max(60),
  loop: z.boolean(),
  hitFrame: z.number().int().min(0).optional(),
}).refine(a => a.hitFrame === undefined || a.hitFrame < a.frames, { message: 'hitFrame must be < frames' });

export const SpriteSchema = z.object({
  file: relPng,
  frameWidth: z.number().int().positive(),
  frameHeight: z.number().int().positive(),
  anims: z.record(kebab, AnimSchema),
  notes: z.string().optional(),
});

export const ManifestSchema = z.object({
  version: z.literal(1),
  sprites: z.record(kebab, SpriteSchema).default({}),
  tilesets: z.record(kebab, z.object({ file: relPng, tileSize: z.literal(16), notes: z.string().optional() })).default({}),
  images: z.record(kebab, z.object({ file: relPng, notes: z.string().optional() })).default({}),
  portraits: z.record(kebab, z.object({ file: relPng, size: z.literal(64), emotions: z.array(z.enum(EMOTIONS)).min(1) })).default({}),
});
export type Manifest = z.infer<typeof ManifestSchema>;
export type SpriteDef = z.infer<typeof SpriteSchema>;

// ---------- Writing ----------
export const CastSchema = z.object({
  cast: z.array(z.object({
    id: kebab, name: z.string().min(1), kind: z.enum(['villain', 'boss', 'npc', 'enemy', 'other']),
    bio: z.string().max(240), voice: z.string().max(240),
  })),
});

export const CrewVoicesSchema = z.object({
  voices: z.array(z.object({
    id: z.enum(CREW_IDS), voice: z.string().max(300), vocab: z.array(z.string()).max(20),
    never: z.string().max(200), proposedCatchphrase: z.string().max(60).nullable().optional(),
  })),
});

export const DialogueLineSchema = z.object({
  speaker: z.string().min(1),
  emotion: z.enum(EMOTIONS).optional(),
  text: z.string().min(1).max(90, 'dialogue lines are max 90 characters'),
});
export const DialogueSchema = z.object({
  id: kebab,
  episode: z.number().int().min(0).max(9),
  trigger: z.string().optional(),
  lines: z.array(DialogueLineSchema).min(1).max(40),
});
export type Dialogue = z.infer<typeof DialogueSchema>;

export const REQUIRED_BARKS = ['tagin', 'ability', 'hit', 'ko', 'kill', 'idle'] as const;
export const BarksSchema = z.object({
  id: z.enum(CREW_IDS),
  barks: z.record(kebab, z.array(z.string().min(1).max(40, 'barks are max 40 characters')).min(1)),
}).superRefine((b, ctx) => {
  for (const k of REQUIRED_BARKS) if (!b.barks[k]) ctx.addIssue({ code: 'custom', message: `missing bark category "${k}"` });
});
export type Barks = z.infer<typeof BarksSchema>;

export const FlavorSchema = z.object({
  enemies: z.array(z.object({ id: kebab, name: z.string(), desc: z.string().max(80) })).default([]),
  items: z.array(z.object({ id: kebab, name: z.string(), desc: z.string().max(80) })).default([]),
  places: z.array(z.object({ id: kebab, name: z.string(), desc: z.string().max(120) })).default([]),
  signage: z.array(z.string().max(24, 'signage is max 24 characters')).default([]),
});

// ---------- Leaderboard API ----------
export const RunSubmitSchema = z.object({
  player: z.string().trim().min(1).max(24),
  episode: z.number().int().min(0).max(9),
  timeMs: z.number().int().positive().max(24 * 3600 * 1000),
  style: z.number().int().min(0).max(100_000_000),
  kos: z.number().int().min(0).max(999),
  party: z.array(z.enum(CREW_IDS)).min(1).max(3),
  passcode: z.string().max(64).optional(),
});
export type RunSubmit = z.infer<typeof RunSubmitSchema>;
export type LeaderboardRow = Omit<RunSubmit, 'passcode'> & { id: number; createdAt: string };
export { z } from 'zod';

export const QuipsSchema = z.object({
  taglines: z.array(z.string().max(40)).default([]),
  loading: z.array(z.string().max(70)).default([]),
  gameover: z.array(z.string().max(60)).default([]),
  results: z.partialRecord(z.enum(['D', 'C', 'B', 'A', 'S', 'MAXIMALIST']), z.array(z.string().max(60))).default({}),
  /** Newspaper headline shown on each episode's results screen. Keys "0".."4". */
  headlines: z.partialRecord(z.enum(['0', '1', '2', '3', '4']), z.array(z.string().max(70))).default({}),
  /** Newspaper bylines under the headline ("By Pammi Aunty, Gossip Desk"). */
  bylines: z.array(z.string().max(48)).default([]),
});

/** Achievement ids are fixed by code (Claude tracks them); Gemini writes the names and descriptions. */
export const ACHIEVEMENT_IDS = [
  'first-swap', 'maximalist', 'no-ko-episode', 'monkey-business', 'le-re', 'rewind-reflect', 'ad-skipped',
  'paint-the-town', 'chai-addict', 'small-talk', 'beige-is-dead', 'speedrun-ep0', 'directors-cut', 'couple-goals',
] as const;

/** Lost Footage tapes: 3 hidden per episode. Ids are fixed (levels place them with `@tape`); Gemini writes the text. */
export const TAPE_IDS = ['ep0-1', 'ep0-2', 'ep0-3', 'ep1-1', 'ep1-2', 'ep1-3', 'ep2-1', 'ep2-2', 'ep2-3', 'ep3-1', 'ep3-2', 'ep3-3', 'ep4-1', 'ep4-2', 'ep4-3'] as const;
export const FootageSchema = z.object({
  tapes: z.array(z.object({ id: z.enum(TAPE_IDS), title: z.string().max(32), caption: z.string().max(90) })),
});
export type Footage = z.infer<typeof FootageSchema>;

/** VERSUS (fight mode) lines per crew: pre-fight taunts and win quotes. Gemini writes; story/versus.json. */
export const VersusLinesSchema = z.object({
  crew: z.partialRecord(z.enum(CREW_IDS), z.object({ intro: z.array(z.string().max(40)).default([]), win: z.array(z.string().max(70)).default([]) })),
});
/** Crew Glossary (title → The Crew): Gemini's sarcastic dossier per crew member. Mechanics come from code, not from here. story/glossary.json. */
export const GlossarySchema = z.object({
  intro: z.string().max(140).optional(),
  crew: z.partialRecord(z.enum(CREW_IDS), z.object({
    title: z.string().max(40),
    tagline: z.string().max(90),
    bio: z.string().max(360),
    catchphrases: z.array(z.string().max(40)).max(6).default([]),
    facts: z.array(z.string().max(80)).max(6).default([]),
    threat: z.string().max(48).optional(),
  })),
});
export type Glossary = z.infer<typeof GlossarySchema>;
export const AchievementsSchema = z.object({
  achievements: z.array(z.object({ id: z.enum(ACHIEVEMENT_IDS), name: z.string().max(32), desc: z.string().max(80) })),
});

// ---------- Audio (procedural, see docs/audio/AUDIO_SPEC.md) ----------
export const NOTE_RE = /^([A-G])(#|b)?(-?\d)$/;
export const InstrumentSchema = z.object({
  wave: z.enum(['square', 'sawtooth', 'triangle', 'sine', 'noise', 'kick', 'snare', 'hat']),
  volume: z.number().min(0).max(1).default(0.2),
  attack: z.number().min(0).max(2).default(0.005),
  decay: z.number().min(0).max(2).default(0.1),
  sustain: z.number().min(0).max(1).default(0.5),
  release: z.number().min(0).max(4).default(0.08),
  detune: z.number().min(-1200).max(1200).default(0),
  cutoff: z.number().min(40).max(20000).optional(),
  vibrato: z.object({ rate: z.number().min(0).max(20), depth: z.number().min(0).max(100) }).optional(),
  pan: z.number().min(-1).max(1).default(0),
});
export const SongSchema = z.object({
  id: kebab,
  bpm: z.number().min(40).max(260),
  stepsPerBeat: z.number().int().min(1).max(8).default(4),
  swing: z.number().min(0).max(0.5).default(0),
  instruments: z.record(kebab, InstrumentSchema),
  patterns: z.record(z.string().regex(/^[A-Za-z0-9_-]+$/), z.record(kebab, z.string())),
  order: z.array(z.string()).min(1),
  loopFrom: z.number().int().min(0).default(0),
  /** false = a one-shot stinger: plays `order` once, then stops. */
  loop: z.boolean().default(true),
}).superRefine((song, ctx) => {
  for (const [pid, tracks] of Object.entries(song.patterns)) {
    let len: number | null = null;
    for (const [inst, steps] of Object.entries(tracks)) {
      if (!song.instruments[inst]) ctx.addIssue({ code: 'custom', path: ['patterns', pid, inst], message: `unknown instrument "${inst}"` });
      const tokens = parseSteps(steps);
      if (len === null) len = tokens.length;
      else if (tokens.length !== len) ctx.addIssue({ code: 'custom', path: ['patterns', pid, inst], message: `has ${tokens.length} steps, other tracks have ${len}` });
      tokens.forEach((t, i) => { if (!isStepToken(t)) ctx.addIssue({ code: 'custom', path: ['patterns', pid, inst], message: `step ${i}: bad token "${t}" (use a note like C4/F#3/Bb2, "x", "x1".."x9", "." rest, "-" hold)` }); });
    }
  }
  song.order.forEach((p, i) => { if (!song.patterns[p]) ctx.addIssue({ code: 'custom', path: ['order', i], message: `unknown pattern "${p}"` }); });
});
export type Song = z.infer<typeof SongSchema>;
export type Instrument = z.infer<typeof InstrumentSchema>;
/** "C4 . E4 - | x . x ." → ["C4",".","E4","-","x",".","x","."] (bar lines are ignored). */
export function parseSteps(s: string): string[] { return s.split(/\s+/).filter(t => t && t !== '|'); }
export function isStepToken(t: string) { return t === '.' || t === '-' || /^x[1-9]?$/.test(t) || NOTE_RE.test(t); }
export function noteToMidi(n: string): number | null {
  const m = NOTE_RE.exec(n);
  if (!m) return null;
  const base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1] as 'C'];
  return base + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (Number(m[3]) + 1) * 12;
}

export const SFX_REQUIRED = ['jump', 'land', 'hit', 'swap', 'ability', 'hurt', 'ko', 'pickup', 'door', 'menu'] as const;
export const SfxSchema = z.object({
  sfx: z.record(kebab, z.object({
    wave: z.enum(['square', 'sawtooth', 'triangle', 'sine', 'noise']),
    freq: z.tuple([z.number().min(20).max(12000), z.number().min(20).max(12000)]),
    duration: z.number().min(0.01).max(2),
    volume: z.number().min(0).max(1).default(0.25),
    cutoff: z.number().min(40).max(20000).optional(),
    repeat: z.number().int().min(1).max(8).default(1),
  })),
}).superRefine((s, ctx) => { for (const k of SFX_REQUIRED) if (!s.sfx[k]) ctx.addIssue({ code: 'custom', message: `missing required sfx "${k}"` }); });
export type SfxBank = z.infer<typeof SfxSchema>;
