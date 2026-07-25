'use client';

import { Coupon, CouponStatus, CouponType } from '@/types/admin';
import { adminCouponStore } from '@/data/mockAdminCoupons';

const STORAGE_KEY = 'dv24h_coupons';

export const COUPON_STATUS_MAP: Record<CouponStatus, { label: string; badge: 'success' | 'secondary' | 'danger' }> = {
  active: { label: 'Đang hoạt động', badge: 'success' },
  inactive: { label: 'Tạm dừng', badge: 'secondary' },
  expired: { label: 'Hết hạn', badge: 'danger' },
};

export const COUPON_TYPE_MAP: Record<CouponType, string> = {
  percent: 'Phần trăm (%)',
  fixed: 'Số tiền cố định (₫)',
};

let coupons: Coupon[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function seed(): Coupon[] {
  return adminCouponStore.getCoupons().map((coupon) => ({ ...coupon }));
}

function ensureInitialized() {
  if (initialized || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    coupons = raw ? (JSON.parse(raw) as Coupon[]) : seed();
    if (!raw) localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  } catch {
    coupons = seed();
  }
  initialized = true;
}

function persist() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  }
  listeners.forEach((listener) => listener());
}

function generateId(): string {
  return `CPN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export const couponService = {
  getCoupons(): Coupon[] {
    ensureInitialized();
    return [...coupons];
  },

  getById(id: string): Coupon | undefined {
    ensureInitialized();
    return coupons.find((coupon) => coupon.id === id);
  },

  create(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): { success: boolean; message: string; data?: Coupon } {
    ensureInitialized();
    const normalizedCode = data.code.trim().toUpperCase();
    if (coupons.some((coupon) => coupon.code.toUpperCase() === normalizedCode)) {
      return { success: false, message: 'Mã giảm giá đã tồn tại.' };
    }
    const coupon: Coupon = {
      ...data,
      code: normalizedCode,
      id: generateId(),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    coupons = [coupon, ...coupons];
    persist();
    return { success: true, message: 'Đã tạo mã giảm giá.', data: coupon };
  },

  update(id: string, data: Partial<Omit<Coupon, 'id' | 'createdAt'>>): { success: boolean; message: string } {
    ensureInitialized();
    const current = coupons.find((coupon) => coupon.id === id);
    if (!current) return { success: false, message: 'Không tìm thấy mã giảm giá.' };
    const nextCode = (data.code || current.code).trim().toUpperCase();
    if (coupons.some((coupon) => coupon.id !== id && coupon.code.toUpperCase() === nextCode)) {
      return { success: false, message: 'Mã giảm giá đã tồn tại.' };
    }
    coupons = coupons.map((coupon) => coupon.id === id ? { ...coupon, ...data, code: nextCode } : coupon);
    persist();
    return { success: true, message: 'Đã cập nhật mã giảm giá.' };
  },

  delete(id: string): { success: boolean; message: string } {
    ensureInitialized();
    if (!coupons.some((coupon) => coupon.id === id)) {
      return { success: false, message: 'Không tìm thấy mã giảm giá.' };
    }
    coupons = coupons.filter((coupon) => coupon.id !== id);
    persist();
    return { success: true, message: 'Đã xóa mã giảm giá.' };
  },

  setStatus(id: string, status: CouponStatus): { success: boolean; message: string } {
    ensureInitialized();
    if (!coupons.some((coupon) => coupon.id === id)) {
      return { success: false, message: 'Không tìm thấy mã giảm giá.' };
    }
    coupons = coupons.map((coupon) => coupon.id === id ? { ...coupon, status } : coupon);
    persist();
    return { success: true, message: 'Đã cập nhật trạng thái mã giảm giá.' };
  },

  reset() {
    coupons = seed();
    initialized = true;
    persist();
  },

  subscribe(listener: () => void): () => void {
    ensureInitialized();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
