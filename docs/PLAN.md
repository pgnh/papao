# KẾ HOẠCH TRIỂN KHAI CHI TIẾT (SOLO DEVELOPER ROADMAP)
## DỰ ÁN: PAO VERSION 0.1 – SỚI PAO DÂN GIAN
### Lộ trình 6 Phase & Danh sách Sub-tasks Thực thi

---

## 1. NGUYÊN TẮC THIẾT KẾ CHO SOLO DEVELOPER (SOLO DEV PRINCIPLES)

1. **Agile Lean & Incremental Delivery:** Mỗi Phase đều phải cho ra một sản phẩm chạy được thực tế (Playable Build), không chờ đợi toàn bộ tính năng hoàn thiện mới bắt đầu test.
2. **Offline-First & Testability:** Ưu tiên hoàn thiện chế độ Solo đấu Bot (Phase 3) trước khi xây dựng Multiplayer WebSocket (Phase 4). Điều này giúp lập trình viên kiểm thử cơ chế ném/bắt hàng nghìn lần trên 1 máy tính mà không phụ thuộc hạ tầng mạng.
3. **Decoupled Architecture:** Tách rời hoàn toàn giao diện HUD (Next.js/Tailwind) và Scene game (Phaser 3) thông qua EventBus, cho phép chỉnh sửa UI mà không làm hỏng code vật lý.
4. **Asset Optimization:** Dùng định dạng WebP nén lossless cho đồ họa tranh Đông Hồ và âm thanh nén 64-96kbps để giảm tối đa kích thước bundle tải trang di động.

---

## 2. LỘ TRÌNH 6 PHASE TỔNG QUAN

```
Tuần 1: Phase 1 ──► Khởi tạo Monorepo, Next.js PWA, Phaser Canvas & Design System Đông Hồ
Tuần 2: Phase 2 ──► Core Physics Parabol, Gió, Thước Góc, Thanh Lực & QTE Đón Pao
Tuần 3: Phase 3 ──► Chế độ Solo Offline, AI Bot Bé Đông Hồ, Animation Sprite & Audio
Tuần 4: Phase 4 ──► Backend Realtime Socket.io, Đồng bộ State Machine & Ghép Đấu 1v1
Tuần 5: Phase 5 ──► LBS Bản Đồ Leaflet (Sới Làng & Du Hành) + Túi Pao & Item Thổ Cẩm
Tuần 6: Phase 6 ──► Tối ưu PWA 60fps Mobile, Deploy Production (Vercel + Railway) & Test
```

---

## 3. DANH SÁCH CHI TIẾT CÁC SUB-TASKS THEO PHASE

### PHASE 1: KHỞI TẠO NỀN TẢNG, PHASER CANVAS & DESIGN SYSTEM ĐÔNG HỒ (Tuần 1)
**Mục tiêu:** Dựng khung kiến trúc monorepo, hiển thị được bối cảnh sân đình tranh Đông Hồ trên canvas di động xoay ngang, PWA shell sẵn sàng.

- [x] **Sub-task 1.1: Thiết lập Monorepo (Turborepo / pnpm workspace)**
  - Cấu trúc thư mục: `apps/web`, `apps/server`, `packages/shared`.
  - Thiết lập TypeScript strict mode, ESLint, Prettier đồng bộ cho toàn bộ repo.
  - Viết `packages/shared` chứa các hằng số màu sắc, physics configs.
- [x] **Sub-task 1.2: Cấu hình Next.js 14+ PWA Shell (`apps/web`)**
  - Khởi tạo Next.js App Router với Tailwind CSS.
  - Cấu hình `@ducanh2912/next-pwa`, tạo `manifest.json` (chủ đề mộc bản Đông Hồ, display: standalone, orientation: landscape).
  - Tích hợp bộ font chữ mô phỏng khắc gỗ/thư pháp Việt (như *SVN-Nostalgic*, *Sedgwick Coave*, hoặc *Averia Libre*).
  - Định nghĩa Palette màu ngũ sắc Đông Hồ trong `tailwind.config.ts` (son, chàm, điệp, vàng hòe, than tre).
