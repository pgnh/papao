'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PhaserGame } from '@/components/PhaserGame';
import TopStatusBar from '@/components/TopStatusBar';
import RightActionMenu from '@/components/RightActionMenu';
import AngleSelector from '@/components/AngleSelector';
import PowerGauge from '@/components/PowerGauge';
import OrientationGuard from '@/components/OrientationGuard';
import CatchQTEOverlay from '@/components/CatchQTEOverlay';
import VictoryModal from '@/components/VictoryModal';
import { soundManager } from '@/game/audio/SoundManager';
import {
  eventBus,
  PHYSICS_CONSTANTS,
  PAO_TYPES,
  ACTIVE_ITEMS,
  type TurnPhase,
  type PaoTypeId,
  type ActiveItemId,
} from '@pao/shared';

export default function GamePage() {
  const [isPhaserReady, setIsPhaserReady] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<number>(PHYSICS_CONSTANTS.DEFAULT_ANGLE);
  const [turnPhase, setTurnPhase] = useState<TurnPhase>('AIMING');
  const [currentThrower, setCurrentThrower] = useState<'left' | 'right'>('left');
  const [isMuted, setIsMuted] = useState(false);

  // Điểm Thấu Cảm (Empathy Points: 0 -> 100 EP) - Tuyệt đối không dùng HP
  const [leftEp, setLeftEp] = useState(0);
  const [rightEp, setRightEp] = useState(0);

  // Trang bị Quả Pao & Vật Phẩm đang chọn
  const [selectedPao, setSelectedPao] = useState<PaoTypeId>('PAO_VAI_LANH');
  const [selectedItem, setSelectedItem] = useState<ActiveItemId | undefined>(undefined);

  // Modals tương tác
  const [activeModal, setActiveModal] = useState<'pao' | 'items' | 'map' | null>(null);

  // Modal chiến thắng
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);
  const [winner, setWinner] = useState<'left' | 'right' | 'draw'>('draw');
  const [stats, setStats] = useState({
    rounds: 0,
    perfectCatches: 0,
    goodCatches: 0,
  });

  useEffect(() => {
    setIsMuted(soundManager.getIsMuted());

    const unsubReady = eventBus.on('PHASER_READY', () => setIsPhaserReady(true));

    const unsubTurnPhase = eventBus.on('TURN_PHASE_CHANGED', (data) => {
      setTurnPhase(data.phase);
      if (data.throwerId) setCurrentThrower(data.throwerId as 'left' | 'right');
    });

    const unsubAngle = eventBus.on('ANGLE_CHANGED', (data) => {
      setCurrentAngle(data.angle);
    });

    const unsubEp = eventBus.on('EMPATHY_POINTS_UPDATED', (data) => {
      const l = data.left ?? 0;
      const r = data.right ?? 0;
      setLeftEp(l);
      setRightEp(r);

      if (l >= PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS || r >= PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS) {
        setWinner(l >= r ? 'left' : 'right');
        setIsVictoryOpen(true);
      }
    });

    const unsubRound = eventBus.on('ROUND_FINISHED', (data) => {
      setStats((prev) => ({
        rounds: data.roundNumber,
        perfectCatches: prev.perfectCatches + (data.qteGrade === 'PERFECT' ? 1 : 0),
        goodCatches: prev.goodCatches + (data.qteGrade === 'GOOD' ? 1 : 0),
      }));
    });

    return () => {
      unsubReady();
      unsubTurnPhase();
      unsubAngle();
      unsubEp();
      unsubRound();
    };
  }, []);

  const toggleSound = () => {
    setIsMuted(soundManager.toggleMute());
  };

  const handleRestart = () => {
    setIsVictoryOpen(false);
    setLeftEp(0);
    setRightEp(0);
    setStats({ rounds: 0, perfectCatches: 0, goodCatches: 0 });
    eventBus.emit('GAME_RESTART', undefined);
  };

  const isPlayerAiming = isPhaserReady && turnPhase === 'AIMING' && currentThrower === 'left';

  return (
    <main
      onClick={() => soundManager.startBGM()}
      className="relative w-screen h-screen overflow-hidden bg-[#0d0906] flex items-center justify-center select-none p-1 sm:p-2"
    >
      {/* KHUNG MÀN HÌNH CHUẨN LANDSCAPE 16:9 - 20:9 (ĐÃ LOẠI BỎ KHUYẾT TAI THỎ GÂY VỆT TRẮNG) */}
      <div className="relative w-full h-full max-w-[calc(100vh*1.8266)] max-h-[calc(100vw/1.8266)] aspect-[2592/1419] bg-[#1a1410] rounded-[24px] sm:rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.9)] ring-2 ring-[#3d2e24]">
        
        {/* TẦNG 1: CANVAS PHASER 3 GAME WORLD */}
        <div className="absolute inset-0 z-0">
          <PhaserGame />
        </div>

        {/* TẦNG 2: GIAO DIỆN RETINA HUD ĐỒNG BỘ VỚI MỸ THUẬT ĐÔNG HỒ */}
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
          
          {/* 1. THANH TRẠNG THÁI ĐỈNH (Che phủ hoàn toàn thanh HP và ô 00:6:50 cũ) */}
          <TopStatusBar
            leftEp={leftEp}
            rightEp={rightEp}
            onOpenMap={() => setActiveModal('map')}
            onToggleSound={toggleSound}
            isMuted={isMuted}
          />

          {/* 2. CỘT TÍNH NĂNG BÊN PHẢI (Che phủ túi bi, cường hóa và logo Gemini cũ) */}
          <div className="absolute right-0 top-[12.5%] bottom-0 w-[9%] min-w-[65px] max-w-[85px] z-30 pointer-events-auto">
            <RightActionMenu
              onOpenPaoPouch={() => setActiveModal('pao')}
              onOpenInventory={() => setActiveModal('items')}
              onOpenVillageMap={() => setActiveModal('map')}
            />
          </div>

          {/* 3. CỤM ĐIỀU KHIỂN GÓC & LỰC NÉM GÓC DƯỚI BÊN TRÁI */}
          <div className="absolute left-2 sm:left-4 bottom-2 sm:bottom-3 z-20 flex items-end gap-2 sm:gap-4 pointer-events-auto">
            {/* Thước đo góc nan quạt */}
            <AngleSelector
              initialAngle={currentAngle}
              disabled={!isPlayerAiming}
            />

            {/* Thanh đo lực & Nút Triện Đỏ "NÉM" (Phi bạo lực) */}
            <PowerGauge
              currentAngle={currentAngle}
              currentPaoType={selectedPao}
              currentActiveItem={selectedItem}
              disabled={!isPlayerAiming}
            />
          </div>

        </div>

      </div>

      {/* ==================== MODAL TÚI PAO (5 LOẠI QUẢ PAO DÂN GIAN - PRD 5.1) ==================== */}
      {activeModal === 'pao' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fbf6ea] border-4 border-[#2b1f17] p-5 sm:p-6 rounded-2xl max-w-lg w-full shadow-2xl text-left select-none max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#8c6b45]/40 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧶</span>
                <h3 className="font-serif font-black text-xl text-[#2b1f17]">
                  Túi Pao Dân Gian
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#c73e3a] text-[#fbf6ea] font-bold text-sm flex items-center justify-center hover:bg-[#a82e2a]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(PAO_TYPES).map(([key, pao]) => {
                const isSelected = selectedPao === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedPao(key as PaoTypeId)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#c73e3a]/10 border-[#c73e3a] ring-2 ring-[#c73e3a]/40 shadow'
                        : 'bg-[#f7f2e7] border-[#8c6b45]/30 hover:border-[#8c6b45]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-black text-base text-[#2b1f17]">
                          {pao.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-[#c73e3a] text-[#fbf6ea] text-[10px] font-bold rounded-full">
                            Đang Dùng
                          </span>
                        )}
                      </div>
                      <p className="font-serif text-xs text-[#5c4a3d] mt-0.5">
                        {pao.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-[#8c6b45]">
                        <span>Khối lượng: {pao.mass}</span>
                        <span>Cản gió: {pao.windResistance}</span>
                        <span className="text-[#c73e3a] font-bold">+{pao.baseEp} EP</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPao(key as PaoTypeId);
                        setActiveModal(null);
                      }}
                      className={`px-3 py-1 rounded-lg font-serif font-bold text-xs transition-transform active:scale-95 ${
                        isSelected
                          ? 'bg-[#2b1f17] text-[#f5ecd7]'
                          : 'bg-[#c73e3a] text-[#fbf6ea] hover:bg-[#a82e2a]'
                      }`}
                    >
                      {isSelected ? 'Đã Chọn' : 'Trang Bị'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL ĐỒ ĐẠC (4 VẬT PHẨM THỔ CẨM BỔ TRỢ - PRD 5.2) ==================== */}
      {activeModal === 'items' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fbf6ea] border-4 border-[#2b1f17] p-5 sm:p-6 rounded-2xl max-w-lg w-full shadow-2xl text-left select-none"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#8c6b45]/40 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧺</span>
                <h3 className="font-serif font-black text-xl text-[#2b1f17]">
                  Đồ Đạc Thổ Cẩm Bổ Trợ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#c73e3a] text-[#fbf6ea] font-bold text-sm flex items-center justify-center hover:bg-[#a82e2a]"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(ACTIVE_ITEMS).map(([key, item]) => {
                const isSelected = selectedItem === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedItem(isSelected ? undefined : (key as ActiveItemId))}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#c73e3a]/10 border-[#c73e3a] ring-2 ring-[#c73e3a]/40 shadow'
                        : 'bg-[#f7f2e7] border-[#8c6b45]/30 hover:border-[#8c6b45]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-black text-sm text-[#2b1f17]">
                          {item.name}
                        </span>
                        {isSelected && (
                          <span className="text-xs text-[#c73e3a] font-bold">✓ Kích hoạt</span>
                        )}
                      </div>
                      <p className="font-serif text-xs text-[#5c4a3d] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(isSelected ? undefined : (key as ActiveItemId));
                      }}
                      className={`mt-3 py-1 rounded-lg font-serif font-bold text-xs transition-transform active:scale-95 ${
                        isSelected
                          ? 'bg-[#2b1f17] text-[#f5ecd7]'
                          : 'bg-[#8c6b45] text-[#fbf6ea] hover:bg-[#735737]'
                      }`}
                    >
                      {isSelected ? 'Bỏ Kích Hoạt' : 'Chọn Sử Dụng'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL SỚI LÀNG (ĐỊNH VỊ LBS & DANH THẮNG - PRD 6) ==================== */}
      {activeModal === 'map' && (
        <div
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fbf6ea] border-4 border-[#2b1f17] p-5 sm:p-6 rounded-2xl max-w-lg w-full shadow-2xl text-left select-none"
          >
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#8c6b45]/40 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⛩️</span>
                <h3 className="font-serif font-black text-xl text-[#2b1f17]">
                  Bản Đồ Sới Làng Dân Gian
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-[#c73e3a] text-[#fbf6ea] font-bold text-sm flex items-center justify-center hover:bg-[#a82e2a]"
              >
                ✕
              </button>
            </div>

            <p className="font-serif text-xs text-[#5c4a3d] mb-4">
              Theo quy chuẩn PRD 6: Bạn có thể chọn danh lam thắng cảnh để du hành tâm tưởng hoặc định vị sới làng thực tế quanh bạn:
            </p>

            <div className="space-y-2.5">
              {[
                { name: 'Sới Đình Làng Đông Hồ (Bắc Ninh)', desc: 'Cảnh sân đình cây đa, gió hiền hòa, +10% Thấu Cảm', tag: 'Đang Đấu' },
                { name: 'Sới Cao Nguyên Đá Đồng Văn (Hà Giang)', desc: 'Gió núi đổi chiều liên tục, thách thức căn góc', tag: 'Danh Thắng' },
                { name: 'Sới Thác Bản Cát Cát (Sapa)', desc: 'Sương mù mờ ảo, quà thổ cẩm phong phú', tag: 'Danh Thắng' },
                { name: 'Sới Bến Ninh Kiều (Cần Thơ)', desc: 'Gió sông nước Nam Bộ thổi dọc một chiều', tag: 'Danh Thắng' },
              ].map((soi, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveModal(null)}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    idx === 0
                      ? 'bg-[#c73e3a]/10 border-[#c73e3a]'
                      : 'bg-[#f7f2e7] border-[#8c6b45]/30 hover:border-[#8c6b45]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-black text-sm text-[#2b1f17]">
                        {soi.name}
                      </span>
                      <span className="px-2 py-0.2 bg-[#8c6b45] text-[#fbf6ea] text-[9px] font-bold rounded">
                        {soi.tag}
                      </span>
                    </div>
                    <span className="font-serif text-xs text-[#5c4a3d]">
                      {soi.desc}
                    </span>
                  </div>
                  <span className="text-xs text-[#c73e3a] font-serif font-bold">
                    {idx === 0 ? 'Hiện Tại' : 'Du Hành'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MINI-GAME QTE ĐÓN PAO */}
      <CatchQTEOverlay />

      {/* MÀN HÌNH CHIẾN THẮNG & THU PHỤC */}
      <VictoryModal
        isOpen={isVictoryOpen}
        leftEp={leftEp}
        rightEp={rightEp}
        winner={winner}
        stats={stats}
        onRestart={handleRestart}
      />

      {/* CẢNH BÁO XOAY NGANG MÀN HÌNH */}
      <OrientationGuard />
    </main>
  );
}
