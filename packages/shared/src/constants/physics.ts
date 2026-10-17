/**
 * Hằng số vật lý và thông số cơ chế gameplay cho Sới Pao
 * Dựa trên tài liệu PRD mục 4 & mục 5 và TECH_ARCHITECTURE mục 3
 */

export const GAME_CANVAS_CONFIG = {
  DEFAULT_WIDTH: 2592,
  DEFAULT_HEIGHT: 1419,
  TARGET_FPS: 60,
  PLAYER_LEFT_X: 840,
  PLAYER_RIGHT_X: 1910,
  GROUND_Y: 1110,
} as const;

export const PHYSICS_CONSTANTS = {
  // Trọng lực mặc định trong hệ tọa độ Phaser Arcade (chuẩn hóa theo độ phân giải 2592x1419)
  GRAVITY: 1300,
  // Giới hạn góc ném (độ)
  MIN_ANGLE: 0,
  MAX_ANGLE: 90,
  DEFAULT_ANGLE: 45,
  // Giới hạn lực ném (0 -> 100)
  MIN_POWER: 0,
  MAX_POWER: 100,
  // Tốc độ tích lực (thời gian từ 0 -> 100% là 1500ms)
  POWER_CHARGE_DURATION_MS: 1500,
  // Giới hạn gió (-5.0 đến +5.0)
  MIN_WIND: -5.0,
  MAX_WIND: 5.0,
  // Hệ số gia tốc gió ảnh hưởng lên vận tốc vx
  WIND_FORCE_SCALE: 44,
  // Bán kính vùng đón pao (hitbox radius tính bằng pixel)
  BASE_CATCH_RADIUS: 95,
  // Thời gian 1 lượt ném (giây)
  TURN_DURATION_SEC: 15,
  // Thời gian cửa sổ QTE hiển thị (mili giây)
  QTE_WINDOW_MS: 1200,
  // Dung sai sai lệch thời gian QTE (mili giây)
  QTE_PERFECT_MAX_OFFSET_MS: 80,
  QTE_GOOD_MAX_OFFSET_MS: 200,
  // Mục tiêu điểm Thấu Cảm để kết thúc trận
  TARGET_EMPATHY_POINTS: 100,
} as const;

/**
 * 5 Loại Quả Pao dân gian (Pao Arsenal) theo PRD 5.1
 */
export const PAO_TYPES = {
  PAO_VAI_LANH: {
    id: 'pao_vai_lanh',
    name: 'Pao Vải Lanh Mộc',
    description: 'Quả pao truyền thống, khối lượng cân bằng, quỹ đạo bay mượt mà.',
    mass: 1.0,
    windResistance: 1.0,
    baseEp: 10,
    catchHitboxScale: 1.0,
  },
  PAO_NGO_NUONG: {
    id: 'pao_ngo_nuong',
    name: 'Pao Hạt Ngô Nương',
    description: 'Nặng đầm, kháng gió mạnh, rơi dốc hơn nhưng ít chao đảo.',
    mass: 1.6,
    windResistance: 0.4,
    baseEp: 12,
    catchHitboxScale: 1.0,
  },
  PAO_LONG_TRI: {
    id: 'pao_long_tri',
    name: 'Pao Lông Chim Trĩ',
    description: 'Siêu nhẹ, lượn bồng bềnh hình cánh cung cao.',
    mass: 0.6,
    windResistance: 1.8,
    baseEp: 15,
    catchHitboxScale: 1.0,
  },
  PAO_GAM_NGU_SAC: {
    id: 'pao_gam_ngu_sac',
    name: 'Pao Gấm Ngũ Sắc',
    description: 'Màu sắc sặc sỡ, mở rộng vùng đón bắt thêm 25%.',
    mass: 1.0,
    windResistance: 1.0,
    baseEp: 18,
    catchHitboxScale: 1.25,
  },
  PAO_CHUONG_DONG: {
    id: 'pao_chuong_dong',
    name: 'Pao Chuông Đồng',
    description: 'Leng keng vui tai, tăng thêm thời gian QTE cho người đón.',
    mass: 1.2,
    windResistance: 0.8,
    baseEp: 20,
    catchHitboxScale: 1.0,
    bonusQteWindowMs: 100,
  },
} as const;

export type PaoTypeId = keyof typeof PAO_TYPES;

/**
 * 4 Vật phẩm bổ trợ theo lượt theo PRD 5.2
 */
export const ACTIVE_ITEMS = {
  KHAN_KHANG_GIO: {
    id: 'khan_khang_gio',
    name: 'Dải Khăn Kháng Gió',
    description: 'Hóa giải gió chướng, đưa tốc độ gió về 0.0 trong lượt này.',
  },
  CHI_NGU_SAC: {
    id: 'chi_ngu_sac',
    name: 'Chỉ Ngũ Sắc Đồng Lòng',
    description: 'Vùng bắt QTE của bạn đồng hành mở rộng 1.5 lần, +5 EP nếu đón thành công.',
  },
  CHUONG_CHI_LOI: {
    id: 'chuong_chi_loi',
    name: 'Chuông Đồng Chỉ Lối',
    description: 'Hiển thị 3 chấm quỹ đạo parabol dự kiến trước khi ném.',
  },
  TIENG_KHEN_XUAN: {
    id: 'tieng_khen_xuan',
    name: 'Tiếng Khèn Mời Gọi',
    description: 'Nhân 1.5 lần toàn bộ điểm số nếu lượt đón đạt Good hoặc Perfect.',
  },
} as const;

export type ActiveItemId = keyof typeof ACTIVE_ITEMS;
