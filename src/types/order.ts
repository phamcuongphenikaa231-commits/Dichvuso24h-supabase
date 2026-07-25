// ─── Purchase Flow ───────────────────────────────────────────────────────────

/**
 * Loại quy trình mua hàng:
 * - interaction: Dịch vụ tương tác — khách nhập link công khai cần xử lý
 * - delivery_required: Tài khoản số và dịch vụ cần bàn giao — khách chọn số lượng,
 *   sau đó chọn Email/Zalo/Facebook và nhập thông tin nhận tài khoản
 */
export type PurchaseFlowType = 'interaction' | 'delivery_required';

// ─── Payment Status ───────────────────────────────────────────────────────────

/**
 * Trạng thái thanh toán — độc lập với trạng thái đơn hàng
 */
export type PaymentStatus =
  | 'unpaid'              // Chưa thanh toán
  | 'customer_reported'   // Khách báo đã chuyển khoản
  | 'verified'            // Admin đã xác nhận thanh toán
  | 'rejected'            // Thanh toán chưa được xác nhận
  | 'refunded';           // Đã hoàn tiền

export interface PaymentStatusMeta {
  code: PaymentStatus;
  label: string;
  badgeVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'cyan' | 'orange' | 'outline';
}

export const PAYMENT_STATUS_MAP: Record<PaymentStatus, PaymentStatusMeta> = {
  unpaid: { code: 'unpaid', label: 'Chưa thanh toán', badgeVariant: 'warning' },
  customer_reported: { code: 'customer_reported', label: 'Khách báo đã chuyển khoản', badgeVariant: 'orange' },
  verified: { code: 'verified', label: 'Đã xác nhận thanh toán', badgeVariant: 'success' },
  rejected: { code: 'rejected', label: 'Thanh toán chưa được xác nhận', badgeVariant: 'danger' },
  refunded: { code: 'refunded', label: 'Đã hoàn tiền', badgeVariant: 'outline' },
};

// ─── Order Status ─────────────────────────────────────────────────────────────

/**
 * Trạng thái xử lý đơn hàng
 * Quy tắc chuyển trạng thái hợp lệ được định nghĩa trong ORDER_STATUS_TRANSITIONS
 */
export type OrderStatus =
  | 'pending_payment'               // Chờ thanh toán
  | 'awaiting_payment_verification' // Chờ xác nhận thanh toán
  | 'paid'                          // Đã thanh toán
  | 'processing'                    // Đang xử lý
  | 'need_more_information'         // Cần bổ sung thông tin
  | 'completed'                     // Hoàn thành
  | 'payment_issue'                 // Thanh toán có vấn đề
  | 'cancelled'                     // Đã hủy
  | 'refunded';                     // Đã hoàn tiền

