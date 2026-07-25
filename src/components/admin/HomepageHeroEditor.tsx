'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { homepageHeroService } from '@/services/homepageHeroService';
import {
  HeroBenefitIcon,
  HomepageHeroContent,
} from '@/types/site';

const ICON_OPTIONS: { value: HeroBenefitIcon; label: string }[] = [
  { value: 'shield', label: 'Khiên bảo hành' },
  { value: 'zap', label: 'Tia sét' },
  { value: 'headphones', label: 'Tai nghe hỗ trợ' },
  { value: 'check', label: 'Dấu kiểm' },
];


function isSafeLink(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed);
}

function cloneHero(value: HomepageHeroContent): HomepageHeroContent {
  return JSON.parse(JSON.stringify(value)) as HomepageHeroContent;
}

export function HomepageHeroEditor() {
  const { showToast } = useToast();
  const [form, setForm] = useState<HomepageHeroContent>(() =>
    cloneHero(homepageHeroService.getCached())
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [visualFile, setVisualFile] = useState<File | null>(null);

  const backgroundPreview = useMemo(
    () => (backgroundFile ? URL.createObjectURL(backgroundFile) : form.background.url),
    [backgroundFile, form.background.url]
  );
  const visualPreview = useMemo(
    () => (visualFile ? URL.createObjectURL(visualFile) : form.visual.url),
    [visualFile, form.visual.url]
  );

  useEffect(() => {
    let mounted = true;
    homepageHeroService
      .refresh()
      .then((value) => {
        if (mounted) setForm(cloneHero(value));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (backgroundFile && backgroundPreview.startsWith('blob:')) {
        URL.revokeObjectURL(backgroundPreview);
      }
      if (visualFile && visualPreview.startsWith('blob:')) {
        URL.revokeObjectURL(visualPreview);
      }
    };
  }, [backgroundFile, backgroundPreview, visualFile, visualPreview]);

  const save = async () => {
    if (!form.titleBeforeHighlight.trim() && !form.highlightedTitle.trim() && !form.titleAfterHighlight.trim()) {
      showToast('Thiếu tiêu đề', 'Vui lòng nhập ít nhất một phần tiêu đề Hero.', 'warning');
      return;
    }
    if (form.primaryButton.enabled && !isSafeLink(form.primaryButton.url)) {
      showToast('Đường dẫn không hợp lệ', 'Nút chính phải dùng đường dẫn nội bộ bắt đầu bằng / hoặc URL http/https.', 'warning');
      return;
    }
    if (form.secondaryButton.enabled && !isSafeLink(form.secondaryButton.url)) {
      showToast('Đường dẫn không hợp lệ', 'Nút phụ phải dùng đường dẫn nội bộ bắt đầu bằng / hoặc URL http/https.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const saved = await homepageHeroService.save(form, {
        background: backgroundFile,
        visual: visualFile,
      });
      setForm(cloneHero(saved));
      setBackgroundFile(null);
      setVisualFile(null);
      showToast('Đã lưu Hero', 'Trang chủ đã được đồng bộ với Supabase.', 'success');
    } catch (error) {
      showToast(
        'Không thể lưu Hero',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const clearAsset = async (kind: 'background' | 'visual') => {
    if (!confirm(`Xóa ảnh ${kind === 'background' ? 'nền' : 'minh họa'} đang dùng?`)) return;
    setSaving(true);
    try {
      const saved = await homepageHeroService.clearAsset(kind);
      setForm(cloneHero(saved));
      if (kind === 'background') setBackgroundFile(null);
      else setVisualFile(null);
      showToast('Đã xóa ảnh', 'Hero sẽ dùng giao diện mặc định làm dự phòng.', 'success');
    } catch (error) {
      showToast('Không thể xóa ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const restoreDefault = async () => {
    if (!confirm('Khôi phục toàn bộ Hero về nội dung và hình ảnh mặc định?')) return;
    setSaving(true);
    try {
      const saved = await homepageHeroService.restoreDefault();
      setForm(cloneHero(saved));
      setBackgroundFile(null);
      setVisualFile(null);
      showToast('Đã khôi phục', 'Hero mặc định đã được đồng bộ với trang chủ.', 'success');
    } catch (error) {
      showToast('Không thể khôi phục', error instanceof Error ? error.message : 'Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-sm text-slate-500">Đang tải cấu hình Hero từ Supabase...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hero trang chủ</h2>
          <p className="text-xs text-slate-500 mt-1">
            Nội dung và ảnh được lưu trên Supabase, trang người dùng sẽ nhận thay đổi sau khi lưu.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={restoreDefault} disabled={saving}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Khôi phục mặc định
          </Button>
          <Button size="sm" onClick={save} isLoading={saving} disabled={saving}>
            <Check className="w-4 h-4 mr-1.5" /> Lưu và đồng bộ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
              Hiển thị khu vực Hero
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(event) => setForm((current) => ({ ...current, enabled: event.target.checked }))}
                className="h-4 w-4"
              />
            </label>

            <Input
              label="Nhãn nhỏ phía trên"
              maxLength={80}
              value={form.badgeText}
              onChange={(event) => setForm((current) => ({ ...current, badgeText: event.target.value }))}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Tiêu đề đầu"
                maxLength={60}
                value={form.titleBeforeHighlight}
                onChange={(event) => setForm((current) => ({ ...current, titleBeforeHighlight: event.target.value }))}
              />
              <Input
                label="Chữ nổi bật"
                maxLength={50}
                value={form.highlightedTitle}
                onChange={(event) => setForm((current) => ({ ...current, highlightedTitle: event.target.value }))}
              />
              <Input
                label="Tiêu đề sau"
                maxLength={80}
                value={form.titleAfterHighlight}
                onChange={(event) => setForm((current) => ({ ...current, titleAfterHighlight: event.target.value }))}
              />
            </div>

            <Textarea
              label="Mô tả"
              rows={4}
              maxLength={500}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Nút điều hướng</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  Nút chính
                  <input
                    type="checkbox"
                    checked={form.primaryButton.enabled}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      primaryButton: { ...current.primaryButton, enabled: event.target.checked },
                    }))}
                  />
                </label>
                <Input
                  placeholder="Khám phá dịch vụ"
                  value={form.primaryButton.text}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    primaryButton: { ...current.primaryButton, text: event.target.value },
                  }))}
                />
                <Input
                  placeholder="/dich-vu"
                  value={form.primaryButton.url}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    primaryButton: { ...current.primaryButton, url: event.target.value },
                  }))}
                />
              </div>

              <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  Nút phụ
                  <input
                    type="checkbox"
                    checked={form.secondaryButton.enabled}
                    onChange={(event) => setForm((current) => ({
                      ...current,
                      secondaryButton: { ...current.secondaryButton, enabled: event.target.checked },
                    }))}
                  />
                </label>
                <Input
                  placeholder="Xem hướng dẫn"
                  value={form.secondaryButton.text}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    secondaryButton: { ...current.secondaryButton, text: event.target.value },
                  }))}
                />
                <Input
                  placeholder="/huong-dan"
                  value={form.secondaryButton.url}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    secondaryButton: { ...current.secondaryButton, url: event.target.value },
                  }))}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Các dòng cam kết</h3>
            {form.benefits.map((benefit, index) => (
              <div key={benefit.id} className="grid grid-cols-[auto_1fr_150px] gap-2 items-center">
                <input
                  type="checkbox"
                  checked={benefit.enabled}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    benefits: current.benefits.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, enabled: event.target.checked } : item
                    ),
                  }))}
                />
                <Input
                  value={benefit.text}
                  maxLength={60}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    benefits: current.benefits.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, text: event.target.value } : item
                    ),
                  }))}
                />
                <select
                  className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white"
                  value={benefit.icon}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    benefits: current.benefits.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, icon: event.target.value as HeroBenefitIcon }
                        : item
                    ),
                  }))}
                >
                  {ICON_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ảnh minh họa bên phải</h3>
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 min-h-48 flex items-center justify-center overflow-hidden">
              {visualPreview ? (
                <img src={visualPreview} alt={form.visual.alt} className="max-h-72 w-full object-contain" />
              ) : (
                <div className="text-center text-xs text-slate-400 p-8">Chưa tải ảnh — trang chủ dùng bảng dashboard mặc định.</div>
              )}
            </div>
            <Input
              label="Mô tả ảnh"
              value={form.visual.alt}
              onChange={(event) => setForm((current) => ({
                ...current,
                visual: { ...current.visual, alt: event.target.value },
              }))}
            />
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center px-3 py-2 rounded-lg bg-[#0f4c81] text-white text-xs font-semibold cursor-pointer">
                <Upload className="w-4 h-4 mr-1.5" /> Chọn ảnh minh họa
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => setVisualFile(event.target.files?.[0] || null)}
                />
              </label>
              {(form.visual.url || visualFile) && (
                <Button variant="outline" size="sm" onClick={() => clearAsset('visual')} disabled={saving}>
                  <Trash2 className="w-4 h-4 mr-1.5" /> Xóa ảnh
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">JPG/PNG/WebP, tối đa 3 MB. Khi không có ảnh, giao diện dashboard gốc vẫn được giữ.</p>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ảnh nền Hero</h3>
            <div
              className="rounded-xl border border-dashed border-slate-300 min-h-48 overflow-hidden relative"
              style={{
                backgroundColor: form.background.fallbackColor,
                backgroundImage: backgroundPreview ? `url(${backgroundPreview})` : undefined,
                backgroundPosition: form.background.position,
                backgroundSize: form.background.size,
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div
                className="absolute inset-0 bg-slate-950"
                style={{ opacity: form.background.overlayOpacity / 100 }}
              />
              <div className="relative z-10 p-6 text-white">
                <p className="text-xs opacity-80">Xem trước nền</p>
                <p className="font-black text-2xl mt-2">
                  {form.titleBeforeHighlight} <span className="text-cyan-300">{form.highlightedTitle}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Màu nền dự phòng"
                type="color"
                value={form.background.fallbackColor}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  background: { ...current.background, fallbackColor: event.target.value },
                }))}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Độ tối lớp phủ: {form.background.overlayOpacity}%</label>
                <input
                  className="w-full"
                  type="range"
                  min={0}
                  max={90}
                  value={form.background.overlayOpacity}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    background: { ...current.background, overlayOpacity: Number(event.target.value) },
                  }))}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Vị trí ảnh</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={form.background.position}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    background: {
                      ...current.background,
                      position: event.target.value as HomepageHeroContent['background']['position'],
                    },
                  }))}
                >
                  <option value="center">Giữa</option>
                  <option value="top">Trên</option>
                  <option value="bottom">Dưới</option>
                  <option value="left">Trái</option>
                  <option value="right">Phải</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Kiểu phủ ảnh</label>
                <select
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  value={form.background.size}
                  onChange={(event) => setForm((current) => ({
                    ...current,
                    background: {
                      ...current.background,
                      size: event.target.value as HomepageHeroContent['background']['size'],
                    },
                  }))}
                >
                  <option value="cover">Phủ đầy</option>
                  <option value="contain">Hiện toàn bộ ảnh</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center px-3 py-2 rounded-lg bg-[#0f4c81] text-white text-xs font-semibold cursor-pointer">
                <ImagePlus className="w-4 h-4 mr-1.5" /> Chọn ảnh nền
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => setBackgroundFile(event.target.files?.[0] || null)}
                />
              </label>
              {(form.background.url || backgroundFile) && (
                <Button variant="outline" size="sm" onClick={() => clearAsset('background')} disabled={saving}>
                  <Trash2 className="w-4 h-4 mr-1.5" /> Xóa ảnh nền
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-500">JPG/PNG/WebP, tối đa 5 MB. Nên dùng ảnh ngang tối thiểu 1920 × 800 px.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
