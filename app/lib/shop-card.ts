import type { ApiShopCard } from "@/app/lib/shop-api";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

export function toShopCardProduct(product: ApiShopCard) {
  const isAppliance = product.productType === "appliance";
  return {
    id: `${product.productType}-${product.id}`,
    cartProductId: product.id,
    cartProductType: product.productType,
    sku: product.sku,
    brand: product.brand,
    name: product.name,
    price: product.price,
    mrp: product.originalPrice ?? undefined,
    imageUrl: product.image ?? undefined,
    bestSeller: product.isBestseller,
    isInStock: product.isInStock,
    stock: product.stock,
    warrantyMonths: product.warrantyMonths,
    rating: product.rating.toFixed(1),
    reviews: product.reviewCount,
    detailHref: isAppliance
      ? product.slug
        ? `/shop/appliances/${encodeURIComponent(product.applianceCategory || "all")}/${encodeURIComponent(product.slug)}`
        : SHOP_APPLIANCES_HREF
      : `/shop/spare-parts/${encodeURIComponent(product.sku || product.id)}`,
    enquiryHref: isAppliance
      ? SHOP_APPLIANCES_HREF
      : `/shop/requests?part=${encodeURIComponent(product.id)}`,
  };
}
