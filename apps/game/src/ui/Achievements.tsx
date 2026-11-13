import { useEffect, useState } from 'react';
import { TAPE_IDS } from '@qublox/shared';
import { achievements } from '@/game/achievements';

export type AchievementText = { id: string; name: string; desc: string };
export type TapeText = { id: string; title: string; caption: string };

export function Achievements({ list, tapes, onBack }: { list: AchievementText[]; tapes: TapeText[]; onBack: () => void }) {
  const [unlocked] = useState(() => achievements.unlocked() as Record<string, number | undefined>);
  const [found] = useState(() => new Set(achievements.found('tapes')));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Backspace') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);
  const got = list.filter(a => unlocked[a.id]).length;
  return (
    <div className="board">
      <div className="board-head">
        <h2>Achievements</h2>
        <button type="button" className="board-back" onClick={onBack}>← Back</button>
      </div>
      <p className="board-empty">{got} / {list.length} unlocked on this device</p>
      <ul className="ach-list">
        {list.map(a => (
          <li key={a.id} className={unlocked[a.id] ? 'is-got' : ''}>
            <b>{unlocked[a.id] ? '◆' : '◇'} {a.name}</b>
            <span>{a.desc}</span>
          </li>
        ))}
      </ul>
      <h3 className="ach-sub">📼 Lost Footage · {TAPE_IDS.filter(id => found.has(id)).length} / {TAPE_IDS.length}</h3>
      <ul className="ach-list">
        {TAPE_IDS.map(id => {
          const t = tapes.find(x => x.id === id);
          const got = found.has(id);
          return (
            <li key={id} className={got ? 'is-got' : ''}>
              <b>{got ? '▶' : '■'} EP{id[2]} · {got ? t?.title ?? id : '[REDACTED]'}</b>
              <span>{got ? t?.caption ?? 'Tape recovered. Label unreadable.' : 'Hidden somewhere in Episode ' + id[2] + '. Look off the beaten path.'}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
