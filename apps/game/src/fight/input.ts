// VERSUS input → BTN bits per frame. P1 = WASD/arrows + J K L I + U block (also used online); P2 (local) = arrows + 1 2 3 0 + 4 block.
import * as Phaser from 'phaser';
import { BTN } from '@qublox/shared/fight';

type Layout = { left: string[]; right: string[]; up: string[]; down: string[]; light: string[]; heavy: string[]; special: string[]; super: string[]; block: string[] };
export const P1_KEYS: Layout = { left: ['A'], right: ['D'], up: ['W', 'SPACE'], down: ['S'], light: ['J'], heavy: ['K'], special: ['L'], super: ['I'], block: ['U'] };
export const P1_SOLO_KEYS: Layout = { ...P1_KEYS, left: ['A', 'LEFT'], right: ['D', 'RIGHT'], up: ['W', 'SPACE', 'UP'], down: ['S', 'DOWN'] };
export const P2_KEYS: Layout = { left: ['LEFT'], right: ['RIGHT'], up: ['UP'], down: ['DOWN'], light: ['ONE', 'NUMPAD_ONE'], heavy: ['TWO', 'NUMPAD_TWO'], special: ['THREE', 'NUMPAD_THREE'], super: ['ZERO', 'NUMPAD_ZERO'], block: ['FOUR', 'NUMPAD_FOUR'] };

export class FightInput {
  private keys: Record<keyof Layout, Phaser.Input.Keyboard.Key[]>;
  constructor(private scene: Phaser.Scene, layout: Layout, private padIndex: number) {
    const kb = scene.input.keyboard!;
    this.keys = Object.fromEntries(Object.entries(layout).map(([k, names]) => [k, names.map(n => kb.addKey(n, true))])) as typeof this.keys;
  }
  read(): number {
    const d = (k: keyof Layout) => this.keys[k].some(key => key.isDown);
    let b = 0;
    if (d('left')) b |= BTN.LEFT; if (d('right')) b |= BTN.RIGHT; if (d('up')) b |= BTN.UP; if (d('down')) b |= BTN.DOWN;
    if (d('light')) b |= BTN.LIGHT; if (d('heavy')) b |= BTN.HEAVY; if (d('special')) b |= BTN.SPECIAL; if (d('super')) b |= BTN.SUPER; if (d('block')) b |= BTN.BLOCK;
    const pad = this.scene.input.gamepad?.gamepads[this.padIndex];
    if (pad) {
      const ax = pad.axes[0]?.getValue() ?? 0, ay = pad.axes[1]?.getValue() ?? 0, btn = (i: number) => !!pad.buttons[i]?.pressed;
      if (ax < -0.4 || btn(14)) b |= BTN.LEFT; if (ax > 0.4 || btn(15)) b |= BTN.RIGHT;
      if (ay < -0.6 || btn(12) || btn(0)) b |= BTN.UP; if (ay > 0.6 || btn(13)) b |= BTN.DOWN;
      if (btn(2)) b |= BTN.LIGHT; if (btn(3)) b |= BTN.HEAVY; if (btn(1)) b |= BTN.SPECIAL; if (btn(5) || btn(7)) b |= BTN.SUPER; if (btn(4) || btn(6)) b |= BTN.BLOCK;
    }
    return b;
  }
}
