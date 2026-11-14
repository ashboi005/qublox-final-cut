// Matchup-aware VERSUS lines. Gemini's taunts sometimes name a crew member ("Sayam, you can't charm this hitbox!"):
// those only make sense against that person. Pure (no Phaser) so menus can use it too.
import type { CrewId } from '@qublox/shared';
import { CREW } from '../game/crew';

const NAMES = (Object.keys(CREW) as CrewId[]).map(id => [id, new RegExp(`\\b${CREW[id].name}\\b`, 'i')] as const);

/** Crew members a line is addressed to / about (other than the speaker). */
const named = (line: string, self: CrewId) => NAMES.filter(([id, re]) => id !== self && re.test(line)).map(([id]) => id);

/** Pick a line for `self` facing `opp`: a line naming the opponent when there is one (usually), else a generic one.
 *  Lines naming someone else are never used. Deterministic in `seed`. */
export function matchLine(lines: readonly string[] | undefined, self: CrewId, opp: CrewId, seed: number): string | null {
  if (!lines?.length) return null;
  const aimed = lines.filter(l => { const n = named(l, self); return n.length > 0 && n.every(id => id === opp); });
  const generic = lines.filter(l => named(l, self).length === 0);
  const pool = aimed.length && (generic.length === 0 || seed % 3 !== 0) ? aimed : generic;
  return pool.length ? pool[Math.abs(seed) % pool.length]! : null;
}
