import { useEffect, useRef, useState } from 'react';
import { authClient, postParkedRun, serverConfig, setSignedIn, syncSave, useSession, type ServerConfig } from '@/game/account';

type User = { id: string; name: string; email: string };

/** Mount once (GameShell): keeps the cloud save in step with the session and posts a run parked before a
 *  Google/Discord redirect. `onNotice` shows a line on screen ("Run posted…"). */
export function useAccountSync(onNotice: (text: string) => void) {
  const { data } = useSession();
  const id = data?.user.id ?? null;
  const notice = useRef(onNotice);
  notice.current = onNotice;
  useEffect(() => {
    setSignedIn(!!id);
    if (!id) return;
    void (async () => {
      await syncSave();
      const posted = await postParkedRun();
      if (posted) notice.current(`Run posted to the EP${posted.episode} leaderboard as ${posted.player}.`);
    })();
  }, [id]);
}

/** Small "who am I" button for the title screen corner. */
export function AccountChip({ onOpen }: { onOpen: () => void }) {
  const { data, isPending } = useSession();
  if (isPending) return null;
  return (
    <button type="button" className={`account-chip${data ? ' is-in' : ''}`} onClick={onOpen}>
      {data ? <><i aria-hidden="true" />{data.user.name || data.user.email}</> : 'Sign in'}
    </button>
  );
}

/** Sign in / create account / signed-in summary. `beforeRedirect` runs before Google/Discord leave the page. */
export function AccountPanel({ onClose, beforeRedirect, reason }: { onClose: () => void; beforeRedirect?: () => void; reason?: string }) {
  const { data, isPending, refetch } = useSession();
  const [cfg, setCfg] = useState<ServerConfig | null | undefined>(undefined);
  useEffect(() => { void serverConfig().then(setCfg); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); onClose(); } };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="account" role="dialog" aria-modal="true" aria-label="Account" onKeyDown={e => e.stopPropagation()}>
      <div className="account-card">
        <div className="account-head">
          <span className="account-eyebrow">Crew ID</span>
          <button type="button" className="account-x" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {isPending || cfg === undefined ? <p className="account-note">Checking the guest list…</p>
          : data ? <SignedIn user={data.user} onClose={onClose} onRenamed={() => void refetch()} />
          : !cfg?.accounts ? <p className="account-note is-err">Accounts are offline right now (the game server or its database isn&apos;t reachable). You can keep playing; progress stays in this browser.</p>
          : <SignedOut cfg={cfg} reason={reason} beforeRedirect={beforeRedirect} />}
      </div>
    </div>
  );
}

function SignedOut({ cfg, reason, beforeRedirect }: { cfg: ServerConfig; reason?: string; beforeRedirect?: () => void }) {
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const social = async (provider: 'google' | 'discord') => {
    setBusy(true); setError('');
    beforeRedirect?.();
    const { error: err } = await authClient.signIn.social({ provider, callbackURL: window.location.href, errorCallbackURL: window.location.href });
    if (err) { setBusy(false); setError(err.message ?? 'Sign-in failed.'); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const { error: err } = mode === 'up'
      ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
      : await authClient.signIn.email({ email: email.trim(), password });
    setBusy(false);
    if (err) setError(err.message ?? 'That didn\'t work.');
  };

  const socials = (['google', 'discord'] as const).filter(p => cfg.providers[p]);
  return (
    <>
      <p className="account-lede">{reason ?? 'Sign in to post runs on the leaderboard and keep your progress and achievements on every device.'}</p>
      {socials.length > 0 && (
        <div className="account-social">
          {socials.map(p => (
            <button key={p} type="button" className={`account-btn is-${p}`} disabled={busy} onClick={() => void social(p)}>
              Continue with {p === 'google' ? 'Google' : 'Discord'}
            </button>
          ))}
        </div>
      )}
      {socials.length > 0 && <div className="account-or"><span>or</span></div>}
      <div className="account-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={mode === 'in'} onClick={() => { setMode('in'); setError(''); }}>Sign in</button>
        <button type="button" role="tab" aria-selected={mode === 'up'} onClick={() => { setMode('up'); setError(''); }}>Create account</button>
      </div>
      <form className="account-form" onSubmit={submit}>
        {mode === 'up' && (
          <label>Name on the board
            <input value={name} onChange={e => setName(e.target.value)} maxLength={24} required autoComplete="nickname" placeholder="What the crew calls you" />
          </label>
        )}
        <label>Email
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>Password
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoComplete={mode === 'up' ? 'new-password' : 'current-password'} />
        </label>
        {error && <p className="account-note is-err">{error}</p>}
        <button type="submit" className="account-btn is-main" disabled={busy}>{busy ? '…' : mode === 'up' ? 'Create account' : 'Sign in'}</button>
      </form>
    </>
  );
}

function SignedIn({ user, onClose, onRenamed }: { user: User; onClose: () => void; onRenamed: () => void }) {
  const [name, setName] = useState(user.name);
  const [saved, setSaved] = useState<string>('Syncing…');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void syncSave().then(s => setSaved(s ? `Synced ✓ · ${s.cleared.length} episode${s.cleared.length === 1 ? '' : 's'} cleared · ${Object.keys(s.achievements.unlocked).length} achievements` : 'Couldn\'t reach the server; will retry.'));
  }, []);

  const rename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim() === user.name) return;
    setBusy(true);
    await authClient.updateUser({ name: name.trim() });
    setBusy(false);
    onRenamed();
  };

  return (
    <>
      <p className="account-lede">Signed in as <b>{user.name || user.email}</b><span className="account-email">{user.email}</span></p>
      <form className="account-form is-row" onSubmit={rename}>
        <label>Name on the board
          <span className="account-row">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={24} required />
            <button type="submit" className="account-btn" disabled={busy || !name.trim() || name.trim() === user.name}>Rename</button>
          </span>
        </label>
      </form>
      <p className="account-note">Cloud save: {saved}</p>
      <div className="account-actions">
        <button type="button" className="account-btn is-main" onClick={onClose}>Done</button>
        <button type="button" className="account-btn" onClick={() => void authClient.signOut().then(onClose)}>Sign out</button>
      </div>
    </>
  );
}
