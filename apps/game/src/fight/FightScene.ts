// VERSUS renderer. The sim (packages/shared/src/fight) owns every rule; this scene only reads the state each
// frame and draws it: big 2× fighters, projectiles, zones, a fighting-game HUD and juice for sim events.
// A `Driver` decides how frames advance: locally (2 players / vs CPU) or online (rollback session).
import * as Phaser from 'phaser';
import { createFight, FLOOR_Y, METER_MAX, MOVESETS, step, SUB, WINS_NEEDED, type FightEvent, type FightState } from '@qublox/shared/fight';
import type { CrewId } from '@qublox/shared';
import { animKey } from '../game/assets/art';
import { synth } from '../game/audio/synth';
import { bus } from '../game/bus';
import { CREW, hex } from '../game/crew';
import { loadVoices, preloadCrew, speak } from '../game/voice';
import { bark, FONT, shake, wordPop } from '../game/fx/juice';
import { cpuInput } from './cpu';
import { FightInput, P1_KEYS, P1_SOLO_KEYS, P2_KEYS } from './input';

/** Advances the match. Returns the state to draw plus the events produced since the last call. */
export interface Driver {
  readonly local: 0 | 1 | null;       // which side this screen controls online (null = local play)
  update(read: () => [number, number]): { state: FightState; events: FightEvent[] };
  status?(): string | null;
  dispose?(): void;
}

export class LocalDriver implements Driver {
  readonly local = null;
  readonly state: FightState;
  constructor(crews: [CrewId, CrewId], seed: number, private cpu: 0 | 1 | null) { this.state = createFight(crews[0], crews[1], seed); }
  update(read: () => [number, number]) {
    const inputs = read();
    if (this.cpu !== null) inputs[this.cpu] = cpuInput(this.state, this.cpu, 2);
    step(this.state, inputs);
    return { state: this.state, events: this.state.events };
  }
}

export type FightBoot = { driver: Driver; names: [string, string]; mode: 'local' | 'cpu' | 'online' };

const STAGES = ['', 'render-farm-', 'the-set-', 'the-feed-', 'templatr-'];

export class FightScene extends Phaser.Scene {
  private driver!: Driver;
  private names!: [string, string];
  private inputs: FightInput[] = [];
  private acc = 0;
  private fighters: Phaser.GameObjects.Sprite[] = [];
  private shadows: Phaser.GameObjects.Ellipse[] = [];
  private shots: Phaser.GameObjects.Image[] = [];
  private zoneGfx!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Graphics;
  private hudText: Phaser.GameObjects.Text[] = [];
  private banner!: Phaser.GameObjects.Text;
  private status!: Phaser.GameObjects.Text;
  private last: FightState | null = null;
  private ended = false;

  constructor() { super('fight'); }

  create() {
    const boot = this.registry.get('fight') as FightBoot;
    this.driver = boot.driver; this.names = boot.names; this.ended = false; this.acc = 0;
    void loadVoices().then(() => { for (const id of Object.keys(CREW) as CrewId[]) preloadCrew(id); });
    const solo = boot.mode !== 'local';
    this.inputs = [new FightInput(this, solo ? P1_SOLO_KEYS : P1_KEYS, 0), new FightInput(this, P2_KEYS, 1)];

    // Stage: one of the story districts, saturated (colour won).
    const seedStage = STAGES[(this.registry.get('fightStage') as number | undefined ?? 0) % STAGES.length]!;
    for (const [i, layer] of (['far', 'mid', 'near'] as const).entries()) {
      const key = `bg-${seedStage}${layer}-saturated`;
      if (this.textures.exists(key)) this.add.image(0, 0, key).setOrigin(0).setDisplaySize(480, 270).setDepth(i - 10);
    }
    this.add.rectangle(240, FLOOR_Y + 17, 480, 34, 0x0f1014).setDepth(-5);
    this.add.rectangle(240, FLOOR_Y + 1, 480, 2, 0xf2f1ec, 0.6).setDepth(-5);

    this.zoneGfx = this.add.graphics().setDepth(4);
    for (let i = 0; i < 2; i++) {
      this.shadows.push(this.add.ellipse(0, FLOOR_Y + 1, 40, 8, 0x000000, 0.35).setDepth(5));
      this.fighters.push(this.add.sprite(0, 0, 'ashwath').setOrigin(0.5, 1).setScale(2).setDepth(10 + i));
    }
    this.hud = this.add.graphics().setDepth(50).setScrollFactor(0);
    const txt = (x: number, y: number, size: number, ox = 0) => this.add.text(x, y, '', { fontFamily: FONT, fontSize: `${size}px`, color: '#f2f1ec' }).setOrigin(ox, 0).setDepth(51).setScrollFactor(0);
    this.hudText = [txt(12, 24, 8), txt(468, 24, 8, 1), txt(240, 8, 16, 0.5), txt(12, 228, 7), txt(468, 228, 7, 1)];
    this.banner = this.add.text(240, 110, '', { fontFamily: FONT, fontSize: '22px', color: '#fecb56', stroke: '#0f1014', strokeThickness: 6 }).setOrigin(0.5).setDepth(60).setAlpha(0);
    this.status = this.add.text(240, 44, '', { fontFamily: FONT, fontSize: '8px', color: '#ff7a7a', backgroundColor: '#0f1014', padding: { x: 4, y: 2 } }).setOrigin(0.5, 0).setDepth(60);
    this.events.once('shutdown', () => this.driver.dispose?.());
    if (process.env.NODE_ENV !== 'production') Object.assign(window, { __fight: this });
  }

