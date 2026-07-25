export type OrderStatus =
  | 'pending_payment'   // Chờ thanh toán
  | 'paid'              // Đã thanh toán
  | 'processing'        // Đang xử lý
  | 'completed'         // Hoàn thành
  | 'need_info'         // Cần bổ sung thông tin
  | 'cancelled'         // Đã hủy
  | 'refunded'          // Hoàn tiền
  | 'disputed';         // Có khiếu nại

export interface OrderStatusMeta {
  code: OrderStatus;
  label: string;
  badgeVariant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'cyan' | 'orange' | 'outline';
  description: string;
}

export interface CustomerOrderLog {
  timestamp: string;
  status: OrderStatus;
  message: string;
}

export interface CustomerOrder {
  id: string; // e.g. DVS24H-892401
  serviceId: string;
  serviceName: string;
  category: string;
  thumbnailEmoji: string;
  thumbnailBg: string;
  createdAt: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: OrderStatus;
  targetInfo: string; // Email or Link provided
  customerNote?: string;
  processingTime: string;
  warrantyPolicy: string;
  logs: CustomerOrderLog[];
  canRequestWarranty?: boolean;
}

export interface AccountNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'order' | 'system' | 'warranty';
}

export interface SupportTicket {
  id: string;
  orderId?: string;
  orderCode?: string;
  topic: 'warranty' | 'guide' | 'payment' | 'other';
  topicLabel: string;
  subject: string;
  content: string;
  status: 'pending' | 'answered' | 'closed';
  createdAt: string;
  response?: string;
  responseAt?: string;
}

export interface UserSessionDevice {
  id: string;
  deviceName: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}
