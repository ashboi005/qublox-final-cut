// VERSUS movesets. All numbers are integers: frames at 60fps, distances in px (the sim scales to sub-pixels).
// Every crew member gets light + heavy (flavoured), one SPECIAL and one SUPER from their real job/persona.
// See docs/design/FIGHT_MODE.md.
import type { CrewId } from '../index';

/** Hitbox relative to the fighter's feet: x forward (mirrored by facing), y up from the floor. */
export type Box = { x: number; y: number; w: number; h: number };

export type Effect =
  | { kind: 'projectile'; sprite: 'cash' | 'paint' | 'boulder'; speed: number; vy: number; gravity: number; damage: number; hitstun: number; kb: number; life: number; w: number; h: number; puddle?: boolean }
  | { kind: 'freeze'; frames: number; range: number }
  | { kind: 'invert'; frames: number; range: number; damage: number }
  | { kind: 'rewind'; frames: number }
  | { kind: 'teleportBehind'; range: number }
  | { kind: 'wall'; frames: number; w: number; h: number }
  | { kind: 'rain'; count: number; damage: number }
  | { kind: 'shockwave'; damage: number; heal: number }
  | { kind: 'bounceFloor'; frames: number; damage: number }
  | { kind: 'giant'; frames: number }
  | { kind: 'deploy'; damage: number }
  | { kind: 'montage'; hits: number; damage: number; every: number }
  | { kind: 'dash'; speed: number };

export type Move = {
  name: string;
  startup: number; active: number; recovery: number;
  /** Strike on the active frames (omit for pure effects). `hitEvery` > 0 = multi-hit every N active frames. */
  box?: Box; damage?: number; hitEvery?: number;
  hitstun?: number; blockstun?: number; kb?: number; launch?: number;
  unblockable?: boolean;
  effect?: Effect;
  /** Word that pops on hit. */
  word: string;
};

export type Moveset = {
  walk: number; jump: number; hp: number;
  light: Move; heavy: Move; special: Move; super: Move;
};

const light = (word: string, dmg = 40): Move => ({ name: 'light', startup: 4, active: 3, recovery: 8, box: { x: 18, y: 38, w: 34, h: 20 }, damage: dmg, hitstun: 14, blockstun: 8, kb: 2, word });
const heavy = (word: string, dmg = 90): Move => ({ name: 'heavy', startup: 10, active: 4, recovery: 18, box: { x: 20, y: 30, w: 44, h: 30 }, damage: dmg, hitstun: 22, blockstun: 14, kb: 6, word });

