// VERSUS lobby: mode (vs CPU / local 2P / online room) → character select → fight → result.
// Online: create a room, read the 4-letter code to your friend, they join, you both pick and ready up.
import { useEffect, useRef, useState } from 'react';
import { CREW_IDS, type CrewId } from '@qublox/shared';
import { MOVESETS, moveList, type LobbyPlayer } from '@qublox/shared/fight';
import { bus } from '@/game/bus';
import { CREW, hex } from '@/game/crew';
import { speak } from '@/game/voice';
import type { Portraits } from './DialogueBox';

type Mode = 'cpu' | 'local' | 'online';
type Lobby = { code: string; you: 0 | 1; players: (LobbyPlayer | null)[] };
type Match = { crews: [CrewId, CrewId]; names: [string, string]; seed: number };

const loadName = () => { try { return localStorage.getItem('qublox-name') ?? ''; } catch { return ''; } };

export function Versus({ portraits, winLines = {}, onBack }: { portraits: Portraits; winLines?: Partial<Record<CrewId, string[]>>; onBack: () => void }) {
  const [step, setStep] = useState<'menu' | 'select' | 'fight' | 'result'>('menu');
  const [mode, setMode] = useState<Mode>('cpu');
  const [name, setName] = useState(loadName);
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [picks, setPicks] = useState<[CrewId | null, CrewId | null]>([null, null]);
  const [cursor, setCursor] = useState<[number, number]>([0, 1]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const matchRef = useRef<Match | null>(null);
  matchRef.current = match;
  const [winner, setWinner] = useState<0 | 1 | null>(null);
  const sock = useRef<import('@/fight/net').VersusSocket | null>(null);

  const me = name.trim() || 'Player';
  useEffect(() => { try { localStorage.setItem('qublox-name', name); } catch { /* ignore */ } }, [name]);
  useEffect(() => () => sock.current?.close(), []);

  const online = async (action: 'create' | 'join') => {
    setMsg(null);
    const { VersusSocket } = await import('@/fight/net');
    sock.current?.close();
    const s = new VersusSocket();
    sock.current = s;
    s.on(m => {
      if (m.t === 'room') { setLobby({ code: m.code, you: m.you, players: m.players }); setStep(st => (st === 'menu' || st === 'result' ? 'select' : st)); }
      if (m.t === 'start') { setMatch({ crews: m.crews, names: m.names, seed: m.seed }); setStep('fight'); }
      if (m.t === 'left') { setMsg('Your opponent left the room.'); setStep('select'); }
      if (m.t === 'error') setMsg(m.message);
    });
    setMode('online');
    s.send(action === 'create' ? { t: 'create', name: me } : { t: 'join', code: code.trim().toUpperCase(), name: me });
  };

  const startLocal = (m: Mode) => { setMode(m); setPicks([null, m === 'cpu' ? CREW_IDS[Math.floor(Math.random() * CREW_IDS.length)]! : null]); setStep('select'); setMsg(null); };
  const go = (p: [CrewId, CrewId]) => { setMatch({ crews: p, names: [me, mode === 'cpu' ? 'CPU' : 'Player 2'], seed: Math.floor(Math.random() * 2 ** 31) }); setStep('fight'); };

  // Keyboard on the select screen (local/cpu): P1 A/D + J, P2 ←/→ + 1 (or Enter).
  useEffect(() => {
    if (step !== 'select' || mode === 'online') return;
    const n = CREW_IDS.length;
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === 'Escape') { setStep('menu'); return; }
      if (k === 'a' || k === 'A') setCursor(c => [(c[0] - 1 + n) % n, c[1]]);
      if (k === 'd' || k === 'D') setCursor(c => [(c[0] + 1) % n, c[1]]);
      if (k === 'j' || k === 'J') setPicks(p => [CREW_IDS[cursor[0]]!, p[1]]);
      if (mode === 'local') {
        if (k === 'ArrowLeft') setCursor(c => [c[0], (c[1] - 1 + n) % n]);
        if (k === 'ArrowRight') setCursor(c => [c[0], (c[1] + 1) % n]);
        if (k === '1' || k === 'Enter') setPicks(p => [p[0], CREW_IDS[cursor[1]]!]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, mode, cursor]);
  useEffect(() => { if (step === 'select' && mode !== 'online' && picks[0] && picks[1]) { const t = setTimeout(() => go([picks[0]!, picks[1]!]), 600); return () => clearTimeout(t); } }, [picks, step, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => bus.on('versusEnd', ({ winner: w, reason }) => { setWinner(w); if (w !== null && matchRef.current) speak(matchRef.current.crews[w], 'win'); if (reason === 'desync') setMsg('Desync detected: the two games disagreed. That\'s a bug; tell Claude.'); setStep('result'); }), []);

  const face = (id: CrewId) => {
    const p = portraits[id];
    if (!p) return { background: hex(CREW[id].color) };
    const k = p.emotions.length, i = Math.max(0, p.emotions.indexOf('smug'));
    return { backgroundImage: `url(/assets/${p.file})`, backgroundSize: `${k * 100}% 100%`, backgroundPosition: `${k > 1 ? (i / (k - 1)) * 100 : 0}% 0` };
  };

  if (step === 'fight' && match) return <FightHost match={match} mode={mode} you={lobby?.you ?? 0} sock={sock.current} onDesync={() => bus.emit('versusEnd', { winner: null, reason: 'desync' })} />;

  if (step === 'result' && match) {
    const w = winner;
    return (
      <div className="versus versus-result">
        <div className="studio-eyebrow">VERSUS · FINAL CUT</div>
        <h2>{w === null ? 'Draw.' : `${match.names[w]} wins`}</h2>
        {w !== null && <p className="versus-sub">as <b style={{ color: hex(CREW[match.crews[w]].color) }}>{CREW[match.crews[w]].name}</b></p>}
        {w !== null && (winLines[match.crews[w]]?.length ?? 0) > 0 && <p className="versus-quote">“{winLines[match.crews[w]]![match.seed % winLines[match.crews[w]]!.length]}”</p>}
        {msg && <p className="versus-msg">{msg}</p>}
        <div className="studio-actions">
          <button type="button" onClick={() => { if (mode === 'online') { sock.current?.send({ t: 'rematch' }); setStep('select'); } else go(match.crews); }}>Rematch</button>
          <button type="button" onClick={() => { if (mode === 'online') sock.current?.close(); setLobby(null); setStep('menu'); }}>Change mode</button>
          <button type="button" onClick={onBack}>Title</button>
        </div>
      </div>
    );
  }

  if (step === 'select') {
    const focus: CrewId = (mode === 'online' ? lobby?.players[lobby.you]?.crew : picks[0] && mode !== 'local' ? picks[0] : CREW_IDS[cursor[0]]) ?? CREW_IDS[cursor[0]]!;
    const mine = mode === 'online' && lobby ? lobby.players[lobby.you] : null;
    const theirs = mode === 'online' && lobby ? lobby.players[lobby.you === 0 ? 1 : 0] : null;
    const chosen: (CrewId | null)[] = mode === 'online' && lobby ? [lobby.players[0]?.crew ?? null, lobby.players[1]?.crew ?? null] : picks;
    return (
      <div className="versus">
        <div className="studio-head">
          <div className="studio-eyebrow">VERSUS · {mode === 'online' ? `ROOM ${lobby?.code ?? '…'}` : mode === 'cpu' ? 'VS CPU' : 'LOCAL 2P'} · CHARACTER SELECT</div>
          <h2>{mode === 'online' ? (theirs ? `${theirs.name} is here` : `Room code: ${lobby?.code ?? '…'}`) : 'Pick your fighter'}</h2>
          <p>{mode === 'online' ? (theirs ? 'Pick, then hit READY. The fight starts when you both are.' : 'Send this code to your friend. They choose VERSUS → JOIN and type it in.') : mode === 'local' ? 'P1: A/D + J · P2: ←/→ + 1 (or click)' : 'A/D + J (or click). The CPU picks at random.'}</p>
        </div>
        <div className="studio-grid">
          {CREW_IDS.map((id, i) => {
            const c = CREW[id], ms = MOVESETS[id];
            const p1 = chosen[0] === id, p2 = chosen[1] === id;
            const cur = mode !== 'online' && (cursor[0] === i || (mode === 'local' && cursor[1] === i));
            return (
              <button key={id} type="button" className={`studio-card${p1 || p2 ? ' is-on' : ''}${cur ? ' is-cursor' : ''}`} style={{ ['--crew' as string]: hex(c.color) }}
                onMouseEnter={() => setCursor(c => [i, c[1]])}
                onClick={() => {
                  if (mode === 'online') sock.current?.send({ t: 'pick', crew: id });
                  else if (!picks[0] || mode === 'cpu') setPicks(p => [id, p[1]]);
                  else setPicks(p => [p[0], id]);
                }}>
                <span className="studio-face" style={face(id)} />
                <span className="studio-name">{c.name}</span>
                <span className="studio-role">{ms.special.name}</span>
                <span className="studio-ability">{ms.super.name}</span>
                {(p1 || p2) && <span className="studio-slot">{p1 && p2 ? '1·2' : p1 ? '1' : '2'}</span>}
              </button>
            );
          })}
        </div>
        <MoveList crew={focus} />
        <div className="studio-foot">
          <p className="studio-quote">{msg ?? (mode === 'online' ? `${mine?.name ?? me}: ${mine?.crew ? CREW[mine.crew].name : '—'}${mine?.ready ? ' ✔' : ''}  ·  ${theirs ? `${theirs.name}: ${theirs.crew ? CREW[theirs.crew].name : '—'}${theirs.ready ? ' ✔' : ''}` : 'waiting for a challenger…'}` : '')}</p>
          <div className="studio-actions">
            <button type="button" onClick={() => { sock.current?.close(); setLobby(null); setStep('menu'); }}>Back</button>
            {mode === 'online' && <button type="button" className="is-go" disabled={!mine?.crew || !theirs} onClick={() => sock.current?.send({ t: 'ready', ready: !mine?.ready })}>{mine?.ready ? 'Not ready' : 'Ready'}</button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="versus">
      <div className="studio-head">
        <div className="studio-eyebrow">QUBLOX: FINAL CUT · VERSUS</div>
        <h2>1v1. Settle it.</h2>
        <p>Light <kbd>J</kbd> · heavy <kbd>K</kbd> · special <kbd>L</kbd> · super <kbd>I</kbd> (full meter) · block by holding <b>back</b>. First to 2 rounds.</p>
      </div>
      <div className="versus-menu">
        <label className="versus-field">Your name<input value={name} maxLength={16} placeholder="Player" onChange={e => setName(e.target.value)} /></label>
        <button type="button" onClick={() => startLocal('cpu')}>Vs CPU</button>
        <button type="button" onClick={() => startLocal('local')}>Local 2P <small>one keyboard / two pads</small></button>
        <button type="button" onClick={() => online('create')}>Create online room</button>
        <div className="versus-join">
          <input value={code} maxLength={4} placeholder="CODE" onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} onKeyDown={e => { if (e.key === 'Enter' && code.length === 4) online('join'); }} />
          <button type="button" disabled={code.length !== 4} onClick={() => online('join')}>Join room</button>
        </div>
        {msg && <p className="versus-msg">{msg}</p>}
      </div>
      <div className="studio-actions"><button type="button" onClick={onBack}>← Title</button></div>
    </div>
  );
}

/** Mounts the Phaser VERSUS game for one match. */
function FightHost({ match, mode, you, sock, onDesync }: { match: Match; mode: Mode; you: 0 | 1; sock: import('@/fight/net').VersusSocket | null; onDesync: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let game: { destroy: (b: boolean) => void } | null = null, cancelled = false;
    (async () => {
      try { await document.fonts.load('8px "Silkscreen"'); } catch { /* ignore */ }
      const [{ createVersus }, { LocalDriver }, { RollbackDriver }] = await Promise.all([import('@/fight/createVersus'), import('@/fight/FightScene'), import('@/fight/net')]);
      if (cancelled || !host.current) return;
      const driver = mode === 'online' && sock ? new RollbackDriver(sock, you, match.crews, match.seed, onDesync) : new LocalDriver(match.crews, match.seed, mode === 'cpu' ? 1 : null);
      game = createVersus(host.current, { driver, names: match.names, mode }, match.seed % 5);
    })();
    return () => { cancelled = true; game?.destroy(true); };
  }, [match]); // eslint-disable-line react-hooks/exhaustive-deps
  const [list, setList] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      setList(v => {
        const g = (window as unknown as { __versus?: { scene: { pause: (k: string) => void; resume: (k: string) => void } } }).__versus;
        if (mode !== 'online') { if (!v) g?.scene.pause('fight'); else g?.scene.resume('fight'); }   // online can't pause
        return !v;
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode]);
  return (
    <>
      <div ref={host} className="canvas-host" />
      {list && (
        <div className="versus-movelist-overlay">
          <div className="studio-eyebrow">MOVE LIST · TAB to close{mode === 'online' ? ' · the fight keeps going online!' : ' · paused'}</div>
          <div className="versus-movelist-pair">{match.crews.map((c, i) => <MoveList key={i} crew={c} title={`${match.names[i]} · ${CREW[c].name}`} />)}</div>
        </div>
      )}
      <div className="versus-strip"><span><kbd>A</kbd><kbd>D</kbd> move</span><span><kbd>W</kbd> jump</span><span><kbd>S</kbd> crouch</span><span><kbd>J</kbd> light</span><span><kbd>K</kbd> heavy</span><span><kbd>L</kbd> special</span><span><kbd>I</kbd> super</span><span><kbd>U</kbd> block / parry</span><span><kbd>Tab</kbd> move list</span>{mode === 'local' && <span>P2: arrows · <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>0</kbd> · <kbd>4</kbd> block</span>}</div>
    </>
  );
}

/** One fighter's move list (select screen + Tab overlay). */
function MoveList({ crew, title }: { crew: CrewId; title?: string }) {
  return (
    <div className="versus-movelist" style={{ ['--crew' as string]: hex(CREW[crew].color) }}>
      <div className="versus-movelist-head">{title ?? `${CREW[crew].name} · moves`}</div>
      <ul>{moveList(crew).map(m => <li key={m.input + m.name}><kbd>{m.input}</kbd><b>{m.name}</b><span>{m.note}</span></li>)}</ul>
    </div>
  );
}
