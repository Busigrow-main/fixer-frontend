"use client";

import Link from "next/link";
import {
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
} from "@/app/lib/shop-routes";

const SHOP_PATHS = [
  {
    id: "spare-parts",
    title: "Spare Parts",
    tagline: "OEM & verified catalog",
    description:
      "Genuine parts for refrigerators, ACs, washing machines, and more. Up to 50% off with Appliance Insurance.",
    icon: "build_circle",
    href: SHOP_SPARE_PARTS_HREF,
    cta: "Browse catalog",
    highlights: ["OEM sourced", "Model-fit search", "Patna delivery"],
    accent: "from-primary/10 to-primary-container",
  },
  {
    id: "appliances",
    title: "Appliances",
    tagline: "Buy · Install · Warranty",
    description:
      "Shop complete units with professional Fixxer installation, trial run, and post-install service included.",
    icon: "ac_unit",
    href: SHOP_APPLIANCES_HREF,
    cta: "Shop appliances",
    highlights: ["Free installation", "Godrej ACs in stock", "60-day service"],
    accent: "from-secondary-container/80 to-surface-container",
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
      <motion.div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
      <motion.div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-secondary-container/40 blur-[80px]" />

      <motion.div className="relative z-10 container mx-auto max-w-screen-2xl px-6 md:px-10">
        {/* Header */}
        <motion.div className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
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
          <motion.div className="mx-auto mt-5 h-0.5 w-12 rounded-full bg-primary md:w-16" />
        </motion.div>

        {/* Two business pillars */}
        <motion.div className="grid gap-5 md:grid-cols-2 md:gap-8">
          {SHOP_PATHS.map((path) => (
            <Link
              key={path.id}
              href={path.href}
              className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-outline bg-surface-bright p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-black/[0.06] active:scale-[0.99] md:rounded-[2rem] md:p-8"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${path.accent} opacity-60 transition-opacity group-hover:opacity-100`}
              />
              <motion.div className="relative z-10 flex flex-1 flex-col">
                <motion.div className="mb-5 flex items-start justify-between gap-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-outline">
                    <span className="material-symbols-outlined text-3xl text-primary icon-filled">
                      {path.icon}
                    </span>
                  </span>
                  <span className="font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                    {path.tagline}
                  </span>
                </motion.div>

                <h3 className="font-headline text-2xl tracking-tight text-on-surface transition-colors group-hover:text-primary md:text-3xl">
                  {path.title}
                </h3>
                <p className="mt-2 flex-1 font-body text-sm leading-relaxed text-on-surface-variant md:text-base">
                  {path.description}
                </p>

                <ul className="mt-5 flex flex-wrap gap-2">
                  {path.highlights.map((item) => (
                    <li
                      key={item}
                      className="rounded-full border border-outline bg-surface-container px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wide text-on-surface-variant"
                    >
                      {item}
                    </li>
                  ))}
                </ul>

                <span className="mt-6 inline-flex items-center gap-2 font-label text-xs font-black uppercase tracking-widest text-primary">
                  {path.cta}
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Featured AC strip */}
        <motion.div className="mt-6 overflow-hidden rounded-2xl border border-outline bg-surface-bright md:mt-8 md:rounded-[1.75rem]">
          <motion.div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <motion.div className="flex min-w-0 items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container">
                <span className="material-symbols-outlined text-2xl text-primary icon-filled">
                  ac_unit
                </span>
              </span>
              <motion.div>
                <p className="font-label text-[10px] font-black uppercase tracking-widest text-primary">
                  Now available
                </p>
                <p className="font-headline text-lg font-bold text-on-surface md:text-xl">
                  Godrej air conditioners
                </p>
                <p className="mt-0.5 font-body text-sm text-on-surface-variant">
                  Split & inverter models · Installation included · Patna delivery
                </p>
              </motion.div>
            </motion.div>
            <Link
              href={`${SHOP_APPLIANCES_HREF}/ac`}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-primary px-6 font-label text-xs font-black uppercase tracking-widest text-on-primary shadow-md shadow-primary/20 transition-all hover:brightness-110 active:scale-[0.98] md:self-center"
            >
              View AC range
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Trust row */}
        <motion.div className="mt-8 flex gap-3 overflow-x-auto pb-1 no-scrollbar md:mt-10 md:grid md:grid-cols-4 md:gap-4 md:overflow-visible">
          {TRUST_POINTS.map(({ icon, label }) => (
            <motion.div
              key={label}
              className="flex min-w-[140px] shrink-0 items-center gap-2.5 rounded-xl border border-outline bg-surface-bright px-4 py-3 md:min-w-0"
            >
              <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
              <span className="font-label text-[11px] font-bold uppercase tracking-wide text-on-surface">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom links */}
        <motion.div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 md:mt-10">
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
        </motion.div>
      </motion.div>
    </section>
  );
}