export const MOVESETS: Record<CrewId, Moveset> = {
  ashwath: {
    walk: 2, jump: 6, hp: 1000, light: light('CLACK'), heavy: heavy('MERGE'),
    special: { name: 'INFO DUMP', startup: 8, active: 24, recovery: 14, box: { x: 4, y: 10, w: 96, h: 70 }, damage: 35, hitEvery: 8, hitstun: 12, blockstun: 8, kb: 1, word: 'CAP THEOREM' },
    super: { name: 'SHIP IN 36 HOURS', startup: 50, active: 2, recovery: 30, effect: { kind: 'deploy', damage: 260 }, word: 'DEPLOYED' },
  },
  sayam: {
    walk: 2, jump: 5, hp: 1050, light: light('LE RE', 38), heavy: heavy('INVOICE', 95),
    special: { name: 'LE RE', startup: 9, active: 1, recovery: 16, effect: { kind: 'projectile', sprite: 'cash', speed: 6, vy: 0, gravity: 0, damage: 60, hitstun: 16, kb: 3, life: 90, w: 16, h: 10 }, word: 'LE RE' },
    super: { name: 'HOSTILE TAKEOVER', startup: 20, active: 1, recovery: 40, effect: { kind: 'rain', count: 6, damage: 45 }, word: 'ACQUIRED' },
  },
  tushar: {
    walk: 2, jump: 6, hp: 1100, light: light('BONK', 42), heavy: heavy('ACTION', 100),
    special: { name: 'CUT!', startup: 14, active: 1, recovery: 30, effect: { kind: 'freeze', frames: 35, range: 320 }, word: 'CUT!' },
    super: { name: "THAT'S A WRAP", startup: 16, active: 18, recovery: 24, box: { x: 10, y: 10, w: 50, h: 70 }, damage: 230, hitstun: 40, blockstun: 20, kb: 10, launch: 7, effect: { kind: 'dash', speed: 9 }, word: "THAT'S A WRAP" },
  },
  sehaj: {
    walk: 2, jump: 6, hp: 1000, light: light('VAJJ', 44), heavy: heavy('SLASH', 95),
    special: { name: 'BEAST MODE', startup: 20, active: 1, recovery: 22, effect: { kind: 'projectile', sprite: 'boulder', speed: 5, vy: 0, gravity: 0, damage: 120, hitstun: 28, kb: 8, life: 110, w: 24, h: 24 }, word: 'LIGHT WEIGHT' },
    super: { name: 'CTRL+Z', startup: 6, active: 1, recovery: 12, effect: { kind: 'rewind', frames: 90 }, word: 'CTRL+Z' },
  },
  manvi: {
    walk: 2, jump: 6, hp: 950, light: light('HAWWW', 40), heavy: heavy('WHATCHA', 85),
    special: { name: 'MIND GAMES', startup: 12, active: 1, recovery: 22, unblockable: true, effect: { kind: 'invert', frames: 120, range: 240, damage: 70 }, word: 'WHATCHA DOIN?' },
    super: { name: 'DHUMTANANA', startup: 24, active: 1, recovery: 30, effect: { kind: 'shockwave', damage: 230, heal: 150 }, word: 'DHUMTANANA' },
  },
  mansukh: {
    walk: 2, jump: 6, hp: 1000, light: light('STAB', 40), heavy: heavy('KERNING', 95),
    special: { name: 'PEN TOOL', startup: 10, active: 1, recovery: 16, effect: { kind: 'wall', frames: 120, w: 10, h: 80 }, word: 'ANCHOR' },
    super: { name: 'MAKE THE LOGO BIGGER', startup: 22, active: 10, recovery: 26, box: { x: 0, y: 0, w: 130, h: 160 }, damage: 240, hitstun: 40, blockstun: 22, kb: 8, launch: 8, effect: { kind: 'giant', frames: 58 }, word: 'BIGGER' },
  },
  manya: {
    walk: 2, jump: 6, hp: 950, light: light('SPLAT', 38), heavy: heavy('SWATCH', 90),
    special: { name: 'SPLAT', startup: 10, active: 1, recovery: 18, effect: { kind: 'projectile', sprite: 'paint', speed: 4, vy: -5, gravity: 1, damage: 50, hitstun: 16, kb: 2, life: 120, w: 12, h: 12, puddle: true }, word: 'SPLAT' },
    super: { name: 'FILL: YELLOW', startup: 18, active: 1, recovery: 30, effect: { kind: 'bounceFloor', frames: 150, damage: 40 }, word: 'BOING' },
  },
  brahmansh: {
    walk: 3, jump: 6, hp: 850, light: light('SNIP', 34), heavy: heavy('RAZOR', 80),
    special: { name: 'JUMP CUT', startup: 6, active: 4, recovery: 14, box: { x: 14, y: 20, w: 40, h: 50 }, damage: 70, hitstun: 18, blockstun: 10, kb: 4, effect: { kind: 'teleportBehind', range: 240 }, word: 'CUT' },
    super: { name: 'MONTAGE', startup: 10, active: 60, recovery: 20, unblockable: true, effect: { kind: 'montage', hits: 6, damage: 40, every: 10 }, word: 'MONTAGE' },
  },
};
