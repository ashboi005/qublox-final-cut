"""T-A43 environment finishing pass. Native pixels, semantic surfaces, no blur.
Rebuilds original environment sources first, then applies deterministic detail.
"""
import json,runpy,sys
from PIL import Image,ImageDraw,ImageColor
from likeness import A,C,Pen
from palette import ROOT
from tiles import build as tile_base
from districts import build as district_base

def rebuild():
    tile_base('hq');tile_base('render-farm')
    for name in ('backgrounds.py','server_backgrounds.py','the_set.py'):runpy.run_path(str(ROOT/'tools/art'/name),run_name='__main__')
    district_base('the-feed');district_base('templatr')

def tiles(name):
    file=A/f'tiles/{name}.png';sheet=Image.open(file).convert('RGBA')
    stone=name=='templatr';metal=name=='render-farm';feed=name=='the-feed';stage=name=='the-set'
    light,mid,dark=(14,13,11) if stone else (19,18,2) if metal else (4,3,2)
    for i in range(36):
        x=i%6*16;y=i//6*16;im=sheet.crop((x,y,x+16,y+16));p=Pen(im)
        if i<9:
            # Quiet formed slabs: staggered pores, casting seam and countersunk bolts.
            for xx,yy in [(3,7),(9,4),(12,12)]:
                if not stone:p.r((xx,yy,xx,yy),dark);p.r((xx+1,yy,xx+1,yy),light)
            if i<3:
                p.l([(2,2),(13,2)],light)
                p.r((3,3,4,4),dark);p.r((3,3,3,3),light)
                p.r((11,3,12,4),dark);p.r((11,3,11,3),light)
            if i>=6:p.l([(2,13),(13,13)],dark)
            if metal:
                p.l([(4,9),(11,9)],2);p.l([(5,10),(10,10)],19)
            elif stone:
                p.l([(3,5),(5,6),(6,9),(8,10)],12)
                p.l([(4,5),(6,6)],14)
            elif stage:p.l([(4,12),(7,10),(11,10)],2)
            elif feed:p.r((5,7,10,9),1);p.l([(6,8),(9,8)],18)
        elif i<12:
            p.l([(0,1),(15,1)],14 if stone else 19 if metal else 5)
            for xx in (3,11):p.r((xx,3,xx+1,4),0);p.r((xx,3,xx,3),14 if stone else 5)
        elif i in (13,14,15,16):
            p.l([(2,0),(2,15)],14 if stone else 5)
            for yy in (2,13):p.r((12,yy,13,yy+1),0);p.r((12,yy,12,yy),4)
            if i<15:
                for yy in (9,11):p.l([(5,yy),(7,yy)],2)
                p.l([(10,7),(10,12)],3)
        elif i in (17,18):
            p.l([(3,2),(11,2)],5);p.r((3,10,4,10),29 if i==18 else 20)
            for xx in (5,7,9,11):p.r((xx,14,xx,14),3)
        else:
            # Top-left single-pixel material highlights follow existing opaque surfaces.
            src=im.copy();pix=src.load()
            replacements={ImageColor.getrgb(C[a])+(255,):C[b] for a,b in [(1,2),(2,3),(9,11),(11,12),(23,22),(27,29),(18,19)]}
            for yy in range(2,15):
                for xx in range(2,14):
                    c=pix[xx,yy]
                    if c in replacements and (xx+yy*3+i)%11==0 and pix[xx-1,yy]==c and pix[xx,yy-1]==c:
                        p.d.point((xx,yy),fill=replacements[c])
            if name in ('hq','render-farm') and i in (30,34):
                for yy in (3,7,11):p.r((4,yy,4,yy),5);p.r((7,yy,8,yy),0)
            if stage and i in (19,20):
                p.l([(0,14),(15,14)],27);p.r((2,2,2,3),29)
            if stone and i in (19,26,28):p.l([(2,13),(13,13)],12)
        sheet.paste(im,(x,y))
    sheet.save(file)

