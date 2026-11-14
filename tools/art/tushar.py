"""The Wandering Generalist. Pixel-native likeness; no reference pixels shipped."""
import json
from PIL import Image,ImageColor
from likeness import A,C,Pen,ANIMS,EMOTIONS,portrait as shared_portrait

def clap(p,x,y,open=False):
    p.r((x-5,y,x+6,y+7),0);p.l([(x-3,y+4),(x+4,y+4)],6)
    p.l([(x-3,y+6),(x+1,y+6)],4)
    if open:
        p.p([(x-5,y-1),(x+4,y-6),(x+6,y-3),(x-4,y+2)],6)
        for xx in range(x-3,x+4,3):p.l([(xx,y-2),(xx+1,y-4)],0)
    else:
        p.r((x-5,y-3,x+6,y),6,0)
        for xx in range(x-4,x+5,4):p.l([(xx,y-2),(xx+2,y)],0)

def camera(p,x,y):
    p.r((x-5,y-3,x+6,y+5),1,0);p.r((x-3,y-5,x+1,y-3),2,0)
    p.r((x-4,y-2,x-2,y),5);p.r((x,y-1,x+5,y+4),0)
    p.r((x+1,y,x+4,y+3),18);p.r((x+1,y,x+2,y+1),35)

def frame(who,anim,f):
    im=Image.new('RGBA',(48,48));dy=0;dx=0
    if anim=='idle':dy=[0,0,-1,0][f]
    if anim=='run':dy=[0,-1,-2,-1,0,-1,-2,-1][f]
    if anim in ('jump','fall'):dy=-2
    if anim=='hurt':dx=-2;dy=1
    if anim=='tagin':dy=[-5,-2,1,0][f]
    if anim=='ko':dy=[1,3,6,7][f]
    p=Pen(im,dx,dy)
    spread=[0,3,6,3,0,-3,-6,-3][f] if anim=='run' else 0
    if anim in ('jump','fall'):spread=3-f
    for x,s in [(19,-spread),(27,spread)]:
        bottom=46-dy if anim=='ko' and f>1 else 46
        p.p([(x-3,33),(x+3,33),(x+s+3,bottom),(x+s-3,bottom)],1)
        p.l([(x-1,36),(x+s-1,bottom-3)],2)
        p.r((x+s-3,bottom-2,x+s+4,bottom+1),0)
        p.l([(x+s-2,bottom),(x+s+3,bottom)],3)
    p.p([(16,24),(28,24),(32,28),(29,36),(16,36),(13,28)],1)
    p.p([(20,24),(24,28),(27,24),(25,31),(22,31)],31)
    p.l([(20,27),(23,30),(26,28)],5)
    p.p([(17,24),(21,25),(23,28),(19,27)],2)
    p.p([(27,24),(29,26),(25,29),(25,26)],2)
    p.l([(24,31),(24,35)],2)
    for yy in (32,35):p.r((24,yy,24,yy),4)
    # Lean face, small chin goatee and asymmetric swept-up hair.
    p.p([(17,12),(24,10),(29,13),(30,17),(32,19),(30,21),(28,25),(23,26),(18,23),(16,18)],32)
    p.p([(28,16),(30,17),(30,20),(29,23),(26,25),(23,24)],31,None)
    p.l([(23,24),(25,25),(28,24)],9)
    p.l([(25,21),(28,21)],9)
    p.l([(24,23),(28,23)],6)
    p.p([(15,20),(13,16),(14,11),(13,9),(17,8),(19,5),(23,6),(26,5),(29,8),(31,11),(30,15),(27,13),(25,10),(22,12),(18,13),(18,20)],0)
    p.l([(16,11),(20,8),(24,8),(27,7)],2)
    p.l([(17,13),(22,10),(26,10),(28,12)],1)
    for x in (19,26):
        p.r((x,16,x+5,20),12,23)
        p.r((x+1,17,x+3,19),6);p.r((x+3,18,x+4,19),0)
    p.l([(24,16),(26,16)],23);p.l([(24,18),(26,18)],23)
    p.l([(17,16),(19,17)],23)
    if anim=='idle' and f==3:p.l([(20,19),(23,19)],0);p.l([(27,19),(30,19)],0)
    # Rear hand: henna stays exposed beside the shirt, including the roll-up.
    by=30+spread//3
    p.p([(15,25),(18,27),(16,31),(12,30),(12,27)],1)
    p.l([(12,29),(16,30)],3,2)
    p.r((12,31,17,35),32,0)
    p.l([(13,32),(15,33),(13,34)],30);p.r((16,32,16,32),30)
    hx,hy=32,31
    if anim=='attack':hx,hy=[(26,28),(25,23),(38,27),(37,30),(32,31)][f]
    if anim=='ability':hx,hy=[(30,30),(32,22),(33,17),(35,26),(34,29),(32,31)][f]
    if anim=='tagin':hx,hy=[(29,26),(33,23),(35,26),(32,31)][f]
    if anim=='run':hx,hy=30-spread//2,29
    if anim=='panic':hx,hy=[(33,17),(35,22),(31,15),(36,19)][f]
    if anim=='wildcard':hx,hy=[(20,30),(28,29),(33,28),(33,27),(31,19),(32,27)][f]
    p.p([(28,25),(31,26),(hx+1,hy-2),(hx+1,hy+2),(hx-3,hy+3),(27,29)],1)
    p.l([(hx-4,hy),(hx-1,hy+2)],3,2)
    p.r((hx-2,hy-1,hx+2,hy+3),32,0)
    p.l([(hx-3,hy),(hx-3,hy+2)],5,2)
    p.r((hx-3,hy,hx-3,hy),7);p.r((hx+1,hy+1,hx+1,hy+1),5)
    if anim=='wildcard':
        if f==1:clap(p,hx,hy)
        elif f==2:
            p.r((27,19,42,28),0);p.r((28,20,41,27),2)
            p.l([(30,22),(32,24),(30,25)],35);p.l([(34,25),(38,25)],36)
            p.p([(27,29),(42,29),(45,32),(25,32)],4)
        elif f==3:camera(p,hx,hy)
        elif f>=4:
            p.p([(18,15),(24,15),(25,17),(27,15),(32,15),(31,21),(27,21),(25,18),(23,21),(19,20)],0)
            p.l([(20,17),(22,17)],6);p.l([(28,17),(30,17)],6)
            if f==5:p.star(39,16,22,2)
    elif anim=='tagin':
        camera(p,hx,hy)
        if f==1:p.star(42,18,6,3)
    elif anim not in ('ko','hurt','panic'):
        clap(p,hx,hy,anim=='ability' and f in (1,2))
    # Grip and jewellery sit in front of tools, never hidden beneath the clapper.
    p.r((hx-3,hy+1,hx-1,hy+3),32,0)
    p.l([(hx-4,hy+1),(hx-4,hy+3)],5)
    p.r((hx-4,hy+1,hx-4,hy+1),7)
    p.r((hx-2,hy+2,hx-2,hy+2),5)
    if anim=='idle' and f==2:p.star(hx-4,hy-2,6,1)
    if anim=='hurt':p.star(37,10,22)
    if anim=='panic':p.r((26,22,28,24),0);p.star(39,9,22,2)
    return im

