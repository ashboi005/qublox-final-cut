// Bosses share one base: HP, hack-only shield phases, CUT! resistance, hit flashes and death.
// Each boss subclass only writes its attack pattern in `think()`.
import * as Phaser from 'phaser';
import { animKey, SPRITES } from '../assets/art';
import { sparks, wordPop } from '../fx/juice';

export interface BossWorld {
  playerPos(): Phaser.Math.Vector2;
  arena(): Phaser.Geom.Rectangle;
  /** Enemy projectile. `kind` picks texture + behaviour ("email", "lag-spike", "pulse"). */
  spawnShot(x: number, y: number, vx: number, vy: number, kind?: string): void;
  spawnMinion(x: number, y: number, kind?: string): void;
  minions(): number;
  onPhase(phase: 'shield-up' | 'shield-down' | 'attack' | 'defeated'): void;
}

export abstract class BossBase extends Phaser.Physics.Arcade.Sprite {
  abstract readonly title: string;
  abstract readonly maxHp: number;
  hp = 0;
  mode = 'intro';
  protected until = 0;
  shielded = false;
  protected shieldsLeft = [0.66, 0.33];
  protected ring: Phaser.GameObjects.Arc;
  frozenUntil = 0;
  hackedUntil = 0;
  markedUntil = 0;
  readonly kind = 'boss';
  readonly stats = { damage: 14 };
  /** True while the boss is open to punishment (grounded, stunned…): 1.5× damage. */
  protected vulnerable = false;
  protected shieldWord = 'CC: LEGAL';
  /** What drops this boss's shield: Ashwath's HACK (or an arena terminal), or Manya's paint. */
  shieldBreaker: 'hack' | 'paint' | 'jumpcut' | 'style' = 'hack';
  /** How many shields have been broken so far (finale phases key off this). */
  shieldsBroken = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, readonly key: string, protected world: BossWorld) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const size = SPRITES[key]?.frameWidth ?? 96;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false).setSize(size * 0.7, size * 0.55).setOffset(size * 0.15, size * 0.22);
    this.setDepth(12);
    this.ring = scene.add.circle(x, y, size * 0.55).setStrokeStyle(2, 0x6aff8a, 0.9).setVisible(false).setDepth(13);
    this.anim('idle');
  }

  get alive() { return this.mode !== 'dead'; }
  abstract get dangerous(): boolean;

  start() { if (this.mode === 'intro') this.go('idle', 900); }

  protected anim(name: string) {
    const key = animKey(this.key, name);
    if (this.scene.anims.exists(key)) this.play(key, true);
  }
  protected abstract animFor(mode: string): string;
  protected go(mode: string, ms: number) {
    this.mode = mode;
    this.until = this.scene.time.now + ms;
    this.anim(this.animFor(mode));
  }

  restoreTint() {
    const now = this.scene.time.now;
    this.setTintMode(Phaser.TintModes.MULTIPLY);
    if (now < this.frozenUntil) this.setTint(0x8fa8ff);
    else if (this.shielded) this.setTint(0xb8ffcc);
    else this.clearTint();
  }

  /** CUT! / the tag-in flash. Bosses resist: half duration. */
  freeze(ms: number) { this.frozenUntil = Math.max(this.frozenUntil, this.scene.time.now + ms / 2); this.restoreTint(); }

  dropShield() {
    if (!this.shielded) return false;
    this.shielded = false;
    this.shieldsBroken++;
    this.ring.setVisible(false);
    wordPop(this.scene, this.x, this.y - 30, this.shieldBreaker === 'style' ? 'OVERLOAD' : 'PWNED', true);
    this.world.onPhase('shield-down');
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(0, 0);
    this.onShieldDown();
    this.restoreTint();
    return true;
  }
  protected abstract onShieldDown(): void;
  protected abstract onShieldUp(): void;

  hit(damage: number, _fromX: number): boolean {
    if (!this.alive || this.mode === 'intro') return false;
    if (this.shielded) { wordPop(this.scene, this.x + Phaser.Math.Between(-10, 10), this.y - 20, this.shieldWord); return false; }
    const now = this.scene.time.now;
    const mult = (this.vulnerable ? 1.5 : 1) * (now < this.markedUntil ? 1.5 : 1);
    this.hp = Math.max(0, this.hp - Math.round(damage * mult));
    this.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.scene.time.delayedCall(60, () => this.active && this.restoreTint());
    sparks(this.scene, this.x + Phaser.Math.Between(-12, 12), this.y + Phaser.Math.Between(-8, 8));
    if (this.hp <= 0) { this.die(); return true; }
    if (this.shieldsLeft.length && this.hp / this.maxHp <= this.shieldsLeft[0]!) {
      // A burst that skips past several thresholds still only raises one shield.
      while (this.shieldsLeft.length && this.hp / this.maxHp <= this.shieldsLeft[0]!) this.shieldsLeft.shift();
      this.shielded = true;
      this.ring.setVisible(true);
      this.world.onPhase('shield-up');
      this.restoreTint();
      this.onShieldUp();
    }
    return true;
  }

  private die() {
    this.mode = 'dead';
    this.ring.destroy();
    (this.body as Phaser.Physics.Arcade.Body).enable = false;
    this.anim('die');
    for (let i = 0; i < 8; i++) this.scene.time.delayedCall(i * 120, () => sparks(this.scene, this.x + Phaser.Math.Between(-30, 30), this.y + Phaser.Math.Between(-20, 20)));
    this.scene.tweens.add({ targets: this, alpha: 0, y: this.y + 40, delay: 900, duration: 600 });
    this.world.onPhase('defeated');
  }

  override preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    this.ring.setPosition(this.x, this.y);
    if (!this.alive || this.mode === 'intro') return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (time < this.frozenUntil) { body.setVelocity(0, 0); this.anims.pause(); return; }
    if (this.anims.isPaused) { this.anims.resume(); this.restoreTint(); }
    this.think(time, body, this.world.arena(), this.world.playerPos(), time >= this.until);
  }
  protected abstract think(time: number, body: Phaser.Physics.Arcade.Body, arena: Phaser.Geom.Rectangle, p: Phaser.Math.Vector2, done: boolean): void;
}

