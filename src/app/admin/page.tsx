'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import {
  ShieldAlert,
  Users,
  ShoppingBag,
  Settings,
  WalletCards,
  Clock3,
  ArrowRight,
  PackageSearch,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { Order, ORDER_STATUS_MAP } from '@/types/order';
import { formatVND } from '@/utils/format';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [serviceCount, setServiceCount] = useState(0);

  useEffect(() => {
    const refreshOrders = () => setOrders(orderService.getAllOrders());
    const refreshServices = () => setServiceCount(productService.getAll().length);
    orderService.refreshAllOrders().catch(console.error);
    refreshServices();
    const unsubscribeOrders = orderService.subscribe(refreshOrders);
    const unsubscribeServices = productService.subscribe(refreshServices);
    return () => {
      unsubscribeOrders();
      unsubscribeServices();
    };
  }, []);

  const stats = useMemo(() => {
    const verifiedRevenue = orders
      .filter((order) => ['verified', 'refunded'].includes(order.paymentStatus))
      .reduce((total, order) => total + (order.paymentStatus === 'refunded' ? 0 : order.totalAmount), 0);
    const needsAttention = orders.filter((order) =>
      ['awaiting_payment_verification', 'payment_issue', 'need_more_information'].includes(order.orderStatus)
    ).length;
    const uniqueCustomers = new Set(orders.map((order) => order.userId)).size;
    return { verifiedRevenue, needsAttention, uniqueCustomers };
  }, [orders]);

  return (
    <div className="space-y-7 max-w-6xl">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-purple-900 space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-purple-800">
          <ShieldAlert className="w-4 h-4 text-purple-600" /> KÊNH QUẢN TRỊ DỊCH VỤ SỐ 24H — DỮ LIỆU DEMO
        </div>
        <p className="text-purple-700">
          Route Guard phía trình duyệt chỉ phục vụ bản giao diện. Khi kết nối Supabase, quyền admin và RLS phải được kiểm tra ở máy chủ/cơ sở dữ liệu.
        </p>
      </div>

      <div className="bg-gradient-to-r from-[#0d3f6e] to-[#0f4c81] text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-400 text-[#0d3f6e] flex items-center justify-center text-xl font-black shadow-inner">
            AD
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                {user?.fullName || 'Quản trị viên'}
              </h1>
              <Badge variant="warning">ADMIN</Badge>
            </div>
            <p className="text-xs text-cyan-100/80 mt-0.5">
              {user?.username} · {user?.phone}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 text-center">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-2xl font-black">{orders.length}</div>
            <div className="text-[10px] text-cyan-100 mt-0.5">Tổng đơn hàng</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-2xl font-black text-emerald-300">{formatVND(stats.verifiedRevenue)}</div>
            <div className="text-[10px] text-cyan-100 mt-0.5">Doanh thu đã xác nhận</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-2xl font-black text-amber-300">{stats.needsAttention}</div>
            <div className="text-[10px] text-cyan-100 mt-0.5">Đơn cần chú ý</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-2xl font-black text-cyan-300">{serviceCount}</div>
            <div className="text-[10px] text-cyan-100 mt-0.5">Dịch vụ trong hệ thống</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/don-hang', icon: ShoppingBag, title: 'Đơn hàng', note: `${stats.needsAttention} đơn cần xử lý` },
          { href: '/admin/thanh-toan', icon: WalletCards, title: 'Thanh toán', note: 'Đối soát theo mã đơn' },
          { href: '/admin/dich-vu', icon: PackageSearch, title: 'Dịch vụ', note: `${serviceCount} dịch vụ` },
          { href: '/admin/cai-dat', icon: Settings, title: 'Cài đặt', note: 'Cấu hình website' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-[#0f4c81]/40 hover:shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm mt-3">{item.title}</h3>
            <p className="text-xs text-slate-500 mt-1">{item.note}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Đơn hàng gần đây</h2>
            <p className="text-xs text-slate-500">Dữ liệu lấy từ cùng orderService với trang khách hàng.</p>
          </div>
          <Link href="/admin/don-hang" className="text-xs font-semibold text-[#0f4c81] hover:underline">Xem tất cả</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {orders.slice(0, 6).map((order) => (
            <Link key={order.id} href={`/admin/don-hang/${encodeURIComponent(order.orderCode)}`} className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">{order.serviceThumbnailEmoji}</div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{order.orderCode} · {order.serviceName}</p>
                <p className="text-[11px] text-slate-500">{order.userName} · {formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold text-slate-900">{formatVND(order.totalAmount)}</p>
                <Badge variant={ORDER_STATUS_MAP[order.orderStatus].badgeVariant} size="sm">
                  {ORDER_STATUS_MAP[order.orderStatus].label}
                </Badge>
              </div>
            </Link>
          ))}
          {orders.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              <Clock3 className="w-8 h-8 mx-auto mb-2 text-slate-300" /> Chưa có đơn hàng.
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 flex items-center gap-1">
        <Users className="w-3.5 h-3.5" /> {stats.uniqueCustomers} khách hàng có đơn trong dữ liệu demo hiện tại.
      </p>
    </div>
  );
}
