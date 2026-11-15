import * as Phaser from 'phaser';
import type { CrewId } from '@qublox/shared';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { ViewerScene } from './scenes/ViewerScene';
import { synth } from './audio/synth';
import { patchTextForHd, renderConfig } from './view';

export { VIEW_W, VIEW_H } from './view';

export function createGame(parent: HTMLElement, opts: { level: string; party: CrewId[] }) {
  patchTextForHd();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    ...renderConfig(),
    backgroundColor: '#0f1014',
    input: { gamepad: true },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 900 }, tileBias: 20, debug: false } },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, GameScene, ViewerScene],
  });
  game.registry.set('boot', opts);
  // Dev/test hook: lets headless smoke tests inspect the running game.
  if (process.env.NODE_ENV !== 'production') Object.assign(window, { __qublox: game, __synth: synth });
  return game;
}
