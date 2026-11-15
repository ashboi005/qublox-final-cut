"""Manya's Artificer likeness, native pixel art; no photo pixels embedded."""
import json,math
from PIL import Image,ImageDraw
from likeness import A,C,Pen,EMOTIONS,ANIMS
LAV=C.index('#b48ce0');PINK=C.index('#c794ac')
# Pen shares the same C object from likeness.
def face(p,emotion='neutral'):
 p.p([(14,11),(18,7),(27,7),(32,12),(32,21),(28,26),(21,26),(16,22)],33)
 p.p([(29,14),(32,16),(32,21),(28,25),(25,25),(29,21)],32,None)
 for x,w in ((19,4),(27,3)):
  if emotion=='happy':p.l([(x,18),(x+1,17),(x+w,18)],0)
  else:
   y=18 if emotion in ('smug','deadpan') else 17
   p.r((x,y,x+w,20),6,0);p.r((x+w-1,y+1,x+w-1,19),0)
  p.l([(x-1,15),(x+w,14 if emotion=='angry' else 15)],8)
 p.l([(25,19),(24,21),(26,21)],32)
 if emotion in ('panic','shocked'):p.r((24,23,26,25),21,0)
 elif emotion=='sad':p.l([(22,24),(24,23),(27,24)],21)
 elif emotion=='angry':p.l([(23,24),(27,24)],21)
 else:p.l([(22,23),(24,24),(27,23)],21)
 # Side-part and generous wavy side sweep; both eyes stay visible.
 p.p([(13,18),(12,12),(15,6),(21,4),(28,5),(32,8),(34,14),(32,18),(29,13),(25,9),(22,12),(17,14),(16,20)],8)
 p.l([(15,11),(18,8),(23,6)],9);p.l([(27,8),(30,11),(31,14)],9)
 p.l([(16,21),(16,24)],5);p.r((15,23,17,24),22);p.r((16,23,16,23),6)

def peace(p,x,y):
 p.r((x,y,x+3,y+3),33,0)
 p.l([(x+1,y),(x-1,y-4)],33);p.l([(x+2,y),(x+4,y-4)],33)
 p.r((x,y+3,x+3,y+3),5);p.r((x,y+5,x+3,y+5),6)
def journal(p,x,y,opened=True):
 if opened:
  p.p([(x-7,y-6),(x-1,y-4),(x,y-3),(x+6,y-6),(x+7,y+5),(x,y+7),(x-7,y+4)],22)
  p.p([(x-6,y-5),(x-1,y-3),(x-1,y+5),(x-6,y+3)],14,None)
  p.p([(x+1,y-3),(x+5,y-5),(x+6,y+4),(x+1,y+5)],6,None)
  p.l([(x,y-2),(x,y+5)],23)
  p.l([(x-5,y),(x-2,y+1)],PINK);p.star(x+3,y+1,LAV,1)
 else:
  p.r((x-4,y-6,x+4,y+6),14,0);p.l([(x-3,y-5),(x-3,y+5)],23);p.star(x+1,y,LAV,2)
  for xx in (x-3,x+3):
   for yy in (y-5,y+5):p.r((xx,yy,xx,yy),22)
