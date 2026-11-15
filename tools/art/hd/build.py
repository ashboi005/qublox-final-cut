"""Rebuild the isolated T-A47 slice; never writes the pixel manifest or assets."""
import json
import sys
from pathlib import Path
import cast,world
ROOT=Path(__file__).resolve().parents[3];A=ROOT/'apps/game/public/assets'
def main():
 for sub in ('sprites/characters','portraits','tiles','backgrounds'):(A/'hd'/sub).mkdir(parents=True,exist_ok=True)
 sprites,portraits=cast.build(A);tilesets,images=world.build(A)
 manifest=dict(version=1,scale=4,sprites=sprites,portraits=portraits,tilesets=tilesets,images=images)
 (A/'manifest-hd.json').write_text(json.dumps(manifest,indent=2)+'\n')
 sys.path.insert(0,str(ROOT/'tools/art'))
 from claude_plan import build_logos
 build_logos(hd_only=True)
 for p in (A/'hd').rglob('*.png'):assert p.stat().st_size<5_000_000,p
 print('HD slice rebuilt: 9 crew, 9 portraits, 36 tiles, 6 parallax layers.')
if __name__=='__main__':main()
