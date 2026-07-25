import type { Metadata } from 'next';
import './globals.css';
import { SiteLayoutWrapper } from '@/components/layout/SiteLayoutWrapper';
import FloatingSupportChat from '@/components/layout/FloatingSupportChat';

export const metadata: Metadata = {
  title: 'Dịch Vụ Số 24H - Cửa hàng dịch vụ số & tài khoản uy tín hàng đầu',
  description:
    'Hệ thống cung cấp tài khoản AI, Canva Pro, Youtube Premium, Spotify và dịch vụ tương tác mạng xã hội uy tín 24/7 tại Việt Nam.',
  keywords: [
    'dịch vụ số 24h',
    'mua tài khoản chatgpt plus',
    'mua canva pro',
    'mua youtube premium gia re',
    'dich vu tang follow facebook',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <FloatingSupportChat />
        <SiteLayoutWrapper>{children}</SiteLayoutWrapper>
      </body>
    </html>
  );
}