export interface OrderStatusMeta {
  code: OrderStatus;
  label: string;
  badgeVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'cyan' | 'orange' | 'outline';
  description: string;
  allowedNext: OrderStatus[];
  requireConfirm: boolean;
  irreversible: boolean;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusMeta> = {
  pending_payment: {
    code: 'pending_payment',
    label: 'Chờ thanh toán',
    badgeVariant: 'warning',
    description: 'Đơn hàng đang chờ bạn thực hiện chuyển khoản.',
    allowedNext: ['awaiting_payment_verification', 'cancelled'],
    requireConfirm: false,
    irreversible: false,
  },
  awaiting_payment_verification: {
    code: 'awaiting_payment_verification',
    label: 'Chờ xác nhận thanh toán',
    badgeVariant: 'orange',
    description: 'Bạn đã báo chuyển khoản. Đơn đang chờ admin kiểm tra và xác nhận.',
    allowedNext: ['paid', 'payment_issue'],
    requireConfirm: false,
    irreversible: false,
  },
  paid: {
    code: 'paid',
    label: 'Đã thanh toán',
    badgeVariant: 'cyan',
    description: 'Admin đã xác nhận nhận được tiền. Đơn đang được xếp vào hàng xử lý.',
    allowedNext: ['processing', 'refunded'],
    requireConfirm: true,
    irreversible: false,
  },
  processing: {
    code: 'processing',
    label: 'Đang xử lý',
    badgeVariant: 'primary',
    description: 'Kỹ thuật viên đang xử lý dịch vụ cho bạn.',
    allowedNext: ['completed', 'need_more_information', 'refunded'],
    requireConfirm: false,
    irreversible: false,
  },
  need_more_information: {
    code: 'need_more_information',
    label: 'Cần bổ sung thông tin',
    badgeVariant: 'orange',
    description: 'Đơn hàng tạm dừng vì thiếu thông tin. Vui lòng liên hệ admin.',
    allowedNext: ['processing', 'refunded'],
    requireConfirm: false,
    irreversible: false,
  },
  completed: {
    code: 'completed',
    label: 'Hoàn thành',
    badgeVariant: 'success',
    description: 'Dịch vụ đã được kích hoạt / bàn giao thành công.',
    allowedNext: ['refunded'],
    requireConfirm: true,
    irreversible: false,
  },
  payment_issue: {
    code: 'payment_issue',
    label: 'Thanh toán có vấn đề',
    badgeVariant: 'danger',
    description: 'Admin chưa xác nhận được giao dịch. Vui lòng kiểm tra lại.',
    allowedNext: ['awaiting_payment_verification', 'cancelled'],
    requireConfirm: false,
    irreversible: false,
  },
  cancelled: {
    code: 'cancelled',
    label: 'Đã hủy',
    badgeVariant: 'secondary',
    description: 'Đơn hàng đã bị hủy.',
    allowedNext: [],
    requireConfirm: true,
    irreversible: true,
  },
  refunded: {
    code: 'refunded',
    label: 'Đã hoàn tiền',
    badgeVariant: 'outline',
    description: 'Số tiền đã được hoàn trả lại cho quý khách.',
    allowedNext: [],
    requireConfirm: true,
    irreversible: true,
  },
};

// ─── Delivery Channel ─────────────────────────────────────────────────────────

export type DeliveryChannel = 'email' | 'zalo' | 'facebook' | null;

export const DELIVERY_CHANNEL_LABELS: Record<NonNullable<DeliveryChannel>, string> = {
  email: 'Email',
  zalo: 'Zalo',
  facebook: 'Facebook',
};

// ─── Customer Input ───────────────────────────────────────────────────────────

/**
 * Dữ liệu khách nhập khi đặt dịch vụ
 * Có cấu trúc rõ ràng, không lưu dưới dạng chuỗi tự do
 */
export interface CustomerInput {
  link?: string;         // Đường dẫn (Facebook, TikTok, YouTube,...)
  quantity?: number;     // Số lượng đã chọn
  note?: string;         // Ghi chú của khách
  configNote?: string;   // Ghi chú cấu hình (VPS, proxy,...)
  extraFields?: Record<string, string>; // Các trường tuỳ chỉnh từ admin
}

// ─── Order Status History ─────────────────────────────────────────────────────

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousOrderStatus: OrderStatus | null;
  newOrderStatus: OrderStatus;
  previousPaymentStatus: PaymentStatus | null;
  newPaymentStatus: PaymentStatus;
  action: string;
  note?: string;
  actorType: 'customer' | 'admin' | 'system';
  actorId: string;
  actorName: string;
  createdAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface Order {
  // Định danh
  id: string;                        // ID nội bộ (UUID)
  orderCode: string;                 // Mã đơn dễ đọc: DV24H-260724-A8K2

  // Thông tin khách
  userId: string;
  userName: string;

  // Thông tin dịch vụ
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  serviceThumbnailEmoji: string;
  serviceThumbnailBg: string;
  purchaseFlowType: PurchaseFlowType;

  // Số lượng & giá
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;

  // Dữ liệu khách nhập
  customerInput: CustomerInput;

  // Kênh nhận kết quả cũ (giữ nullable để tương thích đơn đã tạo trước đây)
  deliveryChannel: DeliveryChannel;
  deliveryValue: string | null;      // Email / số Zalo / link Facebook

  // Thanh toán
  paymentContent: string;            // Nội dung chuyển khoản (= orderCode, đã chuẩn hóa)
  paymentStatus: PaymentStatus;
  customerReportedPaidAt: string | null;
  paymentVerifiedAt: string | null;

  // Trạng thái đơn
  orderStatus: OrderStatus;
  processingStartedAt: string | null;
  completedAt: string | null;

  // Timeline
  statusHistory: OrderStatusHistory[];

  // Admin
  adminNote: string | null;          // Ghi chú nội bộ admin
  publicNote: string | null;         // Ghi chú gửi khách

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