// ---------------------------------------------------------------------------
/** EP0: Spray (email volleys) · Dive (vulnerable on landing) · Summon (drones). */
export class ReplyAllMothership extends BossBase {
  readonly title = 'Reply-All Mothership';
  readonly maxHp = 360;
  private next: 'spray' | 'dive' | 'summon' = 'spray';
  private volleys = 0;
  private diveX = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, world: BossWorld) { super(scene, x, y, 'reply-all-mothership', world); this.hp = this.maxHp; }
  get dangerous() { return this.mode === 'dive' || this.mode === 'grounded'; }
  protected animFor(mode: string) { return ({ telegraph: 'telegraph', spray: 'attack-spray', dive: 'attack-dive', grounded: 'attack-dive', stunned: 'hurt' } as Record<string, string>)[mode] ?? 'idle'; }
  protected onShieldDown() { this.go('stunned', 2200); }
  protected onShieldUp() { if (this.mode === 'grounded' || this.mode === 'stunned') this.go('rise', 600); }

  protected think(time: number, body: Phaser.Physics.Arcade.Body, arena: Phaser.Geom.Rectangle, p: Phaser.Math.Vector2, done: boolean) {
    const hoverY = arena.top + 56;
    this.vulnerable = this.mode === 'grounded' || this.mode === 'stunned';
    switch (this.mode) {
      case 'idle': {
        const tx = Phaser.Math.Clamp(p.x + Math.sin(time / 700) * 80, arena.left + 50, arena.right - 50);
        body.setVelocity((tx - this.x) * 1.2, (hoverY + Math.sin(time / 400) * 8 - this.y) * 3);
        if (!done) return;
        const roll = Math.random();
        this.next = this.shielded ? (roll < 0.7 ? 'spray' : 'summon') : this.world.minions() < 2 && roll < 0.25 ? 'summon' : roll < 0.6 ? 'spray' : 'dive';
        body.setVelocity(0, 0);
        this.go('telegraph', this.next === 'dive' ? 550 : 650);
        this.world.onPhase('attack');
        return;
      }
      case 'telegraph':
        body.setVelocity(0, 0);
        if (!done) return;
        if (this.next === 'spray') { this.volleys = this.shielded ? 4 : 3; this.go('spray', 0); }
        else if (this.next === 'dive') { this.diveX = p.x; this.go('dive', 1600); }
        else this.go('summon', 500);
        return;
      case 'spray':
        if (!done) return;
        if (this.volleys-- <= 0) { this.go('idle', this.shielded ? 900 : 1300); return; }
        for (let i = 0; i < 5; i++) {
          const a = Phaser.Math.DegToRad(50 + i * 20 + (this.volleys % 2) * 10);
          this.world.spawnShot(this.x, this.y + 18, Math.cos(a) * 115, Math.sin(a) * 115, 'email');
        }
        this.until = time + 320;
        return;
      case 'dive': {
        const floor = arena.bottom - 30;
        body.setVelocity((this.diveX - this.x) * 3, 320);
        if (this.y >= floor || done) { this.y = Math.min(this.y, floor); body.setVelocity(0, 0); this.go('grounded', 950); this.scene.cameras.main.shake(160, 0.006); }
        return;
      }
      case 'grounded':
        body.setVelocity(0, 0);
        if (done) this.go('rise', 900);
        return;
      case 'rise':
        body.setVelocity(0, (hoverY - this.y) * 3);
        if (done || Math.abs(this.y - hoverY) < 4) this.go('idle', 700);
        return;
      case 'summon':
        if (!done) return;
        for (const dx of [-40, 40]) if (this.world.minions() < 4) this.world.spawnMinion(this.x + dx, this.y);
        this.go('idle', 1200);
        return;
      case 'stunned':
        body.setVelocity(0, Math.min(140, (arena.bottom - 40 - this.y) * 2));
        if (done) this.go('rise', 900);
        return;
    }
  }
}

