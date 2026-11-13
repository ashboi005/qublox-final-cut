'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CrewId, Dialogue } from '@qublox/shared';
import { bus, type HudState, type RunResult } from '@/game/bus';
import { synth } from '@/game/audio/synth';
import { Hud } from './Hud';
import { DialogueBox, type Portraits } from './DialogueBox';
import { Results } from './Results';
import { Title, type Episode } from './Title';
import { Leaderboard } from './Leaderboard';
import { PauseMenu } from './PauseMenu';
import { Studio } from './Studio';
import { Credits, type CreditLine } from './Credits';

type Manifest = { portraits?: Portraits; images?: Record<string, { file: string }> };
type Content = { levels: Record<string, string>; songs?: Record<string, unknown>; story: { quips?: { taglines?: string[]; headlines?: Record<string, string[]> }; credits?: { roll?: CreditLine[] } }; barks: Record<string, { barks?: Record<string, string[]> }> };
type Screen = { kind: 'title' } | { kind: 'board' } | { kind: 'studio'; ep: Episode } | { kind: 'play'; level: string; party: CrewId[]; run: number };

// pool = who you can cast; pick = how many you choose; joiners = who joins during the episode (story).
const EPISODES: Episode[] = [
  { n: 0, name: 'Cold Open', place: 'Qublox HQ', start: 'ep0-r01' },
  { n: 1, name: 'Render Farm', place: 'The Server Towers', start: 'ep1-r01', pool: ['ashwath', 'sayam', 'tushar'], pick: 2, joiners: ['sehaj'] },
  { n: 2, name: 'The Set', place: 'Abandoned Film Studio', start: 'ep2-r01', pool: ['ashwath', 'sayam', 'tushar', 'sehaj'], pick: 1, joiners: ['mansukh', 'manya'] },
  { n: 3, name: 'The Feed', place: 'Infinite-Scroll Tower', start: 'ep3-r01', pool: ['ashwath', 'sayam', 'tushar', 'sehaj', 'mansukh', 'manya'], pick: 2, joiners: ['brahmansh'] },
  { n: 4, name: 'Templatr HQ', place: 'The Beige Monolith', start: 'ep4-r01', pool: ['ashwath', 'sayam', 'tushar', 'sehaj', 'mansukh', 'manya', 'brahmansh'], pick: 3, joiners: [] },
];

/** `direct` = the URL named a level, so skip the title (handy for dev and for agents testing). */
export default function GameShell({ level, party, direct }: { level: string; party: CrewId[]; direct: boolean }) {
  const [screen, setScreen] = useState<Screen>(direct ? { kind: 'play', level, party, run: 0 } : { kind: 'title' });
  const [manifest, setManifest] = useState<Manifest>({});
  const [content, setContent] = useState<Content | null>(null);

  useEffect(() => {
    fetch('/assets/manifest.json').then(r => (r.ok ? r.json() : {})).then(m => setManifest(m as Manifest)).catch(() => {});
    fetch('/api/content').then(r => r.json()).then(c => setContent(c as Content)).catch(() => {});
  }, []);

  // Audio can only start after a user gesture.
  useEffect(() => {
    const unlock = () => synth.unlock();
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
    return () => { window.removeEventListener('keydown', unlock); window.removeEventListener('pointerdown', unlock); };
  }, []);

  // Title theme on the menus.
  useEffect(() => {
    if (screen.kind !== 'play' && content?.songs?.title) synth.play(content.songs.title);
  }, [screen.kind, content]);

  const img = (key: string) => (manifest.images?.[key] ? `/assets/${manifest.images[key]!.file}` : null);

  return (
    <main className="stage">
      <div className="screen">
        {screen.kind === 'play' ? (
          <Play key={`${screen.level}|${screen.party.join(',')}|${screen.run}`} level={screen.level} party={screen.party} portraits={manifest.portraits ?? {}}
            credits={content?.story.credits?.roll ?? []} creditsSong={content?.songs?.credits} logo={img('logo')}
            headlines={content?.story.quips?.headlines ?? {}}
            onQuit={() => setScreen({ kind: 'title' })}
            onReplay={() => setScreen({ ...screen, run: screen.run + 1 })} />
        ) : screen.kind === 'studio' ? (
          <Studio
            episode={screen.ep} pool={screen.ep.pool ?? []} pick={screen.ep.pick ?? 3} joiners={screen.ep.joiners ?? []}
            portraits={manifest.portraits ?? {}}
            selectLines={Object.fromEntries(Object.entries(content?.barks ?? {}).map(([id, b]) => [id, b.barks?.select ?? []]))}
            onGo={party => setScreen({ kind: 'play', level: screen.ep.start, party, run: 0 })}
            onBack={() => setScreen({ kind: 'title' })}
          />
        ) : screen.kind === 'board' ? (
          <Leaderboard episodes={EPISODES} onBack={() => setScreen({ kind: 'title' })} />
        ) : (
          <Title
            logo={img('logo')} background={img('title-bg')}
            taglines={content?.story.quips?.taglines ?? []}
            episodes={EPISODES.map(e => ({ ...e, locked: !content?.levels[e.start] }))}
            onPlay={ep => setScreen(ep.pick ? { kind: 'studio', ep } : { kind: 'play', level: ep.start, party: [], run: 0 })}
            onBoard={() => setScreen({ kind: 'board' })}
          />
        )}
      </div>
      <footer className="legend">
        <span><kbd>A</kbd><kbd>D</kbd> move</span>
        <span><kbd>Space</kbd> jump</span>
        <span><kbd>J</kbd> attack</span>
        <span><kbd>K</kbd> ability</span>
        <span><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd> / <kbd>Q</kbd><kbd>E</kbd> swap</span>
        <span><kbd>F</kbd> talk</span>
        <span><kbd>Esc</kbd> pause</span>
        <span><kbd>M</kbd> mute</span>
        <span><kbd>F2</kbd> sprite viewer</span>
      </footer>
    </main>
  );
}

