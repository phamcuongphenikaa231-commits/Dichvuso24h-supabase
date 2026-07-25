'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, ShoppingBag, User, Shield, LifeBuoy, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const NAV_ITEMS = [
  { href: '/tai-khoan', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/tai-khoan/don-hang', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/tai-khoan/ho-so', label: 'Hồ sơ', icon: User },
  { href: '/tai-khoan/bao-mat', label: 'Bảo mật', icon: Shield },
  { href: '/tai-khoan/ho-tro', label: 'Hỗ trợ', icon: LifeBuoy },
];

export function AccountMobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const displayEmail = user.email || '';
  const maskedEmail = displayEmail.includes('@') 
    ? displayEmail.replace(/(.{3})(.*)(@.*)/, '$1***$3') 
    : displayEmail;
  const avatarInitials = (user.username || 'US').substring(0, 2).toUpperCase();

  return (
    <div className="lg:hidden mb-6">
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white"
      >
        <span className="font-medium text-gray-900">
          Menu Tài khoản
        </span>
        <Menu className="w-5 h-5 text-gray-500" />
      </Button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Content */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Tài khoản</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold">
            {avatarInitials}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-500">{maskedEmail}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/tai-khoan' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-brand-primary/10 text-brand-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
