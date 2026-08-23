// WebAudio Synthesizer for 8-bit & 16-bit retro dungeon crawler audio

class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.7;
  private musicVolume: number = 0.4;
  private musicInterval: number | null = null;
  private currentTrack: 'lobby' | 'dungeon_stage1' | 'dungeon_stage2' | 'dungeon_stage3' | 'boss' | 'none' = 'none';

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    } else if (!muted && this.currentTrack !== 'none') {
      this.playMusic(this.currentTrack);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(sfx: number, music: number) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    this.musicVolume = Math.max(0, Math.min(1, music));
  }

  // --- SOUND EFFECTS ---

  public playShoot(type: 'pistol' | 'shotgun' | 'laser' | 'sword' | 'magic' | 'rocket' | 'bow' | 'punch' | 'plasma') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    switch (type) {
      case 'pistol': {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);
        gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.start(t);
        osc.stop(t + 0.08);
        break;
      }
      case 'shotgun': {
        // White noise burst + low tone
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.15);
        gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        this.playNoise(0.12, 0.25);
        break;
      }
      case 'laser': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(300, t + 0.12);
        gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
        break;
      }
      case 'sword': {
        // Fast whoosh
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(150, t + 0.14);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
        osc.start(t);
        osc.stop(t + 0.14);
        this.playNoise(0.08, 0.15);
        break;
      }
      case 'magic': {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, t);
        osc.frequency.linearRampToValueAtTime(950, t + 0.06);
        osc.frequency.exponentialRampToValueAtTime(350, t + 0.18);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.start(t);
        osc.stop(t + 0.18);
        break;
      }
      case 'rocket': {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(250, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);
        gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        osc.start(t);
        osc.stop(t + 0.2);
        this.playNoise(0.18, 0.2);
        break;
      }
      case 'bow': {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(250, t + 0.1);
        gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }
      case 'punch': {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.35);
        gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
        osc.start(t);
        osc.stop(t + 0.35);
        this.playNoise(0.3, 0.35);
        break;
      }
      case 'plasma': {
        osc.type = 'square';
        osc.frequency.setValueAtTime(900, t);
        osc.frequency.linearRampToValueAtTime(400, t + 0.15);
        gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        osc.start(t);
        osc.stop(t + 0.15);
        break;
      }
    }
  }

  public playHit(isCrit: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    if (isCrit) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(850, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.07);
      gain.gain.setValueAtTime(0.18 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
    }

    osc.start(t);
    osc.stop(t + (isCrit ? 0.12 : 0.07));
  }

  public playExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);
    gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);

    this.playNoise(0.3, 0.35);
  }

  public playReflect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.linearRampToValueAtTime(1800, t + 0.08);
    gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  public playShieldBreak() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playShieldRestore() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.15);
    gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playPlayerHurt() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);
    gain.gain.setValueAtTime(0.28 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  public playSkill(hero: string) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    if (hero === 'knight') {
      // Roar / charge
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.linearRampToValueAtTime(500, t + 0.2);
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    } else if (hero === 'rogue') {
      // Fast swoosh
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(200, t + 0.15);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      this.playNoise(0.1, 0.15);
    } else if (hero === 'wizard') {
      // Electric surge
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.linearRampToValueAtTime(1400, t + 0.2);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    } else if (hero === 'gojo') {
      // Limitless Hollow Purple / Red surge
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(1600, t + 0.3);
      gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      this.playNoise(0.2, 0.25);
    } else if (hero === 'goku') {
      // Kamehameha power charge & blast
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.linearRampToValueAtTime(880, t + 0.3);
      gain.gain.setValueAtTime(0.35 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      this.playNoise(0.3, 0.3);
    } else if (hero === 'naruto') {
      // Rasenshuriken wind vortex whistling
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, t + 0.35);
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      this.playNoise(0.2, 0.25);
    } else if (hero === 'luffy') {
      // Giant rubber stretch snap & flame punch
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.1);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.35);
      gain.gain.setValueAtTime(0.4 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      this.playNoise(0.25, 0.35);
    } else if (hero === 'saitama') {
      // Serious Punch cataclysmic sonic boom
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, t);
      osc.frequency.exponentialRampToValueAtTime(20, t + 0.5);
      gain.gain.setValueAtTime(0.45 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      this.playNoise(0.45, 0.45);
    } else if (hero === 'jinwoo') {
      // Shadow Monarch ARISE bell & dark whisper
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.3);
      gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      this.playNoise(0.2, 0.2);
    } else {
      // General magic/power sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, t);
      osc.frequency.exponentialRampToValueAtTime(800, t + 0.2);
      gain.gain.setValueAtTime(0.25 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.06); // E6
    gain.gain.setValueAtTime(0.15 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  public playChestOpen() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playBossWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.3);
    osc.frequency.linearRampToValueAtTime(220, t + 0.6);
    gain.gain.setValueAtTime(0.3 * this.sfxVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  public playLevelClear() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((freq, idx) => {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.2 * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  private playNoise(duration: number, volume: number) {
    if (!this.ctx) return;
    try {
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime;
      gain.gain.setValueAtTime(volume * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

      whiteNoise.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(t);
    } catch {
      // ignore
    }
  }

  // --- PROCEDURAL CHIPTUNE BACKGROUND MUSIC ENGINE ---

  public playMusic(track: 'lobby' | 'dungeon_stage1' | 'dungeon_stage2' | 'dungeon_stage3' | 'boss') {
    this.currentTrack = track;
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }

    let step = 0;
    const tempo = track === 'boss' ? 120 : track === 'lobby' ? 320 : 220; // ms per step

    // Musical scales for procedural dungeon moods
    const lobbyScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C major pentatonic
    const dungeon1Scale = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00]; // A minor
    const dungeon2Scale = [196.00, 207.65, 233.08, 261.63, 293.66, 311.13, 349.23]; // G phrygian / lava
    const dungeon3Scale = [246.94, 277.18, 293.66, 329.63, 369.99, 415.30, 493.88]; // B dorian synth
    const bossScale = [164.81, 174.61, 196.00, 220.00, 246.94, 261.63, 329.63]; // E minor intense

    const scale =
      track === 'lobby'
        ? lobbyScale
        : track === 'dungeon_stage1'
        ? dungeon1Scale
        : track === 'dungeon_stage2'
        ? dungeon2Scale
        : track === 'dungeon_stage3'
        ? dungeon3Scale
        : bossScale;

    this.musicInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || this.musicVolume <= 0) return;
      const t = this.ctx.currentTime;

      // Bass note on every 4 beats
      if (step % 4 === 0) {
        const bassFreq = scale[0] / 2;
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = track === 'boss' ? 'sawtooth' : 'triangle';
        bassOsc.frequency.setValueAtTime(bassFreq, t);
        bassGain.gain.setValueAtTime(0.12 * this.musicVolume, t);
        bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(t);
        bassOsc.stop(t + 0.35);
      }

      // Arpeggiated melody step
      const noteIdx = (step * 3 + (step % 5)) % scale.length;
      if (Math.random() > 0.2) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = track === 'dungeon_stage3' ? 'sawtooth' : 'square';
        leadOsc.frequency.setValueAtTime(scale[noteIdx], t);
        leadGain.gain.setValueAtTime(0.04 * this.musicVolume, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        leadOsc.connect(leadGain);
        leadGain.connect(this.ctx.destination);
        leadOsc.start(t);
        leadOsc.stop(t + 0.18);
      }

      // Hi-hat noise click for rhythm
      if (track !== 'lobby' && (step % 2 === 0 || track === 'boss')) {
        this.playNoise(0.03, 0.04 * this.musicVolume);
      }

      step = (step + 1) % 64;
    }, tempo);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = 'none';
  }
}

export const sound = new SoundController();
