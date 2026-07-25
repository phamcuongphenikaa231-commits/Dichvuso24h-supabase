'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { couponService, COUPON_STATUS_MAP, COUPON_TYPE_MAP } from '@/services/couponService';
import { Coupon, CouponType, CouponStatus } from '@/types/admin';

const PAGE_SIZE = 10;

type FormData = Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>;

const EMPTY_FORM: FormData = {
  code: '',
  type: 'percent',
  value: 0,
  minOrderAmount: 0,
  maxDiscount: undefined,
  usageLimit: 100,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  status: 'active',
  applicableServices: [],
  description: '',
};

function formatDate(str: string) {
  return new Date(str).toLocaleDateString('vi-VN');
}

export default function AdminCouponsPage() {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>(() => couponService.getCoupons());
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [filterStatus, setFilterStatus] = useState<CouponStatus | 'all'>('all');

  useEffect(() => {
    const unsub = couponService.subscribe(() => setCoupons(couponService.getCoupons()));
    return unsub;
  }, []);

  const filtered = filterStatus === 'all' ? coupons : coupons.filter(c => c.status === filterStatus);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const setField = <K extends keyof FormData>(k: K, v: FormData[K]) => {
    setForm(prev => ({ ...prev, [k]: v }));
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrderAmount: c.minOrderAmount,
      maxDiscount: c.maxDiscount,
      usageLimit: c.usageLimit,
      startDate: c.startDate,
      endDate: c.endDate,
      status: c.status,
      applicableServices: c.applicableServices,
      description: c.description || '',
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.code.trim()) {
      showToast('Lỗi', 'Vui lòng nhập mã giảm giá', 'error');
      return;
    }
    if (form.value <= 0) {
      showToast('Lỗi', 'Giá trị giảm phải lớn hơn 0', 'error');
      return;
    }
    if (editingId) {
      const result = couponService.update(editingId, form);
      if (!result.success) {
        showToast('Không thể cập nhật', result.message, 'error');
        return;
      }
      showToast('Đã lưu', result.message, 'success');
    } else {
      const result = couponService.create(form);
      if (!result.success) {
        showToast('Không thể tạo', result.message, 'error');
        return;
      }
      showToast('Đã tạo', result.message, 'success');
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleDelete = (c: Coupon) => {
    if (!confirm(`Xóa mã giảm giá "${c.code}"?`)) return;
    couponService.delete(c.id);
    showToast('Đã xóa', `Mã "${c.code}" đã bị xóa`, 'success');
  };

  const handleToggleStatus = (c: Coupon) => {
    if (c.status === 'expired') {
      showToast('Không thể thay đổi', 'Mã đã hết hạn không thể kích hoạt', 'warning');
      return;
    }
    const newStatus: CouponStatus = c.status === 'active' ? 'inactive' : 'active';
    couponService.setStatus(c.id, newStatus);
    showToast('Đã cập nhật', `Mã "${c.code}" ${newStatus === 'active' ? 'đã kích hoạt' : 'đã tạm dừng'}`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Tổng <strong>{coupons.length}</strong> mã · <strong>{coupons.filter(c => c.status === 'active').length}</strong> đang hoạt động</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />Tạo mã mới
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-slate-900">{editingId ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}</h2>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Mã giảm giá *</label>
              <Input
                value={form.code}
                onChange={e => setField('code', e.target.value.toUpperCase())}
                placeholder="VD: SUMMER30"
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Loại giảm *</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                value={form.type}
                onChange={e => setField('type', e.target.value as CouponType)}
              >
                {Object.entries(COUPON_TYPE_MAP).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Giá trị * {form.type === 'percent' ? '(%)' : '(₫)'}
              </label>
              <Input
                type="number"
                value={form.value}
                onChange={e => setField('value', Number(e.target.value))}
                min={0}
                max={form.type === 'percent' ? 100 : undefined}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Đơn tối thiểu (₫)</label>
              <Input
                type="number"
                value={form.minOrderAmount}
                onChange={e => setField('minOrderAmount', Number(e.target.value))}
                min={0}
              />
            </div>

            {form.type === 'percent' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Giảm tối đa (₫)</label>
                <Input
                  type="number"
                  value={form.maxDiscount ?? ''}
                  onChange={e => setField('maxDiscount', e.target.value ? Number(e.target.value) : undefined)}
                  min={0}
                  placeholder="Không giới hạn"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Giới hạn sử dụng</label>
              <Input
                type="number"
                value={form.usageLimit}
                onChange={e => setField('usageLimit', Number(e.target.value))}
                min={1}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                value={form.startDate}
                onChange={e => setField('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                value={form.endDate}
                onChange={e => setField('endDate', e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Trạng thái</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                value={form.status}
                onChange={e => setField('status', e.target.value as CouponStatus)}
              >
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>
            </div>

            <div className="space-y-1 sm:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium text-slate-700">Mô tả (tùy chọn)</label>
              <Input
                value={form.description || ''}
                onChange={e => setField('description', e.target.value)}
                placeholder="Mô tả ngắn về mã giảm giá..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />{editingId ? 'Lưu thay đổi' : 'Tạo mã'}
            </Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'inactive', 'expired'] as const).map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              filterStatus === s
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'border-slate-200 text-slate-600 hover:border-brand-primary hover:text-brand-primary'
            }`}
          >
            {s === 'all' ? 'Tất cả' : COUPON_STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3">Loại / Giá trị</th>
                <th className="px-4 py-3">Điều kiện</th>
                <th className="px-4 py-3">Sử dụng</th>
                <th className="px-4 py-3">Ngày áp dụng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.map(c => {
                const statusMeta = COUPON_STATUS_MAP[c.status];
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded inline-block">{c.code}</div>
                      {c.description && <div className="text-xs text-slate-400 mt-0.5 max-w-[160px] truncate">{c.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-500">{COUPON_TYPE_MAP[c.type]}</div>
                      <div className="font-bold text-slate-900">
                        {c.type === 'percent' ? `${c.value}%` : `${c.value.toLocaleString('vi-VN')}₫`}
                        {c.maxDiscount && <span className="text-xs text-slate-400 font-normal ml-1">(tối đa {c.maxDiscount.toLocaleString('vi-VN')}₫)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      Đơn từ {c.minOrderAmount.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs text-slate-700">{c.usedCount} / {c.usageLimit}</div>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-brand-primary rounded-full"
                          style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(c.startDate)} → {formatDate(c.endDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusMeta.badge} size="sm">{statusMeta.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-2 ${c.status === 'active' ? 'text-amber-500' : 'text-green-600'}`}
                          onClick={() => handleToggleStatus(c)}
                          title={c.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                        >
                          {c.status === 'active' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-slate-500"
                          onClick={() => handleOpenEdit(c)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-red-400 hover:text-red-600"
                          onClick={() => handleDelete(c)}
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
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                    <div className="text-4xl mb-3">🏷️</div>
                    <p className="font-medium">Không có mã giảm giá nào</p>
                    <button className="text-brand-primary text-sm mt-2 hover:underline" onClick={handleOpenCreate}>+ Tạo mã mới</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <span>Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> · {filtered.length} mã</span>
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