const pickHeadline = (h: Record<string, string[]>, ep: number) => { const l = h[String(ep)] ?? []; return l.length ? l[Math.floor(Math.random() * l.length)]! : null; };

type GameHandle = { destroy(removeCanvas: boolean): void; scene: { pause(k: string): void; resume(k: string): void } };

function Play({ level, party, portraits, credits, creditsSong, logo, headlines, onQuit, onReplay }: {
  level: string; party: CrewId[]; portraits: Portraits; credits: CreditLine[]; creditsSong: unknown; logo: string | null;
  headlines: Record<string, string[]>; onQuit: () => void; onReplay: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const game = useRef<GameHandle | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [dialogue, setDialogue] = useState<(Dialogue & { names?: Record<string, string> }) | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [viewer, setViewer] = useState(false);
  const [paused, setPaused] = useState(false);
  const [beige, setBeige] = useState(0);
  const [rolling, setRolling] = useState(false);
  const creditsSongRef = useRef(creditsSong);
  creditsSongRef.current = creditsSong;
  // Mashing Esc to skip dialogue shouldn't spill over into the pause menu.
  const dialogueClosedAt = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const offs = [
      bus.on('hud', setHud),
      bus.on('dialogueStart', setDialogue),
      bus.on('levelComplete', r => { setResult(r); if (r.episode === 4) { setRolling(true); if (creditsSongRef.current) synth.play(creditsSongRef.current); } }),
      bus.on('viewer', ({ open }) => setViewer(open)),
      bus.on('beige', ({ amount }) => setBeige(amount)),
      bus.on('toast', ({ text }) => { setToast(text); window.setTimeout(() => setToast(t => (t === text ? null : t)), 2600); }),
    ];
    (async () => {
      // Phaser draws text with the pixel font, so it must be ready before the first frame.
      try { await document.fonts.load('8px "Silkscreen"'); } catch { /* falls back to monospace */ }
      const { createGame } = await import('@/game/createGame');
      if (!cancelled && host.current) game.current = createGame(host.current, { level, party }) as unknown as GameHandle;
    })();
    return () => { cancelled = true; offs.forEach(off => off()); game.current?.destroy(true); game.current = null; synth.stop(); };
  }, [level, party]);

  const setPause = useCallback((p: boolean) => {
    const g = game.current;
    if (!g) return;
    if (p) g.scene.pause('game'); else g.scene.resume('game');
    setPaused(p);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || dialogue || result || viewer) return;
      if (performance.now() - dialogueClosedAt.current < 600) return;
      setPause(!paused);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialogue, result, viewer, paused, setPause]);

  return (
    <>
      <div ref={host} className="canvas-host" />
      {hud && !viewer && <Hud state={hud} beige={beige} />}
      {toast && !viewer && <div className="toast">{toast}</div>}
      {dialogue && (
        <DialogueBox key={dialogue.id} dialogue={dialogue} portraits={portraits} onDone={() => {
          // Clear first: ending one scene can synchronously start the next one.
          setDialogue(null);
          dialogueClosedAt.current = performance.now();
          bus.emit('dialogueEnd', { id: dialogue.id });
        }} />
      )}
      {paused && (
        <PauseMenu
          onResume={() => setPause(false)}
          onRestart={() => { setPause(false); bus.emit('restart'); }}
          onQuit={onQuit}
          muted={synth.muted}
          onMute={() => synth.toggleMute()}
        />
      )}
      {result && rolling && <Credits roll={credits} logo={logo} onDone={() => setRolling(false)} />}
      {result && !rolling && <Results result={result} headline={pickHeadline(headlines, result.episode)} onRetry={onReplay} onQuit={onQuit} />}
    </>
  );
}
