"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import ShopCategorySwitch from "@/app/components/shop/ShopCategorySwitch";
import SpareHeader from "./SpareHeader";
import SearchBar from "./SearchBar";
import CategoryChips, { Category } from "./CategoryChips";
import FilterBar from "./FilterBar";
import FitmentBanner from "./FitmentBanner";
import ProductGrid from "./ProductGrid";
import ServicePromoBanner from "./ServicePromoBanner";
import type { SparePart } from "./ProductGrid";
import { getSparePartCatalog } from "@/app/lib/catalog-api";
import type { SparePartCatalogItem } from "@/app/lib/catalog-api";
import technicianImage from "../../../public/images/shop/technician-banner-square.png";

type Part = SparePart & { category: string; brand: string; capacity: string; applianceTypeSlug?: string };
type SortKey = "relevance" | "price-asc" | "price-desc" | "rating";
type Filters = { brands: Set<string>; capacities: Set<string>; inStock: boolean };

const SORTS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Most relevant" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Top rated" },
];

const CATEGORIES: Category[] = [
  { key: "all", label: "All Parts" },
  { key: "fridge", label: "Refrigerators" },
  { key: "washer", label: "Washing Machines" },
  { key: "ac", label: "Air Conditioners" },
  { key: "microwave", label: "Microwaves" },
];

const CATEGORY_API_TYPE: Record<string, string> = {
  fridge: "refrigerator",
  washer: "washing-machine",
  ac: "air-conditioner",
  microwave: "microwave-oven",
};

function toPart(item: SparePartCatalogItem): Part {
  const applianceCategory = item.applianceTypeSlug ?? "";
  const raw = item as SparePartCatalogItem & { bestseller?: unknown; bestSeller?: unknown; badge?: unknown };
  const backendBestseller = item.isBestseller ?? item.isBestSeller ?? raw.bestSeller ?? raw.bestseller;
  const bestSeller = backendBestseller === undefined
    ? Boolean(item.isFeatured || Number(item.soldCount || 0) >= 10 || /best\s*seller/i.test(String(raw.badge ?? "")))
    : backendBestseller === true || backendBestseller === 1 || backendBestseller === "true";
  return {
    id: item._id,
    sku: item.sku,
    brand: item.brandSlug ? item.brandSlug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "",
    name: item.name,
    image: item.imageUrls?.[0] ?? "",
    price: Number(item.price || 0) / 100,
    mrp: item.mrp ? Number(item.mrp) / 100 : undefined,
    rating: item.rating?.average,
    reviews: item.rating?.count,
    bestSeller,
    badge: bestSeller ? "BESTSELLER" : undefined,
    highlight: item.description,
    stock: item.stock,
    isInStock: item.isInStock ?? Number(item.stock || 0) > 0,
    warrantyMonths: item.warrantyMonths,
    detailHref: `/shop/spare-parts/${encodeURIComponent(item.sku)}`,
    category: applianceCategory === "refrigerator"
      ? "fridge"
      : applianceCategory === "washing-machine"
        ? "washer"
        : applianceCategory === "air-conditioner" || applianceCategory === "ac"
          ? "ac"
          : applianceCategory === "microwave-oven" || applianceCategory === "microwave"
            ? "microwave"
            : applianceCategory,
    applianceTypeSlug: applianceCategory,
    capacity: item.partCategory ?? "",
  };
}

