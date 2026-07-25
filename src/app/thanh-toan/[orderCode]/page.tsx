'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Copy,
  Check,
  AlertTriangle,
  ArrowLeft,
  ShoppingBag,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Clock,
  Info,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { orderService } from '@/services/orderService';
import { paymentQrService } from '@/services/paymentQrService';
import { PAYMENT_STATUS_MAP, ORDER_STATUS_MAP, DELIVERY_CHANNEL_LABELS, Order } from '@/types/order';
import { useAuth } from '@/context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast(`Đã sao chép ${label}`, text, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Không thể sao chép', 'Vui lòng sao chép thủ công.', 'error');
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-brand-primary hover:text-brand-primary/80 font-medium transition-colors shrink-0"
      title={`Sao chép ${label}`}
    >
      {copied ? (
        <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Đã chép</span></>
      ) : (
        <><Copy className="w-3.5 h-3.5" /><span>Sao chép</span></>
      )}
    </button>
  );
}

function QrSection({ order }: { order: Order }) {
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);
  const [qrKey, setQrKey] = useState(0);

  const qrResult = paymentQrService.generateQrUrl({
    amount: order.totalAmount,
    orderCode: order.orderCode,
  });

  const bankInfo = paymentQrService.getBankInfo();

  const handleRetry = () => {
    setQrError(false);
    setQrLoading(true);
    setQrKey((k) => k + 1);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 text-base">QR Thanh toán</h2>
        <p className="text-xs text-gray-500 mt-0.5">Quét bằng ứng dụng ngân hàng bất kỳ</p>
      </div>

      {/* QR Image */}
      <div className="p-6 flex flex-col items-center">
        <div className="relative w-52 h-52 sm:w-60 sm:h-60">
          {qrLoading && !qrError && (
            <div className="absolute inset-0 bg-gray-50 rounded-xl flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
              <p className="text-xs text-gray-500 mt-2">Đang tải QR...</p>
            </div>
          )}
          {qrError && (
            <div className="absolute inset-0 bg-red-50 rounded-xl flex flex-col items-center justify-center gap-3 p-4 text-center">
              <WifiOff className="w-8 h-8 text-red-400" />
              <p className="text-xs text-red-600">Không tải được QR. Vui lòng chuyển khoản thủ công.</p>
              <button
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 text-xs text-brand-primary font-medium hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Thử lại
              </button>
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={qrKey}
            src={qrResult.url}
            alt={`QR thanh toán đơn ${order.orderCode}`}
            className={`w-full h-full rounded-xl object-contain border border-gray-200 ${qrLoading || qrError ? 'opacity-0 pointer-events-none' : ''}`}
            onLoad={() => setQrLoading(false)}
            onError={() => { setQrLoading(false); setQrError(true); }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center">
          QR này chứa đúng số tiền và nội dung của đơn hàng này
        </p>
      </div>

      {/* Bank Info */}
      <div className="px-5 pb-5 space-y-3">
        <div className="bg-blue-50 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Ngân hàng</span>
            <span className="font-semibold text-gray-900">{bankInfo.bankName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Chủ tài khoản</span>
            <span className="font-semibold text-gray-900">{bankInfo.accountName}</span>
          </div>
          <div className="flex justify-between items-center border-t border-blue-100 pt-3">
            <span className="text-gray-500 text-xs">Số tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-gray-900">{bankInfo.accountNumber}</span>
              <CopyButton text={bankInfo.accountNumber} label="số tài khoản" />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-xs">Số tiền</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-red-600 text-base">{formatVND(order.totalAmount)}</span>
              <CopyButton text={String(order.totalAmount)} label="số tiền" />
            </div>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 text-xs shrink-0 mt-0.5">Nội dung CK</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-bold text-red-600 text-right break-all">{order.paymentContent}</span>
              <CopyButton text={order.paymentContent} label="nội dung chuyển khoản" />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 leading-relaxed">
            Vui lòng chuyển <strong>đúng số tiền</strong> và giữ nguyên <strong>nội dung chuyển khoản</strong> để admin có thể đối soát đơn hàng.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmTransferDialog({
  onConfirm,
  onCancel,
  loading,
  orderCode,
  amount,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
  orderCode: string;
  amount: number;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-amber-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg">Xác nhận đã chuyển khoản?</h3>
          <p className="text-sm text-gray-600">
            Bạn xác nhận đã chuyển{' '}
            <strong className="text-red-600">{formatVND(amount)}</strong> với nội dung{' '}
            <strong className="font-mono text-red-600">{orderCode}</strong> cho đơn hàng này?
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          ⚠️ Hệ thống chỉ ghi nhận thông báo của bạn. Đơn sẽ được xử lý sau khi admin xác nhận tiền đã vào tài khoản.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Kiểm tra lại
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang xử lý...</>
            ) : (
              'Xác nhận đã chuyển khoản'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentPage({ params }: { params: Promise<{ orderCode: string }> }) {
  const { orderCode } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [order, setOrder] = useState<Order | null | undefined>(undefined); // undefined = loading
  const [showConfirm, setShowConfirm] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);

  // Load đơn từ Supabase và đồng bộ cache service
  const loadOrder = useCallback(async () => {
    if (isAuthLoading) return;
    if (!user) {
      setOrder(undefined);
      router.replace(`/dang-nhap?redirect=${encodeURIComponent(`/thanh-toan/${orderCode}`)}`);
      return;
    }
    try {
      const found = await orderService.refreshOrderForUser(orderCode, user.id);
      setOrder(found ?? null);
      setAlreadyReported(found?.paymentStatus === 'customer_reported');
    } catch (error) {
      console.error(error);
      setOrder(null);
    }
  }, [isAuthLoading, orderCode, router, user]);

  useEffect(() => {
    const timer = setTimeout(() => { void loadOrder(); }, 0);
    const unsubscribe = orderService.subscribe(() => {
      if (!user) return;
      const found = orderService.getOrderForUser(orderCode, user.id);
      setOrder(found ?? null);
      setAlreadyReported(found?.paymentStatus === 'customer_reported');
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [loadOrder, orderCode, user]);

  // Khách nhấn "Tôi đã chuyển khoản"
  const handleReportTransfer = async () => {
    if (!order || reporting || alreadyReported) return;
    setReporting(true);

    if (!user) {
      setReporting(false);
      router.replace(`/dang-nhap?redirect=${encodeURIComponent(`/thanh-toan/${order.orderCode}`)}`);
      return;
    }

    const result = await orderService.customerReportPaid(order.orderCode);

    if (result.success) {
      setAlreadyReported(true);
      setShowConfirm(false);
      showToast(
        'Đã ghi nhận thông báo',
        'Hệ thống đã ghi nhận. Đơn hàng sẽ được xử lý sau khi admin xác nhận tiền đã vào tài khoản.',
        'success'
      );
      // Chờ 1.5s rồi chuyển trang
      setTimeout(() => {
        router.push(`/tai-khoan/don-hang/${order.orderCode}`);
      }, 1500);
    } else {
      setReporting(false);
      showToast('Không thể thực hiện', result.message, 'error');
    }
  };

  // Loading state
  if (order === undefined) {
    return (
      <div className="container-custom py-16 max-w-2xl mx-auto text-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-primary mx-auto" />
        <p className="text-gray-500 mt-4 text-sm">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  // Đơn không tồn tại
  if (order === null) {
    return (
      <div className="container-custom py-16 max-w-2xl mx-auto text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy đơn hàng</h1>
        <p className="text-gray-500">
          Mã đơn <code className="font-mono bg-gray-100 px-2 py-0.5 rounded">{orderCode}</code> không tồn tại hoặc đã hết hạn.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
          </Button>
          <Link href="/tai-khoan/don-hang">
            <Button variant="primary">
              <ShoppingBag className="w-4 h-4 mr-2" /> Xem lịch sử đơn
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const paymentStatusMeta = PAYMENT_STATUS_MAP[order.paymentStatus];
  const orderStatusMeta = ORDER_STATUS_MAP[order.orderStatus];
  const isPending = ['unpaid', 'rejected'].includes(order.paymentStatus);
  const isRetryPayment = order.paymentStatus === 'rejected';
  const isReported = order.paymentStatus === 'customer_reported';

  return (
    <>
      {showConfirm && (
        <ConfirmTransferDialog
          onConfirm={handleReportTransfer}
          onCancel={() => setShowConfirm(false)}
          loading={reporting}
          orderCode={order.paymentContent}
          amount={order.totalAmount}
        />
      )}

      <div className="container-custom py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 p-2 h-9 w-9"
            onClick={() => router.push('/tai-khoan/don-hang')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Mã đơn: <span className="font-mono font-bold text-brand-primary">{order.orderCode}</span>
            </p>
          </div>
        </div>

        {/* Status Banner */}
        {isReported && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-800 text-sm">Bạn đã báo chuyển khoản</p>
              <p className="text-blue-700 text-xs mt-0.5">
                Hệ thống đã ghi nhận thông báo của bạn. Đơn hàng sẽ được xử lý sau khi admin xác nhận tiền đã vào tài khoản.
              </p>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Order Info */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-bold text-gray-900 text-base">Thông tin đơn hàng</h2>
                <div className="flex gap-2 flex-wrap justify-end">
                  <Badge variant={paymentStatusMeta.badgeVariant}>
                    {paymentStatusMeta.label}
                  </Badge>
                  <Badge variant={orderStatusMeta.badgeVariant}>
                    {orderStatusMeta.label}
                  </Badge>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {/* Service */}
                <div className="flex gap-3 items-center">
                  <div className={`w-12 h-12 rounded-xl ${order.serviceThumbnailBg} flex items-center justify-center text-2xl shrink-0`}>
                    {order.serviceThumbnailEmoji}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{order.serviceName}</p>
                    <p className="text-xs text-gray-500">{order.serviceCategory}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                {/* Order Details */}
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Mã đơn hàng</span>
                    <span className="font-mono font-bold text-brand-primary">{order.orderCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Số lượng</span>
                    <span className="font-medium">{order.quantity} {order.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Đơn giá</span>
                    <span className="font-medium">{formatVND(order.unitPrice)}</span>
                  </div>
                  {order.deliveryChannel && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nhận kết quả qua</span>
                      <span className="font-medium">{DELIVERY_CHANNEL_LABELS[order.deliveryChannel]}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Ngày tạo</span>
                    <span className="text-gray-700">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Tổng thanh toán</span>
                    <span className="text-xl font-black text-brand-primary">{formatVND(order.totalAmount)}</span>
                  </div>
                </div>

                {/* Customer Input */}
                {(order.customerInput.link || order.customerInput.note || order.customerInput.configNote || (order.customerInput.extraFields && Object.keys(order.customerInput.extraFields).length > 0)) && (
                  <>
                    <div className="h-px bg-gray-100" />
                    <div className="space-y-2 text-sm">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Thông tin bạn cung cấp</p>
                      {order.customerInput.link && (
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500 shrink-0">Link</span>
                          <span className="text-gray-800 text-right break-all font-mono text-xs">{order.customerInput.link}</span>
                        </div>
                      )}
                      {order.customerInput.configNote && (
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500 shrink-0">Yêu cầu</span>
                          <span className="text-gray-800 text-right break-all">{order.customerInput.configNote}</span>
                        </div>
                      )}
                      {order.customerInput.note && (
                        <div className="flex justify-between gap-2">
                          <span className="text-gray-500 shrink-0">Ghi chú</span>
                          <span className="text-gray-800 text-right">{order.customerInput.note}</span>
                        </div>
                      )}

                      {order.customerInput.extraFields && Object.entries(order.customerInput.extraFields).map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-2">
                          <span className="text-gray-500 shrink-0">{label}</span>
                          <span className="text-gray-800 text-right break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isPending && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setShowConfirm(true)}
                  disabled={reporting}
                >
                  {reporting ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Đang xử lý...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5 mr-2" />{isRetryPayment ? 'Tôi đã chuyển khoản lại' : 'Tôi đã chuyển khoản'}</>
                  )}
                </Button>
              )}

              {isReported && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-center">
                  <Clock className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-800">
                    Đơn đang chờ admin xác nhận. Admin sẽ cập nhật trạng thái sau khi kiểm tra giao dịch.
                  </p>
                </div>
              )}

              <Link href="/tai-khoan/don-hang">
                <Button variant="outline" size="lg" className="w-full">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Xem lịch sử mua hàng
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: QR */}
          <div className="lg:col-span-2">
            <QrSection order={order} />
          </div>
        </div>
      </div>
    </>
  );
}
