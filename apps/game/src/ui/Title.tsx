import { useEffect, useState } from 'react';

import type { CrewId } from '@qublox/shared';

export type Episode = { n: number; name: string; place: string; start: string; locked?: boolean; pool?: CrewId[]; pick?: number; required?: CrewId[]; joiners?: CrewId[] };

export function Title({ logo, background, taglines, episodes, onPlay, onBoard, onAchievements }: {
  logo: string | null; background: string | null; taglines: string[];
  episodes: Episode[]; onPlay: (e: Episode) => void; onBoard: () => void; onAchievements: () => void;
}) {
  const [tag, setTag] = useState(0);
  const [sel, setSel] = useState(0);
  const items = [...episodes.map(e => ({ kind: 'ep' as const, e })), { kind: 'board' as const }, { kind: 'ach' as const }];

  useEffect(() => {
    if (taglines.length < 2) return;
    const id = window.setInterval(() => setTag(t => (t + 1) % taglines.length), 3200);
    return () => window.clearInterval(id);
  }, [taglines.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['ArrowDown', 's', 'S'].includes(e.key)) { e.preventDefault(); setSel(s => (s + 1) % items.length); }
      else if (['ArrowUp', 'w', 'W'].includes(e.key)) { e.preventDefault(); setSel(s => (s - 1 + items.length) % items.length); }
      else if (['Enter', ' ', 'j', 'J'].includes(e.key)) {
        e.preventDefault();
        const it = items[sel];
        if (!it) return;
        if (it.kind === 'board') onBoard();
        else if (it.kind === 'ach') onAchievements();
        else if (!it.e.locked) onPlay(it.e);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="title" style={background ? { backgroundImage: `url(${background})` } : undefined}>
      <div className="title-head">
        {logo ? <img className="title-logo" src={logo} alt="QUBLOX: FINAL CUT" /> : <h1 className="title-fallback">QUBLOX: FINAL CUT</h1>}
        {taglines.length > 0 && <p className="title-tag" key={tag}>{taglines[tag]}</p>}
      </div>
      <nav className="title-menu" aria-label="Main menu">
        {items.map((it, i) => it.kind === 'ep' ? (
          <button key={it.e.start} type="button" className={`title-item${sel === i ? ' is-sel' : ''}`} disabled={it.e.locked}
            onMouseEnter={() => setSel(i)} onClick={() => onPlay(it.e)}>
            <span className="title-ep">EP{it.e.n}</span>
            <span className="title-name">{it.e.name}</span>
            <span className="title-place">{it.e.locked ? 'Coming soon' : it.e.place}</span>
          </button>
        ) : it.kind === 'board' ? (
          <button key="board" type="button" className={`title-item is-board${sel === i ? ' is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={onBoard}>
            <span className="title-ep">★</span><span className="title-name">Leaderboard</span><span className="title-place">Fastest · Most stylish</span>
          </button>
        ) : (
          <button key="ach" type="button" className={`title-item is-board${sel === i ? ' is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={onAchievements}>
            <span className="title-ep">◆</span><span className="title-name">Achievements</span><span className="title-place">12 to find</span>
          </button>
        ))}
      </nav>
      <p className="title-foot">↑↓ choose · ENTER start · a Qublox production, Neo-Amritsar 2084</p>
    </div>
  );
}
