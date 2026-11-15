"""Seven additional Ink / Signal rigs. Coordinates are native HD pixels."""
import json,math
from PIL import Image,ImageDraw
from draw import Canvas,INK,BONE
from crew import limb,hand,head as first_head,frame as first_frame,portrait as first_portrait
STYLE={
 'sehaj':('#858b60','#4f5d46','#242633','#171d24'),
 'manvi':('#303039','#171820','#242633','#342932'),
 'mansukh':('#f0e5ce','#c7b994','#64a6cc','#1b222a'),
 'brahmansh':('#242633','#11151b','#242633','#191c23'),
 'tushar':('#242633','#141921','#242633','#24202a'),
 'manya':('#b48ce0','#9256a8','#64a6cc','#393139'),
 'mishthi':('#f2f1ec','#c4c3c5','#242633','#392c30')}
WOMEN={'manvi','manya','mishthi'};TURBANS={'sehaj':'#858b60','mansukh':'#df413d','brahmansh':'#242633'}
EMOTIONS=['neutral','smug','panic','angry','deadpan','happy','sad','shocked']
def heart(c,x,y,s=1):
 c.path((x,y+7*s),[(x-17*s,y-7*s,x-20*s,y+9*s,x,y+22*s),(x+20*s,y+9*s,x+17*s,y-7*s,x,y+7*s)],'#ff76a5',INK,4)
def star(c,x,y,col='#fecb56',r=7):
 c.poly([(x,y-r),(x+2,y-2),(x+r,y),(x+2,y+2),(x,y+r),(x-2,y+2),(x-r,y),(x-2,y-2)],col,INK,2)
def back_hair(c,who):
 if who not in WOMEN:return
 hair=STYLE[who][3];length=113 if who in ('manya','mishthi') else 90
 c.path((10,20),[(0,37,2,54,0,64),(-5,77,6,81,2,91),(0,length,20,length+5,27,length-7),(62,length+3),(87,length+8,87,99,84,92),(93,82,83,72,85,61),(89,39,80,9,61,5),(30,-4,16,1,10,20)],hair)
 c.path((74,40),[(80,56,71,65,80,75),(86,88,73,91,78,length-4)],None,'#665053',4,False)
