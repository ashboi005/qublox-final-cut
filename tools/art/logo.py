"""Original block-pixel title art; transparent, native 240×64."""
from crew import A,C
from fx import FONT
from PIL import Image,ImageDraw
import json
FONT.update({'Q':['01110','11011','11011','11011','11011','01110','00011'],'X':['11011','11011','01110','00100','01110','11011','11011'],'F':['11111','11000','11000','11110','11000','11000','11000'],'I':['11111','00100','00100','00100','00100','00100','11111'],':':['00','11','11','00','11','11','00']})
im=Image.new('RGBA',(240,64)); d=ImageDraw.Draw(im)
# Understated offset slab gives thick block type a comic-print drop shadow.
d.polygon([(8,8),(221,5),(231,44),(19,47)],fill=C[0])
def word(text,x,y,s,col):
    points=[]
    for ch in text:
        glyph=FONT[ch]
        for yy,row in enumerate(glyph):
            for xx,v in enumerate(row):
                if v=='1': points.append((x+xx*s,y+yy*s))
        x+=(len(glyph[0])+1)*s
    for px,py in points: d.rectangle((px+2,py+2,px+s+1,py+s+1),fill=C[16])
    for px,py in points: d.rectangle((px,py,px+s-1,py+s-1),fill=C[col])
word('QUBLOX:',18,8,5,6)
d.ellipse((220,30,232,42),fill=C[20],outline=C[0])
d.rectangle((34,48,210,63),fill=C[0]); word('FINAL CUT',68,48,2,22)
im.save(A/'logo.png')
p=A/'manifest.json'; m=json.loads(p.read_text()); m['images']['logo']={'file':'logo.png'}; p.write_text(json.dumps(m,indent=2)+'\n')
