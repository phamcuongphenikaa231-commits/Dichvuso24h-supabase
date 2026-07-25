'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('returnUrl') || searchParams.get('redirect') || '';
  const errorParam = searchParams.get('error');
  
  const { signIn } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    if (errorParam === 'locked') {
      const timer = setTimeout(() => {
        setErrorMessage('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ 24/7.');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [errorParam]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setErrors({});

    const cleanEmail = email.trim().toLowerCase();

    // Validate
    let hasError = false;
    const newErrors: typeof errors = {};

    if (!cleanEmail) {
      newErrors.email = 'Vui lòng nhập Gmail.';
      hasError = true;
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      if (!emailRegex.test(cleanEmail)) {
        newErrors.email = 'Chỉ chấp nhận Gmail (kết thúc bằng @gmail.com).';
        hasError = true;
      }
    }

    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn(cleanEmail, password);

      if (!result.success) {
        let msg = result.message || '';
        // Map mọi lỗi đăng nhập sai thông tin sang thông báo bảo mật
        if (
          msg.includes('Invalid login credentials') ||
          msg.toLowerCase().includes('invalid credentials') ||
          msg.toLowerCase().includes('not found') ||
          msg.toLowerCase().includes('invalid email')
        ) {
          msg = 'Gmail hoặc mật khẩu không chính xác.';
        } else if (msg.includes('bị khóa') || msg.toLowerCase().includes('locked')) {
          msg = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ 24/7.';
        } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
          msg = 'Không thể kết nối hệ thống. Vui lòng thử lại sau.';
        } else {
          msg = 'Gmail hoặc mật khẩu không chính xác.';
        }
        setErrorMessage(msg);
        showToast('Đăng nhập thất bại', msg, 'error');
        setIsSubmitting(false);
        return;
      }

      showToast('Đăng nhập thành công!', 'Chào mừng bạn quay trở lại Dịch Vụ Số 24H.', 'success');

      // Chuyển hướng dựa trên role
      if (result.user?.role === 'admin') {
        router.push('/admin');
      } else if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push('/tai-khoan');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau giây lát.');
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
            Đăng Nhập Tài Khoản
          </h1>
          <p className="text-xs text-slate-500">
            Sử dụng tài khoản Gmail đăng nhập vào Dịch Vụ Số 24H
          </p>
        </div>

        {/* Global Error Alert Banner */}
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
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Địa chỉ Gmail"
            type="email"
            placeholder="Ví dụ: username@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="space-y-1">
            <div className="relative">
              <Input
                label="Mật khẩu"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu của bạn..."
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

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              label="Ghi nhớ đăng nhập"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <Link
              href="/quen-mat-khau"
              className="text-xs font-semibold text-[#0f4c81] hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold justify-center"
            isLoading={isSubmitting}
          >
            <LogIn className="w-4 h-4 mr-1.5" /> Đăng Nhập
          </Button>
        </form>

        {/* Footer / Switch link */}
        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-600">
          Chưa có tài khoản?{' '}
          <Link href="/dang-ky" className="font-bold text-[#0f4c81] hover:underline">
            Đăng ký ngay
          </Link>
        </div>

        {/* Small Trust Note */}
        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Kết nối bảo mật chuẩn SSL & Giao dịch tự động
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="container-custom py-12 max-w-md mx-auto text-center text-xs text-slate-500">
          Đang tải trang đăng nhập...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
