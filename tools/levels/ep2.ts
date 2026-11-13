// Generates the Episode 2 rooms (The Set) from Gemini's shot list (docs/narrative/ep2-rooms.md).
// Run: bun tools/levels/ep2.ts
import { Room } from './room';

const common = (r: Room, name: string, next: string | null) => {
  r.m(`@name ${name}`).m('@episode 2').m('@tileset the-set').m('@backdrop the-set');
  if (next) r.m(`@next ${next}`);
  return r;
};

// ---------- 01 · The Green Screen Void: solo warm-up brawl ----------
{
  const r = common(new Room('ep2', 'ep2-r01', 64), 'EP2 · 01 · Soundstage 01: The Green Screen Void', 'ep2-r02');
  const f = r.floor;
  r.m('@party tushar').m('@dialogue ep2-intro');
  r.m('@sign 4 4 PRODUCE CONTENT. SMILE FOREVER.').m('@sign 36 3 MISSING TRACKING MARKERS');
  r.set(3, f, 'P');
  r.set(16, f, 'i').set(22, f, 'i').set(28, f, 'i');
  r.fill(32, f - 3, 37, f - 3, '=').set(34, f - 6, 'd');
  r.set(42, f, 'b').set(47, f - 1, 'h');
  r.set(52, f, 'i').set(56, f, 'i');
  r.set(61, f, 'X');
  r.write();
}

// ---------- 02 · The Prop Warehouse: the designers join; PEN TOOL across the chasm ----------
{
  const r = common(new Room('ep2', 'ep2-r02', 70), 'EP2 · 02 · The Prop Warehouse', 'ep2-r03');
  const f = r.floor;
  r.m('@join mansukh,manya ep2-designers-join').m('@npc 26 13 mansukh').m('@npc 29 13 manya');
  r.m('@sign 4 4 ASPECT RATIO 16:9 — DO NOT DISTORT').m('@sign 40 3 PRACTICAL EFFECTS (OBSOLETE)');
  r.m(`@hint 6 ${f - 5} Free the designers from the client drones.`).m(`@hint 33 ${f - 6} Too wide to jump. Mansukh: PEN TOOL (K) a bridge.`);
  r.set(3, f, 'P').set(8, f, 'C');
  r.set(14, f - 4, 'd').set(19, f - 5, 'd').set(22, f, 'i');
  // the chasm: 8 tiles (128px). A pen line is 6 tiles; nobody jumps 128px.
  r.fill(38, f + 1, 45, r.H - 2, '.').fill(38, r.H - 1, 45, r.H - 1, '^');
  r.set(50, f, 'C').set(56, f, 'b');
  r.set(67, f, 'X');
  r.write();
}

// ---------- 03 · The Lighting Grid: colour blocks (red solid · blue through · yellow bouncy) ----------
{
  const r = common(new Room('ep2', 'ep2-r03', 70), 'EP2 · 03 · The Lighting Grid', 'ep2-r04');
  const f = r.floor;
  r.m('@sign 2 3 Red = Solid | Blue = Walk-Through | Yellow = Bouncy').m('@sign 44 3 SATURATION IS FREEDOM');
  r.m(`@hint 4 ${f - 6} Manya: FILL (K) repaints the whole block group.`);
  r.set(3, f, 'P');
  // 1) a red wall: paint it blue and walk through
  r.fill(14, 1, 15, f - 4, '#').fill(14, f - 3, 15, f, '1');
  r.set(19, f, 'C');
  // 2) a 5-tile ledge: paint the block yellow (red → blue → yellow) and bounce up
  r.fill(30, f - 4, 40, r.H - 1, '#').set(27, f, '1');
  r.set(36, f - 5, 'i');
  // 3) the missing bridge: blue blocks over a pit (paint them solid)
  r.fill(41, f + 1, 50, r.H - 2, '.').fill(41, r.H - 1, 50, r.H - 1, '^').fill(41, f - 4, 50, f - 4, '2');
  r.fill(51, f - 4, 56, r.H - 1, '#').fill(57, f - 1, 58, r.H - 1, '#');
  r.set(54, f - 5, 'C');
  r.set(63, f, 'p').set(67, f, 'X');
  r.write();
}

