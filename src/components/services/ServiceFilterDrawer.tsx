'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ServiceFilterSidebar, ServiceFilterSidebarProps } from './ServiceFilterSidebar';

export interface ServiceFilterDrawerProps extends ServiceFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  resultCount: number;
}

export function ServiceFilterDrawer({
  isOpen,
  onClose,
  resultCount,
  ...sidebarProps
}: ServiceFilterDrawerProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bộ lọc dịch vụ"
      description="Tùy chỉnh tiêu chí để tìm gói dịch vụ phù hợp nhất"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button variant="secondary" className="flex-1" onClick={sidebarProps.onReset}>
            Đặt lại
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Xem {resultCount} kết quả
          </Button>
        </div>
      }
    >
      <ServiceFilterSidebar {...sidebarProps} hideCategoryFilter={sidebarProps.hideCategoryFilter} />
    </Modal>
  );
}