def head(c,who,emotion='neutral',blink=False):
 if who in ('ashwath','sayam'):
  first_head(c,who,emotion,blink);return
 skin='#ffceae' if who in WOMEN else '#e5a578';shade='#d29680' if who in WOMEN else '#b97155'
 c.ellipse((2,38,17,58),skin,INK,5)
 c.path((14,21),[(26,5,59,6,73,26),(76,38,71,44,79,49),(82,53,75,55,73,56),(73,71,56,82,40,81),(20,77,12,60,14,21)],skin)
 c.path((64,31),[(73,39,66,47,76,51),(69,56),(68,70,56,76,44,77),(62,61,59,45,64,31)],shade,None)
 if who in TURBANS:
  c.path((13,49),[(25,61,36,56,43,60),(56,54,66,61,73,51),(78,69,65,87,43,86),(20,81,13,69,13,49)],'#20232c')
  c.path((22,69),[(30,79,42,81,53,79)],None,'#414453',3,False)
 elif who=='tushar':
  c.path((34,68),[(40,72,52,72,59,66),(55,79,43,80,34,68)],'#49404a',None)
  for x,y in ((22,63),(28,68),(64,64)):c.line([(x,y),(x+1,y+3)],'#8f6254',3)
 for x,w in ((22,19),(52,14)):
  if blink or emotion=='happy':c.path((x,45),[(x+5,38,x+w-3,39,x+w,45)],None,INK,3,False)
  else:
   y=43 if emotion in ('smug','deadpan') else 40;h=14 if emotion in ('panic','shocked') else 9
   c.path((x,y+2),[(x+4,y-2,x+w-3,y-2,x+w,y+2),(x+w,y+h),(x+3,y+h+2,x,y+7,x,y+2)],BONE,INK,3)
   c.ellipse((x+w-8,y+2,x+w-3,y+h-1),INK)
  brow=30 if emotion in ('panic','sad','shocked') else 34
  c.line([(x,brow),(x+w-2,brow+(4 if emotion=='angry' and x<40 else -3))],INK,3)
  if who=='mishthi':c.line([(x-4,39),(x,43),(x+w,43)],INK,3)
 c.path((47,46),[(44,52,48,55,52,54)],None,shade,3,False)
 lip='#9a3050' if who=='mishthi' else '#ab2446' if who in WOMEN else INK
 if emotion in ('panic','shocked'):c.ellipse((39,62,58,76),INK);c.ellipse((44,69,54,75),'#ce73b3')
 elif emotion=='sad':c.path((33,70),[(42,61,53,62,61,68)],None,lip,3,False)
 elif emotion in ('angry','deadpan'):c.line([(36,67),(58,67)],lip,3)
 elif who=='manya' or emotion=='smug':c.path((31,64),[(41,72,54,71,63,62)],None,lip if who in WOMEN else BONE,3,False)
 else:
  c.path((32,63),[(43,69,56,69,64,61),(59,76,42,78,32,63)],INK,INK,3);c.path((36,65),[(45,69,55,68,60,65)],None,BONE,3,False)
 if who=='brahmansh':
  c.path((45,59),[(32,51,26,65,20,57),(16,49,21,48,24,51)],None,INK,6,False)
  c.path((47,59),[(58,51,66,64,72,56),(75,49,70,47,68,51)],None,INK,6,False)
 if who in TURBANS:
  col=TURBANS[who]
  c.path((7,38),[(1,24,6,13,19,5),(32,-5,48,-4,61,3),(77,8,82,25,74,39),(58,35,48,24,43,19),(30,31,21,35,7,38)],col)
  hi={'sehaj':'#a4ae83','mansukh':'#ff7962','brahmansh':'#535563'}[who]
  for yy in (8,17,26):c.path((12,yy+8),[(25,yy+3,35,yy+1,45,yy-5)],None,hi,3,False)
  c.path((48,5),[(54,16,63,25,73,29)],None,hi,3,False)
 elif who=='tushar':
  c.path((8,47),[(0,37,3,25,8,20),(2,14,18,10,19,5),(32,-3,40,4,48,0),(64,-2,76,9,76,22),(79,33,69,37,65,33),(56,24,50,21,43,24),(32,30,25,24,20,33),(15,45),(8,47)],'#24202a')
  c.path((15,21),[(26,12,39,15,48,9),(60,6,67,16,69,22)],None,'#554850',4,False)
  for x,w in ((17,29),(49,25)):c.rect((x,36,x+w,55),None,'#fecb56',3,5)
  c.line([(19,33),(72,33)],'#c38a35',3);c.line([(46,41),(49,41)],'#fecb56',3)
  if emotion=='smug':
   c.poly([(15,37),(45,37),(43,55),(19,54)],INK);c.poly([(49,37),(76,37),(72,54),(52,55)],INK)
   c.line([(21,42),(33,42)],BONE,3);c.line([(55,42),(67,42)],BONE,3)
 else:
  c.path((9,48),[(1,34,3,17,15,9),(28,-3,43,2,52,2),(72,4,81,20,77,39),(70,45,62,34,58,26),(52,19,47,14,43,12),(35,25,26,26,18,31),(15,43),(9,48)],STYLE[who][3])
  c.path((14,24),[(22,13,33,13,41,7)],None,'#665053',4,False)
  c.path((52,10),[(65,16,69,25,71,34)],None,'#665053',3,False)
  if who in ('manya','mishthi'):
   for x in (10,72):
    c.line([(x,54),(x,63)],'#c4c3c5',3)
    c.ellipse((x-4,60,x+4,69),None,'#fecb56',3)

