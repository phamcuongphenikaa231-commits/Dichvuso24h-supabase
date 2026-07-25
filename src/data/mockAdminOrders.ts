import { AdminOrder, AdminOrderStatus, AdminOrderStatusMeta, PaymentMethod } from '@/types/admin';

// ─── Status Machine ──────────────────────────────────────────────────────────
export const ADMIN_ORDER_STATUS_MAP: Record<AdminOrderStatus, AdminOrderStatusMeta> = {
  pending_payment: {
    code: 'pending_payment',
    label: 'Chờ thanh toán',
    badge: 'warning',
    allowedNext: ['paid', 'cancelled'],
    requireConfirm: false,
    irreversible: false,
  },
  paid: {
    code: 'paid',
    label: 'Đã thanh toán',
    badge: 'cyan',
    allowedNext: ['processing', 'need_info', 'refunded'],
    requireConfirm: true,
    irreversible: false,
  },
  processing: {
    code: 'processing',
    label: 'Đang xử lý',
    badge: 'primary',
    allowedNext: ['completed', 'need_info', 'disputed'],
    requireConfirm: false,
    irreversible: false,
  },
  completed: {
    code: 'completed',
    label: 'Hoàn thành',
    badge: 'success',
    allowedNext: ['disputed', 'refunded'],
    requireConfirm: true,
    irreversible: false,
  },
  need_info: {
    code: 'need_info',
    label: 'Cần bổ sung TT',
    badge: 'orange',
    allowedNext: ['processing', 'cancelled'],
    requireConfirm: false,
    irreversible: false,
  },
  cancelled: {
    code: 'cancelled',
    label: 'Đã hủy',
    badge: 'secondary',
    allowedNext: [],
    requireConfirm: true,
    irreversible: true,
  },
  refunded: {
    code: 'refunded',
    label: 'Hoàn tiền',
    badge: 'outline',
    allowedNext: [],
    requireConfirm: true,
    irreversible: true,
  },
  disputed: {
    code: 'disputed',
    label: 'Khiếu nại',
    badge: 'danger',
    allowedNext: ['refunded', 'completed'],
    requireConfirm: true,
    irreversible: false,
  },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  mbbank: 'MB Bank',
  momo: 'MoMo',
  vietqr: 'VietQR',
  manual: 'Thủ công',
  free: 'Miễn phí',
};

export const STAFF_LIST = ['admin24h', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];

