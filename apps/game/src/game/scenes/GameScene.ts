import * as Phaser from 'phaser';
import { DialogueSchema, isCrewId, SfxSchema, SongSchema, type CrewId } from '@qublox/shared';
import { synth } from '../audio/synth';
import { animKey, TILE } from '../assets/art';
import { bus, type HudState } from '../bus';
import { CREW, DEFAULT_PARTY, hex } from '../crew';
import { Avatar } from '../entities/Avatar';
import { BeigeCore, BOSSES, BossBase, ReplyAllMothership, StockPhotoFamily, TheAlgorithm } from '../entities/Boss';
import { Enemy, type EnemyKind } from '../entities/Enemy';
import { bark, FONT, fx, hitstop, shake, wordPop } from '../fx/juice';
import { emptyFrame, LocalInput } from '../input/InputSource';
import { StyleMeter } from '../style';
import { ceilingAbove, parseLevel, tileData, type Level, type Trigger } from '../world/level';

export type GameContent = {
  levels: Record<string, string>; dialogue: Record<string, unknown>;
  barks: Record<string, unknown>; story: Record<string, unknown>; errors: string[];
  songs?: Record<string, unknown>; sfx?: unknown;
};
/** Party state carried from room to room within an episode. */
export type Carry = {
  members: { id: CrewId; hp: number; ko: boolean }[]; slot: number;
  style: { meter: number; score: number }; elapsed: number; kos: number;
};
type Switchable = { kind: 'door' | 'laser' | 'gate' | 'wave'; obj: Phaser.GameObjects.Image | Phaser.GameObjects.TileSprite; open: boolean; tempUntil: number; x: number; y: number };
type Terminal = { img: Phaser.GameObjects.Image; on: boolean; target: Switchable | null };
type Fan = { spr: Phaser.Physics.Arcade.Image; frozenUntil: number };
type Npc = { spr: Phaser.GameObjects.Sprite; id: string; name: string };
type Target = Enemy | BossBase;
type Vent = { spr: Phaser.GameObjects.Sprite; x: number; y: number; phase: number; frozenUntil: number; bursting: boolean };
type Crumbly = { spr: Phaser.Physics.Arcade.Sprite; kind: 'catwalk' | 'cache'; state: 'intact' | 'crumbling' | 'broken'; at: number; w: number };
type Wind = { spr: Phaser.GameObjects.Sprite; dir: 1 | -1; frozenUntil: number };
type BlockColor = 'red' | 'blue' | 'yellow';
type ColorBlock = { spr: Phaser.Physics.Arcade.Image; tx: number; ty: number; color: BlockColor };
type Mirror = { spr: Phaser.GameObjects.Image; hp: number; next: number; spawned: Enemy[] };
type Echo = { spr: Phaser.GameObjects.Image; next: number; rings: { g: Phaser.GameObjects.Arc; born: number; hit: boolean }[] };
type Mortar = { x: number; y: number; next: number };
type Boom = { arm: Phaser.GameObjects.Image; x: number; y: number; len: number; phase: number; frozenUntil: number; angle: number };

const T = 16;
const SOLID = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8]);
const ONEWAY = new Set<number>([TILE.ONEWAY_L, TILE.ONEWAY_M, TILE.ONEWAY_R]);
const ENEMY_CHARS: Record<string, EnemyKind> = { i: 'stock-intern', d: 'reply-all-drone', m: 'infinite-monkey', b: 'corporate-memphis-blob', p: 'pop-up-ad', w: 'buffering-wheel-minion' };

export class GameScene extends Phaser.Scene {
  private content!: GameContent;
  private levelKey = 'ep0-r01';
  private party: CrewId[] = DEFAULT_PARTY;
  private carry: Carry | null = null;
  private level!: Level;
  private layer!: Phaser.Tilemaps.TilemapLayer;
  private avatar!: Avatar;
  private controls!: LocalInput;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  private foeShots!: Phaser.Physics.Arcade.Group;
  private pens!: Phaser.Physics.Arcade.StaticGroup;
  private blockers!: Phaser.Physics.Arcade.StaticGroup;
  private switches: Switchable[] = [];
  private terminals: Terminal[] = [];
  private fans: Fan[] = [];
  private npcs: Npc[] = [];
  private triggers: (Trigger & { fired: boolean })[] = [];
  private boss: BossBase | null = null;
  private vents: Vent[] = [];
  private crumbly: Crumbly[] = [];
  private winds: Wind[] = [];
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private wave = 0;
  private explicitParty: CrewId[] | null = null;
  private blocks: ColorBlock[] = [];
  private blockGroup!: Phaser.Physics.Arcade.StaticGroup;
  private mirrors: Mirror[] = [];
  private booms: Boom[] = [];
  private echoes: Echo[] = [];
  private mortars: Mortar[] = [];
  private scrollY = Infinity;
  private scrollRect: Phaser.GameObjects.TileSprite | null = null;
  private lastJumpCutAt = 0;
  private beigeWash: Phaser.GameObjects.Rectangle | null = null;
  private lastBeigeEmit = -1;
  private checkpoint = new Phaser.Math.Vector2();
  private lureBag: Phaser.Physics.Arcade.Image | null = null;
  private lureUntil = 0;
  private style = new StyleMeter();
  private elapsed = 0;
  private cutscene = false;
  private finished = false;
  private leaving = false;
  private joined = false;
  private kos = 0;
  private lastHud = 0;
  private lastBark = 0;
  private frame = emptyFrame();
  private dialogueQueue: { id: string; then?: () => void }[] = [];
  private dialogueThen: (() => void) | undefined;
  private hint: string | null = null;

  constructor() { super('game'); }

  init(data: { level?: string; party?: CrewId[] | null; carry?: Carry | null }) {
    if (data.level) this.levelKey = data.level;
    this.explicitParty = data.party?.length ? data.party : null;
    if (data.party?.length) this.party = data.party;
    this.carry = data.carry ?? null;
    this.switches = []; this.terminals = []; this.fans = []; this.npcs = []; this.triggers = [];
    this.vents = []; this.crumbly = []; this.winds = []; this.wave = 0; this.waveTimer = null;
    this.blocks = []; this.mirrors = []; this.booms = []; this.echoes = []; this.mortars = []; this.scrollY = Infinity; this.scrollRect = null;
    this.beigeWash = null; this.lastBeigeEmit = -1;
    this.boss = null; this.lureBag = null; this.lureUntil = 0;
    this.style = new StyleMeter(this.carry?.style.meter ?? 0, this.carry?.style.score ?? 0);
    this.elapsed = this.carry?.elapsed ?? 0; this.kos = this.carry?.kos ?? 0;
    this.cutscene = false; this.finished = false; this.leaving = false; this.joined = false;
    this.dialogueQueue = []; this.dialogueThen = undefined; this.hint = null;
  }