- [x] **Sub-task 1.3: Tích hợp Phaser 3 vào React Component**
  - Tạo Dynamic Component `PhaserGame.tsx` (SSR disabled: `next/dynamic` với `{ ssr: false }`).
  - Xây dựng `BootScene` và `ArenaScene` cơ bản trên Phaser.
  - Thiết lập tỉ lệ co giãn `Phaser.Scale.FIT`, tự động khớp kích thước màn hình thiết bị mà không vỡ hạt.
- [x] **Sub-task 1.4: Triển khai Landscape Lock & Warning Overlay**
  - Xây dựng component `OrientationGuard.tsx`: Khi người dùng cầm dọc điện thoại, tự động làm mờ và hiển thị ảnh chú bé Đông Hồ cầm pao nghiêng người nhắc: *"Xin vui lòng xoay ngang màn hình để vào sới"*.
- [x] **Sub-task 1.5: Render Bối Cảnh Mộc Bản Đông Hồ Đầu Tiên**
  - Tải texture nền giấy điệp óng ánh (nhẹ, lặp tile).
  - Vẽ layer cổng đình, cây đa, rặng tre và con sóng thủy ba mộc bản lên Canvas.
  - Đặt 2 sprite chú bé Đông Hồ (Bên Ném & Bên Đón) ở hai đầu sới.

*Definition of Done (DoD) Phase 1:*
> Mở web trên điện thoại (cả iOS & Android), xoay ngang thấy bối cảnh sới làng Đông Hồ hiển thị sắc nét, co giãn chuẩn 16:9 - 20:9, không bị méo hình, PWA có thể thêm vào màn hình chính (Add to Home Screen).

---

### PHASE 2: VẬT LÝ PARABOL, THƯỚC GÓC, THANH LỰC & QTE ĐÓN PAO (Tuần 2)
**Mục tiêu:** Người chơi có thể tự căn góc, giữ nhịp lực, ném quả pao bay parabol qua đầu đối phương và kích hoạt nhịp bắt QTE.

- [x] **Sub-task 2.1: Triển khai Cầu Nối Phaser-React EventBus**
  - Tạo module `EventBus.ts` trong `packages/shared`.
  - Đăng ký các sự kiện tương tác DOM <-> Canvas (`ANGLE_CHANGED`, `POWER_CHANGED`, `TRIGGER_THROW`, `CATCH_QTE_TRIGGER`).
- [x] **Sub-task 2.2: Xây dựng Thước Góc Rẻ Quạt Mây Cuộn (DOM UI)**
  - Vẽ thước đo góc dạng nan quạt mộc bản góc trái dưới (0° đến 90°).
  - Cho phép người chơi vuốt kim chỉ góc hoặc bấm 2 nút `+` / `-` để tinh chỉnh từng độ.
  - Bắn sự kiện sang Phaser để xoay cánh tay nhân vật ném theo đúng góc đã chọn.
- [x] **Sub-task 2.3: Xây dựng Thanh Lực & Nút NÉM Triện Đỏ (DOM UI)**
  - Thanh đo lực mộc bản nằm ngang dưới thước góc.
  - Nút con dấu triện đỏ khắc chữ **"NÉM"**.
  - Xử lý sự kiện giữ tay (Touch Start / Mouse Down) để thanh lực tăng dần từ 0 -> 100%, nhả tay (Touch End) để kích hoạt ném pao.
- [x] **Sub-task 2.4: Lập trình Vật Lý Quỹ Đạo Ném Pao (Phaser Arcade Physics)**
  - Khởi tạo sprite Quả Pao với Arcade Physics Body.
  - Công thức tính vận tốc đầu: $v_x = v_0 \cos(\alpha)$, $v_y = -v_0 \sin(\alpha)$.
  - Tạo hạt mây ngũ sắc (Particle Trail) bay uốn lượn theo đuôi quả pao.
- [x] **Sub-task 2.5: Hệ thống Gió (Wind Simulation)**
  - Tạo bộ phát giá trị gió ngẫu nhiên từ $-5.0$ đến $+5.0$.
  - Áp dụng gia tốc gió $a_{wind}$ liên tục vào $v_x$ của quả pao theo từng frame `update()`.
  - Hiển thị HUD ngọn gió cuộn mây ở cạnh trên màn hình.
