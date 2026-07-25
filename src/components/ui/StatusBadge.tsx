import React from 'react';
import { Badge } from './Badge';
import { ProductStatus } from '@/types';

export interface StatusBadgeProps {
  status: ProductStatus | 'active' | 'maintenance' | 'completed' | 'pending';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'available':
    case 'active':
    case 'completed':
      return (
        <Badge variant="success">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
          Còn hàng / Đang chạy
        </Badge>
      );
    case 'out_of_stock':
      return (
        <Badge variant="danger">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1" />
          Hết hàng
        </Badge>
      );
    case 'maintenance':
    case 'pending':
      return (
        <Badge variant="warning">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
          Bảo trì / Chờ xử lý
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};
