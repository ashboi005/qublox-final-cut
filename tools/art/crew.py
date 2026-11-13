"""Deterministic native-resolution crew sheets. Run with crew IDs as arguments."""
import json, sys
from PIL import Image, ImageDraw
from palette import ROOT, COLORS
A = ROOT / 'apps/game/public/assets'
C = ['#'+x for x in COLORS]
ANIMS = [('idle',4,6,True),('run',8,12,True),('jump',2,8,False),('fall',2,6,True),('attack',5,14,False),('ability',6,10,False),('hurt',2,9,False),('ko',4,8,False),('tagin',4,12,False)]

def frame(who, anim, f):
    if who == 'mishthi':
        from mishthi import frame as mishthi_frame
        return mishthi_frame(who,anim,f)
    if who in ('mansukh','brahmansh'):
        from editor_likeness import frame as editor_frame
        return editor_frame(who,anim,f)
    if who in ('manvi','sehaj','ashwath','sayam'):
        from likeness import frame as likeness_frame
        return likeness_frame(who,anim,f)
    im=Image.new('RGBA',(48,48)); d=ImageDraw.Draw(im)
    main,shade={'ashwath':(17,16),'sayam':(20,21),'tushar':(22,23),'sehaj':(18,16),'mansukh':(25,24),'manya':(29,27),'brahmansh':(26,34)}[who]
    dy = [0,0,-1,0][f%4] if anim=='idle' else 0
    dx=0
    if anim=='run': dy=[0,-1,-2,-1,0,-1,-2,-1][f]
    if anim in ('jump','fall'): dy=-3
    if anim=='hurt': dx=-3+f; dy=-1
    if anim=='tagin': dy=[-6,-3,1,0][f]
    def poly(p,col,outline=True): d.polygon([(x+dx,y+dy) for x,y in p],fill=C[col],outline=C[0] if outline else None)
    def box(b,col,outline=False):
        x,y,X,Y=b; d.rectangle((x+dx,y+dy,X+dx,Y+dy),fill=C[col],outline=C[0] if outline else None)
    def line(p,col,width=1): d.line([(x+dx,y+dy) for x,y in p], fill=C[col],width=width)
    # Leg silhouettes change contact, passing, and flight on the eight-step cycle.
    spread=[0,3,6,3,0,-3,-6,-3][f] if anim=='run' else 0
    if anim in ('jump','fall'): spread=4 if f==0 else 2
    for x,s in [(19,-spread),(27,spread)]:
        poly([(x-3,33),(x+3,33),(x+s+3,43),(x+s+2,46),(x+s-4,46)],1)
        box((x+s-4,44,x+s+4,47),0)
        box((x+s-3,44,x+s+3,45),18 if who=='ashwath' else 6)
    poly([(16,23),(27,22),(31,27),(30,36),(16,36),(13,28)],main)
    poly([(26,25),(30,28),(29,35),(25,35)],shade,False)
    if who=='sayam':
        poly([(19,24),(25,24),(26,35),(20,35)],6,False)
        line([(17,24),(21,29),(18,32)],21); line([(27,24),(24,29),(27,32)],21)
    else:
        line([(18,26),(19,30)],6); line([(25,26),(24,30)],6)
        line([(18,33),(24,33)],shade)
    # Warm placeholder head, top-left light, deliberate side-view nose.
    poly([(17,11),(26,10),(30,14),(30,18),(32,19),(30,21),(29,24),(20,24),(16,20)],32)
    poly([(27,14),(30,16),(30,19),(31,19),(29,23),(24,23),(26,21)],31,False)
    box((19,14,25,17),33)
    poly([(15,16),(15,11),(18,8),(26,8),(29,11),(29,14),(25,13),(23,11),(20,15)],1)
    line([(17,11),(20,10),(25,10)],2)
    if who=='sayam':
        box((22,16,31,18),0); box((23,16,25,16),4); line([(18,16),(22,17)],0)
    else:
        box((25,16,29,18),6); box((28,16,29,18),0)
        if anim=='idle' and f==3: box((25,16,29,18),32); line([(25,18),(29,18)],0)
    line([(27,21),(29,21)],0)
    if who in ('ashwath','sehaj'):
        line([(15,17),(15,11),(18,8),(25,8),(28,11)],0,3)
        box((14,15,18,21),35,True); box((15,16,16,19),36)
    if who=='mansukh':
        poly([(15,13),(16,6),(19,7),(21,9),(25,7),(28,9),(28,12)],1)
        line([(18,8),(19,6)],3)
    if who=='manya':
        poly([(15,12),(11,10),(9,14),(10,22),(13,25),(15,20)],1)
        box((12,13,15,15),26)
    if who=='brahmansh':
        poly([(13,19),(14,9),(20,7),(28,9),(30,13),(25,10),(19,12),(18,21)],34)
        line([(15,11),(20,7),(25,9)],26)
    # Back arm and the phone stay distinct from front action hand.
    poly([(15,25),(18,26),(16,32),(13,33),(12,30)],shade)
    box((12,31,16,34),32,True)
    if who=='sayam': box((11,26,15,33),0); box((12,27,14,30),35)
    hx,hy=32,31
    if anim=='attack': hx,hy=[(25,27),(23,23),(39,27),(38,30),(32,31)][f]
    if anim=='ability': hx,hy=[(29,29),(31,25),(34,24),(35,25),(34,28),(32,31)][f]
    if anim=='hurt': hx,hy=29,26
    if anim=='tagin': hx,hy=[(27,25),(34,22),(38,25),(32,31)][f]
    if anim=='run': hx,hy=29-spread//2,29
    if who=='tushar' and anim=='ability': hx,hy=[(30,30),(32,21),(34,16),(36,27),(35,30),(32,31)][f]
    if anim=='panic': hx,hy=[(35,12),(36,21),(32,10),(38,17)][f]
    poly([(27,25),(30,25),(hx+1,hy-2),(hx+1,hy+2),(hx-3,hy+3),(27,29)],main)
    box((hx-2,hy-1,hx+2,hy+2),32,True)
    if who=='ashwath':
        if anim=='ability' and f in (1,2,3,4):
            box((29,10,44,21),0,True); box((30,11,43,20),27)
            line([(32,13),(34,15),(32,17)],35); line([(36,17),(40,17)],36)
        else:
            box((hx-7,hy-1,hx+6,hy+6),0,True); box((hx-6,hy,hx+5,hy+4),3)
            for yy in (hy+1,hy+3):
                for xx in range(hx-5,hx+5,3): box((xx,yy,xx+1,yy),6)
            box((hx-3,hy+5,hx+2,hy+5),35)
    if who=='sayam':
        if anim=='attack':
            poly([(hx,hy-4),(hx+6,hy-6),(hx+7,hy-2),(hx+1,hy)],29)
            line([(hx+2,hy-4),(hx+5,hy-4)],6)
        if anim=='ability' and f>1:
            by=min(39,hy+f*2)
            poly([(hx-2,by-4),(hx+2,by-4),(hx+1,by-1),(hx+5,by+4),(hx+4,by+7),(hx-4,by+7),(hx-5,by+4),(hx-1,by-1)],22)
            line([(hx-2,by),(hx+2,by)],23)
    if who=='tushar':
        box((14,9,29,12),23,True); box((13,12,32,14),22,True)
        box((9,20,21,27),1,True); box((10,21,15,23),3); box((21,21,24,25),0); box((22,22,24,24),35)
        box((hx-5,hy-2,hx+6,hy+6),0); box((hx-4,hy-1,hx+5,hy+1),6)
        for xx in range(hx-4,hx+5,4): line([(xx,hy-1),(xx+2,hy+1)],0)
        line([(hx-3,hy+4),(hx+3,hy+4)],6)
        if anim=='ability' and f in (1,2):
            poly([(hx-5,hy-3),(hx+4,hy-8),(hx+6,hy-5),(hx-4,hy)],6)
        if anim=='ability' and f==3:
            line([(39,18),(42,14)],22); line([(42,24),(46,23)],6)
    if who=='sehaj':
        box((hx-3,hy-2,hx,hy+2),35,True)
        poly([(hx+1,hy),(min(45,hx+10),hy-8),(min(44,hx+9),hy-3),(hx+3,hy+3)],6)
        if anim=='ability':
            line([(38,15),(42,17),(43,22),(40,25),(35,24),(33,20),(36,18),(39,20)],35)
    if who=='mansukh':
        line([(hx-3,hy+7),(hx+6,hy-9)],0,3); line([(hx-2,hy+6),(hx+5,hy-8)],22)
        if anim=='ability':
            line([(29,16),(35,12),(43,15)],35)
            for ax,ay in [(29,16),(35,12),(43,15)]: box((ax-1,ay-1,ax+1,ay+1),6,True)
    if who=='manya':
        box((18,28,26,36),27); box((19,29,20,31),20); box((23,32,25,33),22)
        box((hx-3,hy+3,hx+5,hy+10),3,True); box((hx-2,hy+4,hx+4,hy+5),26)
        if anim=='ability':
            for ax,ay,col in [(34,14,20),(39,18,22),(43,23,17)]: box((ax,ay,ax+2,ay+2),col)
    if who=='brahmansh':
        if anim=='ability':
            for yy in (19,24,29): line([(4+f,yy),(12+f,yy)],26)
        for bx,by in [(hx,hy),(13,32)]: poly([(bx,by),(min(45,bx+8),by-7),(min(44,bx+6),by),(bx+2,by+2)],6)
    if anim=='hurt': line([(33,11),(36,8)],22); line([(35,16),(39,16)],22)
    if anim=='ko':
        if f>0:
            turned=im.rotate([0,25,65,90][f],Image.Resampling.NEAREST,expand=False)
            bbox=turned.getbbox(); crop=turned.crop(bbox); im=Image.new('RGBA',(48,48)); im.alpha_composite(crop,(max(0,(48-crop.width)//2),48-crop.height))
    return im

def build(who):
    if who == 'mishthi':
        from mishthi import build as mishthi_build
        return mishthi_build(who)
    if who in ('mansukh','brahmansh'):
        from editor_likeness import build as editor_build
        return editor_build(who)
    if who in ('manvi','sehaj','ashwath','sayam'):
        from likeness import build as build_likeness
        return build_likeness(who)
    anims=ANIMS+([('panic',4,12,True)] if who=='tushar' else [])
    sheet=Image.new('RGBA',(384,48*len(anims))); entries={}
    for row,(anim,n,fps,loop) in enumerate(anims):
        entries[anim]=dict(row=row,frames=n,fps=fps,loop=loop)
        if anim=='attack': entries[anim]['hitFrame']=2
        for f in range(n): sheet.paste(frame(who,anim,f),(48*f,48*row))
    path=f'sprites/characters/{who}.png'; (A/path).parent.mkdir(parents=True,exist_ok=True); sheet.save(A/path)
    return dict(file=path,frameWidth=48,frameHeight=48,anims=entries)

if __name__=='__main__':
    p=A/'manifest.json'; m=json.loads(p.read_text()) if p.exists() else dict(version=1,sprites={},tilesets={},images={},portraits={})
    for who in sys.argv[1:]: m['sprites'][who]=build(who)
    p.write_text(json.dumps(m,indent=2)+'\n')
