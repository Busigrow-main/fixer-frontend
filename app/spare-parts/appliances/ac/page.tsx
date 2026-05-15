"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ACFilterSidebar } from "@/app/components/appliances/ACFilterSidebar";
import { ACProductCard } from "@/app/components/appliances/ACProductCard";
import { ACSortBar } from "@/app/components/appliances/ACSortBar";

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
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("perPage")) params.set("perPage", "12");

      // For now, use mock data. Later replace with API call.
      // const response = await fetch(`/api/v1/appliances/ac?${params.toString()}`);
      // if (!response.ok) throw new Error('Failed to fetch products');
      // const data = await response.json();

      // Mock data for now
      const mockData = {
        status: "success",
        total: 7,
        page: parseInt(params.get("page") || "1"),
        perPage: 12,
        products: [
          {
            id: "ac_001",
            slug: "godrej-1-5t-5s-inverter-split",
            name: "Godrej 1.5 Ton 5 Star Inverter Split AC",
            brand: "Godrej",
            modelNumber: "GIC 18TTC5-WTA",
            price: 38990,
            originalPrice: 45500,
            capacityTon: 1.5,
            starRating: 5,
            acType: "split",
            isInverter: true,
            shortDescription:
              "Efficient cooling with Auto Clean and Wi-Fi control.",
            images: [
              "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 5,
            installationIncluded: true,
          },
          {
            id: "ac_002",
            slug: "godrej-1-0t-3s-window-ac",
            name: "Godrej 1.0 Ton 3 Star Window AC",
            brand: "Godrej",
            modelNumber: "GIW 12UDC5-WNA",
            price: 22500,
            originalPrice: 28000,
            capacityTon: 1.0,
            starRating: 3,
            acType: "window",
            isInverter: false,
            shortDescription: "Affordable cooling for small to medium rooms.",
            images: [
              "https://images.unsplash.com/photo-1585323555910-6831094a37e6?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 3,
            installationIncluded: true,
          },
          {
            id: "ac_003",
            slug: "godrej-2-0t-5s-inverter-split",
            name: "Godrej 2.0 Ton 5 Star Inverter Split AC",
            brand: "Godrej",
            modelNumber: "GIC 24TTC5-WTA",
            price: 55000,
            originalPrice: 68000,
            capacityTon: 2.0,
            starRating: 5,
            acType: "split",
            isInverter: true,
            shortDescription:
              "Premium 2-Ton AC for large rooms with maximum efficiency.",
            images: [
              "https://images.unsplash.com/photo-1616394584738-fc6e612ce4d0?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 5,
            installationIncluded: true,
          },
          {
            id: "ac_004",
            slug: "godrej-1-5t-4s-inverter-split",
            name: "Godrej 1.5 Ton 4 Star Inverter Split AC",
            brand: "Godrej",
            modelNumber: "GIC 18TTC4-WTA",
            price: 32500,
            originalPrice: 40000,
            capacityTon: 1.5,
            starRating: 4,
            acType: "split",
            isInverter: true,
            shortDescription:
              "Value-packed 4-Star inverter AC with Wi-Fi control.",
            images: [
              "https://images.unsplash.com/photo-1584703304017-2953219fbe9f?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 5,
            installationIncluded: true,
          },
          {
            id: "ac_005",
            slug: "godrej-0-75t-3s-window-ac",
            name: "Godrej 0.75 Ton 3 Star Window AC",
            brand: "Godrej",
            modelNumber: "GIW 09UDC3-WNA",
            price: 18900,
            originalPrice: 23000,
            capacityTon: 0.75,
            starRating: 3,
            acType: "window",
            isInverter: false,
            shortDescription: "Compact 0.75-Ton window AC for small rooms.",
            images: [
              "https://images.unsplash.com/photo-1585419317631-fd1eaae7a01d?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 3,
            installationIncluded: true,
          },
          {
            id: "ac_006",
            slug: "godrej-1-5t-5s-portable-ac",
            name: "Godrej 1.5 Ton 5 Star Portable AC",
            brand: "Godrej",
            modelNumber: "GIP 15PPM5-TNA",
            price: 45000,
            originalPrice: 55000,
            capacityTon: 1.5,
            starRating: 5,
            acType: "portable",
            isInverter: true,
            shortDescription: "Premium portable AC with 5-Star efficiency.",
            images: [
              "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 5,
            installationIncluded: false,
          },
          {
            id: "ac_007",
            slug: "godrej-2-0t-4s-inverter-split",
            name: "Godrej 2.0 Ton 4 Star Inverter Split AC",
            brand: "Godrej",
            modelNumber: "GIC 24TTC4-WTA",
            price: 47500,
            originalPrice: 60000,
            capacityTon: 2.0,
            starRating: 4,
            acType: "split",
            isInverter: true,
            shortDescription: "Powerful 2-Ton inverter AC for large spaces.",
            images: [
              "https://images.unsplash.com/photo-1616394584738-fc6e612ce4d0?w=500&h=500&fit=crop",
            ],
            inStock: true,
            warrantyYears: 5,
            installationIncluded: true,
          },
        ],
      };

      setProducts(mockData.products || []);
      setTotal(mockData.total || 0);
      setPage(mockData.page || 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
          <Link href="/" className="hover:text-[#C8102E] transition-colors">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/spare-parts"
            className="hover:text-[#C8102E] transition-colors"
          >
            Spare Parts
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/spare-parts/appliances"
            className="hover:text-[#C8102E] transition-colors"
          >
            Appliances
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">AC</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Air Conditioners
          </h1>
          <p className="text-gray-600">
            {total > 0
              ? `${total} Godrej AC ${total === 1 ? "product" : "products"} available`
              : "No products found"}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hide on mobile, show on lg */}
          <div className="lg:col-span-1 hidden lg:block">
            <ACFilterSidebar />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <ACSortBar />

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg h-80 animate-pulse"
                    />
                  ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 flex-shrink-0 mt-0.5">
                  error
                </span>
                <div>
                  <p className="font-semibold">Error loading products</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ACProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-8 pt-8 border-t border-gray-200">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (page - 1).toString(),
                        }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined">
                          arrow_back
                        </span>
                        Previous
                      </Link>
                    )}

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (pageNum) => (
                          <Link
                            key={pageNum}
                            href={`?${new URLSearchParams({
                              ...Object.fromEntries(searchParams),
                              page: pageNum.toString(),
                            }).toString()}`}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === page
                                ? "bg-[#C8102E] text-white"
                                : "border border-gray-300 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </Link>
                        ),
                      )}
                    </div>

                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (page + 1).toString(),
                        }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm flex items-center gap-2"
                      >
                        Next
                        <span className="material-symbols-outlined">
                          arrow_forward
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}

            {/* No Products State */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-16">
                <span className="material-symbols-outlined text-6xl text-gray-300 block mb-4">
                  air_purifier
                </span>
                <p className="text-gray-500 text-lg font-medium">
                  No products found with the selected filters.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your filters or browsing all AC units.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
