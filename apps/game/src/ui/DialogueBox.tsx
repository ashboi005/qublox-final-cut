import { useCallback, useEffect, useState } from 'react';
import { isCrewId, type Dialogue } from '@qublox/shared';
import { CREW, hex } from '@/game/crew';

const CPS = 55; // typewriter characters per second

export type Portraits = Record<string, { file: string; size: number; emotions: string[] }>;

export function DialogueBox({ dialogue, portraits, onDone }: { dialogue: Dialogue & { names?: Record<string, string>; present?: string[] }; portraits: Portraits; onDone: () => void }) {
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(0);
  const line = dialogue.lines[i]!;
  const full = shown >= line.text.length;

  useEffect(() => {
    setShown(0);
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const n = Math.floor(((performance.now() - start) / 1000) * CPS);
      setShown(Math.min(n, line.text.length));
      if (n < line.text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [line]);

  const advance = useCallback(() => {
    if (!full) { setShown(line.text.length); return; }
    if (i + 1 < dialogue.lines.length) setI(i + 1); else onDone();
  }, [full, i, line, dialogue.lines.length, onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (['Enter', ' ', 'j', 'J'].includes(e.key)) { e.preventDefault(); advance(); }
      if (e.key === 'Escape') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, onDone]);

  const crew = isCrewId(line.speaker) ? CREW[line.speaker] : null;
  const name = crew?.name ?? (line.speaker === 'narrator' ? '' : dialogue.names?.[line.speaker] ?? line.speaker.replace(/-/g, ' ').toUpperCase());
  const color = crew ? hex(crew.color) : '#8a8b94';
  const comms = !!crew && !!dialogue.present && !dialogue.present.includes(line.speaker);
  const sheet = portraits[line.speaker];
  const frames = sheet?.emotions.length ?? 1;
  const frame = Math.max(0, sheet?.emotions.indexOf(line.emotion ?? 'neutral') ?? 0);
  const art = sheet ? {
    backgroundImage: `url(/assets/${sheet.file})`,
    backgroundSize: `${frames * 100}% 100%`,
    backgroundPosition: `${frames > 1 ? (frame / (frames - 1)) * 100 : 0}% 0`,
  } : null;

  return (
    <div className={`dialogue${line.speaker === 'narrator' ? ' is-narrator' : ''}`} onClick={advance} role="dialog" aria-live="polite">
      {line.speaker !== 'narrator' && (
        <div className={`dialogue-portrait${art ? ' has-art' : ''}${comms ? ' is-comms' : ''}`} style={art ?? { background: color }}>
          {!art && <span>{(crew?.name ?? line.speaker)[0]?.toUpperCase()}</span>}
          {line.emotion && !art && <em>{line.emotion}</em>}
        </div>
      )}
      <div className="dialogue-body">
        {name && <div className="dialogue-name">{name}{comms && <small className="dialogue-comms">ON COMMS</small>}</div>}
        <p className="dialogue-text">{line.text.slice(0, shown)}</p>
        <div className="dialogue-next">{full ? (i + 1 < dialogue.lines.length ? '▶ ENTER' : '■ ENTER') : ''} <span>ESC skip</span></div>
      </div>
    </div>
  );
}
