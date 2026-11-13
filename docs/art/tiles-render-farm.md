# render-farm tiles · 16×16

96×96 RGBA; **six columns**, row-major index = row × 6 + column. No spacing. Canonical blob indices 0–8 are in logical order, not a physical 3-column block. Pair door upper/lower vertically. Tiles do not encode collisions; these are recommendations for Claude.

| Index | Meaning | Use |
|---|---|---|
| 0 | concrete top-left | solid |
| 1 | concrete top | solid |
| 2 | concrete top-right | solid |
| 3 | concrete left | solid |
| 4 | concrete fill | solid |
| 5 | concrete right | solid |
| 6 | concrete bottom-left | solid |
| 7 | concrete bottom | solid |
| 8 | concrete bottom-right | solid |
| 9 | platform left | one-way |
| 10 | platform middle | one-way |
| 11 | platform right | one-way |
| 12 | sparking cable | hazard |
| 13 | closed door upper | door; code controls collision |
| 14 | closed door lower | door; code controls collision |
| 15 | open door upper | door; code controls collision |
| 16 | open door lower | door; code controls collision |
| 17 | terminal off | interactable |
| 18 | terminal on | interactable |
| 19 | CRT | decor |
| 20 | film poster | decor |
| 21 | neon bars | decor |
| 22 | cable elbow | decor |
| 23 | chai counter left | decor |
| 24 | chai counter right | decor |
| 25 | plant | decor |
| 26 | speaker | decor |
| 27 | vent | decor |
| 28 | tape stickers | decor |
| 29 | ceiling lamp | decor |
| 30 | server rack | decor |
| 31 | cooling fan | decor |
| 32 | cable tray | decor |
| 33 | warning stripes | decor |
| 34 | hot rack | decor |
| 35 | floor bolt | decor |
