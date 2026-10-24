"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import SearchBar from "@/app/components/shop/spare-parts/SearchBar";
import ShopProductCard from "@/app/components/shop/ShopProductCard";
import ShopProductGridSkeleton from "@/app/components/shop/ShopProductGridSkeleton";
import { getShopHome, type ShopHomeResponse } from "@/app/lib/shop-api";
import { toShopCardProduct } from "@/app/lib/shop-card";

const PAGE_SIZE = 24;

function mergePages(current: ShopHomeResponse | null, incoming: ShopHomeResponse): ShopHomeResponse {
  if (!current) return incoming;
  return {
    ...incoming,
    products: [...current.products, ...incoming.products],
    appliances: [...current.appliances, ...incoming.appliances],
    parts: [...current.parts, ...incoming.parts],
  };
}

export default function ShopAllProductsPage() {
  const [search, setSearch] = useState("");
  const [shopData, setShopData] = useState<ShopHomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const requestController = useRef<AbortController | null>(null);

  const loadPage = useCallback(async (page: number, append: boolean) => {
    try {
      const controller = new AbortController();
      requestController.current = controller;
      const response = await getShopHome(controller.signal, PAGE_SIZE, page);
      if (!controller.signal.aborted) {
        setShopData((current) => append ? mergePages(current, response) : response);
        setError(false);
      }
    } catch (loadError) {
      if (!(loadError instanceof Error && loadError.name === "AbortError")) setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(1, false);
    return () => requestController.current?.abort();
  }, [loadPage]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (shopData?.products ?? [])
      .filter((product) => !query || `${product.brand ?? ""} ${product.name} ${product.sku ?? ""}`.toLowerCase().includes(query))
      .map(toShopCardProduct);
  }, [search, shopData]);

  const retry = () => {
    setLoading(true);
    setError(false);
    void loadPage(shopData ? shopData.pagination.page + 1 : 1, Boolean(shopData));
  };

  const loadMore = () => {
    if (!shopData || loadingMore) return;
    setLoadingMore(true);
    void loadPage(shopData.pagination.page + 1, true);
  };

  const totalProducts = (shopData?.pagination.applianceTotal ?? 0) + (shopData?.pagination.partTotal ?? 0);
  const loadedProducts = (shopData?.appliances.length ?? 0) + (shopData?.parts.length ?? 0);

  if (loading && !shopData) {
    return (
      <div className="shop-shell min-h-screen bg-[#f6f6f6]">
        <ShopNavbar searchValue={search} onSearchChange={setSearch} />
        <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-3 pb-28 pt-3 sm:max-w-[720px] sm:px-4 md:max-w-[1480px] md:gap-5 md:px-8 md:pb-28 md:pt-8 lg:px-12">
          <div className="sticky top-14 z-40 -mx-3 bg-[#f6f6f6] px-3 py-2 md:hidden">
            <SearchBar value={search} onChange={setSearch} placeholder="Search appliances, spare parts, brands, or models" />
          </div>
          <div className="h-5 w-28 animate-pulse rounded bg-zinc-200" />
          <div>
            <div className="h-7 w-56 animate-pulse rounded bg-zinc-200" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200" />
          </div>
          <ShopProductGridSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="shop-shell min-h-screen bg-[#f6f6f6]">
      <ShopNavbar searchValue={search} onSearchChange={setSearch} />
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-3 pb-28 pt-3 sm:max-w-[720px] sm:px-4 md:max-w-[1480px] md:gap-5 md:px-8 md:pb-28 md:pt-8 lg:px-12">
        <div className="sticky top-14 z-40 -mx-3 bg-[#f6f6f6] px-3 py-2 md:hidden">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search appliances, spare parts, brands, or models"
          />
        </div>
        <Link href="/shop" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to shop</Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl md:text-3xl">All shop products</h1>
          <p className="mt-1 text-sm text-slate-500">Appliances and spare parts in one list</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/shop/spare-parts" className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800">Spare parts</Link>
            <Link href="/shop/appliances" className="inline-flex h-9 items-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800">Appliances</Link>
          </div>
        </div>

        {error && !shopData ? (
          <div role="status" className="rounded-xl bg-white px-4 py-10 text-center text-sm text-slate-600">Products could not be loaded. <button onClick={retry} className="font-semibold text-primary">Try again</button></div>
        ) : visibleProducts.length > 0 ? (
          <>
            <p className="text-xs text-slate-500">Showing {loadedProducts} of {totalProducts} products</p>
            <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
              {visibleProducts.map((product) => <ShopProductCard key={product.id} part={product} />)}
            </div>
            {shopData?.pagination.hasMore && (
              <div className="flex justify-center py-3">
                <button type="button" onClick={loadMore} disabled={loadingMore} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-white disabled:opacity-60">
                  {loadingMore && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {loadingMore ? "Loading products" : "Load more products"}
                </button>
              </div>
            )}
            {error && <p role="status" className="text-center text-sm text-red-700">Could not load more products. <button onClick={retry} className="font-semibold underline">Retry</button></p>}
          </>
        ) : (
          <div role="status" className="rounded-xl bg-white px-4 py-10 text-center text-sm text-slate-500">{shopData?.products.length ? "No products match your search." : "No shop products are available right now."}</div>
        )}
      </main>
    </div>
  );
}
