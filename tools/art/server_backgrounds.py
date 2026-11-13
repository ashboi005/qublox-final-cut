from crew import A,C,ROOT
from PIL import Image,ImageDraw
import json,math
p=A/'manifest.json'; m=json.loads(p.read_text())
for depth in ['far','mid','near']:
 for state in ['drained','saturated']:
    im=Image.new('RGBA',(480,270)); d=ImageDraw.Draw(im); sat=state=='saturated'; hot=38 if sat else 11; cool=35 if sat else 12
    def r(b,c):
        x,y,X,Y=b
        for off in (-480,0,480): d.rectangle((x+off,y,X+off,Y),fill=C[c])
    def l(points,c,w=1):
        for off in (-480,0,480): d.line([(x+off,y) for x,y in points],fill=C[c],width=w)
    if depth=='far':
        r((0,0,479,269),1)
        for x in range(-20,480,80):
            r((x,28,x+57,269),2); r((x+2,30,x+55,269),3)
            for y in range(38,270,16):
                r((x+5,y,x+51,y+10),1)
                for xx in range(x+9,x+49,8): r((xx,y+4,xx+3,y+5),cool if xx%3 else 4)
        for y in (16,132,246): r((0,y,479,y+4),2)
    elif depth=='mid':
        for x in range(-16,480,120):
            r((x,0,x+12,269),0); r((x+2,0,x+10,269),2); r((x+3,0,x+4,269),4)
            r((x+20,65,x+100,169),0); r((x+22,67,x+98,167),2)
            # Heavy exhaust fan, tilted blades, hot status panel.
            for off in (-480,0,480):
                d.ellipse((x+27+off,75,x+92+off,140),fill=C[0],outline=C[3],width=2)
                for a in range(4):
                    ang=a*math.pi/2+.3; cx=x+60+off; cy=108
                    points=[(cx,cy),(cx+round(math.cos(ang)*27),cy+round(math.sin(ang)*27)),(cx+round(math.cos(ang+.7)*22),cy+round(math.sin(ang+.7)*22))]
                    d.polygon(points,fill=C[3],outline=C[0])
                d.ellipse((x+55+off,103,x+65+off,113),fill=C[hot])
            r((x+29,148,x+90,157),1); r((x+32,151,x+52,153),hot)
            for xx in (60,70,80): r((x+xx,151,x+xx+4,153),cool)
        for y in (34,194):
            r((0,y,479,y+9),0)
            for yy,col in [(y+2,hot),(y+5,cool)]: l([(0,yy),(479,yy)],col,2)
            for x in range(0,480,24): r((x,y,x+3,y+9),3)
    else:
        for x in range(-10,480,160):
            r((x,0,x+25,269),0); r((x+2,0,x+23,269),1); r((x+2,0,x+3,269),3)
            for y in (13,250): r((x+7,y,x+17,y+4),3)
            for dx in (0,8,16): l([(x+25+dx,0),(x+26+dx,33),(x+42+dx,49),(x+99+dx,49),(x+120+dx,67)],0,4)
            r((x+30,241,x+138,269),0); r((x+32,243,x+136,269),1)
            for vx in range(x+38,x+133,8): r((vx,248,vx+3,263),2)
            r((x+36,243,x+63,245),hot)
    file=f'backgrounds/render-farm-{depth}-{state}.png'; im.save(A/file); m['images'][f'bg-render-farm-{depth}-{state}']={'file':file}
p.write_text(json.dumps(m,indent=2)+'\n')
(ROOT/'docs/art/backgrounds-render-farm.md').write_text('''# Render Farm parallax

Six 480×270 layers, horizontally repeating, drawn far/mid/near. Far is opaque server walls; mid is exhaust fans and lit cable trays; near is dark pillars, hanging cables and floor vents. Suggested factors 0.10/0.30/0.60. Pair variants have identical geometry, RGBA binary alpha, exact shared palette. Drained replaces hot orange/cyan indicators with beige; saturation returns heat and electric colour. Image keys bg-render-farm-{far,mid,near}-{drained,saturated}.
''')
