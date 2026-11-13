"""Ink-bordered hit punctuation and hand-pixelled comic lettering."""
from crew import A,C
from PIL import Image,ImageDraw
import json,math
FONT={
'A':['01110','11011','11011','11111','11011','11011','11011'],
'B':['11110','11011','11011','11110','11011','11011','11110'],
'C':['01111','11000','11000','11000','11000','11000','01111'],
'J':['00111','00011','00011','00011','11011','11011','01110'],
'K':['11011','11011','11110','11100','11110','11011','11011'],
'L':['11000','11000','11000','11000','11000','11000','11111'],
'N':['11001','11101','11101','11011','11011','11011','11001'],
'O':['01110','11011','11011','11011','11011','11011','01110'],
'P':['11110','11011','11011','11110','11000','11000','11000'],
'R':['11110','11011','11011','11110','11100','11010','11011'],
'E':['11111','11000','11000','11110','11000','11000','11111'],
'T':['11111','01110','00100','00100','00100','00100','00100'],
'U':['11011','11011','11011','11011','11011','11011','01110'],
'V':['11011','11011','11011','11011','11011','01110','00100'],
'W':['11011','11011','11011','11011','11111','11111','01010'],
'Z':['11111','00011','00110','01100','11000','11000','11111'],
'!':['11','11','11','11','11','00','11'],' ':['000']*7}
p=A/'manifest.json'; m=json.loads(p.read_text()); (A/'fx').mkdir(exist_ok=True)
for word in ['CLACK','LE RE','CUT!','VAJJJ!','POW','BONK','BZZT']:
    im=Image.new('RGBA',(48,24)); d=ImageDraw.Draw(im)
    d.polygon([(1,8),(8,7),(5,1),(17,5),(23,0),(27,5),(43,2),(41,7),(47,10),(43,14),(46,21),(33,19),(29,23),(20,19),(5,23),(7,17),(0,15)],fill=C[22],outline=C[0])
    widths=[len(FONT[ch][0])+1 for ch in word]; x=(48-sum(widths))//2
    points=[]
    for ch in word:
        for y,row in enumerate(FONT[ch]):
            for xx,v in enumerate(row):
                if v=='1': points.append((x+xx+(6-y)//3,8+y))
        x+=len(FONT[ch][0])+1
    for x,y in points: d.rectangle((x-1,y-1,x+1,y+1),fill=C[0])
    for pt in points: d.point(pt,fill=C[6])
    key='fx-'+word.lower().replace(' ','-').replace('!',''); file=f'fx/{key[3:]}.png'; im.save(A/file); m['images'][key]={'file':file}
for name,size,n in [('hit-spark',32,4),('dust-puff',16,4),('tag-in-burst',64,6),('heal-sparkle',32,4)]:
    sheet=Image.new('RGBA',(size*n,size))
    for f in range(n):
        im=Image.new('RGBA',(size,size)); d=ImageDraw.Draw(im); mid=size//2
        if name=='dust-puff':
            for k in range(3):
                x=2+k*4-f%2; y=9-k%2*3-f
                d.ellipse((x,y,min(15,x+5),min(15,y+4)),fill=C[5 if f<2 else 3])
        elif name=='heal-sparkle':
            for x,y in [(8+f*2,20-f*3),(22-f,8+f)]:
                d.polygon([(x,y-4),(x+1,y-1),(x+4,y),(x+1,y+1),(x,y+4),(x-1,y+1),(x-4,y),(x-1,y-1)],fill=C[29 if f%2 else 36],outline=C[0])
        else:
            rad=(size//2-3)*[.45,.8,1,.65,.45,.2][f]
            pts=[]
            for k in range(16):
                a=k*math.pi/8+f*.17; r=rad if k%2==0 else rad*.35
                pts.append((round(mid+math.cos(a)*r),round(mid+math.sin(a)*r)))
            d.polygon(pts,fill=C[22 if name=='hit-spark' else 35],outline=C[0]); r=max(1,int(rad*.25)); d.rectangle((mid-r,mid-r,mid+r,mid+r),fill=C[6])
            if f>1:
                # Hollow late burst opens visual space around the incoming hero.
                r=max(1,int(rad*.18)); d.rectangle((mid-r,mid-r,mid+r,mid+r),fill=(0,0,0,0))
        sheet.paste(im,(f*size,0))
    file=f'fx/{name}.png'; sheet.save(A/file)
    m['sprites'][name]=dict(file=file,frameWidth=size,frameHeight=size,anims={'play':dict(row=0,frames=n,fps=16,loop=False)})
p.write_text(json.dumps(m,indent=2)+'\n')
