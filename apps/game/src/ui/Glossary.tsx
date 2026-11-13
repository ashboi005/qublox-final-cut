import { useEffect, useMemo, useState } from 'react';
import type { CrewId, Glossary as GlossaryText } from '@qublox/shared';
import { moveList } from '@qublox/shared/fight';
import { CREW, hex } from '@/game/crew';
import { stats, storyPowers } from '@/game/glossary';
import { loadVoices, playClip, voiceClips, type VoiceClip } from '@/game/voice';
import type { Portraits } from './DialogueBox';

export type SpriteSheets = Record<string, { file: string; frameWidth: number; frameHeight: number; anims: Record<string, { row: number; frames: number; fps: number; loop?: boolean }> }>;

const ORDER: CrewId[] = ['ashwath', 'sayam', 'tushar', 'sehaj', 'manvi', 'mansukh', 'manya', 'brahmansh', 'mishthi'];
/** Shown first in the anim picker: the stuff worth showing off. */
const SIGNATURE = ['beast', 'heart', 'info', 'cosmic', 'bhai', 'stan', 'ability', 'attack', 'run', 'idle'];

/** A sprite-sheet animation drawn with CSS (no Phaser on menu screens). */
function SpriteAnim({ sheet, anim, scale }: { sheet: SpriteSheets[string]; anim: string; scale: number }) {
  const a = sheet.anims[anim] ?? sheet.anims.idle;
  const [f, setF] = useState(0);
  useEffect(() => {
    setF(0);
    if (!a) return;
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      // One-shots hold their last frame for a beat, then replay so you can actually see them.
      setF(a.loop ? i % a.frames : Math.min(i % (a.frames + 6), a.frames - 1));
    }, 1000 / a.fps);
    return () => window.clearInterval(id);
  }, [a]);
  if (!a) return null;
  const w = sheet.frameWidth, h = sheet.frameHeight;
  return (
    <div className="gloss-sprite" style={{ width: w * scale, height: h * scale }}>
      <div style={{ width: w, height: h, transform: `scale(${scale})`, transformOrigin: '0 0', imageRendering: 'pixelated',
        backgroundImage: `url(/assets/${sheet.file})`, backgroundPosition: `${-f * w}px ${-a.row * h}px` }} />
    </div>
  );
}

const norm = (t: string) => t.toLowerCase().replace(/[^a-z]/g, '');

/** Signature moves first (special, super), then the shared fundamentals; skip rows the J J J string already covers. */
function vsMoves(id: CrewId) {
  const all = moveList(id).filter(m => !['Block', 'Cancels', 'Air attacks'].includes(m.name) && m.input !== 'J');
  return [...all.filter(m => m.input === 'L' || m.input === 'I'), ...all.filter(m => m.input !== 'L' && m.input !== 'I')];
}