  create() {
    this.content = this.registry.get('content') as GameContent;
    const src = this.content.levels[this.levelKey] ?? Object.values(this.content.levels)[0];
    if (!src) { this.add.text(10, 10, 'No levels in content/levels', { fontFamily: FONT, color: '#ff2f36' }); return; }
    this.level = parseLevel(src);
    const W = this.level.width * T, H = this.level.height * T;
    this.cameras.main.setBackgroundColor('#2a2925');
    this.buildBackdrop(W, H);

    // Tiles
    const map = this.make.tilemap({ data: tileData(this.level, TILE), tileWidth: T, tileHeight: T });
    const tilesKey = this.level.tileset && this.textures.exists(`tiles-${this.level.tileset}`) ? `tiles-${this.level.tileset}` : 'tiles-placeholder';
    const ts = map.addTilesetImage('tiles', tilesKey, T, T, 0, 0)!;
    this.layer = map.createLayer(0, ts, 0, 0) as Phaser.Tilemaps.TilemapLayer;
    this.layer.setCollision([...SOLID, TILE.HAZARD]);
    this.layer.forEachTile(t => { if (ONEWAY.has(t.index)) t.setCollision(false, false, true, false); });
    this.physics.world.setBounds(0, 0, W, H + 200);
    this.cameras.main.setBounds(0, 0, W, H);

    this.enemies = this.physics.add.group();
    this.shots = this.physics.add.group();
    this.foeShots = this.physics.add.group();
    this.pens = this.physics.add.staticGroup();
    this.platforms = this.physics.add.staticGroup();
    this.blockGroup = this.physics.add.staticGroup();
    this.blockers = this.physics.add.staticGroup();

    // Party: carried from the last room, else @party, else the URL/default.
    // Party precedence: carried from the last room > picked in the Studio / URL > @party > default.
    const party = (this.carry?.members.map(m => m.id) ?? this.explicitParty ?? (this.level.party?.filter(isCrewId) as CrewId[] | undefined) ?? DEFAULT_PARTY).slice(0, 3);
    this.party = party.length ? party : DEFAULT_PARTY;

    const at = (tx: number, ty: number) => ({ x: tx * T + T / 2, y: ty * T + T });
    let spawn = at(2, 2);
    let bossSpawn: { x: number; y: number } | null = null;
    for (const e of this.level.entities) {
      const p = at(e.tx, e.ty);
      switch (e.kind) {
        case 'P': spawn = p; break;
        case 'B': bossSpawn = p; break;
        case 'D': this.addSwitch('door', p.x, p.y); break;
        case 'G': this.addSwitch('gate', p.x, p.y); break;
        case 'L': this.addLaser(e.tx, e.ty); break;
        case 'T': this.terminals.push({ img: this.add.image(p.x, p.y, 'terminal', 'off').setOrigin(0.5, 1).setDepth(5), on: false, target: null }); break;
        case 'F': this.addFan(p.x, p.y - T / 2); break;
        case 'C': this.addCheckpoint(p.x, p.y); break;
        case 'X': this.addExit(p.x, p.y); break;
        case 'h': this.addChai(p.x, p.y); break;
        case 'V': this.addVent(p.x, p.y); break;
        case 'W': this.addCrumbly('catwalk', e.tx * T, e.ty * T, 3); break;
        case 'K': this.addCrumbly('cache', e.tx * T, e.ty * T, 1); break;
        case '<': case '>': this.addWind(p.x, p.y, e.kind === '>' ? 1 : -1); break;
        case 'Q': this.addSwitch('wave', p.x, p.y); break;
        case '1': case '2': case '3': this.addBlock(e.tx, e.ty, e.kind === '1' ? 'red' : e.kind === '2' ? 'blue' : 'yellow'); break;
        case 'M': this.mirrors.push({ spr: this.add.image(p.x, p.y, 'mirror').setOrigin(0.5, 1).setDepth(3), hp: 30, next: 1500, spawned: [] }); break;
        case 'O': this.addBoom(p.x, e.ty * T); break;
        case 'E': this.echoes.push({ spr: this.add.image(p.x, p.y, 'echo').setOrigin(0.5, 1).setDepth(3), next: 1500 + (e.tx * 37) % 1200, rings: [] }); break;
        case '!': this.mortars.push({ x: p.x, y: e.ty * T + T, next: 1200 + (e.tx * 53) % 1500 }); this.add.image(p.x, e.ty * T + 5, 'rage-vent').setDepth(3); break;
        default: if (ENEMY_CHARS[e.kind]) this.spawnEnemy(ENEMY_CHARS[e.kind]!, p.x, p.y);
      }
    }
    this.enemyTotal = this.enemies.getLength();
    // Each terminal drives its nearest door or laser.
    for (const t of this.terminals) {
      t.target = this.switches.filter(s => s.kind === 'door' || s.kind === 'laser').reduce<Switchable | null>((best, d) => !best || Math.abs(d.x - t.img.x) < Math.abs(best.x - t.img.x) ? d : best, null);
    }
    for (const h of this.level.hints) {
      this.add.text(h.tx * T, h.ty * T, h.text, { fontFamily: FONT, fontSize: '8px', color: '#f2f1ec', backgroundColor: '#0f1014cc', padding: { x: 3, y: 2 }, wordWrap: { width: 150 } }).setDepth(2);
    }
    for (const s of this.level.signs) this.addSign(s.tx, s.ty, s.text);
    for (const n of this.level.npcs) this.addNpc(n.tx, n.ty, n.id);
    this.triggers = this.level.triggers.map(t => ({ ...t, fired: false }));

    // Player
    this.checkpoint.set(spawn.x, spawn.y);
    this.avatar = new Avatar(this, spawn.x, spawn.y, this.party);
    if (this.carry) this.avatar.restore(this.carry.members, this.carry.slot);
    this.controls = new LocalInput(this);
    this.avatar.on('jump', () => synth.sfx('jump'));
    this.avatar.on('land', (speed: number) => { synth.sfx('land'); if (speed > 260) fx(this, 'dust-puff', this.avatar.x, this.avatar.y - 6, 9); });
    this.cameras.main.startFollow(this.avatar, true, 0.12, 0.12, 0, 20).setDeadzone(40, 30).setRoundPixels(true);
    this.cameras.main.fadeIn(250, 15, 16, 20);

    // Physics wiring
    this.physics.add.collider(this.avatar, this.layer, (_a, tile) => {
      if ((tile as Phaser.Tilemaps.Tile).index === TILE.HAZARD) this.hurtPlayer(15, this.avatar.x + 1, null, true);
    });
    this.physics.add.collider(this.avatar, this.blockers);
    this.physics.add.collider(this.avatar, this.pens);
    this.physics.add.collider(this.avatar, this.platforms);
    this.physics.add.collider(this.avatar, this.blockGroup, (_a, b) => this.touchBlock(b as Phaser.Physics.Arcade.Image));
    this.physics.add.collider(this.enemies, this.blockGroup);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.layer);
    this.physics.add.collider(this.enemies, this.blockers);
    this.physics.add.collider(this.shots, this.layer, s => (s as Phaser.GameObjects.GameObject).destroy());
    this.physics.add.collider(this.foeShots, this.layer, s => (s as Phaser.GameObjects.GameObject).destroy());
    this.physics.add.overlap(this.shots, this.enemies, (s, e) => this.shotHits(s as Phaser.Physics.Arcade.Sprite, e as Enemy));
    this.physics.add.overlap(this.avatar, this.enemies, (_a, e) => {
      const enemy = e as Enemy;
      if (!enemy.dangerous) return;
      if (enemy.mode === 'attack' || enemy.kind === 'infinite-monkey') this.hurtPlayer(enemy.stats.damage, enemy.x, enemy);
    });
    this.physics.add.overlap(this.avatar, this.foeShots, (_a, s) => {
      const shot = s as Phaser.Physics.Arcade.Image;
      if (this.time.now < (shot.getData('frozenUntil') as number ?? 0)) return;
      if (shot.getData('kind') === 'pulse') {
        if (this.time.now > this.avatar.invulnUntil) { this.avatar.lagUntil = this.time.now + 1600; wordPop(this, this.avatar.x, this.avatar.y - 46, 'BUFFERING…'); }
        this.hurtPlayer(5, shot.x, null);
      } else this.hurtPlayer(shot.getData('damage') as number, shot.x, null, false, shot.getData('from') as string);
      shot.destroy();
    });
    if (bossSpawn && this.level.boss) this.spawnBoss(bossSpawn.x, bossSpawn.y, this.level.boss.id);

    // Bus + keys
    const offs = [
      bus.on('dialogueEnd', () => { this.cutscene = false; const then = this.dialogueThen; this.dialogueThen = undefined; then?.(); this.pumpDialogue(); }),
      bus.on('restart', () => this.scene.restart({ level: this.levelKey, party: this.party, carry: this.carry })),
    ];
    this.events.once('shutdown', () => offs.forEach(off => off()));
    this.input.keyboard!.on('keydown-F2', () => { this.scene.pause(); this.scene.launch('viewer'); });
    this.input.keyboard!.on('keydown-M', () => bus.emit('toast', { text: synth.toggleMute() ? 'Sound off (M)' : 'Sound on (M)' }));
    this.input.keyboard!.on('keydown-R', () => { if (!this.cutscene) this.scene.restart({ level: this.levelKey, party: this.party, carry: this.carry }); });

