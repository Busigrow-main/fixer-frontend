"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Cpu,
  Droplets,
  Fan,
  Gauge,
  Grid2X2,
  Layers3,
  Refrigerator,
  Settings,
  Shield,
  Sparkles,
  Thermometer,
  WashingMachine,
  Wind,
  Zap,
} from "lucide-react";

type PartCategory = {
  slug?: string;
  name?: string;
  icon?: string;
  partCount?: number;
  brands?: Array<{
    brandSlug?: string;
    brandName?: string;
    partCount?: number;
  }>;
};

type ApplianceCategory = {
  applianceTypeSlug?: string;
  applianceTypeName?: string;
  applianceTypeIcon?: string;
  sortOrder?: number;
  partCategories?: PartCategory[];
  totalPartsCount?: number;
  universalPartsCount?: number;
};

type PartCategoryGridProps = {
  categories?: ApplianceCategory[];
  onBrowse?: (applianceType: string, category?: string) => void;
};

const iconMap: Record<string, React.ElementType> = {
  settings: Settings,
  thermostat: Thermometer,
  thermometer: Thermometer,
  zap: Zap,
  shield: Shield,
  droplets: Droplets,
  water: Droplets,
  cpu: Cpu,
  repeat: Layers3,
  fan: Fan,
  wind: Wind,
  ac: Wind,
  "air-conditioner": Wind,
  refrigerator: Refrigerator,
  washingmachine: WashingMachine,
  "washing-machine": WashingMachine,
  category: Grid2X2,
};

function getIcon(icon?: string, categoryName?: string) {
  const normalized = String(icon || "").toLowerCase().replace(/[\s_-]/g, "");

  if (iconMap[normalized]) {
    return iconMap[normalized];
  }

  const name = String(categoryName || "").toLowerCase();

  if (
    name.includes("compressor") ||
    name.includes("motor") ||
    name.includes("gear")
  ) {
    return Settings;
  }

  if (
    name.includes("filter") ||
    name.includes("gasket") ||
    name.includes("seal")
  ) {
    return Shield;
  }

  if (
    name.includes("pump") ||
    name.includes("drain") ||
    name.includes("water")
  ) {
    return Droplets;
  }

  if (
    name.includes("pcb") ||
    name.includes("board") ||
    name.includes("control")
  ) {
    return Cpu;
  }

  if (
    name.includes("capacitor") ||
    name.includes("relay") ||
    name.includes("electrical")
  ) {
    return Zap;
  }

  if (
    name.includes("thermostat") ||
    name.includes("temperature") ||
    name.includes("sensor")
  ) {
    return Thermometer;
  }

  if (
    name.includes("belt") ||
    name.includes("drum") ||
    name.includes("bearing")
  ) {
    return Layers3;
  }

  if (
    name.includes("fan") ||
    name.includes("blower") ||
    name.includes("condenser")
  ) {
    return Fan;
  }

  return Grid2X2;
}

function formatCount(value?: number) {
  if (!Number.isFinite(Number(value))) return null;

  const count = Number(value);

  if (count <= 0) return null;

  return `${count.toLocaleString("en-IN")} ${
    count === 1 ? "part" : "parts"
  }`;
}

function buildHref(type?: string, category?: string) {
  if (!type) return "/spare-parts";

  const params = new URLSearchParams();
  params.set("type", type);

  if (category) {
    params.set("cat", category);
  }

  return `/spare-parts?${params.toString()}`;
}