def outfit(c,who):
 main,shade,_,_=STYLE[who]
 c.path((65,93),[(80,87,110,89,122,100),(129,120,125,135,122,144),(70,144),(61,128,58,109,65,93)],main)
 c.poly([(112,100),(123,107),(122,140),(108,140),(113,122)],shade,None)
 if who=='manya':
  c.poly([(72,130),(114,130),(126,148),(63,148)],main)
  for x,y in ((75,111),(96,109),(109,121),(81,137),(105,139)):
   for dx,dy in ((-3,0),(3,0),(0,-3),(0,3)):c.ellipse((x+dx-2,y+dy-2,x+dx+3,y+dy+3),'#c794ac')
   c.ellipse((x-1,y-1,x+2,y+2),BONE)
 elif who=='mishthi':
  c.poly([(76,108),(90,115),(106,109),(118,108),(117,143),(74,143)],'#815844',INK,4)
  c.line([(94,116),(94,139)],'#3f2b28',4)
  for y in (118,126,134):c.line([(89,y),(99,y+5),(89,y+8)],'#d3bea0',3)
  c.poly([(76,95),(89,98),(85,112)],BONE,INK,3);c.poly([(105,95),(94,99),(104,111)],BONE,INK,3)
 elif who=='manvi':
  c.poly([(83,96),(106,96),(111,140),(80,140)],'#ab2446',INK,3)
  c.poly([(69,97),(82,95),(85,110),(76,117),(82,137),(67,134)],'#414453',INK,3)
  c.poly([(111,96),(122,103),(117,139),(108,139),(112,116),(104,110)],'#171820',INK,3)
 elif who=='sehaj':
  c.poly([(83,96),(106,96),(110,140),(82,140)],BONE,INK,3)
  c.line([(77,99),(77,138)],'#d3bea0',3);c.line([(113,103),(113,138)],'#d3bea0',3)
  c.line([(69,142),(121,142)],BONE,4)
 elif who in ('mansukh','brahmansh','tushar'):
  c.poly([(79,94),(94,102),(88,113),(73,99)],main,INK,3);c.poly([(105,94),(94,102),(101,113),(115,99)],main,INK,3)
  c.line([(94,105),(94,131)],'#c4c3c5' if who=='brahmansh' else shade,3)
  if who=='brahmansh':c.line([(76,98),(87,108)],BONE,3);c.rect((107,116,116,120),'#ff2f36')
  if who=='mansukh':
   c.path((69,98),[(75,122,110,121,120,98)],None,INK,6,False)
   c.rect((65,99,75,119),'#414453',INK,4,3);c.rect((115,99,125,119),'#414453',INK,4,3)
 if who in ('manya','tushar','mansukh'):
  c.path((82,98),[(88,112,101,113,108,98)],None,'#c4c3c5' if who!='mansukh' else '#fecb56',3,False)
  if who=='manya':c.ellipse((93,110,99,117),'#fecb56',INK,2)

