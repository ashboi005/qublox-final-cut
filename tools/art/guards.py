"""Four native-pixel guard poses per crew. Run AFTER crew.py and versus.py.
Appends/replaces only `block`; all existing rows remain byte-identical.
"""
import json
from PIL import Image,ImageDraw
from likeness import A,C,Pen
from versus import CREW
from tushar import clap


def frame(who,source,f):
    if who=='manya':
        from manya import frame as manya_frame
        return manya_frame(who,'block',f)
    im=Image.new('RGBA',(48,48))
    # Wide planted feet, lowered centre of gravity, a one-pixel impact compression.
    dx=[0,-1,-2,-1][f];dy=[0,1,2,1][f]
    legs=Pen(im)
    for x,foot in ((19,16),(27,30)):
        legs.p([(x-3,34),(x+3,34),(foot+3,40),(foot+3,45),(foot-3,45),(foot-3,40)],19 if who=='mansukh' else 1)
        legs.l([(x-1,36),(foot-1,40),(foot-1,43)],18 if who=='mansukh' else 2)
        legs.r((foot-4,44,foot+4,47),0)
        legs.l([(foot-3,45),(foot+3,45)],6 if who in ('sayam','mansukh','manya') else 3)
        if who=='sayam':legs.r((foot+1,44,foot+2,44),42)
    im.alpha_composite(source.crop((16,24,30,36)),(16+dx,24+dy))
    p=Pen(im,dx,dy)
    main,shade={'ashwath':(14,12),'sayam':(1,2),'tushar':(1,2),
        'sehaj':(40,41),'manvi':(1,2),'mansukh':(14,12),
        'manya':(29,27),'brahmansh':(1,2),'mishthi':(6,13)}[who]
    # Far arm crosses the torso; near elbow bends up to guard the jaw.
    p.p([(15,25),(19,27),(22,30),(29,27),(31,30),(23,35),(18,33),(12,29)],main)
    p.l([(16,28),(22,32),(28,29)],shade)
    p.r((27,26,31,30),32,0)
    p.p([(28,25),(32,25),(35,29),(37,25),(39,26),(37,34),(33,35),(28,30)],main)
    p.l([(31,28),(34,32),(36,29)],shade)
    p.p([(35,27),(35,22),(37,20),(40,21),(40,25),(38,29)],32)
    p.l([(37,22),(39,22)],33)
    # Original likeness/headwear is copied, never redrawn for a guard.
    im.alpha_composite(source.crop((9,0,33,24)),(9+dx,dy))
    im.alpha_composite(source.crop((12,24,31,28)),(12+dx,24+dy))
    if who=='mansukh':
        p.l([(14,27),(17,30),(26,30),(29,27)],0,2)
        p.r((12,25,16,30),1,0);p.r((13,26,14,28),3)
        p.r((28,25,31,30),1,0);p.r((29,26,30,28),3)
    if who=='ashwath':
        p.p([(33,19),(39,18),(44,32),(37,34)],0)
        p.p([(34,20),(38,20),(42,31),(38,32)],3)
        for yy in (22,25,28):p.l([(36,yy),(39,yy+1)],6)
        p.l([(38,32),(41,31)],35)
    elif who=='sayam':
        p.l([(37,20),(37,17)],32);p.l([(39,21),(40,18)],32)
        p.l([(28,27),(30,24)],32)
    elif who=='tushar':
        clap(p,38,24)
        p.r((34,27,36,29),32,0)
        p.l([(33,28),(33,30)],5);p.r((33,28,33,28),7)
        p.l([(28,27),(30,28),(28,29)],30);p.r((30,27,30,27),30)
        p.r((35,28,35,28),5)
    elif who=='sehaj':
        p.l([(35,30),(40,20)],0,3);p.l([(35,29),(40,20)],35)
        p.p([(39,24),(42,14),(43,21),(41,26)],6)
        p.p([(39,24),(46,19),(44,25),(41,27)],5)
    elif who=='manvi':
        p.l([(37,29),(38,21)],0,4);p.l([(37,27),(38,23)],4)
        p.r((36,18,40,22),0);p.l([(37,19),(39,19)],6)
    elif who=='mansukh':
        p.l([(35,34),(40,16)],0,3);p.l([(36,33),(40,17)],22)
        p.r((39,16,41,19),37,0);p.r((40,17,40,18),6)
    elif who=='manya':
        p.l([(35,26),(35,22),(40,22),(42,25)],0)
        p.r((33,25,43,34),3,0);p.r((34,26,42,28),26)
        p.l([(35,30),(35,32)],6)
    elif who=='brahmansh':
        p.l([(35,31),(39,23)],0,3)
        p.p([(38,24),(41,13),(44,22),(40,27)],6)
        p.l([(40,21),(42,18)],5)
        p.l([(30,29),(33,25)],5,2)
    else:
        p.r((34,18,44,33),0);p.r((35,19,43,32),22)
        p.r((37,21,41,30),0);p.l([(35,20),(35,29)],6)
        p.r((33,28,35,30),32,0);p.l([(32,28),(32,30)],22)
    return im


def build():
    path=A/'manifest.json';m=json.loads(path.read_text())
    contact=Image.new('RGBA',(4*144,9*160),C[1]);d=ImageDraw.Draw(contact)
    for i,who in enumerate(CREW):
        e=m['sprites'][who];base=Image.open(A/e['file']).convert('RGBA')
        row=e['anims'].get('block',{}).get('row',base.height//48)
        sheet=Image.new('RGBA',(base.width,max(base.height,(row+1)*48)))
        sheet.paste(base,(0,0));sheet.paste((0,0,0,0),(0,row*48,base.width,(row+1)*48))
        idle=e['anims']['idle']['row'];source=base.crop((0,idle*48,48,(idle+1)*48))
        for f in range(4):
            im=frame(who,source,f);sheet.paste(im,(f*48,row*48))
            contact.paste(im.resize((144,144),Image.Resampling.NEAREST),(f*144,i*160+16))
        d.text((0,i*160),who,fill=C[6]);sheet.save(A/e['file'])
        e['anims']['block']=dict(row=row,frames=4,fps=8,loop=True)
    path.write_text(json.dumps(m,indent=2)+'\n')
    contact.save(A.parents[3]/'tools/art/raw/t-a46-guards.png')

if __name__=='__main__':build()
