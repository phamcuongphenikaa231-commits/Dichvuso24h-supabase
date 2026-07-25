import { Transaction, TransactionStatus, TransactionMethod } from '@/types/admin';

export const TRANSACTION_STATUS_MAP: Record<TransactionStatus, { label: string; badge: 'success' | 'warning' | 'danger' | 'outline' }> = {
  success: { label: 'Thành công', badge: 'success' },
  pending: { label: 'Đang chờ', badge: 'warning' },
  failed: { label: 'Thất bại', badge: 'danger' },
  refunded: { label: 'Hoàn tiền', badge: 'outline' },
};

export const TRANSACTION_METHOD_MAP: Record<TransactionMethod, string> = {
  mbbank: 'MB Bank',
  momo: 'MoMo',
  vietqr: 'VietQR',
  manual: 'Thủ công',
};

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-001',
    transactionCode: 'MB24071500001',
    orderId: 'ORD-2025-0041',
    orderService: 'Follow Instagram 1000',
    customerId: 'CUST1001',
    customerName: 'Nguyễn Văn Anh',
    amount: 85_000,
    method: 'mbbank',
    status: 'success',
    createdAt: '2025-07-15T08:00:00Z',
    confirmedAt: '2025-07-15T08:05:00Z',
    bankRef: 'FT25196001234',
    reconciledAt: '2025-07-15T09:00:00Z',
    reconciledBy: 'admin24h',
  },
  {
    id: 'TXN-002',
    transactionCode: 'MM24071600002',
    orderId: 'ORD-2025-0039',
    orderService: 'Like Fanpage Facebook 500',
    customerId: 'CUST1004',
    customerName: 'Phạm Minh Đức',
    amount: 45_000,
    method: 'momo',
    status: 'success',
    createdAt: '2025-07-16T10:30:00Z',
    confirmedAt: '2025-07-16T10:31:00Z',
    bankRef: 'MOMO25197022345',
    reconciledAt: '2025-07-16T11:00:00Z',
    reconciledBy: 'Trần Thị B',
  },
  {
    id: 'TXN-003',
    transactionCode: 'VQR24071700003',
    orderId: 'ORD-2025-0038',
    orderService: 'View TikTok 10000',
    customerId: 'CUST1002',
    customerName: 'Trần Thị Bình',
    amount: 120_000,
    method: 'vietqr',
    status: 'pending',
    createdAt: '2025-07-17T14:00:00Z',
    bankRef: undefined,
    note: 'Khách chưa chuyển khoản',
  },
  {
    id: 'TXN-004',
    transactionCode: 'MB24071800004',
    orderId: 'ORD-2025-0037',
    orderService: 'Sub YouTube 1000',
    customerId: 'CUST1009',
    customerName: 'Ngô Thị Khánh',
    amount: 250_000,
    method: 'mbbank',
    status: 'success',
    createdAt: '2025-07-18T07:00:00Z',
    confirmedAt: '2025-07-18T07:10:00Z',
    bankRef: 'FT25199011122',
    reconciledAt: '2025-07-18T08:00:00Z',
    reconciledBy: 'admin24h',
  },
  {
    id: 'TXN-005',
    transactionCode: 'MM24071900005',
    orderId: 'ORD-2025-0036',
    orderService: 'Share Facebook 500',
    customerId: 'CUST1006',
    customerName: 'Vũ Thanh Nam',
    amount: 30_000,
    method: 'momo',
    status: 'failed',
    createdAt: '2025-07-19T11:00:00Z',
    note: 'Lỗi cổng thanh toán MoMo',
  },
  {
    id: 'TXN-006',
    transactionCode: 'MB24072000006',
    orderId: 'ORD-2025-0035',
    orderService: 'Comment YouTube 100',
    customerId: 'CUST1007',
    customerName: 'Đặng Thu Hà',
    amount: 75_000,
    method: 'mbbank',
    status: 'refunded',
    createdAt: '2025-07-20T09:00:00Z',
    confirmedAt: '2025-07-20T09:05:00Z',
    bankRef: 'FT25201019988',
    note: 'Hoàn tiền theo yêu cầu khách',
  },
  {
    id: 'TXN-007',
    transactionCode: 'MAN24072100007',
    orderId: 'ORD-2025-0034',
    orderService: 'Like TikTok 1000',
    customerId: 'CUST1010',
    customerName: 'Phan Xuân Long',
    amount: 60_000,
    method: 'manual',
    status: 'success',
    createdAt: '2025-07-21T13:00:00Z',
    confirmedAt: '2025-07-21T13:30:00Z',
    note: 'Xác nhận thủ công qua Zalo',
    reconciledAt: '2025-07-21T14:00:00Z',
    reconciledBy: 'Nguyễn Văn A',
  },
  {
    id: 'TXN-008',
    transactionCode: 'VQR24072200008',
    orderId: 'ORD-2025-0033',
    orderService: 'Follow TikTok 500',
    customerId: 'CUST1004',
    customerName: 'Phạm Minh Đức',
    amount: 55_000,
    method: 'vietqr',
    status: 'success',
    createdAt: '2025-07-22T08:00:00Z',
    confirmedAt: '2025-07-22T08:15:00Z',
    bankRef: 'FT25203001122',
    reconciledAt: '2025-07-22T09:00:00Z',
    reconciledBy: 'admin24h',
  },
];

let _transactions = [...INITIAL_TRANSACTIONS];
const _listeners = new Set<() => void>();
function notify() { _listeners.forEach(l => l()); }

export const adminPaymentStore = {
  getTransactions: (): Transaction[] => _transactions,

  reconcile: (id: string, adminName: string): void => {
    _transactions = _transactions.map(t =>
      t.id === id
        ? { ...t, reconciledAt: new Date().toISOString(), reconciledBy: adminName }
        : t
    );
    notify();
  },

  setStatus: (id: string, status: TransactionStatus): void => {
    _transactions = _transactions.map(t =>
      t.id === id ? { ...t, status } : t
    );
    notify();
  },

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },
};
