# PAO VERSION 0.1 – TÀI LIỆU DỰ ÁN (PROJECT DOCUMENTATION)

Hệ thống tài liệu hoàn chỉnh cho dự án **"Pao Version 0.1" - Web Game PWA Đối Kháng Tọa Độ & Gắn Kết Văn Hóa Dân Gian Việt Nam**:

1. [Tài liệu Đặc Tả Sản Phẩm (PRD)](file:///d:/docs/docs/PRD.md)
   - Triết lý trò chơi phi bạo lực (Non-violent Empathy / Cơ chế Thấu Cảm 0 -> 100 EP).
   - Luật chơi Ném Pao tích điểm, căn góc, chỉnh lực, tính gió kết hợp mini-game nhịp điệu (QTE) đón pao.
   - Hệ thống Quả Pao (5 loại) & 4 Item Thổ Cẩm bổ trợ chiến thuật dân gian.
   - Hệ thống LBS Sới Làng thực tế (Leaflet.js) và Chế độ Du Hành Danh Thắng.
   - Hướng dẫn phong cách đồ họa mộc bản tranh Đông Hồ (ngũ sắc tự nhiên trên nền giấy điệp) và âm thanh dân gian.

2. [Kiến Trúc Kỹ Thuật Hệ Thống (TECH_ARCHITECTURE.md)](file:///d:/docs/docs/TECH_ARCHITECTURE.md)
   - Mô hình Monorepo tách biệt: `apps/web` (Next.js 14+ PWA + Phaser 3) và `apps/server` (Node.js + Socket.io).
   - Mô hình phân lớp Hybrid Layering: Phaser Canvas (World & Physics) kết hợp Next.js Tailwind DOM Overlay (Retina HUD, Thước góc, Thanh lực, Nút ném, QTE button).
   - Cầu nối hai chiều Phaser-React EventBus.
   - Server-Authoritative State Machine & Xác thực quỹ đạo vật lý ném xiên parabol.
   - Đặc tả chi tiết toàn bộ gói tin WebSocket C2S và S2C có định kiểu TypeScript.
   - Thuật toán AI Bot Bé Đông Hồ & Chiến lược ngoại tuyến Workbox PWA Cache-First.

3. [Kế Hoạch Triển Khai 6 Phase Cho Solo Dev (PLAN.md)](file:///d:/docs/docs/PLAN.md)
   - **Phase 1:** Khởi tạo Monorepo, Next.js PWA, Phaser Canvas & Design System Đông Hồ (Tuần 1).
   - **Phase 2:** Core Physics Parabol, Gió, Thước Góc, Thanh Lực & QTE Đón Pao (Tuần 2).
   - **Phase 3:** Chế độ Solo Offline, AI Bot Bé Đông Hồ, Animation Sprite & Audio (Tuần 3).
   - **Phase 4:** Backend Realtime Socket.io, Đồng bộ State Machine & Ghép Đấu 1v1 (Tuần 4).
   - **Phase 5:** LBS Bản Đồ Leaflet (Sới Làng & Du Hành) + Túi Pao & Item Thổ Cẩm (Tuần 5).
   - **Phase 6:** Tối ưu PWA 60fps Mobile, Deploy Production (Vercel + Railway) & Testing (Tuần 6).
