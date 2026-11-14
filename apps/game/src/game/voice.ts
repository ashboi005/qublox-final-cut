// The crew's real recorded voice lines. Clips are built by tools/voice/build.ts into /voice/<crew>/<slug>.mp3 with
// /voice/index.json; this file decides WHEN each one plays (a cue). A cue with no clip just falls back to text barks.
import type { CrewId } from '@qublox/shared';
import { synth } from './audio/synth';

export type VoiceCue = 'tagin' | 'kill' | 'clear' | 'hurt' | 'annoyed' | 'special' | 'ability' | 'intro' | 'win' | 'ko' | 'couple';
export type VoiceClip = { file: string; label: string; ms: number };
type Index = Partial<Record<CrewId, Record<string, VoiceClip>>>;

/** Which recorded line answers which moment. Slugs are the clip file names (from the user's labels). */
const CUES: Partial<Record<CrewId, Partial<Record<VoiceCue, string[]>>>> = {
  brahmansh: {
    kill: ['parlaug-bire'],                 // "parlok, bire": sending them off
    clear: ['gg-thaa'],                     // room / boss cleared
    win: ['gg-thaa'],                       // VERSUS win
    special: ['house-of-shakes'],           // UNHINGED: the whole screen shakes
    annoyed: ['kutti-jaat-lubaane'],        // EASILY ANNOYED triggers
    intro: ['house-of-shakes', 'parlaug-bire'],
    tagin: ['gg-thaa', 'parlaug-bire'],
    ability: ['parlaug-bire'],
    hurt: ['kutti-jaat-lubaane'],
    ko: ['gg-thaa'],
  },
  sehaj: {
    tagin: ['vajj'],
    ability: ['vajj'],
    ko: ['random-weird-laugh'],
    kill: ['vajj', 'random-weird-laugh'],
    special: ['vajj'],                                  // BEAST MODE boulder
    hurt: ['ferr-khende-bohota-galla-kad-da'],          // "then you say I abuse a lot"
    clear: ['random-weird-laugh'],
    couple: ['random-weird-laugh'],
    intro: ['vajj', 'ferr-khende-bohota-galla-kad-da'],
    win: ['random-weird-laugh', 'vajj'],
  },
};
/** Captions for clips whose label isn't the words spoken. */
const CAPTIONS: Record<string, string> = {
  'sehaj/random-weird-laugh': '*weird laugh*',
  'sehaj/ferr-khende-bohota-galla-kad-da': 'Fir khende bohota galla kad da',
};
/** Per-cue minimum gap so frequent moments (kills) don't turn into a soundboard. */
const GAP: Partial<Record<VoiceCue, number>> = { kill: 3500, tagin: 4000, hurt: 3000, ability: 4000, special: 1500 };
/** Any line from the same person: a short breather so lines don't trip over each other. */
const ANY_GAP = 1400;

let index: Index = {};
const caption = (crew: string, slug: string, c: VoiceClip): VoiceClip => ({ ...c, label: CAPTIONS[`${crew}/${slug}`] ?? c.label });
let loading: Promise<void> | null = null;
const lastAt = new Map<string, number>();

export function loadVoices(): Promise<void> {
  return (loading ??= fetch('/voice/index.json').then(r => (r.ok ? r.json() : {})).then(j => {
    index = Object.fromEntries(Object.entries(j as Index).map(([crew, clips]) => [crew, Object.fromEntries(Object.entries(clips ?? {}).map(([slug, c]) => [slug, caption(crew, slug, c)]))]));
  }).catch(() => {}));
}
export const voiceClips = (crew: CrewId): VoiceClip[] => Object.values(index[crew] ?? {});
export function clipFor(crew: CrewId, cue: VoiceCue): VoiceClip | null {
  const slugs = CUES[crew]?.[cue];
  const pool = (slugs ?? []).map(s => index[crew]?.[s]).filter((c): c is VoiceClip => !!c);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)]! : null;
}
export function preloadCrew(crew: CrewId) { for (const c of voiceClips(crew)) synth.preloadVoice(c.file); }

/** Play a cue if this crew member recorded one (respecting the per-cue gap). Returns the clip (for captions) or null. */
export function speak(crew: CrewId, cue: VoiceCue, now = performance.now()): VoiceClip | null {
  const clip = clipFor(crew, cue);
  if (!clip) return null;
  const key = `${crew}:${cue}`;
  if (now - (lastAt.get(key) ?? -1e9) < (GAP[cue] ?? 0) || now - (lastAt.get(crew) ?? -1e9) < ANY_GAP) return null;
  lastAt.set(key, now); lastAt.set(crew, now);
  void synth.speak(clip.file);
  return clip;
}
/** Play a specific clip (glossary buttons). */
export const playClip = (clip: VoiceClip) => { synth.unlock(); return synth.speak(clip.file); };
