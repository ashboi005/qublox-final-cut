"""Ink / Signal native vector rigs for enemies, bosses and supporting cast."""
import math,json,copy
from PIL import Image
from draw import Canvas,INK,BONE
from cast import heart
SKIN='#dfac82';BEIGE='#d3bea0';SHADE='#a1917e'
def frame(key,w,h,anim,f,n):
 c=Canvas(w*4,h*4,ss=2);g=c.group(0,0,4);t=f/max(n-1,1);dy=math.sin(f*math.pi/2)*.65 if anim in ('idle','move','walk') else 0
 attack=anim.startswith('attack') or anim in ('phase2','phase3');hurt=anim=='hurt';dead=anim in ('die','death');wind=anim in ('telegraph','windup')
 g=g.group(0,dy)
 if key in ('reply-all-drone','reply-all-mothership'):
  big='mothership' in key;x=w*.13;y=h*.25;ww=w*.74;hh=h*.49
  for xx in (w*.09,w*.87):
   g.line([(xx,y+4),(xx,y-5)],INK,1.5);g.ellipse((xx-2,y-8,xx+2,y-4),'#ff2f36',INK,1)
   g.rect((xx-3,y+hh*.4,xx+4,y+hh*.8),'#414f64',INK,1.5,1)
  g.rect((x,y,x+ww,y+hh),BEIGE,INK,2,3);g.poly([(x+2,y+2),(x+ww/2,y+hh*.62),(x+ww-2,y+2)],BONE,INK,1.5)
  for xx in (x+ww*.3,x+ww*.65):g.rect((xx,y+hh*.3,xx+3,y+hh*.3+2),INK)
  if big:
   g.rect((x+5,y+hh-7,x+ww-5,y+hh-2),SHADE,INK,1)
   for xx in range(int(x+7),int(x+ww-5),7):g.line([(xx,y+hh-5),(xx+3,y+hh-5)],BONE,1)
 elif 'buffering-wheel' in key:
  cx=w/2;cy=h/2;r=w*.32
  for k in range(8):
   a=k*math.pi/4+f*.23;x=cx+math.cos(a)*r;y=cy+math.sin(a)*r
   g.line([(cx,cy),(x,y)],INK,max(1,w/32));g.ellipse((x-w*.065,y-w*.065,x+w*.065,y+w*.065),[BONE,BEIGE,SHADE,'#55545c'][k//2],INK,max(.7,w/64))
  if w>32:g.poly([(cx-8,cy),(cx,cy-6),(cx+8,cy),(cx,cy+6)],BONE,INK,1.5);g.line([(cx,cy-3),(cx,cy+2)],'#ff2f36',1.5)
 elif 'corporate-memphis-blob' in key:
  col=BEIGE if 'templatr' in key else '#ba70b4'
  for a,b in [((w*.38,h*.65),(w*.2,h*.91)),((w*.62,h*.65),(w*.85,h*.88)),((w*.28,h*.4),(w*.12,h*.25))]:g.line([a,b],INK,4);g.line([a,b],SHADE,2)
  g.path((w*.3,h*.26),[(w*.36,h*.08,w*.75,h*.09,w*.72,h*.45),(w*.78,h*.82,w*.31,h*.86,w*.27,h*.6),(w*.18,h*.4,w*.25,h*.36,w*.3,h*.26)],col,INK,2)
  g.ellipse((w*.64,h*.46,w*.84,h*.62),BEIGE,INK,1.5)
 elif key=='pop-up-ad':
  g.rect((2,3,w-2,h-3),BEIGE,INK,2,2);g.rect((3,4,w-3,10),'#55545c',INK,1)
  g.line([(w-9,5),(w-5,9)],'#ff2f36',1);g.line([(w-5,5),(w-9,9)],'#ff2f36',1)
  g.line([(7,15),(w-7,15)],INK,1.5);g.rect((8,h-12,w-8,h-6),BONE,INK,1.5,1)
 elif key=='beige-core':
  cx=w/2;cy=h/2;r=w*.4;pts=[(cx+math.cos(k*math.pi/3-math.pi/2)*r,cy+math.sin(k*math.pi/3-math.pi/2)*r) for k in range(6)]
  for k in range(6):g.poly([(cx,cy),pts[k],pts[(k+1)%6]],[BEIGE,SHADE,'#80796f',BEIGE,BONE,'#e6d6b9'][k],INK,1.5)
  inner=[(cx+(x-cx)*.72,cy+(y-cy)*.72) for x,y in pts];g.poly(inner,'#55545c',INK,2)
  g.rect((cx-14,cy-24,cx+14,cy+24),BEIGE,INK,2,2);g.rect((cx-9,cy-17,cx+9,cy+6),'#173f47',INK,1.5)
  g.line([(cx-5,cy-12),(cx+5,cy-12),(cx-5,cy)],'#43e7ed' if attack else BONE,2);g.rect((cx-7,cy+12,cx+7,cy+17),INK)
  for x,y in pts:g.ellipse((x-3,y-3,x+3,y+3),BONE,INK,1.5)
 elif key=='the-algorithm':
  for k in range(4):
   x=7+(-1 if k%2 else 1)*(3+math.sin(f)*2);y=7+k*h*.18
   g.poly([(x,y+6),(w-10,y),(w-5,y+13),(x+4,y+20)],'#414f64',INK,2)
   g.rect((x+10,y+6,w-14,y+14),'#171d24',INK,1);g.poly([(x+18,y+7),(x+18,y+13),(x+25,y+10)],'#ff76a5',None)
  g.ellipse((w-22,h*.36,w-4,h*.64),'#ff2f36',INK,2);g.line([(w-13,h*.42),(w-10,h*.47),(w-14,h*.55)],BONE,2)
 elif key=='pixel-cat':
  g.path((6,h-8),[(2,h-17,8,h-24,13,h-18),(16,h-25,24,h-24,27,h-18),(31,h-13,28,h-5,20,h-4),(8,h-4)],BONE,INK,1.5)
  g.poly([(10,h-19),(9,h-29),(18,h-23)],BONE,INK,1.5);g.poly([(21,h-23),(29,h-29),(28,h-17)],BONE,INK,1.5)
  for x in (15,24):g.ellipse((x,h-18,x+2,h-15),'#279a7d',INK,.7)
  g.line([(18,h-11),(23,h-11)],'#ff76a5',1.5);g.path((8,h-7),[(0,h-7,1,h-20,5,h-16)],None,INK,2,False)
 else:
  # Human and monkey rigs. The family uses three independent figures.
  family=key=='stock-photo-family'
  poses=[(.22,.62),(.52,.72),(.76,.45)] if family else [(.5,1)]
  for offset,scale in poses:
   scale*=min(w/34,h/49) if not family else h/49
   base=g.group(w*offset-16*scale,h-48*scale,scale);human(base,key,anim,f,attack,wind)
 if wind:
  g.line([(w*.25,3),(w*.33,7)],'#ff2f36',1.5);g.line([(w*.75,3),(w*.67,7)],'#ff2f36',1.5)
 if hurt:g.poly([(w-7,2),(w-5,6),(w-1,7),(w-5,9),(w-6,13),(w-8,8),(w-12,7)],'#fecb56',INK,1)
 out=c.finish()
 if dead:
  # Collapse around the bottom contact; no severed bodies.
  hh=max(4,round(out.height*(1-.7*t)));small=out.resize((out.width,hh),Image.Resampling.LANCZOS);out=Image.new('RGBA',out.size);out.paste(small,(0,out.height-hh))
 return out

def human(g,key,anim,f,attack,wind):
 monkey=key=='infinite-monkey';npc=key in ('chacha-chai','intern-bunty','rebel-intern-simran','sysadmin-karan','stuntman-jaggu','influencer-roxy');chad=key=='chad-frictionless'
 shirt={'chacha-chai':BONE,'intern-bunty':'#3a6ea5','rebel-intern-simran':'#ba70b4','sysadmin-karan':'#3a6ea5','stuntman-jaggu':'#fecb56','influencer-roxy':'#9256a8','stock-intern-render-farm':'#3a6ea5'}.get(key,BEIGE)
 skin=SKIN if npc or chad else '#c5ad8c';pants='#242633' if npc else '#80796f';step=math.sin(f*math.pi/2)*3 if anim in ('move','walk','run') else 0
 for x,d in ((11,step),(22,-step)):
  g.line([(x,33),(x+d,43)],INK,6);g.line([(x,33),(x+d,43)],pants,3.5);g.rect((x+d-3,43,x+d+4,47),BONE if chad else '#41404b',INK,1.5,1)
 g.path((8,23),[(14,20,22,20,25,24),(27,30),(24,36),(8,36),(6,29),(8,23)],shirt,INK,1.7)
 g.poly([(21,24),(25,26),(23,35),(19,35)],SHADE if not npc else '#414f64',None)
 g.line([(16,24),(16,34)],BONE,1)
 # Sleeves and hands follow through on a reach, retract for telegraph.
 end=(29 if attack else 24 if wind else 28,21 if attack else 20 if wind else 31)
 g.line([(23,25),end],INK,5);g.line([(23,25),end],shirt,3);g.ellipse((end[0]-2,end[1]-2,end[0]+2,end[1]+2),skin,INK,1)
 g.line([(8,25),(5,32)],INK,4);g.ellipse((3,30,7,34),skin,INK,1)
 g.path((8,8),[(9,2,23,2,25,8),(27,16),(23,22),(13,22),(7,17),(8,8)],skin,INK,1.7)
 g.path((8,11),[(5,6,10,0,17,2),(25,0,28,8,25,10),(19,7),(13,9),(10,14)],'#392c30' if npc or chad else '#80796f',INK,1.5)
 if key=='chacha-chai':g.rect((7,2,25,7),BONE,INK,1.5,3)
 if key=='stuntman-jaggu':g.rect((7,3,25,8),'#ff2f36',INK,1.5,2)
 if key in ('rebel-intern-simran','influencer-roxy'):g.path((8,4),[(0,-1,0,14,7,19)],'#242633',INK,2)
 for x in (13,21):
  g.ellipse((x-2,11,x+2,15),BONE,INK,.8);g.ellipse((x,12,x+1.2,14),INK)
 g.line([(12,9),(16,9)],INK,1);g.line([(20,9),(24,10)],INK,1)
 g.path((14,18),[(17,20,21,20,23,17)],None,INK,1,False)
 if monkey:
  for x in (6,26):g.ellipse((x-4,10,x+3,17),skin,INK,1.5)
  g.rect((7,27,28,34),'#414f64',INK,1.5,1)
  for x in (10,15,20,25):g.line([(x,29),(x,31)],BONE,1)
 elif key=='chacha-chai':g.rect((26,26,31,32),'#fecb56',INK,1.3,1)
 elif key=='influencer-roxy' or key=='stock-intern-the-feed':
  g.line([(30,19),(30,46)],INK,1.5);g.ellipse((25,11,34,23),None,BONE,2);g.rect((28,14,31,20),'#414f64',INK,1)
 elif 'stock' in key:
  g.rect((24,29,31,40),BONE,INK,1.3,1);g.line([(26,32),(29,32)],SHADE,1)
  if key.endswith('templatr'):g.line([(12,24),(17,31),(21,24)],'#414f64',1.2);g.rect((15,29,19,33),BONE,INK,.8)
  if key.endswith('the-set'):g.line([(16,17),(22,17)],INK,2)
 elif npc:g.rect((26,29,31,34),'#414f64',INK,1)

def build(root):
 p=json.loads((root/'manifest.json').read_text());result={}
 for key,e in p['sprites'].items():
  if not any('/'+s+'/' in e['file'] for s in ('enemies','bosses','npcs')):continue
  e=copy.deepcopy(e);w,h=e['frameWidth'],e['frameHeight'];src=Image.open(root/e['file']);out=Image.new('RGBA',(src.width*4,src.height*4))
  for anim,a in e['anims'].items():
   for f in range(a['frames']):out.paste(frame(key,w,h,anim,f,a['frames']),(f*w*4,a['row']*h*4))
  e['file']='hd/'+e['file'];e['frameWidth']*=4;e['frameHeight']*=4;dest=root/e['file'];dest.parent.mkdir(parents=True,exist_ok=True);out.save(dest);result[key]=e
 return result
if __name__=='__main__':
 from remaining import A
 p=A/'manifest-hd.json';m=json.loads(p.read_text());m['sprites'].update(build(A));p.write_text(json.dumps(m,indent=2)+'\n')
