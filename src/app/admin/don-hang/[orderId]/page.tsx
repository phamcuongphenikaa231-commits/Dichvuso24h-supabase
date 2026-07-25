'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  Package,
  CreditCard,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  CheckCircle2,
  X,
  RefreshCw,
  AlertTriangle,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { orderService } from '@/services/orderService';
import {
  Order,
  OrderStatus,
  ORDER_STATUS_MAP,
  PAYMENT_STATUS_MAP,
  DELIVERY_CHANNEL_LABELS,
} from '@/types/order';
import { formatVND } from '@/utils/format';
import { useAuth } from '@/context/AuthContext';

function formatDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
      <span className="text-[#0f4c81]">{icon}</span>
      <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const InfoRow = ({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) => (
  <div className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0 text-xs">
    <span className="text-slate-500 shrink-0">{label}</span>
    <span className={`font-medium text-slate-800 text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

export default function AdminOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { user: adminUser } = useAuth();
  const decodedId = decodeURIComponent(orderId);

  const initialOrder =
    orderService.getOrderByCode(decodedId) ||
    orderService.getAllOrders().find((item) => item.id === decodedId);
  const [order, setOrder] = useState<Order | undefined>(initialOrder);
  const [loadingOrder, setLoadingOrder] = useState(!initialOrder);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isPublicNote, setIsPublicNote] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchOrder = async () => {
      try {
        const found = await orderService.refreshOrder(decodedId);
        if (active) setOrder(found);
      } finally {
        if (active) setLoadingOrder(false);
      }
    };
    const refreshFromCache = () => {
      const found =
        orderService.getOrderByCode(decodedId) ||
        orderService.getAllOrders().find((item) => item.id === decodedId);
      if (active) setOrder(found);
    };

    void fetchOrder();
    const unsub = orderService.subscribe(refreshFromCache);
    return () => {
      active = false;
      unsub();
    };
  }, [decodedId]);

  if (loadingOrder) {
    return <div className="py-16 text-center text-sm text-slate-500">Đang tải đơn hàng từ Supabase...</div>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-slate-500">Mã đơn hàng &quot;{decodedId}&quot; không tồn tại.</p>
        <Button size="sm" onClick={() => router.push('/admin/don-hang')}>Quay lại danh sách đơn</Button>
      </div>
    );
  }

  const orderStatusMeta = ORDER_STATUS_MAP[order.orderStatus];
  const paymentStatusMeta = PAYMENT_STATUS_MAP[order.paymentStatus];
  const allowedNextStatuses = orderStatusMeta?.allowedNext || [];
  const adminId = adminUser?.id || 'unknown-admin';
  const adminName = adminUser?.fullName || adminUser?.username || 'Quản trị viên';
  const canConfirmPayment =
    ['customer_reported', 'rejected'].includes(order.paymentStatus) &&
    ['awaiting_payment_verification', 'payment_issue'].includes(order.orderStatus);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(order.orderCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(order.paymentContent);
    setCopiedContent(true);
    setTimeout(() => setCopiedContent(false), 2000);
  };

  // Admin confirm payment
  const handleConfirmPayment = async () => {
    if (!confirm(`Xác nhận đã nhận đủ ${formatVND(order.totalAmount)} cho đơn hàng ${order.orderCode}?`)) return;

    const res = await orderService.adminConfirmPayment(order.orderCode);
    if (res.success) {
      showToast('Thành công', res.message, 'success');
    } else {
      showToast('Lỗi', res.message, 'error');
    }
  };

  // Admin change order status
  const handleUpdateStatus = async (newStatus: OrderStatus, actionName: string) => {
    const targetMeta = ORDER_STATUS_MAP[newStatus];
    if (targetMeta?.requireConfirm) {
      if (!confirm(`Bạn có chắc muốn chuyển đơn ${order.orderCode} sang trạng thái "${targetMeta.label}"?`)) return;
    }

    const res = await orderService.adminUpdateOrderStatus(
      order.orderCode,
      newStatus,
      adminId,
      adminName,
      actionName
    );

    if (res.success) {
      showToast('Thành công', `Đã chuyển đơn sang: ${targetMeta?.label}`, 'success');
    } else {
      showToast('Lỗi', res.message, 'error');
    }
  };

  const handlePaymentIssue = async () => {
    if (!confirm(`Đánh dấu thanh toán của đơn ${order.orderCode} là có vấn đề?`)) return;
    const res = await orderService.adminMarkPaymentIssue(
      order.orderCode,
      'Admin chưa xác minh được giao dịch. Vui lòng kiểm tra lại số tiền và nội dung chuyển khoản.'
    );
    showToast(res.success ? 'Đã cập nhật' : 'Lỗi', res.message, res.success ? 'success' : 'error');
  };

  // Add note
  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    const res = await orderService.adminAddNote(order.orderCode, noteContent.trim(), isPublicNote);
    if (!res.success) {
      showToast('Lỗi', res.message, 'error');
      return;
    }
    setNoteContent('');
    showToast(
      'Đã lưu ghi chú',
      isPublicNote ? 'Ghi chú công khai đã gửi tới khách hàng' : 'Ghi chú nội bộ đã được lưu',
      'success'
    );
  };


  const handleDeleteOrder = async () => {
    const reason = window.prompt('Nhập lý do xóa đơn hàng (không bắt buộc):', '') ?? '';
    if (!window.confirm(`Xóa vĩnh viễn đơn ${order.orderCode}? Thao tác này không thể hoàn tác.`)) return;

    const res = await orderService.adminDeleteOrder(order.orderCode, reason.trim() || undefined);
    if (!res.success) {
      showToast('Không thể xóa đơn', res.message, 'error');
      return;
    }

    showToast('Đã xóa đơn hàng', res.message, 'success');
    router.push('/admin/don-hang');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => router.push('/admin/don-hang')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-slate-900 font-mono">{order.orderCode}</h1>
              <button onClick={handleCopyCode} className="text-slate-400 hover:text-[#0f4c81]">
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
              <Badge variant={orderStatusMeta?.badgeVariant || 'secondary'}>{orderStatusMeta?.label}</Badge>
              <Badge variant={paymentStatusMeta?.badgeVariant || 'secondary'}>{paymentStatusMeta?.label}</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ID nội bộ: <span className="font-mono text-slate-700">{order.id}</span> · Tạo lúc {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canConfirmPayment && (
            <Button variant="primary" size="sm" className="font-bold" onClick={handleConfirmPayment}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Xác nhận đã nhận tiền
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="font-semibold text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDeleteOrder}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Xóa đơn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <SectionCard title="Thông tin dịch vụ & Đơn hàng" icon={<Package className="w-5 h-5" />}>
            <div className="flex gap-4 items-start border-b border-slate-100 pb-4">
              <div className={`w-14 h-14 rounded-2xl ${order.serviceThumbnailBg} flex items-center justify-center text-3xl shrink-0 border border-slate-200/50`}>
                {order.serviceThumbnailEmoji}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-slate-900 text-base">{order.serviceName}</p>
                <p className="text-xs text-slate-500">Danh mục: {order.serviceCategory}</p>
                <div className="flex flex-wrap gap-4 pt-1 text-xs">
                  <span>Số lượng: <strong>{order.quantity} {order.unit}</strong></span>
                  <span>Đơn giá: <strong>{formatVND(order.unitPrice)}</strong></span>
                  <span className="text-[#0f4c81] font-black">Tổng tiền: {formatVND(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Customer Provided Input */}
            <div className="pt-4 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Dữ liệu khách hàng nhập:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {order.customerInput.link && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Đường dẫn Link:</span>
                    <a href={order.customerInput.link} target="_blank" rel="noreferrer" className="font-mono text-[#0f4c81] font-medium break-all hover:underline">
                      {order.customerInput.link}
                    </a>
                  </div>
                )}
                {order.customerInput.configNote && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Cấu hình / Yêu cầu:</span>
                    <span className="font-medium text-slate-800">{order.customerInput.configNote}</span>
                  </div>
                )}
                {order.customerInput.note && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-0.5">Ghi chú của khách:</span>
                    <span className="italic text-slate-700">{order.customerInput.note}</span>
                  </div>
                )}

                {order.customerInput.extraFields && Object.entries(order.customerInput.extraFields).map(([label, value]) => (
                  <div key={label} className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px] mb-0.5">{label}:</span>
                    <span className="font-medium text-slate-800 break-all">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            {order.deliveryChannel && order.deliveryValue && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Kênh bàn giao kết quả:</h4>
                <div className="bg-[#f0f7ff] border border-[#0f4c81]/20 rounded-xl p-3 text-xs flex justify-between items-center">
                  <div>
                    <span className="text-[#0f4c81] font-bold">
                      {DELIVERY_CHANNEL_LABELS[order.deliveryChannel]}
                    </span>
                    <p className="font-mono text-slate-800 text-sm font-semibold mt-0.5">{order.deliveryValue}</p>
                  </div>
                  <Badge variant="cyan">Mô phỏng gửi</Badge>
                </div>
              </div>
            )}
          </SectionCard>

          {/* Status History Timeline */}
          <SectionCard title="Timeline lịch sử đơn hàng" icon={<Clock className="w-5 h-5" />}>
            <div className="relative space-y-4">
              {order.statusHistory.map((hist, idx) => (
                <div key={hist.id || idx} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                        hist.actorType === 'admin'
                          ? 'bg-[#0f4c81]'
                          : hist.actorType === 'customer'
                          ? 'bg-emerald-500'
                          : 'bg-slate-300'
                      }`}
                    />
                    {idx < order.statusHistory.length - 1 && <div className="w-0.5 flex-1 bg-slate-100 my-1" />}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex-1 space-y-1">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-bold text-slate-800">{hist.action}</span>
                      <time className="text-[11px] text-slate-400">{formatDate(hist.createdAt)}</time>
                    </div>
                    {hist.note && <p className="text-slate-600">{hist.note}</p>}
                    <p className="text-[11px] text-slate-400">
                      Thực hiện: <strong className="text-slate-700">{hist.actorName}</strong> ({hist.actorType})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Notes Management */}
          <SectionCard title="Ghi chú nội bộ & Khách hàng" icon={<MessageSquare className="w-5 h-5" />}>
            <div className="space-y-4 text-xs">
              {/* Internal & Public Notes Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Ghi chú nội bộ Admin:</span>
                  <p className="text-slate-600 italic">{order.adminNote || 'Chưa có ghi chú nội bộ.'}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 space-y-1">
                  <span className="font-bold text-[#0f4c81] block">Ghi chú gửi khách hàng:</span>
                  <p className="text-slate-800 font-medium">{order.publicNote || 'Chưa có ghi chú công khai.'}</p>
                </div>
              </div>

              {/* Add Note Form */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <textarea
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs resize-none focus:ring-2 focus:ring-[#0f4c81]/20 outline-none"
                  placeholder="Nhập nội dung ghi chú..."
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-[#0f4c81]"
                      checked={isPublicNote}
                      onChange={(e) => setIsPublicNote(e.target.checked)}
                    />
                    <span>Gửi công khai cho khách xem</span>
                  </label>
                  <Button size="sm" onClick={handleAddNote} disabled={!noteContent.trim()}>
                    <Plus className="w-4 h-4 mr-1" /> Lưu ghi chú
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar Controls (1 column) */}
        <div className="space-y-6">
          {/* Status Control Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              Thao tác trạng thái đơn
            </h3>

            <div className="space-y-2">
              {allowedNextStatuses.includes('processing') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                  onClick={() => handleUpdateStatus('processing', 'Chuyển sang Đang xử lý')}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Đang xử lý
                </Button>
              )}

              {allowedNextStatuses.includes('need_more_information') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold text-amber-700 border-amber-200 bg-amber-50/50 hover:bg-amber-100"
                  onClick={() => handleUpdateStatus('need_more_information', 'Yêu cầu bổ sung thông tin')}
                >
                  <FileText className="w-3.5 h-3.5 mr-2" /> Cần bổ sung thông tin
                </Button>
              )}

              {allowedNextStatuses.includes('payment_issue') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold text-orange-700 border-orange-200 bg-orange-50/50 hover:bg-orange-100"
                  onClick={handlePaymentIssue}
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Thanh toán có vấn đề
                </Button>
              )}

              {allowedNextStatuses.includes('completed') && (
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full justify-start text-xs font-bold"
                  onClick={() => handleUpdateStatus('completed', 'Đánh dấu Hoàn thành')}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Hoàn thành
                </Button>
              )}

              {allowedNextStatuses.includes('refunded') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
                  onClick={() => handleUpdateStatus('refunded', 'Đánh dấu Đã hoàn tiền')}
                >
                  <Send className="w-3.5 h-3.5 mr-2" /> Đã hoàn tiền
                </Button>
              )}

              {allowedNextStatuses.includes('cancelled') && (
                <Button
                  variant="danger"
                  size="sm"
                  className="w-full justify-start text-xs font-semibold"
                  onClick={() => handleUpdateStatus('cancelled', 'Hủy đơn hàng')}
                >
                  <X className="w-3.5 h-3.5 mr-2" /> Hủy đơn
                </Button>
              )}

              {allowedNextStatuses.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">Đơn hàng đang ở trạng thái kết thúc.</p>
              )}
            </div>
          </div>

          {/* Payment & Copy Section */}
          <SectionCard title="Chi tiết thanh toán" icon={<CreditCard className="w-5 h-5" />}>
            <div className="space-y-1">
              <InfoRow label="Nội dung CK" value={
                <div className="flex items-center gap-1">
                  <span className="font-mono font-bold text-[#0f4c81]">{order.paymentContent}</span>
                  <button onClick={handleCopyContent} className="text-slate-400 hover:text-slate-700">
                    {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              } />
              <InfoRow label="Tổng tiền" value={<span className="text-base font-black text-[#0f4c81]">{formatVND(order.totalAmount)}</span>} />
              <InfoRow label="TT Thanh toán" value={<Badge variant={paymentStatusMeta?.badgeVariant || 'secondary'}>{paymentStatusMeta?.label}</Badge>} />
              <InfoRow label="Khách báo CK lúc" value={formatDate(order.customerReportedPaidAt || '')} />
              <InfoRow label="Xác nhận lúc" value={formatDate(order.paymentVerifiedAt || '')} />
            </div>
          </SectionCard>

          {/* Customer Info Card */}
          <SectionCard title="Thông tin khách hàng" icon={<User className="w-5 h-5" />}>
            <div className="space-y-1">
              <InfoRow label="Tên tài khoản" value={order.userName} />
              <InfoRow label="User ID" value={order.userId} mono />
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
