// VERSUS simulation. Deterministic: integer math only (positions in sub-pixels), seeded RNG in the state,
// no clocks, no Math.random. step(state, inputs) mutates `state` in place, so snapshot with structuredClone
// for rollback. Phaser never touches this; it only draws the state.
import type { CrewId } from '../index';
import { MOVESETS, type Box, type Move } from './moves';

export const FPS = 60;
export const SUB = 16;                       // sub-pixels per px
export const STAGE_W = 480, FLOOR_Y = 236;   // px
const WALL_L = 20 * SUB, WALL_R = (STAGE_W - 20) * SUB;
const GRAVITY = 5;                           // sub/frame²
const BODY_W = 30, BODY_H = 70, CROUCH_H = 46;
export const ROUND_FRAMES = 99 * FPS, WINS_NEEDED = 2, METER_MAX = 1000;
const INTRO_FRAMES = 90, ROUND_END_FRAMES = 150, HISTORY = 90;

// Input bits (one byte per player per frame).
export const BTN = { LEFT: 1, RIGHT: 2, UP: 4, DOWN: 8, LIGHT: 16, HEAVY: 32, SPECIAL: 64, SUPER: 128 } as const;

export type MoveSlot = 'light' | 'heavy' | 'special' | 'super';
export type FighterMode = 'idle' | 'walk' | 'jump' | 'crouch' | 'block' | 'attack' | 'hitstun' | 'blockstun' | 'ko' | 'win';

export type Fighter = {
  crew: CrewId;
  x: number; y: number; vx: number; vy: number;   // sub-pixels; y = feet, FLOOR_Y*SUB on the ground
  facing: 1 | -1;
  hp: number; meter: number;
  mode: FighterMode; modeFrames: number;          // frames left in hitstun/blockstun, or frames into the current move
  move: MoveSlot | null; hitsDone: number;
  held: number; prev: number;                      // buttons this frame / last frame (after inversion)
  frozenUntil: number; invertUntil: number; giantUntil: number; slowUntil: number;
  history: number[];                               // ring of [x, y, hp] triples for CTRL+Z
};
export type Projectile = { owner: 0 | 1; sprite: string; x: number; y: number; vx: number; vy: number; gravity: number; life: number; damage: number; hitstun: number; kb: number; w: number; h: number; puddle: boolean };
export type Zone = { owner: 0 | 1; kind: 'wall' | 'puddle' | 'bounce'; x: number; w: number; h: number; until: number; nextHit: number; damage: number };
export type FightEvent =
  | { type: 'hit'; x: number; y: number; word: string; damage: number; blocked: boolean; big: boolean }
  | { type: 'move'; who: 0 | 1; slot: MoveSlot; name: string }
  | { type: 'banner'; text: string }
  | { type: 'ko'; who: 0 | 1 };

export type FightState = {
  frame: number; rng: number;
  phase: 'intro' | 'fight' | 'roundEnd' | 'matchEnd'; phaseFrames: number;
  round: number; wins: [number, number]; timer: number;
  hitstop: number;
  fighters: [Fighter, Fighter];
  projectiles: Projectile[]; zones: Zone[];
  events: FightEvent[];
  winner: 0 | 1 | null;
};

const newFighter = (crew: CrewId, side: 0 | 1): Fighter => ({
  crew, x: (side === 0 ? 150 : STAGE_W - 150) * SUB, y: FLOOR_Y * SUB, vx: 0, vy: 0, facing: side === 0 ? 1 : -1,
  hp: MOVESETS[crew].hp, meter: 0, mode: 'idle', modeFrames: 0, move: null, hitsDone: 0, held: 0, prev: 0,
  frozenUntil: 0, invertUntil: 0, giantUntil: 0, slowUntil: 0, history: [],
});