def frame(who,anim,f):
 im=Image.new('RGBA',(48,48));dy=[0,0,-1,0][f%4] if anim in ('idle','journal') else 0
 if anim=='run':dy=[0,-1,-2,-1,0,-1,-2,-1][f%8]
 if anim in ('jump','fall'):dy=-2
 if anim=='ko':dy=[1,3,5,6][f]
 p=Pen(im,-1 if anim=='hurt' else 0,dy)
 spread=[0,3,6,3,0,-3,-6,-3][f%8] if anim=='run' else 0
 for x,s in ((20,-spread),(27,spread)):
  p.p([(x-3,33),(x+3,33),(x+s+3,44-dy),(x+s-3,44-dy)],19)
  p.l([(x-1,36),(x+s-1,43-dy)],18)
  p.r((x+s-3,44-dy,x+s+4,47-dy),0);p.l([(x+s-2,45-dy),(x+s+3,45-dy)],14)
 # Hair behind the body: long waves, not a short bob.
 p.p([(15,9),(29,6),(34,11),(34,19),(36,23),(34,27),(36,32),(33,36),(29,33),(27,23),(14,28),(11,25),(12,20),(11,16)],8)
 p.l([(32,16),(32,21),(34,24),(32,28),(33,32)],9)
 p.p([(17,24),(28,24),(31,29),(29,32),(32,37),(14,37),(17,31),(14,27)],LAV)
 p.p([(27,26),(30,29),(28,32),(30,36),(25,36)],25,None)
 for x,y in ((18,28),(25,29),(18,34),(27,35),(22,32)):
  p.r((x,y,x+2,y),14);p.r((x+1,y-1,x+1,y+1),PINK)
 p.l([(19,25),(22,28),(26,25)],5);p.r((22,28,23,29),22)
 # Arms and bangles, changing gesture rather than only translating the prop.
 hx,hy=(34,31)
 if anim=='attack':hx,hy=[(31,26),(32,21),(40,25),(39,29),(34,31)][f]
 if anim in ('ability','super'):hx,hy=(32+f%3,30-min(f,5)*2)
 if anim=='block':hx,hy=(33,23+f%2)
 if anim=='journal':hx,hy=(33,28-min(f,4))
 p.p([(16,25),(18,28),(15,34),(11,32),(12,27)],LAV);p.r((11,32,15,35),33,0)
 p.l([(11,32),(15,32)],5);p.l([(11,34),(14,34)],6)
 p.p([(28,25),(31,25),(hx+2,hy-2),(hx+1,hy+2),(29,30)],LAV)
 p.r((hx-1,hy-1,hx+2,hy+2),33,0);p.l([(hx-2,hy),(hx-2,hy+2)],5);p.r((hx+1,hy,hx+1,hy),22)
 face(p,'sad' if anim in ('hurt','ko') else 'angry' if anim=='super' else 'neutral')
 if anim=='tagin':peace(p,12,20);peace(p,34,18)
 elif anim=='journal':
  journal(p,33,hy,f>0)
  if f>1:
   for k in range(min(4,f-1)):
    x=14+k*7;y=13-(f+k)%4*2
    p.p([(x,y),(x+4,y-1),(x+5,y+3),(x+1,y+4)],14);p.l([(x+1,y+1),(x+3,y+1)],LAV)
   p.star(40,9,PINK,2)
 elif anim=='block':journal(p,36,25)
 else:
  p.l([(hx-2,hy+5),(hx+4,hy-5)],0,3);p.l([(hx-2,hy+4),(hx+3,hy-4)],23)
  p.p([(hx+2,hy-4),(hx+3,hy-9),(hx+6,hy-8),(hx+5,hy-3)],LAV);p.r((hx+3,hy-7,hx+4,hy-6),14)
  if anim in ('ability','super'):
   p.r((9,38,17,44),25,0);p.l([(10,39),(16,39)],LAV)
  if anim in ('attack','ability','super') and f>=2:
   for k in range(3):p.star(36+k*4,12+(f+k)%3*4,[LAV,PINK,22][k],1)
 return im

def portrait(who,emotion):
 im=Image.new('RGBA',(64,64));p=Pen(im)
 p.p([(10,63),(7,49),(9,40),(7,30),(10,16),(17,7),(29,3),(44,6),(52,14),(54,30),(58,41),(55,48),(59,56),(56,63)],8)
 p.p([(5,63),(10,53),(23,47),(42,47),(53,54),(60,63)],LAV)
 for x,y in ((15,56),(23,61),(39,57),(48,61)):
  p.p([(x-2,y),(x,y-3),(x+2,y),(x+4,y+1),(x+1,y+3)],PINK);p.r((x,y,x+1,y+1),14)
 p.p([(25,40),(39,40),(40,49),(33,53),(24,48)],33)
 p.p([(17,15),(25,9),(38,10),(47,18),(48,30),(43,40),(34,46),(25,43),(18,36),(15,25)],33)
 p.p([(43,18),(48,23),(47,32),(41,40),(34,44),(31,42),(41,35)],32,None)
 for x,w in ((23,8),(37,6)):
  if emotion=='happy':p.l([(x,27),(x+2,25),(x+5,25),(x+w,27)],0)
  else:
   y=27 if emotion in ('smug','deadpan') else 25
   p.p([(x,y+1),(x+2,y),(x+w,y+1),(x+w,y+4),(x+1,y+4)],6)
   p.r((x+w-3,y+1,x+w-2,y+3),0)
  p.l([(x,22),(x+4,23 if emotion=='angry' else 21),(x+w,22)],8)
 p.l([(34,28),(32,33),(35,34)],32)
 if emotion in ('panic','shocked'):p.p([(30,37),(35,36),(37,39),(35,42),(30,41)],21);p.r((32,38,34,40),0)
 elif emotion=='sad':p.l([(28,40),(32,38),(37,40)],21)
 elif emotion=='angry':p.l([(29,39),(37,39)],21)
 else:p.l([(27,37),(30,39),(35,39),(39,36)],21);p.l([(30,40),(35,40)],PINK)
 p.p([(13,29),(10,19),(15,10),(25,5),(37,6),(47,11),(51,19),(49,31),(45,27),(42,19),(35,12),(28,17),(19,20),(17,30)],8)
 p.l([(15,16),(21,10),(29,8)],9,2);p.l([(38,10),(44,15),(47,22)],9)
 p.l([(50,26),(51,35),(49,43),(52,50),(50,60)],9,2)
 for x in (17,46):
  p.l([(x,31),(x,37)],5);p.p([(x,35),(x+2,38),(x,41),(x-2,38)],22);p.r((x,37,x,38),6)
 p.l([(26,47),(30,52),(35,54),(40,49)],5);p.p([(34,52),(37,54),(35,57),(33,54)],22)
 if emotion in ('smug','happy'):
  p.p([(9,52),(13,44),(17,45),(15,54)],33)
  p.l([(13,45),(9,36)],33,2);p.l([(15,45),(20,36)],33,2)
  p.l([(10,51),(15,53)],5);p.l([(9,54),(14,56)],6)
 return im

