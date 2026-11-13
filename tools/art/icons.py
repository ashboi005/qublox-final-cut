from crew import A,C
from PIL import Image,ImageDraw
import json
CREW=['ashwath','sayam','tushar','sehaj','mansukh','manya','brahmansh']
MAINS=[17,20,22,18,25,29,26]
p=A/'manifest.json'; m=json.loads(p.read_text()); (A/'icons').mkdir(exist_ok=True)
for who,col in zip(CREW,MAINS):
 im=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(im)
 d.polygon([(1,15),(3,12),(6,11),(11,11),(14,14),(14,15)],fill=C[col],outline=C[0])
 d.polygon([(4,3),(10,2),(13,5),(13,8),(11,12),(6,12),(3,8)],fill=C[32],outline=C[0])
 d.polygon([(3,7),(2,4),(5,1),(10,1),(13,4),(11,5),(8,3),(5,6)],fill=C[1])
 d.point((8,7),fill=C[0]); d.point((11,7),fill=C[0]); d.line([(8,10),(10,10)],fill=C[0])
 if who in ('ashwath','sehaj'):
  d.line([(2,7),(2,3),(5,0),(10,0),(13,3)],fill=C[0]); d.rectangle((1,6,3,9),fill=C[35])
 if who=='sayam': d.rectangle((6,6,13,8),fill=C[0]); d.point((7,6),fill=C[4])
 if who=='tushar': d.rectangle((3,1,11,3),fill=C[23],outline=C[0]); d.rectangle((3,4,14,5),fill=C[22])
 if who=='mansukh': d.polygon([(3,5),(4,0),(7,2),(10,0),(13,4)],fill=C[1]); d.point((5,2),fill=C[25])
 if who=='manya': d.polygon([(3,4),(0,2),(0,11),(3,9)],fill=C[1]); d.point((2,4),fill=C[26])
 if who=='brahmansh': d.line([(2,10),(1,4),(6,0),(11,2),(14,5)],fill=C[26],width=2)
 file=f'icons/{who}.png'; im.save(A/file); m['images'][f'icon-{who}']={'file':file}
for ability in ['hack','bribe','pen','fill','ctrlz','jumpcut','cut']:
 im=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(im)
 if ability=='hack':
  d.rectangle((1,2,14,12),fill=C[1],outline=C[35]); d.line([(3,5),(6,7),(3,9)],fill=C[36]); d.line([(8,9),(11,9)],fill=C[36]); d.rectangle((5,13,10,14),fill=C[3])
 elif ability=='bribe':
  d.polygon([(4,1),(11,1),(9,5),(14,10),(13,14),(2,14),(1,10),(6,5)],fill=C[22],outline=C[0]); d.line([(8,6),(6,9),(10,11),(8,13)],fill=C[23],width=2)
 elif ability=='pen':
  d.line([(2,12),(7,4),(13,7)],fill=C[35]);
  for x,y in [(2,12),(7,4),(13,7)]: d.rectangle((x-1,y-1,x+1,y+1),fill=C[6],outline=C[0])
 elif ability=='fill':
  d.polygon([(4,1),(12,5),(9,13),(1,9)],fill=C[3],outline=C[0]); d.line([(4,3),(11,6)],fill=C[6]); d.polygon([(12,8),(15,13),(14,15),(11,15),(10,13)],fill=C[26],outline=C[0])
 elif ability=='ctrlz':
  d.arc((2,2,14,14),230,520,fill=C[35],width=2); d.polygon([(1,3),(8,2),(5,8)],fill=C[35],outline=C[0])
 elif ability=='jumpcut':
  for x in (3,9): d.polygon([(x,2),(x+4,7),(x,13),(x+2,7)],fill=C[26],outline=C[0])
  d.line([(0,5),(2,5)],fill=C[6]); d.line([(0,9),(2,9)],fill=C[6])
 else:
  d.rectangle((1,6,14,14),fill=C[1],outline=C[0]); d.polygon([(1,5),(12,1),(14,4),(2,8)],fill=C[6],outline=C[0]); d.line([(5,3),(7,6)],fill=C[0],width=2); d.line([(10,2),(12,4)],fill=C[0],width=2); d.line([(4,11),(11,11)],fill=C[22])
 file=f'icons/ability-{ability}.png'; im.save(A/file); m['images'][f'icon-ability-{ability}']={'file':file}
p.write_text(json.dumps(m,indent=2)+'\n')
