// Generates the Episode 1 rooms (Render Farm) from Gemini's shot list (docs/narrative/ep1-rooms.md).
// Run: bun tools/levels/ep1.ts
import { Room } from './room';

const common = (r: Room, name: string, next: string | null) => {
  r.m(`@name ${name}`).m('@episode 1').m('@tileset render-farm').m('@backdrop render-farm');
  if (next) r.m(`@next ${next}`);
  return r;
};

// ---------- 01 · Cooling Conduit Entrance: steam vents (time them, or CUT! them) ----------
{
  const r = common(new Room('ep1', 'ep1-r01', 70), 'EP1 · 01 · The Cooling Conduit Entrance', 'ep1-r02');
  const f = r.floor;
  r.m('@party ashwath,tushar').m('@dialogue ep1-intro').m('@trigger 30 1 3 13 ep1-r01-melted-rack');
  r.m('@sign 4 4 AMBIENT TEMP: 94°C — DO NOT INHALE').m('@sign 30 3 THERMAL STABILITY: OPTIMAL').m('@sign 52 5 NEVER MERGE TO PROD');
  r.m(`@hint 9 ${f - 5} Boiling vents: Dodge the timing or CUT! (K).`);
  r.set(3, f, 'P');
  for (const x of [15, 19, 23]) r.set(x, f, 'V');
  r.m(`@tape 19 ${f - 4} ep1-1`);                                          // right over the middle vent
  r.fill(27, f - 3, 30, f - 3, '=').set(36, f, 'b');
  r.set(42, f, 'C');
  for (const x of [48, 51, 54]) r.set(x, f, 'V');
  r.fill(47, f - 4, 55, f - 4, '=').set(51, f - 5, 'd');
  r.set(60, f, 'i').set(64, f - 1, 'h');
  r.set(67, f, 'X');
  r.write();
}

// ---------- 02 · Collapsing Server Alley: catwalks crumble under you; keep moving ----------
{
  const r = common(new Room('ep1', 'ep1-r02', 76), 'EP1 · 02 · The Collapsing Server Alley', 'ep1-r03');
  const f = r.floor;
  r.m('@trigger 12 1 3 13 ep1-r02-slowmo-collapse');
  r.m('@sign 5 4 RENDER AT 99% FOREVER').m('@sign 60 4 FATAL KERNEL PANIC');
  r.m(`@hint 6 ${f - 5} Catwalks crumble like staging. Keep running!`);
  r.set(3, f, 'P');
  r.fill(15, f + 1, 58, r.H - 2, '.').fill(15, r.H - 1, 58, r.H - 1, '^');
  for (let x = 16; x <= 54; x += 5) r.set(x, f - 1, 'W');
  r.set(28, f - 6, 'd').set(44, f - 7, 'p');
  r.set(62, f, 'C');
  r.set(66, f, 'T').set(70, f, 'L');
  r.set(73, f, 'X');
  r.write();
}

// ---------- 03 · The Timeline Bay: Sehaj joins; CTRL+Z rebuilds what breaks ----------
{
  const r = common(new Room('ep1', 'ep1-r03', 64), 'EP1 · 03 · The Timeline Bay', 'ep1-r04');
  const f = r.floor;
  r.m('@join sehaj ep1-sehaj-joins').m('@npc 30 13 sehaj');
  r.m('@sign 22 3 EXPORTING TRAILER_FINAL_v4_REAL.mp4 — 99.8%').m('@sign 4 4 DO NOT TOUCH MY SCRATCH DISK').m('@sign 50 4 VAJJJ!');
  r.m(`@hint 6 ${f - 5} Clear the mob! Don't ruin Sehaj's render!`).m(`@hint 40 ${f - 6} Sehaj: CTRL+Z (K) rewinds broken platforms!`);
  r.set(3, f, 'P').set(8, f, 'C');
  r.set(16, f, 'i').set(22, f, 'm').set(25, f, 'm').set(36, f, 'i');
  // the gap you rebuild your way across
  r.fill(42, f + 1, 55, r.H - 2, '.').fill(42, r.H - 1, 55, r.H - 1, '^');
  for (const x of [43, 48, 53]) r.set(x, f - 1, 'W');
  r.set(60, f, 'X');
  r.write();
}

// ---------- 04 · Overclocked Turbine Trench: wind pushes you back toward the fence; CUT! the turbines ----------
{
  const r = common(new Room('ep1', 'ep1-r04', 84), 'EP1 · 04 · The Overclocked Turbine Trench', 'ep1-r05');
  const f = r.floor;
  r.m('@trigger 14 1 3 13 ep1-r04-turbine-interns');
  r.m('@sign 6 4 WIND VELOCITY: MAXIMUM RPM').m('@sign 44 3 STANDARDIZE YOUR SOUL');
  r.m(`@hint 6 ${f - 6} Hurricane wind! Tushar: CUT (K) freezes fans.`);
  r.set(1, f, 'L');                                      // the electrified fence behind you (always on)
  r.set(5, f, 'P').set(9, f, 'C').set(12, f, 's');
  r.set(40, f - 1, '<');
  r.set(18, f, 'i').set(26, f, 'i');
  r.fill(44, f + 1, 64, r.H - 2, '.').fill(44, r.H - 1, 64, r.H - 1, '^');
  for (const x of [45, 50, 55, 60]) r.set(x, f - 1, 'W');
  r.m(`@tape 61 ${f - 5} ep1-3`);
  r.set(78, f - 1, '<');
  r.set(68, f, 'C').set(72, f, 'b');
  r.set(81, f, 'X');
  r.write();
}

