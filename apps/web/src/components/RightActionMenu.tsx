'use client';

import React from 'react';

interface RightActionMenuProps {
  onOpenPaoPouch?: () => void;
  onOpenInventory?: () => void;
  onOpenVillageMap?: () => void;
}

/**
 * Menu Hành Động Bên Phải chuẩn mỹ thuật Đông Hồ:
 * - Thay thế "Túi bi" bằng "Túi Pao" (PRD 5.1).
 * - Thay thế "Cường hóa" bằng "Đồ Đạc & Sới Làng" (PRD 5.2 & PRD 6).
 * - Loại bỏ hoàn toàn hình ảnh seal_cuonghoa có watermark logo Gemini.
 * - Sử dụng huy hiệu Trống Đồng Đông Sơn (emblem_trongdong.png) trang trọng, mộc mạc.
 * - Thiết kế khối gỗ mộc bản phủ kín mép phải, che lấp toàn bộ các nút tĩnh cũ.
 */
export default function RightActionMenu({
  onOpenPaoPouch,
  onOpenInventory,
  onOpenVillageMap,
}: RightActionMenuProps) {
  return (
    <aside className="w-full h-full bg-[#231a14] border-l-2 border-[#544033] shadow-2xl flex flex-col items-center justify-between py-2 sm:py-3.5 px-1 select-none pointer-events-auto">
      {/* PHẦN TRÊN: CÁC NÚT TÍNH NĂNG CHÍNH */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full">
        {/* 1. NÚT TÚI PAO (5 Loại quả Pao dân gian - PRD 5.1) */}
        <button
          type="button"
          onClick={onOpenPaoPouch}
          className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 w-full"
          title="Túi Pao: Pao Vải Lanh, Pao Ngô Nương, Pao Gấm, v.v."
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fbf6ea] border-2 border-[#8c6b45] shadow flex items-center justify-center text-base sm:text-lg group-hover:border-[#c73e3a] group-hover:shadow-[0_0_10px_rgba(199,62,58,0.5)]">
            🧶
          </div>
          <span className="font-serif font-black text-[9px] sm:text-[10px] text-[#f5ecd7] tracking-tight leading-none">
            Túi Pao
          </span>
        </button>

        {/* 2. NÚT ĐỒ ĐẠC (4 Vật phẩm bổ trợ thổ cẩm - PRD 5.2) */}
        <button
          type="button"
          onClick={onOpenInventory}
          className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 w-full"
          title="Đồ Đạc: Dải Khăn Kháng Gió, Chỉ Ngũ Sắc, Tiếng Khèn"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fbf6ea] border-2 border-[#8c6b45] shadow flex items-center justify-center text-base sm:text-lg group-hover:border-[#c73e3a] group-hover:shadow-[0_0_10px_rgba(199,62,58,0.5)]">
            🧺
          </div>
          <span className="font-serif font-black text-[9px] sm:text-[10px] text-[#f5ecd7] tracking-tight leading-none">
            Đồ Đạc
          </span>
        </button>

        {/* 3. NÚT SỚI LÀNG (Bản đồ danh thắng & sới đấu LBS - PRD 6) */}
        <button
          type="button"
          onClick={onOpenVillageMap}
          className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95 w-full"
          title="Sới Làng: Đình Làng, Sới Cát Cát, Đồng Văn"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#fbf6ea] border-2 border-[#8c6b45] shadow flex items-center justify-center text-base sm:text-lg group-hover:border-[#c73e3a] group-hover:shadow-[0_0_10px_rgba(199,62,58,0.5)]">
            ⛩️
          </div>
          <span className="font-serif font-black text-[9px] sm:text-[10px] text-[#f5ecd7] tracking-tight leading-none">
            Sới Làng
          </span>
        </button>
      </div>

      {/* PHẦN DƯỚI: PHÙ ĐIÊU HOA VĂN TRỐNG ĐỒNG (THAY THẾ TRIỆN CƯỜNG HÓA CÓ WATERMARK) */}
      <div className="pt-2 border-t border-[#544033]/70 flex flex-col items-center w-full">
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#c73e3a]/70 shadow-lg bg-[#2b1f17] flex items-center justify-center"
          title="Hoa Văn Trống Đồng Đông Sơn - Biểu tượng văn hóa dân gian Việt Nam"
        >
          <img
            src="/assets/emblem_trongdong.png"
            alt="Trống Đồng"
            className="w-full h-full object-contain p-0.5"
            draggable={false}
          />
        </div>
        <span className="font-serif font-black text-[9px] text-[#e5a823] mt-1 tracking-tight leading-none">
          Hội Làng
        </span>
      </div>
    </aside>
  );
}
