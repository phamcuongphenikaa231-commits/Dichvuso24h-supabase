'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { productService } from '@/services/productService';
import { CategoryMeta } from '@/types/service';
import { ServiceListContainer } from '@/components/services/ServiceListContainer';
import { Skeleton } from '@/components/ui/Skeleton';

function Loading() {
  return (
    <div className="container-custom py-8 space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function DichVuTuongTacPage() {
  const [categoryMeta, setCategoryMeta] = useState<CategoryMeta | undefined>(() =>
    productService.getCategoriesFlat().find((c) => c.slug === 'dich-vu-tuong-tac')
  );

  useEffect(() => {
    const refresh = () => {
      setCategoryMeta(productService.getCategoriesFlat().find((c) => c.slug === 'dich-vu-tuong-tac'));
    };
    refresh();
    const unsubscribe = productService.subscribe(refresh);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <ServiceListContainer categoryMeta={categoryMeta} />
    </Suspense>
  );
}
