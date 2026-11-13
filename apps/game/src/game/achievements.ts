// Achievement tracking. Ids are fixed here (and in @qublox/shared); names/descriptions are Gemini's
// (content/story/achievements.json). Progress lives in this browser's localStorage.
import type { ACHIEVEMENT_IDS } from '@qublox/shared';
import { bus } from './bus';

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];
type Save = { unlocked: Partial<Record<AchievementId, number>>; counters: Record<string, number>; sets: Record<string, string[]> };

const KEY = 'qublox-achievements-v1';
const GOALS: Partial<Record<string, [AchievementId, number]>> = {
  bribes: ['le-re', 10],
  painted: ['paint-the-town', 50],
  chai: ['chai-addict', 10],
};

let cache: Save | null = null;
function load(): Save {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Save | null;
    if (raw && typeof raw === 'object') return (cache = { unlocked: raw.unlocked ?? {}, counters: raw.counters ?? {}, sets: raw.sets ?? {} });
  } catch { /* private mode / bad data */ }
  return (cache = { unlocked: {}, counters: {}, sets: {} });
}
function save(s: Save) { cache = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* ignore */ } }

export const achievements = {
  unlocked(): Partial<Record<AchievementId, number>> { return load().unlocked; },

  unlock(id: AchievementId) {
    const s = load();
    if (s.unlocked[id]) return;
    s.unlocked[id] = Date.now();
    save(s);
    bus.emit('achievement', { id });
  },

  /** Bump a persistent counter; unlocks its achievement when the goal is reached. */
  count(counter: keyof typeof GOALS & string, by = 1) {
    const s = load();
    s.counters[counter] = (s.counters[counter] ?? 0) + by;
    save(s);
    const goal = GOALS[counter];
    if (goal && s.counters[counter]! >= goal[1]) achievements.unlock(goal[0]);
  },

  /** Is `member` already in persistent set `set`? */
  has(set: string, member: string): boolean { return (load().sets[set] ?? []).includes(member); },
  found(set: string): string[] { return load().sets[set] ?? []; },

  /** Add to a persistent set (e.g. NPCs talked to); unlocks `id` once every member of `all` is in it. */
  collect(set: string, member: string, all: string[], id: AchievementId) {
    const s = load();
    const cur = new Set(s.sets[set] ?? []);
    cur.add(member);
    s.sets[set] = [...cur];
    save(s);
    if (all.length && all.every(m => cur.has(m))) achievements.unlock(id);
  },
};
