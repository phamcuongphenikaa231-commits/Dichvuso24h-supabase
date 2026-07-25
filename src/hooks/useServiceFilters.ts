'use client';

import { useState, useCallback, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ServiceFilters, CategorySlug, PriceRange, StockStatus, SortOption } from '@/types/service';

export interface UseServiceFiltersProps {
  initialCategory?: CategorySlug | 'all';
}

export function useServiceFilters({ initialCategory = 'all' }: UseServiceFiltersProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read initial filter values from searchParams if present, fallback to defaults
  const [filters, setFiltersState] = useState<ServiceFilters>(() => {
    const qSearch = searchParams.get('q') || '';
    const qCategory = (searchParams.get('category') as CategorySlug) || initialCategory;
    const qPrice = (searchParams.get('price') as PriceRange) || 'all';
    const qStock = (searchParams.get('stock') as StockStatus) || 'all';
    const qSort = (searchParams.get('sort') as SortOption) || 'newest';
    const qPage = parseInt(searchParams.get('page') || '1', 10) || 1;

    return {
      search: qSearch,
      category: qCategory,
      priceRange: qPrice,
      stockStatus: qStock,
      sort: qSort,
      page: qPage,
    };
  });

  // Function to sync filters with URL query parameters
  const updateUrlParams = useCallback(
    (newFilters: ServiceFilters) => {
      const params = new URLSearchParams();

      if (newFilters.search.trim()) {
        params.set('q', newFilters.search.trim());
      }
      if (newFilters.category !== 'all' && initialCategory === 'all') {
        params.set('category', newFilters.category);
      }
      if (newFilters.priceRange !== 'all') {
        params.set('price', newFilters.priceRange);
      }
      if (newFilters.stockStatus !== 'all') {
        params.set('stock', newFilters.stockStatus);
      }
      if (newFilters.sort !== 'newest') {
        params.set('sort', newFilters.sort);
      }
      if (newFilters.page > 1) {
        params.set('page', newFilters.page.toString());
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      startTransition(() => {
        router.replace(newUrl, { scroll: false });
      });
    },
    [pathname, router, initialCategory]
  );

  const setFilters = useCallback(
    (updater: Partial<ServiceFilters> | ((prev: ServiceFilters) => ServiceFilters)) => {
      setFiltersState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        updateUrlParams(next);
        return next;
      });
    },
    [updateUrlParams]
  );

  const resetFilters = useCallback(() => {
    const defaultFilters: ServiceFilters = {
      search: '',
      category: initialCategory,
      priceRange: 'all',
      stockStatus: 'all',
      sort: 'newest',
      page: 1,
    };
    setFiltersState(defaultFilters);
    updateUrlParams(defaultFilters);
  }, [initialCategory, updateUrlParams]);

  return {
    filters,
    setFilters,
    resetFilters,
    isPending,
  };
}
