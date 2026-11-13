from crew import A,C
from PIL import Image,ImageDraw
import json,math
manifest_path=A/'manifest.json';m=json.loads(manifest_path.read_text())
anims=['idle','phase1','phase2','phase3','telegraph','hurt','die'];sheet=Image.new('RGBA',(512,128*len(anims)))
for row,anim in enumerate(anims):
 for f in range(4):
  im=Image.new('RGBA',(128,128));d=ImageDraw.Draw(im);dy=f%2
  center=(64,65+dy);corners=[(64,14+dy),(105,40+dy),(105,89+dy),(64,113+dy),(23,89+dy),(23,40+dy)]
  colours=[14,13,12,11,12,14]
  if anim=='phase3':colours=[22,20,26,17,35,29]
  for k in range(6):d.polygon([center,corners[k],corners[(k+1)%6]],fill=C[colours[k]],outline=C[0])
  d.polygon([(64,31),(89,48),(89,79),(64,96),(39,79),(39,48)],outline=C[9],width=2)
  # The trapped Final Cut drive is the only detailed object in its calm core.
  d.rectangle((55,48,72,79),fill=C[1],outline=C[0]);d.rectangle((58,52,69,67),fill=C[35 if anim=='phase3' else 13]);d.rectangle((60,72,67,75),fill=C[6])
  if anim in ('phase2','phase3'):
   for k in range(5):
    y=27+k*17;dx=(-1 if (k+f)%2 else 1)*(3+f)
    d.rectangle((30+dx,y,98+dx,y+2),fill=C[[20,35,26,22,17][k] if anim=='phase3' else (6 if k%2 else 9)])
  if anim=='phase3':
   for k in range(8):
    a=k*math.pi/4+f*.15;x=64+round(math.cos(a)*54);y=64+round(math.sin(a)*54)
    d.polygon([(x,y-3),(x+3,y),(x,y+3),(x-3,y)],fill=C[[20,22,35,26][k%4]],outline=C[0])
  if anim=='telegraph':
   d.polygon([(64,7),(114,36),(114,93),(64,121),(14,93),(14,36)],outline=C[20 if f%2 else 22],width=2)
  if anim=='hurt':d.line([(94,9),(104,19)],fill=C[22],width=2);d.line([(104,9),(94,19)],fill=C[22],width=2)
  if anim=='die':
   # Facets separate outward to reveal the recovered drive, rather than squash.
   im=Image.new('RGBA',(128,128));d=ImageDraw.Draw(im)
   for k in range(6):
    a=k*math.pi/3;cx=64+round(math.cos(a)*(23+f*9));cy=64+round(math.sin(a)*(23+f*9));rad=12-f*2
    d.polygon([(cx,cy-rad),(cx+rad,cy),(cx,cy+rad),(cx-rad,cy)],fill=C[[20,22,35,26,17,29][k]],outline=C[0])
   d.rectangle((57,52,70,77),fill=C[1],outline=C[0]);d.rectangle((59,55,68,65),fill=C[35]);d.rectangle((61,71,66,73),fill=C[6])
  sheet.paste(im,(128*f,128*row))
file='sprites/bosses/beige-core.png';sheet.save(A/file);m['sprites']['beige-core']=dict(file=file,frameWidth=128,frameHeight=128,anims={a:dict(row=r,frames=4,fps=6 if a=='telegraph' else 8,loop=a in ('idle','phase1','phase2','phase3')) for r,a in enumerate(anims)})
for who,col in [('chad-frictionless',10),('rebel-intern-simran',26),('sysadmin-karan',18),('stuntman-jaggu',23),('influencer-roxy',25)]:
 sheet=Image.new('RGBA',(192,96))
 for row,anim in enumerate(['idle','talk']):
  for f in range(4):
   im=Image.new('RGBA',(48,48));d=ImageDraw.Draw(im);dy=-1 if f==2 else 0
   def r(b,c,o=0):x,y,X,Y=b;d.rectangle((x,y+dy,X,Y+dy),fill=C[c],outline=C[o] if o is not None else None)
   def l(pts,c,w=1):d.line([(x,y+dy) for x,y in pts],fill=C[c],width=w)
   def p(pts,c):d.polygon([(x,y+dy) for x,y in pts],fill=C[c],outline=C[0])
   for x in (18,27):r((x,34,x+5,44),1);r((x-2,44,x+6,47),0)
   p([(15,23),(29,23),(34,30),(30,36),(15,36),(12,29)],col)
   p([(17,10),(26,9),(30,13),(30,18),(32,19),(29,24),(20,24),(16,19)],32)
   p([(15,16),(15,11),(19,7),(27,8),(30,12),(25,13),(22,11),(18,16)],1)
   r((25,15,29,17),6);r((28,15,29,17),0,None);l([(26,21),(29,21)],0)
   if anim=='talk' and f%2:r((26,21,29,22),0,None)
   r((29,28,33,32),32)
   if who=='chad-frictionless':
    r((19,24,28,27),10);l([(18,11),(22,9),(27,10)],3);r((33,28,35,30),0)
   elif who=='rebel-intern-simran':
    p([(15,12),(10,8),(8,12),(11,22),(14,24)],1);r((12,12,15,14),20)
    for x,c in [(33,20),(36,17),(39,22)]:r((x,26,x+1,34),c)
    l([(18,26),(23,30),(28,26)],35)
   elif who=='sysadmin-karan':
    r((23,15,30,18),0);l([(24,16),(26,16)],4);l([(25,20),(29,20)],9)
    r((30,27,37,33),6);r((31,28,36,29),9,None);l([(38,28),(40,28),(40,31),(38,31)],6)
    r((17,29,21,34),1);r((18,30,20,31),35,None)
   elif who=='stuntman-jaggu':
    l([(16,11),(29,11)],20,2);r((15,29,19,33),6);r((26,37,31,40),3)
    p([(25,19),(29,19),(31,21),(27,22)],9);l([(18,25),(23,34),(28,25)],9,2)
   else:
    p([(16,11),(12,8),(10,13),(12,24),(16,24)],1);r((12,12,15,14),26)
    d.ellipse((32,8+dy,45,21+dy),outline=C[4],width=2);l([(39,21),(39,37)],3,2);r((37,12,40,18),0);r((38,13,39,16),35,None)
   sheet.paste(im,(f*48,row*48))
 file=f'sprites/npcs/{who}.png';sheet.save(A/file);m['sprites'][who]=dict(file=file,frameWidth=48,frameHeight=48,anims={a:dict(row=r,frames=4,fps=6,loop=True) for r,a in enumerate(['idle','talk'])})
manifest_path.write_text(json.dumps(m,indent=2)+'\n')
