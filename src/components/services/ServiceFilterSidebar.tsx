'use client';

import React, { useState } from 'react';
import { ServiceFilters, PriceRange, StockStatus, CategoryMeta } from '@/types/service';
import { PRICE_RANGES } from '@/data/services';
import { productService } from '@/services/productService';
import { Filter, RotateCcw, Check, ChevronDown, ChevronRight } from 'lucide-react';

export interface ServiceFilterSidebarProps {
  filters: ServiceFilters;
  onFilterChange: (updater: Partial<ServiceFilters>) => void;
  onReset: () => void;
  hideCategoryFilter?: boolean;
}

// ─── Category accordion item ──────────────────────────────────────────────────
function CategoryItem({
  cat,
  filters,
  onFilterChange,
}: {
  cat: CategoryMeta;
  filters: ServiceFilters;
  onFilterChange: (updater: Partial<ServiceFilters>) => void;
}) {
  const hasChildren = cat.children && cat.children.length > 0;
  // Expand if parent or any child is selected
  const isParentSelected = filters.category === cat.slug;
  const isChildSelected = hasChildren && cat.children!.some((ch) => filters.category === ch.slug);
  const [open, setOpen] = useState(isParentSelected || isChildSelected);

  const activeClass = 'bg-[#f0f7ff] text-[#0f4c81] font-bold';
  const idleClass = 'text-slate-700 hover:bg-slate-50';

  return (
    <div>
      {/* Root category row */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onFilterChange({ category: cat.slug, page: 1 })}
          className={`flex-1 flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
            isParentSelected ? activeClass : idleClass
          }`}
        >
          <span className="flex items-center gap-2 truncate">
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </span>
          {isParentSelected && <Check className="w-3.5 h-3.5 text-[#0f4c81] shrink-0" />}
        </button>

        {/* Toggle children if any */}
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-slate-200 pl-2">
          {cat.children!.map((child) => {
            const isSelected = filters.category === child.slug;
            return (
              <button
                key={child.slug}
                onClick={() => onFilterChange({ category: child.slug, page: 1 })}
                className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected ? activeClass : idleClass
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className="opacity-60">{child.icon}</span>
                  <span>{child.name}</span>
                </span>
                {isSelected && <Check className="w-3 h-3 text-[#0f4c81] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function ServiceFilterSidebar({
  filters,
  onFilterChange,
  onReset,
  hideCategoryFilter = false,
}: ServiceFilterSidebarProps) {
  const categories = productService.getCategories();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <Filter className="w-4 h-4 text-[#0f4c81]" />
          <span>Bộ lọc tìm kiếm</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-[#0f4c81] flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Xóa bộ lọc
        </button>
      </div>

      {/* 1. Category Filter — 2-level */}
      {!hideCategoryFilter && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Danh mục dịch vụ
          </h4>
          <div className="space-y-1">
            {/* "All" button */}
            <button
              onClick={() => onFilterChange({ category: 'all', page: 1 })}
              className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filters.category === 'all'
                  ? 'bg-[#f0f7ff] text-[#0f4c81] font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Tất cả danh mục</span>
              {filters.category === 'all' && <Check className="w-3.5 h-3.5 text-[#0f4c81]" />}
            </button>

            {/* Root categories with nested children */}
            {categories.map((cat) => (
              <CategoryItem key={cat.slug} cat={cat} filters={filters} onFilterChange={onFilterChange} />
            ))}
          </div>
        </div>
      )}

      {/* 2. Price Range Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Khoảng giá
        </h4>
        <div className="space-y-1">
          {PRICE_RANGES.map((pr) => {
            const isSelected = filters.priceRange === pr.value;
            return (
              <button
                key={pr.value}
                onClick={() => onFilterChange({ priceRange: pr.value as PriceRange, page: 1 })}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#f0f7ff] text-[#0f4c81] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{pr.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0f4c81]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Stock Status Filter */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Trạng thái hàng
        </h4>
        <div className="space-y-1">
          {[
            { value: 'all', label: 'Tất cả trạng thái' },
            { value: 'available', label: 'Còn hàng (Có thể đặt)' },
            { value: 'maintenance', label: 'Bảo trì tạm thời' },
            { value: 'out_of_stock', label: 'Hết hàng' },
          ].map((st) => {
            const isSelected = filters.stockStatus === st.value;
            return (
              <button
                key={st.value}
                onClick={() => onFilterChange({ stockStatus: st.value as StockStatus, page: 1 })}
                className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#f0f7ff] text-[#0f4c81] font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{st.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0f4c81]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
