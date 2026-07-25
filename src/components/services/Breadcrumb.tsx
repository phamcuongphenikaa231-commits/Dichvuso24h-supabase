import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-2.5 px-3 bg-slate-100/70 rounded-lg text-xs">
      <ol className="flex items-center flex-wrap gap-1 text-slate-600">
        <li className="inline-flex items-center gap-1">
          <Link href="/" className="hover:text-[#0f4c81] transition-colors flex items-center gap-1 font-medium">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Trang chủ</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-1">
            <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[#0f4c81] transition-colors font-medium">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
