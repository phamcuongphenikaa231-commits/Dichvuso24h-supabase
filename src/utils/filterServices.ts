import { Service, ServiceFilters, SortOption } from '@/types/service';
import { ITEMS_PER_PAGE } from '@/data/services';

/**
 * Remove Vietnamese accents for diacritic-insensitive search
 */
export function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Filter services based on criteria.
 * Pass `allCategories` from productService.getCategories() to enable parent-aware filtering:
 *   - filtering by a root category slug shows services from it AND all its children.
 */
export function filterServices(
  services: Service[],
  filters: ServiceFilters,
  allCategories?: { slug: string; children?: { slug: string }[] }[]
): Service[] {
  // Build a set of slugs to match when a root category is selected
  let activeSlugs: Set<string> | null = null;
  if (filters.category !== 'all' && allCategories) {
    const root = allCategories.find((c) => c.slug === filters.category);
    if (root && root.children && root.children.length > 0) {
      // Root category with children → include root + all children
      activeSlugs = new Set([root.slug, ...root.children.map((ch) => ch.slug)]);
    }
    // If no root found, or root has no children → fall through to exact match below
  }

  return services.filter((service) => {
    // 1. Filter by active
    if (!service.active) return false;

    // 2. Filter by category
    if (filters.category !== 'all') {
      if (activeSlugs) {
        // Parent-aware: include service if its category slug is in activeSlugs
        if (!activeSlugs.has(service.category)) return false;
      } else {
        // Exact match (child category or no tree info)
        if (service.category !== filters.category) return false;
      }
    }

    // 3. Filter by stock status
    if (filters.stockStatus !== 'all' && service.stockStatus !== filters.stockStatus) {
      return false;
    }

    // 4. Filter by price range
    if (filters.priceRange !== 'all') {
      const price = service.price;
      switch (filters.priceRange) {
        case 'under_100k':
          if (price >= 100000) return false;
          break;
        case '100k_300k':
          if (price < 100000 || price > 300000) return false;
          break;
        case '300k_500k':
          if (price < 300000 || price > 500000) return false;
          break;
        case 'above_500k':
          if (price <= 500000) return false;
          break;
      }
    }

    // 5. Filter by search query (diacritic insensitive match on name, tags, description)
    if (filters.search.trim()) {
      const query = removeAccents(filters.search.trim());
      const nameMatch = removeAccents(service.name).includes(query);
      const descMatch = removeAccents(service.shortDescription).includes(query);
      const tagsMatch = service.tags.some((tag) => removeAccents(tag).includes(query));

      if (!nameMatch && !descMatch && !tagsMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort services
 */
export function sortServices(services: Service[], sortOption: SortOption): Service[] {
  const list = [...services];
  switch (sortOption) {
    case 'price_asc':
      return list.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return list.sort((a, b) => b.price - a.price);
    case 'popular':
      return list.sort((a, b) => b.soldCount - a.soldCount);
    case 'newest':
    default:
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

/**
 * Paginate services
 */
export function paginateServices(services: Service[], page: number, perPage: number = ITEMS_PER_PAGE) {
  const totalItems = services.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * perPage;
  const paginatedItems = services.slice(startIndex, startIndex + perPage);

  return {
    items: paginatedItems,
    totalItems,
    totalPages,
    currentPage,
  };
}
