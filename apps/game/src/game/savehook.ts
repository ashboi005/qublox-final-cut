// Fired whenever the browser save changes (episode cleared, achievement progress), so a signed-in
// player's cloud save can follow. Kept dependency-free so progress/achievements don't import the account code.
let listener: (() => void) | null = null;
export const onLocalSave = (fn: (() => void) | null) => { listener = fn; };
export const localSaved = () => listener?.();
