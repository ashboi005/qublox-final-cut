"""BEIGE enemy silhouettes with four-frame, 500ms anticipation."""
from crew import A,C
from PIL import Image,ImageDraw
import json

def frame(kind,size,anim,f):
    im=Image.new('RGBA',(size,size)); d=ImageDraw.Draw(im)
    ox=0; oy=[0,-1,0,1][f%4] if anim in ('idle','move') else 0
    def r(b,c,o=0):
        x,y,X,Y=b; d.rectangle((x+ox,y+oy,X+ox,Y+oy),fill=C[c],outline=C[o] if o is not None else None)
    def l(p,c,w=1): d.line([(x+ox,y+oy) for x,y in p],fill=C[c],width=w)
    def poly(p,c): d.polygon([(x+ox,y+oy) for x,y in p],fill=C[c],outline=C[0])
    if kind=='reply-all-mothership':
        ox=f*2 if anim=='attack-dive' else 0
        poly([(13,33),(26,22),(68,22),(82,33),(79,64),(66,75),(25,75),(12,62)],11)
        r((23,29,72,62),13); l([(23,30),(48,48),(72,30)],9,2); l([(24,61),(40,46)],12); l([(71,61),(55,46)],12)
        for x in (7,73):
            r((x,39,x+15,55),2); r((x+2,41,x+13,44),4)
            poly([(x+3,56),(x+12,56),(x+8,65+f%3)],38 if anim.startswith('attack') else 23)
        r((31,15,63,23),9); r((36,17,58,20),20 if anim=='telegraph' else 22)
        for x in (27,58):
            r((x,65,x+10,76),0); r((x+2,68,x+8,75),20 if anim.startswith('attack') else 10)
        # Nested envelope tabs evoke reply chains without tiny text.
        for n in range(3): r((27+n*13,34,35+n*13,39),6); l([(28+n*13,35),(31+n*13,37),(34+n*13,35)],9)
        if anim=='attack-spray':
            for x in (23,44,65): r((x,81+f,x+7,85+f),13); l([(x,81+f),(x+3,83+f),(x+7,81+f)],9)
    elif kind=='reply-all-drone':
        ox=f%2 if anim=='move' else 0
        r((5,10,26,22),12); r((7,11,24,20),13,None); l([(6,11),(16,17),(25,11)],9)
        for x in (1,25): r((x,8,x+5,15),2); l([(x,7),(x+5,7)],4); l([(x+2,16),(x+2,19+f%2)],22)
        r((13,7,18,9),20 if anim=='telegraph' else 29)
        if anim=='attack': poly([(21,22),(29,24+f),(23,28)],13)
    elif kind=='infinite-monkey':
        # Ears and curl tail remain visible behind the typewriter.
        l([(8,25),(3,24),(2,19),(5,17),(7,20)],0,4); l([(8,25),(3,24),(2,19),(5,17)],10,2)
        for x in (8,24): d.ellipse((x-3,7+oy,x+3,13+oy),fill=C[11],outline=C[0])
        r((10,7,24,20),10); r((13,10,24,18),13); r((15,12,16,13),0); r((21,12,22,13),0)
        l([(16,16),(21,16)],9); r((10,19,23,27),10)
        r((11,17,23,24),6); l([(14,19),(21,19)],10); l([(14,21),(19,21)],10)
        r((7,24,28,30),9); r((9,25,26,28),12)
        for x in range(10,26,3): r((x,26,x+1,26),0)
        for x,dy in [(9,f%2*3),(25,(1-f%2)*3)]: r((x-2,19-dy,x+2,23-dy),11)
        if anim=='attack': poly([(24,3+f),(28,2+f),(30,6+f),(27,9+f),(24,7+f)],6)
    else:
        # 48px stock intern: rigid grin and beige suit; shove extends both arms.
        r((15,29,21,44),9); r((26,29,32,44),9); r((12,44,21,47),0); r((26,44,36,47),0)
        poly([(14,21),(31,21),(35,34),(13,34)],11)
        poly([(20,22),(27,22),(25,33),(22,33)],14); l([(24,24),(24,30)],9,2)
        r((15,5,31,21),13); r((16,5,29,8),10); r((19,11,20,12),0); r((27,11,28,12),0)
        r((20,16,28,18),6); l([(20,19),(28,19)],9)
        reach=[0,3,7,4][f%4] if anim=='attack' else -2 if anim=='telegraph' else 0
        for y in (24,29): r((29,y,36+reach,y+3),11); r((35+reach,y,39+reach,y+3),13)
    if anim=='telegraph':
        x=size-5; y=3+f%2
        r((x,y,x+2,y+6),20); r((x,y+9,x+2,y+10),22)
    if anim=='hurt':
        l([(size-8,2),(size-4,6)],22); l([(size-4,2),(size-8,6)],22)
    if anim=='die':
        # Collapse height with nearest-neighbour and retain grounded debris.
        h=max(3,size-(f+1)*size//5); im=im.resize((size,h),Image.Resampling.NEAREST)
        out=Image.new('RGBA',(size,size)); out.paste(im,(0,size-h)); im=out
    return im
p=A/'manifest.json'; m=json.loads(p.read_text())
for kind,size in [('reply-all-drone',32),('infinite-monkey',32),('stock-intern',48),('reply-all-mothership',96)]:
    boss=kind.endswith('mothership')
    anims=['idle','telegraph','attack-spray','attack-dive','hurt','die'] if boss else ['idle','move','telegraph','attack','hurt','die']
    sheet=Image.new('RGBA',(size*4,size*len(anims))); entries={}
    for row,anim in enumerate(anims):
        entries[anim]=dict(row=row,frames=4,fps=8 if anim=='telegraph' else 10,loop=anim in ('idle','move'))
        if anim.startswith('attack'): entries[anim]['hitFrame']=2
        for f in range(4): sheet.paste(frame(kind,size,anim,f),(f*size,row*size))
    path=f"sprites/{'bosses' if boss else 'enemies'}/{kind}.png"; (A/path).parent.mkdir(parents=True,exist_ok=True); sheet.save(A/path)
    m['sprites'][kind]=dict(file=path,frameWidth=size,frameHeight=size,anims=entries)
p.write_text(json.dumps(m,indent=2)+'\n')
