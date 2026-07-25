# Báo cáo sửa lỗi — Dịch Vụ Số 24H

## Các nhóm lỗi đã xử lý

- Đồng bộ định danh người dùng giữa đăng nhập, tạo đơn, thanh toán và lịch sử đơn.
- Bảo vệ đơn hàng theo chủ sở hữu ở khu vực khách hàng; admin dùng luồng quản trị riêng.
- Chuẩn hóa nút “Tôi đã chuyển khoản”: chỉ chuyển sang chờ xác nhận, không tự xác nhận tiền.
- Bổ sung quy tắc chuyển trạng thái hợp lệ và lịch sử trạng thái liên tục.
- Tách QR thanh toán động, cấu hình ngân hàng và dịch vụ thanh toán.
- Hợp nhất nguồn dịch vụ dùng chung cho trang bán hàng và admin.
- Thêm `purchaseFlowType`, trường nhập tùy chỉnh, giới hạn số lượng, hướng dẫn và điều kiện dịch vụ vào quản trị.
- Tách rõ thông tin cần xử lý và kênh nhận kết quả Email/Zalo/Facebook.
- Thay cơ chế mật khẩu mock dạng chữ thường bằng bản băm; phiên đăng nhập hỗ trợ ghi nhớ đúng cách.
- Hợp nhất mock service cho đơn hàng, thanh toán, khách hàng, hỗ trợ, cài đặt, nội dung, mã giảm giá và nhật ký.
- Tách layout admin khỏi header/footer khách hàng và bổ sung menu admin trên mobile.
- Xóa giỏ hàng giả và route xác nhận đơn cũ gây xung đột.
- Thêm phản hồi hai chiều trong phiếu hỗ trợ khách hàng.
- Bổ sung tài liệu kiến trúc mock và kế hoạch Supabase.

## Kiểm tra tĩnh đã thực hiện

- Phân tích cú pháp toàn bộ 109 file TypeScript/TSX: không phát hiện lỗi cú pháp.
- Kiểm tra đường dẫn import nội bộ: không có import nội bộ bị thiếu.
- Kiểm tra các route/component cũ đã xóa và các ID người dùng viết cứng trong luồng đang hoạt động.

## Kiểm tra cần chạy trên máy phát triển

Môi trường đóng gói không tải được package từ registry nên chưa thể chạy đầy đủ dependency-based checks. Sau khi giải nén, chạy:

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev
```

Sau đó kiểm tra hồi quy luồng user/admin trước khi kết nối Supabase.