export function createFight(p1: CrewId, p2: CrewId, seed: number): FightState {
  return {
    frame: 0, rng: seed >>> 0 || 1, phase: 'intro', phaseFrames: INTRO_FRAMES, round: 1, wins: [0, 0], timer: ROUND_FRAMES, hitstop: 0,
    fighters: [newFighter(p1, 0), newFighter(p2, 1)], projectiles: [], zones: [], events: [], winner: null,
  };
}

const rand = (s: FightState, n: number) => { s.rng = (Math.imul(s.rng, 1103515245) + 12345) >>> 0; return s.rng % n; };
const grounded = (f: Fighter) => f.y >= FLOOR_Y * SUB;
const moveOf = (f: Fighter): Move | null => (f.move ? MOVESETS[f.crew][f.move] : null);
const isFree = (f: Fighter) => f.mode === 'idle' || f.mode === 'walk' || f.mode === 'crouch' || f.mode === 'block' || f.mode === 'jump';

/** World rect of a box relative to a fighter (px). */
function boxRect(f: Fighter, b: Box, scale = 1) {
  const fx = f.x / SUB, fy = f.y / SUB;
  const x = f.facing === 1 ? fx + b.x * scale : fx - (b.x + b.w) * scale;
  return { x, y: fy - (b.y + b.h) * scale, w: b.w * scale, h: b.h * scale };
}
function hurtRect(f: Fighter) {
  const h = f.mode === 'crouch' ? CROUCH_H : BODY_H, s = f.giantUntil ? 2 : 1;
  return { x: f.x / SUB - (BODY_W * s) / 2, y: f.y / SUB - h * s, w: BODY_W * s, h: h * s };
}
const overlap = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) =>
  a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

function startMove(s: FightState, i: 0 | 1, slot: MoveSlot) {
  const f = s.fighters[i];
  if (slot === 'super') f.meter -= METER_MAX;
  f.mode = 'attack'; f.move = slot; f.modeFrames = 0; f.hitsDone = 0;
  if (grounded(f)) f.vx = 0;
  const m = MOVESETS[f.crew][slot];
  if (slot === 'special' || slot === 'super') s.events.push({ type: 'move', who: i, slot, name: m.name });
}

/** Resolve a hit from `a` (index) on `b`. Returns true if it connected (hit or block). */
function hit(s: FightState, ai: 0 | 1, damage: number, hitstun: number, blockstun: number, kb: number, launch: number, word: string, unblockable = false, fromX?: number): boolean {
  const a = s.fighters[ai], b = s.fighters[ai === 0 ? 1 : 0];
  if (b.mode === 'ko' || s.phase !== 'fight') return false;
  const dir: 1 | -1 = (fromX ?? a.x) <= b.x ? 1 : -1;     // push direction
  const backHeld = (b.held & (dir === 1 ? BTN.RIGHT : BTN.LEFT)) !== 0; // holding away from the attack
  const blocking = !unblockable && grounded(b) && (isFree(b) || b.mode === 'blockstun') && backHeld && s.frame >= b.frozenUntil;
  const px = b.x / SUB, py = b.y / SUB - 40;
  if (blocking) {
    b.hp = Math.max(1, b.hp - Math.floor(damage / 10));
    b.mode = 'blockstun'; b.modeFrames = blockstun; b.vx = dir * kb * SUB / 2; b.move = null;
    a.meter = Math.min(METER_MAX, a.meter + Math.floor(damage / 4)); b.meter = Math.min(METER_MAX, b.meter + Math.floor(damage / 6));
    s.events.push({ type: 'hit', x: px, y: py, word: 'BLOCK', damage: 0, blocked: true, big: false });
    s.hitstop = 3;
    return true;
  }
  b.hp = Math.max(0, b.hp - damage);
  b.mode = 'hitstun'; b.modeFrames = hitstun; b.move = null; b.frozenUntil = 0;
  b.vx = dir * kb * SUB / 2; if (launch) b.vy = -launch * SUB;
  a.meter = Math.min(METER_MAX, a.meter + Math.floor(damage / 2)); b.meter = Math.min(METER_MAX, b.meter + Math.floor(damage / 4));
  const big = damage >= 90;
  s.events.push({ type: 'hit', x: px, y: py, word, damage, blocked: false, big });
  s.hitstop = big ? 8 : 4;
  return true;
}

