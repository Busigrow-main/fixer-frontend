"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Home,
  Package,
  Refrigerator,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Fragment } from "react";

import { Separator } from "@/app/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { cn } from "@/app/lib/utils";

type DockItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
  badge?: number;
};

type ShopDockProps = {
  cartCount?: number;
  onSearch: () => void;
  className?: string;
};

export default function ShopDock({
  cartCount = 0,
  onSearch,
  className,
}: ShopDockProps) {
  const pathname = usePathname();

  const items: DockItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "shop", label: "Shop", icon: Store, href: "/shop" },
    { id: "parts", label: "Parts", icon: Package, href: "/shop/spare-parts" },
    {
      id: "appliances",
      label: "Appliances",
      icon: Refrigerator,
      href: "/shop/appliances",
    },
    { id: "search", label: "Search", icon: Search, onSelect: onSearch },
    { id: "orders", label: "Orders", icon: ClipboardList, href: "/orders" },
    {
      id: "cart",
      label: "Cart",
      icon: ShoppingBag,
      href: "/cart",
      badge: cartCount,
    },
  ];

  const isActive = (item: DockItem) => {
    switch (item.id) {
      case "home":
        return pathname === "/";
      case "shop":
        // Shop is active only on its root and "all products", not subcategories.
        return pathname === "/shop" || pathname === "/shop/all";
      case "cart":
        return pathname === "/cart" || pathname.startsWith("/checkout");
      case "orders":
        return pathname === "/orders" || pathname.startsWith("/orders/");
      case "search":
        return false;
      default:
        return Boolean(
          item.href &&
            (pathname === item.href || pathname.startsWith(`${item.href}/`))
        );
    }
  };

  return (
    <TooltipProvider delayDuration={80}>
      <nav
        aria-label="Shop navigation"
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 flex justify-center",
          // Mobile: full-width bar
          "border-t border-slate-200/80 bg-white/95 px-1 pt-1.5 backdrop-blur-xl",
          "pb-[max(0.375rem,env(safe-area-inset-bottom))]",
          // Desktop: floating pill
          "md:pointer-events-none md:border-0 md:bg-transparent md:px-3 md:pb-5 md:pt-0 md:backdrop-blur-none",
          className
        )}
      >
        <div
          className={cn(
            "flex w-full max-w-lg items-stretch justify-between",
            "md:pointer-events-auto md:w-auto md:max-w-none md:items-center md:justify-center md:gap-1",
            "md:rounded-full md:border md:border-slate-200/80 md:bg-white/90 md:p-1.5",
            "md:shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] md:backdrop-blur-xl"
          )}
        >
          {items.map((item, index) => (
            <Fragment key={item.id}>
              {index === 4 && (
                <Separator
                  orientation="vertical"
                  className="mx-1 hidden h-7 md:block"
                />
              )}
              <DockButton item={item} active={isActive(item)} />
            </Fragment>
          ))}
        </div>
      </nav>
    </TooltipProvider>
  );
}

function DockButton({ item, active }: { item: DockItem; active: boolean }) {
  const Icon = item.icon;
  const reduceMotion = useReducedMotion();

  const controlClassName = cn(
    "group flex w-full min-w-0 flex-col items-center justify-center gap-0.5",
    "rounded-xl py-1 outline-none",
    "focus-visible:ring-2 focus-visible:ring-primary/40",
    "md:h-10 md:w-10 md:gap-0 md:rounded-full md:p-0"
  );

  const content = (
    <>
      {/* Same pill size for every item. Active only changes color. */}
      <span
        className={cn(
          "relative flex h-8 w-12 items-center justify-center rounded-full",
          "transition-colors duration-200",
          "md:h-10 md:w-10",
          active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-900"
        )}
      >
        <Icon className="size-5" strokeWidth={2} />

        {!!item.badge && item.badge > 0 && (
          <span
            className={cn(
              "absolute -right-0.5 -top-1 flex h-4 min-w-4 items-center justify-center",
              "rounded-full bg-primary px-1 text-[10px] font-semibold leading-none",
              "text-primary-foreground ring-2 ring-white",
              "md:-right-1"
            )}
          >
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        )}
      </span>

      <span
        className={cn(
          "max-w-full truncate text-[10px] leading-none tracking-tight md:hidden",
          "transition-colors duration-200",
          active ? "font-semibold text-primary" : "font-medium text-slate-500"
        )}
      >
        {item.label}
      </span>
    </>
  );

  const control =
    item.href !== undefined ? (
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={controlClassName}
      >
        {content}
      </Link>
    ) : (
      <button
        type="button"
        aria-label={item.label}
        onClick={item.onSelect}
        className={controlClassName}
      >
        {content}
      </button>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          whileTap={reduceMotion ? undefined : { scale: 0.95 }}
          className="flex min-w-0 flex-1 justify-center md:flex-none"
        >
          {control}
        </motion.div>
      </TooltipTrigger>

      <TooltipContent side="top" className="hidden md:block">
        {item.label}
        {item.id === "search" ? " · ⌘K" : ""}
      </TooltipContent>
    </Tooltip>
  );
}