def build(who='manya'):
 m=json.loads((A/'manifest.json').read_text());anims=ANIMS+[('super',8,12,False),('block',4,8,True),('journal',8,12,False)]
 sheet=Image.new('RGBA',(384,48*len(anims)));entries={}
 for row,(name,n,fps,loop) in enumerate(anims):
  entries[name]=dict(row=row,frames=n,fps=fps,loop=loop)
  if name=='attack':entries[name]['hitFrame']=2
  for f in range(n):sheet.paste(frame(who,name,f),(f*48,row*48))
 sheet.save(A/'sprites/characters/manya.png');m['sprites']['manya']['anims']=entries
 portraits=Image.new('RGBA',(512,64))
 for i,e in enumerate(EMOTIONS):portraits.paste(portrait(who,e),(i*64,0))
 portraits.save(A/'portraits/manya.png')
 icon=frame(who,'idle',0).crop((9,3,35,29)).resize((24,24),Image.Resampling.NEAREST);icon.save(A/'icons/manya.png')
 flower=Image.new('RGBA',(64,16))
 for f,dx in enumerate((0,1,0,-1)):
  im=Image.new('RGBA',(16,16));p=Pen(im);p.l([(8,15),(8+dx,7)],27)
  p.p([(8,13),(3,10),(3,13),(8,15)],28);p.p([(8,12),(12,9),(13,11)],29)
  for x,y in ((5,5),(8,2),(11,5),(10,8),(6,8)):
   p.p([(x+dx-2,y),(x+dx,y-2),(x+dx+2,y),(x+dx,y+2)],LAV)
  p.r((7+dx,4,9+dx,6),22);p.r((7+dx,4,7+dx,4),6);flower.paste(im,(f*16,0))
 flower.save(A/'sprites/props/journal-flower.png');m['sprites']['journal-flower']=dict(file='sprites/props/journal-flower.png',frameWidth=16,frameHeight=16,anims={'idle':dict(row=0,frames=4,fps=6,loop=True)})
 (A/'manifest.json').write_text(json.dumps(m,indent=2)+'\n')
 # Finisher remains a transparent paint-flood overlay, no actor baked into it.
 from versus import finisher
 fx=Image.new('RGBA',(2304,96))
 for f in range(24):fx.paste(finisher(who,f),(f*96,0))
 fx.save(A/'sprites/fx/finisher-manya.png')
 review=Image.new('RGBA',(384,12*58+128),C[1]);d=ImageDraw.Draw(review)
 for row,(name,n,_,_) in enumerate(anims):
  d.text((0,row*58),name,fill=C[6]);review.paste(sheet.crop((0,row*48,384,(row+1)*48)),(0,row*58+10))
 review.paste(portraits.crop((0,0,384,64)),(0,696));review.paste(portraits.crop((384,0,512,64)),(0,760));review.save(A.parents[3]/'tools/art/raw/t-a48-manya.png')
if __name__=='__main__':build()