    this.startAudio();
    bus.emit('toast', { text: `${this.level.name}` });
    if (this.level.dialogue) this.queueDialogue(this.level.dialogue);
    if (this.level.waves.length) this.queueDialogue('', () => this.nextWave());
    if (this.boss && this.level.boss) {
      const boss = this.boss;
      this.queueDialogue(this.level.boss.intro ?? '', () => {
        boss.start();
        if (boss instanceof BeigeCore && this.content.songs?.beige) { this.playSong('beige'); synth.section('A'); }
        else this.playSong(`${this.level.music ?? `ep${this.level.episode}`}-boss`);
      });
    }
  }

  // ---------- Loop ----------
  override update(time: number, delta: number) {
    if (!this.avatar) return;
    const raw = this.controls.read();
    const busy = this.cutscene || this.finished || this.leaving;
    const f = (this.frame = busy ? emptyFrame() : raw);
    if (!busy) this.elapsed += delta;

    if (f.swapTo !== null) this.swap(f.swapTo);
    else if (f.swapNext) this.swap(this.avatar.nextAlive(1));
    else if (f.swapPrev) this.swap(this.avatar.nextAlive(-1));
    if (f.attackPressed) this.attack();
    if (f.abilityPressed) this.ability();
    this.avatar.step(f, time);

    for (const d of this.switches) if (d.tempUntil && time > d.tempUntil) { d.tempUntil = 0; this.setSwitch(d, false); }
    if (this.lureBag) {
      for (const g of this.switches) if (g.kind === 'gate' && !g.open && Math.abs(this.lureBag.x - g.x) < 44 && Math.abs(this.lureBag.y - g.y) < 40) this.payGate(g);
      if (time > this.lureUntil) { const b = this.lureBag; this.lureBag = null; this.tweens.add({ targets: b, alpha: 0, duration: 200, onComplete: () => b.destroy() }); }
    }
    for (const fan of this.fans) {
      const frozen = time < fan.frozenUntil;
      fan.spr.setTint(frozen ? 0x8fa8ff : 0xffffff);
      if (!frozen) fan.spr.angle += delta * 0.9;
      else continue;
      if (Phaser.Math.Distance.Between(fan.spr.x, fan.spr.y, this.avatar.x, this.avatar.y - 16) < 22) this.hurtPlayer(14, fan.spr.x, null, true);
    }
    this.checkWaves();
    this.updateFinale();
    for (const s of this.foeShots.getChildren() as Phaser.Physics.Arcade.Image[]) {
      const body = s.body as Phaser.Physics.Arcade.Body;
      body.moves = time >= ((s.getData('frozenUntil') as number) ?? 0);
      if (body.moves && s.getData('kind') === 'clickbait') {
        // Clickbait: slowly homes in on you. "You won't believe where this goes next."
        const ang = Phaser.Math.Angle.Between(s.x, s.y, this.avatar.x, this.avatar.y - 16);
        body.velocity.x += (Math.cos(ang) * 95 - body.velocity.x) * 0.03;
        body.velocity.y += (Math.sin(ang) * 95 - body.velocity.y) * 0.03;
      }
    }
    for (const sw of this.switches) {
      if (sw.kind === 'laser' && !sw.open && Math.abs(this.avatar.x - sw.x) < 8 && this.avatar.y > sw.y - (sw.obj as Phaser.GameObjects.TileSprite).height && this.avatar.y - 30 < sw.y) this.hurtPlayer(18, sw.x, null);
    }
    this.updateHazards(time, delta);
    this.updateSet(time, delta);
    this.updateFeed(time, delta);
    if (!busy) this.checkTriggers();
    this.checkJoin();
    this.updateNpcHint(f.confirmPressed && !busy);
    if (this.avatar.y > this.level.height * T + 60) { this.hurtPlayer(20, this.avatar.x, null); this.toCheckpoint(); }

    this.style.tick(time, delta);
    this.updateBackdrop(delta);
    if (time - this.lastHud > 100) { this.lastHud = time; bus.emit('hud', this.hud()); }
  }

  // ---------- Party ----------
  private swap(i: number) {
    if (i < 0 || !this.avatar.swapTo(i)) return;
    const id = this.avatar.def.id, now = this.time.now;
    fx(this, 'tag-in-burst', this.avatar.x, this.avatar.y - 22, 19);
    synth.sfx('swap');
    this.say('tagin');
    // Tag-in attack: a small hit around the entrance. Tushar's camera flash stuns.
    let hits = 0;
    for (const e of this.targets()) {
      const d = Phaser.Math.Distance.Between(e.x, e.y, this.avatar.x, this.avatar.y);
      if (d < 40 && e.hit(6, this.avatar.x)) { hits++; this.onHit(e, 'TAG!', `${id}:tagin`, 6); }
      if (id === 'tushar' && d < 70) this.freezeTarget(e, 700);
    }
    if (id === 'tushar') this.cameras.main.flash(80, 255, 255, 255);
    this.style.gain(`${id}:tagin`, hits ? 12 : 4, now);
  }

  // ---------- Combat ----------
  private attack() {
    const a = this.avatar, m = a.member, def = m.def, now = this.time.now;
    if (now < m.attackReadyAt || now < a.hurtUntil) return;
    m.attackReadyAt = now + def.attackCooldownMs;
    const dmgMult = now < a.delegationUntil ? 1.3 : 1;
    const atk = def.attack;
    a.doAction('attack', Math.min(def.attackCooldownMs, a.animMs('attack', 220)));
    if (atk.type === 'melee') {
      this.time.delayedCall(a.hitDelay(70), () => {
        const x0 = a.facing > 0 ? a.x : a.x - atk.range;
        const zone = new Phaser.Geom.Rectangle(x0, a.y - 30, atk.range, atk.height + 8);
        for (const e of this.targets()) {
          if (!Phaser.Geom.Intersects.RectangleToRectangle(zone, e.getBounds())) continue;
          if (e.hit(atk.damage * dmgMult, a.x)) this.onHit(e, atk.word, `${def.id}:attack`, atk.damage * dmgMult);
          else this.overloadShield(e, `${def.id}:attack`);
        }
        for (const m of this.mirrors) if (m.hp > 0 && Phaser.Geom.Intersects.RectangleToRectangle(zone, m.spr.getBounds())) this.hitMirror(m, atk.damage * dmgMult);
      });
    } else {
      const tex = atk.texture === 'paint' && this.textures.exists('paint-glob') ? 'paint-glob' : atk.texture;
      const s = this.shots.create(a.x + a.facing * 10, a.y - 24, tex) as Phaser.Physics.Arcade.Sprite;
      s.setData({ owner: def.id, damage: atk.damage * dmgMult, word: atk.word, kind: atk.texture }).setDepth(15);
      const body = s.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(atk.gravity > 0).setGravityY(atk.gravity - this.physics.world.gravity.y);
      body.setVelocity(a.facing * atk.speed, atk.gravity > 0 ? -170 : 0);
      const spin = `${tex}:idle`;
      if (this.anims.exists(spin)) s.play(spin);
      else if (atk.texture === 'cash') this.tweens.add({ targets: s, angle: 360 * a.facing, duration: 300, repeat: -1 });
      this.time.delayedCall(1400, () => s.active && s.destroy());
    }
  }

  private shotHits(shot: Phaser.Physics.Arcade.Sprite, target: Target) {
    if (!target.alive || !shot.active) return;
    const owner = shot.getData('owner') as CrewId;
    const dmg = shot.getData('damage') as number;
    if (target.hit(dmg, shot.x)) this.onHit(target, shot.getData('word') as string, `${owner}:attack`, dmg);
    else this.overloadShield(target, `${owner}:attack`);
    if (shot.getData('kind') === 'paint') {
      if (target instanceof BossBase && target.shielded && target.shieldBreaker === 'paint') target.dropShield();
      target.markedUntil = this.time.now + 5000; target.restoreTint();
    }
    shot.destroy();
  }

  private onHit(e: Target, word: string, source: string, damage: number) {
    synth.sfx('hit');
    hitstop(this, e.alive ? 55 : 90);
    shake(this, e.alive ? 1 : 2);
    wordPop(this, e.x + Phaser.Math.Between(-6, 6), e.y - e.displayHeight * 0.5, word);
    this.style.gain(source, 8, this.time.now);
    this.style.addScore(damage * 10);
    if (!e.alive) { this.style.addScore(e instanceof BossBase ? 5000 : 250); if (Math.random() < 0.4) this.say('kill'); }
    if (!e.alive && e instanceof Enemy && e.kind === 'pop-up-ad' && this.level.popupsSpawn) {
      if (source === 'brahmansh:jumpcut') { wordPop(this, e.x, e.y - 20, 'AD SKIPPED'); this.style.addScore(300); }
      else {
        wordPop(this, e.x, e.y - 20, '[X] CLOSED?!', true);
        const kind = ENEMY_CHARS[this.level.popupsSpawn] ?? 'infinite-monkey';
        for (const dx of [-14, 14]) { const m = this.spawnEnemy(kind, e.x + dx, e.y); this.enemyTotal++; m.setAlpha(0); this.tweens.add({ targets: m, alpha: 1, duration: 200 }); }
      }
    }
  }

  private hurtPlayer(amount: number, fromX: number, source: Enemy | null, bounce = false, from?: string) {
    const a = this.avatar, now = this.time.now;
    if (now < a.invulnUntil || this.finished || this.leaving) return;
    const m = a.member;
    m.hp = Math.max(0, m.hp - amount);
    a.invulnUntil = now + 900;
    a.hurtUntil = now + 260;
    a.pbody.setVelocityX((Math.sign(a.x - fromX) || -a.facing) * 140);
    a.launch(bounce ? -300 : -160);
    this.style.hurt();
    synth.sfx('hurt');
    shake(this, 2); hitstop(this, 40);
    const monkey = source?.kind === 'infinite-monkey' || from === 'infinite-monkey';
    if (monkey && m.def.id === 'tushar') { a.panicUntil = now + 2000; this.say('monkey', true); }
    else if (Math.random() < 0.35) this.say('hit');
    if (m.hp > 0) return;
    m.ko = true; this.kos++;
    synth.sfx('ko');
    wordPop(this, a.x, a.y - 40, 'KO!', true);
    this.say('ko', true);
    const next = a.nextAlive(1);
    if (next >= 0) this.time.delayedCall(250, () => this.swap(next));
    else this.wipe();
  }

  /** Whole party KO'd: back to the checkpoint, everyone patched up. */
  private wipe() {
    const quips = (this.content.story.quips as { gameover?: string[] } | undefined)?.gameover;
    if (quips?.length) bus.emit('toast', { text: Phaser.Utils.Array.GetRandom(quips) });
    synth.stinger(this.content.songs?.gameover, this.content.songs?.[this.level.music ?? `ep${this.level.episode}`]);
    this.cameras.main.fadeOut(250, 15, 16, 20);
    this.time.delayedCall(260, () => {
      for (const m of this.avatar.members) { m.hp = m.def.maxHp; m.ko = false; }
      this.toCheckpoint();
      this.cameras.main.fadeIn(250, 15, 16, 20);
    });
  }
  private toCheckpoint() {
    this.avatar.setPosition(this.checkpoint.x, this.checkpoint.y);
    this.avatar.pbody.setVelocity(0, 0);
    this.avatar.clearHistory();
    this.avatar.invulnUntil = this.time.now + 1000;
  }

  // ---------- Abilities ----------
  private ability() {
    const a = this.avatar, m = a.member, now = this.time.now;
    if (now < m.abilityReadyAt) { wordPop(this, a.x, a.y - 50, m.def.id === 'sehaj' ? 'RENDERING…' : 'COOLDOWN'); if (m.def.id === 'sehaj') this.say('render'); return; }
    const used = ({
      hack: () => this.hack(), bribe: () => this.bribe(), penTool: () => this.penTool(), fillBucket: () => this.fill(),
      ctrlZ: () => this.ctrlZ(), jumpCut: () => this.jumpCut(), cut: () => this.cut(),
    } as const)[m.def.ability]();
    if (!used) { m.abilityReadyAt = now + 400; return; }
    m.abilityReadyAt = now + m.def.abilityCooldownMs;
    a.doAction('ability', Math.min(450, a.animMs('ability', 300)));
    synth.sfx(`ability-${({ hack: 'hack', bribe: 'bribe', penTool: 'pen', fillBucket: 'fill', ctrlZ: 'ctrlz', jumpCut: 'jumpcut', cut: 'cut' } as const)[m.def.ability]}`);
    synth.sfx('ability');
    this.style.gain(`${m.def.id}:ability`, 10, now);
    this.say('ability');
  }

  private hack(): boolean {
    const a = this.avatar, now = this.time.now;
    const term = this.nearest(this.terminals, t => t.img, 110);
    if (this.boss?.shielded && this.boss.shieldBreaker === 'hack' && (term || Phaser.Math.Distance.Between(this.boss.x, this.boss.y, a.x, a.y) < 170)) {
      if (term) { term.img.setFrame('on'); this.time.delayedCall(1500, () => term.img.setFrame('off')); }
      return this.boss.dropShield();
    }
    if (term) {
      term.on = !term.on;
      term.img.setFrame(term.on ? 'on' : 'off');
      if (term.target) this.setSwitch(term.target, term.on);
      wordPop(this, term.img.x, term.img.y - 20, 'BZZT');
      return true;
    }
    const e = this.nearest(this.liveEnemies(), x => x, 110);
    if (e) { e.hackedUntil = now + 5000; e.restoreTint(); wordPop(this, e.x, e.y - 24, 'PWNED'); return true; }
    wordPop(this, a.x, a.y - 50, 'NO SIGNAL');
    return false;
  }

  private bribe(): boolean {
    this.lureBag?.destroy();
    const a = this.avatar;
    const bag = this.physics.add.image(a.x + a.facing * 12, a.y - 20, 'money-bag').setDepth(8);
    bag.setVelocity(a.facing * 90, -140);
    this.physics.add.collider(bag, this.layer);
    this.physics.add.collider(bag, this.blockers);
    this.lureBag = bag;
    this.lureUntil = this.time.now + 4000;
    wordPop(this, bag.x, bag.y - 10, 'LE RE', true);
    return true;
  }
  private activeLure() {
    if (!this.lureBag || this.time.now > this.lureUntil) return null;
    return new Phaser.Math.Vector2(this.lureBag.x, this.lureBag.y);
  }

  private penTool(): boolean {
    const a = this.avatar;
    const len = 6 * T;
    const x = a.facing > 0 ? a.x + 6 : a.x - 6 - len;
    const y = a.y + (this.frame.up ? -40 : 2);
    const line = this.add.tileSprite(x + len / 2, y, len, 4, 'pen-line').setDepth(6);
    this.pens.add(line);
    const body = line.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false; body.checkCollision.left = false; body.checkCollision.right = false;
    for (const ax of [x, x + len]) {
      const anchor = this.add.sprite(ax, y, this.textures.exists('pen-anchor') ? 'pen-anchor' : 'spark').setDepth(7);
      if (this.anims.exists('pen-anchor:idle')) anchor.play('pen-anchor:idle');
      this.time.delayedCall(6000, () => anchor.destroy());
    }
    line.setScale(0.1, 1);
    this.tweens.add({ targets: line, scaleX: 1, duration: 120 });
    this.time.delayedCall(5000, () => this.tweens.add({ targets: line, alpha: 0.3, yoyo: true, repeat: 4, duration: 100 }));
    this.time.delayedCall(6000, () => { this.pens.remove(line, true, true); });
    wordPop(this, a.x, a.y - 50, 'SNAP');
    return true;
  }

  private fill(): boolean {
    const now = this.time.now;
    if (this.boss?.shielded && this.boss.shieldBreaker === 'paint' && Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.avatar.x, this.avatar.y) < 220) {
      fx(this, 'hit-spark', this.boss.x, this.boss.y);
      return this.boss.dropShield();
    }
    // Paint bucket: flood-fill the connected group of colour blocks nearest you.
    const blk = this.nearest(this.blocks, b => b.spr, 72);
    if (blk) {
      const order: BlockColor[] = ['red', 'blue', 'yellow'];
      const next = order[(order.indexOf(blk.color) + 1) % 3]!;
      const group = this.floodBlocks(blk);
      group.forEach((b, i) => this.time.delayedCall(i * 25, () => this.paintBlock(b, next)));
      wordPop(this, blk.spr.x, blk.spr.y - 16, next === 'red' ? 'RED = SOLID' : next === 'blue' ? 'BLUE = THROUGH' : 'YELLOW = BOING');
      this.style.gain('manya:fill', 10, now);
      return true;
    }
    const door = this.nearest(this.switches.filter(d => !d.open && d.kind === 'door'), d => d, 60);
    if (door) { this.setSwitch(door, true); door.tempUntil = now + 4000; door.obj.setTint(0x6a8cff); wordPop(this, door.x, door.y - 34, 'BLUE = THROUGH'); return true; }
    const e = this.nearest(this.targets(), x => x, 140);
    if (e) { e.markedUntil = now + 6000; e.restoreTint(); wordPop(this, e.x, e.y - 24, 'SPLASH'); return true; }
    wordPop(this, this.avatar.x, this.avatar.y - 50, 'NOTHING TO PAINT');
    return false;
  }

  private ctrlZ(): boolean {
    const a = this.avatar, now = this.time.now;
    // 1) Rewind broken catwalks / cache blocks nearby.
    const broken = this.crumbly.filter(c => c.state !== 'intact' && Phaser.Math.Distance.Between(c.spr.x, c.spr.y, a.x, a.y) < 170);
    // 2) Rewind enemy projectiles: they fly back where they came from, now on our side.
    const shots = (this.foeShots.getChildren() as Phaser.Physics.Arcade.Image[]).filter(s => Phaser.Math.Distance.Between(s.x, s.y, a.x, a.y - 16) < 140);
    if (broken.length || shots.length) {
      for (const c of broken) this.setCrumbly(c, 'intact', now);
      for (const s of shots) {
        const b = s.body as Phaser.Physics.Arcade.Body;
        const back = this.shots.create(s.x, s.y, s.texture.key) as Phaser.Physics.Arcade.Sprite;
        back.setData({ owner: 'sehaj', damage: 16, word: 'REWIND', kind: 'rewind' }).setDepth(15).setTint(0xc39aff);
        const nb = back.body as Phaser.Physics.Arcade.Body;
        nb.setAllowGravity(false).setVelocity(-b.velocity.x * 1.4 || 0, -b.velocity.y * 1.4 || -120);
        this.time.delayedCall(2000, () => back.active && back.destroy());
        s.destroy();
      }
      wordPop(this, a.x, a.y - 50, 'CTRL+Z', true);
      this.style.gain('sehaj:rewind-world', 14, now);
      return true;
    }
    // 3) Otherwise rewind yourself 3 seconds.
    const p = a.rewindPoint;
    if (!p) return false;
    const ghost = this.add.image(a.x, a.y, a.texture.key, a.frame.name).setOrigin(0.5, 1).setAlpha(0.5).setTint(0x7a3ad6).setFlipX(a.flipX);
    this.tweens.add({ targets: ghost, alpha: 0, duration: 400, onComplete: () => ghost.destroy() });
    a.setPosition(p.x, p.y);
    a.pbody.setVelocity(0, 0);
    a.member.hp = Math.max(a.member.hp, p.hp);
    a.clearHistory();
    wordPop(this, a.x, a.y - 50, 'CTRL+Z', true);
    return true;
  }

  private jumpCut(): boolean {
    const a = this.avatar;
    for (const dist of [64, 48, 32, 16]) {
      const nx = a.x + a.facing * dist;
      if (this.blockedAt(nx, a.y)) continue;
      const from = a.x;
      this.lastJumpCutAt = this.time.now;
      const crossed = (e: { x: number; y: number }, dy = 30) => Math.min(from, nx) - 8 < e.x && e.x < Math.max(from, nx) + 8 && Math.abs(e.y - a.y) < dy;
      if (this.boss?.shielded && this.boss.shieldBreaker === 'jumpcut' && crossed(this.boss, 70)) { this.boss.dropShield(); wordPop(this, this.boss.x, this.boss.y - 40, 'AD SKIPPED', true); }
      for (const e of this.targets()) {
        // You land on the far side: the hit comes from behind (that's how you beat The Algorithm's guard).
        if (crossed(e, e instanceof BossBase ? 70 : 30) && e.hit(e instanceof BossBase ? 16 : 8, nx + a.facing * 4)) this.onHit(e, 'CUT', 'brahmansh:jumpcut', 8);
      }
      const ghost = this.add.image(a.x, a.y, a.texture.key, a.frame.name).setOrigin(0.5, 1).setAlpha(0.6).setFlipX(a.flipX);
      this.tweens.add({ targets: ghost, alpha: 0, duration: 200, onComplete: () => ghost.destroy() });
      a.setX(nx);
      a.invulnUntil = Math.max(a.invulnUntil, this.time.now + 200);
      return true;
    }
    return false;
  }

  private cut(): boolean {
    const now = this.time.now, view = this.cameras.main.worldView;
    for (const e of this.targets()) if (view.contains(e.x, e.y - 8)) this.freezeTarget(e, 3000);
    for (const fan of this.fans) if (view.contains(fan.spr.x, fan.spr.y)) fan.frozenUntil = now + 3000;
    for (const v of this.vents) if (view.contains(v.x, v.y)) v.frozenUntil = now + 3000;
    for (const b of this.booms) if (view.contains(b.x, b.y + 30)) b.frozenUntil = now + 3000;
    for (const w of this.winds) if (view.contains(w.spr.x, w.spr.y)) { w.frozenUntil = now + 3000; if (this.anims.exists('big-fan:frozen')) w.spr.play('big-fan:frozen'); else w.spr.setTint(0x8fa8ff); }
    for (const s of this.foeShots.getChildren() as Phaser.Physics.Arcade.Image[]) { s.setData('frozenUntil', now + 3000); s.setTint(0x8fa8ff); this.time.delayedCall(3000, () => s.active && s.clearTint()); }
    this.cameras.main.flash(120, 255, 255, 255);
    wordPop(this, this.avatar.x, this.avatar.y - 56, 'CUT!', true);
    return true;
  }
  private freezeTarget(e: Target, ms: number) {
    if (e instanceof BossBase) e.freeze(ms);
    else { e.frozenUntil = Math.max(e.frozenUntil, this.time.now + ms); e.restoreTint(); }
  }

  // ---------- World objects ----------
  private spawnEnemy(kind: EnemyKind, x: number, y: number) {
    const e = new Enemy(this, x, y, kind, {
      playerPos: () => new Phaser.Math.Vector2(this.avatar.x, this.avatar.y - 16),
      lure: () => this.activeLure(),
      shoot: (sx, sy, vx, vy, tex) => this.foeShot(sx, sy, vx, vy, tex, 8, kind, 420),
    });
    if (kind === 'buffering-wheel-minion') (e.body as Phaser.Physics.Arcade.Body).setSize(12, 12).setOffset(2, 4);
    this.enemies.add(e);
    return e;
  }
  private foeShot(x: number, y: number, vx: number, vy: number, tex: string, damage: number, from: string, gravity: number) {
    const s = this.foeShots.create(x, y, tex) as Phaser.Physics.Arcade.Image;
    s.setData({ damage, from, frozenUntil: 0, kind: tex }).setDepth(14);
    const body = s.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(gravity > 0).setGravityY(gravity - this.physics.world.gravity.y).setVelocity(vx, vy);
    this.time.delayedCall(4000, () => s.active && s.destroy());
  }

  private spawnBoss(x: number, y: number, id: string) {
    const W = this.level.width * T, H = this.level.height * T;
    const Klass = BOSSES[id as keyof typeof BOSSES] ?? ReplyAllMothership;
    this.boss = new Klass(this, x, y, {
      playerPos: () => new Phaser.Math.Vector2(this.avatar.x, this.avatar.y - 16),
      // The arena's bottom is the top of the floor (rooms have 3 floor rows).
      arena: () => new Phaser.Geom.Rectangle(T, T, W - 2 * T, H - 4 * T),
      spawnShot: (sx, sy, vx, vy, kind = 'email') => this.foeShot(sx, sy, vx, vy, kind, kind === 'lag-spike' ? 12 : 10, 'boss', kind === 'thumb' ? 520 : kind === 'rage' ? 380 : 0),
      spawnMinion: (mx, my, kind = 'reply-all-drone') => { const d = this.spawnEnemy(kind as EnemyKind, mx, my); this.enemyTotal++; d.setAlpha(0); this.tweens.add({ targets: d, alpha: 1, duration: 200 }); },
      minions: () => this.liveEnemies().length,
      onPhase: phase => this.onBossPhase(phase),
    });
    this.physics.add.overlap(this.shots, this.boss, (b, s) => this.shotHits(s as Phaser.Physics.Arcade.Sprite, b as BossBase));
    if (this.boss instanceof TheAlgorithm) this.boss.onBlocked = () => { synth.sfx('menu'); if (Math.random() < 0.3) bus.emit('toast', { text: 'Its front is guarded. Hit it from BEHIND (JUMP CUT through it!)' }); };
    if (this.boss instanceof StockPhotoFamily) {
      const fam = this.boss;
      fam.onPhoto = () => {
        this.cameras.main.flash(160, 255, 255, 255);
        wordPop(this, fam.x, fam.y - 60, 'SAY CHEESE!', true);
        const a = this.avatar;
        const facing = Math.sign(fam.x - a.x) === a.facing;
        if (facing && Math.abs(fam.x - a.x) < 300 && this.time.now > a.invulnUntil) { a.lagUntil = this.time.now + 1600; wordPop(this, a.x, a.y - 46, 'BLINDED'); }
        else { wordPop(this, a.x, a.y - 46, 'LOOKED AWAY'); this.style.gain('photo:dodge', 10, this.time.now); }
      };
    }
    this.physics.add.overlap(this.avatar, this.boss, () => { if (this.boss?.dangerous) this.hurtPlayer(this.boss.stats.damage, this.boss.x, null); });
  }
  private onBossPhase(phase: 'shield-up' | 'shield-down' | 'attack' | 'defeated') {
    const boss = this.boss!;
    if (phase === 'shield-up') { bus.emit('toast', { text: boss instanceof BeigeCore ? `FRICTIONLESS SHIELD: overload it. Push STYLE to ${boss.styleNeeded >= 85 ? 'S' : 'A'}!` : boss.shieldBreaker === 'jumpcut' ? 'UNSKIPPABLE AD: JUMP CUT through it to skip' : boss.shieldBreaker === 'paint' ? 'BEIGE VARNISH: only Manya\'s paint cracks it' : this.level.boss?.id === 'buffering-wheel' ? 'PYLONS OVERHEATED: HACK a pylon to expose the core' : 'SHIELD UP: HACK it (Ashwath, or a terminal)' }); this.taunt(boss); synth.sfx('boss-roar'); }
    else if (phase === 'shield-down') { this.style.gain('hack:shield', 20, this.time.now); this.style.addScore(1000); }
    else if (phase === 'attack') { if (Math.random() < 0.3) this.taunt(boss); }
    else {
      if (boss instanceof BeigeCore) { bus.emit('beige', { amount: 0 }); this.beigeWash?.destroy(); this.beigeWash = null; this.cameras.main.flash(900, 255, 255, 255); }
      for (const e of this.liveEnemies()) e.hit(999, e.x);
      this.style.addScore(5000);
      synth.stop();
      this.time.delayedCall(1600, () => this.queueDialogue(this.level.boss?.outro ?? '', () => this.complete()));
    }
  }
  /** BEIGE's shield can't be damaged, only overloaded: blocked hits still feed STYLE. */
  private overloadShield(t: Target, source: string) {
    if (!(t instanceof BossBase) || !t.shielded || t.shieldBreaker !== 'style') return;
    this.style.gain(source, 5, this.time.now);
    if (Math.random() < 0.3) wordPop(this, t.x + Phaser.Math.Between(-20, 20), t.y - 30, '+STYLE');
  }
  private updateFinale() {
    const b = this.boss;
    if (!(b instanceof BeigeCore) || b.mode === 'intro') return;
    if (b.shielded && this.style.meter >= b.styleNeeded) {
      b.dropShield();
      const phase = b.phase;
      this.cameras.main.flash(250, 255, 47, 54);
      synth.section(phase === 2 ? 'B' : 'C');
      const scene = DialogueSchema.safeParse(this.content.dialogue[`ep4-beige-phase${phase}`]);
      if (scene.success) scene.data.lines.slice(0, 3).forEach((l, i) => this.time.delayedCall(i * 1700, () => b.alive && bark(this, l.speaker === 'beige' ? b : this.avatar, l.text, l.speaker === 'beige' ? 50 : -52)));
    }
    // The wash: BEIGE drains the screen; STYLE pushes it back.
    const amount = b.alive ? Phaser.Math.Clamp(0.6 - this.style.meter / 140, 0, 0.6) : 0;
    if (!this.beigeWash) this.beigeWash = this.add.rectangle(0, 0, 480, 270, 0xf5f5dc).setOrigin(0).setScrollFactor(0).setDepth(35).setAlpha(0);
    this.beigeWash.setAlpha(this.beigeWash.alpha + (amount * 0.55 - this.beigeWash.alpha) * 0.05);
    const rounded = Math.round(amount * 10) / 10;
    if (rounded !== this.lastBeigeEmit) { this.lastBeigeEmit = rounded; bus.emit('beige', { amount: rounded }); }
  }

  private taunt(boss: BossBase) {
    const raw = this.content.dialogue[`ep${this.level.episode}-boss-taunts`];
    const parsed = DialogueSchema.safeParse(raw);
    if (!parsed.success) return;
    bark(this, boss, Phaser.Utils.Array.GetRandom(parsed.data.lines).text, 44);
  }

  private addSwitch(kind: 'door' | 'gate' | 'wave', x: number, y: number) {
    const img = this.blockers.create(x, y, kind === 'gate' ? 'gate' : 'door', kind === 'gate' ? undefined : 'closed') as Phaser.Physics.Arcade.Image;
    if (kind === 'wave') img.setTint(0xff7a7a);
    img.setOrigin(0.5, 1).setDepth(4).refreshBody();
    this.switches.push({ kind, obj: img, open: false, tempUntil: 0, x, y });
  }
  private addLaser(tx: number, ty: number) {
    const top = (ceilingAbove(this.level, tx, ty) + 1) * T, bottom = (ty + 1) * T;
    const beam = this.add.tileSprite(tx * T + T / 2, bottom, 6, bottom - top, 'laser').setOrigin(0.5, 1).setDepth(4);
    this.tweens.add({ targets: beam, alpha: 0.7, yoyo: true, repeat: -1, duration: 120 });
    this.switches.push({ kind: 'laser', obj: beam, open: false, tempUntil: 0, x: beam.x, y: bottom });
  }
  private setSwitch(d: Switchable, open: boolean) {
    if (d.open !== open) synth.sfx('door');
    d.open = open;
    if (d.kind === 'laser') { d.obj.setVisible(!open); return; }
    const img = d.obj as Phaser.Physics.Arcade.Image;
    (img.body as Phaser.Physics.Arcade.StaticBody).enable = !open;
    if (d.kind === 'door' || d.kind === 'wave') img.setFrame(open ? 'open' : 'closed');
    else img.setAlpha(open ? 0 : 1);
    if (!open) img.clearTint();
  }
  private payGate(g: Switchable) {
    this.setSwitch(g, true);
    wordPop(this, g.x, g.y - 40, 'PAID', true);
    synth.sfx('pickup');
    this.style.gain('sayam:toll', 15, this.time.now);
    this.style.addScore(500);
  }
  private addFan(x: number, y: number) {
    const spr = this.physics.add.staticImage(x, y, 'fan').setDepth(4);
    (spr.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    this.fans.push({ spr, frozenUntil: 0 });
  }
  private addChai(x: number, y: number) {
    const cup = this.physics.add.staticSprite(x, y - 8, 'chai').setDepth(5);
    if (this.anims.exists('chai:idle')) cup.play('chai:idle');
    this.tweens.add({ targets: cup, y: y - 11, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.InOut' });
    this.time.delayedCall(0, () => this.physics.add.overlap(this.avatar, cup, () => {
      const m = this.avatar.member;
      if (m.hp >= m.def.maxHp) return;
      m.hp = Math.min(m.def.maxHp, m.hp + 35);
      fx(this, 'heal-sparkle', this.avatar.x, this.avatar.y - 20, 30);
      wordPop(this, cup.x, cup.y - 12, '+CHAI');
      synth.sfx('pickup');
      cup.destroy();
    }));
  }
  private addSign(tx: number, ty: number, text: string) {
    const t = this.add.text(tx * T, ty * T, text, {
      fontFamily: FONT, fontSize: '8px', color: '#4fbf6a', backgroundColor: '#0f1014', padding: { x: 4, y: 3 }, wordWrap: { width: 120 },
    }).setDepth(1).setAlpha(0.95);
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(2, 0x5a5b63).strokeRect(t.x - 1, t.y - 1, t.width + 2, t.height + 2);
  }
  private addNpc(tx: number, ty: number, id: string) {
    const x = tx * T + T / 2, y = (ty + 1) * T;
    const spr = this.add.sprite(x, y, this.textures.exists(id) ? id : 'stock-intern').setOrigin(0.5, 1).setDepth(6);
    if (this.anims.exists(animKey(id, 'idle'))) spr.play(animKey(id, 'idle'));
    else spr.setTint(0xfecb56);
    const cast = (this.content.story.cast as { cast?: { id: string; name: string }[] } | undefined)?.cast;
    this.npcs.push({ spr, id, name: cast?.find(c => c.id === id)?.name ?? id });
  }
  private updateNpcHint(interact: boolean) {
    const near = this.nearest(this.npcs, n => n.spr, 40);
    this.hint = near ? `ENTER / F · talk to ${near.name}` : null;
    if (near) near.spr.setFlipX(this.avatar.x < near.spr.x);
    if (!near || !interact) return;
    const talk = animKey(near.id, 'talk');
    if (this.anims.exists(talk)) near.spr.play(talk);
    this.queueDialogue(`ep${this.level.episode}-npc-${near.id}`, () => { if (this.anims.exists(animKey(near.id, 'idle'))) near.spr.play(animKey(near.id, 'idle')); });
  }
  private checkTriggers() {
    const tx = Math.floor(this.avatar.x / T), ty = Math.floor((this.avatar.y - 1) / T);
    for (const t of this.triggers) {
      if (t.fired || tx < t.tx || tx >= t.tx + t.w || ty < t.ty || ty >= t.ty + t.h) continue;
      t.fired = true;
      this.queueDialogue(t.dialogue);
    }
  }
  private checkJoin() {
    const j = this.level.join;
    const crews = j?.crew.filter(isCrewId) ?? [];
    if (!j || this.joined || this.enemyTotal === 0 || this.liveEnemies().length > 0 || !crews.length) return;
    this.joined = true;
    this.time.delayedCall(500, () => this.queueDialogue(j.dialogue, () => crews.forEach(crew => this.join(crew))));
  }
  private join(crew: CrewId) {
    for (const n of this.npcs.filter(n => n.id === crew)) { fx(this, 'tag-in-burst', n.spr.x, n.spr.y - 22, 19); n.spr.destroy(); }
    this.npcs = this.npcs.filter(n => n.id !== crew);
    if (!this.avatar.addMember(crew)) {
      // Party is full: the newcomer takes the last slot (story beats beat party size).
      const out = this.avatar.members[this.avatar.members.length - 1]!;
      this.avatar.members[this.avatar.members.length - 1] = { def: CREW[crew], hp: CREW[crew].maxHp, ko: false, abilityReadyAt: 0, attackReadyAt: 0 };
      bus.emit('toast', { text: `${out.def.name} heads back to HQ to make room.` });
      if (this.avatar.slot === this.avatar.members.length - 1) this.avatar.swapTo(0);
    }
    this.party = this.avatar.members.map(m => m.def.id);
    fx(this, 'tag-in-burst', this.avatar.x, this.avatar.y - 22, 19);
    synth.sfx('style-rankup'); synth.sfx('pickup');
    bus.emit('toast', { text: `${CREW[crew].name} joined the party! Press ${this.avatar.members.length} to swap in.` });
  }

  // ---------- Episode 1 hazards ----------
  private addVent(x: number, y: number) {
    const spr = this.add.sprite(x, y, 'steam-vent').setOrigin(0.5, 1).setDepth(4);
    if (this.anims.exists('steam-vent:idle')) spr.play('steam-vent:idle');
    this.vents.push({ spr, x, y, phase: (x * 7) % 2600, frozenUntil: 0, bursting: false });
  }
  private addCrumbly(kind: 'catwalk' | 'cache', x: number, y: number, tiles: number) {
    const w = tiles * T;
    const tex = kind === 'catwalk' ? 'catwalk' : 'cache-block';
    const spr = this.platforms.create(x + w / 2, y + 8, tex) as Phaser.Physics.Arcade.Sprite;
    spr.setDepth(4).setDisplaySize(w, 16).refreshBody();
    const body = spr.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false; body.checkCollision.left = false; body.checkCollision.right = false;
    const c: Crumbly = { spr, kind, state: 'intact', at: 0, w };
    this.setCrumbly(c, 'intact', 0);
    this.crumbly.push(c);
  }
  private setCrumbly(c: Crumbly, state: Crumbly['state'], now: number) {
    c.state = state; c.at = now;
    const body = c.spr.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = state !== 'broken';
    const anim = c.kind === 'catwalk' ? `catwalk:${state === 'crumbling' ? 'crumble' : state}` : null;
    if (anim && this.anims.exists(anim)) c.spr.play(anim);
    c.spr.setAlpha(state === 'broken' ? (anim && this.anims.exists(anim) ? 0.8 : 0.15) : state === 'crumbling' ? 0.85 : 1);
    if (state === 'intact' && now) { c.spr.setTint(0xc39aff); this.time.delayedCall(300, () => c.spr.clearTint()); }
  }
  private addWind(x: number, y: number, dir: 1 | -1) {
    const spr = this.add.sprite(x, y - 16, 'big-fan').setDepth(4).setFlipX(dir < 0);
    if (this.anims.exists('big-fan:idle')) spr.play('big-fan:idle');
    this.winds.push({ spr, dir, frozenUntil: 0 });
  }
  private updateHazards(time: number, delta: number) {
    const a = this.avatar;
    void delta;
    for (const v of this.vents) {
      const frozen = time < v.frozenUntil;
      const t = (time + v.phase) % 2600;
      const burst = !frozen && t > 1700;
      if (burst !== v.bursting) {
        v.bursting = burst;
        const anim = `steam-vent:${burst ? 'burst' : 'idle'}`;
        if (this.anims.exists(anim)) v.spr.play(anim); else v.spr.setScale(1, burst ? 1.6 : 1);
        if (burst && Phaser.Math.Distance.Between(v.x, v.y, a.x, a.y) < 200) synth.sfx('land');
      }
      v.spr.setTint(frozen ? 0x8fa8ff : 0xffffff);
      if (burst && Math.abs(a.x - v.x) < 10 && a.y > v.y - 52 && a.y - 30 < v.y) this.hurtPlayer(12, v.x, null, true);
    }
    for (const c of this.crumbly) {
      if (c.state === 'intact') {
        const on = a.pbody.touching.down && Math.abs(a.y - (c.spr.y - 8)) < 3 && Math.abs(a.x - c.spr.x) < c.w / 2 + 6;
        if (on) this.setCrumbly(c, 'crumbling', time);
      } else if (c.state === 'crumbling' && time - c.at > (c.kind === 'catwalk' ? 450 : 1100)) {
        this.setCrumbly(c, 'broken', time);
        synth.sfx('hit');
      } else if (c.state === 'broken') {
        // Cache blocks come back on their own. Catwalks only do if nobody in the party can CTRL+Z.
        const hasSehaj = this.avatar.members.some(m => m.def.id === 'sehaj' && !m.ko);
        if (c.kind === 'cache' ? time - c.at > 3000 : !hasSehaj && time - c.at > 5000) this.setCrumbly(c, 'intact', time);
      }
    }
    a.wind = 0;
    for (const w of this.winds) {
      const frozen = time < w.frozenUntil;
      if (!frozen && w.spr.anims.currentAnim?.key === 'big-fan:frozen') { w.spr.play('big-fan:idle'); }
      if (!frozen) w.spr.clearTint();
      if (frozen) continue;
      const dx = (a.x - w.spr.x) * w.dir;
      // Strong near the turbine (you barely make headway), fading out by ~15 tiles.
      if (dx > 0 && dx < 240 && Math.abs(a.y - 16 - w.spr.y) < 48) a.wind += w.dir * 105 * (1 - dx / 260);
    }
  }

  // ---------- Episode 2: The Set ----------
  private addBlock(tx: number, ty: number, color: BlockColor) {
    const spr = this.blockGroup.create(tx * T + T / 2, ty * T + T / 2, `color-block-${color}`) as Phaser.Physics.Arcade.Image;
    spr.setDepth(4).refreshBody();
    const b: ColorBlock = { spr, tx, ty, color };
    this.blocks.push(b);
    this.paintBlock(b, color);
  }
  private paintBlock(b: ColorBlock, color: BlockColor) {
    b.color = color;
    b.spr.setTexture(`color-block-${color}`);
    const body = b.spr.body as Phaser.Physics.Arcade.StaticBody;
    body.enable = color !== 'blue';
    b.spr.setAlpha(color === 'blue' ? 0.45 : 1);
    this.tweens.add({ targets: b.spr, scale: { from: 1.25, to: 1 }, duration: 120 });
  }
  private floodBlocks(start: ColorBlock): ColorBlock[] {
    const key = (x: number, y: number) => `${x},${y}`;
    const map = new Map(this.blocks.map(b => [key(b.tx, b.ty), b]));
    const seen = new Set<string>(), out: ColorBlock[] = [], queue = [start];
    while (queue.length) {
      const b = queue.shift()!;
      const k = key(b.tx, b.ty);
      if (seen.has(k) || b.color !== start.color) continue;
      seen.add(k); out.push(b);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = map.get(key(b.tx + dx!, b.ty + dy!)); if (n) queue.push(n); }
    }
    return out;
  }
  private touchBlock(spr: Phaser.Physics.Arcade.Image) {
    const b = this.blocks.find(x => x.spr === spr);
    if (!b || b.color !== 'yellow' || !this.avatar.pbody.touching.down) return;
    this.avatar.launch(-470);
    this.tweens.add({ targets: spr, scaleY: { from: 0.7, to: 1 }, duration: 160 });
    synth.sfx('jump');
    wordPop(this, spr.x, spr.y - 12, 'BOING');
  }
  private hitMirror(m: Mirror, dmg: number) {
    m.hp -= dmg;
    synth.sfx('hit'); hitstop(this, 40);
    m.spr.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.time.delayedCall(60, () => m.spr.setTintMode(Phaser.TintModes.MULTIPLY).clearTint());
    if (m.hp > 0) return;
    wordPop(this, m.spr.x, m.spr.y - 30, 'SMASH', true);
    fx(this, 'hit-spark', m.spr.x, m.spr.y - 16);
    this.style.addScore(400);
    this.tweens.add({ targets: m.spr, alpha: 0.25, angle: 8, duration: 200 });
  }
  private addBoom(x: number, y: number) {
    const arm = this.add.image(x, y, 'boom-mic').setOrigin(0, 0.5).setDepth(5);
    this.add.rectangle(x, y, 4, 4, 0x0f1014).setDepth(5);
    this.booms.push({ arm, x, y, len: 64, phase: (x * 13) % 3000, frozenUntil: 0, angle: 0 });
  }
  private updateSet(time: number, delta: number) {
    void delta;
    const a = this.avatar;
    for (const m of this.mirrors) {
      if (m.hp <= 0) continue;
      m.spawned = m.spawned.filter(e => e.alive);
      if (time > m.next && m.spawned.length < 2 && Math.abs(a.x - m.spr.x) < 360) {
        m.next = time + 4500;
        const e = this.spawnEnemy('stock-intern', m.spr.x + 12, m.spr.y);
        this.enemyTotal++;
        m.spawned.push(e);
        e.setAlpha(0); this.tweens.add({ targets: e, alpha: 1, duration: 300 });
      }
    }
    for (const b of this.booms) {
      const frozen = time < b.frozenUntil;
      b.arm.setTint(frozen ? 0x8fa8ff : 0xffffff);
      if (!frozen) b.angle = Math.PI / 2 + Math.sin((time + b.phase) / 700) * 1.1;
      b.arm.setRotation(b.angle).setDisplaySize(b.len, 16);
      const tipX = b.x + Math.cos(b.angle) * b.len, tipY = b.y + Math.sin(b.angle) * b.len;
      if (!frozen && Phaser.Math.Distance.Between(tipX, tipY, a.x, a.y - 16) < 16) this.hurtPlayer(14, tipX, null);
    }
  }

  // ---------- Episode 3: The Feed ----------
  private updateFeed(time: number, delta: number) {
    const a = this.avatar, H = this.level.height * T, W = this.level.width * T;
    // The rising scroll of deleted posts.
    if (this.level.scroll && !this.cutscene && !this.finished) {
      if (this.scrollY === Infinity) {
        this.scrollY = H + 8;
        this.scrollRect = this.add.tileSprite(0, this.scrollY, W, H, 'deleted-posts').setOrigin(0, 0).setDepth(30).setAlpha(0.92);
      }
      if (this.elapsed > this.level.scroll.delay) this.scrollY -= this.level.scroll.speed * Math.min(delta, 50) / 1000;
      this.scrollRect!.setY(this.scrollY).setTilePosition(0, -time * 0.05);
      if (a.y - 8 > this.scrollY) {
        this.hurtPlayer(12, a.x, null, true);
        a.launch(-420);
        if (this.time.now - this.lastBark > 1500) wordPop(this, a.x, a.y - 40, 'ALGORITHMIC OBSCURITY');
      }
      for (const e of this.liveEnemies()) if (e.y - 8 > this.scrollY) e.hit(999, e.x);
    }
    // Echo chamber shockwaves.
    for (const e of this.echoes) {
      if (time > e.next) {
        e.next = time + 2600;
        e.rings.push({ g: this.add.circle(e.spr.x, e.spr.y - 12, 8).setStrokeStyle(2, 0x8fa8ff, 0.9).setDepth(9), born: time, hit: false });
      }
      e.rings = e.rings.filter(r => {
        const age = (time - r.born) / 1200;
        if (age > 1) { r.g.destroy(); return false; }
        const rad = 8 + age * 140;
        r.g.setRadius(rad).setAlpha(1 - age);
        const d = Phaser.Math.Distance.Between(r.g.x, r.g.y, a.x, a.y - 16);
        if (!r.hit && Math.abs(d - rad) < 10 && time > a.invulnUntil) {
          r.hit = true;
          const ang = Phaser.Math.Angle.Between(r.g.x, r.g.y, a.x, a.y - 16);
          a.pbody.setVelocityX(Math.cos(ang) * 260);
          a.launch(Math.min(-140, Math.sin(ang) * 260));
          wordPop(this, a.x, a.y - 40, 'I AGREE!');
          this.hurtPlayer(4, r.g.x, null);
        }
        return true;
      });
    }
    // Rage-bait mortars.
    for (const m of this.mortars) {
      if (time < m.next || Math.abs(a.x - m.x) > 300) continue;
      m.next = time + 1800 + Math.random() * 600;
      this.foeShot(m.x + Phaser.Math.Between(-40, 40), m.y, Phaser.Math.Between(-20, 20), 30, 'rage', 9, 'mortar', 380);
    }
  }

  // ---------- Waves ----------
  private nextWave() {
    const max = Math.max(0, ...this.level.waves.map(w => w.n));
    this.wave++;
    if (this.wave > max) {
      for (const s of this.switches) if (s.kind === 'wave') this.setSwitch(s, true);
      bus.emit('toast', { text: 'Background process force-quit. Door open!' });
      this.style.addScore(1500);
      return;
    }
    bus.emit('toast', { text: `WAVE ${this.wave} / ${max}` });
    for (const w of this.level.waves.filter(w => w.n === this.wave)) {
      const kind = ENEMY_CHARS[w.kind];
      if (!kind) continue;
      const e = this.spawnEnemy(kind, w.tx * T + T / 2, (w.ty + 1) * T);
      this.enemyTotal++;
      e.setAlpha(0); this.tweens.add({ targets: e, alpha: 1, duration: 250 });
      fx(this, 'tag-in-burst', e.x, e.y - 16, 19);
    }
  }
  private checkWaves() {
    if (!this.level.waves.length || this.wave === 0 || this.cutscene) return;
    const max = Math.max(...this.level.waves.map(w => w.n));
    if (this.wave > max || this.liveEnemies().length > 0) return;
    this.wave += 0; // waiting for the delayed spawn below
    if (this.waveTimer) return;
    this.waveTimer = this.time.delayedCall(900, () => { this.waveTimer = null; this.nextWave(); });
  }
  private waveTimer: Phaser.Time.TimerEvent | null = null;

  private blockedAt(x: number, feetY: number) {
    for (const dy of [2, 16, 30]) for (const dx of [-7, 7]) {
      const t = this.layer.getTileAtWorldXY(x + dx, feetY - dy);
      if (t && SOLID.has(t.index)) return true;
    }
    if (this.blocks.some(b => b.color !== 'blue' && Math.abs(b.spr.x - x) < 15 && feetY > b.spr.y - 8 && feetY - 30 < b.spr.y + 8)) return true;
    return this.switches.some(d => d.kind !== 'laser' && !d.open && Math.abs(d.x - x) < 14 && feetY > d.y - 34 && feetY - 30 < d.y);
  }
  private liveEnemies(): Enemy[] { return (this.enemies.getChildren() as Enemy[]).filter(e => e.alive); }
  private targets(): Target[] { const t: Target[] = this.liveEnemies(); if (this.boss?.alive) t.push(this.boss); return t; }
  private nearest<X>(items: X[], pos: (x: X) => { x: number; y: number }, max: number): X | null {
    let best: X | null = null, bestD = max;
    for (const it of items) { const p = pos(it); const d = Phaser.Math.Distance.Between(p.x, p.y, this.avatar.x, this.avatar.y - 16); if (d < bestD) { bestD = d; best = it; } }
    return best;
  }

  private addCheckpoint(x: number, y: number) {
    const flag = this.physics.add.staticSprite(x, y, 'checkpoint').setOrigin(0.5, 1).refreshBody();
    const anim = (n: string) => { if (this.anims.exists(animKey('checkpoint', n))) flag.play(animKey('checkpoint', n)); else flag.setAlpha(n === 'active' ? 1 : 0.6); };
    anim('idle');
    // Entities are built before the avatar exists, so wire the overlap on the next tick.
    this.time.delayedCall(0, () => this.physics.add.overlap(this.avatar, flag, () => {
      if (this.checkpoint.x === x && this.checkpoint.y === y) return;
      this.checkpoint.set(x, y);
      anim('active');
      for (const m of this.avatar.members) { if (m.ko) { m.ko = false; m.hp = Math.round(m.def.maxHp / 2); } }
      wordPop(this, x, y - 30, 'SAVED');
      synth.sfx('checkpoint'); synth.sfx('pickup');
    }));
  }
  private addExit(x: number, y: number) {
    const door = this.physics.add.staticSprite(x, y, 'exit').setOrigin(0.5, 1).refreshBody();
    if (this.anims.exists('exit:idle')) door.play('exit:idle');
    this.time.delayedCall(0, () => this.physics.add.overlap(this.avatar, door, () => {
      if (this.leaving || this.finished || this.cutscene) return;
      if (this.boss?.alive) return;
      if (this.anims.exists('exit:open')) door.play('exit:open');
      if (this.level.next) this.leaveRoom(this.level.next);
      else this.complete();
    }));
  }
  private leaveRoom(next: string) {
    this.leaving = true;
    synth.sfx('door');
    const carry: Carry = {
      members: this.avatar.members.map(m => ({ id: m.def.id, hp: m.hp, ko: m.ko })), slot: this.avatar.slot,
      style: { meter: this.style.meter, score: this.style.score }, elapsed: this.elapsed, kos: this.kos,
    };
    this.cameras.main.fadeOut(300, 15, 16, 20);
    this.time.delayedCall(320, () => this.scene.restart({ level: next, carry }));
  }
  private complete() {
    if (this.finished) return;
    this.finished = true;
    synth.stinger(this.content.songs?.results);
    synth.sfx('style-rankup');
    wordPop(this, this.avatar.x, this.avatar.y - 50, "THAT'S A WRAP", true);
    bus.emit('levelComplete', { episode: this.level.episode, timeMs: Math.round(this.elapsed), style: this.style.score, kos: this.kos, party: this.avatar.members.map(m => m.def.id) });
  }

  // ---------- Backdrop: colour returns as the room is cleared ----------
  private bgLayers: { drained: Phaser.GameObjects.TileSprite; saturated: Phaser.GameObjects.TileSprite; factor: number }[] = [];
  private enemyTotal = 0;
  private saturation = 0;

  private buildBackdrop(W: number, H: number) {
    this.bgLayers = [];
    this.saturation = 0;
    const layers = [['far', 0.1, -30], ['mid', 0.3, -20], ['near', 0.6, -10]] as const;
    const set = this.level.backdrop && this.level.backdrop !== 'neo-amritsar' ? `bg-${this.level.backdrop}-` : 'bg-';
    if (!this.textures.exists(`${set}far-drained`)) return this.drawGreybox(W, H);
    for (const [name, factor, depth] of layers) {
      if (!this.textures.exists(`${set}${name}-drained`)) continue;
      const make = (variant: string) => this.add.tileSprite(0, 0, 480, 270, `${set}${name}-${variant}`).setOrigin(0).setScrollFactor(0).setDepth(depth);
      const drained = make('drained');
      const saturated = make(this.textures.exists(`${set}${name}-saturated`) ? 'saturated' : 'drained').setAlpha(0).setDepth(depth + 1);
      this.bgLayers.push({ drained, saturated, factor });
    }
  }
  private updateBackdrop(dt: number) {
    const cam = this.cameras.main;
    const bossDone = this.boss ? (1 - this.boss.hp / this.boss.maxHp) : null;
    const cleared = bossDone ?? (this.enemyTotal ? 1 - this.liveEnemies().length / this.enemyTotal : 0);
    const target = this.finished || this.leaving ? 1 : cleared * 0.85;
    this.saturation += (target - this.saturation) * Math.min(1, dt / 600);
    for (const l of this.bgLayers) {
      l.drained.tilePositionX = l.saturated.tilePositionX = cam.scrollX * l.factor;
      l.saturated.setAlpha(this.saturation);
    }
  }
  private drawGreybox(W: number, H: number) {
    for (const [depth, color, factor] of [[-30, 0x34322d, 0.2], [-20, 0x3e3b35, 0.45]] as const) {
      const g = this.add.graphics().setDepth(depth).setScrollFactor(factor, 1);
      g.fillStyle(color);
      for (let x = 0; x < W * factor + 480; x += 38 + ((x * 7) % 30)) {
        const h = 60 + ((x * 13) % 110);
        g.fillRect(x, H - h - 48, 30 + ((x * 3) % 20), h + 48);
      }
    }
  }

  // ---------- Audio ----------
  private startAudio() {
    const bank = SfxSchema.safeParse(this.content.sfx);
    synth.setSfxBank(bank.success ? bank.data.sfx : null);
    this.playSong(this.level.music ?? `ep${this.level.episode}`);
  }
  private playSong(id: string) {
    const song = SongSchema.safeParse(this.content.songs?.[id]);
    if (song.success) synth.play(song.data);
  }

  // ---------- Dialogue ----------
  /** Dialogue plays one scene at a time. Missing scenes (not written yet) are skipped but still run `then`. */
  private queueDialogue(id: string, then?: () => void) {
    this.dialogueQueue.push({ id, then });
    if (!this.cutscene) this.pumpDialogue();
  }
  private pumpDialogue() {
    while (!this.cutscene && this.dialogueQueue.length) {
      const { id, then } = this.dialogueQueue.shift()!;
      const parsed = DialogueSchema.safeParse(this.content.dialogue[id]);
      if (!parsed.success) { then?.(); continue; }
      this.cutscene = true;
      this.dialogueThen = then;
      const cast = (this.content.story.cast as { cast?: { id: string; name: string }[] } | undefined)?.cast ?? [];
      bus.emit('dialogueStart', { ...parsed.data, names: Object.fromEntries(cast.map(c => [c.id, c.name])) });
    }
  }

  private say(category: string, force = false) {
    const now = this.time.now;
    if (!force && now - this.lastBark < 1400) return;
    const def = this.avatar.def;
    const raw = this.content.barks[def.id] as { barks?: Record<string, unknown> } | undefined;
    const fromContent = raw?.barks?.[category];
    const lines = Array.isArray(fromContent) ? fromContent.filter((s): s is string => typeof s === 'string') : [];
    const fallback: Record<string, string[]> = { tagin: [def.catchphrase], ability: [`${def.abilityName}!`], ko: ['ugh…'], monkey: ['MONKEY!!'] };
    const pick = lines.length ? lines : fallback[category] ?? [];
    if (!pick.length || pick[0] === '…') return;
    this.lastBark = now;
    bark(this, this.avatar, Phaser.Utils.Array.GetRandom(pick));
  }

  private hud(): HudState {
    const now = this.time.now;
    return {
      party: this.avatar.members.map((m, i) => ({
        id: m.def.id, name: m.def.name, className: m.def.className, color: hex(m.def.color),
        hp: m.hp, maxHp: m.def.maxHp, ko: m.ko, active: i === this.avatar.slot, abilityName: m.def.abilityName,
        cooldown: Math.max(0, Math.min(1, (m.abilityReadyAt - now) / m.def.abilityCooldownMs)),
      })),
      style: { rank: this.style.rank.name, meter: this.style.meter, score: this.style.score },
      timeMs: Math.round(this.elapsed),
      hint: this.cutscene ? null : this.hint,
      boss: this.boss && this.boss.mode !== 'intro' ? { name: this.boss.title, hp: this.boss.hp, maxHp: this.boss.maxHp, shielded: this.boss.shielded } : null,
    };
  }
}
