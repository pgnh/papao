'use client';

/**
 * Quản lý Âm Thanh Dân Gian Đông Hồ (Vietnamese Folk Sound Manager)
 * Sử dụng Web Audio API thuần để phát sinh âm nhạc ngũ cung dân tộc (Pentatonic scale)
 * và các hiệu ứng âm thanh (SFX) mộc bản 100% offline mà không tốn dung lượng tải trang.
 */
export class FolkSoundManager {
  private static instance: FolkSoundManager;
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private isBgmPlaying: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('pao_sound_muted');
      this.isMuted = savedMute === 'true';
    }
  }

  public static getInstance(): FolkSoundManager {
    if (!FolkSoundManager.instance) {
      FolkSoundManager.instance = new FolkSoundManager();
    }
    return FolkSoundManager.instance;
  }

  /**
   * Khởi tạo AudioContext sau tương tác đầu tiên của người dùng
   */
  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('pao_sound_muted', String(muted));
    }
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * SFX: Tiếng "Vút!" nhẹ của lụa xé gió khi vung tay ném pao
   */
  public playThrowSFX(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;

    // Tần số quét từ thấp lên cao rồi giảm nhẹ (Vút gió)
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * SFX: Tiếng "Bốp!" ấm êm ôm trọn quả pao + tiếng chuông ngân khi Đón thành công
   */
  public playCatchSuccessSFX(isPerfect: boolean = false): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Tiếng "Bốp!" của quả cầu vải lanh ôm vào lòng
    const drumOsc = ctx.createOscillator();
    const drumGain = ctx.createGain();
    drumOsc.type = 'triangle';
    drumOsc.frequency.setValueAtTime(160, now);
    drumOsc.frequency.exponentialRampToValueAtTime(50, now + 0.12);

    drumGain.gain.setValueAtTime(0.35, now);
    drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    drumOsc.connect(drumGain);
    drumGain.connect(ctx.destination);
    drumOsc.start(now);
    drumOsc.stop(now + 0.16);

    // 2. Tiếng chuông đồng ngân vang (Chuông bát / chuông đồng dân gian)
    const bellFrequencies = isPerfect ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25];
    bellFrequencies.forEach((freq, idx) => {
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(freq, now + idx * 0.04);

      const startTime = now + idx * 0.04;
      const duration = isPerfect ? 0.7 : 0.45;
      bellGain.gain.setValueAtTime(0.2, startTime);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start(startTime);
      bellOsc.stop(startTime + duration + 0.02);
    });
  }

  /**
   * SFX: Tiếng "Bịch" rơi đất nhẹ khi ném trượt hoặc hụt nhịp
   */
  public playGroundMissSFX(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.14);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * SFX: Tiếng trống hội & pháo hoa chúc mừng chiến thắng "TÂM ĐẦU Ý HỢP"
   */
  public playVictoryFanfare(): void {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Điệu ngũ cung Hò - Xự - Xang - Xê - Cống mừng hội xuân (C - D - F - G - A)
    const melody = [261.63, 293.66, 349.23, 392.0, 440.0, 523.25];

    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.14);

      const startTime = now + i * 0.14;
      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.55);
    });
  }

  /**
   * BGM: Nhạc nền Ngũ Cung Việt Nam mộc bản (Sáo trúc & Mõ tre nhẹ nhàng)
   */
  public startBGM(): void {
    if (this.isMuted || this.isBgmPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    this.isBgmPlaying = true;
    // Điệu nhạc Ngũ Cung Bắc (C4, D4, F4, G4, A4, C5)
    const pentatonicNotes = [261.63, 293.66, 349.23, 392.0, 440.0, 523.25];
    let noteIndex = 0;

    const playNote = () => {
      if (!this.isBgmPlaying || this.isMuted || !this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Tiếng sáo trúc / đàn tính ngân nga êm dịu
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      const freq = pentatonicNotes[noteIndex % pentatonicNotes.length];
      noteIndex = (noteIndex + Math.floor(1 + Math.random() * 2)) % pentatonicNotes.length;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.04, t + 0.2); // Âm lượng nền êm dịu (4%)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 1.25);
    };

    // Chu kỳ nốt nhạc mỗi 800ms mang nhịp điệu thong dong ngày hội xuân
    this.bgmInterval = window.setInterval(playNote, 850);
  }

  public stopBGM(): void {
    this.isBgmPlaying = false;
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundManager = FolkSoundManager.getInstance();
