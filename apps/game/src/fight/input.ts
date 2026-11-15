// VERSUS input → BTN bits per frame, from the player's bindings (keybinds.ts, Controls screen).
// P1 is also the online / vs-CPU player; P2 is the second player on the same keyboard (Local 2P).
import * as Phaser from 'phaser';
import { BTN } from '@qublox/shared/fight';
import { ACTIONS, bindsVersion, codes } from '@/game/keybinds';

type Action = 'left' | 'right' | 'up' | 'down' | 'light' | 'heavy' | 'special' | 'super' | 'block';
const BITS: Record<Action, number> = { left: BTN.LEFT, right: BTN.RIGHT, up: BTN.UP, down: BTN.DOWN, light: BTN.LIGHT, heavy: BTN.HEAVY, special: BTN.SPECIAL, super: BTN.SUPER, block: BTN.BLOCK };
const MOVES: Action[] = ['left', 'right', 'up', 'down'];

export class FightInput {
  private map = {} as Record<Action, number[]>;
  private seen = -1;
  /** `solo`: P1 with nobody on P2 (vs CPU, online), so P2's movement keys (arrows by default) move P1 too. */
  constructor(private scene: Phaser.Scene, private player: 'p1' | 'p2', private padIndex: number, private solo = false) {
    this.rebind();
  }

  private rebind() {
    const kb = this.scene.input.keyboard!;
    this.seen = bindsVersion();
    const own = Object.fromEntries(ACTIONS[this.player].map(a => [a.id, codes(this.player, a.id)])) as Record<Action, number[]>;
    if (this.solo) {
      const taken = new Set(Object.values(own).flat());
      for (const m of MOVES) own[m] = [...own[m], ...codes('p2', m).filter(c => !taken.has(c))];
    }
    this.map = own;
    for (const list of Object.values(this.map)) for (const c of list) kb.addKey(c, true);
  }

  read(): number {
    if (this.seen !== bindsVersion()) this.rebind();
    const kb = this.scene.input.keyboard!;
    let b = 0;
    for (const [a, list] of Object.entries(this.map) as [Action, number[]][]) if (list.some(c => !!kb.keys[c]?.isDown)) b |= BITS[a];
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
