"use client";

import Link from "next/link";
import {
  AirVent,
  ArrowRight,
  ChevronRight,
  Microwave,
  Refrigerator,
  WashingMachine,
} from "lucide-react";

type ApplianceCategory = {
  slug: string;
  name: string;
  description: string;
  available: boolean;
  icon: React.ElementType;
};

const applianceCategories: ApplianceCategory[] = [
  {
    slug: "air-conditioner",
    name: "Air Conditioners",
    description: "Split, inverter & window AC parts",
    available: true,
    icon: AirVent,
  },
  {
    slug: "refrigerator",
    name: "Refrigerators",
    description: "Cooling, compressor & control parts",
    available: false,
    icon: Refrigerator,
  },
  {
    slug: "washing-machine",
    name: "Washing Machines",
    description: "Motor, pump, belt & control parts",
    available: false,
    icon: WashingMachine,
  },
  {
    slug: "microwave-oven",
    name: "Microwave & OTG",
    description: "Heating, control & electrical parts",
    available: false,
    icon: Microwave,
  },
];

type ApplianceCategoryGridProps = {
  compact?: boolean;
};

export default function ApplianceCategoryGrid({
  compact = false,
}: ApplianceCategoryGridProps) {
  return (
    <section
      aria-labelledby="appliance-category-heading"
      className="w-full"
    >
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />

            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Shop appliances
            </p>
          </div>

          <h2
            id="appliance-category-heading"
            className="text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl"
          >
            Choose an appliance
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
            Browse appliances and find compatible products and parts.
          </p>
        </div>

        {!compact ? (
          <Link
            href="/spare-parts/appliances"
            className="hidden shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-black text-primary transition-colors hover:bg-primary/[0.06] sm:inline-flex"
          >
            View shop
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div
        className={
          compact
            ? "flex gap-3 overflow-x-auto pb-2 scrollbar-none"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        }
      >
        {applianceCategories.map((category) => {
          const Icon = category.icon;

          if (!category.available) {
            return (
              <div
                key={category.slug}
                className={
                  compact
                    ? "min-w-[220px] shrink-0 rounded-[20px] border border-slate-200 bg-slate-50 p-4 opacity-70"
                    : "rounded-[22px] border border-slate-200 bg-slate-50 p-5 opacity-70"
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-slate-400">
                    Coming soon
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-black text-slate-700">
                  {category.name}
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-400">
                  {category.description}
                </p>
              </div>
            );
          }

          return (
            <Link
              key={category.slug}
              href="/spare-parts/appliances/ac"
              className={
                compact
                  ? "group min-w-[220px] shrink-0 rounded-[20px] border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
                  : "group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.09)]"
              }
            >
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/[0.045] transition-transform duration-500 group-hover:scale-125" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-300 transition-colors group-hover:border-primary/20 group-hover:text-primary">
                  <ChevronRight className="h-4 w-4" />
                </span>
              </div>

              <div className="relative mt-5">
                <h3 className="text-sm font-black text-slate-950 sm:text-base">
                  {category.name}
                </h3>

                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                  {category.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-primary">
                  Browse ACs
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 sm:hidden">
        <Link
          href="/spare-parts/appliances"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 transition-colors hover:border-primary/20 hover:text-primary"
        >
          Open appliance shop
          <ArrowRight className="h-4 w-4 text-primary" />
        </Link>
      </div>
    </section>
  );
}