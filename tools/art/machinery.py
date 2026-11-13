from crew import A,C
from PIL import Image,ImageDraw
import math,json

def frame(name,w,h,anim,f):
 im=Image.new('RGBA',(w,h)); d=ImageDraw.Draw(im)
 def r(b,c,o=0): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
 def l(p,c,width=1): d.line(p,fill=C[c],width=width)
 def poly(p,c): d.polygon(p,fill=C[c],outline=C[0])
 if name=='catwalk':
  for tile in range(3):
   x=tile*16
   if anim=='broken':
    poly([(x+2,13),(x+5,10),(x+10,13),(x+13,15),(x+3,15)],3)
   else:
    dy=0 if anim=='intact' else min(5,f*(1+tile%2))
    r((x,dy,x+15,dy+4),3); l([(x+1,dy+1),(x+14,dy+1)],5)
    poly([(x+1,dy+5),(x+6,dy+10),(x+10,dy+10),(x+14,dy+5)],2)
    l([(x+3,dy+5),(x+7,dy+8),(x+11,dy+5)],4)
    if anim=='crumble': l([(x+7,dy),(x+5,dy+2),(x+9,dy+4)],0)
 elif name=='server-crate':
  if anim=='smash':
   for k in range(4):
    x=2+k*7; y=min(28,16+f*3+(k%2)*2)
    poly([(x,y),(x+4,y-3),(min(31,x+7),y+2),(x+2,min(31,y+4))],3)
   l([(4,28),(8,25),(12,29),(16,26)],20)
  else:
   y=2 if anim=='idle' else f*2+2
   r((4,y,27,min(31,y+27)),1); r((5,y+1,26,min(30,y+26)),2)
   for sy in (y+4,y+10,y+16):
    r((7,sy,24,sy+4),0); l([(9,sy+1),(18,sy+1)],4); r((21,sy+1,22,sy+2),20 if anim=='fall' else 29,None)
   r((8,y+23,23,min(30,y+24)),3)
   if anim=='fall': l([(1,1),(1,9)],5); l([(30,3),(30,11)],5)
 elif name=='steam-vent':
  r((1,23,14,31),2); l([(2,24),(13,24)],5)
  for x in (3,6,9,12): l([(x,26),(x,29)],0)
  if anim=='idle': l([(7,21),(6+f,18),(8,15)],4)
  else:
   for k in range(3):
    x=3+k*4; y=3+(k%2)*4+f%2
    d.ellipse((max(0,x-3),y,min(15,x+3),y+9),fill=C[5],outline=C[3])
    l([(x,22),(x+(-1 if k%2 else 1)*2,14),(x,8)],6,2)
 elif name=='big-fan':
  r((2,2,45,45),2); r((3,3,44,44),3); d.ellipse((5,5,42,42),fill=C[0],outline=C[4],width=2)
  for k in range(4):
   a=k*math.pi/2+(.3 if anim=='frozen' else f*math.pi/8)
   pts=[(24,24)]+[(24+round(math.cos(a+da)*rad),24+round(math.sin(a+da)*rad)) for da,rad in [(0,17),(.7,17),(1,8)]]
   poly(pts,18 if anim=='frozen' else 3)
  d.ellipse((20,20,28,28),fill=C[35 if anim=='frozen' else 38],outline=C[0])
  for x,y in [(5,5),(40,5),(5,40),(40,40)]: r((x,y,x+2,y+2),4)
  if anim=='frozen':
   for x,y in [(12,10),(33,31),(13,35)]:
    l([(x-4,y),(x+4,y)],36); l([(x,y-4),(x,y+4)],36); l([(x-3,y-3),(x+3,y+3)],35)
 return im
p=A/'manifest.json'; m=json.loads(p.read_text())
for name,w,h,anims in [('catwalk',48,16,[('intact',1),('crumble',4),('broken',1)]),('server-crate',32,32,[('idle',1),('fall',2),('smash',4)]),('steam-vent',16,32,[('idle',2),('burst',4)]),('big-fan',48,48,[('idle',4),('frozen',1)])]:
 im=Image.new('RGBA',(w*max(n for _,n in anims),h*len(anims)))
 for row,(anim,n) in enumerate(anims):
  for f in range(n): im.paste(frame(name,w,h,anim,f),(f*w,row*h))
 file=f'sprites/props/{name}.png'; im.save(A/file)
 m['sprites'][name]=dict(file=file,frameWidth=w,frameHeight=h,anims={a:dict(row=r,frames=n,fps=10,loop=a in ('idle','intact','broken','frozen','fall')) for r,(a,n) in enumerate(anims)})
p.write_text(json.dumps(m,indent=2)+'\n')
