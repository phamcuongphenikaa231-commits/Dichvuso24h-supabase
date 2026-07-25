'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users,
  Settings,
  LogOut,
  HeadphonesIcon,
  CreditCard,
  Tag,
  FileText,
  Activity,
  ShoppingBag,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export const ADMIN_NAV_ITEMS = [
  { href: '/admin', label: 'Bảng điều khiển', icon: LayoutDashboard, exact: true },
  { href: '/admin/dich-vu', label: 'Dịch vụ', icon: Package },
  { href: '/admin/danh-muc', label: 'Danh mục', icon: FolderTree },
  { href: '/admin/don-hang', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/admin/khach-hang', label: 'Khách hàng', icon: Users },
  { href: '/admin/ho-tro', label: 'Hỗ trợ', icon: HeadphonesIcon },
  { href: '/admin/thanh-toan', label: 'Thanh toán', icon: CreditCard },
  { href: '/admin/ma-giam-gia', label: 'Mã giảm giá', icon: Tag },
  { href: '/admin/noi-dung', label: 'Nội dung', icon: FileText },
  { href: '/admin/nhat-ky', label: 'Nhật ký', icon: Activity },
  { href: '/admin/cai-dat', label: 'Cài đặt', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 min-h-screen shrink-0 sticky top-0 h-screen border-r border-slate-800">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white tracking-tight">DVS24H <span className="text-brand-primary">Admin</span></h2>
      </div>

      {/* User Info */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0 text-sm">
          AD
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{user?.fullName || 'Quản trị viên'}</p>
          <p className="text-xs text-slate-500 truncate">{user?.username}</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3">
        <nav className="space-y-0.5 px-3">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-primary text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="outline"
          className="w-full justify-start text-red-400 border-slate-700 hover:bg-slate-800 hover:text-red-300"
          onClick={() => signOut()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
