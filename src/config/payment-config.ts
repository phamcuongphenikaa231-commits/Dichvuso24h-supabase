/**
 * Cấu hình tài khoản ngân hàng nhận thanh toán — Dịch Vụ Số 24H
 *
 * Đây là cấu hình tập trung, tham chiếu duy nhất.
 * Không rải số tài khoản ở nhiều component.
 * Khi cần thay đổi tài khoản ngân hàng, chỉ cần sửa file này.
 *
 * LƯU Ý: Đây không phải là secret. Số tài khoản ngân hàng là thông tin
 * công khai hiển thị cho khách hàng để họ thực hiện chuyển khoản.
 */

export const PAYMENT_CONFIG = {
  bankCode: 'VCB',
  bankName: 'Vietcombank',
  accountNumber: '9862595798',
  accountName: 'PHAM HUU CUONG',
  /**
   * Template VietQR — 'compact2' hiển thị gọn nhất cho quét QR
   * Các template: qr-only | compact | compact2 | print
   */
  qrTemplate: 'compact2',
} as const;

export type PaymentConfig = typeof PAYMENT_CONFIG;
