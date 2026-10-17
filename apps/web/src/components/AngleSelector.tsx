'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus, PHYSICS_CONSTANTS } from '@pao/shared';

interface AngleSelectorProps {
  initialAngle?: number;
  disabled?: boolean;
}

/**
 * Thước Đo Góc Nan Quạt Mây Lửa Đông Hồ
 * Tái hiện chính xác hình ảnh nan quạt từ Tuagame.png
 */
export default function AngleSelector({
  initialAngle = PHYSICS_CONSTANTS.DEFAULT_ANGLE,
  disabled = false,
}: AngleSelectorProps) {
  const [angle, setAngle] = useState<number>(initialAngle);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleAngleUpdate = useCallback(
    (newAngle: number) => {
      const clamped = Math.max(
        PHYSICS_CONSTANTS.MIN_ANGLE,
        Math.min(PHYSICS_CONSTANTS.MAX_ANGLE, Math.round(newAngle))
      );
      setAngle(clamped);
      eventBus.emit('ANGLE_CHANGED', { angle: clamped });
    },
    []
  );

  const calculateAngleFromPoint = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const originX = rect.left + 30;
    const originY = rect.bottom - 20;

    const dx = clientX - originX;
    const dy = originY - clientY;

    if (dx <= 0 && dy <= 0) return;

    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI;

    if (deg < 0) deg = 0;
    if (deg > 90) deg = 90;

    handleAngleUpdate(deg);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    isDraggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    calculateAngleFromPoint(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || disabled) return;
    calculateAngleFromPoint(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    eventBus.emit('ANGLE_CHANGED', { angle });
  }, []);

  // Tính góc xoay cho kim chỉ (0° nằm ngang, 90° thẳng đứng)
  // Góc nan quạt: 0 độ là hướng sang phải, 90 độ là hướng lên trên
  const needleRotation = -angle;

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative select-none cursor-pointer transition-transform duration-150 touch-none flex flex-col items-center ${
        disabled ? 'opacity-60 pointer-events-none' : 'opacity-100 hover:scale-[1.02]'
      }`}
      title="Vuốt để căn góc ném"
    >
      {/* Hình ảnh thước nan quạt mây lửa từ Tuagame */}
      <div className="relative w-32 sm:w-40 md:w-44 h-auto">
        <img
          src="/assets/hud_angle_fan.png"
          alt="Thước Góc Nan Quạt"
          className="w-full h-auto drop-shadow-md object-contain"
          draggable={false}
        />

        {/* Kim chỉ góc màu son động xoay theo giá trị angle */}
        <div
          className="absolute left-[20%] bottom-[15%] w-1 sm:w-1.5 h-16 sm:h-20 origin-bottom pointer-events-none transition-transform duration-75"
          style={{
            transform: `rotate(${needleRotation + 45}deg)`,
          }}
        >
          <div className="w-full h-full bg-[#c73e3a] rounded-full shadow relative">
            <div className="w-2.5 h-2.5 bg-[#e5a823] border border-[#1f1e1b] rounded-full -top-1 -left-0.5 sm:-left-0.5 absolute shadow-sm" />
          </div>
        </div>

        {/* Nhãn số góc hiển thị phong cách cổ */}
        <div className="absolute top-1 right-2 bg-[#2d221a]/90 border border-[#e5a823]/60 px-2 py-0.5 rounded text-[11px] sm:text-xs font-serif font-black text-[#f5ecd7] shadow">
          {angle}°
        </div>
      </div>
    </div>
  );
}
