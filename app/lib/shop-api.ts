import { API_URL } from "@/app/config";

export interface ApiShopCard {
  productType: "part" | "appliance";
  applianceCategory?: string;
  id: string;
  slug: string;
  sku?: string;
  brand?: string;
  name: string;
  image: string | null;
  price: number;
  originalPrice: number | null;
  discount: number;
  rating: number;
  reviewCount: number;
  isBestseller: boolean;
  isInStock?: boolean;
  stock?: number;
  warrantyMonths?: number;
}

export interface ShopHomeResponse {
  products: ApiShopCard[];
  appliances: ApiShopCard[];
  parts: ApiShopCard[];
  applianceCategories: { slug: string; productCount: number }[];
  pagination: {
    page: number;
    limit: number;
    applianceTotal: number;
    partTotal: number;
    hasMore: boolean;
  };
}

export async function getShopHome(signal?: AbortSignal, limit = 4, page = 1): Promise<ShopHomeResponse> {
  const pageParam = page > 1 ? `&page=${page}` : "";
  const response = await fetch(`${API_URL}/shop/home?limit=${limit}${pageParam}`, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Could not load shop products");

  const data: unknown = await response.json();
  if (!isShopHomeResponse(data)) throw new Error("Unexpected shop response");
  return data;
}

function isShopHomeResponse(value: unknown): value is ShopHomeResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<ShopHomeResponse>;
  return (
    Array.isArray(response.products) &&
    Array.isArray(response.appliances) &&
    Array.isArray(response.parts) &&
    Array.isArray(response.applianceCategories) &&
    isPagination(response.pagination)
  );
}

function isPagination(value: unknown): value is ShopHomeResponse["pagination"] {
  if (!value || typeof value !== "object") return false;
  const pagination = value as Partial<ShopHomeResponse["pagination"]>;
  return typeof pagination.page === "number" &&
    typeof pagination.limit === "number" &&
    typeof pagination.applianceTotal === "number" &&
    typeof pagination.partTotal === "number" &&
    typeof pagination.hasMore === "boolean";
}
