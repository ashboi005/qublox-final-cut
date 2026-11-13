import * as Phaser from 'phaser';
import { buildArt, preloadManifest, queueManifestFiles } from '../assets/art';
import { FONT } from '../fx/juice';
import type { GameContent } from './GameScene';
import type { CrewId } from '@qublox/shared';

export type BootData = { level: string; party: CrewId[] | null };

export class BootScene extends Phaser.Scene {
  constructor() { super('boot'); }

  preload() {
    this.add.text(240, 135, 'LOADING SIGNAL…', { fontFamily: FONT, fontSize: '10px', color: '#f2f1ec' }).setOrigin(0.5);
    preloadManifest(this);
    this.load.json('content', '/api/content');
    // A missing manifest is normal early on: the art falls back to placeholders.
    this.load.on('loaderror', (file: Phaser.Loader.File) => console.info('[boot] not loaded (using placeholder):', file.key));
  }

  create() {
    const content = (this.cache.json.get('content') as GameContent | undefined) ?? { levels: {}, dialogue: {}, barks: {}, story: {}, errors: [] };
    if (content.errors.length) console.warn('[boot] content files with invalid JSON:', content.errors);
    this.registry.set('content', content);
    const start = () => { buildArt(this); this.scene.start((this.registry.get('next') as string | undefined) ?? 'game', this.registry.get('boot') as BootData); };
    if (queueManifestFiles(this)) { this.load.once('complete', start); this.load.start(); }
    else start();
  }
}
