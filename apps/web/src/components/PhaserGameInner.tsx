'use client';

import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { createPhaserConfig } from '../game/config';

export interface PhaserGameInnerProps {
  onGameReady?: () => void;
}

/**
 * Component quản lý vòng đời Canvas của Phaser 3 trong Next.js.
 * Đảm bảo dọn dẹp game.destroy(true) khi unmount chống rò rỉ bộ nhớ WebGL.
 */
export default function PhaserGameInner({ onGameReady }: PhaserGameInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    // Ngăn chặn khởi tạo trùng lặp trong StrictMode
    if (gameRef.current || !containerRef.current) return;

    const containerId = 'pao-canvas-root';
    containerRef.current.id = containerId;

    const config = createPhaserConfig(containerId);
    const game = new Phaser.Game(config);
    gameRef.current = game;

    if (onGameReady) {
      onGameReady();
    }

    // Dọn dẹp tài nguyên bắt buộc để chống rò rỉ bộ nhớ WebGL/Canvas
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameReady]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden bg-diep"
    />
  );
}