def prop(c,who,x,y,anim,f):
 if who=='tushar' and anim in ('wildcard','super') and f>=2:
  if f<4:
   c.rect((x-22,y-24,x+21,y+7),INK,INK,4,3);c.rect((x-17,y-19,x+16,y+2),'#3a6ea5');c.poly([(x-22,y+8),(x+21,y+8),(x+27,y+16),(x-26,y+16)],'#697b8e',INK,4)
  elif f<6:
   c.rect((x-23,y-12,x+23,y+18),'#414453',INK,5,4);c.ellipse((x-10,y-8,x+15,y+17),'#3a6ea5',INK,4);c.ellipse((x-4,y-2,x+8,y+11),'#b5fbec');c.rect((x-13,y-18,x+2,y-12),INK)
  return
 if who in ('sehaj','brahmansh'):
  c.line([(x-6,y+13),(x+12,y-22)],INK,8);c.line([(x-6,y+11),(x+10,y-20)],'#697b8e',4)
  c.poly([(x+4,y-9),(x+13,y-35),(x+20,y-14),(x+10,y-3)],BONE,INK,4)
 elif who=='manvi':
  c.rect((x-4,y-12,x+5,y+19),'#414453',INK,4,3);c.ellipse((x-10,y-26,x+11,y-7),'#697b8e',INK,4)
  c.line([(x-6,y-19),(x+7,y-19)],BONE,3)
 elif who=='mansukh':
  if anim in ('stan','super'):
   c.rect((x-4,y-6,x+4,y+22),INK,INK,3,2);c.ellipse((x-15,y-31,x+15,y-4),BONE,INK,4)
   c.poly([(x-13,y-25),(x-19,y-38),(x-5,y-29)],'#ff2f36',INK,3);c.poly([(x+6,y-29),(x+18,y-38),(x+13,y-22)],'#ff2f36',INK,3)
   heart(c,x,y-24,.35);c.path((x,y+20),[(x+17,y+29,x+10,y+34,x+4,y+30)],None,'#ff2f36',3,False)
  else:
   c.poly([(x-7,y+20),(x+4,y-29),(x+12,y-27),(x+1,y+22)],'#fecb56',INK,4)
   c.poly([(x+4,y-29),(x+12,y-27),(x+12,y-41)],'#d3bea0',INK,3)
 elif who=='manya':
  if anim in ('journal','block'):
   c.poly([(x-26,y-22),(x-2,y-15),(x,y-12),(x+24,y-22),(x+26,y+20),(x,y+27),(x-26,y+17)],'#fecb56',INK,5)
   c.poly([(x-22,y-17),(x-3,y-11),(x-3,y+20),(x-22,y+13)],'#f0e5ce',None)
   c.poly([(x+3,y-11),(x+20,y-17),(x+22,y+16),(x+3,y+20)],BONE,None)
   for yy in (-4,5):c.line([(x-17,y+yy),(x-8,y+yy+2)],'#c794ac',3)
   star(c,x+12,y+3,'#b48ce0',7)
  else:
   c.line([(x-7,y+20),(x+7,y-22)],INK,8);c.line([(x-7,y+19),(x+6,y-20)],'#c38a35',4)
   c.path((x+2,y-18),[(x-2,y-28,x+13,y-39,x+12,y-41),(x+21,y-27,x+17,y-17,x+2,y-18)],'#b48ce0',INK,4)
   c.line([(x+6,y-24),(x+12,y-32)],BONE,3)
 elif who=='tushar':
  c.rect((x-22,y-9,x+23,y+20),'#414453',INK,5,3)
  c.poly([(x-24,y-13),(x+20,y-23),(x+23,y-13),(x-21,y-3)],INK,INK,4)
  for xx in (-15,0,15):c.line([(x+xx,y-13),(x+xx+3,y-19)],BONE,4)
  c.line([(x-14,y+4),(x+13,y+4)],BONE,3)
 else:
  c.path((x-12,y-14),[(x-6,y-7,x-10,y-2,x-15,y+8),(x-23,y+29,x+24,y+29,x+15,y+8),(x+10,y-2,x+6,y-7,x+12,y-14)],'#9a3050',INK,5)
  c.line([(x-5,y+9),(x-8,y+18)],'#ce73b3',3)

