// The only bridge between Phaser (game world) and React (UI). Both sides import this singleton.
import type { CrewId, Dialogue } from '@qublox/shared';

export type MemberHud = {
  id: CrewId; name: string; className: string; color: string;
  hp: number; maxHp: number; cooldown: number; /** 0 = ready, 1 = just used */
  ko: boolean; active: boolean; abilityName: string;
};
export type HudState = {
  party: MemberHud[];
  style: { rank: string; meter: number; score: number };
  timeMs: number;
  hint: string | null;
  boss: { name: string; hp: number; maxHp: number; shielded: boolean } | null;
};
export type RunResult = { episode: number; timeMs: number; style: number; kos: number; party: CrewId[] };

type Events = {
  hud: HudState;
  dialogueStart: Dialogue & { names?: Record<string, string>; present?: string[] };
  dialogueEnd: { id: string };
  levelComplete: RunResult;
  toast: { text: string };
  restart: undefined;
  viewer: { open: boolean };
  /** 0..1: how much BEIGE has drained the screen (finale gag: HUD goes Arial). */
  beige: { amount: number };
  achievement: { id: string };
  /** VERSUS: the match is over (winner = player index), or the online peer left. */
  versusEnd: { winner: 0 | 1 | null; reason?: 'left' | 'desync'; finisher?: string };
  versusStatus: { text: string | null };
};

type Handler<T> = (payload: T) => void;
class Bus {
  private handlers = new Map<keyof Events, Set<Handler<never>>>();
  on<K extends keyof Events>(event: K, fn: Handler<Events[K]>): () => void {
    let set = this.handlers.get(event);
    if (!set) this.handlers.set(event, (set = new Set()));
    set.add(fn as Handler<never>);
    return () => set.delete(fn as Handler<never>);
  }
  emit<K extends keyof Events>(event: K, ...payload: Events[K] extends undefined ? [] : [Events[K]]): void {
    this.handlers.get(event)?.forEach(fn => (fn as Handler<Events[K] | undefined>)(payload[0]));
  }
}

export const bus = new Bus();
