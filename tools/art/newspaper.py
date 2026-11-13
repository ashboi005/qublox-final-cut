"""Binary-pixel masthead on warm stippled newsprint; headline area stays empty."""
from crew import A,C
from PIL import Image,ImageDraw,ImageFont
import random,json
im=Image.new('RGBA',(200,60),C[13]);d=ImageDraw.Draw(im);rng=random.Random(2084)
d.rectangle((0,0,199,59),outline=C[9]);d.line([(2,1),(197,1)],fill=C[14]);d.line([(1,58),(198,58)],fill=C[11])
for _ in range(160):
 x=rng.randrange(2,198);y=rng.randrange(2,58)
 if not (8<x<192 and 31<y<52):d.point((x,y),fill=C[12 if rng.random()<.35 else 14])
font=ImageFont.load_default(size=13)
mask=Image.new('1',(200,60));md=ImageDraw.Draw(mask);text='NEO-AMRITSAR TIMES';box=md.textbbox((0,0),text,font=font);x=(200-(box[2]-box[0]))//2
md.text((x,5),text,font=font,fill=1);im.paste(C[9],(0,0,200,60),mask)
d=ImageDraw.Draw(im);d.line([(7,23),(192,23)],fill=C[9]);d.line([(7,25),(192,25)],fill=C[11]);d.line([(5,29),(5,53)],fill=C[11]);d.line([(7,55),(192,55)],fill=C[11])
(A/'images').mkdir(exist_ok=True);im.save(A/'images/newspaper.png')
p=A/'manifest.json';m=json.loads(p.read_text());m['images']['newspaper']={'file':'images/newspaper.png'};p.write_text(json.dumps(m,indent=2)+'\n')
