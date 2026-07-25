'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorEmail, setErrorEmail] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrorEmail(null);

    const cleanEmail = email.trim().toLowerCase();

    // Validate
    if (!cleanEmail) {
      setErrorEmail('Vui lòng nhập Gmail của bạn.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorEmail('Chỉ chấp nhận Gmail (kết thúc bằng @gmail.com).');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/dat-lai-mat-khau`,
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
          msg = 'Không thể kết nối hệ thống. Vui lòng thử lại sau.';
        } else if (msg.toLowerCase().includes('rate limit')) {
          msg = 'Yêu cầu quá nhanh. Vui lòng đợi một lát rồi thử lại.';
        } else {
          // Bảo mật: không báo email không tồn tại mà chỉ báo lỗi hệ thống
          msg = 'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.';
        }
        setErrorMessage(msg);
        showToast('Lỗi khôi phục', msg, 'error');
        setIsSubmitting(false);
        return;
      }

      showToast('Đã gửi email khôi phục!', 'Vui lòng kiểm tra hộp thư Gmail của bạn.', 'success');
      setIsSuccess(true);
    } catch {
      setErrorMessage('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.');
      showToast('Lỗi hệ thống', 'Không thể kết nối đến máy chủ xác thực.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-12 max-w-md mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#0f4c81] mx-auto flex items-center justify-center text-white font-black text-xl shadow-md shadow-[#0f4c81]/20">
            24H
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Khôi Phục Mật Khẩu
          </h1>
          <p className="text-xs text-slate-500">
            {!isSuccess
              ? 'Nhập địa chỉ Gmail đã đăng ký để nhận liên kết đặt lại mật khẩu'
              : 'Yêu cầu của bạn đang được xử lý'}
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-red-700">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Thông báo lỗi:</span>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form or Success State */}
        {!isSuccess ? (
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <Input
              label="Địa chỉ Gmail đã đăng ký"
              type="email"
              placeholder="Ví dụ: nick@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorEmail) setErrorEmail(null);
              }}
              error={errorEmail || undefined}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold justify-center"
              isLoading={isSubmitting}
            >
              Gửi Yêu Cầu Khôi Phục
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Chúng tôi đã gửi một email chứa liên kết đặt lại mật khẩu đến địa chỉ <strong className="text-slate-900">{email}</strong>. Vui lòng kiểm tra cả hòm thư Spam nếu không nhận được.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="w-full font-bold justify-center"
              onClick={() => setIsSuccess(false)}
            >
              Thử lại với Gmail khác
            </Button>
          </div>
        )}

        {/* Footer Link */}
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          Trở lại{' '}
          <Link href="/dang-nhap" className="font-bold text-[#0f4c81] hover:underline flex items-center justify-center gap-1 mt-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Trang đăng nhập
          </Link>
        </div>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Hệ thống bảo mật 2 lớp tự động
        </div>
      </div>
    </div>
  );
}
