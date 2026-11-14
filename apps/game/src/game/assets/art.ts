// Loads Astra's art from manifest.json and fills every gap with a generated placeholder,
// so the game always runs whatever state the art is in.
import * as Phaser from 'phaser';
import { CREW_IDS, type Manifest, ManifestSchema } from '@qublox/shared';
import { CREW } from '../crew';

export type AnimInfo = { frames: number; fps: number; loop: boolean; hitFrame?: number };
export type SpriteInfo = { frameWidth: number; frameHeight: number; anims: Record<string, AnimInfo>; placeholder: boolean };

/** Every sprite the game can draw, real or placeholder. Key = manifest key. */
export const SPRITES: Record<string, SpriteInfo> = {};
export const animKey = (sprite: string, anim: string) => `${sprite}:${anim}`;
export let manifest: Manifest | null = null;
export let manifestErrors: string[] = [];

const ASSET_ROOT = '/assets/';

/** Phase 1 (preload): fetch the manifest. */
export function preloadManifest(scene: Phaser.Scene) {
  scene.load.json('manifest', ASSET_ROOT + 'manifest.json');
}

/** Phase 2: queue every file the manifest lists. Returns false if there's nothing to load. */
export function queueManifestFiles(scene: Phaser.Scene): boolean {
  const raw = scene.cache.json.get('manifest');
  if (!raw) return false;
  const parsed = ManifestSchema.safeParse(raw);
  if (!parsed.success) {
    manifestErrors = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`);
    console.warn('[art] manifest.json is invalid, using placeholders:', manifestErrors);
    return false;
  }
  manifest = parsed.data;
  for (const [key, s] of Object.entries(manifest.sprites)) {
    scene.load.spritesheet(key, ASSET_ROOT + s.file, { frameWidth: s.frameWidth, frameHeight: s.frameHeight });
  }
  for (const [key, t] of Object.entries(manifest.tilesets)) scene.load.image(`tiles-${key}`, ASSET_ROOT + t.file);
  for (const [key, im] of Object.entries(manifest.images)) scene.load.image(key, ASSET_ROOT + im.file);
  for (const [key, p] of Object.entries(manifest.portraits)) {
    scene.load.spritesheet(`portrait-${key}`, ASSET_ROOT + p.file, { frameWidth: p.size, frameHeight: p.size });
  }
  return true;
}

/** Phase 3: build animations for real sprites, then placeholders for everything missing. */
export function buildArt(scene: Phaser.Scene) {
  if (manifest) {
    for (const [key, s] of Object.entries(manifest.sprites)) {
      if (!scene.textures.exists(key)) continue; // failed to load: falls through to placeholder
      const src = scene.textures.get(key).getSourceImage() as HTMLImageElement;
      const cols = Math.max(1, Math.floor(src.width / s.frameWidth));
      const info: SpriteInfo = { frameWidth: s.frameWidth, frameHeight: s.frameHeight, anims: {}, placeholder: false };
      for (const [name, a] of Object.entries(s.anims)) {
        const frames = Array.from({ length: a.frames }, (_, i) => a.row * cols + i);
        scene.anims.create({ key: animKey(key, name), frames: scene.anims.generateFrameNumbers(key, { frames }), frameRate: a.fps, repeat: a.loop ? -1 : 0 });
        info.anims[name] = { frames: a.frames, fps: a.fps, loop: a.loop, hitFrame: a.hitFrame };
      }
      SPRITES[key] = info;
    }
  }
  deriveFromAtlas(scene);
  for (const id of CREW_IDS) if (!SPRITES[id]) makeCrewPlaceholder(scene, id, CREW[id].color, CREW[id].name[0]!);
  makeEnemyPlaceholder(scene, 'stock-intern', 48, 0xd8c8a8, 'smile');
  makeEnemyPlaceholder(scene, 'reply-all-drone', 32, 0xc9bfae, 'drone');
  makeEnemyPlaceholder(scene, 'infinite-monkey', 32, 0x8a6a4a, 'monkey');
  makeEnemyPlaceholder(scene, 'corporate-memphis-blob', 48, 0x8f6ad6, 'smile');
  makeEnemyPlaceholder(scene, 'pop-up-ad', 32, 0xd8d8e0, 'drone');
  makeEnemyPlaceholder(scene, 'buffering-wheel-minion', 16, 0xc9bfae, 'drone');
  makeProps(scene);
}

/** Door and terminal objects reuse tiles from Astra's HQ atlas (see docs/art/tiles-hq.md). */
function deriveFromAtlas(scene: Phaser.Scene) {
  if (!scene.textures.exists('tiles-hq')) return;
  const img = scene.textures.get('tiles-hq').getSourceImage() as HTMLImageElement;
  const cols = Math.floor(img.width / 16);
  const blit = (c: CanvasRenderingContext2D, index: number, dx: number, dy: number) =>
    c.drawImage(img, (index % cols) * 16, Math.floor(index / cols) * 16, 16, 16, dx, dy, 16, 16);
  canvasTex(scene, 'door', 32, 32, c => { blit(c, 13, 0, 0); blit(c, 14, 0, 16); blit(c, 15, 16, 0); blit(c, 16, 16, 16); });
  const door = scene.textures.get('door');
  door.add('closed', 0, 0, 0, 16, 32); door.add('open', 0, 16, 0, 16, 32);
  canvasTex(scene, 'terminal', 32, 16, c => { blit(c, 17, 0, 0); blit(c, 18, 16, 0); });
  const term = scene.textures.get('terminal');
  term.add('off', 0, 0, 0, 16, 16); term.add('on', 0, 16, 0, 16, 16);
}

// ---------- Placeholder painters (Canvas 2D) ----------
type Frame = (ctx: CanvasRenderingContext2D, x: number, y: number, i: number) => void;

function paintSheet(scene: Phaser.Scene, key: string, size: number, rows: [string, number, number, boolean, number?][], draw: (anim: string) => Frame) {
  const cols = Math.max(...rows.map(r => r[1]));
  const tex = scene.textures.createCanvas(key, cols * size, rows.length * size)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const info: SpriteInfo = { frameWidth: size, frameHeight: size, anims: {}, placeholder: true };
  rows.forEach(([anim, frames, fps, loop, hitFrame], r) => {
    const names: string[] = [];
    for (let i = 0; i < frames; i++) {
      draw(anim)(ctx, i * size, r * size, i);
      const name = `${anim}-${i}`;
      tex.add(name, 0, i * size, r * size, size, size);
      names.push(name);
    }
    scene.anims.create({ key: animKey(key, anim), frames: names.map(frame => ({ key, frame })), frameRate: fps, repeat: loop ? -1 : 0 });
    info.anims[anim] = { frames, fps, loop, hitFrame };
  });
  tex.refresh();
  SPRITES[key] = info;
}

const css = (n: number) => '#' + n.toString(16).padStart(6, '0');
const INK = '#0f1014';
const BONE = '#f2f1ec';

function makeCrewPlaceholder(scene: Phaser.Scene, id: string, color: number, letter: string) {
  paintSheet(scene, id, 48, [
    ['idle', 2, 3, true], ['run', 4, 10, true], ['jump', 1, 1, false], ['fall', 1, 1, true],
    ['attack', 3, 14, false, 1], ['ability', 3, 10, false], ['hurt', 1, 1, false], ['ko', 2, 4, false], ['tagin', 2, 10, false], ['panic', 2, 10, true],
  ], anim => (ctx, x, y, i) => {
    const bob = anim === 'idle' ? i : anim === 'run' ? (i % 2) : 0;
    const lean = anim === 'run' ? 2 : anim === 'attack' && i === 1 ? 4 : 0;
    const ko = anim === 'ko';
    ctx.save();
    ctx.translate(x + 24, y + 47);
    if (ko) ctx.rotate(-Math.PI / 2 * (i === 1 ? 1 : 0.5));
    // legs
    ctx.fillStyle = INK;
    const legA = anim === 'run' ? [-5, 3, 5, -3][i % 4]! : 0;
    ctx.fillRect(-6 + legA, -10, 4, 10);
    ctx.fillRect(2 - legA, -10, 4, 10);
    // body
    ctx.fillStyle = INK; ctx.fillRect(-10 + lean, -32 + bob, 20, 24);
    ctx.fillStyle = css(color); ctx.fillRect(-9 + lean, -31 + bob, 18, 22);
    // head
    ctx.fillStyle = INK; ctx.fillRect(-8 + lean, -44 + bob, 16, 14);
    ctx.fillStyle = BONE; ctx.fillRect(-7 + lean, -43 + bob, 14, 12);
    ctx.fillStyle = INK; ctx.fillRect(1 + lean, -39 + bob, 2, 3); ctx.fillRect(5 + lean, -39 + bob, 2, 3);
    // letter on chest
    ctx.fillStyle = BONE; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center'; ctx.fillText(letter, lean, -15 + bob);
    // attack arm / ability glow
    if (anim === 'attack' && i >= 1) { ctx.fillStyle = INK; ctx.fillRect(8 + lean, -24, i === 1 ? 14 : 8, 4); }
    if (anim === 'ability') { ctx.strokeStyle = '#ff2f36'; ctx.lineWidth = 2; ctx.strokeRect(-14 - i, -46 - i, 28 + i * 2, 46 + i * 2); }
    if (anim === 'hurt' || anim === 'panic') { ctx.fillStyle = '#ff2f36'; ctx.fillRect(-12, -48, 24, 2); }
    if (anim === 'tagin') { ctx.strokeStyle = '#fecb56'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -24, 18 + i * 4, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
  });
}

function makeEnemyPlaceholder(scene: Phaser.Scene, key: string, size: number, color: number, kind: 'smile' | 'drone' | 'monkey') {
  if (SPRITES[key]) return;
  paintSheet(scene, key, size, [
    ['idle', 2, 3, true], ['move', 2, 6, true], ['telegraph', 2, 12, true], ['attack', 2, 10, false], ['hurt', 1, 1, false], ['die', 3, 8, false],
  ], anim => (ctx, x, y, i) => {
    const s = size;
    const pad = Math.round(s * 0.18);
    const shake = anim === 'telegraph' ? (i ? 1 : -1) : 0;
    ctx.save();
    ctx.translate(x + shake, y + (anim === 'move' ? i : 0));
    if (anim === 'die') ctx.globalAlpha = 1 - i * 0.33;
    ctx.fillStyle = INK; ctx.fillRect(pad - 1, pad - 1, s - pad * 2 + 2, s - pad * 2 + 2);
    ctx.fillStyle = anim === 'telegraph' ? '#ff2f36' : anim === 'hurt' ? '#ffffff' : css(color);
    ctx.fillRect(pad, pad, s - pad * 2, s - pad * 2);
    ctx.fillStyle = INK;
    if (kind === 'smile') { ctx.fillRect(s * 0.38, s * 0.36, 3, 3); ctx.fillRect(s * 0.56, s * 0.36, 3, 3); ctx.fillRect(s * 0.36, s * 0.52, s * 0.28, 2); }
    if (kind === 'drone') { ctx.fillRect(pad, s / 2 - 1, s - pad * 2, 2); ctx.fillRect(s / 2 - 4, pad - 4, 8, 3); }
    if (kind === 'monkey') { ctx.fillRect(s * 0.3, s * 0.35, 3, 3); ctx.fillRect(s * 0.6, s * 0.35, 3, 3); ctx.fillStyle = '#d9b48a'; ctx.fillRect(s * 0.32, s * 0.5, s * 0.36, s * 0.18); }
    if (anim === 'attack') { ctx.fillStyle = '#ff2f36'; ctx.fillRect(s - pad, s / 2 - 2, pad, 4); }
    ctx.restore();
  });
}

function canvasTex(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h)!;
  const ctx = t.getContext();
  draw(ctx);
  t.refresh();
}

export const TILE = { ONEWAY_L: 9, ONEWAY_M: 10, ONEWAY_R: 11, HAZARD: 12 } as const;

function makeProps(scene: Phaser.Scene) {
  // Mishthi's improvised prop (placeholder: a little vase with a flower), until Astra draws the real ones.
  canvasTex(scene, 'prop', 12, 12, c => { c.fillStyle = INK; c.fillRect(3, 4, 6, 8); c.fillStyle = '#e8c26a'; c.fillRect(4, 5, 4, 6); c.fillStyle = '#9a3050'; c.fillRect(5, 0, 2, 4); c.fillStyle = '#ff5a7a'; c.fillRect(4, 0, 4, 2); });
  // Sayam: a speech bubble (his attack) and a hype speaker (SMOOTH TALK), until Astra draws them.
  canvasTex(scene, 'bubble', 14, 10, c => { c.fillStyle = INK; c.fillRect(0, 0, 14, 8); c.fillRect(3, 8, 3, 2); c.fillStyle = '#f2f1ec'; c.fillRect(1, 1, 12, 6); c.fillRect(4, 7, 1, 2); c.fillStyle = '#1d7a3a'; c.fillRect(3, 3, 2, 2); c.fillRect(6, 3, 2, 2); c.fillRect(9, 3, 2, 2); });
  canvasTex(scene, 'hype-speaker', 14, 16, c => { c.fillStyle = INK; c.fillRect(1, 1, 12, 15); c.fillStyle = '#1d7a3a'; c.fillRect(2, 2, 10, 13); c.fillStyle = INK; c.fillRect(4, 4, 6, 4); c.fillRect(5, 10, 4, 4); c.fillStyle = '#f2f1ec'; c.fillRect(6, 5, 2, 2); });
  canvasTex(scene, 'paint', 8, 8, c => { c.fillStyle = '#d63a8f'; c.beginPath(); c.arc(4, 4, 4, 0, Math.PI * 2); c.fill(); });
  if (!scene.textures.exists('door')) {
    canvasTex(scene, 'door', 32, 32, c => {
      c.fillStyle = INK; c.fillRect(0, 0, 16, 32); c.fillStyle = '#0000a8'; c.fillRect(2, 2, 12, 28); c.fillStyle = '#ff2f36'; c.fillRect(11, 15, 2, 4);
      c.fillStyle = INK; c.fillRect(16, 0, 2, 32); c.fillRect(30, 0, 2, 32);
    });
    const door = scene.textures.get('door');
    door.add('closed', 0, 0, 0, 16, 32); door.add('open', 0, 16, 0, 16, 32);
  }
  if (!scene.textures.exists('terminal')) canvasTex(scene, 'terminal', 32, 16, c => {
    for (const [ox, on] of [[0, false], [16, true]] as const) {
      c.fillStyle = INK; c.fillRect(ox + 1, 1, 14, 15); c.fillStyle = on ? '#4fbf6a' : '#3a3b44'; c.fillRect(ox + 3, 3, 10, 7);
      c.fillStyle = '#8a8b94'; c.fillRect(ox + 3, 12, 10, 2);
    }
  });
  const term = scene.textures.get('terminal');
  if (!term.has('off')) { term.add('off', 0, 0, 0, 16, 16); term.add('on', 0, 16, 0, 16, 16); }
  canvasTex(scene, 'checkpoint', 12, 24, c => { c.fillStyle = INK; c.fillRect(0, 0, 2, 24); c.fillStyle = '#fecb56'; c.fillRect(2, 1, 10, 7); });
  canvasTex(scene, 'exit', 24, 32, c => { c.fillStyle = INK; c.fillRect(0, 0, 24, 32); c.fillStyle = '#ff2f36'; c.fillRect(2, 2, 20, 28); c.fillStyle = BONE; c.font = 'bold 8px monospace'; c.fillText('EXIT', 3, 18); });
  canvasTex(scene, 'pen-line', 16, 4, c => { c.fillStyle = '#ff8a1f'; c.fillRect(0, 0, 16, 2); c.fillStyle = INK; c.fillRect(0, 2, 16, 2); });
  canvasTex(scene, 'paper', 8, 8, c => { c.fillStyle = INK; c.fillRect(0, 0, 8, 8); c.fillStyle = BONE; c.fillRect(1, 1, 6, 6); c.fillStyle = '#8a8b94'; c.fillRect(2, 3, 4, 1); });
  canvasTex(scene, 'email', 12, 8, c => { c.fillStyle = INK; c.fillRect(0, 0, 12, 8); c.fillStyle = BONE; c.fillRect(1, 1, 10, 6); c.fillStyle = '#ff2f36'; c.fillRect(1, 1, 5, 1); c.fillRect(6, 1, 5, 1); c.fillRect(5, 2, 2, 2); });
  canvasTex(scene, 'laser', 6, 16, c => { c.fillStyle = '#ff2f3644'; c.fillRect(0, 0, 6, 16); c.fillStyle = '#ff2f36'; c.fillRect(2, 0, 2, 16); c.fillStyle = '#ffd0d0'; for (let y = 0; y < 16; y += 4) c.fillRect(2, y, 2, 1); });
  canvasTex(scene, 'gate', 16, 32, c => {
    c.fillStyle = INK; c.fillRect(0, 0, 16, 32);
    for (let y = 0; y < 32; y += 6) { c.fillStyle = y % 12 ? '#fecb56' : '#0f1014'; c.fillRect(1, y + 1, 14, 4); }
    c.fillStyle = '#ff2f36'; c.fillRect(3, 13, 10, 6); c.fillStyle = BONE; c.font = 'bold 6px monospace'; c.fillText('CR', 4, 18);
  });
  canvasTex(scene, 'fan', 32, 32, c => {
    c.translate(16, 16); c.fillStyle = '#8a8b94';
    for (let i = 0; i < 4; i++) { c.rotate(Math.PI / 2); c.beginPath(); c.moveTo(0, 0); c.lineTo(14, -5); c.lineTo(14, 5); c.closePath(); c.fill(); }
    c.fillStyle = INK; c.beginPath(); c.arc(0, 0, 4, 0, Math.PI * 2); c.fill(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.arc(16, 16, 15, 0, Math.PI * 2); c.stroke();
  });
  canvasTex(scene, 'fx-heart', 32, 32, c => {
    const px = ['..XX...XX..', '.XXXX.XXXX.', 'XXXXXXXXXXX', 'XXXXXXXXXXX', 'XXXXXXXXXXX', '.XXXXXXXXX.', '..XXXXXXX..', '...XXXXX...', '....XXX....', '.....X.....'];
    px.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === 'X') { c.fillStyle = y < 2 && x % 5 === 2 ? '#ffd1e0' : '#ff3d7f'; c.fillRect(x * 3, y * 3 + 1, 3, 3); } }));
  });
  canvasTex(scene, 'boulder', 16, 16, c => { c.fillStyle = INK; c.fillRect(2, 3, 12, 11); c.fillRect(4, 1, 8, 14); c.fillStyle = '#8a8478'; c.fillRect(3, 4, 10, 9); c.fillRect(5, 2, 6, 12); c.fillStyle = '#b5ad9c'; c.fillRect(5, 4, 3, 2); c.fillStyle = '#5f5a52'; c.fillRect(9, 9, 3, 3); });
  canvasTex(scene, 'cracked-wall', 16, 32, c => { c.fillStyle = INK; c.fillRect(0, 0, 16, 32); c.fillStyle = '#7d7466'; c.fillRect(1, 1, 14, 30); c.fillStyle = INK; for (const [x, y, w, h] of [[7, 2, 1, 6], [5, 8, 3, 1], [5, 9, 1, 7], [6, 16, 4, 1], [9, 17, 1, 8], [3, 24, 7, 1], [11, 6, 3, 1]]) c.fillRect(x!, y!, w!, h!); });
  canvasTex(scene, 'sprite-can', 16, 16, c => { c.fillStyle = INK; c.fillRect(4, 1, 8, 15); c.fillStyle = '#3fbf5a'; c.fillRect(5, 3, 6, 12); c.fillStyle = '#c8f0d0'; c.fillRect(5, 2, 6, 1); c.fillStyle = '#fecb56'; c.fillRect(5, 7, 6, 3); c.fillStyle = BONE; c.fillRect(6, 4, 1, 8); });
  canvasTex(scene, 'telescope', 32, 32, c => { c.fillStyle = INK; c.fillRect(14, 16, 2, 16); c.fillRect(8, 30, 14, 2); c.save(); c.translate(16, 16); c.rotate(-0.6); c.fillRect(-12, -3, 24, 6); c.fillStyle = '#5a6a8a'; c.fillRect(-11, -2, 22, 4); c.fillStyle = '#fecb56'; c.fillRect(9, -2, 2, 4); c.restore(); });
  canvasTex(scene, 'tape', 16, 16, c => { c.fillStyle = INK; c.fillRect(1, 3, 14, 10); c.fillStyle = '#ff3b30'; c.fillRect(2, 4, 12, 4); c.fillStyle = BONE; c.fillRect(3, 9, 10, 3); c.fillStyle = INK; c.fillRect(4, 10, 2, 1); c.fillRect(10, 10, 2, 1); c.fillStyle = '#fecb56'; c.fillRect(3, 5, 5, 1); });
  canvasTex(scene, 'chai', 16, 16, c => { c.fillStyle = INK; c.fillRect(4, 5, 8, 10); c.fillStyle = '#c98a4a'; c.fillRect(5, 6, 6, 8); c.fillStyle = BONE; c.fillRect(6, 1, 1, 3); c.fillRect(9, 0, 1, 3); });
  canvasTex(scene, 'lag-spike', 10, 10, c => { c.fillStyle = INK; c.beginPath(); c.arc(5, 5, 5, 0, Math.PI * 2); c.fill(); c.fillStyle = '#ff2f36'; c.beginPath(); c.arc(5, 5, 3, 0, Math.PI * 2); c.fill(); });
  canvasTex(scene, 'pulse', 10, 10, c => { c.strokeStyle = '#8fa8ff'; c.lineWidth = 2; c.beginPath(); c.arc(5, 5, 4, 0, Math.PI * 2); c.stroke(); });
  canvasTex(scene, 'cache-block', 16, 16, c => { c.fillStyle = INK; c.fillRect(0, 0, 16, 16); c.fillStyle = '#3a6ea5'; c.fillRect(1, 1, 14, 14); c.fillStyle = '#8fd8ff'; for (let i = 2; i < 14; i += 4) c.fillRect(i, 3, 2, 10); });
  canvasTex(scene, 'mirror', 20, 32, c => {
    c.fillStyle = INK; c.fillRect(0, 0, 20, 32); c.fillStyle = '#fecb56'; for (let y = 2; y < 30; y += 5) { c.fillRect(1, y, 2, 2); c.fillRect(17, y, 2, 2); }
    c.fillStyle = '#c9d8e0'; c.fillRect(4, 3, 12, 26); c.fillStyle = '#f2f1ec'; c.fillRect(6, 5, 3, 10);
  });
  canvasTex(scene, 'boom-mic', 32, 16, c => { c.fillStyle = INK; c.fillRect(0, 6, 22, 3); c.fillStyle = '#5a5b63'; c.fillRect(20, 2, 12, 12); c.fillStyle = '#8a8b94'; for (let x = 21; x < 31; x += 2) c.fillRect(x, 3, 1, 10); });
  canvasTex(scene, 'thumb', 12, 12, c => { c.fillStyle = INK; c.fillRect(1, 4, 10, 8); c.fillStyle = '#e8c9a0'; c.fillRect(2, 5, 8, 6); c.fillRect(4, 0, 4, 5); c.fillStyle = INK; c.fillRect(4, 0, 4, 1); });
  for (const [k, col] of [['color-block-red', '#ff2f36'], ['color-block-blue', '#3a6ea5'], ['color-block-yellow', '#fecb56']] as const) {
    canvasTex(scene, k, 16, 16, c => { c.fillStyle = INK; c.fillRect(0, 0, 16, 16); c.fillStyle = col; c.fillRect(1, 1, 14, 14); });
  }
  canvasTex(scene, 'clickbait', 14, 10, c => { c.fillStyle = INK; c.fillRect(0, 0, 14, 10); c.fillStyle = '#ff2f36'; c.fillRect(1, 1, 12, 8); c.fillStyle = '#fecb56'; c.fillRect(2, 2, 5, 3); c.fillStyle = BONE; c.fillRect(8, 6, 4, 2); });
  canvasTex(scene, 'rage', 12, 12, c => { c.fillStyle = '#ff2f36'; c.beginPath(); c.arc(6, 6, 6, 0, Math.PI * 2); c.fill(); c.fillStyle = INK; c.fillRect(3, 4, 2, 2); c.fillRect(7, 4, 2, 2); c.fillRect(3, 8, 6, 1); });
  canvasTex(scene, 'echo', 16, 24, c => { c.fillStyle = INK; c.fillRect(2, 4, 12, 20); c.fillStyle = '#5a5b63'; c.fillRect(3, 5, 10, 18); c.fillStyle = '#8fa8ff'; c.beginPath(); c.arc(8, 12, 4, 0, Math.PI * 2); c.fill(); });
  canvasTex(scene, 'deleted-posts', 32, 32, c => {
    c.fillStyle = '#2a0f12'; c.fillRect(0, 0, 32, 32);
    for (const [x, y] of [[2, 2], [17, 10], [4, 19]] as const) {
      c.fillStyle = '#c9bfae'; c.fillRect(x, y, 12, 10); c.fillStyle = '#ff2f36'; c.fillRect(x + 1, y + 1, 10, 2);
      c.fillStyle = '#8a8b94'; c.fillRect(x + 1, y + 5, 8, 1); c.fillRect(x + 1, y + 7, 6, 1);
    }
    c.fillStyle = '#ff2f36'; c.fillRect(0, 0, 32, 1);
  });
  canvasTex(scene, 'rage-vent', 24, 10, c => { c.fillStyle = INK; c.fillRect(0, 0, 24, 10); c.fillStyle = '#ff2f36'; for (let x = 2; x < 22; x += 5) c.fillRect(x, 6, 3, 4); });
  if (!scene.textures.exists('beige-core')) {
    canvasTex(scene, 'beige-core', 112, 112, c => {
      c.translate(56, 56);
      c.fillStyle = INK; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; c.lineTo(Math.cos(a) * 52, Math.sin(a) * 52); } c.closePath(); c.fill();
      c.fillStyle = '#f5f5dc'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; c.lineTo(Math.cos(a) * 48, Math.sin(a) * 48); } c.closePath(); c.fill();
      c.fillStyle = '#d8d2b8'; c.beginPath(); c.arc(0, 0, 24, 0, Math.PI * 2); c.fill();
      c.fillStyle = INK; c.fillRect(-14, -6, 8, 4); c.fillRect(6, -6, 8, 4); c.fillRect(-12, 8, 24, 3);
      c.setTransform(1, 0, 0, 1, 0, 0);
    });
  }
  if (!scene.textures.exists('the-algorithm')) {
    canvasTex(scene, 'the-algorithm', 96, 96, c => {
      c.fillStyle = INK; c.fillRect(8, 16, 80, 64); c.fillStyle = '#d63a8f'; c.fillRect(10, 18, 76, 60);
      c.fillStyle = '#fecb56'; c.fillRect(14, 22, 30, 20); c.fillStyle = '#3a6ea5'; c.fillRect(50, 22, 30, 20);
      c.fillStyle = BONE; c.fillRect(14, 48, 66, 6); c.fillRect(14, 58, 50, 6);
      c.fillStyle = '#ff2f36'; c.beginPath(); c.arc(16, 70, 6, 0, Math.PI * 2); c.fill();
    });
  }
  canvasTex(scene, 'sign', 16, 16, c => { c.fillStyle = INK; c.fillRect(0, 0, 16, 16); });
  canvasTex(scene, 'spark', 8, 8, c => { c.fillStyle = '#fff'; c.fillRect(3, 0, 2, 8); c.fillRect(0, 3, 8, 2); });
  // Placeholder tileset: 0-8 concrete blob (see ART_SPEC), 9-11 one-way platform, 12 hazard.
  canvasTex(scene, 'tiles-placeholder', 16 * 13, 16, c => {
    for (let i = 0; i < 9; i++) {
      const x = i * 16, row = Math.floor(i / 3), col = i % 3;
      c.fillStyle = '#6d6a63'; c.fillRect(x, 0, 16, 16);
      c.fillStyle = '#5e5b55'; for (let d = 0; d < 6; d++) c.fillRect(x + ((d * 7 + i * 3) % 14), (d * 5) % 14, 2, 2);
      c.fillStyle = '#9a968c';
      if (row === 0) c.fillRect(x, 0, 16, 2);
      if (col === 0) c.fillRect(x, 0, 2, 16);
      c.fillStyle = '#45433f';
      if (row === 2) c.fillRect(x, 14, 16, 2);
      if (col === 2) c.fillRect(x + 14, 0, 2, 16);
    }
    for (let i = 0; i < 3; i++) { const x = (9 + i) * 16; c.fillStyle = '#b8b4aa'; c.fillRect(x, 0, 16, 4); c.fillStyle = INK; c.fillRect(x, 4, 16, 1); if (i !== 1) c.fillRect(x + (i === 0 ? 2 : 12), 5, 2, 8); }
    c.fillStyle = '#fecb56'; for (let i = 0; i < 4; i++) c.fillRect(12 * 16 + i * 4, 8 + (i % 2) * 3, 3, 8 - (i % 2) * 3);
  });
}
