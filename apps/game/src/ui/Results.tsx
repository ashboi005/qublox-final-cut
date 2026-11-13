import { useEffect, useState } from 'react';
import type { LeaderboardRow } from '@qublox/shared';
import type { RunResult } from '@/game/bus';
import { CREW } from '@/game/crew';
import { fmtTime } from './Hud';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
const NAME_KEY = 'qublox-player-name';

export function Results({ result, headline, byline, paper, onRetry, onQuit }: { result: RunResult; headline: string | null; byline?: string | null; paper?: string | null; onRetry: () => void; onQuit: () => void }) {
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [board, setBoard] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => { try { setName(localStorage.getItem(NAME_KEY) ?? ''); } catch { /* private mode */ } }, []);

  const loadBoard = async () => {
    try {
      const r = await fetch(`${API}/leaderboard?episode=${result.episode}&by=time&limit=8`);
      if (r.ok) setBoard((await r.json()) as LeaderboardRow[]);
    } catch { setBoard(null); }
  };
  useEffect(() => { void loadBoard(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setState('sending');
    try { localStorage.setItem(NAME_KEY, name.trim()); } catch { /* ignore */ }
    try {
      const r = await fetch(`${API}/runs`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: name.trim(), episode: result.episode, timeMs: result.timeMs, style: result.style, kos: result.kos, party: result.party }),
      });
      if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
      setState('sent');
      void loadBoard();
    } catch (err) {
      setState('error');
      setError(err instanceof TypeError ? 'Leaderboard server is offline. Start it with: bun run db:up && bun run dev:server' : String((err as Error).message));
    }
  };

  return (
    <div className="results" role="dialog" aria-label="Episode complete">
      <div className="results-card">
        <div className="results-eyebrow">EPISODE {result.episode} · THAT&apos;S A WRAP</div>
        {headline && (paper
          // Astra's masthead strip (200×60); the headline sits in its blank band (y 31–52).
          ? <div className="results-paper has-art" style={{ backgroundImage: `url(${paper})` }}><b>{headline}</b></div>
          : <div className="results-paper"><span>THE NEO-AMRITSAR TIMES</span><b>{headline}</b></div>)}
        {headline && byline && <i className="results-byline">{byline}</i>}
        <dl className="results-stats">
          <div><dt>Time</dt><dd>{fmtTime(result.timeMs)}</dd></div>
          <div><dt>Style</dt><dd>{result.style.toLocaleString()}</dd></div>
          <div><dt>KOs</dt><dd>{result.kos}</dd></div>
          <div><dt>Party</dt><dd>{result.party.map(id => CREW[id].name).join(' · ')}</dd></div>
        </dl>
        <form className="results-form" onSubmit={submit}>
          <label htmlFor="player-name">Name on the board</label>
          <div className="results-row">
            <input id="player-name" value={name} maxLength={24} onChange={e => setName(e.target.value)} placeholder="Your name" disabled={state === 'sending' || state === 'sent'} onKeyDown={e => e.stopPropagation()} />
            <button type="submit" disabled={!name.trim() || state === 'sending' || state === 'sent'}>{state === 'sent' ? 'Posted' : state === 'sending' ? 'Posting…' : 'Post run'}</button>
          </div>
          {state === 'error' && <p className="results-error">{error}</p>}
        </form>
        {board && board.length > 0 && (
          <ol className="results-board">
            {board.map((r, i) => <li key={r.id}><span>{i + 1}</span><b>{r.player}</b><span>{fmtTime(r.timeMs)}</span><span>{r.style.toLocaleString()}</span></li>)}
          </ol>
        )}
        <div className="results-actions">
          <button className="results-retry" type="button" onClick={onRetry}>Run the episode again</button>
          <button className="results-retry" type="button" onClick={onQuit}>Back to title</button>
        </div>
      </div>
    </div>
  );
}
