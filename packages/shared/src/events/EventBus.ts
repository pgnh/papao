import type { CatchGrade, RoundResult } from '../types/game';
import type { PaoTypeId, ActiveItemId } from '../constants/physics';

export type TurnPhase = 'AIMING' | 'FLYING' | 'QTE' | 'RESOLVING' | 'ROUND_END';

export type GameEventMap = {
  PHASER_READY: { width: number; height: number };
  START_AIMING: { throwerId: string; turnDurationMs: number };
  ANGLE_CHANGED: { angle: number };
  POWER_CHANGED: { power: number };
  TRIGGER_THROW: {
    angle: number;
    power: number;
    paoType: PaoTypeId;
    activeItem?: ActiveItemId;
  };
  PAO_IN_FLIGHT: { x: number; y: number; vx: number; vy: number };
  TRIGGER_CATCH_QTE: { durationMs: number; targetTimestamp: number };
  CATCH_QTE_TRIGGER: { durationMs: number; targetTimestamp: number };
  CATCH_INPUT_SUBMITTED: { offsetMs: number };
  CATCH_RESULT: { grade: CatchGrade; offsetMs: number };
  WIND_UPDATED: { speed: number; direction: 'left' | 'right' };
  EMPATHY_POINTS_UPDATED: { [playerId: string]: number };
  TURN_PHASE_CHANGED: { phase: TurnPhase; throwerId?: string; catcherId?: string };
  SHOW_FLOATING_TEXT: { text: string; x: number; y: number; color?: string };
  ROUND_FINISHED: RoundResult;
  GAME_RESTART: void;
};

export type GameEventKey = keyof GameEventMap;

type Handler<T> = (data: T) => void;

/**
 * EventBus singleton kết nối hai chiều giữa Next.js DOM UI và Phaser 3 Canvas Scene.
 * Hoạt động độc lập và an toàn trên cả trình duyệt và Node.js.
 */
export class GameEventBus {
  private handlers: { [K in GameEventKey]?: Handler<any>[] } = {};

  emit<K extends GameEventKey>(event: K, data?: GameEventMap[K]): void {
    const eventHandlers = this.handlers[event];
    if (eventHandlers) {
      eventHandlers.forEach((handler) => {
        try {
          handler(data as GameEventMap[K]);
        } catch (error) {
          console.error(`[EventBus] Error in handler for event "${event}":`, error);
        }
      });
    }
  }

  on<K extends GameEventKey>(event: K, handler: Handler<GameEventMap[K]>): () => void {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    this.handlers[event]!.push(handler);

    // Trả về hàm hủy đăng ký (unsubscribe cleanup)
    return () => {
      this.off(event, handler);
    };
  }

  off<K extends GameEventKey>(event: K, handler: Handler<GameEventMap[K]>): void {
    const list = this.handlers[event];
    if (list) {
      this.handlers[event] = list.filter((h) => h !== handler);
    }
  }

  clear(): void {
    this.handlers = {};
  }
}

export const eventBus = new GameEventBus();