// ─── Mock Data ───────────────────────────────────────────────────────────────
const INITIAL_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'DVS24H-000001',
    serviceId: 'DVS-GPT01',
    serviceName: 'ChatGPT Plus - Nâng cấp chính chủ',
    serviceThumbnail: '🤖',
    categoryName: 'Kho tài khoản',
    quantity: 1,
    unit: 'tháng',
    pricePerUnit: 350000,
    totalPrice: 350000,
    status: 'completed',
    paymentMethod: 'mbbank',
    paymentConfirmedAt: '2026-07-20T09:15:00Z',
    createdAt: '2026-07-20T08:50:00Z',
    updatedAt: '2026-07-20T10:30:00Z',
    customerId: 'user-001',
    customerName: 'Nguyễn Văn Hùng',
    customerUsername: 'user0988',
    customerPhoneMasked: '0988***456',
    customerEmail: 'h***g@gmail.com',
    customerProvidedData: { 'Email tài khoản OpenAI': 'h***@gmail.com' },
    customerNote: 'Cần nhanh trước 10h sáng',
    assignedTo: 'Nguyễn Văn A',
    logs: [
      { id: 'log-1', timestamp: '2026-07-20T08:50:00Z', actorType: 'customer', actorName: 'user0988', action: 'Tạo đơn hàng', detail: 'Số lượng: 1 tháng' },
      { id: 'log-2', timestamp: '2026-07-20T09:15:00Z', actorType: 'admin', actorName: 'admin24h', action: 'Xác nhận thanh toán', detail: 'Phương thức: MB Bank' },
      { id: 'log-3', timestamp: '2026-07-20T09:20:00Z', actorType: 'admin', actorName: 'admin24h', action: 'Chuyển sang Đang xử lý', detail: undefined },
      { id: 'log-4', timestamp: '2026-07-20T10:30:00Z', actorType: 'admin', actorName: 'Nguyễn Văn A', action: 'Đánh dấu Hoàn thành', detail: undefined },
    ],
    notes: [
      { id: 'note-1', timestamp: '2026-07-20T09:16:00Z', authorName: 'admin24h', content: 'Khách đã gửi bill chuyển khoản hợp lệ. MB Bank 10:15.', isPublic: false },
    ],
    attachments: [
      { id: 'att-1', name: 'bill_chuyen_khoan.jpg', size: '128 KB', type: 'image/jpeg', uploadedAt: '2026-07-20T09:10:00Z', uploader: 'customer' },
    ],
  },
  {
    id: 'DVS24H-000002',
    serviceId: 'DVS-FB02',
    serviceName: 'Tăng Follow Facebook Việt Thật',
    serviceThumbnail: '👤',
    categoryName: 'Dịch vụ tương tác',
    quantity: 3,
    unit: '1.000 Follow',
    pricePerUnit: 45000,
    totalPrice: 135000,
    status: 'processing',
    paymentMethod: 'momo',
    paymentConfirmedAt: '2026-07-22T14:00:00Z',
    createdAt: '2026-07-22T13:45:00Z',
    updatedAt: '2026-07-22T14:05:00Z',
    customerId: 'user-002',
    customerName: 'Trần Thị Mai',
    customerUsername: 'mai_tran',
    customerPhoneMasked: '0912***789',
    customerEmail: 'm***i@yahoo.com',
    customerProvidedData: { 'Link Profile Facebook': 'https://facebook.com/m***i' },
    assignedTo: 'Trần Thị B',
    logs: [
      { id: 'log-5', timestamp: '2026-07-22T13:45:00Z', actorType: 'customer', actorName: 'mai_tran', action: 'Tạo đơn hàng', detail: 'Số lượng: 3.000 Follow' },
      { id: 'log-6', timestamp: '2026-07-22T14:00:00Z', actorType: 'admin', actorName: 'admin24h', action: 'Xác nhận thanh toán', detail: 'Phương thức: MoMo' },
      { id: 'log-7', timestamp: '2026-07-22T14:05:00Z', actorType: 'system', actorName: 'Hệ thống', action: 'Tự động chuyển Đang xử lý', detail: undefined },
    ],
    notes: [],
    attachments: [],
  },
  {
    id: 'DVS24H-000003',
    serviceId: 'DVS-GPT01',
    serviceName: 'ChatGPT Plus - Nâng cấp chính chủ',
    serviceThumbnail: '🤖',
    categoryName: 'Kho tài khoản',
    quantity: 1,
    unit: 'tháng',
    pricePerUnit: 350000,
    totalPrice: 350000,
    status: 'pending_payment',
    paymentMethod: 'vietqr',
    createdAt: '2026-07-23T10:00:00Z',
    updatedAt: '2026-07-23T10:00:00Z',
    customerId: 'user-003',
    customerName: 'Phạm Đức Minh',
    customerUsername: 'duc_minh99',
    customerPhoneMasked: '0903***112',
    customerEmail: 'd***h@gmail.com',
    customerProvidedData: {},
    logs: [
      { id: 'log-8', timestamp: '2026-07-23T10:00:00Z', actorType: 'customer', actorName: 'duc_minh99', action: 'Tạo đơn hàng', detail: undefined },
    ],
    notes: [],
    attachments: [],
  },
  {
    id: 'DVS24H-000004',
    serviceId: 'DVS-FB02',
    serviceName: 'Tăng Follow Facebook Việt Thật',
    serviceThumbnail: '👤',
    categoryName: 'Dịch vụ tương tác',
    quantity: 5,
    unit: '1.000 Follow',
    pricePerUnit: 45000,
    totalPrice: 225000,
    status: 'need_info',
    paymentMethod: 'mbbank',
    paymentConfirmedAt: '2026-07-21T16:00:00Z',
    createdAt: '2026-07-21T15:30:00Z',
    updatedAt: '2026-07-21T17:00:00Z',
    customerId: 'user-004',
    customerName: 'Lê Thị Hoa',
    customerUsername: 'hoa_le',
    customerPhoneMasked: '0971***234',
    customerEmail: 'h***a@hotmail.com',
    customerProvidedData: { 'Link Profile Facebook': 'https://facebook.com/invalid_profile_123' },
    customerNote: 'Link trang cá nhân của tôi',
    assignedTo: 'Lê Văn C',
    logs: [
      { id: 'log-9', timestamp: '2026-07-21T15:30:00Z', actorType: 'customer', actorName: 'hoa_le', action: 'Tạo đơn hàng', detail: undefined },
      { id: 'log-10', timestamp: '2026-07-21T16:00:00Z', actorType: 'admin', actorName: 'admin24h', action: 'Xác nhận thanh toán', detail: undefined },
      { id: 'log-11', timestamp: '2026-07-21T17:00:00Z', actorType: 'admin', actorName: 'Lê Văn C', action: 'Yêu cầu bổ sung thông tin', detail: 'Link profile không hợp lệ hoặc ở chế độ riêng tư' },
    ],
    notes: [{ id: 'note-2', timestamp: '2026-07-21T17:01:00Z', authorName: 'Lê Văn C', content: 'Link không tìm thấy. Đã nhắn Zalo yêu cầu cung cấp lại.', isPublic: false }],
    attachments: [],
  },
  {
    id: 'DVS24H-000005',
    serviceId: 'DVS-GPT01',
    serviceName: 'ChatGPT Plus - Nâng cấp chính chủ',
    serviceThumbnail: '🤖',
    categoryName: 'Kho tài khoản',
    quantity: 3,
    unit: 'tháng',
    pricePerUnit: 350000,
    totalPrice: 1050000,
    status: 'disputed',
    paymentMethod: 'momo',
    paymentConfirmedAt: '2026-07-18T09:00:00Z',
    createdAt: '2026-07-18T08:30:00Z',
    updatedAt: '2026-07-22T11:00:00Z',
    customerId: 'user-005',
    customerName: 'Võ Văn Nam',
    customerUsername: 'vo_nam',
    customerPhoneMasked: '0965***001',
    customerEmail: 'v***m@gmail.com',
    customerProvidedData: { 'Email tài khoản OpenAI': 'v***m@gmail.com' },
    assignedTo: 'Nguyễn Văn A',
    logs: [
      { id: 'log-12', timestamp: '2026-07-18T08:30:00Z', actorType: 'customer', actorName: 'vo_nam', action: 'Tạo đơn hàng', detail: undefined },
      { id: 'log-13', timestamp: '2026-07-18T09:00:00Z', actorType: 'admin', actorName: 'admin24h', action: 'Xác nhận thanh toán', detail: undefined },
      { id: 'log-14', timestamp: '2026-07-18T09:15:00Z', actorType: 'system', actorName: 'Hệ thống', action: 'Chuyển Đang xử lý', detail: undefined },
      { id: 'log-15', timestamp: '2026-07-19T10:00:00Z', actorType: 'admin', actorName: 'Nguyễn Văn A', action: 'Đánh dấu Hoàn thành', detail: undefined },
      { id: 'log-16', timestamp: '2026-07-22T11:00:00Z', actorType: 'customer', actorName: 'vo_nam', action: 'Mở khiếu nại', detail: 'Tài khoản bị thu hồi sau 2 ngày' },
    ],
    notes: [{ id: 'note-3', timestamp: '2026-07-22T11:05:00Z', authorName: 'admin24h', content: 'Đang xác minh với bên cung cấp. Chờ kết quả trong 24h.', isPublic: false }],
    attachments: [{ id: 'att-2', name: 'screenshot_loi.png', size: '256 KB', type: 'image/png', uploadedAt: '2026-07-22T11:01:00Z', uploader: 'customer' }],
    refundReason: undefined,
  },
  {
    id: 'DVS24H-000006',
    serviceId: 'DVS-FB02',
    serviceName: 'Tăng Follow Facebook Việt Thật',
    serviceThumbnail: '👤',
    categoryName: 'Dịch vụ tương tác',
    quantity: 2,
    unit: '1.000 Follow',
    pricePerUnit: 45000,
    totalPrice: 90000,
    status: 'cancelled',
    paymentMethod: 'vietqr',
    createdAt: '2026-07-19T12:00:00Z',
    updatedAt: '2026-07-20T08:00:00Z',
    customerId: 'user-006',
    customerName: 'Bùi Thị Lan',
    customerUsername: 'lan_bui',
    customerPhoneMasked: '0909***567',
    customerEmail: 'l***n@gmail.com',
    customerProvidedData: {},
    logs: [
      { id: 'log-17', timestamp: '2026-07-19T12:00:00Z', actorType: 'customer', actorName: 'lan_bui', action: 'Tạo đơn hàng', detail: undefined },
      { id: 'log-18', timestamp: '2026-07-20T08:00:00Z', actorType: 'system', actorName: 'Hệ thống', action: 'Tự động hủy', detail: 'Quá 24h chưa thanh toán' },
    ],
    notes: [],
    attachments: [],
    cancellationReason: 'Quá 24h chưa thanh toán, hệ thống tự động hủy.',
  },
];

