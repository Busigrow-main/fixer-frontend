"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  SearchX,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { ACFilterSidebar } from "@/app/components/appliances/ACFilterSidebar";
import { ACFilterDrawer } from "@/app/components/appliances/ACFilterDrawer";
import { ACProductCard } from "@/app/components/appliances/ACProductCard";
import { ACProductCardMobile } from "@/app/components/appliances/ACProductCardMobile";
import { ACSortBar } from "@/app/components/appliances/ACSortBar";
import ShopHeader from "@/app/components/shop/ShopHeader";

const API =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000/api/v1";

interface ACProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string;
  price: number;
  originalPrice?: number;
  capacityTon: number;
  starRating: number;
  acType: string;
  isInverter: boolean;
  shortDescription?: string;
  images: string[];
  inStock: boolean;
  installationIncluded: boolean;
  warrantyYears: number;
}

export default function ACListingPage() {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ACProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const qs = new URLSearchParams();

      searchParams.forEach((value, key) => {
        if (value) {
          qs.set(key, value);
        }
      });

      const query = qs.toString();

      const response = await fetch(
        `${API}/appliances/ac${query ? `?${query}` : ""}`,
      );

      if (!response.ok) {
        throw new Error(
          `Server error ${response.status}`,
        );
      }

      const data = await response.json();

      const normalizedProducts: ACProduct[] = (
        data.products || []
      ).map((product: any) => ({
        ...product,
        warrantyYears:
          product.productWarrantyYears ??
          product.compressorWarrantyYears ??
          1,
      }));

      setProducts(normalizedProducts);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / 12);

  const createPageHref = (nextPage: number) => {
    const params = new URLSearchParams(
      Array.from(searchParams.entries()),
    );

    params.set("page", nextPage.toString());

    return `?${params.toString()}`;
  };

  return (
    <>
      <ShopHeader />

      <main className="min-h-screen bg-slate-50 pb-24 md:pb-12">
        <div className="mx-auto w-full max-w-7xl px-4 pt-3 md:px-6 md:pt-6 lg:px-8">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 no-scrollbar"
          >
            <Link
              href="/"
              className="transition-colors hover:text-primary"
            >
              Home
            </Link>

            <ChevronRight className="h-3 w-3 shrink-0" />

            <Link
              href="/spare-parts/appliances"
              className="transition-colors hover:text-primary"
            >
              Appliances
            </Link>

            <ChevronRight className="h-3 w-3 shrink-0" />

            <span className="text-slate-700">
              Air Conditioners
            </span>
          </nav>

          {/* Header */}
          <section className="mb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/[0.07] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.12em] text-primary">
                  <Sparkles className="h-3 w-3" />
                  Fixxer Appliances
                </div>

                <h1 className="text-2xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">
                  Air Conditioners
                </h1>

                <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 md:text-sm">
                  Find the right AC for your home and send
                  an enquiry to Fixxer for availability,
                  installation and final pricing.
                </p>
              </div>

              {!loading && !error && total > 0 ? (
                <div className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm sm:flex">
                  <ShieldCheck className="h-4 w-4 text-primary" />

                  <div>
                    <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
                      Available
                    </p>

                    <p className="text-[11px] font-black text-slate-800">
                      {total}{" "}
                      {total === 1
                        ? "AC"
                        : "ACs"}{" "}
                      found
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          {/* Main content */}
          <div className="flex items-start gap-7">
            {/* Desktop filters */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <SlidersHorizontal className="h-4 w-4 text-slate-700" />

                  <h2 className="text-xs font-black text-slate-900">
                    Filter ACs
                  </h2>
                </div>

                <ACFilterSidebar />
              </div>
            </aside>

            {/* Products */}
            <div className="min-w-0 flex-1">
              {/* Mobile filter */}
              <div className="mb-3 lg:hidden">
                <ACFilterDrawer />
              </div>

              {/* Sort */}
              <div className="mb-4">
                <ACSortBar />
              </div>

              {/* Loading */}
              {loading ? (
                <LoadingGrid />
              ) : null}

              {/* Error */}
              {!loading && error ? (
                <ErrorState
                  error={error}
                  onRetry={fetchProducts}
                />
              ) : null}

              {/* Products */}
              {!loading &&
              !error &&
              products.length > 0 ? (
                <>
                  <div className="mb-8 grid grid-cols-2 gap-2.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="min-w-0"
                      >
                        <div className="h-full md:hidden">
                          <ACProductCardMobile
                            product={product}
                          />
                        </div>

                        <div className="hidden h-full md:block">
                          <ACProductCard
                            product={product}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 ? (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      createPageHref={createPageHref}
                    />
                  ) : null}
                </>
              ) : null}

              {/* Empty */}
              {!loading &&
              !error &&
              products.length === 0 ? (
                <EmptyState />
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <div className="aspect-[0.9] animate-pulse bg-slate-100" />

          <div className="space-y-3 p-3.5 md:p-4">
            <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-slate-100" />
            <div className="mt-5 h-9 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <section className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm md:p-8">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-primary">
          <AlertCircle className="h-6 w-6" />
        </div>

        <h2 className="mt-4 text-base font-black text-slate-950">
          Couldn&apos;t load ACs
        </h2>

        <p className="mt-1.5 text-xs leading-5 text-slate-500">
          Something went wrong while loading the
          products. Please try again.
        </p>

        <p className="mt-2 max-w-full truncate text-[10px] text-slate-400">
          {error}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-[10px] font-black text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          Try again
        </button>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-16 shadow-sm">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <SearchX className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-base font-black text-slate-950">
          No ACs match your filters
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Try changing or clearing one or more filters
          to see more products.
        </p>

        <Link
          href="/spare-parts/appliances/ac"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-[10px] font-black text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
        >
          Clear filters
        </Link>
      </div>
    </section>
  );
}

function Pagination({
  currentPage,
  totalPages,
  createPageHref,
}: {
  currentPage: number;
  totalPages: number;
  createPageHref: (page: number) => string;
}) {
  const visiblePages = getVisiblePages(
    currentPage,
    totalPages,
  );

  return (
    <nav
      aria-label="AC product pagination"
      className="border-t border-slate-200 pt-6"
    >
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        {currentPage > 1 ? (
          <Link
            href={createPageHref(currentPage - 1)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />

            <span className="hidden sm:inline">
              Previous
            </span>
          </Link>
        ) : null}

        <div className="flex items-center gap-1">
          {visiblePages.map((item, index) =>
            item === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-9 w-7 items-center justify-center text-xs font-bold text-slate-400"
              >
                …
              </span>
            ) : (
              <Link
                key={item}
                href={createPageHref(item)}
                aria-current={
                  item === currentPage
                    ? "page"
                    : undefined
                }
                className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-[10px] font-black transition-all ${
                  item === currentPage
                    ? "bg-primary text-white shadow-md shadow-primary/15"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {item}
              </Link>
            ),
          )}
        </div>

        {currentPage < totalPages ? (
          <Link
            href={createPageHref(currentPage + 1)}
            className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[10px] font-black text-slate-700 transition-colors hover:border-primary/30 hover:text-primary"
          >
            <span className="hidden sm:inline">
              Next
            </span>

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : null}
      </div>

      <p className="mt-3 text-center text-[9px] font-semibold text-slate-400">
        Page {currentPage} of {totalPages}
      </p>
    </nav>
  );
}

function getVisiblePages(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}