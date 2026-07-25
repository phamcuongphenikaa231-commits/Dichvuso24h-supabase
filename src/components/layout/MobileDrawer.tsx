'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/data/mockData';
import { X, LogIn, UserPlus, PhoneCall, ShieldCheck, ClipboardList, User, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';
import { settingsService } from '@/services/settingsService';

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState(() => settingsService.getSettings());

  useEffect(() => {
    const unsubscribe = settingsService.subscribe(() => setSettings(settingsService.getSettings()));
    void settingsService.refresh();
    return unsubscribe;
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 left-0 w-[80%] max-w-xs bg-white shadow-2xl z-10 flex flex-col justify-between animate-in slide-in-from-left duration-200">
        <div>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0f4c81] text-white flex items-center justify-center font-bold text-sm">
                24H
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-base">
                Dịch Vụ Số <span className="text-[#06b6d4]">24H</span>
              </span>
            </Link>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-md" aria-label="Đóng menu">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link href={user.role === 'admin' ? '/admin' : '/tai-khoan'} onClick={onClose}>
                  <Button variant="primary" size="sm" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" /> {user.username}
                  </Button>
                </Link>
                <Link href={user.role === 'admin' ? '/admin/don-hang' : '/tai-khoan/don-hang'} onClick={onClose}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ClipboardList className="w-4 h-4 mr-2" /> Đơn hàng
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-600"
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" onClick={onClose}>
                  <Button variant="primary" size="sm" className="w-full justify-start">
                    <LogIn className="w-4 h-4 mr-2" /> Đăng nhập tài khoản
                  </Button>
                </Link>
                <Link href="/dang-ky" onClick={onClose}>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <UserPlus className="w-4 h-4 mr-2" /> Đăng ký thành viên
                  </Button>
                </Link>
              </>
            )}
          </div>

          <nav className="p-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#f0f7ff] text-[#0f4c81] font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2 font-medium text-slate-700">
            <PhoneCall className="w-4 h-4 text-[#0f4c81]" />
            <span>Hotline: {settings.hotline}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Phiên đăng nhập được bảo vệ; không chia sẻ mật khẩu.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
