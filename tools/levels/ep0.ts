// Generates the Episode 0 rooms (content/levels/ep0-r0*.txt) from Gemini's shot list (docs/narrative/ep0-rooms.md).
// Run: bun tools/levels/ep0.ts      (the .txt files are the source of truth the game reads; edit them freely after)
import { Room } from './room';

const common = (r: Room, name: string, next: string | null) => {
  r.m(`@name ${name}`).m('@episode 0').m('@tileset hq');
  if (next) r.m(`@next ${next}`);
  return r;
};

// ---------- 01 · The Penthouse Studio: move, jump, attack, cash toss ----------
{
  const r = common(new Room('ep0', 'ep0-r01', 64), 'EP0 · 01 · The Penthouse Studio', 'ep0-r02');
  const f = r.floor;
  r.m('@party ashwath,sayam').m('@dialogue ep0-cold-open');
  r.m('@sign 4 4 DELIVERY: 9:00 AM — EXPORT HANGING').m('@sign 30 3 HOTFIX #992 — DO NOT TOUCH');
  r.m(`@hint 3 ${f - 3} A/D walk · SPACE leap · J mechanical slap`).m(`@hint 19 ${f - 6} K = job superpower · 1/2 swap active crew`).m(`@hint 40 ${f - 4} Sayam hurls cash. LE RE! Keep the change.`);
  r.set(3, f, 'P').pin('decor-trophy', 8);                               // Ashwath's real first-place hackathon cup
  r.fill(14, f - 2, 17, f - 2, '=');
  r.fill(24, f - 1, 27, f, '#').set(25, f - 2, 'h');
  r.fill(19, f - 4, 22, f - 4, '=').m(`@tape 20 ${f - 5} ep0-1`);          // secret ledge off the cubicle block
  r.set(34, f, 'i').set(44, f, 'i');
  r.fill(49, f - 3, 53, f - 3, '=').set(51, f - 4, 'd');
  r.set(60, f, 'X');
  r.write();
}

// ---------- 02 · The Bleaching Corridor: HACK (laser + shutter door) ----------
{
  const r = common(new Room('ep0', 'ep0-r02', 72), 'EP0 · 02 · The Bleaching Corridor', 'ep0-r03');
  const f = r.floor;
  r.m('@trigger 9 1 3 13 ep0-r02-blob');
  r.m('@sign 3 4 MAXIMALIST OR DIE').m('@sign 34 4 Press 1/2/3 to swap crew members instantly!');
  r.m(`@hint 19 ${f - 5} Deadly lasers? Ashwath: Sudo hack terminal (K)!`);
  r.set(3, f, 'P');
  r.set(16, f, 'b');
  r.set(23, f, 'T').set(29, f, 'L');
  r.set(34, f, 'C');
  r.fill(38, f - 2, 42, f - 2, '=').set(40, f - 6, 'd');
  r.fill(50, 1, 50, f - 2, '#').set(50, f, 'D').set(45, f, 'T');
  r.set(57, f, 'i').set(62, f - 4, 'd');
  r.set(69, f, 'X');
  r.write();
}

// ---------- 03 · The Executive Turnstile: BRIBE ----------
{
  const r = common(new Room('ep0', 'ep0-r03', 64), 'EP0 · 03 · The Executive Turnstile', 'ep0-r04');
  const f = r.floor;
  r.m('@trigger 24 1 3 13 ep0-r03-turnstile');
  r.m('@sign 28 3 TOLL: 50,000 CR — NO CHECKS').m('@sign 6 4 VENDING: STALE CHIPS 2,000 CR').m('@sign 40 6 SAYAM PAYS CASH');
  r.m(`@hint 26 ${f - 5} Capital gate? Sayam: Bribe (K) the sensor!`);
  r.set(3, f, 'P');
  r.set(12, f - 5, 'd').set(20, f - 4, 'd');
  r.fill(34, 1, 34, f - 2, '#').set(34, f, 'G');
  r.set(30, f, 'C').set(26, f, 's');
  r.set(42, f, 'i').set(47, f, 'i').set(52, f, 'i');
  r.set(56, f - 1, 'h');
  r.set(61, f, 'X');
  r.write();
}

// ---------- 04 · The Maglev Balcony: the gap (swap mid-jump; Sayam can't make it alone) ----------
{
  const r = common(new Room('ep0', 'ep0-r04', 76), 'EP0 · 04 · The 3rd-Floor Maglev Balcony', 'ep0-r05');
  const f = r.floor;
  r.m('@npc 8 13 chacha-chai').m('@npc 66 13 pixel-cat');
  r.m('@trigger 15 1 3 13 ep0-r04-balcony');
  r.m('@sign 4 5 CUTTING CHAI 50 CR — NO BEIGE DRINKS');
  r.m(`@hint 19 ${f - 6} CEO legs can't jump that. Swap mid-flight!`);
  r.set(3, f, 'P').set(11, f, 'h').m(`@npc 15 ${f} telescope`);   // Ashwath's cosmic-existentialist secret
  // the drop: open floor, sparking cables at the bottom
  // platforms: 4-tile gaps = 64px. Ashwath/Tushar clear ~70-79px, Sayam only ~60px.
  r.fill(20, f + 1, 49, r.H - 2, '.').fill(20, r.H - 1, 49, r.H - 1, '^');
  for (const x of [23, 30, 37, 44]) r.fill(x, f - 1, x + 2, f - 1, '=');
  r.set(28, f - 5, 'p').set(43, f - 6, 'p');
  r.m(`@tape 34 ${f - 4} ep0-2`);                                         // mid-air over the drop
  r.set(58, f, 'C');
  r.set(73, f, 'X');
  r.write();
}

