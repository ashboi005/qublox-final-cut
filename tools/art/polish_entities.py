"""T-A43 cast-of-enemies finish. Rebuild base enemies, then preserve their contracts.
Run polish_world.py first; this pass does not rebuild worlds or crew.
"""
import json,math,runpy
from PIL import Image,ImageDraw,ImageColor
from likeness import A,C,Pen
from palette import ROOT

def material(im):
    # One-pixel highlight/shadow boundaries within colour clusters, never alpha blur.
    src=im.copy();pix=src.load();dst=im.load();w,h=im.size
    ramps=[(1,2,0),(2,3,1),(3,4,2),(9,11,8),(10,11,9),(11,12,9),(12,13,11),(13,14,12),(18,19,2),(25,26,24),(27,29,41),(31,32,30),(32,33,31)]
    mapping={ImageColor.getrgb(C[a])+(255,):(ImageColor.getrgb(C[b])+(255,),ImageColor.getrgb(C[c])+(255,)) for a,b,c in ramps}
    for y in range(1,h-1):
        for x in range(1,w-1):
            v=pix[x,y]
            if v not in mapping:continue
            hi,sh=mapping[v]
            if pix[x,y-1]!=v and pix[x+1,y]==v and pix[x,y+1]==v:dst[x,y]=hi
            elif pix[x+1,y]!=v and pix[x-1,y]==v and pix[x,y-1]==v:dst[x,y]=sh
    return im

def beige(anim,f):
    im=Image.new('RGBA',(128,128));p=Pen(im);dy=f%2
    cols=[14,13,12,11,12,15] if anim!='phase3' else [22,20,26,17,35,29]
    if anim!='die':
        # Mechanical halo and suspended geometric core; calm, precise corporate menace.
        corners=[(64,14+dy),(105,40+dy),(105,89+dy),(64,113+dy),(23,89+dy),(23,40+dy)]
        for k in range(6):
            a=k*math.pi/3-math.pi/2;x=64+round(math.cos(a)*57);y=64+round(math.sin(a)*57)
            p.p([(x-4,y-4),(x+4,y-4),(x+5,y+3),(x-4,y+4)],11)
            p.l([(x-3,y-3),(x+2,y-3)],15)
        for k in range(6):p.p([(64,65+dy),corners[k],corners[(k+1)%6]],cols[k])
        p.l([(25,40+dy),(64,16+dy),(102,40+dy)],15,2)
        p.l([(25,42+dy),(25,87+dy),(63,110+dy)],13)
        # Recessed ring, inside border, tiny etched machine alignment marks.
        outer=[(64,27),(94,46),(94,83),(64,102),(34,83),(34,46),(64,27)]
        inner=[(64,33),(88,49),(88,79),(64,96),(40,79),(40,49),(64,33)]
        p.p(outer[:-1],9);p.p(inner[:-1],12)
        p.l(outer,15);p.l([(40,49),(64,33),(88,49)],14)
        for k in range(6):
            a=k*math.pi/3-math.pi/2;x=64+round(math.cos(a)*42);y=64+round(math.sin(a)*42)
            p.r((x-2,y-1,x+2,y+1),9);p.r((x-1,y-1,x+1,y-1),15)
        # Captive master-drive cradle: steel corner clamps, glass display and data pins.
        p.r((50,42,77,86),9,0);p.r((53,45,74,83),1,0)
        p.r((56,49,71,67),27 if anim=='phase3' else 11)
        p.l([(57,50),(69,50),(69,53)],36 if anim=='phase3' else 14)
        p.l([(57,64),(68,53)],29 if anim=='phase3' else 12)
        p.r((57,71,70,77),3);p.r((59,73,68,75),6)
        for x in (55,60,65,70):p.r((x,80,x+1,82),23)
        for x,y in [(49,43),(75,43),(49,82),(75,82)]:p.r((x,y,x+3,y+3),4,0);p.r((x+1,y,x+2,y),6)
        # Polite smile abstraction etched on upper facet, without monster teeth.
        p.l([(57,22),(61,24),(67,24),(71,22)],12)
        for x in (54,74):p.r((x,20,x+1,20),9)
        if anim in ('phase2','phase3'):
            for k in range(5):
                y=27+k*17;dx=(-1 if (k+f)%2 else 1)*(3+f)
                p.r((30+dx,y,98+dx,y+1),[20,35,26,22,17][k] if anim=='phase3' else 6 if k%2 else 9)
                for xx in range(33+dx,96+dx,9):p.r((xx,y+2,xx+3,y+2),0)
        if anim=='phase3':
            for k in range(8):
                a=k*math.pi/4+f*.15;x=64+round(math.cos(a)*55);y=64+round(math.sin(a)*55)
                p.p([(x,y-3),(x+3,y),(x,y+3),(x-3,y)], [20,22,35,26][k%4]);p.r((x,y-1,x,y-1),6)
        if anim=='telegraph':
            p.l([(64,7),(114,36),(114,93),(64,121),(14,93),(14,36),(64,7)],20 if f%2 else 22,2)
            for k in range(f+1):p.r((55+k*5,91,57+k*5,92),20)
        if anim=='hurt':p.star(103,19,22,5)
    else:
        for k in range(6):
            a=k*math.pi/3;cx=64+round(math.cos(a)*(23+f*9));cy=64+round(math.sin(a)*(23+f*9));r=12-f*2
            p.p([(cx,cy-r),(cx+r,cy),(cx,cy+r),(cx-r,cy)],[20,22,35,26,17,29][k]);p.l([(cx-r+2,cy),(cx,cy-r+2)],6)
        p.r((55,49,72,80),1,0);p.r((58,52,69,66),27);p.l([(59,53),(67,53),(59,63)],35);p.r((60,72,67,75),6)
        for x in (58,62,66):p.r((x,78,x+1,79),23)
        if f>1:p.star(78,44,36,3)
    return im

