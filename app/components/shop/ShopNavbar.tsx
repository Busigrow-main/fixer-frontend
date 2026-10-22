"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { useBooking } from "@/app/context/BookingContext";
import { useAuth } from "@/app/context/AuthContext";
import { MobileBottomNav } from "@/app/components/MobileBottomNav";
import SearchBar from "@/app/components/shop/spare-parts/SearchBar";
import { API_URL } from "@/app/config";
import FixxerLogo from "@/app/components/FixxerLogo";
import CartLink from "@/app/components/shop/CartLink";

export default function ShopNavbar({
  hideMobileHeader = false,
  flowOnMobile = false,
  mobileTitle,
  mobileBackHref = "/shop",
  showMobileBottomNav = true,
  searchValue = "",
  onSearchChange = () => {},
}: {
  hideMobileHeader?: boolean;
  flowOnMobile?: boolean;
  mobileTitle?: string;
  mobileBackHref?: string;
  showMobileBottomNav?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const [cartCount, setCartCount] = useState(0);
  const { openBooking } = useBooking();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    const controller = new AbortController();
    const loadCart = () => {
      fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Could not load cart");
          return response.json();
        })
        .then((cart: { items?: { quantity?: number }[] }) => {
          setCartCount((cart.items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
        })
        .catch((error) => {
          if (error?.name !== "AbortError") setCartCount(0);
        });
    };
    window.addEventListener("shop-cart-updated", loadCart);
    loadCart();
    return () => {
      controller.abort();
      window.removeEventListener("shop-cart-updated", loadCart);
    };
  }, [token]);
  const visibleCartCount = token ? cartCount : 0;

  return (
    <>
      {/* Fixed, full-width bar */}
      <header
  className={`${hideMobileHeader ? "hidden md:block" : ""} ${
    flowOnMobile
      ? "relative md:fixed md:inset-x-0 md:top-0"
      : "fixed left-0 right-0 top-0"
  } z-50 h-14 shrink-0 border-b border-slate-200 bg-white md:h-[72px]`}
>
        {/* Content width matches <main> from sm upwards; full width on phones */}
        <div
          className={`mx-auto h-full w-full items-center gap-4 px-3 sm:max-w-[720px] sm:px-4 md:max-w-[1480px] md:gap-4 md:px-8 lg:px-12 ${mobileTitle ? "hidden md:flex md:justify-between" : hideMobileHeader ? "grid" : "flex justify-between"}`}
          style={hideMobileHeader ? { gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 640px) minmax(0, 1fr)" } : undefined}
        >
          {/* Logo + tagline */}
          <Link href="/" className="flex w-fit min-w-max flex-col leading-none md:justify-self-start" aria-label="Fixxer home">
            <FixxerLogo className="text-[22px] md:text-[28px]" />
          </Link>

          <div className={`${hideMobileHeader ? "block w-full md:justify-self-center" : "hidden md:mx-auto md:block md:w-full md:max-w-[640px] md:flex-1"} min-w-0`}>
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              placeholder="Search appliances, spare parts, brands, or models"
              className="[&_input]:h-11 [&_input]:rounded-xl [&_input]:border-slate-200 [&_input]:bg-slate-50 [&_input]:text-sm [&_input]:focus:bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex w-fit min-w-max shrink-0 items-center gap-2 md:justify-self-end md:gap-3">
            <Link href="/orders" aria-label="Your orders" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95 md:w-auto md:gap-2 md:px-3">
              <ClipboardList className="h-[18px] w-[18px]" />
              <span className="hidden text-xs font-semibold md:inline">Orders</span>
            </Link>
            <CartLink count={visibleCartCount} />
          </div>
        </div>

        {mobileTitle && (
          <div className="absolute inset-x-0 top-0 flex h-14 items-center gap-3 px-3 md:hidden">
            <Link
              href={mobileBackHref}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-800 active:bg-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-sm font-extrabold uppercase tracking-tight text-zinc-900">{mobileTitle}</h1>
            <div className="ml-auto">
              <CartLink count={visibleCartCount} />
            </div>
          </div>
        )}
      </header>

      {/* Spacer: same height as the header so content doesn't slide underneath */}
      <div
        aria-hidden="true"
        className={flowOnMobile ? "hidden md:block md:h-[72px]" : hideMobileHeader ? "hidden h-14 md:block md:h-[72px]" : "h-14 md:h-[72px]"}
      />

      {showMobileBottomNav && <MobileBottomNav activeTab="Shop" onBook={openBooking} />}
    </>
  );
}