class Wrap:
    def __init__(self,im):self.d=ImageDraw.Draw(im)
    def r(self,b,c):
        x,y,X,Y=b
        for dx in (-480,0,480):self.d.rectangle((x+dx,y,X+dx,Y),fill=C[c])
    def l(self,pts,c,w=1):
        for dx in (-480,0,480):self.d.line([(x+dx,y) for x,y in pts],fill=C[c],width=w)
    def p(self,pts,c,o=None):
        for dx in (-480,0,480):self.d.polygon([(x+dx,y) for x,y in pts],fill=C[c],outline=C[o] if o is not None else None)
    def ellipse(self,b,c,o=None):
        x,y,X,Y=b
        for dx in (-480,0,480):self.d.ellipse((x+dx,y,X+dx,Y),fill=C[c],outline=C[o] if o is not None else None)

def background(name,depth,state):
    file=A/f'backgrounds/{name}-{depth}-{state}.png';im=Image.open(file).convert('RGBA');p=Wrap(im);sat=state=='saturated'
    cool=35 if sat else 12;warm=22 if sat else 11;pink=26 if sat else 10
    if name=='neo-amritsar':
        if depth=='far':
            # Distant moon, tiny stars and heritage rooftop silhouettes.
            p.ellipse((329,25,348,44),5);p.ellipse((336,22,352,40),1)
            for k in range(31):p.r(((k*73+17)%480,14+(k*31)%67,(k*73+17)%480,14+(k*31)%67),3 if k%4 else 5)
            for x,y in [(54,134),(202,122),(368,144)]:
                p.r((x,y,x+31,179),2);p.p([(x-3,y),(x+15,y-18),(x+34,y)],2)
                p.r((x+14,y-25,x+16,y-18),3)
                for xx in range(x+4,x+29,8):p.p([(xx,y+18),(xx,y+8),(xx+2,y+5),(xx+4,y+8),(xx+4,y+18)],warm)
            # Very low contrast horizontal air-traffic streaks.
            p.l([(35,74),(56,74)],3);p.r((54,73,56,73),cool)
        elif depth=='mid':
            for x,y in [(10,137),(162,115),(314,132)]:
                # Cantilevered jharokha balconies, carved arches and laundry/cable routes.
                p.r((x,y,x+38,y+4),0);p.l([(x+1,y),(x+37,y)],4)
                for xx in range(x+3,x+36,8):p.l([(xx,y-18),(xx,y-2)],3);p.p([(xx,y-18),(xx+4,y-23),(xx+8,y-18)],3)
                p.r((x-3,y-25,x+41,y-22),0);p.l([(x-2,y-25),(x+40,y-25)],warm)
                p.l([(x+3,y+5),(x+8,y+12),(x+30,y+12),(x+35,y+5)],1,2)
                p.l([(x+2,y-11),(x+35,y-11)],2)
            for x,y in [(65,85),(217,95),(385,78)]:
                p.l([(x,y),(x+25,y+7),(x+58,y+8),(x+90,y+1)],0,2)
                p.l([(x,y-1),(x+25,y+6),(x+58,y+7),(x+90,y)],3)
                for xx,col in [(x+22,pink),(x+37,warm)]:p.p([(xx,y+5),(xx+8,y+7),(xx+7,y+17),(xx+1,y+16)],col)
        else:
            for x in range(18,480,120):
                p.r((x+17,249,x+22,253),3);p.r((x+18,249,x+21,249),5)
                # Cable collars, layered copper conduit, chipped cabinet corners.
                for xx in (x+25,x+61):p.l([(xx,229),(xx,235)],2,2)
                p.l([(x+20,239),(x+42,242),(x+81,241)],9)
                p.l([(x+24,242),(x+42,245),(x+78,244)],2)
                p.r((x+15,261,x+21,264),warm);p.r((x+24,261,x+35,264),cool)
    elif name=='render-farm':
        if depth=='far':
            for x in range(-20,480,80):
                p.r((x+4,29,x+51,32),0)
                for k in range(6):p.r((x+8+k*6,30,x+10+k*6,30),cool if k%3 else warm)
                for y in range(45,269,32):
                    p.l([(x+8,y),(x+23,y)],3);p.l([(x+8,y+2),(x+18,y+2)],3)
                    for xx in (x+35,x+41,x+47):p.r((xx,y,xx+1,y),cool)
                p.l([(x+57,40),(x+63,45),(x+63,259)],0,2)
        elif depth=='mid':
            for x in range(-16,480,120):
                # Riveted fan cages, concentric hub, heat channels and status LCD.
                for xx,yy in [(x+24,69),(x+95,69),(x+24,165),(x+95,165)]:p.r((xx,yy,xx+2,yy+2),0);p.r((xx,yy,xx+1,yy),4)
                p.ellipse((x+53,101,x+67,115),3,0);p.ellipse((x+57,105,x+63,111),warm,0)
                for yy in (84,96,120,132):p.l([(x+30,yy),(x+88,yy)],2)
                p.r((x+69,145,x+92,161),0)
                for k in range(5):p.r((x+72+k*4,155-k%3*2,x+73+k*4,158),cool)
                for xx in (x+28,x+32,x+36):p.l([(xx,175),(xx,186)],2)
                p.l([(x+101,81),(x+110,81),(x+110,181),(x+95,181)],0,4)
                p.l([(x+101,80),(x+110,80),(x+110,180),(x+95,180)],3)
        else:
            for x in range(-10,480,160):
                for y in (18,94,170,246):p.r((x+5,y,x+20,y+5),2);p.r((x+7,y+1,x+9,y+2),4)
                for k in range(3):p.l([(x+27+k*8,1),(x+28+k*8,32),(x+44+k*8,47),(x+99+k*8,47)],9 if k==0 else 2)
                p.r((x+35,256,x+60,265),0)
                for xx in range(x+38,x+57,4):p.l([(xx,259),(xx,262)],warm)
    elif name=='the-set':
        if depth=='far':
            # Cyclorama cloth seam, faint fold bands, distant lighting grid.
            for x in range(0,480,80):
                p.l([(x+1,30),(x+1,218)],27 if sat else 11)
                p.l([(x+3,30),(x+3,218)],29 if sat else 13)
                p.r((x+22,35,x+57,39),2);p.r((x+25,39,x+54,41),warm)
            for y in (227,244,261):p.l([(0,y),(479,y)],10)
        elif depth=='mid':
            for x in range(-20,480,120):
                for y in (149,196,234):p.l([(x+6,y),(x+84,y)],9)
                for xx in (14,57):
                    p.l([(x+xx+10,160),(x+xx+10,188)],3);p.l([(x+xx+2,175),(x+xx+18,175)],3)
                    p.l([(x+xx-2,192),(x+xx+22,192)],12)
                p.l([(x+39,205),(x+39,258)],11);p.r((x+49,229,x+51,232),warm)
                p.l([(x+3,144),(x+86,144)],12)
                # Deliberately visible construction flats and A-frame braces.
                p.l([(x+93,142),(x+109,257),(x+95,257),(x+93,142)],3)
                p.r((x+99,228,x+104,232),4)
                for k in range(4):p.r((x+15+k*14,132,x+23+k*14,134),6 if sat else 13)
        else:
            for x in range(-20,480,160):
                for y in range(36,235,24):p.l([(x+1,y),(x+9,y+12),(x+1,y+24)],3)
                p.r((x+29,28,x+33,39),2);p.r((x+54,28,x+59,39),2)
                p.p([(x+34,41),(x+53,41),(x+58,47),(x+29,47)],1,0)
                p.l([(x+37,251),(x+37,267)],3);p.l([(x+94,251),(x+94,267)],3)
                for xx in (x+41,x+88):p.r((xx,252,xx+3,255),5)
                p.r((x+56,258,x+75,264),3);p.r((x+59,260,x+72,262),0)
    elif name=='the-feed':
        if depth=='far':
            for x in range(-16,480,64):
                for y in range(20,270,52):
                    p.l([(x+9,y),(x+30,y)],3)
                    for xx in (x+9,x+15,x+21):p.r((xx,y+5,xx+2,y+6),pink)
                    p.p([(x+25,y+14),(x+28,y+11),(x+31,y+14),(x+28,y+17)],3)
                p.l([(x+40,0),(x+40,269)],0)
        elif depth=='mid':
            for x in range(-20,480,120):
                for y in (22,113,204):
                    # Distinct fake thumbnail compositions; text stays runtime-owned.
                    p.ellipse((x+21,y+4,x+26,y+9),cool)
                    p.l([(x+30,y+5),(x+57,y+5)],5);p.l([(x+30,y+8),(x+45,y+8)],3)
                    p.p([(x+25,y+43),(x+37,y+22),(x+49,y+43)],3)
                    p.p([(x+69,y+22),(x+89,y+43),(x+64,y+43)],18 if sat else 3)
                    p.r((x+24,y+47,x+90,y+48),1);p.r((x+24,y+47,x+66,y+47),pink)
                    for k in range(5):p.r((x+26+k*10,y+58,x+31+k*10,y+59),3 if k>1 else cool)
                    p.r((x+83,y+53,x+89,y+58),0);p.l([(x+84,y+55),(x+88,y+55)],warm)
        else:
            for x in range(-10,480,160):
                for y in (60,230):
                    for k in range(10):p.r((x+24+k*9,y+3,x+27+k*9,y+3),3)
                    p.l([(x+20,y+7),(x+120,y+7)],1)
                for y in (14,107,189):p.r((x+4,y,x+11,y+12),1);p.l([(x+5,y+2),(x+5,y+10)],3)
                p.l([(x+16,0),(x+16,22),(x+44,38),(x+91,38)],0,3)
    else: # Templatr: machined stone, oppressive precision, sanitised sculptures.
        if depth=='far':
            for x in range(-20,480,80):
                for y in (28,97,192):
                    p.l([(x+9,y),(x+17,y+6),(x+20,y+17),(x+26,y+23)],13)
                    p.l([(x+10,y),(x+18,y+6)],15)
                p.r((x+48,0,x+51,269),13)
            for y in (53,163):p.l([(0,y),(479,y)],15)
        elif depth=='mid':
            for x in range(-12,480,120):
                p.l([(x+3,0),(x+3,269)],14)
                p.r((x+29,169,x+100,173),11);p.r((x+31,170,x+99,171),12)
                # Corporate relief: cheerful faceless head over identical rounded suit.
                p.ellipse((x+57,119,x+72,134),12);p.p([(x+51,143),(x+58,136),(x+73,136),(x+81,143),(x+81,154),(x+51,154)],12)
                p.l([(x+60,129),(x+64,131),(x+69,129)],14)
                p.r((x+32,209,x+96,212),14);p.l([(x+35,215),(x+91,215)],12)
                for xx in (x+36,x+93):p.r((xx,225,xx+2,227),9)
        else:
            for x in range(-20,480,160):
                p.l([(x+3,0),(x+3,269)],12);p.l([(x+11,0),(x+11,269)],9)
                for y in (31,154):p.r((x+3,y,x+11,y+2),9)
                p.r((x+34,254,x+124,256),12)
                for xx in range(x+40,x+121,12):p.l([(xx,260),(xx+5,260)],9)
                p.r((x+121,10,x+129,14),9);p.ellipse((x+122,11,x+126,15),12,0)
    im.save(file)

def main():
    rebuild()
    for name in ('hq','render-farm','the-set','the-feed','templatr'):tiles(name)
    for name in ('neo-amritsar','render-farm','the-set','the-feed','templatr'):
        for depth in ('far','mid','near'):
            for state in ('drained','saturated'):background(name,depth,state)
    out=Image.new('RGBA',(480*2,270*5),C[0]);d=ImageDraw.Draw(out)
    for i,name in enumerate(('neo-amritsar','render-farm','the-set','the-feed','templatr')):
        for j,state in enumerate(('drained','saturated')):
            combo=Image.new('RGBA',(480,270))
            for depth in ('far','mid','near'):combo.alpha_composite(Image.open(A/f'backgrounds/{name}-{depth}-{state}.png'))
            out.paste(combo,(j*480,i*270));d.text((j*480+5,i*270+5),name+' '+state,fill=C[6],stroke_width=1,stroke_fill=C[0])
    out.save(ROOT/'tools/art/raw/world-polish.png')
if __name__=='__main__':main()
