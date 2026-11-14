// Generates the Episode 3 rooms (The Feed) from Gemini's shot list (docs/narrative/ep3-rooms.md).
// Party = 2 picked + Brahmansh (joins in room 3). Rules: climbs use 2-row (32px) steps so even Sayam can make them;
// anything that needs a specific power after room 3 needs Brahmansh (the only guaranteed member).
// Run: bun tools/levels/ep3.ts
import { Room } from './room';

const common = (r: Room, name: string, next: string | null) => {
  r.m(`@name ${name}`).m('@episode 3').m('@tileset the-feed').m('@backdrop the-feed').m('@popups-spawn m');
  if (next) r.m(`@next ${next}`);
  return r;
};
/** Zig-zag one-way platforms up a shaft, every `gap` rows, from `fromY` up to `toY`. */
const zigzag = (r: Room, fromY: number, toY: number, gap: number, left: [number, number], right: [number, number]) => {
  let i = 0;
  for (let y = fromY; y >= toY; y -= gap, i++) { const [a, b] = i % 2 === 0 ? left : right; r.fill(a, y, b, y, '='); }
};

// ---------- 01 · The Scroll Base: climbing basics, repost monkeys ----------
{
  const r = common(new Room('ep3', 'ep3-r01', 40, 30), 'EP3 · 01 · The Scroll Base', 'ep3-r02');
  const f = r.floor;
  r.m('@party ashwath,sehaj').m('@dialogue ep3-intro').m(`@trigger 1 ${f - 4} 38 5 ep3-r01-repost-monkeys`);
  r.m(`@sign 14 ${f - 2} INFINITE SCROLL ENGAGED — KEEP SCROLLING`).m('@sign 3 4 TRENDING: BEIGE IS THE NEW NEON (PROMOTED)');
  r.set(4, f, 'P').set(8, f, 'C');
  zigzag(r, f - 2, 6, 2, [6, 18], [21, 33]);
  r.m(`@tape 35 ${f - 6} ep3-1`);                                          // jump off the right end of a platform
  r.set(12, f - 4, 'm').set(27, f - 6, 'm').set(14, f - 10, 'm').set(25, f - 14, 'p');
  r.fill(1, 5, 38, 5, '#').fill(17, 5, 22, 5, '=');
  r.set(34, 4, 'X').set(6, 4, 'h');
  r.write();
}

// ---------- 02 · The Trending Elevator: the scroll rises; keep climbing ----------
{
  const r = common(new Room('ep3', 'ep3-r02', 30, 64), 'EP3 · 02 · The Trending Elevator', 'ep3-r03');
  const f = r.floor;
  r.m('@scroll 22 3500').m(`@trigger 1 ${f - 4} 28 5 ep3-r02-infinite-scroll`);
  r.m(`@sign 9 ${f - 3} FALL HAZARD: ALGORITHMIC PURGE`).m('@sign 3 20 YOU WON\'T BELIEVE WHAT HAPPENS NEXT');
  r.m(`@hint 3 ${f - 6} Infinite scroll is ascending! RUN OR GET PURGED!`);
  r.set(4, f, 'P');
  zigzag(r, f - 2, 6, 2, [3, 14], [15, 26]);
  r.set(20, f - 12, 'p').set(8, f - 24, 'p').set(20, f - 36, 'p').set(10, f - 46, 'p');
  r.fill(1, 5, 28, 5, '#').fill(12, 5, 17, 5, '=');
  r.set(26, 4, 'X');
  r.write();
}

// ---------- 03 · The Paywall Firewall: Brahmansh joins; JUMP CUT through paywalls ----------
{
  const r = common(new Room('ep3', 'ep3-r03', 64), 'EP3 · 03 · The Paywall Firewall', 'ep3-r04');
  const f = r.floor;
  r.m('@join brahmansh ep3-brahmansh-joins').m('@npc 30 13 brahmansh');
  r.m('@sign 20 3 PAYWALL: SUBSCRIBE FOR 99.99/MO TO PASS').m('@sign 46 4 P-A-C-I-N-G IS EVERYTHING');
  r.m(`@hint 4 ${f - 5} Clear the mob! A rogue editor waits past paywall.`).m(`@hint 33 ${f - 6} Titanium paywall? Brahmansh: JUMP CUT (K) past!`);
  r.set(3, f, 'P').set(7, f, 'C');
  r.set(12, f, 'i').set(16, f - 4, 'd').set(20, f, 'm');
  r.set(26, f, 'L');                         // Brahmansh is behind this one; he cuts through to you
  r.set(36, f, 'L').set(44, f, 'i').set(48, f, 'L');
  r.set(53, f, 'C').set(57, f - 1, 'h').m(`@tape 55 ${f - 5} ep3-2`);
  r.set(61, f, 'X');
  r.write();
}

