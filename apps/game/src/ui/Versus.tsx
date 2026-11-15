// VERSUS lobby: mode (vs CPU / local 2P / online room) → character select → fight → result.
// Online: create a room, read the 4-letter code to your friend, they join, you both pick and ready up.
import { matchLine } from '@/fight/lines';
import { useEffect, useRef, useState } from 'react';
import { CREW_IDS, type CrewId } from '@qublox/shared';
import { MOVESETS, moveList, type LobbyPlayer } from '@qublox/shared/fight';
import { bus } from '@/game/bus';
import { useSession } from '@/game/account';
import { CREW, hex } from '@/game/crew';
import { speak } from '@/game/voice';
import type { Portraits } from './DialogueBox';
import { Controls } from './Controls';
import { codes, fightKeys, key, useKeybinds, type Scheme } from '@/game/keybinds';

const K = (s: Scheme, a: string) => <kbd>{key(s, a)}</kbd>;

type Mode = 'cpu' | 'local' | 'online';
type Lobby = { code: string; you: 0 | 1; players: (LobbyPlayer | null)[] };
type Match = { crews: [CrewId, CrewId]; names: [string, string]; seed: number };

const loadName = () => { try { return localStorage.getItem('qublox-name') ?? ''; } catch { return ''; } };

export function Versus({ portraits, winLines = {}, onBack }: { portraits: Portraits; winLines?: Partial<Record<CrewId, string[]>>; onBack: () => void }) {
  useKeybinds();
  const [controls, setControls] = useState(false);
  const [step, setStep] = useState<'menu' | 'select' | 'fight' | 'result'>('menu');
  const [mode, setMode] = useState<Mode>('cpu');
  const [name, setName] = useState(loadName);
  // Signed in and never typed a name: use the account's.
  const { data: session } = useSession();
  useEffect(() => { if (!name.trim() && session?.user.name) setName(session.user.name.slice(0, 16)); }, [session?.user.name]); // eslint-disable-line react-hooks/exhaustive-deps
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [picks, setPicks] = useState<[CrewId | null, CrewId | null]>([null, null]);
  const [cursor, setCursor] = useState<[number, number]>([0, 1]);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const matchRef = useRef<Match | null>(null);
  const [finisher, setFinisher] = useState<string | null>(null);
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
    const build = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || undefined;
    s.send(action === 'create' ? { t: 'create', name: me, build } : { t: 'join', code: code.trim().toUpperCase(), name: me, build });
  };

  const startLocal = (m: Mode) => { setMode(m); setPicks([null, m === 'cpu' ? CREW_IDS[Math.floor(Math.random() * CREW_IDS.length)]! : null]); setStep('select'); setMsg(null); };
  const go = (p: [CrewId, CrewId]) => { setMatch({ crews: p, names: [me, mode === 'cpu' ? 'CPU' : 'Player 2'], seed: Math.floor(Math.random() * 2 ** 31) }); setStep('fight'); };

  // Keyboard on the select screen (local/cpu): P1 A/D + J, P2 ←/→ + 1 (or Enter).
  useEffect(() => {
    if (step !== 'select' || mode === 'online') return;
    const n = CREW_IDS.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setStep('menu'); return; }
      const is = (s: Scheme, a: string) => codes(s, a).includes(e.keyCode);
      // P1 browses with their move keys and picks with light. P2 (local) does the same with theirs, or Enter.
      if (is('p1', 'left')) setCursor(c => [(c[0] - 1 + n) % n, c[1]]);
      else if (is('p1', 'right')) setCursor(c => [(c[0] + 1) % n, c[1]]);
      else if (is('p1', 'light')) setPicks(p => [CREW_IDS[cursor[0]]!, p[1]]);
      else if (mode === 'local') {
        if (is('p2', 'left')) setCursor(c => [c[0], (c[1] - 1 + n) % n]);
        else if (is('p2', 'right')) setCursor(c => [c[0], (c[1] + 1) % n]);
        else if (is('p2', 'light') || e.key === 'Enter') setPicks(p => [p[0], CREW_IDS[cursor[1]]!]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, mode, cursor]);
  useEffect(() => { if (step === 'select' && mode !== 'online' && picks[0] && picks[1]) { const t = setTimeout(() => go([picks[0]!, picks[1]!]), 600); return () => clearTimeout(t); } }, [picks, step, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => bus.on('versusEnd', ({ winner: w, reason, finisher: fin }) => { setWinner(w); setFinisher(fin ?? null); if (w !== null && matchRef.current) speak(matchRef.current.crews[w], 'win'); if (reason === 'desync') setMsg('Desync detected: the two games disagreed. That\'s a bug; tell Claude.'); setStep('result'); }), []);

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
        {finisher && <p className="versus-finisher">FINAL CUT · {finisher}</p>}
        {w !== null && (() => { const q = matchLine(winLines[match.crews[w]], match.crews[w], match.crews[w === 0 ? 1 : 0], match.seed); return q && <p className="versus-quote">“{q}”</p>; })()}
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
        <p>Light {K('p1', 'light')} · heavy {K('p1', 'heavy')} · special {K('p1', 'special')} · super {K('p1', 'super')} (full meter) · block {K('p1', 'block')} (tap it just before a hit to parry). First to 2 rounds.</p>
      </div>
      <div className="versus-menu">
        <label className="versus-field">Your name<input value={name} maxLength={16} placeholder="Player" onChange={e => setName(e.target.value)} /></label>
        <button type="button" onClick={() => startLocal('cpu')}>Vs CPU</button>
        <button type="button" onClick={() => startLocal('local')}>Local 2P <small>one keyboard / two pads</small></button>
        <button type="button" onClick={() => online('create')}>Create online room</button>
        <button type="button" onClick={() => setControls(true)}>Controls <small>rebind P1 / P2 keys</small></button>
        <div className="versus-join">
          <input value={code} maxLength={4} placeholder="CODE" onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} onKeyDown={e => { if (e.key === 'Enter' && code.length === 4) online('join'); }} />
          <button type="button" disabled={code.length !== 4} onClick={() => online('join')}>Join room</button>
        </div>
        {msg && <p className="versus-msg">{msg}</p>}
      </div>
      <div className="studio-actions"><button type="button" onClick={onBack}>← Title</button></div>
      {controls && <Controls initial="p1" onClose={() => setControls(false)} />}
    </div>
  );
}

