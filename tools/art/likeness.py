"""Photo-informed crew art, drawn at 1x. Private references are never embedded.

Canonical generator for photo-informed crew; crew.py delegates these IDs here.
"""
import json
import sys
from PIL import Image, ImageDraw
from palette import ROOT, COLORS

A = ROOT / 'apps/game/public/assets'
C = ['#' + value for value in COLORS]
EMOTIONS = ['neutral', 'smug', 'panic', 'angry', 'deadpan', 'happy', 'sad', 'shocked']
ANIMS = [('idle',4,6,True),('run',8,12,True),('jump',2,8,False),
         ('fall',2,6,True),('attack',5,14,False),('ability',6,10,False),
         ('hurt',2,9,False),('ko',4,8,False),('tagin',4,12,False)]

class Pen:
    def __init__(self, im, dx=0, dy=0):
        self.d = ImageDraw.Draw(im)
        self.dx, self.dy = dx, dy
    def p(self, points, color, outline=0):
        self.d.polygon([(x+self.dx,y+self.dy) for x,y in points], fill=C[color],
                       outline=C[outline] if outline is not None else None)
    def r(self, box, color, outline=None):
        x,y,X,Y=box
        self.d.rectangle((x+self.dx,y+self.dy,X+self.dx,Y+self.dy), fill=C[color],
                         outline=C[outline] if outline is not None else None)
    def l(self, points, color, width=1):
        self.d.line([(x+self.dx,y+self.dy) for x,y in points], fill=C[color], width=width)
    def star(self, x, y, color=37, size=2):
        self.l([(x-size,y),(x+size,y)],color)
        self.l([(x,y-size),(x,y+size)],color)
        self.r((x,y,x,y),6)

def heart(p,x,y,size=1):
    pts=[(0,2),(2,0),(4,0),(6,2),(8,0),(10,0),(12,2),(12,5),(6,11),(0,5)]
    p.p([(x+a*size,y+b*size) for a,b in pts],37)
    p.l([(x+2*size,y+2*size),(x+4*size,y+2*size)],6,size)

