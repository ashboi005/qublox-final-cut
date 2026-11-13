// Procedural audio: every note and sound effect is synthesized with WebAudio. No audio files.
// Songs are tracker-style JSON written by Astra (content/audio/songs/*.json, format in docs/audio/AUDIO_SPEC.md).
import { noteToMidi, parseSteps, SongSchema, type Instrument, type SfxBank, type Song } from '@qublox/shared';

const LOOKAHEAD_S = 0.12;
const TICK_MS = 25;
const MUTE_KEY = 'qublox-muted';

type Step = { token: string; holds: number };
type Track = { inst: Instrument; steps: Step[] };

/** Built-in SFX so the game has sound before Astra's bank lands. content/audio/sfx.json overrides these. */
const DEFAULT_SFX: SfxBank['sfx'] = {
  jump: { wave: 'square', freq: [300, 620], duration: 0.09, volume: 0.12, repeat: 1 },
  land: { wave: 'noise', freq: [400, 120], duration: 0.05, volume: 0.12, cutoff: 900, repeat: 1 },
  hit: { wave: 'noise', freq: [900, 200], duration: 0.08, volume: 0.22, cutoff: 3000, repeat: 1 },
  swap: { wave: 'square', freq: [520, 1040], duration: 0.05, volume: 0.12, repeat: 2 },
  ability: { wave: 'sawtooth', freq: [220, 880], duration: 0.18, volume: 0.14, cutoff: 2400, repeat: 1 },
  hurt: { wave: 'square', freq: [400, 90], duration: 0.16, volume: 0.18, repeat: 1 },
  ko: { wave: 'triangle', freq: [600, 60], duration: 0.5, volume: 0.22, repeat: 1 },
  pickup: { wave: 'square', freq: [660, 1320], duration: 0.06, volume: 0.12, repeat: 3 },
  door: { wave: 'sawtooth', freq: [90, 60], duration: 0.25, volume: 0.15, cutoff: 600, repeat: 1 },
  menu: { wave: 'square', freq: [880, 880], duration: 0.04, volume: 0.1, repeat: 1 },
};

class Synth {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noise!: AudioBuffer;
  private sfxBank: SfxBank['sfx'] = DEFAULT_SFX;
  private song: Song | null = null;
  private compiled = new Map<string, Track[]>();
  private orderIdx = 0;
  private stepIdx = 0;
  private nextTime = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private pending: Song | null = null;
  /** When set, loop this pattern instead of following `order` (finale phases). */
  private forced: string | null = null;
  muted = false;

  constructor() {
    try { this.muted = typeof localStorage !== 'undefined' && localStorage.getItem(MUTE_KEY) === '1'; } catch { /* ignore */ }
  }

