import * as Phaser from 'phaser';
import {
  DONG_HO_COLORS,
  GAME_CANVAS_CONFIG,
  PHYSICS_CONSTANTS,
  PAO_TYPES,
  ACTIVE_ITEMS,
  BotAIEngine,
  eventBus,
  type PaoTypeId,
  type ActiveItemId,
  type CatchGrade,
  type TurnPhase,
} from '@pao/shared';
import { soundManager } from '../audio/SoundManager';

/**
 * ArenaScene: Sới Pao Dân Gian (Offline Solo Mode)
 * Quản lý bối cảnh mộc bản Đông Hồ, nhân vật ném & đón, vật lý Arcade parabol,
 * mô phỏng gió, AI Bot Bé Đông Hồ và cơ chế QTE đón Pao tích lũy điểm Thấu Cảm.
 */
export class ArenaScene extends Phaser.Scene {
  private arenaBackground?: Phaser.GameObjects.Image;
  private trajectoryGraphics?: Phaser.GameObjects.Graphics;
  private arrowSprite?: Phaser.GameObjects.Image;
  private currentPowerPreview: number = 65;

  // Đồ họa & Nhân vật
  private throwerGraphicsLeft?: Phaser.GameObjects.Graphics;
  private catcherGraphicsRight?: Phaser.GameObjects.Graphics;
  private throwerArmLeft?: Phaser.GameObjects.Graphics;
  private throwerArmRight?: Phaser.GameObjects.Graphics;
  private catchRing?: Phaser.GameObjects.Image;
  private groundLine?: Phaser.GameObjects.Graphics;

  // Thực thể Quả Pao & Hiệu ứng
  private paoBall?: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  private paoTrailEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  // Trạng thái Trận Đấu & Vòng Lặp Solo
  private turnPhase: TurnPhase = 'AIMING';
  private currentThrower: 'left' | 'right' = 'left'; // 'left': Người chơi (Bé Trai), 'right': Bot (Bé Gái)
  private roundNumber: number = 1;
  private currentAngle: number = PHYSICS_CONSTANTS.DEFAULT_ANGLE;
  private currentWind: { speed: number; direction: 'left' | 'right' } = {
    speed: 1.5,
    direction: 'right',
  };
  private empathyPoints = { left: 0, right: 0 };
  private hasTriggeredQte: boolean = false;
  private activeItemInRound?: ActiveItemId;
  private paoTypeInRound: PaoTypeId = 'PAO_VAI_LANH';
  private qteTargetTimestamp: number = 0;
  private botCatchTimer?: Phaser.Time.TimerEvent;
  private botAimTimer?: Phaser.Time.TimerEvent;
  private isMatchFinished: boolean = false;

  private unsubscribeEvents: (() => void)[] = [];

  constructor() {
    super({ key: 'ArenaScene' });
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.isMatchFinished = false;
    this.roundNumber = 1;
    this.currentThrower = 'left';
    this.empathyPoints = { left: 0, right: 0 };

    // 1. Nạp hình nền tranh mộc bản Đông Hồ nguyên bản từ Tuagame
    // Dịch nền sang trái 35px để ẩn vệt khuyết tai thỏ điện thoại bên mép trái
    this.arenaBackground = this.add.image(width / 2 - 35, height / 2, 'bg_dongho_arena');
    this.arenaBackground.setDisplaySize(width + 70, height);

    // 2. Khởi tạo đồ họa đường đạn Parabol động mộc bản
    this.trajectoryGraphics = this.add.graphics();

    // 3. Khởi tạo bộ phát hạt bụi mây ngũ sắc
    this.createPaoParticleTrail();

    // 4. Khởi tạo gió đầu trận
    this.generateNewWind();

    // 5. Đăng ký các sự kiện EventBus từ Next.js DOM
    this.setupEventBus();

    // 6. Vẽ đường đạn ngắm ban đầu
    this.redrawTrajectory(this.currentAngle, 65);

    // 7. Báo hiệu cho React HUD
    eventBus.emit('PHASER_READY', { width, height });
    eventBus.emit('TURN_PHASE_CHANGED', {
      phase: 'AIMING',
      throwerId: this.currentThrower,
      catcherId: this.currentThrower === 'left' ? 'right' : 'left',
    });
    eventBus.emit('EMPATHY_POINTS_UPDATED', this.empathyPoints);
  }

