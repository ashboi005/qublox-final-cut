// Characters are driven by InputFrames, never by the keyboard directly.
// Keyboard, gamepad, an AI follower or a network peer all produce the same frame,
// which is what lets party mode (online co-op) arrive later without rewriting characters.
import * as Phaser from 'phaser';

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

/** Keyboard + first connected gamepad (standard mapping). */
export class LocalInput implements InputSource {
  private k: Record<string, Phaser.Input.Keyboard.Key>;
  private prevPad = new Set<number>();
  /** Keys pressed since the last read(). Phaser's JustDown loses taps that start and end inside one frame. */
  private latched = new Set<string>();

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.k = kb.addKeys({
      left: K.A, right: K.D, up: K.W, down: K.S, aLeft: K.LEFT, aRight: K.RIGHT, aUp: K.UP, aDown: K.DOWN,
      jump: K.SPACE, attack: K.J, attack2: K.X, ability: K.K, ability2: K.C,
      one: K.ONE, two: K.TWO, three: K.THREE, four: K.FOUR, next: K.E, prev: K.Q, enter: K.ENTER, interact: K.F,
    }, false) as Record<string, Phaser.Input.Keyboard.Key>;
    for (const [name, key] of Object.entries(this.k)) key.on('down', () => this.latched.add(name));
  }

  read(): InputFrame {
    const k = this.k;
    const down = (key: string) => !!k[key]?.isDown;
    const tap = (key: string) => this.latched.has(key);
    const f = emptyFrame();
    f.left = down('left') || down('aLeft');
    f.right = down('right') || down('aRight');
    f.up = down('up') || down('aUp');
    f.down = down('down') || down('aDown');
    f.jumpHeld = down('jump') || f.up;
    f.jumpPressed = tap('jump') || tap('up') || tap('aUp');
    f.attackPressed = tap('attack') || tap('attack2');
    f.attackHeld = down('attack') || down('attack2');
    f.abilityPressed = tap('ability') || tap('ability2');
    f.swapTo = tap('one') ? 0 : tap('two') ? 1 : tap('three') ? 2 : tap('four') ? 3 : null;
    f.swapNext = tap('next');
    f.swapPrev = tap('prev');
    f.confirmPressed = tap('enter') || tap('interact');
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
