
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
      className="mx-auto grid w-full max-w-[520px] grid-cols-2 gap-2 sm:gap-3"
    >
      {categories.map(({ label, href, icon: Icon, active }) => (
        <Link
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          className={`flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors active:scale-[0.98] sm:h-11 sm:text-sm md:h-12 ${
            active
              ? "border-[#D8102B] bg-[#D8102B] text-white md:border-primary md:bg-primary"
              : "border-[#E6E7EB] bg-white text-[#303238] hover:border-[#D8102B]/40 md:border-zinc-200 md:text-zinc-700 md:hover:border-primary/40"
          }`}
        >
          <Icon
            aria-hidden="true"
            strokeWidth={2}
            className="h-4 w-4 shrink-0 sm:h-[18px] sm:w-[18px]"
          />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
