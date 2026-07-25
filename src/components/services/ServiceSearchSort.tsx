'use client';

import React from 'react';
import { ServiceFilters, SortOption } from '@/types/service';
import { SORT_OPTIONS } from '@/data/services';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Search, SlidersHorizontal, X } from 'lucide-react';

export interface ServiceSearchSortProps {
  filters: ServiceFilters;
  onFilterChange: (updater: Partial<ServiceFilters>) => void;
  totalResults: number;
  onOpenMobileFilter: () => void;
}

export function ServiceSearchSort({
  filters,
  onFilterChange,
  totalResults,
  onOpenMobileFilter,
}: ServiceSearchSortProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Input
            placeholder="Tìm theo tên dịch vụ, từ khóa (VD: chatgpt, canva, follow, vps)..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="pl-9 pr-8 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '', page: 1 })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden flex items-center gap-1.5 text-xs text-slate-700 border-slate-300"
            onClick={onOpenMobileFilter}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0f4c81]" />
            <span>Bộ lọc</span>
            {(filters.priceRange !== 'all' || filters.stockStatus !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
            )}
          </Button>

          {/* Sort selector */}
          <div className="w-44 sm:w-48 shrink-0">
            <Select
              value={filters.sort}
              onChange={(e) => onFilterChange({ sort: e.target.value as SortOption, page: 1 })}
              options={SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
              className="text-xs py-1.5"
            />
          </div>
        </div>
      </div>

      {/* Results summary bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <div>
          Hiển thị <strong className="text-slate-800">{totalResults}</strong> dịch vụ phù hợp
        </div>
        {filters.search && (
          <div className="text-slate-600">
            Từ khóa: <span className="font-semibold text-[#0f4c81]">&ldquo;{filters.search}&rdquo;</span>
          </div>
        )}
      </div>
    </div>
  );
}
