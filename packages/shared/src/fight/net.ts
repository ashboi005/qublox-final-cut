// VERSUS online protocol (client ⇄ Elysia relay at /fight). The server never simulates; it pairs two sockets
// in a room and relays. Every message is JSON and validated with these schemas on both ends.
import { z } from 'zod';
import { CREW_IDS } from '../index';

export const ROOM_CODE_RE = /^[A-Z]{4}$/;
const crew = z.enum(CREW_IDS);

/** Client → server. */
export const ClientMsg = z.discriminatedUnion('t', [
  z.object({ t: z.literal('create'), name: z.string().min(1).max(16) }),
  z.object({ t: z.literal('join'), code: z.string().regex(ROOM_CODE_RE), name: z.string().min(1).max(16) }),
  z.object({ t: z.literal('pick'), crew }),
  z.object({ t: z.literal('ready'), ready: z.boolean() }),
  /** Inputs for frames [from, from + bits.length). Sent every frame with a short redundant tail. */
  z.object({ t: z.literal('input'), from: z.number().int().min(0), bits: z.array(z.number().int().min(0).max(255)).min(1).max(16) }),
  z.object({ t: z.literal('sync'), frame: z.number().int().min(0), sum: z.number().int().min(0) }),
  z.object({ t: z.literal('rematch') }),
  z.object({ t: z.literal('ping'), at: z.number() }),
]);
export type ClientMsg = z.infer<typeof ClientMsg>;

export const LobbyPlayer = z.object({ name: z.string(), crew: crew.nullable(), ready: z.boolean() });
export type LobbyPlayer = z.infer<typeof LobbyPlayer>;

/** Server → client. */
export const ServerMsg = z.discriminatedUnion('t', [
  z.object({ t: z.literal('room'), code: z.string(), you: z.union([z.literal(0), z.literal(1)]), players: z.array(LobbyPlayer.nullable()).length(2) }),
  z.object({ t: z.literal('start'), seed: z.number().int(), crews: z.tuple([crew, crew]), names: z.tuple([z.string(), z.string()]) }),
  z.object({ t: z.literal('input'), from: z.number().int(), bits: z.array(z.number().int()) }),
  z.object({ t: z.literal('sync'), frame: z.number().int(), sum: z.number().int() }),
  z.object({ t: z.literal('left') }),
  z.object({ t: z.literal('error'), message: z.string() }),
  z.object({ t: z.literal('pong'), at: z.number() }),
]);
export type ServerMsg = z.infer<typeof ServerMsg>;
