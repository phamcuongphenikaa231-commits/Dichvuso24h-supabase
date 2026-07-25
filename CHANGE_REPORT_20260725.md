# Báo cáo thay đổi 2026-07-25

- Gộp Facebook, Zalo và Telegram vào trang **Cài đặt cửa hàng**.
- Footer đọc trực tiếp ba đường dẫn liên hệ từ `site_settings/social_links`.
- Nút chat nổi sử dụng chính các đường dẫn trên, không cần cấu hình URL lần hai.
- Loại bỏ các tab cài đặt mô phỏng không có tác dụng thực tế.
- Trang chi tiết dịch vụ đã bỏ toàn bộ khối mô tả/hướng dẫn/bảo hành/điều kiện/FAQ.
- Dịch vụ tài khoản chỉ còn chọn số lượng và mua.
- Dịch vụ tương tác bắt buộc nhập link công khai.
- Form quản trị dịch vụ đã bỏ các trường chi tiết, bảo hành và trường tùy chỉnh không còn sử dụng.
- Thêm migration `supabase/20260725_simplify_account_purchase.sql`.
