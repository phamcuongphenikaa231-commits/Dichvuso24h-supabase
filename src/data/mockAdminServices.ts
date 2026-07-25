import { AdminCategory, AdminService } from '@/types/admin';
import { ALL_SERVICES, CATEGORIES } from '@/data/services';

const SERVICES_KEY = 'dv24h_catalog_services_v1';
const CATEGORIES_KEY = 'dv24h_catalog_categories_v1';

const categoryIdFromSlug = (slug: string) => `cat-${slug}`;

export const INITIAL_ADMIN_CATEGORIES: AdminCategory[] = CATEGORIES.map((category, index) => ({
  id: categoryIdFromSlug(category.slug),
  name: category.name,
  slug: category.slug,
  description: category.description,
  icon: category.icon,
  displayOrder: index + 1,
  isActive: true,
  serviceCount: ALL_SERVICES.filter((service) => service.category === category.slug).length,
}));

export const INITIAL_ADMIN_SERVICES: AdminService[] = ALL_SERVICES.map((service) => ({
  id: service.id,
  slug: service.slug,
  name: service.name,
  categoryId: categoryIdFromSlug(service.category),
  categoryName: CATEGORIES.find((category) => category.slug === service.category)?.name || service.category,
  purchaseFlowType: service.purchaseFlowType,
  shortDescription: service.shortDescription,
  fullDescription: service.fullDescription,
  price: service.price,
  originalPrice: service.originalPrice ?? null,
  unit: service.unit,
  minQuantity: 1,
  maxQuantity: service.purchaseFlowType === 'interaction' ? 100 : 10,
  processingTime: service.processingTime,
  warranty: service.warranty,
  thumbnail: service.thumbnail.emoji,
  tags: service.tags,
  isFeatured: service.featured,
  isActive: service.active,
  isDeleted: false,
  customFields:
    service.purchaseFlowType === 'interaction'
      ? [
          {
            id: `cf-link-${service.id}`,
            label: 'Đường dẫn cần xử lý',
            type: 'url',
            required: true,
            placeholder: 'https://...',
          },
        ]
      : /nâng cấp|chính chủ/i.test(service.name)
        ? [
            {
              id: `cf-account-${service.id}`,
              label: 'Email/tài khoản cần xử lý (không nhập mật khẩu)',
              type: 'email',
              required: true,
              placeholder: 'email@example.com',
            },
          ]
        : [],
  instructions: 'Thực hiện theo hướng dẫn hiển thị trên trang chi tiết dịch vụ.',
  termsAndConditions: 'Khách hàng cần cung cấp thông tin chính xác và tuân thủ điều kiện dịch vụ.',
  stockStatus:
    service.stockStatus === 'available'
      ? 'in_stock'
      : service.stockStatus === 'out_of_stock'
        ? 'out_of_stock'
        : 'pre_order',
  updatedAt: service.createdAt,
}));

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

class MockStore {
  services: AdminService[] = [...INITIAL_ADMIN_SERVICES];
  categories: AdminCategory[] = [...INITIAL_ADMIN_CATEGORIES];
  listeners: (() => void)[] = [];
  private initialized = false;

  private ensureInitialized() {
    if (this.initialized || typeof window === 'undefined') return;
    const storedServices = safeParse<AdminService[]>(localStorage.getItem(SERVICES_KEY), []);
    const storedCategories = safeParse<AdminCategory[]>(localStorage.getItem(CATEGORIES_KEY), []);
    if (storedServices.length > 0) this.services = storedServices;
    if (storedCategories.length > 0) this.categories = storedCategories;

    // Migrate records created before purchaseFlowType was added.
    this.services = this.services.map((service) => ({
      ...service,
      purchaseFlowType:
        service.purchaseFlowType ||
        (this.categories.find((category) => category.id === service.categoryId)?.slug ===
        'dich-vu-tuong-tac'
          ? 'interaction'
          : 'delivery_required'),
    }));
    this.recountCategories();
    this.persist();
    this.initialized = true;
  }

  private recountCategories() {
    this.categories = this.categories.map((category) => ({
      ...category,
      serviceCount: this.services.filter(
        (service) => service.categoryId === category.id && !service.isDeleted
      ).length,
    }));
  }

  private persist() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SERVICES_KEY, JSON.stringify(this.services));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(this.categories));
  }

  subscribe(listener: () => void) {
    this.ensureInitialized();
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  emit() {
    this.ensureInitialized();
    this.recountCategories();
    this.persist();
    this.listeners.forEach((listener) => listener());
  }

  getServices() {
    this.ensureInitialized();
    return this.services.filter((service) => !service.isDeleted);
  }

  getServiceById(id: string) {
    this.ensureInitialized();
    return this.services.find((service) => service.id === id && !service.isDeleted);
  }

  addService(service: AdminService) {
    this.ensureInitialized();
    this.services = [service, ...this.services];
    this.emit();
  }

  updateService(id: string, updates: Partial<AdminService>) {
    this.ensureInitialized();
    this.services = this.services.map((service) =>
      service.id === id ? { ...service, ...updates, updatedAt: new Date().toISOString() } : service
    );
    this.emit();
  }

  deleteService(id: string) {
    this.ensureInitialized();
    this.services = this.services.map((service) =>
      service.id === id ? { ...service, isDeleted: true, updatedAt: new Date().toISOString() } : service
    );
    this.emit();
  }

  getCategories() {
    this.ensureInitialized();
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  serviceIdExists(id: string) {
    this.ensureInitialized();
    return this.services.some((service) => service.id === id && !service.isDeleted);
  }

  addCategory(category: AdminCategory) {
    this.ensureInitialized();
    this.categories = [...this.categories, category];
    this.emit();
  }

  updateCategory(id: string, updates: Partial<AdminCategory>) {
    this.ensureInitialized();
    this.categories = this.categories.map((category) =>
      category.id === id ? { ...category, ...updates } : category
    );
    this.emit();
  }

  deleteCategory(id: string): { success: boolean; message: string } {
    this.ensureInitialized();
    if (this.services.some((service) => service.categoryId === id && !service.isDeleted)) {
      return { success: false, message: 'Không thể xóa danh mục đang có dịch vụ.' };
    }
    this.categories = this.categories.filter((category) => category.id !== id);
    this.emit();
    return { success: true, message: 'Đã xóa danh mục.' };
  }

  resetCatalog() {
    this.services = [...INITIAL_ADMIN_SERVICES];
    this.categories = [...INITIAL_ADMIN_CATEGORIES];
    this.emit();
  }
}

export const adminStore = new MockStore();
