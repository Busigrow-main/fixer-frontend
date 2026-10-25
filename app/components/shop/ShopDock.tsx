"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ClipboardList, Home, Package, Refrigerator, Search, ShoppingBag, Store } from "lucide-react";
import { motion } from "motion/react";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Separator } from "@/app/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/ui/tooltip";
import { cn } from "@/app/lib/utils";

type DockItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onSelect?: () => void;
  badge?: number;
};

export default function ShopDock({
  cartCount = 0,
  onSearch,
  className,
}: {
  cartCount?: number;
  onSearch: () => void;
  className?: string;
}) {
  const pathname = usePathname();
  const items: DockItem[] = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "shop", label: "Shop", icon: Store, href: "/shop" },
    { id: "parts", label: "Parts", icon: Package, href: "/shop/spare-parts" },
    { id: "appliances", label: "Appliances", icon: Refrigerator, href: "/shop/appliances" },
    { id: "search", label: "Search", icon: Search, onSelect: onSearch },
    { id: "orders", label: "Orders", icon: ClipboardList, href: "/orders" },
    { id: "cart", label: "Cart", icon: ShoppingBag, href: "/cart", badge: cartCount },
  ];

  return (
    <TooltipProvider delayDuration={80}>
      <nav
        aria-label="Shop"
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-5",
          className,
        )}
      >
        <div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-white/70 bg-white/90 p-1.5 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl md:gap-1.5 md:rounded-full md:px-2 md:py-1.5">
          {items.map((item, index) => {
            const active = item.href
              ? item.href === "/shop"
                ? pathname === "/shop" || pathname === "/shop/all"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
              : false;
            return (
              <span key={item.id} className="flex items-center">
                {index === 4 && <Separator orientation="vertical" className="mx-1 hidden h-8 md:block" />}
                <DockButton item={item} active={active} />
              </span>
            );
          })}
        </div>
      </nav>
    </TooltipProvider>
  );
}

function DockButton({ item, active }: { item: DockItem; active: boolean }) {
  const Icon = item.icon;
  const control = (
    <Button
      type={item.href ? undefined : "button"}
      variant={active ? "default" : "ghost"}
      size="icon"
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-xl md:rounded-full",
        active ? "shadow-sm" : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950",
      )}
      onClick={item.onSelect}
      asChild={Boolean(item.href)}
    >
      {item.href ? (
        <Link href={item.href}>
          <Icon className="size-5" />
        </Link>
      ) : (
        <Icon className="size-5" />
      )}
    </Button>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div whileHover={{ y: -4, scale: 1.08 }} whileTap={{ scale: 0.94 }} className="relative">
          {control}
          {!!item.badge && item.badge > 0 && (
            <Badge className="absolute -right-1 -top-1 h-4 min-w-4 px-1 text-[9px]">
              {item.badge > 99 ? "99+" : item.badge}
            </Badge>
          )}
        </motion.div>
      </TooltipTrigger>
      <TooltipContent side="top" className="hidden md:block">
        {item.label}
        {item.id === "search" ? " · ⌘K" : ""}
      </TooltipContent>
    </Tooltip>
  );
}
