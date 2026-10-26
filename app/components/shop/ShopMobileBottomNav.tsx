"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
  isAppliancesShopRoute,
  isSparePartsShopRoute,
} from "@/app/lib/shop-routes";

const TABS = [
  { id: "shop", label: "Shop", icon: "storefront", href: "/shop" },
  { id: "parts", label: "Parts", icon: "build", href: SHOP_SPARE_PARTS_HREF },
  { id: "appliances", label: "Appliances", icon: "kitchen", href: SHOP_APPLIANCES_HREF },
  { id: "orders", label: "Orders", icon: "receipt_long", href: "/orders" },
  { id: "cart", label: "Cart", icon: "shopping_bag", href: "/cart" },
] as const;

function isTabActive(id: (typeof TABS)[number]["id"], pathname: string) {
  if (id === "shop") {
    return (
      pathname === "/shop" ||
      pathname === "/shop/all" ||
      pathname === "/shop/requests" ||
      pathname.startsWith("/shop/requests/")
    );
  }
  if (id === "parts") return isSparePartsShopRoute(pathname);
  if (id === "appliances") return isAppliancesShopRoute(pathname);
  if (id === "orders") return pathname === "/orders" || pathname.startsWith("/orders/");
  return pathname === "/cart" || pathname.startsWith("/cart/") || pathname === "/checkout";
}

export default function ShopMobileBottomNav({ cartCount = 0 }: { cartCount?: number }) {
  const pathname = usePathname() || "";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200/90 bg-white/95 shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] backdrop-blur-md md:hidden"
      aria-label="Shop navigation"
    >
      <div className="grid h-14 w-full grid-cols-5">
        {TABS.map((tab) => {
          const active = isTabActive(tab.id, pathname);
          return (
            <TabCell key={tab.id} label={tab.label} active={active}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                aria-label={tab.id === "cart" && cartCount > 0 ? `Cart, ${cartCount} items` : tab.label}
                className="relative flex h-8 w-8 items-center justify-center touch-manipulation"
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200 ${
                    active ? "bg-primary/10 text-primary" : "text-zinc-400"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[22px] leading-none ${
                      active ? "icon-filled" : ""
                    }`}
                  >
                    {tab.icon}
                  </span>
                </span>
                {tab.id === "cart" && cartCount > 0 && (
                  <span className="absolute -right-1 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold leading-none text-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
            </TabCell>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom,0px)] bg-white/95" aria-hidden />
    </nav>
  );
}

function TabCell({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-1">
      <div className="flex h-8 w-full items-center justify-center">{children}</div>
      <span
        className={`flex h-3 items-center justify-center text-[10px] font-semibold leading-none tracking-tight ${
          active ? "text-primary" : "text-zinc-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
