// STYLE meter: rewards variety (swaps, mixed attacks, abilities). Punishes playing "beige".
export const RANKS = [
  { at: 0, name: 'D', mult: 1 }, { at: 20, name: 'C', mult: 1.5 }, { at: 40, name: 'B', mult: 2 },
  { at: 60, name: 'A', mult: 3 }, { at: 80, name: 'S', mult: 4 }, { at: 95, name: 'MAXIMALIST', mult: 6 },
] as const;

export class StyleMeter {
  constructor(public meter = 0, public score = 0) {}
  private lastGain = 0;
  private recent: string[] = [];

  get rank() { let r: (typeof RANKS)[number] = RANKS[0]; for (const x of RANKS) if (this.meter >= x.at) r = x; return r; }

  /** `source` identifies the move, e.g. "ashwath:attack". Repeating the same move gains less. */
  gain(source: string, amount: number, now: number) {
    const repeats = this.recent.filter(s => s === source).length;
    const gain = amount / (1 + repeats);
    this.recent.push(source);
    if (this.recent.length > 4) this.recent.shift();
    this.meter = Math.min(100, this.meter + gain);
    this.lastGain = now;
  }
  addScore(points: number) { this.score += Math.round(points * this.rank.mult); }
  hurt() { this.meter = Math.max(0, this.meter - 20); }
  tick(now: number, dtMs: number) {
    if (now - this.lastGain > 1500) this.meter = Math.max(0, this.meter - 6 * dtMs / 1000);
  }
}
