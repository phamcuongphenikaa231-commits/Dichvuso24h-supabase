import { Coupon, CouponStatus, CouponType } from '@/types/admin';

export const COUPON_STATUS_MAP: Record<CouponStatus, { label: string; badge: 'success' | 'secondary' | 'danger' }> = {
  active: { label: 'Đang hoạt động', badge: 'success' },
  inactive: { label: 'Tạm dừng', badge: 'secondary' },
  expired: { label: 'Hết hạn', badge: 'danger' },
};

export const COUPON_TYPE_MAP: Record<CouponType, string> = {
  percent: 'Phần trăm (%)',
  fixed: 'Số tiền cố định (₫)',
};

let _idCounter = 100;
function genId() { return `CPN${String(++_idCounter).padStart(3, '0')}`; }

const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'CPN001',
    code: 'NEWUSER50',
    type: 'percent',
    value: 50,
    minOrderAmount: 50_000,
    maxDiscount: 30_000,
    usageLimit: 500,
    usedCount: 217,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    status: 'active',
    applicableServices: [],
    createdAt: '2024-12-25T08:00:00Z',
    description: 'Giảm 50% cho đơn hàng đầu tiên (tối đa 30k)',
  },
  {
    id: 'CPN002',
    code: 'FLASH20K',
    type: 'fixed',
    value: 20_000,
    minOrderAmount: 100_000,
    usageLimit: 100,
    usedCount: 100,
    startDate: '2025-07-01',
    endDate: '2025-07-15',
    status: 'expired',
    applicableServices: [],
    createdAt: '2025-06-30T08:00:00Z',
    description: 'Flash sale giảm 20k',
  },
  {
    id: 'CPN003',
    code: 'SUMMER30',
    type: 'percent',
    value: 30,
    minOrderAmount: 80_000,
    maxDiscount: 50_000,
    usageLimit: 200,
    usedCount: 45,
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    status: 'active',
    applicableServices: [],
    createdAt: '2025-05-30T08:00:00Z',
    description: 'Khuyến mãi hè 2025',
  },
  {
    id: 'CPN004',
    code: 'VIP100K',
    type: 'fixed',
    value: 100_000,
    minOrderAmount: 500_000,
    usageLimit: 50,
    usedCount: 12,
    startDate: '2025-07-01',
    endDate: '2025-12-31',
    status: 'active',
    applicableServices: [],
    createdAt: '2025-06-28T08:00:00Z',
    description: 'Ưu đãi khách VIP - giảm 100k cho đơn từ 500k',
  },
  {
    id: 'CPN005',
    code: 'TESTOFF',
    type: 'percent',
    value: 10,
    minOrderAmount: 0,
    usageLimit: 999,
    usedCount: 0,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    status: 'expired',
    applicableServices: [],
    createdAt: '2024-12-31T08:00:00Z',
    description: 'Mã test nội bộ',
  },
  {
    id: 'CPN006',
    code: 'YOUTUBE15',
    type: 'percent',
    value: 15,
    minOrderAmount: 150_000,
    maxDiscount: 40_000,
    usageLimit: 300,
    usedCount: 88,
    startDate: '2025-05-01',
    endDate: '2025-10-31',
    status: 'inactive',
    applicableServices: ['Sub YouTube'],
    createdAt: '2025-04-28T08:00:00Z',
    description: 'Riêng cho dịch vụ YouTube - tạm dừng để kiểm tra',
  },
];

let _coupons = [...INITIAL_COUPONS];
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach(l => l()); }

export const adminCouponStore = {
  getCoupons: (): Coupon[] => _coupons,

  getById: (id: string): Coupon | undefined => _coupons.find(c => c.id === id),

  create: (data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Coupon => {
    const coupon: Coupon = {
      ...data,
      id: genId(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    _coupons = [coupon, ..._coupons];
    notify();
    return coupon;
  },

  update: (id: string, data: Partial<Omit<Coupon, 'id' | 'createdAt'>>): void => {
    _coupons = _coupons.map(c => c.id === id ? { ...c, ...data } : c);
    notify();
  },

  delete: (id: string): void => {
    _coupons = _coupons.filter(c => c.id !== id);
    notify();
  },

  setStatus: (id: string, status: CouponStatus): void => {
    _coupons = _coupons.map(c => c.id === id ? { ...c, status } : c);
    notify();
  },

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
