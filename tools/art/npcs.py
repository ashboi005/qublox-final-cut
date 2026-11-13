from crew import A,C
from PIL import Image,ImageDraw
import json

def frame(who,size,anim,f):
    im=Image.new('RGBA',(size,size)); d=ImageDraw.Draw(im)
    dy=[0,0,-1,0][f]
    def r(b,c,o=0):
        x,y,X,Y=b; d.rectangle((x,y+dy,X,Y+dy),fill=C[c],outline=C[o] if o is not None else None)
    def l(p,c,w=1): d.line([(x,y+dy) for x,y in p],fill=C[c],width=w)
    def p(points,c): d.polygon([(x,y+dy) for x,y in points],fill=C[c],outline=C[0])
    if who=='pixel-cat':
        l([(8,26),(3,25),(2,19),(5,17)],0,4); l([(8,26),(3,25),(2,19),(5,17)],31,2)
        p([(7,30),(8,20),(12,17),(10,6),(17,11),(23,10),(29,5),(28,21),(29,30)],6)
        p([(11,8),(16,12),(12,16)],31); p([(24,12),(28,8),(27,16)],1)
        r((12,17,16,19),22); r((23,16,27,18),22)
        if f==3: l([(12,18),(16,18)],0); l([(23,17),(27,17)],0)
        else: r((15,17,15,19),0,None); r((25,16,25,18),0,None)
        r((19,20,21,21),26,None); l([(20,22),(18,23)],0)
        if anim=='talk' and f%2: r((19,22,22,24),0)
        l([(11,21),(5,20)],0); l([(24,22),(30,21)],0)
        r((13,27,16,30),6); r((24,27,27,30),6); r((13,24,26,25),20,None)
    else:
        r((17,34,22,45),9); r((26,34,31,45),9); r((14,45,22,47),0); r((26,45,34,47),0)
        p([(15,24),(28,23),(34,32),(30,37),(15,37),(12,30)],13 if who=='chacha-chai' else 18)
        p([(17,10),(25,8),(30,12),(30,18),(32,19),(29,24),(20,24),(16,19)],32)
        r((25,15,29,17),6); r((28,15,29,17),0,None)
        if who=='chacha-chai':
            p([(15,12),(16,7),(20,5),(27,6),(30,10),(30,12)],6)
            l([(18,8),(27,8)],5)
            p([(24,19),(27,18),(31,20),(28,22),(25,21)],5)
            r((18,27,27,37),6); l([(22,27),(22,37)],5)
            r((28,29,35,33),32); r((33,25,39,31),23); l([(40,26),(42,26),(42,29),(40,29)],23)
            l([(35,23),(34+f%2,20),(36,17)],5)
        else:
            p([(15,17),(14,11),(18,7),(26,6),(30,11),(25,12),(22,10),(18,15)],1)
            l([(25,19),(29,19)],9)
            r((29,29,33,34),32); l([(31,33),(36,38),(39,35)],35); r((36,33,42,39),1); r((37,34,40,36),4)
            l([(17,25),(20,31),(27,31),(29,25)],35); r((20,30,25,35),6)
        if anim=='talk': r((26,21,29,22+(f%2)),0,None)
        else: l([(26,22),(29,22)],0)
    return im
p=A/'manifest.json'; m=json.loads(p.read_text()); (A/'sprites/npcs').mkdir(exist_ok=True)
for who,size in [('chacha-chai',48),('intern-bunty',48),('pixel-cat',32)]:
    im=Image.new('RGBA',(size*4,size*2))
    for row,anim in enumerate(['idle','talk']):
        for f in range(4): im.paste(frame(who,size,anim,f),(f*size,row*size))
    file=f'sprites/npcs/{who}.png'; im.save(A/file)
    m['sprites'][who]=dict(file=file,frameWidth=size,frameHeight=size,anims={a:dict(row=r,frames=4,fps=6,loop=True) for r,a in enumerate(['idle','talk'])})
p.write_text(json.dumps(m,indent=2)+'\n')
