import { API_URL } from "@/app/config";

export type ApplianceCatalogItem = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  modelNumber?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  capacityTon?: number;
  starRating?: number;
  acType?: string;
  isInverter?: boolean;
  shortDescription?: string;
  images?: string[];
  inStock?: boolean;
  installationIncluded?: boolean;
  productWarrantyYears?: number;
  applianceCategory: string;
  rating?: number;
  reviewCount?: number;
  isBestseller?: boolean;
};

export type ApplianceCatalogResponse = {
  total: number;
  products: ApplianceCatalogItem[];
};

export async function getApplianceCatalog(options: {
  category?: string;
  brand?: string;
  sort?: string;
  signal?: AbortSignal;
} = {}): Promise<ApplianceCatalogResponse> {
  const params = new URLSearchParams({ page: "1", limit: "200" });
  if (options.category && options.category !== "all") params.set("type", options.category);
  if (options.brand) params.set("brand", options.brand);
  if (options.sort && options.sort !== "relevance") params.set("sort", options.sort);

  const response = await fetch(`${API_URL}/appliances?${params}`, { signal: options.signal, cache: "no-store" });
  if (!response.ok) throw new Error("Could not load appliances");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as ApplianceCatalogResponse).products)) {
    throw new Error("Unexpected appliance catalog response");
  }
  return payload as ApplianceCatalogResponse;
}

export type SparePartCatalogItem = {
  _id: string;
  sku: string;
  slug: string;
  name: string;
  description?: string;
  partNumber?: string;
  partCategory?: string;
  applianceTypeSlug?: string;
  price: number;
  mrp?: number;
  stock?: number;
  isInStock?: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isBestSeller?: boolean;
  soldCount?: number;
  isUniversal?: boolean;
  imageUrls?: string[];
  brandSlug?: string;
  warrantyMonths?: number;
  rating?: { average?: number; count?: number };
};

export type SparePartCatalogResponse = {
  data: SparePartCatalogItem[];
  metadata: { total: number; page: number; limit: number; totalPages: number };
};

export async function getSparePartCatalog(options: {
  query?: string;
  applianceType?: string;
  sort?: string;
  signal?: AbortSignal;
} = {}): Promise<SparePartCatalogResponse> {
  const params = new URLSearchParams({ page: "1", limit: "200" });
  if (options.query?.trim()) params.set("q", options.query.trim());
  if (options.applianceType) params.set("applianceType", options.applianceType);
  if (options.sort && options.sort !== "relevance") params.set("sort", options.sort);

  const response = await fetch(`${API_URL}/spare-parts?${params}`, { signal: options.signal, cache: "no-store" });
  if (!response.ok) throw new Error("Could not load spare parts");
  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object" || !Array.isArray((payload as SparePartCatalogResponse).data)) {
    throw new Error("Unexpected spare parts response");
  }
  return payload as SparePartCatalogResponse;
}
