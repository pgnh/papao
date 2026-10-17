'use client';

import React, { useEffect, useState } from 'react';

/**
 * OrientationGuard: Nhắc nhở người chơi xoay ngang thiết bị di động
 * Tự động phát hiện qua CSS và matchMedia để đảm bảo tỉ lệ vàng 16:9 - 20:9
 */
export default function OrientationGuard() {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Kiểm tra chiều cao > chiều rộng và màn hình thuộc thiết bị di động/tablet
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth < 1024;
      setIsPortrait(portrait);
    };

    checkOrientation();

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (!isPortrait) return null;

  return (
    <div
      id="orientation-warning"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-diep/95 backdrop-blur-md p-6 text-center select-none"
    >
      <div className="border-moc-ban bg-diep-light p-6 rounded-2xl max-w-sm flex flex-col items-center">
        {/* Minh họa Chú bé Đông Hồ nghiêng người & Biểu tượng Xoay ngang */}
        <div className="relative w-36 h-36 mb-4 flex items-center justify-center">
          <svg
            className="w-28 h-28 text-son animate-pulse"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Khung điện thoại xoay */}
            <rect
              x="22"
              y="12"
              width="56"
              height="76"
              rx="8"
              stroke="#1F1E1B"
              strokeWidth="4"
              fill="#FFFDF8"
            />
            {/* Màn hình */}
            <rect x="28" y="20" width="44" height="60" rx="3" fill="#EADFC9" />
            {/* Quả pao trên màn hình */}
            <circle cx="50" cy="50" r="12" fill="#E5A823" stroke="#1F1E1B" strokeWidth="2" />
            {/* Mũi tên xoay vòng */}
            <path
              d="M 12 50 C 12 25, 30 10, 50 10"
              stroke="#C73E3A"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="4 2"
            />
            <polygon points="50,4 58,10 50,16" fill="#C73E3A" />
          </svg>
        </div>

        {/* Thông điệp nhắc nhở dân gian */}
        <h2 className="font-dongho text-2xl font-bold text-son mb-2">
          HỘI XUÂN XOAY BẢNG
        </h2>
        <p className="font-sans text-base font-medium text-than mb-3 leading-relaxed">
          Xin vui lòng <span className="font-bold text-son underline">xoay ngang màn hình</span> điện thoại để bước vào Sới Pao Dân Gian!
        </p>

        <div className="border-t-2 border-dashed border-than/20 pt-3 w-full">
          <p className="font-dongho text-xs italic text-cham">
            &ldquo;Quả pao bay liệng tầng không - Đôi tay đón lấy tơ hồng duyên xuân&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
