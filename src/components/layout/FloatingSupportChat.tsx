'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Send, X } from 'lucide-react';
import { settingsService } from '@/services/settingsService';
import { StoreSettings } from '@/types/admin';

export default function FloatingSupportChat() {
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<StoreSettings>(() => settingsService.getSettings());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setSettings(settingsService.getSettings());
    const unsubscribe = settingsService.subscribe(sync);
    void settingsService.refresh();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (pathname.startsWith('/admin')) return null;

  const platforms = [
    {
      id: 'facebook',
      label: 'Facebook',
      url: settings.socialLinks.facebook,
      icon: <MessageCircle className="w-4 h-4" />,
      className: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      id: 'zalo',
      label: 'Zalo',
      url: settings.socialLinks.zalo,
      icon: <span className="font-black text-xs">Zalo</span>,
      className: 'bg-sky-500 hover:bg-sky-600',
    },
    {
      id: 'telegram',
      label: 'Telegram',
      url: settings.socialLinks.telegram,
      icon: <Send className="w-4 h-4" />,
      className: 'bg-cyan-500 hover:bg-cyan-600',
    },
  ].filter((platform) => platform.url.trim());

  if (platforms.length === 0) return null;

  return (
    <div ref={wrapperRef} className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      {open && (
        <div className="w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          <p className="px-2 pb-2 text-xs font-semibold text-slate-600">Bạn muốn được hỗ trợ qua kênh nào?</p>
          <div className="space-y-2">
            {platforms.map((platform) => (
              <a
                key={platform.id}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`${platform.className} flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-white transition-colors`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">{platform.icon}</span>
                Nhắn tin qua {platform.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0f4c81] text-white shadow-xl transition hover:scale-105 hover:bg-[#0b3d68] focus:outline-none focus:ring-4 focus:ring-cyan-200"
        aria-expanded={open}
        aria-label={open ? 'Đóng hỗ trợ trực tuyến' : 'Mở hỗ trợ trực tuyến'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
