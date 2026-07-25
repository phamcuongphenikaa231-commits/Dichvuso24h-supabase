export type ProductStatus = 'available' | 'out_of_stock' | 'maintenance';

export interface DigitalAccountProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  soldCount: number;
  description: string;
  features: string[];
  status: ProductStatus;
  badgeText?: string;
  updatedAt: string;
}

export interface SocialServiceItem {
  id: string;
  title: string;
  platform: 'facebook' | 'tiktok' | 'youtube' | 'instagram' | 'telegram' | 'other';
  pricePerUnit: number;
  minQuantity: number;
  maxQuantity: number;
  estimatedTime: string;
  description: string;
  guaranteeDays: number;
  status: 'active' | 'maintenance';
}

export interface NavigationItem {
  label: string;
  href: string;
  badge?: string;
  iconName?: string;
  children?: { label: string; href: string; description?: string }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  price: number;
  quantity: number;
  type: 'account' | 'service';
}
