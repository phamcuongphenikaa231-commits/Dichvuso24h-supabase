'use client';

import { createClient } from '@/lib/supabase/client';
import { AdminCategory, AdminService } from '@/types/admin';
import { CategoryMeta, CategorySlug, Service, StockStatus } from '@/types/service';

const CATEGORY_BG: Record<string, string> = {
  'kho-tai-khoan': 'bg-violet-100',
  'dich-vu-tuong-tac': 'bg-blue-100',
  'cong-cu-so': 'bg-cyan-100',
  'dich-vu-khac': 'bg-amber-100',
};

type DbCategory = {
  id: string;
  legacy_key: string | null;
  slug: string;
  name: string;
  short_name: string;
  description: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
  parent_id: string | null;   // NEW: danh mục cha
  image_url: string | null;   // NEW: ảnh danh mục
  image_path: string | null;  // NEW: storage path ảnh danh mục
};

type DbService = {
  id: string;
  legacy_key: string | null;
  category_id: string;
  slug: string;
  name: string;
  short_description: string;
  full_description: string;
  price: number | string;
  original_price: number | string | null;
  unit: string;
  thumbnail_emoji: string;
  thumbnail_bg: string;
  thumbnail_url: string | null;
  thumbnail_path: string | null;
  stock_status: 'available' | 'out_of_stock' | 'maintenance';
  processing_time: string;
  warranty: string;
  tags: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  purchase_flow_type: 'interaction' | 'delivery_required';
  min_quantity: number;
  max_quantity: number;
  custom_fields: AdminService['customFields'] | null;
  instructions: string;
  terms_and_conditions: string;
  sold_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};


const LEGACY_SERVICES_KEY = 'dv24h_catalog_services_v1';
const LEGACY_CATEGORIES_KEY = 'dv24h_catalog_categories_v1';
const LEGACY_MIGRATED_KEY = 'dv24h_catalog_migrated_to_supabase_v1';

