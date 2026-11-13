# Score notes

All songs: 4/4, sixteen steps per bar, six authored four-bar patterns, order A/A2/B/A/C/C2/B/D = 32 bars. Loop from start. C strips hats and most lead for breathing room; D closes the phrase into the first tonic. Instruments total under 1.0 nominal gain before engine buses. Envelopes keep short notes below their step length.

| ID | BPM | Intent |
|---|---|---|
| ep0 | 128 | Deadline funk: E-minor pluck, syncopated octaves, relaxed swing |
| ep0-boss | 154 | Email pings become a high-register call-and-response alarm |
| ep1 | 116 | D-minor industrial drone, filtered saw bass, slower repeating machinery |
| ep1-boss | 138 | Hypnotic repeated notes; deliberate two-sixteenth holes in alternate bars imitate buffering |
| title | 124 | Clear tonic/fifth/octave hook; answer rises to the ninth before coming home |

No rendered audio ships: these are tracker JSON for Claude's WebAudio engine. Per-ability SFX have separate pitch/timbre identities and await engine event wiring. Runtime scheduling can be checked in-browser; final musical balance needs a listening pass with combat active.

## Episode 2 and stingers

- `ep2`: 108 BPM, A harmonic-minor melody with raised leading-tone ornaments; softer triangle lead and a noir bass pulse. 32 bars.
- `ep2-boss`: 146 BPM, the same language becomes an insistent staged-smile nightmare. 32 bars.
- `results`: one 8-bar `stinger` pattern at 132 BPM (14.545s); ascending major fanfare resolves to high C, with a final breath.
- `gameover`: one 4-bar `stinger` pattern at 84 BPM (11.429s); filtered saw lead falls chromatically with slow vibrato and ends in a rest.

The schema has no non-looping flag. Stingers contain a single order entry, `stinger`; **Claude must stop playback after the first pass** as requested. `loopFrom: 0` is a required format value, not a request to repeat these cues.