- [x] **Sub-task 2.6: Cơ chế Hitbox Đón & Mini-game QTE Bắt Pao**
  - Đặt vùng cảm ứng (Catch Zone Hitbox) ở khu vực bán thân trên của nhân vật đón.
  - Khi pao chạm rìa vùng đón: Phaser phát tín hiệu `TRIGGER_CATCH_QTE` cho React DOM.
  - React hiển thị vòng tròn nhịp điệu (Rhythm Reticle) thu nhỏ dần trong 1200ms.
  - Người chơi bấm nút "ĐÓN": Tính toán sai số thời gian để gán nhãn *Perfect*, *Good*, hoặc *Miss*.
- [x] **Sub-task 2.7: Logic Điểm Thấu Cảm (Empathy Points - EP)**
  - Hiển thị 2 thanh EP từ 0 đến 100 ở đỉnh màn hình.
  - Tích lũy điểm khi bắt dính, hiển thị số nhảy (Floating Combat Text) phong cách thư pháp.

*Definition of Done (DoD) Phase 2:*
> Người chơi có thể tự điều chỉnh góc, canh thanh lực, ném pao bay uốn lượn chịu ảnh hưởng của gió, bấm nút bắt nhịp QTE và thanh điểm Thấu Cảm nhảy số chuẩn xác.

---

### PHASE 3: CHẾ ĐỘ SOLO OFFLINE, AI BOT BÉ ĐÔNG HỒ, SPRITE & AUDIO (Tuần 3)
**Mục tiêu:** Trò chơi có thể chơi hoàn chỉnh một ván đấu với Bot máy tính offline, có đầy đủ hiệu ứng âm thanh và động tác nhân vật.

- [x] **Sub-task 3.1: Thuật toán AI Bot Bé Đông Hồ**
  - Viết module `BotAIEngine.ts`: Tự động tính toán góc/lực nghịch đảo (Inverse Kinematics) để ném trúng mục tiêu.
  - Thêm sai số ngẫu nhiên Gaussian để bot có lúc ném trúng tâm, có lúc ném hơi ngắn hoặc hơi dài.
  - Mô phỏng hành vi đón QTE của bot (xác suất 40% Perfect, 50% Good, 10% Miss).
- [x] **Sub-task 3.2: Hoàn thiện Vòng Lặp Trận Đấu Offline (Local State Machine)**
  - Quản lý trạng thái ván đấu: Khởi đầu -> Lượt người chơi -> Pao bay -> Lượt Bot đón -> Đổi vai -> Lượt Bot ném -> Pao bay -> Lượt người chơi đón -> Kiểm tra điều kiện thắng (100 EP).
  - Xử lý trường hợp ném rơi đất: Pao nảy đất kèm hiệu ứng bụi giấy điệp, đổi lượt không cộng điểm.
- [x] **Sub-task 3.3: Animation Spritesheet Nhân Vật Đông Hồ**
  - Tích hợp các frame động tác cắt từ tranh mộc bản:
    - `idle`: Nhún nhảy vui tươi cầm quả pao.
    - `aim`: Cánh tay xoay và cơ thể hơi ngả về sau.
    - `throw`: Vung tay mạnh về phía trước, dải yếm bay trong gió.
    - `catch_ready`: Hai tay giơ ra phía trước đón chào.
    - `catch_success`: Ôm chặt quả pao vào lòng, cười tươi hoa nở.
    - `catch_miss`: Pao rơi trượt, cúi gãi đầu ngượng ngùng.
- [x] **Sub-task 3.4: Tích hợp Sound Manager & Audio Assets**
  - Nhạc nền (BGM): Nhạc cụ dân tộc (Khèn, sáo, trống hội) lặp tuần hoàn mượt mà.
  - Hiệu ứng âm thanh (SFX): Tiếng vút ném, tiếng gió rít, tiếng chuông đồng leng keng, tiếng bốp ôm pao, tiếng pháo giấy nổ khi chiến thắng.
  - Nút bật/tắt âm thanh (Mute/Unmute) lưu trạng thái vào LocalStorage.