  update(): void {
    // Xử lý khi Quả Pao đang bay
    if (this.turnPhase === 'FLYING' && this.paoBall && this.paoBall.active) {
      const body = this.paoBall.body;
      const groundY = GAME_CANVAS_CONFIG.GROUND_Y;
      const targetX = this.currentThrower === 'left' ? 1910 : 840;
      const targetY = 810;

      // Xoay quả pao khi bay theo hướng di chuyển
      this.paoBall.rotation += body.velocity.x > 0 ? 0.08 : -0.08;

      // 1. Kiểm tra va chạm với Vùng Đón (Catch Zone)
      const distToCatcher = Phaser.Math.Distance.Between(
        this.paoBall.x,
        this.paoBall.y,
        targetX,
        targetY
      );

      const paoConfig = PAO_TYPES[this.paoTypeInRound] || PAO_TYPES.PAO_VAI_LANH;
      let catchRadius = PHYSICS_CONSTANTS.BASE_CATCH_RADIUS * (paoConfig.catchHitboxScale || 1.0);
      if (this.activeItemInRound === 'CHI_NGU_SAC') {
        catchRadius *= 1.5;
      }

      // Khi pao bay vào bán kính đón và chưa kích hoạt QTE
      if (distToCatcher <= catchRadius * 1.5 && !this.hasTriggeredQte) {
        this.triggerCatchQTE(distToCatcher, body.velocity.x);
      }

      // 2. Kiểm tra nếu pao rơi chạm đất
      if (this.paoBall.y >= 1110) {
        this.handlePaoGroundImpact();
      }

      // 3. Kiểm tra nếu pao bay quá đà ra khỏi mép màn hình
      if (this.paoBall.x > this.scale.width + 120 || this.paoBall.x < -120) {
        this.handlePaoOutOfBounds();
      }
    }
  }

  /**
   * Cập nhật vị trí vòng tròn đón pao (ở ngực người đón hiện tại)
   */
  private updateCatchRingPosition(): void {
    if (!this.catchRing) return;
    const catcherX = this.currentThrower === 'left' ? 1910 : 840;
    const catcherY = 810;

    this.catchRing.setPosition(catcherX, catcherY);
  }

  /**
   * Kích hoạt QTE Đón Pao khi bóng tới gần ngực người đón
   */
  private triggerCatchQTE(distance: number, vx: number): void {
    this.hasTriggeredQte = true;
    this.turnPhase = 'QTE';

    // Tính thời gian dự kiến pao chạm tâm (sweet spot)
    const speedX = Math.max(120, Math.abs(vx));
    const flightTimeMs = Math.max(350, Math.min(900, Math.round((distance / speedX) * 1000)));
    this.qteTargetTimestamp = Date.now() + flightTimeMs;

    // Hiệu ứng vòng đón sáng rực lên
    if (this.catchRing) {
      this.tweens.add({
        targets: this.catchRing,
        scaleX: 1.4,
        scaleY: 1.4,
        alpha: 1,
        duration: 250,
        yoyo: true,
      });
    }

    // Nếu Bên Đón là NGƯỜI CHƠI (khi currentThrower === 'right' - Bot ném)
    if (this.currentThrower === 'right') {
      eventBus.emit('TRIGGER_CATCH_QTE', {
        durationMs: PHYSICS_CONSTANTS.QTE_WINDOW_MS,
        targetTimestamp: this.qteTargetTimestamp,
      });
      eventBus.emit('CATCH_QTE_TRIGGER', {
        durationMs: PHYSICS_CONSTANTS.QTE_WINDOW_MS,
        targetTimestamp: this.qteTargetTimestamp,
      });
    } else {
      // Nếu Bên Đón là BOT BÉ ĐÔNG HỒ (khi currentThrower === 'left' - Người ném)
      // Bot tự động quyết định kết quả đón qua BotAIEngine
      const botDecision = BotAIEngine.decideCatchQTE('NORMAL');
      const delay = Math.max(100, flightTimeMs + botDecision.offsetMs);

      this.botCatchTimer = this.time.delayedCall(delay, () => {
        if (this.turnPhase === 'QTE') {
          this.handleCatchResult(botDecision.grade, botDecision.offsetMs);
        }
      });
    }
  }

