'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, CheckCircle, RefreshCw, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { paymentService, TRANSACTION_STATUS_MAP, TRANSACTION_METHOD_MAP } from '@/services/paymentService';
import { orderService } from '@/services/orderService';
import { Transaction, TransactionStatus, TransactionMethod } from '@/types/admin';
import { removeAccents } from '@/utils/filterServices';
import { useAuth } from '@/context/AuthContext';

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPaymentsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(() => paymentService.getTransactions());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<TransactionMethod | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const refresh = () => setTransactions(paymentService.getTransactions());
    void orderService.refreshAllOrders().catch(console.error);
    const unsub = paymentService.subscribe(refresh);
    return unsub;
  }, []);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase().trim());
      result = result.filter(t =>
        t.transactionCode.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        removeAccents(t.customerName.toLowerCase()).includes(q)
      );
    }
    if (statusFilter !== 'all') result = result.filter(t => t.status === statusFilter);
    if (methodFilter !== 'all') result = result.filter(t => t.method === methodFilter);
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, searchQuery, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const totalAmount = filtered
    .filter(t => t.status === 'success')
    .reduce((s, t) => s + t.amount, 0);

  const handleReconcile = (t: Transaction) => {
    if (t.reconciledAt) {
      showToast('Đã đối soát', 'Giao dịch này đã được đối soát', 'warning');
      return;
    }
    const result = paymentService.reconcile(
      t.orderId,
      user?.fullName || user?.username || 'Quản trị viên'
    );
    showToast(result.success ? 'Đối soát thành công' : 'Không thể đối soát', result.message, result.success ? 'success' : 'warning');
  };

  const handleExportCSV = () => {
    const header = ['Mã GD', 'Mã đơn', 'Khách hàng', 'Số tiền', 'Phương thức', 'Trạng thái', 'Thời gian'];
    const rows = filtered.map(t => [
      t.transactionCode, t.orderId, t.customerName,
      t.amount, TRANSACTION_METHOD_MAP[t.method],
      TRANSACTION_STATUS_MAP[t.status].label,
      new Date(t.createdAt).toLocaleDateString('vi-VN'),
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `giao-dich-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Xuất CSV', `Đã xuất ${filtered.length} giao dịch`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Thanh toán</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Tổng <strong>{transactions.length}</strong> giao dịch · Doanh thu lọc: <strong className="text-emerald-600">{totalAmount.toLocaleString('vi-VN')}₫</strong>
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />Xuất CSV
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Thành công', key: 'success', color: 'emerald' },
          { label: 'Đang chờ', key: 'pending', color: 'amber' },
          { label: 'Thất bại', key: 'failed', color: 'red' },
          { label: 'Hoàn tiền', key: 'refunded', color: 'slate' },
        ] as { label: string; key: TransactionStatus; color: string }[]).map(s => (
          <div key={s.key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {transactions.filter(t => t.status === s.key).length}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Mã GD, mã đơn, khách hàng..."
              className="pl-9"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as TransactionStatus | 'all'); setCurrentPage(1); }}
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(TRANSACTION_STATUS_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <select
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={methodFilter}
            onChange={e => { setMethodFilter(e.target.value as TransactionMethod | 'all'); setCurrentPage(1); }}
          >
            <option value="all">Tất cả phương thức</option>
            {Object.entries(TRANSACTION_METHOD_MAP).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Mã giao dịch</th>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Phương thức</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Đối soát</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map(t => {
                const statusMeta = TRANSACTION_STATUS_MAP[t.status];
                return (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-brand-primary font-semibold">{t.transactionCode}</div>
                      {t.bankRef && <div className="text-xs text-slate-400 mt-0.5">Ref: {t.bankRef}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-700">{t.orderId}</div>
                      <div className="text-xs text-slate-400 max-w-[120px] truncate">{t.orderService}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">{t.customerName}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {t.amount.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{TRANSACTION_METHOD_MAP[t.method]}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMeta.badge} size="sm">{statusMeta.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(t.createdAt)}</td>
                    <td className="px-4 py-3">
                      {t.reconciledAt ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{t.reconciledBy}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Chưa đối soát</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!t.reconciledAt && t.status === 'success' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2"
                          onClick={() => handleReconcile(t)}
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />Đối soát
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">💳</div>
                    <p className="font-medium">Không tìm thấy giao dịch nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> · {filtered.length} giao dịch</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
