"""Head, torso, two-segment limbs, hands and props posed as separate parts."""
import math
from PIL import Image
from draw import Canvas,INK,BONE,SKIN,SKIN_SH
ANIMS=[('idle',8,10,True),('run',10,15,True),('jump',3,10,False),('fall',3,8,True),('attack',8,16,False),('ability',8,12,False),('hurt',3,10,False),('block',4,8,True),('super',8,12,False)]
def head(c,who,emotion='neutral',blink=False):
 ash=who=='ashwath'
 c.ellipse((0,37,17,59),SKIN,INK,5)
 c.path((13,20),[(28,4,62,6,73,27),(77,37,72,43,80,48),(84,52,76,55,74,56),(74,76,51,86,30,77),(14,71,10,51,13,20)],SKIN)
 c.path((64,29),[(74,39,67,48,77,51),(68,55),(70,69,53,77,43,77),(62,62,57,46,64,29)],SKIN_SH,None)
 if ash:
  c.path((12,49),[(19,57,24,61,34,60),(43,54,51,59,58,58),(66,55,70,53,74,54),(76,71,61,82,44,81),(23,79,15,69,12,49)],'#242633',INK,4)
  c.path((24,69),[(31,75,40,77,48,76)],None,'#414453',3,False)
 else:
  c.path((17,59),[(30,68,57,72,72,57),(70,74,53,82,38,77),(25,73,19,67,17,59)],'#af8067',None)
  for x,y in [(24,65),(29,69),(36,73),(51,75),(60,69),(65,64)]:c.line([(x,y),(x+1,y+2)],'#77594e',2)
 # Broad near eye and narrower far eye; pupil direction follows facing right.
 for x,w in [(23,18),(52,14)]:
  if blink or emotion=='happy':c.path((x,45),[(x+5,38,x+w-3,39,x+w,45)],None,INK,3,False)
  else:
   h=13 if emotion=='panic' else 8
   c.path((x,42),[(x+4,38,x+w-2,38,x+w,42),(x+w,42+h),(x+4,45+h,x,45,x,42)],BONE,INK,3)
   c.ellipse((x+w-8,38 if emotion=='summon' else 41,x+w-3,44 if emotion=='summon' else 48 if emotion!='panic' else 51),INK)
  brow=34 if emotion!='panic' else 29
  c.line([(x,brow+(3 if emotion=='angry' and x>40 else 0)),(x+w-2,brow+(3 if emotion=='angry' and x<40 else -2))],INK,3)
 # Signature frames: warm square aviators / translucent grey rectangles.
 rim='#ce923f' if ash else '#969d9e'
 for x,w in [(17,29),(49,25)]:
  c.rect((x,35,x+w,55),None,rim,3,5)
  c.line([(x+5,38),(x+13,38)],'#bad7df',3)
 c.line([(46,40),(49,40)],rim,3);c.line([(7,37),(17,40)],rim,3)
 c.path((47,45),[(45,52,49,54,53,54)],None,SKIN_SH,3,False)
 if emotion=='sad':c.path((34,71),[(43,63,54,63,62,69)],None,BONE if ash else INK,3,False)
 elif emotion in ('angry','deadpan'):c.line([(36,67),(59,67)],BONE if ash else INK,3)
 elif emotion in ('panic','shocked'):c.ellipse((42,61,59,74),INK);c.ellipse((46,66,55,72),'#ff76a5')
 elif emotion=='smug':c.path((34,65),[(43,70,55,68,61,62)],None,INK if not ash else BONE,3,False)
 else:
  c.path((33,63),[(43,67,56,67,64,61),(60,73,43,75,33,63)],INK,INK,3)
  c.path((36,64),[(45,67,56,66,61,63),(57,68,43,70,36,64)],BONE,None)
 # Hair is a shaped silhouette, not a circular cap.
 if ash:
  c.path((9,48),[(0,38,1,27,6,23),(1,17,12,14,15,10),(15,3,28,6,33,2),(42,-2,45,6,52,3),(63,0,74,10,75,22),(79,29,73,35,69,36),(60,31,55,24,51,23),(39,31,33,28,29,26),(22,30,18,35,15,45),(9,48)],'#171a22')
  c.path((14,24),[(27,13,38,17,51,11),(60,10,65,16,69,23)],None,'#414453',4,False)
  c.path((12,32),[(22,22,30,24,37,21)],None,'#303645',3,False)
 else:
  c.path((7,47),[(-3,37,0,32,3,28),(-7,20,0,12,8,13),(6,3,17,0,23,5),(28,-4,38,-2,42,3),(48,-5,58,0,60,5),(74,2,82,11,78,19),(87,27,78,35,70,34),(64,42,56,33,52,29),(44,39,36,29,30,29),(22,37,17,29,14,40),(7,47)],'#171f22')
  for x,y in [(9,17),(24,11),(39,8),(56,12),(69,21),(26,24),(44,22)]:
   c.path((x-4,y+3),[(x-5,y-4,x+5,y-6,x+7,y+1)],None,'#3d4848',3,False)

