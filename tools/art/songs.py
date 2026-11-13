"""Compose 32-bar tracker arrangements with authored motifs and section orchestration."""
from palette import ROOT
import json,sys
OUT=ROOT/'content/audio/songs'
NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
def note(n): return NAMES[n%12]+str(n//12-1)
def bars(rows): return ' | '.join(' '.join(r) for r in rows)
def seq(events,n=16):
    row=['.']*n
    for pos,value in events.items(): row[pos]=value
    return row
CONFIG={
 'ep0':(128,.12,[(52,False),(48,True),(55,True),(50,True)],
 [[0,None,7,None,10,'-',7,None,3,None,0,None,7,None,2,None], [12,'-',10,None,7,None,3,None,7,'-',2,None,0,None,None,None]],'deadline funk'),
 'ep0-boss':(154,.03,[(52,False),(53,True),(52,False),(50,True)],
 [[12,None,19,12,None,19,None,22,19,None,12,None,10,7,10,None],[19,12,None,19,22,None,19,None,15,12,None,10,7,None,2,None]],'reply-all ping storm'),
 'ep1':(116,.04,[(50,False),(46,True),(48,True),(45,True)],
 [[0,'-','-',None,7,None,10,None,12,'-',7,None,3,None,2,None],[7,None,None,10,12,'-','-',None,10,None,7,None,2,'-',0,None]],'overheated machinery'),
 'ep1-boss':(138,0,[(50,False),(51,True),(50,False),(45,True)],
 [[0,None,0,None,7,7,None,None,10,None,10,None,12,None,None,None],[12,12,None,12,10,None,None,None,7,7,None,None,2,None,None,None]],'temporal hiccups'),
 'title':(124,.06,[(52,False),(48,True),(55,True),(50,True)],
 [[0,'-',7,None,12,'-',10,None,7,None,3,None,2,'-',0,None],[3,'-',7,None,10,'-',12,None,14,None,12,None,7,'-','-',None]],'last maximalist standing')}

def compose(id):
    bpm,swing,chords,motifs,_=CONFIG[id]
    boss='boss' in id
    instruments={
      'lead':dict(wave='square',volume=.13,attack=.004,decay=.045,sustain=.28,release=.04,cutoff=2800,pan=.12,vibrato=dict(rate=5.5,depth=7)),
      'bass':dict(wave='triangle',volume=.23,attack=.003,decay=.035,sustain=.65,release=.035),
      'pad':dict(wave='sawtooth',volume=.035,attack=.09,decay=.08,sustain=.35,release=.12,cutoff=900,pan=-.3),
      'kick':dict(wave='kick',volume=.29),
      'snare':dict(wave='snare',volume=.16,pan=-.08),
      'hat':dict(wave='hat',volume=.055,pan=.25)}
    if id=='ep1': instruments['bass']['wave']='sawtooth'; instruments['bass']['cutoff']=650
    if id=='title': instruments['lead']['volume']=.15
    patterns={}
    for section in ['a','a2','b','c','c2','d']:
      tracks={key:[] for key in instruments}
      for bar,(root,major) in enumerate(chords):
        motif=motifs[1 if section in ('b','c2','d') else 0]
        lead=[]
        for step,v in enumerate(motif):
            if v is None: lead.append('.')
            elif v=='-': lead.append('-')
            else:
                offset=v+(1 if major and v%12==3 else 0)
                lead.append(note(root+12+offset+(12 if section=='b' and bar==3 else 0)))
        if section=='c': lead=['.']*8+lead[8:]
        if section=='c2' and bar<2: lead=lead[8:]+lead[:8]
        if section=='a2': lead[15]=note(root+14)
        if section=='d' and bar==3: lead=seq({0:note(chords[0][0]+24),1:'-',2:'-',3:'-',6:note(chords[0][0]+19),8:note(chords[0][0]+12),9:'-',10:'-'})
        bass=seq({0:note(root-12),1:'-',3:note(root-12),6:note(root-5),8:note(root-12),9:'-',11:note(root),14:note(root-5)})
        if id=='ep1': bass=seq({0:note(root-12),1:'-',2:'-',4:note(root-12),6:note(root-12),8:note(root-5),9:'-',12:note(root-12),14:note(root-12)})
        third=root+(4 if major else 3)
        pad=[note(root),'-','-','-',note(third),'-','-','-',note(root+7),'-','-','-',note(third),'-','-','-']
        kick=seq({0:'x8',6:'x5',8:'x8',11:'x6'})
        snare=seq({4:'x7',12:'x8',15:'x3' if bar%2 else '.'})
        hat=seq({0:'x3',2:'x5',4:'x3',6:'x6',8:'x3',10:'x5',12:'x3',14:'x6'})
        if boss: kick[3]='x5'; kick[10]='x6'; hat[7]='x3'; hat[15]='x4'
        if section in ('b','d') and bar==3: snare[13]='x3'; snare[14]='x5'; snare[15]='x7'
        if section=='c': hat=['.']*16; snare=seq({12:'x5'}); kick=seq({0:'x7',10:'x5'})
        if id=='ep1-boss' and bar in (1,3):
            # A deliberate two-sixteenth dropout, with no hanging hold across it.
            for row in [lead,bass,pad,kick,snare,hat]: row[6:8]=['.','.']; row[14:16]=['.','.']
        for key,row in zip(tracks,[lead,bass,pad,kick,snare,hat]): tracks[key].append(row)
      patterns[section]={key:bars(value) for key,value in tracks.items()}
    song=dict(id=id,bpm=bpm,stepsPerBeat=4,swing=swing,instruments=instruments,patterns=patterns,order=['a','a2','b','a','c','c2','b','d'],loopFrom=0)
    (OUT/f'{id}.json').write_text(json.dumps(song,indent=2)+'\n')
    print(id, '32 bars', round(32*4*60/bpm,1),'seconds')
if __name__=='__main__':
 for id in sys.argv[1:]: compose(id)
