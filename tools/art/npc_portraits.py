from crew import A,C
from PIL import Image,ImageDraw
import json
EMOTIONS=['neutral','happy','shocked']
def portrait(who,emotion):
    im=Image.new('RGBA',(64,64)); d=ImageDraw.Draw(im)
    def r(b,c,o=0): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
    def l(p,c,w=1): d.line(p,fill=C[c],width=w)
    def p(points,c): d.polygon(points,fill=C[c],outline=C[0])
    if who=='beige':
        p([(7,63),(9,17),(18,8),(47,8),(55,17),(57,63)],12)
        r((13,16,50,45),14); r((18,21,45,40),13,None)
        for x in (23,38): r((x,25,x+3,28),9,None)
        if emotion=='shocked': d.ellipse((29,32,35,39),fill=C[9])
        else: l([(23,33),(27,36),(37,36),(41,33)],9,2)
        for y in (50,54,58): l([(18,y),(46,y)],11)
    elif who=='pixel-cat':
        p([(8,63),(10,42),(14,35),(9,10),(25,20),(37,19),(53,8),(53,38),(58,49),(57,63)],6)
        p([(12,14),(23,23),(14,29)],31); p([(41,22),(51,13),(50,29)],1)
        p([(12,31),(24,26),(30,35),(23,43),(14,40)],31)
        for x in (21,40):
            if emotion=='happy': l([(x-4,33),(x,30),(x+4,33)],0,2)
            else: r((x-4,30,x+4,35),22); l([(x,30),(x,35)],0)
        p([(29,39),(35,39),(32,42)],26)
        l([(32,42),(28,45),(25,43)],0); l([(32,42),(36,45),(39,43)],0)
        for y in (40,45): l([(5,y),(23,y+1)],0); l([(41,y+1),(59,y)],0)
        if emotion=='shocked': d.ellipse((29,45,35,51),fill=C[0])
        r((23,54,41,58),20); r((30,57,35,61),22)
    else:
        shirt={'chad-frictionless':10,'chacha-chai':13,'intern-bunty':18}[who]
        p([(3,63),(6,52),(23,45),(42,45),(58,52),(61,63)],shirt)
        p([(19,17),(25,10),(40,10),(47,18),(47,34),(41,44),(31,48),(20,40),(16,28)],32)
        p([(40,20),(46,22),(46,35),(40,43),(32,46),(35,38)],31)
        p([(17,25),(15,17),(20,9),(30,6),(42,9),(47,17),(42,19),(38,14),(27,14),(21,22)],1)
        for x in (25,38):
            if emotion=='happy': l([(x,27),(x+3,24),(x+6,27)],0,2)
            else: r((x,24,x+6,30),6); r((x+3,26,x+4,29),0,None)
        if emotion=='shocked': d.ellipse((31,35,39,43),fill=C[0])
        elif emotion=='happy': r((29,35,41,39),0); r((30,36,40,37),6,None)
        else: l([(31,38),(39,38)],0)
        if who=='chacha-chai':
            p([(16,17),(17,10),(21,5),(41,5),(47,11),(47,18)],6)
            l([(21,10),(42,10)],5)
            p([(22,35),(28,33),(34,35),(40,33),(44,35),(39,39),(33,38),(27,40)],5)
            r((8,52,20,62),23); r((9,53,19,56),31,None); l([(21,54),(25,54),(25,59),(21,59)],23,2)
        elif who=='intern-bunty':
            l([(22,31),(29,32)],9); l([(37,32),(44,31)],9)
            l([(23,48),(27,57),(39,57),(43,48)],35,2); r((28,55,38,63),1); r((30,57,36,59),4)
        else:
            r((24,45,42,53),10); l([(24,50),(41,50)],9)
            # Seamless beige turtleneck, immaculate side-part.
            l([(19,14),(27,10),(40,11)],3)
    return im
p=A/'manifest.json'; m=json.loads(p.read_text())
for who in ['beige','chad-frictionless','chacha-chai','intern-bunty','pixel-cat']:
    im=Image.new('RGBA',(192,64))
    for f,emotion in enumerate(EMOTIONS): im.paste(portrait(who,emotion),(f*64,0))
    file=f'portraits/{who}.png'; im.save(A/file); m['portraits'][who]=dict(file=file,size=64,emotions=EMOTIONS)
p.write_text(json.dumps(m,indent=2)+'\n')
