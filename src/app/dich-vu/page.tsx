import React, { Suspense } from 'react';
import { ServiceListContainer } from '@/components/services/ServiceListContainer';
import { Skeleton } from '@/components/ui/Skeleton';

function ServiceListLoading() {
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
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<ServiceListLoading />}>
      <ServiceListContainer />
    </Suspense>
  );
}
