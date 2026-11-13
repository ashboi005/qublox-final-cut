from crew import A,C
from PIL import Image,ImageDraw
import json
p=A/'manifest.json'; m=json.loads(p.read_text())
for name,n in [('cash',4),('money-bag',1)]:
    im=Image.new('RGBA',(16*n,16))
    for f in range(n):
        tile=Image.new('RGBA',(16,16)); d=ImageDraw.Draw(tile)
        if name=='cash':
            points=[[(1,5),(12,2),(14,10),(3,13)],[(5,1),(10,2),(11,14),(6,13)],[(2,3),(14,6),(12,13),(0,10)],[(3,7),(14,6),(14,9),(2,10)]][f]
            d.polygon(points,fill=C[29],outline=C[0]); d.line([(6,5),(9,10)],fill=C[6],width=2)
        else:
            d.polygon([(4,1),(11,1),(9,5),(14,10),(13,14),(2,14),(1,10),(6,5)],fill=C[22],outline=C[0]); d.line([(5,5),(10,5)],fill=C[23],width=2); d.line([(8,7),(6,9),(9,11),(7,12)],fill=C[23])
        im.paste(tile,(f*16,0))
    path=f'sprites/props/{name}.png'; (A/path).parent.mkdir(parents=True,exist_ok=True); im.save(A/path)
    m['sprites'][name]=dict(file=path,frameWidth=16,frameHeight=16,anims={'idle':dict(row=0,frames=n,fps=10,loop=True)})
p.write_text(json.dumps(m,indent=2)+'\n')
