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
  const atk = (Math.imul((s.frame - o.modeFrames) + salt, 2654435761) >>> 0) % 100;   // one decision per attack
  if (o.mode === 'attack' && dist < 90 && o.modeFrames >= 3 && atk < 45) return BTN.BLOCK | (atk < 12 ? BTN.DOWN : 0);
  if (dist > 60) b |= toward; else if (r < 15) b |= away;
  if (r > 92) b |= BTN.UP;
  if (s.frame % 7 === 0) b |= r < 30 ? BTN.LIGHT : r < 45 ? BTN.HEAVY : r < 55 ? (BTN.DOWN | BTN.HEAVY) : r < 62 ? (toward | BTN.HEAVY) : r < 68 ? (BTN.LIGHT | BTN.HEAVY) : r < 85 ? BTN.SPECIAL : 0;
  if (s.frame % 7 === 1 && f.mode === 'attack' && r < 50) b |= BTN.LIGHT;   // mash for strings/cancels
  if (f.meter >= METER_MAX && r < 30) b |= BTN.SUPER;
  return b;
}

const words = new Set<string>(), slots = new Set<string>(), modes = new Set<string>();
function run(p1: CrewId, p2: CrewId, seed: number, maxFrames = 60 * 60 * 6) {
  const s = createFight(p1, p2, seed);
  const moves = new Set<string>();
  for (let n = 0; n < maxFrames && s.phase !== 'matchEnd'; n++) {
    step(s, [bot(s, 0, 11), bot(s, 1, 977)]);
    for (const e of s.events) { if (e.type === 'move') moves.add(`${s.fighters[e.who].crew}:${e.slot}`); if (e.type === 'hit') words.add(e.word); }
    for (const f of s.fighters) if (f.move) slots.add(f.move); for (const f of s.fighters) modes.add(f.mode);
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

// Turtling: P2 holds BLOCK while P1 keeps pressuring → GUARD BREAK must happen; a timed BLOCK tap → PARRY.
{
  const s = createFight('tushar', 'sayam', 3);
  const got = new Set<string>();
  for (let n = 0; n < 2400 && !got.has('GUARD BREAK'); n++) {
    const [a, b] = s.fighters, close = Math.abs(a.x - b.x) < 60 * 16;
    const p1 = s.phase !== 'fight' ? 0 : !close ? (b.x > a.x ? BTN.RIGHT : BTN.LEFT) : n % 14 === 0 ? BTN.HEAVY : n % 14 === 7 ? BTN.LIGHT : 0;
    step(s, [p1, BTN.BLOCK]);
    for (const e of s.events) if (e.type === 'hit') got.add(e.word);
  }
  const ok = got.has('GUARD BREAK');
  console.log(`guard break when turtling: ${ok ? 'OK' : 'FAIL'}`);
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
for (const sl of ['light2', 'light3', 'sweep', 'overhead', 'airLight', 'airHeavy', 'throw']) if (!slots.has(sl)) { console.log(`never used: ${sl}`); fail++; }
for (const md of ['down', 'blockstun']) if (!modes.has(md)) { console.log(`never reached: ${md}`); fail++; }
// New rules: special cooldown, U-only block, FINAL CUT finisher.
{
  const t = createFight('sayam', 'ashwath', 5);
  for (let k = 0; k < 95; k++) step(t, [0, 0]);   // past the intro
  step(t, [BTN.SPECIAL, 0]); const first = t.fighters[0].move;
  for (let k = 0; k < 40; k++) step(t, [0, 0]);
  step(t, [BTN.SPECIAL, 0]); const second = t.fighters[0].move;
  console.log(`special cooldown: ${first === 'special' && second !== 'special' ? 'OK' : 'FAIL'}`); if (!(first === 'special' && second !== 'special')) fail++;
  const u = createFight('ashwath', 'sehaj', 6);
  for (let k = 0; k < 95; k++) step(u, [0, 0]);
  const x0 = u.fighters[0].x; for (let k = 0; k < 20; k++) step(u, [BTN.LEFT, 0]);
  const walked = u.fighters[0].x < x0 && u.fighters[0].mode === 'walk';
  console.log(`hold back walks: ${walked ? 'OK' : 'FAIL'}`); if (!walked) fail++;
  // Holding back never guards; U does.
  const g = createFight('ashwath', 'sehaj', 8);
  for (let k = 0; k < 95; k++) step(g, [0, 0]);
  g.fighters[0].x = g.fighters[1].x - 40 * 16; g.fighters[0].facing = 1;
  let backGuarded = false, uGuarded = false;
  for (let k = 0; k < 30; k++) { step(g, [BTN.LEFT, k === 0 ? BTN.HEAVY : 0]); if (g.events?.some?.((e: { type: string; blocked?: boolean }) => e.type === 'hit' && e.blocked)) backGuarded = true; }
  const h = createFight('ashwath', 'sehaj', 8);
  for (let k = 0; k < 95; k++) step(h, [0, 0]);
  h.fighters[0].x = h.fighters[1].x - 40 * 16; h.fighters[0].facing = 1;
  for (let k = 0; k < 30; k++) { step(h, [BTN.BLOCK, k === 0 ? BTN.HEAVY : 0]); if (h.events?.some?.((e: { type: string; blocked?: boolean }) => e.type === 'hit' && e.blocked)) uGuarded = true; }
  console.log(`block is U only: ${!backGuarded && uGuarded ? 'OK' : 'FAIL'} (back ${backGuarded}, U ${uGuarded})`); if (backGuarded || !uGuarded) fail++;
  const v = createFight('tushar', 'manvi', 7);
  for (let n = 0; n < 60 * 60 * 6 && v.phase !== 'finish' && v.phase !== 'matchEnd'; n++) { step(v, [BTN.RIGHT | (n % 9 === 0 ? BTN.LIGHT : 0), 0]); v.fighters[1].hp = Math.min(v.fighters[1].hp, 30); }
  let fin = false;
  if (v.phase === 'finish') { const w = v.winner!; const inp: [number, number] = [0, 0]; inp[w] = BTN.DOWN | BTN.SUPER; step(v, inp); for (let k = 0; k < 400 && v.phase !== 'matchEnd'; k++) step(v, [0, 0]); fin = v.finisher === w && v.phase === 'matchEnd'; }
  console.log(`FINAL CUT finisher: ${fin ? 'OK' : 'FAIL'} (phase ${v.phase})`); if (!fin) fail++;
}
console.log('seen hit words:', ['PARRY', 'GUARD BREAK', 'LOW!', 'OVERHEAD!', 'THROWN', 'BLOCK'].map(w => `${w} ${words.has(w) ? '✓' : '·'}`).join('  '));
console.log(fail ? `${fail} problem(s)` : 'all good');
process.exit(fail ? 1 : 0);