def frame(who, anim, f):
    im=Image.new('RGBA',(48,48))
    dy=[0,0,-1,0][f%4] if anim=='idle' else 0
    if anim=='run': dy=[0,-1,-2,-1,0,-1,-2,-1][f]
    if anim in ('jump','fall'): dy=-2
    if anim=='tagin': dy=[-5,-2,1,0][f]
    if anim=='hurt': dy=1
    # The KO is a seated slump: no rotated/clipped headwear or face.
    if anim=='ko': dy=[1,3,6,7][f]
    p=Pen(im,-2 if anim=='hurt' else 0,dy)
    spread=[0,3,6,3,0,-3,-6,-3][f] if anim=='run' else 0
    if anim in ('jump','fall'): spread=4-f
    for x,s in [(19,-spread),(27,spread)]:
        if anim=='ko' and f>1:
            p.p([(x-3,33),(x+3,33),(x+7,37),(x+7,40-dy),(x-5,40-dy)],1)
            p.r((x-5,40-dy,x+8,46-dy),0)
            p.l([(x-3,43-dy),(x+7,43-dy)],3)
        else:
            width=4 if who in ('manvi','sayam') else 3
            p.p([(x-3,33),(x+3,33),(x+s+width,44),(x+s+2,46),(x+s-width,46)],1)
            p.l([(x-2,36),(x+s-2,42)],2)
            p.r((x+s-width,44,x+s+4,47),0)
            p.l([(x+s-width+1,45),(x+s+3,45)],3)
            if who=='sayam':
                p.r((x+s-width+1,45,x+s+3,46),6)
                p.r((x+s,44,x+s+2,44),42)
    main,shade={'manvi':(1,0),'sehaj':(40,41),'ashwath':(14,12),'sayam':(1,0)}[who]
    wide=2 if who=='sehaj' else 0
    p.p([(15-wide,23),(28+wide,23),(33+wide,28),(31,36),(15,36),(12-wide,28)],main)
    p.p([(26,25),(31,26),(31,35),(26,35)],shade,None)
    if who=='manvi':
        p.p([(21,24),(26,24),(28,35),(21,35)],21,None)
        p.l([(22,26),(25,26),(26,32)],37)
        p.p([(18,23),(21,25),(19,29),(22,33),(19,35),(15,28)],2)
        p.p([(28,23),(25,26),(27,29),(26,34),(30,32)],2)
        p.l([(17,25),(18,26)],4); p.l([(28,29),(27,33)],4)
    elif who=='sehaj':
        p.p([(21,23),(26,23),(27,35),(21,35)],6,None)
        p.l([(19,26),(19,34)],12); p.l([(28,25),(28,34)],12)
        p.l([(15,35),(29,35)],6)
        for y in (27,31): p.r((20,y,20,y),6)
        p.r((29,27,30,29),41)
    elif who=='sayam':
        p.p([(20,24),(27,24),(29,35),(19,35)],6)
        for x,y in [(21,26),(24,27),(26,30),(21,32),(24,34)]:
            p.l([(x,y),(x+1,y),(x+1,y+1)],0)
        p.p([(17,23),(21,24),(19,28),(21,31),(18,35),(14,29)],2)
        p.p([(28,24),(31,27),(30,34),(27,35),(28,29),(25,27)],2)
        p.l([(18,29),(19,33)],42,2); p.l([(28,30),(28,34)],42)
        p.r((17,25,18,25),5); p.l([(29,26),(30,28)],4)
    else:
        p.l([(19,25),(22,27),(26,27),(28,25)],12)
        # Tiny red spider print, no text at sprite scale.
        p.r((22,29,24,32),20)
        for y in (28,31):
            p.l([(19,y),(22,y+1),(24,y+1),(27,y)],20)
        p.l([(20,34),(26,34)],12)
    # Rear arm swings independently to distinguish the two run contacts.
    backy=30+spread//3
    p.p([(14-wide,25),(18,26),(16,backy+2),(12-wide,backy+2),(11-wide,backy-1)],main)
    p.r((12-wide,backy+1,16-wide,backy+4),32,0)
    if who=='ashwath': p.r((13,backy,16,backy+1),0)
    # Heads share cast proportions, but hairline, jaw and facial features differ.
    if anim=='beast' and f>=3: p.dy+=7
    if who=='manvi':
        p.p([(14,14),(16,9),(22,7),(28,9),(31,14),(32,28),(27,29),(15,28),(13,23)],8)
    p.p([(17,12),(25,10),(30,14),(30,18),(32,19),(30,21),(29,24),(21,25),(16,21)],32)
    p.p([(27,15),(30,16),(30,19),(31,19),(29,23),(25,24),(26,21)],31,None)
    p.r((19,14,24,16),33)
    if who=='manvi':
        p.p([(14,21),(15,12),(18,9),(22,8),(23,10),(19,13),(18,22),(20,28),(15,27)],8)
        p.p([(24,9),(28,10),(30,13),(30,22),(32,28),(28,27),(27,20),(28,15)],8)
        p.l([(21,10),(18,13),(17,21),(18,25)],10)
        p.l([(25,11),(28,14),(29,24)],9)
        p.r((24,17,28,19),6); p.l([(24,16),(28,16)],0)
        p.r((27,17,28,19),0)
        p.l([(27,22),(29,21)],21)
    elif who=='sehaj':
        p.p([(16,18),(19,20),(23,21),(27,20),(30,21),(29,26),(25,28),(19,26),(16,23)],0)
        p.l([(19,23),(22,25),(25,25)],2)
        p.l([(25,22),(28,22)],32)
        # Dastar: intact, folded olive silhouette in every animation.
        p.p([(14,17),(13,12),(16,7),(21,5),(26,6),(30,10),(31,16),(28,18),(24,14),(20,14),(17,18)],41)
        p.p([(15,12),(18,8),(21,6),(24,7),(29,12),(29,15),(23,11)],40,None)
        p.l([(16,12),(22,8),(28,12)],12)
        p.l([(15,15),(21,11),(28,16)],40)
        p.p([(19,14),(22,11),(24,14)],1,None)
        p.l([(25,17),(29,17)],0); p.r((25,18,29,19),6)
        p.r((28,18,29,19),0)
    elif who=='sayam':
        # Broad, irregular curl mass with a forward fringe; light stubble below.
        p.p([(15,21),(14,17),(12,14),(13,10),(12,8),(16,7),(17,4),(21,5),(24,3),(27,5),(30,5),(31,8),(33,10),(32,14),(29,16),(26,13),(23,15),(20,12),(18,17),(18,21)],0)
        p.l([(15,10),(17,8),(20,9),(21,6),(24,6),(26,8),(29,7)],2)
        p.l([(15,14),(17,11),(19,13),(22,10),(25,12),(28,10),(30,13)],1)
        p.p([(18,21),(21,23),(25,23),(27,21),(30,22),(28,25),(24,26),(20,24)],9,None)
        p.r((21,22,21,23),31); p.r((26,24,27,24),31)
        p.l([(25,23),(28,22)],32)
        p.r((19,16,25,20),12,4); p.r((27,16,32,20),12,4)
        p.l([(25,17),(27,17)],3); p.l([(16,16),(19,17)],3)
        p.l([(20,17),(22,17)],6); p.r((23,18,24,19),0)
        p.r((30,18,31,19),0); p.r((28,17,29,17),33)
    else:
        p.p([(15,18),(14,13),(15,10),(14,8),(18,8),(20,5),(23,7),(27,6),(30,10),(30,14),(27,12),(23,13),(20,11),(18,18)],0)
        p.l([(17,10),(20,8),(23,9),(26,8)],2)
        p.l([(17,13),(21,11),(25,12)],1)
        p.p([(17,20),(20,22),(24,22),(26,20),(30,21),(29,25),(25,27),(20,25)],1)
        p.l([(24,23),(28,23)],6)
        # One-pixel gold square aviators, transparent-looking blue highlight.
        p.r((19,16,24,20),12,23); p.r((26,16,31,20),12,23)
        p.l([(24,17),(26,17)],23); p.l([(17,16),(19,17)],23)
        p.r((20,17,22,17),19); p.r((27,17,29,17),19)
        p.r((23,18,23,19),0); p.r((29,18,29,19),0)
    if anim=='idle' and f==3:
        p.l([(26,18),(29,18)],0)
    if anim=='beast' and f>=3: p.dy-=7
    hx,hy=32,31
    if anim=='attack': hx,hy=[(27,28),(25,24),(39,27),(38,29),(32,31)][f]
    if anim=='ability': hx,hy=[(29,29),(31,24),(32,20),(33,20),(34,25),(32,31)][f]
    if anim=='run': hx,hy=30-spread//2,29
    if anim=='tagin': hx,hy=[(31,24),(35,19),(37,24),(32,31)][f]
    if anim=='heart': hx,hy=26,29
    if anim=='info': hx,hy=[(35,21),(38,25),(32,17),(39,23)][f]
    if anim=='cosmic': hx,hy=31,30
    if who=='sayam' and anim=='idle': hx,hy=28,32
    if anim=='bhai': hx,hy=[(30,24),(32,19),(36,24),(38,27),(32,30)][f]
    if who=='manvi' and anim=='ability' and f in (1,2,3,4): hx,hy=29,17
    p.p([(28,25),(31,25),(hx+2,hy-2),(hx+2,hy+2),(hx-3,hy+3),(27,29)],main)
    p.r((hx-2,hy-1,hx+2,hy+2),32,0)
    if who=='sayam':
        if anim=='idle':
            # Both hands tucked into slanted jacket pockets, chin held high.
            p.r((12,30,17,34),1); p.l([(13,31),(16,33)],3)
            p.r((26,30,31,35),1); p.l([(27,31),(30,33)],3)
            p.l([(26,34),(28,34)],42)
        elif anim=='attack':
            # Talking hands: point, release the bubble, open-palm follow-through.
            p.l([(hx,hy),(min(46,hx+5),hy-2)],0,3)
            p.l([(hx,hy),(min(46,hx+4),hy-2)],32)
            if f in (2,3):
                bx=39 if f==2 else 41
                p.p([(bx-3,10),(bx+4,10),(bx+5,12),(bx+5,16),(bx,16),(bx-2,19),(bx-2,16),(bx-4,15),(bx-4,12)],6)
                for xx in (bx-2,bx,bx+2):p.r((xx,13,xx,13),42)
            p.r((26,23,28,23),6)
        elif anim=='ability':
            # A green PA descends to the floor, then Sayam opens his pitch.
            sx,sy=[(34,29),(35,32),(37,35),(38,35),(38,35),(38,35)][f]
            p.r((sx-5,sy-3,sx+5,sy+9),0)
            p.r((sx-4,sy-2,sx+4,sy+8),42)
            p.r((sx-2,sy-5,sx+2,sy-3),0)
            p.r((sx-1,sy-4,sx+1,sy-4),29)
            p.p([(sx-2,sy+1),(sx+2,sy+1),(sx+3,sy+4),(sx+1,sy+6),(sx-2,sy+6),(sx-3,sy+3)],0)
            p.r((sx-1,sy+2,sx+1,sy+4),29)
            p.r((sx-3,sy-1,sx-1,sy-1),6)
            if f>=3:
                p.l([(44,29),(46,31),(46,36),(44,38)],29)
                p.r((26,23,28,23),6)
        elif anim=='bhai':
            if f<2:
                p.l([(hx,hy),(hx,hy-7)],0,3)
                p.l([(hx,hy),(hx,hy-6)],32)
                p.r((hx-2,hy-1,hx+2,hy+1),32,0)
            elif f<4:
                p.p([(hx-3,hy+1),(hx-4,hy-2),(hx-2,hy-3),(hx-1,hy-1),(hx-1,hy-5),(hx+1,hy-5),(hx+1,hy-3),(hx+3,hy-4),(hx+4,hy-2),(hx+3,hy+2)],32)
                p.l([(hx,hy),(hx+2,hy)],31)
            p.l([(39,12),(42,10)],42)
            if f%2: p.l([(41,17),(45,17)],29)
            p.r((25,23,28,23),0); p.r((26,23,27,23),6)
    if who=='manvi':
        if anim=='attack':
            p.l([(hx,hy+3),(hx+2,hy-3)],0,3)
            p.p([(hx,hy-5),(hx+3,hy-5),(hx+4,hy-2),(hx+1,hy)],4)
            p.r((hx+1,hy-4,hx+2,hy-4),6)
            if f==2: p.star(45,22,37)
        if anim=='ability' and f in (1,2,3,4):
            p.star(36+f%2,11+f%3,37,3)
            p.star(42,18-f%2,36,1)
        if anim=='tagin' and f<3: p.star(9,18+f*2,37)
    if who=='sehaj':
        if anim not in ('beast','heart','ko'):
            p.r((hx-3,hy-2,hx,hy+2),25,0)
            p.p([(hx,hy),(min(45,hx+10),hy-8),(min(44,hx+9),hy-3),(hx+2,hy+3)],6)
        if anim=='ability':
            p.l([(38,12),(43,15),(44,21),(41,25),(36,24),(34,19),(37,16)],35)
            p.p([(34,15),(39,15),(35,20)],35,None)
        if anim=='beast':
            if f>0:
                p.p([(17,26),(21,25),(22,29),(26,29),(28,25),(31,27),(30,35),(18,35)],6)
                p.l([(21,32),(27,32)],12)
                for x,s in [(14,-1),(33,1)]:
                    p.p([(x,27),(x+s*3,24),(x+s*5,26),(x+s*4,31),(x,32)],32)
                if f in (1,2):
                    p.p([(6,29),(10,26),(12,31),(8,34)],40)
                    p.p([(37,30),(40,26),(44,30),(40,33)],40)
            if f>=3:
                p.l([(15,29),(11,23),(12,14)],0,6); p.l([(15,28),(12,22),(13,14)],32,4)
                p.l([(32,28),(37,22),(35,13)],0,6); p.l([(32,28),(36,21),(34,13)],32,4)
                p.p([(10,7),(13,3),(23,1),(32,2),(37,6),(36,10),(31,11),(17,11),(11,10)],3)
                p.p([(12,7),(16,4),(24,3),(22,8),(15,10)],5,None)
                p.l([(26,4),(24,8),(29,11),(32,10)],2)
                # Rock sits above the intact turban; both readable as separate masses.
    if who=='ashwath':
        if anim in ('attack','idle','run','jump','fall','tagin'):
            p.r((hx-6,hy,hx+6,hy+6),0)
            p.r((hx-5,hy+1,hx+5,hy+4),3)
            for yy in (hy+1,hy+3):
                for xx in range(hx-4,hx+5,3): p.r((xx,yy,xx+1,yy),6)
            p.l([(hx-2,hy+5),(hx+2,hy+5)],35)
        if anim=='ability' and f in (1,2,3,4):
            p.r((33,8,46,18),0); p.r((34,9,45,17),27)
            p.l([(36,11),(38,13),(36,15)],35); p.l([(40,15),(43,15)],36)
        if anim=='info':
            p.l([(12,29),(9+f%2*3,23),(12+f%2*3,18)],0,5)
            p.l([(12,29),(10+f%2*3,23),(12+f%2*3,18)],32,3)
            for y in (10,14,18): p.l([(37+f%2,y),(43,y)],35 if y==14 else 6)
            p.r((25,23,28,24),0); p.r((26,23,28,23),6)
        if anim=='cosmic':
            p.r((23,17,23,18),0); p.r((29,17,29,18),0)
            p.star(37,8+f%2,36); p.star(43,15,22,1)
            p.star(8,14-f%2,19,1)
    if anim=='heart':
        p.l([(16,27),(20,29),(23,28)],0,5); p.l([(16,27),(20,29),(23,28)],32,3)
        p.l([(30,27),(27,29),(25,28)],32,3)
        heart(p,18,25)
        if f>0: p.star(36,16-f,37,1+f%2)
    if anim=='hurt': p.star(37,11,22)
    return im

