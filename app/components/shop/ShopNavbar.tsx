"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, MapPin, ShoppingCart } from "lucide-react";
import { useBooking } from "@/app/context/BookingContext";
import { MobileBottomNav } from "@/app/components/MobileBottomNav";
import SearchBar from "@/app/components/shop/spare-parts/SearchBar";

const iconBtn =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95 md:h-10 md:w-10";

export default function ShopNavbar({
  hideMobileHeader = false,
  flowOnMobile = false,
  searchValue = "",
  onSearchChange = () => {},
}: {
  hideMobileHeader?: boolean;
  flowOnMobile?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}) {
  const [location, setLocation] = useState("Patna");
  const { openBooking } = useBooking();

  return (
    <>
      {/* Fixed, full-width bar */}
      <header className={`${hideMobileHeader ? "hidden md:block" : ""} ${flowOnMobile ? "relative md:fixed md:inset-x-0 md:top-0" : "fixed inset-x-0 top-0"} z-50 h-14 border-b border-slate-200 bg-white md:h-[72px]`}>
        {/* Content width matches <main> from sm upwards; full width on phones */}
        <div
          className={`mx-auto h-full w-full items-center gap-4 px-3 sm:max-w-[720px] sm:px-4 md:max-w-[1480px] md:gap-4 md:px-8 lg:px-12 ${hideMobileHeader ? "grid" : "flex justify-between"}`}
          style={hideMobileHeader ? { gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 640px) minmax(0, 1fr)" } : undefined}
        >
          {/* Logo + tagline */}
          <Link href="/" className="flex w-fit min-w-max flex-col leading-none md:justify-self-start" aria-label="Fixxer home">
            <span className="text-[22px] font-extrabold tracking-tight text-[#e9002d] md:text-[28px]">
              Fixxer.
            </span>
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
            <button
              type="button"
              onClick={() =>
                setLocation((l) => (l === "Patna" ? "Bangalore" : "Patna"))
              }
              aria-label={`Current location: ${location}. Tap to change`}
              className="flex h-9 items-center gap-1 rounded-full border border-[#E6E7EB] bg-[#F7F7F8] px-2.5 text-xs font-semibold text-slate-900 transition-colors hover:bg-slate-100 active:scale-95 md:h-10 md:gap-1.5 md:px-4 md:text-sm"
            >
              <MapPin className="h-3.5 w-3.5 text-[#e9002d] md:h-4 md:w-4" />
              {location}
              <ChevronDown className="h-3.5 w-3.5 text-slate-500 md:h-4 md:w-4" />
            </button>

            <Link href="/cart" className={iconBtn} aria-label="Cart, 2 items">
              <ShoppingCart className="h-[18px] w-[18px]" />
              <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#e9002d] px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                2
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer: same height as the header so content doesn't slide underneath */}
      <div
        aria-hidden="true"
        className={flowOnMobile ? "hidden md:block md:h-[72px]" : hideMobileHeader ? "hidden h-14 md:block md:h-[72px]" : "h-14 md:h-[72px]"}
      />

      <MobileBottomNav activeTab="Shop" onBook={openBooking} />
    </>
  );
}
