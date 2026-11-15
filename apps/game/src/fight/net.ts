// VERSUS online: the WebSocket to the Elysia relay (/fight) and the rollback session that drives the sim.
import { checksum, createFight, step, ServerMsg, type ClientMsg, type FightEvent, type FightState } from '@qublox/shared/fight';
import type { CrewId } from '@qublox/shared';
import type { Driver } from './FightScene';
import { dlog } from '../game/debuglog';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787';
export const FIGHT_WS = API.replace(/^http/, 'ws') + '/fight';

type Handler = (m: ServerMsg) => void;

/** Thin typed wrapper around the relay socket. */
export class VersusSocket {
  private ws: WebSocket;
  private handlers = new Set<Handler>();
  private queue: ClientMsg[] = [];
  closed = false;
  private beat: ReturnType<typeof setInterval> | undefined;
  private openedAt = 0;
  /** Round-trip time to the relay (ms): the last one and a running average, from the heartbeat pings. */
  rtt = 0; rttAvg = 0;
  constructor(url = FIGHT_WS) {
    const t0 = performance.now();
    dlog('versus', 'connecting', { url });
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.openedAt = performance.now();
      dlog('versus', 'connected', { ms: Math.round(this.openedAt - t0) });
      for (const m of this.queue) this.ws.send(JSON.stringify(m));
      this.queue = [];
      // Heartbeat: proxies in front of the server (Cloudflare, Traefik) drop a WebSocket that's quiet for ~100s,
      // e.g. while both players sit on the result or character-select screen.
      this.send({ t: 'ping', at: Date.now() });   // first RTT right away (for the logs)
      this.beat = setInterval(() => this.send({ t: 'ping', at: Date.now() }), 20_000);
    };
    this.ws.onmessage = ev => {
      let raw: unknown;
      try { raw = JSON.parse(String(ev.data)); } catch { return; }
      const m = ServerMsg.safeParse(raw);
      if (!m.success) { dlog('versus', 'bad-server-message', { sample: String(ev.data).slice(0, 80) }, 'warn'); return; }
      if (m.data.t === 'pong') { this.rtt = Math.round(Date.now() - m.data.at); this.rttAvg = this.rttAvg ? Math.round(this.rttAvg * 0.7 + this.rtt * 0.3) : this.rtt; }
      else if (m.data.t !== 'input' && m.data.t !== 'sync') dlog('versus', `server:${m.data.t}`, m.data.t === 'error' ? { message: m.data.message } : m.data.t === 'start' ? { match: m.data.seed, crews: m.data.crews.join(',') } : m.data.t === 'room' ? { room: m.data.code, you: m.data.you + 1, players: m.data.players.filter(Boolean).length } : {});
      for (const h of this.handlers) h(m.data);
    };
    this.ws.onclose = ev => { dlog('versus', 'closed', { code: ev.code, reason: ev.reason || undefined, clean: ev.wasClean, byUs: this.closed, upSecs: this.openedAt ? Math.round((performance.now() - this.openedAt) / 1000) : 0, rttAvg: this.rttAvg }, ev.code === 1000 || this.closed ? 'info' : 'warn'); this.closed = true; clearInterval(this.beat); for (const h of this.handlers) h({ t: 'error', message: 'Connection to the VERSUS server closed.' }); };
    this.ws.onerror = () => { dlog('versus', 'socket-error', { url, state: this.ws.readyState }, 'error'); for (const h of this.handlers) h({ t: 'error', message: `Can't reach the VERSUS server (${url}). Is \`bun run dev:server\` running?` }); };
  }
  send(m: ClientMsg) { if (this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(m)); else this.queue.push(m); }
  on(h: Handler) { this.handlers.add(h); return () => { this.handlers.delete(h); }; }
  close() { this.closed = true; clearInterval(this.beat); this.ws.close(1000, 'left'); }
  /** Send a line to the server's logs (and this browser's debug log). */
  report(kind: 'desync' | 'stall' | 'summary' | 'error', data: Record<string, string | number | boolean>) {
    dlog('versus', `report:${kind}`, data, kind === 'desync' || kind === 'error' ? 'warn' : 'info');
    this.send({ t: 'report', kind, data });
  }
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
  /** Only say "waiting" after this many stalled ticks in a row (~0.75s). Clients a frame or two apart in time
   *  stall for single ticks all the time, which is invisible in play but made the banner flicker on and off. */
  static STALL_NOTICE = 45;
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
  private stallTicks = 0;
  private off: () => void;
  rollbacks = 0;
  desync = false;
  // For the logs: deepest rollback, stall episodes and the longest one.
  private maxDepth = 0; private stalls = 0; private longestStall = 0;

  constructor(private sock: VersusSocket, you: 0 | 1, crews: [CrewId, CrewId], private seed: number, private onDesync: () => void) {
    this.local = you;
    this.state = createFight(crews[0], crews[1], seed);
    for (let f = 1; f <= RollbackDriver.INPUT_DELAY; f++) { this.localIn[f] = 0; this.remoteIn[f] = 0; }
    this.snaps.set(0, structuredClone(this.state));
    dlog('versus', 'match-start', { match: seed, you: you + 1, crews: crews.join(','), rtt: sock.rttAvg });
    this.off = sock.on(m => {
      if (this.disposed || ((m.t === 'input' || m.t === 'sync') && m.m !== undefined && m.m !== this.seed)) return;
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
        this.maxDepth = Math.max(this.maxDepth, to - from + 1);
      }
    }
    // 2) Stall if the opponent is too far behind.
    const next = this.state.frame + 1;
    const lastRemote = this.lastContiguousRemote();
    this.stalled = next - lastRemote > RollbackDriver.MAX_ROLLBACK;
    if (!this.stalled && this.stallTicks > RollbackDriver.STALL_NOTICE) {
      // A stall long enough to show WAITING FOR OPPONENT just ended: worth a line on the server.
      this.stalls++; this.longestStall = Math.max(this.longestStall, this.stallTicks);
      this.sock.report('stall', { match: this.seed, frame: this.state.frame, ticks: this.stallTicks, rtt: this.sock.rttAvg });
    }
    this.stallTicks = this.stalled ? this.stallTicks + 1 : 0;
    if (this.stalled) return { state: this.state, events };
    // 3) Schedule + send local input (INPUT_DELAY frames ahead).
    const at = next + RollbackDriver.INPUT_DELAY;
    this.localIn[at] = read()[0];
    const from = Math.max(1, at - 7);
    this.sock.send({ t: 'input', from, bits: this.localIn.slice(from, at + 1).map(b => b ?? 0), m: this.seed });
    // 4) Advance one frame with predicted/known inputs.
    events = this.simulate(next);
    while (this.remoteIn[this.confirmed + 1] !== undefined && this.confirmed + 1 <= this.state.frame) this.confirmed++;
    // 5) Desync checksums on confirmed frames; prune old snapshots.
    for (let f = this.confirmed - (this.confirmed % 60); f > 0 && !this.sums.has(f); f -= 60) {
      const s = this.snaps.get(f);
      if (!s) break;
      const sum = checksum(s);
      this.sums.set(f, sum);
      this.sock.send({ t: 'sync', frame: f, sum, m: this.seed });
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
    if (a !== undefined && b !== undefined && a !== b && !this.desync && !this.disposed) {
      this.desync = true;
      this.sock.report('desync', { match: this.seed, frame: f, local: a, remote: b, now: this.state.frame, confirmed: this.confirmed, rollbacks: this.rollbacks, crews: this.state.fighters.map(x => x.crew).join(',') });
      this.onDesync();
    }
  }

  status() { return this.sock.closed ? 'DISCONNECTED' : this.stallTicks > RollbackDriver.STALL_NOTICE ? 'WAITING FOR OPPONENT…' : null; }
  /** Detach from the socket. Called when the scene shuts down AND when the fight view unmounts (destroying the
   *  Phaser game doesn't run scene shutdown, so a finished match used to stay subscribed and cry "desync" in the next). */
  private disposed = false;
  dispose() {
    if (this.disposed) return;
    this.disposed = true; this.off();
    // One summary per match: how healthy was the netcode?
    if (this.state.frame > 0) this.sock.report('summary', { match: this.seed, frames: this.state.frame, phase: this.state.phase, rollbacks: this.rollbacks, maxDepth: this.maxDepth, stalls: this.stalls, longestStall: this.longestStall, rttAvg: this.sock.rttAvg, desync: this.desync });
  }
}
