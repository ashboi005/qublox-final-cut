import { useEffect, useRef, useState } from 'react';
import type { LeaderboardRow, RunSubmit } from '@qublox/shared';
import { API, parkRun, postRun, useSession } from '@/game/account';
import { AccountPanel } from './Account';
import type { RunResult } from '@/game/bus';
import { CREW } from '@/game/crew';
import { fmtTime } from './Hud';

export function Results({ result, headline, byline, paper, onRetry, onQuit }: { result: RunResult; headline: string | null; byline?: string | null; paper?: string | null; onRetry: () => void; onQuit: () => void }) {
  const { data: session } = useSession();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [board, setBoard] = useState<LeaderboardRow[] | null>(null);
  const [signIn, setSignIn] = useState(false);
  const run: RunSubmit = { episode: result.episode, timeMs: result.timeMs, style: result.style, kos: result.kos, party: result.party };

  const loadBoard = async () => {
    try {
      const r = await fetch(`${API}/leaderboard?episode=${result.episode}&by=time&limit=8`);
      if (r.ok) setBoard((await r.json()) as LeaderboardRow[]);
    } catch { setBoard(null); }
  };
  useEffect(() => { void loadBoard(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    setState('sending');
    try { await postRun(run); setState('sent'); void loadBoard(); }
    catch (err) { setState('error'); setError((err as Error).message); }
  };
  // Signed in from this screen with email: post straight away, that's what they came for.
  const wanted = useRef(false);
  useEffect(() => { if (session && wanted.current && state === 'idle') { wanted.current = false; setSignIn(false); void submit(); } }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="results-form">
          {session ? (
            <div className="results-row">
              <button type="button" onClick={() => void submit()} disabled={state === 'sending' || state === 'sent'}>
                {state === 'sent' ? 'Posted' : state === 'sending' ? 'Posting…' : `Post run as ${session.user.name || session.user.email}`}
              </button>
            </div>
          ) : (
            <div className="results-row">
              <button type="button" onClick={() => { wanted.current = true; setSignIn(true); }}>Sign in to post this run</button>
            </div>
          )}
          {state === 'error' && <p className="results-error">{error}</p>}
        </div>
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
      {signIn && <AccountPanel reason="Sign in (or make an account) to put this run on the leaderboard. It posts as soon as you're in." beforeRedirect={() => parkRun(run)} onClose={() => { wanted.current = false; setSignIn(false); }} />}
    </div>
  );
}
