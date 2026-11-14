# Qublox: ink, concrete, electricity

Art direction v1 · Astra · 13 November 2026

## The cast at one pixel

Work at 480×270; never deliver enlarged sprites. A playable frame is 48×48. Neutral feet occupy y=44–47 around x=24; crown is y=9–11, leaving 8 px above for reactions. Standing silhouette is 20–26 px wide excluding tools. Head including hair is approximately 14×13 px; torso plus legs 23 px: a roughly 1:1.8 head-to-body ratio. Hands are 4×4, boots 7×4. Right-facing three-quarter heads show the near eye clearly and a one-pixel nose on the right. Preserve the feet anchor during breathing. Jump and KO may move away from it intentionally.

Use one continuous 1 px ink (#0f1014) outside contour; interior seams are darkest local shade, not extra thick black stripes. Diagonals use deliberate 1:1 or 2:1 pixel steps. No isolated contour noise, soft alpha, smoothing or automatic outline scaling. Separate the weapon from the torso by negative space or a bright edge. Idle must read without colour at actual size.

Manvi, Sehaj, Ashwath, Sayam, Mansukh, Brahmansh and Tushar now use the supplied private photo references. The remaining crew retain placeholders until their own references arrive. Reference photos and review contact sheets stay in ignored `tools/art/raw/`; they are never shipped. Eyes have bone sclera and a 1 px ink pupil. Character identity comes from outfit, hair and job equipment:

| Crew | Main / shade | Silhouette and unmistakable prop |
|---|---|---|
| Ashwath | cream / warm shade | Wavy black hair, thin gold square aviators with blue glints, short beard, red spider tee, keyboard and smartwatch |
| Sayam | black / green lining | Voluminous wavy fringe, grey rectangular glasses, light stubble, graphic shirt, baggy jeans and chunky sneakers; cash flick |
| Tushar | black / gold aviators | Swept-up waves, light goatee, rolled sleeves, silver chain; henna hand opposite silver bracelet/ring; clapperboard |
| Sehaj | olive / deep olive + cream | Neatly folded dastar, full beard, broad varsity shoulders, razor tool; turban stays intact in every pose |
| Mansukh | cream / red | Red dastar, full beard, camp collar, gold chain, headphones, blue jeans and pencil |
| Manya | mint / teal | Tied hair, broad paint apron, swinging bucket |
| Brahmansh | black / red | Black dastar, curled handlebar moustache, piped polo, steel kara and timeline blade |
| Manvi | charcoal / rose | Centre-parted shoulder-length hair, oversized leather lapels, wide-leg jeans, mic tap and temple sparkle |

Light comes from upper left. Each material uses a flat local colour and exactly one shadow; reserve a third bright pixel for glass, metal or eyes. Put shadows on underside/right. Dither only in patches at least 4×4, using a regular alternating 2×2 pattern; do not dither faces or limbs. No gradients. Shared proportions and outlines matter more than extra detail.

## Palette and world state

`palette.hex` is the sole source: 43 opaque colours. `palette.png` is a 344×8 strip, one 8 px swatch each. Zero-based ranges: 0–7 neutrals; 8–15 beige; 16–33 hero colours and skin; 34–39 neon/FX; 40–41 olive (`#858b60`, `#4f5d46`) for Sehaj's dastar and varsity jacket; 42 is Sayam's HUD green (`#1d7a3a`). Transparent pixels are alpha zero, every other sprite pixel alpha 255. Keep all six brand anchors exact. No additional colours without revising this palette within the 48-colour ceiling.

The likeness generator is `tools/art/likeness.py`; `crew.py` and `portraits.py` delegate those four crew to it so an old batch rebuild cannot restore their placeholder faces. Manvi and Sehaj include a four-frame `heart` row. Sehaj's six-frame `beast` breaks away jacket sleeves, keeps a white tank top, and lowers his head beneath the overhead rock without obscuring or dislodging the dastar. Ashwath adds `info` (four quick conversational gestures) and `cosmic` (four skyward glances with stars). New KO poses end in a seated slump to preserve likeness and headwear.

Crew props are rebuilt by `tools/art/likeness_props.py`: `fx-heart` 32×32, `boulder` 16×16, `cracked-wall` 16×32, `sprite-can` 16×16, `telescope` 32×32 and optional `decor-trophy` 24×32. All are manifest image keys. The trophy is a miniature gold cup with a first-place mark; its HACKERWRATH 3.0 context belongs in runtime copy rather than illegible pixel text.

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

Sayam adds a five-frame `bhai` row: raised index finger, open-palm explanation, recovery. His idle hands sit in jacket pockets. The grey glasses stay on in all eight portrait expressions; smug uses an asymmetrical brow, lowered lid and crooked half-smile.

Mansukh and Brahmansh use `tools/art/editor_likeness.py`, delegated by the legacy crew/portrait generators. Their dastars stay intact through seated KO and special poses. Mansukh adds six-frame `stan`, with an original heart-emblem horned lightstick (16×16 image key `lightstick`). Brahmansh adds six-frame `unhinged`: staggered steps, open arms and red jump-cut streaks, no drinks. Existing signal red supplies his accent. `stan-mode` is an original, non-looping four-bar stinger at 120 BPM (8 seconds), generated by `stan_stinger.py`. `glossary-stamp` is a 96×48 binary-alpha CLASSIFIED mark; placement remains Claude-owned.

Mishthi uses `tools/art/mishthi.py`: white puff sleeves, brown lace-up corset, swept long dark waves with auburn ends, gold earrings/scrunchie and berry lip. Six-frame `indifferent` ends in a turned-away, crossed-arm pose. Eight portraits include unimpressed side-eye and theatrical despair. Manifest image `prop` is a 16×16 decorated ceramic vase; `art-frame` is a 16×4 gold ledge. Palette remains 43 colours. Legacy generators delegate Mishthi to this source.

Tushar uses `tools/art/tushar.py`: standard rows plus existing `panic` and new six-frame `wildcard` (sleeve roll → clapper → laptop → camera → FABULOUS visor). Gold double-bridge aviators are his everyday glasses. The smug portrait spells FABU / LOUS with hand-pixelled 3×5 letters; happy carries the broad grin. Both hands remain readable: henna on the rear hand, silver bracelet/ring on the tool hand, with the grip drawn over the tool to preserve the glint. Legacy generators delegate to this source. No new colours.
