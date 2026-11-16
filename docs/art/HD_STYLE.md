# HD style trial · Ink / Signal

A clean comic cast inside a dense, brutalist machine cathedral. The test keeps
Qublox's silhouettes and colour families, but replaces the pixel grid with
shaped ink contours, expressive faces and articulated poses. It is deliberately
limited to Ashwath, Sayam and Render Farm until the user compares both in-game.

Characters stand roughly 2.5 heads tall. Broad, slightly asymmetric faces carry
real brows, two eyes and glasses with clear lenses. Ashwath has swept wavy hair,
a full short beard, warm grin, cream spider tee and gold/orange frames. Sayam has
an irregular curly crown, lighter stubble, grey frames and a patterned white
shirt under a dark green-accented jacket. No face halftones.

Outer ink is 6–8 HD pixels; detail is 3–4. Flat base, one hard cel shadow,
one restrained highlight. Shadows favour the lower/right side. Limbs pivot
independently; torso compression, head lag, planted contacts, attack extension
and recoil distinguish poses. Props remain separate rig parts.

Render Farm: lighter distant exhaust towers and bridges; midground banks of
servers, ducts and cooling turbines; dark foreground cable bundles and steel
frames. Big shadow planes carry sparse Ben-Day dots. Cyan/indigo circuitry,
red alarms and warm warning yellow punctuate the saturated state. The drained
state uses warm concrete and graphite, retaining the same geometry and alpha.

Toolchain: Python 3.14 + Pillow, vector primitives and sampled Bézier contours,
rendered at 3× working resolution (2× for the large backgrounds) and reduced with Lanczos for smooth edges.
No photographic pixels or model generations. Run `tools/art/hd/build.py` to
rebuild this entire isolated slice. Pixel assets and manifest.json are untouched.

## Rebuild and review

Run `/opt/homebrew/bin/python3.14 tools/art/hd/build.py` (Python with Pillow).
The renderer uses no random input. `draw.py` holds vector primitives, `crew.py`
the shared facial/limb rigs and pose timing, and `world.py` the indexed atlas
and six parallax planes. `compare.py` assembles the review sheet from both
asset sets and actual browser captures saved in the ignored raw directory.

Review at `?art=hd&level=ep1-r03&party=ashwath,sayam`; remove `art=hd` for
the pixel version. F2 shows both nine-row sheets at normal and enlarged scale.
The local Render Farm VERSUS stage was checked with both crew and Ashwath's
keyboard guard. For this QA session only, the browser's existing `__versus`
dev hook selected stage index 1 before boot; no game source was changed.

Comparison: `tools/art/raw/t-a47-compare.png` (idle/run/attack/super, both
neutral portraits, and old/new EP1-R03 screenshots). Extra match capture:
`tools/art/raw/t-a47-versus.png`. Missing crew, enemies, props and VFX remain
pixel fallbacks by design; this is a two-character style trial.

Final checks: deterministic regeneration, sprite side/top edge clearance,
paired drained/saturated alpha masks, RGBA dimensions and PNG sizes, and
`bun run validate`. The HD contract fits the slice without changes. Full-cast
conversion remains pending the user's style decision.

## Full-cast batch (T-A49.1)

`cast.py` adds the seven remaining rigs and supplies every pixel-manifest row
for all nine crew plus eight portraits each. `build.py` now uses this module.
Private likeness references remain in the ignored raw tree. The three dastars
remain attached in every state; BEAST lowers Sehaj's head beneath the boulder.
Manya follows T-A48's floral outfit and journal. Tushar cycles clapper/laptop/
camera/shades; Mansukh's lightstick stays an original heart-and-horns design.
Review contacts: `tools/art/raw/t-a49-cast.png` and `t-a49-specials.png`.

## Complete HD asset coverage (T-A49.4)

The HD manifest now covers every pixel manifest key. The last batch adds props,
pickups, set dressing, all nine finisher sheets, combat effects, word marks,
ability icons, the title image, newspaper and glossary stamp. Chai, checkpoint,
Lost Footage tape, journal flower, fan, boulder and soda can use native vector
shapes; crew icons are derived from their HD portraits at each original icon's
exact 4× dimensions. Remaining approved designs are reconstructed as smooth
colour-region paths, preserving their silhouettes, lettering and choreography.
They retain the original pixel-informed detail; they are not new bespoke rigs.

Rebuild the **whole** HD set with:

```sh
tools/art/raw/hd-venv/bin/python tools/art/hd/build.py
```

The ignored local environment uses the versions pinned in
`tools/art/hd/requirements.txt` (Pillow 12.3.0 and CairoSVG 2.9.1).
Install that requirements file in a fresh environment to reproduce the art. `build.py --objects` refreshes
only the final objects/effects batch. `check_coverage.py` checks all manifest
keys, animation coverage, exact 4× image dimensions, RGBA and the 5 MB limit.
The full builder includes cast, world, entities, objects and the native Claude
sigil; it no longer replaces the manifest with the original trial slice.
Pixel source files are read-only throughout this workflow.

Review contacts are ignored local artifacts: `tools/art/raw/t-a49-objects.png`
plus the earlier districts/entities contacts. Browser review of the completed
conversion remains pending; asset coverage alone does not establish runtime
correctness across every room and finisher.
