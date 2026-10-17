'use client';

import React, { useState, useEffect } from 'react';
import { eventBus, PHYSICS_CONSTANTS } from '@pao/shared';

interface TopStatusBarProps {
  leftEp: number;   // 0 -> 100 Điểm Thấu Cảm (Bé Trai - Bạn)
  rightEp: number;  // 0 -> 100 Điểm Thấu Cảm (Bé Gái - Bot AI)
  onOpenMap?: () => void;
  onToggleSound?: () => void;
  isMuted?: boolean;
}

/**
 * Thanh trạng thái đỉnh màn hình chuẩn mỹ học Đông Hồ:
 * - Thay thế hoàn toàn thanh máu (HP) bằng thanh Thấu Cảm (0 -> 100 EP) phi bạo lực theo PRD 2.2.
 * - Hiển thị Bảng Gió Làng và Thời Gian Lượt 15s.
 * - Che phủ 100% thanh HP và nhãn số tĩnh từ ảnh nền cũ.
 */
export default function TopStatusBar({
  leftEp,
  rightEp,
  onOpenMap,
  onToggleSound,
  isMuted = false,
}: TopStatusBarProps) {
  const [wind, setWind] = useState<{ speed: number; direction: 'left' | 'right' }>({
    speed: 1.5,
    direction: 'right',
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(PHYSICS_CONSTANTS.TURN_DURATION_SEC);

  useEffect(() => {
    const unsubWind = eventBus.on('WIND_UPDATED', (data) => setWind(data));
    const unsubTurn = eventBus.on('START_AIMING', () => {
      setSecondsRemaining(PHYSICS_CONSTANTS.TURN_DURATION_SEC);
    });

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      unsubWind();
      unsubTurn();
      clearInterval(timer);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const leftPct = Math.min(100, Math.max(0, leftEp));
  const rightPct = Math.min(100, Math.max(0, rightEp));

  return (
    <header className="relative w-full h-[12.5%] min-h-[46px] sm:min-h-[58px] z-30 select-none pointer-events-auto px-2 sm:px-4 flex items-center justify-between bg-[#231a14] border-b-2 border-[#544033] shadow-2xl">
      {/* 1. GÓC TRÁI: HUY HIỆU SỚI LÀNG (Thay thế minimap tĩnh) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onOpenMap}
          className="flex items-center gap-1.5 px-2 sm:px-3 py-1 bg-[#2b1f17] hover:bg-[#3d2e24] border-2 border-[#e5a823]/60 rounded-xl shadow transition-transform active:scale-95"
          title="Xem Bản Đồ Sới Làng"
        >
          <span className="text-xs sm:text-sm">📍</span>
          <div className="flex flex-col text-left leading-none">
            <span className="font-serif font-black text-[10px] sm:text-xs text-[#f5ecd7] tracking-wide">
              Đình Làng Đông Hồ
            </span>
            <span className="font-serif text-[8px] sm:text-[9px] text-[#e5a823] mt-0.5">
              Sới Hội Xuân
            </span>
          </div>
        </button>
      </div>

      {/* 2. CỤM TRUNG TÂM: HAI THANH THẤU CẢM (EP) & BẢNG GIÓ + ĐẾM NGƯỢC */}
      <div className="flex-1 max-w-xl lg:max-w-2xl mx-2 sm:mx-4 flex items-center justify-center">
        {/* THANH THẤU CẢM BÊN TRÁI: BÉ TRAI (BẠN) */}
        <div className="flex-1 flex flex-col items-end pr-1 sm:pr-2">
          <div className="flex items-center justify-between w-full mb-0.5 px-1">
            <span className="font-serif font-black text-[10px] sm:text-xs text-[#f5ecd7] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#c73e3a]" />
              Bé Trai (Bạn)
            </span>
            <span className="font-mono font-bold text-[10px] sm:text-xs text-[#e5a823]">
              {leftEp} <span className="text-[9px] font-serif text-[#f5ecd7]/70">/ 100 EP</span>
            </span>
          </div>
          {/* Rãnh thanh Thấu Cảm */}
          <div className="relative w-full h-3.5 sm:h-4 bg-[#140e0a] rounded-full border border-[#544033] shadow-inner overflow-hidden p-0.5 flex items-center justify-end">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8a1c1d] via-[#c73e3a] to-[#e5a823] transition-all duration-500 shadow"
              style={{ width: `${leftPct}%` }}
            />
          </div>
        </div>

        {/* BIỂN TRUNG TÂM: TRẬN GIÓ & ĐẾM NGƯỢC (Che phủ hoàn toàn ô 00:6:50 cũ) */}
        <div className="relative z-10 flex flex-col items-center px-1 sm:px-2">
          <div className="bg-[#2b1f17] border-2 border-[#8c6b45] px-2.5 sm:px-3.5 py-0.5 rounded-lg shadow-xl flex flex-col items-center min-w-[90px] sm:min-w-[105px]">
            <span className="font-serif font-black text-[9px] sm:text-[10px] tracking-widest text-[#f5ecd7] uppercase">
              TRẬN GIÓ
            </span>
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold text-[#e5a823]">
              <span className="text-xs">{wind.direction === 'right' ? '➔' : '⬅'}</span>
              <span>{wind.speed.toFixed(1)} m/s</span>
            </div>
          </div>

          {/* Viên thuốc đếm ngược lượt 15s */}
          <div className="bg-[#120c08] border border-[#e5a823]/40 px-2 py-0.2 rounded-full -mt-1 shadow-md">
            <span className="font-mono font-black text-[10px] sm:text-[11px] text-[#fbf6ea] tracking-wider">
              {formatTimer(secondsRemaining)}
            </span>
          </div>
        </div>

        {/* THANH THẤU CẢM BÊN PHẢI: BÉ GÁI (BOT AI) */}
        <div className="flex-1 flex flex-col items-start pl-1 sm:pl-2">
          <div className="flex items-center justify-between w-full mb-0.5 px-1">
            <span className="font-mono font-bold text-[10px] sm:text-xs text-[#e5a823]">
              {rightEp} <span className="text-[9px] font-serif text-[#f5ecd7]/70">/ 100 EP</span>
            </span>
            <span className="font-serif font-black text-[10px] sm:text-xs text-[#f5ecd7] flex items-center gap-1">
              Bé Gái (Bot AI)
              <span className="w-2 h-2 rounded-full bg-[#2e4e6b]" />
            </span>
          </div>
          {/* Rãnh thanh Thấu Cảm */}
          <div className="relative w-full h-3.5 sm:h-4 bg-[#140e0a] rounded-full border border-[#544033] shadow-inner overflow-hidden p-0.5 flex items-center justify-start">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#1d3549] via-[#2e4e6b] to-[#e5a823] transition-all duration-500 shadow"
              style={{ width: `${rightPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. GÓC PHẢI: NÚT ÂM THANH & CÀI ĐẶT */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleSound}
          className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2b1f17] hover:bg-[#3d2e24] border-2 border-[#e5a823]/60 rounded-xl shadow flex items-center justify-center text-sm transition-transform active:scale-95"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
}