function activate(s: FightState, i: 0 | 1, m: Move) {
  const f = s.fighters[i], o = s.fighters[i === 0 ? 1 : 0], e = m.effect;
  if (!e) return;
  const dist = Math.abs(o.x - f.x) / SUB;
  switch (e.kind) {
    case 'projectile':
      s.projectiles.push({ owner: i, sprite: e.sprite, x: f.x + f.facing * 26 * SUB, y: f.y - 44 * SUB, vx: f.facing * e.speed * SUB, vy: e.vy * SUB, gravity: e.gravity * 4, life: e.life, damage: e.damage, hitstun: e.hitstun, kb: e.kb, w: e.w, h: e.h, puddle: !!e.puddle });
      break;
    case 'freeze':
      if (dist <= e.range && o.mode !== 'ko') { o.frozenUntil = s.frame + e.frames; o.mode = 'hitstun'; o.modeFrames = e.frames; o.vx = 0; o.move = null; s.events.push({ type: 'hit', x: o.x / SUB, y: o.y / SUB - 50, word: 'FROZEN', damage: 0, blocked: false, big: true }); }
      break;
    case 'invert':
      if (dist <= e.range) { o.invertUntil = s.frame + e.frames; hit(s, i, e.damage, 10, 0, 0, 0, m.word, true); }
      break;
    case 'rewind': {
      const h = f.history;
      if (h.length >= 3) { f.x = h[0]!; f.y = h[1]!; f.hp = Math.max(f.hp, h[2]!); f.vx = 0; f.vy = 0; f.history = []; }
      s.events.push({ type: 'banner', text: 'CTRL+Z' });
      break;
    }
    case 'teleportBehind':
      if (dist <= e.range) { f.x = Math.max(WALL_L, Math.min(WALL_R, o.x + (o.x >= f.x ? 34 : -34) * SUB)); f.facing = f.x < o.x ? 1 : -1; }
      break;
    case 'wall':
      s.zones.push({ owner: i, kind: 'wall', x: f.x + f.facing * 46 * SUB, w: e.w, h: e.h, until: s.frame + e.frames, nextHit: 0, damage: 0 });
      break;
    case 'rain':
      for (let k = 0; k < e.count; k++) {
        const x = o.x + (rand(s, 120) - 60) * SUB;
        s.projectiles.push({ owner: i, sprite: 'cash', x, y: (20 - k * 22) * SUB, vx: 0, vy: 3 * SUB, gravity: 2, life: 160, damage: e.damage, hitstun: 14, kb: 1, w: 18, h: 12, puddle: false });
      }
      s.events.push({ type: 'banner', text: 'HOSTILE TAKEOVER' });
      break;
    case 'shockwave':
      f.hp = Math.min(MOVESETS[f.crew].hp, f.hp + e.heal);
      hit(s, i, e.damage, 30, 18, 8, grounded(o) ? 5 : 0, m.word, false, f.x);
      s.events.push({ type: 'banner', text: 'DHUMTANANA' });
      break;
    case 'bounceFloor':
      s.zones.push({ owner: i, kind: 'bounce', x: STAGE_W / 2 * SUB, w: STAGE_W, h: 8, until: s.frame + e.frames, nextHit: s.frame, damage: e.damage });
      s.events.push({ type: 'banner', text: 'FILL: YELLOW' });
      break;
    case 'giant':
      f.giantUntil = s.frame + e.frames;
      s.events.push({ type: 'banner', text: 'MAKE THE LOGO BIGGER' });
      break;
    case 'deploy':
      hit(s, i, e.damage, 40, 24, 9, 8, m.word, false, f.x);
      s.events.push({ type: 'banner', text: 'SHIPPED IN 36 HOURS' });
      break;
    case 'montage':
    case 'dash':
      break; // handled per-frame in updateMove
  }
}

