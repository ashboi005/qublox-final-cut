"""Six deterministic 480×270 horizontally wrapping skyline layers."""
from crew import A,C,ROOT
from PIL import Image,ImageDraw
import random,json
p=A/'manifest.json'; m=json.loads(p.read_text()); (A/'backgrounds').mkdir(exist_ok=True)
for depth in ['far','mid','near']:
    for state in ['drained','saturated']:
        saturated=state=='saturated'; rng=random.Random(84)
        im=Image.new('RGBA',(480,270)); d=ImageDraw.Draw(im)
        base={'far':3,'mid':2,'near':1}[depth]
        accent=35 if saturated else 12
        warm=22 if saturated else 11
        # Repeat all geometry at ±480 so boundary features join exactly.
        def rect(b,c):
            x,y,X,Y=b
            for shift in (-480,0,480): d.rectangle((x+shift,y,X+shift,Y),fill=C[c])
        def line(points,c,w=1):
            for shift in (-480,0,480): d.line([(x+shift,y) for x,y in points],fill=C[c],width=w)
        if depth=='far':
            rect((0,0,479,269),1)
            for y,c in [(88,2),(170,3),(230,4)]: rect((0,y,479,269),c)
            for i in range(14):
                x=i*37-8; h=rng.randrange(55,120); y=270-h
                rect((x,y,x+26,269),2); rect((x+4,y-9,x+20,y),2); line([(x+12,y-24),(x+12,y-9)],3)
                for wy in range(y+9,260,13):
                    for wx in range(x+5,x+24,7):
                        if rng.random()>.45: rect((wx,wy,wx+1,wy+2),warm)
            line([(0,243),(479,243)],3)
        elif depth=='mid':
            for i in range(7):
                x=i*76-18; y=rng.randrange(90,175)
                rect((x,y,x+52,269),0); rect((x+2,y+2,x+50,269),2); rect((x+3,y+3,x+50,y+6),4)
                rect((x+8,y-12,x+36,y),1); line([(x+12,y-12),(x+12,y-31)],3)
                for wy in range(y+15,261,20):
                    rect((x+5,wy,x+47,wy+7),1)
                    for wx in range(x+8,x+45,9): rect((wx,wy+2,wx+4,wy+4),accent if rng.random()>.6 else 3)
                rect((x+48,y+18,x+50,y+62),accent)
                if i%2==0:
                    rect((x+10,y+21,x+40,y+44),0); rect((x+12,y+23,x+38,y+42),18 if saturated else 9)
                    line([(x+15,y+38),(x+22,y+27),(x+30,y+38),(x+35,y+30)],warm,2)
            line([(0,215),(479,215)],0,4); line([(0,214),(479,214)],4)
        else:
            for x in range(-12,480,120):
                rect((x,209,x+18,269),0); rect((x+2,211,x+16,269),1); rect((x+2,211,x+3,269),3)
                rect((x-5,204,x+24,210),0); rect((x-4,204,x+23,205),3)
                line([(x+20,226),(x+47,233),(x+80,233),(x+120,219)],0,3)
                line([(x+20,225),(x+47,232),(x+80,232),(x+120,218)],9)
                rect((x+30,245,x+95,269),0); rect((x+32,247,x+93,269),1)
                for vx in range(x+36,x+88,8): rect((vx,251,vx+3,262),2)
                rect((x+36,247,x+58,248),accent)
        file=f'backgrounds/neo-amritsar-{depth}-{state}.png'; im.save(A/file)
        m['images'][f'bg-{depth}-{state}']={'file':file}
p.write_text(json.dumps(m,indent=2)+'\n')
(ROOT/'docs/art/backgrounds.md').write_text('''# Neo-Amritsar parallax layers

All six PNGs are native 480×270, repeat horizontally every 480px. Draw far → mid → near with a common bottom baseline. Suggested scroll factors for Claude: 0.10 / 0.30 / 0.60. Far is opaque; mid and near have binary transparent sky. Each depth has identical geometry in its drained/saturated pair. Switch paired images together when colour returns; heroes are unaffected.

Far: stepped antenna skyline and sparse warm windows. Mid: concrete tower stacks, neon seams, geometric billboard art, elevated rail. Near: pylons, hanging cable runs, vented roof housings. These are background decoration, never collision geometry.

Manifest image keys: bg-far-drained, bg-far-saturated, bg-mid-drained, bg-mid-saturated, bg-near-drained, bg-near-saturated.
''')
