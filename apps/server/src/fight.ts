// VERSUS relay: in-memory rooms with 4-letter codes. Two sockets per room; the server never simulates.
// It handles the lobby (names, picks, ready), starts the match with a shared seed, and relays inputs and checksums.
import { Elysia } from 'elysia';
import { ClientMsg, ROOM_CODE_RE, type LobbyPlayer, type ServerMsg } from '@qublox/shared/fight';
import type { CrewId } from '@qublox/shared';

type Sock = { id: string; send: (data: string) => unknown };
type Room = { code: string; socks: [Sock | null, Sock | null]; players: [LobbyPlayer | null, LobbyPlayer | null]; playing: boolean; createdAt: number };

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

function leave(id: string) {
  const at = where.get(id);
  if (!at) return;
  where.delete(id);
  const r = rooms.get(at.code);
  if (!r) return;
  r.socks[at.idx] = null; r.players[at.idx] = null; r.playing = false;
  const other = r.socks[at.idx === 0 ? 1 : 0];
  if (other) { send(other, { t: 'left' }); r.players.forEach(p => { if (p) p.ready = false; }); lobby(r); }
  else rooms.delete(r.code);
}

// Sweep rooms nobody touched for 2 hours.
setInterval(() => { const now = Date.now(); for (const [c, r] of rooms) if (now - r.createdAt > 2 * 3600_000 && !r.socks.some(Boolean)) rooms.delete(c); }, 600_000);

export const fight = new Elysia().ws('/fight', {
  message(ws, raw) {
    const sock: Sock = { id: ws.id, send: d => ws.send(d) };
    const parsed = ClientMsg.safeParse(typeof raw === 'string' ? safeJson(raw) : raw);
    if (!parsed.success) return send(sock, { t: 'error', message: 'Bad message.' });
    const m = parsed.data;
    const at = where.get(ws.id);
    const room = at ? rooms.get(at.code) : undefined;

    switch (m.t) {
      case 'ping': return send(sock, { t: 'pong', at: m.at });
      case 'create': {
        leave(ws.id);
        const code = newCode();
        const r: Room = { code, socks: [sock, null], players: [{ name: m.name, crew: null, ready: false }, null], playing: false, createdAt: Date.now() };
        rooms.set(code, r); where.set(ws.id, { code, idx: 0 });
        return lobby(r);
      }
      case 'join': {
        const r = rooms.get(m.code.toUpperCase());
        if (!r || !ROOM_CODE_RE.test(m.code)) return send(sock, { t: 'error', message: `No room called ${m.code}.` });
        if (r.socks[0] && r.socks[1]) return send(sock, { t: 'error', message: `Room ${m.code} is full.` });
        const idx: 0 | 1 = r.socks[0] ? 1 : 0;
        leave(ws.id);
        r.socks[idx] = sock; r.players[idx] = { name: m.name, crew: null, ready: false };
        where.set(ws.id, { code: r.code, idx });
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
          const start: ServerMsg = { t: 'start', seed: Math.floor(Math.random() * 2 ** 31), crews: [a.crew as CrewId, b.crew as CrewId], names: [a.name, b.name] };
          room.socks.forEach(s => send(s, start));
        }
        return;
      }
      case 'rematch': {
        if (!room || !at) return;
        room.playing = false; room.players.forEach(p => { if (p) p.ready = false; });
        return lobby(room);
      }
      case 'input': case 'sync': {
        if (!room || !at || !room.playing) return;
        return send(room.socks[at.idx === 0 ? 1 : 0], m);   // relay as-is (same shape on the way out)
      }
    }
  },
  close(ws) { leave(ws.id); },
});

function safeJson(s: string): unknown { try { return JSON.parse(s); } catch { return null; } }
