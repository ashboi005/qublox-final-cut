// The game world is 480×270. Pixel art renders at that size and the browser scales the canvas up.
// HD art (`?art=hd`, the vector style test, ART_SPEC § HD) is drawn at 4×, so the canvas renders at
// 1920×1080 and every camera zooms 4× onto the same 480×270 world: game code keeps world coordinates.
import * as Phaser from 'phaser';

export const VIEW_W = 480;
export const VIEW_H = 270;
import { HD } from './artMode';

export { HD };
export const ZOOM = HD ? 4 : 1;

/** Phaser config for the current art mode. */
export const renderConfig = (): Pick<Phaser.Types.Core.GameConfig, 'width' | 'height' | 'pixelArt' | 'roundPixels'> & { smoothPixelArt?: boolean } =>
  HD ? { width: VIEW_W * ZOOM, height: VIEW_H * ZOOM, pixelArt: false, smoothPixelArt: true, roundPixels: false }
     : { width: VIEW_W, height: VIEW_H, pixelArt: true, roundPixels: true };

// Cameras zoom around the canvas centre, so a screen-fixed object (scrollFactor 0) at world (x, y) needs
// this offset to land where it would at 1×: centre + zoom·(x' − centre) = zoom·x  ⇒  x' = x + centre·(1 − 1/zoom).
const FIX_X = (VIEW_W * ZOOM / 2) * (1 - 1 / ZOOM);
const FIX_Y = (VIEW_H * ZOOM / 2) * (1 - 1 / ZOOM);
type Fixable = Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.ScrollFactor;
/** setScrollFactor(0) that also works under the HD zoom. */
export function fixed<T extends Fixable>(o: T): T {
  o.setScrollFactor(0);
  o.setPosition(o.x + FIX_X, o.y + FIX_Y);
  return o;
}

/** A scene's main camera onto the 480×270 world (centred on it when the scene doesn't scroll). */
export function setupCamera(cam: Phaser.Cameras.Scene2D.Camera, center = false) {
  cam.setZoom(ZOOM);
  if (center) cam.centerOn(VIEW_W / 2, VIEW_H / 2);
  return cam;
}

// Text renders to its own canvas; under a 4× zoom it needs 4× resolution to stay sharp.
let patched = false;
export function patchTextForHd() {
  if (!HD || patched) return;
  patched = true;
  type TextFn = (x: number, y: number, text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle) => Phaser.GameObjects.Text;
  const proto = Phaser.GameObjects.GameObjectFactory.prototype as unknown as { text: TextFn };
  const orig = proto.text;
  proto.text = function (this: unknown, x, y, text, style) {
    return orig.call(this, x, y, text, { ...style, resolution: Math.max(style?.resolution ?? 1, ZOOM) });
  };
}

/** Make an HD texture (drawn at `scale`×) report its 1× size, so sprites, origins, bodies and tile-sprites
 *  behave exactly like the pixel version. Phaser draws a frame at cutWidth / source.resolution. */
export function shrinkTexture(tex: Phaser.Textures.Texture, scale: number) {
  for (const src of tex.source) src.resolution = scale;
  for (const name of tex.getFrameNames(true)) {
    const f = tex.get(name);
    f.width /= scale; f.height /= scale;
    const d = (f as unknown as { data: unknown }).data as { sourceSize: { w: number; h: number }; spriteSourceSize: { x: number; y: number; w: number; h: number } };
    d.sourceSize.w /= scale; d.sourceSize.h /= scale;   // what realWidth/realHeight read
    d.spriteSourceSize.x /= scale; d.spriteSourceSize.y /= scale; d.spriteSourceSize.w /= scale; d.spriteSourceSize.h /= scale;
    f.halfWidth /= scale; f.halfHeight /= scale;
    f.centerX /= scale; f.centerY /= scale;
    f.x /= scale; f.y /= scale;
  }
}
