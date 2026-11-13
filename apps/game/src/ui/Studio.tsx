import { useEffect, useState } from 'react';
import type { CrewId } from '@qublox/shared';
import { CREW, hex } from '@/game/crew';
import type { Portraits } from './DialogueBox';

/** The Studio: pick who comes along. `pick` slots are yours; `joiners` arrive during the episode. */
/** `required` crew are locked in (the episode can't be finished without them, e.g. EP1's terminals need a hacker). */
export function Studio({ episode, pool, pick, required = [], joiners, portraits, selectLines, onGo, onBack }: {
  episode: { n: number; name: string }; pool: CrewId[]; pick: number; required?: CrewId[]; joiners: CrewId[];
  portraits: Portraits; selectLines: Partial<Record<CrewId, string[]>>;
  onGo: (party: CrewId[]) => void; onBack: () => void;
}) {
  const [chosen, setChosen] = useState<CrewId[]>(() => [...required, ...pool.filter(id => !required.includes(id))].slice(0, pick));
  const [cursor, setCursor] = useState(0);
  const [quote, setQuote] = useState<{ id: CrewId; text: string } | null>(null);
  const ready = chosen.length === pick;

  const toggle = (id: CrewId) => {
    setChosen(c => {
      if (required.includes(id)) { setQuote({ id, text: `${CREW[id].name} is locked in for this episode.` }); return c; }
      if (c.includes(id)) return c.filter(x => x !== id);
      const lines = selectLines[id];
      if (lines?.length) setQuote({ id, text: lines[Math.floor(Math.random() * lines.length)]! });
      if (c.length < pick) return [...c, id];
      const drop = c.findIndex(x => !required.includes(x));
      return drop < 0 ? c : [...c.slice(0, drop), ...c.slice(drop + 1), id];
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowRight', 'd', 'D'].includes(e.key)) setCursor(c => (c + 1) % pool.length);
      else if (['ArrowLeft', 'a', 'A'].includes(e.key)) setCursor(c => (c - 1 + pool.length) % pool.length);
      else if ([' ', 'j', 'J'].includes(e.key)) { e.preventDefault(); toggle(pool[cursor]!); }
      else if (e.key === 'Enter' && ready) onGo(chosen);
      else if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const face = (id: CrewId) => {
    const p = portraits[id];
    if (!p) return { background: hex(CREW[id].color) };
    const n = p.emotions.length, i = Math.max(0, p.emotions.indexOf('smug'));
    return { backgroundImage: `url(/assets/${p.file})`, backgroundSize: `${n * 100}% 100%`, backgroundPosition: `${n > 1 ? (i / (n - 1)) * 100 : 0}% 0` };
  };

  return (
    <div className="studio">
      <div className="studio-head">
        <div className="studio-eyebrow">EP{episode.n} · {episode.name} · CASTING</div>
        <h2>Who&apos;s on this shoot?</h2>
        <p>Pick {pick}.{joiners.length > 0 && <> {joiners.map(id => CREW[id].name).join(' & ')} join{joiners.length === 1 ? 's' : ''} you on location.</>}</p>
      </div>
      <div className="studio-grid" role="listbox" aria-multiselectable="true" aria-label="Crew">
        {pool.map((id, i) => {
          const c = CREW[id], on = chosen.includes(id);
          return (
            <button key={id} type="button" role="option" aria-selected={on}
              className={`studio-card${on ? ' is-on' : ''}${cursor === i ? ' is-cursor' : ''}`}
              style={{ '--crew': hex(c.color) } as React.CSSProperties}
              onMouseEnter={() => setCursor(i)} onClick={() => toggle(id)}>
              <span className="studio-face" style={face(id)} />
              <span className="studio-name">{c.name}</span>
              <span className="studio-role">{c.role} · {c.className}</span>
              <span className="studio-ability">{c.abilityName}</span>
              {on && <span className="studio-slot">{chosen.indexOf(id) + 1}</span>}
            </button>
          );
        })}
        {joiners.map(id => (
          <div key={id} className="studio-card is-joiner" style={{ '--crew': hex(CREW[id].color) } as React.CSSProperties}>
            <span className="studio-face" style={{ ...face(id), filter: 'grayscale(1) brightness(.6)' }} />
            <span className="studio-name">{CREW[id].name}</span>
            <span className="studio-role">Joins on location</span>
            <span className="studio-ability">{CREW[id].abilityName}</span>
          </div>
        ))}
      </div>
      <div className="studio-foot">
        <p className="studio-quote" aria-live="polite">{quote ? <><b>{CREW[quote.id].name}:</b> “{quote.text}”</> : '←→ choose · SPACE pick · ENTER roll camera'}</p>
        <div className="studio-actions">
          <button type="button" onClick={onBack}>Back</button>
          <button type="button" className="is-go" disabled={!ready} onClick={() => onGo(chosen)}>Roll camera</button>
        </div>
      </div>
    </div>
  );
}
