"""Finish HD coverage: native pickup rigs and crew icons; reconstructed approved FX.
Run with the Pillow/CairoSVG environment. Pixel originals are read-only.
"""
import copy,json,math
from PIL import Image
from draw import Canvas,INK,BONE
from remaining import A,convert

NATIVE={'chai','tape','checkpoint','journal-flower','big-fan','boulder','sprite-can'}

def frame(key,w,h,anim,f,n):
 c=Canvas(w*4,h*4);g=c.group(0,0,4);t=f/max(n,1)*math.tau
 if key=='chai':
  g.ellipse((9,6,15,12),None,INK,1.6);g.ellipse((10,7,14,11),None,'#fecb56',.8)
  g.path((3,5),[(11,5),(11,12,9,14,7,14),(3,14,3,10,3,5)],'#fecb56',INK,1.5)
  g.poly([(8,6),(10,6),(9,12),(7,13)],'#c38a35',None)
  g.ellipse((3,4,11,7),'#5f4d4a',INK,1)
  for x in (5,9):g.path((x,3.5),[(x-2,2,x+math.sin(t),2,x+.5,1)],None,BONE,.7,False)
 elif key=='tape':
  g.rect((1,4,15,13),'#414453',INK,1.5,1.5);g.rect((3,5,13,9),BONE,INK,.7,1)
  for x in (5,11):
   g.ellipse((x-1.4,6,x+1.4,8.8),INK)
   g.line([(x,7.4),(x+math.cos(t),7.4+math.sin(t))],'#fecb56',.6)
  g.poly([(5,10),(11,10),(12,13),(4,13)],'#9697a0',INK,.7)
  g.line([(3,3),(6,3)],'#fecb56',.8)
 elif key=='checkpoint':
  on=anim=='active';col='#71ceb0' if on else '#64a6cc'
  g.rect((4,22,12,30),'#414453',INK,1.5,1);g.rect((2,29,14,31),'#9697a0',INK,1)
  g.rect((1,4,15,23),'#242633',INK,1.5,2);g.rect((3,6,13,18),'#17655d' if on else '#253acb',INK,.8,1)
  if on:g.line([(5,11),(7,14),(11,9)],col,1.5)
  else:g.line([(5,9),(8,12),(5,15)],col,1.2)
  g.line([(5,20),(8,20)],col if f%2 else BONE,1)
  g.line([(5,2),(10,2)],col,1)
 elif key=='journal-flower':
  x=8+math.sin(t)*.8
  g.path((8,15),[(7,11,x,10,x,7)],None,'#17655d',1.5,False)
  g.path((8,12),[(3,13,2,9,3,9),(6,8,8,11,8,12)],'#71ceb0',INK,.8)
  for k in range(5):
   a=k*math.tau/5;xx=x+math.cos(a)*3;yy=6+math.sin(a)*3
   g.ellipse((xx-2.3,yy-2.3,xx+2.3,yy+2.3),'#b48ce0',INK,.8)
  g.ellipse((x-1.8,4.2,x+1.8,7.8),'#fecb56',INK,.8);g.line([(x-1,5),(x,5)],BONE,.6)
 elif key=='big-fan':
  cx=w/2;cy=h/2;r=min(w,h)*.42
  g.rect((2,2,w-2,h-2),'#414453',INK,1.8,3)
  g.ellipse((cx-r,cy-r,cx+r,cy+r),'#171f22',INK,1.5)
  for k in range(4):
   a=k*math.pi/2+(t/4 if anim!='frozen' else 0)
   def pt(x,y):return (cx+x*math.cos(a)-y*math.sin(a),cy+x*math.sin(a)+y*math.cos(a))
   g.poly([pt(2,-2),pt(r*.8,-5),pt(r*.85,1),pt(r*.55,6),pt(1,3)],'#64a6cc' if anim=='frozen' else '#9697a0',INK,1.2)
  g.ellipse((cx-4,cy-4,cx+4,cy+4),'#fecb56',INK,1.5)
  for x in (5,w-5):
   for y in (5,h-5):g.ellipse((x-1,y-1,x+1,y+1),BONE)
 elif key=='boulder':
  g.poly([(1,10),(3,4),(8,1),(13,3),(15,9),(12,14),(5,15)],'#696b78',INK,1.5)
  g.poly([(2,9),(4,5),(8,3),(9,7),(6,10)],'#c4c3c5',None)
  g.poly([(9,7),(13,5),(14,9),(11,13),(7,14)],'#414453',None)
  g.line([(8,3),(9,7),(7,11)],INK,.8)
 elif key=='sprite-can':
  g.rect((4,2,12,14),'#279a7d',INK,1.3,1.5)
  g.poly([(9,3),(11,3),(11,13),(8,13)],'#17655d',None)
  g.poly([(5,10),(10,5),(10,8),(6,12)],BONE,None)
  g.ellipse((4,1,12,4),'#c4c3c5',INK,1);g.line([(7,2),(9,2)],INK,.6)
  g.line([(5,14),(11,14)],'#9697a0',1)
 return c.finish()

def native(entry,key,kind):
 e=copy.deepcopy(entry);src=Image.open(A/e['file']);out=Image.new('RGBA',(src.width*4,src.height*4))
 if kind=='sprites':
  w,h=e['frameWidth'],e['frameHeight']
  for anim,a in e['anims'].items():
   for f in range(a['frames']):out.paste(frame(key,w,h,anim,f,a['frames']),(f*w*4,a['row']*h*4))
  e['frameWidth']*=4;e['frameHeight']*=4
 else:out=frame(key,src.width,src.height,'idle',0,1)
 e['file']='hd/'+e['file'];dest=A/e['file'];dest.parent.mkdir(parents=True,exist_ok=True);out.save(dest)
 return e

def build(m):
 p=json.loads((A/'manifest.json').read_text());count=0
 for kind in ('sprites','images','portraits','tilesets'):
  for key,e in p[kind].items():
   if key in m[kind]:continue
   if key in NATIVE:m[kind][key]=native(e,key,kind)
   elif key.startswith('icon-') and key[5:] in m['portraits']:
    who=key[5:];portrait=m['portraits'][who];src=Image.open(A/portrait['file']).crop((0,0,portrait['size'],portrait['size']))
    # HD likeness instead of smoothing the old tiny face glyph.
    dest=A/'hd'/e['file'];dest.parent.mkdir(parents=True,exist_ok=True)
    original=Image.open(A/e['file'])
    src.resize((original.width*4,original.height*4),Image.Resampling.LANCZOS).save(dest);m[kind][key]={**e,'file':'hd/'+e['file']}
   else:m[kind][key]=convert(e,kind)
   count+=1
 print('HD objects:',count,'assets built')
 return m

if __name__=='__main__':
 path=A/'manifest-hd.json';m=json.loads(path.read_text());build(m);path.write_text(json.dumps(m,indent=2)+'\n')
