"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  isAppliancesShopRoute,
  isSparePartsShopRoute,
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
} from "@/app/lib/shop-routes";

const LINK_TABS = [
  { id: "Home", label: "Home", icon: "home", href: "/" },
  { id: "Services", label: "Services", icon: "home_repair_service", href: "/services" },
  { id: "My Bookings", label: "Bookings", icon: "event_note", href: "/my-bookings" },
] as const;

const SHOP_OPTIONS = [
  {
    label: "Spare Parts",
    description: "OEM catalog & verified parts",
    icon: "build_circle",
    href: SHOP_SPARE_PARTS_HREF,
    isActive: isSparePartsShopRoute,
  },
  {
    label: "Appliances",
    description: "Air conditioners & more",
    icon: "ac_unit",
    href: SHOP_APPLIANCES_HREF,
    isActive: isAppliancesShopRoute,
  },
] as const;

interface MobileBottomNavProps {
  activeTab: string;
  shopOpen: boolean;
  onShopOpenChange: (open: boolean) => void;
  onBook: () => void;
}

export function MobileBottomNav({
  activeTab,
  shopOpen,
  onShopOpenChange,
  onBook,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const closeShop = () => onShopOpenChange(false);

  return (
    <>
      <button
        type="button"
        aria-label="Close shop menu"
        onClick={closeShop}
        className={`md:hidden fixed inset-0 z-40 bg-zinc-900/35 backdrop-blur-[2px] transition-opacity duration-300 ${
          shopOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        role="dialog"
        aria-modal={shopOpen}
        aria-label="Shop categories"
        aria-hidden={!shopOpen}
        className={`md:hidden fixed inset-x-0 z-[45] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          shopOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ bottom: "var(--mobile-nav-total)" }}
      >
        <div className="mx-4 rounded-2xl border border-zinc-200/90 bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-zinc-100">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-bold text-zinc-900 tracking-tight">Shop</p>
                <p className="text-xs text-zinc-500 mt-0.5">Choose a category to browse</p>
              </div>
              <button
                type="button"
                onClick={closeShop}
                className="w-8 h-8 shrink-0 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center active:scale-95 transition-transform"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 p-3">
            {SHOP_OPTIONS.map((option) => {
              const selected = option.isActive(pathname);
              return (
                <Link
                  key={option.label}
                  href={option.href}
                  onClick={closeShop}
                  className={`relative flex flex-col items-start gap-3 rounded-xl p-3.5 min-h-[108px] border transition-all duration-200 active:scale-[0.98] ${
                    selected
                      ? "border-primary/30 bg-primary-container shadow-sm"
                      : "border-zinc-100 bg-zinc-50/80 hover:border-zinc-200 hover:bg-white"
                  }`}
                >
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selected
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "bg-white text-zinc-700 border border-zinc-100"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-[22px] ${selected ? "icon-filled" : ""}`}
                    >
                      {option.icon}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-bold text-zinc-900 leading-tight">
                      {option.label}
                    </span>
                    <span className="block text-[11px] text-zinc-500 mt-1 leading-snug line-clamp-2">
                      {option.description}
                    </span>
                  </span>
                  {selected && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <nav
        className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200/90 shadow-[0_-1px_0_0_rgba(0,0,0,0.05)]"
        aria-label="Main navigation"
      >
        {/* 5 equal columns — column 3 sits on viewport center */}
        <div
          className="grid h-14 w-full"
          style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
        >
          {LINK_TABS.slice(0, 2).map((tab) => (
            <LinkTab
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onNavigate={closeShop}
            />
          ))}

          <TabCell label="Book" active={activeTab === "Book"}>
            <button
              type="button"
              onClick={() => {
                closeShop();
                onBook();
              }}
              aria-label="Book a repair"
              aria-pressed={activeTab === "Book"}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-sm transition-all duration-200 active:scale-95 ${
                activeTab === "Book"
                  ? "bg-zinc-900 text-white shadow-zinc-900/20"
                  : "bg-primary text-white shadow-primary/25"
              }`}
            >
              <span className="material-symbols-outlined icon-filled text-[20px] leading-none">
                calendar_add_on
              </span>
            </button>
          </TabCell>

          <TabCell
            label="Shop"
            active={activeTab === "Shop" || shopOpen}
            labelExtra={
              <span
                className={`material-symbols-outlined text-[11px] leading-none transition-transform duration-200 ${
                  shopOpen ? "rotate-180" : ""
                }`}
              >
                expand_more
              </span>
            }
          >
            <button
              type="button"
              onClick={() => onShopOpenChange(!shopOpen)}
              aria-expanded={shopOpen}
              aria-haspopup="dialog"
              aria-label="Shop menu"
              className="flex h-8 w-8 items-center justify-center touch-manipulation"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200 ${
                  activeTab === "Shop" || shopOpen
                    ? "bg-primary/10 text-primary"
                    : "text-zinc-400"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] leading-none ${
                    activeTab === "Shop" || shopOpen ? "icon-filled" : ""
                  }`}
                >
                  storefront
                </span>
              </span>
            </button>
          </TabCell>

          <LinkTab
            key={LINK_TABS[2].id}
            tab={LINK_TABS[2]}
            active={activeTab === LINK_TABS[2].id}
            onNavigate={closeShop}
          />
        </div>

        <div className="h-[env(safe-area-inset-bottom,0px)] bg-white/95" aria-hidden />
      </nav>
    </>
  );
}

function LinkTab({
  tab,
  active,
  onNavigate,
}: {
  tab: (typeof LINK_TABS)[number];
  active: boolean;
  onNavigate: () => void;
}) {
  return (
    <TabCell label={tab.label} active={active}>
      <Link
        href={tab.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className="flex h-8 w-8 items-center justify-center touch-manipulation"
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
      </Link>
    </TabCell>
  );
}

/** Shared slot: icon row + label row, centered in grid cell */
function TabCell({
  label,
  active,
  labelExtra,
  children,
}: {
  label: string;
  active?: boolean;
  labelExtra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full w-full min-w-0 flex-col items-center justify-center gap-1">
      <div className="flex h-8 w-full items-center justify-center">{children}</div>
      <span
        className={`flex h-3 items-center justify-center gap-0.5 text-[10px] leading-none font-semibold tracking-tight ${
          active ? "text-primary" : "text-zinc-500"
        }`}
      >
        {label}
        {labelExtra}
      </span>
    </div>
  );
}
