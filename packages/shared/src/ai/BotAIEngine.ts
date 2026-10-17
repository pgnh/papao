import { PHYSICS_CONSTANTS, GAME_CANVAS_CONFIG, PAO_TYPES, type PaoTypeId } from '../constants/physics';
import type { CatchGrade } from '../types/game';

export interface BotDecision {
  angle: number;           // 0 -> 90 độ
  power: number;           // 0 -> 100%
  paoType: PaoTypeId;
  confidence: number;      // 0 -> 1
  aimDelayMs: number;      // Thời gian giả lập bot ngắm bắn (1000 - 2500ms)
}

export type BotDifficulty = 'EASY' | 'NORMAL' | 'EXPERT';

/**
 * Trí Tuệ Nhân Tạo Solo Bot Bé Đông Hồ (Bot AI Engine)
 * Sử dụng động học nghịch đảo (Inverse Kinematics) kết hợp biến ngẫu nhiên Gauss (Box-Muller)
 * để mô phỏng hành vi ném và đón pao tự nhiên như người thật.
 */
export class BotAIEngine {
  /**
   * Tạo số ngẫu nhiên theo phân phối chuẩn Gauss chuẩn tắc N(0, 1) bằng thuật toán Box-Muller
   */
  private static gaussianRandom(): number {
    let u = 0;
    let v = 0;
    while (u === 0) u = Math.random(); // Tránh log(0)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  /**
   * Tính toán góc và lực ném cho Bot Bé Đông Hồ
   * 
   * @param fromX Tọa độ X người ném (mặc định bên phải hoặc bên trái)
   * @param toX Tọa độ X người đón
   * @param windSpeed Tốc độ và hướng gió (-5.0 đến +5.0, dương là thổi từ trái sang phải)
   * @param isThrowingLeftToRight True nếu ném từ trái sang phải, False nếu ném từ phải sang trái
   * @param difficulty Mức độ khó ('EASY' | 'NORMAL' | 'EXPERT')
   * @param paoType Loại quả Pao đang trang bị
   */
  public static calculateThrowDecision(
    fromX: number = GAME_CANVAS_CONFIG.PLAYER_RIGHT_X,
    toX: number = GAME_CANVAS_CONFIG.PLAYER_LEFT_X,
    windSpeed: number = 0,
    isThrowingLeftToRight: boolean = false,
    difficulty: BotDifficulty = 'NORMAL',
    paoType: PaoTypeId = 'PAO_VAI_LANH'
  ): BotDecision {
    const distance = Math.abs(toX - fromX);
    const g = PHYSICS_CONSTANTS.GRAVITY; // 650

    // 1. Chọn góc cơ bản lý thuyết (thường quanh 45° - 55° cho đường cong cầu mây đẹp)
    const baseAngle = 45 + Math.random() * 8; // 45° - 53°
    const rad = (baseAngle * Math.PI) / 180;

    // 2. Tính vận tốc lý thuyết v0 cơ bản không có gió: R = (v0^2 * sin(2a)) / g
    const sin2a = Math.sin(2 * rad);
    const vBase = Math.sqrt((g * distance) / Math.max(0.2, sin2a));

    // Quy đổi v0 sang power: v0 = power * 10.6 => power = v0 / 10.6
    let basePower = vBase / 10.6;

    // 3. Bù trừ ảnh hưởng của gió (Wind Compensation)
    // Nếu gió cùng chiều ném -> pao bay xa hơn -> bot giảm lực
    // Nếu gió ngược chiều ném -> pao bị cản lại -> bot tăng lực
    const paoConfig = PAO_TYPES[paoType] || PAO_TYPES.PAO_VAI_LANH;
    const windResistance = paoConfig.windResistance || 1.0;

    // Hướng gió hiệu dụng đối với hướng ném
    // windSpeed > 0 là gió thổi sang phải (thuận chiều nếu ném L->R, ngược chiều nếu ném R->L)
    const relativeWind = isThrowingLeftToRight ? windSpeed : -windSpeed;
    const windAdjustment = -relativeWind * 2.8 * windResistance;
    basePower += windAdjustment;

    // 4. Áp dụng độ lệch ngẫu nhiên Gaussian (Human-like Error) theo mức khó
    let sigmaAngle = 2.5;
    let sigmaPower = 3.0;

    if (difficulty === 'EASY') {
      sigmaAngle = 5.5;
      sigmaPower = 6.0;
    } else if (difficulty === 'EXPERT') {
      sigmaAngle = 1.0;
      sigmaPower = 1.5;
    }

    const angleNoise = this.gaussianRandom() * sigmaAngle;
    const powerNoise = this.gaussianRandom() * sigmaPower;

    const finalAngle = Math.max(
      20,
      Math.min(80, Math.round(baseAngle + angleNoise))
    );
    const finalPower = Math.max(
      15,
      Math.min(100, Math.round(basePower + powerNoise))
    );

    // Thời gian giả lập bot căn chỉnh góc và lực (1200ms - 2200ms)
    const aimDelayMs = Math.floor(1200 + Math.random() * 1000);

    return {
      angle: finalAngle,
      power: finalPower,
      paoType,
      confidence: Math.max(0.3, 1 - (Math.abs(angleNoise) + Math.abs(powerNoise)) / 20),
      aimDelayMs,
    };
  }

  /**
   * Mô phỏng hành vi bấm nút đón QTE của Bot Bé Đông Hồ
   * 
   * @param difficulty Mức độ khó
   * @returns Đánh giá kết quả (PERFECT, GOOD, MISS) kèm sai số mili giây
   */
  public static decideCatchQTE(
    difficulty: BotDifficulty = 'NORMAL'
  ): { grade: CatchGrade; offsetMs: number } {
    const roll = Math.random();

    let perfectThreshold = 0.45; // 45% Perfect
    let goodThreshold = 0.85;    // 40% Good, 15% Miss

    if (difficulty === 'EASY') {
      perfectThreshold = 0.25;
      goodThreshold = 0.70;
    } else if (difficulty === 'EXPERT') {
      perfectThreshold = 0.70;
      goodThreshold = 0.95;
    }

    if (roll < perfectThreshold) {
      // Perfect: Sai lệch trong khoảng [-50ms, +50ms]
      const offsetMs = Math.round((Math.random() * 100 - 50));
      return { grade: 'PERFECT', offsetMs };
    } else if (roll < goodThreshold) {
      // Good: Sai lệch trong khoảng [85ms, 170ms] hoặc [-170ms, -85ms]
      const sign = Math.random() > 0.5 ? 1 : -1;
      const offsetMs = Math.round(sign * (85 + Math.random() * 85));
      return { grade: 'GOOD', offsetMs };
    } else {
      // Miss: Bấm quá trễ hoặc hụt nhịp (> 250ms)
      const offsetMs = Math.round(250 + Math.random() * 150);
      return { grade: 'MISS', offsetMs };
    }
  }
}
