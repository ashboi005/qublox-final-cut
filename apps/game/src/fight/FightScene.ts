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
import { loadVoices, preloadCrew, speak, type VoiceCue } from '../game/voice';
import { bark, FONT, shake, wordPop } from '../game/fx/juice';
import { matchLine } from './lines';
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
  private talkAt: [number, number] = [0, 0];
  private comboText: Phaser.GameObjects.Text[] = [];
  private comboBadge: (Phaser.GameObjects.Image | null)[] = [];
  private prompt!: Phaser.GameObjects.Text;
  private cinema = false;
  /** The fighter being finished: draw() stops overriding its transform so the finisher tweens can play. */
  private finished: 0 | 1 | null = null;

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
    this.comboText = [0, 1].map(i => this.add.text(i === 0 ? 14 : 466, 70, '', { fontFamily: FONT, fontSize: '12px', color: '#fecb56', stroke: '#0f1014', strokeThickness: 4 }).setOrigin(i === 0 ? 0 : 1, 0).setDepth(55).setAlpha(0));
    // Astra's combo badge sits behind the counter text (stretched to fit it), if it exists.
    this.comboBadge = [0, 1].map(i => this.textures.exists('fx-combo') ? this.add.image(i === 0 ? 8 : 472, 68, 'fx-combo').setOrigin(i === 0 ? 0 : 1, 0).setDepth(54).setAlpha(0).setFlipX(i === 1) : null);
    this.prompt = this.add.text(240, 140, '↓ + I   FINAL CUT', { fontFamily: FONT, fontSize: '12px', color: '#ff2f36', stroke: '#0f1014', strokeThickness: 5 }).setOrigin(0.5).setDepth(60).setVisible(false);
    this.cinema = false;
    this.finished = null;
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

  /** In-fight lines: the real recording when that crew member has one (captioned), else a text bark now and then. */
  private talk(s: FightState, i: 0 | 1, cue: VoiceCue, barks: string, chance = 0.5) {
    const f = s.fighters[i], now = this.time.now;
    if (now < (this.talkAt[i] ?? 0)) return;
    const clip = speak(f.crew, cue);
    let text = clip?.label ?? null;
    if (!text && Math.random() < chance) {
      const lines = (this.registry.get('content') as { barks?: Record<string, { barks?: Record<string, string[]> }> } | undefined)?.barks?.[f.crew]?.barks?.[barks] ?? [];
      text = matchLine(lines, f.crew, s.fighters[i === 0 ? 1 : 0].crew, Math.floor(Math.random() * 997));
    }
    if (!text) return;
    this.talkAt[i] = now + 2200;
    bark(this, this.fighters[i]!, text, -112);
  }

  private onEvent(s: FightState, e: FightEvent) {
    switch (e.type) {
      case 'hit': {
        // Who got hit = the fighter nearest the hit spark. Big clean hits get a taunt and an "ow".
        if (e.word === 'COUNTER') this.cameras.main.flash(70, 255, 120, 60);
        if (!e.blocked && e.by !== undefined && (e.combo ?? 0) >= 2) {
          const t = this.comboText[e.by]!, badge = this.comboBadge[e.by];
          t.setText(`${e.combo} HIT COMBO`).setAlpha(1).setScale(1.25);
          this.tweens.killTweensOf(t);
          this.tweens.add({ targets: t, scale: 1, duration: 120, ease: 'Back.Out' });
          this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 250 });
          if (badge) {
            badge.setDisplaySize(t.width + 14, t.height + 6).setAlpha(1);
            this.tweens.killTweensOf(badge);
            this.tweens.add({ targets: badge, alpha: 0, delay: 900, duration: 250 });
          }
        }
        if (!e.blocked && e.damage >= 60) {
          const d = (k: 0 | 1) => Math.abs(s.fighters[k].x / SUB - e.x);
          const victim: 0 | 1 = d(0) <= d(1) ? 0 : 1, attacker: 0 | 1 = victim === 0 ? 1 : 0;
          if (Math.random() < 0.5) this.talk(s, attacker, 'kill', 'kill', 0.35); else this.talk(s, victim, 'hurt', 'hit', 0.35);
        }
        wordPop(this, e.x, e.y, e.word, e.big);
        if (e.word === 'PARRY') this.cameras.main.flash(90, 140, 200, 255);
        if (e.word === 'GUARD BREAK') this.cameras.main.flash(120, 255, 240, 120);
        shake(this, e.big ? 3 : e.blocked ? 0.5 : 1);
        synth.sfx(e.blocked ? 'menu' : e.big ? 'boss-hit' : 'hit');
        break;
      }
      case 'move': {
        const f = s.fighters[e.who];
        if (e.slot === 'special' || e.slot === 'super') this.talk(s, e.who, e.slot === 'super' ? 'special' : 'ability', e.slot === 'super' ? 'tagin' : 'ability', e.slot === 'super' ? 0.9 : 0.4);
        synth.sfx(e.slot === 'super' ? 'style-rankup' : 'ability');
        if (e.slot === 'super') { this.cameras.main.flash(120, 255, 255, 255); this.showBanner(e.name, hex(CREW[f.crew].color)); }
        else wordPop(this, f.x / SUB, f.y / SUB - 110, e.name);
        break;
      }
      case 'finisher': this.prompt.setVisible(false); this.finisherFx(s, e.who, e.name); break;
      case 'banner': this.showBanner(e.text); synth.sfx(e.text.startsWith('ROUND') ? 'menu' : 'style-rankup'); break;
      case 'ko':
        shake(this, 4); this.cameras.main.flash(200, 255, 80, 80); synth.sfx('boss-roar');
        if (this.textures.exists('fx-ko')) {
          const f = s.fighters[e.who], ko = this.add.image(f.x / SUB, f.y / SUB - 70, 'fx-ko').setDepth(56).setScale(0.2).setAngle(-8);
          this.tweens.add({ targets: ko, scale: 1.1, angle: 0, duration: 160, ease: 'Back.Out' });
          this.tweens.add({ targets: ko, alpha: 0, scale: 1.3, delay: 750, duration: 250, onComplete: () => ko.destroy() });
        }
        { const cam = this.cameras.main, f = s.fighters[e.who]; cam.pan(f.x / SUB, f.y / SUB - 40, 160, Phaser.Math.Easing.Sine.Out); cam.zoomTo(1.6, 160, Phaser.Math.Easing.Sine.Out); this.time.delayedCall(700, () => { cam.zoomTo(1, 300, Phaser.Math.Easing.Sine.InOut); cam.pan(240, 135, 300, Phaser.Math.Easing.Sine.InOut); }); }
        this.talkAt = [0, 0];
        this.talk(s, e.who, 'ko', 'ko', 0.8);
        this.time.delayedCall(700, () => { this.talkAt = [0, 0]; this.talk(s, e.who === 0 ? 1 : 0, 'kill', 'kill', 0.9); });
        break;
    }
    if (s.phase === 'matchEnd' && !this.ended) {
      this.ended = true;
      this.time.delayedCall(1800, () => bus.emit('versusEnd', { winner: s.winner, finisher: s.finisher !== null ? MOVESETS[s.fighters[s.finisher].crew].finisher : undefined }));
    }
  }

  /** FINAL CUT finisher cinematics, ~2.8s (matches FINISHER_FRAMES). The loser's choreography (delete, doze off,
   *  wrap, rewind, float, inflate, recolour, hard cuts, frame) always runs; when Astra's `finisher-<crew>` sheet and its
   *  `play` anim exist they play as a transparent overlay on the loser and replace only the placeholder FX. */
  private finisherFx(s: FightState, who: 0 | 1, name: string) {
    this.cinema = true;
    const li = who === 0 ? 1 : 0;
    this.finished = li;   // draw() leaves this sprite to the tweens below
    const w = s.fighters[who], l = s.fighters[li];
    const lx = l.x / SUB, ly = l.y / SUB, loser = this.fighters[li]!;
    const crew = w.crew, color = CREW[crew].color;
    const cam = this.cameras.main;
    // Letterbox + dim, title card.
    const bars = [this.add.rectangle(240, -20, 480, 40, 0x000000).setDepth(70), this.add.rectangle(240, 290, 480, 40, 0x000000).setDepth(70)];
    this.tweens.add({ targets: bars[0], y: 14, duration: 250 }); this.tweens.add({ targets: bars[1], y: 256, duration: 250 });
    const dim = this.add.rectangle(240, 135, 480, 270, 0x000000, 0).setDepth(3);
    this.tweens.add({ targets: dim, fillAlpha: 0.55, duration: 300 });
    const card = this.add.text(240, 70, `FINAL CUT\n${name}`, { fontFamily: FONT, fontSize: '16px', color: hex(color), align: 'center', stroke: '#0f1014', strokeThickness: 6 }).setOrigin(0.5).setDepth(71).setScrollFactor(0).setScale(0.4).setAlpha(0);
    this.tweens.killTweensOf(this.banner); this.banner.setAlpha(0);   // "FINAL CUT IT!" is done; the title card takes over
    this.tweens.add({ targets: card, scale: 1, alpha: 1, duration: 260, ease: 'Back.Out' });
    cam.pan(lx, ly - 40, 400, Phaser.Math.Easing.Sine.Out); cam.zoomTo(1.35, 400, Phaser.Math.Easing.Sine.Out);
    synth.sfx('style-rankup');
    const key = `finisher-${crew}`;
    const sheet = this.textures.exists(key) && this.anims.exists(animKey(key, 'play'));
    const fx = !sheet;   // placeholder effects only when there's no art yet
    let closed = false;
    const done = () => {
      if (closed) return; closed = true;
      this.time.delayedCall(250, () => { cam.zoomTo(1, 300); cam.pan(240, 135, 300); this.tweens.add({ targets: [...bars, dim, card], alpha: 0, duration: 300, onComplete: () => [...bars, dim, card].forEach(o => o.destroy()) }); });
    };
    if (sheet) {
      const art = this.add.sprite(lx, ly, key).setOrigin(0.5, 1).setScale(2).setDepth(40).play(animKey(key, 'play'));
      art.once('animationcomplete', () => { art.destroy(); done(); });
    }
    const burst = (tex: string, n: number, spread = 60, vy = -160) => {
      for (let k = 0; k < n; k++) {
        const p = this.add.image(lx + Phaser.Math.Between(-spread, spread), ly - 30, this.textures.exists(tex) ? tex : 'spark').setDepth(41).setScale(2);
        this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-80, 80), y: p.y + vy + Phaser.Math.Between(-40, 40), angle: Phaser.Math.Between(-360, 360), alpha: 0, duration: 1400, delay: k * 40, onComplete: () => p.destroy() });
      }
    };
    const vanish = (tint: number, delay = 1300) => this.time.delayedCall(delay, () => { loser.setTint(tint); this.tweens.add({ targets: loser, alpha: 0, scaleY: 0.1, duration: 500, ease: 'Quad.In' }); });
    switch (crew) {
      case 'ashwath': {
        if (fx) {
          const lines = ['$ sudo rm -rf /beige', 'deleting stock smiles…', 'deleting rounded corners…', 'BEIGE: segmentation fault'];
          lines.forEach((t, k) => this.time.delayedCall(250 + k * 320, () => { const tx = this.add.text(lx - 60, ly - 120 + k * 14, t, { fontFamily: FONT, fontSize: '8px', color: '#4fbf6a' }).setDepth(42); this.time.delayedCall(2200 - k * 320, () => tx.destroy()); }));
          this.time.delayedCall(1500, () => cam.flash(200, 120, 255, 140));
        }
        vanish(0xe8dcc0, 1500); break;
      }
      case 'sayam': {
        // BHAI, LISTEN…: the monologue goes on so long the loser nods off and wanders away.
        if (fx) {
          const talk = ['bhai, listen', 'so basically', 'hear me out', 'no cap', 'le re', 'fr fr', 'deep, right?', 'bhai. bhai.'];
          talk.forEach((t, k) => this.time.delayedCall(150 + k * 220, () => { const b = this.add.text(lx + Phaser.Math.Between(-70, 70), ly - 90 - Phaser.Math.Between(0, 50), t, { fontFamily: FONT, fontSize: '8px', color: '#0f1014', backgroundColor: '#f2f1ec', padding: { x: 3, y: 2 } }).setOrigin(0.5).setDepth(42); this.tweens.add({ targets: b, y: b.y - 20, alpha: 0, delay: 600, duration: 700, onComplete: () => b.destroy() }); }));
          this.time.delayedCall(1300, () => { const z = this.add.text(lx + 10, ly - 70, 'Z z z', { fontFamily: FONT, fontSize: '12px', color: '#8fa8ff' }).setDepth(42); this.tweens.add({ targets: z, y: z.y - 30, alpha: 0, duration: 1200, onComplete: () => z.destroy() }); });
        }
        this.tweens.add({ targets: loser, angle: 80, x: loser.x + 40, alpha: 0, duration: 900, delay: 1600 });
        this.time.delayedCall(1700, () => this.showBanner('GET A LOAD OF THIS GUY', '#1d7a3a'));
        break;
      }
      case 'tushar':
        for (let k = 0; k < 5; k++) this.time.delayedCall(300 + k * 260, () => { if (fx) cam.flash(80, 255, 255, 255); synth.sfx('ability-cut'); });
        vanish(0xffffff, 1700); this.time.delayedCall(1800, () => this.showBanner("THAT'S A WRAP")); break;
      case 'sehaj':
        if (fx) this.time.delayedCall(300, () => { const b = this.add.image(lx, -40, this.textures.exists('boulder') ? 'boulder' : 'spark').setScale(6).setDepth(41); this.tweens.add({ targets: b, y: ly - 40, duration: 500, ease: 'Quad.In', onComplete: () => { shake(this, 6); cam.flash(120, 200, 180, 255); this.tweens.add({ targets: b, alpha: 0, duration: 800, delay: 600, onComplete: () => b.destroy() }); } }); });
        vanish(0x8fa8ff, 900); this.time.delayedCall(1300, () => this.showBanner('CTRL+Z')); break;
      case 'manvi':
        if (fx) burst('fx-heart', 18, 40, -200);
        this.time.delayedCall(600, () => this.tweens.add({ targets: loser, y: ly - 140, alpha: 0, angle: 20, duration: 1400, ease: 'Sine.In' }));
        this.time.delayedCall(1300, () => this.showBanner('DHUMTANANA', '#ff5a7a')); break;
      case 'mansukh':
        this.time.delayedCall(300, () => this.tweens.add({ targets: loser, scale: 6, duration: 900, ease: 'Quad.In', onComplete: () => { loser.setAlpha(0); if (fx) { cam.flash(150, 255, 90, 120); burst(this.textures.exists('lightstick') ? 'lightstick' : 'spark', 14); } } }));
        this.time.delayedCall(1400, () => this.showBanner('BIGGER.', '#ff8a1f')); break;
      case 'manya':
        for (let k = 0; k < 4; k++) this.time.delayedCall(250 + k * 280, () => { loser.setTint([0xff2f36, 0xfecb56, 0x3a6ea5, 0xd63a8f][k]!); if (fx) burst('paint', 8, 30); });
        vanish(0xd63a8f, 1500); break;
      case 'brahmansh':
        for (let k = 0; k < 7; k++) this.time.delayedCall(200 + k * 150, () => { loser.setVisible(k % 2 === 1); dim.setFillStyle(0x000000, k % 2 ? 0.55 : 0.95); });
        this.time.delayedCall(1300, () => { loser.setVisible(false); this.showBanner('CUT TO BLACK', '#e8242c'); }); break;
      case 'mishthi':
        this.time.delayedCall(400, () => {
          loser.setTint(0xe8c26a); this.tweens.add({ targets: loser, angle: 0, duration: 200 });
          if (fx) { const fr = this.add.rectangle(lx, ly - 30, 64, 76).setStrokeStyle(4, 0xe8c26a).setDepth(41); const tag = this.add.text(lx, ly + 8, '"Intern, Defeated" · 2084', { fontFamily: FONT, fontSize: '7px', color: '#e8c26a' }).setOrigin(0.5, 0).setDepth(41); this.time.delayedCall(2200, () => { fr.destroy(); tag.destroy(); }); }
        });
        this.time.delayedCall(1300, () => this.showBanner('AS IF I CARE?', '#9a3050')); break;
      default: if (fx) burst('spark', 20); vanish(0xffffff);
    }
    // Fallback close (also covers a sheet whose anim never reports completion).
    this.time.delayedCall(sheet ? 3200 : 2400, done);
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
      if (i === this.finished) { sh.setVisible(spr.visible && spr.alpha > 0.2); return; }
      if (spr.texture.key !== f.crew) spr.setTexture(f.crew);
      const stan = f.stanUntil > s.frame;
      spr.setPosition(f.x / SUB, f.y / SUB).setFlipX(f.facing < 0).setScale(2);
      sh.setPosition(f.x / SUB, FLOOR_Y + 1).setScale(1, 1);
      const air = f.y < FLOOR_Y * SUB;
      const anim = f.mode === 'attack' ? (f.move === 'light' || f.move === 'heavy' ? 'attack' : f.move === 'super' && this.anims.exists(animKey(f.crew, 'super')) ? 'super' : 'ability')
        : f.mode === 'hitstun' || f.mode === 'blockstun' || f.mode === 'dizzy' ? 'hurt' : f.mode === 'ko' || f.mode === 'down' ? 'ko' : f.mode === 'win' ? 'tagin'
        : f.mode === 'block' ? (this.anims.exists(animKey(f.crew, 'block')) ? 'block' : 'idle')
        : air ? (f.vy < 0 ? 'jump' : 'fall') : f.mode === 'walk' ? 'run' : 'idle';
      const key = animKey(f.crew, anim);
      if (this.anims.exists(key) && spr.anims.currentAnim?.key !== key) spr.play(key);
      const frozen = s.frame < f.frozenUntil;
      if (frozen) spr.anims.pause(); else if (spr.anims.isPaused) spr.anims.resume();
      const dizzy = f.mode === 'dizzy' && Math.floor(s.frame / 6) % 2 === 0;
      spr.setTint(frozen ? 0x8fd8ff : dizzy ? 0xfff07a : f.mode === 'block' || f.mode === 'blockstun' ? 0x9fb4ff : s.frame < f.invertUntil ? 0xffa3c4 : f.indifferentUntil > s.frame ? 0xb8b8c8 : f.takeoverUntil > s.frame && Math.floor(s.frame / 8) % 2 === 0 ? 0xfff1a8 : f.roastedUntil > s.frame && Math.floor(s.frame / 10) % 2 === 0 ? 0xff9a6a : stan && Math.floor(s.frame / 8) % 2 === 0 ? 0xff6a8a : 0xffffff);
      spr.setAlpha(f.mode === 'down' && Math.floor(s.frame / 4) % 2 === 0 ? 0.55 : 1);   // knocked down = invulnerable (flicker)
      spr.setScale(spr.scaleX, f.mode === 'crouch' ? 1.5 : spr.scaleX);
    });
    // Projectiles (pooled images).
    while (this.shots.length < s.projectiles.length) this.shots.push(this.add.image(0, 0, 'spark').setDepth(12).setScale(2));
    this.shots.forEach((img, i) => {
      const p = s.projectiles[i];
      img.setVisible(!!p);
      if (!p) return;
      const tex = this.textures.exists(p.sprite) ? p.sprite : 'spark';
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
      const cd = Math.max(0, f.specialReadyAt - s.frame);
      this.hudText[3 + i]!.setText(full ? `SUPER READY: ${MOVESETS[f.crew].super.name}` : cd ? `${MOVESETS[f.crew].special.name} · ${(cd / 60).toFixed(1)}s` : MOVESETS[f.crew].special.name).setAlpha(cd && !full ? 0.5 : 1);
    });
    this.hudText[2]!.setText(String(Math.ceil(s.timer / 60)).padStart(2, '0'));
    // FINAL CUT prompt over the winner while the loser is dazed.
    if (s.phase === 'finish' && s.winner !== null && !this.cinema) {
      const w = s.fighters[s.winner];
      this.prompt.setVisible(Math.floor(s.frame / 15) % 2 === 0).setPosition(w.x / SUB, w.y / SUB - 128).setText(`↓ + ${s.winner === 0 || this.registry.get('fight')?.mode !== 'local' ? 'I' : '0'}   FINAL CUT`);
    } else this.prompt.setVisible(false);
    if (s.phase === 'intro' && s.phaseFrames === 89) {
      this.showBanner(`ROUND ${s.round}`);
      // Pre-fight taunts (Gemini's story/versus.json), round 1 only.
      const lines = (this.registry.get('content') as { story?: { versus?: { crew?: Record<string, { intro?: string[] }> } } } | undefined)?.story?.versus?.crew;
      if (s.round === 1 && lines) s.fighters.forEach((f, i) => {
        const l = lines[f.crew]?.intro ?? [];
        // A crew member with a recorded line says it for real (and it's the caption); otherwise Gemini's text taunt.
        this.time.delayedCall(250 + i * 900, () => {
          const clip = speak(f.crew, 'intro');
          const text = clip?.label ?? matchLine(l, f.crew, s.fighters[i === 0 ? 1 : 0].crew, s.rng + i);
          if (text) bark(this, this.fighters[i]!, text, -112);
        });
      });
    }
  }
}

