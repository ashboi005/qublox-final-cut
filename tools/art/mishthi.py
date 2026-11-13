"""Mishthi: dramatic prop artist, photo-informed native pixels."""
import json
from PIL import Image
from likeness import A,Pen,ANIMS,EMOTIONS,frame as base_frame,portrait as base_portrait

def prop():
    im=Image.new('RGBA',(16,16));p=Pen(im)
    p.p([(5,1),(10,1),(10,4),(13,7),(14,11),(11,15),(4,15),(1,11),(2,7),(5,4)],25)
    p.l([(5,2),(10,2)],22);p.l([(4,7),(3,10),(5,12)],6)
    p.l([(4,13),(11,13)],22);p.p([(7,7),(10,9),(7,11),(5,9)],37,None)
    return im

def frame(who,anim,f):
    source='idle' if anim=='indifferent' else anim
    im=base_frame('manvi',source,f%4 if source=='idle' else f)
    dy=[0,0,-1,0][f%4] if source=='idle' else 0
    if anim=='run':dy=[0,-1,-2,-1,0,-1,-2,-1][f]
    if anim in ('jump','fall'):dy=-2
    if anim=='tagin':dy=[-5,-2,1,0][f]
    if anim=='hurt':dy=1
    if anim=='ko':dy=[1,3,6,7][f]
    p=Pen(im,-2 if anim=='hurt' else 0,dy)
    p.p([(15,24),(28,24),(32,28),(30,36),(15,36),(12,28)],6)
    p.p([(16,29),(21,30),(25,29),(29,28),(30,35),(16,36)],30)
    p.l([(18,31),(19,34)],31)
    p.l([(23,30),(26,32),(23,33),(26,35)],22)
    p.p([(19,24),(23,27),(20,29),(17,25)],14)
    p.p([(25,24),(23,27),(26,28),(29,25)],14)
    # Hair waves over the blouse; swept part rather than Manvi's centre part.
    sway=[0,1,4,2,0,0][f] if anim=='indifferent' else f%2
    p.p([(15,12),(17,9),(23,7),(28,9),(27,11),(22,11),(18,15),(17,21),(19,26),(16+sway,31),(12+sway,32),(13,27),(11,23),(13,18)],8)
    p.l([(22,9),(17,12),(15,18),(14,23),(16,27),(15+sway,30)],9)
    p.p([(29,13),(31,18),(30,22),(33+sway,27),(31+sway,32),(28+sway,30),(29,26),(27,22)],8)
    p.l([(30,23),(31+sway,27),(29+sway,30)],30)
    p.l([(24,17),(28,17),(29,16)],0)
    p.l([(26,22),(29,22)],21)
    p.r((18,20,19,23),22);p.r((18,20,18,21),6)
    hx,hy=32,31
    if anim=='attack':hx,hy=[(28,34),(25,35),(38,28),(36,24),(32,31)][f]
    if anim=='ability':hx,hy=[(29,30),(32,26),(34,22),(35,23),(34,27),(32,31)][f]
    if anim=='run':hx,hy=30-[0,3,6,3,0,-3,-6,-3][f]//2,29
    # Cover the old mic/casting arm region, retaining only our own held props.
    from PIL import ImageDraw
    d=ImageDraw.Draw(im);d.rectangle((33,0,47,47),fill=(0,0,0,0))
    if anim=='indifferent' and f>=3:
        head=im.crop((11,7+dy,33,25+dy)).transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        im.paste(head,(11,7+dy))
        p.l([(15,29),(27,33),(31,29)],0,5)
        p.l([(15,29),(27,33),(31,29)],6,3)
        p.l([(29,29),(19,33)],32,3)
    else:
        if anim=='indifferent':hx,hy=[(29,25),(30,18),(34,16)][f]
        p.p([(28,25),(31,25),(hx+2,hy-2),(hx+2,hy+2),(hx-3,hy+3),(27,29)],6)
        p.l([(29,27),(hx-2,hy+1)],13)
        p.r((hx-2,hy-1,hx+2,hy+2),32,0)
        p.l([(hx-3,hy),(hx-3,hy+2)],22,2)
        if anim=='attack' and f<3:
            small=prop().resize((8,8),Image.Resampling.NEAREST);im.alpha_composite(small,(hx-3,hy-6+dy))
        if anim=='ability' and f in (1,2,3,4):
            p.r((34,8,45,20),22,0);p.r((36,10,43,18),0)
            p.l([(37,15),(39,12),(42,16)],37)
    return im