export function Glossary({ text, sheets, portraits, stamp, onBack }: { text?: GlossaryText; sheets: SpriteSheets; portraits: Portraits; stamp?: string | null; onBack: () => void }) {
  const [sel, setSel] = useState(0);
  const id = ORDER[sel]!, c = CREW[id], g = text?.crew[id], sheet = sheets[id];
  const anims = useMemo(() => sheet ? [...SIGNATURE.filter(k => sheet.anims[k]), ...Object.keys(sheet.anims).filter(k => !SIGNATURE.includes(k))] : [], [sheet]);
  const [anim, setAnim] = useState('idle');
  const [voices, setVoices] = useState<VoiceClip[]>([]);
  useEffect(() => { void loadVoices().then(() => setVoices(voiceClips(id))); }, [id]);
  useEffect(() => { setAnim(anims[0] ?? 'idle'); }, [anims]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') onBack();
      else if (['ArrowRight', 'ArrowDown', 'd', 'D', 's', 'S'].includes(e.key)) { e.preventDefault(); setSel(s => (s + 1) % ORDER.length); }
      else if (['ArrowLeft', 'ArrowUp', 'a', 'A', 'w', 'W'].includes(e.key)) { e.preventDefault(); setSel(s => (s - 1 + ORDER.length) % ORDER.length); }
      else if (['j', 'J', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); setAnim(cur => anims[(anims.indexOf(cur) + 1) % anims.length] ?? cur); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack, anims]);

  const face = (who: CrewId, emotion = 'smug') => {
    const p = portraits[who];
    if (!p) return { background: hex(CREW[who].color) };
    const n = p.emotions.length, i = Math.max(0, p.emotions.indexOf(emotion));
    return { backgroundImage: `url(/assets/${p.file})`, backgroundSize: `${n * 100}% 100%`, backgroundPosition: `${n > 1 ? (i / (n - 1)) * 100 : 0}% 0` };
  };

  return (
    <div className="gloss" style={{ '--crew': hex(c.color) } as React.CSSProperties}>
      <div className="gloss-head">
        <div>
          <div className="gloss-eyebrow">Qublox HR · Classified personnel files</div>
          <h2>The Crew</h2>
        </div>
        {text?.intro && <p className="gloss-intro">{text.intro}</p>}
        <button type="button" className="gloss-back" onClick={onBack}>← Back</button>
      </div>
      <nav className="gloss-tabs" aria-label="Crew">
        {ORDER.map((who, i) => (
          <button key={who} type="button" aria-selected={i === sel} onClick={() => setSel(i)} style={{ '--crew': hex(CREW[who].color) } as React.CSSProperties}>
            <span className="gloss-tab-face" style={face(who)} />
            <span>{CREW[who].name}</span>
          </button>
        ))}
      </nav>
      <div className="gloss-file" key={id}>
        <aside className="gloss-left">
          <div className="gloss-stage">
            {sheet ? <SpriteAnim sheet={sheet} anim={anim} scale={4} /> : <span className="gloss-face-big" style={face(id)} />}
          </div>
          {anims.length > 0 && (
            <div className="gloss-anims" role="radiogroup" aria-label="Animation">
              {anims.map(k => <button key={k} type="button" role="radio" aria-checked={k === anim} onClick={() => setAnim(k)}>{k}</button>)}
            </div>
          )}
          <dl className="gloss-stats">
            {stats(id).map(s => (
              <div key={s.label}><dt>{s.label}</dt><dd><i style={{ width: `${Math.round(s.v * 100)}%` }} /></dd></div>
            ))}
          </dl>
          {g?.threat && <p className="gloss-threat">⚠ {g.threat}</p>}
        </aside>
        <section className="gloss-main">
          {stamp && <img className="gloss-stamp" src={stamp} alt="" />}
          <div className="gloss-id">
            <span className="gloss-face" style={face(id)} />
            <div>
              <h3>{c.name}</h3>
              <p className="gloss-role">{c.role} · {c.className}{g?.title ? ` · ${g.title}` : ''}</p>
              {g?.tagline && <p className="gloss-tagline">“{g.tagline}”</p>}
            </div>
          </div>
          {g?.bio ? <p className="gloss-bio">{g.bio}</p> : <p className="gloss-bio is-pending">File pending. HR is still recovering from the last interview.</p>}
          {((g?.catchphrases.length ?? 0) > 0 || voices.length > 0) && (
            <p className="gloss-catch">
              {voices.map(v => <button key={v.file} type="button" className="gloss-voice" onClick={() => void playClip(v)} title="Play the real recording">▶ {v.label}</button>)}
              {g?.catchphrases.filter(q => !voices.some(v => norm(v.label) === norm(q))).map(q => <q key={q}>{q}</q>)}
            </p>
          )}
          {(g?.facts.length ?? 0) > 0 && <ul className="gloss-facts">{g!.facts.map(f => <li key={f}>{f}</li>)}</ul>}
          <div className="gloss-cols">
            <div>
              <h4>Story mode</h4>
              <ul className="gloss-moves">
                {storyPowers(id).map(p => (
                  <li key={p.name} className={`is-${p.tag ?? 'passive'}`}><kbd>{p.input}</kbd><b>{p.name}</b><span>{p.text}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h4>Versus</h4>
              <ul className="gloss-moves is-vs">
                {vsMoves(id).map(m => (
                  <li key={m.input + m.name} className={m.input === 'L' || m.input === 'I' ? 'is-special' : ''}><kbd>{m.input}</kbd><b>{m.name}</b><span>{m.note}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
      <p className="gloss-foot">←→ crew · J cycle animation · ESC back</p>
    </div>
  );
}
