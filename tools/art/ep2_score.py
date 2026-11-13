"""Film-set harmonic-minor motifs and finite result/game-over arrangements."""
from songs import CONFIG,compose,OUT,note,bars,seq
import json
CONFIG['ep2']=(108,.09,[(57,False),(53,True),(50,False),(52,True)],[[0,'-',3,None,7,'-',11,None,12,'-',11,7,3,None,2,None],[12,'-',11,None,7,5,3,None,2,'-',3,None,0,'-','-',None]],'filmi noir')
CONFIG['ep2-boss']=(146,.02,[(57,False),(58,True),(53,True),(52,True)],[[12,None,12,11,7,None,3,None,7,11,12,None,14,12,11,None],[19,None,15,12,11,None,7,None,11,12,None,15,14,11,7,None]],'perfect family nightmare')
for id in ['ep2','ep2-boss']:
 compose(id)
 p=OUT/f'{id}.json'; song=json.loads(p.read_text())
 if id=='ep2':
  song['instruments']['lead'].update(wave='triangle',volume=.18,cutoff=2600,vibrato={'rate':5,'depth':18})
 p.write_text(json.dumps(song,indent=2)+'\n')
# Reuse the proven tracker schema, but give each stinger a finite order with no repeated entries.
base=json.loads((OUT/'title.json').read_text())
for id,bpm,roots in [('results',132,[60,65,67,60,64,65,67,60]),('gameover',84,[57,53,52,45])]:
 song=dict(id=id,bpm=bpm,stepsPerBeat=4,swing=0,instruments=base['instruments'].copy(),patterns={},order=['stinger'],loopFrom=0,loop=False)
 tracks={key:[] for key in song['instruments']}
 if id=='gameover':
  song['instruments']['lead']=dict(wave='sawtooth',volume=.12,attack=.035,decay=.07,sustain=.5,release=.18,cutoff=1100,vibrato=dict(rate=4,depth=20))
 for bar,root in enumerate(roots):
  last=bar==len(roots)-1
  if id=='results':
   lead=seq({0:note(root+12),1:'-',3:note(root+16),4:note(root+19),5:'-',8:note(root+24),9:'-',10:'-',12:note(root+19),14:note(root+16)})
   if last: lead=[note(root+24)]+['-']*11+['.']*4
   bass=[note(root-12),'-','-','.']*4
   pad=[note(root+4)]+['-']*7+[note(root+7)]+['-']*7
   kick=seq({0:'x8',8:'x7'}); snare=seq({4:'x6',12:'x8'}); hat=seq({2:'x4',6:'x4',10:'x4',14:'x5'})
  else:
   lead=seq({0:note(root+12),1:'-',2:'-',3:'-',6:note(root+11),7:'-',8:'-',10:note(root+7),11:'-',12:'-',13:'-'})
   if last: lead=[note(root+12)]+['-']*10+['.']*5
   bass=[note(root-12)]+['-']*11+['.']*4
   pad=[note(root+3)]+['-']*11+['.']*4
   kick=seq({0:'x5'}); snare=['.']*16; hat=['.']*16
  if last:
   for row in [bass,pad,kick,snare,hat]: row[12:16]=['.']*4
  for key,row in zip(tracks,[lead,bass,pad,kick,snare,hat]): tracks[key].append(row)
 song['patterns']['stinger']={k:bars(v) for k,v in tracks.items()}
 (OUT/f'{id}.json').write_text(json.dumps(song,indent=2)+'\n')
 print(id,len(roots),'bars',len(roots)*4*60/bpm,'seconds; stop after one order pass')