// ---------------------------------------------------------------------------
/** EP1: Lag spikes (radial bursts Sehaj can CTRL+Z back at it) · Freeze pulse (makes you buffer) · Minion wheels.
 *  Shield phases = overheated cooling pylons: HACK a pylon terminal to expose the core. */
export class BufferingWheel extends BossBase {
  readonly title = 'The Buffering Wheel';
  readonly maxHp = 420;
  private next: 'spikes' | 'pulse' | 'minions' = 'spikes';
  private bursts = 0;
  private spin = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, world: BossWorld) {
    super(scene, x, y, 'buffering-wheel', world);
    this.hp = this.maxHp;
    this.shieldWord = 'BUFFERING…';
  }
  get dangerous() { return false; }
  protected animFor(mode: string) { return ({ telegraph: 'telegraph', spikes: 'attack-lag-spike', pulse: 'attack-freeze-pulse', stunned: 'stunned' } as Record<string, string>)[mode] ?? 'idle'; }
  protected onShieldDown() { this.go('stunned', 2600); }
  protected onShieldUp() { this.go('idle', 600); }

  protected think(time: number, body: Phaser.Physics.Arcade.Body, arena: Phaser.Geom.Rectangle, _p: Phaser.Math.Vector2, done: boolean) {
    const cx = arena.centerX, cy = arena.top + 70;
    this.vulnerable = this.mode === 'stunned';
    if (!this.scene.anims.exists(animKey(this.key, 'idle'))) this.angle += 4; // placeholder spin
    switch (this.mode) {
      case 'idle': {
        // drifts in a slow figure-eight over the arena
        const tx = cx + Math.sin(time / 1300) * (arena.width / 2 - 70), ty = cy + Math.sin(time / 650) * 20;
        body.setVelocity((tx - this.x) * 1.5, (ty - this.y) * 1.5);
        if (!done) return;
        const roll = Math.random();
        this.next = this.world.minions() < 2 && roll < 0.25 ? 'minions' : roll < 0.65 ? 'spikes' : 'pulse';
        body.setVelocity(0, 0);
        this.go('telegraph', 700);
        this.world.onPhase('attack');
        return;
      }
      case 'telegraph':
        body.setVelocity(0, 0);
        if (!done) return;
        if (this.next === 'spikes') { this.bursts = this.shielded ? 3 : 2; this.go('spikes', 0); }
        else if (this.next === 'pulse') {
          this.go('pulse', 900);
          for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; this.world.spawnShot(this.x, this.y, Math.cos(a) * 70, Math.sin(a) * 70, 'pulse'); }
        } else { for (const dx of [-30, 30]) this.world.spawnMinion(this.x + dx, this.y + 30, 'buffering-wheel-minion'); this.go('idle', 1400); }
        return;
      case 'spikes':
        if (!done) return;
        if (this.bursts-- <= 0) { this.go('idle', this.shielded ? 1000 : 1500); return; }
        this.spin += 0.35;
        for (let i = 0; i < 8; i++) {
          const a = this.spin + (i / 8) * Math.PI * 2;
          this.world.spawnShot(this.x, this.y, Math.cos(a) * 125, Math.sin(a) * 125, 'lag-spike');
        }
        this.until = time + 450;
        return;
      case 'pulse':
        if (done) this.go('idle', 1100);
        return;
      case 'stunned':
        body.setVelocity(0, Math.min(120, (arena.bottom - 60 - this.y) * 2));
        if (done) this.go('idle', 800);
        return;
    }
  }
}

