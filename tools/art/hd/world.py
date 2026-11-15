"""Render Farm: three depth planes and a compatible six-column tile atlas."""
import math
from PIL import Image
from draw import Canvas,INK,BONE

def tile(i):
 c=Canvas(64,64)
 if i<9:
  c.rect((0,0,64,64),'#424e65');c.poly([(0,28),(64,18),(64,64),(0,64)],'#303c50',None)
  c.dots((6,28,60,62),'#252e40',12,1.5)
  if i in (0,1,2):
   c.rect((0,0,64,12),'#b4c1cb',INK,3);c.line([(0,14),(64,14)],'#121d32',5);c.line([(0,3),(64,3)],BONE,3)
  if i in (6,7,8):c.rect((0,53,64,64),'#182338');c.line([(0,53),(64,53)],INK,4)
  if i in (0,3,6):c.rect((0,12,8,64),'#26354b');c.line([(2,12),(2,64)],INK,4)
  if i in (2,5,8):c.rect((56,12,64,64),'#19273c');c.line([(61,12),(61,64)],INK,4)
  for x,y in ((14,22),(50,45)):
   c.ellipse((x-4,y-4,x+4,y+4),'#7b8ba0',INK,2);c.line([(x-1,y-1),(x+1,y+1)],'#c4d4dd',2)
 elif i in (9,10,11):
  c.rect((0,0,64,14),'#8397a9',INK,4);c.line([(0,4),(64,4)],'#c4dce7',3)
  c.line([(0,18),(64,18)],'#43e7ed',3)
  c.poly([(5,17),(17,17),(35,32),(30,39)],'#303c50',INK,4)
  if i!=10:c.rect((0 if i==9 else 57,0,7 if i==9 else 64,24),'#fecb56',INK,3)
 elif i==12:
  c.line([(0,35),(15,25),(30,40),(48,24),(64,29)],INK,12);c.line([(0,35),(15,25),(30,40),(48,24),(64,29)],'#9256a8',6)
  c.poly([(35,6),(25,25),(36,23),(30,47),(47,18),(36,20)],'#fecb56',INK,3)
 elif i in (13,14,15,16):
  c.rect((3,0,61,64),'#151d2b',INK,5);c.rect((10,0,54,64),'#414f64',INK,3)
  if i in (15,16):c.rect((14,0,52,64),'#080f1a');c.line([(13,0),(13,64)],'#71ceb0',3)
  else:
   c.line([(32,0),(32,64)],INK,4);c.poly([(13,14),(26,14),(26,23),(13,23)],'#b4c1cb',None)
   c.rect((39,32,47,47),'#ff2f36' if i==13 else '#43e7ed',INK,3,2)
  c.line([(6,0),(6,64)],'#697b8e',3)
 elif i in (17,18,19):
  c.poly([(19,44),(45,44),(51,60),(12,60)],'#414f64',INK,4)
  c.rect((3,7,59,47),'#697b8e',INK,5,7);c.rect((10,13,52,37),'#173f47' if i!=17 else '#222936',INK,3,4)
  if i!=17:
   c.line([(16,20),(23,25),(16,30)],'#71ceb0',3);c.line([(30,30),(44,30)],'#b5fbec',3)
  c.ellipse((49,40,54,45),'#ff2f36' if i==17 else '#71ceb0')
 elif i==20:
  c.poly([(10,5),(55,8),(52,59),(6,55)],'#c4c3c5',INK,4);c.rect((15,14,45,44),'#573265');c.poly([(18,40),(28,21),(42,40)],'#ff76a5',None)
  c.line([(16,50),(43,51)],INK,3)
 elif i==21:
  for x in (10,29,48):c.rect((x,4,x+7,60),'#43e7ed',INK,3,3)
 elif i in (22,32):
  pts=[(0,22),(34,22),(34,64)] if i==22 else [(0,24),(64,24)]
  c.line(pts,INK,18);c.line(pts,'#414f64',11);c.line([(x,y-3) for x,y in pts],'#7b8ba0',3)
  for x in (8,48):c.rect((x,14,x+5,34),'#fecb56',INK,2)
 elif i in (23,24):
  c.rect((0,21,64,64),'#6a4853',INK,4);c.rect((0,18,64,29),'#d3bea0',INK,4)
  c.rect((12,3,32,19),'#f0e5ce',INK,3,3);c.ellipse((29,5,42,17),None,INK,3)
 elif i==25:
  c.poly([(16,39),(49,39),(44,61),(22,61)],'#9256a8',INK,4)
  for x,y in ((12,12),(43,6),(56,26)):c.line([(32,43),(x,y)],'#17655d',5);c.ellipse((x-9,y-5,x+6,y+9),'#279a7d',INK,3)
 elif i in (26,30,34):
  c.rect((7,2,57,63),'#333e55',INK,5,4);c.line([(12,6),(12,58)],'#8196ad',3)
  if i==26:
   for y,r in ((19,10),(45,14)):c.ellipse((32-r,y-r,32+r,y+r),'#142132',INK,3);c.ellipse((28,y-4,36,y+4),'#697b8e')
  else:
   for y in (9,25,41):
    c.rect((17,y,49,y+12),'#182438',INK,2,2)
    c.line([(22,y+4),(35,y+4)],'#697b8e',3);c.ellipse((42,y+4,46,y+8),'#ff2f36' if i==34 else '#71ceb0')
 elif i in (27,31):
  c.rect((4,4,60,60),'#414f64',INK,5,5)
  if i==27:
   for y in range(14,55,9):c.line([(13,y),(51,y-3)],INK,4)
  else:
   c.ellipse((11,11,53,53),'#182438',INK,3)
   for k in range(4):
    a=k*math.pi/2;pts=[(32,32)]+[(32+math.cos(a+t)*r,32+math.sin(a+t)*r) for t,r in ((0,7),(.1,19),(.8,18),(1.1,9))];c.poly(pts,'#8196ad',INK,3)
   c.ellipse((27,27,37,37),'#43e7ed',INK,3)
 elif i==28:
  c.poly([(6,21),(46,7),(54,26),(14,41)],'#fecb56',INK,3);c.line([(17,25),(40,18)],INK,4)
 elif i==29:
  c.line([(32,0),(32,19)],INK,5);c.poly([(22,17),(43,17),(56,34),(9,34)],'#697b8e',INK,4);c.line([(15,37),(50,37)],'#b5fbec',5)
 elif i==33:
  c.rect((0,0,64,64),'#fecb56',INK,4)
  for x in (-32,0,32,64):c.poly([(x,0),(x+15,0),(x+55,64),(x+40,64)],INK,None)
 else:
  c.rect((4,4,60,60),'#333e55',INK,4);c.ellipse((18,18,46,46),'#8196ad',INK,4);c.line([(25,25),(39,39)],INK,4)
 return c.finish()