function updateMove(s: FightState, i: 0 | 1) {
  const f = s.fighters[i], o = s.fighters[i === 0 ? 1 : 0], m = moveOf(f)!;
  const t = f.modeFrames;
  if (t === m.startup) activate(s, i, m);
  const activeT = t - m.startup;
  if (activeT >= 0 && activeT < m.active) {
    const e = m.effect;
    if (e?.kind === 'dash') f.vx = f.facing * e.speed * SUB;
    if (e?.kind === 'montage' && activeT % e.every === 0 && f.hitsDone < e.hits) {
      f.hitsDone++;
      f.x = Math.max(WALL_L, Math.min(WALL_R, o.x + (f.hitsDone % 2 ? 40 : -40) * SUB)); f.y = o.y; f.facing = f.x < o.x ? 1 : -1;
      hit(s, i, e.damage, 12, 0, 1, 0, m.word, true);
      if (f.hitsDone === e.hits) s.events.push({ type: 'banner', text: 'MONTAGE' });
    }
    if (m.box && m.damage) {
      const every = m.hitEvery ?? 0;
      const due = every > 0 ? activeT % every === 0 : f.hitsDone === 0;
      if (due && overlap(boxRect(f, m.box, f.giantUntil > s.frame ? 2 : 1), hurtRect(o))) {
        f.hitsDone++;
        hit(s, i, m.damage, m.hitstun ?? 14, m.blockstun ?? 8, m.kb ?? 2, m.launch ?? 0, m.word, !!m.unblockable);
      }
    }
  } else if (m.effect?.kind === 'dash') f.vx = 0;
  f.modeFrames++;
  if (f.modeFrames >= m.startup + m.active + m.recovery) { f.mode = grounded(f) ? 'idle' : 'jump'; f.move = null; }
}

function control(s: FightState, i: 0 | 1, input: number) {
  const f = s.fighters[i], o = s.fighters[i === 0 ? 1 : 0], ms = MOVESETS[f.crew];
  // MIND GAMES: left/right swapped.
  if (s.frame < f.invertUntil) { const l = input & BTN.LEFT, r = input & BTN.RIGHT; input = (input & ~(BTN.LEFT | BTN.RIGHT)) | (l ? BTN.RIGHT : 0) | (r ? BTN.LEFT : 0); }
  f.prev = f.held; f.held = input;
  const pressed = input & ~f.prev;
  if (f.mode === 'ko' || f.mode === 'win') return;
  if (s.frame < f.frozenUntil) return;
  if (f.mode === 'hitstun' || f.mode === 'blockstun') {
    if (--f.modeFrames <= 0) f.mode = grounded(f) ? 'idle' : 'jump';
    if (grounded(f)) f.vx = Math.trunc(f.vx * 7 / 8);
    return;
  }
  if (f.mode === 'attack') { updateMove(s, i); return; }

  // Free: attacks first.
  if (s.phase === 'fight') {
    if (pressed & BTN.SUPER && f.meter >= METER_MAX) return startMove(s, i, 'super');
    if (pressed & BTN.SPECIAL) return startMove(s, i, 'special');
    if (pressed & BTN.HEAVY) return startMove(s, i, 'heavy');
    if (pressed & BTN.LIGHT) return startMove(s, i, 'light');
  }
  if (grounded(f)) {
    f.facing = o.x >= f.x ? 1 : -1;
    const dir = (input & BTN.RIGHT ? 1 : 0) - (input & BTN.LEFT ? 1 : 0);
    const slow = s.frame < f.slowUntil ? 2 : 1;
    if (input & BTN.DOWN) { f.mode = 'crouch'; f.vx = 0; }
    else if (input & BTN.UP && s.phase === 'fight') { f.vy = -(ms.jump * SUB + 24); f.vx = Math.trunc(dir * ms.walk * SUB / slow * 5 / 4); f.mode = 'jump'; }
    else if (dir) { f.vx = Math.trunc(dir * ms.walk * SUB / slow); f.mode = dir === -f.facing ? 'block' : 'walk'; }
    else { f.vx = 0; f.mode = 'idle'; }
  }
}

