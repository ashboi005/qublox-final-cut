"""Low-contrast environmental dressing; anchors at the frame bottom."""
from crew import A,C,ROOT
from PIL import Image,ImageDraw
import json
ITEMS=[('water-cooler',24,40,1,'hq'),('chai-crate',32,24,1,'hq'),('mood-board',48,32,1,'hq'),('beanbag',32,24,1,'hq'),('server-rack',32,48,4,'render-farm'),('cable-spaghetti',48,24,1,'render-farm'),('warning-sign',24,32,1,'render-farm'),('coolant-drum',24,32,1,'render-farm'),('c-stand',32,48,1,'the-set'),('clapperboard',24,24,1,'the-set'),('director-chair',32,32,1,'the-set'),('sandbag',32,16,1,'the-set'),('ring-light',32,48,4,'the-feed'),('neon-heart',32,32,1,'the-feed'),('phone-tripod',24,40,1,'the-feed'),('trending-arrow',32,32,1,'the-feed'),('plastic-ficus',32,48,1,'templatr'),('motivational-poster',32,40,1,'templatr'),('standing-desk',48,32,1,'templatr'),('beige-cubicle',48,32,1,'templatr')]
manifest_path=A/'manifest.json';m=json.loads(manifest_path.read_text());(A/'sprites/decor').mkdir(exist_ok=True)
for name,w,h,n,district in ITEMS:
 sheet=Image.new('RGBA',(w*n,h))
 for f in range(n):
  im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
  def r(b,c,o=1):d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
  def l(pts,c,width=1):d.line(pts,fill=C[c],width=width)
  def p(pts,c):d.polygon(pts,fill=C[c],outline=C[1])
  if name=='water-cooler':
   r((6,2,17,16),18);r((8,4,10,12),19,None);r((4,17,19,38),4);r((7,20,16,30),2);r((9,22,11,24),9,None);r((14,22,16,24),18,None);r((7,34,16,36),3,None);r((4,38,7,39),1);r((16,38,19,39),1)
  elif name=='chai-crate':
   r((1,11,30,23),9)
   for y in (13,18):l([(3,y),(28,y)],11)
   for x in (5,13,21):r((x,5,x+5,12),12);r((x+1,6,x+4,7),9,None)
   l([(7,4),(6,2)],4);l([(23,4),(24,1)],4)
  elif name=='mood-board':
   r((1,1,46,31),9);r((3,3,44,29),11)
   for x,y,c in [(6,6,13),(21,5,5),(33,8,12),(8,18,12),(23,19,13)]:
    r((x,y,x+9,y+8),c);l([(x+2,y+3),(x+7,y+3)],9);l([(x+2,y+5),(x+5,y+5)],10)
   for x,y in [(10,5),(26,18),(36,7)]:r((x,y,x+2,y+1),4,None)
  elif name=='beanbag':p([(3,23),(0,18),(5,11),(9,3),(19,2),(25,9),(31,18),(28,23)],24);l([(10,5),(8,15),(19,19),(27,18)],25)
  elif name=='server-rack':
   r((4,1,27,47),1);r((6,3,25,45),2)
   for i,y in enumerate(range(6,41,8)):
    r((8,y,23,y+5),1);l([(9,y+2),(18,y+2)],3);r((21,y+2,22,y+3),29 if i==f else 9,None)
   r((8,44,23,46),3)
  elif name=='cable-spaghetti':
   for i,col in enumerate([9,18,24,3,10]):
    pts=[(0,6+i*3),(8+i*2,6+i*3),(15+i*2,18-i*2),(31,18-i*2),(38,5+i*3),(47,5+i*3)]
    l(pts,1,3);l(pts,col)
   r((14,17,18,23),2);r((35,4,38,17),2)
  elif name=='warning-sign':
   p([(4,31),(8,3),(16,3),(21,31)],9);p([(5,27),(9,6),(15,6),(19,27)],11)
   p([(12,10),(17,21),(7,21)],23);l([(12,14),(12,17)],1);d.point((12,19),fill=C[1])
  elif name=='coolant-drum':
   r((3,5,20,30),18);d.ellipse((3,2,20,8),fill=C[3],outline=C[1]);l([(4,14),(19,14)],3);l([(4,24),(19,24)],3);r((9,16,14,21),4)
  elif name=='c-stand':
   l([(15,4),(15,44)],3,3);l([(15,44),(4,47)],2,2);l([(15,44),(27,47)],2,2);l([(15,44),(19,47)],3)
   l([(15,10),(27,4)],3,2);r((24,2,29,6),2);r((12,21,18,25),2)
  elif name=='clapperboard':
   r((2,11,21,23),2);p([(2,10),(18,4),(21,8),(3,14)],5)
   for x,y in [(6,9),(12,7),(17,5)]:l([(x,y),(x+2,y+3)],2,2)
   l([(5,17),(17,17)],4);l([(5,20),(12,20)],3)
  elif name=='director-chair':
   for pts in [[(7,13),(24,31)],[(24,13),(7,31)],[(5,3),(6,23)],[(25,3),(25,23)]]:l(pts,9,2)
   r((6,4,24,12),2);r((5,20,26,23),2);l([(9,8),(21,8)],3)
  elif name=='sandbag':
   p([(2,15),(1,8),(5,4),(14,3),(20,5),(29,5),(31,12),(28,15)],10);l([(6,6),(11,12),(25,13)],11);l([(20,5),(21,10)],9)
  elif name=='ring-light':
   d.ellipse((5,2,27,24),outline=C[2],width=4);d.ellipse((7,4,25,22),outline=C[19 if f%2 else 4],width=2)
   l([(16,24),(16,44)],3,2);l([(16,42),(5,47)],2,2);l([(16,42),(27,47)],2,2);r((13,10,19,19),1);r((14,12,18,16),3)
  elif name=='neon-heart':
   pts=[(4,8),(9,5),(16,11),(23,5),(28,8),(29,14),(16,29),(3,14),(4,8)]
   l(pts,1,4);l(pts,25,2);l([(10,4),(22,4)],2)
  elif name=='phone-tripod':
   r((8,2,16,16),1);r((10,4,14,12),18);l([(12,17),(12,34)],3,2);l([(12,32),(3,39)],2,2);l([(12,32),(21,39)],2,2)
  elif name=='trending-arrow':p([(3,25),(12,16),(8,12),(27,4),(26,23),(21,19),(11,29)],18);l([(5,25),(14,16)],19)
  elif name=='plastic-ficus':
   p([(9,35),(24,35),(21,47),(12,47)],11);l([(16,37),(16,8)],9,2)
   for pts in [[(16,15),(6,6),(5,14),(16,20)],[(16,24),(26,13),(27,23),(17,28)],[(15,30),(3,20),(5,30),(15,34)]]:p(pts,10)
   l([(7,11),(13,16)],11);l([(24,19),(19,25)],11)
  elif name=='motivational-poster':
   r((2,1,29,39),9);r((4,3,27,37),13)
   p([(6,25),(12,15),(17,22),(21,11),(25,25)],11);d.ellipse((7,7,12,12),fill=C[12])
   l([(8,30),(23,30)],9,2);l([(11,34),(20,34)],11)
  elif name=='standing-desk':
   r((2,13,45,16),11);r((6,17,8,31),9);r((39,17,41,31),9);r((16,1,32,10),9);r((18,3,30,8),12);l([(24,10),(24,13)],9,2);r((10,12,20,12),9);r((36,9,40,12),13)
  else:
   r((1,4,46,31),11);r((3,6,44,30),13);r((24,16,44,19),12);r((29,9,40,15),9);r((31,11,38,13),12);r((3,22,20,25),12);l([(23,6),(23,31)],11)
  sheet.paste(im,(f*w,0))
 file=f'sprites/decor/{name}.png';sheet.save(A/file);m['sprites']['decor-'+name]=dict(file=file,frameWidth=w,frameHeight=h,anims={'idle':dict(row=0,frames=n,fps=4,loop=True)})
manifest_path.write_text(json.dumps(m,indent=2)+'\n')
doc='# District decor placement index\n\nAll props have idle rows and bottom-of-frame anchors. Place with @decor key tx ty; scenery only. Muted outlines and restrained highlights avoid enemy/platform silhouettes.\n\n| District | Key | Frame | Frames |\n|---|---|---|---|\n'
for name,w,h,n,district in ITEMS:doc+=f'| {district} | decor-{name} | {w}×{h} | {n} |\n'
(ROOT/'docs/art/decor.md').write_text(doc)
