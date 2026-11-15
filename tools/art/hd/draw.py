"""Small supersampled vector drawing surface, coordinates in final HD pixels."""
import math
from PIL import Image,ImageDraw
INK='#0f1014';BONE='#f2f1ec';SKIN='#e5a578';SKIN_SH='#b97155'
class Canvas:
 def __init__(self,w,h,ss=3,im=None,origin=(0,0),scale=1):
  self.ss=ss;self.im=im if im is not None else Image.new('RGBA',(w*ss,h*ss));self.d=ImageDraw.Draw(self.im);self.o=origin;self.s=scale
 def group(self,x,y,s=1):return Canvas(0,0,self.ss,self.im,(self.o[0]+x*self.s,self.o[1]+y*self.s),self.s*s)
 def pt(self,p):return tuple(round((a*self.s+b)*self.ss) for a,b in zip(p,self.o))
 def line(self,pts,col=INK,w=3):
  ps=[self.pt(p) for p in pts];ww=max(1,round(w*self.s*self.ss));self.d.line(ps,fill=col,width=ww,joint='curve')
  for x,y in (ps[0],ps[-1]):self.d.ellipse((x-ww/2,y-ww/2,x+ww/2,y+ww/2),fill=col)
 def poly(self,pts,fill,stroke=INK,w=6):
  self.d.polygon([self.pt(p) for p in pts],fill=fill)
  if stroke:self.line(pts+[pts[0]],stroke,w)
 def ellipse(self,box,fill,stroke=None,w=3):
  self.d.ellipse((*self.pt(box[:2]),*self.pt(box[2:])),fill=fill,outline=stroke,width=max(1,round(w*self.s*self.ss)))
 def rect(self,box,fill,stroke=None,w=3,r=0):
  b=(*self.pt(box[:2]),*self.pt(box[2:]));ww=max(1,round(w*self.s*self.ss))
  self.d.rounded_rectangle(b,round(r*self.s*self.ss),fill=fill,outline=stroke,width=ww)
 def path(self,start,segments,fill,stroke=INK,w=6,closed=True):
  pts=[start];p=start
  for seg in segments:
   if len(seg)==2:pts.append(seg);p=seg
   else:
    a,b,q=seg[:2],seg[2:4],seg[4:];base=p
    for i in range(1,17):
     t=i/16;u=1-t;pts.append(tuple(u**3*base[k]+3*u*u*t*a[k]+3*u*t*t*b[k]+t**3*q[k] for k in (0,1)))
    p=q
  if fill:self.d.polygon([self.pt(p) for p in pts],fill=fill)
  if stroke:self.line(pts+([pts[0]] if closed else []),stroke,w)
 def finish(self):return self.im.resize((self.im.width//self.ss,self.im.height//self.ss),Image.Resampling.LANCZOS)
 def dots(self,box,col,step=12,r=1.5):
  x,y,X,Y=box
  for yy in range(int(y),int(Y),step):
   for xx in range(int(x)+(step//2 if yy//step%2 else 0),int(X),step):self.ellipse((xx-r,yy-r,xx+r,yy+r),col)
