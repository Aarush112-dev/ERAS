/**
 * ERAS Procedural Web Audio Engine
 * Synthesizes dynamic, continuous environmental soundscapes across 5 civilizational epochs.
 */

class ErasAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;

  // Sound nodes
  private windGain: GainNode | null = null;
  private fireGain: GainNode | null = null;
  private waterGain: GainNode | null = null;
  private organGain: GainNode | null = null;
  private steamGain: GainNode | null = null;
  private synthGain: GainNode | null = null;

  private isInitialized: boolean = false;
  private steamInterval: number | null = null;
  private fireInterval: number | null = null;

  public init() {
    if (this.isInitialized) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Wind Generator (Filtered pink noise with LFO)
      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.windGain.connect(this.masterGain);
      this.createWindSource(this.windGain);

      // 2. Fire Crackle Generator
      this.fireGain = this.ctx.createGain();
      this.fireGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.fireGain.connect(this.masterGain);
      this.createFireSource(this.fireGain);

      // 3. Water Flow Generator
      this.waterGain = this.ctx.createGain();
      this.waterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.waterGain.connect(this.masterGain);
      this.createWaterSource(this.waterGain);

      // 4. Medieval Organ Fifth Drone
      this.organGain = this.ctx.createGain();
      this.organGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.organGain.connect(this.masterGain);
      this.createOrganSource(this.organGain);

      // 5. Industrial Steam Generator
      this.steamGain = this.ctx.createGain();
      this.steamGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.steamGain.connect(this.masterGain);
      this.createSteamSource(this.steamGain);

      // 6. Cosmic Synth Pad & Sub-Bass
      this.synthGain = this.ctx.createGain();
      this.synthGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.synthGain.connect(this.masterGain);
      this.createSynthSource(this.synthGain);

      this.isInitialized = true;
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  private createNoiseBuffer(lengthSec = 4): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * lengthSec;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    // Pink noise approximation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut * 0.95) + (white * 0.05);
      data[i] = lastOut * 3;
    }
    return buffer;
  }

  private createWindSource(dest: GainNode) {
    if (!this.ctx) return;
    const buffer = this.createNoiseBuffer(5);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(3, this.ctx.currentTime);

    // LFO for gentle wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    source.connect(filter);
    filter.connect(dest);

    lfo.start();
    source.start();
  }

  private createWaterSource(dest: GainNode) {
    if (!this.ctx) return;
    const buffer = this.createNoiseBuffer(4);
    if (!buffer) return;

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, this.ctx.currentTime);
    filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start();
  }

  private createFireSource(dest: GainNode) {
    if (!this.ctx) return;

    // Periodic crackle burst
    this.fireInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      if (Math.random() > 0.4) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800 + Math.random() * 1200, this.ctx.currentTime);
        g.gain.setValueAtTime(0.08, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(g);
        g.connect(dest);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      }
    }, 180);
  }

  private createOrganSource(dest: GainNode) {
    if (!this.ctx) return;
    // Warm harmonic drone (Root: 110Hz A2, Fifth: 165Hz E3, Octave: 220Hz A3)
    const freqs = [110, 165, 220];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(0.12 / (idx + 1), this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      osc.connect(g);
      g.connect(filter);
      filter.connect(dest);
      osc.start();
    });
  }

  private createSteamSource(dest: GainNode) {
    if (!this.ctx) return;

    // Rhythmic steam chuff simulation
    let count = 0;
    this.steamInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted || !this.steamGain || this.steamGain.gain.value < 0.05) return;
      count++;
      const buffer = this.createNoiseBuffer(0.2);
      if (!buffer) return;
      const src = this.ctx.createBufferSource();
      src.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(count % 4 === 0 ? 550 : 380, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.2, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);

      src.connect(filter);
      filter.connect(g);
      g.connect(dest);
      src.start();
      src.stop(this.ctx.currentTime + 0.18);
    }, 450);
  }

  private createSynthSource(dest: GainNode) {
    if (!this.ctx) return;
    // Cosmic Sub Drone (55Hz) + Shimmer Pad (440Hz & 660Hz)
    const notes = [55, 220, 330, 440];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = idx === 0 ? 'sine' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      g.gain.setValueAtTime(idx === 0 ? 0.35 : 0.05, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(idx === 0 ? 120 : 680, this.ctx.currentTime);

      osc.connect(g);
      g.connect(filter);
      filter.connect(dest);
      osc.start();
    });
  }

  public updateProgress(progress: number) {
    if (!this.ctx || !this.isInitialized) return;
    const t = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, progress));

    // Progress 0.0 -> prehistoric (wind, fire)
    // Progress 0.25 -> ancient (water, wind)
    // Progress 0.50 -> medieval (organ, water, subtle fire)
    // Progress 0.75 -> industrial (steam, subtle organ)
    // Progress 1.00 -> space (synth, cosmic sub)

    const windVol = Math.max(0, 0.7 * (1 - clamped * 1.3));
    const fireVol = Math.max(0, 0.6 * (1 - clamped * 2.2));
    const waterVol = Math.max(0, 0.7 * Math.sin(clamped * Math.PI * 1.5) * (1 - clamped * 0.8));
    const organVol = Math.max(0, 0.6 * Math.sin(Math.max(0, (clamped - 0.25) / 0.5) * Math.PI));
    const steamVol = Math.max(0, 0.8 * Math.sin(Math.max(0, (clamped - 0.5) / 0.4) * Math.PI));
    const synthVol = Math.max(0, Math.pow(Math.max(0, (clamped - 0.65) / 0.35), 1.5));

    const rampTime = 0.1;
    this.windGain?.gain.setTargetAtTime(windVol, t, rampTime);
    this.fireGain?.gain.setTargetAtTime(fireVol, t, rampTime);
    this.waterGain?.gain.setTargetAtTime(waterVol, t, rampTime);
    this.organGain?.gain.setTargetAtTime(organVol, t, rampTime);
    this.steamGain?.gain.setTargetAtTime(steamVol, t, rampTime);
    this.synthGain?.gain.setTargetAtTime(synthVol, t, rampTime);
  }

  public toggleMute(): boolean {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.6, this.ctx.currentTime, 0.15);
    }
    return !this.isMuted;
  }

  public getIsPlaying(): boolean {
    return !this.isMuted && this.isInitialized;
  }

  public destroy() {
    if (this.steamInterval) clearInterval(this.steamInterval);
    if (this.fireInterval) clearInterval(this.fireInterval);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    this.isInitialized = false;
  }
}

export const audioEngine = new ErasAudioEngine();
