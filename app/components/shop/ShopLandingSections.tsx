"use client";

import ShopApplianceCategories from "@/app/components/shop/ShopApplianceCategories";
import ShopAppliancePromo from "@/app/components/shop/ShopAppliancePromo";
import ShopDealsSection from "@/app/components/shop/ShopDealsSection";
import ShopProductCard from "@/app/components/shop/ShopProductCard";
import { toShopCardProduct } from "@/app/lib/shop-card";
import type { ShopHomeResponse } from "@/app/lib/shop-api";

export default function ShopLandingSections({
  shopData,
  loading,
  error,
  onRetry,
  searchValue = "",
}: {
  shopData: ShopHomeResponse | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  searchValue?: string;
}) {
  const query = searchValue.trim().toLowerCase();
  if (query) {
    const results = (shopData?.products ?? []).filter((product) =>
      `${product.brand ?? ""} ${product.name} ${product.sku ?? ""}`.toLowerCase().includes(query),
    );

    return (
      <section aria-labelledby="shop-search-results-title" aria-busy={loading} className="mx-auto w-full max-w-[1280px] space-y-3 md:space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <h1 id="shop-search-results-title" className="text-lg font-bold text-slate-900 sm:text-xl md:text-2xl">
            Search results
          </h1>
          {!loading && <p className="text-xs text-slate-500 sm:text-sm">{results.length} found</p>}
        </div>
        {loading && !shopData ? (
          <p role="status" className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">Searching products…</p>
        ) : error ? (
          <div role="status" className="rounded-xl bg-white p-6 text-center text-sm text-slate-600">
            Could not load products. <button type="button" onClick={onRetry} className="font-semibold text-[#e9002d]">Try again</button>
          </div>
        ) : results.length ? (
          <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {results.map((product) => <ShopProductCard key={`${product.productType}-${product.id}`} part={toShopCardProduct(product)} />)}
          </div>
        ) : (
          <p role="status" className="rounded-xl bg-white p-6 text-center text-sm text-slate-500">No products match “{searchValue}”. Try another search.</p>
        )}
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 md:gap-8 lg:gap-10">
      <ShopApplianceCategories />
      <ShopAppliancePromo />
      <ShopDealsSection
        searchValue={searchValue}
        shopData={shopData}
        loading={loading}
        error={error}
        onRetry={onRetry}
      />
    </div>
  );
}
