from crew import A,C
from PIL import Image,ImageDraw
import json

def frame(name,w,h,anim,f):
    im=Image.new('RGBA',(w,h)); d=ImageDraw.Draw(im)
    def r(b,c,o=0): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
    def l(p,c,width=1): d.line(p,fill=C[c],width=width)
    def p(points,c): d.polygon(points,fill=C[c],outline=C[0])
    if name=='chai':
        p([(3,7),(11,7),(10,14),(5,14)],23); r((4,8,10,9),31,None); l([(12,8),(14,8),(14,11),(11,11)],23)
        l([(6,5),(5+f%2,3),(7,1)],6); l([(10,5),(10-f%2,2)],5)
    elif name=='checkpoint':
        col=22 if anim=='active' else 4
        r((2,11,13,23),1); r((3,13,12,15),col,None); l([(4,18),(11,18)],6); l([(4,21),(8,21)],4)
        if anim=='active' and f<2: p([(2,10),(11,3+f*2),(14,6+f*2),(4,12)],col)
        else: r((2,7,13,10),col)
        for x in (3,7,11): l([(x,8),(min(13,x+2),10)],0)
        r((6,24,9,29),2); r((3,30,12,31),0)
    elif name=='exit':
        r((1,0,30,47),0); r((2,1,29,46),3); r((5,6,26,45),0)
        gap=0 if anim=='idle' else [0,3,7,10][f]
        if 15-gap>=6: r((6,7,15-gap,44),2); l([(7,8),(7,43)],4)
        if 16+gap<=25: r((16+gap,7,25,44),2)
        r((11,2,21,4),29 if anim=='open' else 20,None); r((28,22,29,25),22,None); l([(4,46),(27,46)],6)
    elif name.startswith('color-block'):
        col={'red':20,'blue':18,'yellow':22}[name.split('-')[-1]]
        if name.endswith('blue'):
            # Ghostly through negative space, never semi-transparent sprite pixels.
            for x in range(1,15,3): r((x,1,x+1,2),col,None); r((x,13,x+1,14),col,None)
            for y in range(4,13,3): r((1,y,2,y+1),col,None); r((13,y,14,y+1),col,None)
            l([(5,8),(10,8)],col)
        else:
            r((0,0,15,15),col); l([(2,2),(13,2)],6); l([(13,3),(13,13)],21 if col==20 else 23)
            if col==22: l([(5,5),(10,5),(5,7),(10,9),(5,11),(10,11)],0)
            else: r((5,5,10,10),21)
    elif name=='pen-anchor':
        r((1,1,6,6),35 if f==0 else 6); r((3,3,4,4),0,None)
    elif name=='pen-line':
        r((0,0,15,3),0,None); r((0,1,15,2),35,None)
    elif name=='paint-glob':
        p([(2,1),(5,1),(6,3),(7,4+f),(5,6),(2,6),(0,4),(1,2)],26); r((2,2,3,2),6,None)
    return im
p=A/'manifest.json'; m=json.loads(p.read_text())
for name,w,h,anims in [('chai',16,16,[('idle',4)]),('checkpoint',16,32,[('idle',4),('active',4)]),('exit',32,48,[('idle',4),('open',4)]),('pen-anchor',8,8,[('idle',2)]),('paint-glob',8,8,[('idle',2)])]:
    im=Image.new('RGBA',(w*max(n for _,n in anims),h*len(anims)))
    for row,(anim,n) in enumerate(anims):
        for f in range(n): im.paste(frame(name,w,h,anim,f),(f*w,row*h))
    file=f'sprites/props/{name}.png'; im.save(A/file)
    m['sprites'][name]=dict(file=file,frameWidth=w,frameHeight=h,anims={a:dict(row=r,frames=n,fps=8,loop=a!='open') for r,(a,n) in enumerate(anims)})
for name,w,h in [('color-block-red',16,16),('color-block-blue',16,16),('color-block-yellow',16,16),('pen-line',16,4)]:
    file=f'sprites/props/{name}.png'; frame(name,w,h,'idle',0).save(A/file); m['images'][name]={'file':file}
p.write_text(json.dumps(m,indent=2)+'\n')
