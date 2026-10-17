'use client';

import React, { useState, useEffect } from 'react';
import { eventBus } from '@pao/shared';

interface WindIndicatorProps {
  initialSpeed?: number;
  initialDirection?: 'left' | 'right';
}

/**
 * HUD Bảng Gió Cuộn Mây Đông Hồ (Wind Indicator)
 * Hiển thị hướng và cường độ gió ngẫu nhiên từ -5.0 đến +5.0 với đồ họa mây cuộn mộc bản.
 */
export default function WindIndicator({
  initialSpeed = 1.5,
  initialDirection = 'right',
}: WindIndicatorProps) {
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [direction, setDirection] = useState<'left' | 'right'>(initialDirection);

  useEffect(() => {
    const unsub = eventBus.on('WIND_UPDATED', (data) => {
      setSpeed(Math.abs(Number(data.speed.toFixed(1))));
      setDirection(data.direction);
    });
    return () => unsub();
  }, []);

  return (
    <div className="select-none flex items-center gap-2 bg-diep-light/95 border-moc-ban px-4 py-1.5 rounded-2xl shadow-md backdrop-blur-sm pointer-events-auto">
      {/* Icon Ngọn Gió Đông Hồ */}
      <div className="flex items-center gap-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-cham inline-block" />
        <span className="font-dongho font-bold text-xs text-than uppercase tracking-wide">
          Gió Làng
        </span>
      </div>

      {/* Mũi tên mây cuộn mộc bản chỉ hướng gió */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-diep-paper border border-than/20 shadow-inner">
        <svg
          viewBox="0 0 24 24"
          className={`w-5 h-5 text-cham transition-transform duration-500 ease-out ${
            direction === 'left' ? 'scale-x-[-1]' : 'scale-x-100'
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Mũi tên phong cách mây cuộn uốn lượn */}
          <path d="M5 12h14" />
          <path d="M13 6l6 6-6 6" />
          <path d="M5 8c2-2 4-2 6 0" strokeWidth="1.5" strokeDasharray="1 1" />
        </svg>
      </div>

      {/* Giá trị tốc độ gió */}
      <div className="flex flex-col items-start leading-none">
        <span className="font-dongho font-black text-base text-cham">
          {speed.toFixed(1)} <span className="text-[10px] font-normal text-than/70">m/s</span>
        </span>
        <span className="text-[9px] font-dongho text-than/60">
          {direction === 'right' ? 'Thuận gió (→)' : 'Gió chướng (←)'}
        </span>
      </div>
    </div>
  );
}
