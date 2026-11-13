// Generates content/levels/ep0-greybox.txt (a greybox test level for the systems).
// Run: bun tools/levels/ep0-greybox.ts
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const W = 120, H = 18;
const g: string[][] = Array.from({ length: H }, () => Array(W).fill('.'));
const set = (x: number, y: number, c: string) => { if (x >= 0 && x < W && y >= 0 && y < H) g[y]![x] = c; };
const fill = (x0: number, y0: number, x1: number, y1: number, c: string) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); };

fill(0, 0, W - 1, 0, '#');            // ceiling
fill(0, 0, 0, H - 1, '#'); fill(W - 1, 0, W - 1, H - 1, '#'); // walls
fill(0, 15, W - 1, 17, '#');          // ground
fill(30, 15, 35, 16, '.'); fill(30, 17, 35, 17, '^');  // spike pit
fill(31, 12, 34, 12, '=');            // platform over the pit
fill(50, 1, 50, 12, '#'); set(50, 14, 'D'); set(45, 14, 'T'); // wall, door, terminal
fill(60, 11, 64, 11, '='); fill(66, 8, 70, 8, '=');
fill(96, 12, 100, 14, '#');           // 3-tile ledge (Sayam can't make this jump)
set(3, 14, 'P');
set(18, 14, 'i'); set(24, 14, 'i');
set(38, 14, 'C'); set(72, 14, 'C'); set(102, 11, 'C');
set(58, 9, 'd'); set(64, 7, 'd');
set(80, 14, 'm'); set(85, 14, 'm'); set(90, 14, 'm');
set(115, 14, 'X');

const header = [
  '@name EP0 Greybox',
  '@episode 0',
  '@tileset hq',
  '@dialogue ep0-cold-open',
  '@hint 4 12 A/D move. SPACE jump. J attack. K ability.',
  '@hint 14 12 1/2/3 or Q/E swaps crew. Swap mid-air!',
  '@hint 20 10 Too many interns? Sayam: BRIBE (K).',
  '@hint 43 12 Locked. Ashwath can HACK (K) the terminal.',
  '@hint 77 12 Monkeys. Tushar: CUT! freezes everything.',
  '@hint 93 10 Sayam can\'t jump that. Delegate: swap.',
  '; legend: # solid  = one-way  ^ hazard  D door  T terminal  P spawn  C checkpoint  X exit',
  ';         i stock-intern  d reply-all-drone  m infinite-monkey',
];
writeFileSync(join(import.meta.dir, '../../content/levels/ep0-greybox.txt'), [...header, ...g.map(r => r.join(''))].join('\n') + '\n');
console.log('wrote content/levels/ep0-greybox.txt');
