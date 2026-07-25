'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, FolderOpen, Folder } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { productService } from '@/services/productService';
import { uploadCategoryImage, deleteCategoryImage } from '@/services/categoryImageService';
import { AdminCategory } from '@/types/admin';

// ─── Category Row ─────────────────────────────────────────────────────────────

function CategoryRow({
  category,
  allCategories,
  onEdit,
  onDelete,
  onAddChild,
}: {
  category: AdminCategory;
  allCategories: AdminCategory[];
  onEdit: (cat: AdminCategory) => void;
  onDelete: (cat: AdminCategory) => void;
  onAddChild: (parent: AdminCategory) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const children = allCategories.filter((c) => c.parentId === category.id);
  const isParent = !category.parentId;

  return (
    <>
      <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
        <td className="px-4 py-3 w-8">
          {isParent && children.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
            >
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </td>
        <td className="px-4 py-3">
          <div className={`flex items-center gap-2 ${!isParent ? 'pl-6' : ''}`}>
            {isParent ? (
              <FolderOpen className="w-4 h-4 text-[#0f4c81] shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <div>
              <div className={`font-semibold text-slate-900 ${!isParent ? 'text-sm text-slate-700 font-medium' : ''}`}>
                {category.icon} {category.name}
              </div>
              <div className="text-xs text-slate-400">{category.slug}</div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-slate-500 text-sm truncate max-w-[200px]" title={category.description}>
          {category.description || <span className="italic text-slate-300">—</span>}
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium text-xs">
            {category.serviceCount}
          </span>
        </td>
        <td className="px-4 py-3">
          <Badge variant={category.isActive ? 'success' : 'secondary'}>
            {category.isActive ? 'Hoạt động' : 'Ẩn'}
          </Badge>
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-1">
            {isParent && (
              <Button
                variant="ghost"
                size="sm"
                className="px-2 text-xs text-[#0f4c81] hover:bg-blue-50"
                onClick={() => onAddChild(category)}
                title="Thêm danh mục con"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Thêm con
              </Button>
            )}
            <Button variant="ghost" size="sm" className="px-2" onClick={() => onEdit(category)}>
              <Edit2 className="w-4 h-4 text-slate-500 hover:text-blue-600" />
            </Button>
            <Button variant="ghost" size="sm" className="px-2" onClick={() => onDelete(category)}>
              <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Children rows */}
      {isParent && expanded &&
        children.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            allCategories={allCategories}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
          />
        ))}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

interface FormState {
  name: string;
  slug: string;
  icon: string;
  description: string;
  isActive: boolean;
  parentId: string | null;
  imageUrl?: string | null;
  imagePath?: string | null;
}

const emptyForm: FormState = {
  name: '',
  slug: '',
  icon: '📁',
  description: '',
  isActive: true,
  parentId: null,
  imageUrl: null,
  imagePath: null,
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const refresh = () => setCategories(productService.getAdminCategories());
    refresh();
    return productService.subscribe(refresh);
  }, []);

  // Root categories (parent_id = null), ordered
  const rootCategories = categories
    .filter((c) => !c.parentId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Parent options for the form (only roots, excluding self when editing)
  const parentOptions = categories.filter(
    (c) => !c.parentId && c.id !== editingCategory?.id
  );

  function openCreate(parentId: string | null = null) {
    setEditingCategory(null);
    setForm({ ...emptyForm, parentId });
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setIsModalOpen(true);
  }

  function openEdit(cat: AdminCategory) {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      isActive: cat.isActive,
      parentId: cat.parentId ?? null,
      imageUrl: cat.imageUrl,
      imagePath: cat.imagePath,
    });
    setSelectedImageFile(null);
    setImagePreviewUrl(cat.imageUrl || null);
    setIsModalOpen(true);
  }

  async function handleDelete(cat: AdminCategory) {
    if (!confirm(`Xóa danh mục "${cat.name}"?`)) return;
    const result = await productService.deleteCategory(cat.id);
    showToast(
      result.success ? 'Thành công' : 'Không thể xóa',
      result.message,
      result.success ? 'success' : 'error'
    );
  }

  // Auto-generate slug from name
  function handleNameChange(name: string) {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    setForm((prev) => ({ ...prev, name, slug: prev.slug || slug }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      showToast('Lỗi', 'Kích thước ảnh tối đa 3 MB', 'error');
      return;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      showToast('Lỗi', 'Chỉ hỗ trợ ảnh JPG, PNG, WebP', 'error');
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    setForm((prev) => ({ ...prev, imageUrl: null, imagePath: null }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      showToast('Lỗi', 'Tên và slug là bắt buộc', 'error');
      return;
    }

    // Don't allow a child to be a parent
    if (form.parentId) {
      const parent = categories.find((c) => c.id === form.parentId);
      if (parent?.parentId) {
        showToast('Lỗi', 'Không thể tạo danh mục cấp 3', 'error');
        return;
      }
    }

    setSaving(true);
    let finalImageUrl = form.imageUrl;
    let finalImagePath = form.imagePath;

    try {
      if (selectedImageFile) {
        const uploadResult = await uploadCategoryImage(selectedImageFile, editingCategory?.id);
        finalImageUrl = uploadResult.url;
        finalImagePath = uploadResult.path;
      }

      if (editingCategory) {
        await productService.updateCategory(editingCategory.id, {
          name: form.name,
          slug: form.slug,
          icon: form.icon,
          description: form.description,
          isActive: form.isActive,
          parentId: form.parentId,
          imageUrl: finalImageUrl,
          imagePath: finalImagePath,
        });

        // Xóa ảnh cũ nếu có ảnh mới và cập nhật thành công
        if (selectedImageFile && editingCategory.imagePath && editingCategory.imagePath !== finalImagePath) {
          try {
            await deleteCategoryImage(editingCategory.imagePath);
          } catch (e) {
            console.error('Lỗi khi xóa ảnh cũ:', e);
          }
        }
        showToast('Thành công', 'Đã cập nhật danh mục', 'success');
      } else {
        await productService.addCategory({
          id: '',
          name: form.name,
          slug: form.slug,
          icon: form.icon,
          description: form.description,
          isActive: form.isActive,
          displayOrder: categories.length + 1,
          serviceCount: 0,
          parentId: form.parentId,
          imageUrl: finalImageUrl,
          imagePath: finalImagePath,
        });
        showToast('Thành công', 'Đã tạo danh mục mới', 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast('Lỗi', err instanceof Error ? err.message : 'Đã xảy ra lỗi', 'error');
    } finally {
      setSaving(false);
    }
  }

  const modalTitle = editingCategory
    ? `Sửa: ${editingCategory.name}`
    : form.parentId
    ? `Thêm danh mục con`
    : 'Thêm danh mục lớn';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh mục dịch vụ</h1>
          <p className="text-gray-500 mt-1">Quản lý cây danh mục cha/con</p>
        </div>
        <Button onClick={() => openCreate(null)}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm danh mục lớn
        </Button>
      </div>

      {/* Tree Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3 w-8"></th>
                <th className="px-4 py-3">Tên danh mục</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Dịch vụ</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rootCategories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  allCategories={categories}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onAddChild={(parent) => openCreate(parent.id)}
                />
              ))}
              {rootCategories.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Chưa có danh mục nào. Nhấn <strong>Thêm danh mục lớn</strong> để bắt đầu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
        <form onSubmit={handleSave} className="space-y-4">

          {/* Parent selector — only show when not locked to a parent */}
          {!form.parentId || editingCategory ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Danh mục cha</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary/20 outline-none"
                value={form.parentId ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value || null }))}
                disabled={!!editingCategory?.parentId && !!form.parentId}
              >
                <option value="">— Không có (danh mục lớn) —</option>
                {parentOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400">
                Để trống = danh mục lớn. Chọn cha = danh mục con (tối đa 2 cấp).
              </p>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              📂 Danh mục con của:{' '}
              <strong>{categories.find((c) => c.id === form.parentId)?.name}</strong>
            </div>
          )}

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1 col-span-1">
              <label className="text-sm font-medium text-slate-700">Icon</label>
              <Input
                value={form.icon}
                onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                placeholder="📁"
                className="text-center text-lg"
              />
            </div>
            <div className="space-y-1 col-span-3">
              <label className="text-sm font-medium text-slate-700">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="Ví dụ: Kho tài khoản"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Đường dẫn (Slug) <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
              required
              placeholder="kho-tai-khoan"
            />
            <p className="text-xs text-slate-400">Chỉ dùng chữ thường, số và dấu gạch ngang.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Mô tả ngắn</label>
            <Input
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả về nhóm dịch vụ này"
            />
          </div>

          {/* Upload image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Ảnh danh mục</label>
            {imagePreviewUrl ? (
              <div className="relative w-full h-32 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <label className="cursor-pointer bg-white text-slate-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-slate-50 transition-colors">
                    Thay ảnh
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />
                  </label>
                  <button
                    type="button"
                    className="bg-red-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-red-600 transition-colors"
                    onClick={handleRemoveImage}
                  >
                    Xóa ảnh
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                  <FolderOpen className="w-8 h-8 mb-2 text-slate-400 group-hover:text-slate-500" />
                  <p className="text-sm text-slate-500 font-medium">Nhấn để chọn ảnh</p>
                  <p className="text-xs text-slate-400 mt-1">JPEG, PNG, WebP (Tối đa 3MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
              Hiển thị công khai
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Đang lưu...' : editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
