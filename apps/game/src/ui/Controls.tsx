import { useEffect, useRef, useState } from 'react';
import { ACTIONS, bind, clearSlot, isDefault, keyLabel, resetScheme, slots, useKeybinds, KC, type Scheme } from '@/game/keybinds';

const TABS: { id: Scheme; name: string; note: string }[] = [
  { id: 'story', name: 'Story', note: 'Gamepads keep their standard layout.' },
  { id: 'p1', name: 'VERSUS · P1', note: 'P1 is you against the CPU and online. With nobody on P2, P2’s movement keys move you too.' },
  { id: 'p2', name: 'VERSUS · P2', note: 'P2 is the second player in Local 2P (same keyboard). P1 and P2 can’t share a key.' },
];
const label = (s: Scheme, id: string) => ACTIONS[s].find(a => a.id === id)?.label ?? id;
const tabName = (s: Scheme) => TABS.find(t => t.id === s)!.name;

/** Key bindings for Story and VERSUS. Opens over the title, the pause menu or the VERSUS menu. Saved in this browser. */
export function Controls({ initial = 'story', onClose }: { initial?: Scheme; onClose: () => void }) {
  useKeybinds();
  const [tab, setTab] = useState<Scheme>(initial);
  const [listen, setListen] = useState<{ action: string; slot: 0 | 1 } | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); }, []);

  // While open, this panel owns the keyboard: nothing reaches the title, the pause menu or the game underneath.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      e.stopImmediatePropagation();
      if (listen) {
        e.preventDefault();
        // Let go of the slot button, or the key's keyup (Space) would "click" it and start listening again.
        (document.activeElement as HTMLElement | null)?.blur();
        if (e.keyCode === KC.ESC) { setListen(null); setMsg(null); return; }
        if (e.keyCode === KC.BACKSPACE || e.keyCode === KC.DELETE) { clearSlot(tab, listen.action, listen.slot); setListen(null); setMsg(`${label(tab, listen.action)}: slot cleared.`); return; }
        const r = bind(tab, listen.action, listen.slot, e.keyCode);
        setListen(null);
        if (!r.ok) setMsg(`${keyLabel(e.keyCode)} is taken by the menus: ${r.why}.`);
        else if (r.took) setMsg(`${keyLabel(e.keyCode)} moved here from ${r.took.scheme === tab ? '' : `${tabName(r.took.scheme)} · `}${label(r.took.scheme, r.took.action)}, which lost it.`);
        else setMsg(`${label(tab, listen.action)} → ${keyLabel(e.keyCode)}`);
        return;
      }
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [listen, tab, onClose]);

  const t = TABS.find(x => x.id === tab)!;
  return (
    <div className="controls" role="dialog" aria-modal="true" aria-label="Controls">
      <div className="controls-card">
        <div className="controls-head">
          <span className="controls-eyebrow">Settings · Controls</span>
          <button ref={close} type="button" className="controls-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="controls-tabs" role="tablist">
          {TABS.map(x => (
            <button key={x.id} type="button" role="tab" aria-selected={tab === x.id} onClick={() => { setTab(x.id); setListen(null); setMsg(null); }}>{x.name}</button>
          ))}
        </div>
        <ul className="controls-list">
          {ACTIONS[tab].map(a => {
            const pair = slots(tab, a.id);
            return (
              <li key={a.id}>
                <span>{a.label}</span>
                {([0, 1] as const).map(i => {
                  const on = listen?.action === a.id && listen.slot === i;
                  return (
                    <button key={i} type="button" className={`controls-key${on ? ' is-listening' : ''}${pair[i] === null ? ' is-empty' : ''}`}
                      aria-label={`${a.label}, ${i === 0 ? 'main' : 'alternate'} key: ${on ? 'press a key' : keyLabel(pair[i] ?? null)}`}
                      onClick={() => { setListen(on ? null : { action: a.id, slot: i }); setMsg(null); }}>
                      {on ? 'press a key…' : keyLabel(pair[i] ?? null)}
                    </button>
                  );
                })}
              </li>
            );
          })}
        </ul>
        <p className="controls-note" aria-live="polite">{msg ?? (listen ? 'Press the new key · Backspace clears · Esc cancels' : `Click a key to change it. ${t.note}`)}</p>
        <div className="controls-actions">
          <button type="button" disabled={isDefault(tab)} onClick={() => { resetScheme(tab); setListen(null); setMsg(`${t.name} reset to the default keys.`); }}>Reset {t.name}</button>
          <button type="button" className="is-main" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
