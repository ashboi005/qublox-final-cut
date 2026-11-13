import type { CSSProperties } from 'react';
import type { HudState } from '@/game/bus';

export const fmtTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}.${String(Math.floor((ms % 1000) / 10)).padStart(2, '0')}`;
};

export function Hud({ state, beige = 0 }: { state: HudState; beige?: number }) {
  return (
    // During the finale BEIGE "standardizes" the HUD: system fonts, no colour. STYLE pushes it back.
    <div className={`hud${beige >= 0.3 ? ' is-beige' : ''}`} aria-hidden="true">
      <div className="hud-time">{fmtTime(state.timeMs)}</div>
      <div className={`hud-style rank-${state.style.rank.toLowerCase()}`}>
        <span className="hud-style-label">STYLE</span>
        <span className="hud-style-rank">{state.style.rank}</span>
        <span className="hud-style-bar"><i style={{ width: `${state.style.meter}%` }} /></span>
        <span className="hud-style-score">{state.style.score.toLocaleString()}</span>
      </div>
      {state.boss && (
        <div className={`hud-boss${state.boss.shielded ? ' is-shielded' : ''}`}>
          <span className="hud-boss-name">{state.boss.name}{state.boss.shielded ? ' · SHIELDED' : ''}</span>
          <span className="hud-boss-bar"><i style={{ width: `${(state.boss.hp / state.boss.maxHp) * 100}%` }} /></span>
        </div>
      )}
      {state.hint && <div className="hud-hint">{state.hint}</div>}
      <div className="hud-party">
        {state.party.map((m, i) => (
          <div key={m.id} className={`crew${m.active ? ' is-active' : ''}${m.ko ? ' is-ko' : ''}`} style={{ '--crew': m.color } as CSSProperties}>
            <span className="crew-key">{i + 1}</span>
            <span className="crew-name">{m.name}</span>
            <span className="crew-class">{m.ko ? 'KO' : m.className}</span>
            <span className="crew-hp"><i style={{ width: `${(m.hp / m.maxHp) * 100}%` }} /></span>
            <span className={`crew-ability${m.cooldown === 0 ? ' is-ready' : ''}`}>
              <i style={{ width: `${(1 - m.cooldown) * 100}%` }} />
              <b>{m.abilityName}</b>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