// ---------------------------------------------------------------------------
/** EP2: a ground boss. Lawnmower handshake dash (get above it: pen-tool ramp or the arena ledges),
 *  thumbs-up volleys, and a "SAY CHEESE!" group photo that blinds you if you're facing it.
 *  Shield = beige varnish: only Manya's paint (FILL or paint globs) cracks it. */
export class StockPhotoFamily extends BossBase {
  readonly title = 'The Stock Photo Family';
  readonly maxHp = 480;
  private next: 'charge' | 'thumbs' | 'photo' = 'thumbs';
  private dir = 1;
  private volleys = 0;
  /** Fired by the scene when a "SAY CHEESE" flash goes off. */
  onPhoto: (() => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, world: BossWorld) {
    super(scene, x, y, 'stock-photo-family', world);
    this.hp = this.maxHp;
    this.shieldBreaker = 'paint';
    this.shieldWord = 'BEIGE VARNISH';
    // Low, wide body so a 3-tile ledge (or a pen-tool ramp) clears the dash.
    const size = SPRITES['stock-photo-family']?.frameWidth ?? 128;
    (this.body as Phaser.Physics.Arcade.Body).setSize(size * 0.62, size * 0.34).setOffset(size * 0.19, size * 0.64);
  }
  get dangerous() { return this.mode === 'charge'; }
  protected animFor(mode: string) { return ({ telegraph: 'telegraph', thumbs: 'attack-thumbs-up', charge: 'attack-handshake', photo: 'telegraph', stunned: 'hurt' } as Record<string, string>)[mode] ?? 'idle'; }
  protected onShieldDown() { this.go('stunned', 2400); }
  protected onShieldUp() { this.go('idle', 500); }

  protected think(time: number, body: Phaser.Physics.Arcade.Body, arena: Phaser.Geom.Rectangle, p: Phaser.Math.Vector2, done: boolean) {
    const floorY = arena.bottom - (SPRITES['stock-photo-family']?.frameHeight ?? 128) / 2 + 2;
    this.y += (floorY - this.y) * 0.3;
    body.setVelocityY(0);
    this.vulnerable = this.mode === 'stunned';
    this.setFlipX(this.dir < 0);
    switch (this.mode) {
      case 'idle': {
        this.dir = p.x < this.x ? -1 : 1;
        body.setVelocityX(Math.abs(p.x - this.x) > 90 ? this.dir * 40 : 0);
        if (!done) return;
        const roll = Math.random();
        this.next = roll < 0.4 ? 'charge' : roll < 0.75 ? 'thumbs' : 'photo';
        body.setVelocityX(0);
        this.go('telegraph', this.next === 'photo' ? 1000 : 750);
        this.world.onPhase('attack');
        return;
      }
      case 'telegraph':
        body.setVelocityX(0);
        if (this.next === 'photo' && time % 300 < 150) this.setTint(0xffffff); else this.restoreTint();
        if (!done) return;
        this.restoreTint();
        if (this.next === 'charge') { this.dir = p.x < this.x ? -1 : 1; this.go('charge', 2600); }
        else if (this.next === 'thumbs') { this.volleys = this.shielded ? 3 : 2; this.go('thumbs', 0); }
        else { this.go('photo', 500); this.onPhoto?.(); }
        return;
      case 'charge':
        body.setVelocityX(this.dir * 290);
        if (body.blocked.left || body.blocked.right || this.x < arena.left + 60 || this.x > arena.right - 60 || done) {
          body.setVelocityX(0);
          this.scene.cameras.main.shake(220, 0.008);
          wordPop(this.scene, this.x, this.y - 20, 'BONK', true);
          this.go('stunned', this.shielded ? 900 : 1700);
        }
        return;
      case 'thumbs':
        if (!done) return;
        if (this.volleys-- <= 0) { this.go('idle', 1200); return; }
        for (let i = 0; i < 4; i++) {
          const tx = p.x + (i - 1.5) * 36, t = 0.9;
          this.world.spawnShot(this.x, this.y - 40, (tx - this.x) / t, -300 + i * 20, 'thumb');
        }
        this.until = time + 600;
        return;
      case 'photo':
        body.setVelocityX(0);
        if (done) this.go('idle', 1000);
        return;
      case 'stunned':
        body.setVelocityX(0);
        if (done) this.go('idle', 700);
        return;
    }
  }
}

