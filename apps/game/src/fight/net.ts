// VERSUS online: the WebSocket to the Elysia relay (/fight) and the rollback session that drives the sim.
import { checksum, createFight, step, ServerMsg, type ClientMsg, type FightEvent, type FightState } from '@qublox/shared/fight';
import type { CrewId } from '@qublox/shared';
import type { Driver } from './FightScene';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
export const FIGHT_WS = API.replace(/^http/, 'ws') + '/fight';

type Handler = (m: ServerMsg) => void;

/** Thin typed wrapper around the relay socket. */
export class VersusSocket {
  private ws: WebSocket;
  private handlers = new Set<Handler>();
  private queue: ClientMsg[] = [];
  closed = false;
  constructor(url = FIGHT_WS) {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => { for (const m of this.queue) this.ws.send(JSON.stringify(m)); this.queue = []; };
    this.ws.onmessage = ev => {
      let raw: unknown;
      try { raw = JSON.parse(String(ev.data)); } catch { return; }
      const m = ServerMsg.safeParse(raw);
      if (m.success) for (const h of this.handlers) h(m.data);
    };
    this.ws.onclose = () => { this.closed = true; for (const h of this.handlers) h({ t: 'error', message: 'Connection to the VERSUS server closed.' }); };
    this.ws.onerror = () => { for (const h of this.handlers) h({ t: 'error', message: `Can't reach the VERSUS server (${url}). Is \`bun run dev:server\` running?` }); };
  }
  send(m: ClientMsg) { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(m)); else this.queue.push(m); }
  on(h: Handler) { this.handlers.add(h); return () => { this.handlers.delete(h); }; }
  close() { this.closed = true; this.ws.close(); }
}

/**
 * Rollback netcode (GGPO-style), small and readable:
 * - Local input is scheduled INPUT_DELAY frames ahead and sent every frame (with a redundant tail).
 * - Missing remote input is *predicted* (= their last known input), so we never wait on the network.
 * - When a real remote input arrives that differs from the prediction, restore the snapshot from just before
 *   that frame and re-simulate up to now. The sim is deterministic, so both sides converge.
 * - If the remote falls more than MAX_ROLLBACK frames behind, we pause (stall) instead of predicting forever.
 * - Every 60 confirmed frames we exchange a checksum. A mismatch means a desync (a sim bug), which gets reported.
 */
export class RollbackDriver implements Driver {
  static INPUT_DELAY = 2;
  static MAX_ROLLBACK = 10;
  readonly local: 0 | 1;
  state: FightState;
  private snaps = new Map<number, FightState>();         // snaps[f] = state at frame f
  private localIn: number[] = [];
  private remoteIn: (number | undefined)[] = [];
  private used: number[] = [];                           // remote input actually used for frame f
  private confirmed = 0;                                 // all inputs known for frames ≤ confirmed
  private rollbackFrom = Infinity;
  private sums = new Map<number, number>();
  private remoteSums = new Map<number, number>();
  private stalled = false;
  private off: () => void;
  rollbacks = 0;
  desync = false;

  constructor(private sock: VersusSocket, you: 0 | 1, crews: [CrewId, CrewId], seed: number, private onDesync: () => void) {
    this.local = you;
    this.state = createFight(crews[0], crews[1], seed);
    for (let f = 1; f <= RollbackDriver.INPUT_DELAY; f++) { this.localIn[f] = 0; this.remoteIn[f] = 0; }
    this.snaps.set(0, structuredClone(this.state));
    this.off = sock.on(m => {
      if (m.t === 'input') m.bits.forEach((b, k) => this.receive(m.from + k, b));
      if (m.t === 'sync') { this.remoteSums.set(m.frame, m.sum); this.checkSync(m.frame); }
    });
  }

  private receive(f: number, bits: number) {
    if (this.remoteIn[f] !== undefined) return;
    this.remoteIn[f] = bits;
    if (f <= this.state.frame && this.used[f] !== bits) this.rollbackFrom = Math.min(this.rollbackFrom, f);
    while (this.remoteIn[this.confirmed + 1] !== undefined && this.localIn[this.confirmed + 1] !== undefined && this.confirmed + 1 <= this.state.frame) this.confirmed++;
  }

  private remoteFor(f: number) {
    const r = this.remoteIn[f];
    if (r !== undefined) return r;
    for (let k = f - 1; k >= 0; k--) if (this.remoteIn[k] !== undefined) return this.remoteIn[k]!;
    return 0;
  }

  private simulate(f: number): FightEvent[] {
    const lb = this.localIn[f] ?? 0, rb = this.remoteFor(f);
    this.used[f] = rb;
    step(this.state, this.local === 0 ? [lb, rb] : [rb, lb]);
    this.snaps.set(f, structuredClone(this.state));
    return this.state.events;
  }

  update(read: () => [number, number]) {
    let events: FightEvent[] = [];
    // 1) Roll back if a past prediction was wrong.
    if (this.rollbackFrom !== Infinity) {
      const from = this.rollbackFrom, to = this.state.frame;
      this.rollbackFrom = Infinity;
      const snap = this.snaps.get(from - 1);
      if (snap) {
        this.state = structuredClone(snap);
        for (let f = from; f <= to; f++) this.simulate(f);
        this.rollbacks++;
      }
    }
    // 2) Stall if the opponent is too far behind.
    const next = this.state.frame + 1;
    const lastRemote = this.lastContiguousRemote();
    this.stalled = next - lastRemote > RollbackDriver.MAX_ROLLBACK;
    if (this.stalled) return { state: this.state, events };
    // 3) Schedule + send local input (INPUT_DELAY frames ahead).
    const at = next + RollbackDriver.INPUT_DELAY;
    this.localIn[at] = read()[0];
    const from = Math.max(1, at - 7);
    this.sock.send({ t: 'input', from, bits: this.localIn.slice(from, at + 1).map(b => b ?? 0) });
    // 4) Advance one frame with predicted/known inputs.
    events = this.simulate(next);
    while (this.remoteIn[this.confirmed + 1] !== undefined && this.confirmed + 1 <= this.state.frame) this.confirmed++;
    // 5) Desync checksums on confirmed frames; prune old snapshots.
    for (let f = this.confirmed - (this.confirmed % 60); f > 0 && !this.sums.has(f); f -= 60) {
      const s = this.snaps.get(f);
      if (!s) break;
      const sum = checksum(s);
      this.sums.set(f, sum);
      this.sock.send({ t: 'sync', frame: f, sum });
      this.checkSync(f);
    }
    for (const f of this.snaps.keys()) if (f < this.confirmed - RollbackDriver.MAX_ROLLBACK - 2) this.snaps.delete(f);
    return { state: this.state, events };
  }

  private lastContiguousRemote() {
    let f = this.confirmed;
    while (this.remoteIn[f + 1] !== undefined) f++;
    return f;
  }

  private checkSync(f: number) {
    const a = this.sums.get(f), b = this.remoteSums.get(f);
    if (a !== undefined && b !== undefined && a !== b && !this.desync) { this.desync = true; this.onDesync(); }
  }

  status() { return this.sock.closed ? 'DISCONNECTED' : this.stalled ? 'WAITING FOR OPPONENT…' : null; }
  dispose() { this.off(); }
}
