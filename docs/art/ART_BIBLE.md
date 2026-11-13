# Qublox: ink, concrete, electricity

Art direction v1 · Astra · 13 November 2026

## The cast at one pixel

Work at 480×270; never deliver enlarged sprites. A playable frame is 48×48. Neutral feet occupy y=44–47 around x=24; crown is y=9–11, leaving 8 px above for reactions. Standing silhouette is 20–26 px wide excluding tools. Head including hair is approximately 14×13 px; torso plus legs 23 px: a roughly 1:1.8 head-to-body ratio. Hands are 4×4, boots 7×4. Right-facing three-quarter heads show the near eye clearly and a one-pixel nose on the right. Preserve the feet anchor during breathing. Jump and KO may move away from it intentionally.

Use one continuous 1 px ink (#0f1014) outside contour; interior seams are darkest local shade, not extra thick black stripes. Diagonals use deliberate 1:1 or 2:1 pixel steps. No isolated contour noise, soft alpha, smoothing or automatic outline scaling. Separate the weapon from the torso by negative space or a bright edge. Idle must read without colour at actual size.

Faces are fictional placeholders, not likenesses. Use the same warm skin ramp for initial placeholders; revise from references later. Eyes have bone sclera and a 1 px ink pupil. Avoid tiny mouths except for reactions. Character identity comes from outfit and job equipment:

| Crew | Main / shade | Silhouette and unmistakable prop |
|---|---|---|
| Ashwath | DOS blue / ink-blue | Rounded hood, cyan headphone cups, wide mechanical keyboard |
| Sayam | signal red / crimson | Broad blazer shoulders, narrow sunglasses, upright phone; cash flick |
| Tushar | ERISED yellow / ochre | Cap brim, heavy shoulder camera, striped clapper |
| Sehaj | ERISED blue / steel | Headset arc, wrist timeline, long razor tool |
| Mansukh | purple / plum | Tall hair, long stylus, angular anchor handles |
| Manya | mint / teal | Tied hair, broad paint apron, swinging bucket |
| Brahmansh | rose / plum | Pointed hood, light sneakers, two short timeline blades |

Light comes from upper left. Each material uses a flat local colour and exactly one shadow; reserve a third bright pixel for glass, metal or eyes. Put shadows on underside/right. Dither only in patches at least 4×4, using a regular alternating 2×2 pattern; do not dither faces or limbs. No gradients. Shared proportions and outlines matter more than extra detail.

## Palette and world state

`palette.hex` is the sole source: 40 opaque colours. `palette.png` is a 320×8 strip, one 8 px swatch each. Zero-based ranges: 0–7 neutrals; 8–15 beige; 16–33 hero colours and skin; 34–39 neon/FX. Transparent pixels are alpha zero, every other sprite pixel alpha 255. Keep all six brand anchors exact. No additional colours without revising this palette within the 48-colour ceiling.

Drained architecture uses neutral and beige slots only; keep ink outlines and bone highlights. Saturated architecture keeps identical geometry but substitutes accent panels, windows and cables with hero/FX ramps. Concrete remains grey in both states. Never recolour heroes, hostile warning cues or interactive silhouettes with the world drain: gameplay must remain readable. Use at most 25% saturated accents on ordinary architecture. World return is a colour substitution, not a change to collisions or tile indices.

Heroes: angular poses, asymmetrical equipment, saturated torso, expressive eyebrows. BEIGE workers: soft rectangular heads, beige uniforms, symmetrical corporate smile. Distinguish enemies from backgrounds with an ink outline and a pale face; warning poses add signal-red marks. A friendly smile must not conceal an attack wind-up.

## Animation and impact

Each row is an action, facing right. Idle uses a 1 px torso breath with fixed boots and a blink/fidget. Runs alternate planted and lifted feet, oppose the arms, and retain head volume. Jump compresses then extends; fall opens the arms. Attack reads as anticipation → release → contact → follow-through → recovery. Put the contact in `hitFrame`. Ability needs a unique hand/prop silhouette. Hurt is one sharp recoil followed by a recovery; KO collapses to a readable horizontal shape, without gore. Tag-in starts tucked and ends in a big signature pose. Enemy anticipation lasts at least 300 ms at the manifest playback rate.

FX use ink-bordered jagged bursts, a bone interior and one hot accent. Word pops are chunky hand-pixelled capitals, slanted right, with uneven baselines; preserve letter counters at 1×. CLACK is rectangular and mechanical, CUT! a sharp wedge, LE RE a fan, VAJJJ! a slash. Dust is low-contrast bone/grey; hit sparks and tag bursts use cyan/yellow/red. No text baked into UI art. Sprite frames must not clip outgoing weapons or effect tips.

## Mood board (composition cues, not UI)

```text
  FAR:    |_|  |||   |_|_|     antennae, haze, tiny warm windows
  MID:  [CONCRETE] // neon     stepped monoliths, one bright seam
  NEAR: ━╋━CRT━╋━cables━━     hard shelves, stickers, torn posters
  HERO:     ◉╲▰  → CLACK!     small face, bold tool, huge attitude
  BEIGE:   ( •‿• ) [form]     rounded sameness, unsettling smile
```

The frame should feel like a battered comic printed on a brutalist office wall: clean interactive silhouettes over noisy but quieter scenery. Cluster stickers and halftone into islands with empty concrete between them. At 1×, a door, a terminal, an enemy and each hero's tool must remain identifiable before decoration is noticed.
