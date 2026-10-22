export const SHOP_SPARE_PARTS_HREF = "/shop/spare-parts";
export const SHOP_APPLIANCES_HREF = "/shop/appliances";
export const SHOP_ALL_PRODUCTS_HREF = "/shop/all";

function matchesRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isAppliancesShopRoute(pathname: string) {
  return matchesRoute(pathname, SHOP_APPLIANCES_HREF);
}

export function isSparePartsShopRoute(pathname: string) {
  return (
    matchesRoute(pathname, SHOP_SPARE_PARTS_HREF) &&
    !isAppliancesShopRoute(pathname)
  );
}

export function isShopRoute(pathname: string) {
  return (
    matchesRoute(pathname, SHOP_APPLIANCES_HREF) ||
    matchesRoute(pathname, SHOP_SPARE_PARTS_HREF) ||
    matchesRoute(pathname, SHOP_ALL_PRODUCTS_HREF)
  );
}