  override update(_t: number, delta: number) {
    this.acc = Math.min(this.acc + delta, 250);
    const read = () => [this.inputs[0]!.read(), this.driver.local === null ? this.inputs[1]!.read() : 0] as [number, number];
    while (this.acc >= 1000 / 60) {
      this.acc -= 1000 / 60;
      const { state, events } = this.driver.update(read);
      this.last = state;
      for (const e of events) this.onEvent(state, e);
    }
    if (this.last) this.draw(this.last);
    this.status.setText(this.driver.status?.() ?? '').setVisible(!!this.driver.status?.());
  }

  private onEvent(s: FightState, e: FightEvent) {
    switch (e.type) {
      case 'hit':
        wordPop(this, e.x, e.y, e.word, e.big);
        if (e.word === 'PARRY') this.cameras.main.flash(90, 140, 200, 255);
        if (e.word === 'GUARD BREAK') this.cameras.main.flash(120, 255, 240, 120);
        shake(this, e.big ? 3 : e.blocked ? 0.5 : 1);
        synth.sfx(e.blocked ? 'menu' : e.big ? 'boss-hit' : 'hit');
        break;
      case 'move': {
        const f = s.fighters[e.who];
        synth.sfx(e.slot === 'super' ? 'style-rankup' : 'ability');
        if (e.slot === 'super') { this.cameras.main.flash(120, 255, 255, 255); this.showBanner(e.name, hex(CREW[f.crew].color)); }
        else wordPop(this, f.x / SUB, f.y / SUB - 110, e.name);
        break;
      }
      case 'banner': this.showBanner(e.text); synth.sfx(e.text.startsWith('ROUND') ? 'menu' : 'style-rankup'); break;
      case 'ko': shake(this, 4); this.cameras.main.flash(200, 255, 80, 80); synth.sfx('boss-roar'); break;
    }
    if (s.phase === 'matchEnd' && !this.ended) {
      this.ended = true;
      this.time.delayedCall(1800, () => bus.emit('versusEnd', { winner: s.winner }));
    }
  }

  private showBanner(text: string, color = '#fecb56') {
    this.banner.setText(text).setColor(color).setAlpha(1).setScale(0.6);
    this.tweens.killTweensOf(this.banner);
    this.tweens.add({ targets: this.banner, scale: 1, duration: 180, ease: 'Back.Out' });
    this.tweens.add({ targets: this.banner, alpha: 0, delay: 1100, duration: 300 });
  }

  private draw(s: FightState) {
    // Fighters.
    s.fighters.forEach((f, i) => {
      const spr = this.fighters[i]!, sh = this.shadows[i]!;
      if (spr.texture.key !== f.crew) spr.setTexture(f.crew);
      const stan = f.stanUntil > s.frame;
      spr.setPosition(f.x / SUB, f.y / SUB).setFlipX(f.facing < 0).setScale(2);
      sh.setPosition(f.x / SUB, FLOOR_Y + 1).setScale(1, 1);
      const air = f.y < FLOOR_Y * SUB;
      const anim = f.mode === 'attack' ? (f.move === 'light' || f.move === 'heavy' ? 'attack' : 'ability')
        : f.mode === 'hitstun' || f.mode === 'blockstun' || f.mode === 'dizzy' ? 'hurt' : f.mode === 'ko' || f.mode === 'down' ? 'ko' : f.mode === 'win' ? 'tagin'
        : air ? (f.vy < 0 ? 'jump' : 'fall') : f.mode === 'walk' || f.mode === 'block' ? 'run' : 'idle';
      const key = animKey(f.crew, anim);
      if (this.anims.exists(key) && spr.anims.currentAnim?.key !== key) spr.play(key);
      const frozen = s.frame < f.frozenUntil;
      if (frozen) spr.anims.pause(); else if (spr.anims.isPaused) spr.anims.resume();
      const dizzy = f.mode === 'dizzy' && Math.floor(s.frame / 6) % 2 === 0;
      spr.setTint(frozen ? 0x8fd8ff : dizzy ? 0xfff07a : f.mode === 'block' || f.mode === 'blockstun' ? 0x9fb4ff : s.frame < f.invertUntil ? 0xffa3c4 : f.indifferentUntil > s.frame ? 0xb8b8c8 : stan && Math.floor(s.frame / 8) % 2 === 0 ? 0xff6a8a : 0xffffff);
      spr.setAlpha(f.mode === 'down' && Math.floor(s.frame / 4) % 2 === 0 ? 0.55 : 1);   // knocked down = invulnerable (flicker)
      spr.setScale(spr.scaleX, f.mode === 'crouch' ? 1.5 : spr.scaleX);
    });
    // Projectiles (pooled images).
    while (this.shots.length < s.projectiles.length) this.shots.push(this.add.image(0, 0, 'cash').setDepth(12).setScale(2));
    this.shots.forEach((img, i) => {
      const p = s.projectiles[i];
      img.setVisible(!!p);
      if (!p) return;
      const tex = this.textures.exists(p.sprite) ? p.sprite : 'cash';
      if (img.texture.key !== tex) img.setTexture(tex);
      img.setPosition(p.x / SUB, p.y / SUB).setFlipX(p.vx < 0).setRotation(p.sprite === 'boulder' ? (s.frame / 6) * Math.sign(p.vx || 1) : 0);
    });
    // Zones.
    const g = this.zoneGfx.clear();
    for (const z of s.zones) {
      const x = z.x / SUB;
      if (z.kind === 'wall') { g.fillStyle(0xff8a1f, 0.85).fillRect(x - z.w / 2, FLOOR_Y - z.h, z.w, z.h); g.lineStyle(1, 0xf2f1ec).strokeRect(x - z.w / 2, FLOOR_Y - z.h, z.w, z.h); }
      if (z.kind === 'puddle') g.fillStyle(0xd63a8f, 0.75).fillEllipse(x, FLOOR_Y, z.w, 6);
      if (z.kind === 'bounce') g.fillStyle(0xfecb56, 0.5 + 0.2 * Math.sin(s.frame / 4)).fillRect(0, FLOOR_Y - 2, 480, 6);
    }
    this.drawHud(s);
  }

