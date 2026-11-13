import * as Phaser from 'phaser';
import { animKey, SPRITES } from '../assets/art';
import { sparks, wordPop } from '../fx/juice';

export type EnemyKind = 'stock-intern' | 'reply-all-drone' | 'infinite-monkey' | 'corporate-memphis-blob' | 'pop-up-ad' | 'buffering-wheel-minion';
type State = 'idle' | 'move' | 'telegraph' | 'attack' | 'recover' | 'hurt' | 'dead';

const STATS: Record<EnemyKind, { hp: number; speed: number; damage: number; flying: boolean; body: [number, number]; aggro: number; telegraphMs: number }> = {
  'stock-intern': { hp: 26, speed: 34, damage: 12, flying: false, body: [20, 34], aggro: 90, telegraphMs: 450 },
  'reply-all-drone': { hp: 14, speed: 50, damage: 10, flying: true, body: [18, 14], aggro: 130, telegraphMs: 400 },
  'infinite-monkey': { hp: 12, speed: 70, damage: 6, flying: false, body: [16, 18], aggro: 170, telegraphMs: 380 },
  'corporate-memphis-blob': { hp: 40, speed: 26, damage: 16, flying: false, body: [28, 30], aggro: 80, telegraphMs: 700 },
  'pop-up-ad': { hp: 10, speed: 60, damage: 9, flying: true, body: [24, 20], aggro: 150, telegraphMs: 350 },
  'buffering-wheel-minion': { hp: 8, speed: 70, damage: 7, flying: false, body: [12, 12], aggro: 200, telegraphMs: 300 },
};

export interface EnemyWorld {
  playerPos(): Phaser.Math.Vector2;
  lure(): Phaser.Math.Vector2 | null;
  shoot(x: number, y: number, vx: number, vy: number, texture: string): void;
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  readonly stats;
  mode: State = 'idle';
  private stateUntil = 0;
  private home: Phaser.Math.Vector2;
  private dir = 1;
  frozenUntil = 0;
  hackedUntil = 0;
  markedUntil = 0;
  private diveTarget = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number, readonly kind: EnemyKind, private world: EnemyWorld) {
    super(scene, x, y, kind);
    this.stats = STATS[kind];
    this.hp = this.stats.hp;
    this.home = new Phaser.Math.Vector2(x, y);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const size = SPRITES[kind]?.frameWidth ?? 32;
    const [bw, bh] = this.stats.body;
    this.setOrigin(0.5, 1).setDepth(10);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(bw, bh).setOffset((size - bw) / 2, size - bh);
    body.setAllowGravity(!this.stats.flying);
    this.play(animKey(kind, 'idle'));
  }

  get alive() { return this.mode !== 'dead'; }
  get dangerous() { const n = this.scene.time.now; return this.alive && n >= this.frozenUntil && n >= this.hackedUntil && this.mode !== 'hurt'; }

  private go(state: State, ms: number, anim = state === 'recover' ? 'idle' : state) {
    this.mode = state;
    this.stateUntil = this.scene.time.now + ms;
    const key = animKey(this.kind, anim);
    if (this.scene.anims.exists(key)) this.play(key, true);
  }

  hit(damage: number, fromX: number) {
    if (!this.alive) return false;
    const now = this.scene.time.now;
    const dmg = Math.round(damage * (now < this.markedUntil ? 1.5 : 1));
    this.hp -= dmg;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const away = Math.sign(this.x - fromX) || 1;
    if (now >= this.frozenUntil) body.setVelocity(away * 120, this.stats.flying ? -30 : -110);
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(70, () => { if (this.active) this.restoreTint(); });
    sparks(this.scene, this.x, this.y - this.height / 2);
    if (this.hp <= 0) { this.die(); return true; }
    this.go('hurt', 220);
    return true;
  }

  private die() {
    this.mode = 'dead';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    const key = animKey(this.kind, 'die');
    wordPop(this.scene, this.x, this.y - 20, 'POW', true);
    if (this.scene.anims.exists(key)) this.play(key);
    this.scene.tweens.add({ targets: this, alpha: 0, delay: 300, duration: 250, onComplete: () => this.destroy() });
  }

  restoreTint() {
    const now = this.scene.time.now;
    this.setTintMode(Phaser.TintModes.MULTIPLY);
    if (now < this.frozenUntil) this.setTint(0x8fa8ff);
    else if (now < this.hackedUntil) this.setTint(0x6aff8a);
    else if (now < this.markedUntil) this.setTint(0xff7ac0);
    else this.clearTint();
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (!this.alive) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (time < this.frozenUntil) { body.setVelocity(0, 0); body.setAllowGravity(false); this.anims.pause(); return; }
    if (!this.stats.flying) body.setAllowGravity(true);
    if (this.anims.isPaused) { this.anims.resume(); this.restoreTint(); }
    if (time < this.hackedUntil) { body.setVelocityX(0); if (this.stats.flying) body.setVelocityY(0); return; }

    const p = this.world.playerPos();
    const lure = this.world.lure();
    const target = lure ?? p;
    const dx = target.x - this.x, dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
    const s = this.stats;

    if (this.mode === 'hurt' && time < this.stateUntil) return;
    if (this.mode === 'hurt') this.go('recover', 200);

    // Lured by a money bag: walk over and stare at it lovingly. No attacks.
    if (lure) {
      this.setFlipX(dx < 0);
      if (Math.abs(dx) > 6) body.setVelocityX(Math.sign(dx) * s.speed * 1.4); else body.setVelocityX(0);
      if (s.flying) body.setVelocityY((lure.y - 20 - this.y) * 2);
      if (this.mode !== 'move') this.go('move', 0);
      return;
    }

    switch (this.mode) {
      case 'idle': case 'move': case 'recover': {
        if (this.mode === 'recover' && time < this.stateUntil) { body.setVelocityX(body.velocity.x * 0.9); return; }
        if (dist < s.aggro) { body.setVelocityX(0); if (s.flying) body.setVelocityY(0); this.setFlipX(dx < 0); this.go('telegraph', s.telegraphMs); return; }
        // patrol around home
        if (Math.abs(this.x - this.home.x) > 40) this.dir = Math.sign(this.home.x - this.x);
        if (body.blocked.left) this.dir = 1; if (body.blocked.right) this.dir = -1;
        body.setVelocityX(this.dir * s.speed * 0.5);
        if (s.flying) body.setVelocityY(Math.sin(time / 300) * 20 + (this.home.y - this.y));
        this.setFlipX(this.dir < 0);
        if (this.mode !== 'move') this.go('move', 0);
        return;
      }
      case 'telegraph':
        if (time < this.stateUntil) return;
        this.diveTarget.set(p.x, p.y - 12);
        this.go('attack', this.kind === 'infinite-monkey' ? 500 : 420);
        if (s.flying) this.scene.physics.moveTo(this, this.diveTarget.x, this.diveTarget.y, 210);
        else if (this.kind === 'infinite-monkey') {
          // Throws a crumpled draft in an arc, then hops back.
          const t = 0.7, vx = (p.x - this.x) / t, vy = (p.y - 20 - this.y) / t - 0.5 * 420 * t;
          this.world.shoot(this.x, this.y - 14, Phaser.Math.Clamp(vx, -220, 220), Math.max(-320, vy), 'paper');
          body.setVelocity(-Math.sign(dx) * 60, -140);
        }
        else body.setVelocityX(Math.sign(dx) * 190);
        return;
      case 'attack':
        if (time < this.stateUntil) return;
        body.setVelocityX(0); if (s.flying) body.setVelocityY(0);
        this.go('recover', 650);
        return;
    }
  }
}
