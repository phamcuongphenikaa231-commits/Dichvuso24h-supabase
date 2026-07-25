import { AdminCustomer, CustomerStatus, CustomerNote } from '@/types/admin';

// ─── Helpers ──────────────────────────────────────────────────────────────────
let _idCounter = 1000;
function genId() { return `CUST${String(++_idCounter).padStart(4, '0')}`; }

// ─── Mock Data ────────────────────────────────────────────────────────────────
const INITIAL_CUSTOMERS: AdminCustomer[] = [
  {
    id: 'CUST1001',
    fullName: 'Nguyễn Văn Anh',
    username: 'nvanh88',
    phoneMasked: '09***1234',
    email: 'nvanh88@gmail.com',
    status: 'active',
    totalOrders: 12,
    totalSpent: 1_850_000,
    joinedAt: '2024-01-15T08:00:00Z',
    lastActiveAt: '2025-07-10T14:30:00Z',
    notes: [
      { id: 'N001', content: 'Khách VIP, hay mua tháng cuối', authorName: 'admin24h', createdAt: '2025-06-01T09:00:00Z' },
    ],
  },
  {
    id: 'CUST1002',
    fullName: 'Trần Thị Bình',
    username: 'ttbinh',
    phoneMasked: '03***5678',
    email: 'ttbinh@yahoo.com',
    status: 'active',
    totalOrders: 5,
    totalSpent: 420_000,
    joinedAt: '2024-03-20T10:00:00Z',
    lastActiveAt: '2025-07-01T09:00:00Z',
    notes: [],
  },
  {
    id: 'CUST1003',
    fullName: 'Lê Quốc Cường',
    username: 'lqcuong',
    phoneMasked: '07***9012',
    email: 'lqcuong@hotmail.com',
    status: 'locked',
    totalOrders: 3,
    totalSpent: 180_000,
    joinedAt: '2024-05-11T12:00:00Z',
    lastActiveAt: '2024-12-01T08:00:00Z',
    notes: [
      { id: 'N002', content: 'Khóa do nghi ngờ gian lận thanh toán', authorName: 'admin24h', createdAt: '2025-01-10T16:00:00Z' },
    ],
  },
  {
    id: 'CUST1004',
    fullName: 'Phạm Minh Đức',
    username: 'pmduc99',
    phoneMasked: '08***3456',
    email: 'pmduc99@gmail.com',
    status: 'active',
    totalOrders: 28,
    totalSpent: 5_600_000,
    joinedAt: '2023-11-08T08:00:00Z',
    lastActiveAt: '2025-07-20T18:00:00Z',
    notes: [],
  },
  {
    id: 'CUST1005',
    fullName: 'Hoàng Thị Linh',
    username: 'htlinh',
    phoneMasked: '09***7890',
    email: 'htlinh@gmail.com',
    status: 'pending',
    totalOrders: 1,
    totalSpent: 50_000,
    joinedAt: '2025-07-18T15:00:00Z',
    lastActiveAt: '2025-07-18T16:00:00Z',
    notes: [],
  },
  {
    id: 'CUST1006',
    fullName: 'Vũ Thanh Nam',
    username: 'vtnam',
    phoneMasked: '03***2109',
    email: 'vtnam@gmail.com',
    status: 'active',
    totalOrders: 9,
    totalSpent: 975_000,
    joinedAt: '2024-08-15T09:00:00Z',
    lastActiveAt: '2025-06-28T11:00:00Z',
    notes: [],
  },
  {
    id: 'CUST1007',
    fullName: 'Đặng Thu Hà',
    username: 'dtha',
    phoneMasked: '07***6543',
    email: 'dtha@outlook.com',
    status: 'active',
    totalOrders: 4,
    totalSpent: 320_000,
    joinedAt: '2025-01-25T11:00:00Z',
    lastActiveAt: '2025-07-05T13:00:00Z',
    notes: [],
  },
  {
    id: 'CUST1008',
    fullName: 'Bùi Văn Hùng',
    username: 'bvhung',
    phoneMasked: '08***8765',
    email: 'bvhung@gmail.com',
    status: 'locked',
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2025-07-10T10:00:00Z',
    lastActiveAt: '2025-07-10T10:15:00Z',
    notes: [
      { id: 'N003', content: 'Tài khoản đăng ký hàng loạt (spam)', authorName: 'Nguyễn Văn A', createdAt: '2025-07-10T10:30:00Z' },
    ],
  },
  {
    id: 'CUST1009',
    fullName: 'Ngô Thị Khánh',
    username: 'ntkhanh',
    phoneMasked: '09***4321',
    email: 'ntkhanh@gmail.com',
    status: 'active',
    totalOrders: 17,
    totalSpent: 2_340_000,
    joinedAt: '2023-09-01T08:00:00Z',
    lastActiveAt: '2025-07-22T09:00:00Z',
    notes: [],
  },
  {
    id: 'CUST1010',
    fullName: 'Phan Xuân Long',
    username: 'pxlong',
    phoneMasked: '07***0987',
    email: 'pxlong@gmail.com',
    status: 'active',
    totalOrders: 6,
    totalSpent: 540_000,
    joinedAt: '2024-12-01T14:00:00Z',
    lastActiveAt: '2025-07-15T16:00:00Z',
    notes: [],
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
let _customers = [...INITIAL_CUSTOMERS];
const _listeners = new Set<() => void>();

function notify() { _listeners.forEach(l => l()); }

export const adminCustomerStore = {
  getCustomers: (): AdminCustomer[] => _customers,

  getById: (id: string): AdminCustomer | undefined =>
    _customers.find(c => c.id === id),

  toggleLock: (id: string, actorName: string): void => {
    _customers = _customers.map(c => {
      if (c.id !== id) return c;
      const newStatus: CustomerStatus = c.status === 'locked' ? 'active' : 'locked';
      return { ...c, status: newStatus };
    });
    void actorName;
    notify();
  },

  addNote: (customerId: string, content: string, authorName: string): void => {
    const note: CustomerNote = {
      id: `N${Date.now()}`,
      content,
      authorName,
      createdAt: new Date().toISOString(),
    };
    _customers = _customers.map(c =>
      c.id === customerId ? { ...c, notes: [...c.notes, note] } : c
    );
    notify();
  },

  deleteNote: (customerId: string, noteId: string): void => {
    _customers = _customers.map(c =>
      c.id === customerId ? { ...c, notes: c.notes.filter(n => n.id !== noteId) } : c
    );
    notify();
  },

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  genId,
};

export const CUSTOMER_STATUS_MAP: Record<CustomerStatus, { label: string; badge: 'success' | 'danger' | 'warning' }> = {
  active: { label: 'Hoạt động', badge: 'success' },
  locked: { label: 'Đã khóa', badge: 'danger' },
  pending: { label: 'Chờ xác minh', badge: 'warning' },
};
