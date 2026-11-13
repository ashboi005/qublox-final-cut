# District enemy costumes

`tools/art/district_reskins.py` reads the shipped base PNGs and copies their manifest metadata exactly. Regenerate after changing either base sheet. All five variants are 48×48, with unchanged frame counts, FPS, loops and hit frames. Four-frame intern telegraphs retain the full 500 ms anticipation and red warning mark.

| Key | Readable costume cue |
|---|---|
| stock-intern-render-farm | Cooling-vest radiator panels, cold neck wrap, hose, falling sweat |
| stock-intern-the-set | Stock-photo extra's false moustache, waistcoat and clipboard following the shove |
| stock-intern-the-feed | Pale ring-light halo behind the square head, tired eyes, phone held up |
| stock-intern-templatr | Beige compliance lapels, combed hair, dark lanyard and rectangular ID |
| corporate-memphis-blob-templatr | Flat beige three-step shading in place of purple; original rubber-hose geometry and split row |

Intern rows remain `idle`, `move`, `telegraph`, `attack`, `hurt`, `die`. The blob retains its additional `split` row. Accessories collapse with the intern in the same nearest-neighbour death squash; they never float after the body disappears. No new palette entries.