// ---------- 05 · The Basement Gear Cage: monkeys; Tushar joins ----------
{
  const r = common(new Room('ep0', 'ep0-r05', 64), 'EP0 · 05 · The Basement Gear Cage', 'ep0-r06');
  const f = r.floor;
  r.m('@join tushar ep0-tushar-joins');
  r.m('@sign 4 4 BAN ALL MONKEYS — CINEMA HAZARD');
  r.m('@npc 34 6 tushar');
  r.m(`@hint 10 ${f - 4} Smash the typing apes to rescue cinema!`);
  r.set(3, f, 'P').set(8, f, 'C');
  r.fill(28, 7, 40, 7, '=');                       // lighting truss Tushar is stuck on
  r.fill(18, f - 3, 21, f - 3, '=').fill(46, f - 3, 49, f - 3, '=');
  r.fill(42, 8, 44, 8, '=').m('@tape 40 6 ep0-3').m(`@hint 44 ${f - 7} Swap crew mid-air for a TAG HOP boost!`);   // end of the truss: needs a tag hop
  for (const x of [22, 27, 33, 39, 44]) r.set(x, f, 'm');
  r.set(31, 6, 'm').set(37, 6, 'm');
  r.set(54, f, 'h');
  r.set(61, f, 'X');
  r.write();
}

// ---------- 06 · The Ventilation Intake Hub: vertical; CUT! the fans, HACK the laser, BRIBE the toll drone ----------
{
  const r = common(new Room('ep0', 'ep0-r06', 32, 44), 'EP0 · 06 · The Ventilation Intake Hub', 'ep0-r07');
  const H = r.H, f = r.floor;
  r.m(`@npc 12 ${f} intern-bunty`);
  r.m(`@trigger 1 ${f - 4} 30 5 ep0-r06-bunty`);
  r.m(`@sign 18 ${f - 3} Chain swap attacks to pump STYLE to MAXIMALIST!`).m('@sign 18 22 DO NOT HIT REPLY ALL').m('@sign 9 3 AIR INTAKE 100% BEIGE CONTAMINATED');
  r.m(`@hint 5 ${f - 6} Blades spinning? Tushar: CUT (K) holds frame!`);
  r.set(4, f, 'P').set(8, f, 'C');
  // zig-zag platforms every 3 rows up the shaft
  const rows = [f - 3, f - 6, f - 9, f - 12, f - 15, f - 18, f - 21, f - 24, f - 27];
  rows.forEach((y, i) => { const left = i % 2 === 0; r.fill(left ? 3 : 18, y, left ? 13 : 28, y, '='); });
  r.set(16, f - 5, 'F').set(16, f - 14, 'F').set(16, f - 23, 'F');   // fans in the middle of the climb
  r.set(23, f - 13, 'd').set(8, f - 19, 'p');
  r.set(20, f - 22, 'C');
  // top floor: laser + terminal, then the toll gate, then the exit
  const top = 10;
  // you come up through the one-way hole on the left, hack the laser, pay the toll drone, leave
  r.fill(1, top + 1, 30, top + 1, '#').fill(3, top + 1, 7, top + 1, '=');
  r.set(9, top, 'T').set(12, top, 'L');
  r.fill(22, 1, 22, top - 2, '#').set(22, top, 'G');
  r.set(17, top - 4, 'p');
  r.set(28, top, 'X');
  void H;
  r.write();
}

// ---------- 07 · The Grand Server Lobby: boss ----------
{
  const r = common(new Room('ep0', 'ep0-r07', 40), 'EP0 · 07 · The Grand Server Lobby', null);
  const f = r.floor;
  r.m('@dialogue ep0-r07-arena').m('@boss reply-all-mothership ep0-boss-intro ep0-boss-outro').m('@music ep0');
  r.m('@sign 14 2 THREAD STATUS: UNRESOLVED (4,812 REPLIES)');
  r.set(4, f, 'P');
  r.set(2, f, 'T').set(37, f, 'T');
  r.fill(5, f - 4, 10, f - 4, '=').fill(29, f - 4, 34, f - 4, '=').fill(17, f - 7, 22, f - 7, '=');
  r.set(20, 4, 'B');
  r.set(12, f, 'h').set(27, f, 'h');
  r.write();
}
