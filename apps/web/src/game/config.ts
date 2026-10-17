import * as Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { ArenaScene } from './scenes/ArenaScene';
import { GAME_CANVAS_CONFIG, PHYSICS_CONSTANTS } from '@pao/shared';

/**
 * Cấu hình game engine Phaser 3 cho Pao Version 0.1
 * Sử dụng Arcade Physics, tỉ lệ Scale FIT tự động khớp màn hình di động ngang
 */
export function createPhaserConfig(parentElementId: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: parentElementId,
    width: GAME_CANVAS_CONFIG.DEFAULT_WIDTH,
    height: GAME_CANVAS_CONFIG.DEFAULT_HEIGHT,
    backgroundColor: '#F7F2E7', // Màu Điệp nền giấy
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: PHYSICS_CONSTANTS.GRAVITY },
        debug: false,
      },
    },
    scene: [BootScene, ArenaScene],
    render: {
      pixelArt: false,
      antialias: true,
      powerPreference: 'high-performance',
    },
  };
}
