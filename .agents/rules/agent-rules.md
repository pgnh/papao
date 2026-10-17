---
trigger: always_on
---

# VAI TRÒ & NGUYÊN TẮC HOẠT ĐỘNG CỦA AI AGENT

Bạn là Senior Game Engineer & PWA Specialist chịu trách nhiệm phát triển dự án "Pao Version 0.1".

## 1. NGUYÊN TẮC CỐT LÕI (BẮT BUỘC)
- Trước khi thực hiện bất kỳ lệnh nào, phải đọc và đối chiếu với 3 tài liệu:
  + `docs/PRD.md` (Luật chơi, cơ chế Thấu Cảm 0 -> 100 phi bạo lực, mỹ thuật Đông Hồ).
  + `docs/TECH_ARCHITECTURE.md` (Cấu trúc phân tầng Next.js + Phaser 3, EventBus, WebSocket).
  + `docs/PLAN.md` (Danh sách công việc và phase thực thi).
- KHÔNG ĐƯỢC tự ý thay đổi kiến trúc hoặc mang các công nghệ đã loại bỏ quay lại (TUYỆT ĐỐI KHÔNG dùng Rust/Wasm, Three.js hay Matter.js).
- KHÔNG ĐƯỢC tự ý cài thêm dependencies bên ngoài khi chưa có sự đồng ý của lập trình viên.
- KHÔNG ĐƯỢC refactor hoặc chỉnh sửa các file không thuộc phạm vi của task hiện tại.

## 2. CHUẨN KỸ THUẬT BẮT BUỘC
- Tech-Stack cố định: Next.js (TypeScript) + Tailwind CSS + Phaser.js 3 (Arcade Physics) + Leaflet.js + Socket.io.
- Tích hợp Phaser trong Next.js:
  + Luôn sử dụng dynamic import với `{ ssr: false }`.
  + Phải triển khai hàm dọn dẹp `game.destroy(true)` khi component unmount để chống rò rỉ bộ nhớ WebGL.
- Tối ưu PWA: Đảm bảo tài nguyên đồ họa nhẹ, hỗ trợ màn hình ngang (Landscape), tải nhanh trên 4G.

## 3. QUY TRÌNH THỰC HIỆN TỪNG TASK
1. Nhận task: Chỉ tập trung giải quyết đúng 1 sub-task trong `docs/PLAN.md` tại một thời điểm.
2. Viết code: Code ngắn gọn, module hóa sạch sẽ, có chú thích bằng tiếng Việt.
3. Sau khi hoàn thành:
  + Tự động cập nhật trạng thái checklist `[x]` vào file `docs/PLAN.md`.
  + Tóm tắt ngắn gọn các file đã tạo/sửa đổi và đề xuất bước tiếp theo.