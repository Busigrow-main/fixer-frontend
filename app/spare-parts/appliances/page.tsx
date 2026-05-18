"use client";

import Link from "next/link";
import { ApplianceCategoryCard } from "@/app/components/appliances/ApplianceCategoryCard";
import { SHOP_SPARE_PARTS_HREF } from "@/app/lib/shop-routes";

const APPLIANCE_CATEGORIES = [
  {
    id: "ac",
    name: "Air Conditioner",
    slug: "ac",
    icon: "ac_unit",
    description: "Godrej split & inverter ACs with professional installation across Patna & Bihar.",
    status: "active" as const,
    productCount: 7,
    href: "/spare-parts/appliances/ac",
  },
  {
    id: "fridge",
    name: "Refrigerator",
    slug: "fridge",
    icon: "kitchen",
    description: "Refrigerators and cooling appliances for your home.",
    status: "coming-soon" as const,
    productCount: 0,
    href: "#",
  },
  {
    id: "washing-machine",
    name: "Washing Machine",
    slug: "washing-machine",
    icon: "local_laundry_service",
    description: "Washing machines and laundry solutions.",
    status: "coming-soon" as const,
    productCount: 0,
    href: "#",
  },
] as const;

const TRUST_ITEMS = [
  {
    icon: "handyman",
    title: "Professional installation",
    body: "Certified Fixxer technicians install, test, and hand over a working unit.",
    iconClass: "text-primary",
  },
  {
    icon: "shield",
    title: "Extended warranty",
    body: "60-day Fixxer service warranty on top of the manufacturer coverage.",
    iconClass: "text-secondary",
  },
  {
    icon: "support_agent",
    title: "Dedicated support",
    body: "Guidance from enquiry to delivery, installation, and after-sales care.",
    iconClass: "text-primary",
  },
] as const;

export default function AppliancesPage() {
  return (
    <main className="min-h-screen bg-background pb-mobile-nav md:pb-12 md:py-8">
      <div className="container mx-auto max-w-6xl px-4 pt-2 md:pt-0">
        <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant no-scrollbar">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface">Appliances</span>
        </nav>

        <header className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <p className="mb-3 font-label text-[10px] font-black uppercase tracking-[0.28em] text-primary md:text-xs">
            Fixxer Shop · Appliances
          </p>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-5xl">
            Shop complete <span className="italic text-primary">appliances</span>
          </h1>
          <p className="mt-4 font-body text-base leading-relaxed text-on-surface-variant md:text-lg">
            Buy full units with professional Fixxer installation, trial run, and
            post-install service — delivered and set up in your home.
          </p>
          <div className="mx-auto mt-5 h-0.5 w-12 rounded-full bg-primary md:w-16" />
        </header>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {APPLIANCE_CATEGORIES.map((category) => (
            <ApplianceCategoryCard key={category.id} category={category} />
          ))}
        </div>

        <section
          className="mt-12 rounded-[1.75rem] border border-outline bg-surface-container-low p-6 md:mt-16 md:rounded-[2rem] md:p-10 carbon-texture"
          aria-labelledby="appliances-trust-heading"
        >
          <h2
            id="appliances-trust-heading"
            className="mb-8 text-center font-headline text-xl font-bold text-on-surface md:text-2xl"
          >
            Why buy appliances from Fixxer
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {TRUST_ITEMS.map(({ icon, title, body, iconClass }) => (
              <div key={title} className="text-center">
                <span
                  className={`material-symbols-outlined icon-filled mb-3 block text-4xl ${iconClass}`}
                >
                  {icon}
                </span>
                <h3 className="font-headline text-base font-bold text-on-surface md:text-lg">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-on-surface-variant">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/spare-parts/appliances/ac"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 font-label text-xs font-black uppercase tracking-widest text-on-primary shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">ac_unit</span>
            Browse air conditioners
          </Link>
          <Link
            href={SHOP_SPARE_PARTS_HREF}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-outline bg-surface-bright px-8 font-label text-xs font-black uppercase tracking-widest text-on-surface transition-all hover:border-primary/30 hover:text-primary active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-lg">build_circle</span>
            Need spare parts instead?
          </Link>
        </div>
      </div>
    </main>
  );
}
