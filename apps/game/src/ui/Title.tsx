import { useEffect, useState } from 'react';

import type { CrewId } from '@qublox/shared';
import { nextEpisode } from '@/game/progress';

export type Episode = { n: number; name: string; place: string; start: string; locked?: boolean; pool?: CrewId[]; pick?: number; required?: CrewId[]; joiners?: CrewId[] };

export function Title({ logo, background, taglines, episodes, onStory, onBoard, onAchievements, onVersus, onCrew }: {
  logo: string | null; background: string | null; taglines: string[];
  episodes: Episode[]; onStory: () => void; onBoard: () => void; onAchievements: () => void; onVersus: () => void; onCrew: () => void;
}) {
  const [tag, setTag] = useState(0);
  const [storyLabel, setStoryLabel] = useState('5 episodes');
  useEffect(() => {
    // Read progress after mount (browser storage isn't there during server render).
    const n = nextEpisode(episodes.filter(e => !e.locked).map(e => e.n));
    const ep = episodes.find(e => e.n === n);
    setStoryLabel(n === null ? 'All cleared · replay any episode' : n === 0 ? `Start · EP0 ${ep?.name ?? ''}` : `Continue · EP${n} ${ep?.name ?? ''}`);
  }, [episodes]);
  const [sel, setSel] = useState(0);
  const items = [{ kind: 'story' as const }, { kind: 'vs' as const }, { kind: 'crew' as const }, { kind: 'board' as const }, { kind: 'ach' as const }];

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
        else if (it.kind === 'vs') onVersus();
        else if (it.kind === 'crew') onCrew();
        else if (it.kind === 'story') onStory();
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
        {items.map((it, i) => it.kind === 'story' ? (
          <button key="story" type="button" className={`title-item is-story${sel === i ? ' is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={onStory}>
            <span className="title-ep">▶</span>
            <span className="title-name">Story</span>
            <span className="title-place">{storyLabel}</span>
          </button>
        ) : it.kind === 'vs' ? (
          <button key="vs" type="button" className={`title-item is-board is-vs${sel === i ? ' is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={onVersus}>
            <span className="title-ep">VS</span><span className="title-name">Versus</span><span className="title-place">1v1 · online room code · local · CPU</span>
          </button>
        ) : it.kind === 'crew' ? (
          <button key="crew" type="button" className={`title-item is-board${sel === i ? ' is-sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={onCrew}>
            <span className="title-ep">☰</span><span className="title-name">The Crew</span><span className="title-place">Glossary · every power</span>
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
