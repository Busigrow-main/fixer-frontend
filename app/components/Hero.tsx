"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroOffersCarousel from "@/app/components/HeroOffersCarousel";
import { useBooking } from "@/app/context/BookingContext";

const TRUST_ITEMS = [
  { icon: "verified_user", value: "60-Day", label: "Warranty" },
  { icon: "schedule", value: "30-Min", label: "Avg. arrival" },
  { icon: "groups", value: "12k+", label: "Repairs" },
] as const;

export default function Hero() {
  const { openBooking } = useBooking();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <section className="relative overflow-hidden bg-white pb-6 pt-2 md:pb-12 md:pt-24 lg:pt-28">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-28 h-80 w-80 rounded-full bg-primary-container/40 blur-[100px]" />

      <div className="relative z-10 container mx-auto grid max-w-screen-2xl items-start gap-x-14 gap-y-4 px-5 md:gap-y-6 md:px-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(440px,1.08fr)] xl:gap-x-20">
        <div
          className={`order-1 transition-all duration-500 lg:order-none lg:pt-4 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-label text-[8px] font-black uppercase tracking-[0.12em] text-white md:mb-4 md:gap-2 md:px-3.5 md:py-1.5 md:text-[10px] md:tracking-[0.2em]">
            <span className="h-1 w-1 animate-pulse rounded-full bg-white md:h-1.5 md:w-1.5" />
            25 Years of Technical Mastery
          </span>
          <h1 className="max-w-2xl font-headline text-[1.85rem] leading-[1.08] tracking-tight text-on-surface sm:text-4xl md:text-6xl lg:text-[4.7rem] xl:text-[5.35rem]">
            Your <span className="italic text-primary">Fixxer</span>
            <br />
            for Master Repairs.
          </h1>

          <div className="mt-6 hidden grid-cols-3 border-t border-outline pt-5 lg:mt-10 lg:grid">
            {TRUST_ITEMS.map(({ icon, value, label }, index) => (
              <div
                key={label}
                className={`flex items-center gap-2.5 ${
                  index > 0 ? "border-l border-outline pl-3 md:pl-5" : ""
                }`}
              >
                <span className="material-symbols-outlined text-xl text-primary md:text-2xl">
                  {icon}
                </span>
                <div>
                  <p className="text-xs font-extrabold leading-none text-on-surface md:text-sm">
                    {value}
                  </p>
                  <p className="mt-1 text-[9px] leading-none text-on-surface-variant md:text-[10px]">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`order-2 flex w-full flex-col gap-3 transition-all delay-150 duration-700 md:gap-4 lg:order-none lg:col-start-2 lg:row-start-1 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <HeroOffersCarousel className="w-full rounded-2xl border border-outline/60 shadow-lg shadow-black/8 md:rounded-3xl md:shadow-xl md:shadow-black/10 lg:rounded-[2.25rem]" />

          <div className="flex flex-col items-center gap-2 md:gap-2.5">
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-extrabold text-on-primary shadow-md shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] md:h-13 md:text-[15px]"
            >
              <span className="material-symbols-outlined icon-filled text-[18px] md:text-[20px]">
                build
              </span>
              Book Fixxer
            </button>
            <Link
              href="#service-picker"
              className="inline-flex items-center gap-1 py-1 text-[13px] font-semibold text-on-surface-variant transition-colors hover:text-primary"
            >
              Browse services
              <span className="material-symbols-outlined text-base">
                keyboard_arrow_down
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-3 border-t border-outline pt-3.5 lg:hidden">
            {TRUST_ITEMS.map(({ icon, value, label }, index) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 ${
                  index > 0 ? "border-l border-outline pl-2.5" : ""
                }`}
              >
                <span className="material-symbols-outlined text-base text-primary">
                  {icon}
                </span>
                <div>
                  <p className="text-[11px] font-extrabold leading-none text-on-surface">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[8px] leading-none text-on-surface-variant">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
