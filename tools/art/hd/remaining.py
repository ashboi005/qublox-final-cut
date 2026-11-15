"""Rebuild non-crew assets from vectorised approved colour-region designs."""
import json,copy
from pathlib import Path
from PIL import Image
from contours import render
ROOT=Path(__file__).resolve().parents[3];A=ROOT/'apps/game/public/assets'
def convert(entry,kind):
 e=copy.deepcopy(entry);src=Image.open(A/e['file']).convert('RGBA');out=Image.new('RGBA',(src.width*4,src.height*4))
 if kind=='sprites':
  w,h=e['frameWidth'],e['frameHeight'];cells=[(f*w,a['row']*h,w,h) for a in e['anims'].values() for f in range(a['frames'])];e['frameWidth']*=4;e['frameHeight']*=4
 elif kind=='portraits':
  w=e['size'];cells=[(i*w,0,w,w) for i in range(len(e['emotions']))];e['size']*=4
 elif kind=='tilesets':
  w=e['tileSize'];cells=[(x,y,w,w) for y in range(0,src.height,w) for x in range(0,src.width,w)];e['tileSize']*=4
 else:cells=[(0,0,src.width,src.height)]
 for x,y,w,h in cells:out.paste(render(src.crop((x,y,x+w,y+h))),(x*4,y*4))
 if kind=='tilesets':
  from world import tile
  for i in range(19):out.paste(tile(i),(i%6*64,i//6*64))
 e['file']='hd/'+e['file'];dest=A/e['file'];dest.parent.mkdir(parents=True,exist_ok=True);out.save(dest,optimize=True);assert dest.stat().st_size<5_000_000,dest
 return e

def build(m,batch):
 pixel=json.loads((A/'manifest.json').read_text());count=0
 for kind in ('sprites','portraits','images','tilesets'):
  for key,e in pixel[kind].items():
   if key in m[kind]:continue
   entity=any('/'+s+'/' in e['file'] for s in ('enemies','bosses','npcs')) or kind=='portraits'
   if (batch=='entities' and not entity) or (batch=='objects' and (entity or kind=='tilesets')) or (batch=='tiles' and kind!='tilesets'):continue
   m[kind][key]=convert(e,kind);count+=1
 print(batch,count,'assets reconstructed')
 return m
if __name__=='__main__':
 import sys
 path=A/'manifest-hd.json';m=json.loads(path.read_text());build(m,sys.argv[1]);path.write_text(json.dumps(m,indent=2)+'\n')