// ---------------------------------------------------------------------------
/** EP3: The Algorithm. Its front is guarded: only hits from BEHIND land (it turns to face you on a delay;
 *  Brahmansh's JUMP CUT puts you behind it instantly). Clickbait thumbnails home in, rage-bait mortars rain
 *  (Sehaj can CTRL+Z them back), autoplay spawns minions, and it lunges. "Unskippable ad" shield: JUMP CUT through it. */
export class TheAlgorithm extends BossBase {
  readonly title = 'The Algorithm';
  readonly maxHp = 460;
  private next: 'clickbait' | 'mortar' | 'autoplay' | 'lunge' = 'clickbait';
  private face: 1 | -1 = -1;
  private turnAt = 0;
  private dir: 1 | -1 = 1;
  /** Fired when a hit is blocked by the forward guard. */
  onBlocked: (() => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, world: BossWorld) {
    super(scene, x, y, 'the-algorithm', world);
    this.hp = this.maxHp;
    this.shieldBreaker = 'jumpcut';
    this.shieldWord = 'UNSKIPPABLE AD';
  }
  get dangerous() { return this.mode === 'lunge'; }
  get facing() { return this.face; }
  protected animFor(mode: string) {
    const has = (n: string) => this.scene.anims.exists(animKey(this.key, n));
    const want = ({ telegraph: 'telegraph', clickbait: 'attack-clickbait', mortar: 'attack-mortar', autoplay: 'attack-autoplay', lunge: 'attack-lunge', stunned: 'stunned' } as Record<string, string>)[mode] ?? 'idle';
    return has(want) ? want : mode === 'stunned' && has('hurt') ? 'hurt' : mode === 'idle' ? 'idle' : has('attack') ? 'attack' : 'idle';
  }
  protected onShieldDown() { this.go('stunned', 2400); }
  protected onShieldUp() { this.go('idle', 500); }

  override hit(damage: number, fromX: number): boolean {
    if (!this.shielded && this.mode !== 'stunned' && this.alive && this.mode !== 'intro' && Math.sign(fromX - this.x) === this.face) {
      wordPop(this.scene, this.x + this.face * 24, this.y - 10, 'BLOCKED');
      this.onBlocked?.();
      return false;
    }
    this.vulnerable = true; // from behind (or stunned): always the bonus
    return super.hit(damage, fromX);
  }