- [x] **Sub-task 3.5: Màn hình Chiến Thắng & Thu Phục (Victory Screen)**
  - Khi đạt 100 EP: Dừng trận đấu, hiển thị con dấu triện đỏ **"TÂM ĐẦU Ý HỢP"**, hiệu ứng mưa pháo giấy ngũ sắc và thông số tổng kết trận đấu.

*Definition of Done (DoD) Phase 3:*
> Người chơi có thể mở máy lên và chơi trọn vẹn 1 ván đấu 3 phút với Bot Bé Đông Hồ, có đầy đủ chuyển động mượt mà, âm nhạc rộn rã và màn hình tổng kết hoàn chỉnh mà không cần mạng Internet.

---

### PHASE 4: BACKEND REALTIME & PHÒNG ĐẤU PVP 1V1 (Tuần 4)
**Mục tiêu:** 2 người chơi trên 2 thiết bị khác nhau có thể ghép đôi, ném pao qua lại theo thời gian thực qua WebSocket.

- [ ] **Sub-task 4.1: Xây dựng Game Server Node.js (`apps/server`)**
  - Khởi tạo server Fastify + Socket.io v4 với TypeScript.
  - Cấu hình CORS an toàn cho domain client web.
  - Tạo cấu trúc quản lý: `RoomManager`, `MatchSession`, `TurnTimer`.
- [ ] **Sub-task 4.2: Triển khai Server-Authoritative State Machine**
  - Lập trình vòng đời trận đấu trên server (Round countdown, Aim timer 15s, QTE window 3s).
  - Server chịu trách nhiệm tính toán kết quả ném và gửi tọa độ quỹ đạo xuống cả 2 máy.
  - Tự động thực hiện lượt ném mặc định (ném trượt) nếu người chơi để hết 15 giây ngắm.
- [ ] **Sub-task 4.3: Hiện thực hóa Bộ Gói Tin WebSocket (C2S & S2C)**
  - Viết các handlers trên server và client theo đúng interface trong `packages/shared`:
    - `C2S_JOIN_MATCH` / `S2C_MATCH_FOUND`
    - `C2S_THROW_PAO` / `S2C_PAO_THROWN`
    - `S2C_TRIGGER_QTE_PROMPT` / `C2S_CATCH_QTE_INPUT`
    - `S2C_ROUND_RESULT` / `S2C_MATCH_END`
- [ ] **Sub-task 4.4: Sảnh Ghép Trận & Ghép Cặp (Matchmaking)**
  - Chế độ "Cáp Kèo Nhanh": Hệ thống tự động xếp 2 người chơi đang tìm trận vào 1 phòng.
  - Cơ chế **Auto-Bot Fallback**: Nếu sau 15 giây tìm trận trong sảnh mà không có đối thủ người thật nào, server tự động sinh ra một Bot Bé Đông Hồ ảo để người chơi không phải chờ lâu.
  - Chế độ "Tạo Sới Riêng" (Room Code): Tạo mã phòng 4 chữ số dân gian (ví dụ: *MAI, LAN, CUC, TRUC*) để bạn bè mời nhau cùng chơi.
- [ ] **Sub-task 4.5: Xử lý Ngắt Kết Nối & Mất Mạng (Reconnection / Disconnect)**
  - Lưu session token vào LocalStorage.
  - Cửa sổ chờ 20 giây khi một bên rớt mạng. Nếu không kết nối lại kịp, đối thủ được xử thắng "Độc diễn thu phục sới làng".

*Definition of Done (DoD) Phase 4:*
> Hai người chơi trên 2 điện thoại khác nhau có thể vào cùng 1 phòng, thay phiên nhau ném và đón pao với độ trễ phản hồi thấp (<150ms), đồng bộ điểm số và kết thúc trận đấu mượt mà.

---

