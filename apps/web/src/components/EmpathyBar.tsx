'use client';

import React, { useState, useEffect } from 'react';
import { eventBus, PHYSICS_CONSTANTS } from '@pao/shared';

interface EmpathyBarProps {
  playerLeftName?: string;
  playerRightName?: string;
  initialLeftEp?: number;
  initialRightEp?: number;
}

/**
 * Thanh Điểm Thấu Cảm (Empathy Points - EP 0 -> 100)
 * Thay thế hoàn toàn thanh máu truyền thống bằng cơ chế gắn kết phi bạo lực dân gian.
 */
export default function EmpathyBar({
  playerLeftName = 'Bé Trai (Ném)',
  playerRightName = 'Bé Gái (Đón)',
  initialLeftEp = 0,
  initialRightEp = 0,
}: EmpathyBarProps) {
  const [leftEp, setLeftEp] = useState<number>(initialLeftEp);
  const [rightEp, setRightEp] = useState<number>(initialRightEp);

  useEffect(() => {
    const unsub = eventBus.on('EMPATHY_POINTS_UPDATED', (data) => {
      if (typeof data.left === 'number') {
        setLeftEp(Math.min(PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS, Math.max(0, data.left)));
      }
      if (typeof data.right === 'number') {
        setRightEp(Math.min(PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS, Math.max(0, data.right)));
      }
    });

    return () => unsub();
  }, []);

  return (
    <div className="select-none flex items-center justify-between w-full max-w-3xl px-4 py-2 bg-diep-light/95 border-moc-ban rounded-2xl shadow-lg backdrop-blur-sm pointer-events-auto">
      {/* BÊN TRÁI: ĐIỂM BÊN NÉM (MÀU SON) */}
      <div className="flex-1 flex flex-col items-start mr-3">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="font-dongho font-bold text-xs text-son truncate max-w-[120px]">
            {playerLeftName}
          </span>
          <span className="font-dongho font-black text-sm text-son">
            {leftEp} <span className="text-[10px] font-normal text-than/60">/ 100 EP</span>
          </span>
        </div>
        {/* Khung thanh EP bên trái */}
        <div className="relative w-full h-4 bg-diep-paper border border-than/30 rounded-full overflow-hidden shadow-inner flex items-center justify-end p-0.5">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out shadow flex items-center justify-start pl-1"
            style={{
              width: `${leftEp}%`,
              background: 'linear-gradient(90deg, #EADFC9 0%, #C73E3A 100%)',
            }}
          >
            {leftEp > 10 && <div className="w-1.5 h-1.5 bg-diep-light rounded-full animate-ping" />}
          </div>
        </div>
      </div>

      {/* TÂM: BIỂU TƯỢNG KẾT DUYÊN / THẤU CẢM */}
      <div className="flex flex-col items-center justify-center px-2">
        <div className="w-9 h-9 rounded-full bg-diep-paper border-moc-ban flex items-center justify-center shadow-md">
          {/* Họa tiết hoa sen / quả pao giao duyên */}
          <span className="font-serif text-son text-lg font-bold" title="Điểm Thấu Cảm Phi Bạo Lực">
            🎋
          </span>
        </div>
        <span className="font-dongho font-bold text-[9px] text-than/70 uppercase tracking-tighter mt-0.5">
          Thấu Cảm
        </span>
      </div>

      {/* BÊN PHẢI: ĐIỂM BÊN ĐÓN (MÀU CHÀM) */}
      <div className="flex-1 flex flex-col items-end ml-3">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="font-dongho font-black text-sm text-cham">
            {rightEp} <span className="text-[10px] font-normal text-than/60">/ 100 EP</span>
          </span>
          <span className="font-dongho font-bold text-xs text-cham truncate max-w-[120px]">
            {playerRightName}
          </span>
        </div>
        {/* Khung thanh EP bên phải */}
        <div className="relative w-full h-4 bg-diep-paper border border-than/30 rounded-full overflow-hidden shadow-inner flex items-center justify-start p-0.5">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out shadow flex items-center justify-end pr-1"
            style={{
              width: `${rightEp}%`,
              background: 'linear-gradient(90deg, #2E4E6B 0%, #E5A823 100%)',
            }}
          >
            {rightEp > 10 && <div className="w-1.5 h-1.5 bg-diep-light rounded-full animate-ping" />}
          </div>
        </div>
      </div>
    </div>
  );
}
