"""Final mix and phrase orchestration over the original authored score sources."""
import json,runpy
from palette import ROOT
from songs import compose,CONFIG
OUT=ROOT/'content/audio/songs'
def tokens(s):return s.replace('|',' ').split()
def packed(ts):return ' | '.join(' '.join(ts[i:i+16]) for i in range(0,len(ts),16))

def main():
    for name in list(CONFIG):compose(name)
    for file in ('ep2_score.py','final_score.py','stan_stinger.py','sfx.py'):runpy.run_path(str(ROOT/'tools/art'/file),run_name='__main__')
    for path in sorted(OUT.glob('*.json')):
        s=json.loads(path.read_text());id=s['id'];boss='boss' in id or id=='beige';inst=s['instruments'];quiet=id in ('ep4','gameover')
        # Preserve melodies, tempos and section lengths. Separate bass, melody and air.
        for name,v in inst.items():
            wave=v['wave']
            if name=='bass':v['pan']=0;v['release']=.028 if boss else .045
            elif name=='lead':v['pan']=.08;v['attack']=.006;v['release']=.035 if boss else .055
            elif name=='pad':v['pan']=-.22;v['cutoff']=700 if quiet else 1100;v['volume']=min(v.get('volume',.035),.035)
            elif wave=='hat':v['pan']=.28;v['volume']=min(v.get('volume',.06),.05);v['cutoff']=6500
            elif wave=='snare':v['pan']=-.12;v['volume']=min(v.get('volume',.17),.17)
        for section,pattern in s['patterns'].items():
            n=len(tokens(next(iter(pattern.values()))));breakdown=section=='c' or (id=='beige' and section=='A')
            if 'hat' in pattern:
                ts=tokens(pattern['hat'])
                for i,t in enumerate(ts):
                    if t.startswith('x'):
                        # A human-feeling downbeat/offbeat accent cycle with quiet grace hits.
                        velocity=3 if i%4==0 else 5 if i%4==2 else 2
                        if quiet:velocity=max(1,velocity-1)
                        ts[i]='x'+str(velocity)
                if not breakdown and id!='ep1-boss' and s.get('loop',True):
                    # Last half-beat breath allows the next phrase downbeat to speak.
                    ts[-2:]=['.','.']
                pattern['hat']=packed(ts)
            if 'snare' in pattern and section in ('b','d','C') and not quiet and id!='ep1-boss':
                ts=tokens(pattern['snare']);ts[-4:]=['x6','.','x3','x5'];pattern['snare']=packed(ts)
            if 'kick' in pattern and id in ('ep0','ep2','credits','stan-mode') and not breakdown:
                ts=tokens(pattern['kick'])
                for start in range(16,n,32):
                    if ts[start+10]=='.':ts[start+10]='x3'
                pattern['kick']=packed(ts)
            if 'lead' in pattern and s.get('loop',True) and section=='d':
                ts=tokens(pattern['lead']);ts[-2:]=['.','.'];pattern['lead']=packed(ts)
        path.write_text(json.dumps(s,indent=2)+'\n')
    path=ROOT/'content/audio/sfx.json';s=json.loads(path.read_text())
    # A chatter/pitch gesture replaces the old coin-like arpeggio at the legacy key.
    s['sfx']['ability-bribe'].update(wave='triangle',freq=[360,720],duration=.095,repeat=2,volume=.12,cutoff=2400)
    for key,v in s['sfx'].items():
        if key in ('hit','ability-cut','ability-jumpcut'):v['duration']=round(v['duration']*.9,4)
        elif key in ('pickup','checkpoint','style-rankup'):v['volume']=round(v['volume']*.9,3)
        elif key=='boss-roar':v['repeat']=1;v['duration']=.48;v['cutoff']=600
        elif key=='menu':v['wave']='triangle';v['freq']=[880,1046.5];v['volume']=.06
        elif key=='ability-mind':v['repeat']=2;v['duration']=.18
        elif key in ('land','door'):v['cutoff']=650 if key=='land' else 480
        elif key in ('jump','swap','ability','hurt','ko','ability-hack','ability-pen','ability-fill','ability-ctrlz'):v['volume']=round(v['volume']*.95,3)
    path.write_text(json.dumps(s,indent=2)+'\n')
if __name__=='__main__':main()
