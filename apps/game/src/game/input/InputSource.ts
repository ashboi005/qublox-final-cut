// Characters are driven by InputFrames, never by the keyboard directly.
// Keyboard, gamepad, an AI follower or a network peer all produce the same frame,
// which is what lets party mode (online co-op) arrive later without rewriting characters.
import * as Phaser from 'phaser';
import { ACTIONS, bindsVersion, codes } from '../keybinds';

export type InputFrame = {
  left: boolean; right: boolean; up: boolean; down: boolean;
  jumpHeld: boolean; jumpPressed: boolean;
  attackPressed: boolean; attackHeld: boolean; abilityPressed: boolean;
  swapTo: 0 | 1 | 2 | 3 | null; swapNext: boolean; swapPrev: boolean;
  confirmPressed: boolean;
};

export interface InputSource {
  /** Call exactly once per frame: one-shot presses are consumed by the read. */
  read(): InputFrame;
}

export const emptyFrame = (): InputFrame => ({
  left: false, right: false, up: false, down: false, jumpHeld: false, jumpPressed: false,
  attackPressed: false, attackHeld: false, abilityPressed: false, swapTo: null, swapNext: false, swapPrev: false, confirmPressed: false,
});

/** Keyboard (the player's Story bindings, see keybinds.ts) + first connected gamepad (standard mapping). */
export class LocalInput implements InputSource {
  private prevPad = new Set<number>();
  /** keyCodes pressed since the last read(). Phaser's JustDown loses taps that start and end inside one frame. */
  private latched = new Set<number>();
  private map: Record<string, number[]> = {};
  private seen = -1;

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    kb.on('keydown', (e: KeyboardEvent) => this.latched.add(e.keyCode));
    this.rebind();
  }

  /** Pick up the current bindings (cheap; runs again whenever the Controls screen changes them). */
  private rebind() {
    const kb = this.scene.input.keyboard!;
    this.seen = bindsVersion();
    this.map = Object.fromEntries(ACTIONS.story.map(a => [a.id, codes('story', a.id)]));
    for (const list of Object.values(this.map)) for (const c of list) kb.addKey(c, false);
  }

  read(): InputFrame {
    if (this.seen !== bindsVersion()) this.rebind();
    const kb = this.scene.input.keyboard!;
    const down = (a: string) => (this.map[a] ?? []).some(c => !!kb.keys[c]?.isDown);
    const tap = (a: string) => (this.map[a] ?? []).some(c => this.latched.has(c));
    const f = emptyFrame();
    f.left = down('left');
    f.right = down('right');
    f.up = down('up');
    f.down = down('down');
    f.jumpHeld = down('jump') || f.up;
    f.jumpPressed = tap('jump') || tap('up');
    f.attackPressed = tap('attack');
    f.attackHeld = down('attack');
    f.abilityPressed = tap('ability');
    f.swapTo = tap('swap1') ? 0 : tap('swap2') ? 1 : tap('swap3') ? 2 : tap('swap4') ? 3 : null;
    f.swapNext = tap('swapNext');
    f.swapPrev = tap('swapPrev');
    f.confirmPressed = tap('interact');
    this.latched.clear();

    const pad = this.scene.input.gamepad?.pad1;
    if (pad) {
      const held = new Set<number>();
      pad.buttons.forEach((b, i) => { if (b.pressed) held.add(i); });
      const pressed = (i: number) => held.has(i) && !this.prevPad.has(i);
      const ax = pad.axes[0]?.getValue() ?? 0;
      f.left ||= ax < -0.35 || held.has(14);
      f.right ||= ax > 0.35 || held.has(15);
      f.down ||= (pad.axes[1]?.getValue() ?? 0) > 0.5 || held.has(13);
      f.jumpHeld ||= held.has(0);
      f.jumpPressed ||= pressed(0);
      f.attackPressed ||= pressed(2);
      f.attackHeld ||= held.has(2);
      f.abilityPressed ||= pressed(1) || pressed(3);
      f.swapNext ||= pressed(5);
      f.swapPrev ||= pressed(4);
      f.confirmPressed ||= pressed(9);
      this.prevPad = held;
    }
    return f;
  }
}
