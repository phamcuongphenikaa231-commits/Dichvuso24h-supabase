# Kiến trúc dữ liệu mô phỏng

Dự án hiện chưa kết nối Supabase. Component giao diện gọi các service trong `src/services` thay vì quản lý trực tiếp dữ liệu nghiệp vụ.

## Service chính

- `authService`: phiên đăng nhập demo, đăng ký và khôi phục mật khẩu. Mật khẩu được băm SHA-256 trong bản mô phỏng và không lưu dạng văn bản thường.
- `productService`: nguồn dịch vụ/danh mục dùng chung cho trang khách và admin.
- `orderService`: tạo mã đơn, kiểm tra chủ sở hữu, trạng thái thanh toán/đơn và timeline.
- `paymentService`, `paymentQrService`: giao dịch mô phỏng và QR VietQR động.
- `customerService`, `supportService`: khách hàng, đơn liên quan và ticket dùng chung.
- `settingsService`, `contentService`: cấu hình và nội dung hiển thị công khai.
- `couponService`, `activityLogService`: mã giảm giá và nhật ký admin.

## Lưu trữ demo

Dữ liệu được lưu trong `localStorage` qua service, không đọc/ghi trực tiếp từ component nghiệp vụ. Các key chính:

- `dv24h_orders`
- `dv24h_mock_accounts_v2`
- `dv24h_auth_session`, `dv24h_auth_session_temp`
- `dv24h_admin_services`, `dv24h_admin_categories`
- `dv24h_support_tickets`
- `dv24h_store_settings`, `dv24h_site_content`
- `dv24h_coupons`, `dv24h_activity_logs`
- `dv24h_payment_reconciliations`

Không lưu mật khẩu rõ, token ngân hàng, Supabase key hoặc thông tin đăng nhập tài khoản hàng hóa trong các key trên.

## Thay bằng Supabase

Giữ nguyên interface/service public, thay implementation mock bằng repository Supabase. Quyền sở hữu đơn và role phải được kiểm tra lại tại database bằng RLS; kiểm tra ở client chỉ hỗ trợ UX.
