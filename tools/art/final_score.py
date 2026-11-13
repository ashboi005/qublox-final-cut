"""Final-act score: chopped Feed, sterile muzak, phased finale and victory reprise."""
from songs import CONFIG,compose,OUT
import json
CONFIG.update({
'ep3':(150,.03,[(54,False),(50,True),(57,True),(52,True)],[[0,None,12,0,None,7,10,None,12,None,7,None,3,2,None,7],[12,None,10,7,None,12,None,14,12,None,10,None,7,3,2,None]],'doom-scroll pulse'),
'ep3-boss':(164,0,[(54,False),(55,True),(50,True),(49,True)],[[12,12,None,19,10,None,12,None,15,12,None,7,10,7,2,None],[19,None,22,19,15,None,12,10,None,7,10,None,14,12,10,None]],'autoplay panic'),
'ep4':(96,.14,[(48,True),(53,True),(50,False),(55,True)],[[4,'-',7,None,11,'-',7,None,4,None,2,None,0,'-',None,None],[7,'-',11,None,14,'-',11,None,9,None,7,None,4,'-','-',None]],'corporate elevator unease'),
'beige':(132,.02,[(52,False),(53,True),(48,True),(47,True)],[[0,'-',3,None,7,'-',11,None,12,None,11,7,3,None,2,None],[12,7,12,None,15,14,12,11,7,None,11,12,14,12,7,None]],'three-stage aesthetic failure'),
'credits':(112,.08,[(48,True),(53,True),(55,True),(48,True)],CONFIG['title'][3],'warm victory reprise')})
for id in ['ep3','ep3-boss','ep4','beige','credits']:
 compose(id)
 p=OUT/f'{id}.json';song=json.loads(p.read_text())
 if id in ('ep3','ep3-boss'):
  for pattern in song['patterns'].values():
   for inst in ['lead','bass','hat']:
    tokens=pattern[inst].replace('|','').split()
    for bar in range(4):
     for pos in ([7,15] if bar%2 else [3]):tokens[bar*16+pos]='.'
    pattern[inst]=' | '.join(' '.join(tokens[i:i+16]) for i in range(0,64,16))
 if id=='ep4':
  song['instruments']['lead'].update(wave='sine',volume=.16,vibrato={'rate':3,'depth':5})
  song['instruments']['bass']['volume']=.18;song['instruments']['snare']['volume']=.09
 if id=='credits':
  song['instruments']['lead'].update(wave='triangle',volume=.18,release=.10,vibrato={'rate':5,'depth':9});song['instruments']['pad']['cutoff']=1400
 if id=='beige':
  old=song['patterns'];patterns={}
  for phase,parts in [('A',['c','a','a2']),('B',['a2','b','c2']),('C',['b','a2','d'])]:
   patterns[phase]={inst:' | '.join(old[part][inst] for part in parts) for inst in song['instruments']}
  # Phase A's silent lead and half-time hats make the corporate calm audible.
  patterns['A']['lead']=' '.join(['.']*192)
  tokens=patterns['A']['hat'].replace('|','').split();patterns['A']['hat']=' '.join(t if i%4==2 else '.' for i,t in enumerate(tokens))
  # Phase C introduces bright octave stabs on previously empty offbeats.
  tokens=patterns['C']['lead'].replace('|','').split()
  for i in range(0,len(tokens),16):
   if tokens[i+15]=='.':tokens[i+15]='E6'
  patterns['C']['lead']=' | '.join(' '.join(tokens[i:i+16]) for i in range(0,192,16))
  song['patterns']=patterns;song['order']=['A','B','C'];song['loopFrom']=0
 p.write_text(json.dumps(song,indent=2)+'\n')
