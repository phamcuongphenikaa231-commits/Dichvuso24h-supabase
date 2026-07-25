'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, AlertCircle, Copy, Check, MessageSquare, CreditCard, ShieldCheck } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, DELIVERY_CHANNEL_LABELS } from '@/types/order';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatVND } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';
import { maskDeliveryValue } from '@/utils/privacy';

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const decodedId = decodeURIComponent(orderId);

  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => { setOrder(undefined); }, 0);
      return () => clearTimeout(timer);
    }
    let mounted = true;
    const refreshFromCache = () => {
      if (mounted) setOrder(orderService.getOrderForUser(decodedId, user.id));
    };
    orderService.refreshOrderForUser(decodedId, user.id).then((value) => {
      if (mounted) setOrder(value);
    }).catch(console.error);
    const unsubscribe = orderService.subscribe(refreshFromCache);
    return () => { mounted = false; unsubscribe(); };
  }, [decodedId, user]);

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-slate-500">Mã đơn hàng &quot;{decodedId}&quot; không tồn tại hoặc đã bị xóa.</p>
        <Button size="sm" onClick={() => router.push('/tai-khoan/don-hang')}>Quay lại lịch sử đơn hàng</Button>
      </div>
    );
  }

  const orderStatusMeta = ORDER_STATUS_MAP[order.orderStatus];
  const paymentStatusMeta = PAYMENT_STATUS_MAP[order.paymentStatus];

  const handleCopy = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="shrink-0 p-2 h-9 w-9" onClick={() => router.push('/tai-khoan/don-hang')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
              {order.orderCode}
            </h1>
            <button onClick={handleCopy} className="text-slate-400 hover:text-[#0f4c81] transition-colors">
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ngày tạo: {new Date(order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Customer Reported Paid Warning Banner */}
      {order.paymentStatus === 'customer_reported' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3 text-amber-900 shadow-xs">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">Bạn đã báo chuyển khoản</h4>
            <p className="text-xs leading-relaxed text-amber-800">
              Hệ thống đã ghi nhận thông báo của bạn. Đơn hàng đang chờ admin kiểm tra và đối soát tiền vào tài khoản ngân hàng. Dịch vụ sẽ được xử lý ngay sau khi xác nhận.
            </p>
          </div>
        </div>
      )}

      {/* Unpaid Warning & Pay Button */}
      {['unpaid', 'rejected'].includes(order.paymentStatus) && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-blue-900 shadow-xs">
          <div className="space-y-1">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0f4c81]" /> Đơn hàng chưa thanh toán
            </h4>
            <p className="text-xs text-slate-700">
              Vui lòng chuyển khoản đúng số tiền <strong>{formatVND(order.totalAmount)}</strong> và giữ nguyên nội dung chuyển khoản <strong>{order.paymentContent}</strong>.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="font-bold shrink-0"
            onClick={() => router.push(`/thanh-toan/${order.orderCode}`)}
          >
            <CreditCard className="w-4 h-4 mr-1.5" /> Thanh toán ngay
          </Button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column — Timeline & Public Notes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status & Badges Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-slate-400 block">Trạng thái đơn hàng</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={orderStatusMeta.badgeVariant}>{orderStatusMeta.label}</Badge>
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Trạng thái thanh toán</span>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={paymentStatusMeta.badgeVariant}>{paymentStatusMeta.label}</Badge>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              {orderStatusMeta.description}
            </p>
          </div>

          {/* Timeline History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0f4c81]" /> Lịch sử xử lý đơn hàng
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-4 before:h-full before:w-0.5 before:bg-slate-200">
                {order.statusHistory.map((hist, idx) => (
                  <div key={hist.id || idx} className="relative flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 z-10 ${
                      hist.actorType === 'admin' ? 'bg-[#0f4c81]' : hist.actorType === 'customer' ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}>
                      {hist.actorType === 'admin' ? 'A' : hist.actorType === 'customer' ? 'K' : 'S'}
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex-1 space-y-1">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-bold text-xs text-slate-900">{hist.action}</span>
                        <time className="text-[11px] text-slate-400">{new Date(hist.createdAt).toLocaleString('vi-VN')}</time>
                      </div>
                      {hist.note && <p className="text-xs text-slate-600">{hist.note}</p>}
                      <p className="text-[11px] text-slate-400">Thực hiện bởi: {hist.actorName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Public Admin Note (if any) */}
          {order.publicNote && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-5 space-y-2 text-xs">
              <h4 className="font-bold text-[#0f4c81] flex items-center gap-1.5 text-sm">
                <MessageSquare className="w-4 h-4" /> Thông báo từ Admin
              </h4>
              <p className="text-slate-800 leading-relaxed font-medium bg-white p-3 rounded-xl border border-blue-100">
                {order.publicNote}
              </p>
            </div>
          )}
        </div>

        {/* Right Column — Service Details & Actions */}
        <div className="space-y-6">
          
          {/* Service Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-bold text-slate-900 text-sm">Thông tin dịch vụ</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex gap-3 items-center">
                <div className={`w-12 h-12 rounded-xl ${order.serviceThumbnailBg} flex items-center justify-center text-2xl shrink-0 border border-slate-200/60`}>
                  {order.serviceThumbnailEmoji}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm line-clamp-2">{order.serviceName}</p>
                  <p className="text-slate-400 mt-0.5">{order.serviceCategory}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã đơn:</span>
                  <span className="font-mono font-bold text-slate-900">{order.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đơn giá:</span>
                  <span className="font-semibold text-slate-800">{formatVND(order.unitPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số lượng:</span>
                  <span className="font-semibold text-slate-800">{order.quantity} {order.unit}</span>
                </div>

                {/* Target link / input */}
                {order.customerInput.link && (
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-500">Đường dẫn Link:</span>
                    <span className="bg-slate-50 p-2 rounded-lg font-mono text-[11px] text-slate-800 break-all border border-slate-200">
                      {order.customerInput.link}
                    </span>
                  </div>
                )}

                {order.customerInput.configNote && (
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-500">Thông tin cấu hình:</span>
                    <span className="bg-slate-50 p-2 rounded-lg text-slate-800 border border-slate-200">
                      {order.customerInput.configNote}
                    </span>
                  </div>
                )}

                {order.customerInput.note && (
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-500">Ghi chú của bạn:</span>
                    <span className="bg-slate-50 p-2 rounded-lg text-slate-700 italic border border-slate-200">
                      {order.customerInput.note}
                    </span>
                  </div>
                )}

                {order.customerInput.extraFields && Object.entries(order.customerInput.extraFields).map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-500">{label}:</span>
                    <span className="bg-slate-50 p-2 rounded-lg text-slate-800 break-all border border-slate-200">
                      {value}
                    </span>
                  </div>
                ))}

                {/* Delivery Channel */}
                {order.deliveryChannel && order.deliveryValue && (
                  <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
                    <span className="text-slate-500 font-medium">Nhận kết quả qua {DELIVERY_CHANNEL_LABELS[order.deliveryChannel]}:</span>
                    <span className="font-bold text-[#0f4c81] bg-[#f0f7ff] px-2.5 py-1 rounded-lg border border-[#0f4c81]/20">
                      {maskDeliveryValue(order.deliveryChannel, order.deliveryValue)}
                    </span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-xl font-black text-[#0f4c81]">{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action Links */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <Link href="/tai-khoan/ho-tro">
              <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Liên hệ hỗ trợ đơn này
              </Button>
            </Link>
            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Dịch Vụ Số 24H Bảo hành 100%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
