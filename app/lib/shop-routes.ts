export const SHOP_SPARE_PARTS_HREF = "/spare-parts";
export const SHOP_APPLIANCES_HREF = "/spare-parts/appliances";

export function isAppliancesShopRoute(pathname: string) {
  return pathname.startsWith(SHOP_APPLIANCES_HREF);
}

export function isSparePartsShopRoute(pathname: string) {
  return pathname.startsWith(SHOP_SPARE_PARTS_HREF) && !isAppliancesShopRoute(pathname);
}

export function isShopRoute(pathname: string) {
  return pathname.startsWith(SHOP_SPARE_PARTS_HREF);
}