  private drawHud(s: FightState) {
    const g = this.hud.clear();
    s.fighters.forEach((f, i) => {
      const right = i === 1, w = 190, x = right ? 480 - 12 - w : 12;
      const max = MOVESETS[f.crew].hp;
      // HP
      g.fillStyle(0x0f1014).fillRect(x - 2, 8, w + 4, 14);
      g.fillStyle(0x7a1f2a).fillRect(x, 10, w, 10);
      const hw = Math.round(w * f.hp / max);
      g.fillStyle(f.hp / max < 0.3 ? 0xff3b30 : 0xfecb56).fillRect(right ? x + w - hw : x, 10, hw, 10);
      // Guard (thin bar under HP; flashes when low)
      const gw = Math.round(w * f.guard / 1000), lowGuard = f.guard < 300 && Math.floor(s.frame / 6) % 2 === 0;
      g.fillStyle(0x0f1014).fillRect(x - 2, 22, w + 4, 5);
      g.fillStyle(lowGuard ? 0xff3b30 : 0x8fa8ff).fillRect(right ? x + w - gw : x, 23, gw, 3);
      // Meter
      const mw = 120, mx = right ? 480 - 12 - mw : 12;
      g.fillStyle(0x0f1014).fillRect(mx - 2, 238, mw + 4, 10);
      g.fillStyle(0x2a2b33).fillRect(mx, 240, mw, 6);
      const full = f.meter >= METER_MAX;
      g.fillStyle(full ? (Math.floor(s.frame / 8) % 2 ? 0xff5a7a : 0xffffff) : CREW[f.crew].color).fillRect(right ? mx + mw - Math.round(mw * f.meter / METER_MAX) : mx, 240, Math.round(mw * f.meter / METER_MAX), 6);
      // Round pips
      for (let k = 0; k < WINS_NEEDED; k++) {
        const px = right ? 480 - 18 - k * 10 : 18 + k * 10;
        g.fillStyle(k < s.wins[i]! ? 0xfecb56 : 0x2a2b33).fillCircle(px, 44, 3);
      }
      this.hudText[i]!.setText(`${this.names[i]} · ${CREW[f.crew].name.toUpperCase()}`).setY(29).setX(right ? 468 - 30 : 12 + 30);
      this.hudText[3 + i]!.setText(full ? `SUPER READY: ${MOVESETS[f.crew].super.name}` : MOVESETS[f.crew].special.name);
    });
    this.hudText[2]!.setText(String(Math.ceil(s.timer / 60)).padStart(2, '0'));
    if (s.phase === 'intro' && s.phaseFrames === 89) {
      this.showBanner(`ROUND ${s.round}`);
      // Pre-fight taunts (Gemini's story/versus.json), round 1 only.
      const lines = (this.registry.get('content') as { story?: { versus?: { crew?: Record<string, { intro?: string[] }> } } } | undefined)?.story?.versus?.crew;
      if (s.round === 1 && lines) s.fighters.forEach((f, i) => {
        const l = lines[f.crew]?.intro ?? [];
        // A crew member with a recorded line says it for real (and it's the caption); otherwise Gemini's text taunt.
        this.time.delayedCall(250 + i * 900, () => {
          const clip = speak(f.crew, 'intro');
          const text = clip?.label ?? (l.length ? l[(s.rng + i) % l.length]! : null);
          if (text) bark(this, this.fighters[i]!, text, -112);
        });
      });
    }
  }
}