def frame(who,anim,f,n):
 c=Canvas(192,192);phase=f/n*math.tau;main,shade,trouser,hair=STYLE[who]
 bob=math.sin(phase)*2 if anim=='idle' else -abs(math.sin(phase))*5 if anim=='run' else 0
 lean=[-4,-7,-4,6,8,5,2,0][min(7,int(f/n*8))] if anim=='attack' else -5 if anim in ('hurt','block') else 0
 if anim=='ko':bob=min(24,f*7);lean=-5
 if anim in ('jump','fall'):bob=-8+f*2
 if anim=='unhinged':lean=math.sin(phase)*9;bob=-abs(math.sin(phase))*7
 if anim=='indifferent' or (who=='mishthi' and anim=='super'):lean=math.sin(phase)*5
 g=c.group(lean,bob);stride=math.sin(phase)*21 if anim=='run' else 0
 for x,sgn in ((78,-1),(109,1)):
  end=(x+stride*sgn,185-bob)
  if anim=='run':end=(end[0],end[1]-max(0,math.cos(phase)*sgn)*14)
  if anim in ('jump','fall'):end=(x+sgn*14,172)
  if anim=='ko':end=(x+sgn*18,185-bob)
  limb(g,[(x,136),((x+end[0])/2+5,160),end],trouser,19 if who in ('manvi','manya') else 17)
  g.line([(x-3,145),(x-1,159)],'#3a6ea5' if who in ('manya','mansukh') else '#4b5267',3)
  g.rect((end[0]-12,end[1]-5,end[0]+15,end[1]+5),INK,INK,4,4);g.line([(end[0]-9,end[1]+2),(end[0]+11,end[1]+2)],BONE,3)
 back_hair(g.group(56,20,.95),who)
 rear=(51+stride*.3,128-stride*.2)
 if anim in ('heart','beast'):rear=(62,75 if anim=='beast' else 114)
 limb(g,[(67,103),(51,115),rear],main,18);hand(g,*rear)
 outfit(g,who)
 head(g.group(56-lean*.2,65 if anim=='beast' else 20,.95),who,'sad' if anim in ('hurt','ko') else 'panic' if anim=='panic' else 'smug' if anim=='indifferent' or (who=='tushar' and anim in ('wildcard','super') and f>=6) else 'angry' if anim=='super' else 'neutral',anim=='idle' and f==6)
 hx,hy=133-stride*.25,127
 if anim=='attack':hx,hy=[(126,122),(119,108),(123,96),(150,108),(151,115),(144,122),(138,125),(133,127)][min(7,int(f/n*8))]
 if anim in ('ability','super','stan','journal','wildcard'):hx,hy=(136,119-min(f,4)*8)
 if anim=='block':hx,hy=141,100
 if anim=='heart' or (who=='manvi' and anim=='super'):hx,hy=103,120
 if anim=='beast':hx,hy=144,69
 if anim=='tagin' and who=='manya':hx,hy=139,70
 if anim=='indifferent' or (who=='mishthi' and anim=='super'):hx,hy=130,81 if f<n//2 else 122
 if anim=='unhinged' or (who=='brahmansh' and anim=='super'):hx,hy=146,88+math.cos(phase)*18
 limb(g,[(117,103),(128,123),(hx,hy)],main,18);hand(g,hx,hy)
 if who in ('manya','tushar','brahmansh'):
  g.line([(hx-8,hy-8),(hx+5,hy-8)],'#c4c3c5',4)
  if who=='manya':g.line([(hx-8,hy-13),(hx+4,hy-13)],BONE,3);g.line([(rear[0]-7,rear[1]-8),(rear[0]+6,rear[1]-8)],'#c4c3c5',4)
  if who=='tushar':
   for k in range(3):g.line([(rear[0]-4+k*3,rear[1]-3),(rear[0]-2+k*3,rear[1]+3)],'#8f493b',2)
   star(g,hx+2,hy-9,BONE,4)
 if anim=='heart' or (who=='manvi' and anim=='super'):heart(g,95,109,1)
 elif anim=='beast':
  g.path((43,45),[(46,24,68,13,88,18),(111,5,143,19,153,36),(157,55,130,62,101,57),(77,65,45,61,43,45)],'#9697a0',INK,6)
  g.poly([(57,33),(80,25),(98,30),(89,43),(63,48)],'#c4c3c5',None)
 elif anim=='tagin' and who=='manya':
  for x,y in ((hx,hy),(51,87)):
   g.line([(x,y),(x-8,y-17)],'#ffceae',5);g.line([(x+3,y),(x+12,y-16)],'#ffceae',5)
 else:prop(g,who,hx,hy,anim,f)
 if who=='manya' and anim in ('ability','super'):
  g.path((30,158),[(40,150,54,151,61,157),(57,181),(35,181),(30,158)],'#9256a8',INK,5)
  g.line([(33,157),(58,157)],'#b48ce0',4)
 if who=='brahmansh' and anim in ('unhinged','super'):
  for k in range(3):g.line([(22,102+k*13),(47+(f%3)*4,102+k*13)],'#ff2f36',4)
 if anim=='journal' and f>1:
  for k in range(min(4,f)):
   x=40+k*23;y=47-(f+k)%4*7
   g.poly([(x,y),(x+13,y-4),(x+17,y+9),(x+3,y+13)],BONE,INK,3);g.line([(x+5,y+3),(x+11,y+3)],'#b48ce0',3)
 if anim in ('ability','super','stan') and f>2:
  for k in range(3):star(c,31+k*64,46+(f+k)%3*13,'#b48ce0' if who=='manya' else '#fecb56',5)
 if anim=='beast':head(g.group(56-lean*.2,65,.95),who)
 if anim=='attack' and f in (3,4):c.path((141,75),[(161,74,181,89,182,109)],None,'#fecb56',6,False)
 return c.finish()