### PHASE 5: LBS BẢN ĐỒ LEAFLET, TÚI PAO & ITEM THỔ CẨM (Tuần 5)
**Mục tiêu:** Mở rộng trải nghiệm thế giới thực với bản đồ sới làng LBS, hệ thống trang bị quả pao và 4 vật phẩm thổ cẩm tương tác.

- [ ] **Sub-task 5.1: Tích hợp Bản Đồ Sới Làng Leaflet.js (`apps/web`)**
  - Cài đặt Leaflet + React-Leaflet, tùy biến CSS filter bản đồ theo tông màu giấy dó cổ kính.
  - Gọi Geolocation API lấy tọa độ thực của người chơi.
  - Thuật toán sinh Sới Làng lân cận: Dùng Geohash tạo 3-5 điểm POI sới đấu quanh bán kính 1.5km (Sới Đình Làng, Sới Cây Đa, Sới Bến Nước).
- [ ] **Sub-task 5.2: Triển khai Chế Độ "Du Hành Danh Thắng" (Virtual Fallback)**
  - Xây dựng danh sách sới mẫu danh lam thắng cảnh: *Sới Tranh Đông Hồ (Bắc Ninh)*, *Sới Cát Cát (Sapa)*, *Sới Đồng Văn (Hà Giang)*.
  - Cho phép người chơi tự do lựa chọn sới danh thắng để thi đấu nếu không muốn cấp quyền GPS hoặc chơi trên máy tính bàn.
- [ ] **Sub-task 5.3: Xây dựng Giao Diện "Túi Pao" & "Đồ Đạc" (Modal UI)**
  - Modal danh mục các loại Quả Pao: *Pao Vải Lanh*, *Pao Ngô Nương*, *Pao Lông Trĩ*, *Pao Gấm Ngũ Sắc*, *Pao Chuông Đồng*.
  - Hiển thị chỉ số vật lý trực quan: Khối lượng, Kháng gió, Điểm thưởng.
  - Cho phép chọn loại pao mang vào trận đấu.
- [ ] **Sub-task 5.4: Lập trình 4 Vật Phẩm Bổ Trợ Dân Gian (Active In-Match Items)**
  - Thiết kế thanh Item bar nổi trên màn hình trận đấu (tối đa 2 item/trận).
  - Code hiệu ứng logic:
    1. **Dải Khăn Kháng Gió:** Gió giảm ngay về $0.0$ cho lượt hiện tại.
    2. **Chỉ Ngũ Sắc Đồng Lòng:** Vùng bắt QTE nở to hơn $1.5$ lần, cộng thêm 5 EP.
    3. **Chuông Đồng Chỉ Lối:** Vẽ trước 3 điểm chấm quỹ đạo parabol dự kiến trong Phaser.
    4. **Tiếng Khèn Mời Gọi:** Nhân $1.5$ hệ số điểm nếu cả hai bên cùng đạt Perfect/Good.

*Definition of Done (DoD) Phase 5:*
> Người chơi có thể mở bản đồ sới làng, chọn tham gia sới gần nhà hoặc sới danh thắng, trang bị quả pao yêu thích và kích hoạt item bổ trợ ngay trong lượt ném để tạo lợi thế chiến thuật.

---

### PHASE 6: TỐI ƯU HÓA PWA, ĐÓNG GÓI, TRIỂN KHAI & TESTING (Tuần 6)
**Mục tiêu:** Tinh chỉnh hiệu năng đạt chuẩn 60fps trên di động, triển khai production server, kiểm thử toàn diện và đóng gói hoàn thiện bản v0.1.

- [ ] **Sub-task 6.1: Tối ưu Hóa Hiệu Năng & Bộ Nhớ (Performance Tuning)**
  - Audit hiệu năng với Chrome DevTools Performance & Lighthouse PWA.
  - Giảm kích thước ảnh Texture: Convert toàn bộ sprite sang WebP nén lossless, gom sprite sheet bằng TexturePacker.
  - Áp dụng Object Pooling cho các Particle mây ngũ sắc và các thực thể quỹ đạo pao để tránh rác Garbage Collection gây drop frame.
  - Đảm bảo Canvas duy trì đều đặn 60 FPS trên thiết bị di động tầm trung.