def keyboard(c,x,y,angle=0):
 # Prop is separately rotated to keep keys and bevels coherent.
 p=Canvas(76,35);p.rect((3,3,73,31),'#323849',INK,5,5);p.line([(8,28),(68,28)],'#43e7ed',3)
 for yy in (9,17):
  for xx in range(10,65,11):p.rect((xx,yy,xx+6,yy+4),BONE,r=1)
 im=p.finish().rotate(angle,Image.Resampling.BICUBIC,expand=True)
 c.im.alpha_composite(im.resize((im.width*c.ss,im.height*c.ss)),c.pt((x-im.width/2,y-im.height/2)))
def bubble(c,x,y):
 c.path((x-18,y-16),[(x-4,y-24,x+21,y-19,x+23,y-6),(x+27,y+10,x+9,y+15,x-7,y+10),(x-20,y+17),(x-16,y+6),(x-26,y-2,x-24,y-10,x-18,y-16)],BONE,INK,5)
 for xx in (-9,1,11):c.ellipse((x+xx-2,y-4,x+xx+2,y), '#1d7a3a')
def limb(c,pts,col,w=15):
 c.line(pts,INK,w+6);c.line(pts,col,w)
def hand(c,x,y):
 c.path((x-6,y-3),[(x-3,y-8,x+5,y-6,x+7,y-2),(x+10,y+1,x+6,y+7,x+1,y+7),(x-7,y+7,x-9,y+2,x-6,y-3)],SKIN,INK,4)
 c.path((x-5,y),[(x-1,y-3,x+2,y,x+1,y+3)],None,SKIN_SH,3,False)
