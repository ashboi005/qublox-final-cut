from crew import A,C
from PIL import Image,ImageDraw
import json,math
manifest_path=A/'manifest.json';m=json.loads(manifest_path.read_text())
anims=['idle','telegraph','attack-clickbait','attack-mortar','attack-autoplay','attack-lunge','stunned','hurt','die']
sheet=Image.new('RGBA',(384,96*len(anims)))
for row,anim in enumerate(anims):
 for f in range(4):
  im=Image.new('RGBA',(96,96));d=ImageDraw.Draw(im);shift=-f*2 if anim=='attack-lunge' else 0;bob=f%2 if anim=='idle' else 0
  def r(b,c,o=0):x,y,X,Y=b;d.rectangle((x+shift,y+bob,X+shift,Y+bob),fill=C[c],outline=C[o] if o is not None else None)
  def l(pts,c,w=1):d.line([(x+shift,y+bob) for x,y in pts],fill=C[c],width=w)
  def p(pts,c):d.polygon([(x+shift,y+bob) for x,y in pts],fill=C[c],outline=C[0])
  # Main face points LEFT. Layered plates cover left front; bare cable/core is right rear.
  p([(25,23),(66,15),(79,30),(74,69),(60,82),(28,75),(19,54)],2)
  for y in (24,38,52):p([(19,y),(41,y-7),(46,y+9),(21,y+13),(11,y+5)],4 if anim!='telegraph' else 22)
  l([(22,27),(34,23)],6,2);l([(17,46),(32,43)],35,2)
  # Three stacked malicious post cards.
  for x,y in [(37,20),(42,39),(38,58)]:
   r((x,y,x+25,y+17),0);r((x+1,y+1,x+24,y+4),26 if anim!='stunned' else 3,None);p([(x+8,y+7),(x+17,y+11),(x+8,y+15)],13)
  for y in (33,43,53,63):l([(66,y),(80,y-3),(84,y+3)],20 if y%3 else 35,2)
  d.ellipse((70+shift,35+bob,88+shift,61+bob),fill=C[20 if anim!='stunned' else 22],outline=C[0],width=2)
  l([(78,40),(81,46),(77,54)],6,2)
  for x in (33,58):p([(x,75),(x+10,76),(x+15,88),(x-3,88)],1)
  if anim=='telegraph':l([(8,7),(8,16)],20,3);r((7,20,9,22),22,None)
  if anim=='attack-clickbait':
   r((1,36-f*3,17,47-f*3),13);r((2,37-f*3,16,39-f*3),20,None)
  if anim=='attack-mortar':
   for x,y in [(22,9+f*2),(53,4+f*3)]:d.ellipse((x,y,x+9,y+9),fill=C[20],outline=C[0]);l([(x+2,y+3),(x+4,y+4)],0);l([(x+7,y+3),(x+5,y+4)],0)
  if anim=='attack-autoplay':
   d.arc((2,16,70,84),f*50,f*50+250,fill=C[35],width=2)
  if anim=='hurt':l([(76,13),(84,21)],22,2);l([(84,13),(76,21)],22,2)
  if anim=='stunned':
   for x,y in [(25,10),(63,8),(83,73)]:l([(x-3,y),(x+3,y)],22);l([(x,y-3),(x,y+3)],22)
  if anim=='die':
   h=96-f*20;crop=im.resize((96,h),Image.Resampling.NEAREST);im=Image.new('RGBA',(96,96));im.paste(crop,(0,96-h))
  sheet.paste(im,(f*96,row*96))
file='sprites/bosses/the-algorithm.png';sheet.save(A/file)
m['sprites']['the-algorithm']=dict(file=file,frameWidth=96,frameHeight=96,anims={a:dict(row=r,frames=4,fps=6 if a=='telegraph' else 10,loop=a in ('idle','stunned'),**({'hitFrame':2} if a.startswith('attack') else {})) for r,a in enumerate(anims)})
for name,w,h,n in [('echo',16,24,4),('rage-vent',24,10,2),('rage',12,12,4),('clickbait',14,10,4),('deleted-posts',32,32,4)]:
 sheet=Image.new('RGBA',(w*n,h))
 for f in range(n):
  im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
  if name=='echo':
   d.rectangle((3,1,12,23),fill=C[1],outline=C[0])
   for y in (6,16):d.ellipse((5, y-3,10,y+3),fill=C[3],outline=C[0])
   d.arc((max(0,5-f),7,min(15,10+f),23),-80,80,fill=C[35])
  elif name=='rage-vent':
   d.rectangle((1,0,22,4),fill=C[3],outline=C[0]);d.polygon([(6,4),(18,4),(15,9),(9,9)],fill=C[21 if f==0 else 20],outline=C[0])
  elif name=='rage':
   d.ellipse((1,1,10,10),fill=C[20 if f%2 else 38],outline=C[0]);d.line([(2,3),(5,5)],fill=C[0]);d.line([(9,3),(6,5)],fill=C[0]);d.line([(4,8),(7,8)],fill=C[0])
  elif name=='clickbait':
   d.rectangle((0,1,13,9),fill=C[13],outline=C[0]);d.rectangle((1,2,12,3),fill=C[26 if f%2 else 20]);d.polygon([(5,5),(9,6),(5,8)],fill=C[0])
  else:
   d.rectangle((0,0,31,31),fill=C[1])
   for x,y in [(2,2),(18,18)]:
    d.rectangle((x,y,x+11,y+10),fill=C[2],outline=C[0]);d.line([(x+2,y+2),(x+9,y+8)],fill=C[21 if f%2 else 20]);d.line([(x+9,y+2),(x+2,y+8)],fill=C[21])
   for y in (14,30):d.line([(0,y),(31,y)],fill=C[34 if f%2 else 9])
  sheet.paste(im,(f*w,0))
 file=f'sprites/props/{name}.png';sheet.save(A/file);m['sprites'][name]=dict(file=file,frameWidth=w,frameHeight=h,anims={'idle':dict(row=0,frames=n,fps=9,loop=True)})
manifest_path.write_text(json.dumps(m,indent=2)+'\n')
