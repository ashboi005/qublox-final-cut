import * as Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene';
import { FightScene, type FightBoot } from './FightScene';
import { patchTextForHd, renderConfig } from '../game/view';

/** A separate Phaser game for VERSUS: Boot (art + content) → FightScene. */
export function createVersus(parent: HTMLElement, boot: FightBoot, stage: number) {
  patchTextForHd();
  const game = new Phaser.Game({
    type: Phaser.AUTO, parent, ...renderConfig(), backgroundColor: '#0f1014',
    input: { gamepad: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [BootScene, FightScene],
  });
  game.registry.set('next', 'fight');
  game.registry.set('boot', { level: '', party: null });
  game.registry.set('fight', boot);
  game.registry.set('fightStage', stage);
  if (process.env.NODE_ENV !== 'production') Object.assign(window, { __versus: game });
  return game;
}