// ---------- 05 · Cache Overflow Chamber: vertical; blocks dissolve after you land ----------
{
  const r = common(new Room('ep1', 'ep1-r05', 30, 44), 'EP1 · 05 · The Cache Overflow Chamber', 'ep1-r06');
  const f = r.floor;
  r.m(`@trigger 1 ${f - 4} 28 5 ep1-r05-cache-disk`);
  r.m(`@sign 16 ${f - 3} SCRATCH DISK FULL: 0 BYTES`).m('@sign 3 17 VAJJJ! REWIND NOW');
  r.m(`@hint 4 ${f - 6} Cache blocks dissolve in 2s! Don't loiter!`);
  r.set(4, f, 'P').set(7, f, 'C');
  // staircase of cache blocks, zig-zagging up
  const steps: [number, number][] = [[10, f - 2], [14, f - 4], [18, f - 6], [22, f - 8], [18, f - 10], [14, f - 12], [10, f - 14], [6, f - 16], [10, f - 18], [14, f - 20], [18, f - 22], [22, f - 24], [18, f - 26]];
  for (const [x, y] of steps) r.fill(x, y, x + 1, y, 'K');
  r.fill(2, f - 15, 5, f - 15, '=').set(3, f - 16, 'C');
  r.fill(25, f - 8, 27, f - 8, '=').m(`@tape 27 ${f - 9} ep1-2`);       // a side ledge off a dissolving block      // a rest ledge with a checkpoint
  r.set(24, f - 13, 'd').set(5, f - 21, 'p');
  const top = 10;
  r.fill(1, top + 1, 28, top + 1, '#').fill(14, top + 1, 20, top + 1, '=');
  r.fill(23, 1, 23, top - 2, '#').set(23, top, 'G');
  r.set(8, top, 'h').set(26, top, 'X');
  r.fill(5, 1, 5, top - 2, '#').set(5, top, 'Z').set(2, top, 'h').m(`@hint 3 ${top - 4} Cracked wall? Sehaj: HOLD J = BEAST MODE!`).m(`@sign 1 ${top - 2} HOME GYM`);   // secret gym nook
  r.m(`@npc 12 ${top} sysadmin-karan`);
  r.write();
}

// ---------- 06 · The 99% Gateway: three waves force-quit the background process ----------
{
  const r = common(new Room('ep1', 'ep1-r06', 52), 'EP1 · 06 · The 99% Gateway', 'ep1-r07');
  const f = r.floor;
  r.m('@dialogue ep1-r06-door-stuck').m('@join manvi ep1-manvi-joins').m(`@npc 47 ${f} manvi`);   // Manvi is stuck behind the wave door
  r.m('@sign 16 2 AUTHENTICATING… 99%').m('@sign 3 5 Swap often to let abilities recharge!').m('@sign 30 5 QUBLOX NEVER QUITS');
  r.set(4, f, 'P');
  r.fill(10, f - 4, 15, f - 4, '=').fill(30, f - 4, 35, f - 4, '=').fill(20, f - 7, 25, f - 7, '=');
  r.fill(44, 1, 44, f - 2, '#').set(44, f, 'Q');
  r.set(40, f, 'h');
  r.set(49, f, 'X');
  r.m(`@wave 1 18 ${f} i`).m(`@wave 1 28 ${f} i`).m(`@wave 1 22 ${f - 6} d`);
  r.m(`@wave 2 14 ${f} b`).m(`@wave 2 34 ${f} b`).m(`@wave 2 12 ${f - 6} p`).m(`@wave 2 32 ${f - 6} p`);
  r.m(`@wave 3 16 ${f} m`).m(`@wave 3 20 ${f} m`).m(`@wave 3 26 ${f} i`).m(`@wave 3 30 ${f} b`).m(`@wave 3 22 ${f - 9} d`).m(`@wave 3 36 ${f - 6} d`);
  r.write();
}

// ---------- 07 · The Mainframe Core: the Buffering Wheel ----------
{
  const r = common(new Room('ep1', 'ep1-r07', 40), 'EP1 · 07 · The Mainframe Core', null);
  const f = r.floor;
  r.m('@boss buffering-wheel ep1-boss-intro ep1-boss-outro').m('@music ep1');
  r.m('@sign 13 2 BUFFER UNDERFLOW — 0 FPS');
  r.set(4, f, 'P');
  r.set(2, f, 'T').set(37, f, 'T');                         // cooling pylons: HACK to expose the core
  r.fill(6, f - 4, 11, f - 4, '=').fill(28, f - 4, 33, f - 4, '=').fill(16, f - 8, 23, f - 8, '=');
  r.set(20, 5, 'B');
  r.set(12, f, 'h').set(27, f, 'h');
  r.write();
}
