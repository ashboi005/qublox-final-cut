"""Assemble a labelled old/new review from assets plus actual browser captures."""
import json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[3];A=ROOT/'apps/game/public/assets';R=ROOT/'tools/art/raw'
def main():
 old=json.loads((A/'manifest.json').read_text());new=json.loads((A/'manifest-hd.json').read_text())
 out=Image.new('RGBA',(1600,1390),'#242633');d=ImageDraw.Draw(out);font=ImageFont.load_default(size=20)
 def label(x,y,t,col='#f2f1ec'):d.text((x,y),t,font=font,fill=col)
 label(20,12,'QUBLOX / T-A47     PIXEL vs INK / SIGNAL     isolated HD style trial','#fecb56')
 for j,who in enumerate(('ashwath','sayam')):
  y=54+j*240
  for i,anim in enumerate(('idle','run','attack','super')):
   x=i*400;label(x+10,y,who.upper()+' / '+anim.upper());label(x+15,y+218,'PIXEL');label(x+210,y+218,'HD')
   for k,(m,size,resample) in enumerate(((old,48,Image.Resampling.NEAREST),(new,192,Image.Resampling.LANCZOS))):
    e=m['sprites'][who];an=e['anims'][anim];f=0 if anim=='idle' else 2 if anim=='run' else an.get('hitFrame',6)
    im=Image.open(A/e['file']).crop((f*size,an['row']*size,(f+1)*size,(an['row']+1)*size)).resize((192,192),resample)
    out.alpha_composite(im,(x+k*200+4,y+24))
 for j,who in enumerate(('ashwath','sayam')):
  x=j*800;label(x+15,540,who.upper()+' / NEUTRAL PORTRAIT    PIXEL                         HD')
  for k,(m,size) in enumerate(((old,64),(new,256))):
   im=Image.open(A/m['portraits'][who]['file']).crop((0,0,size,size)).resize((256,256),Image.Resampling.NEAREST if k==0 else Image.Resampling.LANCZOS)
   out.alpha_composite(im,(x+40+k*350,575))
 for j,state in enumerate(('pixel','hd')):
  label(j*800+15,855,'EP1-R03 / '+state.upper()+' / LIVE GAME CAPTURE')
  path=R/f't-a47-room-{state}.png'
  if not path.exists():raise FileNotFoundError('Capture the actual game first: '+str(path))
  out.alpha_composite(Image.open(path).convert('RGBA').resize((800,500),Image.Resampling.LANCZOS),(j*800,885))
 out.save(R/'t-a47-compare.png');print(R/'t-a47-compare.png')
if __name__=='__main__':main()
