'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, ExternalLink } from 'lucide-react';
import { ADMIN_NAV_ITEMS } from './AdminSidebar';
import { useAuth } from '@/context/AuthContext';

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <>
      <div className="lg:hidden px-4 py-3 bg-slate-900 text-white flex justify-between items-center shrink-0 sticky top-0 z-40">
        <div>
          <p className="font-bold">DVS24H Admin</p>
          <p className="text-[11px] text-slate-400 truncate max-w-[210px]">{user?.fullName || user?.username}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700"
          aria-label="Mở menu quản trị"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/65"
            aria-label="Đóng menu quản trị"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[84%] max-w-xs bg-slate-900 text-slate-300 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">DVS24H Admin</p>
                <p className="text-xs text-slate-500">{user?.username}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-slate-800" aria-label="Đóng menu">
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {ADMIN_NAV_ITEMS.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active ? 'bg-[#0f4c81] text-white' : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-800 space-y-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-800 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" /> Xem website
              </Link>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-slate-800"
              >
                <LogOut className="w-4 h-4" /> Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
