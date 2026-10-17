'use client';

import React from 'react';
import { soundManager } from '../game/audio/SoundManager';

interface VictoryModalProps {
  isOpen: boolean;
  leftEp: number;
  rightEp: number;
  winner: 'left' | 'right' | 'draw';
  stats: {
    rounds: number;
    perfectCatches: number;
    goodCatches: number;
  };
  onRestart: () => void;
}

/**
 * Màn Hình Chiến Thắng & Thu Phục Sới Làng (Victory Modal)
 * Tôn vinh tinh thần kết duyên dân gian với con dấu triện đỏ "TÂM ĐẦU Ý HỢP" và phong tặng danh hiệu.
 */
export default function VictoryModal({
  isOpen,
  leftEp,
  rightEp,
  winner,
  stats,
  onRestart,
}: VictoryModalProps) {
  if (!isOpen) return null;

  let title = 'TÂM ĐẦU Ý HỢP';
  let subtitle = 'Cả hai bên đã thấu suốt tâm ý, trao gửi quả pao trọn vẹn tơ duyên!';
  let winnerText = 'HÒA DUYÊN ĐỒNG LÒNG';

  if (winner === 'left') {
    title = 'THU PHỤC SỚI LÀNG';
    subtitle = 'Bé Trai ném pao xuất sắc, tài nghệ khéo léo vang danh hội xuân!';
    winnerText = 'BÉ TRAI ĐẠT DANH HIỆU QUÁN QUÂN';
  } else if (winner === 'right') {
    title = 'TUYỆT KỸ ĐÓN PAO';
    subtitle = 'Bé Gái đón pao thần sầu, nhịp bắt chuẩn xác như thêu gấm dệt hoa!';
    winnerText = 'BÉ GÁI ĐẠT DANH HIỆU NGHỆ NHÂN';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-than/70 backdrop-blur-sm select-none animate-fadeIn">
      {/* Khung mộc bản tranh Đông Hồ */}
      <div className="relative w-full max-w-lg bg-diep-paper border-4 border-than rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col items-center text-center">
        {/* Nền giấy điệp ánh xà cừ hoa văn chìm */}
        <div className="absolute inset-2 border-2 border-dashed border-son/40 rounded-2xl pointer-events-none" />

        {/* CON DẤU TRIỆN ĐỎ DÂN GIAN */}
        <div className="relative mb-3 flex flex-col items-center">
          <div className="w-20 h-20 bg-son border-4 border-than rounded-2xl flex flex-col items-center justify-center text-diep-light shadow-xl rotate-[-3deg] transform hover:rotate-0 transition-transform">
            <span className="font-serif text-2xl font-black leading-tight">心合</span>
            <span className="font-dongho text-[10px] font-bold tracking-widest uppercase">TRIỆN ĐỎ</span>
          </div>
        </div>

        {/* TIÊU ĐỀ CHIẾN THẮNG */}
        <h2 className="font-dongho font-black text-3xl text-son tracking-wider mb-1 drop-shadow">
          {title}
        </h2>
        <p className="font-dongho text-xs font-semibold text-cham mb-4 uppercase tracking-widest">
          {winnerText}
        </p>
        <p className="font-dongho text-sm text-than/85 max-w-sm mb-5 leading-relaxed">
          {subtitle}
        </p>

        {/* BẢNG TỔNG KẾT ĐIỂM THẤU CẢM */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mb-5">
          <div className="bg-diep-light/95 border-moc-ban p-3 rounded-xl flex flex-col items-center">
            <span className="font-dongho text-xs font-bold text-son">Bé Trai (Ném)</span>
            <span className="font-dongho font-black text-2xl text-son">{leftEp}</span>
            <span className="text-[10px] font-medium text-than/60">Điểm Thấu Cảm</span>
          </div>
          <div className="bg-diep-light/95 border-moc-ban p-3 rounded-xl flex flex-col items-center">
            <span className="font-dongho text-xs font-bold text-cham">Bé Gái (Đón)</span>
            <span className="font-dongho font-black text-2xl text-cham">{rightEp}</span>
            <span className="text-[10px] font-medium text-than/60">Điểm Thấu Cảm</span>
          </div>
        </div>

        {/* THỐNG KÊ CHI TIẾT TRẬN ĐẤU */}
        <div className="w-full max-w-sm bg-diep-light/80 border border-than/20 rounded-xl px-4 py-2.5 mb-6 flex justify-around text-xs font-dongho text-than">
          <div className="flex flex-col items-center">
            <span className="font-black text-sm text-than">{stats.rounds}</span>
            <span className="text-[10px] text-than/60">Lượt ném</span>
          </div>
          <div className="w-[1px] h-8 bg-than/20" />
          <div className="flex flex-col items-center">
            <span className="font-black text-sm text-vang-ho">{stats.perfectCatches}</span>
            <span className="text-[10px] text-than/60">Bắt Hoàn Hảo</span>
          </div>
          <div className="w-[1px] h-8 bg-than/20" />
          <div className="flex flex-col items-center">
            <span className="font-black text-sm text-cham">{stats.goodCatches}</span>
            <span className="text-[10px] text-than/60">Bắt Chuẩn Xác</span>
          </div>
        </div>

        {/* NÚT TÁI ĐẤU GIAO DUYÊN */}
        <button
          type="button"
          onClick={() => {
            soundManager.playThrowSFX();
            onRestart();
          }}
          className="group relative px-8 py-3 bg-son hover:bg-son-dark active:scale-95 border-moc-ban rounded-2xl shadow-xl flex items-center gap-2 text-diep-light font-dongho font-black text-lg tracking-wider uppercase transition-all transform"
        >
          <span>🎋</span>
          <span>TÁI ĐẤU GIAO DUYÊN</span>
        </button>
      </div>
    </div>
  );
}
