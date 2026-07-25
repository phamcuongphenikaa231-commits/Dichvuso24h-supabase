'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Download, ChevronLeft, ChevronRight, Eye, Filter, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { orderService } from '@/services/orderService';
import {
  Order,
  OrderStatus,
  PaymentStatus,
  PurchaseFlowType,
  DeliveryChannel,
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  DELIVERY_CHANNEL_LABELS,
} from '@/types/order';
import { removeAccents } from '@/utils/filterServices';
import { formatVND } from '@/utils/format';

const PAGE_SIZE = 10;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [flowFilter, setFlowFilter] = useState<PurchaseFlowType | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [deliveryChannelFilter, setDeliveryChannelFilter] = useState<DeliveryChannel | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_desc' | 'price_asc'>('newest');

  useEffect(() => {
    let mounted = true;
    const refreshFromCache = () => {
      if (mounted) setOrders(orderService.getAllOrders());
    };
    orderService.refreshAllOrders().catch((error) => {
      console.error(error);
      showToast('Không thể tải đơn hàng', 'Vui lòng kiểm tra kết nối Supabase.', 'error');
    });
    const unsubscribe = orderService.subscribe(refreshFromCache);
    return () => { mounted = false; unsubscribe(); };
  }, [showToast]);

  const filtered = useMemo(() => {
    let result = [...orders];

    if (searchQuery.trim()) {
      const q = removeAccents(searchQuery.toLowerCase().trim());
      result = result.filter(
        (o) =>
          removeAccents(o.orderCode.toLowerCase()).includes(q) ||
          removeAccents(o.userName.toLowerCase()).includes(q) ||
          removeAccents(o.serviceName.toLowerCase()).includes(q) ||
          (o.deliveryValue && removeAccents(o.deliveryValue.toLowerCase()).includes(q)) ||
          (o.customerInput.link && removeAccents(o.customerInput.link.toLowerCase()).includes(q))
      );
    }

    if (flowFilter !== 'all') result = result.filter((o) => o.purchaseFlowType === flowFilter);
    if (paymentStatusFilter !== 'all') result = result.filter((o) => o.paymentStatus === paymentStatusFilter);
    if (orderStatusFilter !== 'all') result = result.filter((o) => o.orderStatus === orderStatusFilter);
    if (deliveryChannelFilter !== 'all') result = result.filter((o) => o.deliveryChannel === deliveryChannelFilter);
    if (dateFrom) result = result.filter((o) => new Date(o.createdAt) >= new Date(dateFrom));
    if (dateTo) result = result.filter((o) => new Date(o.createdAt) <= new Date(dateTo + 'T23:59:59'));

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'price_desc') return b.totalAmount - a.totalAmount;
      return a.totalAmount - b.totalAmount;
    });

    return result;
  }, [
    orders,
    searchQuery,
    flowFilter,
    paymentStatusFilter,
    orderStatusFilter,
    deliveryChannelFilter,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(new Set(paginated.map((o) => o.id)));
    else setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportCSV = () => {
    const header = [
      'Mã đơn',
      'ID Nội bộ',
      'Khách hàng',
      'Dịch vụ',
      'Loại quy trình',
      'Số lượng',
      'Tổng tiền',
      'Kênh nhận kết quả',
      'Thông tin nhận',
      'TT Thanh toán',
      'TT Đơn hàng',
      'Ngày tạo',
    ];
    const rows = filtered.map((o) =>
      [
        o.orderCode,
        o.id,
        o.userName,
        `"${o.serviceName.replace(/"/g, '""')}"`,
        o.purchaseFlowType === 'interaction' ? 'Mua tương tác' : 'Tài khoản/Dịch vụ khác',
        `${o.quantity} ${o.unit}`,
        o.totalAmount,
        o.deliveryChannel ? DELIVERY_CHANNEL_LABELS[o.deliveryChannel] : 'Không có',
        o.deliveryValue ? `"${o.deliveryValue.replace(/"/g, '""')}"` : '—',
        PAYMENT_STATUS_MAP[o.paymentStatus]?.label,
        ORDER_STATUS_MAP[o.orderStatus]?.label,
        new Date(o.createdAt).toLocaleDateString('vi-VN'),
      ].join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `don-hang-admin-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Xuất CSV', `Đã xuất ${filtered.length} đơn hàng`, 'success');
  };


  const handleDeleteOrder = async (order: Order) => {
    const reason = window.prompt(
      `Xóa vĩnh viễn đơn ${order.orderCode}? Dữ liệu thanh toán và timeline liên quan cũng sẽ bị xóa.\n\nNhập lý do xóa để tiếp tục:`,
      'Xóa theo yêu cầu quản trị viên'
    );
    if (reason === null) return;
    if (!reason.trim()) {
      showToast('Chưa xóa đơn', 'Vui lòng nhập lý do xóa.', 'warning');
      return;
    }
    if (!confirm(`Xác nhận xóa vĩnh viễn đơn ${order.orderCode}? Thao tác này không thể hoàn tác.`)) return;

    setDeletingId(order.id);
    const result = await orderService.adminDeleteOrder(order.orderCode, reason.trim());
    setDeletingId(null);
    showToast(result.success ? 'Đã xóa đơn' : 'Không thể xóa', result.message, result.success ? 'success' : 'error');
    if (result.success) {
      setSelectedIds((current) => {
        const next = new Set(current);
        next.delete(order.id);
        return next;
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFlowFilter('all');
    setPaymentStatusFilter('all');
    setOrderStatusFilter('all');
    setDeliveryChannelFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Đơn hàng</h1>
          <p className="text-slate-500 mt-0.5 text-xs">
            Tổng <strong>{orders.length}</strong> đơn · Hiển thị <strong>{filtered.length}</strong> kết quả
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" /> Xuất CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Mã đơn, tên, email, zalo, fb..."
              className="pl-9 text-xs"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Flow Type Filter */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white"
            value={flowFilter}
            onChange={(e) => {
              setFlowFilter(e.target.value as PurchaseFlowType | 'all');
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả loại quy trình</option>
            <option value="interaction">Mua tương tác</option>
            <option value="delivery_required">Tài khoản & Dịch vụ khác</option>
          </select>

          {/* Payment Status Filter */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white"
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value as PaymentStatus | 'all');
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả TT Thanh toán</option>
            {Object.values(PAYMENT_STATUS_MAP).map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Order Status Filter */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white"
            value={orderStatusFilter}
            onChange={(e) => {
              setOrderStatusFilter(e.target.value as OrderStatus | 'all');
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả TT Đơn hàng</option>
            {Object.values(ORDER_STATUS_MAP).map((s) => (
              <option key={s.code} value={s.code}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Delivery Channel Filter */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white"
            value={deliveryChannelFilter ?? 'all'}
            onChange={(e) => {
              setDeliveryChannelFilter((e.target.value === 'all' ? 'all' : e.target.value) as DeliveryChannel | 'all');
              setCurrentPage(1);
            }}
          >
            <option value="all">Tất cả phương thức nhận</option>
            <option value="email">Email</option>
            <option value="zalo">Zalo</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Khoảng ngày:</span>
            <input
              type="date"
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              className="border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <select
            className="border border-slate-200 rounded-lg px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-[#0f4c81]/20 bg-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price_desc">Giá cao nhất</option>
            <option value="price_asc">Giá thấp nhất</option>
          </select>
          <button onClick={resetFilters} className="text-xs text-[#0f4c81] font-semibold hover:underline">
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-[#0f4c81]"
                    checked={paginated.length > 0 && selectedIds.size === paginated.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Quy trình</th>
                <th className="px-4 py-3 text-right">Số lượng</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Phương thức nhận</th>
                <th className="px-4 py-3">TT Thanh toán</th>
                <th className="px-4 py-3">TT Đơn hàng</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map((order) => {
                const orderMeta = ORDER_STATUS_MAP[order.orderStatus];
                const paymentMeta = PAYMENT_STATUS_MAP[order.paymentStatus];

                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-[#0f4c81]"
                        checked={selectedIds.has(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-[#0f4c81]">
                      <button
                        className="hover:underline cursor-pointer"
                        onClick={() => router.push(`/admin/don-hang/${order.orderCode}`)}
                      >
                        {order.orderCode}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{order.userName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{order.serviceThumbnailEmoji}</span>
                        <div>
                          <div className="font-semibold text-slate-800 max-w-[160px] truncate">
                            {order.serviceName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.purchaseFlowType === 'interaction' ? 'cyan' : 'outline'}>
                        {order.purchaseFlowType === 'interaction' ? 'Tương tác' : 'Tài khoản/Khác'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {order.quantity} {order.unit}
                    </td>
                    <td className="px-4 py-3 text-right font-black text-slate-900">
                      {formatVND(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.deliveryChannel && order.deliveryValue ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800">
                            {DELIVERY_CHANNEL_LABELS[order.deliveryChannel]}
                          </span>
                          <p className="text-[11px] text-slate-500 max-w-[120px] truncate" title={order.deliveryValue}>
                            {order.deliveryValue}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={paymentMeta?.badgeVariant || 'secondary'}>
                        {paymentMeta?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={orderMeta?.badgeVariant || 'secondary'}>
                        {orderMeta?.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 cursor-pointer"
                          onClick={() => router.push(`/admin/don-hang/${order.orderCode}`)}
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 cursor-pointer text-red-500 hover:bg-red-50"
                          onClick={() => handleDeleteOrder(order)}
                          disabled={deletingId === order.id}
                          isLoading={deletingId === order.id}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="font-bold text-slate-700">Không tìm thấy đơn hàng nào</p>
                    <button className="text-[#0f4c81] text-xs mt-2 font-semibold hover:underline" onClick={resetFilters}>
                      Xóa bộ lọc
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> · {filtered.length} kết quả
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
