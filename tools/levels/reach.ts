// Rough reachability check for every room: which one-way platforms, chai and tapes can't be reached from the spawn
// with plain jumps (3-tile rise) or with a tag hop (4-tile rise)? Ignores ceilings and powers, so it's a heuristic:
// "unreachable" means "needs a power (pen, paint, double jump…) or is a bug".
// Run: bun tools/levels/reach.ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLevel } from '../../apps/game/src/game/world/level';

const DIR = join(import.meta.dir, '../../content/levels');
const SOLID = new Set(['#', '=', 'D', 'G', 'Q', 'W', 'K', '1', 'T']); // things you can stand on (closed doors/gates count)
const BLOCK = new Set(['#', 'D', 'G', 'Q', '1']);                      // things you can't stand inside

function reach(grid: string[], rise: number) {
  const H = grid.length, W = grid[0]!.length;
  const at = (x: number, y: number) => (y < 0 || y >= H || x < 0 || x >= W ? '#' : grid[y]![x]!);
  const stand = (x: number, y: number) => !BLOCK.has(at(x, y)) && at(x, y) !== '=' && !BLOCK.has(at(x, y - 1)) && SOLID.has(at(x, y + 1));
  const start = grid.flatMap((r, y) => [...r].map((c, x) => (c === 'P' ? [x, y] : null))).find(Boolean) as [number, number];
  const seen = new Set<string>(); const q: [number, number][] = [];
  const push = (x: number, y: number) => { const k = `${x},${y}`; if (!seen.has(k) && stand(x, y)) { seen.add(k); q.push([x, y]); } };
  // let the spawn settle onto the floor
  let [sx, sy] = start; while (!stand(sx, sy) && sy < H) sy++;
  push(sx, sy);
  while (q.length) {
    const [x, y] = q.shift()!;
    for (let dx = -5; dx <= 5; dx++) for (let y2 = y - rise; y2 < H; y2++) {
      if (y2 > y && Math.abs(dx) > 5 + (y2 - y)) continue;
      push(x + dx, y2);
    }
    for (let y2 = y + 1; y2 < H; y2++) for (let dx = -8; dx <= 8; dx++) push(x + dx, y2); // falls
  }
  return seen;
}

let issues = 0;
for (const f of readdirSync(DIR).filter(f => f.endsWith('.txt')).sort()) {
  const lvl = parseLevel(readFileSync(join(DIR, f), 'utf8'));
  if (lvl.boss) continue; // arenas: platforms are optional cover
  const plain = reach(lvl.grid, 3), hop = reach(lvl.grid, 4);
  const near = (s: Set<string>, tx: number, ty: number, up: number) => {
    for (let dy = 0; dy <= up; dy++) for (let dx = -2; dx <= 2; dx++) if (s.has(`${tx + dx},${ty + dy}`)) return true;
    return false;
  };
  const out: string[] = [];
  lvl.grid.forEach((row, y) => [...row].forEach((c, x) => {
    if (c === 'h' && !near(plain, x, y, 3)) out.push(`chai ${x},${y}${near(hop, x, y, 4) ? ' (tag hop only)' : ' UNREACHABLE'}`);
  }));
  for (const t of lvl.tapes) if (!near(plain, t.tx, t.ty, 5)) out.push(`tape ${t.id} ${t.tx},${t.ty}${near(hop, t.tx, t.ty, 6) ? ' (tag hop)' : ' (needs a power)'}`);
  if (out.length) { issues += out.filter(o => o.includes('UNREACHABLE')).length; console.log(`${f}: ${out.join(' · ')}`); }
}
console.log(issues ? `\n${issues} chai unreachable without a power` : '\nall chai reachable');