def portrait(who,emotion):
    im=base_portrait('manvi',emotion);p=Pen(im)
    p.p([(3,63),(5,53),(18,46),(25,46),(34,52),(41,46),(54,49),(61,56),(63,63)],6)
    p.p([(18,55),(28,58),(38,56),(47,53),(51,63),(17,63)],30)
    p.l([(34,57),(40,59),(34,61),(40,63)],22)
    p.l([(7,54),(8,61)],13);p.l([(56,53),(59,62)],13)
    p.p([(24,46),(31,51),(27,55),(21,49)],14)
    p.p([(39,46),(33,51),(37,55),(44,49)],14)
    p.p([(12,22),(11,14),(16,7),(25,3),(35,4),(40,8),(34,9),(29,12),(22,17),(19,24),(19,35),(23,42),(20,49),(22,55),(17,59),(10,56),(12,49),(8,43),(11,36)],8)
    p.l([(30,6),(21,10),(16,17),(15,27),(13,36),(17,43),(15,49),(18,54)],9,2)
    p.l([(15,44),(13,49),(16,54)],30)
    p.p([(45,17),(50,23),(49,34),(53,41),(51,48),(55,54),(51,59),(46,56),(47,49),(44,44),(46,36)],8)
    p.l([(48,27),(47,35),(50,42),(48,49),(51,55)],9)
    p.l([(49,47),(50,53),(48,56)],30)
    p.l([(24,26),(31,26),(33,24)],0)
    p.l([(39,26),(45,26),(48,23)],0)
    p.p([(18,31),(21,33),(21,38),(18,40),(16,37),(16,33)],22)
    p.l([(18,33),(18,36)],6)
    if emotion in ('neutral','deadpan','smug'):
        p.l([(30,39),(35,40),(40,38)],21,2)
    if emotion=='smug':
        p.r((25,27,31,29),6);p.r((25,27,26,29),0)
        p.r((39,27,45,29),6);p.r((39,27,40,29),0)
        p.l([(24,26),(32,27)],0);p.l([(38,26),(46,27)],0)
    if emotion=='sad':
        p.l([(24,24),(31,20)],0,2);p.l([(38,20),(46,24)],0,2)
        p.p([(29,40),(34,36),(39,40),(38,44),(31,44)],21)
        p.l([(32,39),(36,39)],0)
    return im

def build(who='mishthi'):
    anims=ANIMS+[('indifferent',6,10,False)];sheet=Image.new('RGBA',(384,480));entries={}
    for row,(anim,n,fps,loop) in enumerate(anims):
        entries[anim]=dict(row=row,frames=n,fps=fps,loop=loop)
        if anim=='attack':entries[anim]['hitFrame']=2
        for f in range(n):sheet.paste(frame(who,anim,f),(f*48,row*48))
    file='sprites/characters/mishthi.png';sheet.save(A/file)
    return dict(file=file,frameWidth=48,frameHeight=48,anims=entries)

if __name__=='__main__':
    path=A/'manifest.json';m=json.loads(path.read_text());m['sprites']['mishthi']=build()
    sheet=Image.new('RGBA',(512,64))
    for i,e in enumerate(EMOTIONS):sheet.paste(portrait('mishthi',e),(i*64,0))
    sheet.save(A/'portraits/mishthi.png');m['portraits']['mishthi']=dict(file='portraits/mishthi.png',size=64,emotions=EMOTIONS)
    prop().save(A/'sprites/props/prop.png');m['images']['prop']={'file':'sprites/props/prop.png'}
    edge=Image.new('RGBA',(16,4));p=Pen(edge);p.r((0,0,15,3),23,0);p.l([(1,1),(14,1)],22);p.l([(2,1),(6,1)],6)
    edge.save(A/'sprites/props/art-frame.png');m['images']['art-frame']={'file':'sprites/props/art-frame.png'}
    path.write_text(json.dumps(m,indent=2)+'\n')
