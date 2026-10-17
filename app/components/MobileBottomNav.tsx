"use client";

import Link from "next/link";
import type { ReactNode } from "react";

const LINK_TABS = [
  { id: "Home", label: "Home", icon: "home", href: "/" },
  { id: "Services", label: "Services", icon: "home_repair_service", href: "/services" },
  { id: "My Bookings", label: "Bookings", icon: "event_note", href: "/my-bookings" },
] as const;

interface MobileBottomNavProps {
  activeTab: string;
  onBook: () => void;
}

export function MobileBottomNav({
  activeTab,
  onBook,
}: MobileBottomNavProps) {
  const closeShop = () => {};

  return (
    <>
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
            active={activeTab === "Shop"}
          >
            <Link
              href="/shop"
              aria-current={activeTab === "Shop" ? "page" : undefined}
              aria-label="Shop"
              className="flex h-8 w-8 items-center justify-center touch-manipulation"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors duration-200 ${
                  activeTab === "Shop" ? "bg-primary/10 text-primary" : "text-zinc-400"
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] leading-none ${activeTab === "Shop" ? "icon-filled" : ""}`}>
                  storefront
                </span>
              </span>
            </Link>
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
