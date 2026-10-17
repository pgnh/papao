import type { PaoTypeId, ActiveItemId } from '../constants/physics';

/**
 * Đánh giá kết quả QTE đón Pao
 */
export type CatchGrade = 'PERFECT' | 'GOOD' | 'MISS' | 'NONE';

/**
 * Thông tin hồ sơ người chơi (Player Profile)
 */
export interface PlayerProfile {
  id: string;
  name: string;
  avatarId: 'be_trai_dong_ho' | 'be_gai_dong_ho';
  title: string;
  level: number;
  unlockedPaos: PaoTypeId[];
  inventoryItems: {
    itemId: ActiveItemId;
    quantity: number;
  }[];
  stats: {
    totalMatches: number;
    victories: number;
    perfectCatches: number;
    highestStreak: number;
  };
}

/**
 * Thông tin Sới Làng ngoài đời thực (LBS POI)
 */
export interface SoiVillagePOI {
  id: string;
  name: string;
  geohash: string;
  lat: number;
  lng: number;
  culturalDescription: string;
  weatherModifier: {
    baseWindSpeed: number;
    windDirectionTrend: 'random' | 'east' | 'west';
  };
  bonusEmpathyRate: number;
}

/**
 * Dữ liệu quỹ đạo ném pao
 */
export interface TrajectoryData {
  angle: number;
  power: number;
  wind: number;
  paoType: PaoTypeId;
  activeItem?: ActiveItemId;
}

/**
 * Kết quả lượt ném và đón
 */
export interface RoundResult {
  roundNumber: number;
  throwerId: string;
  catcherId: string;
  paoLanded: boolean;
  qteGrade: CatchGrade;
  empathyGained: {
    throwerGained: number;
    catcherGained: number;
  };
  totalEmpathy: {
    [playerId: string]: number;
  };
  flavorMessage: string;
}
