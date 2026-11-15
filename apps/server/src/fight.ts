// VERSUS relay: in-memory rooms with 4-letter codes. Two sockets per room; the server never simulates.
// It handles the lobby (names, picks, ready), starts the match with a shared seed, and relays inputs and checksums.
import { Elysia } from 'elysia';
import { ClientMsg, ROOM_CODE_RE, type LobbyPlayer, type ServerMsg } from '@qublox/shared/fight';
import type { CrewId } from '@qublox/shared';
import { errMsg, log, short } from './log';

type Sock = { id: string; send: (data: string) => unknown };
type Room = {
  code: string; socks: [Sock | null, Sock | null]; players: [LobbyPlayer | null, LobbyPlayer | null]; playing: boolean; createdAt: number; build?: string; match: number;
  /** Per-match counters for the logs: relayed input/sync messages, stragglers dropped, when it started. */
  stats: { relayed: number; stale: number; startedAt: number };
};
/** Per-socket bookkeeping for the logs (and the report rate limit). */
const conns = new Map<string, { at: number; ua: string; reports: number[] }>();

const rooms = new Map<string, Room>();
const where = new Map<string, { code: string; idx: 0 | 1 }>();
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // no I/O: easy to read out loud

const send = (s: Sock | null, m: ServerMsg) => { if (s) s.send(JSON.stringify(m)); };
const newCode = () => {
  for (let tries = 0; tries < 50; tries++) {
    const c = Array.from({ length: 4 }, () => LETTERS[Math.floor(Math.random() * LETTERS.length)]).join('');
    if (!rooms.has(c)) return c;
  }
  throw new Error('no free room codes');
};
const lobby = (r: Room) => r.socks.forEach((s, i) => send(s, { t: 'room', code: r.code, you: i as 0 | 1, players: r.players }));

/** One line summarising a match when it stops (end, rematch, or someone leaving). */
function matchSummary(r: Room, why: string) {
  if (!r.stats.startedAt) return;
  log('info', 'versus', 'match-end', { room: r.code, match: r.match, why, secs: Math.round((Date.now() - r.stats.startedAt) / 1000), relayed: r.stats.relayed, stale: r.stats.stale });
  r.stats = { relayed: 0, stale: 0, startedAt: 0 };
}

function leave(id: string, why = 'left') {
  const at = where.get(id);
  if (!at) return;
  where.delete(id);
  const r = rooms.get(at.code);
  if (!r) return;
  if (r.playing) matchSummary(r, `p${at.idx + 1}-${why}`);
  log('info', 'versus', 'leave', { room: r.code, sock: short(id), slot: at.idx + 1, why, playing: r.playing, opponentStays: !!r.socks[at.idx === 0 ? 1 : 0] });
  r.socks[at.idx] = null; r.players[at.idx] = null; r.playing = false;
  const other = r.socks[at.idx === 0 ? 1 : 0];
  if (other) { send(other, { t: 'left' }); r.players.forEach(p => { if (p) p.ready = false; }); lobby(r); }
  else { rooms.delete(r.code); log('info', 'versus', 'room-closed', { room: r.code, ageMin: Math.round((Date.now() - r.createdAt) / 60000) }); }
}

// Sweep rooms nobody touched for 2 hours.
setInterval(() => { const now = Date.now(); for (const [c, r] of rooms) if (now - r.createdAt > 2 * 3600_000 && !r.socks.some(Boolean)) rooms.delete(c); }, 600_000);
// Heartbeat line every 5 min while anyone's connected: is the relay alive, how busy is it, is memory creeping?
setInterval(() => {
  if (!conns.size && !rooms.size) return;
  log('info', 'versus', 'stats', { sockets: conns.size, rooms: rooms.size, playing: [...rooms.values()].filter(r => r.playing).length, rssMb: Math.round(process.memoryUsage().rss / 1048576) });
}, 300_000);

export const fight = new Elysia().ws('/fight', {
  open(ws) {
    const ua = (ws.data as { request?: Request }).request?.headers.get('user-agent') ?? '';
    conns.set(ws.id, { at: Date.now(), ua, reports: [] });
    log('info', 'versus', 'connect', { sock: short(ws.id), sockets: conns.size, ua: ua.replace(/^Mozilla\/5\.0 /, '').slice(0, 60) });
  },
  message(ws, raw) {
    try { handle(ws, raw); }
    catch (e) { log('error', 'versus', 'handler-crash', { sock: short(ws.id), error: errMsg(e) }); }
  },
  close(ws, code, reason) {
    const c = conns.get(ws.id); conns.delete(ws.id);
    const at = where.get(ws.id);
    log(code === 1000 || code === 1001 ? 'info' : 'warn', 'versus', 'disconnect', { sock: short(ws.id), code, reason: reason || undefined, room: at?.code, secs: c ? Math.round((Date.now() - c.at) / 1000) : undefined, sockets: conns.size });
    leave(ws.id, `closed-${code}`);
  },
});

