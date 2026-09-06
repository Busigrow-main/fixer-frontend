"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import { useAuth } from "@/app/context/AuthContext";
import { SERVICES } from "@/app/lib/services";
import {
  isAppliancesShopRoute,
  isShopRoute,
  isSparePartsShopRoute,
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
} from "@/app/lib/shop-routes";
import { MobileBottomNav } from "@/app/components/MobileBottomNav";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "My Bookings", href: "/my-bookings" },
] as const;

const SHOP_DRAWER_OPTIONS = [
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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState("");
  const [shopDrawerOpen, setShopDrawerOpen] = useState(false);
  const [desktopShopOpen, setDesktopShopOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openBooking, isOpen: isBookingOpen } = useBooking();
  const { user, logout } = useAuth();

  // Helper to determine if we are on a subpage for app-like header
  const isSubpage = pathname !== "/";
  const hasInPageSearch = pathname.startsWith("/spare-parts");

  // Get page title for header
  const getPageTitle = () => {
    if (pathname === "/services") return "Services";
    if (pathname.startsWith("/services/")) {
      const slug = pathname.split("/").pop();
      const service = SERVICES.find((s) => s.slug === slug);
      return service ? service.name : "Detail";
    }
    if (pathname === "/spare-parts") return "Spare Parts";
    // Appliance sub-routes
    if (pathname === "/spare-parts/appliances") return "Appliances";
    if (pathname === "/spare-parts/appliances/ac") return "Air Conditioners";
    if (pathname.startsWith("/spare-parts/appliances/ac/")) return "AC Details";
    if (pathname.startsWith("/spare-parts/appliances/")) return "Appliances";
    // Generic spare-parts sub-routes
    if (pathname.startsWith("/spare-parts/")) {
      const slug = pathname.split("/").pop();
      if (slug === "enquiry") return "Part Enquiry";
      if (slug === "verified") return "Verified Parts";
      return "Part Detail";
    }
    if (pathname === "/my-bookings") return "My Bookings";
    return "";
  };

  const activeTab = (() => {
    if (isBookingOpen) return "Book";
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/services")) return "Services";
    if (isShopRoute(pathname)) return "Shop";
    if (pathname === "/my-bookings") return "My Bookings";
    return "";
  })();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShopDrawerOpen(false);
    setDesktopShopOpen(false);
  }, [pathname]);

  const handleGlobalSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const query = globalSearchQuery.trim();
    if (!query) return;

    router.push(`/spare-parts?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      {/* ════════════════════════════════════════
          DESKTOP — Full top navbar (md+)
      ════════════════════════════════════════ */}
      <header
        className={`hidden md:block fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-sm border-b border-outline-variant"
            : "bg-transparent"
        }`}
      >
        <nav className="flex justify-between items-center px-6 md:px-10 py-4 max-w-screen-2xl mx-auto">
          {/* Logo + Links */}
          <div className="flex items-center gap-10">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter text-zinc-900 select-none"
            >
              Fixx<span className="text-primary">er</span>
            </Link>

            <ul className="flex gap-8 items-center">
              {NAV_LINKS.slice(1).map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="relative text-zinc-500 hover:text-zinc-900 transition-colors font-label text-sm uppercase tracking-wider font-medium group"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full rounded-full" />
                  </Link>
                </li>
              ))}
              <li className="relative">
                <button
                  type="button"
                  onClick={() => setDesktopShopOpen((open) => !open)}
                  className={`relative font-label text-sm uppercase tracking-wider font-medium transition-colors ${
                    isShopRoute(pathname)
                      ? "text-zinc-900"
                      : "text-zinc-500 hover:text-zinc-900"
                  }`}
                  aria-expanded={desktopShopOpen}
                  aria-haspopup="true"
                >
                  Shop
                  <span
                    className={`material-symbols-outlined text-base align-middle ml-1 transition-transform ${
                      desktopShopOpen ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {desktopShopOpen && (
                  <>
                    <button
                      type="button"
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="Close shop menu"
                      onClick={() => setDesktopShopOpen(false)}
                    />
                    <div className="absolute left-0 top-full mt-3 z-50 w-64 rounded-2xl border border-outline bg-white shadow-xl p-2 overflow-hidden">
                      {SHOP_DRAWER_OPTIONS.map((option) => (
                        <Link
                          key={option.label}
                          href={option.href}
                          onClick={() => setDesktopShopOpen(false)}
                          className={`flex items-start gap-3 rounded-xl px-3 py-3 transition-colors ${
                            option.isActive(pathname)
                              ? "bg-primary-container text-on-primary-container"
                              : "hover:bg-surface-container"
                          }`}
                        >
                          <span className="material-symbols-outlined text-xl mt-0.5">
                            {option.icon}
                          </span>
                          <span>
                            <span className="block text-sm font-bold">{option.label}</span>
                            <span className="block text-xs text-on-surface-variant mt-0.5">
                              {option.description}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {!hasInPageSearch && (
              <form
                onSubmit={handleGlobalSearchSubmit}
                className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2.5 border border-outline gap-2 transition-all duration-200 focus-within:border-primary/30 focus-within:shadow-sm"
              >
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search parts…"
                  value={globalSearchQuery}
                  onChange={(event) => setGlobalSearchQuery(event.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-44 text-on-surface placeholder:text-on-surface-variant"
                />
              </form>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push("/my-bookings")}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {user.fullName?.charAt(0) || "U"}
                  </div>
                  <span className="text-sm font-bold text-zinc-900 hidden lg:block">
                    {user.fullName}
                  </span>
                </button>
                <button
                  onClick={() => logout()}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-error/10 text-error/70 hover:text-error transition-all"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-xl">
                    logout
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="h-11 px-6 flex items-center justify-center rounded-xl border-2 border-outline hover:border-zinc-900 transition-all font-bold text-sm tracking-wide"
              >
                Login
              </Link>
            )}

            <button
              onClick={() => openBooking()}
              className="group relative bg-primary text-on-primary px-6 h-11 rounded-xl font-bold text-sm overflow-hidden uppercase tracking-wide shadow-lg shadow-primary/15 transition-all duration-200 hover:shadow-xl hover:shadow-primary/25 hover:scale-[0.97] active:scale-95"
            >
              <span className="relative z-10">Book Repair</span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </button>
          </div>
        </nav>
      </header>

      {/* ════════════════════════════════════════
          MOBILE — Minimal top bar
      ════════════════════════════════════════ */}
      <header
        className={`md:hidden fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "glass shadow-sm border-b border-outline-variant"
            : "bg-white/95 backdrop-blur-sm shadow-sm"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14">
          {/* Brand or Back Button */}
          {isSubpage ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full active:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface">
                  arrow_back
                </span>
              </button>
              <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
                {getPageTitle()}
              </h1>
            </div>
          ) : (
            <Link
              href="/"
              className="text-xl font-black tracking-tighter text-zinc-900 select-none"
            >
              Fixx<span className="text-primary">er</span>
            </Link>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Search - Icon only for mobile if subpage */}
            {isSubpage && !hasInPageSearch && (
              <button
                onClick={() => router.push("/spare-parts")}
                className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container transition-colors"
                aria-label="Open spare parts search"
              >
                <span className="material-symbols-outlined text-zinc-600 text-[22px]">
                  search
                </span>
              </button>
            )}

            {/* Profile */}
            <button
              onClick={() => router.push(user ? "/my-bookings" : "/login")}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 group ${user ? "bg-primary text-white" : "bg-primary-container text-primary"}`}
            >
              {user ? (
                <span className="text-[10px] font-black">
                  {user.fullName?.charAt(0)}
                </span>
              ) : (
                <span className="material-symbols-outlined icon-filled transition-colors text-[22px]">
                  account_circle
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Search Bar - Only on Homepage Mobile (If needed) */}
        {pathname === "DISABLED_FOR_NOW" && (
          <div className="px-5 pb-3 animate-fade-in">
            <button 
              onClick={() => {}}
              className="w-full h-11 bg-zinc-100 rounded-xl px-4 flex items-center gap-3 text-zinc-400 border border-zinc-200 shadow-sm"
            >
              <span className="material-symbols-outlined text-xl">search</span>
              <span className="text-sm font-medium">What are you looking for?</span>
              <div className="ml-auto flex items-center gap-2">
                <div className="w-px h-4 bg-zinc-300" />
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </div>
            </button>
          </div>
        )}
      </header>

      <MobileBottomNav
        activeTab={activeTab}
        shopOpen={shopDrawerOpen}
        onShopOpenChange={setShopDrawerOpen}
        onBook={() => openBooking()}
      />
    </>
  );
}
