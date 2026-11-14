"""T-A43 props/decor/portraits and standalone image finish, native 1x pixels.
Run after polish_world.py + polish_entities.py; regenerates its own sources.
"""
import json,runpy
from PIL import Image,ImageDraw,ImageColor
from likeness import A,C,Pen
from palette import ROOT
from polish_entities import material

def main():
    from editor_likeness import lightstick
    from mishthi import prop
    lightstick().save(A/'sprites/props/lightstick.png')
    prop().save(A/'sprites/props/prop.png')
    edge=Image.new('RGBA',(16,4));p=Pen(edge);p.r((0,0,15,3),23,0);p.l([(1,1),(14,1)],22);p.l([(2,1),(6,1)],6);edge.save(A/'sprites/props/art-frame.png')
    for name in ('props.py','puzzle_props.py','machinery.py','set_props.py','tape.py','decor.py','likeness_props.py','fx.py','logo.py','icons.py','newspaper.py','glossary_stamp.py','title_background.py','portraits.py','npc_portraits.py'):
        runpy.run_path(str(ROOT/'tools/art'/name),run_name='__main__')
    path=A/'manifest.json';m=json.loads(path.read_text());review=[]
    for key,e in m['sprites'].items():
        if not any('/'+x+'/' in e['file'] for x in ('props','decor')) and not e['file'].startswith('fx/'):continue
        src=Image.open(A/e['file']).convert('RGBA');out=Image.new('RGBA',src.size);w=e['frameWidth'];h=e['frameHeight']
        for anim,a in e['anims'].items():
            for f in range(a['frames']):
                x=f*w;y=a['row']*h;im=material(src.crop((x,y,x+w,y+h)));p=Pen(im)
                if key=='decor-water-cooler':
                    p.l([(9,5),(9,12)],36);p.l([(8,28),(15,28)],3);p.r((10,23,11,23),20)
                elif key=='decor-mood-board':
                    p.l([(10,12),(25,9),(36,13),(27,23)],21)
                    for xx,yy in [(10,6),(24,5),(36,8),(25,19)]:p.r((xx,yy,xx,yy),22)
                elif key=='decor-beanbag':p.l([(9,17),(15,20),(23,20)],24);p.l([(13,7),(15,7),(17,9)],26)
                elif key=='decor-server-rack':
                    for yy in (8,16,24,32,40):p.r((10,yy,10,yy),5);p.r((13,yy,16,yy),0)
                elif key=='decor-coolant-drum':
                    p.l([(6,9),(6,27)],19);p.r((10,17,13,20),6);p.l([(11,18),(12,19)],18)
                elif key=='decor-clapperboard':p.l([(5,15),(17,15)],5);p.l([(6,21),(9,21)],4)
                elif key=='decor-director-chair':
                    p.l([(7,5),(23,5)],3);p.r((8,20,23,20),4);p.r((14,24,16,26),3)
                elif key=='decor-sandbag':
                    for xx in range(6,28,4):p.r((xx,14,xx+1,14),12)
                elif key=='decor-ring-light':p.l([(9,6),(12,4),(17,4)],6);p.r((14,12,16,13),19)
                elif key=='decor-phone-tripod':p.r((10,5,13,5),35);p.r((11,14,13,14),4)
                elif key=='decor-plastic-ficus':p.l([(12,37),(21,37)],13);p.l([(13,39),(14,44)],12)
                elif key=='decor-standing-desk':p.l([(18,4),(28,4)],14);p.l([(19,7),(23,5)],13)
                elif key=='decor-beige-cubicle':p.r((4,7,21,8),14);p.r((32,11,37,11),14)
                elif key=='tape':p.r((3,4,5,5),6);p.r((10,4,12,5),6);p.r((5,11,10,11),20 if f%2 else 22)
                elif key=='server-crate' and anim!='smash':
                    for xx in (3,27):
                        for yy in (3,27):p.r((xx,yy,xx+1,yy+1),5)
                elif key=='catwalk' and anim=='intact':
                    for xx in range(4,46,8):p.r((xx,2,xx+1,2),6)
                elif key=='big-fan':
                    for xx,yy in [(3,3),(43,3),(3,43),(43,43)]:p.r((xx,yy,xx+1,yy+1),5)
                elif key=='dust-puff':
                    if f<3:p.l([(3+f,11-f),(5+f,10-f)],5)
                elif key=='hit-spark':
                    if f<3:p.star(16,16,6,2)
                elif key=='tag-in-burst':
                    if f<4:
                        for xx,yy in [(7,13),(54,44),(48,7)]:p.star(xx,yy,36,1+f%2)
                elif key=='heal-sparkle':
                    if f<3:p.star(15,24-f*4,22,1)
                out.paste(im,(x,y))
        out.save(A/e['file']);review.append((key,out.crop((0,0,w,h))))
    # Update tiny crew icons from the actual likenesses; preserve each existing 16px key.
    crew=['ashwath','sayam','tushar','sehaj','mansukh','manya','brahmansh','manvi','mishthi']
    for who in crew:
        e=m['sprites'][who];src=Image.open(A/e['file']).convert('RGBA')
        # Full headwear/hair region, then exact nearest-neighbour reduction.
        crop=src.crop((10,2,34,27)).resize((14,14),Image.Resampling.NEAREST)
        im=Image.new('RGBA',(16,16));im.alpha_composite(crop,(1,1));file=f'icons/{who}.png';im.save(A/file);m['images']['icon-'+who]={'file':file};review.append((who,im))
    # Legacy key retained but artwork now describes Smooth Talk, not bribery.
    im=Image.new('RGBA',(16,16));p=Pen(im);p.p([(2,1),(13,1),(15,3),(15,10),(12,12),(7,12),(3,15),(3,12),(0,10),(0,3)],6)
    for x in (4,7,10):p.r((x,6,x+1,7),42)
    im.save(A/'icons/ability-bribe.png')
    for key,e in m['images'].items():
        if key.startswith('bg-') or key.startswith('icon-') or key in ('bubble','hype-speaker','fx-counter','fx-combo','fx-ko','fx-parry'):continue
        src=Image.open(A/e['file']).convert('RGBA');im=material(src);p=Pen(im);w,h=im.size
        if key=='newspaper':
            p.l([(3,2),(3,56)],14);p.l([(195,3),(195,56)],11)
            p.l([(8,56),(190,56)],12)
            for x in range(9,190,12):p.r((x,27,x+2,27),11)
        elif key=='glossary-stamp':
            # Slight uneven pressure; preserve legible lettering.
            pix=im.load();red=ImageColor.getrgb(C[20])+(255,)
            for y in range(h):
                for x in range(w):
                    if pix[x,y]==red and (x+y*7)%13==0:pix[x,y]=ImageColor.getrgb(C[21])+(255,)
        elif key=='logo':
            # Top-lit ink type with small registration slips, no layout changes.
            pix=im.load();srcp=src.load();bone=ImageColor.getrgb(C[6])+(255,)
            for y in range(1,44):
                for x in range(1,w-1):
                    if srcp[x,y]==bone and srcp[x,y-1]!=bone:pix[x,y]=ImageColor.getrgb(C[7])+(255,)
            p.l([(10,44),(30,44)],20);p.l([(212,47),(229,47)],35)
        elif key=='title-bg':
            for x in (40,100,165,230,290):p.l([(x,174),(x+12,178),(x+29,179),(x+40,175)],0)
            p.l([(374,104),(374,237)],18);p.r((393,86,427,87),3)
        elif key=='telescope':p.star(23,6,36,1)
        elif key=='decor-trophy':p.star(10,8,6,1)
        elif key=='boulder':p.l([(4,4),(7,3),(9,3)],5)
        elif key=='sprite-can':p.l([(5,4),(5,11)],29)
        elif key=='lightstick':p.r((5,3,6,3),7)
        elif key=='prop':p.l([(5,6),(5,10)],6)
        elif key=='art-frame':p.l([(1,1),(14,1)],14)
        elif key=='fx-heart':p.star(7,6,6,2)
        elif key.startswith('fx-'):
            # A tiny white edge flash gives the already inked burst a second light plane.
            for x,y in [(9,5),(10,5),(11,5)]:
                if x<w and y<h and im.getpixel((x,y))[3]:p.r((x,y,x,y),6)
        im.save(A/e['file']);review.append((key,im))
    # Portrait faces/expressions unchanged: finish only clothing below the chin.
    for key,e in m['portraits'].items():
        src=Image.open(A/e['file']).convert('RGBA');out=src.copy()
        for i,_ in enumerate(e['emotions']):
            part=src.crop((i*64,48,(i+1)*64,64));out.paste(material(part),(i*64,48))
        out.save(A/e['file'])
    path.write_text(json.dumps(m,indent=2)+'\n')
    contact=Image.new('RGBA',(640,((len(review)+7)//8)*90),C[1]);d=ImageDraw.Draw(contact)
    for i,(key,im) in enumerate(review):
        x=i%8*80;y=i//8*90;d.text((x,y),key[:12],fill=C[6]);preview=im.copy();preview.thumbnail((78,70),Image.Resampling.NEAREST);contact.alpha_composite(preview,(x,y+15))
    contact.save(ROOT/'tools/art/raw/objects-polish.png')
if __name__=='__main__':main()