function handle(ws: { id: string; send: (d: string) => unknown }, raw: unknown) {
  {
    const sock: Sock = { id: ws.id, send: d => ws.send(d) };
    const parsed = ClientMsg.safeParse(typeof raw === 'string' ? safeJson(raw) : raw);
    if (!parsed.success) { log('warn', 'versus', 'bad-message', { sock: short(ws.id), sample: String(typeof raw === 'string' ? raw : JSON.stringify(raw)).slice(0, 120) }); return send(sock, { t: 'error', message: 'Bad message.' }); }
    const m = parsed.data;
    const at = where.get(ws.id);
    const room = at ? rooms.get(at.code) : undefined;

    switch (m.t) {
      case 'ping': log('debug', 'versus', 'ping', { sock: short(ws.id) }); return send(sock, { t: 'pong', at: m.at });
      case 'report': {
        // Client-side events worth seeing here: desyncs, long stalls, end-of-match network summaries, client errors.
        const c = conns.get(ws.id), now = Date.now();
        if (c) { c.reports = c.reports.filter(t => now - t < 60_000); if (c.reports.length >= 20) return; c.reports.push(now); }
        log(m.kind === 'desync' || m.kind === 'error' ? 'warn' : 'info', 'client', m.kind, { room: room?.code, slot: at ? at.idx + 1 : undefined, sock: short(ws.id), ...m.data });
        return;
      }
      case 'create': {
        leave(ws.id);
        const code = newCode();
        const r: Room = { code, socks: [sock, null], players: [{ name: m.name, crew: null, ready: false }, null], playing: false, createdAt: Date.now(), build: m.build, match: 0, stats: { relayed: 0, stale: 0, startedAt: 0 } };
        rooms.set(code, r); where.set(ws.id, { code, idx: 0 });
        log('info', 'versus', 'create', { room: code, sock: short(ws.id), build: m.build?.slice(0, 7) ?? 'dev', rooms: rooms.size });
        return lobby(r);
      }
      case 'join': {
        const r = rooms.get(m.code.toUpperCase());
        if (!r || !ROOM_CODE_RE.test(m.code)) { log('info', 'versus', 'join-fail', { room: m.code, why: 'no-such-room', sock: short(ws.id) }); return send(sock, { t: 'error', message: `No room called ${m.code}.` }); }
        if (r.socks[0] && r.socks[1]) { log('info', 'versus', 'join-fail', { room: r.code, why: 'full', sock: short(ws.id) }); return send(sock, { t: 'error', message: `Room ${m.code} is full.` }); }
        if (r.build && m.build && r.build !== m.build) log('warn', 'versus', 'join-fail', { room: r.code, why: 'version-mismatch', host: r.build.slice(0, 7), joiner: m.build.slice(0, 7) });
        if (r.build && m.build && r.build !== m.build) return send(sock, { t: 'error', message: 'You and your opponent are on different versions of the game. Both refresh the page, then try again.' });
        const idx: 0 | 1 = r.socks[0] ? 1 : 0;
        leave(ws.id);
        r.socks[idx] = sock; r.players[idx] = { name: m.name, crew: null, ready: false };
        where.set(ws.id, { code: r.code, idx });
        log('info', 'versus', 'join', { room: r.code, sock: short(ws.id), slot: idx + 1, build: m.build?.slice(0, 7) ?? 'dev', hostBuild: r.build?.slice(0, 7) ?? 'dev' });
        return lobby(r);
      }
      case 'pick': case 'ready': {
        if (!room || !at || room.playing) return;
        const p = room.players[at.idx]!;
        if (m.t === 'pick') { p.crew = m.crew; p.ready = false; } else p.ready = m.ready && !!p.crew;
        lobby(room);
        const [a, b] = room.players;
        if (a?.ready && b?.ready && a.crew && b.crew) {
          room.playing = true;
          room.match = Math.floor(Math.random() * 2 ** 31);
          room.stats = { relayed: 0, stale: 0, startedAt: Date.now() };
          log('info', 'versus', 'start', { room: room.code, match: room.match, crews: [a.crew, b.crew] });
          const start: ServerMsg = { t: 'start', seed: room.match, crews: [a.crew as CrewId, b.crew as CrewId], names: [a.name, b.name] };
          room.socks.forEach(s => send(s, start));
        }
        return;
      }
      case 'rematch': {
        if (!room || !at) return;
        if (room.playing) matchSummary(room, `p${at.idx + 1}-rematch`);
        log('debug', 'versus', 'rematch', { room: room.code, slot: at.idx + 1 });
        room.playing = false; room.players.forEach(p => { if (p) p.ready = false; });
        return lobby(room);
      }
      case 'input': case 'sync': {
        if (!room || !at || !room.playing) return;
        if (m.m !== undefined && m.m !== room.match) {   // stragglers from an old match
          if (room.stats.stale++ === 0) log('info', 'versus', 'stale-dropped', { room: room.code, slot: at.idx + 1, theirMatch: m.m, match: room.match });
          return;
        }
        room.stats.relayed++;
        return send(room.socks[at.idx === 0 ? 1 : 0], m);   // relay as-is (same shape on the way out)
      }
    }
  }
}

function safeJson(s: string): unknown { try { return JSON.parse(s); } catch { return null; } }
