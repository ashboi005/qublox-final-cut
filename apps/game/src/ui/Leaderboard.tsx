import { useEffect, useState } from 'react';
import type { LeaderboardRow } from '@qublox/shared';
import { CREW } from '@/game/crew';
import { fmtTime } from './Hud';
import type { Episode } from './Title';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';

export function Leaderboard({ episodes, onBack }: { episodes: Episode[]; onBack: () => void }) {
  const [ep, setEp] = useState(0);
  const [by, setBy] = useState<'time' | 'style'>('time');
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    setRows(null); setError(null);
    fetch(`${API}/leaderboard?episode=${ep}&by=${by}&limit=15`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(d => { if (live) setRows(d as LeaderboardRow[]); })
      .catch(() => { if (live) setError('The leaderboard server is offline. Start it with: bun run db:up && bun run dev:server'); });
    return () => { live = false; };
  }, [ep, by]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' || e.key === 'Backspace') onBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  return (
    <div className="board">
      <div className="board-head">
        <h2>Leaderboard</h2>
        <button type="button" className="board-back" onClick={onBack}>← Back</button>
      </div>
      <div className="board-tabs" role="tablist">
        {episodes.map(e => <button key={e.n} type="button" role="tab" aria-selected={ep === e.n} onClick={() => setEp(e.n)}>EP{e.n}</button>)}
        <span className="board-spacer" />
        <button type="button" role="tab" aria-selected={by === 'time'} onClick={() => setBy('time')}>Fastest</button>
        <button type="button" role="tab" aria-selected={by === 'style'} onClick={() => setBy('style')}>Most stylish</button>
      </div>
      {error ? <p className="board-empty">{error}</p>
        : !rows ? <p className="board-empty">Loading…</p>
        : rows.length === 0 ? <p className="board-empty">No runs on EP{ep} yet. Finish the episode to post the first one.</p>
        : (
          <ol className="board-list">
            {rows.map((r, i) => (
              <li key={r.id}>
                <span className="board-rank">{i + 1}</span>
                <b>{r.player}</b>
                <span className="board-party">{r.party.map(id => CREW[id].name).join(' · ')}</span>
                <span>{fmtTime(r.timeMs)}</span>
                <span>{r.style.toLocaleString()}</span>
              </li>
            ))}
          </ol>
        )}
    </div>
  );
}
