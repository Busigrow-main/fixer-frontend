"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, MapPin, Search, ShoppingCart } from "lucide-react";
import { useBooking } from "@/app/context/BookingContext";
import { MobileBottomNav } from "@/app/components/MobileBottomNav";

const iconBtn =
  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95 md:h-10 md:w-10";

export default function ShopNavbar() {
  const [location, setLocation] = useState("Patna");
  const { openBooking } = useBooking();

  return (
    <>
      {/* Fixed, full-width bar */}
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-slate-200 bg-white md:h-[72px]">
        {/* Content width matches <main> from sm upwards; full width on phones */}
        <div className="mx-auto flex h-full w-full items-center justify-between gap-3 px-3 sm:max-w-[720px] sm:px-4 md:max-w-[1280px] md:px-8 lg:px-12">
          {/* Logo + tagline */}
          <Link href="/" className="flex flex-col leading-none" aria-label="Fixxer home">
            <span className="text-[22px] font-extrabold tracking-tight text-[#e9002d] md:text-[28px]">
              Fixxer.
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
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

            <button type="button" className={iconBtn} aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
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
      <div aria-hidden="true" className="hidden h-14 md:block md:h-[72px]" />

      <MobileBottomNav activeTab="Shop" onBook={openBooking} />
    </>
  );
}