'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Lock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createClient();

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmNewPassword?: string;
  }>({});

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});

    let hasError = false;
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới.';
      hasError = true;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Mật khẩu phải dài tối thiểu 8 ký tự.';
      hasError = true;
    }

    if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = 'Mật khẩu xác nhận không khớp.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
          msg = 'Không thể kết nối hệ thống. Vui lòng thử lại sau.';
        } else if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('expired')) {
          msg = 'Phiên khôi phục mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng gửi lại yêu cầu quên mật khẩu.';
        } else {
          msg = 'Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại.';
        }
        setErrorMessage(msg);
        showToast('Lỗi cập nhật', msg, 'error');
        setIsSubmitting(false);
        return;
      }

      showToast('Đổi mật khẩu thành công!', 'Bạn có thể đăng nhập bằng mật khẩu mới.', 'success');
      setIsSuccess(true);
    } catch {
      setErrorMessage('Đã xảy ra lỗi hệ thống.');
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
            Đặt Lại Mật Khẩu
          </h1>
          <p className="text-xs text-slate-500">
            {!isSuccess ? 'Tạo mật khẩu mới cho tài khoản của bạn' : 'Mật khẩu đã được cập nhật'}
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
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1">
              <div className="relative">
                <Input
                  label="Mật khẩu mới"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 8 ký tự..."
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  error={errors.newPassword}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Input
              label="Xác nhận mật khẩu mới"
              type={showPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới..."
              value={confirmNewPassword}
              onChange={(e) => {
                setConfirmNewPassword(e.target.value);
                if (errors.confirmNewPassword) {
                  setErrors((prev) => ({ ...prev, confirmNewPassword: undefined }));
                }
              }}
              error={errors.confirmNewPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold justify-center"
              isLoading={isSubmitting}
            >
              Cập Nhật Mật Khẩu
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-xs text-slate-600">
              Mật khẩu mới đã được cập nhật thành công. Bạn có thể sử dụng mật khẩu này để đăng nhập ngay bây giờ.
            </p>
            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold justify-center"
              onClick={() => router.push('/dang-nhap')}
            >
              Đăng Nhập Ngay
            </Button>
          </div>
        )}

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Kết nối bảo mật SSL mã hóa đầu cuối
        </div>
      </div>
    </div>
  );
}
