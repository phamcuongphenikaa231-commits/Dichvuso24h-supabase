'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ServiceDetailView } from '@/components/services/ServiceDetailView';
import { Button } from '@/components/ui/Button';
import { productService } from '@/services/productService';
import { Service } from '@/types/service';

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const decodedSlug = decodeURIComponent(slug);
  const [service, setService] = useState<Service | null | undefined>(undefined);

  useEffect(() => {
    const refresh = () => setService(productService.getBySlug(decodedSlug) || null);
    refresh();
    return productService.subscribe(refresh);
  }, [decodedSlug]);

  if (service === undefined) {
    return (
      <div className="container-custom py-16 text-center">
        <Loader2 className="w-9 h-9 animate-spin text-[#0f4c81] mx-auto" />
        <p className="text-sm text-slate-500 mt-3">Đang tải dịch vụ...</p>
      </div>
    );
  }

  if (!service || !service.active) {
    return (
      <div className="container-custom py-16 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">Dịch vụ không tồn tại hoặc đang tạm ẩn</h1>
        <p className="text-sm text-slate-500">
          Dịch vụ này có thể đã được admin tạm dừng hoặc đường dẫn không còn hợp lệ.
        </p>
        <Link href="/dich-vu">
          <Button variant="primary">Xem tất cả dịch vụ</Button>
        </Link>
      </div>
    );
  }

  return <ServiceDetailView service={service} />;
}
