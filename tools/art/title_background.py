from crew import A,C,frame
from PIL import Image,ImageDraw
import json
im=Image.new('RGBA',(480,270),C[0]); d=ImageDraw.Draw(im)
# Calm upper middle: no windows, antennae, or light beams behind the logo.
d.rectangle((0,92,479,269),fill=C[1])
for i in range(12):
 x=i*43-12; y=115+(i*17)%55
 d.rectangle((x,y,x+32,247),fill=C[2]); d.rectangle((x+5,y-8,x+27,y),fill=C[2])
 for yy in range(y+9,240,13):
  for xx in range(x+4,x+29,8): d.rectangle((xx,yy,xx+2,yy+2),fill=C[11] if (xx+yy)%3 else C[3])
# The only bright tower: saturated HQ, with stepped brutalist crown and red dot.
d.rectangle((371,99,450,244),fill=C[0]); d.rectangle((375,103,446,240),fill=C[16]); d.rectangle((382,91,438,102),fill=C[17]); d.rectangle((392,84,428,91),fill=C[0])
for y in range(111,225,17):
 d.rectangle((380,y,441,y+8),fill=C[1])
 for x in range(384,437,11): d.rectangle((x,y+2,x+5,y+5),fill=C[35])
d.ellipse((401,91,409,99),fill=C[20]); d.line([(446,106),(446,235)],fill=C[26],width=2)
# Beige fog advances in flat stepped bands, no soft alpha or gradients.
for y,col in [(202,9),(216,10),(230,11)]:
 points=[(0,270),(0,y)]+[(x,y+(x//30%3)*3) for x in range(0,301,15)]+[(334,y+16),(353,270)]
 d.polygon(points,fill=C[col])
# Rooftop foreground and nine individualized silhouettes.
d.polygon([(0,245),(25,241),(311,241),(329,247),(480,247),(480,270),(0,270)],fill=C[0])
d.line([(25,241),(311,241)],fill=C[3]); d.line([(331,247),(479,247)],fill=C[18])
for i,who in enumerate(['ashwath','sayam','mansukh','manya','sehaj','manvi','brahmansh','tushar','mishthi']):
 sprite=frame(who,'idle',0); silhouette=Image.new('RGBA',(48,48))
 src=sprite.load(); out=silhouette.load()
 for y in range(48):
  for x in range(48):
   if src[x,y][3]:
    # A thin light-facing rim, otherwise ink silhouettes.
    rim=x<47 and not src[x+1,y][3]
    out[x,y]=tuple(bytes.fromhex(C[18 if rim else 0][1:]))+(255,)
 im.alpha_composite(silhouette,(5+i*36,194))
im.save(A/'backgrounds/title-bg.png')
p=A/'manifest.json';m=json.loads(p.read_text());m['images']['title-bg']={'file':'backgrounds/title-bg.png'};p.write_text(json.dumps(m,indent=2)+'\n')
