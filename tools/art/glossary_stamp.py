"""Binary ink stamp; standalone dossier art, no layout code."""
import json, random
from PIL import Image,ImageDraw,ImageFont
from likeness import A,C
im=Image.new('RGBA',(96,48));mask=Image.new('1',im.size);d=ImageDraw.Draw(mask)
d.rectangle((2,7,93,40),outline=1,width=2);d.rectangle((5,10,90,37),outline=1)
font=ImageFont.load_default(size=13);word='CLASSIFIED'
b=d.textbbox((0,0),word,font=font);d.text(((96-b[2])//2,17),word,font=font,fill=1)
r=random.Random(2084)
for _ in range(90):
 x=r.randrange(2,94);y=r.randrange(7,41)
 if r.random()<.7:d.point((x,y),fill=0)
im.paste(C[20],(0,0,96,48),mask);im.save(A/'images/glossary-stamp.png')
p=A/'manifest.json';m=json.loads(p.read_text());m['images']['glossary-stamp']={'file':'images/glossary-stamp.png'};p.write_text(json.dumps(m,indent=2)+'\n')
