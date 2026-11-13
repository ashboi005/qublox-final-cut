// Generates the Episode 4 rooms (Templatr HQ) from Gemini's shot list (docs/narrative/ep4-rooms.md).
// Party = ANY 3 of the 7, so every room must be beatable by any party: crew-specific powers only open
// optional shortcuts / chai alcoves. Climbs use 2-row steps; gaps are ≤ 3 tiles.
// Run: bun tools/levels/ep4.ts
import { Room } from './room';

const common = (r: Room, name: string, next: string | null) => {
  r.m(`@name ${name}`).m('@episode 4').m('@tileset templatr').m('@backdrop templatr');
  if (next) r.m(`@next ${next}`);
  return r;
};
const pit = (r: Room, x0: number, x1: number) => r.fill(x0, r.floor + 1, x1, r.H - 2, '.').fill(x0, r.H - 1, x1, r.H - 1, '^');

// ---------- 01 · The Monolith Atrium ----------
{
  const r = common(new Room('ep4', 'ep4-r01', 68), 'EP4 · 01 · The Monolith Atrium', 'ep4-r02');
  const f = r.floor;
  r.m('@dialogue ep4-intro').m('@trigger 12 1 3 13 ep4-r01-beige-smocks').m('@npc 8 13 rebel-intern-simran');
  r.m('@sign 18 3 FRICTION IS INEFFICIENCY. STYLE IS DEAD.').m('@sign 44 4 WELCOME TO TEMPLATR: STANDARDIZE YOURSELF');
  r.set(3, f, 'P');
  r.set(20, f, 'i').set(26, f, 'i').set(30, f - 5, 'd');
  r.fill(33, f - 3, 38, f - 3, '=').set(36, f - 4, 'h');
  r.set(42, f, 'b').set(48, f, 'i').set(52, f - 6, 'p');
  r.set(56, f, 'C');
  r.set(65, f, 'X');
  r.write();
}

// ---------- 02 · Department of Creative Deprecation: shredder pits + stamping presses ----------
{
  const r = common(new Room('ep4', 'ep4-r02', 80), 'EP4 · 02 · Department of Creative Deprecation', 'ep4-r03');
  const f = r.floor;
  r.m('@trigger 10 1 3 13 ep4-r02-deprecated-art');
  r.m('@sign 3 4 IRRELEVANT HUMAN EXPRESSION (FOR SHREDDING)').m('@sign 40 3 UNIFORMITY BREEDS SERENITY').m('@sign 60 5 Chain abilities across all party slots!');
  r.set(3, f, 'P');
  pit(r, 16, 18); r.set(22, 8, 'O');
  pit(r, 28, 30); r.set(34, 8, 'O');
  r.set(38, f, 'C').set(44, f, 'm').set(48, f, 'm');
  pit(r, 52, 54); r.set(58, 8, 'O');
  r.fill(62, f - 2, 67, f - 2, '=').set(64, f - 3, 'h');
  r.set(72, f, 'i');
  r.set(77, f, 'X');
  r.write();
}

// ---------- 03 · The Standardization Chasm: vertical; catwalks + cache blocks ----------
{
  const r = common(new Room('ep4', 'ep4-r03', 30, 46), 'EP4 · 03 · The Standardization Chasm', 'ep4-r04');
  const f = r.floor;
  r.m(`@trigger 1 ${f - 4} 28 5 ep4-r03-alignment-token`);
  r.m(`@sign 14 ${f - 3} FLOOR 75 / 99 — 8:42 AM`).m('@sign 3 18 UNAUTHORIZED TIME DISRUPTION DETECTED');
  r.set(4, f, 'P').set(7, f, 'C');
  const steps: [number, number, string][] = [[9, f - 2, 'K'], [13, f - 4, '='], [18, f - 6, 'K'], [22, f - 8, '='], [17, f - 10, 'K'], [12, f - 12, '='], [7, f - 14, 'K'], [3, f - 16, '='],
    [8, f - 18, 'K'], [13, f - 20, '='], [18, f - 22, 'K'], [23, f - 24, '='], [18, f - 26, 'K'], [13, f - 28, '='], [8, f - 30, 'K']];
  for (const [x, y, c] of steps) r.fill(x, y, x + (c === 'K' ? 1 : 3), y, c);
  r.set(5, f - 17, 'C').set(24, f - 12, 'd').set(4, f - 25, 'p');
  r.fill(1, 9, 28, 9, '#').fill(9, 9, 14, 9, '=');
  r.set(16, 8, 'h').set(26, 8, 'X');
  r.write();
}

