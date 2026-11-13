"""Build the canonical 1x swatch strip; Python 3 + Pillow."""
from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
COLORS = '''0f1014 242633 414453 696b78 9697a0 c4c3c5 f2f1ec ffffff
393139 5f4d4a 887060 b3997e d3bea0 e5d6ba f0e5ce a79d8e
0000a8 253acb 3a6ea5 64a6cc ff2f36 ab2446 fecb56 c38a35
573265 9256a8 ce73b3 17655d 279a7d 71ceb0 8f493b c87855
eda879 ffce9e 542c47 43e7ed b5fbec ff76a5 f98b41 e8f575'''.split()
if __name__ == '__main__':
    base = ROOT / 'apps/game/public/assets'
    (base / 'palette.hex').write_text(''.join('#'+c+'\n' for c in COLORS))
    strip = Image.new('RGBA', (len(COLORS)*8, 8))
    for i, c in enumerate(COLORS):
        strip.paste('#'+c, (i*8, 0, i*8+8, 8))
    strip.save(base / 'palette.png')
