// F2 sprite viewer: every sprite and animation the game knows, playing at 1×.
// Astra uses this to check sheets in-engine. ↑↓/wheel scroll, Z toggles 2× (re-flows), F2/Esc closes.
import * as Phaser from 'phaser';
import { animKey, manifestErrors, SPRITES } from '../assets/art';
import { bus } from '../bus';
import { FONT } from '../fx/juice';

export class ViewerScene extends Phaser.Scene {
  private zoom = 1;
  constructor() { super('viewer'); }

  init(data: { zoom?: number }) { this.zoom = data.zoom ?? 1; }

  create() {
    bus.emit('viewer', { open: true });
    const z = this.zoom;
    const cam = this.cameras.main.setBackgroundColor('#1b1c22').setZoom(z).setOrigin(0, 0);
    const viewW = 480 / z;
    const label = (x: number, y: number, s: string, color = '#f2f1ec', size = 8) =>
      this.add.text(x, y, s, { fontFamily: FONT, fontSize: `${size}px`, color, resolution: 2 });
    label(8, 6, `SPRITE VIEWER · F2 close · ↑↓ scroll · Z ${z === 1 ? '2×' : '1×'}`, '#fecb56');
    let y = 22;
    if (manifestErrors.length) { label(8, y, `manifest.json invalid: ${manifestErrors[0]}`, '#ff2f36'); y += 14; }
    for (const [key, info] of Object.entries(SPRITES)) {
      label(8, y, `${key}  ${info.frameWidth}×${info.frameHeight}${info.placeholder ? '  (placeholder)' : ''}`, info.placeholder ? '#8a8b94' : '#4fbf6a');
      y += 12;
      let x = 8;
      for (const [anim, a] of Object.entries(info.anims)) {
        const w = Math.max(info.frameWidth, 44);
        if (x + w > viewW - 8) { x = 8; y += info.frameHeight + 14; }
        this.add.rectangle(x, y, info.frameWidth, info.frameHeight, 0x2a2b33).setOrigin(0);
        this.add.sprite(x, y, key).setOrigin(0).play(animKey(key, anim));
        label(x, y + info.frameHeight + 1, `${anim} ${a.frames}f${a.hitFrame !== undefined ? ` h${a.hitFrame}` : ''}`, '#c9c9d1', 6);
        x += w + 6;
      }
      y += info.frameHeight + 20;
    }
    const maxY = Math.max(0, y - 270 / z);
    const kb = this.input.keyboard!;
    const close = () => { bus.emit('viewer', { open: false }); this.scene.stop(); this.scene.resume('game'); };
    kb.on('keydown-F2', close); kb.on('keydown-ESC', close);
    kb.on('keydown-Z', () => this.scene.restart({ zoom: z === 1 ? 2 : 1 }));
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => { cam.scrollY = Phaser.Math.Clamp(cam.scrollY + dy * 0.5 / z, 0, maxY); });
    const keys = kb.createCursorKeys();
    this.events.on('update', () => {
      if (keys.down.isDown) cam.scrollY = Math.min(maxY, cam.scrollY + 4 / z);
      if (keys.up.isDown) cam.scrollY = Math.max(0, cam.scrollY - 4 / z);
    });
  }
}