  /** Browsers only allow audio after a user gesture: call this from the first key/click. */
  unlock() {
    if (this.ctx) { void this.ctx.resume(); return; }
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = (this.ctx = new Ctx());
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.8;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);
    this.musicBus = ctx.createGain(); this.musicBus.gain.value = 0.55; this.musicBus.connect(this.master);
    this.sfxBus = ctx.createGain(); this.sfxBus.gain.value = 0.9; this.sfxBus.connect(this.master);
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (this.pending) { const s = this.pending; this.pending = null; this.play(s); }
  }

  toggleMute() {
    this.muted = !this.muted;
    try { localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0'); } catch { /* ignore */ }
    if (this.ctx) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.8, this.ctx.currentTime, 0.02);
    return this.muted;
  }

  setSfxBank(bank: SfxBank['sfx'] | null | undefined) { this.sfxBank = { ...DEFAULT_SFX, ...(bank ?? {}) }; }

  // ---------- Music ----------
  /** Accepts raw JSON too: it is validated here so schema defaults always apply. */
  play(input: Song | unknown) {
    const parsed = SongSchema.safeParse(input);
    if (!parsed.success) { console.warn('[synth] invalid song', parsed.error.issues[0]); return; }
    const song = parsed.data;
    if (this.song?.id === song.id && this.timer) return;
    this.stop();
    if (!this.ctx) { this.pending = song; return; }
    this.song = song;
    this.compiled.clear();
    for (const [pid, tracks] of Object.entries(song.patterns)) {
      this.compiled.set(pid, Object.entries(tracks).map(([inst, src]) => {
        const tokens = parseSteps(src);
        const steps = tokens.map((token, i) => {
          let holds = 0;
          while (tokens[i + 1 + holds] === '-') holds++;
          return { token, holds };
        });
        return { inst: song.instruments[inst]!, steps };
      }));
    }
    this.orderIdx = 0; this.stepIdx = 0; this.forced = null;
    this.nextTime = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), TICK_MS);
  }

  /** Jump to and loop one pattern of the current song (e.g. "B" for a boss's second phase). */
  section(id: string) {
    if (!this.song?.patterns[id]) return false;
    this.forced = id; this.stepIdx = 0;
    return true;
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null; this.song = null; this.pending = null;
  }

  /** Play a one-shot stinger over a pause in the music, then return to `after` (if given). */
  private afterStinger: Song | null = null;
  stinger(input: unknown, after?: unknown) {
    const back = SongSchema.safeParse(after);
    this.afterStinger = back.success ? back.data : null;
    this.play(input);
  }
  private resumeAfter(endTime: number) {
    const next = this.afterStinger;
    this.afterStinger = null;
    if (!next || !this.ctx) return;
    setTimeout(() => this.play(next), Math.max(0, (endTime - this.ctx.currentTime) * 1000));
  }

  private schedule() {
    const ctx = this.ctx, song = this.song;
    if (!ctx || !song) return;
    const stepDur = 60 / song.bpm / song.stepsPerBeat;
    while (this.nextTime < ctx.currentTime + LOOKAHEAD_S) {
      const tracks = this.compiled.get(this.forced ?? song.order[this.orderIdx]!) ?? [];
      const len = tracks[0]?.steps.length ?? 16;
      const swing = this.stepIdx % 2 === 1 ? song.swing * stepDur : 0;
      for (const tr of tracks) {
        const st = tr.steps[this.stepIdx];
        if (st) this.trigger(tr.inst, st, this.nextTime + swing, stepDur);
      }
      this.nextTime += stepDur;
      if (++this.stepIdx >= len) {
        this.stepIdx = 0;
        if (++this.orderIdx >= song.order.length) {
          if (!song.loop) { const end = this.nextTime; this.stop(); this.resumeAfter(end); return; }
          this.orderIdx = Math.min(song.loopFrom, song.order.length - 1);
        }
      }
    }
  }

  private trigger(inst: Instrument, st: Step, t: number, stepDur: number) {
    const tok = st.token;
    if (tok === '.' || tok === '-') return;
    const vel = tok.startsWith('x') ? (tok.length > 1 ? Number(tok[1]) / 9 : 1) : 1;
    const midi = noteToMidi(tok);
    const dur = stepDur * (1 + st.holds);
    if (inst.wave === 'kick' || inst.wave === 'snare' || inst.wave === 'hat') return this.drum(inst, t, vel);
    this.voice(inst, midi ?? 60, t, dur, vel);
  }

  private out(inst: Instrument, t: number, bus: AudioNode): AudioNode {
    const ctx = this.ctx!;
    let node: AudioNode = bus;
    if (inst.pan) { const p = ctx.createStereoPanner(); p.pan.value = inst.pan; p.connect(node); node = p; }
    if (inst.cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(inst.cutoff, t); f.connect(node); node = f; }
    return node;
  }

  private voice(inst: Instrument, midi: number, t: number, dur: number, vel: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.connect(this.out(inst, t, this.musicBus));
    const peak = inst.volume * vel;
    const end = t + dur;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + inst.attack);
    g.gain.linearRampToValueAtTime(peak * inst.sustain, t + inst.attack + inst.decay);
    g.gain.setValueAtTime(peak * inst.sustain, end);
    g.gain.linearRampToValueAtTime(0, end + inst.release);
    const hz = 440 * 2 ** ((midi - 69) / 12);
    let src: AudioScheduledSourceNode;
    if (inst.wave === 'noise') {
      const n = ctx.createBufferSource(); n.buffer = this.noise; n.loop = true; n.playbackRate.value = Math.min(4, hz / 440); src = n;
    } else {
      const o = ctx.createOscillator(); o.type = inst.wave as OscillatorType; o.frequency.value = hz; o.detune.value = inst.detune;
      if (inst.vibrato) {
        const lfo = ctx.createOscillator(), depth = ctx.createGain();
        lfo.frequency.value = inst.vibrato.rate; depth.gain.value = inst.vibrato.depth;
        lfo.connect(depth).connect(o.detune); lfo.start(t); lfo.stop(end + inst.release + 0.05);
      }
      src = o;
    }
    src.connect(g);
    src.start(t);
    src.stop(end + inst.release + 0.05);
  }

  private drum(inst: Instrument, t: number, vel: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.connect(this.out(inst, t, this.musicBus));
    const v = inst.volume * vel;
    if (inst.wave === 'kick') {
      const o = ctx.createOscillator(); o.type = 'sine';
      o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      o.connect(g); o.start(t); o.stop(t + 0.3);
      return;
    }
    const n = ctx.createBufferSource(); n.buffer = this.noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass';
    const len = inst.wave === 'hat' ? 0.045 : 0.16;
    hp.frequency.value = inst.wave === 'hat' ? 7000 : 1200;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + len);
    n.connect(hp).connect(g); n.start(t); n.stop(t + len + 0.02);
    if (inst.wave === 'snare') {
      const o = ctx.createOscillator(), og = ctx.createGain(); o.type = 'triangle'; o.frequency.value = 185;
      og.gain.setValueAtTime(v * 0.6, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      o.connect(og).connect(g); o.start(t); o.stop(t + 0.1);
    }
  }

  // ---------- SFX ----------
  sfx(name: string) {
    const ctx = this.ctx, s = this.sfxBank[name];
    if (!ctx || !s || this.muted) return;
    const t0 = ctx.currentTime;
    for (let r = 0; r < s.repeat; r++) {
      const t = t0 + r * s.duration * 0.8;
      const g = ctx.createGain();
      let dest: AudioNode = this.sfxBus;
      if (s.cutoff) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = s.cutoff; f.connect(dest); dest = f; }
      g.connect(dest);
      g.gain.setValueAtTime(s.volume, t); g.gain.exponentialRampToValueAtTime(0.001, t + s.duration);
      const f0 = s.freq[0] * (1 + r * 0.25), f1 = s.freq[1] * (1 + r * 0.25);
      let src: AudioScheduledSourceNode;
      if (s.wave === 'noise') {
        const n = ctx.createBufferSource(); n.buffer = this.noise;
        n.playbackRate.setValueAtTime(Math.min(4, f0 / 440), t); n.playbackRate.exponentialRampToValueAtTime(Math.max(0.05, Math.min(4, f1 / 440)), t + s.duration);
        src = n;
      } else {
        const o = ctx.createOscillator(); o.type = s.wave;
        o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + s.duration);
        src = o;
      }
      src.connect(g); src.start(t); src.stop(t + s.duration + 0.02);
    }
  }
}

export const synth = new Synth();
