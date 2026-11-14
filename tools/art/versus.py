"""Pixel-native VERSUS overlays. Run AFTER base crew generators; idempotent.
Preserves every existing row except the two explicitly replaced Sayam moves.
No loser likeness is baked into FX: runtime controls the actual losing fighter.
"""
import json, math
from PIL import Image, ImageDraw
from likeness import A,C,Pen,heart,frame as likeness_frame

CREW=['ashwath','sayam','tushar','sehaj','manvi','mansukh','manya','brahmansh','mishthi']
GLYPHS=dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-:>!',[
'010/101/111/101/101','110/101/110/101/110','011/100/100/100/011','110/101/101/101/110',
'111/100/110/100/111','111/100/110/100/100','011/100/101/101/011','101/101/111/101/101',
'111/010/010/010/111','001/001/001/101/010','101/101/110/101/101','100/100/100/100/111',
'101/111/111/101/101','101/111/111/111/101','010/101/101/101/010','110/101/110/100/100',
'010/101/101/111/011','110/101/110/101/101','011/100/010/001/110','111/010/010/010/010',
'101/101/101/101/111','101/101/101/101/010','101/101/111/111/101','101/101/010/101/101',
'101/101/010/010/010','111/001/010/100/111','111/101/101/101/111','010/110/010/010/111',
'110/001/010/100/111','110/001/010/001/110','101/101/111/001/001','111/100/110/001/110',
'011/100/110/101/010','111/001/010/010/010','010/101/010/101/010','010/101/011/001/110',
'0/0/0/0/1','000/000/111/000/000','0/1/0/1/0','100/010/001/010/100','1/1/1/0/1']))

def txt(p,text,x,y,col=6,scale=1):
    for ch in text.upper():
        rows=GLYPHS.get(ch,'000/000/000/000/000').split('/')
        for yy,row in enumerate(rows):
            for xx,v in enumerate(row):
                if v=='1':p.r((x+xx*scale,y+yy*scale,x+(xx+1)*scale-1,y+(yy+1)*scale-1),col)
        x+=(len(rows[0])+1)*scale

def burst(p,x,y,r,col,phase=0):
    pts=[]
    for k in range(24):
        a=k*math.pi/12+phase;r1=r if k%2==0 else r*.45
        pts.append((round(x+math.cos(a)*r1),round(y+math.sin(a)*r1)))
    p.p(pts,col)

def bubble(p,x,y,w,text=None):
    p.p([(x+2,y),(x+w-3,y),(x+w,y+3),(x+w,y+11),(x+w-3,y+14),(x+8,y+14),(x+3,y+18),(x+4,y+14),(x,y+12),(x,y+3)],6)
    p.l([(x+3,y+2),(x+w-4,y+2)],7)
    if text:txt(p,text,x+4,y+5,42)

def ring(p,x,y,r,col):
    for k in range(20):
        a=k*math.pi/10;p.star(round(x+math.cos(a)*r),round(y+math.sin(a)*r*.55),col,1)

