"""Lost Footage: fixed-position 16px VHS, four-frame label glint."""
from crew import A,C
from PIL import Image,ImageDraw
import json
sheet=Image.new('RGBA',(64,16))
for f in range(4):
 im=Image.new('RGBA',(16,16));d=ImageDraw.Draw(im)
 d.polygon([(2,3),(13,3),(15,5),(15,12),(13,14),(2,14),(0,12),(0,5)],fill=C[1],outline=C[0])
 d.rectangle((2,4,13,7),fill=C[26]);d.rectangle((2,8,13,11),fill=C[0])
 for x in (4,11):
  d.ellipse((x-2,8,x+2,12),fill=C[5],outline=C[0]);d.point((x,10),fill=C[0])
 d.rectangle((7,9,8,10),fill=C[3]);d.line([(3,13),(12,13)],fill=C[4])
 # Clipped diagonal glint moves across the hot label only.
 for y in range(4,8):
  x=2+f*3+(7-y)//2
  if x<=13:d.point((x,y),fill=C[6])
 d.point((2,11),fill=C[3]);d.point((13,11),fill=C[3])
 sheet.paste(im,(16*f,0))
file='sprites/props/tape.png';sheet.save(A/file)
p=A/'manifest.json';m=json.loads(p.read_text());m['sprites']['tape']=dict(file=file,frameWidth=16,frameHeight=16,anims={'idle':dict(row=0,frames=4,fps=6,loop=True)});p.write_text(json.dumps(m,indent=2)+'\n')