def background(layer,saturated):
 c=Canvas(1920,1080,ss=2);g=c.group(0,0,4)
 if saturated:p={'far':'#475b76','air':'#8aabb9','edge':'#657f98','mid':'#263953','deep':'#132138','lit':'#43e7ed','alert':'#ff2f36','warm':'#fecb56','metal':'#516783'}
 else:p={'far':'#8b8986','air':'#c8c4b9','edge':'#aaa59c','mid':'#686970','deep':'#363b46','lit':'#b4bdba','alert':'#9f7669','warm':'#bba884','metal':'#898a8e'}
 if layer=='far':
  g.rect((0,0,480,270),p['air']);g.poly([(0,180),(480,130),(480,270),(0,270)],p['edge'],None)
  # Silhouette tiers, bridges and exhaust ducts; repeating at the horizontal seam.
  for x,h in [(-18,93),(48,120),(119,74),(195,105),(276,69),(350,113),(438,93)]:
   g.poly([(x,210),(x,270-h),(x+12,260-h),(x+46,260-h),(x+55,270-h),(x+55,210)],p['far'],None)
   g.rect((x+8,275-h,x+42,208),p['edge'])
   for yy in range(280-h,199,15):g.line([(x+12,yy),(x+38,yy)],p['air'],1.5)
   g.line([(x+17,260-h),(x+17,245-h),(x+38,245-h)],p['far'],5)
  for y in (120,173):g.line([(0,y),(480,y)],p['far'],4);g.line([(0,y-3),(480,y-3)],p['edge'],2)
  g.dots((0,218,480,270),p['far'],12,.65)
 elif layer=='mid':
  # Massive rack islands with boxed cel shadows and recessed fan clusters.
  for x in (-12,112,236,360):
   g.rect((x,69,x+98,258),p['deep'],INK,2,3);g.poly([(x+2,72),(x+16,62),(x+106,62),(x+98,72)],p['metal'],INK,1.5)
   g.poly([(x+98,72),(x+106,62),(x+106,248),(x+98,258)],p['mid'],INK,1.5)
   for yy in (80,119,158,197):
    g.rect((x+8,yy,x+88,yy+31),p['mid'],INK,1.5,2)
    g.rect((x+13,yy+5,x+57,yy+25),p['deep'])
    for xx in range(17,55,6):g.line([(x+xx,yy+9),(x+xx,yy+21)],p['metal'],1)
    for xx in (66,77):g.ellipse((x+xx,yy+8,x+xx+4,yy+12),p['lit'])
    g.line([(x+66,yy+20),(x+82,yy+20)],p['warm'] if yy==158 else p['metal'],1.5)
   if x==236:
    # One cooling stack interrupts the rack rhythm with huge recessed turbines.
    for cy in (116,197):
     g.rect((x+8,cy-35,x+88,cy+35),p['metal'],INK,2,3)
     g.ellipse((x+15,cy-32,x+81,cy+32),p['deep'],INK,2)
     for k in range(5):
      a=k*math.pi*2/5
      pts=[(x+48,cy)]+[(x+48+math.cos(a+t)*r,cy+math.sin(a+t)*r) for t,r in ((0,9),(.1,28),(.75,26),(1.1,11))]
      g.poly(pts,p['edge'],INK,1.5)
     g.ellipse((x+40,cy-8,x+56,cy+8),p['mid'],INK,1.5)
     g.ellipse((x+45,cy-3,x+51,cy+3),p['lit'])
   g.line([(x+4,77),(x+4,244)],p['edge'],1.5)
   g.dots((x+11,232,x+90,253),p['metal'],7,.6)
   # Top cable trunks route toward a distant overhead bus.
   g.path((x+32,65),[(x+33,47,x+73,48,x+73,26),(x+73,0)],None,p['deep'],5,False)
   g.path((x+32,65),[(x+33,47,x+73,48,x+73,26),(x+73,0)],None,p['metal'],2,False)
  g.rect((0,20,480,28),p['deep'],INK,1.5)
  for x in range(8,480,40):g.line([(x,22),(x+20,22)],p['lit'],1)
 else:
  # Sparse foreground frame: leave the action plane and floor readable.
  for x in (0,468):
   g.rect((x,0,x+12,270),p['deep'],INK,2);g.line([(x+3,0),(x+3,270)],p['metal'],1.5)
   for y in range(19,270,43):g.ellipse((x+4,y,x+8,y+4),p['edge'])
  for shift in (0,12):
   g.path((-12,-4+shift),[(78,16+shift,118,49+shift,211,25+shift),(328,-1+shift,365,57+shift,492,11+shift)],None,INK,5,False)
   g.path((-12,-4+shift),[(78,16+shift,118,49+shift,211,25+shift),(328,-1+shift,365,57+shift,492,11+shift)],None,p['mid'],2.5,False)
  for x in (59,283,413):
   g.line([(x,0),(x,39)],INK,2);g.poly([(x-9,38),(x+9,38),(x+15,46),(x-15,46)],p['metal'],INK,1.5);g.line([(x-10,48),(x+10,48)],p['lit'],2)
  g.rect((0,263,480,270),p['deep']);g.line([(0,263),(480,263)],p['metal'],1.5)
 return c.finish()
def build(root):
 atlas=Image.new('RGBA',(384,384))
 for i in range(36):atlas.paste(tile(i),(i%6*64,i//6*64))
 atlas.save(root/'hd/tiles/render-farm.png');images={}
 for layer in ('far','mid','near'):
  for state in ('drained','saturated'):
   key=f'bg-render-farm-{layer}-{state}';file=f'hd/backgrounds/{key}.png';background(layer,state=='saturated').save(root/file);images[key]={'file':file}
 return {'render-farm':dict(file='hd/tiles/render-farm.png',tileSize=64,notes='Same 6-column indices as docs/art/tiles-render-farm.md')},images
