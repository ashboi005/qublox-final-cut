"""Original four-bar hype stinger, 120 BPM, eight seconds; no borrowed melody."""
import json
from palette import ROOT
song={'id':'stan-mode','bpm':120,'stepsPerBeat':4,'swing':0.06,
      'instruments':{
          'lead':{'wave':'square','volume':.11,'attack':.003,'decay':.08,'sustain':.25,'release':.05,'cutoff':2700},
          'bass':{'wave':'triangle','volume':.22,'attack':.003,'decay':.08,'sustain':.6,'release':.04},
          'stab':{'wave':'sawtooth','volume':.045,'attack':.008,'decay':.1,'sustain':.15,'release':.06,'cutoff':1400},
          'kick':{'wave':'kick','volume':.3},'snare':{'wave':'snare','volume':.16},'hat':{'wave':'hat','volume':.055}},
      'patterns':{'hype':{
          'lead':'E5 . G5 A5 . E5 . B5 | A5 . G5 . D5 E5 . . | C6 . B5 G5 . A5 . E5 | G5 A5 B5 . E6 - . .',
          'bass':'E2 . E2 . . E3 D3 . | C2 . C3 . . C3 D3 . | A2 . A2 . . A3 G3 . | B2 . B2 D3 E2 - . .',
          'stab':'. . B4 . . . G4 . | . . E4 . . . G4 . | . . E5 . . . C5 . | D5 . . B4 E5 - . .',
          'kick':'x . . . x . x . | x . . x . . x . | x . . . x . x . | x . x . x . . .',
          'snare':'. . x . . . x . | . . x . . . x . | . . x . . . x . | . . x . x5 x7 x .',
          'hat':'x5 x3 x5 x3 x5 x3 x7 x3 | x5 x3 x5 x3 x7 x3 x5 x3 | x5 x3 x5 x3 x5 x3 x7 x3 | x5 x5 x7 x5 x . . .'}},
      'order':['hype'],'loopFrom':0,'loop':False}
# Each written token is an eighth note: expand to sixteenth note plus rest/hold.
for name,track in song['patterns']['hype'].items():
    tokens=track.replace('|','').split();expanded=[]
    for note in tokens: expanded.extend([note,'-' if note=='-' else '.'])
    song['patterns']['hype'][name]=' '.join(expanded)
(ROOT/'content/audio/songs/stan-mode.json').write_text(json.dumps(song,indent=2)+'\n')