def chad(anim,f):
    im=Image.new('RGBA',(48,48));p=Pen(im,0,-1 if f==2 else 0)
    # Immaculate seamless athleisure, expensive cream sneakers, startup-founder hair.
    for x in (19,27):
        p.p([(x-3,32),(x+3,32),(x+2,43),(x-2,44)],11)
        p.l([(x-2,35),(x-2,42)],13);p.r((x-3,44,x+5,47),14,0);p.l([(x-2,45),(x+3,45)],6)
    p.p([(15,22),(29,22),(32,28),(30,36),(15,36),(12,29)],12)
    p.p([(25,24),(30,25),(30,35),(25,35)],11,None)
    p.l([(20,24),(20,34)],14);p.r((21,26,21,26),9)
    p.p([(17,10),(25,9),(30,12),(30,17),(32,18),(30,21),(28,24),(20,23),(16,18)],32)
    p.p([(28,13),(30,15),(30,19),(28,22),(25,23),(26,19)],31,None)
    p.p([(15,16),(14,10),(17,6),(25,5),(30,8),(30,12),(26,12),(22,9),(18,11),(18,16)],10)
    p.l([(16,9),(21,7),(26,7),(28,9)],12)
    p.l([(23,14),(28,14)],9);p.r((24,15,28,17),6);p.r((27,15,28,17),0)
    p.l([(24,20),(29,19)],6);p.l([(25,21),(29,20)],9)
    if anim=='talk' and f%2:p.r((25,20,29,21),0);p.r((26,20,28,20),6)
    # Ear-mounted pitch microphone, not a weapon; blandly smug hand flourish.
    p.l([(17,15),(17,20),(23,21)],0);p.r((23,20,24,21),3)
    hx,hy=[(33,29),(36,23),(38,27),(33,29)][f] if anim=='talk' else (33,29)
    p.l([(29,26),(hx-2,hy+2)],0,5);p.l([(29,26),(hx-2,hy+1)],12,3)
    p.r((hx-2,hy-1,hx+2,hy+2),32,0);p.r((hx+1,hy-2,hx+3,hy-1),0)
    p.l([(13,27),(15,32)],11,3);p.r((14,31,17,34),32,0)
    if anim=='talk' and f==2:
        p.r((35,10,46,18),14,9);p.l([(37,16),(40,14),(43,15),(45,12)],11)
    return im