def frame(who,anim,f,n):
 c=Canvas(192,192);ash=who=='ashwath';phase=f/n*2*math.pi
 bob=math.sin(phase)*1.8 if anim=='idle' else 0;lean=0;headlag=0
 if anim=='run':bob=-abs(math.sin(phase))*5;lean=4;headlag=-2
 if anim in ('jump','fall'):bob=([-9,-6,-3] if anim=='jump' else [-4,-1,2])[f];lean=3+f
 if anim=='hurt':lean=-7+f*2;bob=3
 if anim=='attack':lean=[-4,-8,-5,7,11,7,3,0][f];headlag=-lean*.25
 if anim=='super':bob=[2,4,2,-3,-5,-3,-1,0][f]
 if anim=='block':bob=[1,2,3,2][f];lean=-4
 g=c.group(lean,bob)
 # Feet / knee / hip rig. Contacts stay at y188 on the ground frames.
 stride=math.sin(phase)*21 if anim=='run' else 0
 for x,s in ((79,-stride),(108,stride)):
  end=(x+s,185-bob-(max(0,-math.cos(phase))*14 if anim=='run' and x==79 else max(0,math.cos(phase))*14 if anim=='run' else 0))
  if anim in ('jump','fall'):end=(x+(-14 if x==79 else 18),169 if anim=='jump' else 178)
  if anim=='block':end=(x+(-8 if x==79 else 8),185-bob)
  knee=((x+end[0])/2+(8 if anim=='run' else 0),160)
  limb(g,[(x,136),knee,end],'#292d3a',18)
  g.line([(x-3,145),(knee[0]-3,160)],'#4b5267',3)
  g.rect((end[0]-12,end[1]-5,end[0]+15,end[1]+5),INK,INK,4,5)
  g.line([(end[0]-9,end[1]+2),(end[0]+12,end[1]+2)],BONE if not ash else '#697185',3)
  if not ash:g.rect((end[0]+5,end[1]-5,end[0]+11,end[1]-1),'#279a7d',r=1)
 # Back arm swings opposite the foreground arm.
 rear=(53+stride*.35,127-stride*.15)
 if anim=='super' and not ash and f>=6:rear=(43,65)
 limb(g,[(67,104),(53,113),rear],'#e8ddc4' if ash else '#242b31',18);hand(g,*rear)
 if ash:g.rect((rear[0]-7,rear[1]-8,rear[0]+6,rear[1]-3),INK,r=2)
 # Torso and hard cel shadow.
 g.path((67,93),[(80,87,107,89,120,99),(130,116,125,134,122,143),(71,144),(61,128,58,108,67,93)],'#f0e5ce' if ash else '#222a30')
 if ash:
  g.poly([(112,99),(123,105),(122,139),(105,140),(111,122)],'#c7b994',None)
  g.path((77,96),[(87,104,102,104,110,96)],None,'#aa997a',3,False)
  g.ellipse((87,113,99,129),'#ff2f36')
  for yy in (114,122):g.line([(77,yy-2),(87,yy+3),(98,yy+3),(108,yy-2)],'#ab2446',3)
 else:
  g.poly([(82,96),(107,95),(113,140),(81,140)],BONE,INK,3)
  for x,y in [(88,106),(99,113),(89,124),(104,134)]:g.line([(x,y),(x+5,y+2),(x+2,y+6)],INK,3)
  g.poly([(67,95),(81,94),(84,108),(76,115),(83,123),(75,140),(64,122)],'#303d43',INK,3)
  g.poly([(112,96),(123,105),(119,140),(108,141),(113,119),(106,110)],'#172127',INK,3)
  g.line([(72,122),(75,135)],'#279a7d',4);g.line([(115,124),(113,136)],'#279a7d',4)
 # Head is independent, with delayed motion relative to torso.
 head(g.group(56+headlag,20+(bob*.2),.95),who,'panic' if anim=='hurt' else 'summon' if ash and anim=='super' and f<6 else 'smug' if anim=='super' else 'neutral',anim=='idle' and f==6)
 # Foreground arm and action prop.
 hx,hy=131-stride*.3,126
 if anim=='attack':hx,hy=[(119,120),(110,105),(113,99),(140,108),(137,113),(140,119),(137,123),(131,126)][f]
 if anim=='ability':hx,hy=[(129,124),(133,113),(138,103),(139,99),(141,101),(139,111),(135,120),(131,126)][f]
 if anim=='block':hx,hy=142,98
 if anim=='hurt':hx,hy=125,109
 if anim=='super':
  if ash:hx,hy=[(132,116),(142,83),(143,47),(143,32),(143,32),(153,62),(161,96),(161,99)][f]
  else:hx,hy=[(112,95),(112,95),(148,104),(148,104),(102,116),(102,116),(146,65),(146,65)][f]
 elbow=(125,126) if anim!='block' else (132,129)
 if ash and anim=='super':elbow=(138,88) if f<6 else (137,104)
 limb(g,[(117,103),elbow,(hx,hy)],'#e8ddc4' if ash else '#303d43',18);hand(g,hx,hy)
 if ash:
  if anim=='super':
   pts=[(hx,hy),(hx,hy-17)] if f<6 else [(hx,hy),(hx+22,hy-3)]
   g.line(pts,INK,10);g.line(pts,SKIN,5)
   if f<6:g.line([(hx+6,hy),(hx+10,hy-13)],SKIN,5)
   if f>=2:
    g.line([(hx-4,hy-5),(hx+4,hy-5)],'#d97757',4)
    for x in (77,107):g.line([(x,55),(x+12,55)],'#d97757',4)
    if f<6:
     g.line([(170,27),(170,39)],'#d97757',3);g.line([(164,33),(176,33)],'#d97757',3)
  elif anim=='ability' and f>=2:
   g.rect((hx-8,hy-34,hx+37,hy-4),INK,INK,5,3);g.rect((hx-3,hy-29,hx+32,hy-9),'#164d48',r=1)
   g.line([(hx+3,hy-23),(hx+9,hy-19),(hx+3,hy-15)],'#71ceb0',3);g.line([(hx+16,hy-15),(hx+26,hy-15)],'#b5fbec',3)
   g.poly([(hx-8,hy-3),(hx+37,hy-3),(hx+42,hy+5),(hx-14,hy+5)],'#697185',INK,4)
  else:keyboard(g,hx+1,hy+3,65 if anim=='block' else [15,35,65,-15,-25,-10,0,0][f] if anim=='attack' else 0)
 else:
  if anim=='attack' and 2<=f<=5:
   g.line([(hx+2,hy-3),(hx+10,hy-10)],SKIN,5)
   bubble(g,151,72-f*2)
  if anim=='ability' and f>=2:
   g.rect((141,140,178,180),'#1d7a3a',INK,5,5);g.rect((152,132,167,141),None,INK,4,3)
   g.ellipse((148,150,172,174),'#142d29',INK,3);g.ellipse((155,157,165,167),'#71ceb0');g.line([(147,146),(155,146)],BONE,3)
  if anim=='super' and f in (2,3):bubble(g,151,70)
  if anim=='block':g.line([(140,96),(140,84)],SKIN,5);g.line([(146,97),(148,85)],SKIN,5)
 # A hard-edged, inked attack smear behind the extended prop.
 if anim=='attack' and f in (3,4):
  c.path((136,87),[(158,81,181,88,185,108)],None,'#fecb56' if ash else '#71ceb0',6,False)
  c.line([(159,79),(179,83)],BONE,3)
 out=c.finish()
 # Subtle squash/stretch, anchored at the planted sole rather than the centre.
 sy=1+.012*math.sin(phase) if anim=='idle' else 1+.025*math.cos(phase*2) if anim=='run' else [1,.99,.97,.99][f] if anim=='block' else 1
 if sy!=1:
  w=round(192/math.sqrt(sy));h=round(192*sy);pose=out.resize((w,h),Image.Resampling.LANCZOS);out=Image.new('RGBA',(192,192));out.paste(pose,((192-w)//2,192-h))
 return out
def portrait(who,emotion):
 c=Canvas(256,256)
 c.path((23,256),[(28,201,63,186,96,183),(155,180,203,192,232,256)],'#f0e5ce' if who=='ashwath' else '#242b31',INK,8)
 if who=='sayam':c.poly([(97,193),(143,193),(170,256),(87,256)],BONE,INK,5);c.line([(69,219),(76,248)],'#279a7d',8)
 else:c.ellipse((115,225,137,255),'#ff2f36');c.line([(88,228),(118,240),(137,240),(165,228)],'#ab2446',5)
 head(c.group(43,20,2.15),who,emotion)
 return c.finish()
def build(root):
 entries={};portraits={}
 for who in ('ashwath','sayam'):
  sheet=Image.new('RGBA',(192*10,192*len(ANIMS)));anims={}
  for row,(anim,n,fps,loop) in enumerate(ANIMS):
   anims[anim]=dict(row=row,frames=n,fps=fps,loop=loop)
   if anim=='attack':anims[anim]['hitFrame']=3
   for f in range(n):sheet.paste(frame(who,anim,f,n),(f*192,row*192))
  file=f'hd/sprites/characters/{who}.png';sheet.save(root/file);entries[who]=dict(file=file,frameWidth=192,frameHeight=192,anims=anims)
  sheet=Image.new('RGBA',(768,256))
  for i,e in enumerate(('neutral','smug','panic')):sheet.paste(portrait(who,e),(i*256,0))
  file=f'hd/portraits/{who}.png';sheet.save(root/file);portraits[who]=dict(file=file,size=256,emotions=['neutral','smug','panic'])
 return entries,portraits
