"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import { useAuth } from "@/app/context/AuthContext";
import { SERVICES } from "@/app/lib/services";
import { getSparePartBySlug } from "@/app/lib/spareParts";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Spare Parts", href: "/spare-parts" },
  { label: "My Bookings", href: "/my-bookings" },
] as const;

/* ── Bottom nav items (mobile only) ── */
const BOTTOM_NAV = [
  { label: "Home", icon: "home", href: "/" },
  { label: "Services", icon: "home_repair_service", href: "/services" },
  // center slot — Book — rendered separately
  { label: "Spare Parts", icon: "storefront", href: "/spare-parts" },
  { label: "My Bookings", icon: "event_note", href: "/my-bookings" },
] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { openBooking, isOpen: isBookingOpen } = useBooking();
  const { user, logout } = useAuth();

  // Helper to determine if we are on a subpage for app-like header
  const isSubpage = pathname !== "/";

  // Get page title for header
  const getPageTitle = () => {
    if (pathname === "/services") return "Services";
    if (pathname.startsWith("/services/")) {
      const slug = pathname.split("/").pop();
      const service = SERVICES.find((s) => s.slug === slug);
      return service ? service.name : "Detail";
    }
    if (pathname === "/spare-parts") return "Spare Parts";
    if (pathname.startsWith("/spare-parts/")) {
      const slug = pathname.split("/").pop();
      if (slug === "enquiry") return "Part Enquiry";
      const part = slug ? getSparePartBySlug(slug) : undefined;
      return part ? part.name : "Part Detail";
    }
    if (pathname === "/my-bookings") return "My Bookings";
    return "";
  };

  const activeTab = (() => {
    if (isBookingOpen) return "Book";
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/services")) return "Services";
    if (pathname.startsWith("/spare-parts")) return "Spare Parts";
    if (pathname === "/my-bookings") return "My Bookings";
    return "";
  })();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-2.5 border border-outline gap-2 transition-all duration-200 focus-within:border-primary/30 focus-within:shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                search
              </span>
              <input
                type="text"
                placeholder="Search parts…"
                className="bg-transparent border-none outline-none text-sm w-44 text-on-surface placeholder:text-on-surface-variant"
              />
            </div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push('/my-bookings')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {user.fullName?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-bold text-zinc-900 hidden lg:block">{user.fullName}</span>
                </button>
                <button 
                  onClick={() => logout()}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-error/10 text-error/70 hover:text-error transition-all"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
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
            {isSubpage && (
              <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-zinc-600 text-[22px]">
                  search
                </span>
              </button>
            )}

            {/* Notification */}
            {!isSubpage && (
              <button className="relative w-10 h-10 flex items-center justify-center rounded-full active:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-zinc-600 text-[22px]">
                  notifications
                </span>
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full border-2 border-white" />
              </button>
            )}

            {/* Profile */}
            <button 
              onClick={() => router.push(user ? '/my-bookings' : '/login')}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 group ${user ? 'bg-primary text-white' : 'bg-primary-container text-primary'}`}
            >
              {user ? (
                <span className="text-[10px] font-black">{user.fullName?.charAt(0)}</span>
              ) : (
                <span className="material-symbols-outlined icon-filled transition-colors text-[22px]">
                  account_circle
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════
          MOBILE — Bottom navigation bar (Urban Company style)
      ════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/98 backdrop-blur-xl border-t border-outline-variant/50 px-1 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-around h-14 relative">
            {/* Left two items */}
            {BOTTOM_NAV.slice(0, 2).map(({ label, icon, href }) => (
              <BottomTab
                key={label}
                label={label}
                icon={icon}
                href={href}
                active={activeTab === label}
                onClick={() => {}}
              />
            ))}

            {/* ── Center: BOOK button (Elevated) ── */}
            <div className="relative flex flex-col items-center -mt-8">
              <button
                onClick={() => openBooking()}
                className={`w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30
                  border-[3px] border-white transition-all duration-200 active:scale-95
                  ${activeTab === "Book" ? "shadow-primary/40 bg-zinc-900" : "hover:scale-105"}`}
              >
                <span className="material-symbols-outlined icon-filled text-white text-2xl">
                  calendar_add_on
                </span>
              </button>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                  activeTab === "Book" ? "text-primary" : "text-zinc-500"
                }`}
              >
                Book
              </span>
            </div>

            {/* Right two items */}
            {BOTTOM_NAV.slice(2).map(({ label, icon, href }) => (
              <BottomTab
                key={label}
                label={label}
                icon={icon}
                href={href}
                active={activeTab === label}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}

/* ── Bottom tab item ── */
function BottomTab({
  label,
  icon,
  href,
  active,
  onClick,
}: {
  label: string;
  icon: string;
  href: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-0.5 px-2 min-w-16 h-full transition-all duration-200 ${
        active ? "text-primary" : "text-zinc-500"
      }`}
    >
      <span
        className={`material-symbols-outlined text-[20px] transition-all duration-200 ${
          active ? "icon-filled scale-110" : ""
        }`}
      >
        {icon}
      </span>
      <span className="text-[9px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </Link>
  );
}