def detail(key,im,anim,f):
    im=material(im);p=Pen(im);size=im.width
    if anim=='die':return im
    if key=='reply-all-mothership':
        ox=f*2 if anim=='attack-dive' else 0;dy=[0,-1,0,1][f] if anim=='idle' else 0;p=Pen(im,ox,dy)
        p.l([(26,25),(68,25)],14);p.l([(15,35),(15,59),(25,69)],12)
        for x in (8,75):
            for yy in (47,50,53):p.l([(x+2,yy),(x+10,yy)],0)
            p.r((x+2,41,x+9,41),6)
        for x in (28,60):p.r((x,65,x+6,67),4);p.r((x+1,66,x+3,66),6)
        p.l([(32,15),(29,8),(22,8)],9,2);p.r((20,6,23,9),20 if f%2 else 22,0)
        p.l([(62,15),(67,8),(73,8)],9,2);p.r((72,6,75,9),22 if f%2 else 20,0)
        for x in range(29,67,6):p.r((x,70,x+2,71),9)
    elif key=='buffering-wheel':
        if anim!='die':
            p.d.ellipse((24,24,72,72),outline=C[9]);p.d.ellipse((28,28,68,68),outline=C[3])
            for k in range(12):
                a=k*math.pi/6+f*.1;x=48+round(math.cos(a)*24);y=48+round(math.sin(a)*24)
                p.r((x,y,x+1,y+1),22 if anim=='telegraph' else 12)
            p.p([(36,48),(48,41),(60,48),(48,55)],13);p.r((46,44,50,52),20 if anim!='stunned' else 3)
            p.r((47,45,48,46),6)
    elif key=='stock-photo-family':
        dy=[0,1,0,-1][f] if anim=='idle' else 0;p=Pen(im,0,dy)
        # Identical toothy grins, but deliberately different hair and clothes.
        for x,y in [(22,22),(70,19),(48,48)]:
            p.l([(x+3,y+1),(x+21,y+1)],12);p.l([(x+4,y+9),(x+8,y+9)],9);p.l([(x+16,y+9),(x+21,y+9)],9)
            p.r((x+5,y+13,x+7,y+14),6);p.r((x+17,y+13,x+19,y+14),6)
            for xx in (x+10,x+15):p.l([(xx,y+21),(xx,y+24)],13)
        p.p([(71,25),(73,21),(80,20),(86,22),(91,20),(96,24),(97,28),(91,25),(87,27),(81,24),(76,28)],10)
        for x in range(26,100,8):p.l([(x,101),(x+3,106),(x+6,101)],12)
        p.l([(28,112),(98,112)],9);p.r((57,88,70,95),13,9)
        p.l([(59,90),(68,90)],14);p.l([(91,95),(95,97),(102,96)],9)
    elif key=='the-algorithm':
        dx=-f*2 if anim=='attack-lunge' else 0;dy=f%2 if anim=='idle' else 0;p=Pen(im,dx,dy)
        for x,y in [(37,20),(42,39),(38,58)]:
            p.r((x+2,y+2,x+4,y+3),6);p.l([(x+7,y+2),(x+17,y+2)],37)
            p.l([(x+2,y+15),(x+5,y+15)],20);p.l([(x+19,y+15),(x+23,y+15)],35)
        for y in (27,41,55):p.l([(20,y),(30,y-3)],5)
        p.l([(72,36),(76,34),(83,36)],38);p.r((78,43,80,46),6)
        for x,y in [(27,70),(65,20),(62,76)]:p.r((x,y,x+2,y+2),0);p.r((x,y,x+1,y),5)
    elif key=='reply-all-drone':
        dy=[0,-1,0,1][f] if anim in ('idle','move') else 0;p=Pen(im,f%2 if anim=='move' else 0,dy)
        p.l([(7,10),(23,10)],14);p.r((7,19,10,20),9);p.r((21,19,24,20),9)
        p.r((15,7,16,7),6);p.l([(3,11),(5,11)],5);p.l([(26,11),(28,11)],5)
    elif key=='infinite-monkey':
        dy=[0,-1,0,1][f] if anim in ('idle','move') else 0;p=Pen(im,0,dy)
        p.l([(11,8),(14,6),(17,8)],12);p.r((12,10,12,12),11)
        p.l([(14,15),(16,14)],9);p.l([(20,14),(23,15)],9)
        p.r((15,12,15,12),6);p.r((21,12,21,12),6)
        p.l([(8,29),(26,29)],11);p.r((13,27,22,27),6)
    elif key=='stock-intern':
        dy=[0,-1,0,1][f] if anim in ('idle','move') else 0;p=Pen(im,0,dy)
        p.p([(15,22),(19,22),(22,29),(18,27),(16,31)],12)
        p.l([(28,22),(26,28),(29,26)],13)
        p.l([(16,7),(27,7)],12);p.l([(18,10),(21,10)],9);p.l([(26,10),(29,10)],9)
        p.r((21,17,22,18),13);p.r((25,17,25,18),13)
        p.r((15,31,19,32),9);p.r((16,31,18,31),13)
    elif key=='pop-up-ad':
        dy=[0,1,0,-1][f];p=Pen(im,0,dy)
        p.r((5,8,6,9),6);p.r((8,8,9,9),12);p.l([(8,24),(24,24)],11)
        p.l([(10,20),(19,20)],6)
    elif key=='corporate-memphis-blob':
        dy=[0,2,1,-1][f];p=Pen(im,0,dy)
        if anim!='split':p.l([(17,13),(19,12),(20,12)],37);p.l([(28,26),(27,30),(24,33)],24)
    elif key=='buffering-wheel-minion':
        if anim=='telegraph':p.star(8,8,20,2)
    elif '/npcs/' in key:
        # NPC names are passed as paths for the small material/wardrobe pass.
        dy=-1 if f==2 else 0;p=Pen(im,0,dy)
        if 'pixel-cat' in key:
            p.l([(8,26),(10,26),(11,29)],5);p.r((20,25,21,26),22)
        elif 'chacha' in key:
            p.l([(19,28),(19,35)],5);p.l([(34,26),(37,26)],22);p.r((18,16,19,16),31)
        else:
            p.l([(18,35),(21,35)],3);p.r((19,45,21,45),4)
            if 'simran' in key:p.l([(18,28),(20,29)],37)
            if 'karan' in key:p.r((32,28,35,28),14)
            if 'jaggu' in key:p.l([(27,38),(30,38)],5)
            if 'roxy' in key:p.star(42,10,6,1)
    return im