function physics(s: FightState, i: 0 | 1) {
  const f = s.fighters[i];
  if (s.frame < f.frozenUntil) return;
  if (!grounded(f) || f.vy < 0) f.vy += GRAVITY;
  f.x += f.vx; f.y += f.vy;
  if (f.y >= FLOOR_Y * SUB) { f.y = FLOOR_Y * SUB; f.vy = 0; if (f.mode === 'jump') f.mode = 'idle'; }
  f.x = Math.max(WALL_L, Math.min(WALL_R, f.x));
  for (const z of s.zones) {
    if (z.kind !== 'wall' || z.owner === i) continue;
    const zl = z.x - (z.w / 2 + BODY_W / 2) * SUB, zr = z.x + (z.w / 2 + BODY_W / 2) * SUB;
    if (f.x > zl && f.x < zr && f.y > (FLOOR_Y - z.h) * SUB) f.x = f.x < z.x ? zl : zr;
  }
  if (f.giantUntil && s.frame >= f.giantUntil) f.giantUntil = 0;
  f.history.push(f.x, f.y, f.hp);
  if (f.history.length > HISTORY * 3) f.history.splice(0, 3);
}

function pushApart(s: FightState) {
  const [a, b] = s.fighters;
  const min = BODY_W * SUB;
  const dx = b.x - a.x;
  if (Math.abs(dx) >= min || Math.abs(a.y - b.y) > BODY_H * SUB) return;
  const push = Math.ceil((min - Math.abs(dx)) / 2), dir = dx >= 0 ? 1 : -1;
  a.x = Math.max(WALL_L, a.x - dir * push); b.x = Math.min(WALL_R, Math.max(WALL_L, b.x + dir * push));
}

function updateProjectiles(s: FightState) {
  s.projectiles = s.projectiles.filter(p => {
    p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.life--;
    if (p.y >= FLOOR_Y * SUB) {
      if (p.puddle) s.zones.push({ owner: p.owner, kind: 'puddle', x: p.x, w: 60, h: 6, until: s.frame + 180, nextHit: 0, damage: 0 });
      if (p.puddle || p.gravity) return false;
      p.y = FLOOR_Y * SUB;
    }
    if (p.life <= 0 || p.x < WALL_L - 40 * SUB || p.x > WALL_R + 40 * SUB) return false;
    for (const z of s.zones) if (z.kind === 'wall' && z.owner !== p.owner && Math.abs(p.x - z.x) < (z.w / 2 + p.w / 2) * SUB && p.y > (FLOOR_Y - z.h) * SUB) return false;
    const target = s.fighters[p.owner === 0 ? 1 : 0];
    const r = { x: p.x / SUB - p.w / 2, y: p.y / SUB - p.h / 2, w: p.w, h: p.h };
    if (overlap(r, hurtRect(target))) { hit(s, p.owner, p.damage, p.hitstun, Math.floor(p.hitstun / 2), p.kb, 0, p.sprite === 'cash' ? 'LE RE' : p.sprite === 'boulder' ? 'VAJJ' : 'SPLAT', false, p.x - Math.sign(p.vx || 1) * SUB); return false; }
    return true;
  });
}

