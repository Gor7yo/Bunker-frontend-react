/**
 * Procedural sound effects (Web Audio), no audio files. Themed after the
 * Zone: Geiger counter, detector beeps, radio static, bunker doors, anomalies.
 */

const STORAGE_KEY = "bunker.sound";
const MASTER_VOLUME = 0.55;

export type SfxName =
  | "round"
  | "phase"
  | "reveal"
  | "action"
  | "exile"
  | "vote"
  | "myTurn"
  | "tick"
  | "bunkerClose"
  | "bunkerOpen";

const readEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

class Sfx {
  enabled = readEnabled();
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private listeners = new Set<() => void>();

  constructor() {
    // Browsers only allow audio after a user gesture — unlock on the first one.
    if (typeof window !== "undefined") {
      const unlock = () => void this.audio()?.resume();
      window.addEventListener("pointerdown", unlock, { once: true });
      window.addEventListener("keydown", unlock, { once: true });
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
    } catch {
      // ignore
    }
    this.listeners.forEach((fn) => fn());
    if (enabled) this.play("vote");
  }

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  play(name: SfxName) {
    if (!this.enabled) return;
    const ctx = this.audio();
    if (!ctx || ctx.state !== "running") return;
    try {
      this[name](ctx, ctx.currentTime + 0.01);
    } catch {
      // Never let a sound break the game.
    }
  }

  // ---- building blocks ----------------------------------------------------

  private audio() {
    if (this.ctx) return this.ctx;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = MASTER_VOLUME;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext) {
    if (this.noise) return this.noise;
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return (this.noise = buffer);
  }