  /**
   * Khởi tạo bộ phát hạt bụi mây ngũ sắc bay theo đuôi quả pao
   */
  private createPaoParticleTrail(): void {
    this.paoTrailEmitter = this.add.particles(0, 0, 'cloud_particle', {
      lifespan: 500,
      scale: { start: 0.8, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      speed: { min: 20, max: 40 },
      angle: { min: 140, max: 220 },
      blendMode: Phaser.BlendModes.NORMAL,
      emitting: false,
    });
  }

  /**
   * Sinh hướng và tốc độ gió mới ngẫu nhiên (-5.0 đến +5.0)
   */
  private generateNewWind(): void {
    const rawSpeed = Number((Phaser.Math.FloatBetween(0.5, 4.5)).toFixed(1));
    const direction: 'left' | 'right' = Math.random() > 0.45 ? 'right' : 'left';
    this.currentWind = { speed: rawSpeed, direction };

    eventBus.emit('WIND_UPDATED', {
      speed: rawSpeed,
      direction,
    });
  }

  /**
   * Vẽ chuỗi chấm Parabol màu cam đất và mũi tên hướng bay động theo đúng Tuagame.png
   */
  private redrawTrajectory(angleDeg: number, power: number): void {
    if (!this.trajectoryGraphics) return;
    this.trajectoryGraphics.clear();

    if (this.turnPhase !== 'AIMING' || this.isMatchFinished) return;

    const isLeft = this.currentThrower === 'left';
    const startX = isLeft ? 840 : 1910;
    const startY = 810;
    const targetX = isLeft ? 1910 : 840;

    const rad = Phaser.Math.DegToRad(angleDeg);
    const v0 = (power > 0 ? power : 65) * 21.2;
    const vx = isLeft ? v0 * Math.cos(rad) : -v0 * Math.cos(rad);
    const vy = -v0 * Math.sin(rad);

    const g = PHYSICS_CONSTANTS.GRAVITY;
    const effectiveWind = this.currentWind.direction === 'right' ? this.currentWind.speed : -this.currentWind.speed;
    const windAccel = effectiveWind * PHYSICS_CONSTANTS.WIND_FORCE_SCALE;

    const totalSteps = 28;
    const dt = 0.045;
    let arrowPlaced = false;

    for (let i = 1; i < totalSteps; i++) {
      const t = i * dt;
      const x = startX + (vx + 0.5 * windAccel * t) * t;
      const y = startY + vy * t + 0.5 * g * t * t;

      if (y > 1150 || (isLeft && x > targetX + 250) || (!isLeft && x < targetX - 250)) {
        break;
      }

      // Viền than tre nét mộc
      this.trajectoryGraphics.fillStyle(0x2b1f17, 0.95);
      this.trajectoryGraphics.fillCircle(x, y, 9.5);

      // Ruột màu cam đất dân gian
      this.trajectoryGraphics.fillStyle(0xd35400, 1);
      this.trajectoryGraphics.fillCircle(x, y, 7.5);
    }
  }

  /**
   * Lập trình Cú Ném Pao Parabol (Arcade Physics)
   */
  public executeThrow(
    angle: number,
    power: number,
    paoType: PaoTypeId = 'PAO_VAI_LANH',
    activeItem?: ActiveItemId
  ): void {
    if (this.turnPhase !== 'AIMING' || this.isMatchFinished) return;

    this.turnPhase = 'FLYING';
    this.hasTriggeredQte = false;
    this.activeItemInRound = activeItem;
    this.paoTypeInRound = paoType;

    // Xóa đường đạn khi bóng bắt đầu bay
    if (this.trajectoryGraphics) {
      this.trajectoryGraphics.clear();
    }

    eventBus.emit('TURN_PHASE_CHANGED', {
      phase: 'FLYING',
      throwerId: this.currentThrower,
      catcherId: this.currentThrower === 'left' ? 'right' : 'left',
    });

    // Phát âm thanh vút ném
    soundManager.playThrowSFX();

    const isThrowerLeft = this.currentThrower === 'left';
    const handX = isThrowerLeft ? 840 : 1910;
    const handY = 810;
    const rad = Phaser.Math.DegToRad(angle);

    // Hủy quả pao cũ nếu có
    if (this.paoBall) {
      this.paoBall.destroy();
      this.paoBall = undefined;
    }

    // Tạo sprite Quả Pao Vải Lanh Thổ Cẩm Ngũ Sắc dân gian (thay cho pao_ball_real)
    this.paoBall = this.physics.add.image(handX, handY, 'pao_ball') as Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    this.paoBall.setScale(1.1);
    this.paoBall.setCircle(22, 2, 2);

    // Tính toán vận tốc ban đầu v0 từ thanh lực (0 -> 100)
    const v0 = power * 21.2;
    const vx = isThrowerLeft ? v0 * Math.cos(rad) : -v0 * Math.cos(rad);
    const vy = -v0 * Math.sin(rad);

    this.paoBall.setVelocity(vx, vy);

    // Áp dụng gia tốc gió
    const paoConfig = PAO_TYPES[paoType] || PAO_TYPES.PAO_VAI_LANH;
    let effectiveWind = this.currentWind.direction === 'right' ? this.currentWind.speed : -this.currentWind.speed;
    if (activeItem === 'KHAN_KHANG_GIO') {
      effectiveWind = 0;
      this.showFloatingText('Khăn Kháng Gió: Lặng Gió!', handX, handY - 40, DONG_HO_COLORS.VANG_HOE);
    }

    const windAccel = effectiveWind * PHYSICS_CONSTANTS.WIND_FORCE_SCALE * (paoConfig.windResistance || 1.0);
    this.paoBall.setAccelerationX(windAccel);

    // Gắn Particle Trail
    if (this.paoTrailEmitter) {
      this.paoTrailEmitter.startFollow(this.paoBall);
      this.paoTrailEmitter.start();
    }

    // Hiệu ứng vung tay ném
    const activeArm = isThrowerLeft ? this.throwerArmLeft : this.throwerArmRight;
    if (activeArm) {
      this.tweens.add({
        targets: activeArm,
        scaleX: 1.15,
        duration: 120,
        yoyo: true,
      });
    }
  }

  /**
   * Lượt Bot Bé Đông Hồ tự động ném (khi currentThrower === 'right')
   */
  private startBotThrowTurn(): void {
    if (this.isMatchFinished || this.currentThrower !== 'right') return;

    // Tính toán góc và lực ném qua BotAIEngine
    const windValue = this.currentWind.direction === 'right' ? this.currentWind.speed : -this.currentWind.speed;
    const botDecision = BotAIEngine.calculateThrowDecision(
      1910,
      840,
      windValue,
      false, // Ném từ phải sang trái
      'NORMAL',
      'PAO_VAI_LANH'
    );

    // Xoay cánh tay ném của Bot Bé Gái theo góc ngắm
    this.tweens.addCounter({
      from: 45,
      to: botDecision.angle,
      duration: 600,
      ease: 'Sine.easeOut',
      onUpdate: (tween) => {
        const val = tween.getValue() ?? 45;
        this.updateArmAngle('right', Math.round(val));
      },
    });

    // Sau thời gian ngắm -> Bot phóng pao
    this.botAimTimer = this.time.delayedCall(botDecision.aimDelayMs, () => {
      if (this.turnPhase === 'AIMING' && this.currentThrower === 'right') {
        this.executeThrow(botDecision.angle, botDecision.power, botDecision.paoType);
      }
    });
  }

  /**
   * Xử lý khi Quả Pao rơi chạm đất (Ném trượt / hụt tầm)
   */
  private handlePaoGroundImpact(): void {
    if (!this.paoBall) return;
    this.turnPhase = 'RESOLVING';

    if (this.paoTrailEmitter) {
      this.paoTrailEmitter.stop();
    }

    // Phát âm thanh rơi đất
    soundManager.playGroundMissSFX();

    // Quả pao nảy nhẹ trên đất và tan thành bụi giấy điệp mộc bản
    const body = this.paoBall.body;
    body.setVelocityY(-110);
    body.setVelocityX(body.velocity.x * 0.35);
    body.setAccelerationX(0);

    this.tweens.add({
      targets: this.paoBall,
      alpha: 0,
      scale: 0.2,
      duration: 400,
      delay: 350,
      onComplete: () => {
        if (this.paoBall) {
          this.paoBall.destroy();
          this.paoBall = undefined;
        }
      },
    });

    this.showFloatingText(
      'Rơi Đất! Tiếc thay một nhịp tơ duyên!',
      this.paoBall ? this.paoBall.x : 1300,
      GAME_CANVAS_CONFIG.GROUND_Y - 30,
      DONG_HO_COLORS.SON
    );

    eventBus.emit('ROUND_FINISHED', {
      roundNumber: this.roundNumber,
      throwerId: this.currentThrower,
      catcherId: this.currentThrower === 'left' ? 'right' : 'left',
      paoLanded: false,
      qteGrade: 'NONE',
      empathyGained: { throwerGained: 0, catcherGained: 0 },
      totalEmpathy: this.empathyPoints,
      flavorMessage: 'Tiếc thay một nhịp tơ duyên!',
    });

    this.time.delayedCall(1800, () => {
      this.prepareNextTurn();
    });
  }

  /**
   * Xử lý khi pao bay quá đà ra khỏi màn hình
   */
  private handlePaoOutOfBounds(): void {
    if (this.turnPhase === 'RESOLVING') return;
    this.turnPhase = 'RESOLVING';

    if (this.paoTrailEmitter) this.paoTrailEmitter.stop();
    if (this.paoBall) this.paoBall.destroy();

    soundManager.playGroundMissSFX();
    this.showFloatingText('Bay Quá Tầm!', this.scale.width / 2, 200, DONG_HO_COLORS.THAN_TRE);

    this.time.delayedCall(1500, () => {
      this.prepareNextTurn();
    });
  }

  /**
   * Xử lý kết quả QTE nộp từ React DOM HUD hoặc từ Bot
   */
  public handleCatchResult(grade: CatchGrade, offsetMs: number): void {
    if (this.turnPhase !== 'QTE' && this.turnPhase !== 'FLYING') return;
    this.turnPhase = 'RESOLVING';

    if (this.paoTrailEmitter) {
      this.paoTrailEmitter.stop();
    }

    const catcherX = this.currentThrower === 'left' ? 1910 : 840;
    const catcherY = 810;

    let throwerGained = 0;
    let catcherGained = 0;
    let message = '';

    if (grade === 'PERFECT') {
      throwerGained = 12;
      catcherGained = 18;
      message = 'Hoàn Hảo! Tâm đầu ý hợp!';
      soundManager.playCatchSuccessSFX(true);
      this.celebrateCatchSuccess(catcherX, catcherY, true);
    } else if (grade === 'GOOD') {
      throwerGained = 8;
      catcherGained = 10;
      message = 'Chuẩn Xác! Nhịp duyên gắn kết!';
      soundManager.playCatchSuccessSFX(false);
      this.celebrateCatchSuccess(catcherX, catcherY, false);
    } else {
      throwerGained = 3;
      catcherGained = 0;
      message = 'Hụt Nhịp! Pao rơi chạm đất!';
      soundManager.playGroundMissSFX();
      this.celebrateCatchMiss(catcherX, catcherY);
    }

    // Hiệu ứng item
    if (this.activeItemInRound === 'CHI_NGU_SAC' && grade !== 'MISS') {
      throwerGained += 5;
      catcherGained += 5;
    }
    if (this.activeItemInRound === 'TIENG_KHEN_XUAN' && grade !== 'MISS') {
      throwerGained = Math.round(throwerGained * 1.5);
      catcherGained = Math.round(catcherGained * 1.5);
    }

    // Cộng điểm cho bên ném và bên đón
    if (this.currentThrower === 'left') {
      this.empathyPoints.left = Math.min(PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS, this.empathyPoints.left + throwerGained);
      this.empathyPoints.right = Math.min(PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS, this.empathyPoints.right + catcherGained);
    } else {
      this.empathyPoints.right = Math.min(PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS, this.empathyPoints.right + throwerGained);
      this.empathyPoints.left = Math.min(PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS, this.empathyPoints.left + catcherGained);
    }

    eventBus.emit('EMPATHY_POINTS_UPDATED', this.empathyPoints);

    this.showFloatingText(
      `+${catcherGained} EP`,
      catcherX,
      catcherY - 50,
      grade === 'PERFECT' ? DONG_HO_COLORS.VANG_HOE : DONG_HO_COLORS.CHAM
    );

    eventBus.emit('ROUND_FINISHED', {
      roundNumber: this.roundNumber,
      throwerId: this.currentThrower,
      catcherId: this.currentThrower === 'left' ? 'right' : 'left',
      paoLanded: grade !== 'MISS',
      qteGrade: grade,
      empathyGained: { throwerGained, catcherGained },
      totalEmpathy: this.empathyPoints,
      flavorMessage: message,
    });

    // Kiểm tra điều kiện Chiến Thắng (>= 100 EP)
    if (
      this.empathyPoints.left >= PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS ||
      this.empathyPoints.right >= PHYSICS_CONSTANTS.TARGET_EMPATHY_POINTS
    ) {
      this.isMatchFinished = true;
      soundManager.playVictoryFanfare();
      return;
    }

    // Chuẩn bị lượt tiếp theo sau 2 giây
    this.time.delayedCall(2000, () => {
      this.prepareNextTurn();
    });
  }

  /**
   * Hiệu ứng đón Pao thành công: Hút pao vào tay & Nổ pháo hoa ngũ sắc
   */
  private celebrateCatchSuccess(targetX: number, targetY: number, isPerfect: boolean): void {
    if (this.paoBall) {
      this.paoBall.body.setVelocity(0, 0);
      this.paoBall.body.setAcceleration(0, 0);

      this.tweens.add({
        targets: this.paoBall,
        x: targetX,
        y: targetY,
        scale: 0.2,
        alpha: 0,
        duration: 280,
        ease: 'Back.easeIn',
        onComplete: () => {
          this.paoBall?.destroy();
        },
      });
    }

    // Pháo hoa ngũ sắc
    const burstCount = isPerfect ? 24 : 14;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i * 360) / burstCount;
      const speed = Phaser.Math.Between(100, isPerfect ? 280 : 180);
      const rad = Phaser.Math.DegToRad(angle);

      const p = this.add.image(targetX, targetY, 'cloud_particle');
      p.setScale(Phaser.Math.FloatBetween(0.5, 1.2));

      this.tweens.add({
        targets: p,
        x: targetX + Math.cos(rad) * speed,
        y: targetY + Math.sin(rad) * speed,
        alpha: 0,
        scale: 0.1,
        duration: 700,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  /**
   * Hiệu ứng đón Pao trượt
   */
  private celebrateCatchMiss(targetX: number, targetY: number): void {
    if (this.paoBall) {
      this.paoBall.body.setVelocity(this.currentThrower === 'left' ? 90 : -90, 180);
      this.tweens.add({
        targets: this.paoBall,
        y: GAME_CANVAS_CONFIG.GROUND_Y - 10,
        alpha: 0,
        scale: 0.2,
        duration: 450,
        delay: 200,
        onComplete: () => {
          if (this.paoBall) {
            this.paoBall.destroy();
            this.paoBall = undefined;
          }
        },
      });
    }
  }

  /**
   * Đổi Lượt Ném và chuẩn bị lượt mới (Turn Alternation)
   */
  private prepareNextTurn(): void {
    if (this.isMatchFinished) return;

    this.roundNumber++;

    if (this.paoBall) {
      this.paoBall.destroy();
    }

    // Đổi vai ném <-> đón
    this.currentThrower = this.currentThrower === 'left' ? 'right' : 'left';

    // Đổi gió ngẫu nhiên sau mỗi 2 lượt
    if (this.roundNumber % 2 === 1) {
      this.generateNewWind();
    }

    this.turnPhase = 'AIMING';
    this.hasTriggeredQte = false;
    this.activeItemInRound = undefined;

    // Cập nhật vị trí vòng đón theo người đón mới
    this.updateCatchRingPosition();

    if (this.currentThrower === 'left') {
      this.redrawTrajectory(this.currentAngle, this.currentPowerPreview);
    } else {
      this.trajectoryGraphics?.clear();
    }

    eventBus.emit('TURN_PHASE_CHANGED', {
      phase: 'AIMING',
      throwerId: this.currentThrower,
      catcherId: this.currentThrower === 'left' ? 'right' : 'left',
    });
    eventBus.emit('START_AIMING', {
      throwerId: this.currentThrower,
      turnDurationMs: PHYSICS_CONSTANTS.TURN_DURATION_SEC * 1000,
    });

    // Nếu đến lượt Bot ném -> Kích hoạt Bot ngắm ném
    if (this.currentThrower === 'right') {
      this.startBotThrowTurn();
    }
  }

  /**
   * Hiển thị chữ số nhảy thư pháp bay lên (Floating Combat Text)
   */
  private showFloatingText(text: string, x: number, y: number, color: string = DONG_HO_COLORS.SON): void {
    const floatText = this.add.text(x, y, text, {
      fontFamily: 'serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: color,
      stroke: DONG_HO_COLORS.THAN_TRE,
      strokeThickness: 3,
      shadow: { blur: 4, stroke: true, fill: true, color: '#FFFDF8' },
    }).setOrigin(0.5, 0.5);

    this.tweens.add({
      targets: floatText,
      y: y - 60,
      alpha: 0,
      duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => floatText.destroy(),
    });
  }

  /**
   * Vẽ nền giấy điệp và ánh xà cừ óng ánh
   */
  private renderDongHoBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillStyle(0xf7f2e7, 1);
    bg.fillRect(0, 0, width, height);

    bg.fillStyle(0xfffdf8, 0.6);
    for (let i = 0; i < 40; i++) {
      const x = (i * 37) % width;
      const y = (i * 29) % (height - 150);
      bg.fillEllipse(x, y, 40, 8);
    }
  }

  /**
   * Vẽ dãy núi chàm xa xa theo nét mộc tranh Đông Hồ
   */
  private renderDistantMountains(width: number, height: number): void {
    const mountains = this.add.graphics();
    mountains.fillStyle(0x2e4e6b, 0.25);
    mountains.lineStyle(2, 0x1f1e1b, 0.4);

    mountains.beginPath();
    mountains.moveTo(0, 480);
    mountains.lineTo(180, 360);
    mountains.lineTo(380, 450);
    mountains.lineTo(600, 340);
    mountains.lineTo(820, 430);
    mountains.lineTo(1050, 320);
    mountains.lineTo(width, 460);
    mountains.lineTo(width, height);
    mountains.lineTo(0, height);
    mountains.closePath();
    mountains.fillPath();
    mountains.strokePath();
  }

  /**
   * Vẽ Cổng Tam Quan Làng Cổ, Cây Đa và Rặng Tre
   */
  private renderVillageScenery(width: number, height: number): void {
    const scenery = this.add.graphics();

    // Cột cổng tam quan làng cổ bên trái (Màu Son & Than tre)
    scenery.fillStyle(0xc73e3a, 0.9);
    scenery.lineStyle(3, 0x1f1e1b, 1);
    scenery.fillRect(50, 260, 40, 320);
    scenery.strokeRect(50, 260, 40, 320);

    // Mái đình cong vút
    scenery.beginPath();
    scenery.moveTo(20, 260);
    scenery.lineTo(120, 260);
    scenery.lineTo(70, 210);
    scenery.closePath();
    scenery.fillPath();
    scenery.strokePath();

    // Cột cổng làng bên phải
    scenery.fillStyle(0xc73e3a, 0.8);
    scenery.fillRect(width - 90, 280, 35, 300);
    scenery.strokeRect(width - 90, 280, 35, 300);
    scenery.beginPath();
    scenery.moveTo(width - 120, 280);
    scenery.lineTo(width - 30, 280);
    scenery.lineTo(width - 75, 235);
    scenery.closePath();
    scenery.fillPath();
    scenery.strokePath();

    // Rặng tre xanh mộc
    scenery.lineStyle(4, 0x4a6b45, 0.85);
    for (let i = 0; i < 6; i++) {
      const bx = 110 + i * 14;
      scenery.beginPath();
      scenery.moveTo(bx, 580);
      scenery.lineTo(bx + (i % 2 === 0 ? -15 : 15), 320 + i * 20);
      scenery.strokePath();
    }
  }

  /**
   * Mặt đất sới pao và sóng thủy ba mộc bản ở chân trời
   */
  private renderGroundAndWaves(width: number, height: number): void {
    const ground = this.add.graphics();
    const groundY = GAME_CANVAS_CONFIG.GROUND_Y;

    ground.fillStyle(0xeadfc9, 1);
    ground.fillRect(0, groundY, width, height - groundY);

    ground.lineStyle(4, 0x1f1e1b, 1);
    ground.beginPath();
    ground.moveTo(0, groundY);
    ground.lineTo(width, groundY);
    ground.strokePath();

    ground.lineStyle(2, 0x2e4e6b, 0.7);
    for (let x = 0; x < width; x += 60) {
      ground.beginPath();
      ground.arc(x + 30, groundY + 35, 22, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false);
      ground.strokePath();
    }

    this.groundLine = ground;
  }

  /**
   * Vẽ 2 nhân vật chú bé Đông Hồ (Bên Trái: Bé Trai, Bên Phải: Bé Gái)
   */
  private renderDongHoCharacters(): void {
    const throwerX = GAME_CANVAS_CONFIG.PLAYER_LEFT_X;
    const catcherX = GAME_CANVAS_CONFIG.PLAYER_RIGHT_X;
    const groundY = GAME_CANVAS_CONFIG.GROUND_Y;

    // ==================== BÉ TRAI ĐÔNG HỒ (BÊN TRÁI) ====================
    const boy = this.add.graphics();
    boy.fillStyle(0xc73e3a, 1); // Áo màu son
    boy.lineStyle(3, 0x1f1e1b, 1);
    boy.fillRect(throwerX - 25, groundY - 110, 50, 70);
    boy.strokeRect(throwerX - 25, groundY - 110, 50, 70);

    boy.fillStyle(0xf7f2e7, 1);
    boy.fillRect(throwerX - 22, groundY - 40, 18, 40);
    boy.strokeRect(throwerX - 22, groundY - 40, 18, 40);
    boy.fillRect(throwerX + 4, groundY - 40, 18, 40);
    boy.strokeRect(throwerX + 4, groundY - 40, 18, 40);

    boy.fillStyle(0xfffdf8, 1);
    boy.fillCircle(throwerX, groundY - 140, 28);
    boy.strokeCircle(throwerX, groundY - 140, 28);

    boy.fillStyle(0x1f1e1b, 1);
    boy.fillCircle(throwerX, groundY - 170, 12);

    boy.lineStyle(2, 0xe5a823, 1);
    boy.strokeCircle(throwerX, groundY - 120, 16);

    this.add.text(throwerX, groundY - 195, 'Bé Trai (Bạn)', {
      fontFamily: 'serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: DONG_HO_COLORS.SON,
      backgroundColor: '#FFFDF8',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0.5);

    // Cánh tay Bé Trai
    this.throwerArmLeft = this.add.graphics();
    this.updateArmAngle('left', PHYSICS_CONSTANTS.DEFAULT_ANGLE);
    this.throwerGraphicsLeft = boy;

    // ==================== BÉ GÁI ĐÔNG HỒ (BÊN PHẢI - BOT AI) ====================
    const girl = this.add.graphics();
    girl.fillStyle(0x2e4e6b, 1); // Áo màu chàm
    girl.lineStyle(3, 0x1f1e1b, 1);
    girl.fillRect(catcherX - 25, groundY - 110, 50, 70);
    girl.strokeRect(catcherX - 25, groundY - 110, 50, 70);

    girl.fillStyle(0xf7f2e7, 1);
    girl.fillRect(catcherX - 22, groundY - 40, 44, 40);
    girl.strokeRect(catcherX - 22, groundY - 40, 44, 40);

    girl.fillStyle(0xfffdf8, 1);
    girl.fillCircle(catcherX, groundY - 140, 28);
    girl.strokeCircle(catcherX, groundY - 140, 28);

    girl.fillStyle(0x1f1e1b, 1);
    girl.fillCircle(catcherX - 18, groundY - 165, 10);
    girl.fillCircle(catcherX + 18, groundY - 165, 10);

    girl.fillStyle(0xc73e3a, 0.9);
    girl.fillTriangle(
      catcherX - 15, groundY - 110,
      catcherX + 15, groundY - 110,
      catcherX, groundY - 75
    );

    this.add.text(catcherX, groundY - 195, 'Bé Gái (Bot AI)', {
      fontFamily: 'serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: DONG_HO_COLORS.CHAM,
      backgroundColor: '#FFFDF8',
      padding: { x: 8, y: 3 },
    }).setOrigin(0.5, 0.5);

    // Cánh tay Bé Gái
    this.throwerArmRight = this.add.graphics();
    this.updateArmAngle('right', PHYSICS_CONSTANTS.DEFAULT_ANGLE);
    this.catcherGraphicsRight = girl;

    // Vòng tròn đón pao
    this.catchRing = this.add.image(catcherX, groundY - 95, 'catch_reticle');
    this.catchRing.setScale(0.85);
    this.catchRing.setAlpha(0.6);

    this.tweens.add({
      targets: this.catchRing,
      scaleX: 1.0,
      scaleY: 1.0,
      alpha: 0.9,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Cập nhật hướng xoay của cánh tay ném theo góc (Hỗ trợ cả 2 bên)
   */
  private updateArmAngle(side: 'left' | 'right', angleDeg: number): void {
    const arm = side === 'left' ? this.throwerArmLeft : this.throwerArmRight;
    if (!arm) return;

    if (side === 'left') {
      this.currentAngle = angleDeg;
    }

    arm.clear();
    const throwerX = side === 'left' ? GAME_CANVAS_CONFIG.PLAYER_LEFT_X : GAME_CANVAS_CONFIG.PLAYER_RIGHT_X;
    const groundY = GAME_CANVAS_CONFIG.GROUND_Y;
    const shoulderX = side === 'left' ? throwerX + 15 : throwerX - 15;
    const shoulderY = groundY - 95;

    const rad = Phaser.Math.DegToRad(angleDeg);
    const armLength = 36;
    const handX = side === 'left'
      ? shoulderX + Math.cos(rad) * armLength
      : shoulderX - Math.cos(rad) * armLength;
    const handY = shoulderY - Math.sin(rad) * armLength;

    arm.lineStyle(8, 0x1f1e1b, 1);
    arm.beginPath();
    arm.moveTo(shoulderX, shoulderY);
    arm.lineTo(handX, handY);
    arm.strokePath();

    arm.lineStyle(5, 0xfffdf8, 1);
    arm.beginPath();
    arm.moveTo(shoulderX, shoulderY);
    arm.lineTo(handX, handY);
    arm.strokePath();

    arm.fillStyle(0xe5a823, 1);
    arm.fillCircle(handX, handY, 9);
    arm.lineStyle(2, 0x1f1e1b, 1);
    arm.strokeCircle(handX, handY, 9);
  }

  /**
   * Đăng ký lắng nghe sự kiện từ React DOM HUD qua EventBus
   */
  private setupEventBus(): void {
    // 1. Chỉnh góc ném từ người chơi
    const unsubAngle = eventBus.on('ANGLE_CHANGED', (data) => {
      if (this.currentThrower === 'left') {
        this.currentAngle = data.angle;
        this.redrawTrajectory(data.angle, this.currentPowerPreview);
      }
    });
    this.unsubscribeEvents.push(unsubAngle);

    // 1b. Thay đổi lực ném
    const unsubPower = eventBus.on('POWER_CHANGED', (data) => {
      this.currentPowerPreview = data.power;
      if (this.currentThrower === 'left') {
        this.redrawTrajectory(this.currentAngle, data.power);
      }
    });
    this.unsubscribeEvents.push(unsubPower);

    // 2. Kích hoạt ném pao từ người chơi
    const unsubThrow = eventBus.on('TRIGGER_THROW', (data) => {
      if (this.currentThrower === 'left') {
        this.executeThrow(data.angle, data.power, data.paoType, data.activeItem);
      }
    });
    this.unsubscribeEvents.push(unsubThrow);

    // 3. Kết quả QTE từ nút Đón của người chơi
    const unsubCatchResult = eventBus.on('CATCH_RESULT', (data) => {
      if (this.currentThrower === 'right') {
        this.handleCatchResult(data.grade, data.offsetMs);
      }
    });
    this.unsubscribeEvents.push(unsubCatchResult);

    // 4. Chơi lại ván mới
    const unsubRestart = eventBus.on('GAME_RESTART', () => {
      this.isMatchFinished = false;
      this.roundNumber = 1;
      this.currentThrower = 'left';
      this.empathyPoints = { left: 0, right: 0 };
      this.turnPhase = 'AIMING';
      this.hasTriggeredQte = false;

      if (this.paoBall) this.paoBall.destroy();
      this.updateCatchRingPosition();
      this.generateNewWind();

      eventBus.emit('EMPATHY_POINTS_UPDATED', this.empathyPoints);
      eventBus.emit('TURN_PHASE_CHANGED', { phase: 'AIMING', throwerId: 'left', catcherId: 'right' });
    });
    this.unsubscribeEvents.push(unsubRestart);

    // 5. Floating text
    const unsubFloatingText = eventBus.on('SHOW_FLOATING_TEXT', (data) => {
      this.showFloatingText(data.text, data.x, data.y, data.color);
    });
    this.unsubscribeEvents.push(unsubFloatingText);
  }

  /**
   * Dọn dẹp tài nguyên khi unmount
   */
  shutdown(): void {
    this.unsubscribeEvents.forEach((unsub) => unsub());
    this.unsubscribeEvents = [];
    if (this.botAimTimer) this.botAimTimer.destroy();
    if (this.botCatchTimer) this.botCatchTimer.destroy();
    if (this.paoBall) this.paoBall.destroy();
  }
}