- [ ] **Sub-task 6.2: Hoàn thiện Cơ Chế Ngoại Tuyến (Offline Workbox Cache)**
  - Tinh chỉnh cấu hình Workbox Service Worker: Cache toàn bộ static files, fonts và audio assets.
  - Test chế độ Airplane Mode (ngắt mạng hoàn toàn): Game vẫn mở lên bình thường và cho phép chơi solo cùng Bot.
- [ ] **Sub-task 6.3: Thiết lập Hạ Tầng Triển Khai (Production Deployment)**
  - **Client (`apps/web`):** Deploy lên Vercel / Cloudflare Pages, trỏ custom domain, bật HTTPS.
  - **Server (`apps/server`):** Đóng gói Dockerfile, deploy lên Railway / Render, cấu hình WSS (WebSocket Secure).
  - Cấu hình Environment Variables (`NEXT_PUBLIC_SOCKET_URL`, `PORT`, `CORS_ORIGIN`).
- [ ] **Sub-task 6.4: Thực hiện Checklist Kiểm Thử Toàn Diện (QA & Testing Checklist)**
  - Chạy smoke test trên các trình duyệt: Safari iOS, Chrome Android, Samsung Internet, Edge Desktop.
  - Test tải nhiều phòng đấu đồng thời trên server.
  - Test trường hợp xoay ngang/xoay dọc đột ngột khi đang trong trận đấu.
  - Test trường hợp nhận cuộc gọi hoặc ẩn tab trình duyệt (Visibility Change API).
- [ ] **Sub-task 6.5: Chuẩn bị Tư Liệu Phát Hành & Trình Diễn**
  - Chụp ảnh gameplay trailer phong cách tranh Đông Hồ.
  - Viết tài liệu `README.md` hướng dẫn chạy local chỉ với 2 câu lệnh (`pnpm install && pnpm dev`).

*Definition of Done (DoD) Phase 6:*
> Bản PWA chạy trực tiếp trên URL production, đạt điểm Lighthouse PWA > 90, chơi mượt mà 60 FPS trên điện thoại thật, không phát sinh lỗi crash vặt và sẵn sàng đón nhận những người chơi đầu tiên trải nghiệm văn hóa ném pao dân gian Việt Nam.

---

## 4. MA TRẬN RỦI RO & PHƯƠNG ÁN GIẢM THIỂU CHO SOLO DEVELOPER

| Rủi ro Kỹ thuật / Phạm vi | Mức độ | Phương án Ứng phó & Tối ưu |
| :--- | :---: | :--- |
| **Độ trễ mạng WebSocket gây lệch nhịp QTE** | Cao | Client dự đoán trước (Client Prediction) dựa trên timestamp server gửi từ lúc bắt đầu ném; cửa sổ QTE nới rộng thêm dung sai $\pm 50\text{ms}$ bù trừ jitter mạng. |
| **Phaser 3 xung đột với React DOM Re-render** | Trung bình | Cô lập Phaser Canvas trong 1 React component duy nhất không bao giờ re-render (`React.memo` / `useRef`), giao tiếp 100% qua Custom Event Bus. |
| **Quyền truy cập GPS bị từ chối trên trình duyệt** | Cao | Không bắt buộc GPS. Tự động kích hoạt Chế độ "Du Hành Danh Thắng" (chọn sẵn Sới Đông Hồ, Sới Sapa) ngay khi phát hiện người dùng từ chối cấp quyền vị trí. |
| **Quá tải tài nguyên đồ họa làm chậm điện thoại yếu** | Trung bình | Không dùng hiệu ứng 3D hay hậu kỳ Canvas nặng; gom toàn bộ tranh vào Sprite Atlas; tắt hạt particle trên thiết bị có `navigator.hardwareConcurrency <= 4`. |
| **Server Socket.io bị ngủ (Sleep) trên free tier** | Cao | Cấu hình cơ chế Ping-Pong định kỳ mỗi 5 phút từ một Cronjob / Uptime monitor bên ngoài để server luôn ở trạng thái nóng sẵn sàng phục vụ phòng đấu. |
