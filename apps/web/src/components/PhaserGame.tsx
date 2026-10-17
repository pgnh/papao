'use client';

import dynamic from 'next/dynamic';
import React, { ComponentType } from 'react';
import type { PhaserGameInnerProps } from './PhaserGameInner';

/**
 * Dynamic import của PhaserGame với ssr: false nhằm tránh lỗi 'window is not defined' phía server
 */
export const PhaserGame: ComponentType<PhaserGameInnerProps> = dynamic(
  () => import('./PhaserGameInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-giay-diep text-than">
        <div className="w-12 h-12 border-4 border-son border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-dongho text-lg text-son font-bold">
          Đang mở sới ném pao...
        </span>
      </div>
    ),
  }
);
