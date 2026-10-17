"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Monitor, Wrench } from "lucide-react";
import {
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
  isAppliancesShopRoute,
  isSparePartsShopRoute,
} from "@/app/lib/shop-routes";

export default function ShopCategorySwitch() {
  const pathname = usePathname();

  const categories = [
    {
      label: "Appliances",
      href: SHOP_APPLIANCES_HREF,
      icon: Monitor,
      active: isAppliancesShopRoute(pathname),
    },
    {
      label: "Spare Parts",
      href: SHOP_SPARE_PARTS_HREF,
      icon: Wrench,
      active: isSparePartsShopRoute(pathname),
    },
  ];

  return (
    <nav aria-label="Shop categories" className="grid w-full grid-cols-2 gap-2.5 md:gap-4">
      {categories.map(({ label, href, icon: Icon, active }) => (
        <Link
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-[13px] font-semibold transition-colors active:scale-[0.98] sm:h-12 sm:text-sm md:h-14 md:rounded-2xl md:text-base ${
            active
              ? "border-red-200 bg-red-50 text-[#e9002d]"
              : "border-slate-200 bg-white text-slate-800 hover:border-red-200 hover:bg-red-50/50"
          }`}
        >
          <Icon strokeWidth={2} className="h-4 w-4 shrink-0 md:h-5 md:w-5" />
          <span className="whitespace-nowrap">{label}</span>
        </Link>
      ))}
    </nav>
  );
}