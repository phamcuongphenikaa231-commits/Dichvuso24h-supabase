import { ActivityLog, LogAction } from '@/types/admin';

// ─── Fake IPs ─────────────────────────────────────────────────────────────────
const FAKE_IPS = [
  '103.72.10.5',
  '14.231.88.42',
  '171.237.5.111',
  '27.64.119.200',
  '113.160.20.88',
  '1.55.71.200',
];

const ACTION_LABELS: Record<LogAction, string> = {
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  lock: 'Khóa tài khoản',
  unlock: 'Mở khóa tài khoản',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
  assign: 'Phân công',
  export: 'Xuất dữ liệu',
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  refund: 'Hoàn tiền',
  close: 'Đóng ticket',
  open: 'Mở lại ticket',
};

export { ACTION_LABELS };

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'LOG001',
    actor: 'admin24h',
    actorRole: 'admin',
    action: 'login',
    target: 'Hệ thống',
    targetType: 'system',
    detail: 'Đăng nhập thành công từ trình duyệt Chrome',
    ipAddress: FAKE_IPS[0],
    createdAt: '2025-07-24T07:00:00Z',
  },
  {
    id: 'LOG002',
    actor: 'admin24h',
    actorRole: 'admin',
    action: 'update',
    target: 'ORD-2025-0041',
    targetType: 'order',
    detail: 'Cập nhật trạng thái: Chờ thanh toán → Đang xử lý',
    ipAddress: FAKE_IPS[0],
    createdAt: '2025-07-24T07:30:00Z',
  },
  {
    id: 'LOG003',
    actor: 'Trần Thị B',
    actorRole: 'admin',
    action: 'assign',
    target: 'TKT-002',
    targetType: 'ticket',
    detail: 'Phân công ticket TKT-002 cho Trần Thị B',
    ipAddress: FAKE_IPS[1],
    createdAt: '2025-07-23T14:00:00Z',
  },
  {
    id: 'LOG004',
    actor: 'Nguyễn Văn A',
    actorRole: 'admin',
    action: 'lock',
    target: 'CUST1003',
    targetType: 'customer',
    detail: 'Khóa tài khoản lqcuong - nghi ngờ gian lận thanh toán',
    ipAddress: FAKE_IPS[2],
    createdAt: '2025-07-22T10:00:00Z',
  },
  {
    id: 'LOG005',
    actor: 'admin24h',
    actorRole: 'admin',
    action: 'create',
    target: 'CPN003',
    targetType: 'coupon',
    detail: 'Tạo mã giảm giá SUMMER30 - Giảm 30% tối đa 50k',
    ipAddress: FAKE_IPS[0],
    createdAt: '2025-07-21T09:00:00Z',
  },
  {
    id: 'LOG006',
    actor: 'Lê Văn C',
    actorRole: 'admin',
    action: 'refund',
    target: 'ORD-2025-0039',
    targetType: 'order',
    detail: 'Hoàn tiền 45.000₫ cho đơn ORD-2025-0039 - Khách order nhầm',
    ipAddress: FAKE_IPS[3],
    createdAt: '2025-07-20T16:00:00Z',
  },
  {
    id: 'LOG007',
    actor: 'admin24h',
    actorRole: 'admin',
    action: 'export',
    target: 'Danh sách đơn hàng',
    targetType: 'order',
    detail: 'Xuất CSV 248 đơn hàng tháng 7/2025',
    ipAddress: FAKE_IPS[0],
    createdAt: '2025-07-19T15:30:00Z',
  },
  {
    id: 'LOG008',
    actor: 'admin24h',
    actorRole: 'admin',
    action: 'update',
    target: 'Cài đặt cửa hàng',
    targetType: 'settings',
    detail: 'Cập nhật hotline: 0901 234 567 → 0902 345 678',
    ipAddress: FAKE_IPS[4],
    createdAt: '2025-07-18T11:00:00Z',
  },
  {
    id: 'LOG009',
    actor: 'system',
    actorRole: 'system',
    action: 'update',
    target: 'ORD-2025-0035',
    targetType: 'order',
    detail: 'Hệ thống tự động hoàn thành đơn sau 7 ngày',
    ipAddress: '127.0.0.1',
    createdAt: '2025-07-17T00:00:00Z',
  },
  {
    id: 'LOG010',
    actor: 'Nguyễn Văn A',
    actorRole: 'admin',
    action: 'close',
    target: 'TKT-005',
    targetType: 'ticket',
    detail: 'Đóng ticket TKT-005 sau khi mở khóa tài khoản thành công',
    ipAddress: FAKE_IPS[5],
    createdAt: '2025-07-16T14:00:00Z',
  },
  {
    id: 'LOG011',
    actor: 'admin24h',
    actorRole: 'admin',
    action: 'delete',
    target: 'CPN002',
    targetType: 'coupon',
    detail: 'Xóa mã giảm giá FLASH20K đã hết hạn',
    ipAddress: FAKE_IPS[0],
    createdAt: '2025-07-16T09:00:00Z',
  },
  {
    id: 'LOG012',
    actor: 'Trần Thị B',
    actorRole: 'admin',
    action: 'update',
    target: 'BNR002',
    targetType: 'content',
    detail: 'Cập nhật banner: Gói YouTube Premium - thay đổi subtitle',
    ipAddress: FAKE_IPS[1],
    createdAt: '2025-07-15T10:00:00Z',
  },
];

let _logs = [...INITIAL_LOGS];

export const adminLogStore = {
  getLogs: (): ActivityLog[] => _logs,

  addLog: (log: Omit<ActivityLog, 'id' | 'createdAt'>): void => {
    const entry: ActivityLog = {
      ...log,
      id: `LOG${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    _logs = [entry, ..._logs];
  },
};

export const FAKE_IPS_LIST = FAKE_IPS;
