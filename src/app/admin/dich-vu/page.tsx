'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Search, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { productService } from '@/services/productService';
import { AdminService } from '@/types/admin';
import { removeAccents } from '@/utils/filterServices';

export default function AdminServicesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [services, setServices] = useState<AdminService[]>(() => productService.getAdminServices());
  const [categories, setCategories] = useState(() => productService.getAdminCategories());
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => {
      setServices(productService.getAdminServices());
      setCategories(productService.getAdminCategories());
    };
    const unsubscribe = productService.subscribe(refresh);
    void productService.migrateLegacyLocalCatalog()
      .then((result) => {
        if (result.migrated) showToast('Đồng bộ dữ liệu cũ', result.message, 'success');
      })
      .catch((error) => {
        showToast('Chưa thể đồng bộ dữ liệu cũ', error instanceof Error ? error.message : 'Đã xảy ra lỗi', 'warning');
      });
    return unsubscribe;
  }, [showToast]);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Search
      const q = removeAccents(searchQuery.toLowerCase().trim());
      const matchSearch = q === '' || 
        removeAccents(service.name.toLowerCase()).includes(q) || 
        removeAccents((service.sku ?? '').toLowerCase()).includes(q);
        
      // Status
      const matchStatus = statusFilter === 'all' || 
        (statusFilter === 'active' ? service.isActive : !service.isActive);
        
      // Category
      const matchCategory = categoryFilter === 'all' || service.categoryId === categoryFilter;
      
      // Stock
      const matchStock = stockFilter === 'all' || service.stockStatus === stockFilter;
      
      return matchSearch && matchStatus && matchCategory && matchStock;
    });
  }, [services, searchQuery, statusFilter, categoryFilter, stockFilter]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await productService.updateService(id, { isActive: !currentStatus });
      showToast('Thành công', `Đã ${!currentStatus ? 'bật' : 'tắt'} dịch vụ`, 'success');
    } catch (error) {
      showToast('Lỗi', error instanceof Error ? error.message : 'Không thể cập nhật dịch vụ', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      await productService.deleteService(id);
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showToast('Thành công', 'Đã xóa dịch vụ', 'success');
    }
  };

  const handleDuplicate = async (service: AdminService) => {
    const newId = `DVS-${Math.floor(Math.random() * 10000)}`;
    const newService = {
      ...service,
      id: '',
      sku: newId,
      name: `${service.name} (Bản sao)`,
      slug: `${service.slug}-copy`,
      isActive: false,
      updatedAt: new Date().toISOString()
    };
    try {
      await productService.addService(newService);
      showToast('Thành công', 'Đã nhân bản dịch vụ', 'success');
    } catch (error) {
      showToast('Lỗi', error instanceof Error ? error.message : 'Không thể nhân bản dịch vụ', 'error');
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredServices.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.size} dịch vụ đã chọn?`)) {
      await Promise.all(Array.from(selectedIds).map(id => productService.deleteService(id)));
      setSelectedIds(new Set());
      showToast('Thành công', `Đã xóa ${selectedIds.size} dịch vụ`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Dịch vụ</h1>
          <p className="text-gray-500 mt-1">Danh sách {services.length} dịch vụ đang có trên hệ thống</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {selectedIds.size > 0 && (
            <Button variant="danger" onClick={handleBulkDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Xóa {selectedIds.size} mục
            </Button>
          )}
          <Button onClick={() => router.push('/admin/dich-vu/tao-moi')}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo dịch vụ mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input 
            placeholder="Tìm tên hoặc mã..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select 
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hiển thị</option>
          <option value="inactive">Đang ẩn</option>
        </select>
        <select 
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
        >
          <option value="all">Tình trạng kho</option>
          <option value="in_stock">Còn hàng (In Stock)</option>
          <option value="out_of_stock">Hết hàng (Out of Stock)</option>
          <option value="pre_order">Đặt trước (Pre-order)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-brand-primary"
                    checked={filteredServices.length > 0 && selectedIds.size === filteredServices.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-6 py-4">Dịch vụ</th>
                <th className="px-6 py-4">Mã SKU</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Giá bán</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Tồn kho</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-brand-primary"
                      checked={selectedIds.has(service.id)}
                      onChange={() => toggleSelect(service.id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {service.thumbnail || '📦'}
                      </div>
                      <div>
                        <Link href={`/admin/dich-vu/${service.id}/chinh-sua`} className="font-semibold text-brand-primary hover:underline line-clamp-1 max-w-[200px]">
                          {service.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{service.sku || service.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-slate-500">{service.categoryName}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {service.price.toLocaleString('vi-VN')}₫
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleActive(service.id, service.isActive)} className="focus:outline-none">
                      <Badge variant={service.isActive ? 'success' : 'secondary'} className="cursor-pointer hover:opacity-80">
                        {service.isActive ? 'Hiển thị' : 'Đang ẩn'}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={service.stockStatus === 'in_stock' ? 'primary' : service.stockStatus === 'pre_order' ? 'warning' : 'danger'}>
                      {service.stockStatus === 'in_stock' ? 'Còn hàng' : service.stockStatus === 'pre_order' ? 'Đặt trước' : 'Hết hàng'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="px-2 text-slate-500" onClick={() => router.push(`/admin/dich-vu/${service.id}/chinh-sua`)} title="Chỉnh sửa">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2 text-slate-500" onClick={() => handleDuplicate(service)} title="Nhân bản">
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="px-2 text-slate-500 hover:text-red-600" onClick={() => handleDelete(service.id)} title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredServices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Không tìm thấy dịch vụ nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Simple pagination placeholder */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-sm text-slate-500">
          <div>Hiển thị <strong>{filteredServices.length}</strong> kết quả</div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Trước</Button>
            <Button variant="outline" size="sm" disabled>Sau</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
