import * as Phaser from 'phaser';
import { DONG_HO_COLORS, GAME_CANVAS_CONFIG } from '@pao/shared';

/**
 * BootScene: Khởi tạo asset, texture mộc bản và chuyển sang ArenaScene
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Hiển thị thanh tiến trình tải mang phong cách mộc bản Đông Hồ
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();

    progressBox.fillStyle(0x1f1e1b, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 20, 320, 40);

    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Đang chuẩn bị Sới Làng...', {
      fontFamily: 'serif',
      fontSize: '20px',
      color: DONG_HO_COLORS.SON,
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xc73e3a, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 12, 300 * value, 24);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Nạp các hình ảnh mỹ thuật mộc bản Đông Hồ chuẩn từ Tuagame
    this.load.image('bg_dongho_arena', '/assets/bg_dongho_arena.png');
    this.load.image('char_thrower', '/assets/char_thrower.png');
    this.load.image('char_catcher', '/assets/char_catcher.png');

    // Tạo các texture đồ họa phong cách Đông Hồ giả lập (Procedural Fallback Sprites)
    this.createDongHoProceduralTextures();
  }

  create(): void {
    // Chuyển sang ArenaScene sau khi chuẩn bị xong
    this.scene.start('ArenaScene');
  }

  /**
   * Tạo các texture vector mộc bản Đông Hồ để game luôn hiển thị đẹp, nhẹ và chạy offline 100%
   */
  private createDongHoProceduralTextures(): void {
    // 1. Texture Quả Pao Vải Lanh Mộc
    if (!this.textures.exists('pao_ball')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Thân quả pao
      g.fillStyle(0xe5a823, 1); // Vàng hòe
      g.fillCircle(24, 24, 20);
      g.lineStyle(3, 0x1f1e1b, 1); // Than tre nét mộc
      g.strokeCircle(24, 24, 20);
      // Múi vải lanh đan chéo
      g.lineStyle(2, 0xc73e3a, 1); // Son đỏ
      g.beginPath();
      g.arc(24, 24, 20, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150), false);
      g.strokePath();
      g.lineStyle(2, 0x2e4e6b, 1); // Chàm
      g.beginPath();
      g.arc(24, 24, 20, Phaser.Math.DegToRad(210), Phaser.Math.DegToRad(330), false);
      g.strokePath();
      // Tâm chỉ ngũ sắc
      g.fillStyle(0xfffdf8, 1);
      g.fillCircle(24, 24, 5);
      g.lineStyle(2, 0x1f1e1b, 1);
      g.strokeCircle(24, 24, 5);
      g.generateTexture('pao_ball', 48, 48);
      g.destroy();
    }

    // 2. Texture Hạt khói / Particle bụi mây ngũ sắc
    if (!this.textures.exists('cloud_particle')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfffdf8, 0.9);
      g.fillCircle(8, 8, 8);
      g.lineStyle(1.5, 0x1f1e1b, 0.8);
      g.strokeCircle(8, 8, 8);
      g.generateTexture('cloud_particle', 16, 16);
      g.destroy();
    }

    // 3. Texture Vùng đón Hitbox (Catch Ring)
    if (!this.textures.exists('catch_reticle')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.lineStyle(4, 0xc73e3a, 0.9);
      g.strokeCircle(50, 50, 46);
      g.lineStyle(2, 0xe5a823, 0.9);
      g.strokeCircle(50, 50, 36);
      g.fillStyle(0xc73e3a, 0.2);
      g.fillCircle(50, 50, 20);
      g.generateTexture('catch_reticle', 100, 100);
      g.destroy();
    }
  }
}
