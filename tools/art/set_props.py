from crew import A,C
from PIL import Image,ImageDraw
import json,math
p=A/'manifest.json';m=json.loads(p.read_text())
sheet=Image.new('RGBA',(32,48))
for row,color in enumerate(['red','blue','yellow']):
 im=Image.open(A/f'sprites/props/color-block-{color}.png')
 sheet.paste(im,(0,row*16))
 if color=='yellow':
  squashed=im.resize((16,12),Image.Resampling.NEAREST);sheet.paste(squashed,(16,row*16+4))
sheet.save(A/'sprites/props/color-block.png')
m['sprites']['color-block']=dict(file='sprites/props/color-block.png',frameWidth=16,frameHeight=16,anims={c:dict(row=r,frames=2 if c=='yellow' else 1,fps=6,loop=True) for r,c in enumerate(['red','blue','yellow'])})
for name,w,h,n in [('spotlight',32,64,2),('boom-mic',32,16,4),('green-screen',16,16,1)]:
 sheet=Image.new('RGBA',(w*n,h))
 for f in range(n):
  im=Image.new('RGBA',(w,h));d=ImageDraw.Draw(im)
  if name=='spotlight':
   d.polygon([(13,11),(18,11),(30-f,63),(1+f,63)],fill=C[14 if f==0 else 13])
   # Sparse holes break the beam edge without introducing soft sprite alpha.
   for y in range(16,64,4):
    for x in range(0,32,2):
     if abs(x-16)>4+(y-12)//5 and im.getpixel((x,y))[3]: d.point((x,y),fill=(0,0,0,0))
   d.rectangle((8,1,23,10),fill=C[1],outline=C[0]);d.rectangle((10,9,21,12),fill=C[22],outline=C[0]);d.line([(16,0),(16,3)],fill=C[4])
  elif name=='boom-mic':
   end=[(27,5),(26,8),(23,12),(26,8)][f]
   d.line([(2,1),end],fill=C[0],width=3);d.line([(2,1),end],fill=C[4]);x,y=end
   d.rounded_rectangle((x-4,y-2,x+3,min(15,y+2)),radius=2,fill=C[2],outline=C[0]);d.line([(x-3,y-1),(x+1,y-1)],fill=C[3])
  else:
   d.rectangle((0,0,15,15),fill=C[27]);d.line([(5,8),(11,8)],fill=C[0]);d.line([(8,5),(8,11)],fill=C[0])
  sheet.paste(im,(f*w,0))
 file=f'sprites/props/{name}.png';sheet.save(A/file)
 if name=='green-screen':m['images'][name]={'file':file}
 else:m['sprites'][name]=dict(file=file,frameWidth=w,frameHeight=h,anims={'idle':dict(row=0,frames=n,fps=7,loop=True)})
p.write_text(json.dumps(m,indent=2)+'\n')
