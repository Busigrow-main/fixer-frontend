"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ACFilterSidebar } from "@/app/components/appliances/ACFilterSidebar";
import { ACFilterDrawer } from "@/app/components/appliances/ACFilterDrawer";
import { ACProductCard } from "@/app/components/appliances/ACProductCard";
import { ACProductCardMobile } from "@/app/components/appliances/ACProductCardMobile";
import { ACSortBar } from "@/app/components/appliances/ACSortBar";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

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
  const router = useRouter();
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
      searchParams.forEach((v, k) => v && qs.set(k, v));
      const res = await fetch(`${API}/appliances/ac?${qs.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setProducts(
        (data.products || []).map((p: any) => ({
          ...p,
          warrantyYears: p.productWarrantyYears ?? p.compressorWarrantyYears ?? 1,
        }))
      );
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / 12);

  return (
    <main className="min-h-screen bg-background pb-mobile-nav md:pb-12 md:py-8">
      <div className="container mx-auto max-w-7xl px-4 pt-2 md:pt-0">
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant no-scrollbar">
          <Link href="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="text-outline">/</span>
          <Link href="/spare-parts/appliances" className="transition-colors hover:text-primary">
            Appliances
          </Link>
          <span className="text-outline">/</span>
          <span className="text-on-surface">Air Conditioners</span>
        </nav>

        {/* Page Header */}
        <div className="mb-5">
          <h1 className="font-headline text-2xl font-bold tracking-tight text-on-surface md:text-4xl">
            Air Conditioners
          </h1>
          <p className="mt-1 font-body text-sm text-on-surface-variant md:text-base">
            {loading
              ? "Loading products…"
              : total > 0
              ? `${total} Godrej AC ${total === 1 ? "product" : "products"} available`
              : "No products found with the selected filters"}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="flex gap-8">
          {/* Sidebar — desktop only */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <ACFilterSidebar />
          </aside>

          {/* Products Area */}
          <div className="flex-1 min-w-0">
            <ACFilterDrawer />
            <ACSortBar />

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-2 gap-2.5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-container-high" />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-error">error</span>
                <div>
                  <p className="font-semibold">Could not load products</p>
                  <p className="text-sm mt-1">{error}</p>
                  <button
                    onClick={fetchProducts}
                    className="mt-3 text-sm font-semibold underline hover:text-red-900"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-6 mb-8">
                  {products.map((product) => (
                    <div key={product.id} className="h-full">
                      <div className="md:hidden h-full">
                        <ACProductCardMobile product={product} />
                      </div>
                      <div className="hidden md:block h-full">
                        <ACProductCard product={product} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap justify-center gap-2 border-t border-outline pt-8">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (page - 1).toString() }).toString()}`}
                        className="flex items-center gap-2 rounded-xl border border-outline px-4 py-2 font-label text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Previous
                      </Link>
                    )}
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Link
                          key={pageNum}
                          href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: pageNum.toString() }).toString()}`}
                          className={`rounded-xl px-3 py-2 font-label text-sm font-semibold transition-colors ${
                            pageNum === page
                              ? "bg-primary text-on-primary"
                              : "border border-outline text-on-surface hover:bg-surface-container"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      ))}
                    </div>
                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (page + 1).toString() }).toString()}`}
                        className="flex items-center gap-2 rounded-xl border border-outline px-4 py-2 font-label text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
                      >
                        Next
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="py-16 text-center">
                <span className="material-symbols-outlined mb-4 block text-6xl text-on-surface-variant/40">
                  ac_unit
                </span>
                <p className="font-headline text-lg font-semibold text-on-surface">
                  No products match your filters.
                </p>
                <p className="mt-2 font-body text-sm text-on-surface-variant">
                  Try adjusting or clearing filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
