'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { eventBus, PHYSICS_CONSTANTS, type CatchGrade } from '@pao/shared';

interface CatchQTEOverlayProps {
  onCatchSubmitted?: (grade: CatchGrade, offsetMs: number) => void;
}

/**
 * Mini-game Vòng Tròn Nhịp Điệu QTE Đón Pao Đông Hồ (Rhythm Catch QTE Overlay)
 * Hiển thị vòng tròn chỉ ngũ sắc thu nhỏ dần vào tâm nút ĐÓN ở ngực nhân vật.
 * Bấm nút đúng nhịp để đạt đánh giá Hoàn Hảo (Perfect) hoặc Chuẩn Xác (Good).
 */
export default function CatchQTEOverlay({ onCatchSubmitted }: CatchQTEOverlayProps) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [gradeResult, setGradeResult] = useState<CatchGrade | null>(null);
  const [progress, setProgress] = useState<number>(0); // 0 -> 1

  const qteStartRef = useRef<number>(0);
  const targetTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(PHYSICS_CONSTANTS.QTE_WINDOW_MS);
  const animFrameRef = useRef<number | null>(null);
  const hasSubmittedRef = useRef<boolean>(false);

  // Xử lý nộp kết quả bắt pao
  const submitCatch = useCallback(
    (customPressTime?: number) => {
      if (!isActive || hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;

      const now = customPressTime ?? Date.now();
      const offsetMs = now - targetTimeRef.current; // < 0: Bấm sớm, > 0: Bấm trễ
      const absOffset = Math.abs(offsetMs);

      let grade: CatchGrade = 'MISS';
      if (absOffset <= PHYSICS_CONSTANTS.QTE_PERFECT_MAX_OFFSET_MS) {
        grade = 'PERFECT';
      } else if (absOffset <= PHYSICS_CONSTANTS.QTE_GOOD_MAX_OFFSET_MS) {
        grade = 'GOOD';
      } else {
        grade = 'MISS';
      }

      setGradeResult(grade);
      eventBus.emit('CATCH_INPUT_SUBMITTED', { offsetMs });
      eventBus.emit('CATCH_RESULT', { grade, offsetMs });
      onCatchSubmitted?.(grade, offsetMs);

      // Tắt overlay sau 800ms
      setTimeout(() => {
        setIsActive(false);
        setGradeResult(null);
        hasSubmittedRef.current = false;
      }, 800);
    },
    [isActive, onCatchSubmitted]
  );

  // Vòng lặp cập nhật vòng tròn thu nhỏ
  const updateLoop = useCallback(() => {
    const now = Date.now();
    const elapsed = now - qteStartRef.current;
    const currentProgress = Math.min(1, Math.max(0, elapsed / durationRef.current));
    setProgress(currentProgress);

    // Nếu hết giờ mà người chơi chưa bấm -> Tự động tính là MISS
    if (currentProgress >= 1 && !hasSubmittedRef.current) {
      submitCatch(now);
      return;
    }

    if (!hasSubmittedRef.current) {
      animFrameRef.current = requestAnimationFrame(updateLoop);
    }
  }, [submitCatch]);

  // Lắng nghe sự kiện kích hoạt QTE từ Phaser
  useEffect(() => {
    const handleTrigger = (data: { durationMs: number; targetTimestamp: number }) => {
      durationRef.current = data.durationMs || PHYSICS_CONSTANTS.QTE_WINDOW_MS;
      targetTimeRef.current = data.targetTimestamp || Date.now() + durationRef.current * 0.75;
      qteStartRef.current = Date.now();
      hasSubmittedRef.current = false;
      setGradeResult(null);
      setProgress(0);
      setIsActive(true);

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    const unsub1 = eventBus.on('TRIGGER_CATCH_QTE', handleTrigger);
    const unsub2 = eventBus.on('CATCH_QTE_TRIGGER', handleTrigger);

    return () => {
      unsub1();
      unsub2();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [updateLoop]);

  // Hỗ trợ phím Space / Enter để đón nhanh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'Enter') && isActive && !hasSubmittedRef.current) {
        e.preventDefault();
        submitCatch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, submitCatch]);

  if (!isActive) return null;

  // Tính scale của vòng tròn từ 2.4 thu nhỏ dần về 1.0 (trùng khít tâm ở targetTimestamp)
  // Điểm sweet spot đặt tại 75% thời gian cửa sổ
  const scale = Math.max(0.6, 2.2 - progress * 1.4);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none select-none">
      {/* Vị trí căn giữa hoặc neo tại bên phải (Bên Đón) */}
      <div className="relative flex flex-col items-center justify-center pointer-events-auto">
        {/* Nút ĐÓN mộc bản ở tâm */}
        <button
          type="button"
          onClick={() => submitCatch()}
          disabled={hasSubmittedRef.current}
          className="relative w-28 h-28 rounded-full border-4 border-than bg-son hover:bg-son-dark active:scale-95 shadow-2xl flex flex-col items-center justify-center text-diep-light transition-transform touch-none z-10"
          title="Bấm đúng lúc vòng tròn trùng tâm!"
        >
          {/* Họa tiết hoa văn trống đồng viền trong */}
          <div className="absolute inset-1 rounded-full border-2 border-dashed border-diep-paper/60 animate-spin-slow pointer-events-none" />

          <span className="font-dongho font-black text-2xl tracking-widest uppercase drop-shadow">
            ĐÓN
          </span>
          <span className="text-[10px] font-dongho opacity-85">Chạm ngay!</span>
        </button>

        {/* VÒNG TRÒN NHỊP ĐIỆU (RHYTHM RETICLE) THU NHỎ DẦN */}
        {!hasSubmittedRef.current && (
          <div
            className="absolute rounded-full border-4 border-vang-ho shadow-lg pointer-events-none transition-none"
            style={{
              width: `${112 * scale}px`,
              height: `${112 * scale}px`,
              borderColor:
                scale <= 1.2 && scale >= 0.85
                  ? '#E5A823' // Gần tâm: Màu vàng hòe rực sáng
                  : '#2E4E6B', // Xa tâm: Màu chàm
              boxShadow:
                scale <= 1.15 && scale >= 0.88
                  ? '0 0 25px #E5A823, inset 0 0 15px #E5A823'
                  : 'none',
              opacity: Math.max(0.4, 1 - progress * 0.2),
            }}
          />
        )}

        {/* HUY HIỆU ĐÁNH GIÁ (GRADE BADGE) SAU KHI BẤM */}
        {gradeResult && (
          <div className="absolute -top-16 z-20 flex flex-col items-center animate-bounce">
            {gradeResult === 'PERFECT' && (
              <div className="px-5 py-1.5 rounded-full border-2 border-than bg-vang-ho text-than font-dongho font-black text-xl shadow-xl flex items-center gap-1.5">
                <span>✨</span>
                <span>HOÀN HẢO!</span>
                <span>✨</span>
              </div>
            )}
            {gradeResult === 'GOOD' && (
              <div className="px-5 py-1.5 rounded-full border-2 border-than bg-cham text-diep-light font-dongho font-bold text-lg shadow-xl flex items-center gap-1.5">
                <span>🎯</span>
                <span>CHUẨN XÁC!</span>
              </div>
            )}
            {gradeResult === 'MISS' && (
              <div className="px-5 py-1.5 rounded-full border-2 border-than bg-than text-diep-light font-dongho font-bold text-base shadow-xl flex items-center gap-1.5">
                <span>💨</span>
                <span>HỤT NHỊP!</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
