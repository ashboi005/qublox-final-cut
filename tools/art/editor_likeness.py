"""Mansukh and Brahmansh: native-pixel likenesses with intact dastars."""
import json
from PIL import Image, ImageColor
from likeness import A,C,Pen,ANIMS,EMOTIONS,frame as shared_frame,portrait as shared_portrait

def recolor(im,mapping):
    colors={ImageColor.getrgb(C[a]):ImageColor.getrgb(C[b]) for a,b in mapping.items()}
    out=im.copy(); px=out.load()
    for y in range(out.height):
        for x in range(out.width):
            r,g,b,a=px[x,y]
            if a and (r,g,b) in colors: px[x,y]=(*colors[(r,g,b)],a)
    return out

def lightstick():
    im=Image.new('RGBA',(16,16));p=Pen(im)
    p.r((7,8,9,14),0);p.l([(8,10),(8,13)],3)
    p.l([(10,12),(13,14),(12,15),(9,15)],20)
    p.p([(3,5),(5,2),(10,2),(13,5),(12,8),(9,10),(6,9),(3,7)],6)
    p.p([(3,5),(1,2),(2,0),(5,3)],20)
    p.p([(11,3),(14,0),(14,3),(12,5)],20)
    p.l([(5,4),(7,3),(10,4)],7)
    p.p([(6,5),(7,4),(8,5),(9,4),(10,5),(8,7)],20,None)
    return im

def frame(who,anim,f):
    mans=who=='mansukh'
    dy=[0,0,-1,0][f%4] if anim=='idle' else 0
    if anim=='run':dy=[0,-1,-2,-1,0,-1,-2,-1][f]
    if anim in ('jump','fall'):dy=-2
    if anim=='tagin':dy=[-5,-2,1,0][f]
    if anim=='hurt':dy=1
    if anim=='ko':dy=[1,3,6,7][f]
    dx=-2 if anim=='hurt' else 0
    if anim=='unhinged':dx=[0,-3,3,-2,2,0][f];dy=[0,-2,1,-1,-2,0][f]
    im=Image.new('RGBA',(48,48));p=Pen(im,dx,dy)
    spread=[0,3,6,3,0,-3,-6,-3][f] if anim=='run' else 0
    if anim in ('jump','fall'):spread=3-f
    if anim=='unhinged':spread=[0,3,-3,4,-4,0][f]
    for x,s in [(19,-spread),(27,spread)]:
        bottom=46-dy if anim=='ko' and f>1 else 46
        p.p([(x-3,33),(x+3,33),(x+s+3,bottom),(x+s-4,bottom)],19 if mans else 1)
        p.l([(x-2,36),(x+s-2,bottom-3)],18 if mans else 2)
        p.r((x+s-4,bottom-2,x+s+4,bottom+1),0)
        p.l([(x+s-3,bottom),(x+s+3,bottom)],6 if mans else 3)
    main,shade=(14,12) if mans else (1,0)
    p.p([(15,24),(28,24),(32,28),(30,36),(15,36),(12,28)],main)
    p.p([(27,27),(31,28),(29,35),(26,35)],shade,None)
    if mans:
        p.p([(19,25),(23,29),(20,31),(17,26)],6)
        p.p([(25,25),(23,29),(26,30),(29,26)],6)
        p.l([(20,26),(22,28),(25,27)],22)
        p.l([(23,30),(23,35)],12)
        for x,y in [(17,31),(19,33),(26,32),(28,30)]:p.l([(x,y),(x,y+1)],13)
    else:
        p.l([(18,25),(22,28),(25,28),(28,25)],6)
        p.l([(24,28),(24,32)],5)
        p.r((26,29,28,30),20)
    # Head shape is shared cast construction; the photo-specific wrapping and facial hair follow.
    head=shared_frame('sehaj','idle',0).crop((12,5,33,28))
    head=recolor(head,{40:20,41:21,12:38} if mans else {40:2,41:1,12:3})
    for yy in range(18,23):
        for xx in range(21):
            if xx<5 or xx>18:head.putpixel((xx,yy),(0,0,0,0))
    im.alpha_composite(head,(12+dx,5+dy))
    if mans:
        # Around-neck cans leave the red folds uninterrupted; STAN lifts them to the ears.
        hy=22 if anim=='stan' and f>=1 else 27
        p.l([(14,hy),(17,hy+3),(26,hy+3),(29,hy)],0,2)
        p.r((12,hy-2,16,hy+3),1,0);p.r((13,hy-1,14,hy+1),3)
        p.r((28,hy-2,31,hy+3),1,0);p.r((29,hy-1,30,hy+1),3)
    else:
        # Curled handlebar is a strong lateral silhouette at 48px.
        p.l([(19,20),(18,22),(21,23),(24,21),(27,23),(31,22),(32,19)],0,2)
        p.l([(18,20),(18,22),(21,23),(24,21),(27,23),(31,22),(32,19)],3)
        if anim=='unhinged':
            for yy in (18,26,34):p.l([(2+f%2,yy),(8+f%2,yy)],20)
    hx,hy=32,31
    if anim=='attack':hx,hy=[(26,28),(24,24),(38,27),(36,29),(32,31)][f]
    if anim=='ability':hx,hy=[(29,29),(30,25),(32,22),(34,24),(34,27),(32,31)][f]
    if anim=='run':hx,hy=30-spread//2,29
    if anim=='stan':hx,hy=[(29,27),(30,21),(34,19),(36,17),(35,16),(34,19)][f]
    if anim=='unhinged':hx,hy=[(34,27),(37,18),(35,31),(38,21),(35,17),(32,29)][f]
    p.p([(14,26),(17,27),(15,32),(12,32),(11,29)],main)
    p.r((12,31,16,34),32,0)
    p.p([(28,25),(31,26),(hx+1,hy-2),(hx+2,hy+2),(hx-3,hy+3),(27,29)],main)
    p.r((hx-2,hy-1,hx+2,hy+2),32,0)
    if not mans:p.l([(hx-3,hy),(hx-3,hy+2)],5,2)
    if mans and anim=='stan':
        im.alpha_composite(lightstick(),(hx-7+dx,hy-14+dy))
        if f>1:p.star(43,9+f%2,20,2);p.star(36,2,6,1)
    elif mans:
        p.l([(hx-3,hy+6),(min(45,hx+6),hy-9)],0,3)
        p.l([(hx-2,hy+5),(min(44,hx+5),hy-8)],22)
        p.r((hx-3,hy+5,hx-2,hy+6),37)
        if anim=='ability':
            p.l([(30,14),(36,10),(43,14)],35)
            for x,y in [(30,14),(36,10),(43,14)]:p.r((x-1,y-1,x+1,y+1),6,0)
    else:
        if anim!='unhinged':
            p.p([(hx,hy),(min(44,hx+8),hy-7),(min(43,hx+6),hy),(hx+2,hy+2)],6)
        else:
            by=[26,17,28,19,16,29][f]
            p.l([(14,28),(9,by),(8,by-4)],0,5)
            p.l([(14,28),(9,by),(8,by-4)],32,3)
        if anim=='ability':
            for yy in (16,23,30):p.l([(3+f,yy),(10+f,yy)],20)
    if anim=='hurt':p.star(38,9,22)
    return im

