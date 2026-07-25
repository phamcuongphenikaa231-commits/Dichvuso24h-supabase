'use client';

import { useEffect, useState } from 'react';
import { Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { settingsService } from '@/services/settingsService';
import { StoreSettings } from '@/types/admin';

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

function FormRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1">
      <FormLabel>{label}</FormLabel>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function StoreTab({ settings, onSave }: { settings: StoreSettings; onSave: (data: Partial<StoreSettings>) => void | Promise<void> }) {
  const [form, setForm] = useState({
    storeName: settings.storeName,
    logoUrl: settings.logoUrl,
    hotline: settings.hotline,
    supportEmail: settings.supportEmail,
    address: settings.address,
    workingHours: settings.workingHours,
    currency: settings.currency,
    timezone: settings.timezone,
    facebook: settings.socialLinks.facebook,
    zalo: settings.socialLinks.zalo,
    telegram: settings.socialLinks.telegram,
  });

  const handleSave = () => {
    onSave({
      storeName: form.storeName,
      logoUrl: form.logoUrl,
      hotline: form.hotline,
      supportEmail: form.supportEmail,
      address: form.address,
      workingHours: form.workingHours,
      currency: form.currency,
      timezone: form.timezone,
      socialLinks: {
        ...settings.socialLinks,
        facebook: form.facebook,
        zalo: form.zalo,
        telegram: form.telegram,
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Thông tin cửa hàng</h2>
        <p className="text-sm text-slate-500 mt-1">Các thay đổi được đồng bộ với Footer và nút chat hỗ trợ.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormRow label="Tên cửa hàng *">
          <Input value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} />
        </FormRow>
        <FormRow label="Logo URL">
          <Input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="/logo.png" />
        </FormRow>
        <FormRow label="Hotline *">
          <Input value={form.hotline} onChange={e => setForm(f => ({ ...f, hotline: e.target.value }))} />
        </FormRow>
        <FormRow label="Email hỗ trợ *">
          <Input type="email" value={form.supportEmail} onChange={e => setForm(f => ({ ...f, supportEmail: e.target.value }))} />
        </FormRow>
        <FormRow label="Địa chỉ" hint="Có thể để 'Online' nếu không có địa chỉ thực">
          <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
        </FormRow>
        <FormRow label="Thời gian làm việc">
          <Input value={form.workingHours} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} placeholder="08:00 - 22:00" />
        </FormRow>
        <FormRow label="Tiền tệ">
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
          >
            <option value="VND">VND - Việt Nam Đồng</option>
            <option value="USD">USD - Đô la Mỹ</option>
          </select>
        </FormRow>
        <FormRow label="Múi giờ">
          <select
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={form.timezone}
            onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (UTC+7)</option>
            <option value="Asia/Bangkok">Asia/Bangkok (UTC+7)</option>
            <option value="UTC">UTC</option>
          </select>
        </FormRow>
      </div>

      <div className="border-t border-slate-200 pt-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900">Kênh liên hệ nhanh</h3>
          <p className="text-xs text-slate-500 mt-1">Các đường dẫn này hiển thị ở chân trang và trong nút chat nổi.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormRow label="Facebook / Messenger">
            <Input value={form.facebook} onChange={e => setForm(f => ({ ...f, facebook: e.target.value }))} placeholder="https://m.me/ten-trang" />
          </FormRow>
          <FormRow label="Zalo">
            <Input value={form.zalo} onChange={e => setForm(f => ({ ...f, zalo: e.target.value }))} placeholder="https://zalo.me/0123456789" />
          </FormRow>
          <FormRow label="Telegram">
            <Input value={form.telegram} onChange={e => setForm(f => ({ ...f, telegram: e.target.value }))} placeholder="https://t.me/ten_telegram" />
          </FormRow>
        </div>
      </div>

      <Button onClick={handleSave}>
        <Check className="w-4 h-4 mr-2" />Lưu cài đặt cửa hàng
      </Button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<StoreSettings>(() => settingsService.getSettings());
  const [settingsVersion, setSettingsVersion] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    const sync = () => {
      if (!active) return;
      setSettings(settingsService.getSettings());
      setSettingsVersion(version => version + 1);
    };
    const unsubscribe = settingsService.subscribe(sync);
    void settingsService.refresh().catch(error => {
      console.error(error);
      showToast('Không thể tải cài đặt', 'Đang hiển thị dữ liệu mặc định. Vui lòng thử lại.', 'error');
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [showToast]);

  const handleSave = async (data: Partial<StoreSettings>) => {
    try {
      setSaving(true);
      await settingsService.updateAll(data);
      showToast('Đã lưu', 'Thông tin cửa hàng đã đồng bộ với Supabase và giao diện khách.', 'success');
    } catch (error) {
      showToast('Không thể lưu', error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Đặt lại thông tin cửa hàng về mặc định?')) return;
    try {
      setSaving(true);
      await settingsService.reset();
      showToast('Đã đặt lại', 'Cài đặt mặc định đã được đồng bộ với Supabase.', 'success');
    } catch (error) {
      showToast('Không thể đặt lại', error instanceof Error ? error.message : 'Đã xảy ra lỗi không xác định.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt cửa hàng</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Quản lý thông tin liên hệ và các kênh hỗ trợ khách hàng.</p>
        </div>
        <Button variant="outline" onClick={handleReset} isLoading={saving} className="text-red-500 border-red-200 hover:bg-red-50">
          <RefreshCw className="w-4 h-4 mr-2" />Đặt lại mặc định
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <StoreTab key={`store-${settingsVersion}`} settings={settings} onSave={handleSave} />
      </div>
    </div>
  );
}
