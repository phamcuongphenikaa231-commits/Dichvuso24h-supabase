import { DeliveryChannel } from '@/types/order';

export function maskDeliveryValue(channel: DeliveryChannel, value: string | null): string {
  if (!channel || !value) return '—';
  if (channel === 'email') {
    const [name, domain] = value.split('@');
    if (!domain) return value;
    const visible = name.slice(0, Math.min(2, name.length));
    return `${visible}${'*'.repeat(Math.max(3, name.length - visible.length))}@${domain}`;
  }
  if (channel === 'zalo') {
    if (value.length < 7) return value;
    return `${value.slice(0, 3)}****${value.slice(-3)}`;
  }
  try {
    const url = new URL(value);
    const parts = url.pathname.split('/').filter(Boolean);
    const handle = parts.at(-1) || '';
    return `${url.hostname}/${handle.slice(0, 3)}***`;
  } catch {
    return value.length > 8 ? `${value.slice(0, 5)}***` : value;
  }
}
