// A CPU opponent for VERSUS practice. Deterministic (uses the sim frame, not Math.random), so it also works in rollback tests.
import { BTN, METER_MAX, SUB, type FightState } from '@qublox/shared/fight';

export function cpuInput(s: FightState, i: 0 | 1, level: 1 | 2 | 3 = 2): number {
  const f = s.fighters[i], o = s.fighters[i === 0 ? 1 : 0];
  const r = (Math.imul(s.frame * 7 + i * 131, 2654435761) >>> 0) % 100;
  const toward = o.x > f.x ? BTN.RIGHT : BTN.LEFT, away = o.x > f.x ? BTN.LEFT : BTN.RIGHT;
  const dist = Math.abs(o.x - f.x) / SUB;
  let b = 0;
  // Block when the opponent is mid-attack and close (more often at higher levels).
  // Defend: block (crouch-block sweeps) when the opponent swings nearby, more reliably at higher levels.
  if (o.mode === 'attack' && dist < 110 && r < 25 * level) return BTN.BLOCK | (o.move === 'sweep' ? BTN.DOWN : 0);
  if (f.mode === 'block' && r < 20) return BTN.LIGHT | BTN.HEAVY;   // tech: throw back out of block pressure
  if (dist > 70) b |= toward; else if (r < 10) b |= away;
  if (r > 95) b |= BTN.UP;
  const attackEvery = level === 3 ? 6 : level === 2 ? 9 : 14;
  if (s.frame % attackEvery === 0) {
    if (f.meter >= METER_MAX && r < 40) b |= BTN.SUPER;
    else if (dist < 50 && r < 12) b |= BTN.LIGHT | BTN.HEAVY;                       // throw
    else if (dist < 60) b |= r < 45 ? BTN.LIGHT : r < 60 ? BTN.HEAVY : r < 75 ? BTN.DOWN | BTN.HEAVY : toward | BTN.HEAVY;
    else if (r < 35) b |= BTN.SPECIAL;
  }
  if (f.mode === 'attack' && s.frame % 5 === 0 && r < 45 * level / 3) b |= BTN.LIGHT;   // finish strings
  return b;
}
