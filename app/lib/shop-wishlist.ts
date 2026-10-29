export const SHOP_WISHLIST_EVENT = "shop-wishlist-updated";
const STORAGE_KEY = "fixxer-shop-wishlist";

export type WishlistProduct = {
  id?: string;
  _id?: string;
  sku?: string;
  slug?: string;
  name: string;
  brand?: string;
  price?: number;
  mrp?: number;
  imageUrl?: string;
  imageUrls?: string[];
  isInStock?: boolean;
  stock?: number;
  warrantyMonths?: number;
  rating?: string;
  reviews?: number;
  detailHref?: string;
  cartProductType?: "part" | "appliance";
  cartProductId?: string;
};

export function wishlistKey(product: Pick<WishlistProduct, "cartProductType" | "cartProductId" | "id" | "_id" | "sku">) {
  return product.cartProductId
    ? `${product.cartProductType || "part"}:${product.cartProductId}`
    : String(product.id || product._id || product.sku || "");
}

function readWishlist(): WishlistProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistProduct[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(SHOP_WISHLIST_EVENT));
}

export function listWishlist() {
  return readWishlist();
}

export function isWished(product: WishlistProduct) {
  const key = wishlistKey(product);
  if (!key) return false;
  return readWishlist().some((item) => wishlistKey(item) === key);
}

export function toggleWishlist(product: WishlistProduct) {
  const key = wishlistKey(product);
  if (!key) return false;
  const items = readWishlist();
  const exists = items.some((item) => wishlistKey(item) === key);
  writeWishlist(exists ? items.filter((item) => wishlistKey(item) !== key) : [...items, product]);
  return !exists;
}
