"""T-A50 targeted rebuild: Claude sigil and only Ashwath's super rows.
Run with Python + Pillow. No other character rows or paused HD work is rebuilt.
"""
import json
import math
import sys
from pathlib import Path
from PIL import Image, ImageDraw
from likeness import frame as pixel_frame
from palette import COLORS

ROOT = Path(__file__).resolve().parents[2]
A = ROOT / 'apps/game/public/assets'


def logo(scale):
    # Twelve blunt, tapered rays keep the hand-cut asterisk silhouette.
    ss = 3 if scale == 4 else 1
    size = 32 * scale
    sheet = Image.new('RGBA', (size * 8, size))
    lengths = [12] * 12
    for f in range(8):
        im = Image.new('RGBA', (size * ss, size * ss))
        d = ImageDraw.Draw(im)
        unit = scale * ss
        def points(ps):
            return [(round((16+x)*unit), round((16+y)*unit)) for x,y in ps]
        pulse = (1-math.cos(f*math.tau/8))/2
        for radius, alpha in [(15, 12+int(10*pulse)), (14, 18+int(15*pulse))]:
            d.ellipse(((16-radius)*unit,(16-radius)*unit,(16+radius)*unit,(16+radius)*unit),fill=(217,119,87,alpha))
        for k,r in enumerate(lengths):
            angle = k*math.tau/12 + f*math.tau/96
            def ray(x,y):return (x*math.cos(angle)-y*math.sin(angle), x*math.sin(angle)+y*math.cos(angle))
            d.polygon(points([ray(2,-1.3),ray(r,-1.0),ray(r+.3,1),ray(2,1.6)]),fill='#d97757')
        d.ellipse((12*unit,12*unit,20*unit,20*unit),fill='#d97757')
        if scale==4:im=im.resize((size,size),Image.Resampling.LANCZOS)
        sheet.paste(im,(f*size,0))
    return sheet


def build_logos(hd_only=False):
    for scale,name,prefix in [(1,'manifest.json',''),(4,'manifest-hd.json','hd/')]:
        if hd_only and scale == 1:continue
        p=A/name;m=json.loads(p.read_text());file=prefix+'sprites/props/claude-logo.png'
        (A/file).parent.mkdir(parents=True,exist_ok=True);logo(scale).save(A/file)
        m['sprites']['claude-logo']=dict(file=file,frameWidth=32*scale,frameHeight=32*scale,anims={'spin':dict(row=0,frames=8,fps=8,loop=True)})
        p.write_text(json.dumps(m,indent=2)+'\n')


def main():
    sys.path.insert(0,str(Path(__file__).parent/'hd'))
    # Load the HD rig by explicit path: its module name collides with pixel crew.py.
    import importlib.util
    spec=importlib.util.spec_from_file_location('hd_crew',Path(__file__).parent/'hd/crew.py')
    hd=importlib.util.module_from_spec(spec);spec.loader.exec_module(hd)
    for manifest,render in [('manifest.json',lambda f:pixel_frame('ashwath','super',f)),('manifest-hd.json',lambda f:hd.frame('ashwath','super',f,8))]:
        m=json.loads((A/manifest).read_text());e=m['sprites']['ashwath'];size=e['frameWidth'];row=e['anims']['super']['row']
        sheet=Image.open(A/e['file']).convert('RGBA');sheet.paste((0,0,0,0),(0,row*size,sheet.width,(row+1)*size))
        for f in range(8):sheet.paste(render(f),(f*size,row*size))
        sheet.save(A/e['file'])
    (A/'palette.hex').write_text(''.join('#'+c+'\n' for c in COLORS))
    build_logos()
    print('T-A50: two super rows and two logo sheets rebuilt.')


if __name__=='__main__':main()