def super_frame(who,f,base,entry):
    source={'ashwath':'ability','sayam':'idle','tushar':'wildcard','sehaj':'ability','manvi':'heart','mansukh':'stan','manya':'ability','brahmansh':'unhinged','mishthi':'indifferent'}[who]
    an=entry['anims'][source];idx=min(an['frames']-1,f*an['frames']//8)
    im=base.crop((idx*48,an['row']*48,(idx+1)*48,(an['row']+1)*48));p=Pen(im)
    if who=='sayam':
        # Four clean silhouettes, two frames each: thinker, roast, empath, hype.
        pose=f//2
        if pose==0:
            p.l([(29,28),(34,29),(30,24),(27,24)],0,5);p.l([(30,28),(33,28),(29,24)],32,3)
            p.star(39,10,29,1+f%2)
        elif pose==1:
            p.l([(29,27),(37,26),(43,21)],0,5);p.l([(30,27),(37,26),(43,21)],32,3)
            p.l([(42,21),(45,19)],32);p.r((26,23,28,23),6)
            p.l([(40,12),(44,10)],42)
        elif pose==2:
            p.l([(29,28),(25,32),(21,29)],0,5);p.l([(29,28),(25,31),(21,29)],32,3)
            heart(Pen(im),33,12);p.r((26,23,28,23),6)
        else:
            for pts in [[(14,28),(9,23),(9,15)],[(30,27),(37,23),(39,15)]]:
                p.l(pts,0,6);p.l(pts,32,3)
            p.l([(7,13),(7,9)],42);p.l([(41,13),(43,9)],29)
            p.r((26,23,28,24),0);p.r((26,23,28,23),6)
    elif who=='ashwath':
        if f>=2:
            p.r((3,4,25,12),0);txt(p,'36H',7,6,29)
            for k in range(min(5,f)):p.r((5+k*4,11,7+k*4,11),35)
    elif who=='sehaj':
        if f>=2:
            p.l([(7,22),(5,16),(7,9),(11,6)],35,2)
            p.p([(6,6),(12,5),(12,11)],36)
            p.l([(39,33),(43,28),(43,22)],25,2)
    elif who=='manvi':
        if f>=2:
            for x,y in [(3,13),(34,6),(35,32)]:
                if (f+x)%3!=0:heart(Pen(im),x,y)
    elif who=='mansukh':
        if f>=2:
            for x in [5,42]:p.l([(x,42),(x,30-f*2)],20 if x==5 else 37,2)
            p.star(38,7,6,2)
    elif who=='manya':
        if f>=2:
            p.p([(5,37),(8,30),(6,24),(10,21),(12,29),(9,38)],22)
            p.l([(4,43),(13,40),(35,41),(45,38)],22,2)
    elif who=='brahmansh':
        if f>=2:
            for y in (7,38):
                p.l([(3,y),(12+f,y)],20,2);p.l([(36-f,y+2),(45,y+2)],6)
    elif who=='mishthi':
        if f>=4:p.star(7,18,22,2);p.l([(39,29),(43,27),(45,28)],21)
    elif who=='tushar' and f>=5:
        p.star(40,9+f%2,22,3);p.l([(35,38),(43,34)],6)
    return im

def finisher(who,f):
    im=Image.new('RGBA',(96,96));p=Pen(im);t=f/23
    # Loser sprite occupies the lower central half; FX leave their real face exposed.
    if who=='ashwath':
        for k in range(6):
            start=k*2
            if f>=start and f<20:
                y=13+k*10;w=min(74,(f-start+1)*12)
                p.r((9,y,9+w,y+8),0);txt(p,['> RM -RF','BEIGE','NO SMILES','NO STOCK','DELETING','DONE.'][k],12,y+2,29 if k%2 else 35)
        if f>=15:
            for k in range(24):
                x=24+(k*17)%48+(f-15)*2*(1 if k%2 else -1);y=48+(k*11)%45-(f-15)*2*(k%3)
                if k%4>=(f-15)//3:p.r((x,y,x+3+k%3,y+3),29 if k%3 else 0)
        if f>=19:txt(p,'EXIT 0',33,35,29);p.l([(32,43),(64,43)],35)
    elif who=='sayam':
        lines=[('BHAI',6,52,29),('NO CAP',52,35,35),('SO BASICALLY',9,13,58),('LE RE',42,58,32),('HEAR ME OUT',32,76,52)]
        for k,(s,x,y,w) in enumerate(lines):
            if f>=k*3 and f<min(24,17+k):bubble(p,x,y-max(0,f-12),w,s)
        if f>=12:
            txt(p,'Z',68+(f-12)//3,43-(f-12),19,2)
            txt(p,'Z',83,25-(f-12)//2,35)
        if f>=19:
            for k in range(3):p.r((59+k*12,91-k%2,63+k*12,92-k%2),3)
    elif who=='tushar':
        if f in (1,4,7):burst(p,48,61,43,6)
        if 4<=f<=18:
            for k in range(3):
                y=46+k*15;lo=max(9,48-(f-3)*5);hi=min(86,48+(f-3)*5)
                p.p([(lo,y+8),(hi,y),(hi,y+9),(lo,y+17)],0)
                for x in range(lo+3,hi-3,8):p.r((x,y+7-(x-lo)//10,x+2,y+9-(x-lo)//10),6)
                p.l([(lo+2,y+13),(hi-2,y+5)],3)
        if f>=13:
            r=min(23,7+(f-13)*3);p.d.ellipse((48-r,67-r,48+r,67+r),fill=C[3],outline=C[0])
            p.d.ellipse((46,65,50,69),fill=C[0])
            for k in range(4):
                a=k*math.pi/2+(f-13)*.25;x=round(48+math.cos(a)*r*.56);y=round(67+math.sin(a)*r*.56)
                p.d.ellipse((x-4,y-4,x+4,y+4),fill=C[0],outline=C[5])
        if f>=18:
            p.p([(20,24),(44,24),(48,29),(52,24),(77,24),(73,40),(54,40),(48,32),(41,40),(24,40)],0)
            txt(p,'FABU',25,29,6);txt(p,'LOUS',55,29,6);p.star(80,22,22,3)
    elif who=='sehaj':
        if f<14:
            y=-30+min(8,f)**2 if f<9 else 40
            p.p([(20,y+7),(30,y),(59,y-3),(75,y+5),(81,y+22),(68,y+34),(26,y+32),(15,y+21)],3)
            p.p([(23,y+8),(33,y+2),(55,y),(49,y+13),(26,y+19)],5,None)
            p.l([(58,y+2),(52,y+18),(67,y+31)],2,2)
            for x in (23,45,70):p.l([(x,y-18),(x,y-5)],19)
        if 8<=f<=12:burst(p,48,85,35-(f-8)*4,35)
        if f>=12:
            ring(p,48,64,43,35)
            for x in (22,47):p.p([(x+17,44),(x,57),(x+17,70)],19)
            txt(p,'CTRL Z',33,27,36)
            if f>=18:
                for k in range(10):p.r((25+k*4,80-(f-18)*7,27+k*4,82-(f-18)*7),25 if k%2 else 36)
    elif who=='manvi':
        for k in range(13):
            age=f-k//2
            if age<0:continue
            x=8+(k*29)%73+round(math.sin(age*.4+k)*4);y=93-age*4-(k%3)*9
            heart(Pen(im),x,y)
        if 5<=f<=16:
            ring(p,48,71-(f-5)*4,28,37)
            for x in (18,72):p.star(x,80-(f-5)*4,6,2)
        if f>=18:heart(Pen(im),42,10)
    elif who=='mansukh':
        if f<13:
            r=8+f*2;p.d.ellipse((48-r,69-r,48+r,69+r),outline=C[37],width=2)
            ring(p,48,69,r+4,20);txt(p,'BIGGER',34,17,6)
        if 11<=f<=15:burst(p,48,61,45-(f-11)*4,22 if f%2 else 37)
        if f>=12:
            for k in range(30):
                x=48+round(math.sin(k*2.4)*(f-10)*4);y=62+round(math.cos(k*2.4)*(f-10)*3)+(f-17)**2//3
                p.r((x,y,x+2,y+2),[20,22,37,35,6][k%5])
            light=Image.open(A/'sprites/props/lightstick.png').convert('RGBA')
            im.alpha_composite(light,(15,68-(f-12)%3));im.alpha_composite(light,(67,68-(f-12)%3))
            p.l([(22,87),(22,95)],20,2);p.l([(74,87),(74,95)],20,2)
    elif who=='manya':
        colors=[20,22,18,37];col=colors[min(3,f//5)]
        if f<18:
            p.p([(9,4),(28,9),(24,26),(6,21)],3);p.l([(9,5),(12,0),(28,4),(28,10)],5)
            p.p([(23,20),(29,19),(38,34),(39,65),(32,69),(29,33)],col)
        if f>=3:
            for k in range(min(4,1+(f-3)//5)):
                y=94-min(77,(f-k*4)*6)
                p.p([(7,y+7),(15,y),(27,y+4),(39,y-3),(53,y+2),(66,y-4),(80,y+4),(90,y),(91,95),(6,95)],colors[k])
                for x in range(12,85,13):p.l([(x,y+8),(x+4,y+5)],6)
        if f>=20:
            # Final paint recedes into a colourful puddle, exposing runtime's empty spot.
            im=Image.new('RGBA',(96,96));p=Pen(im)
            for k,col in enumerate(colors):p.p([(10+k*17,89),(24+k*17,86),(38+k*17,91),(26+k*17,95),(8+k*17,94)],col)
            for x in (16,44,80):p.star(x,77,6,2)
    elif who=='brahmansh':
        if f<13:
            if f%3==0:p.r((13,36,83,95),0)
            for k in range(6):
                y=36+k*10
                if (k+f)%3==0:p.r((18+(f%2)*9,y,78,y+6),0);p.l([(18,y),(68,y)],20)
            for x in (10,83):
                p.r((x,31,x+4,95),0)
                for y in range(34,94,9):p.r((x+1,y,x+3,y+3),6)
            txt(p,'CUT',34+(f%2)*5,15,20,2)
        elif f<22:
            p.r((9,31,87,94),0);txt(p,'NO SIGNAL',29,59,3)
        else:
            p.l([(14,64),(82,64)],6 if f==22 else 20)
            if f==23:p.r((46,63,50,65),6)
    else: # Mishthi: frame assembles, gilds and settles on a hanging wire.
        w=min(27,5+f*4);top=max(31,86-f*10)
        p.l([(48,14),(48-w,top),(48+w,top),(48,14)],23)
        for k,col in [(0,0),(1,23),(3,22),(4,14),(5,23)]:
            p.d.rectangle((48-w+k,top+k,48+w-k,93-k),outline=C[col]) if 48-w+k<=48+w-k and top+k<=93-k else None
        if f>=5:
            for x,y in [(23,34),(72,34),(23,89),(72,89)]:p.star(x,y,22,3)
            for k in range(8):
                if (f+k)%4==0:p.star(30+k*5,44+(k*11)%39,22,1)
        if f>=13:
            p.r((31,82,65,90),0);p.r((32,83,64,89),14);txt(p,'STILL LIFE',34,84,9)
            if f==18:p.star(79,29,6,4)
    return im

def build():
    path=A/'manifest.json';m=json.loads(path.read_text())
    for who in CREW:
        entry=m['sprites'][who];base=Image.open(A/entry['file']).convert('RGBA')
        # Existing super row is replaced in place on subsequent runs.
        row=entry['anims'].get('super',{}).get('row',base.height//48)
        sheet=Image.new('RGBA',(max(384,base.width),(row+1)*48));sheet.paste(base.crop((0,0,base.width,row*48)),(0,0))
        if who=='sayam':
            for anim in ('attack','ability'):
                meta=entry['anims'][anim];sheet.paste((0,0,0,0),(0,meta['row']*48,sheet.width,(meta['row']+1)*48))
                for f in range(meta['frames']):sheet.paste(likeness_frame(who,anim,f),(f*48,meta['row']*48))
        for f in range(8):sheet.paste(super_frame(who,f,base,entry),(f*48,row*48))
        entry['anims']['super']=dict(row=row,frames=8,fps=12,loop=False)
        sheet.save(A/entry['file'])
        fx=Image.new('RGBA',(96*24,96))
        for f in range(24):fx.paste(finisher(who,f),(f*96,0))
        file=f'sprites/fx/finisher-{who}.png';(A/'sprites/fx').mkdir(exist_ok=True);fx.save(A/file)
        m['sprites']['finisher-'+who]=dict(file=file,frameWidth=96,frameHeight=96,anims={'play':dict(row=0,frames=24,fps=10,loop=False)})
    for key,size in [('fx-counter',(64,40)),('fx-combo',(80,20)),('fx-ko',(96,64)),('fx-parry',(32,32)),('bubble',(16,12)),('hype-speaker',(16,16))]:
        im=Image.new('RGBA',size);p=Pen(im);w,h=size
        if key=='bubble':
            p.p([(2,0),(12,0),(15,2),(15,7),(12,9),(6,9),(3,11),(3,9),(0,7),(0,2)],6)
            for x in (4,7,10):p.r((x,4,x+1,5),42)
        elif key=='hype-speaker':
            p.r((5,0,10,3),0);p.r((6,1,9,2),29);p.r((1,3,14,15),0);p.r((2,4,13,14),42)
            p.r((3,5,6,5),6);p.r((10,5,11,5),22)
            p.d.ellipse((5,7,12,14),fill=C[0]);p.d.ellipse((7,9,10,12),fill=C[29]);p.r((3,8,3,12),27)
        elif key=='fx-parry':
            p.p([(16,0),(19,11),(30,9),(23,16),(31,21),(20,20),(16,31),(13,21),(2,24),(9,16),(0,12),(12,12)],18)
            p.p([(16,5),(18,14),(26,16),(18,18),(16,27),(14,18),(6,16),(14,14)],35,None);p.star(16,16,6,3)
        elif key=='fx-combo':
            p.p([(5,1),(79,1),(74,18),(0,18)],0);p.p([(7,3),(76,3),(71,15),(2,15)],20)
            p.l([(8,2),(78,2)],22);p.l([(4,17),(71,17)],21)
        else:
            # Wide irregular impact silhouette, separate ink shadow and bright core.
            pts=[(0,h//2),(13,h//3),(5,4),(w//3,10),(w//2,0),(w//2+7,10),(w-8,3),(w-13,h//3),(w-1,h//2),(w-14,h//2+5),(w-5,h-2),(w//2+8,h-12),(w//2,h-1),(w//3,h-10),(5,h-1),(12,h//2+7)]
            p.p(pts,20);p.p([(round(w/2+(x-w/2)*.76),round(h/2+(y-h/2)*.72)) for x,y in pts],22)
            if key=='fx-ko':
                # Large two-colour K.O. lettering, shadows first.
                txt(p,'K.O.',22,23,0,4);txt(p,'K.O.',20,21,6,4)
            else:
                p.l([(28,11),(24,24)],0,5);p.r((23,28,26,31),0);p.l([(40,9),(36,22)],0,5);p.r((35,26,38,29),0)
        file=('sprites/props/' if not key.startswith('fx-') else 'fx/')+key+'.png';im.save(A/file);m['images'][key]={'file':file}
    path.write_text(json.dumps(m,indent=2)+'\n')
    # Ignored review contact sheets, never shipped.
    review=Image.new('RGBA',(8*96,9*110),C[1]);d=ImageDraw.Draw(review)
    for y,who in enumerate(CREW):
        d.text((2,y*110),who,fill=C[6])
        for x,f in enumerate([0,3,6,9,12,15,18,23]):review.alpha_composite(finisher(who,f),(x*96,y*110+14))
    review.save(A.parents[3]/'tools/art/raw/versus-finishers.png')
    review=Image.new('RGBA',(8*48,9*60),C[1]);d=ImageDraw.Draw(review)
    for y,who in enumerate(CREW):
        e=m['sprites'][who];im=Image.open(A/e['file']);row=e['anims']['super']['row'];d.text((0,y*60),who,fill=C[6]);review.alpha_composite(im.crop((0,row*48,384,(row+1)*48)),(0,y*60+12))
    review.resize((768,1080),Image.Resampling.NEAREST).save(A.parents[3]/'tools/art/raw/versus-supers.png')

if __name__=='__main__':build()