  /** Gain node with an attack/decay envelope, connected to the master. */
  private env(ctx: AudioContext, t: number, peak: number, attack: number, decay: number) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(this.master!);
    return g;
  }

  private noiseBurst(
    ctx: AudioContext,
    t: number,
    { duration, peak, type, freq, q = 1 }: { duration: number; peak: number; type: BiquadFilterType; freq: number; q?: number },
  ) {
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    src.connect(filter).connect(this.env(ctx, t, peak, 0.002, duration));
    src.start(t, Math.random() * 0.5);
    src.stop(t + duration + 0.05);
    return filter;
  }

  private tone(ctx: AudioContext, t: number, freq: number, duration: number, peak: number, type: OscillatorType = "sine") {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.connect(this.env(ctx, t, peak, 0.005, duration));
    osc.start(t);
    osc.stop(t + duration + 0.05);
    return osc;
  }

  /** Random Geiger counter clicks over `spread` seconds. */
  private geiger(ctx: AudioContext, t: number, clicks: number, spread: number) {
    for (let i = 0; i < clicks; i++) {
      const at = t + Math.random() * spread;
      this.noiseBurst(ctx, at, { duration: 0.012, peak: 0.5, type: "highpass", freq: 2500 });
    }
  }

  // ---- effects ------------------------------------------------------------

  /** Bunker door: low boom + metallic clang. */
  private round(ctx: AudioContext, t: number) {
    const boom = this.tone(ctx, t, 70, 1.4, 0.9);
    boom.frequency.exponentialRampToValueAtTime(32, t + 1.2);
    this.noiseBurst(ctx, t, { duration: 1.1, peak: 0.35, type: "lowpass", freq: 180 });
    // Inharmonic partials sound like struck steel.
    for (const [freq, peak] of [
      [233, 0.12],
      [587, 0.08],
      [1031, 0.05],
      [1693, 0.03],
    ]) {
      this.tone(ctx, t + 0.02, freq, 1.6, peak, "triangle");
    }
    this.geiger(ctx, t + 0.3, 8, 0.9);
  }

  /** Radio: a squelch of static and a short pip. */
  private phase(ctx: AudioContext, t: number) {
    this.noiseBurst(ctx, t, { duration: 0.14, peak: 0.25, type: "bandpass", freq: 1600, q: 2 });
    this.tone(ctx, t + 0.15, 880, 0.08, 0.12, "square");
  }

  /** Geiger counter crackle + a faint detector ping. */
  private reveal(ctx: AudioContext, t: number) {
    this.geiger(ctx, t, 9, 0.45);
    this.tone(ctx, t + 0.05, 1760, 0.25, 0.05);
  }

  /** Anomaly discharge: rising distorted zap + crackle + mains hum. */
  private action(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(90, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.5);

    const shaper = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < curve.length; i++) {
      const x = (i / 128) - 1;
      curve[i] = Math.tanh(x * 6);
    }
    shaper.curve = curve;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.25);

    osc.connect(shaper).connect(filter).connect(this.env(ctx, t, 0.22, 0.01, 0.55));
    osc.start(t);
    osc.stop(t + 0.65);

    for (let i = 0; i < 6; i++) {
      this.noiseBurst(ctx, t + Math.random() * 0.4, { duration: 0.03, peak: 0.35, type: "highpass", freq: 4000 });
    }
    this.tone(ctx, t, 50, 0.7, 0.15, "sawtooth");
  }

  /** Heavy door slam with a scrape of metal. */
  private exile(ctx: AudioContext, t: number) {
    const scrape = this.noiseBurst(ctx, t, { duration: 0.6, peak: 0.25, type: "bandpass", freq: 3000, q: 6 });
    scrape.frequency.exponentialRampToValueAtTime(700, t + 0.6);
    const thump = this.tone(ctx, t + 0.55, 90, 0.9, 1);
    thump.frequency.exponentialRampToValueAtTime(30, t + 1.3);
    this.noiseBurst(ctx, t + 0.55, { duration: 0.5, peak: 0.6, type: "lowpass", freq: 300 });
    this.tone(ctx, t + 0.57, 311, 1.2, 0.07, "triangle");
  }

  private vote(ctx: AudioContext, t: number) {
    this.noiseBurst(ctx, t, { duration: 0.03, peak: 0.4, type: "bandpass", freq: 2200, q: 3 });
    this.tone(ctx, t, 520, 0.06, 0.08, "square");
  }

  /** Detector double beep — "your turn". */
  private myTurn(ctx: AudioContext, t: number) {
    this.tone(ctx, t, 1250, 0.09, 0.18);
    this.tone(ctx, t + 0.14, 1660, 0.14, 0.18);
  }

  private tick(ctx: AudioContext, t: number) {
    this.tone(ctx, t, 1400, 0.045, 0.1);
  }

  /** Hydraulic hiss of the heavy door. */
  private hiss(ctx: AudioContext, t: number, duration: number) {
    const f = this.noiseBurst(ctx, t, { duration, peak: 0.16, type: "bandpass", freq: 3500, q: 0.8 });
    f.frequency.exponentialRampToValueAtTime(1800, t + duration);
  }

  /** Locking/unlocking clunks of the wheel. */
  private clunks(ctx: AudioContext, t: number, count: number, gap: number) {
    for (let i = 0; i < count; i++) {
      const at = t + i * gap;
      this.noiseBurst(ctx, at, { duration: 0.08, peak: 0.45, type: "bandpass", freq: 700, q: 2 });
      this.tone(ctx, at, 160 - i * 10, 0.12, 0.25, "triangle");
    }
  }

  /** Left outside: the vault door rolls shut, slams, the wheel locks. Synced with the scene. */
  private bunkerClose(ctx: AudioContext, t: number) {
    this.hiss(ctx, t, 1);
    const roll = this.noiseBurst(ctx, t, { duration: 1.05, peak: 0.28, type: "lowpass", freq: 400 });
    roll.frequency.exponentialRampToValueAtTime(150, t + 1.05);

    const slam = t + 1.05;
    const boom = this.tone(ctx, slam, 75, 1.4, 1);
    boom.frequency.exponentialRampToValueAtTime(30, slam + 1.2);
    this.noiseBurst(ctx, slam, { duration: 0.6, peak: 0.7, type: "lowpass", freq: 300 });
    for (const [freq, peak] of [
      [196, 0.1],
      [466, 0.06],
      [873, 0.04],
    ]) {
      this.tone(ctx, slam, freq, 1.4, peak, "triangle");
    }
    this.clunks(ctx, t + 1.25, 3, 0.25);
  }

  /** Made it: the wheel unlocks, hiss, the door rolls away, a warm chord. */
  private bunkerOpen(ctx: AudioContext, t: number) {
    this.clunks(ctx, t + 0.2, 3, 0.22);
    this.tone(ctx, t + 0.85, 1250, 0.1, 0.12);
    this.hiss(ctx, t + 0.9, 0.8);
    const roll = this.noiseBurst(ctx, t + 1, { duration: 1.2, peak: 0.25, type: "lowpass", freq: 200 });
    roll.frequency.exponentialRampToValueAtTime(500, t + 2.2);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      this.tone(ctx, t + 1.5 + i * 0.09, freq, 1.8 - i * 0.2, 0.09, "triangle");
    });
  }
}

export const sfx = new Sfx();