async function migrateLegacyLocalCatalog(): Promise<{ migrated: boolean; message: string }> {
  if (typeof window === 'undefined') return { migrated: false, message: 'Không có dữ liệu trình duyệt.' };
  if (localStorage.getItem(LEGACY_MIGRATED_KEY) === '1') {
    return { migrated: false, message: 'Dữ liệu cũ đã được đồng bộ trước đó.' };
  }

  const rawServices = localStorage.getItem(LEGACY_SERVICES_KEY);
  const rawCategories = localStorage.getItem(LEGACY_CATEGORIES_KEY);
  if (!rawServices && !rawCategories) {
    localStorage.setItem(LEGACY_MIGRATED_KEY, '1');
    return { migrated: false, message: 'Không tìm thấy dữ liệu dịch vụ cũ.' };
  }

  let legacyServices: AdminService[] = [];
  let legacyCategories: AdminCategory[] = [];
  try {
    legacyServices = rawServices ? JSON.parse(rawServices) as AdminService[] : [];
    legacyCategories = rawCategories ? JSON.parse(rawCategories) as AdminCategory[] : [];
  } catch {
    return { migrated: false, message: 'Dữ liệu cũ không hợp lệ nên không thể tự động đồng bộ.' };
  }

  const supabase = createClient();
  if (legacyCategories.length > 0) {
    const { error } = await supabase.from('service_categories').upsert(
      legacyCategories.map((category) => ({
        legacy_key: category.id,
        slug: category.slug.trim().toLowerCase(),
        name: category.name.trim(),
        short_name: category.name.trim(),
        description: category.description || '',
        icon: category.icon || '📁',
        color: '#0f4c81',
        display_order: category.displayOrder || 0,
        is_active: category.isActive,
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'slug' }
    );
    if (error) throw new Error(error.message);
  }

  const { data: dbCategories, error: categoryError } = await supabase
    .from('service_categories')
    .select('id,slug');
  if (categoryError) throw new Error(categoryError.message);
  const categoryIdBySlug = new Map((dbCategories || []).map((item) => [item.slug, item.id]));
  const legacyCategorySlugById = new Map(legacyCategories.map((category) => [category.id, category.slug]));

  if (legacyServices.length > 0) {
    for (const service of legacyServices) {
      const categorySlug = legacyCategorySlugById.get(service.categoryId) || service.categoryId.replace(/^cat-/, '');
      const categoryId = categoryIdBySlug.get(categorySlug);
      if (!categoryId) throw new Error(`Không tìm thấy danh mục cho dịch vụ ${service.name}.`);

      const legacyKey = service.sku || service.id;
      const row = {
        legacy_key: legacyKey,
        category_id: categoryId,
        slug: service.slug.trim().toLowerCase(),
        name: service.name.trim(),
        short_description: service.shortDescription || '',
        full_description: service.fullDescription || '',
        price: service.price,
        original_price: service.originalPrice,
        unit: service.unit || 'sản phẩm',
        thumbnail_emoji: service.thumbnail || '📦',
        thumbnail_bg: CATEGORY_BG[categorySlug] || 'bg-slate-100',
        stock_status: toDbStock(service.stockStatus),
        processing_time: service.processingTime || '',
        warranty: service.warranty || '',
        tags: service.tags || [],
        is_featured: service.isFeatured,
        is_active: service.isActive,
        purchase_flow_type: service.purchaseFlowType || 'delivery_required',
        min_quantity: Math.max(1, service.minQuantity || 1),
        max_quantity: Math.max(service.minQuantity || 1, service.maxQuantity || 1),
        custom_fields: service.customFields || [],
        instructions: service.instructions || '',
        terms_and_conditions: service.termsAndConditions || '',
        deleted_at: service.isDeleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const { data: existingByLegacy, error: legacyLookupError } = await supabase
        .from('services')
        .select('id')
        .eq('legacy_key', legacyKey)
        .maybeSingle();
      if (legacyLookupError) throw new Error(legacyLookupError.message);

      let existing = existingByLegacy;
      if (!existing) {
        const { data: existingBySlug, error: slugLookupError } = await supabase
          .from('services')
          .select('id')
          .eq('slug', row.slug)
          .maybeSingle();
        if (slugLookupError) throw new Error(slugLookupError.message);
        existing = existingBySlug;
      }

      const mutation = existing
        ? supabase.from('services').update(row).eq('id', existing.id)
        : supabase.from('services').insert(row);
      const { error } = await mutation;
      if (error) throw new Error(error.message);
    }
  }

  localStorage.setItem(LEGACY_MIGRATED_KEY, '1');
  await refreshCatalog(true);
  return { migrated: true, message: `Đã đồng bộ ${legacyServices.length} dịch vụ và ${legacyCategories.length} danh mục lên Supabase.` };
}

const listeners = new Set<() => void>();
let categoriesCache: AdminCategory[] = [];
let servicesCache: AdminService[] = [];
let loaded = false;
let loadingPromise: Promise<void> | null = null;
let realtimeStarted = false;

function notify() {
  listeners.forEach((listener) => listener());
}

function toAdminStock(status: DbService['stock_status']): AdminService['stockStatus'] {
  if (status === 'available') return 'in_stock';
  if (status === 'out_of_stock') return 'out_of_stock';
  return 'pre_order';
}

function toDbStock(status: AdminService['stockStatus']): DbService['stock_status'] {
  if (status === 'in_stock') return 'available';
  if (status === 'out_of_stock') return 'out_of_stock';
  return 'maintenance';
}

function mapCategory(row: DbCategory, serviceCount: number): AdminCategory {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || '',
    icon: row.icon || '📁',
    displayOrder: row.display_order,
    isActive: row.is_active,
    serviceCount,
    parentId: row.parent_id ?? null,
    imageUrl: row.image_url ?? null,
    imagePath: row.image_path ?? null,
  };
}

function mapAdminService(row: DbService, categoryName: string): AdminService {
  return {
    id: row.id,
    sku: row.legacy_key || row.id.slice(0, 8).toUpperCase(),
    slug: row.slug,
    name: row.name,
    categoryId: row.category_id,
    categoryName,
    purchaseFlowType: row.purchase_flow_type,
    shortDescription: row.short_description || '',
    fullDescription: row.full_description || '',
    price: Number(row.price),
    originalPrice: row.original_price === null ? null : Number(row.original_price),
    unit: row.unit,
    minQuantity: row.min_quantity,
    maxQuantity: row.max_quantity,
    processingTime: row.processing_time || '',
    warranty: row.warranty || '',
    thumbnail: row.thumbnail_emoji || '📦',
    thumbnailUrl: row.thumbnail_url ?? null,
    thumbnailPath: row.thumbnail_path ?? null,
    tags: row.tags || [],
    isFeatured: row.is_featured,
    isActive: row.is_active,
    isDeleted: Boolean(row.deleted_at),
    customFields: Array.isArray(row.custom_fields) ? row.custom_fields : [],
    instructions: row.instructions || '',
    termsAndConditions: row.terms_and_conditions || '',
    stockStatus: toAdminStock(row.stock_status),
    updatedAt: row.updated_at,
  };
}

function toService(adminService: AdminService): Service {
  const category = categoriesCache.find((item) => item.id === adminService.categoryId);
  const categorySlug = (category?.slug || 'dich-vu-khac') as CategorySlug;
  const stockStatus: StockStatus = adminService.stockStatus === 'in_stock'
    ? 'available'
    : adminService.stockStatus === 'out_of_stock'
      ? 'out_of_stock'
      : 'maintenance';

  return {
    id: adminService.id,
    slug: adminService.slug,
    name: adminService.name,
    shortDescription: adminService.shortDescription,
    fullDescription: adminService.fullDescription,
    category: categorySlug,
    price: adminService.price,
    originalPrice: adminService.originalPrice ?? undefined,
    unit: adminService.unit,
    thumbnail: {
      emoji: adminService.thumbnail || '📦',
      bg: CATEGORY_BG[categorySlug] || 'bg-slate-100',
    },
    thumbnailUrl: adminService.thumbnailUrl ?? null,
    thumbnailPath: adminService.thumbnailPath ?? null,
    stockStatus,
    processingTime: adminService.processingTime,
    warranty: adminService.warranty,
    tags: adminService.tags,
    featured: adminService.isFeatured,
    active: adminService.isActive && !adminService.isDeleted,
    purchaseFlowType: adminService.purchaseFlowType,
    minQuantity: adminService.minQuantity,
    maxQuantity: adminService.maxQuantity,
    customFields: adminService.customFields,
    instructions: adminService.instructions,
    termsAndConditions: adminService.termsAndConditions,
    soldCount: 0,
    createdAt: adminService.updatedAt,
  };
}

async function refreshCatalog(force = false): Promise<void> {
  if (loadingPromise && !force) return loadingPromise;

  loadingPromise = (async () => {
    const supabase = createClient();
    const [{ data: categoryRows, error: categoryError }, { data: serviceRows, error: serviceError }] = await Promise.all([
      supabase
        .from('service_categories')
        .select('id,legacy_key,slug,name,short_name,description,icon,color,display_order,is_active,parent_id,image_url,image_path')
        .order('display_order', { ascending: true }),
      supabase
        .from('services')
        .select('id,legacy_key,category_id,slug,name,short_description,full_description,price,original_price,unit,thumbnail_emoji,thumbnail_bg,thumbnail_url,thumbnail_path,stock_status,processing_time,warranty,tags,is_featured,is_active,purchase_flow_type,min_quantity,max_quantity,custom_fields,instructions,terms_and_conditions,sold_count,created_at,updated_at,deleted_at')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    ]);

    if (categoryError) throw new Error(categoryError.message);
    if (serviceError) throw new Error(serviceError.message);

    const rawCategories = (categoryRows || []) as DbCategory[];
    const rawServices = (serviceRows || []) as DbService[];

    // Build direct service counts per category (only count active services)
    const directCounts = new Map<string, number>();
    rawServices.forEach((s) => {
      if (s.is_active) {
        directCounts.set(s.category_id, (directCounts.get(s.category_id) || 0) + 1);
      }
    });

    // Map flat categories first (serviceCount = direct only, will aggregate below)
    const flatCategories = rawCategories.map((c) => mapCategory(c, directCounts.get(c.id) || 0));

    // Aggregate parent serviceCount = direct + all children
    const childrenByParent = new Map<string, AdminCategory[]>();
    flatCategories.forEach((c) => {
      if (c.parentId) {
        const arr = childrenByParent.get(c.parentId) || [];
        arr.push(c);
        childrenByParent.set(c.parentId, arr);
      }
    });
    // Update parent serviceCount
    flatCategories.forEach((c) => {
      if (!c.parentId) {
        const children = childrenByParent.get(c.id) || [];
        c.children = children;
        c.serviceCount = (directCounts.get(c.id) || 0) + children.reduce((sum, ch) => sum + ch.serviceCount, 0);
      }
    });

    categoriesCache = flatCategories;
    const categoryNames = new Map(categoriesCache.map((c) => [c.id, c.name]));
    servicesCache = rawServices.map((s) => mapAdminService(s, categoryNames.get(s.category_id) || 'Không xác định'));
    loaded = true;
    notify();
  })().finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

function ensureRealtime() {
  if (realtimeStarted) return;
  realtimeStarted = true;
  const supabase = createClient();
  supabase
    .channel('catalog-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => void refreshCatalog(true))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'service_categories' }, () => void refreshCatalog(true))
    .subscribe();
}

function servicePayload(service: Partial<AdminService>) {
  const payload: Record<string, unknown> = {};
  if (service.sku !== undefined) payload.legacy_key = (service.sku || service.id!).trim();

  if (service.categoryId !== undefined) payload.category_id = service.categoryId;
  if (service.slug !== undefined) payload.slug = service.slug.trim().toLowerCase();
  if (service.name !== undefined) payload.name = service.name.trim();
  if (service.shortDescription !== undefined) payload.short_description = service.shortDescription;
  if (service.fullDescription !== undefined) payload.full_description = service.fullDescription;
  if (service.price !== undefined) payload.price = service.price;
  if (service.originalPrice !== undefined) payload.original_price = service.originalPrice;
  if (service.unit !== undefined) payload.unit = service.unit;
  if (service.thumbnail !== undefined) payload.thumbnail_emoji = service.thumbnail || '📦';
  if (service.thumbnailUrl !== undefined) payload.thumbnail_url = service.thumbnailUrl ?? null;
  if (service.thumbnailPath !== undefined) payload.thumbnail_path = service.thumbnailPath ?? null;
  if (service.stockStatus !== undefined) payload.stock_status = toDbStock(service.stockStatus);
  if (service.processingTime !== undefined) payload.processing_time = service.processingTime;
  if (service.warranty !== undefined) payload.warranty = service.warranty;
  if (service.tags !== undefined) payload.tags = service.tags;
  if (service.isFeatured !== undefined) payload.is_featured = service.isFeatured;
  if (service.isActive !== undefined) payload.is_active = service.isActive;
  if (service.purchaseFlowType !== undefined) payload.purchase_flow_type = service.purchaseFlowType;
  if (service.minQuantity !== undefined) payload.min_quantity = service.minQuantity;
  if (service.maxQuantity !== undefined) payload.max_quantity = service.maxQuantity;
  if (service.customFields !== undefined) payload.custom_fields = service.customFields;
  if (service.instructions !== undefined) payload.instructions = service.instructions;
  if (service.termsAndConditions !== undefined) payload.terms_and_conditions = service.termsAndConditions;
  payload.updated_at = new Date().toISOString();
  return payload;
}

export const productService = {

  async migrateLegacyLocalCatalog() {
    return migrateLegacyLocalCatalog();
  },

  async refresh(force = false) {
    await refreshCatalog(force);
  },

  isLoaded() {
    return loaded;
  },

  getAll(): Service[] {
    return servicesCache.map(toService);
  },

  getActive(): Service[] {
    return this.getAll().filter((service) => service.active);
  },

  getById(id: string): Service | undefined {
    const service = servicesCache.find((item) => item.id === id);
    return service ? toService(service) : undefined;
  },

  getBySlug(slug: string): Service | undefined {
    const service = servicesCache.find((item) => item.slug === slug);
    return service ? toService(service) : undefined;
  },

  getFeatured(): Service[] {
    return this.getActive().filter((service) => service.featured);
  },

  getCategories(): CategoryMeta[] {
    // Return only root categories with children nested
    return categoriesCache
      .filter((c) => c.isActive && !c.parentId)
      .map((c) => ({
        slug: c.slug as CategorySlug,
        name: c.name,
        shortName: c.name,
        description: c.description,
        icon: c.icon,
        href: `/danh-muc/${c.slug}`,
        color: '#0f4c81',
        count: c.serviceCount,
        parentId: null,
        imageUrl: c.imageUrl,
        imagePath: c.imagePath,
        children: (c.children || [])
          .filter((ch) => ch.isActive)
          .map((ch) => ({
            slug: ch.slug as CategorySlug,
            name: ch.name,
            shortName: ch.name,
            description: ch.description,
            icon: ch.icon,
            href: `/danh-muc/${ch.slug}`,
            color: '#0f4c81',
            count: ch.serviceCount,
            parentId: c.slug,
            imageUrl: ch.imageUrl,
            imagePath: ch.imagePath,
          })),
      }));
  },

  /** Flat list of all categories — used by admin panels */
  getCategoriesFlat(): CategoryMeta[] {
    return categoriesCache
      .filter((c) => c.isActive)
      .map((c) => ({
        slug: c.slug as CategorySlug,
        name: c.name,
        shortName: c.name,
        description: c.description,
        icon: c.icon,
        href: `/danh-muc/${c.slug}`,
        color: '#0f4c81',
        count: c.serviceCount,
        parentId: c.parentId ?? null,
        imageUrl: c.imageUrl,
        imagePath: c.imagePath,
      }));
  },

  /** Get hierarchy structure for a given category slug */
  getCategoryHierarchy(slug: string): {
    type: 'root_with_children' | 'root_without_children' | 'child';
    category: CategoryMeta;
    parent?: CategoryMeta;
    children?: CategoryMeta[];
  } | undefined {
    const rootCategories = this.getCategories();

    // 1. Check if slug matches a root category
    const rootMatch = rootCategories.find((c) => c.slug === slug);
    if (rootMatch) {
      const children = rootMatch.children || [];
      if (children.length > 0) {
        return {
          type: 'root_with_children',
          category: rootMatch,
          children,
        };
      }
      return {
        type: 'root_without_children',
        category: rootMatch,
      };
    }

    // 2. Check if slug matches a child category under any root category
    for (const root of rootCategories) {
      if (root.children) {
        const childMatch = root.children.find((ch) => ch.slug === slug);
        if (childMatch) {
          return {
            type: 'child',
            category: childMatch,
            parent: root,
          };
        }
      }
    }

    // 3. Fallback check in flat list if not found in root tree
    const flat = this.getCategoriesFlat().find((c) => c.slug === slug);
    if (flat) {
      if (flat.parentId) {
        const parentRoot = rootCategories.find(
          (r) => r.slug === flat.parentId || r.name === flat.parentId
        );
        return {
          type: 'child',
          category: flat,
          parent: parentRoot,
        };
      }
      return {
        type: 'root_without_children',
        category: flat,
      };
    }

    return undefined;
  },

  getAdminServices(): AdminService[] {
    return servicesCache;
  },

  getAdminServiceById(id: string): AdminService | undefined {
    return servicesCache.find((service) => service.id === id || service.slug === id || service.id === decodeURIComponent(id));
  },

  getAdminCategories(): AdminCategory[] {
    return categoriesCache;
  },

  serviceIdExists(id: string): boolean {
    return servicesCache.some((service) => (service.sku || service.id).toLowerCase() === id.toLowerCase());
  },

  async addService(service: AdminService) {
    const supabase = createClient();
    const { error } = await supabase.from('services').insert(servicePayload(service));
    if (error) throw new Error(error.message);
    await refreshCatalog(true);
  },

  async updateService(id: string, updates: Partial<AdminService>) {
    const supabase = createClient();
    const { error } = await supabase.from('services').update(servicePayload(updates)).eq('id', id);
    if (error) throw new Error(error.message);
    await refreshCatalog(true);
  },

  async deleteService(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('services')
      .update({ is_active: false, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error(error.message);
    await refreshCatalog(true);
  },

  async addCategory(category: AdminCategory) {
    const supabase = createClient();
    const { error } = await supabase.from('service_categories').insert({
      legacy_key: category.id || null,
      name: category.name.trim(),
      short_name: category.name.trim(),
      slug: category.slug.trim().toLowerCase(),
      description: category.description,
      icon: category.icon || '📁',
      color: '#0f4c81',
      display_order: category.displayOrder,
      is_active: category.isActive,
      parent_id: category.parentId ?? null,
      image_url: category.imageUrl ?? null,
      image_path: category.imagePath ?? null,
    });
    if (error) throw new Error(error.message);
    await refreshCatalog(true);
  },

  async updateCategory(id: string, updates: Partial<AdminCategory>) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.name !== undefined) {
      payload.name = updates.name.trim();
      payload.short_name = updates.name.trim();
    }
    if (updates.slug !== undefined) payload.slug = updates.slug.trim().toLowerCase();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if ('parentId' in updates) payload.parent_id = updates.parentId ?? null;
    if ('imageUrl' in updates) payload.image_url = updates.imageUrl ?? null;
    if ('imagePath' in updates) payload.image_path = updates.imagePath ?? null;
    const supabase = createClient();
    const { error } = await supabase.from('service_categories').update(payload).eq('id', id);
    if (error) throw new Error(error.message);
    await refreshCatalog(true);
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const category = categoriesCache.find((item) => item.id === id);
    if (!category) return { success: false, message: 'Không tìm thấy danh mục.' };

    // Block nếu danh mục lớn còn danh mục con
    const hasChildren = categoriesCache.some((c) => c.parentId === id);
    if (hasChildren) {
      return { success: false, message: 'Danh mục này còn danh mục con. Hãy xóa danh mục con trước.' };
    }

    // Block nếu còn dịch vụ trực thuộc
    if (category.serviceCount > 0) {
      return { success: false, message: 'Danh mục đang có dịch vụ, hãy chuyển hoặc xóa dịch vụ trước.' };
    }

    const supabase = createClient();
    const { error } = await supabase.from('service_categories').delete().eq('id', id);
    if (error) return { success: false, message: error.message };
    await refreshCatalog(true);
    return { success: true, message: 'Đã xóa danh mục.' };
  },

  async resetCatalog() {
    await refreshCatalog(true);
  },

  subscribe(listener: () => void) {
    listeners.add(listener);
    ensureRealtime();
    void refreshCatalog();
    return () => { listeners.delete(listener); };
  },
};
