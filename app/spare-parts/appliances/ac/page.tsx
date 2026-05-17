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
    <main className="min-h-screen bg-gray-50 py-8 pb-24 md:pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-[#C8102E] transition-colors">Home</Link>
          <span className="text-gray-400">/</span>
          <Link href="/spare-parts" className="hover:text-[#C8102E] transition-colors">Spare Parts</Link>
          <span className="text-gray-400">/</span>
          <Link href="/spare-parts/appliances" className="hover:text-[#C8102E] transition-colors">Appliances</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Air Conditioners</span>
        </nav>

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1">Air Conditioners</h1>
          <p className="text-gray-600 text-sm md:text-base">
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
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5">error</span>
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
                  <div className="flex flex-wrap justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (page - 1).toString() }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pageNum === page
                              ? "bg-[#C8102E] text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      ))}
                    </div>
                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({ ...Object.fromEntries(searchParams), page: (page + 1).toString() }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
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
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">ac_unit</span>
                <p className="text-gray-500 text-lg font-medium">No products match your filters.</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting or clearing filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
