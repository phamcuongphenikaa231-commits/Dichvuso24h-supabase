'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Service } from '@/types/service';
import { productService } from '@/services/productService';
import { formatVND } from '@/utils/format';
import { Breadcrumb } from '@/components/services/Breadcrumb';
import { ServiceCard } from '@/components/services/ServiceCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/context/AuthContext';
import {
  Clock,
  Lock,
  Zap,
  MessageCircle,
} from 'lucide-react';

export function ServiceDetailView({ service: initialService }: { service: Service }) {
  const [service, setService] = useState(initialService);
  const router = useRouter();
  const { showToast } = useToast();
  const { user, isLoading: isAuthLoading } = useAuth();
  const categoryMeta = productService.getCategoriesFlat().find((category) => category.slug === service.category);

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [targetInput, setTargetInput] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ targetInput?: string; quantity?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionLockRef = useRef(false);

  const isInteraction = service.purchaseFlowType === 'interaction';
  const minQty = service.minQuantity ?? 1;
  const maxQty = service.maxQuantity ?? (isInteraction ? 100 : 10);
  const unitPrice = service.price;
  const totalPrice = unitPrice * quantity;

  // Chỉ dịch vụ tương tác yêu cầu khách nhập đường dẫn công khai.
  const validateForm = (): boolean => {
    const newErrors: { targetInput?: string; quantity?: string } = {};

    if (isInteraction) {
      if (!targetInput.trim()) {
        newErrors.targetInput = 'Vui lòng nhập link bài viết hoặc link trang cần xử lý.';
      } else {
        try {
          const parsed = new URL(targetInput.trim());
          if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid');
        } catch {
          newErrors.targetInput = 'Đường dẫn phải bắt đầu bằng http:// hoặc https://';
        }
      }
    }

    if (quantity < minQty) {
      newErrors.quantity = `Số lượng tối thiểu là ${minQty}`;
    } else if (quantity > maxQty) {
      newErrors.quantity = `Số lượng tối đa là ${maxQty}`;
    }

    setErrors(newErrors);
    return !newErrors.targetInput && !newErrors.quantity;
  };

  useEffect(() => {
    const refresh = () => {
      const current = productService.getBySlug(initialService.slug);
      if (current) setService(current);
    };
    refresh();
    return productService.subscribe(refresh);
  }, [initialService.slug]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuantity((current) => Math.min(maxQty, Math.max(minQty, current)));
    }, 0);
    return () => clearTimeout(timer);
  }, [minQty, maxQty]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('dv24h_pending_purchase');
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        serviceId?: string;
        quantity?: number;
        targetInput?: string;
        note?: string;
      };
      if (draft.serviceId !== service.id) return;
      if (typeof draft.quantity === 'number') setQuantity(draft.quantity);
      if (typeof draft.targetInput === 'string') setTargetInput(draft.targetInput);
      if (typeof draft.note === 'string') setNote(draft.note);
    } catch {
      sessionStorage.removeItem('dv24h_pending_purchase');
    }
  }, [service.id]);

  // Handle Buy Now button click
  const handleBuyNowClick = () => {
    if (isAuthLoading || isSubmitting || submissionLockRef.current) return;
    if (service.stockStatus !== 'available' || !service.active) {
      showToast('Dịch vụ chưa sẵn sàng', 'Dịch vụ này đang tạm hết hàng hoặc tạm dừng.', 'warning');
      return;
    }
    if (!user) {
      try {
        sessionStorage.setItem(
          'dv24h_pending_purchase',
          JSON.stringify({ serviceId: service.id, quantity, targetInput: isInteraction ? targetInput : '', note: isInteraction ? note : '' })
        );
      } catch {
        // Storage may be unavailable; the login redirect still works.
      }
      showToast('Cần đăng nhập', 'Vui lòng đăng nhập trước khi tạo đơn hàng.', 'info');
      router.push(`/dang-nhap?redirect=${encodeURIComponent(`/dich-vu/${service.slug}`)}`);
      return;
    }
    if (!validateForm()) return;
    void createOrderAndNavigate();
  };

  // Tạo đơn trực tiếp: tài khoản chỉ cần số lượng; tương tác thêm link công khai.
  // Create order via orderService and navigate to checkout page
  const createOrderAndNavigate = async () => {
    if (isSubmitting || submissionLockRef.current) return;
    submissionLockRef.current = true;
    setIsSubmitting(true);

    try {
      const order = await orderService.createOrder({
        userId: user!.id,
        userName: user!.fullName || user!.username,
        serviceId: service.id,
        serviceSlug: service.slug,
        serviceName: service.name,
        serviceCategory: service.category,
        serviceThumbnailEmoji: service.thumbnail.emoji,
        serviceThumbnailBg: service.thumbnail.bg,
        purchaseFlowType: service.purchaseFlowType || 'delivery_required',
        quantity,
        unit: service.unit,
        unitPrice: service.price,
        customerInput: {
          link: isInteraction ? targetInput.trim() : undefined,
          quantity,
          note: isInteraction && note.trim() ? note.trim() : undefined,
        },
        deliveryChannel: null,
        deliveryValue: null,
      });

      try {
        sessionStorage.removeItem('dv24h_pending_purchase');
      } catch {}
      showToast('Đã tạo đơn hàng!', `Mã đơn: ${order.orderCode}`, 'success');
      router.push(`/thanh-toan/${order.orderCode}`);
    } catch (error) {
      submissionLockRef.current = false;
      const message = error instanceof Error ? error.message : 'Không thể khởi tạo đơn hàng. Vui lòng thử lại.';
      showToast('Không thể tạo đơn', message, 'error');
      setIsSubmitting(false);
    }
  };

  // Related services
  const relatedServices = productService.getActive().filter(
    (s) => s.category === service.category && s.id !== service.id && s.active
  ).slice(0, 3);

  return (
    <div className="container-custom py-8 space-y-8">
      {/* 1. Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dịch vụ', href: '/dich-vu' },
          { label: categoryMeta?.name || service.category, href: categoryMeta?.href || '/dich-vu' },
          { label: service.name },
        ]}
      />

      {/* 2. Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image & Quick Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-xs relative">
            {service.thumbnailUrl ? (
              <div className="w-28 h-28 rounded-3xl overflow-hidden border border-slate-200 shadow-inner bg-slate-50">
                <img src={service.thumbnailUrl} alt={service.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div
                className={`w-28 h-28 rounded-3xl ${service.thumbnail.bg} flex items-center justify-center text-6xl shadow-inner border border-slate-200/60`}
              >
                {service.thumbnail.emoji}
              </div>
            )}

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#0f4c81] uppercase tracking-wider">
                {categoryMeta?.name}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {service.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <StatusBadge status={service.stockStatus} />
              {service.featured && <Badge variant="cyan">Khuyên dùng</Badge>}
              <Badge variant="outline">{service.unit}</Badge>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
              Thông số dịch vụ
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Thời gian xử lý:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> {service.processingTime}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Đã phục vụ:</span>
              <span className="font-semibold text-slate-800">{service.soldCount}+ lượt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Phương thức nhận:</span>
              <span className="font-semibold text-slate-800">
                {isInteraction ? 'Xử lý theo link đã nhập' : 'Xử lý theo đơn hàng'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Order Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Price section */}
            <div className="border-b border-slate-200 pb-5 flex flex-wrap items-baseline justify-between gap-3">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Đơn giá niêm yết</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-[#0f4c81]">
                    {formatVND(service.price)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">/ {service.unit}</span>
                  {service.originalPrice && (
                    <span className="text-sm text-slate-400 line-through ml-2">
                      {formatVND(service.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" /> Hệ thống sẵn sàng kích hoạt
              </div>
            </div>

            {/* Short description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {service.shortDescription}
            </p>

            {/* Privacy disclaimer for digital accounts */}
            {service.category === 'kho-tai-khoan' && (
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-[#0f4c81]">
                  <Lock className="w-4 h-4 text-[#0f4c81]" /> Cam kết an toàn & Bảo mật tài khoản
                </div>
                <p className="leading-relaxed text-slate-700">
                  Dịch Vụ Số 24H <strong>tuyệt đối không yêu cầu mật khẩu cá nhân</strong> của bạn. Mọi quá trình nâng cấp chính chủ hoặc bàn giao tài khoản đều được thực hiện qua liên kết mời hoặc mã xác nhận.
                </p>
              </div>
            )}

            {/* Order Form */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Thông tin đơn hàng
              </h3>

              {isInteraction && (
                <div className="space-y-1">
                  <Input
                    label="Link bài viết hoặc link trang cần xử lý"
                    placeholder="https://facebook.com/..."
                    value={targetInput}
                    onChange={(event) => {
                      setTargetInput(event.target.value);
                      if (errors.targetInput) setErrors((current) => ({ ...current, targetInput: undefined }));
                    }}
                    error={errors.targetInput}
                    helperText="Link phải công khai và bắt đầu bằng http:// hoặc https://"
                    required
                  />
                </div>
              )}

              {/* Quantity Input */}
              <div className="space-y-1.5">
                <Input
                  label={`Số lượng (${service.unit})`}
                  type="number"
                  min={minQty}
                  max={maxQty}
                  step={1}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => {
                    const next = event.target.value === '' ? minQty : Number(event.target.value);
                    setQuantity(Number.isFinite(next) ? Math.trunc(next) : minQty);
                    if (errors.quantity) setErrors((current) => ({ ...current, quantity: undefined }));
                  }}
                  onBlur={() => setQuantity((current) => Math.min(maxQty, Math.max(minQty, current)))}
                  error={errors.quantity}
                  helperText={`Nhập từ ${minQty} đến ${maxQty} ${service.unit}.`}
                />
              </div>

              {isInteraction && (
                <Textarea
                  label="Ghi chú thêm (không bắt buộc)"
                  placeholder="Ghi rõ yêu cầu đặc biệt nếu có..."
                  rows={2}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              )}

              {/* Total Calculation Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Tổng tiền tạm tính</span>
                  <span className="text-[11px] text-slate-400">
                    ({quantity} x {formatVND(unitPrice)})
                  </span>
                </div>
                <span className="text-2xl font-black text-[#0f4c81]">
                  {formatVND(totalPrice)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full font-bold justify-center text-base py-3"
                  onClick={handleBuyNowClick}
                  disabled={isSubmitting || isAuthLoading || service.stockStatus !== 'available' || !service.active}
                  isLoading={isSubmitting || isAuthLoading}
                >
                  <Zap className="w-5 h-5 mr-1.5" /> Mua Ngay — {formatVND(totalPrice)}
                </Button>
              </div>

              {/* Support link */}
              <div className="text-center pt-2">
                <Link
                  href="/lien-he"
                  className="text-xs text-slate-500 hover:text-[#0f4c81] inline-flex items-center gap-1 font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-600" />
                  Cần hỗ trợ hoặc tư vấn trước khi mua? <u>Liên hệ CSKH 24/7</u>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dịch vụ liên quan */}

      {relatedServices.length > 0 && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Dịch vụ cùng danh mục
            </h2>
            <Link
              href={categoryMeta?.href || '/dich-vu'}
              className="text-xs font-bold text-[#0f4c81] hover:underline"
            >
              Xem thêm →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedServices.map((relSvc) => (
              <ServiceCard key={relSvc.id} service={relSvc} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
