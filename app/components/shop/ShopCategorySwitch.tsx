
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

export default function ShopCategorySwitch({
  showActive = true,
}: {
  showActive?: boolean;
}) {
  const pathname = usePathname();

  const categories = [
    {
      label: "Appliances",
      href: SHOP_APPLIANCES_HREF,
      icon: Monitor,
      active: showActive && isAppliancesShopRoute(pathname),
    },
    {
      label: "Spare Parts",
      href: SHOP_SPARE_PARTS_HREF,
      icon: Wrench,
      active: showActive && isSparePartsShopRoute(pathname),
    },
  ];

  return (
    <nav
      aria-label="Shop categories"
      className="grid w-full grid-cols-2 gap-1.5 sm:gap-2"
    >
      {categories.map(({ label, href, icon: Icon, active }) => (
        <Link
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex h-[38px] min-w-0 items-center justify-center gap-1.5 rounded-[10px] border px-2 text-[11px] font-semibold transition-colors active:scale-[0.98] sm:h-10 sm:gap-2 sm:rounded-xl sm:text-sm md:h-11 ${
            active
              ? "border-[#D8102B] bg-[#D8102B] text-white"
              : "border-[#E6E7EB] bg-white text-[#303238] hover:border-[#D8102B]/40"
          }`}
        >
          <Icon
            aria-hidden="true"
            strokeWidth={2}
            className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4"
          />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
