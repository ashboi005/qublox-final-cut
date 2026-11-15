// Custom key bindings for both modes. Phaser-free so the React UI (Controls screen, key hints) can use it too.
// Bindings are keyCodes (what Phaser's keyboard matches on), two slots per action, saved in this browser.
import { useSyncExternalStore } from 'react';

export type Scheme = 'story' | 'p1' | 'p2';
export type ActionDef = { id: string; label: string; defaults: [number | null, number | null] };

const A = (c: string) => c.charCodeAt(0);   // letter/digit → keyCode
export const KC = { SPACE: 32, ENTER: 13, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ESC: 27, TAB: 9, BACKSPACE: 8, DELETE: 46, F2: 113, NUM0: 96 } as const;

export const ACTIONS: Record<Scheme, ActionDef[]> = {
  story: [
    { id: 'left', label: 'Move left', defaults: [A('A'), KC.LEFT] },
    { id: 'right', label: 'Move right', defaults: [A('D'), KC.RIGHT] },
    { id: 'up', label: 'Up / jump', defaults: [A('W'), KC.UP] },
    { id: 'down', label: 'Down / drop', defaults: [A('S'), KC.DOWN] },
    { id: 'jump', label: 'Jump', defaults: [KC.SPACE, null] },
    { id: 'attack', label: 'Attack (hold: special)', defaults: [A('J'), A('X')] },
    { id: 'ability', label: 'Ability', defaults: [A('K'), A('C')] },
    { id: 'interact', label: 'Talk / interact', defaults: [A('F'), KC.ENTER] },
    { id: 'swapPrev', label: 'Swap: previous', defaults: [A('Q'), null] },
    { id: 'swapNext', label: 'Swap: next', defaults: [A('E'), null] },
    { id: 'swap1', label: 'Swap to member 1', defaults: [A('1'), null] },
    { id: 'swap2', label: 'Swap to member 2', defaults: [A('2'), null] },
    { id: 'swap3', label: 'Swap to member 3', defaults: [A('3'), null] },
    { id: 'swap4', label: 'Swap to member 4', defaults: [A('4'), null] },
    { id: 'restart', label: 'Restart room', defaults: [A('R'), null] },
    { id: 'mute', label: 'Mute', defaults: [A('M'), null] },
  ],
  p1: [
    { id: 'left', label: 'Move left', defaults: [A('A'), null] },
    { id: 'right', label: 'Move right', defaults: [A('D'), null] },
    { id: 'up', label: 'Jump', defaults: [A('W'), KC.SPACE] },
    { id: 'down', label: 'Crouch', defaults: [A('S'), null] },
    { id: 'light', label: 'Light', defaults: [A('J'), null] },
    { id: 'heavy', label: 'Heavy', defaults: [A('K'), null] },
    { id: 'special', label: 'Special', defaults: [A('L'), null] },
    { id: 'super', label: 'Super', defaults: [A('I'), null] },
    { id: 'block', label: 'Block / parry', defaults: [A('U'), null] },
  ],
  p2: [
    { id: 'left', label: 'Move left', defaults: [KC.LEFT, null] },
    { id: 'right', label: 'Move right', defaults: [KC.RIGHT, null] },
    { id: 'up', label: 'Jump', defaults: [KC.UP, null] },
    { id: 'down', label: 'Crouch', defaults: [KC.DOWN, null] },
    { id: 'light', label: 'Light', defaults: [A('1'), KC.NUM0 + 1] },
    { id: 'heavy', label: 'Heavy', defaults: [A('2'), KC.NUM0 + 2] },
    { id: 'special', label: 'Special', defaults: [A('3'), KC.NUM0 + 3] },
    { id: 'super', label: 'Super', defaults: [A('0'), KC.NUM0] },
    { id: 'block', label: 'Block / parry', defaults: [A('4'), KC.NUM0 + 4] },
  ],
};

/** Keys the menus own: Esc (pause / back), Tab (VERSUS move list), F2 (sprite viewer). */
export const RESERVED: Record<number, string> = { [KC.ESC]: 'Esc opens the pause menu', [KC.TAB]: 'Tab opens the VERSUS move list', [KC.F2]: 'F2 opens the sprite viewer' };

/** Actions that can't share a key: Story on its own; VERSUS P1 and P2 play on one keyboard at once. */
const group = (s: Scheme): Scheme[] => (s === 'story' ? ['story'] : ['p1', 'p2']);

type Binds = Record<Scheme, Record<string, [number | null, number | null]>>;
const KEY = 'qublox-keybinds-v1';
const defaults = (): Binds => Object.fromEntries((Object.keys(ACTIONS) as Scheme[]).map(s => [s, Object.fromEntries(ACTIONS[s].map(a => [a.id, [...a.defaults]]))])) as Binds;
const DEFAULTS = defaults();

function load(): Binds {
  const b = defaults();
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<Binds> | null;
    for (const s of Object.keys(b) as Scheme[]) for (const id of Object.keys(b[s])) {
      const v = saved?.[s]?.[id];
      if (Array.isArray(v) && v.length === 2 && v.every(c => c === null || (Number.isInteger(c) && c > 0 && c < 256))) b[s][id] = v as [number | null, number | null];
    }
  } catch { /* storage blocked: defaults */ }
  return b;
}

