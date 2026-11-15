"""Flat-colour region reconstruction into rounded vector paths.
Pillow + CairoSVG only. Frame isolation preserves atlas/animation contracts.
RDP removes staircase vertices; quadratic joins soften the rebuilt contours.
"""
from io import BytesIO
import math
from PIL import Image
import cairosvg

def simplify(p,t=.55):
 if len(p)<3:return p
 a,b=p[0],p[-1];dx=b[0]-a[0];dy=b[1]-a[1];den=math.hypot(dx,dy)
 ds=[abs(dy*(x-a[0])-dx*(y-a[1]))/den if den else math.dist(a,(x,y)) for x,y in p]
 k=max(range(len(ds)),key=ds.__getitem__)
 return simplify(p[:k+1],t)[:-1]+simplify(p[k:],t) if ds[k]>t else [a,b]

def paths(im):
 pix=im.load();w,h=im.size;groups={}
 for y in range(h):
  for x in range(w):
   col=pix[x,y]
   if not col[3]:continue
   edges=groups.setdefault(col,{})
   for nx,ny,a,b in ((x,y-1,(x,y),(x+1,y)),(x+1,y,(x+1,y),(x+1,y+1)),(x,y+1,(x+1,y+1),(x,y+1)),(x-1,y,(x,y+1),(x,y))):
    if nx<0 or ny<0 or nx>=w or ny>=h or pix[nx,ny]!=col:edges.setdefault(a,[]).append(b)
 for col,edges in groups.items():
  loops=[]
  while edges:
   start=next(iter(edges));p=[start];a=start
   while True:
    b=edges[a].pop()
    if not edges[a]:del edges[a]
    p.append(b);a=b
    if a==start:break
   # Split a closed ring for stable simplification.
   k=len(p)//2;p=simplify(p[:k+1])[:-1]+simplify(p[k:])[:-1]
   if len(p)<3:continue
   commands=[]
   for i,b in enumerate(p):
    a=p[i-1];c=p[(i+1)%len(p)];r=min(.32,math.dist(a,b)/3,math.dist(b,c)/3)
    q=tuple(b[j]+(a[j]-b[j])*r/math.dist(a,b) for j in (0,1));s=tuple(b[j]+(c[j]-b[j])*r/math.dist(b,c) for j in (0,1))
    commands.append(f'{"M" if i==0 else "L"}{q[0]:.3f},{q[1]:.3f} Q{b[0]},{b[1]} {s[0]:.3f},{s[1]:.3f}')
   loops.append(' '.join(commands)+' Z')
  yield col,' '.join(loops)

def render(im,scale=4):
 im=im.convert('RGBA');parts=[]
 for (r,g,b,a),d in paths(im):
  # A tiny same-colour stroke seals subpixel seams between adjacent regions.
  parts.append(f'<path d="{d}" fill="rgb({r},{g},{b})" fill-opacity="{a/255}" fill-rule="evenodd" stroke="rgb({r},{g},{b})" stroke-opacity="{a/255}" stroke-width="0.12"/>')
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="{im.width}" height="{im.height}" viewBox="0 0 {im.width} {im.height}">'+''.join(parts)+'</svg>'
 png=cairosvg.svg2png(bytestring=svg.encode(),output_width=im.width*scale*2,output_height=im.height*scale*2)
 return Image.open(BytesIO(png)).convert('RGBA').resize((im.width*scale,im.height*scale),Image.Resampling.LANCZOS)
