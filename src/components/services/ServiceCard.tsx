'use client';

import React from 'react';
import Link from 'next/link';
import { Service } from '@/types/service';
import { productService } from '@/services/productService';
import { formatVND } from '@/utils/format';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Clock, ArrowRight } from 'lucide-react';

export function ServiceCard({ service }: { service: Service }) {
  const categoryMeta = productService.getCategoriesFlat().find((category) => category.slug === service.category);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 group">
      <div>
        {/* Card Header with Thumbnail & Badges */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          {service.thumbnailUrl ? (
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200/60 shadow-xs shrink-0 bg-white">
              <img src={service.thumbnailUrl} alt={service.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={`w-12 h-12 rounded-xl ${service.thumbnail.bg} flex items-center justify-center text-2xl shrink-0 border border-slate-200/60 shadow-xs`}
            >
              {service.thumbnail.emoji}
            </div>
          )}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={service.stockStatus} />
            {service.featured && <Badge variant="cyan">Bán chạy</Badge>}
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f4c81]">
              {categoryMeta?.name || service.category}
            </span>
          </div>

          <Link href={`/dich-vu/${service.slug}`} className="block group-hover:text-[#0f4c81] transition-colors">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
              {service.name}
            </h3>
          </Link>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {service.shortDescription}
          </p>

          <div className="space-y-1 pt-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{service.processingTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-0 space-y-3">
        <div className="border-t border-slate-100 pt-3 flex items-baseline justify-between gap-2">
          <div>
            <div className="text-base font-black text-[#0f4c81] leading-none">
              {formatVND(service.price)}
              <span className="text-[10px] font-normal text-slate-400 ml-1">/ {service.unit}</span>
            </div>
            {service.originalPrice && (
              <div className="text-[11px] text-slate-400 line-through mt-0.5">
                {formatVND(service.originalPrice)}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            Đã bán: <strong className="text-slate-700">{service.soldCount}</strong>
          </span>
        </div>

        <Link href={`/dich-vu/${service.slug}`} className="block">
          <Button variant="primary" size="sm" className="w-full justify-center group-hover:bg-[#125894]">
            Xem chi tiết <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
