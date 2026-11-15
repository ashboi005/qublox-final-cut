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

## T-A46: faces and guarding

Sehaj, Manvi, Mansukh, Manya, Brahmansh and Mishthi now use two visible
3/4-view eyes with a narrower far eye and small dark pupils. This propagates
through all standard/special rows and refreshed supers. Sehaj's lowered head
in the last three `beast` frames restores the eyes after the raised-arm pass.
The three dastars, beards and existing silhouettes remain unchanged. All nine
portrait sheets already used two-eye expressions and remain unchanged.

All nine crew have `block`: four 48×48 frames, 8 fps, looping. A planted,
bent-knee stance and raised forearms/prop make it distinct from idle/run.
Ashwath braces behind his keyboard; Sayam uses an open-palm guard; Tushar
raises the clapperboard, with henna, bracelet and ring retained; Sehaj raises
scissors; Manvi holds her mic; Mansukh uses his brush and keeps his headphones;
Manya raises a paint tin; Brahmansh raises a blade; Mishthi holds a gilt frame.

Rebuild crew bases with `tools/art/crew.py <IDs>`, then run
`tools/art/versus.py --crew-only` and `tools/art/guards.py`. Use Python with
Pillow. The crew-only option leaves approved finishers and fight FX untouched.
Refreshing supers now preserves rows below `super`, including `block`.

Review contacts are ignored files: `tools/art/raw/t-a46-faces.png` places
before/after pairs for idle, run, ability and super across the six corrected
crew; `t-a46-guards.png` shows every guard frame; `t-a46-beast.png` shows all
six boulder-lift frames. Compared with the old single white profile eye, the
pairs show two separated eye openings while keeping all headwear and hair.

Validation: all 302 existing frames of the six corrected sheets compared
against saved originals; changes restricted to the eye area (three rotated
Manya KO frames checked for unchanged alpha and reviewed visually). Every old
frame's alpha silhouette is identical. Ashwath/Sayam/Tushar old rows are
byte-identical. Super+guard regeneration is byte-identical. Exact palette,
binary-alpha and contract checks pass. F2 review covered the six faces and
representative guards at 1×, plus Sehaj's guard and special rows at 2×. That
2× check caught the lowered `beast` face overlap; its final fix was inspected
in the native-pixel contact after browser mouse control became unavailable.
