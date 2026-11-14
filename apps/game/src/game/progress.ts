// Story progress on this device: which episodes have been cleared. Browser storage can be missing or throw
// (private windows), so every access is guarded and the game works without it.
import { localSaved } from './savehook';

const KEY = 'qublox-progress-v1';
type Progress = { cleared: number[] };

export function loadProgress(): Progress {
  try { const p = JSON.parse(localStorage.getItem(KEY) ?? '{}') as Partial<Progress>; return { cleared: Array.isArray(p.cleared) ? p.cleared.filter(n => typeof n === 'number') : [] }; }
  catch { return { cleared: [] }; }
}
export function markCleared(episode: number) {
  const p = loadProgress();
  if (p.cleared.includes(episode)) return;
  p.cleared.push(episode);
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* not persisted; fine */ }
  localSaved();
}
/** Overwrite with a merged cloud save (a superset of what's here). */
export function replaceCleared(cleared: number[]) {
  try { localStorage.setItem(KEY, JSON.stringify({ cleared })); } catch { /* ignore */ }
}
/** The first episode not cleared yet (null when they've all been beaten). */
export function nextEpisode(all: number[]): number | null {
  const done = new Set(loadProgress().cleared);
  return all.find(n => !done.has(n)) ?? null;
}
