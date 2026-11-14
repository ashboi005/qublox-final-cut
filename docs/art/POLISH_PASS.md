# Story v2 asset polish · T-A43

The approved crew sprite sheets are excluded. Manifest keys, animation names,
frame sizes and tile indices stay stable. New VERSUS art was delivered in T-A44/45.

## Batch 1 · five districts

All five 96×96 tile atlases: better top-left slab edges, countersunk bolts,
material-specific surface marks, platform hardware, door rails and CRT details.
No new collision-looking protrusions. All existing indices retain their meanings.

All thirty 480×270 parallax layers, in drained/saturated pairs:

- Neo-Amritsar: crescent sky, heritage roof silhouettes, cantilevered arch balconies,
  hanging laundry, bundled wires and cabinet fittings.
- Render Farm: rack status lights, fan cage bars and hub, rivets, meters, utility
  pipes and bundled copper cabling. Distant details use restrained contrast.
- The Set: cyclorama seams, practical lamps, facade mullions, exposed braces,
  triangular truss webs, flight-case handles and latches.
- The Feed: thumbnail geometry, avatar marks, playback tracks, reaction indicators,
  fiber braces and vented crossbars. All graphic content, no baked UI text.
- Templatr: subtle stone veining, machined joints, repeated smiling corporate relief,
  pedestal edging, security lenses and concealed fixtures.

Rebuild: `/opt/homebrew/bin/python3.14 tools/art/polish_world.py`.
This regenerates the original environment sources before the finish pass. It also
regenerates the original Stock Photo Family as a side effect of `the_set.py`;
after the enemy/boss polish batch, run that finishing pass afterward as documented.
Pair silhouettes and alpha masks remain identical. Saturation variants change
materials/lighting colours, not geometry. All added geometry wraps at 480 pixels.

## Remaining batches

- Enemies and bosses, especially Chad/BEIGE; NPCs.
- Props, decor, older FX, title/logo and UI illustrations; portrait material polish.
- Music/SFX data arrangement and timbre polish.

## Batch 2 · enemies, bosses and NPCs

All seven base enemy sheets, five district variants, five boss sheets and eight
NPC sheets receive material edges and semantic costume/machinery details.
BEIGE is rebuilt as a machined hexagonal reliquary with a recessed master-drive
cradle, etched smile, alignment fixtures, distinct phase glitches and recovered
drive. Chad wears immaculate cream athleisure, cream sneakers, slicked hair and a
headset mic; talking includes a tiny pitch chart. Mothership antenna/grille work,
Buffering Wheel concentric telemetry, family sweater/teeth/hair and Algorithm
card widgets retain attack silhouettes and animation metadata.

Rebuild after world: `python3.14 tools/art/polish_entities.py`. This regenerates
only base entity sources, then finishes them and rebuilds district costumes.
`the_set.py` now has separate world/family builders so rebuilding the family
cannot erase environment polish. Crew sheets and all portraits are untouched.

## Batch 3 · objects and presentation

All twenty decor sheets have material-edge finishing, with bespoke glass, grille,
cloth, paper-pin, case, camera and fixture details. Puzzle props and older combat
FX receive restrained edge highlights. Title silhouettes now include all nine crew;
crew icons derive from the approved hair/headwear silhouettes, including new
icon-manvi and icon-mishthi keys. Legacy icon-ability-bribe now shows Smooth Talk's
speech bubble, while retaining its loader key. Newspaper, stamp and title lettering
receive paper/ink/light detail; no layouts were designed or changed.

Portrait finishing is limited to the bottom sixteen pixels (clothing/shoulders),
leaving faces, expressions, headwear and likeness pixels unchanged.

Rebuild sequence: polish_world.py → polish_entities.py → polish_objects.py.
Individual finishing scripts should follow this order; they are not general-purpose
filters to repeatedly apply over shipped output. VERSUS art is a separate pass.

## Batch 4 · music and SFX

All fifteen songs retain their authored melodies, tempo, order and duration.
Bass remains centred; lead/pad/percussion have restrained stereo placement.
Hats now use downbeat/offbeat/grace-note dynamics. Selected phrase ends breathe
before the next downbeat, funk/dhol kicks add quiet responses, and boss transitions
have short snare pickups. Buffering Wheel's authored temporal dropouts stay intact.
Stingers remain nonlooping. BEIGE still moves through its three musical phases.

All twenty-one SFX are mixed or articulated: shorter combat transients, quieter
reward arpeggios, one lower boss growl, softer menu tone, and a chatter gesture
at the legacy ability-bribe key. No audio files or runtime code are shipped.
Rebuild data: `python3.14 tools/art/polish_audio.py`.

## Final coverage and validation

All manifest asset families reviewed: five tilesets, thirty district layers,
enemies/bosses/NPCs, props/decor/FX, portrait shoulders, icons, title/logo and
standalone paper/stamp images. Tiny functional swatches/lines and newly delivered
VERSUS art were retained where extra pixels would reduce readability. The shared
palette and crew sprite sheets are unchanged by T-A43. The two additional crew
icon keys complete the nine-person roster without requiring a UI redesign.

Full environment → entity → object regeneration reproduces the checked-in PNGs.
Contract validation: 104 files, zero warnings. Every PNG is RGBA, exact-palette,
binary alpha. Pixel comparison verifies T-A43 never changed a crew sheet or the
upper 48 pixels of any portrait (faces/headwear/expressions).

QA limits: contact sheets cover the image batches; live native-browser checks
confirmed Templatr and BEIGE in gameplay and sampled F2 entity rows. Complete live
2×/finisher playback and the latest object/title review remain integration QA
because browser access became unavailable. Audio data was structurally checked;
no subjective listening pass is claimed. Claude should audition level music and
finisher/SFX overlap in the final integration pass.
