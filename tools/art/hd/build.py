"""Rebuild the complete Ink / Signal HD set; pixel sources stay read-only.
Use Python with Pillow and CairoSVG. --objects refreshes only the final batch.
"""
import json
import sys
from pathlib import Path
import cast,world,districts,entities,objects
from remaining import convert
ROOT=Path(__file__).resolve().parents[3];A=ROOT/'apps/game/public/assets'

def main():
 path=A/'manifest-hd.json'
 if '--objects' in sys.argv:
  manifest=json.loads(path.read_text())
  pixel=json.loads((A/'manifest.json').read_text())
  # These were the final batch: exclude world parallax and the bespoke logo.
  for kind in ('sprites','images'):
   for key,e in pixel[kind].items():
    final=(kind=='images' and not key.startswith('bg-')) or (kind=='sprites' and any(s in e['file'] for s in ('/props/','/decor/','/fx/')) or kind=='sprites' and e['file'].startswith('fx/'))
    if final and key!='claude-logo':manifest[kind].pop(key,None)
 else:
  for sub in ('sprites/characters','portraits','tiles','backgrounds'):(A/'hd'/sub).mkdir(parents=True,exist_ok=True)
  sprites,portraits=cast.build(A);tilesets,images=world.build(A)
  images.update(districts.build(A));sprites.update(entities.build(A))
  manifest=dict(version=1,scale=4,sprites=sprites,portraits=portraits,tilesets=tilesets,images=images)
  pixel=json.loads((A/'manifest.json').read_text())
  for key,e in pixel['tilesets'].items():
   if key not in tilesets:tilesets[key]=convert(e,'tilesets')
  # Keep the native T-A50 sigil instead of running it through contour reconstruction.
  prior=json.loads(path.read_text()) if path.exists() else {}
  if 'claude-logo' in prior.get('sprites',{}):sprites['claude-logo']=prior['sprites']['claude-logo']
 objects.build(manifest)
 path.write_text(json.dumps(manifest,indent=2)+'\n')
 sys.path.insert(0,str(ROOT/'tools/art'))
 from claude_plan import build_logos
 build_logos(hd_only=True)
 for p in (A/'hd').rglob('*.png'):assert p.stat().st_size<5_000_000,p
 print('HD rebuild complete.')
if __name__=='__main__':main()
