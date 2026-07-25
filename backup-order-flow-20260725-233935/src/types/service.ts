// ─── Service Types ───────────────────────────────────────────────────────────

import { PurchaseFlowType } from '@/types/order';

export type StockStatus = 'available' | 'out_of_stock' | 'maintenance';
// CategorySlug is now dynamic — categories come from Supabase
export type CategorySlug = string;

export type SortOption =
  | 'newest'
  | 'price_asc'
  | 'price_desc'
  | 'popular';

export type PriceRange =
  | 'under_100k'
  | '100k_300k'
  | '300k_500k'
  | 'above_500k'
  | 'all';

export interface ServiceInputDefinition {
  id: string;
  label: string;
  type: 'text' | 'url' | 'email' | 'textarea' | 'number';
  required: boolean;
  placeholder: string;
}

export interface Service {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: CategorySlug;
  price: number;
  originalPrice?: number;
  unit: string; // e.g. "tháng", "năm", "1.000 đơn vị"
  thumbnail: {
    emoji: string;
    bg: string; // tailwind bg class
  };
  thumbnailUrl?: string | null;
  thumbnailPath?: string | null;
  stockStatus: StockStatus;
  processingTime: string;
  warranty: string;
  tags: string[];
  featured: boolean;
  active: boolean;
  purchaseFlowType: PurchaseFlowType;
  minQuantity?: number;
  maxQuantity?: number;
  customFields?: ServiceInputDefinition[];
  instructions?: string;
  termsAndConditions?: string;
  soldCount: number;
  createdAt: string; // ISO date string for sorting by newest
}

export interface CategoryMeta {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  icon: string; // emoji
  href: string;
  color: string; // for accent
  count?: number; // populated at runtime
  parentId?: string | null;       // null = danh mục lớn
  children?: CategoryMeta[];      // populated at runtime
  imageUrl?: string | null;
  imagePath?: string | null;
}

// ─── Filter State ────────────────────────────────────────────────────────────

export interface ServiceFilters {
  search: string;
  category: CategorySlug | 'all';
  priceRange: PriceRange;
  stockStatus: StockStatus | 'all';
  sort: SortOption;
  page: number;
}