def portrait(who,emotion):
    im=Image.new('RGBA',(64,64)); p=Pen(im)
    main,shade={'manvi':(1,0),'sehaj':(40,41),'ashwath':(14,12),'sayam':(1,0)}[who]
    p.p([(3,63),(5,53),(17,46),(24,44),(41,44),(54,49),(61,56),(63,63)],main)
    p.p([(44,47),(54,49),(61,56),(63,63),(49,63)],shade,None)
    p.p([(24,39),(39,39),(41,49),(34,55),(23,48)],31)
    if who=='manvi':
        p.p([(25,48),(34,54),(40,48),(44,63),(22,63)],21)
        p.l([(28,55),(37,55)],37)
        p.p([(16,48),(23,47),(28,57),(22,55),(25,63),(17,63),(13,53)],2)
        p.p([(43,47),(49,50),(45,58),(41,56),(41,63),(37,63)],2)
        p.l([(18,50),(20,52)],5); p.l([(43,56),(42,61)],4)
        p.p([(10,36),(11,18),(16,8),(25,4),(35,4),(46,9),(51,19),(51,39),(56,49),(46,51),(39,43),(19,48),(10,47)],8)
    elif who=='sehaj':
        p.p([(23,48),(33,53),(41,48),(44,63),(22,63)],6)
        p.l([(20,48),(21,63)],12,2); p.l([(44,49),(44,63)],12,2)
        p.l([(7,55),(15,51),(18,52)],12,3)
        for y in (54,61): p.r((19,y,20,y+1),6)
        p.p([(48,54),(53,53),(55,57),(51,60),(48,57)],41)
    elif who=='sayam':
        p.p([(24,47),(33,53),(41,47),(45,63),(21,63)],6)
        for x,y in [(26,52),(34,55),(29,58),(38,60),(23,61)]:
            p.l([(x,y),(x+3,y),(x+1,y+2),(x+4,y+3)],0)
        p.p([(16,48),(22,46),(27,55),(21,54),(25,61),(20,63),(12,55)],2)
        p.p([(43,47),(49,49),(46,57),(42,56),(41,63),(37,63)],2)
        p.l([(20,55),(23,61)],42,3); p.l([(43,57),(41,62)],42,2)
        p.l([(16,50),(19,52)],5); p.l([(47,51),(46,54)],4)
    else:
        p.l([(21,47),(25,53),(35,55),(43,49)],12,2)
        p.r((29,58,33,63),20)
        p.l([(23,57),(29,60),(34,60),(40,57)],20)
        p.l([(23,63),(28,61),(35,61),(40,63)],20)
    p.p([(16,18),(22,10),(37,9),(46,15),(49,24),(49,32),(45,41),(37,47),(26,45),(19,38),(16,29)],32)
    p.p([(43,19),(48,22),(48,32),(44,40),(37,45),(33,43),(41,37)],31,None)
    p.p([(15,26),(19,25),(21,29),(20,34),(16,33)],32)
    p.l([(17,28),(19,30)],31)
    if who=='manvi':
        p.p([(12,33),(12,20),(15,12),(22,7),(30,5),(31,8),(26,12),(21,17),(19,30),(21,42),(18,48),(12,43)],8)
        p.p([(32,6),(39,7),(46,13),(49,21),(49,35),(53,46),(47,47),(43,40),(44,28),(43,18),(38,14),(33,11)],8)
        p.l([(27,9),(21,13),(17,21),(17,34),(19,42)],10)
        p.l([(35,9),(41,14),(46,23),(46,36),(49,43)],9)
        p.l([(30,8),(30,11)],12)
    elif who=='sehaj':
        p.p([(18,31),(22,33),(25,35),(30,33),(36,34),(41,33),(47,32),(46,43),(41,49),(33,52),(25,48),(20,42)],0)
        p.l([(22,37),(24,43),(30,47),(36,48)],2)
        p.p([(12,26),(10,18),(12,12),(18,5),(26,1),(34,2),(43,7),(49,15),(51,24),(47,29),(40,22),(33,18),(25,19),(19,24)],41)
        p.p([(12,17),(18,8),(26,3),(31,4),(44,14),(48,23),(42,21),(31,12),(24,10)],40,None)
        p.l([(14,16),(25,6),(30,6),(44,17)],12)
        p.l([(13,21),(25,11),(31,14),(45,25)],40,2)
        p.l([(18,23),(27,16),(33,19)],12)
        p.p([(23,22),(28,16),(33,21)],1,None)
    elif who=='sayam':
        p.p([(14,30),(10,25),(10,20),(7,17),(9,12),(8,8),(14,7),(16,3),(22,4),(26,1),(31,3),(36,1),(41,4),(46,4),(48,8),(52,11),(53,17),(50,22),(46,24),(42,19),(37,22),(33,18),(27,22),(23,18),(20,24),(19,30)],0)
        p.l([(12,13),(14,9),(18,10),(20,6),(25,7),(28,4),(32,6),(36,5),(41,8),(45,7)],2,2)
        p.l([(12,19),(16,15),(19,17),(22,12),(27,14),(30,10),(34,14),(39,11),(44,15),(47,12),(49,17)],1,2)
        p.p([(19,34),(22,36),(27,38),(30,36),(37,36),(41,37),(47,34),(45,41),(39,46),(32,48),(25,44),(21,40)],9,None)
        p.l([(23,38),(24,41),(29,44)],10)
        p.l([(37,44),(41,41),(43,38)],10)
        for x,y in [(26,39),(29,42),(35,45),(42,39)]: p.r((x,y,x,y),31)
    else:
        p.p([(15,27),(12,20),(13,13),(12,10),(18,8),(21,3),(27,5),(33,2),(38,6),(43,5),(48,11),(50,19),(46,23),(43,16),(36,18),(29,14),(22,19),(20,28)],0)
        p.l([(16,14),(21,9),(26,8),(30,10),(36,7),(42,10)],2,2)
        p.l([(16,19),(22,15),(29,12),(36,15),(43,13)],1,2)
        p.p([(19,33),(22,36),(26,36),(30,34),(37,34),(41,36),(47,33),(46,41),(41,47),(34,49),(26,45),(21,41)],1)
        p.l([(23,39),(26,42),(32,45),(39,44)],2)
    # Distinct brows and eye openings keep all eight expressions readable.
    for x in (24,38):
        if emotion in ('deadpan','smug'):
            p.r((x,27,x+8,30),6,0); p.r((x+5,28,x+6,30),0)
        elif emotion=='happy': p.l([(x,29),(x+3,26),(x+6,26),(x+8,29)],0,2)
        else:
            top=24 if emotion in ('panic','shocked') else 26
            p.r((x,top,x+8,31),6,0); p.r((x+5,top+1,x+6,29),0)
        if emotion=='angry': p.l([(x,22),(x+8,25)],0,2)
        elif emotion=='sad': p.l([(x,25),(x+7,22)],0,2)
        elif emotion in ('panic','shocked'): p.l([(x,21),(x+7,20)],0)
        elif emotion=='smug': p.l([(x,24),(x+7,22)],0)
        else: p.l([(x,23),(x+7,23)],0)
    p.l([(35,29),(37,33),(34,34)],31)
    if emotion in ('panic','shocked'):
        p.p([(30,38),(34,36),(39,38),(39,43),(33,44),(30,41)],0)
        p.r((32,38,37,39),6)
        if emotion=='panic': p.p([(54,19),(51,25),(53,28),(56,27),(57,24)],35)
    elif emotion=='happy':
        p.p([(27,37),(41,37),(38,43),(32,44),(28,41)],0)
        p.r((29,38,39,39),6); p.l([(33,42),(37,42)],37)
    elif emotion=='angry': p.r((29,38,40,41),0); p.r((30,39,39,39),6)
    elif emotion=='sad': p.l([(30,41),(34,38),(39,39)],0)
    elif emotion=='smug':
        p.l([(30,39),(36,39),(40,36)],0)
        if who=='sayam':
            p.l([(31,38),(36,38),(39,36)],32)
            p.l([(38,39),(40,38)],31)
    else:
        p.l([(30,39),(37,39),(39,38)],21 if who=='manvi' else 32)
        if who=='ashwath': p.l([(31,39),(37,39)],6)
    if who=='sayam':
        # Translucent grey frames: light upper edges, dark lower rim, clear eyes.
        for x in (21,36):
            p.l([(x,24),(x+12,24),(x+13,26),(x+12,33),(x+3,34),(x,31),(x,24)],4)
            p.l([(x+3,34),(x+11,34),(x+13,30)],3)
            p.l([(x+1,25),(x+5,25)],5)
        p.l([(33,26),(36,26)],4); p.l([(16,25),(21,26)],3)
        if emotion=='smug':
            # One brow raised, one eyelid lowered: the charismatic half-smile.
            p.l([(24,22),(30,21)],0,2)
            p.l([(38,22),(45,23)],0)
            p.r((39,27,45,27),31)
            p.l([(39,28),(45,28)],0)
    if who=='ashwath':
        # Gold rims remain present through every expression; eyes show through.
        p.l([(21,24),(33,24),(34,26),(33,33),(23,33),(21,30),(21,24)],23)
        p.l([(36,24),(48,24),(49,26),(48,33),(38,33),(36,30),(36,24)],23)
        p.l([(33,26),(36,26)],12); p.l([(17,25),(21,26)],23)
        p.l([(22,25),(26,25)],19); p.l([(37,25),(41,25)],19)
    return im

