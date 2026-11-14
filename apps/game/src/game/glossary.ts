// Crew Glossary: what each power actually DOES in story mode. Mechanics are Claude's (they track the code in
// crew.ts / GameScene.ts); Gemini's personality copy lives in content/story/glossary.json; VERSUS moves come
// straight from the fight sim's moveList(). Keep these in sync when a power changes.
import type { CrewId } from '@qublox/shared';
import { CREW } from './crew';

export type Power = { input: string; name: string; text: string; tag?: 'attack' | 'ability' | 'special' | 'passive' | 'weakness' };

const sec = (ms: number) => `${ms / 1000}s`;

const POWERS: Record<CrewId, Power[]> = {
  ashwath: [
    { input: 'J', name: 'Keyboard combo', text: 'Close-range CLACK. Hits harder between 1 and 4 AM.', tag: 'attack' },
    { input: 'K', name: 'HACK', text: 'Toggles a terminal, door, turret or camera in range. Hacked drones fight for you for 5s.', tag: 'ability' },
    { input: 'hold J', name: 'INFO DUMP', text: 'Explains distributed systems at 2× speed: 6 ticks of psychic damage around him, enemies back off.', tag: 'special' },
    { input: 'passive', name: "MENTOR'S AURA", text: 'While he is conscious, the whole party recharges abilities 10% faster.', tag: 'passive' },
    { input: 'passive', name: 'NIGHT OWL', text: 'Real clock 1–4 AM: +25% damage, −25% recharge. His actual commit hours.', tag: 'passive' },
    { input: 'idle', name: 'COSMIC EXISTENTIALIST', text: 'Stand still long enough and he starts staring at the sky. Try the EP0 balcony telescope.', tag: 'passive' },
  ],
  sayam: [
    { input: 'J', name: 'One-liners', text: 'Throws speech bubbles of pure slang: BHAI, NO CAP, FR FR, LE RE, BRUH.', tag: 'attack' },
    { input: 'K', name: 'SMOOTH TALK', text: 'Sets down a hype speaker and starts talking: enemies crowd round to listen, toll bots get talked into opening.', tag: 'ability' },
    { input: 'hold J', name: 'BHAI, LISTEN', text: 'Cycles his 10 personalities: PHILOSOPHER (enemies stop to listen) · HYPE (party +30% dmg) · ROAST (marks a target) · EMPATH (party +15 HP).', tag: 'special' },
    { input: 'passive', name: 'DELEGATION', text: 'Swapping out of Sayam gives the next crew member +30% damage for 3s.', tag: 'passive' },
    { input: 'weakness', name: "I DON'T DO MANUAL WORK", text: 'Weakest jump in the crew.', tag: 'weakness' },
  ],
  tushar: [
    { input: 'J', name: 'Clapperboard smack', text: 'BONK. The tank: most HP in the crew.', tag: 'attack' },
    { input: 'K', name: 'CUT!', text: '“Shaanttt hojaaa.” Freeze-frames every enemy, projectile, fan and moving platform on screen for 3s.', tag: 'ability' },
    { input: 'hold J', name: "FINE, I'LL DO IT MYSELF", text: 'Recharges every crew ability, then runs the job himself: for 8s his K is the power of whoever he tagged in for. Side effect: +25% damage taken.', tag: 'special' },
    { input: 'passive', name: 'SILENT OBSERVER', text: 'While he’s active, hidden Lost Footage and cracked walls nearby glint off his bracelet.', tag: 'passive' },
    { input: 'passive', name: 'CAMERA FLASH', text: 'Tagging him in flashes the camera and stuns anything close.', tag: 'passive' },
    { input: 'weakness', name: 'MONKEYS', text: 'He hates monkeys. Monkeys know.', tag: 'weakness' },
  ],
  sehaj: [
    { input: 'J', name: 'Razor-tool slash', text: 'VAJJ. Heavy hitter.', tag: 'attack' },
    { input: 'K', name: 'CTRL+Z', text: 'Rewinds himself or an object 3 seconds: rebuild a bridge, reset a block, undo damage.', tag: 'ability' },
    { input: 'hold J', name: 'BEAST MODE', text: 'Gym rat. The shirt goes, a boulder comes up, a boulder goes out. The only thing that smashes cracked walls.', tag: 'special' },
    { input: 'swap', name: 'COUPLE MOVE', text: 'Swap straight between Sehaj and Manvi: heart pose, heart shockwave, party heal.', tag: 'passive' },
    { input: 'weakness', name: 'RENDER BAR', text: 'The longest cooldown in the game. Always waiting on a render.', tag: 'weakness' },
  ],
  manvi: [
    { input: 'J', name: 'Mic-tap', text: 'HAWWW.', tag: 'attack' },
    { input: 'K', name: 'MIND GAMES', text: 'A KO’d crew member gets a pep talk and revives at 40% HP; nearby enemies get confused and bonk each other.', tag: 'ability' },
    { input: 'swap', name: 'COUPLE MOVE', text: 'Swap straight between Manvi and Sehaj: heart pose, heart shockwave, party heal.', tag: 'passive' },
    { input: 'weakness', name: 'NO CODE', text: 'She studies psychology, not JavaScript. Terminals are off-limits.', tag: 'weakness' },
  ],
  mansukh: [
    { input: 'J', name: 'Pencil jab', text: 'MULTITASKING (UNSTABLE): every swing is a different hobby. STAB, TWEAK, NEW TAB, GG EZ, REMIX.', tag: 'attack' },
    { input: 'K', name: 'PEN TOOL', text: 'Two anchor points, one vector platform. Lasts a few seconds.', tag: 'ability' },
    { input: 'hold J', name: 'STAN MODE', text: 'BABYMONSTER comes on in his headphones. Lightstick out: double damage, longer reach, faster feet for 8s.', tag: 'special' },
    { input: 'tag in', name: 'RAGEBAIT', text: 'Arrives already baiting: nearby enemies lose their cool and take +50% damage for 3s.', tag: 'passive' },
    { input: 'idle', name: 'IDEAL PROCRASTINATION', text: 'Stand still and he opens a new project instead of finishing this one.', tag: 'passive' },
  ],
  manya: [
    { input: 'J', name: 'Paint splat', text: 'Ranged arc. Splatted enemies are marked and take extra damage.', tag: 'attack' },
    { input: 'K', name: 'FILL', text: 'Recolours an object: red = solid, blue = passable, yellow = bouncy.', tag: 'ability' },
    { input: 'weakness', name: 'BEIGE', text: 'Beige enemies resist her paint. Personally offensive.', tag: 'weakness' },
  ],
  mishthi: [
    { input: 'J', name: 'Improvised prop toss', text: 'Lobs whatever was lying around: a vase, fairy lights, a glue gun. It’s art now.', tag: 'attack' },
    { input: 'K', name: 'MASTERPIECE', text: 'Turns the nearest enemy into a framed art installation for 6s: frozen, harmless, and you can stand on it. Bosses get CRITIQUED instead.', tag: 'ability' },
    { input: 'hold J', name: 'AS IF I CARE?', text: '3.5s of total indifference: nothing hurts her, and anything that touches her gets demoralised.', tag: 'special' },
    { input: 'tag in', name: 'SECRETLY CARING', text: 'Whoever she tags in for gets patched up (+8 HP). She’ll deny it.', tag: 'passive' },
    { input: 'idle', name: 'DRAMATIC SIGH', text: 'Leave her standing and the drama arrives on schedule.', tag: 'passive' },
  ],
  brahmansh: [
    { input: 'J', name: 'Timeline-blade combo', text: 'SNIP. The fastest attack in the crew.', tag: 'attack' },
    { input: 'K', name: 'JUMP CUT', text: 'Instant short teleport through thin walls and enemies.', tag: 'ability' },
    { input: 'hold J', name: 'UNHINGED', text: 'After-party Brahmansh: a chain of jump-cut strikes through everything nearby. The camera can’t cope. HOUSE OF SHAKES.', tag: 'special' },
    { input: 'passive', name: 'ATTENTION TO DETAIL', text: 'Hit an enemy mid wind-up: FRAME PERFECT, double damage. He saw the bad frame.', tag: 'passive' },
    { input: 'passive', name: 'EASILY ANNOYED', text: 'Two hits in 4s and he’s ANNOYED: +30% damage for 5s.', tag: 'passive' },
    { input: 'passive', name: 'DOUBLE JUMP', text: 'The only one who can.', tag: 'passive' },
    { input: 'weakness', name: 'GLASS CANNON', text: 'The lowest HP in the crew.', tag: 'weakness' },
  ],
};

/** Story-mode powers, with live cooldowns from CREW. */
export function storyPowers(id: CrewId): Power[] {
  const c = CREW[id];
  return POWERS[id].map(p => p.tag === 'ability' ? { ...p, input: `K · ${sec(c.abilityCooldownMs)}` }
    : p.tag === 'special' && c.special ? { ...p, input: `hold J · ${sec(c.special.cooldownMs)}` } : p);
}

/** 0..1 bars for the dossier (relative to the crew's range). */
export function stats(id: CrewId) {
  const all = Object.values(CREW);
  const norm = (v: number, k: (c: (typeof all)[number]) => number) => {
    const xs = all.map(k), lo = Math.min(...xs), hi = Math.max(...xs);
    return hi === lo ? 0.5 : 0.25 + 0.75 * (v - lo) / (hi - lo);
  };
  const c = CREW[id];
  return [
    { label: 'HP', v: norm(c.maxHp, x => x.maxHp) },
    { label: 'Speed', v: norm(c.runSpeed, x => x.runSpeed) },
    { label: 'Jump', v: norm(c.jumpVelocity + (c.doubleJump ? 120 : 0), x => x.jumpVelocity + (x.doubleJump ? 120 : 0)) },
  ];
}