// ---------- 04 · The Chroma Key Dressing Rooms: mirrors spawn interns; pen + paint together ----------
{
  const r = common(new Room('ep2', 'ep2-r04', 80), 'EP2 · 04 · The Chroma Key Dressing Rooms', 'ep2-r05');
  const f = r.floor;
  r.m('@sign 4 4 WARDROBE: BUSINESS CASUAL ONLY').m('@sign 42 4 MAKE THE LOGO BIGGER');
  r.m(`@hint 6 ${f - 5} Mirrors keep spawning interns. Smash them.`);
  r.set(3, f, 'P');
  r.set(12, f, 'M').set(30, f, 'M');
  r.fill(20, 1, 21, f - 3, '#').fill(20, f - 2, 21, f, '1');           // painted wall
  r.fill(34, f + 1, 41, r.H - 2, '.').fill(34, r.H - 1, 41, r.H - 1, '^'); // pen gap
  r.set(46, f, 'C');
  r.set(54, f, 'M');
  r.fill(60, 1, 61, f - 3, '#').fill(60, f - 2, 61, f, '1');
  r.set(66, f - 4, 'p').set(70, f, 'b').set(73, f - 1, 'h');
  r.set(77, f, 'X');
  r.write();
}

// ---------- 05 · The Backlot Street Set: crane booms (CUT!), collapsing facades, pen gaps ----------
{
  const r = common(new Room('ep2', 'ep2-r05', 88), 'EP2 · 05 · The Backlot Street Set', 'ep2-r06');
  const f = r.floor;
  r.m('@sign 4 4 QUIET ON SET — AI GENERATING SCENE').m('@sign 46 3 BEIGE BANK');
  r.m(`@hint 6 ${f - 6} Crane booms swing low. CUT! freezes them.`);
  r.set(3, f, 'P');
  for (const x of [14, 22, 30]) r.set(x, 8, 'O');
  r.set(36, f, 'C');
  r.fill(40, f + 1, 56, r.H - 2, '.').fill(40, r.H - 1, 56, r.H - 1, '^');
  for (const x of [41, 46, 51]) r.set(x, f - 1, 'W');                  // collapsing facades (rewind or rush)
  r.set(60, f, 'i').set(64, 8, 'O').set(70, f, 'i');
  r.fill(74, f + 1, 81, r.H - 2, '.').fill(74, r.H - 1, 81, r.H - 1, '^');  // pen gap
  r.set(85, f, 'X');
  r.write();
}

// ---------- 06 · Soundstage 04: The Seamless Horizon (waves) ----------
{
  const r = common(new Room('ep2', 'ep2-r06', 52), 'EP2 · 06 · Soundstage 04: The Seamless Horizon', 'ep2-r07');
  const f = r.floor;
  r.m('@sign 4 4 Recolored enemies take bonus damage!').m('@sign 22 2 #FFFFFF — PURITY DETECTED');
  r.set(4, f, 'P');
  r.fill(10, f - 4, 15, f - 4, '=').fill(30, f - 4, 35, f - 4, '=');
  r.fill(44, 1, 44, f - 2, '#').set(44, f, 'Q');
  r.set(40, f, 'h').set(49, f, 'X');
  r.m(`@wave 1 18 ${f} i`).m(`@wave 1 24 ${f} i`).m(`@wave 1 30 ${f} i`);
  r.m(`@wave 2 16 ${f} b`).m(`@wave 2 32 ${f} b`).m(`@wave 2 24 ${f - 6} p`);
  r.m(`@wave 3 14 ${f} b`).m(`@wave 3 22 ${f} i`).m(`@wave 3 28 ${f} i`).m(`@wave 3 34 ${f} b`).m(`@wave 3 20 ${f - 7} p`).m(`@wave 3 32 ${f - 7} p`);
  r.write();
}

// ---------- 07 · The Suburban Studio Set: the Stock Photo Family ----------
{
  const r = common(new Room('ep2', 'ep2-r07', 44), 'EP2 · 07 · The Suburban Studio Set', null);
  const f = r.floor;
  r.m('@boss stock-photo-family ep2-boss-intro ep2-boss-outro').m('@music ep2');
  r.m('@sign 14 2 APPROVED AUTHENTIC FAMILY UNIT #812');
  r.set(4, f, 'P');
  r.fill(3, f - 3, 9, f - 3, '=').fill(34, f - 3, 40, f - 3, '=').fill(18, f - 6, 25, f - 6, '=');
  r.set(28, f - 4, 'B');
  r.set(14, f, 'h').set(30, f, 'h');
  r.write();
}
