// Crew mechanics: numbers live here (Claude). Personality and lines live in /content (Gemini).
import type { CrewId } from '@qublox/shared';

export type AbilityId = 'hack' | 'bribe' | 'penTool' | 'fillBucket' | 'ctrlZ' | 'jumpCut' | 'cut' | 'mindGames';
export type AttackKind =
  | { type: 'melee'; range: number; height: number; damage: number; hits: number; word: string }
  | { type: 'ranged'; texture: 'cash' | 'paint'; speed: number; gravity: number; damage: number; word: string };

export type CrewDef = {
  id: CrewId; name: string; role: string; className: string; color: number;
  maxHp: number; runSpeed: number; jumpVelocity: number; doubleJump?: boolean;
  attack: AttackKind; attackCooldownMs: number;
  ability: AbilityId; abilityName: string; abilityCooldownMs: number;
  catchphrase: string;
  /** Hold-attack special (hold J ~0.55s). */
  special?: { kind: 'boulder' | 'infoDump'; name: string; cooldownMs: number };
};

export const CREW: Record<CrewId, CrewDef> = {
  ashwath: {
    id: 'ashwath', name: 'Ashwath', role: 'Developer', className: 'Backend Architect', color: 0x3a6ea5,
    maxHp: 100, runSpeed: 115, jumpVelocity: 310,
    attack: { type: 'melee', range: 26, height: 22, damage: 9, hits: 1, word: 'CLACK' }, attackCooldownMs: 230,
    ability: 'hack', abilityName: 'HACK', abilityCooldownMs: 6000, catchphrase: 'Oyeee pagaalllll!',
    special: { kind: 'infoDump', name: 'INFO DUMP', cooldownMs: 9000 },
  },
  sayam: {
    id: 'sayam', name: 'Sayam', role: 'CEO', className: 'Boss', color: 0x1d7a3a,
    maxHp: 90, runSpeed: 105, jumpVelocity: 255,
    attack: { type: 'ranged', texture: 'cash', speed: 260, gravity: 0, damage: 7, word: 'LE RE' }, attackCooldownMs: 330,
    ability: 'bribe', abilityName: 'BRIBE', abilityCooldownMs: 8000, catchphrase: 'Le re.',
  },
  mansukh: {
    id: 'mansukh', name: 'Mansukh', role: 'Graphic Designer', className: 'Builder', color: 0xff8a1f,
    maxHp: 100, runSpeed: 112, jumpVelocity: 305,
    attack: { type: 'melee', range: 30, height: 14, damage: 8, hits: 1, word: 'STAB' }, attackCooldownMs: 260,
    ability: 'penTool', abilityName: 'PEN TOOL', abilityCooldownMs: 7000, catchphrase: 'Babymonnsterrr!',
  },
  manya: {
    id: 'manya', name: 'Manya', role: 'Graphic Designer', className: 'Colorist', color: 0xd63a8f,
    maxHp: 95, runSpeed: 112, jumpVelocity: 305,
    attack: { type: 'ranged', texture: 'paint', speed: 200, gravity: 500, damage: 8, word: 'SPLAT' }, attackCooldownMs: 360,
    ability: 'fillBucket', abilityName: 'FILL', abilityCooldownMs: 3000, catchphrase: '…',
  },
  sehaj: {
    id: 'sehaj', name: 'Sehaj', role: 'Video Editor', className: 'Time-bender', color: 0x7a3ad6,
    maxHp: 100, runSpeed: 110, jumpVelocity: 300,
    attack: { type: 'melee', range: 32, height: 18, damage: 11, hits: 1, word: 'VAJJJ!' }, attackCooldownMs: 300,
    ability: 'ctrlZ', abilityName: 'CTRL+Z', abilityCooldownMs: 10000, catchphrase: 'Vajjj!',
    special: { kind: 'boulder', name: 'BEAST MODE', cooldownMs: 8000 },
  },
  brahmansh: {
    id: 'brahmansh', name: 'Brahmansh', role: 'Video Editor', className: 'Rogue', color: 0xe8242c,
    maxHp: 70, runSpeed: 130, jumpVelocity: 300, doubleJump: true,
    attack: { type: 'melee', range: 24, height: 18, damage: 6, hits: 1, word: 'SNIP' }, attackCooldownMs: 150,
    ability: 'jumpCut', abilityName: 'JUMP CUT', abilityCooldownMs: 4000, catchphrase: '…',
  },
  tushar: {
    id: 'tushar', name: 'Tushar', role: 'Director + DP', className: 'Controller', color: 0xfecb56,
    maxHp: 110, runSpeed: 108, jumpVelocity: 295,
    attack: { type: 'melee', range: 28, height: 20, damage: 10, hits: 1, word: 'BONK' }, attackCooldownMs: 320,
    ability: 'cut', abilityName: 'CUT!', abilityCooldownMs: 12000, catchphrase: 'I hate monkeys.',
  },
  manvi: {
    id: 'manvi', name: 'Manvi', role: 'Creative + Comms', className: 'Psychologist', color: 0xff5a7a,
    maxHp: 95, runSpeed: 116, jumpVelocity: 305,
    attack: { type: 'melee', range: 26, height: 20, damage: 8, hits: 1, word: 'HAWWW' }, attackCooldownMs: 260,
    ability: 'mindGames', abilityName: 'MIND GAMES', abilityCooldownMs: 9000, catchphrase: 'Yippieeee!',
  },
};

/** Couples: tag-swapping directly between the two triggers a COUPLE MOVE (see GameScene.coupleMove). */
export const COUPLES: [CrewId, CrewId][] = [['sehaj', 'manvi']];
export const partnerOf = (id: CrewId): CrewId | null => COUPLES.find(c => c.includes(id))?.find(x => x !== id) ?? null;
export const COUPLE_COOLDOWN_MS = 20000;

/** Ashwath's NIGHT OWL passive: his real commit hours (1–4 AM, local clock) buff him. */
export const isNightOwlHour = (d = new Date()) => d.getHours() >= 1 && d.getHours() < 4;

export const DEFAULT_PARTY: CrewId[] = ['ashwath', 'sayam', 'tushar'];
export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0');
