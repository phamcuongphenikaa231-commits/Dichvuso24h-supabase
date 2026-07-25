/**
 * paymentQrService — Service tạo QR thanh toán động
 *
 * Sử dụng VietQR public API (không cần cài thêm package):
 * https://img.vietqr.io/image/{bankCode}-{accountNumber}-{template}.png
 *   ?amount={amount}
 *   &addInfo={content}
 *   &accountName={name}
 *
 * Mỗi đơn hàng có QR riêng chứa đúng số tiền và nội dung chuyển khoản.
 * Không dùng QR tĩnh chung cho mọi đơn.
 *
 * Component giao diện KHÔNG được tự ghép URL QR — phải gọi qua service này.
 */

import { PAYMENT_CONFIG } from '@/config/payment-config';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QrGenerateParams {
  amount: number;       // Số tiền chính xác (không có dấu phẩy/chấm)
  orderCode: string;    // Mã đơn hàng — dùng làm nội dung chuyển khoản
}

export interface QrResult {
  url: string;
  paymentContent: string; // Nội dung đã chuẩn hóa
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Chuẩn hóa nội dung chuyển khoản:
 * - Chỉ giữ A-Z, 0-9, khoảng trắng
 * - Loại bỏ dấu tiếng Việt
 * - Không có ký tự đặc biệt
 * - Giới hạn 25 ký tự (phù hợp chuẩn QR ngân hàng)
 * - Uppercase
 */
export function normalizeTransferContent(orderCode: string): string {
  // orderCode đã là uppercase, không dấu (ví dụ: DV24H-240726-A8K2)
  // Chỉ giữ A-Z, 0-9, dấu gạch ngang
  const cleaned = orderCode
    .toUpperCase()
    .replace(/[^A-Z0-9\-]/g, '')
    .slice(0, 25);

  return cleaned;
}

/**
 * Làm sạch số tiền — đảm bảo là số nguyên, không có dấu phẩy/chấm
 */
function sanitizeAmount(amount: number): number {
  return Math.max(0, Math.floor(amount));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const paymentQrService = {
  /**
   * Tạo URL ảnh QR VietQR cho một đơn hàng cụ thể.
   *
   * URL trả về có thể dùng trực tiếp trong <img src={...} />
   * Khi ứng dụng ngân hàng quét, sẽ tự điền:
   *   - Số tài khoản
   *   - Số tiền
   *   - Nội dung chuyển khoản
   */
  generateQrUrl(params: QrGenerateParams): QrResult {
    const { bankCode, accountNumber, accountName, qrTemplate } = PAYMENT_CONFIG;
    const amount = sanitizeAmount(params.amount);
    const paymentContent = normalizeTransferContent(params.orderCode);

    const queryParams = new URLSearchParams({
      amount: String(amount),
      addInfo: paymentContent,
      accountName,
    });

    const url = `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${qrTemplate}.png?${queryParams.toString()}`;

    return { url, paymentContent };
  },

  /**
   * Lấy thông tin ngân hàng để hiển thị cho khách (fallback khi QR lỗi)
   */
  getBankInfo() {
    return {
      bankName: PAYMENT_CONFIG.bankName,
      bankCode: PAYMENT_CONFIG.bankCode,
      accountNumber: PAYMENT_CONFIG.accountNumber,
      accountName: PAYMENT_CONFIG.accountName,
    };
  },
};
