import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không tìm thấy dữ liệu',
  description = 'Hiện tại chưa có sản phẩm hoặc dịch vụ nào phù hợp với yêu cầu của bạn.',
  icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 my-4">
      <div className="p-4 rounded-full bg-slate-100 text-slate-400 mb-3">
        {icon || <PackageOpen className="w-10 h-10" />}
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