def main():
    from the_set import build_family
    build_family()
    for name in ('enemies.py','render_enemies.py','feed_entities.py','finale_entities.py','npcs.py'):
        runpy.run_path(str(ROOT/'tools/art'/name),run_name='__main__')
    path=A/'manifest.json';m=json.loads(path.read_text());review=[]
    for key,e in m['sprites'].items():
        if not any('/'+s+'/' in e['file'] for s in ('enemies','bosses','npcs')):continue
        if key.startswith('stock-intern-') or key=='corporate-memphis-blob-templatr':continue
        src=Image.open(A/e['file']).convert('RGBA');out=Image.new('RGBA',src.size);w=e['frameWidth'];h=e['frameHeight']
        for anim,meta in e['anims'].items():
            for f in range(meta['frames']):
                x=f*w;y=meta['row']*h;im=src.crop((x,y,x+w,y+h))
                if key=='beige-core':im=beige(anim,f)
                elif key=='chad-frictionless':im=chad(anim,f)
                else:im=detail(e['file'] if '/npcs/' in e['file'] else key,im,anim,f)
                out.paste(im,(x,y))
        out.save(A/e['file']);review.append((key,e,out))
    # Costumes inherit newly polished base pixels and keep identical metadata.
    runpy.run_path(str(ROOT/'tools/art/district_reskins.py'),run_name='__main__')
    contact=Image.new('RGBA',(768,len(review)*140),C[1]);d=ImageDraw.Draw(contact)
    for i,(key,e,sheet) in enumerate(review):
        d.text((2,i*140),key,fill=C[6]);w=e['frameWidth'];h=e['frameHeight']
        for j,(anim,meta) in enumerate(list(e['anims'].items())[:6]):
            f=min(2,meta['frames']-1);im=sheet.crop((f*w,meta['row']*h,(f+1)*w,(meta['row']+1)*h))
            contact.alpha_composite(im,(j*128,i*140+12))
    contact.save(ROOT/'tools/art/raw/entities-polish.png')
if __name__=='__main__':main()
