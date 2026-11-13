import { useEffect, useRef, useState } from 'react';

export function PauseMenu({ onResume, onRestart, onQuit, muted, onMute }: {
  onResume: () => void; onRestart: () => void; onQuit: () => void; muted: boolean; onMute: () => boolean;
}) {
  const [isMuted, setMuted] = useState(muted);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => { first.current?.focus(); }, []);
  return (
    <div className="pause" role="dialog" aria-label="Paused">
      <div className="pause-card">
        <div className="pause-title">PAUSED</div>
        <button ref={first} type="button" onClick={onResume}>Resume</button>
        <button type="button" onClick={onRestart}>Restart room</button>
        <button type="button" onClick={() => setMuted(onMute())}>Sound: {isMuted ? 'off' : 'on'}</button>
        <button type="button" onClick={onQuit}>Quit to title</button>
      </div>
    </div>
  );
}
