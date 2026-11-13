# Art spec: the contract between art and code (owned by Claude)

Astra owns the *look* (`docs/art/ART_BIBLE.md`, palette, every pixel). This file is the *technical contract*: if an asset breaks it, the game can't load it.
`bun run validate` checks every rule marked ✔.

## Direction (starting point; Astra refines it in the Art Bible)

- **Pixel art with comic-book energy.** Thick 1 px dark outlines on characters, flat colour plus one shade, halftone/dither for shading, and big onomatopoeia hit-sprites. Character faces are a little anime: expressive eyes and exaggerated reactions.
- **Retro-futurist brutalism × maximalism.** Raw concrete blocks and grids, CRT glow, neon, clashing type, stickers, tape, paint splats.
- **Colour is the story.** The world starts drained (beige/grey) and floods back with colour as you clear it. Heroes are always saturated. BEIGE's minions are beige, rounded and smiling.
- Qublox brand anchors to include in the palette: ink `#0f1014`, bone `#f2f1ec`, signal red `#ff2f36`, DOS blue `#0000a8`, ERISED yellow `#fecb56`, ERISED blue `#3a6ea5`.

## Hard rules

| Rule | Value |
|---|---|
| ✔ File type | PNG, RGBA, transparent background (no chroma-key colour left in) |
| Internal resolution | 480×270, integer-scaled. **Design at 1×**: one art pixel = one game pixel. Never pre-scale. |
| ✔ Tile size | **16×16** |
| ✔ Character frame | **48×48**, character standing on the bottom-centre point (x=24, y=47). Body about 20–26 px wide, 32–40 px tall. The extra room is for weapon swings. |
| ✔ Enemy frame | 32×32, 48×48 or 64×64. Bosses up to 128×128. |
| Portrait | 64×64, bust, one frame per emotion |
| Palette | Max 48 colours across the whole game, defined in `apps/game/public/assets/palette.hex` (one `#rrggbb` per line). Stick to it. |
| Lighting | Light from the top-left |
| No | Anti-aliased edges against transparency, semi-transparent pixels on sprites (FX may use them), photographic textures, text baked into UI art (onomatopoeia FX are fine) |

## Sprite sheet layout

- **One PNG per character or enemy.** Each **row is one animation** and frames run left to right, packed with no padding and no gaps.
- ✔ The image width must be at least `maxFrames × frameWidth` and the height exactly `rows × frameHeight`.
- Characters face **right**. The code flips them for left.

### Required animations: playable crew (✔ names, minimum frames)

| Row | Anim | Frames | Loop | Notes |
|---|---|---|---|---|
| 0 | `idle` | 4 | yes | breathing plus one personality blink or fidget |
| 1 | `run` | 6–8 | yes | |
| 2 | `jump` | 2 | no | going up |
| 3 | `fall` | 2 | yes | coming down |
| 4 | `attack` | 4–6 | no | the basic attack. Mark the hit frame in the manifest (`hitFrame`). |
| 5 | `ability` | 4–6 | no | casting the signature power |
| 6 | `hurt` | 2 | no | |
| 7 | `ko` | 4 | no | slapstick KO |
| 8 | `tagin` | 4 | no | the dramatic entrance when swapped in |

### Required animations: enemies

`idle`, `move`, `telegraph` (wind-up, at least 300 ms of readable anticipation), `attack`, `hurt`, `die`.

## manifest.json ✔

`apps/game/public/assets/manifest.json` is the **only** way the game finds art. Anything not listed here gets a generated placeholder.

```json
{
  "version": 1,
  "sprites": {
    "ashwath": {
      "file": "sprites/characters/ashwath.png",
      "frameWidth": 48,
      "frameHeight": 48,
      "anims": {
        "idle":   { "row": 0, "frames": 4, "fps": 6,  "loop": true },
        "run":    { "row": 1, "frames": 8, "fps": 12, "loop": true },
        "attack": { "row": 4, "frames": 5, "fps": 16, "loop": false, "hitFrame": 2 }
      }
    }
  },
  "tilesets": {
    "hq": { "file": "tiles/hq.png", "tileSize": 16, "notes": "see docs/art/tiles-hq.md for the index map" }
  },
  "images": {
    "fx-clack": { "file": "fx/clack.png" }
  },
  "portraits": {
    "ashwath": { "file": "portraits/ashwath.png", "size": 64, "emotions": ["neutral", "smug", "panic", "angry", "deadpan"] }
  }
}
```

- Keys are lowercase kebab-case. ✔ Crew keys are exactly: `ashwath`, `sayam`, `mansukh`, `manya`, `sehaj`, `brahmansh`, `tushar`, `manvi`. Signature rows on top of the standard set: `sehaj` beast · `ashwath` info, cosmic · `sayam` bhai · `sehaj`/`manvi` heart.
- ✔ Every `file` must exist. Paths are relative to `apps/game/public/assets/`.
- ✔ A portrait sheet is one row of `size×size` frames, in the order of `emotions`.

## Tilesets

16×16 tiles on a grid, no spacing or margin. For each tileset, write `docs/art/tiles-<name>.md` with a small table that maps tile index to meaning (solid, one-way platform, decor, hazard…). Claude reads it to build the autotiler. Start each tileset with this 3×3 "blob" block at indices 0–8 so autotiling works:

```
0 top-left    1 top     2 top-right
3 left        4 fill    5 right
6 bottom-left 7 bottom  8 bottom-right
```

## Folders

```
apps/game/public/assets/
  manifest.json  palette.hex
  sprites/characters/  sprites/enemies/  sprites/bosses/  sprites/props/
  tiles/  portraits/  fx/  backgrounds/   (parallax layers: 480 px wide or more, may tile horizontally)
tools/art/        your generation and cleanup scripts (committed)
tools/art/raw/    raw generations (gitignored)
```

## Workflow tips

- If you generate with an image model, generate large, then **downscale with nearest-neighbour onto the grid, snap to the palette, and clean up by hand or by script**. Raw generator output is never final.
- You can also draw pixel art **in code** (a script that writes PNGs from arrays). For small sprites it's often more consistent.
- Check your work in the game: `bun run dev`, then press `F2` for the sprite viewer, which shows every manifest sprite and animation.