export default function PartCategoryGrid({
  categories = [],
  onBrowse,
}: PartCategoryGridProps) {
  const validCategories = categories
    .filter(
      (category) =>
        category &&
        (category.applianceTypeSlug || category.applianceTypeName),
    )
    .sort(
      (a, b) =>
        Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999),
    );

  if (!validCategories.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="spare-part-categories-heading"
      className="w-full"
    >
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Find by appliance
            </p>
          </div>

          <h2
            id="spare-part-categories-heading"
            className="text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl"
          >
            What do you need a part for?
          </h2>

          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500 sm:text-sm">
            Choose your appliance first, then find the exact part you need.
          </p>
        </div>

        <div className="hidden shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 sm:flex">
          <Grid2X2 className="h-3.5 w-3.5" />
          Browse parts
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {validCategories.map((category) => {
          const type =
            category.applianceTypeSlug ||
            category.applianceTypeName ||
            "";

          const typeName =
            category.applianceTypeName ||
            category.applianceTypeSlug ||
            "Appliance";

          const partCategories = Array.isArray(category.partCategories)
            ? category.partCategories
                .filter((item) => item && item.name)
                .slice(0, 4)
            : [];

          const totalParts = Number(category.totalPartsCount || 0);

          const ApplianceIcon = getIcon(
            category.applianceTypeIcon,
            typeName,
          );

          return (
            <article
              key={type}
              className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.09)]"
            >
              <Link
                href={buildHref(type)}
                onClick={(event) => {
                  if (onBrowse) {
                    event.preventDefault();
                    onBrowse(type);
                  }
                }}
                className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                {/* Header */}
                <div className="relative overflow-hidden px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/[0.045] transition-transform duration-500 group-hover:scale-125" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary sm:h-12 sm:w-12">
                      <ApplianceIcon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                    </div>

                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all group-hover:border-primary/20 group-hover:bg-primary/[0.06] group-hover:text-primary">
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <div className="relative mt-4">
                    <h3 className="text-[15px] font-black tracking-[-0.015em] text-slate-950 sm:text-base">
                      {typeName}
                    </h3>

                    {totalParts > 0 ? (
                      <p className="mt-1 text-[10px] font-bold text-slate-400 sm:text-[11px]">
                        {totalParts.toLocaleString("en-IN")} parts available
                      </p>
                    ) : (
                      <p className="mt-1 text-[10px] font-bold text-slate-400 sm:text-[11px]">
                        Browse available parts
                      </p>
                    )}
                  </div>
                </div>

                {/* Category list */}
                {partCategories.length > 0 ? (
                  <div className="border-t border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
                    <div className="space-y-1">
                      {partCategories.map((partCategory) => {
                        const CategoryIcon = getIcon(
                          partCategory.icon,
                          partCategory.name,
                        );

                        const countLabel = formatCount(
                          partCategory.partCount,
                        );

                        const categoryHref = buildHref(
                          type,
                          partCategory.slug,
                        );

                        return (
                          <div
                            key={
                              partCategory.slug ||
                              partCategory.name
                            }
                            className="group/category flex items-center gap-2 rounded-xl px-1 py-1.5"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition-colors group-hover/category:bg-primary/[0.07] group-hover/category:text-primary">
                              <CategoryIcon className="h-3.5 w-3.5" />
                            </span>

                            <span className="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-600 sm:text-xs">
                              {partCategory.name}
                            </span>

                            {countLabel ? (
                              <span className="shrink-0 text-[9px] font-bold text-slate-400">
                                {countLabel}
                              </span>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>

                    {partCategories.length > 0 ? (
                      <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-primary">
                        <span>View all {typeName} parts</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Explore available parts
                    </div>
                  </div>
                )}
              </Link>

              {/* Category quick links */}
              {partCategories.length > 0 ? (
                <div className="hidden">
                  {partCategories.map((partCategory) => (
                    <Link
                      key={`hidden-${partCategory.slug}`}
                      href={buildHref(type, partCategory.slug)}
                    >
                      {partCategory.name}
                    </Link>
                  ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {/* Universal parts */}
      {validCategories.some(
        (category) => Number(category.universalPartsCount || 0) > 0,
      ) ? (
        <Link
          href="/spare-parts?isUniversal=true"
          className="mt-4 flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-primary/15 bg-primary/[0.035] px-4 py-3 text-primary transition-colors hover:border-primary/25 hover:bg-primary/[0.06] sm:px-5"
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
              <Settings className="h-4 w-4" />
            </span>

            <div className="min-w-0">
              <p className="truncate text-xs font-black text-slate-900 sm:text-sm">
                Looking for a universal part?
              </p>
              <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500 sm:text-xs">
                Browse parts designed for multiple compatible models.
              </p>
            </div>
          </div>

          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      ) : null}
    </section>
  );
}