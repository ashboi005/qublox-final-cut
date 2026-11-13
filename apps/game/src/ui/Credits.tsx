import { useEffect, useRef } from 'react';

export type CreditLine = { role: string; name: string };

/** End credits after the finale: Gemini's roll scrolls up, Astra's credits theme plays. Any key skips. */
export function Credits({ roll, logo, onDone }: { roll: CreditLine[]; logo: string | null; onDone: () => void }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const ms = Math.max(14000, roll.length * 1100);
    const t = window.setTimeout(() => done.current(), ms);
    let armed = false;
    const arm = window.setTimeout(() => { armed = true; }, 1200);
    const skip = () => { if (armed) done.current(); };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => { window.clearTimeout(t); window.clearTimeout(arm); window.removeEventListener('keydown', skip); window.removeEventListener('pointerdown', skip); };
  }, [roll.length]);

  return (
    <div className="credits" role="dialog" aria-label="Credits">
      <div className="credits-roll" style={{ animationDuration: `${Math.max(14, roll.length * 1.1)}s` }}>
        {logo && <img src={logo} alt="QUBLOX: FINAL CUT" className="credits-logo" />}
        <p className="credits-lead">The Final Cut was delivered at 8:59 AM.</p>
        {roll.map((c, i) => (
          <div key={i} className="credits-line"><span>{c.role}</span><b>{c.name}</b></div>
        ))}
        <p className="credits-lead">Made by the Qublox crew, with Claude, Astra and Gemini.<br />Neo-Amritsar, 2084.</p>
      </div>
      <p className="credits-skip">any key to skip</p>
    </div>
  );
}