def portrait(who,emotion):
 if who in ('ashwath','sayam'):return first_portrait(who,emotion)
 c=Canvas(256,256);back_hair(c.group(43,20,2.15),who)
 outfit(c.group(-51,-15,1.85),who)
 head(c.group(43,20,2.15),who,emotion)
 return c.finish()

def build(root):
 pixel=json.loads((root/'manifest.json').read_text());entries={};portraits={}
 for who in ('ashwath','sayam',*STYLE):
  names=list(pixel['sprites'][who]['anims']);meta={};width=192*10
  sheet=Image.new('RGBA',(width,len(names)*192))
  for row,name in enumerate(names):
   n=10 if name=='run' else 3 if name in ('jump','fall','hurt') else 4 if name in ('ko','block') else 8
   fps=15 if name=='run' else 16 if name=='attack' else 10 if name=='idle' else 12
   meta[name]=dict(row=row,frames=n,fps=fps,loop=name in ('idle','run','fall','block','cosmic','panic'))
   if name=='attack':meta[name]['hitFrame']=3
   for f in range(n):
    if who in STYLE:im=frame(who,name,f,n)
    else:
     source={'ko':'hurt','tagin':'idle','info':'ability','cosmic':'idle','bhai':'super'}.get(name,name)
     count={'idle':8,'run':10,'jump':3,'fall':3,'attack':8,'ability':8,'hurt':3,'block':4,'super':8}[source]
     im=first_frame(who,source,min(count-1,int(f/n*count)),count)
     if name=='ko':
      crop=im.resize((192,round(192*(1-f*.10))),Image.Resampling.LANCZOS);im=Image.new('RGBA',(192,192));im.paste(crop,(0,192-crop.height))
     if name=='cosmic':
      d=ImageDraw.Draw(im)
      for k in range(3):x=32+k*57;y=13+(f+k)%3*6;d.line([(x-4,y),(x+4,y)],fill='#fecb56',width=3);d.line([(x,y-4),(x,y+4)],fill='#fecb56',width=3)
    sheet.paste(im,(f*192,row*192))
  file=f'hd/sprites/characters/{who}.png';sheet.save(root/file);entries[who]=dict(file=file,frameWidth=192,frameHeight=192,anims=meta)
  sheet=Image.new('RGBA',(2048,256))
  for i,e in enumerate(EMOTIONS):sheet.paste(portrait(who,e),(i*256,0))
  file=f'hd/portraits/{who}.png';sheet.save(root/file);portraits[who]=dict(file=file,size=256,emotions=EMOTIONS)
 return entries,portraits
if __name__=='__main__':
 from pathlib import Path
 root=Path(__file__).resolve().parents[3]/'apps/game/public/assets'
 m=json.loads((root/'manifest-hd.json').read_text());s,p=build(root);m['sprites'].update(s);m['portraits'].update(p);(root/'manifest-hd.json').write_text(json.dumps(m,indent=2)+'\n')
 review=Image.new('RGBA',(9*192,256+192*3),'#242633');d=ImageDraw.Draw(review)
 for i,who in enumerate(('ashwath','sayam',*STYLE)):
  d.text((i*192,0),who,fill='white');review.paste(portrait(who,'neutral').resize((192,192)),(i*192,20))
  for j,a in enumerate(('idle','attack','super')):
   im=frame(who,a,3,8) if who in STYLE else first_frame(who,a,3,8)
   review.paste(im,(i*192,230+j*192))
 review.save(root.parents[3]/'tools/art/raw/t-a49-cast.png')
