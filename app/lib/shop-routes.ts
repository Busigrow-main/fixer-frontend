export const SHOP_SPARE_PARTS_HREF = "/spare-parts";
export const SHOP_APPLIANCES_HREF = "/spare-parts/appliances";

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
  return matchesRoute(pathname, SHOP_SPARE_PARTS_HREF);
}