function FilterOptions({
  title,
  options,
  selected,
  onChange,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-bold text-zinc-900">{title}</legend>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => {
          const checked = selected.has(option);
          const next = new Set(selected);
          checked ? next.delete(option) : next.add(option);
          return (
            <label
              key={option}
              className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm transition ${
                checked ? "border-primary bg-primary/5 font-semibold text-primary" : "border-zinc-200 text-zinc-700"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(next)}
                className="h-4 w-4 accent-primary"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ---------- page ---------- */

export default function SparePartsPage() {
  const router = useRouter();
  const { openBooking } = useBooking();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortKey>("relevance");
  const [filters, setFilters] = useState<Filters>({ brands: new Set(), capacities: new Set(), inStock: false });
  const [sheet, setSheet] = useState(false);
  const [cart, setCart] = useState<Set<string>>(new Set());
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [fitmentResult, setFitmentResult] = useState("");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      getSparePartCatalog({
        query,
        applianceType: CATEGORY_API_TYPE[category],
        sort: sort === "price-asc" ? "price_asc" : sort === "price-desc" ? "price_desc" : sort === "rating" ? "popular" : "relevance",
        signal: controller.signal,
      })
        .then((response) => {
          setParts(response.data.map(toPart));
          setLoadError(false);
        })
        .catch((error: unknown) => {
          if (!(error instanceof Error && error.name === "AbortError")) setLoadError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, category, sort, retry]);

  const brands = useMemo(() => [...new Set(parts.map((part) => part.brand).filter(Boolean))].sort(), [parts]);
  const capacities = useMemo(() => [...new Set(parts.map((part) => part.capacity).filter(Boolean))].sort(), [parts]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parts.filter(
      (p) =>
        (!q || `${p.name} ${p.sku ?? ""} ${p.brand} ${p.highlight ?? ""}`.toLowerCase().includes(q)) &&
        (category === "all" || p.category === category) &&
        (filters.brands.size === 0 || filters.brands.has(p.brand)) &&
        (filters.capacities.size === 0 || filters.capacities.has(p.capacity)) &&
        (!filters.inStock || p.isInStock !== false),
    );
  }, [parts, query, category, filters]);

  const activeFilterCount = filters.brands.size + filters.capacities.size + (filters.inStock ? 1 : 0);
  const changeCategory = (value: string) => {
    setLoading(true);
    setCategory(value);
    setFilters((current) => ({ ...current, brands: new Set(), capacities: new Set() }));
  };
  const changeSort = (value: SortKey) => { setLoading(true); setSort(value); };
  const changeQuery = (value: string) => { setLoading(true); setQuery(value); };
  const retryCatalog = () => { setLoading(true); setRetry((value) => value + 1); };
  const clearAll = () => {
    setFilters({ brands: new Set(), capacities: new Set(), inStock: false });
    changeCategory("all");
    changeSort("relevance");
    retryCatalog();
  };

  const addToCart = (id: string) => setCart((prev) => new Set(prev).add(id));
  const checkModel = (model: string) => {
    if (!model) {
      setFitmentResult("");
      return;
    }
    changeQuery(model);
    const needle = model.toLowerCase();
    const matches = parts.filter((part) =>
      `${part.name} ${part.sku ?? ""} ${part.brand} ${part.highlight ?? ""}`.toLowerCase().includes(needle),
    );
    setFitmentResult(
      matches.length
        ? `Showing ${matches.length} part${matches.length === 1 ? "" : "s"} that may fit ${model}.`
        : `We could not match “${model}”. Request help if you need us to identify it.`,
    );
  };

  const brandLabel = filters.brands.size ? [...filters.brands].join(", ") : "Brand";
  const capacityLabel = filters.capacities.size ? [...filters.capacities].join(", ") : "Part type";

  return (
    <div className="shop-shell min-h-screen bg-[#f4f4f6] md:bg-[#f6f6f6]">
      <ShopNavbar hideMobileHeader searchValue={query} onSearchChange={changeQuery} />

      {/* Phone header (screenshot). Remove if ShopNavbar already shows a top bar. */}
      <div className="md:hidden">
        <SpareHeader location="Patna - 800001" onBack={() => router.push("/shop")} />
      </div>

      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-4 px-8 pb-28 pt-3 sm:max-w-[720px] sm:gap-5 sm:px-4 md:max-w-[1280px] md:gap-8 md:px-8 md:pb-16 md:pt-8 lg:gap-10 lg:px-12">
      <div className="sticky top-14 z-40 -mx-3 bg-[#f4f4f6] px-3 pb-2 md:hidden">
  <SearchBar value={query} onChange={changeQuery} onVoice={() => {}} />
</div>

        <div className="w-full md:mx-auto md:max-w-[520px]">
          <ShopCategorySwitch />
        </div>
        <section className="hidden md:block">
          <div className="border-b border-slate-200 pb-5">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-500">Home <span className="px-1.5 text-slate-300">/</span> Shop <span className="px-1.5 text-slate-300">/</span> Spare parts</p>
              <h1 className="mt-2 text-[30px] font-bold tracking-tight text-slate-950 lg:text-[34px]">Spare parts for your appliances</h1>
              <p className="mt-1 text-sm text-slate-500">Genuine replacements, matched to your appliance.</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3.5">
            <CategoryChips items={CATEGORIES} selected={category} onSelect={changeCategory} className="mx-0 px-0 md:gap-2.5" />
            <div className="w-full max-w-[520px] lg:w-[520px]"><FitmentBanner inputId="appliance-model-desktop" onCheck={checkModel} result={fitmentResult} /></div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-6">
          <aside className="hidden self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(15,23,42,0.03)] lg:sticky lg:top-6 lg:block">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Filters</h2>
                <p className="mt-0.5 text-xs text-slate-500">Narrow your results</p>
              </div>
              <button type="button" onClick={clearAll} className="text-xs font-semibold text-primary hover:underline">Clear all</button>
            </div>
            <fieldset className="border-b border-slate-100 py-4">
              <legend className="text-sm font-semibold text-slate-900">Brand</legend>
              <div className="mt-2 space-y-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <input type="checkbox" checked={filters.brands.has(brand)} onChange={() => { const next = new Set(filters.brands); next.has(brand) ? next.delete(brand) : next.add(brand); setFilters({ ...filters, brands: next }); }} className="h-4 w-4 rounded accent-primary" />{brand} <span className="text-zinc-400">({parts.filter((part) => part.brand === brand).length})</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="border-b border-slate-100 py-4">
                  <legend className="text-sm font-semibold text-slate-900">Part category</legend>
              <div className="mt-2 space-y-2">
                {capacities.map((capacity) => (
                  <label key={capacity} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <input type="checkbox" checked={filters.capacities.has(capacity)} onChange={() => { const next = new Set(filters.capacities); next.has(capacity) ? next.delete(capacity) : next.add(capacity); setFilters({ ...filters, capacities: next }); }} className="h-4 w-4 rounded accent-primary" />{capacity} <span className="text-zinc-400">({parts.filter((part) => part.capacity === capacity).length})</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex cursor-pointer items-center justify-between gap-2 pt-4 text-sm text-slate-600">
              In stock only
              <input type="checkbox" checked={filters.inStock} onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })} className="h-4 w-4 rounded accent-primary" />
            </label>
          </aside>

          <div className="min-w-0">
            <div className="mb-3 flex flex-col gap-3 lg:hidden">
              <CategoryChips items={CATEGORIES} selected={category} onSelect={changeCategory} />
              <FilterBar activeFilterCount={activeFilterCount} brandLabel={brandLabel} capacityLabel={capacityLabel} onSort={() => setSheet(true)} onFilter={() => setSheet(true)} onBrand={() => setSheet(true)} onCapacity={() => setSheet(true)} />
              <FitmentBanner inputId="appliance-model-mobile" onCheck={checkModel} result={fitmentResult} />
            </div>
            <section className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Spare parts</h2>
                <p className="mt-0.5 text-xs text-slate-500">{loading ? "Loading products…" : `${visible.length} parts available`}</p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-500">
                Sort by
                <select value={sort} onChange={(e) => changeSort(e.target.value as SortKey)} className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-primary">
                  {SORTS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
                </select>
              </label>
            </section>
            {(filters.brands.size > 0 || filters.capacities.size > 0) && (
              <div className="-mt-1 mb-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium text-slate-500">Applied:</span>
                {[...filters.brands].map((brand) => (
                  <button key={brand} type="button" onClick={() => { const next = new Set(filters.brands); next.delete(brand); setFilters({ ...filters, brands: next }); }} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:border-primary/40">
                    {brand}<span aria-hidden="true" className="text-slate-400">×</span>
                  </button>
                ))}
                {[...filters.capacities].map((capacity) => (
                  <button key={capacity} type="button" onClick={() => { const next = new Set(filters.capacities); next.delete(capacity); setFilters({ ...filters, capacities: next }); }} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:border-primary/40">
                    {capacity}<span aria-hidden="true" className="text-slate-400">×</span>
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="ml-1 text-xs font-semibold text-primary hover:underline">Clear</button>
              </div>
            )}
            <ProductGrid parts={visible} loading={loading} error={loadError ? "Products could not be loaded" : undefined} onRetry={retryCatalog} cartIds={cart} onAddToCart={addToCart} onClearFilters={clearAll} />
          </div>
        </div>
        <ServicePromoBanner image={technicianImage.src} onBook={() => openBooking()} />
      </main>

      {/* Phone filter sheet */}
      {sheet && (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/40 md:items-center md:justify-center md:p-6" onMouseDown={(e) => e.target === e.currentTarget && setSheet(false)}>
          <div role="dialog" aria-modal="true" aria-label="Sort and filter" className="flex max-h-[85dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl md:max-w-xl md:rounded-3xl">
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              <h2 className="font-headline text-xl text-zinc-900">Sort &amp; Filter</h2>
              <button type="button" aria-label="Close" onClick={() => setSheet(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
              <div className="space-y-6 py-1">
                <fieldset>
                  <legend className="text-sm font-bold text-zinc-900">Sort by</legend>
                  <div className="mt-2 space-y-1">
                    {SORTS.map((option) => (
                      <label key={option.key} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm text-zinc-700 hover:bg-zinc-50">
                        <input
                          type="radio"
                          name="mobile-sort"
                          value={option.key}
                          checked={sort === option.key}
                          onChange={() => changeSort(option.key)}
                          className="h-4 w-4 accent-primary"
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <FilterOptions
                  title="Brand"
                  options={brands}
                  selected={filters.brands}
                  onChange={(brands) => setFilters({ ...filters, brands })}
                />
                <FilterOptions
                  title="Part category"
                  options={capacities}
                  selected={filters.capacities}
                  onChange={(capacities) => setFilters({ ...filters, capacities })}
                />

                <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700">
                  In-stock parts only
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-[auto_1fr] gap-2.5 border-t border-zinc-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={clearAll} className="h-12 rounded-xl border border-zinc-200 px-5 text-sm font-semibold text-zinc-700">
                Clear all
              </button>
              <button type="button" onClick={() => setSheet(false)} className="h-12 rounded-xl bg-primary text-sm font-semibold text-white shadow-[0_8px_16px_-8px_rgba(200,16,46,0.7)]">
                Show {visible.length} parts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
