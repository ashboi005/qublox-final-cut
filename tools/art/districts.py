"""Final districts: stable gameplay tile slots plus bespoke decor and parallax."""
from crew import A,C,ROOT
from PIL import Image,ImageDraw
import json,sys

def build(name):
 feed=name=='the-feed'; base=Image.open(A/'tiles/hq.png').copy()
 names=(['post card','play button','reaction heart','notification','speaker grille','fiber column','paywall','timeline strip','deleted post','rage nozzle','metric bars','ring antenna','ad screen','trending arrow','server terminal','glass panel','cable knot'] if feed else ['marble panel','rounded cubicle','fluorescent','greeter screen','shredder teeth','elevator panel','foam nozzle','blank painting','keynote lectern','mirror','vault clamp','master drive','reactor pylon','stamp press','security lens','paper stack','colour breach'])
 for i,n in enumerate(names,19):
  im=Image.new('RGBA',(16,16));d=ImageDraw.Draw(im)
  def r(b,c,o=0):d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
  def l(p,c,w=1):d.line(p,fill=C[c],width=w)
  def p(points,c):d.polygon(points,fill=C[c],outline=C[0])
  if feed:
   if i in (19,22,27,31):
    r((1,1,14,14),1);r((2,2,13,4),26 if i==22 else 18,None);r((3,6,12,10),2,None);l([(3,12),(9,12)],4)
    if i==22:d.ellipse((9,0,15,6),fill=C[20]);d.point((12,2),fill=C[6])
    if i==27:l([(3,5),(12,12)],20,2);l([(12,5),(3,12)],20,2)
   elif i==20:p([(4,2),(13,8),(4,14)],35)
   elif i==21:p([(2,3),(5,2),(8,5),(11,2),(14,3),(14,7),(8,14),(2,7)],26)
   elif i==23:
    r((1,0,14,15),1)
    for y in (4,11):d.ellipse((4,y-3,11,y+3),fill=C[3],outline=C[0])
   elif i in (24,25):
    r((5,0,10,15),0);l([(7,0),(7,15)],20 if i==25 else 35,2);l([(10,0),(10,15)],26)
   elif i==26:
    r((0,4,15,12),0);r((0,6,15,10),18,None)
    for x in (1,6,11):r((x,5,x+2,5),6,None);r((x,11,x+2,11),6,None)
   elif i==28:r((2,0,13,4),2);p([(4,5),(11,5),(9,10),(6,10)],20)
   elif i==29:
    for x,h in [(2,4),(6,8),(10,12)]:r((x,15-h,x+2,14),35)
   elif i==30:
    d.ellipse((2,1,13,12),outline=C[26],width=2);l([(8,12),(8,15)],3,2)
   elif i==32:p([(2,13),(6,6),(3,6),(10,1),(14,8),(11,7),(7,14)],22)
   elif i==33:r((1,3,14,14),2);r((3,5,12,11),27);l([(5,7),(7,8),(5,9)],35)
   elif i==34:r((0,0,15,15),18);l([(2,11),(11,2)],19);l([(5,14),(14,5)],19)
   else:l([(0,4),(11,4),(11,11),(4,11),(4,15)],26,2);l([(0,8),(7,8),(7,15)],35)
  else:
   if i in (19,20,26,28):
    r((0,0,15,15),13);r((2,2,13,13),14)
    if i==20:r((3,7,12,12),12);r((5,4,10,7),9)
    if i==26:r((3,3,12,11),6);l([(5,9),(7,5),(10,9)],12)
    if i==28:r((3,3,12,12),5);l([(4,10),(10,4)],6)
   elif i==21:r((0,5,15,10),9);r((1,6,14,8),6,None)
   elif i in (22,24,33):
    r((2,2,13,13),12);r((4,4,11,10),9);l([(5,6),(10,6)],14);r((6,8,9,8),14,None)
   elif i==23:
    r((0,0,15,15),9)
    for x in (0,5,10):p([(x,3),(x+4,3),(x+2,12)],5)
   elif i==25:r((2,0,13,5),11);p([(4,5),(11,5),(10,10),(5,10)],14)
   elif i==27:p([(2,6),(13,6),(11,15),(4,15)],9);r((1,4,14,6),12)
   elif i==29:r((0,0,3,15),9);r((12,0,15,15),9);r((3,6,12,9),12)
   elif i==30:r((4,2,11,14),1);r((5,4,10,9),35);r((6,12,9,13),6,None)
   elif i==31:r((4,0,11,15),12);r((6,3,9,12),14)
   elif i==32:r((5,0,10,7),9);r((2,7,13,11),20);r((1,13,14,15),11)
   elif i==34:
    for y in (3,6,9,12):r((2,y,13,y+2),14);l([(4,y+1),(10,y+1)],12)
   else:
    r((0,0,15,15),13)
    for x,y,c in [(3,5,20),(10,4,35),(9,11,26)]:d.ellipse((x-2,y-2,x+2,y+2),fill=C[c])
  base.paste(im,((i%6)*16,(i//6)*16))
 if not feed:
  # Architecture drains to sterile stone; gameplay accents stay intact.
  px=base.load();mapping={tuple(bytes.fromhex(C[a][1:]))+(255,):tuple(bytes.fromhex(C[b][1:]))+(255,) for a,b in [(2,11),(3,13),(4,14)]}
  for y in range(32):
   for x in range(96):
    if px[x,y] in mapping:px[x,y]=mapping[px[x,y]]
 file=f'tiles/{name}.png';base.save(A/file)
 doc=f'# {name} tile map\n\n96×96, six columns, row-major. Gameplay indices 0–18 preserve HQ meanings; 0–8 canonical concrete/stone blob.\n\n| Index | Meaning | Use |\n|---|---|---|\n'
 for row in (ROOT/'docs/art/tiles-hq.md').read_text().splitlines():
  if row.startswith('| ') and row.split('|')[1].strip().isdigit() and int(row.split('|')[1])<19:doc+=row+'\n'
 for i,n in enumerate(names,19):doc+=f'| {i} | {n} | decor |\n'
 (ROOT/f'docs/art/tiles-{name}.md').write_text(doc)
 pth=A/'manifest.json';m=json.loads(pth.read_text());m['tilesets'][name]=dict(file=file,tileSize=16,notes=f'see docs/art/tiles-{name}.md')
 for depth in ['far','mid','near']:
  for state in ['drained','saturated']:
   bg=Image.new('RGBA',(480,270));d=ImageDraw.Draw(bg);sat=state=='saturated'
   def r(b,c):
    x,y,X,Y=b
    for off in (-480,0,480):d.rectangle((x+off,y,X+off,Y),fill=C[c])
   def l(points,c,w=1):
    for off in (-480,0,480):d.line([(x+off,y) for x,y in points],fill=C[c],width=w)
   accent=35 if sat else 12;hot=26 if sat else 10
   if feed:
    if depth=='far':
     r((0,0,479,269),1)
     for x in range(-16,480,64):
      r((x,0,x+38,269),2);r((x+4,0,x+5,269),3)
      for y in range(13,270,26):r((x+9,y,x+30,y+3),accent)
    elif depth=='mid':
     for x in range(-20,480,120):
      r((x,0,x+4,269),hot)
      for y in (22,113,204):
       r((x+15,y,x+100,y+65),0);r((x+17,y+2,x+98,y+12),18 if sat else 9);r((x+22,y+18,x+93,y+45),2);l([(x+26,y+53),(x+74,y+53)],4)
       d.polygon([(x+48,y+22),(x+66,y+31),(x+48,y+40)],fill=C[accent])
    else:
     for x in range(-10,480,160):
      r((x,0,x+14,269),0);r((x+2,0,x+3,269),3)
      for y in (60,230):r((x+15,y,x+130,y+5),0);r((x+20,y+1,x+125,y+1),hot)
   else:
    if depth=='far':
     r((0,0,479,269),13)
     for x in range(-20,480,80):r((x,0,x+56,269),14);r((x+4,0,x+5,269),12)
     for y in (50,160):r((0,y,479,y+3),12)
    elif depth=='mid':
     for x in range(-12,480,120):
      r((x,0,x+18,269),11);r((x+2,0,x+15,269),13)
      r((x+29,71,x+100,169),9);r((x+32,74,x+97,166),14);r((x+42,91,x+87,94),accent);r((x+47,109,x+82,112),12)
      r((x+25,202,x+104,234),11);r((x+28,205,x+101,231),13)
    else:
     for x in range(-20,480,160):
      r((x,0,x+15,269),9);r((x+2,0,x+12,269),11);r((x+28,0,x+128,9),9);r((x+31,2,x+125,5),6)
      r((x+30,249,x+130,269),9);r((x+33,252,x+127,269),11)
      if sat:l([(x+36,253),(x+59,253),(x+70,260),(x+95,260)],26,2)
   file=f'backgrounds/{name}-{depth}-{state}.png';bg.save(A/file);m['images'][f'bg-{name}-{depth}-{state}']={'file':file}
 pth.write_text(json.dumps(m,indent=2)+'\n')
if __name__=='__main__':build(sys.argv[1])