// Saved binds load on first use by the game, or once the UI subscribes (after hydration), so the server render
// and the first client render agree (both describe the defaults) and then update.
let binds: Binds | null = null;
let version = 0;
const listeners = new Set<() => void>();
const current = () => binds ?? DEFAULTS;
function bound(s: Scheme, action: string): number[] {
  const pair: (number | null)[] = current()[s][action] ?? [];
  return pair.filter((c): c is number => c !== null);
}
function ensure() { if (!binds && typeof window !== 'undefined') { binds = load(); version++; } }
function commit(next: Binds) {
  binds = next; version++;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* not saved, still applies this session */ }
  listeners.forEach(l => l());
}

/** Bump on every change; Phaser inputs compare it each frame and rebuild their keys when it moves. */
export const bindsVersion = () => version;
export const subscribe = (l: () => void) => { ensure(); listeners.add(l); return () => { listeners.delete(l); }; };
/** All keyCodes bound to an action (both slots). */
export const codes = (s: Scheme, action: string): number[] => { ensure(); return bound(s, action); };
export const slots = (s: Scheme, action: string) => current()[s][action] ?? [null, null];

/** Bind `code` to one slot. Returns what it was taken from (that slot is now empty), or a refusal. */
export function bind(s: Scheme, action: string, slot: 0 | 1, code: number): { ok: true; took?: { scheme: Scheme; action: string } } | { ok: false; why: string } {
  if (RESERVED[code]) return { ok: false, why: RESERVED[code]! };
  ensure();
  const next = structuredClone(current());
  let took: { scheme: Scheme; action: string } | undefined;
  for (const g of group(s)) for (const [id, pair] of Object.entries(next[g])) {
    pair.forEach((c, i) => { if (c === code && !(g === s && id === action && i === slot)) { pair[i] = null; took = { scheme: g, action: id }; } });
  }
  next[s][action]![slot] = code;
  commit(next);
  return { ok: true, took };
}
export function clearSlot(s: Scheme, action: string, slot: 0 | 1) { ensure(); const next = structuredClone(current()); next[s][action]![slot] = null; commit(next); }
export function resetScheme(s: Scheme) {
  ensure();
  const next = structuredClone(current());
  next[s] = structuredClone(DEFAULTS[s]);
  // A reset can bring back a default key the other VERSUS player took meanwhile: theirs gives way.
  for (const g of group(s)) if (g !== s) for (const pair of Object.values(next[g])) pair.forEach((c, i) => { if (c !== null && Object.values(next[s]).some(p => p.includes(c))) pair[i] = null; });
  commit(next);
}
export const isDefault = (s: Scheme) => JSON.stringify(current()[s]) === JSON.stringify(DEFAULTS[s]);

// ---- labels ------------------------------------------------------------------------------------------
const NAMES: Record<number, string> = {
  8: 'Backspace', 9: 'Tab', 13: 'Enter', 16: 'Shift', 17: 'Ctrl', 18: 'Alt', 20: 'Caps', 32: 'Space', 33: 'PgUp', 34: 'PgDn', 35: 'End', 36: 'Home',
  37: '←', 38: '↑', 39: '→', 40: '↓', 45: 'Ins', 46: 'Del', 91: 'Meta', 106: 'Num*', 107: 'Num+', 109: 'Num-', 110: 'Num.', 111: 'Num/',
  186: ';', 187: '=', 188: ',', 189: '-', 190: '.', 191: '/', 192: '`', 219: '[', 220: '\\', 221: ']', 222: "'",
};
export function keyLabel(code: number | null): string {
  if (code === null) return '—';
  if (NAMES[code]) return NAMES[code]!;
  if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90)) return String.fromCharCode(code);
  if (code >= 96 && code <= 105) return `Num${code - 96}`;
  if (code >= 112 && code <= 123) return `F${code - 111}`;
  return `#${code}`;
}
/** The first key bound to an action, for hints ("—" when unbound). */
export const key = (s: Scheme, action: string) => keyLabel(bound(s, action)[0] ?? null);

/** Every key bound to an action, joined ("J / X"). */
export const keys = (s: Scheme, action: string) => bound(s, action).map(keyLabel).join(' / ') || '—';

/** Story text written with the default keys ("CUT (K)", "HOLD J") → the player's keys. */
export function storyKeys(text: string) {
  return text.replace(/\(K\)/g, `(${key('story', 'ability')})`).replace(/\bHOLD J\b/g, `HOLD ${key('story', 'attack')}`).replace(/^K = /, `${key('story', 'ability')} = `);
}
/** Glossary story powers ("J", "hold J", "his K is…") → the player's attack / ability keys. */
export const storyLetters = (text: string) => text.replace(/\b[JK]\b/g, l => key('story', l === 'J' ? 'attack' : 'ability'));
const FIGHT_LETTER: Record<string, string> = { J: 'light', K: 'heavy', L: 'special', I: 'super', U: 'block' };
/** VERSUS move-list text written for P1's default keys (J K L I U) → P1's keys. */
export const fightKeys = (text: string) => text.replace(/\b[JKLIU]\b/g, l => key('p1', FIGHT_LETTER[l]!));

/** Re-render on rebinds. Server render and hydration describe the defaults; the saved binds apply right after. */
export function useKeybinds() { return useSyncExternalStore(subscribe, bindsVersion, () => 0); }