GLYPHS={'F':['111','100','110','100','100'],'A':['010','101','111','101','101'],
        'B':['110','101','110','101','110'],'U':['101','101','101','101','111'],
        'L':['100','100','100','100','111'],'O':['111','101','101','101','111'],
        'S':['111','100','111','001','111']}

def portrait(who,emotion):
    # Share the cast's eight expression constructions, rebuild hair, outfit and glasses.
    src=shared_portrait('sayam',emotion);im=Image.new('RGBA',(64,64));p=Pen(im)
    p.p([(3,63),(6,53),(22,45),(41,45),(56,51),(63,63)],1)
    p.p([(24,45),(32,51),(40,45),(38,57),(29,58)],31)
    p.l([(25,49),(29,55),(34,56),(38,51)],5)
    p.r((30,55,31,55),7)
    p.p([(20,46),(27,48),(31,54),(24,52),(20,55),(16,50)],2)
    p.p([(42,46),(46,50),(37,55),(37,51)],2)
    p.l([(34,58),(34,63)],3)
    p.p([(16,18),(22,10),(37,9),(46,15),(49,24),(48,34),(43,42),(35,47),(25,43),(18,35)],32)
    face=src.crop((15,21,50,48))
    for yy in range(face.height):
        for xx in range(face.width):
            rgba=face.getpixel((xx,yy))
            if rgba[:3]==ImageColor.getrgb(C[9]):face.putpixel((xx,yy),(*ImageColor.getrgb(C[31]),rgba[3]))
            elif rgba[:3]==ImageColor.getrgb(C[10]):face.putpixel((xx,yy),(*ImageColor.getrgb(C[32]),rgba[3]))
    im.alpha_composite(face,(15,21))
    # Remove heavy stubble at the jaw, keep a small goatee and moustache.
    p.p([(21,38),(25,41),(31,44),(38,44),(44,40),(41,45),(34,49),(27,46),(22,42)],32,None)
    p.l([(28,44),(32,46),(38,45)],9)
    p.l([(30,35),(36,35),(39,36)],9)
    if emotion=='happy':
        p.p([(26,37),(42,36),(40,42),(34,45),(28,42)],0)
        p.r((29,38,40,40),6);p.l([(33,43),(37,43)],37)
    elif emotion=='smug':p.l([(30,40),(37,40),(41,37)],9)
    elif emotion in ('neutral','deadpan'):p.l([(30,39),(38,39),(40,37)],9);p.l([(31,39),(37,39)],6)
    elif emotion=='sad':p.l([(30,41),(34,38),(39,39)],9)
    p.p([(14,31),(11,24),(12,16),(11,12),(16,9),(18,5),(24,6),(29,2),(34,4),(39,3),(44,7),(49,12),(50,18),(47,24),(44,20),(40,13),(35,14),(30,18),(23,18),(19,24),(18,31)],0)
    p.l([(15,17),(20,12),(27,10),(32,7),(38,7),(43,10)],2,2)
    p.l([(16,21),(22,16),(29,14),(34,11),(40,11),(45,16)],1,2)
    # Clear the old rectangular outer rims, then draw round-cornered double-bridge aviators.
    p.l([(21,24),(33,24),(34,26),(33,33),(24,34),(21,31),(21,24)],23)
    p.l([(36,24),(48,24),(49,26),(48,33),(39,34),(36,31),(36,24)],23)
    p.l([(33,25),(36,25)],23);p.l([(33,28),(36,28)],23)
    p.l([(17,25),(21,26)],23)
    if emotion=='angry':p.l([(24,22),(32,25)],0,2);p.l([(38,25),(46,22)],0,2)
    if emotion=='smug':
        p.p([(13,23),(30,23),(33,26),(36,23),(55,23),(53,33),(37,34),(33,29),(29,34),(15,33)],0)
        p.l([(15,23),(28,23)],3);p.l([(39,23),(53,23)],3)
        for word,start in [('FABU',15),('LOUS',38)]:
            for i,ch in enumerate(word):
                for yy,row in enumerate(GLYPHS[ch]):
                    for xx,v in enumerate(row):
                        if v=='1':p.r((start+i*4+xx,26+yy,start+i*4+xx,26+yy),6)
    # Hands frame the bust so the defining accessories also appear in dialogue.
    p.p([(5,63),(5,55),(8,52),(12,54),(15,61),(15,63)],32)
    p.l([(7,56),(10,58),(7,60),(11,62)],30)
    p.r((11,55,12,56),30)
    p.p([(50,63),(50,57),(53,53),(57,54),(60,59),(60,63)],32)
    p.l([(51,61),(58,61)],5,2);p.r((52,60,53,60),7)
    p.r((55,56,56,57),5);p.star(59,57,6,1)
    return im

def build(who='tushar'):
    anims=ANIMS+[('panic',4,12,True),('wildcard',6,9,False)]
    sheet=Image.new('RGBA',(384,len(anims)*48));entries={}
    for row,(anim,n,fps,loop) in enumerate(anims):
        entries[anim]=dict(row=row,frames=n,fps=fps,loop=loop)
        if anim=='attack':entries[anim]['hitFrame']=2
        for f in range(n):sheet.paste(frame(who,anim,f),(f*48,row*48))
    file='sprites/characters/tushar.png';sheet.save(A/file)
    return dict(file=file,frameWidth=48,frameHeight=48,anims=entries)

if __name__=='__main__':
    path=A/'manifest.json';m=json.loads(path.read_text());m['sprites']['tushar']=build()
    sheet=Image.new('RGBA',(512,64))
    for i,e in enumerate(EMOTIONS):sheet.paste(portrait('tushar',e),(i*64,0))
    sheet.save(A/'portraits/tushar.png');m['portraits']['tushar']=dict(file='portraits/tushar.png',size=64,emotions=EMOTIONS)
    path.write_text(json.dumps(m,indent=2)+'\n')
