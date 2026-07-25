'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CategoryMeta, CategorySlug } from '@/types/service';
import { productService } from '@/services/productService';
import { Service } from '@/types/service';
import { useServiceFilters } from '@/hooks/useServiceFilters';
import { filterServices, sortServices, paginateServices } from '@/utils/filterServices';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { ServiceSearchSort } from './ServiceSearchSort';
import { ServiceFilterSidebar } from './ServiceFilterSidebar';
import { ServiceFilterDrawer } from './ServiceFilterDrawer';
import { ServiceCard } from './ServiceCard';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/ui/EmptyState';
import { ArrowLeft, ChevronRight, Layers } from 'lucide-react';

export interface ServiceListContainerProps {
  categoryMeta?: CategoryMeta; // If specified, locked to category view
}

export function ServiceListContainer({ categoryMeta }: ServiceListContainerProps) {
  const initialCat: CategorySlug | 'all' = categoryMeta ? categoryMeta.slug : 'all';
  const { filters, setFilters, resetFilters } = useServiceFilters({ initialCategory: initialCat });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [services, setServices] = useState<Service[]>(() => productService.getActive());
  const [categories, setCategories] = useState(() => productService.getCategories());

  useEffect(() => {
    const refresh = () => {
      setServices(productService.getActive());
      setCategories(productService.getCategories());
    };
    refresh();
    return productService.subscribe(refresh);
  }, []);

  // Resolve hierarchy for category view
  const hierarchy = useMemo(() => {
    if (!categoryMeta) return undefined;
    return productService.getCategoryHierarchy(categoryMeta.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryMeta, categories]);

  const isRootWithChildren = hierarchy?.type === 'root_with_children';
  const isChildCategory = hierarchy?.type === 'child';
  const parentCategory = hierarchy?.parent;
  const childCategories = hierarchy?.children || [];

  // Filter & sort services (only needed if NOT showing root subcategory cards)
  const filteredList = useMemo(() => {
    const activeFilters = categoryMeta ? { ...filters, category: categoryMeta.slug } : filters;
    return filterServices(services, activeFilters, categories);
  }, [filters, categoryMeta, services, categories]);

  const sortedList = useMemo(() => {
    return sortServices(filteredList, filters.sort);
  }, [filteredList, filters.sort]);

  const { items, totalPages, currentPage, totalItems } = useMemo(() => {
    return paginateServices(sortedList, filters.page);
  }, [sortedList, filters.page]);

  // Breadcrumbs setup
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (isChildCategory && parentCategory) {
      return [
        { label: 'Trang chủ', href: '/' },
        { label: parentCategory.name, href: parentCategory.href },
        { label: categoryMeta?.name || '' },
      ];
    }
    if (categoryMeta) {
      return [
        { label: 'Trang chủ', href: '/' },
        { label: categoryMeta.name },
      ];
    }
    return [{ label: 'Trang chủ', href: '/' }, { label: 'Danh sách dịch vụ' }];
  }, [isChildCategory, parentCategory, categoryMeta]);

  return (
    <div className="container-custom py-8 space-y-6">
      {/* Top Breadcrumb & Action */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumb items={breadcrumbItems} />

          {/* Back button when viewing child category */}
          {isChildCategory && parentCategory && (
            <Link
              href={parentCategory.href}
              className="inline-flex items-center gap-2 text-xs font-bold text-[#0f4c81] hover:text-[#125894] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl border border-blue-200 transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại {parentCategory.name}</span>
            </Link>
          )}
        </div>

        {/* Category Header Banner */}
        <div className="bg-gradient-to-r from-[#0f4c81] to-[#125894] text-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-cyan-200">
            <span>{categoryMeta ? categoryMeta.icon : '⚡'}</span>
            <span>{categoryMeta ? categoryMeta.shortName : 'Hệ thống tự động 24/7'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {categoryMeta ? categoryMeta.name : 'Tất Cả Dịch Vụ Số & Tài Khoản'}
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100/90 leading-relaxed max-w-2xl">
            {categoryMeta
              ? categoryMeta.description || `Khám phá danh mục ${categoryMeta.name} với các dịch vụ chất lượng cao, giao hàng nhanh chóng.`
              : 'Duyệt danh sách các gói tài khoản số cao cấp, dịch vụ mạng xã hội, VPS và công cụ trực tuyến minh bạch, chất lượng cao.'}
          </p>
        </div>
      </div>

      {/* CASE 1: Root category with child categories -> Show Child Category Cards Grid */}
      {isRootWithChildren ? (
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-2 text-[#0f4c81] font-bold text-lg border-b border-slate-200 pb-3">
            <Layers className="w-5 h-5 text-[#0f4c81]" />
            <h2>Chọn danh mục dịch vụ ({childCategories.length})</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {childCategories.map((child) => (
              <Link
                key={child.slug}
                href={child.href}
                className="group bg-white border border-slate-200 hover:border-[#0f4c81] hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col cursor-pointer relative"
              >
                {child.imageUrl && (
                  <div className="w-full h-32 bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={child.imageUrl} alt={child.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      {!child.imageUrl && (
                        <div className="w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-[#0f4c81] text-2xl flex items-center justify-center text-[#0f4c81] group-hover:text-white transition-colors border border-blue-100 shrink-0">
                          {child.icon}
                        </div>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 group-hover:bg-blue-50 group-hover:text-[#0f4c81] text-slate-600 text-xs font-semibold transition-colors ${child.imageUrl ? 'ml-auto' : ''}`}>
                        {child.count || 0} dịch vụ
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#0f4c81] transition-colors">
                        {child.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {child.description || `Các gói dịch vụ ${child.name} uy tín, tự động.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-[#0f4c81]">
                    <span>Xem dịch vụ</span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        /* CASE 2 & 3 & 4: Show Product Grid with Filter Sidebar & Search/Sort */
        <>
          {/* Search & Sort Bar */}
          <ServiceSearchSort
            filters={filters}
            onFilterChange={setFilters}
            totalResults={totalItems}
            onOpenMobileFilter={() => setIsDrawerOpen(true)}
          />

          {/* Main Grid + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-3 sticky top-24">
              <ServiceFilterSidebar
                filters={filters}
                onFilterChange={setFilters}
                onReset={resetFilters}
                hideCategoryFilter={!!categoryMeta}
              />
            </div>

            {/* Product Cards Area */}
            <div className="lg:col-span-9 space-y-6">
              {items.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="pt-4 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => setFilters({ page })}
                      />
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  title="Không tìm thấy dịch vụ nào"
                  description="Rất tiếc, không có gói dịch vụ nào khớp với bộ lọc hoặc từ khóa tìm kiếm của bạn. Vui lòng thử tìm từ khóa khác hoặc đặt lại bộ lọc."
                  actionText="Xóa tất cả bộ lọc"
                  onAction={resetFilters}
                />
              )}
            </div>
          </div>

          {/* Mobile Drawer Filter */}
          <ServiceFilterDrawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
            filters={filters}
            onFilterChange={setFilters}
            onReset={resetFilters}
            resultCount={totalItems}
            hideCategoryFilter={!!categoryMeta}
          />
        </>
      )}
    </div>
  );
}
