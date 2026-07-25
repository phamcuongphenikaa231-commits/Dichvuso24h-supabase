'use client';

import React, { useEffect, useState } from 'react';
import { settingsService } from '@/services/settingsService';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Phone, Mail, Send, Clock, MessageSquare, MapPin } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LienHePage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(() => settingsService.getSettings());

  useEffect(() => {
    const unsubscribe = settingsService.subscribe(() => setSettings(settingsService.getSettings()));
    void settingsService.refresh();
    return unsubscribe;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Đã ghi nhận yêu cầu demo', 'Dữ liệu đang được mô phỏng trên thiết bị này. Khi kết nối Supabase, yêu cầu sẽ được gửi tới bộ phận hỗ trợ.', 'success');
    }, 800);
  };

  return (
    <div className="container-custom space-y-6">
      <Breadcrumb items={[{ label: 'Liên hệ' }]} />

      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Liên Hệ & Hỗ Trợ Khách Hàng 24/7
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của quý khách.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact info */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="bg-[#0f4c81] text-white">
              <CardTitle className="text-base text-white">Kênh Hỗ Trợ Trực Tuyến</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-sm text-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-[#0f4c81]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Hotline / Zalo hỗ trợ</div>
                  <div className="font-bold text-slate-900">{settings.hotline}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-[#06b6d4]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Telegram Admin</div>
                  {settings.socialLinks.telegram ? (
                    <a href={settings.socialLinks.telegram} target="_blank" rel="noreferrer" className="font-bold text-[#0f4c81] hover:underline">
                      {settings.socialLinks.telegram.replace('https://t.me/', '@')}
                    </a>
                  ) : (
                    <div className="font-bold text-slate-500">Chưa cấu hình</div>
                  )}
                </div>
              </div>

              {settings.socialLinks.zalo && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-blue-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Liên hệ Zalo</div>
                    <a href={settings.socialLinks.zalo} target="_blank" rel="noreferrer" className="font-bold text-[#0f4c81] hover:underline">Mở Zalo hỗ trợ</a>
                  </div>
                </div>
              )}

              {settings.socialLinks.facebook && (
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-blue-700">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Facebook</div>
                    <a href={settings.socialLinks.facebook} target="_blank" rel="noreferrer" className="font-bold text-[#0f4c81] hover:underline">Mở Facebook</a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-amber-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Email phản hồi</div>
                  <div className="font-bold text-slate-900">{settings.supportEmail}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-emerald-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Thời gian làm việc</div>
                  <div className="font-bold text-slate-900">{settings.workingHours}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-violet-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Địa chỉ / Khu vực hỗ trợ</div>
                  <div className="font-bold text-slate-900">{settings.address}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0f4c81]" /> Gửi yêu cầu hỗ trợ trực tiếp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Họ và tên" placeholder="Nguyễn Văn A" required />
                  <Input label="Số điện thoại / Zalo" placeholder="0988xxxxxx" required />
                </div>
                <Input label="Địa chỉ Email" type="email" placeholder="example@gmail.com" required />
                <Textarea label="Nội dung cần hỗ trợ" placeholder="Mô tả chi tiết thắc mắc hoặc sự cố..." rows={4} required />
                <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
                  Gửi Yêu Cầu Hỗ Trợ
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
