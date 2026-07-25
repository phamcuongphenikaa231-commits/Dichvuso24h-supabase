# Báo cáo chỉnh sửa Dịch Vụ Số 24H

## Đã thực hiện

1. Xóa lựa chọn “Gói Tiêu Chuẩn / Gói Nâng Cấp” khỏi luồng mua hàng, dữ liệu đơn và giao diện chi tiết đơn.
2. Đổi bộ chọn số lượng sang ô nhập số có min/max, số nguyên và tự tính tổng tiền.
3. Thêm quản lý Hero trang chủ trong `/admin/noi-dung`:
   - nội dung, nút, lợi ích;
   - ảnh nền và ảnh minh họa;
   - overlay, vị trí, cover/contain;
   - lưu vào `public.site_settings`, ảnh lưu trong Supabase Storage bucket `site-assets`.
4. Chuyển thông tin cửa hàng/liên hệ/mạng xã hội sang `public.site_settings`; Footer, trang Liên hệ và menu mobile đọc cùng dữ liệu.
5. Chuyển quản lý đơn sang Supabase và thêm RPC xóa đơn cho admin, có activity log và dọn dữ liệu liên quan.

## SQL bắt buộc

Chạy `supabase/20260725_admin_sync_features.sql` trong Supabase SQL Editor sau bộ SQL V1.

## Kiểm tra đã thực hiện

- Kiểm tra cú pháp toàn bộ file TypeScript/TSX bằng TypeScript transpiler: đạt.
- Kiểm tra toàn bộ import nội bộ `@/` và relative: không thiếu file.
- Không đóng gói `.env.local`, `.next`, `node_modules` hoặc secret.

## Kiểm tra cần chạy trên máy

```bash
npm install
npm run typecheck
npm run lint
npm run build
npm run dev
```
