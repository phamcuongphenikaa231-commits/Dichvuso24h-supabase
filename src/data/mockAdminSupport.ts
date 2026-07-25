import { SupportTicket, TicketStatus, TicketPriority, TicketMessage } from '@/types/admin';

export const TICKET_PRIORITY_MAP: Record<TicketPriority, { label: string; badge: 'danger' | 'warning' | 'primary' | 'secondary' }> = {
  urgent: { label: 'Khẩn cấp', badge: 'danger' },
  high: { label: 'Cao', badge: 'warning' },
  medium: { label: 'Trung bình', badge: 'primary' },
  low: { label: 'Thấp', badge: 'secondary' },
};

export const TICKET_STATUS_MAP: Record<TicketStatus, { label: string; badge: 'warning' | 'primary' | 'cyan' | 'success' | 'secondary' }> = {
  open: { label: 'Mở', badge: 'warning' },
  in_progress: { label: 'Đang xử lý', badge: 'primary' },
  waiting: { label: 'Chờ khách', badge: 'cyan' },
  resolved: { label: 'Đã giải quyết', badge: 'success' },
  closed: { label: 'Đã đóng', badge: 'secondary' },
};

export const SUPPORT_STAFF = ['admin24h', 'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-001',
    subject: 'Đơn hàng bị treo không xử lý',
    priority: 'urgent',
    status: 'open',
    customerId: 'CUST1001',
    customerName: 'Nguyễn Văn Anh',
    customerUsername: 'nvanh88',
    relatedOrderId: 'ORD-2025-0041',
    relatedOrderService: 'Follow Instagram 1000',
    assignedTo: undefined,
    createdAt: '2025-07-20T08:30:00Z',
    updatedAt: '2025-07-20T08:30:00Z',
    tags: ['đơn hàng', 'chậm xử lý'],
    messages: [
      {
        id: 'MSG001',
        senderType: 'customer',
        senderName: 'Nguyễn Văn Anh',
        content: 'Xin chào admin, đơn hàng của mình mã ORD-2025-0041 đã 3 tiếng rồi vẫn chưa thấy xử lý. Nhờ admin kiểm tra giúp ạ!',
        createdAt: '2025-07-20T08:30:00Z',
        isInternal: false,
      },
      {
        id: 'MSG002',
        senderType: 'system',
        senderName: 'Hệ thống',
        content: 'Ticket được tạo tự động từ đơn hàng ORD-2025-0041',
        createdAt: '2025-07-20T08:30:00Z',
        isInternal: true,
      },
    ],
  },
  {
    id: 'TKT-002',
    subject: 'Muốn hoàn tiền đơn Like Facebook',
    priority: 'high',
    status: 'in_progress',
    customerId: 'CUST1004',
    customerName: 'Phạm Minh Đức',
    customerUsername: 'pmduc99',
    relatedOrderId: 'ORD-2025-0039',
    relatedOrderService: 'Like Fanpage Facebook 500',
    assignedTo: 'Trần Thị B',
    createdAt: '2025-07-19T14:00:00Z',
    updatedAt: '2025-07-19T16:00:00Z',
    tags: ['hoàn tiền', 'like facebook'],
    messages: [
      {
        id: 'MSG003',
        senderType: 'customer',
        senderName: 'Phạm Minh Đức',
        content: 'Admin ơi cho mình hoàn tiền đơn này được không? Mình order nhầm trang.',
        createdAt: '2025-07-19T14:00:00Z',
        isInternal: false,
      },
      {
        id: 'MSG004',
        senderType: 'admin',
        senderName: 'Trần Thị B',
        content: 'Chào bạn, mình đã nhận được yêu cầu. Bạn có thể cung cấp screenshot đơn hàng để mình xác nhận không?',
        createdAt: '2025-07-19T16:00:00Z',
        isInternal: false,
      },
    ],
  },
  {
    id: 'TKT-003',
    subject: 'Hỏi về gói Sub YouTube 3 tháng',
    priority: 'low',
    status: 'waiting',
    customerId: 'CUST1009',
    customerName: 'Ngô Thị Khánh',
    customerUsername: 'ntkhanh',
    relatedOrderId: undefined,
    relatedOrderService: undefined,
    assignedTo: 'Nguyễn Văn A',
    createdAt: '2025-07-18T10:00:00Z',
    updatedAt: '2025-07-18T12:00:00Z',
    tags: ['tư vấn', 'youtube'],
    messages: [
      {
        id: 'MSG005',
        senderType: 'customer',
        senderName: 'Ngô Thị Khánh',
        content: 'Gói sub YouTube 3 tháng có bảo hành không ạ? Nếu sub tụt thì xử lý thế nào?',
        createdAt: '2025-07-18T10:00:00Z',
        isInternal: false,
      },
      {
        id: 'MSG006',
        senderType: 'admin',
        senderName: 'Nguyễn Văn A',
        content: 'Bạn ơi, gói này có bảo hành 30 ngày. Nếu trong 30 ngày sub tụt quá 10% sẽ được bù miễn phí. Bạn có muốn đặt thử không?',
        createdAt: '2025-07-18T12:00:00Z',
        isInternal: false,
      },
    ],
  },
  {
    id: 'TKT-004',
    subject: 'Báo cáo lỗi thanh toán MoMo',
    priority: 'high',
    status: 'resolved',
    customerId: 'CUST1002',
    customerName: 'Trần Thị Bình',
    customerUsername: 'ttbinh',
    relatedOrderId: 'ORD-2025-0035',
    relatedOrderService: 'View TikTok 10000',
    assignedTo: 'Lê Văn C',
    createdAt: '2025-07-15T09:00:00Z',
    updatedAt: '2025-07-15T18:00:00Z',
    tags: ['thanh toán', 'momo', 'lỗi'],
    messages: [
      {
        id: 'MSG007',
        senderType: 'customer',
        senderName: 'Trần Thị Bình',
        content: 'Mình thanh toán qua MoMo bị trừ tiền nhưng đơn chưa xác nhận',
        createdAt: '2025-07-15T09:00:00Z',
        isInternal: false,
      },
      {
        id: 'MSG008',
        senderType: 'admin',
        senderName: 'Lê Văn C',
        content: 'Mình đã kiểm tra và xác nhận đơn thủ công cho bạn rồi nhé. Đơn đang xử lý, xin lỗi vì sự bất tiện!',
        createdAt: '2025-07-15T18:00:00Z',
        isInternal: false,
      },
    ],
  },
  {
    id: 'TKT-005',
    subject: 'Tài khoản bị khóa không rõ lý do',
    priority: 'medium',
    status: 'closed',
    customerId: 'CUST1006',
    customerName: 'Vũ Thanh Nam',
    customerUsername: 'vtnam',
    relatedOrderId: undefined,
    relatedOrderService: undefined,
    assignedTo: 'admin24h',
    createdAt: '2025-07-12T11:00:00Z',
    updatedAt: '2025-07-13T14:00:00Z',
    tags: ['tài khoản', 'khóa'],
    messages: [
      {
        id: 'MSG009',
        senderType: 'customer',
        senderName: 'Vũ Thanh Nam',
        content: 'Tài khoản của mình bị khóa đột ngột, mình không biết lý do gì. Nhờ admin hỗ trợ.',
        createdAt: '2025-07-12T11:00:00Z',
        isInternal: false,
      },
      {
        id: 'MSG010',
        senderType: 'admin',
        senderName: 'admin24h',
        content: 'Sau khi kiểm tra, tài khoản bị khóa nhầm do hệ thống phát hiện đăng nhập bất thường. Đã mở khóa lại cho bạn, xin lỗi về sự bất tiện!',
        createdAt: '2025-07-13T14:00:00Z',
        isInternal: false,
      },
    ],
  },
];

let _tickets = [...INITIAL_TICKETS];
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach(l => l()); }

export const adminSupportStore = {
  getTickets: (): SupportTicket[] => _tickets,

  getById: (id: string): SupportTicket | undefined => _tickets.find(t => t.id === id),

  assign: (ticketId: string, assignee: string): void => {
    _tickets = _tickets.map(t =>
      t.id === ticketId ? { ...t, assignedTo: assignee, updatedAt: new Date().toISOString() } : t
    );
    notify();
  },

  setStatus: (ticketId: string, status: TicketStatus): void => {
    _tickets = _tickets.map(t =>
      t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t
    );
    notify();
  },

  addMessage: (ticketId: string, message: Omit<TicketMessage, 'id' | 'createdAt'>): void => {
    const msg: TicketMessage = {
      ...message,
      id: `MSG${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    _tickets = _tickets.map(t =>
      t.id === ticketId
        ? { ...t, messages: [...t.messages, msg], updatedAt: new Date().toISOString() }
        : t
    );
    notify();
  },

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
