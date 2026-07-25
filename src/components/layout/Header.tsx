'use client';

import React, { FormEvent, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { NAV_ITEMS } from '@/data/mockData';
import { Search, ClipboardList, Menu, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { cn } from '@/utils/cn';

export interface HeaderProps {
  onOpenMobileDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileDrawer }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/dich-vu?q=${encodeURIComponent(query)}` : '/dich-vu');
  };

  const orderHref = user
    ? user.role === 'admin'
      ? '/admin/don-hang'
      : '/tai-khoan/don-hang'
    : '/dang-nhap?redirect=%2Ftai-khoan%2Fdon-hang';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="container-custom py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileDrawer}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Mở menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f4c81] to-[#06b6d4] text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              24H
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 text-lg tracking-tight leading-none">
                Dịch Vụ Số <span className="text-[#06b6d4]">24H</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Hệ thống tài khoản & DV số
              </span>
            </div>
          </Link>
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <Input
            placeholder="Tìm kiếm tài khoản, dịch vụ..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            className="rounded-full bg-slate-50 border-slate-200 focus:bg-white text-xs py-1.5"
          />
        </form>

        <div className="flex items-center gap-2.5">
          <Link href={orderHref}>
            <button
              className="p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Đơn hàng của tôi"
              title="Đơn hàng của tôi"
            >
              <ClipboardList className="w-5 h-5 text-slate-700" />
            </button>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1.5 pl-3 pr-2.5 shadow-2xs">
                <span className="text-xs font-semibold text-slate-700 max-w-[140px] truncate" title={user.username}>
                  {user.username}
                </span>
                
                {user.role === 'admin' && (
                  <Link href="/admin">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] py-1 px-2 rounded-full uppercase cursor-pointer"
                    >
                      Quản trị
                    </Button>
                  </Link>
                )}

                <Link href="/tai-khoan">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-[#0f4c81] font-bold text-[11px] px-2 py-1 cursor-pointer"
                  >
                    Tài khoản
                  </Button>
                </Link>

                <Link href="/tai-khoan/don-hang">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-600 hover:text-[#0f4c81] font-bold text-[11px] px-2 py-1 cursor-pointer"
                  >
                    Lịch sử mua hàng
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold text-[11px] px-2 py-1 cursor-pointer"
                  onClick={() => signOut()}
                >
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <>
                <Link href="/dang-nhap">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-4 h-4" /> Đăng nhập
                  </Button>
                </Link>
                <Link href="/dang-ky">
                  <Button variant="primary" size="sm">
                    <UserPlus className="w-4 h-4" /> Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:block bg-slate-50 border-t border-slate-100">
        <div className="container-custom">
          <nav className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5',
                    isActive
                      ? 'text-[#0f4c81] font-bold border-b-2 border-[#0f4c81] bg-white'
                      : 'text-slate-700 hover:text-[#0f4c81] hover:bg-slate-100/60'
                  )}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
