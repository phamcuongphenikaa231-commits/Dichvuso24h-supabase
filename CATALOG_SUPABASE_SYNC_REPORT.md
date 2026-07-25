# Báo cáo đồng bộ Catalog với Supabase

## Đã sửa

- `productService` không còn đọc `adminStore`/localStorage làm nguồn dữ liệu chính.
- Trang khách và admin cùng đọc `public.services` và `public.service_categories`.
- Admin CRUD dịch vụ/danh mục ghi trực tiếp vào Supabase theo RLS.
- Tạo đơn ưu tiên UUID dịch vụ thật; không còn phụ thuộc slug mock.
- Thông báo tạo đơn hiển thị nguyên nhân rõ ràng.
- Dữ liệu catalog cũ trong localStorage được nhập một lần khi admin mở `/admin/dich-vu`.
- Realtime được bật cho hai bảng catalog.

## SQL cần chạy

`supabase/20260725_catalog_supabase_sync.sql`

## Kiểm tra tĩnh

Các file TypeScript/TSX đã chỉnh sửa đều được TypeScript parser kiểm tra cú pháp thành công.
Không thể chạy đầy đủ typecheck/build trong môi trường đóng gói vì dependencies không tải đủ từ npm registry.
