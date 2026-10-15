// Synthesiseur audio Web Audio API pour soulagement de crise
// Génère du bruit brun (brown noise), bruit rose ou onde binaurale 432 Hz sans aucun fichier audio externe

class SoothingAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentSource: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying = false;
  private currentType: string = '';

  private getAudioContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public play(type: 'brown' | 'pink' | 'binaural' | 'water', volume = 0.25) {
    this.stop();
    const ctx = this.getAudioContext();

    this.gainNode = ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    this.gainNode.connect(ctx.destination);

    if (type === 'brown') {
      this.playBrownNoise(ctx, this.gainNode);
    } else if (type === 'pink') {
      this.playPinkNoise(ctx, this.gainNode);
    } else if (type === 'binaural') {
      this.playBinauralTone(ctx, this.gainNode);
    } else {
      this.playRainGentle(ctx, this.gainNode);
    }

    this.isPlaying = true;
    this.currentType = type;
  }

  private playBrownNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = output[i];
      output[i] *= 2.5; // Gain compensation
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Low pass filter to remove harsh frequencies for migraine sufferers
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(destination);
    whiteNoise.start();
    this.currentSource = whiteNoise;
  }

  private playPinkNoise(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
    this.currentSource = noise;
  }

  private playBinauralTone(ctx: AudioContext, destination: AudioNode) {
    // 432 Hz soothing healing frequency + 436 Hz delta difference (4Hz delta wave for migraine relief)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(216, ctx.currentTime); // gentle warm harmonic

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(220, ctx.currentTime); // 4Hz delta wave oscillation

    const merger = ctx.createChannelMerger(2);
    osc1.connect(merger, 0, 0);
    osc2.connect(merger, 0, 1);

    merger.connect(destination);
    osc1.start();
    osc2.start();

    this.currentSource = osc1;
  }

  private playRainGentle(ctx: AudioContext, destination: AudioNode) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.03 * white) / 1.03;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);

    noise.connect(filter);
    filter.connect(destination);
    noise.start();
    this.currentSource = noise;
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop() {
    if (this.currentSource) {
      try {
        (this.currentSource as AudioScheduledSourceNode).stop();
      } catch {
        // Source might not be stoppable or already stopped
      }
      this.currentSource.disconnect();
      this.currentSource = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
    this.currentType = '';
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      type: this.currentType,
    };
  }
}

export const soundSynth = new SoothingAudioSynthesizer();
