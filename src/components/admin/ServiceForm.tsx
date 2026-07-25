'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { AdminService, AdminServiceFormData } from '@/types/admin';
import { productService } from '@/services/productService';
import { uploadProductImage, deleteProductImage } from '@/services/productImageService';

interface ServiceFormProps {
  initialData?: AdminService;
  isEdit?: boolean;
}

export function ServiceForm({ initialData, isEdit }: ServiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [isDirty, setIsDirty] = useState(false);
  const [categories, setCategories] = useState(() => productService.getAdminCategories());

  // Cascading category state
  const rootCategories = categories.filter((c) => !c.parentId);
  // Determine initial parent: if editing, find parent of the current categoryId
  const initParentId = () => {
    if (!initialData?.categoryId) return '';
    const cat = categories.find((c) => c.id === initialData.categoryId);
    if (!cat) return '';
    return cat.parentId ? cat.parentId : cat.id;
  };
  const [selectedParentId, setSelectedParentId] = useState<string>(initParentId);

  const childCategories = categories.filter((c) => c.parentId === selectedParentId);

  // Image upload state
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.thumbnailUrl ?? null);
  const [previousImagePath, setPreviousImagePath] = useState<string | null>(initialData?.thumbnailPath ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingDeletePaths, setPendingDeletePaths] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<AdminServiceFormData>(() => {
    if (initialData) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt, isDeleted, categoryName, ...rest } = initialData;
      return rest;
    }
    return {
      id: '',
      sku: '',
      slug: '',
      name: '',
      categoryId: '',
      purchaseFlowType: 'delivery_required',
      shortDescription: '',
      fullDescription: '',
      price: 0,
      originalPrice: null,
      unit: '',
      minQuantity: 1,
      maxQuantity: 100,
      processingTime: '',
      warranty: '',
      thumbnail: '',
      tags: [],
      isFeatured: false,
      isActive: true,
      customFields: [],
      instructions: '',
      termsAndConditions: '',
      stockStatus: 'in_stock'
    };
  });


  useEffect(() => {
    const refresh = () => setCategories(productService.getAdminCategories());
    refresh();
    return productService.subscribe(refresh);
  }, []);

  // Handle Dirty State Warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleChange = (field: keyof AdminServiceFormData, value: string | number | boolean | string[] | null | AdminServiceFormData['customFields']) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url, path } = await uploadProductImage(file);
      if (previousImagePath && previousImagePath !== path) {
        setPendingDeletePaths((current) => [...new Set([...current, previousImagePath])]);
      }
      setPreviewUrl(url);
      setPreviousImagePath(path);
      handleChange('thumbnailUrl', url);
      handleChange('thumbnailPath', path);
      handleChange('thumbnail', ''); // clear emoji when image is set
    } catch (err) {
      showToast('Lỗi upload', (err as Error).message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (previousImagePath) {
      setPendingDeletePaths((current) => [...new Set([...current, previousImagePath])]);
    }
    setPreviewUrl(null);
    setPreviousImagePath(null);
    handleChange('thumbnailUrl', null);
    handleChange('thumbnailPath', null);
    handleChange('thumbnail', '');
  };

  const handleBack = () => {
    if (isDirty && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời đi?')) {
      return;
    }
    router.push('/admin/dich-vu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.name || !formData.categoryId || !formData.price || !formData.sku) {
      showToast('Lỗi validation', 'Vui lòng điền đầy đủ các trường bắt buộc', 'error');
      return;
    }
    
    const cat = categories.find(c => c.id === formData.categoryId);
    const categoryName = cat ? cat.name : 'Unknown';
    const normalizedFormData: AdminServiceFormData = {
      ...formData,
      fullDescription: '',
      warranty: '',
      customFields: [],
      instructions: '',
      termsAndConditions: '',
    };

    if (isEdit && initialData) {
      try {
        await productService.updateService(initialData.id, { ...normalizedFormData, categoryName });
        showToast('Thành công', 'Đã cập nhật dịch vụ trên Supabase', 'success');
      } catch (error) {
        showToast('Không thể cập nhật', error instanceof Error ? error.message : 'Đã xảy ra lỗi', 'error');
        return;
      }
    } else {
      // Check duplicate ID
      if (productService.serviceIdExists(formData.sku || '')) {
        showToast('Lỗi', 'Mã dịch vụ (SKU) đã tồn tại', 'error');
        return;
      }
      try {
        await productService.addService({
          ...normalizedFormData,
          categoryName,
          updatedAt: new Date().toISOString(),
          isDeleted: false
        } as AdminService);
        showToast('Thành công', 'Đã tạo dịch vụ mới trên Supabase', 'success');
      } catch (error) {
        showToast('Không thể tạo dịch vụ', error instanceof Error ? error.message : 'Đã xảy ra lỗi', 'error');
        return;
      }
    }
    
    if (pendingDeletePaths.length > 0) {
      await Promise.allSettled(pendingDeletePaths.map((path) => deleteProductImage(path)));
      setPendingDeletePaths([]);
    }

    setIsDirty(false);
    setTimeout(() => {
      router.push('/admin/dich-vu');
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Chỉnh sửa dịch vụ' : 'Tạo dịch vụ mới'}</h1>
            <p className="text-gray-500 mt-1">{isEdit ? `Đang chỉnh sửa: ${formData.sku}` : 'Điền thông tin để tạo dịch vụ'}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button type="submit">
            <Save className="w-4 h-4 mr-2" /> Lưu dịch vụ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Thông tin cơ bản</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tên dịch vụ <span className="text-red-500">*</span></label>
              <Input 
                value={formData.name} 
                onChange={e => handleChange('name', e.target.value)} 
                required 
                placeholder="Ví dụ: Tài khoản ChatGPT Plus" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Đường dẫn (Slug) <span className="text-red-500">*</span></label>
                <Input 
                  value={formData.slug} 
                  onChange={e => handleChange('slug', e.target.value)} 
                  required 
                  placeholder="chatgpt-plus" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mã SKU <span className="text-red-500">*</span></label>
                <Input 
                  value={formData.sku || ''} 
                  onChange={e => handleChange('sku', e.target.value)} 
                  required 
                  disabled={isEdit}
                  placeholder="DVS-01" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
              <textarea 
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none min-h-[80px]"
                value={formData.shortDescription} 
                onChange={e => handleChange('shortDescription', e.target.value)} 
                placeholder="Mô tả tóm tắt..."
              />
            </div>

          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Giá & Tồn kho</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Giá bán <span className="text-red-500">*</span></label>
                <Input 
                  type="number" 
                  value={formData.price} 
                  onChange={e => handleChange('price', Number(e.target.value))} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Giá gốc (So sánh)</label>
                <Input 
                  type="number" 
                  value={formData.originalPrice || ''} 
                  onChange={e => handleChange('originalPrice', e.target.value ? Number(e.target.value) : null)} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Đơn vị</label>
                <Input 
                  value={formData.unit} 
                  onChange={e => handleChange('unit', e.target.value)} 
                  placeholder="tháng, cái, account..." 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số lượng tối thiểu</label>
                <Input 
                  type="number" 
                  value={formData.minQuantity} 
                  onChange={e => handleChange('minQuantity', Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Số lượng tối đa</label>
                <Input 
                  type="number" 
                  value={formData.maxQuantity} 
                  onChange={e => handleChange('maxQuantity', Number(e.target.value))} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Tình trạng hàng</label>
                <select 
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none h-10"
                  value={formData.stockStatus}
                  onChange={e => handleChange('stockStatus', e.target.value)}
                >
                  <option value="in_stock">Còn hàng</option>
                  <option value="out_of_stock">Hết hàng</option>
                  <option value="pre_order">Đặt trước</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Tổ chức</h3>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700">Danh mục <span className="text-red-500">*</span></label>

              {/* Level 1 — Root category */}
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                value={selectedParentId}
                onChange={(e) => {
                  const newParentId = e.target.value;
                  setSelectedParentId(newParentId);
                  // If the parent has no children, use the parent itself as categoryId
                  const hasChildren = categories.some((c) => c.parentId === newParentId);
                  if (!hasChildren) {
                    handleChange('categoryId', newParentId);
                  } else {
                    handleChange('categoryId', ''); // reset until child is picked
                  }
                }}
              >
                <option value="">-- Chọn danh mục lớn --</option>
                {rootCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>

              {/* Level 2 — Child categories (only if parent has children) */}
              {selectedParentId && childCategories.length > 0 && (
                <select
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none bg-slate-50"
                  value={formData.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                  required
                >
                  <option value="">-- Chọn danh mục con --</option>
                  {childCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              )}

              {selectedParentId && childCategories.length === 0 && (
                <p className="text-xs text-slate-400">Danh mục này không có danh mục con, dịch vụ sẽ thuộc danh mục lớn.</p>
              )}
            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Quy trình mua hàng <span className="text-red-500">*</span></label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                value={formData.purchaseFlowType}
                onChange={e => handleChange('purchaseFlowType', e.target.value)}
                required
              >
                <option value="interaction">Dịch vụ tương tác — yêu cầu khách nhập link</option>
                <option value="delivery_required">Tài khoản / dịch vụ mua trực tiếp</option>
              </select>
              <p className="text-xs text-slate-500">
                Dịch vụ tương tác yêu cầu link công khai. Tài khoản và dịch vụ còn lại chỉ cần chọn số lượng rồi thanh toán.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Trạng thái hoạt động</label>
              <div className="flex items-center gap-3 pt-1">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => handleChange('isActive', e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary"
                />
                <label htmlFor="isActive" className="text-sm">Hiển thị trên website</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Dịch vụ nổi bật</label>
              <div className="flex items-center gap-3 pt-1">
                <input 
                  type="checkbox" 
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={e => handleChange('isFeatured', e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary"
                />
                <label htmlFor="isFeatured" className="text-sm">Hiển thị ở trang chủ</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tags (Phân cách bằng dấu phẩy)</label>
              <Input 
                value={formData.tags.join(', ')} 
                onChange={e => handleChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} 
                placeholder="tag1, tag2..." 
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="font-bold text-lg text-slate-900">Hiển thị dịch vụ</h3>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Thời gian xử lý</label>
              <Input 
                value={formData.processingTime} 
                onChange={e => handleChange('processingTime', e.target.value)} 
                placeholder="VD: 5-15 phút" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Ảnh sản phẩm</label>
              <div className="mt-1">
                {previewUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={previewUrl}
                      alt="Ảnh sản phẩm"
                      className="w-full max-h-48 object-contain p-2"
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-t border-slate-200 bg-white">
                      <span className="text-xs text-slate-500 truncate">Ảnh đã tải lên</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 shrink-0"
                        onClick={handleRemoveImage}
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Xóa ảnh
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="productImageUpload"
                    className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                      isUploading
                        ? 'border-brand-primary bg-blue-50 opacity-70'
                        : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-brand-primary'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      {isUploading ? (
                        <>
                          <svg className="w-8 h-8 animate-spin text-brand-primary" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                          <span className="text-sm font-medium text-brand-primary">Đang tải lên...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 10l-4-4m0 0L8 10m4-4v12" />
                          </svg>
                          <span className="text-sm font-medium">Nhấn để thêm ảnh sản phẩm</span>
                          <span className="text-xs">JPG, PNG hoặc WebP – tối đa 3 MB</span>
                        </>
                      )}
                    </div>
                  </label>
                )}
                <input
                  id="productImageUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileChange}
                />
              </div>
              <p className="text-xs text-slate-400">Nếu không có ảnh, có thể dùng emoji bên dưới.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
