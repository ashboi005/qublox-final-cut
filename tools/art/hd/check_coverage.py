"""Check HD coverage, matching animation contracts, dimensions and file limits."""
import json
from PIL import Image
from remaining import A

def main():
 pixel=json.loads((A/'manifest.json').read_text());hd=json.loads((A/'manifest-hd.json').read_text());count=0
 for kind in ('sprites','images','portraits','tilesets'):
  assert not (pixel[kind].keys()-hd[kind].keys()),(kind,'missing HD entries')
  for key,e in pixel[kind].items():
   h=hd[kind][key];path=A/h['file'];im=Image.open(path);src=Image.open(A/e['file'])
   assert h['file'].startswith('hd/'),key
   assert im.mode=='RGBA' and path.stat().st_size<5_000_000,key
   if kind=='sprites':
    assert (h['frameWidth'],h['frameHeight'])==(e['frameWidth']*4,e['frameHeight']*4),key
    assert not (e['anims'].keys()-h['anims'].keys()),key
    for name,a in h['anims'].items():
     assert (a['row']+1)*h['frameHeight']<=im.height and a['frames']*h['frameWidth']<=im.width,(key,name)
   elif kind=='portraits':assert h['emotions']==e['emotions'] and h['size']==e['size']*4,key
   else:assert im.size==(src.width*4,src.height*4),(key,im.size,src.size)
   count+=1
 print(f'HD coverage: {count} keys; no missing assets/animations; dimensions, RGBA and sizes pass.')
if __name__=='__main__':main()
