'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { ServiceForm } from '@/components/admin/ServiceForm';
import { Button } from '@/components/ui/Button';
import { productService } from '@/services/productService';
import { AdminService } from '@/types/admin';

export default function AdminEditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const decodedId = decodeURIComponent(id);
  const [service, setService] = useState<AdminService | null | undefined>(undefined);

  useEffect(() => {
    const refresh = () => {
      const found = productService.getAdminServiceById(decodedId);
      setService(found || (productService.isLoaded() ? null : undefined));
    };
    const unsubscribe = productService.subscribe(refresh);
    return () => {
      unsubscribe();
    };
  }, [decodedId]);

  if (service === undefined) {
    return (
      <div className="py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-primary" />
        <p className="text-sm text-slate-500 mt-3">Đang tải dịch vụ từ Supabase...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="py-16 text-center space-y-4">
        <h1 className="text-xl font-bold">Không tìm thấy dịch vụ</h1>
        <Link href="/admin/dich-vu"><Button>Quay lại danh sách</Button></Link>
      </div>
    );
  }

  return <ServiceForm initialData={service} isEdit />;
}
