"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ShopProductCard from "./ShopProductCard";
import type { ApiShopCard, ShopHomeResponse } from "@/app/lib/shop-api";
import { toShopCardProduct } from "@/app/lib/shop-card";
import { SHOP_ALL_PRODUCTS_HREF } from "@/app/lib/shop-routes";

const DEALS_LIMIT = 4;

function selectDeals(data: ShopHomeResponse, query: string): ApiShopCard[] {
  const matches = (product: ApiShopCard) =>
    !query || `${product.brand ?? ""} ${product.name} ${product.sku ?? ""}`.toLowerCase().includes(query);
  const appliances = data.appliances.filter(matches);
  const parts = data.parts.filter(matches);
  const deals = [...appliances.slice(0, 2), ...parts.slice(0, 2)];
  const selected = new Set(deals.map((product) => `${product.productType}:${product.id}`));

  for (const product of data.products.filter(matches)) {
    if (deals.length >= DEALS_LIMIT) break;
    const key = `${product.productType}:${product.id}`;
    if (!selected.has(key)) {
      deals.push(product);
      selected.add(key);
    }
  }

  return deals;
}

export default function ShopDealsSection({
  searchValue = "",
  shopData,
  loading,
  error,
  onRetry,
}: {
  searchValue?: string;
  shopData: ShopHomeResponse | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}) {
  const query = searchValue.trim().toLowerCase();
  const visibleDeals = shopData ? selectDeals(shopData, query).map(toShopCardProduct) : [];

  return (
    <section aria-labelledby="shop-deals-title" aria-busy={loading} className="space-y-3 md:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2
          id="shop-deals-title"
          className="text-base font-bold text-slate-900 sm:text-lg md:text-2xl lg:text-3xl"
        >
          Best Deals This Week
        </h2>
        <Link
          href={SHOP_ALL_PRODUCTS_HREF}
          className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#e9002d] hover:underline sm:text-sm md:text-base"
        >
          View All <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6" aria-hidden="true">
          {Array.from({ length: DEALS_LIMIT }, (_, index) => (
            <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white sm:rounded-2xl">
              <div className="aspect-[1.4] bg-slate-100" />
              <div className="space-y-2 p-3"><div className="h-3 w-4/5 rounded bg-slate-100" /><div className="h-4 w-1/2 rounded bg-slate-100" /><div className="h-9 rounded-lg bg-slate-100" /></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-600">
          <p>Shop products are temporarily unavailable.</p>
          <button type="button" onClick={onRetry} className="mt-2 font-semibold text-[#e9002d] hover:underline">Try again</button>
        </div>
      ) : visibleDeals.length > 0 ? (
        <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {visibleDeals.map((product) => (
            <ShopProductCard key={product.id} part={product} />
          ))}
        </div>
      ) : (
        <div role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
          <p>
            {shopData?.products.length === 0
              ? "No shop products are available right now."
              : `No products match “${searchValue}”. Try another search.`}
          </p>
          {shopData?.products.length === 0 && (
            <button type="button" onClick={onRetry} className="mt-2 font-semibold text-[#e9002d] hover:underline">Refresh</button>
          )}
        </div>
      )}
    </section>
  );
}
