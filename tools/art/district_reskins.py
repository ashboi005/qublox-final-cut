"""Costume variants retain the base enemy's silhouette and animation contract.

Reads the shipped base sheets; never imports generators with write side effects.
"""
import copy
import json
from PIL import Image, ImageColor, ImageDraw
from likeness import A, C, Pen

VARIANTS = ['render-farm','the-set','the-feed','templatr']

def intern(base, district, anim, f):
    im=base.copy()
    bob=[0,-1,0,1][f%4] if anim in ('idle','move') else 0
    p=Pen(im,0,bob)
    reach=[0,3,7,4][f%4] if anim=='attack' else -2 if anim=='telegraph' else 0
    if district=='render-farm':
        # A padded cooling vest: two pale radiator grids, a hose and cold neck wrap.
        p.p([(15,22),(20,22),(22,25),(26,25),(28,22),(31,22),(33,33),(14,33)],2)
        p.l([(17,23),(17,31)],19,2); p.l([(29,24),(30,31)],19,2)
        for x in (18,26):
            p.r((x,26,x+4,31),3,0)
            for y in (27,29): p.l([(x+1,y),(x+3,y)],19)
        p.l([(20,22),(25,23),(29,21)],19,2)
        p.l([(16,31),(12,32),(11,29)],19)
        sy=9+f%3
        p.p([(34,sy),(33,sy+3),(34,sy+5),(36,sy+4),(36,sy+2)],19)
        p.r((34,sy+2,34,sy+3),36)
        p.l([(17,14),(18,14)],31); p.l([(29,14),(30,14)],31)
    elif district=='the-set':
        # False whiskers and a costume waistcoat. Clipboard follows the shove hand.
        p.p([(19,14),(22,13),(24,14),(26,13),(29,14),(30,16),(26,16),(24,15),(21,16),(18,16)],9)
        p.p([(15,22),(20,22),(23,31),(21,34),(14,33)],10)
        p.p([(29,22),(32,23),(34,33),(27,34),(25,31)],10)
        p.r((23,23,25,25),9)
        x=30+reach
        p.r((x,28,min(47,x+8),40),9,0)
        p.r((x+1,30,min(46,x+7),38),14)
        p.r((x+2,28,min(46,x+5),30),4,0)
        for y in (33,36): p.l([(x+2,y),(min(45,x+5),y)],11)
    elif district=='the-feed':
        # Ring light lives behind the familiar rectangular head, no crown collision.
        halo=Image.new('RGBA',(48,48)); d=ImageDraw.Draw(halo)
        d.ellipse((8,1+bob,38,30+bob),outline=C[0],width=4)
        d.ellipse((9,2+bob,37,29+bob),outline=C[14],width=2)
        d.line((12,6+bob,16,3+bob),fill=C[6],width=2)
        halo.alpha_composite(im); im=halo; p=Pen(im,0,bob)
        p.l([(19,10),(21,10)],9); p.l([(27,10),(29,10)],9)
        p.l([(19,13),(21,13)],10); p.l([(27,13),(29,13)],10)
        p.l([(21,24),(24,28),(28,24)],9)
        p.r((23,28,25,30),14,0)
        x=34+reach
        p.r((x,17,min(47,x+5),28),0)
        p.r((x+1,18,min(46,x+4),25),19)
        p.l([(x+2,20),(min(46,x+3),22)],36)
        p.r((x+2,27,min(46,x+3),27),5)
    else:
        # Compliance: neat high-collar suit, two-tone lanyard and rectangular ID.
        p.p([(15,22),(20,22),(22,26),(19,29),(22,33),(14,33)],12)
        p.p([(28,22),(31,22),(33,33),(26,33),(29,28),(26,25)],12)
        p.l([(20,22),(23,29),(26,29),(29,22)],9)
        p.r((22,28,27,33),14,0)
        p.r((23,29,24,30),10); p.l([(25,29),(26,29)],9)
        p.l([(23,32),(26,32)],10)
        p.r((15,5,31,8),9,0); p.l([(17,6),(28,6)],11)
    if anim=='die':
        h=max(3,48-(f+1)*48//5)
        small=im.resize((48,h),Image.Resampling.NEAREST)
        im=Image.new('RGBA',(48,48)); im.paste(small,(0,48-h))
    return im

def build():
    path=A/'manifest.json'; m=json.loads(path.read_text())
    spec=m['sprites']['stock-intern']; base=Image.open(A/spec['file']).convert('RGBA')
    idle_row=spec['anims']['idle']['row']
    for district in VARIANTS:
        sheet=Image.new('RGBA',base.size)
        for anim,a in spec['anims'].items():
            for f in range(a['frames']):
                x,y=f*48,a['row']*48
                source=base.crop((0,idle_row*48,48,idle_row*48+48)) if anim=='die' else base.crop((x,y,x+48,y+48))
                sheet.paste(intern(source,district,anim,f),(x,y))
        key=f'stock-intern-{district}'; file=f'sprites/enemies/{key}.png'; sheet.save(A/file)
        m['sprites'][key]=copy.deepcopy(spec); m['sprites'][key]['file']=file
    spec=m['sprites']['corporate-memphis-blob']; sheet=Image.open(A/spec['file']).convert('RGBA')
    swaps={ImageColor.getrgb(C[a]):ImageColor.getrgb(C[b]) for a,b in [(24,10),(25,12),(26,14),(13,13),(22,15)]}
    pixels=sheet.load()
    for y in range(sheet.height):
        for x in range(sheet.width):
            r,g,b,a=pixels[x,y]
            if a and (r,g,b) in swaps: pixels[x,y]=(*swaps[(r,g,b)],a)
    key='corporate-memphis-blob-templatr'; file=f'sprites/enemies/{key}.png'; sheet.save(A/file)
    m['sprites'][key]=copy.deepcopy(spec); m['sprites'][key]['file']=file
    path.write_text(json.dumps(m,indent=2)+'\n')

if __name__=='__main__': build()
