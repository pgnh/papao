'use client';

import React from 'react';

interface VillageMapWidgetProps {
  onOpenMap?: () => void;
}

/**
 * Widget Bản đồ LBS Sới Bi Làng Quê (Góc trên bên trái)
 * Mô phỏng phong cách mộc bản Đông Hồ từ bản thiết kế Tuagame.png
 */
export default function VillageMapWidget({ onOpenMap }: VillageMapWidgetProps) {
  return (
    <div
      onClick={onOpenMap}
      className="relative cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95 select-none"
      title="Bản đồ Sới Làng LBS - Nhấn để xem vị trí thực tế"
    >
      <img
        src="/assets/hud_map.png"
        alt="Bản đồ Sới Bi Làng Quê - Đình Làng"
        className="w-48 sm:w-56 md:w-64 h-auto drop-shadow-md object-contain"
        draggable={false}
      />
    </div>
  );
}
