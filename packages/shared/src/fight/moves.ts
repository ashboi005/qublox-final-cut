// VERSUS movesets. All numbers are integers: frames at 60fps, distances in px (the sim scales to sub-pixels).
// Every crew member shares a fundamentals kit (light string, heavy, sweep, overhead, air attacks, throw) with
// their own hit words, plus one SPECIAL and one SUPER from their real job/persona. See docs/design/FIGHT_MODE.md.
import type { CrewId } from '../index';

/** Hitbox relative to the fighter's feet: x forward (mirrored by facing), y up from the floor. */
export type Box = { x: number; y: number; w: number; h: number };
/** mid: block standing or crouching · low: must crouch-block · high (overhead): must stand-block. */
export type Height = 'mid' | 'low' | 'high';

export type MoveSlot = 'light' | 'light2' | 'light3' | 'heavy' | 'sweep' | 'overhead' | 'airLight' | 'airHeavy' | 'throw' | 'special' | 'super';

export type Effect =
  | { kind: 'projectile'; sprite: 'cash' | 'paint' | 'boulder' | 'prop'; speed: number; vy: number; gravity: number; damage: number; hitstun: number; kb: number; life: number; w: number; h: number; puddle?: boolean }
  | { kind: 'freeze'; frames: number; range: number }
  | { kind: 'invert'; frames: number; range: number; damage: number }
  | { kind: 'rewind'; frames: number }
  | { kind: 'teleportBehind'; range: number }
  | { kind: 'wall'; frames: number; w: number; h: number }
  | { kind: 'rain'; count: number; damage: number }
  | { kind: 'shockwave'; damage: number; heal: number }
  | { kind: 'bounceFloor'; frames: number; damage: number }
  /** Buff: all your hits deal +50% and you walk 50% faster for `frames`. */
  | { kind: 'stan'; frames: number }
  | { kind: 'deploy'; damage: number }
  | { kind: 'montage'; hits: number; damage: number; every: number }
  | { kind: 'dash'; speed: number }
  /** Immune to damage for `frames`; melee attackers who hit you get IGNORED (staggered). */
  | { kind: 'indifferent'; frames: number };

export type Move = {
  name: string;
  startup: number; active: number; recovery: number;
  /** Strike on the active frames (omit for pure effects). `hitEvery` > 0 = multi-hit every N active frames. */
  box?: Box; damage?: number; hitEvery?: number;
  hitstun?: number; blockstun?: number; kb?: number; launch?: number;
  height?: Height;
  knockdown?: boolean;
  unblockable?: boolean;
  /** Moves this one can be cancelled into once it has connected (hit or block): combos. */
  chain?: MoveSlot[];
  effect?: Effect;
  /** Word that pops on hit. */
  word: string;
};

export type Moveset = { walk: number; jump: number; hp: number } & Record<MoveSlot, Move>;

/** The shared fundamentals, flavoured with each crew member's hit words. */
function kit(w: { light: string; heavy: string; sweep: string; overhead: string }, dmg = 1): Omit<Moveset, 'walk' | 'jump' | 'hp' | 'special' | 'super'> {
  const d = (n: number) => Math.round(n * dmg);
  return {
    light: { name: 'Jab', startup: 4, active: 3, recovery: 9, box: { x: 16, y: 38, w: 34, h: 20 }, damage: d(35), hitstun: 15, blockstun: 9, kb: 2, chain: ['light2', 'heavy', 'sweep', 'special', 'super'], word: w.light },
    light2: { name: 'Jab 2', startup: 5, active: 3, recovery: 10, box: { x: 16, y: 34, w: 38, h: 24 }, damage: d(40), hitstun: 17, blockstun: 10, kb: 2, chain: ['light3', 'special', 'super'], word: w.light },
    light3: { name: 'String ender', startup: 8, active: 4, recovery: 16, box: { x: 14, y: 30, w: 44, h: 34 }, damage: d(60), hitstun: 26, blockstun: 12, kb: 5, launch: 6, knockdown: true, chain: ['special', 'super'], word: w.heavy },
    heavy: { name: 'Heavy', startup: 10, active: 4, recovery: 18, box: { x: 18, y: 28, w: 46, h: 32 }, damage: d(85), hitstun: 22, blockstun: 14, kb: 6, chain: ['special', 'super'], word: w.heavy },
    sweep: { name: 'Sweep', startup: 9, active: 4, recovery: 22, box: { x: 14, y: 0, w: 52, h: 16 }, damage: d(65), hitstun: 30, blockstun: 12, kb: 3, height: 'low', knockdown: true, chain: ['super'], word: w.sweep },
    overhead: { name: 'Overhead', startup: 18, active: 4, recovery: 16, box: { x: 14, y: 40, w: 44, h: 40 }, damage: d(80), hitstun: 22, blockstun: 12, kb: 4, height: 'high', chain: ['special', 'super'], word: w.overhead },
    airLight: { name: 'Air jab', startup: 5, active: 6, recovery: 6, box: { x: 10, y: 10, w: 36, h: 34 }, damage: d(40), hitstun: 16, blockstun: 9, kb: 2, height: 'high', word: w.light },
    airHeavy: { name: 'Air heavy', startup: 8, active: 6, recovery: 10, box: { x: 6, y: 0, w: 44, h: 40 }, damage: d(75), hitstun: 22, blockstun: 12, kb: 5, height: 'high', word: w.overhead },
    throw: { name: 'Throw', startup: 5, active: 2, recovery: 26, box: { x: 8, y: 20, w: 30, h: 50 }, damage: d(100), hitstun: 30, kb: 6, launch: 4, knockdown: true, unblockable: true, word: 'THROWN' },
  };
}

