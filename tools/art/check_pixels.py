"""Independent pixel checks supplement the project's schema validator."""
from PIL import Image
from palette import ROOT,COLORS
A=ROOT/'apps/game/public/assets'
allowed={tuple(bytes.fromhex(c)) for c in COLORS}
for p in A.rglob('*.png'):
    im=Image.open(p)
    assert im.mode=='RGBA', (p,im.mode)
    assert all(a in (0,255) for *_,a in im.getdata()), p
    assert all((r,g,b) in allowed for r,g,b,a in im.getdata() if a),p
print('All PNGs: RGBA, binary alpha, exact palette.')
