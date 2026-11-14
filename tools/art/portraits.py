"""64px busts with expression-specific eyes, brows and mouth shapes."""
from crew import A,C
from PIL import Image,ImageDraw
import json
EMOTIONS=['neutral','smug','panic','angry','deadpan','happy','sad','shocked']
def portrait(who,emotion):
    if who == 'tushar':
        from tushar import portrait as tushar_portrait
        return tushar_portrait(who,emotion)
    if who == 'mishthi':
        from mishthi import portrait as mishthi_portrait
        return mishthi_portrait(who,emotion)
    if who in ('mansukh','brahmansh'):
        from editor_likeness import portrait as editor_portrait
        return editor_portrait(who,emotion)
    if who in ('manvi','sehaj','ashwath','sayam'):
        from likeness import portrait as likeness_portrait
        return likeness_portrait(who,emotion)
    im=Image.new('RGBA',(64,64)); d=ImageDraw.Draw(im)
    def r(b,c,o=None): d.rectangle(b,fill=C[c],outline=C[o] if o is not None else None)
    def p(points,c): d.polygon(points,fill=C[c],outline=C[0])
    def l(points,c,w=1): d.line(points,fill=C[c],width=w)
    main,shade={'ashwath':(17,16),'sayam':(20,21),'tushar':(22,23),'sehaj':(18,16),'mansukh':(25,24),'manya':(29,27),'brahmansh':(26,34)}[who]
    p([(3,63),(5,53),(15,47),(24,44),(42,44),(55,49),(61,55),(63,63)],main)
    p([(43,46),(55,49),(61,55),(63,63),(48,63)],shade)
    p([(25,40),(40,40),(41,49),(34,55),(23,48)],31)
    p([(16,16),(22,9),(38,8),(47,14),(49,23),(49,32),(45,41),(37,47),(26,44),(19,37),(16,28)],32)
    p([(43,18),(48,20),(48,32),(44,40),(37,45),(32,43),(41,37)],31)
    p([(14,25),(12,17),(15,9),(22,4),(37,3),(46,8),(49,15),(47,23),(42,17),(36,15),(32,10),(28,17),(20,18),(19,27)],1)
    l([(17,13),(21,8),(28,7),(36,7),(42,10)],3,2)
    p([(15,26),(19,25),(21,29),(20,34),(16,33)],32)
    l([(17,28),(19,30)],31)
    # Large eye shapes; lower lid changes are as important as mouth changes.
    eye_y=25
    for x in (25,39):
        if emotion in ('deadpan','smug'):
            r((x,26,x+8,29),6,0); r((x+5,27,x+6,29),0)
        elif emotion=='happy':
            l([(x,28),(x+3,25),(x+6,25),(x+8,28)],0,2)
        else:
            r((x,24 if emotion in ('panic','shocked') else 25,x+8,31),6,0)
            r((x+5,25,x+6,29),0)
            if emotion in ('panic','shocked'): r((x+4,27,x+5,28),0); r((x+5,25,x+6,26),6)
        if emotion=='angry': l([(x,21),(x+8,24)],0,2)
        elif emotion=='sad': l([(x,24),(x+7,21)],0,2)
        elif emotion in ('panic','shocked'): l([(x,20),(x+7,19)],0,2)
        elif emotion=='smug': l([(x,23),(x+7,21)],0)
        else: l([(x,22),(x+7,22)],0)
    l([(36,29),(38,33),(35,34)],31)
    if emotion in ('panic','shocked'):
        p([(31,37),(36,35),(40,38),(39,43),(33,43),(30,40)],0); r((33,37,37,38),6)
        if emotion=='panic': p([(51,20),(48,26),(50,29),(53,28),(54,25)],35)
    elif emotion=='happy':
        p([(28,36),(42,36),(39,42),(33,43),(29,40)],0); r((31,37,39,38),6); l([(34,41),(38,41)],26)
    elif emotion=='angry': r((30,37,40,40),0); r((31,38,39,38),6)
    elif emotion=='sad': l([(30,40),(34,37),(40,38)],0)
    elif emotion=='smug': l([(31,38),(37,38),(41,35)],0)
    else: l([(31,38),(38,38)],0)
    if who in ('ashwath','sehaj'):
        l([(12,28),(12,14),(17,6),(26,2),(39,3),(47,9)],0,4)
        r((10,24,18,36),35,0); r((11,26,13,32),36)
        l([(15,36),(19,39),(25,39)],0,2)
        l([(20,49),(25,55),(29,51)],6); l([(41,49),(37,55),(33,51)],6)
        l([(24,55),(24,60)],6); l([(38,55),(38,60)],6)
    elif who=='sayam':
        # Sunglasses pushed up for emotion readability, retaining signature shape.
        r((23,12,33,17),0); r((36,12,46,17),0); l([(33,14),(36,14)],0,2); l([(25,13),(29,13)],4); l([(38,13),(42,13)],4)
        p([(23,49),(33,56),(42,49),(41,63),(24,63)],6)
        p([(17,48),(23,49),(29,63),(20,58),(22,54)],shade)
        p([(46,48),(42,49),(36,63),(49,56),(45,54)],shade)
        r((49,55,57,63),0); r((50,56,56,61),35)
    elif who=='tushar':
        p([(14,14),(17,7),(23,3),(39,3),(46,9),(46,14)],23)
        p([(13,14),(47,13),(55,16),(54,19),(15,18)],22)
        r((17,8,30,10),22)
        r((2,45,20,58),1,0); r((4,47,13,50),3); r((18,48,25,55),0); r((22,49,25,54),35)
        l([(7,43),(15,43),(16,46)],0,2)
    elif who=='mansukh':
        p([(13,19),(14,8),(21,1),(25,7),(33,1),(42,8),(45,16),(34,11),(27,16)],1)
        l([(17,10),(21,5)],3,2)
        l([(50,62),(57,38)],0,4); l([(51,61),(57,39)],22,2)
        for x,y in [(7,45),(12,40),(17,43)]: r((x-1,y-1,x+1,y+1),35)
    elif who=='manya':
        p([(14,13),(8,8),(3,13),(2,29),(7,41),(12,35),(9,22)],1)
        r((9,14,16,17),26)
        p([(19,49),(42,49),(46,63),(16,63)],27)
        r((20,54,24,57),20); r((30,57,34,61),22); r((38,53,40,56),17)
    elif who=='brahmansh':
        p([(12,35),(9,19),(12,8),(25,1),(42,5),(50,17),(43,12),(31,8),(21,15),(18,32)],34)
        l([(12,18),(15,10),(25,4),(39,7)],26,2)
        l([(47,60),(56,47)],6,3)
    return im
p=A/'manifest.json'; m=json.loads(p.read_text()); (A/'portraits').mkdir(exist_ok=True)
for who in ['ashwath','sayam','tushar','sehaj','mansukh','manya','brahmansh','manvi','mishthi']:
    sheet=Image.new('RGBA',(512,64))
    for i,emotion in enumerate(EMOTIONS): sheet.paste(portrait(who,emotion),(i*64,0))
    file=f'portraits/{who}.png'; sheet.save(A/file); m['portraits'][who]=dict(file=file,size=64,emotions=EMOTIONS)
p.write_text(json.dumps(m,indent=2)+'\n')
