/**
 * Bảng màu Ngũ Sắc Tranh Mộc Bản Đông Hồ (The Five Natural Pigments of Dong Ho Folk Art)
 * Dựa trên tài liệu đặc tả PRD và TECH_ARCHITECTURE
 */
export const DONG_HO_COLORS = {
  // Màu Điệp: Nền giấy điệp làm từ vỏ sò điệp nghiền mịn trộn hồ nếp, có ánh xà cừ lấp lánh
  DIEP: '#F7F2E7',
  DIEP_LIGHT: '#FFFDF8',
  DIEP_DARK: '#EADFC9',

  // Màu Son: Lấy từ sỏi son đỏ trên núi, dùng cho mái đình, khăn áo, con dấu triện đỏ
  SON: '#C73E3A',
  SON_LIGHT: '#E05A56',
  SON_DARK: '#982824',

  // Màu Chàm: Lấy từ lá chàm ngâm vôi, dùng cho trang phục bé trai/bé gái, rặng núi xa
  CHAM: '#2E4E6B',
  CHAM_LIGHT: '#4A7299',
  CHAM_DARK: '#1C3247',

  // Màu Vàng Hòe: Lấy từ hoa hòe phơi khô, dùng cho dải mây, bãi cát, quả pao
  VANG_HOE: '#E5A823',
  VANG_HOE_LIGHT: '#F5C75D',
  VANG_HOE_DARK: '#B88114',

  // Màu Than Tre: Than lá tre đốt chín, nét viền mộc bản đen mộc mạc và chữ khắc gỗ
  THAN_TRE: '#1F1E1B',
  THAN_TRE_LIGHT: '#383632',

  // Màu Trúc Xanh: Sắc xanh cây tre làng quê Bắc Bộ
  TRUC_XANH: '#4A6B45',
} as const;

export type DongHoColorKey = keyof typeof DONG_HO_COLORS;