function updateZones(s: FightState) {
  s.zones = s.zones.filter(z => z.until > s.frame);
  for (const z of s.zones) {
    for (const i of [0, 1] as const) {
      if (z.owner === i) continue;
      const f = s.fighters[i];
      const inside = Math.abs(f.x - z.x) < (z.w / 2) * SUB && grounded(f);
      if (z.kind === 'puddle' && inside) f.slowUntil = s.frame + 2;
      if (z.kind === 'bounce' && inside && s.frame >= z.nextHit && f.mode !== 'ko') {
        z.nextHit = s.frame + 30;
        hit(s, z.owner, z.damage, 20, 0, 0, 7, 'BOING', true, f.x - SUB);
      }
    }
  }
}

function endRound(s: FightState, winner: 0 | 1 | null) {
  s.phase = 'roundEnd'; s.phaseFrames = ROUND_END_FRAMES;
  if (winner !== null) {
    s.wins[winner]++;
    s.fighters[winner].mode = 'win';
    const loser = s.fighters[winner === 0 ? 1 : 0];
    if (loser.hp <= 0) { loser.mode = 'ko'; s.events.push({ type: 'ko', who: winner === 0 ? 1 : 0 }); }
  }
  s.events.push({ type: 'banner', text: winner === null ? 'DRAW' : s.fighters[winner].hp >= MOVESETS[s.fighters[winner].crew].hp ? 'PERFECT CUT' : 'K.O.' });
}

function nextRound(s: FightState) {
  if (s.wins[0] >= WINS_NEEDED || s.wins[1] >= WINS_NEEDED) {
    s.phase = 'matchEnd'; s.winner = s.wins[0] >= WINS_NEEDED ? 0 : 1; s.phaseFrames = 0;
    s.events.push({ type: 'banner', text: 'FINAL CUT' });
    return;
  }
  const [a, b] = s.fighters;
  const meters = [a.meter, b.meter];
  s.fighters = [newFighter(a.crew, 0), newFighter(b.crew, 1)];
  s.fighters[0].meter = meters[0]!; s.fighters[1].meter = meters[1]!;   // meter carries over rounds
  s.projectiles = []; s.zones = []; s.round++; s.timer = ROUND_FRAMES; s.phase = 'intro'; s.phaseFrames = INTRO_FRAMES;
}

/** Advance one frame. `inputs` are the two players' button bytes for this frame. */
export function step(s: FightState, inputs: [number, number]) {
  s.events = [];
  s.frame++;
  if (s.hitstop > 0) { s.hitstop--; s.fighters[0].prev = s.fighters[0].held; s.fighters[1].prev = s.fighters[1].held; s.fighters[0].held = inputs[0]; s.fighters[1].held = inputs[1]; return; }
  if (s.phase === 'matchEnd') return;
  if (s.phase === 'intro') { if (--s.phaseFrames <= 0) { s.phase = 'fight'; s.events.push({ type: 'banner', text: `ROUND ${s.round} · ACTION!` }); } }
  else if (s.phase === 'roundEnd') { if (--s.phaseFrames <= 0) nextRound(s); }
  control(s, 0, inputs[0]); control(s, 1, inputs[1]);
  physics(s, 0); physics(s, 1);
  pushApart(s);
  updateProjectiles(s);
  updateZones(s);
  if (s.phase !== 'fight') return;
  if (--s.timer <= 0) {
    const [a, b] = s.fighters;
    const ra = a.hp / MOVESETS[a.crew].hp, rb = b.hp / MOVESETS[b.crew].hp;
    endRound(s, ra === rb ? null : ra > rb ? 0 : 1);
    return;
  }
  const ko0 = s.fighters[0].hp <= 0, ko1 = s.fighters[1].hp <= 0;
  if (ko0 || ko1) endRound(s, ko0 && ko1 ? null : ko0 ? 1 : 0);
}

/** Cheap state hash for desync detection (positions, HP, meters, RNG, frame). */
export function checksum(s: FightState): number {
  let h = s.frame ^ s.rng;
  for (const f of s.fighters) for (const v of [f.x, f.y, f.vx, f.vy, f.hp, f.meter, f.modeFrames]) h = (Math.imul(h, 31) + (v | 0)) | 0;
  return h >>> 0;
}
