// The player: one physics body, three crew members. Swapping changes who's "wearing" it,
// so momentum carries through a swap for free.
import * as Phaser from 'phaser';
import type { CrewId } from '@qublox/shared';
import { animKey, SPRITES } from '../assets/art';
import { CREW, type CrewDef } from '../crew';
import type { InputFrame } from '../input/InputSource';

export type Member = { def: CrewDef; hp: number; ko: boolean; abilityReadyAt: number; attackReadyAt: number };
type Snapshot = { t: number; x: number; y: number; hp: number };

const GRAVITY = 900;
const COYOTE_MS = 90;
const BUFFER_MS = 110;
const ACCEL = 1100, DECEL = 1400, AIR_CONTROL = 0.75;

export class Avatar extends Phaser.Physics.Arcade.Sprite {
  members: Member[];
  slot = 0;
  facing: 1 | -1 = 1;
  private lastGrounded = 0;
  private jumpBufferedAt = -1;
  private airJumps = 0;
  /** One tag hop per airtime: swapping in mid-air gives the incoming member a small boost. */
  private tagHopReady = false;
  invulnUntil = 0;
  actionUntil = 0;
  private actionAnim: string | null = null;
  hurtUntil = 0;
  panicUntil = 0;
  /** Hit by a Buffering Wheel pulse: you "buffer" (slow, no jumping). */
  lagUntil = 0;
  /** External horizontal push (turbine wind), px/s. Set by the scene every frame. */
  wind = 0;
  /** Until when an external launch (bounce pad, hazard knock-up) ignores the short-hop jump cut. */
  launchUntil = 0;
  delegationUntil = 0;
  /** Mansukh's STAN MODE (see GameScene.stanMode). */
  stanUntil = 0;
  private history: Snapshot[] = [];
  private lastSnap = 0;
  private wasGrounded = true;
  private fallSpeed = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, party: CrewId[]) {
    super(scene, x, y, party[0]!);
    this.members = party.map(id => ({ def: CREW[id], hp: CREW[id].maxHp, ko: false, abilityReadyAt: 0, attackReadyAt: 0 }));
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1).setDepth(20);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(14, 34).setOffset(17, 14).setMaxVelocity(400, 520).setGravityY(GRAVITY - (scene.physics.world.gravity.y));
    this.applyLook();
  }

  get member() { return this.members[this.slot]!; }

  addMember(id: CrewId) {
    if (this.members.some(m => m.def.id === id) || this.members.length >= 3) return false;
    this.members.push({ def: CREW[id], hp: CREW[id].maxHp, ko: false, abilityReadyAt: 0, attackReadyAt: 0 });
    return true;
  }
  /** Re-apply HP/KO carried over from the previous room. */
  restore(carried: { id: CrewId; hp: number; ko: boolean }[], slot: number) {
    for (const c of carried) { const m = this.members.find(x => x.def.id === c.id); if (m) { m.hp = c.hp; m.ko = c.ko; } }
    const alive = this.members.findIndex(m => !m.ko);
    this.slot = this.members[slot] && !this.members[slot]!.ko ? slot : Math.max(0, alive);
    this.applyLook();
  }
  get def() { return this.member.def; }
  get pbody() { return this.body as Phaser.Physics.Arcade.Body; }
  get grounded() { return this.pbody.blocked.down || this.pbody.touching.down; }
  get rewindPoint(): Snapshot | undefined { return this.history[0]; }

  private applyLook() {
    this.setTexture(this.def.id);
    this.playAnim('idle', true);
  }

  playAnim(anim: string, force = false) {
    const id = this.def.id;
    const key = this.scene.anims.exists(animKey(id, anim)) ? animKey(id, anim) : animKey(id, 'idle');
    if (force || this.anims.currentAnim?.key !== key) this.play(key, true);
  }

  /** Duration of an animation in ms (used to time attack hits to the art's hitFrame). */
  animMs(anim: string, fallback: number) {
    const a = SPRITES[this.def.id]?.anims[anim];
    return a ? (a.frames / a.fps) * 1000 : fallback;
  }
  hitDelay(fallback: number) {
    const a = SPRITES[this.def.id]?.anims.attack;
    return a?.hitFrame !== undefined ? (a.hitFrame / a.fps) * 1000 : fallback;
  }

  doAction(anim: string, ms: number) {
    this.actionAnim = anim;
    this.actionUntil = this.scene.time.now + ms;
    this.playAnim(anim, true);
  }

  /** Switch to party slot `i`. Returns false if that member can't come in. */
  swapTo(i: number): boolean {
    const m = this.members[i];
    if (!m || i === this.slot || m.ko) return false;
    if (this.def.id === 'sayam') this.delegationUntil = this.scene.time.now + 3000;
    this.slot = i;
    this.applyLook();
    // Tag hop: the incoming member kicks off the outgoing one, once per airtime (reaches ~4.5-tile ledges).
    if (!this.grounded && this.tagHopReady) {
      this.tagHopReady = false;
      if (this.pbody.velocity.y > -this.def.jumpVelocity * 0.7) { this.launch(-this.def.jumpVelocity * 0.7); this.emit('taghop'); }
    }
    this.invulnUntil = Math.max(this.invulnUntil, this.scene.time.now + 300);
    this.doAction('tagin', Math.min(400, this.animMs('tagin', 260)));
    return true;
  }
  nextAlive(step: 1 | -1): number {
    for (let k = 1; k < this.members.length; k++) {
      const i = (this.slot + step * k + this.members.length * 3) % this.members.length;
      if (!this.members[i]!.ko) return i;
    }
    return -1;
  }

  /** Movement + timers. Combat/abilities are handled by the scene, which owns the world. */
  step(f: InputFrame, time: number) {
    const body = this.pbody;
    if (time < this.panicUntil) { const l = f.left; f.left = f.right; f.right = l; }
    const grounded = this.grounded;
    if (grounded && !this.wasGrounded && body.velocity.y >= 0 && this.fallSpeed > 180) this.emit('land', this.fallSpeed);
    this.wasGrounded = grounded;
    this.fallSpeed = body.velocity.y;
    if (grounded) { this.lastGrounded = time; this.airJumps = this.def.doubleJump ? 1 : 0; this.tagHopReady = true; }

    const dir = (f.right ? 1 : 0) - (f.left ? 1 : 0);
    const hurt = time < this.hurtUntil;
    const lag = time < this.lagUntil;
    const target = hurt ? body.velocity.x : dir * this.def.runSpeed * (lag ? 0.4 : 1) * (this.def.id === 'mansukh' && this.scene.time.now < this.stanUntil ? 1.25 : 1) + this.wind;
    const accel = (dir !== 0 ? ACCEL : DECEL) * (grounded ? 1 : AIR_CONTROL);
    const maxStep = accel * Math.min(this.scene.game.loop.delta, 50) / 1000;
    body.setVelocityX(body.velocity.x + Phaser.Math.Clamp(target - body.velocity.x, -maxStep, maxStep));
    if (dir !== 0 && time >= this.actionUntil) this.facing = dir as 1 | -1;
    this.setFlipX(this.facing < 0);

    // Jumping: buffer + coyote time + variable height + optional double jump.
    if (f.jumpPressed) this.jumpBufferedAt = time;
    const buffered = time - this.jumpBufferedAt <= BUFFER_MS;
    if (buffered && !hurt && !lag) {
      if (time - this.lastGrounded <= COYOTE_MS) {
        body.setVelocityY(-this.def.jumpVelocity); this.jumpBufferedAt = -1; this.lastGrounded = -1; this.emit('jump');
      } else if (this.airJumps > 0 && f.jumpPressed) {
        body.setVelocityY(-this.def.jumpVelocity * 0.9); this.airJumps--; this.jumpBufferedAt = -1; this.emit('jump');
      }
    }
    if (!f.jumpHeld && body.velocity.y < -120 && time > this.launchUntil) body.setVelocityY(body.velocity.y * 0.55);

    // Rewind history for CTRL+Z (3 s, sampled every 100 ms).
    if (time - this.lastSnap >= 100) {
      this.lastSnap = time;
      this.history.push({ t: time, x: this.x, y: this.y, hp: this.member.hp });
      while (this.history.length > 30) this.history.shift();
    }

    // Blink while invulnerable.
    this.setAlpha(time < this.invulnUntil && Math.floor(time / 60) % 2 ? 0.45 : 1);
    if (lag) this.setTint(Math.floor(time / 120) % 2 ? 0x9a9ba4 : 0xffffff); else if (this.tintTopLeft !== 0xffffff) this.clearTint();

    // Animation priority: action > hurt > air > run > idle.
    if (time < this.actionUntil && this.actionAnim) return;
    if (time < this.panicUntil && this.scene.anims.exists(animKey(this.def.id, 'panic'))) return this.playAnim('panic');
    if (hurt) return this.playAnim('hurt');
    if (!grounded) return this.playAnim(body.velocity.y < 0 ? 'jump' : 'fall');
    this.playAnim(Math.abs(body.velocity.x) > 12 ? 'run' : 'idle');
  }

  clearHistory() { this.history = []; }

  /** Throw the avatar upward (bounce pads etc.) without the variable-jump cut eating it. */
  launch(vy: number) { this.pbody.setVelocityY(vy); this.launchUntil = this.scene.time.now + 600; }
}
