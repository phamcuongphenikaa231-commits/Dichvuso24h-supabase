'use client';

import { orderService } from '@/services/orderService';
import { Transaction, TransactionMethod, TransactionStatus } from '@/types/admin';
import { Order } from '@/types/order';

const RECONCILIATION_STORAGE_KEY = 'dv24h_payment_reconciliations';

type ReconciliationMap = Record<string, { reconciledAt: string; reconciledBy: string }>;

function readReconciliations(): ReconciliationMap {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(RECONCILIATION_STORAGE_KEY) || '{}') as ReconciliationMap;
  } catch {
    return {};
  }
}

function writeReconciliations(value: ReconciliationMap) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(RECONCILIATION_STORAGE_KEY, JSON.stringify(value));
}

function mapStatus(order: Order): TransactionStatus {
  if (order.paymentStatus === 'verified') return 'success';
  if (order.paymentStatus === 'refunded') return 'refunded';
  if (order.paymentStatus === 'rejected') return 'failed';
  return 'pending';
}

function mapOrderToTransaction(order: Order, reconciliations: ReconciliationMap): Transaction {
  const reconciliation = reconciliations[order.id];
  return {
    id: `pay-${order.id}`,
    transactionCode: order.paymentContent,
    orderId: order.orderCode,
    orderService: order.serviceName,
    customerId: order.userId,
    customerName: order.userName,
    amount: order.totalAmount,
    method: 'vietqr' as TransactionMethod,
    status: mapStatus(order),
    createdAt: order.createdAt,
    confirmedAt: order.paymentVerifiedAt || undefined,
    note:
      order.paymentStatus === 'customer_reported'
        ? 'Khách đã báo chuyển khoản, đang chờ admin xác nhận.'
        : order.publicNote || undefined,
    reconciledAt: reconciliation?.reconciledAt,
    reconciledBy: reconciliation?.reconciledBy,
  };
}

const listeners = new Set<() => void>();
let subscribedToOrders = false;

function ensureOrderSubscription() {
  if (subscribedToOrders || typeof window === 'undefined') return;
  subscribedToOrders = true;
  orderService.subscribe(() => listeners.forEach((listener) => listener()));
}

export const TRANSACTION_STATUS_MAP: Record<
  TransactionStatus,
  { label: string; badge: 'success' | 'warning' | 'danger' | 'outline' }
> = {
  success: { label: 'Đã xác nhận', badge: 'success' },
  pending: { label: 'Đang chờ', badge: 'warning' },
  failed: { label: 'Có vấn đề', badge: 'danger' },
  refunded: { label: 'Hoàn tiền', badge: 'outline' },
};

export const TRANSACTION_METHOD_MAP: Record<TransactionMethod, string> = {
  mbbank: 'MB Bank',
  momo: 'MoMo',
  vietqr: 'VietQR / Chuyển khoản',
  manual: 'Thủ công',
};

export const paymentService = {
  getTransactions(): Transaction[] {
    ensureOrderSubscription();
    const reconciliations = readReconciliations();
    return orderService.getAllOrders().map((order) => mapOrderToTransaction(order, reconciliations));
  },

  reconcile(orderCode: string, adminName: string): { success: boolean; message: string } {
    const order = orderService.getOrderByCode(orderCode);
    if (!order) return { success: false, message: 'Không tìm thấy đơn hàng.' };
    if (order.paymentStatus !== 'verified') {
      return { success: false, message: 'Chỉ đối soát đơn đã được xác nhận thanh toán.' };
    }
    const reconciliations = readReconciliations();
    if (reconciliations[order.id]) {
      return { success: false, message: 'Giao dịch này đã được đối soát.' };
    }
    reconciliations[order.id] = {
      reconciledAt: new Date().toISOString(),
      reconciledBy: adminName,
    };
    writeReconciliations(reconciliations);
    listeners.forEach((listener) => listener());
    return { success: true, message: 'Đã ghi nhận đối soát giao dịch.' };
  },

  subscribe(listener: () => void): () => void {
    ensureOrderSubscription();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