def build(who):
    extra={'manvi':[('heart',4,8,False)],
           'sehaj':[('beast',6,10,False),('heart',4,8,False)],
           'ashwath':[('info',4,12,True),('cosmic',4,4,True)],
           'sayam':[('bhai',5,10,False)]}[who]
    anims=ANIMS+extra; sheet=Image.new('RGBA',(384,48*len(anims))); entries={}
    for row,(anim,count,fps,loop) in enumerate(anims):
        entries[anim]=dict(row=row,frames=count,fps=fps,loop=loop)
        if anim=='attack': entries[anim]['hitFrame']=2
        for f in range(count): sheet.paste(frame(who,anim,f),(f*48,row*48))
    path=f'sprites/characters/{who}.png'; sheet.save(A/path)
    return dict(file=path,frameWidth=48,frameHeight=48,anims=entries)

def build_portrait(who):
    sheet=Image.new('RGBA',(512,64))
    for i,emotion in enumerate(EMOTIONS): sheet.paste(portrait(who,emotion),(i*64,0))
    path=f'portraits/{who}.png'; sheet.save(A/path)
    return dict(file=path,size=64,emotions=EMOTIONS)

if __name__=='__main__':
    path=A/'manifest.json'; manifest=json.loads(path.read_text())
    for who in sys.argv[1:]:
        manifest['sprites'][who]=build(who)
        manifest['portraits'][who]=build_portrait(who)
    path.write_text(json.dumps(manifest,indent=2)+'\n')
