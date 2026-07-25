'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '../ui/Toast';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileDrawer } from './MobileDrawer';

export const SiteLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <AuthProvider>
      <ToastProvider>
        {isAdminRoute ? (
          children
        ) : (
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
            <AnnouncementBar />
            <Header onOpenMobileDrawer={() => setIsMobileDrawerOpen(true)} />
            <main className="flex-1 pb-12">{children}</main>
            <Footer />
            <MobileDrawer
              isOpen={isMobileDrawerOpen}
              onClose={() => setIsMobileDrawerOpen(false)}
            />
          </div>
        )}
      </ToastProvider>
    </AuthProvider>
  );
};