export const MOVESETS: Record<CrewId, Moveset> = {
  ashwath: {
    walk: 2, jump: 6, hp: 1000, ...kit({ light: 'CLACK', heavy: 'MERGE', sweep: 'GIT RESET', overhead: 'SUDO' }),
    special: { name: 'INFO DUMP', startup: 8, active: 24, recovery: 14, box: { x: 4, y: 10, w: 96, h: 70 }, damage: 35, hitEvery: 8, hitstun: 12, blockstun: 8, kb: 1, chain: ['super'], word: 'CAP THEOREM' },
    super: { name: 'SHIP IN 36 HOURS', startup: 50, active: 2, recovery: 30, effect: { kind: 'deploy', damage: 260 }, word: 'DEPLOYED' },
  },
  sayam: {
    walk: 2, jump: 5, hp: 1050, ...kit({ light: 'BHAI', heavy: 'INVOICE', sweep: 'CHUDA LAG GYA', overhead: 'BOARD VOTE' }),
    special: { name: 'LE RE', startup: 9, active: 1, recovery: 16, effect: { kind: 'projectile', sprite: 'cash', speed: 6, vy: 0, gravity: 0, damage: 60, hitstun: 16, kb: 3, life: 90, w: 16, h: 10 }, chain: ['super'], word: 'LE RE' },
    super: { name: 'HOSTILE TAKEOVER', startup: 20, active: 1, recovery: 40, effect: { kind: 'rain', count: 6, damage: 45 }, word: 'ACQUIRED' },
  },
  tushar: {
    walk: 2, jump: 6, hp: 1100, ...kit({ light: 'BONK', heavy: 'ACTION', sweep: 'LOW ANGLE', overhead: 'CRANE SHOT' }, 1.05),
    special: { name: 'CUT!', startup: 14, active: 1, recovery: 30, effect: { kind: 'freeze', frames: 35, range: 320 }, chain: ['super'], word: 'CUT!' },
    super: { name: "THAT'S A WRAP", startup: 16, active: 18, recovery: 24, box: { x: 10, y: 10, w: 50, h: 70 }, damage: 230, hitstun: 40, blockstun: 20, kb: 10, launch: 7, knockdown: true, effect: { kind: 'dash', speed: 9 }, word: "THAT'S A WRAP" },
  },
  sehaj: {
    walk: 2, jump: 6, hp: 1000, ...kit({ light: 'VAJJ', heavy: 'SLASH', sweep: 'LEG DAY', overhead: 'DEADLIFT' }, 1.05),
    special: { name: 'BEAST MODE', startup: 20, active: 1, recovery: 22, effect: { kind: 'projectile', sprite: 'boulder', speed: 5, vy: 0, gravity: 0, damage: 120, hitstun: 28, kb: 8, life: 110, w: 24, h: 24 }, chain: ['super'], word: 'LIGHT WEIGHT' },
    super: { name: 'CTRL+Z', startup: 6, active: 1, recovery: 12, effect: { kind: 'rewind', frames: 90 }, word: 'CTRL+Z' },
  },
  manvi: {
    walk: 2, jump: 6, hp: 950, ...kit({ light: 'HAWWW', heavy: 'WHATCHA', sweep: 'PLOT TWIST', overhead: 'YIPPIEEE' }),
    special: { name: 'MIND GAMES', startup: 12, active: 1, recovery: 22, unblockable: true, effect: { kind: 'invert', frames: 120, range: 240, damage: 70 }, chain: ['super'], word: 'WHATCHA DOIN?' },
    super: { name: 'DHUMTANANA', startup: 24, active: 1, recovery: 30, effect: { kind: 'shockwave', damage: 230, heal: 150 }, word: 'DHUMTANANA' },
  },
  mansukh: {
    walk: 2, jump: 6, hp: 1000, ...kit({ light: 'STAB', heavy: 'KERNING', sweep: 'NEW TAB', overhead: 'RAGEBAIT' }),
    special: { name: 'PEN TOOL', startup: 10, active: 1, recovery: 16, effect: { kind: 'wall', frames: 120, w: 10, h: 80 }, chain: ['super'], word: 'ANCHOR' },
    super: { name: 'STAN MODE', startup: 14, active: 6, recovery: 18, box: { x: 6, y: 10, w: 64, h: 70 }, damage: 140, hitstun: 32, blockstun: 18, kb: 7, launch: 6, knockdown: true, effect: { kind: 'stan', frames: 360 }, word: 'BABYMONSTER' },
  },
  manya: {
    walk: 2, jump: 6, hp: 950, ...kit({ light: 'SPLAT', heavy: 'SWATCH', sweep: 'DRIP', overhead: 'FILL' }),
    special: { name: 'SPLAT', startup: 10, active: 1, recovery: 18, effect: { kind: 'projectile', sprite: 'paint', speed: 4, vy: -5, gravity: 1, damage: 70, hitstun: 16, kb: 2, life: 120, w: 12, h: 12, puddle: true }, chain: ['super'], word: 'SPLAT' },
    super: { name: 'FILL: YELLOW', startup: 18, active: 1, recovery: 30, effect: { kind: 'bounceFloor', frames: 150, damage: 40 }, word: 'BOING' },
  },
  mishthi: {
    walk: 2, jump: 6, hp: 950, ...kit({ light: 'SKETCH', heavy: 'DRAMA', sweep: 'DAM BHAI', overhead: 'WTF BHAI' }),
    special: { name: 'IMPROVISE', startup: 11, active: 1, recovery: 18, effect: { kind: 'projectile', sprite: 'prop', speed: 5, vy: -4, gravity: 1, damage: 70, hitstun: 20, kb: 4, life: 110, w: 14, h: 14 }, chain: ['super'], word: 'MASTERPIECE' },
    super: { name: 'AS IF I CARE?', startup: 10, active: 1, recovery: 16, effect: { kind: 'indifferent', frames: 180 }, word: 'AS IF I CARE?' },
  },
  brahmansh: {
    walk: 3, jump: 6, hp: 850, ...kit({ light: 'SNIP', heavy: 'RAZOR', sweep: 'TRIM', overhead: 'SMASH CUT' }, 0.95),
    special: { name: 'JUMP CUT', startup: 6, active: 4, recovery: 14, box: { x: 14, y: 20, w: 40, h: 50 }, damage: 70, hitstun: 18, blockstun: 10, kb: 4, effect: { kind: 'teleportBehind', range: 240 }, chain: ['super'], word: 'CUT' },
    super: { name: 'MONTAGE', startup: 10, active: 60, recovery: 20, unblockable: true, effect: { kind: 'montage', hits: 6, damage: 40, every: 10 }, word: 'MONTAGE' },
  },
};

/** Human-readable move list (for the select screen and the in-fight Tab overlay). */
export function moveList(crew: CrewId): { input: string; name: string; note: string }[] {
  const m = MOVESETS[crew];
  return [
    { input: 'J', name: m.light.name, note: 'fast · press J again for a 3-hit string' },
    { input: 'J J J', name: m.light3.name, note: 'knocks down' },
    { input: 'K', name: m.heavy.name, note: 'slow, big push' },
    { input: '↓ + K', name: m.sweep.name, note: 'LOW: block crouching' },
    { input: '→ + K', name: m.overhead.name, note: 'OVERHEAD: block standing' },
    { input: 'air J / K', name: 'Air attacks', note: 'overheads' },
    { input: 'J + K (close)', name: m.throw.name, note: 'beats blocking' },
    { input: 'L', name: m.special.name, note: m.special.unblockable ? 'special · unblockable' : 'special' },
    { input: 'I', name: m.super.name, note: 'SUPER · needs a full meter' },
    { input: 'U / hold ←', name: 'Block', note: 'tap U just before a hit = PARRY' },
    { input: 'combo', name: 'Cancels', note: 'J/K that connects → L or I' },
  ];
}
