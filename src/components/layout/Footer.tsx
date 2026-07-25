'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { contentService } from '@/services/contentService';
import { settingsService } from '@/services/settingsService';
import { FooterContent, StoreSettings } from '@/types/admin';
import { Phone, Mail, Clock, Send, ShieldCheck, HelpCircle, CheckCircle2, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings>(() => settingsService.getSettings());
  const [footer, setFooter] = useState<FooterContent>(() => contentService.getFooter());

  useEffect(() => {
    const refreshSettings = () => setSettings(settingsService.getSettings());
    const refreshFooter = () => setFooter(contentService.getFooter());
    refreshSettings();
    refreshFooter();
    void settingsService.refresh();
    const unsubscribeSettings = settingsService.subscribe(refreshSettings);
    const unsubscribeFooter = contentService.subscribe(refreshFooter);
    return () => {
      unsubscribeSettings();
      unsubscribeFooter();
    };
  }, []);

  const { facebook, zalo, telegram } = settings.socialLinks;

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="border-b border-slate-800 py-8 bg-slate-950/50">
        <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Clock, title: 'Giao dịch 24/7', text: 'Theo dõi đơn hàng trực tuyến' },
            { icon: ShieldCheck, title: 'Xử lý rõ ràng', text: 'Trạng thái theo từng đơn hàng' },
            { icon: CheckCircle2, title: 'Thông tin minh bạch', text: 'Giá và trạng thái hiển thị rõ' },
            { icon: HelpCircle, title: 'Hỗ trợ khi cần', text: 'Gửi phiếu hỗ trợ theo mã đơn' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#0f4c81]/20 text-[#06b6d4]"><item.icon className="w-6 h-6" /></div>
              <div><h5 className="font-bold text-white text-sm">{item.title}</h5><p className="text-xs text-slate-400">{item.text}</p></div>
            </div>
          ))}
        </div>
      </div>

      <div className="container-custom py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0f4c81] text-white flex items-center justify-center font-extrabold text-base">24H</div>
            <span className="font-black text-white text-xl tracking-tight">{settings.storeName}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{footer.description}</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-[#06b6d4]" /><span>Hotline: <strong>{settings.hotline}</strong></span></div>
            {facebook && <div className="flex items-center gap-2 text-slate-300"><MessageCircle className="w-4 h-4 text-[#06b6d4]" /><span>Facebook: <a href={facebook} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-white hover:underline">Nhắn tin</a></span></div>}
            {zalo && <div className="flex items-center gap-2 text-slate-300"><Phone className="w-4 h-4 text-[#06b6d4]" /><span>Zalo: <a href={zalo} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-white hover:underline">Nhắn tin</a></span></div>}
            {telegram && <div className="flex items-center gap-2 text-slate-300"><Send className="w-4 h-4 text-[#06b6d4]" /><span>Telegram: <a href={telegram} target="_blank" rel="noopener noreferrer" className="font-bold hover:text-white hover:underline">Nhắn tin</a></span></div>}
            <div className="flex items-center gap-2 text-slate-300"><Mail className="w-4 h-4 text-[#06b6d4]" /><span>Email: <a href={`mailto:${settings.supportEmail}`} className="font-bold hover:text-white hover:underline">{settings.supportEmail}</a></span></div>
            <div className="flex items-center gap-2 text-slate-300"><Clock className="w-4 h-4 text-[#06b6d4]" /><span>Giờ làm việc: <strong>{settings.workingHours}</strong></span></div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Danh mục dịch vụ</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/danh-muc/kho-tai-khoan" className="hover:text-white">Kho tài khoản</Link></li>
            <li><Link href="/danh-muc/dich-vu-tuong-tac" className="hover:text-white">Dịch vụ tương tác</Link></li>
            <li><Link href="/danh-muc/cong-cu-so" className="hover:text-white">Công cụ số</Link></li>
            <li><Link href="/danh-muc/dich-vu-khac" className="hover:text-white">Dịch vụ khác</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hỗ trợ</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/tai-khoan/ho-tro" className="hover:text-white">Tạo phiếu hỗ trợ</Link></li>
            <li><Link href="/tai-khoan/don-hang" className="hover:text-white">Tra cứu đơn hàng</Link></li>
            <li><Link href="/lien-he" className="hover:text-white">Liên hệ</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