  protected think(time: number, body: Phaser.Physics.Arcade.Body, arena: Phaser.Geom.Rectangle, p: Phaser.Math.Vector2, done: boolean) {
    const hoverY = arena.bottom - 46 + Math.sin(time / 500) * 6;
    // Turns to face you, but slowly: that's the window to get behind it.
    const want: 1 | -1 = p.x < this.x ? -1 : 1;
    if (want !== this.face && this.mode !== 'lunge') { if (!this.turnAt) this.turnAt = time + 650; if (time > this.turnAt) { this.face = want; this.turnAt = 0; } }
    else this.turnAt = 0;
    this.setFlipX(this.face > 0);
    switch (this.mode) {
      case 'idle': {
        const tx = Phaser.Math.Clamp(p.x - this.face * 110, arena.left + 50, arena.right - 50);
        body.setVelocity((tx - this.x) * 0.9, (hoverY - this.y) * 3);
        if (!done) return;
        const roll = Math.random();
        this.next = this.world.minions() < 2 && roll < 0.2 ? 'autoplay' : roll < 0.45 ? 'clickbait' : roll < 0.72 ? 'mortar' : 'lunge';
        body.setVelocity(0, 0);
        this.go('telegraph', 700);
        this.world.onPhase('attack');
        return;
      }
      case 'telegraph':
        body.setVelocity(0, (hoverY - this.y) * 3);
        if (!done) return;
        if (this.next === 'clickbait') { for (let i = 0; i < 3; i++) this.world.spawnShot(this.x + this.face * 20, this.y - 10 + i * 10, this.face * 60, (i - 1) * 50, 'clickbait'); this.go('clickbait', 900); }
        else if (this.next === 'mortar') { for (let i = 0; i < 5; i++) this.world.spawnShot(p.x + (i - 2) * 34 + Phaser.Math.Between(-8, 8), arena.top + 4, 0, 40 + i * 6, 'rage'); this.go('mortar', 900); }
        else if (this.next === 'autoplay') { for (const dx of [-30, 30]) this.world.spawnMinion(this.x + dx, this.y + 20, 'buffering-wheel-minion'); this.go('autoplay', 700); }
        else { this.dir = this.face; this.go('lunge', 1300); }
        return;
      case 'lunge':
        body.setVelocity(this.dir * 300, (hoverY - this.y) * 3);
        if (this.x < arena.left + 50 || this.x > arena.right - 50 || done) { body.setVelocity(0, 0); this.go('stunned', this.shielded ? 600 : 1200); }
        return;
      case 'clickbait': case 'mortar': case 'autoplay':
        body.setVelocity(0, (hoverY - this.y) * 3);
        if (done) this.go('idle', this.shielded ? 900 : 1300);
        return;
      case 'stunned':
        body.setVelocity(0, (hoverY + 10 - this.y) * 3);
        if (done) this.go('idle', 700);
        return;
    }
  }
}

// ---------------------------------------------------------------------------
/** EP4 finale: the BEIGE™ Core. A "greatest hits" boss — every phase borrows the earlier bosses' attacks.
 *  Shields break on STYLE alone (any party can win): overload it with noise and colour.
 *  Phase 1: email sprays + drones · Phase 2: + lag spikes, thumbs-up, dash · Phase 3: everything, faster, + mortars + clickbait. */
