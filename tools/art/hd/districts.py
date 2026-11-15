"""Hand-drawn district parallax; light far silhouettes, boxed midground, sparse near frames."""
from draw import Canvas,INK,BONE
from cast import heart
DISTRICTS=('hq','the-set','the-feed','templatr')
def background(who,layer,sat):
 c=Canvas(1920,1080,ss=2);g=c.group(0,0,4)
 schemes={'hq':('#9cbfc7','#637a9c','#293650','#ffce66'), 'the-set':('#b6cdbd','#698d85','#243f43','#f7a75c'), 'the-feed':('#bfa4d0','#7c649b','#382d59','#ff76a5'),'templatr':('#e5d6ba','#b3997e','#625760','#43e7ed')}
 air,far,deep,signal=schemes[who] if sat else ('#d0c9bd','#a29b94','#55545c','#b9ac95')
 metal='#697b8e' if sat else '#8e8986';light=BONE if sat else '#ded8cb'
 if layer=='far':
  g.rect((0,0,480,270),air)
  for x,h in ((-22,142),(67,112),(153,162),(241,126),(329,157),(417,142)):
   g.poly([(x,270),(x,270-h),(x+20,256-h),(x+74,256-h),(x+74,270)],far,None)
   for yy in range(280-h,248,19):
    for xx in (x+12,x+34,x+56):g.rect((xx,yy,xx+9,yy+7),air)
  if who=='the-set':
   g.line([(0,94),(480,94)],far,6)
   for x in (36,167,299,430):g.line([(x,0),(x,153)],far,4);g.line([(x,50),(x+62,96),(x,143)],far,3)
  elif who=='the-feed':
   for x,y in ((37,54),(224,29),(393,66)):
    g.path((x,y),[(x+12,y-20,x+55,y-13,x+55,y+11),(x+51,y+29,x+18,y+30,x+8,y+24),(x,y+34),(x+3,y+20),(x,y)],air,far,3)
  elif who=='templatr':
   g.poly([(173,150),(203,55),(277,55),(307,150)],far,None);g.rect((225,22,255,90),far)
  g.dots((0,220,480,270),far,11,.6)
 elif layer=='mid':
  if who=='hq':
   for x in (-15,145,305):
    g.rect((x,61,x+131,239),deep,INK,2,3);g.rect((x+8,68,x+123,134),far,INK,1.5)
    g.line([(x+65,68),(x+65,134)],deep,3);g.line([(x+8,102),(x+123,102)],deep,3)
    g.rect((x+9,150,x+126,158),metal,INK,1.5);g.line([(x+18,159),(x+12,241)],deep,5);g.line([(x+113,159),(x+119,241)],deep,5)
    g.rect((x+29,121,x+88,149),metal,INK,2,5);g.rect((x+35,126,x+82,142),deep,INK,1.5,2)
    g.line([(x+44,131),(x+50,135),(x+44,139)],signal,1.5)
    for yy in (177,206):g.rect((x+21,yy,x+106,yy+22),far,INK,1.5,2);g.line([(x+29,yy+8),(x+82,yy+8)],light,1.5)
    g.dots((x+28,218,x+98,238),metal,7,.6)
  elif who=='the-set':
   for x in (-8,151,310):
    g.poly([(x,252),(x,117),(x+30,82),(x+111,82),(x+140,117),(x+140,252)],far,INK,2)
    g.poly([(x+4,117),(x+32,89),(x+110,89),(x+134,117)],metal,INK,1.5)
    g.rect((x+23,135,x+58,209),deep,INK,2);g.rect((x+80,134,x+118,251),deep,INK,2)
    for yy in (145,169,193):g.line([(x+28,yy),(x+53,yy)],signal,2)
    g.rect((x+19,103,x+120,121),deep,INK,2);g.line([(x+31,111),(x+106,111)],light,2)
    g.poly([(x+117,125),(x+139,135),(x+139,249),(x+117,249)],deep,INK,1.5)
    g.line([(x+128,141),(x+135,242)],metal,2)
  elif who=='the-feed':
   for k,x in enumerate((-12,115,242,369)):
    y=64+(k%2)*23
    g.rect((x,y,x+105,249),deep,INK,2,8);g.rect((x+6,y+8,x+99,240),far,INK,1.5,4)
    g.ellipse((x+13,y+15,x+27,y+29),signal,INK,1.5);g.line([(x+35,y+19),(x+83,y+19)],light,2)
    g.rect((x+12,y+38,x+93,y+112),metal,INK,1.5,3)
    g.poly([(x+43,y+54),(x+43,y+94),(x+73,y+74)],signal,INK,2)
    for yy in (y+126,y+138,y+150):g.line([(x+14,yy),(x+83,yy)],deep,2)
    g.line([(x+17,229),(x+48,229)],signal,3);g.ellipse((x+76,224,x+86,234),signal,INK,1.5)
  else:
   for x in (-16,112,240,368):
    g.rect((x,62,x+106,254),far,INK,2,12);g.rect((x+9,75,x+97,241),air,INK,1.5,9)
    g.rect((x+18,92,x+88,154),light,INK,2,9)
    g.ellipse((x+32,109,x+41,118),deep);g.ellipse((x+66,109,x+75,118),deep)
    g.path((x+34,131),[(x+47,143,x+64,143,x+76,130)],None,deep,3,False)
    for yy in (174,194,214):g.rect((x+23,yy,x+84,yy+10),far,INK,1.5,4)
    g.line([(x+7,84),(x+7,225)],light,2)
 else:
  # Foreground frames are open around the playable lane.
  for x in (0,469):
   g.rect((x,0,x+11,270),deep,INK,2);g.line([(x+3,0),(x+3,270)],metal,1.5)
   for y in range(20,270,38):g.ellipse((x+4,y,x+8,y+4),light)
  g.rect((0,0,480,12),deep,INK,2)
  for x in range(18,480,48):g.line([(x,2),(x+25,10)],metal,2)
  if who=='the-set':
   for x in (48,224,408):
    g.line([(x,10),(x,47)],INK,2);g.poly([(x-11,43),(x+11,43),(x+16,60),(x-16,60)],deep,INK,2);g.line([(x-11,62),(x+11,62)],signal,3)
   g.line([(37,0),(37,260)],metal,2);g.line([(446,0),(446,260)],metal,2)
  elif who=='the-feed':
   for x in (68,286):
    g.line([(x,0),(x,28)],INK,2);g.rect((x-28,28,x+30,56),deep,INK,2,5);g.line([(x-17,40),(x+19,40)],signal,3)
    g.poly([(x-15,57),(x-8,65),(x-6,57)],deep,INK,1.5)
  else:
   g.path((-5,15),[(80,61,121,20,185,41),(279,64,370,12,485,34)],None,INK,5,False)
   g.path((-5,15),[(80,61,121,20,185,41),(279,64,370,12,485,34)],None,metal,2,False)
   for x in (89,333):g.rect((x,24,x+51,32),deep,INK,1.5,2);g.line([(x+5,34),(x+46,34)],signal,2)
  g.rect((0,263,480,270),deep);g.line([(0,263),(480,263)],metal,2)
 return c.finish()
def build(root):
 images={}
 for who in DISTRICTS:
  for layer in ('far','mid','near'):
   for state in ('drained','saturated'):
    key=f'bg-{who}-{layer}-{state}' if who!='hq' else f'bg-{layer}-{state}';file=f'hd/backgrounds/{key}.png';background(who,layer,state=='saturated').save(root/file);images[key]={'file':file}
 return images
if __name__=='__main__':
 import json
 from pathlib import Path
 root=Path(__file__).resolve().parents[3]/'apps/game/public/assets';m=json.loads((root/'manifest-hd.json').read_text());m['images'].update(build(root));(root/'manifest-hd.json').write_text(json.dumps(m,indent=2)+'\n')
