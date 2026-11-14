// Game feel: hitstop, shake, comic word pops, barks.
import * as Phaser from 'phaser';

export const FONT = '"Silkscreen", "Courier New", monospace';

let stopUntil = 0;
/** Freeze physics + anims for a few ms on impact. */
export function hitstop(scene: Phaser.Scene, ms: number) {
  const now = scene.time.now;
  if (now + ms <= stopUntil) return;
  const fresh = stopUntil < now;
  stopUntil = now + ms;
  if (!fresh) return;
  scene.physics.world.pause();
  scene.anims.pauseAll();
  const tick = () => {
    if (scene.time.now < stopUntil) { scene.time.delayedCall(stopUntil - scene.time.now, tick); return; }
    scene.physics.world.resume();
    scene.anims.resumeAll();
  };
  scene.time.delayedCall(ms, tick);
}
export const isStopped = (scene: Phaser.Scene) => scene.time.now < stopUntil;

export function shake(scene: Phaser.Scene, strength: number) {
  scene.cameras.main.shake(90 + strength * 20, 0.002 * strength);
}

const WORD_COLORS = ['#ff2f36', '#fecb56', '#3a6ea5', '#f2f1ec'];
/** A comic onomatopoeia that pops out and floats away. */
/** Astra's fx images that carry no lettering: drawn behind the word instead of replacing it. */
const BACKING = new Set(['fx-counter', 'fx-parry']);

export function wordPop(scene: Phaser.Scene, x: number, y: number, word: string, big = false) {
  // Astra's hand-lettered version wins when it exists (manifest image "fx-<slug>").
  const key = 'fx-' + word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (scene.textures.exists(key) && BACKING.has(key)) {
    // Wordless burst art (COUNTER's "!!", PARRY's glint): the burst goes behind and the word stays readable.
    const img = scene.add.image(x, y, key).setDepth(49).setAngle(Phaser.Math.Between(-12, 12)).setScale(big ? 0.6 : 0.4);
    scene.tweens.add({ targets: img, scale: big ? 1.3 : 1, duration: 90, ease: 'Back.Out' });
    scene.tweens.add({ targets: img, alpha: 0, scale: big ? 1.5 : 1.2, delay: 220, duration: 300, onComplete: () => img.destroy() });
  } else if (scene.textures.exists(key)) {
    const img = scene.add.image(x, y, key).setDepth(50).setAngle(Phaser.Math.Between(-10, 10)).setScale(big ? 0.5 : 0.25);
    scene.tweens.add({ targets: img, scale: big ? 1 : 0.75, duration: 90, ease: 'Back.Out' });
    scene.tweens.add({ targets: img, y: y - 16, alpha: 0, delay: 280, duration: 340, onComplete: () => img.destroy() });
    return;
  }
  const backed = scene.textures.exists(key) && BACKING.has(key);
  const color = backed ? '#f2f1ec' : WORD_COLORS[Math.floor(Math.random() * WORD_COLORS.length)]!;
  const t = scene.add.text(x, y, word, {
    fontFamily: FONT, fontSize: big ? '16px' : '10px', color, stroke: '#0f1014', strokeThickness: 3,
  }).setOrigin(0.5).setDepth(50).setAngle(Phaser.Math.Between(-14, 14)).setScale(0.3);
  scene.tweens.add({ targets: t, scale: 1, duration: 90, ease: 'Back.Out' });
  scene.tweens.add({ targets: t, y: y - 18, alpha: 0, delay: 260, duration: 360, onComplete: () => t.destroy() });
}

/** A short speech line above someone's head. */
export function bark(scene: Phaser.Scene, follow: Phaser.GameObjects.Components.Transform, text: string, dy = -52) {
  const cam = scene.cameras.main;
  // Keep the bubble on screen: flip below the speaker when it would leave the top.
  const y = () => { const top = follow.y + dy; return top - 14 < cam.worldView.y ? follow.y + Math.abs(dy) + 14 : top; };
  const t = scene.add.text(follow.x, y(), text, {
    fontFamily: FONT, fontSize: '8px', color: '#0f1014', backgroundColor: '#f2f1ec', padding: { x: 3, y: 2 },
  }).setOrigin(0.5, 1).setDepth(60);
  const track = () => t.setPosition(Math.round(Phaser.Math.Clamp(follow.x, cam.worldView.x + t.width / 2 + 2, cam.worldView.right - t.width / 2 - 2)), Math.round(y()));
  scene.events.on('postupdate', track);
  scene.time.delayedCall(1500, () => { scene.events.off('postupdate', track); t.destroy(); });
  return t;
}

/** Play a one-shot FX sprite from the manifest (e.g. "hit-spark"). Returns false if it doesn't exist. */
export function fx(scene: Phaser.Scene, key: string, x: number, y: number, depth = 40): boolean {
  const anim = `${key}:play`;
  if (!scene.anims.exists(anim)) return false;
  const s = scene.add.sprite(x, y, key).setDepth(depth);
  s.play(anim).once('animationcomplete', () => s.destroy());
  return true;
}

export function sparks(scene: Phaser.Scene, x: number, y: number, n = 6) {
  if (fx(scene, 'hit-spark', x, y)) return;
  for (let i = 0; i < n; i++) {
    const s = scene.add.image(x, y, 'spark').setDepth(40);
    const a = Math.random() * Math.PI * 2, d = 10 + Math.random() * 14;
    scene.tweens.add({ targets: s, x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, alpha: 0, scale: 0.4, duration: 220, onComplete: () => s.destroy() });
  }
}
