import { useEffect, useState } from 'react';
import { loadProgress, nextEpisode } from '@/game/progress';
import type { Episode } from './Title';

/** Story mode: Continue (the next uncleared episode) plus every episode, with what you've cleared on this device. */
export function Story({ episodes, onPlay, onBack }: { episodes: Episode[]; onPlay: (e: Episode) => void; onBack: () => void }) {
  const [cleared] = useState(() => new Set(loadProgress().cleared));
  const next = nextEpisode(episodes.filter(e => !e.locked).map(e => e.n));
  const items = episodes;
  const [sel, setSel] = useState(() => Math.max(0, items.findIndex(e => e.n === next)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); setSel(s => (s + 1) % items.length); }
      else if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); setSel(s => (s - 1 + items.length) % items.length); }
      else if (['Enter', ' ', 'j', 'J'].includes(e.key)) { e.preventDefault(); const it = items[sel]; if (it && !it.locked) onPlay(it); }
      else if (e.key === 'Escape' || e.key === 'Backspace') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="story">
      <div className="story-head">
        <div>
          <div className="studio-eyebrow">QUBLOX: FINAL CUT · STORY</div>
          <h2>{next === null ? 'All episodes cleared.' : cleared.size ? 'Previously, on Qublox…' : 'Roll camera.'}</h2>
          <p>{cleared.size} / {episodes.length} episodes cleared on this device{next !== null ? ` · next up: EP${next}` : ' · replay any of them'}</p>
        </div>
        <button type="button" className="story-back" onClick={onBack}>← Back</button>
      </div>
      <nav className="title-menu story-menu" aria-label="Episodes">
        {items.map((e, i) => (
          <button key={e.start} type="button" className={`title-item${sel === i ? ' is-sel' : ''}${cleared.has(e.n) ? ' is-cleared' : ''}`} disabled={e.locked}
            onMouseEnter={() => setSel(i)} onClick={() => onPlay(e)}>
            <span className="title-ep">EP{e.n}</span>
            <span className="title-name">{e.name}</span>
            <span className="title-place">{e.locked ? 'Coming soon' : e.n === next ? '▶ NEXT' : cleared.has(e.n) ? '✓ CLEARED' : e.place}</span>
          </button>
        ))}
      </nav>
      <p className="title-foot">↑↓ choose · ENTER play · ESC back</p>
    </div>
  );
}
