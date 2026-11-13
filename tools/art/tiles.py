"""Native 16px office and server tiles, with stable row-major indices."""
from crew import A,C,ROOT
from PIL import Image,ImageDraw
import json,sys
names=['concrete top-left','concrete top','concrete top-right','concrete left','concrete fill','concrete right','concrete bottom-left','concrete bottom','concrete bottom-right','platform left','platform middle','platform right','sparking cable','closed door upper','closed door lower','open door upper','open door lower','terminal off','terminal on','CRT','film poster','neon bars','cable elbow','chai counter left','chai counter right','plant','speaker','vent','tape stickers','ceiling lamp','server rack','cooling fan','cable tray','warning stripes','hot rack','floor bolt']

def build(name):
    sheet=Image.new('RGBA',(96,96))
    for i in range(36):
        im=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(im)
        def r(b,c,o=None): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
        def l(p,c,w=1): d.line(p,fill=C[c],width=w)
        if i<9:
            r((0,0,15,15),2); r((1,1,14,14),3)
            # Edges of the canonical nine-tile wall block, interior remains quiet.
            if i<3: l([(0,0),(15,0)],0); l([(1,1),(14,1)],4)
            if i>5: l([(0,15),(15,15)],0); l([(1,14),(14,14)],1)
            if i%3==0: l([(0,0),(0,15)],0); l([(1,1),(1,14)],4)
            if i%3==2: l([(15,0),(15,15)],0); l([(14,1),(14,14)],1)
            for x,y in [(4,5),(10,11)]: r((x,y,x+1,y),2)
        elif i<12:
            r((0,0,15,5),0); r((0,1,15,2),4); r((0,3,15,4),2)
            for x in (2,8,14): r((x,3,x,3),6)
            if i!=10: r((0 if i==9 else 13,5,2 if i==9 else 15,9),1)
        elif i==12:
            l([(0,12),(5,8),(10,13),(15,9)],0,4); l([(0,11),(5,7),(10,12),(15,8)],20)
            l([(7,2),(5,5),(9,5),(8,9)],22)
        elif i in (13,14,15,16):
            r((1,0,14,15),0); r((2,0,3,15),4); r((12,0,13,15),2)
            if i<15:
                r((4,0,11,15),1); l([(8,0),(8,15)],3)
                if i==13: r((5,3,10,6),20,0)
                else: r((9,3,10,5),22); r((4,13,11,15),3)
            elif i==15: r((4,0,11,2),29)
        elif i in (17,18,19):
            r((2,2,13,11),2,0); r((3,3,12,9),27 if i==18 else 1)
            if i!=17: l([(4,5),(6,6),(4,7)],35); l([(8,7),(10,7)],36)
            r((6,12,9,13),3); r((3,14,13,15),0); r((4,14,12,14),4)
        elif i==20:
            r((2,1,13,15),6,0); r((3,2,12,11),16); d.polygon([(4,10),(6,4),(11,10)],fill=C[20]); r((4,13,10,13),0)
        elif i==21:
            r((0,4,15,11),0); l([(1,6),(6,6),(6,9),(14,9)],35); l([(9,5),(14,5)],26)
        elif i==22:
            l([(0,5),(9,5),(9,15)],0,5); l([(0,4),(10,4),(10,15)],23,2)
        elif i in (23,24):
            r((0,7,15,15),23,0); r((0,7,15,8),22); r((2,10,13,14),9)
            r((4,3,8,6),6,0); l([(9,3),(11,3),(11,5),(9,5)],6)
            if i==24: r((12,1,14,6),31)
        elif i==25:
            r((5,10,11,15),31,0); l([(8,10),(8,2)],27,2); d.polygon([(8,7),(2,2),(6,2),(9,6),(12,1),(14,3)],fill=C[29],outline=C[0])
        elif i==26:
            r((3,0,13,15),1,0); d.ellipse((5,2,11,7),fill=C[3],outline=C[0]); d.ellipse((4,8,12,14),fill=C[2],outline=C[0])
        elif i==27:
            r((0,1,15,14),2,0)
            for y in range(3,14,3): l([(2,y),(13,y)],0); l([(2,y+1),(13,y+1)],4)
        elif i==28:
            d.polygon([(2,3),(10,1),(12,6),(4,8)],fill=C[22]); d.polygon([(7,10),(14,9),(13,14),(6,14)],fill=C[26]); l([(3,4),(8,3)],0)
        elif i==29:
            r((1,0,14,3),0); r((3,4,12,5),6); r((5,6,10,6),22)
        elif i in (30,34):
            r((1,0,14,15),1,0)
            for y in (2,6,10):
                r((3,y,12,y+2),2); l([(4,y+1),(8,y+1)],4); r((11,y+1,11,y+1),20 if i==34 else 29)
            if i==34: l([(4,0),(6,4),(5,7)],38)
        elif i==31:
            r((0,0,15,15),2,0); d.ellipse((1,1,14,14),fill=C[0],outline=C[4])
            for p in [[(8,7),(4,2),(10,3)],[(9,8),(14,5),(13,11)],[(8,9),(10,14),(4,12)],[(7,8),(1,10),(3,4)]]: d.polygon(p,fill=C[3])
            r((7,7,9,9),22)
        elif i==32:
            r((0,4,15,12),1,0)
            for y,c in [(6,20),(8,35),(10,23)]: l([(0,y),(15,y)],c)
            for x in (2,10): l([(x,3),(x,13)],3)
        elif i==33:
            r((0,0,15,15),22,0)
            for x in range(-16,32,8): d.polygon([(x,1),(x+3,1),(x+17,14),(x+14,14)],fill=C[0])
        else:
            r((0,0,15,15),3); r((6,6,9,9),2,0); r((7,7,8,7),4)
        sheet.paste(im,((i%6)*16,(i//6)*16))
    if name=='render-farm':
        # Cooler concrete and warmer warning accents; index meanings stay stable.
        px=sheet.load()
        for y in range(96):
            for x in range(96):
                if px[x,y]==tuple(bytes.fromhex(C[3][1:]))+(255,): px[x,y]=tuple(bytes.fromhex(C[18][1:]))+(255,)
    path=f'tiles/{name}.png'; (A/path).parent.mkdir(exist_ok=True); sheet.save(A/path)
    doc=f'# {name} tiles · 16×16\n\n96×96 RGBA; **six columns**, row-major index = row × 6 + column. No spacing. Canonical blob indices 0–8 are in logical order, not a physical 3-column block. Pair door upper/lower vertically. Tiles do not encode collisions; these are recommendations for Claude.\n\n| Index | Meaning | Use |\n|---|---|---|\n'
    for i,n in enumerate(names):
        use='solid' if i<9 else 'one-way' if i<12 else 'hazard' if i==12 else 'door; code controls collision' if i<17 else 'interactable' if i<19 else 'decor'
        doc+=f'| {i} | {n} | {use} |\n'
    (ROOT/f'docs/art/tiles-{name}.md').write_text(doc)
    p=A/'manifest.json'; m=json.loads(p.read_text()); m['tilesets'][name]=dict(file=path,tileSize=16,notes=f'see docs/art/tiles-{name}.md; six columns'); p.write_text(json.dumps(m,indent=2)+'\n')
if __name__=='__main__': build(sys.argv[1])