def portrait(who,emotion):
    mans=who=='mansukh'
    im=shared_portrait('sehaj',emotion)
    # Recolour only the head; clothing below is freshly drawn, not recoloured varsity.
    head=im.crop((0,0,64,49));head=recolor(head,{40:20,41:21,12:38} if mans else {40:2,41:1,12:3})
    for yy in range(44,49):
        for xx in range(64):
            if xx<23 or xx>42:head.putpixel((xx,yy),(0,0,0,0))
    im=Image.new('RGBA',(64,64));p=Pen(im)
    p.p([(3,63),(5,53),(19,46),(42,46),(55,50),(62,58),(63,63)],14 if mans else 1)
    if mans:
        p.p([(20,47),(31,54),(25,58),(17,49)],6)
        p.p([(41,47),(32,54),(38,58),(46,50)],6)
        p.l([(25,49),(31,53),(37,50)],22)
        p.l([(32,55),(32,63)],12)
        for x in range(9,60,5):p.l([(x,58),(x,61)],13)
    else:
        p.l([(19,48),(27,54),(34,55),(43,48)],6)
        p.l([(33,55),(33,62)],5)
        p.r((45,56,49,59),20)
    im.alpha_composite(head)
    if mans:
        p.l([(15,44),(20,52),(41,52),(47,44)],0,3)
        p.r((11,42,19,51),1,0);p.r((12,44,14,48),3)
        p.r((44,42,51,51),1,0);p.r((48,44,50,48),3)
        if emotion=='smug':
            p.l([(24,22),(31,20)],0,2)
            p.l([(38,23),(45,25)],0,2)
            p.l([(30,39),(36,39),(41,35)],32)
    else:
        p.l([(23,33),(21,36),(24,39),(29,38),(34,35),(39,38),(44,37),(48,33),(47,31)],0,3)
        p.l([(20,33),(20,36),(24,39),(29,38),(34,35),(39,38),(45,37),(49,33),(48,30)],3)
        if emotion=='angry':
            p.l([(24,21),(32,25)],0,3);p.l([(38,25),(46,21)],0,3)
        if emotion=='smug':p.l([(30,41),(37,41),(41,39)],32)
    return im

def build(who):
    anims=ANIMS+[('stan' if who=='mansukh' else 'unhinged',6,12,False)]
    sheet=Image.new('RGBA',(384,len(anims)*48));entries={}
    for row,(anim,n,fps,loop) in enumerate(anims):
        entries[anim]=dict(row=row,frames=n,fps=fps,loop=loop)
        if anim=='attack':entries[anim]['hitFrame']=2
        for f in range(n):sheet.paste(frame(who,anim,f),(f*48,row*48))
    file=f'sprites/characters/{who}.png';sheet.save(A/file)
    return dict(file=file,frameWidth=48,frameHeight=48,anims=entries)

def build_all():
    path=A/'manifest.json';m=json.loads(path.read_text())
    for who in ('mansukh','brahmansh'):
        m['sprites'][who]=build(who);sheet=Image.new('RGBA',(512,64))
        for i,e in enumerate(EMOTIONS):sheet.paste(portrait(who,e),(i*64,0))
        file=f'portraits/{who}.png';sheet.save(A/file)
        m['portraits'][who]=dict(file=file,size=64,emotions=EMOTIONS)
    lightstick().save(A/'sprites/props/lightstick.png')
    m['images']['lightstick']={'file':'sprites/props/lightstick.png'}
    path.write_text(json.dumps(m,indent=2)+'\n')

if __name__=='__main__':build_all()
