'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';

export interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, profile, role, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Chưa đăng nhập -> Redirect về đăng nhập kèm returnUrl
        router.replace(`/dang-nhap?returnUrl=${encodeURIComponent(pathname)}`);
      } else if (profile && profile.status === 'locked') {
        // Tài khoản bị khóa -> Logout và redirect
        signOut().then(() => {
          router.replace('/dang-nhap?error=locked');
        });
      } else if (requiredRole && role !== requiredRole) {
        // Logged in but insufficient permissions (e.g. non-admin accessing /admin)
        if (requiredRole === 'admin') {
          router.replace('/tai-khoan');
        }
      }
    }
  }, [user, profile, role, isLoading, requiredRole, pathname, router, signOut]);

  if (isLoading) {
    return (
      <div className="container-custom py-12 max-w-xl mx-auto space-y-4">
        <Skeleton className="h-8 w-1/2 mx-auto" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  if (!user || (profile && profile.status === 'locked')) {
    return null; // Sẽ redirect
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <div className="container-custom py-12 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Truy cập bị từ chối</h2>
        <p className="text-xs text-slate-500">
          Tài khoản của bạn không có quyền truy cập vào trang này. Đang chuyển hướng...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
