# Dịch Vụ Số 24H

Website Next.js App Router cho cửa hàng dịch vụ số, sử dụng Supabase Auth, PostgreSQL/RLS, Supabase Storage và VietQR.

## Chạy dự án

```bash
npm install
Copy-Item .env.example .env.local   # PowerShell
npm run dev
```

Điền vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Dịch Vụ Số 24H
```

Không commit `.env.local` và không đặt Service Role Key trong mã frontend.

## SQL bắt buộc cho bản cập nhật này

Sau khi đã chạy bộ database V1, mở Supabase SQL Editor và chạy:

```text
supabase/20260725_admin_sync_features.sql
```

Migration này:

- Tạo dữ liệu Hero mặc định trong `public.site_settings`.
- Bổ sung cấu hình liên hệ và mạng xã hội.
- Tạo bucket công khai `site-assets` với quyền ghi/xóa chỉ dành cho admin.
- Bật Realtime cho `site_settings`.
- Tạo RPC cập nhật ghi chú và xóa đơn hàng an toàn cho admin.

## Chức năng chính

- Đăng ký/đăng nhập bằng Gmail và mật khẩu qua Supabase Auth.
- Mua dịch vụ bằng số lượng nhập trực tiếp; không còn lựa chọn “Gói Tiêu Chuẩn/Gói Nâng Cấp”.
- Tạo đơn trong Supabase, thanh toán VietQR, khách báo đã chuyển khoản và admin xác nhận.
- Admin chỉnh Hero trang chủ, ảnh nền, ảnh minh họa, nội dung nút và cam kết.
- Admin chỉnh hotline, email, địa chỉ, giờ làm việc, Facebook, Telegram, Zalo, YouTube và TikTok.
- Nội dung Hero/liên hệ được đồng bộ qua Supabase tới trang người dùng.
- Admin xóa đơn bằng RPC; dữ liệu liên quan được xử lý trong transaction và thao tác được ghi vào `activity_logs`.

## Route chính

- `/`, `/dich-vu`, `/dich-vu/[slug]`
- `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`
- `/thanh-toan/[orderCode]`
- `/tai-khoan`, `/tai-khoan/don-hang`
- `/admin`, `/admin/noi-dung`, `/admin/cai-dat`, `/admin/don-hang`

## Kiểm tra trước khi chạy thật

```bash
npm run lint
npm run typecheck
npm run build
```

Đọc thêm `ADMIN_SYNC_FEATURES_REPORT.md` để xem phạm vi thay đổi và lưu ý triển khai.

## Đồng bộ danh mục và dịch vụ với Supabase

Chạy thêm migration:

```text
supabase/20260725_catalog_supabase_sync.sql
```

Sau bản cập nhật này:

- Trang khách, trang chi tiết, trang chủ và admin cùng đọc bảng `public.services`.
- Admin thêm/sửa/ẩn/xóa dịch vụ trực tiếp trên Supabase.
- Danh mục dùng chung bảng `public.service_categories`.
- Lần đầu admin mở `/admin/dich-vu`, dữ liệu catalog cũ trong localStorage (nếu có) sẽ được nhập một lần lên Supabase.
- Tạo đơn dùng UUID thật của dịch vụ, không còn phụ thuộc catalog mock.
