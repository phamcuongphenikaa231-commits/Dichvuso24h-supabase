'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    agreeTerms?: string;
  }>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});

    const cleanEmail = email.trim().toLowerCase();

    // Validate
    let hasError = false;
    const newErrors: typeof errors = {};

    if (!cleanEmail) {
      newErrors.email = 'Vui lòng nhập địa chỉ Gmail.';
      hasError = true;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(cleanEmail)) {
        newErrors.email = 'Chỉ chấp nhận địa chỉ kết thúc bằng @gmail.com.';
        hasError = true;
      }
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      hasError = true;
    } else if (password.length < 8) {
      newErrors.password = 'Mật khẩu phải dài tối thiểu 8 ký tự.';
      hasError = true;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
      hasError = true;
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản dịch vụ.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signUp(cleanEmail, password);

      if (!result.success) {
        let msg = result.message || '';
        // Map lỗi từ Supabase sang tiếng Việt bảo mật
        if (msg.includes('User already registered') || msg.toLowerCase().includes('already exists')) {
          msg = 'Gmail này đã được đăng ký sử dụng.';
        } else if (msg.toLowerCase().includes('password should be') || msg.toLowerCase().includes('weak-password')) {
          msg = 'Mật khẩu quá ngắn (phải có ít nhất 6-8 ký tự).';
        } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
          msg = 'Không thể kết nối hệ thống. Vui lòng thử lại sau.';
        } else {
          msg = 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
        }
        setErrorMessage(msg);
        showToast('Đăng ký thất bại', msg, 'error');
        setIsSubmitting(false);
        return;
      }

      showToast('Đăng ký thành công!', 'Tài khoản Gmail của bạn đã được tạo và tự động đăng nhập.', 'success');
      router.push('/tai-khoan');
    } catch {
      setErrorMessage('Không thể kết nối hệ thống. Vui lòng thử lại sau giây lát.');
      showToast('Lỗi hệ thống', 'Không thể kết nối đến máy chủ xác thực.', 'error');
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
            Tạo Tài Khoản Mới
          </h1>
          <p className="text-xs text-slate-500">
            Đăng ký bằng Gmail để quản lý đơn hàng tại Dịch Vụ Số 24H
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

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <Input
            label="Địa chỉ Gmail"
            type="email"
            placeholder="Ví dụ: nickname@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="Chỉ chấp nhận địa chỉ kết thúc bằng @gmail.com."
            required
          />

          <div className="space-y-1">
            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 8 ký tự..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={errors.password}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Input
            label="Xác nhận mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="Nhập lại mật khẩu vừa đặt..."
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <div className="space-y-1 pt-1">
            <Checkbox
              label="Tôi đồng ý với Điều khoản dịch vụ & Chính sách bảo mật"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
              }}
            />
            {errors.agreeTerms && (
              <p className="text-xs text-red-600 font-medium pl-6">{errors.agreeTerms}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold justify-center"
            isLoading={isSubmitting}
          >
            <UserPlus className="w-4 h-4 mr-1.5" /> Đăng Ký Tài Khoản
          </Button>
        </form>

        {/* Footer */}
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          Đã có tài khoản?{' '}
          <Link href="/dang-nhap" className="font-bold text-[#0f4c81] hover:underline">
            Đăng nhập ngay
          </Link>
        </div>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cam kết bảo mật thông tin tài khoản
        </div>
      </div>
    </div>
  );
}
