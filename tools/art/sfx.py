"""Chiptune gesture palette; runtime synthesis remains Claude-owned."""
import json
from palette import ROOT
# id, wave, start/end Hz, seconds, volume, repetitions, lowpass Hz
DATA=[
('jump','square',260,610,.09,.10,1,2200),
('land','noise',350,90,.055,.13,1,800),
('hit','noise',1500,170,.075,.21,1,3200),
('swap','triangle',420,1100,.075,.17,2,3500),
('ability','sawtooth',220,880,.16,.12,1,1800),
('hurt','square',330,100,.16,.14,1,2000),
('ko','triangle',480,55,.48,.20,1,1500),
('pickup','sine',660,990,.09,.17,3,4000),
('door','sawtooth',120,50,.27,.12,1,550),
('menu','square',880,880,.035,.07,1,1800),
('ability-hack','square',880,1760,.045,.10,3,3300),
('ability-bribe','sine',1320,1760,.065,.13,3,4500),
('ability-pen','triangle',330,990,.13,.15,1,3000),
('ability-fill','noise',600,180,.14,.16,1,1300),
('ability-ctrlz','triangle',1400,240,.26,.16,2,3000),
('ability-jumpcut','noise',1600,300,.055,.16,1,4200),
('ability-cut','noise',1800,110,.045,.24,1,5000),
('ability-mind','sine',260,1040,.15,.13,3,4200),
('boss-roar','sawtooth',150,38,.42,.18,2,700),
('checkpoint','triangle',523.25,1046.5,.12,.16,3,3200),
('style-rankup','square',783.99,1567.98,.075,.10,4,2400)]
sfx={k:dict(wave=w,freq=[a,b],duration=t,volume=v,repeat=n,cutoff=c) for k,w,a,b,t,v,n,c in DATA}
(ROOT/'content/audio/sfx.json').write_text(json.dumps({'sfx':sfx},indent=2)+'\n')
