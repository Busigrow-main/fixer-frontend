"use client";

import Image from "next/image";
import Link from "next/link";
import { AC_SERVICE_IMAGE } from "@/app/lib/services";
import {
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
} from "@/app/lib/shop-routes";

const SHOP_PATHS = [
  {
    id: "spare-parts",
    title: "Spare Parts",
    tagline: "OEM Catalog",
    overlayLabel: "Up to",
    overlayValue: "50% Off",
    href: SHOP_SPARE_PARTS_HREF,
    image:
      "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=2000&auto=format&fit=crop",
  },
  {
    id: "appliances",
    title: "Appliances",
    tagline: "Buy · Install",
    overlayLabel: "Includes",
    overlayValue: "Installation",
    href: SHOP_APPLIANCES_HREF,
    image: AC_SERVICE_IMAGE,
  },
] as const;

const TRUST_POINTS = [
  { icon: "verified", label: "Genuine products" },
  { icon: "handyman", label: "Expert installation" },
  { icon: "local_shipping", label: "Patna & Bihar delivery" },
  { icon: "support_agent", label: "Dedicated support" },
] as const;

export default function HomeShopSection() {
  return (
    <section
      id="shop"
      className="relative overflow-hidden bg-surface-container-low py-12 md:py-20 carbon-texture"
    >
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-secondary-container/40 blur-[80px]" />

      <div className="relative z-10 container mx-auto max-w-screen-2xl px-6 md:px-10">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
          <p className="mb-3 font-label text-[10px] font-black uppercase tracking-[0.28em] text-primary md:text-xs">
            Fixxer Shop
          </p>
          <h2 className="font-headline text-3xl leading-tight tracking-tight text-on-surface md:text-6xl">
            Spare parts &{" "}
            <span className="italic text-primary">appliances</span>, one trusted place
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-base leading-relaxed text-on-surface-variant md:text-lg">
            Beyond repairs, Fixxer supplies the parts technicians trust and sells
            home appliances with installation included — the same mastery, from
            catalog to your doorstep.
          </p>
          <div className="mx-auto mt-5 h-0.5 w-12 rounded-full bg-primary md:w-16" />
        </div>

        {/* Shop cards — same pattern as repair service cards */}
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 md:gap-8">
          {SHOP_PATHS.map((path) => (
            <div
              key={path.id}
              className="group cursor-pointer transition-transform duration-200 active:scale-[0.98]"
            >
              <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-outline/50 shadow-sm md:mb-5 md:rounded-[2rem]">
                <Image
                  src={path.image}
                  alt={path.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <Link
                  href={path.href}
                  className="absolute inset-0 z-10"
                  aria-label={`Browse ${path.title}`}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />

                <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between md:bottom-6 md:left-6 md:right-6">
                  <div>
                    <p className="mb-0.5 font-label text-[7px] font-bold uppercase tracking-[0.2em] text-white/60 md:text-[9px]">
                      {path.overlayLabel}
                    </p>
                    <p className="font-headline text-sm font-black text-white md:text-lg">
                      {path.overlayValue}
                    </p>
                  </div>
                  <Link
                    href={path.href}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-xl transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white active:scale-95 md:h-12 md:w-12"
                    aria-label={`Go to ${path.title}`}
                  >
                    <span className="material-symbols-outlined text-sm icon-filled md:text-lg">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <div>
                  <h3 className="font-headline text-lg text-on-surface transition-colors duration-300 group-hover:text-primary md:text-2xl">
                    {path.title}
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 transition-colors group-hover:text-primary/60 md:text-[10px]">
                    {path.tagline}
                  </p>
                </div>
                <Link
                  href={path.href}
                  className="hidden h-8 w-8 items-center justify-center rounded-full border border-outline text-on-surface-variant transition-all hover:border-primary hover:text-primary sm:flex"
                  aria-label={`Open ${path.title}`}
                >
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Featured AC strip */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-outline bg-surface-bright md:mt-8 md:rounded-[1.75rem]">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container">
                <span className="material-symbols-outlined text-2xl text-primary icon-filled">
                  ac_unit
                </span>
              </span>
              <div>
                <p className="font-label text-[10px] font-black uppercase tracking-widest text-primary">
                  Now available
                </p>
                <p className="font-headline text-lg font-bold text-on-surface md:text-xl">
                  Godrej air conditioners
                </p>
                <p className="mt-0.5 font-body text-sm text-on-surface-variant">
                  Split & inverter models · Installation included · Patna delivery
                </p>
              </div>
            </div>
            <Link
              href={`${SHOP_APPLIANCES_HREF}/ac`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-6 font-label text-xs font-black uppercase tracking-widest text-on-primary shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] md:self-center"
            >
              View AC range
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
        </div>

        {/* Trust row */}
        <div className="mt-8 flex gap-3 overflow-x-auto pb-1 no-scrollbar md:mt-10 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {TRUST_POINTS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex min-w-[140px] shrink-0 items-center gap-2.5 rounded-xl border border-outline bg-surface-bright px-4 py-3 md:min-w-0"
            >
              <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wide text-on-surface">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom links */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:mt-10">
          <Link
            href={SHOP_SPARE_PARTS_HREF}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-outline bg-surface-bright px-8 font-label text-xs font-black uppercase tracking-widest text-on-surface transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">storefront</span>
            Spare parts catalog
          </Link>
          <Link
            href="/spare-parts/enquiry"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-8 font-label text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">post_add</span>
            Post a requirement
          </Link>
        </div>
      </div>
    </section>
  );
}
