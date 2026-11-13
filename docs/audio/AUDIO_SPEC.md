# Audio spec: procedural music + SFX (owned by Claude)

There are no audio files. Every sound is synthesized live with WebAudio (`apps/game/src/game/audio/synth.ts`).
Astra composes **data**: songs in `content/audio/songs/<id>.json` and the SFX bank in `content/audio/sfx.json`.
`bun run validate` checks both. In-game: any key starts audio, `M` mutes. A song plays on the level whose `@music` names it, or by default the song with id `ep<episode>` (`ep0`, `ep1`, …).

## Direction

Chiptune meets synthwave, with a dash of Punjabi/Bollywood rhythm (dhol-like kick/snare patterns, tumbi-like plucky square leads) where it's funny or energetic. Loops must not get annoying: 32–64 bars before repeating, with an A/B/C structure. Every episode has its own song, and bosses get their own.

## Song format

```json
{
  "id": "ep0",
  "bpm": 128,
  "stepsPerBeat": 4,
  "swing": 0.08,
  "instruments": {
    "lead":  { "wave": "square",   "volume": 0.16, "attack": 0.005, "decay": 0.08, "sustain": 0.5, "release": 0.06, "vibrato": { "rate": 6, "depth": 12 } },
    "bass":  { "wave": "triangle", "volume": 0.28, "sustain": 0.8 },
    "pad":   { "wave": "sawtooth", "volume": 0.05, "attack": 0.2, "release": 0.4, "cutoff": 1400, "pan": -0.3 },
    "kick":  { "wave": "kick",  "volume": 0.5 },
    "snare": { "wave": "snare", "volume": 0.3 },
    "hat":   { "wave": "hat",   "volume": 0.12 }
  },
  "patterns": {
    "A": {
      "lead": "C5 . E5 . G5 - - . | A5 . G5 . E5 . D5 .",
      "bass": "C3 . . . C3 . . . | A2 . . . A2 . . .",
      "kick": "x . . . x . . . | x . . . x . x3 .",
      "snare": ". . . . x . . . | . . . . x . . x5",
      "hat":  "x5 . x . x5 . x . | x5 . x . x5 . x ."
    }
  },
  "order": ["A", "A", "B", "A"],
  "loopFrom": 0
}
```

| Field | Meaning |
|---|---|
| `bpm` | beats per minute |
| `stepsPerBeat` | 4 = sixteenth-note steps (default) |
| `swing` | 0 to 0.5, delays every odd step (groove) |
| `instruments` | name → synth settings. `wave`: `square` `sawtooth` `triangle` `sine` `noise` (melodic) or `kick` `snare` `hat` (drums). Optional: `volume` `attack` `decay` `sustain` `release` (seconds/levels), `detune` (cents), `cutoff` (Hz lowpass), `vibrato` `{rate Hz, depth cents}`, `pan` (-1..1) |
| `patterns` | id → { instrument → step string }. **Every track in a pattern must have the same number of steps.** |
| `order` | the pattern sequence. After the last one it loops back to index `loopFrom`. |
| `loop` | default `true`. Set `false` for one-shot stingers (`results`, `gameover`): the song plays `order` once and stops. |

**Step tokens** (separated by spaces, `|` is a bar line and is ignored):
- `C4`, `F#3`, `Bb2`: play a note (octave 4 = middle C).
- `-`: hold the previous note one more step.
- `.`: rest.
- `x`: trigger a drum at full velocity. `x1`–`x9` sets the velocity (x9 = full).

Mix guide: keep the total under about 1.0. Lead 0.12–0.2, bass 0.2–0.3, drums 0.1–0.5, pads quiet.

## SFX bank: `content/audio/sfx.json`

```json
{ "sfx": {
  "jump": { "wave": "square", "freq": [300, 620], "duration": 0.09, "volume": 0.12 },
  "hit":  { "wave": "noise",  "freq": [900, 200], "duration": 0.08, "volume": 0.22, "cutoff": 3000 },
  "pickup": { "wave": "square", "freq": [660, 1320], "duration": 0.06, "repeat": 3 }
} }
```

Each SFX sweeps the pitch from `freq[0]` to `freq[1]` over `duration` seconds. `repeat` replays it up to 8 times, each one higher (an arpeggio).
**Required names:** `jump`, `land`, `hit`, `swap`, `ability`, `hurt`, `ko`, `pickup`, `door`, `menu`. You may add more (for example `ability-hack`, `ability-cut`, `boss-roar`); Claude wires them in.