// ---------- 04 · The Echo Chamber: shockwave rings and agreeing drones ----------
{
  const r = common(new Room('ep3', 'ep3-r04', 60), 'EP3 · 04 · The Echo Chamber', 'ep3-r05');
  const f = r.floor;
  r.m('@trigger 10 1 3 13 ep3-r04-echo-drones').m(`@npc 7 ${f} influencer-roxy`);
  r.m('@sign 4 4 CONSENSUS DETECTED').m('@sign 30 3 NO DISSENTING OPINIONS PERMITTED');
  r.m(`@hint 4 ${f - 6} Echo sonic rings push you. Jump Cut through!`);
  r.set(3, f, 'P');
  r.set(15, f, 'E').set(30, f, 'E').set(45, f, 'E');
  r.fill(19, f - 4, 25, f - 4, '=').fill(34, f - 4, 40, f - 4, '=');
  r.set(22, f - 7, 'd').set(37, f - 8, 'd').set(28, f - 5, 'd');
  r.set(51, f, 'C').set(53, f - 1, 'h');
  r.set(57, f, 'X');
  r.write();
}

// ---------- 05 · The Autoplay Spiral: pop-ups, wide gaps (double jump / pen), a toll you can cut through ----------
{
  const r = common(new Room('ep3', 'ep3-r05', 96), 'EP3 · 05 · The Autoplay Spiral', 'ep3-r06');
  const f = r.floor;
  r.m('@trigger 12 1 3 13 ep3-r05-fake-close-btn');
  r.m('@sign 4 4 [X] CLOSE (SPAWNS 4 MONKEYS)').m('@sign 50 3 SKIP AD IN 5... 4... 3... (NEVER)');
  r.m(`@hint 4 ${f - 6} Close buttons are traps! JUMP CUT (K) to skip ad!`);
  r.set(3, f, 'P');
  r.set(14, f - 3, 'p').set(22, f - 5, 'p');
  r.fill(28, f + 1, 33, r.H - 2, '.').fill(28, r.H - 1, 33, r.H - 1, '^');      // 6-tile gap: double jump or pen
  r.set(38, f, 'C').set(36, f, 's');
  for (const x of [44, 49, 54]) r.set(x, f - 1, 'W');
  r.fill(43, f + 1, 57, r.H - 2, '.').fill(43, r.H - 1, 57, r.H - 1, '^');
  r.set(62, f - 4, 'p').set(66, f, 'i');
  r.fill(72, 1, 72, f - 2, '#').set(72, f, 'G');                                   // toll: SMOOTH TALK, or JUMP CUT past it
  r.fill(77, f + 1, 82, r.H - 2, '.').fill(77, r.H - 1, 82, r.H - 1, '^');
  r.set(86, f, 'p').set(90, f - 1, 'h');
  r.set(93, f, 'X');
  r.write();
}

// ---------- 06 · The Rage-Bait Refinery: mortars + waves ----------
{
  const r = common(new Room('ep3', 'ep3-r06', 56), 'EP3 · 06 · The Rage-Bait Refinery', 'ep3-r07');
  const f = r.floor;
  r.m('@trigger 6 1 3 13 ep3-r06-rage-refinery');
  r.m('@sign 4 4 Chain jump cuts to maintain MAXIMALIST STYLE!').m('@sign 26 3 OUTRAGE GENERATION AT 100% EFFICIENCY');
  r.set(3, f, 'P');
  for (const x of [14, 22, 30, 38]) r.set(x, 1, '!');
  r.fill(16, f - 4, 21, f - 4, '=').fill(31, f - 4, 36, f - 4, '=');
  r.m(`@tape 26 ${f - 5} ep3-3`);
  r.fill(46, 1, 46, f - 2, '#').set(46, f, 'Q');
  r.set(42, f, 'h').set(52, f, 'X');
  r.m(`@wave 1 18 ${f} m`).m(`@wave 1 24 ${f} m`).m(`@wave 1 30 ${f} i`).m(`@wave 1 20 ${f - 6} p`);
  r.m(`@wave 2 14 ${f} b`).m(`@wave 2 34 ${f} b`).m(`@wave 2 24 ${f - 7} d`).m(`@wave 2 28 ${f} m`).m(`@wave 2 22 ${f} m`);
  r.write();
}

// ---------- 07 · The Algorithmic Nexus: The Algorithm ----------
{
  const r = common(new Room('ep3', 'ep3-r07', 44), 'EP3 · 07 · The Algorithmic Nexus', null);
  const f = r.floor;
  r.m('@boss the-algorithm ep3-boss-intro ep3-boss-outro').m('@music ep3');
  r.m('@sign 14 2 ENGAGEMENT: CRITICAL OVERLOAD');
  r.set(4, f, 'P');
  r.fill(5, f - 4, 10, f - 4, '=').fill(33, f - 4, 38, f - 4, '=');
  r.set(30, f - 2, 'B');
  r.set(14, f, 'h').set(29, f, 'h');
  r.write();
}