/** Mounts the Phaser VERSUS game for one match. */
function FightHost({ match, mode, you, sock, onDesync }: { match: Match; mode: Mode; you: 0 | 1; sock: import('@/fight/net').VersusSocket | null; onDesync: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let game: { destroy: (b: boolean) => void } | null = null, cancelled = false, drv: { dispose?: () => void } | null = null;
    (async () => {
      try { await document.fonts.load('8px "Silkscreen"'); } catch { /* ignore */ }
      const [{ createVersus }, { LocalDriver }, { RollbackDriver }] = await Promise.all([import('@/fight/createVersus'), import('@/fight/FightScene'), import('@/fight/net')]);
      if (cancelled || !host.current) return;
      const driver = mode === 'online' && sock ? new RollbackDriver(sock, you, match.crews, match.seed, onDesync) : new LocalDriver(match.crews, match.seed, mode === 'cpu' ? 1 : null);
      drv = driver as { dispose?: () => void };
      game = createVersus(host.current, { driver, names: match.names, mode }, match.seed % 5);
    })();
    return () => { cancelled = true; drv?.dispose?.(); game?.destroy(true); };
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
      <div className="versus-strip"><span>{K('p1', 'left')}{K('p1', 'right')} move</span><span>{K('p1', 'up')} jump</span><span>{K('p1', 'down')} crouch</span><span>{K('p1', 'light')} light</span><span>{K('p1', 'heavy')} heavy</span><span>{K('p1', 'special')} special</span><span>{K('p1', 'super')} super</span><span>{K('p1', 'block')} block / parry</span><span><kbd>Tab</kbd> move list</span>{mode === 'local' && <span>P2: {K('p2', 'left')}{K('p2', 'right')}{K('p2', 'up')}{K('p2', 'down')} · {K('p2', 'light')}{K('p2', 'heavy')}{K('p2', 'special')}{K('p2', 'super')} · {K('p2', 'block')} block</span>}</div>
    </>
  );
}

/** One fighter's move list (select screen + Tab overlay). */
function MoveList({ crew, title }: { crew: CrewId; title?: string }) {
  return (
    <div className="versus-movelist" style={{ ['--crew' as string]: hex(CREW[crew].color) }}>
      <div className="versus-movelist-head">{title ?? `${CREW[crew].name} · moves`}</div>
      <ul>{moveList(crew).map(m => <li key={m.input + m.name}><kbd>{fightKeys(m.input)}</kbd><b>{m.name}</b><span>{fightKeys(m.note)}</span></li>)}</ul>
    </div>
  );
}
