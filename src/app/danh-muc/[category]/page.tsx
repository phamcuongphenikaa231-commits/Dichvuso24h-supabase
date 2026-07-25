'use client';

import React, { Suspense, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { productService } from '@/services/productService';
import { CategoryMeta } from '@/types/service';
import { ServiceListContainer } from '@/components/services/ServiceListContainer';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

function CategoryLoading() {
  return (
    <div className="container-custom py-8 space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="hidden lg:block lg:col-span-3">
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = use(params);
  const [categoryMeta, setCategoryMeta] = useState<CategoryMeta | undefined>();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const hierarchy = productService.getCategoryHierarchy(category);
      setCategoryMeta(hierarchy?.category);
      setLoaded(true);
    };
    refresh();
    const unsubscribe = productService.subscribe(refresh);
    return () => {
      unsubscribe();
    };
  }, [category]);

  if (!loaded) return <CategoryLoading />;
  if (!categoryMeta) {
    return (
      <div className="container-custom py-20 text-center space-y-4">
        <div className="text-5xl">📂</div>
        <h1 className="text-2xl font-bold text-slate-900">Không tìm thấy danh mục</h1>
        <p className="text-sm text-slate-500">Danh mục này không tồn tại hoặc đang bị ẩn.</p>
        <Link href="/dich-vu">
          <Button>Xem tất cả dịch vụ</Button>
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<CategoryLoading />}>
      <ServiceListContainer categoryMeta={categoryMeta} />
    </Suspense>
  );
}
