'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle, AlertCircle, ArrowRight, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MOCK_NOTIFICATIONS } from '@/data/mockCustomerAccount';
import { orderService } from '@/services/orderService';
import { Order, ORDER_STATUS_MAP } from '@/types/order';
import { formatVND } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AccountDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

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

  if (!user) return null;

  const totalOrders = orders.length;
  const processingOrders = orders.filter((order) => order.orderStatus === 'processing').length;
  const completedOrders = orders.filter((order) => order.orderStatus === 'completed').length;
  const needSupportOrders = orders.filter((order) =>
    ['need_more_information', 'payment_issue'].includes(order.orderStatus)
  ).length;

  const recentOrders = orders.slice(0, 3);
  const unreadNotifications = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan tài khoản</h1>
          <p className="text-gray-500 mt-1">Xin chào, <span className="font-semibold text-gray-900">{user.username}</span>!</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Package className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Tổng số đơn</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-2">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Đang xử lý</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{processingOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-2">
            <CheckCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Hoàn thành</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{completedOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mb-2">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Cần hỗ trợ</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{needSupportOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
            <Link href="/tai-khoan/don-hang" className="text-sm font-medium text-brand-primary hover:underline flex items-center">
              Xem tất cả <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => {
              const statusMeta = ORDER_STATUS_MAP[order.orderStatus];
              return (
                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 shrink-0 rounded-lg ${order.serviceThumbnailBg} flex items-center justify-center text-2xl`}>
                      {order.serviceThumbnailEmoji}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 line-clamp-1">{order.serviceName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{order.orderCode}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <div className="mt-2 sm:hidden">
                        <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-2">
                    <div className="hidden sm:block">
                      <Badge variant={statusMeta.badgeVariant}>{statusMeta.label}</Badge>
                    </div>
                    <p className="font-bold text-brand-primary">
                      {formatVND(order.totalAmount)}
                    </p>
                    <Button variant="outline" size="sm" className="sm:mt-2" onClick={() => router.push(`/tai-khoan/don-hang/${order.orderCode}`)}>
                      Chi tiết
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center">
              Thông báo
              {unreadNotifications > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {unreadNotifications} mới
                </span>
              )}
            </h2>
          </div>
          <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px]">
            {MOCK_NOTIFICATIONS.map((notif) => (
              <div key={notif.id} className={`p-4 ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${
                    notif.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    notif.type === 'system' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-sm ${notif.read ? 'font-medium text-gray-700' : 'font-semibold text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notif.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
