'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, User, Shield, LifeBuoy, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

const NAV_ITEMS = [
  { href: '/tai-khoan', label: 'Tổng quan', icon: LayoutDashboard },
  { href: '/tai-khoan/don-hang', label: 'Đơn hàng của tôi', icon: ShoppingBag },
  { href: '/tai-khoan/ho-so', label: 'Thông tin hồ sơ', icon: User },
  { href: '/tai-khoan/bao-mat', label: 'Bảo mật tài khoản', icon: Shield },
  { href: '/tai-khoan/ho-tro', label: 'Yêu cầu hỗ trợ', icon: LifeBuoy },
];

export function AccountSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  if (!user) return null;

  const displayEmail = user.email || '';
  const maskedEmail = displayEmail.includes('@') 
    ? displayEmail.replace(/(.{3})(.*)(@.*)/, '$1***$3') 
    : displayEmail;
  const avatarInitials = (user.username || 'US').substring(0, 2).toUpperCase();

  return (
    <div className="hidden lg:block w-64 shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
        {/* User Profile Summary */}
        <div className="p-6 bg-slate-50 border-b border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-primary text-white flex items-center justify-center text-xl font-bold mb-3 shadow-md">
            {avatarInitials}
          </div>
          <h3 className="font-semibold text-gray-900 truncate w-full">{user.username}</h3>
          <p className="text-sm text-gray-500 mt-1">{maskedEmail}</p>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/tai-khoan' && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-primary/10 text-brand-primary'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-primary' : 'text-gray-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <Button
            variant="outline"
            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}
