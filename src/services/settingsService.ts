'use client';

import { createClient } from '@/lib/supabase/client';
import { StoreSettings } from '@/types/admin';

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Dịch Vụ Số 24H',
  logoUrl: '/logo.png',
  hotline: '0988.247.247',
  supportEmail: 'hotro@dichvuso24h.vn',
  address: 'Online',
  workingHours: '08:00 - 22:00',
  currency: 'VND',
  timezone: 'Asia/Ho_Chi_Minh',
  socialLinks: {
    facebook: '',
    telegram: '',
    youtube: '',
    zalo: '',
    tiktok: '',
  },
};

type SettingsRow = { key: string; value: unknown };

let settings: StoreSettings = DEFAULT_SETTINGS;
const listeners = new Set<() => void>();
let realtimeStarted = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function ensureRealtimeSubscription() {
  if (realtimeStarted || typeof window === 'undefined') return;
  realtimeStarted = true;
  const supabase = createClient();
  supabase
    .channel('dv24h-site-settings-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'site_settings' },
      (payload) => {
        const nextRecord = payload.new as { key?: string };
        const previousRecord = payload.old as { key?: string };
        const key = nextRecord?.key || previousRecord?.key;
        if (!key || ['store', 'contact', 'social_links'].includes(key)) {
          void settingsService.refresh();
        }
      }
    )
    .subscribe();
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function mergeRows(rows: SettingsRow[]): StoreSettings {
  const map = new Map(rows.map((row) => [row.key, asObject(row.value)]));
  const store = map.get('store') || {};
  const contact = map.get('contact') || {};
  const social = map.get('social_links') || {};

  return {
    ...DEFAULT_SETTINGS,
    storeName: String(store.storeName ?? DEFAULT_SETTINGS.storeName),
    logoUrl: String(store.logoUrl ?? DEFAULT_SETTINGS.logoUrl),
    currency: String(store.currency ?? DEFAULT_SETTINGS.currency),
    timezone: String(store.timezone ?? DEFAULT_SETTINGS.timezone),
    hotline: String(contact.hotline ?? DEFAULT_SETTINGS.hotline),
    supportEmail: String(contact.supportEmail ?? DEFAULT_SETTINGS.supportEmail),
    address: String(contact.address ?? DEFAULT_SETTINGS.address),
    workingHours: String(contact.workingHours ?? DEFAULT_SETTINGS.workingHours),
    socialLinks: {
      ...DEFAULT_SETTINGS.socialLinks,
      ...(social as Partial<StoreSettings['socialLinks']>),
    },
  };
}

function validateSettings(value: StoreSettings) {
  if (!value.storeName.trim()) throw new Error('Tên cửa hàng không được để trống.');
  if (!value.hotline.trim()) throw new Error('Hotline không được để trống.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.supportEmail.trim())) {
    throw new Error('Email hỗ trợ không hợp lệ.');
  }

  Object.entries(value.socialLinks).forEach(([name, url]) => {
    if (!url.trim()) return;
    try {
      const parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('invalid');
    } catch {
      throw new Error(`Đường dẫn ${name} phải bắt đầu bằng http:// hoặc https://.`);
    }
  });
}

function toRows(value: StoreSettings) {
  return [
    {
      key: 'store',
      value: {
        storeName: value.storeName,
        logoUrl: value.logoUrl,
        currency: value.currency,
        timezone: value.timezone,
      },
      is_public: true,
    },
    {
      key: 'contact',
      value: {
        hotline: value.hotline,
        supportEmail: value.supportEmail,
        address: value.address,
        workingHours: value.workingHours,
      },
      is_public: true,
    },
    {
      key: 'social_links',
      value: value.socialLinks,
      is_public: true,
    },
  ];
}

export const settingsService = {
  getSettings(): StoreSettings {
    return settings;
  },

  async refresh(): Promise<StoreSettings> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('key,value')
      .in('key', ['store', 'contact', 'social_links']);

    if (error) {
      console.error('Không thể tải cài đặt từ Supabase:', error.message);
      return settings;
    }

    settings = mergeRows((data || []) as SettingsRow[]);
    notify();
    return settings;
  },

  async updateAll(data: Partial<StoreSettings>): Promise<StoreSettings> {
    const supabase = createClient();
    const next: StoreSettings = {
      ...settings,
      ...data,
      socialLinks: data.socialLinks
        ? { ...settings.socialLinks, ...data.socialLinks }
        : settings.socialLinks,
    };

    validateSettings(next);

    const { error } = await supabase
      .from('site_settings')
      .upsert(toRows(next), { onConflict: 'key' });

    if (error) throw new Error(`Không thể lưu cài đặt: ${error.message}`);

    settings = next;
    notify();
    return settings;
  },

  async reset(): Promise<StoreSettings> {
    settings = DEFAULT_SETTINGS;
    return this.updateAll(DEFAULT_SETTINGS);
  },

  subscribe(listener: () => void): () => void {
    ensureRealtimeSubscription();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
