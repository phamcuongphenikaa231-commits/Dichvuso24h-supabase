# Kế hoạch tích hợp Supabase

Chưa có kết nối hoặc migration nào được thực hiện.

## Bảng dự kiến

1. `profiles`: liên kết `auth.users`, username, phone, full_name, role, status.
2. `service_categories`: danh mục, slug, mô tả, thứ tự, trạng thái.
3. `services`: nội dung dịch vụ, giá, tồn kho, `purchase_flow_type`, cấu hình trường nhập.
4. `orders`: `order_code` UNIQUE, user_id, snapshot dịch vụ/giá, delivery channel/value, payment/order status và timestamps.
5. `order_items`: sẵn sàng cho nhiều dòng sản phẩm dù luồng hiện tại tạo một dịch vụ mỗi đơn.
6. `order_status_history`: trạng thái cũ/mới, actor, ghi chú và thời gian.
7. `payments`: số tiền, nội dung chuyển khoản, trạng thái đối soát, admin xác nhận.
8. `support_tickets`, `support_messages`.
9. `coupons`, `coupon_usages`.
10. `site_settings`, `site_content`, `activity_logs`.

## Authentication và quyền

- Supabase Auth quản lý mật khẩu; không tự lưu hash trong `profiles`.
- `profiles.role`: `user` hoặc `admin`; chỉ server/admin policy được đổi role.
- User chỉ SELECT đơn/ticket của chính mình; chỉ INSERT đơn với `user_id = auth.uid()`.
- User chỉ được báo đã chuyển khoản theo RPC có kiểm tra trạng thái.
- Admin được quản trị thông qua policy kiểm tra role; `service_role` chỉ ở server.
- `order_code` sinh/xác nhận phía database, có UNIQUE constraint.
- Chuyển trạng thái qua RPC/Edge Function để bảo đảm state machine và ghi timeline trong cùng transaction.

## Storage

Bucket công khai có kiểm soát cho ảnh dịch vụ/banner; bucket riêng cho bằng chứng hỗ trợ. Giới hạn MIME, dung lượng và policy theo chủ sở hữu.

## Trình tự migration

1. Tạo enum/table/index/trigger `updated_at`.
2. Bật RLS và policy trước khi nhập dữ liệu thật.
3. Tạo RPC tạo đơn, báo thanh toán, xác nhận và chuyển trạng thái.
4. Nhập danh mục/dịch vụ từ mock.
5. Thay từng mock repository bằng Supabase repository.
6. Kiểm thử user A không đọc dữ liệu user B, user không vào admin, key công khai không vượt RLS.
7. Chỉ sau đó xóa mock production và triển khai.
