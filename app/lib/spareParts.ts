/**
 * SPARE PARTS LIBRARY
 * Managed via taxonomy-driven API (ApplianceType -> PartCategory -> Brand -> Parts)
 */

export interface SparePart {
  sku: string;
  slug: string;
  name: string;
  description: string;
  partCategory: string;
  price: number;
  mrp: number;
  stock: number;
  isInStock: boolean;
  imageUrls: string[];
  brandSlug?: string;
  isUniversal?: boolean;
}

export interface ApplianceTypeCategory {
  applianceTypeSlug: string;
  applianceTypeName: string;
  applianceTypeIcon: string;
  partCount: number;
  totalPartsCount: number;
  partCategories: any[];
  brands: any[];
}

/**
 * Fetch full category tree from backend
 */
export async function fetchCategoryTree(apiUrl: string): Promise<ApplianceTypeCategory[]> {
  try {
    const res = await fetch(`${apiUrl}/spare-parts/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return await res.json();
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return [];
  }
}

/**
 * Fetch single appliance type tree
 */
export async function fetchTypeTree(apiUrl: string, typeSlug: string): Promise<ApplianceTypeCategory | null> {
  try {
    const res = await fetch(`${apiUrl}/spare-parts/categories/${typeSlug}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch type tree");
    return await res.json();
  } catch (error) {
    console.error("Error fetching type tree:", error);
    return null;
  }
}

/**
 * Fetch parts by structured taxonomy
 */
export async function fetchPartsByCategory(
  apiUrl: string,
  typeSlug: string,
  partCatSlug: string,
  filters: { brand?: string; universal?: boolean; page?: number; limit?: number } = {}
) {
  try {
    const params = new URLSearchParams();
    if (filters.brand) params.append("brand", filters.brand);
    if (filters.universal) params.append("universal", "true");
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const res = await fetch(`${apiUrl}/spare-parts/categories/${typeSlug}/${partCatSlug}?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch parts");
    return await res.json();
  } catch (error) {
    console.error("Error fetching parts by category:", error);
    return { data: [], metadata: { total: 0, page: 1, limit: 24, totalPages: 0 } };
  }
}

/**
 * General search (independent from taxonomy navigation)
 */
export async function searchParts(apiUrl: string, queryParams: any) {
  try {
    const params = new URLSearchParams(queryParams);
    const res = await fetch(`${apiUrl}/spare-parts?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  } catch (error) {
    console.error("Error searching parts:", error);
    return { data: [], metadata: { total: 0 } };
  }
}
