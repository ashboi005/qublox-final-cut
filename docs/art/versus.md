# VERSUS art

T-A44/T-A45. Pixel-native, 43-colour palette, binary alpha. Rebuild with
`/opt/homebrew/bin/python3.14 tools/art/versus.py` **after** base crew generators.
This idempotent finishing pass appends/replaces only `super`; Sayam's `attack`
and `ability` are also replaced from their updated canonical likeness source.
All other existing rows and portrait assets remain byte-for-byte in pixel data.

Every crew has an eight-frame `super` at 12 fps. Sayam moves through philosopher,
pointing roast, empath and hype in paired frames. Existing likeness signatures,
including all three dastars and Tushar's jewellery, stay intact.

## FINAL CUT integration

Nine keys `finisher-<crew>`, one 24-frame `play`, 10 fps, nonlooping, 96×96.
Duration 2.4 seconds. Bottom-centre origin, intended 2× scale, right-facing composition.
These are **overlays over the real losing fighter**, not generic stand-in characters.
The lower middle of the effect is the fighter's space. Keep runtime loser choreography
alongside custom-sheet playback; merely drawing the sheet leaves the loser visible
when the effect ends. Restore fighter visibility/transforms on round cleanup.

| Crew | Effect beats | Suggested real-loser choreography |
|---|---|---|
| Ashwath | Terminal lines 0–1.2s, block deletion 1.5–2.3s, EXIT 0 | Runtime fade begins 1.5s, hidden by 2.0s |
| Sayam | Five overlapping monologue bubbles 0–1.9s; Zs and departing footprints | Yawn at 1.2s; slump then wander right/fade 1.5–2.3s |
| Tushar | Flash at .1/.4/.7s; film wraps .4–1.8s; reel 1.3s; shades 1.8s | Squeeze/hide inside reel from 1.3–1.8s |
| Sehaj | Boulder descends 0–.8s; impact .8s; cyan rewind 1.2s | Slapstick flatten at .8s, rewind motion/hide 1.2–1.9s; headwear stays on |
| Manvi | Rising heart storm, sparkling orbit .5–1.6s | Float upward smiling from .5s; fade out before 2.3s |
| Mansukh | Inflating concert ring 0–1.2s; pop/confetti 1.2s; lightsticks | Inflate 0–1.2s, hide at pop, no gore |
| Manya | Four opaque rising paint bands; puddles at 2.0s | Tint through signal red/yellow/blue/pink; hide by 1.9s |
| Brahmansh | Hard cuts and missing film strips 0–1.3s, blackout 1.3s, line collapse 2.2s | Alternate loser visibility with cuts, permanently hide at 1.3s |
| Mishthi | Gold frame builds 0–.5s, hanging wire, glints, plaque 1.3s | Freeze pose, gold tint by .5s; remain displayed inside frame |

## Image keys

| Key | Dimensions | Use |
|---|---|---|
| fx-counter | 64×40 | Red/yellow double-exclamation impact |
| fx-combo | 80×20 | Ink/red/yellow badge; runtime owns combo text |
| fx-ko | 96×64 | Large bone K.O. comic impact |
| fx-parry | 32×32 | Blue/cyan/white directional glint |
| bubble | 16×12 | Bone speech bubble with three green dots |
| hype-speaker | 16×16 | Green carry-handle PA, shaded grille and signal light |

Legacy `cash` and `moneybag` props are retained for compatibility with any older
level data; Sayam's new attack/ability pixels contain neither. No UI layout changed.

Claude confirmed runtime choreography is retained. Sayam's five bubbles now read
BHAI / NO CAP / SO BASICALLY / LE RE / HEAR ME OUT; no money references.
