"""Soundstage kit and family-unit boss, based on ep2-rooms.md."""
from crew import A,C,ROOT
from PIL import Image,ImageDraw
import json,math
# Retain the canonical first 19 gameplay indices from HQ, then author stage decor.
im=Image.open(A/'tiles/hq.png').copy()
names=['green-screen void','tracking cross','scaffold upright','scaffold cross','spotlight','light cone','vanity mirror','prop crate','cardboard rocket','rubber boulder','picket fence','turf','saloon facade','film reel','hanging rope','clapper prop','paint splats']
for i,name in enumerate(names,19):
 tile=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(tile)
 def r(b,c,o=0): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
 def l(p,c,w=1): d.line(p,fill=C[c],width=w)
 def p(points,c): d.polygon(points,fill=C[c],outline=C[0])
 if i in (19,20):
  r((0,0,15,15),27,None)
  if i==20: l([(5,8),(11,8)],0); l([(8,5),(8,11)],0)
 elif i in (21,22):
  r((1,0,3,15),3); r((12,0,14,15),3)
  if i==22: l([(3,1),(12,14)],4,2); l([(12,1),(3,14)],4,2)
  else: l([(3,7),(12,7)],4,2)
 elif i==23:
  l([(7,0),(7,4)],3,2); p([(3,4),(10,3),(13,8),(6,12),(2,8)],1); l([(8,5),(11,8)],22,2)
 elif i==24: p([(6,0),(9,0),(15,15),(0,15)],14)
 elif i==25:
  r((2,1,13,15),23); r((4,3,11,13),18); l([(5,11),(9,5)],19)
  for x,y in [(2,3),(2,8),(13,3),(13,8),(5,1),(10,1)]: r((x,y,x+1,y+1),22,None)
 elif i==26:
  r((0,0,15,15),11); l([(1,1),(14,14)],9,2); l([(14,1),(1,14)],9,2)
 elif i==27: p([(8,0),(12,7),(11,12),(14,15),(9,13),(5,15),(5,12),(4,7)],6); r((6,6,9,8),18)
 elif i==28: p([(2,5),(7,2),(12,4),(15,9),(12,14),(3,14),(0,9)],3); l([(3,7),(7,4),(11,5)],4)
 elif i==29:
  for x in (1,7,13): p([(x,1),(x+2,4),(x+2,15),(x,15)],6)
  l([(0,7),(15,7)],5,2)
 elif i==30:
  r((0,5,15,15),27,None)
  for x in range(0,16,3): l([(x,6),(x+1,2),(x+2,6)],29)
 elif i==31:
  r((0,3,15,15),11); r((2,7,5,13),9); r((10,7,13,13),9); r((0,0,15,3),23)
 elif i==32:
  d.ellipse((1,1,14,14),fill=C[3],outline=C[0])
  for x,y in [(5,3),(9,5),(6,9)]: d.ellipse((x,y,x+3,y+3),fill=C[0])
 elif i==33: l([(7,0),(7,15)],9,3); l([(8,0),(8,15)],12)
 elif i==34:
  r((1,6,14,14),1); p([(1,5),(12,1),(14,4),(2,8)],6); l([(4,11),(10,11)],6)
 else:
  for x,y,c in [(3,5,20),(10,3,22),(9,11,17)]: d.ellipse((x-2,y-2,x+2,y+2),fill=C[c])
 im.paste(tile,((i%6)*16,(i//6)*16))
im.save(A/'tiles/the-set.png')
base=(ROOT/'docs/art/tiles-hq.md').read_text().splitlines(); doc='# The Set · 16×16\n\n96×96; six columns. Indices 0–18 preserve HQ meanings, including concrete blob 0–8. Stage greens are intentionally opaque scenery; no key colour removal.\n\n| Index | Meaning | Use |\n|---|---|---|\n'
for row in base:
 if row.startswith('| ') and row.split('|')[1].strip().isdigit() and int(row.split('|')[1])<19: doc+=row+'\n'
for i,name in enumerate(names,19): doc+=f'| {i} | {name} | decor |\n'
(ROOT/'docs/art/tiles-the-set.md').write_text(doc)
# Parallax: opaque cyclorama, practical facades, near theatrical trusses.
pth=A/'manifest.json'; m=json.loads(pth.read_text()); m['tilesets']['the-set']=dict(file='tiles/the-set.png',tileSize=16,notes='see docs/art/tiles-the-set.md; six columns')
for depth in ['far','mid','near']:
 for state in ['drained','saturated']:
  bg=Image.new('RGBA',(480,270)); d=ImageDraw.Draw(bg); sat=state=='saturated'
  def rect(b,c):
   x,y,X,Y=b
   for off in (-480,0,480): d.rectangle((x+off,y,X+off,Y),fill=C[c])
  def line(points,c,w=1):
   for off in (-480,0,480): d.line([(x+off,y) for x,y in points],fill=C[c],width=w)
  if depth=='far':
   rect((0,0,479,269),27 if sat else 12); rect((0,220,479,269),9)
   for x in range(30,480,80):
    for y in (60,140): line([(x-4,y),(x+4,y)],29 if sat else 11); line([(x,y-4),(x,y+4)],29 if sat else 11)
   for y in (12,26): line([(0,y),(479,y)],2,3)
  elif depth=='mid':
   for x in range(-20,480,120):
    rect((x,139,x+90,260),9); rect((x+4,143,x+86,259),23 if sat else 11)
    rect((x+10,127,x+80,141),1); rect((x+14,130,x+76,136),20 if sat else 12)
    for wx in (14,57): rect((x+wx,158,x+wx+20,190),0); rect((x+wx+2,160,x+wx+18,188),18 if sat else 10)
    rect((x+36,202,x+54,259),0); line([(x+90,140),(x+110,260)],2,4)
    # Exposed diagonal braces reveal the facade is a prop.
    line([(x+92,190),(x+106,238)],3,2)
  else:
   for y in (8,23): line([(0,y),(479,y)],0,4)
   for x in range(0,480,24): line([(x,8),(x+24,23)],3,2)
   for x in range(-20,480,160):
    line([(x,0),(x,269)],0,5); line([(x+10,0),(x+10,269)],2,2)
    rect((x+31,25,x+56,41),0); rect((x+34,29,x+53,38),22 if sat else 12)
    line([(x+43,24),(x+43,14)],3,3)
    rect((x+32,244,x+100,269),0); rect((x+37,249,x+95,269),1)
  file=f'backgrounds/the-set-{depth}-{state}.png'; bg.save(A/file); m['images'][f'bg-the-set-{depth}-{state}']={'file':file}
# Dad, Mom, Teen, Dog fused to a single corporate sweater mass.
size=128; anims=['idle','telegraph','attack-thumbs-up','attack-handshake','hurt','die']; sheet=Image.new('RGBA',(size*4,size*6))
for row,anim in enumerate(anims):
 for f in range(4):
  im=Image.new('RGBA',(128,128)); d=ImageDraw.Draw(im); bob=[0,1,0,-1][f] if anim=='idle' else 0
  def r(b,c): x,y,X,Y=b; d.rectangle((x,y+bob,X,Y+bob),fill=C[c],outline=C[0])
  def line(p,c,w=1): d.line([(x,y+bob) for x,y in p],fill=C[c],width=w)
  d.polygon([(23,53),(100,53),(112,98),(100,114),(25,114),(13,98)],fill=C[11],outline=C[0])
  for x in (29,83): r((x,106,x+14,123),9); r((x-3,121,x+19,127),0)
  for x,y,kind in [(22,22,'dad'),(70,19,'mom'),(48,48,'teen')]:
   r((x,y,x+26,y+29),13); r((x+2,y,x+24,y+6),9 if kind!='mom' else 10)
   if kind=='mom': r((x-3,y+6,x+2,y+30),10); r((x+24,y+6,x+29,y+30),10)
   for ex in (6,18): r((x+ex,y+12,x+ex+2,y+14),0)
   r((x+6,y+20,x+21,y+25),6); line([(x+7,y+22),(x+20,y+22)],11)
  # Retriever head sharing the lower-right shoulder.
  r((83,74,109,97),12); r((79,76,85,93),10); r((107,76,113,93),10); r((91,87,104,99),13); r((95,88,101,91),0)
  for x in (89,104): r((x,81,x+2,83),0)
  reach=[0,2,5,3][f] if anim=='attack-handshake' else 0
  armY=[69,55,42,35][f] if anim=='telegraph' else 63
  line([(25,72),(12,armY),(7,armY-10)],0,9); line([(25,72),(12,armY),(7,armY-10)],12,7)
  line([(102,67),(115,61),(117+reach,80)],0,9); line([(102,67),(115,61),(117+reach,80)],12,7)
  if anim=='attack-thumbs-up':
   for x,y in [(8,25+f*3),(112,8+f*3)]: r((x,y,x+8,y+12),13); r((x+5,y-6,x+8,y),13)
  if anim=='attack-handshake': r((109+reach,78,121+reach,86),13)
  if anim=='hurt': line([(107,8),(115,16)],22,2); line([(115,8),(107,16)],22,2)
  if anim=='die':
   # Collapse the shared body into a flattened stock-photo pile.
   h=128-f*25; squash=im.resize((128,h),Image.Resampling.NEAREST); im=Image.new('RGBA',(128,128)); im.paste(squash,(0,128-h))
  sheet.paste(im,(f*128,row*128))
file='sprites/bosses/stock-photo-family.png'; sheet.save(A/file)
m['sprites']['stock-photo-family']=dict(file=file,frameWidth=128,frameHeight=128,anims={a:dict(row=r,frames=4,fps=6 if a=='telegraph' else 9,loop=a=='idle',**({'hitFrame':2} if a.startswith('attack') else {})) for r,a in enumerate(anims)})
pth.write_text(json.dumps(m,indent=2)+'\n')
