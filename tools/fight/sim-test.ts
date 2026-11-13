// Headless VERSUS checks: determinism (same inputs → same checksum), every crew's special + super fires,
// and bot-vs-bot matches actually end. Run: bun tools/fight/sim-test.ts
import { BTN, checksum, createFight, step, METER_MAX, type FightState } from '../../packages/shared/src/fight/sim';
import { CREW_IDS, type CrewId } from '../../packages/shared/src/index';

/** A dumb but aggressive deterministic bot. */
function bot(s: FightState, i: 0 | 1, salt: number): number {
  const f = s.fighters[i], o = s.fighters[i === 0 ? 1 : 0];
  const r = (Math.imul(s.frame + salt, 2654435761) >>> 0) % 100;
  let b = 0;
  const toward = o.x > f.x ? BTN.RIGHT : BTN.LEFT, away = o.x > f.x ? BTN.LEFT : BTN.RIGHT;
  const dist = Math.abs(o.x - f.x) / 16;
  if (dist > 60) b |= toward; else if (r < 15) b |= away;
  if (r > 92) b |= BTN.UP;
  if (s.frame % 7 === 0) b |= r < 40 ? BTN.LIGHT : r < 65 ? BTN.HEAVY : r < 85 ? BTN.SPECIAL : 0;
  if (f.meter >= METER_MAX && r < 30) b |= BTN.SUPER;
  return b;
}

function run(p1: CrewId, p2: CrewId, seed: number, maxFrames = 60 * 60 * 6) {
  const s = createFight(p1, p2, seed);
  const moves = new Set<string>();
  for (let n = 0; n < maxFrames && s.phase !== 'matchEnd'; n++) {
    step(s, [bot(s, 0, 11), bot(s, 1, 977)]);
    for (const e of s.events) if (e.type === 'move') moves.add(`${s.fighters[e.who].crew}:${e.slot}`);
  }
  return { s, moves, sum: checksum(s) };
}

let fail = 0;
const a = run('ashwath', 'sehaj', 42), b = run('ashwath', 'sehaj', 42);
console.log(`determinism: ${a.sum === b.sum && a.s.frame === b.s.frame ? 'OK' : 'FAIL'} (frame ${a.s.frame}, sum ${a.sum})`);
if (a.sum !== b.sum) fail++;

// Snapshot/restore (what rollback does) gives the same result as running straight through.
{
  const s1 = createFight('manvi', 'tushar', 7), s2 = createFight('manvi', 'tushar', 7);
  for (let n = 0; n < 600; n++) step(s1, [bot(s1, 0, 1), bot(s1, 1, 2)]);
  for (let n = 0; n < 300; n++) step(s2, [bot(s2, 0, 1), bot(s2, 1, 2)]);
  const snap = structuredClone(s2);
  for (let n = 0; n < 50; n++) step(s2, [BTN.LEFT, BTN.RIGHT]);          // "mispredicted" frames
  const s3 = snap;                                                       // roll back and replay correctly
  for (let n = 0; n < 300; n++) step(s3, [bot(s3, 0, 1), bot(s3, 1, 2)]);
  const ok = checksum(s1) === checksum(s3);
  console.log(`rollback replay: ${ok ? 'OK' : 'FAIL'}`);
  if (!ok) fail++;
}

const seen = new Set<string>();
for (const p1 of CREW_IDS) for (const p2 of CREW_IDS) {
  const r = run(p1, p2, 1234 + p1.length * 7 + p2.length);
  r.moves.forEach(m => seen.add(m));
  if (r.s.phase !== 'matchEnd') { console.log(`no result: ${p1} vs ${p2} (rounds ${r.s.wins})`); fail++; }
}
for (const c of CREW_IDS) for (const slot of ['special', 'super']) if (!seen.has(`${c}:${slot}`)) { console.log(`never used: ${c} ${slot}`); fail++; }
const wins: Record<string, number> = {};
for (const p1 of CREW_IDS) for (const p2 of CREW_IDS) if (p1 !== p2) { const r = run(p1, p2, 99); const w = r.s.winner === 0 ? p1 : p2; wins[w] = (wins[w] ?? 0) + 1; }
console.log('bot-vs-bot wins (rough balance read):', Object.entries(wins).sort((x, y) => y[1] - x[1]).map(([k, v]) => `${k} ${v}`).join(' · '));
console.log(fail ? `${fail} problem(s)` : 'all good');
process.exit(fail ? 1 : 0);
