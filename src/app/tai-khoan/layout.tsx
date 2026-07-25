import { ReactNode } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { AccountMobileDrawer } from '@/components/account/AccountMobileDrawer';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="bg-gray-50 min-h-screen pb-12">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <AccountSidebar />
            <div className="flex-1 min-w-0">
              <AccountMobileDrawer />
              {children}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