// ─── Store ───────────────────────────────────────────────────────────────────
class AdminOrderStore {
  orders: AdminOrder[] = [...INITIAL_ADMIN_ORDERS];
  listeners: (() => void)[] = [];

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit() {
    this.listeners.forEach(l => l());
  }

  getOrders() {
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(id: string) {
    return this.orders.find(o => o.id === id);
  }

  updateOrderStatus(id: string, newStatus: AdminOrderStatus, actorName: string, detail?: string) {
    const order = this.orders.find(o => o.id === id);
    if (!order) return;

    const logId = `log-${Date.now()}`;
    const logEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      actorType: 'admin' as const,
      actorName,
      action: `Chuyển trạng thái → ${ADMIN_ORDER_STATUS_MAP[newStatus].label}`,
      detail,
    };

    this.orders = this.orders.map(o =>
      o.id === id
        ? { ...o, status: newStatus, updatedAt: new Date().toISOString(), logs: [...o.logs, logEntry] }
        : o
    );
    this.emit();
  }

  addNote(orderId: string, content: string, isPublic: boolean, authorName: string) {
    const note = {
      id: `note-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName,
      content,
      isPublic,
    };
    this.orders = this.orders.map(o =>
      o.id === orderId ? { ...o, notes: [...o.notes, note] } : o
    );
    this.emit();
  }

  assignOrder(orderId: string, staffName: string, actorName: string) {
    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorType: 'admin' as const,
      actorName,
      action: `Giao đơn cho ${staffName}`,
    };
    this.orders = this.orders.map(o =>
      o.id === orderId
        ? { ...o, assignedTo: staffName, logs: [...o.logs, logEntry] }
        : o
    );
    this.emit();
  }

  bulkUpdateStatus(ids: string[], newStatus: AdminOrderStatus, actorName: string) {
    ids.forEach(id => this.updateOrderStatus(id, newStatus, actorName, 'Cập nhật hàng loạt'));
  }
}

export const adminOrderStore = new AdminOrderStore();
