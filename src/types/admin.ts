// ─── Existing types ──────────────────────────────────────────────────────────

// Re-export shared order types for convenience
export type { PaymentStatus, OrderStatus as NewOrderStatus, PurchaseFlowType, DeliveryChannel } from '@/types/order';
export { PAYMENT_STATUS_MAP, ORDER_STATUS_MAP as NEW_ORDER_STATUS_MAP } from '@/types/order';

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  serviceCount: number;
  parentId?: string | null;      // null = danh mục lớn, string = danh mục con
  children?: AdminCategory[];    // populated at runtime
  imageUrl?: string | null;
  imagePath?: string | null;
}

export interface AdminService {
  id: string;
  sku?: string;
  slug: string;
  name: string;
  categoryId: string;
  categoryName: string;
  purchaseFlowType: 'interaction' | 'delivery_required';
  shortDescription: string;
  fullDescription: string;
  price: number;
  originalPrice: number | null;
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  processingTime: string;
  warranty: string;
  thumbnail: string;          // emoji fallback
  thumbnailUrl?: string | null;
  thumbnailPath?: string | null;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  customFields: {
    id: string;
    label: string;
    type: 'text' | 'url' | 'email' | 'textarea' | 'number';
    required: boolean;
    placeholder: string;
  }[];
  instructions: string;
  termsAndConditions: string;
  stockStatus: 'in_stock' | 'out_of_stock' | 'pre_order';
  updatedAt: string;
}

export type AdminServiceFormData = Omit<AdminService, 'updatedAt' | 'isDeleted' | 'categoryName'>;

export type AdminOrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'need_info'
  | 'cancelled'
  | 'refunded'
  | 'disputed';

export type PaymentMethod = 'mbbank' | 'momo' | 'vietqr' | 'manual' | 'free';

export interface AdminOrderStatusMeta {
  code: AdminOrderStatus;
  label: string;
  badge: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'cyan' | 'orange' | 'outline';
  allowedNext: AdminOrderStatus[];
  requireConfirm: boolean;
  irreversible: boolean;
}

export interface AdminOrderLog {
  id: string;
  timestamp: string;
  actorType: 'system' | 'admin' | 'customer';
  actorName: string;
  action: string;
  detail?: string;
}

export interface AdminOrderNote {
  id: string;
  timestamp: string;
  authorName: string;
  content: string;
  isPublic: boolean;
}

export interface AdminOrderAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploader: string;
}

export interface AdminOrder {
  id: string;
  orderCode?: string;            // Mã đơn dễ đọc (có thể null với đơn cũ)
  serviceId: string;
  serviceName: string;
  serviceThumbnail: string;
  categoryName: string;
  purchaseFlowType?: 'interaction' | 'delivery_required'; // Loại quy trình mua
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: AdminOrderStatus;
  paymentStatus?: 'unpaid' | 'customer_reported' | 'verified' | 'rejected' | 'refunded';
  paymentMethod: PaymentMethod;
  paymentContent?: string;       // Nội dung chuyển khoản
  paymentConfirmedAt?: string;
  deliveryChannel?: 'email' | 'zalo' | 'facebook' | null; // Kênh nhận kết quả
  deliveryValue?: string | null; // Giá trị kênh nhận kết quả
  createdAt: string;
  updatedAt: string;
  customerId: string;
  customerName: string;
  customerUsername: string;
  customerPhoneMasked: string;
  customerEmail: string;
  customerProvidedData: Record<string, string>;
  customerNote?: string;
  assignedTo?: string;
  logs: AdminOrderLog[];
  notes: AdminOrderNote[];
  attachments: AdminOrderAttachment[];
  refundReason?: string;
  cancellationReason?: string;
}

// ─── Customer Management ──────────────────────────────────────────────────────

export type CustomerStatus = 'active' | 'locked' | 'pending';

export interface CustomerNote {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface AdminCustomer {
  id: string;
  fullName: string;
  username: string;
  phoneMasked: string;
  email: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastActiveAt: string;
  notes: CustomerNote[];
  avatar?: string;
}

// ─── Support / Tickets ────────────────────────────────────────────────────────

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  senderType: 'customer' | 'admin' | 'system';
  senderName: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  customerId: string;
  customerName: string;
  customerUsername: string;
  relatedOrderId?: string;
  relatedOrderService?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
  tags: string[];
}

// ─── Payments / Transactions ──────────────────────────────────────────────────

export type TransactionStatus = 'success' | 'pending' | 'failed' | 'refunded';
export type TransactionMethod = 'mbbank' | 'momo' | 'vietqr' | 'manual';

export interface Transaction {
  id: string;
  transactionCode: string;
  orderId: string;
  orderService: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: TransactionMethod;
  status: TransactionStatus;
  createdAt: string;
  confirmedAt?: string;
  bankRef?: string;
  note?: string;
  reconciledAt?: string;
  reconciledBy?: string;
}

// ─── Coupons / Mã giảm giá ───────────────────────────────────────────────────

export type CouponType = 'percent' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: CouponStatus;
  applicableServices: string[];
  createdAt: string;
  description?: string;
}

// ─── Website Content ──────────────────────────────────────────────────────────

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Announcement {
  id: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export interface Policy {
  id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface ContactInfo {
  hotline: string;
  email: string;
  address: string;
  workingHours: string;
  facebookUrl: string;
  telegramUrl: string;
  youtubeUrl: string;
  zaloUrl: string;
}

export interface FooterContent {
  companyName: string;
  description: string;
  copyright: string;
  quickLinks: { label: string; url: string }[];
}

// ─── Activity Logs ────────────────────────────────────────────────────────────

export type LogAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'lock'
  | 'unlock'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'export'
  | 'login'
  | 'logout'
  | 'refund'
  | 'close'
  | 'open';

export interface ActivityLog {
  id: string;
  actor: string;
  actorRole: 'admin' | 'system';
  action: LogAction;
  target: string;
  targetType: string;
  detail: string;
  ipAddress: string;
  createdAt: string;
}

// ─── Store Settings ───────────────────────────────────────────────────────────

export interface SocialLinks {
  facebook: string;
  telegram: string;
  youtube: string;
  zalo: string;
  tiktok: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl: string;
  hotline: string;
  supportEmail: string;
  address: string;
  workingHours: string;
  currency: string;
  timezone: string;
  socialLinks: SocialLinks;
}
