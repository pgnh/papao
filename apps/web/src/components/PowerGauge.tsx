'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus, PHYSICS_CONSTANTS, type PaoTypeId, type ActiveItemId } from '@pao/shared';

interface PowerGaugeProps {
  currentAngle: number;
  currentPaoType?: PaoTypeId;
  currentActiveItem?: ActiveItemId;
  disabled?: boolean;
  onThrowTriggered?: (power: number) => void;
}

/**
 * Thanh Lực Mộc Bản & Nút Triện Thư Pháp "BẮN"
 * Tái hiện chính xác thiết kế góc dưới bên trái từ Tuagame.png
 */
export default function PowerGauge({
  currentAngle,
  currentPaoType = 'PAO_VAI_LANH',
  currentActiveItem,
  disabled = false,
  onThrowTriggered,
}: PowerGaugeProps) {
  const [power, setPower] = useState<number>(0);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const chargeStartRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const powerRef = useRef<number>(0);

  const updatePower = (newPower: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPower)));
    powerRef.current = clamped;
    setPower(clamped);
    eventBus.emit('POWER_CHANGED', { power: clamped });
  };

  const chargeLoop = useCallback(() => {
    if (!chargeStartRef.current) return;
    const elapsed = Date.now() - chargeStartRef.current;
    const duration = PHYSICS_CONSTANTS.POWER_CHARGE_DURATION_MS;

    const cycle = (elapsed % (duration * 2)) / duration;
    let computedPower: number;
    if (cycle <= 1) {
      computedPower = cycle * 100;
    } else {
      computedPower = (2 - cycle) * 100;
    }

    updatePower(computedPower);
    animFrameRef.current = requestAnimationFrame(chargeLoop);
  }, []);

  const startCharging = useCallback(() => {
    if (disabled || isCharging) return;
    setIsCharging(true);
    chargeStartRef.current = Date.now();
    updatePower(0);
    animFrameRef.current = requestAnimationFrame(chargeLoop);
  }, [disabled, isCharging, chargeLoop]);

  const releaseAndThrow = useCallback(() => {
    if (!isCharging) return;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsCharging(false);
    chargeStartRef.current = null;

    const finalPower = Math.max(8, powerRef.current);

    eventBus.emit('TRIGGER_THROW', {
      angle: currentAngle,
      power: finalPower,
      paoType: currentPaoType,
      activeItem: currentActiveItem,
    });

    onThrowTriggered?.(finalPower);

    setTimeout(() => {
      updatePower(0);
    }, 400);
  }, [isCharging, currentAngle, currentPaoType, currentActiveItem, onThrowTriggered]);

  const stepPower = (delta: number) => {
    if (disabled || isCharging) return;
    updatePower(power + delta);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !disabled && !isCharging) {
        e.preventDefault();
        startCharging();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isCharging) {
        e.preventDefault();
        releaseAndThrow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [disabled, isCharging, startCharging, releaseAndThrow]);

  return (
    <div
      className={`relative select-none flex items-center gap-2 sm:gap-3 transition-opacity ${
        disabled ? 'opacity-60 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. THANH LỰC MỘC BẢN CUỘN GIẤY DÓ */}
      <div className="relative w-56 sm:w-72 md:w-80 h-14 sm:h-16 flex items-center px-2">
        {/* Nền thanh lực gốc từ Tuagame */}
        <img
          src="/assets/hud_power_bar.png"
          alt="Khung Thanh Lực"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none drop-shadow"
          draggable={false}
        />

        {/* Nút [+] bên trái */}
        <button
          type="button"
          onClick={() => stepPower(5)}
          disabled={disabled || isCharging}
          className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded opacity-0 active:opacity-20 bg-black cursor-pointer"
          title="Tăng lực"
        />

        {/* Rãnh chứa thanh lực dâng lên */}
        <div className="relative z-10 flex-1 h-5 sm:h-6 mx-2 sm:mx-3 rounded overflow-hidden flex items-center">
          <div
            className="h-full rounded transition-[width] duration-75 ease-out shadow-sm bg-gradient-to-r from-[#9e2a2b] via-[#e5a823] to-[#e65c00]"
            style={{ width: `${power}%` }}
          />
        </div>

        {/* Nút [-] bên phải */}
        <button
          type="button"
          onClick={() => stepPower(-5)}
          disabled={disabled || isCharging}
          className="relative z-10 w-7 h-7 sm:w-8 sm:h-8 rounded opacity-0 active:opacity-20 bg-black cursor-pointer"
          title="Giảm lực"
        />
      </div>

      {/* 2. NÚT CON DẤU TRIỆN THƯ PHÁP "NÉM" (PHI BẠO LỰC THEO PRD 2) */}
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          startCharging();
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          releaseAndThrow();
        }}
        onPointerLeave={() => {
          if (isCharging) releaseAndThrow();
        }}
        disabled={disabled}
        className={`relative transition-transform duration-100 select-none touch-none cursor-pointer ${
          isCharging
            ? 'scale-110 drop-shadow-[0_0_18px_rgba(199,62,58,0.9)] animate-pulse'
            : 'hover:scale-105 active:scale-95 drop-shadow-lg'
        }`}
        title="Nhấn giữ để tích lực - Nhả tay để NÉM PAO"
      >
        <div className="w-14 sm:w-16 md:w-20 aspect-square bg-gradient-to-br from-[#d4433f] to-[#9e2a2b] border-[3px] border-[#2b1f17] rounded-xl shadow-xl flex flex-col items-center justify-center text-[#fbf6ea] font-serif font-black ring-2 ring-[#e5a823]/60">
          <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            NÉM
          </span>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-tighter text-[#fbf6ea]/90 font-bold">
            Giao Duyên
          </span>
        </div>
      </button>
    </div>
  );
}