export class BeigeCore extends BossBase {
  readonly title = 'BEIGE™';
  readonly maxHp = 640;
  private next = 'spray';
  private volleys = 0;
  private spin = 0;
  private dashDir: 1 | -1 = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, world: BossWorld) {
    super(scene, x, y, 'beige-core', world);
    this.hp = this.maxHp;
    this.shieldBreaker = 'style';
    this.shieldWord = 'FRICTIONLESS';
  }
  get phase() { return 1 + this.shieldsBroken; }
  /** STYLE meter needed to overload each shield. */
  get styleNeeded() { return this.shieldsBroken === 0 ? 60 : 85; }
  get dangerous() { return this.mode === 'dash'; }
  protected animFor(mode: string) {
    const p = this.phase;
    const has = (n: string) => this.scene.anims.exists(animKey(this.key, n));
    const base = `phase${p}`;
    if (mode === 'stunned' && has('hurt')) return 'hurt';
    if (mode === 'telegraph' && has('telegraph')) return 'telegraph';
    return has(base) ? base : 'idle';
  }
  protected onShieldDown() { this.go('stunned', 2600); }
  protected onShieldUp() { this.go('idle', 600); }

  protected think(time: number, body: Phaser.Physics.Arcade.Body, arena: Phaser.Geom.Rectangle, p: Phaser.Math.Vector2, done: boolean) {
    const phase = this.phase, fast = phase === 3 ? 0.7 : 1;
    const cx = arena.centerX, cy = arena.top + 64;
    this.vulnerable = this.mode === 'stunned';
    if (!this.scene.anims.exists(animKey(this.key, 'idle'))) this.angle = Math.sin(time / 400) * (phase * 4);
    switch (this.mode) {
      case 'idle': {
        const tx = cx + Math.sin(time / (1500 - phase * 200)) * (arena.width / 2 - 70), ty = cy + Math.sin(time / 600) * 18;
        body.setVelocity((tx - this.x) * 1.4, (ty - this.y) * 1.4);
        if (!done) return;
        const pool = phase === 1 ? ['spray', 'spray', 'summon'] : phase === 2 ? ['spray', 'spikes', 'thumbs', 'dash', 'summon'] : ['spikes', 'thumbs', 'dash', 'mortar', 'clickbait', 'spray'];
        this.next = pool[Math.floor(Math.random() * pool.length)]!;
        if (this.next === 'summon' && this.world.minions() >= 3) this.next = 'spray';
        body.setVelocity(0, 0);
        this.go('telegraph', 650 * fast);
        this.world.onPhase('attack');
        return;
      }
      case 'telegraph':
        body.setVelocity(0, 0);
        if (!done) return;
        switch (this.next) {
          case 'spray': this.volleys = 2 + phase; this.go('spray', 0); return;
          case 'spikes': this.volleys = 1 + phase; this.go('spikes', 0); return;
          case 'thumbs': for (let i = 0; i < 3 + phase; i++) this.world.spawnShot(this.x, this.y, (p.x + (i - 2) * 30 - this.x) / 0.9, -280, 'thumb'); this.go('cool', 700); return;
          case 'mortar': for (let i = 0; i < 6; i++) this.world.spawnShot(p.x + (i - 2.5) * 30, arena.top + 4, 0, 40, 'rage'); this.go('cool', 800); return;
          case 'clickbait': for (let i = 0; i < 3; i++) this.world.spawnShot(this.x, this.y + (i - 1) * 14, (p.x < this.x ? -1 : 1) * 70, (i - 1) * 60, 'clickbait'); this.go('cool', 700); return;
          case 'summon': for (const dx of [-36, 36]) this.world.spawnMinion(this.x + dx, this.y + 20, phase === 1 ? 'reply-all-drone' : 'buffering-wheel-minion'); this.go('cool', 900); return;
          case 'dash': this.dashDir = p.x < this.x ? -1 : 1; this.go('dash', 1500); return;
        }
        return;
      case 'spray':
        if (!done) return;
        if (this.volleys-- <= 0) { this.go('idle', 1200 * fast); return; }
        for (let i = 0; i < 5; i++) { const a = Phaser.Math.DegToRad(45 + i * 22 + (this.volleys % 2) * 11); this.world.spawnShot(this.x, this.y + 20, Math.cos(a) * 120, Math.sin(a) * 120, 'email'); }
        this.until = time + 330 * fast;
        return;
      case 'spikes':
        if (!done) return;
        if (this.volleys-- <= 0) { this.go('idle', 1200 * fast); return; }
        this.spin += 0.4;
        for (let i = 0; i < 8; i++) { const a = this.spin + (i / 8) * Math.PI * 2; this.world.spawnShot(this.x, this.y, Math.cos(a) * 125, Math.sin(a) * 125, 'lag-spike'); }
        this.until = time + 450 * fast;
        return;
      case 'dash': {
        const lowY = arena.bottom - 34;
        body.setVelocity(this.dashDir * 280, (lowY - this.y) * 4);
        if (this.x < arena.left + 50 || this.x > arena.right - 50 || done) { body.setVelocity(0, 0); this.go('cool', 900); this.scene.cameras.main.shake(180, 0.006); }
        return;
      }
      case 'cool':
        body.setVelocity(0, (cy - this.y) * 2);
        if (done) this.go('idle', 900 * fast);
        return;
      case 'stunned':
        body.setVelocity(0, Math.min(120, (arena.bottom - 50 - this.y) * 2));
        if (done) this.go('idle', 800);
        return;
    }
  }
}

export const BOSSES = { 'reply-all-mothership': ReplyAllMothership, 'buffering-wheel': BufferingWheel, 'stock-photo-family': StockPhotoFamily, 'the-algorithm': TheAlgorithm, beige: BeigeCore } as const;