// ---------- 04 · The Chroma Sanitizer: foam vents + decontamination rings ----------
{
  const r = common(new Room('ep4', 'ep4-r04', 76), 'EP4 · 04 · The Chroma Sanitizer', 'ep4-r05');
  const f = r.floor;
  r.m('@trigger 8 1 3 13 ep4-r04-sanitizer-foam');
  r.m('@sign 3 4 DE-SATURATION PURGE IMMINENT').m('@sign 30 3 NEEDS MORE SATURATION!').m('@sign 52 4 BEIGE PURITY ZONE');
  r.set(3, f, 'P');
  for (const x of [14, 18, 22]) r.set(x, f, 'V');
  r.set(30, f, 'E').set(36, f, 'b');
  r.set(40, f, 'C');
  for (const x of [46, 50, 54]) r.set(x, f, 'V');
  r.fill(45, f - 4, 55, f - 4, '=').set(50, f - 5, 'h');
  r.set(62, f, 'E').set(66, f, 'i');
  r.set(73, f, 'X');
  r.write();
}

// ---------- 05 · Executive Suite 99: Chad's keynote (bullet points rain; security waves) ----------
{
  const r = common(new Room('ep4', 'ep4-r05', 56), 'EP4 · 05 · Executive Suite 99', 'ep4-r06');
  const f = r.floor;
  r.m('@dialogue ep4-r05-chad-keynote').m('@npc 46 9 chad-frictionless');
  r.m('@sign 14 2 ONE PLATFORM. ZERO TASTE. INFINITE REVENUE.');
  r.set(3, f, 'P');
  r.fill(42, f - 3, 52, f - 3, '#');                     // the stage
  for (const x of [14, 22, 30]) r.set(x, 1, '!');
  r.fill(12, f - 4, 17, f - 4, '=').fill(26, f - 4, 31, f - 4, '=');
  r.fill(38, 1, 38, f - 2, '#').set(38, f, 'Q');
  r.set(41, f, 'h').set(53, f, 'X');
  r.m(`@wave 1 16 ${f} i`).m(`@wave 1 24 ${f} i`).m(`@wave 1 20 ${f - 6} d`);
  r.m(`@wave 2 14 ${f} b`).m(`@wave 2 30 ${f} b`).m(`@wave 2 22 ${f} i`).m(`@wave 2 28 ${f - 7} d`);
  r.write();
}

// ---------- 06 · The Final Desaturation Vault: the all-stars gauntlet ----------
{
  const r = common(new Room('ep4', 'ep4-r06', 52), 'EP4 · 06 · The Final Desaturation Vault', 'ep4-r07');
  const f = r.floor;
  r.m('@dialogue ep4-r06-vault-countdown');
  r.m('@sign 16 2 STANDARDIZATION: 98%').m('@sign 3 4 DEADLINE: 8:50 AM').m('@sign 28 5 ACHIEVE MAXIMALIST STYLE TO BREAK THE VAULT!');
  r.set(4, f, 'P');
  r.fill(10, f - 4, 15, f - 4, '=').fill(30, f - 4, 35, f - 4, '=').fill(20, f - 7, 25, f - 7, '=');
  r.fill(44, 1, 44, f - 2, '#').set(44, f, 'Q');
  r.set(40, f, 'h').set(49, f, 'X');
  r.m(`@wave 1 16 ${f} m`).m(`@wave 1 20 ${f} m`).m(`@wave 1 26 ${f} i`).m(`@wave 1 22 ${f - 6} d`);
  r.m(`@wave 2 14 ${f} b`).m(`@wave 2 32 ${f} b`).m(`@wave 2 22 ${f - 9} p`).m(`@wave 2 28 ${f} w`).m(`@wave 2 18 ${f} w`);
  r.m(`@wave 3 12 ${f} i`).m(`@wave 3 18 ${f} m`).m(`@wave 3 24 ${f} b`).m(`@wave 3 30 ${f} i`).m(`@wave 3 34 ${f} m`).m(`@wave 3 20 ${f - 7} d`).m(`@wave 3 28 ${f - 7} p`);
  r.write();
}

// ---------- 07 · The Beige Singularity: BEIGE™ ----------
{
  const r = common(new Room('ep4', 'ep4-r07', 46), 'EP4 · 07 · The Beige Singularity', null);
  const f = r.floor;
  r.m('@boss beige ep4-beige-intro ep4-ending').m('@music ep4');
  r.m('@sign 15 2 #F5F5DC OVERFLOW — CORRUPT');
  r.set(4, f, 'P');
  r.fill(4, f - 4, 10, f - 4, '=').fill(35, f - 4, 41, f - 4, '=').fill(19, f - 7, 26, f - 7, '=');
  r.set(23, 5, 'B');
  r.set(13, f, 'h').set(32, f, 'h');
  r.write();
}
