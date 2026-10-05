"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Tag } from "lucide-react";

type Brand = {
  brandSlug?: string;
  slug?: string;
  brandName?: string;
  name?: string;
  partCount?: number;
};

type BrandGridProps = {
  brands?: Brand[];
  applianceType?: string;
  title?: string;
  showViewAll?: boolean;
};

export default function BrandGrid({
  brands = [],
  applianceType,
  title = "Shop by brand",
  showViewAll = true,
}: BrandGridProps) {
  const validBrands = brands
    .filter((brand) => brand && (brand.brandName || brand.name))
    .slice(0, 12);

  if (!validBrands.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="shop-by-brand-heading"
      className="w-full"
    >
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/[0.08] text-primary">
              <Tag className="h-3 w-3" />
            </span>

            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Genuine compatibility
            </p>
          </div>

          <h2
            id="shop-by-brand-heading"
            className="text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl"
          >
            {title}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Find parts compatible with the brand you use.
          </p>
        </div>

        {showViewAll ? (
          <Link
            href={buildBrandHref(applianceType)}
            className="hidden shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-black text-primary transition-colors hover:bg-primary/[0.06] sm:inline-flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-6">
        {validBrands.map((brand) => {
          const name = brand.brandName || brand.name || "Brand";
          const slug = brand.brandSlug || brand.slug || name;

          const href = buildBrandHref(applianceType, slug);

          return (
            <Link
              key={slug}
              href={href}
              className="group relative flex min-h-[82px] items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3.5 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.07)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition-colors group-hover:bg-primary/[0.07] group-hover:text-primary">
                <span className="text-sm font-black uppercase">
                  {getInitials(name)}
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="truncate text-xs font-black text-slate-900 sm:text-sm">
                    {name}
                  </h3>

                  <CheckCircle2 className="h-3 w-3 shrink-0 text-primary" />
                </div>

                {Number(brand.partCount) > 0 ? (
                  <p className="mt-1 text-[9px] font-bold text-slate-400 sm:text-[10px]">
                    {Number(brand.partCount).toLocaleString("en-IN")} parts
                  </p>
                ) : (
                  <p className="mt-1 text-[9px] font-bold text-slate-400 sm:text-[10px]">
                    View compatible parts
                  </p>
                )}
              </div>

              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </div>

      {showViewAll ? (
        <div className="mt-4 sm:hidden">
          <Link
            href={buildBrandHref(applianceType)}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 transition-colors hover:border-primary/20 hover:text-primary"
          >
            Browse all brands
            <ArrowRight className="h-4 w-4 text-primary" />
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function buildBrandHref(
  applianceType?: string,
  brand?: string,
) {
  const params = new URLSearchParams();

  if (applianceType) {
    params.set("type", applianceType);
  }

  if (brand) {
    params.set("brand", brand);
  }

  const query = params.toString();

  return query ? `/spare-parts?${query}` : "/spare-parts";
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return "BR";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}