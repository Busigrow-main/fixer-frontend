"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import ShopProductCard from "@/app/components/shop/ShopProductCard";

interface PopularPartsSectionProps {
  apiUrl: string;
  onPartSelect?: (part: any) => void;
  onBrowseAll?: () => void;
}

export const PopularPartsSection = ({
  apiUrl,
  onPartSelect,
  onBrowseAll,
}: PopularPartsSectionProps) => {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchPopularParts = async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          isFeatured: "true",
          limit: "6",
        });

        const res = await fetch(
          `${apiUrl}/spare-parts?${params.toString()}`,
          {
            cache: "no-store",
          },
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch featured parts: ${res.status}`);
        }

        const result = await res.json();

        if (!cancelled) {
          setParts(Array.isArray(result?.data) ? result.data : []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Error fetching popular parts:", error);
          setParts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPopularParts();

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  if (loading) {
    return <PopularPartsSkeleton />;
  }

  if (parts.length === 0) {
    return null;
  }

  const visibleParts = parts.slice(0, 6);

  return (
    <section
      aria-labelledby="popular-parts-heading"
      className="w-full"
    >
      {/* Section heading */}
      <div className="mb-5 flex items-end justify-between gap-4 sm:mb-6">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/[0.08] text-primary">
              <Sparkles className="h-3 w-3" />
            </span>

            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Featured parts
            </p>
          </div>

          <h2
            id="popular-parts-heading"
            className="text-xl font-black tracking-[-0.025em] text-slate-950 sm:text-2xl"
          >
            Popular spare parts
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
            Frequently requested parts from our catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={onBrowseAll}
          className="hidden shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-black text-primary transition-colors hover:bg-primary/[0.06] sm:inline-flex"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Mobile horizontal rail */}
      <div className="-mx-4 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex min-w-0 gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {visibleParts.map((part, index) => {
            const key =
              part?._id ||
              part?.sku ||
              part?.slug ||
              `featured-part-${index}`;

            return (
              <div
                key={key}
                className="w-[78vw] max-w-[310px] shrink-0 sm:w-auto sm:max-w-none"
                onClick={() => onPartSelect?.(part)}
              >
                <ShopProductCard part={part} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile browse CTA */}
      <div className="mt-4 sm:hidden">
        <button
          type="button"
          onClick={onBrowseAll}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-xs font-black text-slate-800 transition-colors hover:border-primary/20 hover:text-primary"
        >
          Browse all spare parts
          <ArrowRight className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* Trust strip */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <TrustPill label="Verified catalog" />
        <TrustPill label="Part availability checked" />
        <TrustPill label="No payment required" />
      </div>
    </section>
  );
};

function TrustPill({ label }: { label: string }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      {label}
    </span>
  );
}

function PopularPartsSkeleton() {
  return (
    <section
      aria-label="Loading popular spare parts"
      className="w-full"
    >
      <div className="mb-5">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-3 h-7 w-52 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-lg bg-slate-100" />
      </div>

      <div className="-mx-4 overflow-hidden px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-[78vw] max-w-[310px] shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:w-auto sm:max-w-none"
            >
              <div className="aspect-[4/3] animate-pulse bg-slate-100" />

              <div className="space-y-3 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />

                <div className="pt-2">
                  <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PopularPartsSection;