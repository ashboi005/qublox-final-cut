"""Render Farm: absurd limbs, malicious browser chrome, occult buffering."""
from crew import A,C
from PIL import Image,ImageDraw
import math,json

def frame(kind,size,anim,f):
    im=Image.new('RGBA',(size,size)); d=ImageDraw.Draw(im)
    def line(p,c,w=1): d.line(p,fill=C[c],width=w)
    def box(b,c,o=0): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
    def poly(p,c): d.polygon(p,fill=C[c],outline=C[0])
    if 'wheel' in kind:
        mid=size//2; radius=size*.32
        angle=f*math.pi/4
        if anim=='telegraph': radius+=f*size*.025
        if anim=='stunned': angle=0
        if anim=='die': radius*=1-f*.22
        for k in range(8):
            a=k*math.pi/4+angle
            x=round(mid+math.cos(a)*radius); y=round(mid+math.sin(a)*radius)
            r=1 if size==16 else 6
            col=[6,5,4,3,2,9,11,13][k]
            if anim=='telegraph': col=20 if k%2 else 22
            d.ellipse((x-r,y-r,x+r,y+r),fill=C[col],outline=C[0])
            if size>16:
                line([(mid+round(math.cos(a)*18),mid+round(math.sin(a)*18)),(x,y)],9,2)
        if size>16:
            poly([(mid-12,mid),(mid,mid-7),(mid+12,mid),(mid,mid+7)],13)
            box((mid-2,mid-4,mid+2,mid+4),20 if anim!='stunned' else 3)
            if anim=='attack-lag-spike':
                for k in range(4):
                    a=k*math.pi/2+f*.3
                    pts=[(mid+round(math.cos(a+v)*r),mid+round(math.sin(a+v)*r)) for v,r in [(-.15,32),(0,45),(.15,32)]]
                    poly(pts,20)
            if anim=='attack-freeze-pulse':
                r=23+f*6; d.ellipse((mid-r,mid-r,mid+r,mid+r),outline=C[35],width=2)
            if anim=='stunned':
                for x,y in [(18,16),(72,13),(65,78)]: line([(x-3,y),(x+3,y)],22); line([(x,y-3),(x,y+3)],22)
        elif anim=='attack': line([(1,14),(14,14)],20)
    elif kind=='pop-up-ad':
        bob=[0,1,0,-1][f]
        box((3,6+bob,28,25+bob),13); box((4,7+bob,27,11+bob),9,None)
        x=23+(f%2 if anim=='telegraph' else 0)
        box((x-1,7+bob,x+4,11+bob),20,None); line([(x,8+bob),(x+2,10+bob)],6); line([(x+2,8+bob),(x,10+bob)],6)
        box((7,14+bob,23,16+bob),11,None); box((9,19+bob,22,22+bob),22,0)
        if anim=='attack': poly([(24,18),(30,17),(28,23),(26,21),(23,25),(21,23),(25,20)],6)
        if anim=='die': line([(5,6),(26,26)],0,3); line([(27,6),(5,25)],0,3)
    else:
        # A deliberately faceless purple bean with outsized rubber-hose limbs.
        bob=[0,2,1,-1][f]; arm=[(34,27),(36,26),(35,29),(33,28)][f]
        if anim=='telegraph': arm=[(29,19),(25,13),(21,9),(18,7)][f]
        if anim=='attack': arm=[(22,10),(37,18),(43,28),(36,32)][f]
        if anim=='split':
            for x in [17-f*3,27+f*3]: d.ellipse((x-7,29,x+7,43),fill=C[25],outline=C[0])
            line([(23,20),(20,25),(26,28)],22,2)
        else:
            for points in [[(18,31),(13-f%2*3,38),(8,44)],[(29,32),(34+f%2*3,37),(40,44)],[(15,21),(8,23),(6,16)],[(29,20),arm]]:
                line(points,0,6); line(points,24,4)
            d.ellipse((13,10+bob,31,36+bob),fill=C[25],outline=C[0]); d.ellipse((15,12+bob,22,23+bob),fill=C[26])
            x,y=arm; d.ellipse((x-4,y-3,x+4,y+3),fill=C[13],outline=C[0])
            if anim=='die': line([(19,12),(24,22),(20,29),(25,35)],0,2)
    if anim=='hurt':
        line([(size-7,2),(size-3,6)],22); line([(size-3,2),(size-7,6)],22)
    return im
p=A/'manifest.json'; m=json.loads(p.read_text())
for kind,size in [('corporate-memphis-blob',48),('pop-up-ad',32),('buffering-wheel-minion',16),('buffering-wheel',96)]:
    boss=kind=='buffering-wheel'
    anims=['idle','telegraph','attack-lag-spike','attack-freeze-pulse','hurt','stunned','die'] if boss else ['idle','move','telegraph','attack','hurt','die']+(['split'] if kind=='corporate-memphis-blob' else [])
    sheet=Image.new('RGBA',(size*4,size*len(anims))); entries={}
    for row,anim in enumerate(anims):
        entries[anim]=dict(row=row,frames=4,fps=6 if anim=='telegraph' else 10,loop=anim in ('idle','move','stunned'))
        if anim.startswith('attack'): entries[anim]['hitFrame']=2
        for f in range(4): sheet.paste(frame(kind,size,anim,f),(f*size,row*size))
    file=f"sprites/{'bosses' if boss else 'enemies'}/{kind}.png"; sheet.save(A/file)
    m['sprites'][kind]=dict(file=file,frameWidth=size,frameHeight=size,anims=entries)
p.write_text(json.dumps(m,indent=2)+'\n')
