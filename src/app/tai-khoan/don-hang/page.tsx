'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronLeft, ChevronRight, ShoppingBag, CreditCard, Eye } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus, ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, DELIVERY_CHANNEL_LABELS } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { removeAccents } from '@/utils/filterServices';
import { formatVND } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import { maskDeliveryValue } from '@/utils/privacy';

const ITEMS_PER_PAGE = 5;

export default function AccountOrdersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const refresh = () => {
      if (mounted) setOrders(orderService.getOrdersByUser(user.id));
    };
    orderService.refreshOrdersByUser(user.id).catch(console.error);
    const unsubscribe = orderService.subscribe(refresh);
    return () => { mounted = false; unsubscribe(); };
  }, [user]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Match
      const matchStatus = statusFilter === 'all' || order.orderStatus === statusFilter;

      // 2. Search Match
      const q = removeAccents(searchQuery.toLowerCase().trim());
      const matchSearch =
        q === '' ||
        removeAccents(order.orderCode.toLowerCase()).includes(q) ||
        removeAccents(order.serviceName.toLowerCase()).includes(q) ||
        (order.deliveryValue && removeAccents(order.deliveryValue.toLowerCase()).includes(q));

      return matchStatus && matchSearch;
    });
  }, [orders, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const currentOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as OrderStatus | 'all');
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lịch sử mua hàng</h1>
          <p className="text-slate-500 mt-1 text-sm">Quản lý và theo dõi trạng thái các dịch vụ bạn đã mua</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Tìm theo mã đơn (DV24H-...), dịch vụ..."
            className="pl-9 text-xs"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="text-slate-400 w-4 h-4 hidden md:block" />
          <select
            className="w-full md:w-auto border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0f4c81]/20 focus:border-[#0f4c81] outline-none font-medium text-slate-700 bg-white"
            value={statusFilter}
            onChange={handleStatusChange}
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.values(ORDER_STATUS_MAP).map((status) => (
              <option key={status.code} value={status.code}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {currentOrders.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {currentOrders.map((order) => {
              const orderStatusMeta = ORDER_STATUS_MAP[order.orderStatus];
              const paymentStatusMeta = PAYMENT_STATUS_MAP[order.paymentStatus];

              return (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl ${order.serviceThumbnailBg} flex items-center justify-center text-2xl sm:text-3xl border border-slate-200/50 shadow-xs`}
                    >
                      {order.serviceThumbnailEmoji}
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0f4c81] bg-[#f0f7ff] px-2 py-0.5 rounded border border-[#0f4c81]/20">
                          {order.orderCode}
                        </span>
                        <Badge variant={orderStatusMeta.badgeVariant}>{orderStatusMeta.label}</Badge>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{order.serviceName}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>Tạo: {new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                        <span>•</span>
                        <span>Số lượng: {order.quantity} {order.unit}</span>
                        {order.deliveryChannel && order.deliveryValue && (
                          <>
                            <span>•</span>
                            <span className="text-slate-700 font-medium">
                              Nhận qua {DELIVERY_CHANNEL_LABELS[order.deliveryChannel]}: {maskDeliveryValue(order.deliveryChannel, order.deliveryValue)}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="pt-1">
                        <span className="text-xs text-slate-500">Thanh toán: </span>
                        <Badge variant={paymentStatusMeta.badgeVariant} className="text-[11px]">
                          {paymentStatusMeta.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <p className="font-black text-lg text-[#0f4c81]">
                      {formatVND(order.totalAmount)}
                    </p>
                    <div className="flex items-center gap-2">
                      {['unpaid', 'rejected'].includes(order.paymentStatus) && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="font-bold text-xs"
                          onClick={() => router.push(`/thanh-toan/${order.orderCode}`)}
                        >
                          <CreditCard className="w-3.5 h-3.5 mr-1" /> Tiếp tục thanh toán
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => router.push(`/tai-khoan/don-hang/${order.orderCode}`)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Không tìm thấy đơn hàng nào</h3>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Bạn chưa có đơn hàng nào khớp với điều kiện tìm kiếm. Hãy thử điều chỉnh lại bộ lọc nhé.
            </p>
            {statusFilter !== 'all' || searchQuery !== '' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setSearchQuery('');
                }}
              >
                Xóa bộ lọc
              </Button>
            ) : (
              <Button size="sm" onClick={() => router.push('/dich-vu')}>Khám phá dịch vụ ngay</Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <p className="text-xs text-slate-500 hidden sm:block">
              Hiển thị <span className="font-bold text-slate-800">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> đến{' '}
              <span className="font-bold text-slate-800">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> trong tổng số{' '}
              <span className="font-bold text-slate-800">{filteredOrders.length}</span> đơn hàng
            </p>
            <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Trước
              </Button>
              <div className="flex items-center justify-center sm:hidden text-xs font-bold text-slate-700">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
