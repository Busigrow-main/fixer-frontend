"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  PackageSearch,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

import ShopHeader from "@/app/components/shop/ShopHeader";
import ShopProductCard from "@/app/components/shop/ShopProductCard";

import {
  fetchCategoryTree,
  fetchPartsByCategory,
  searchParts,
} from "@/app/lib/spareParts";

type SparePartsClientProps = {
  initialCategories: any[];
  initialPopularParts: any[];
  apiUrl: string;
};

type TrustItemProps = {
  icon: React.ReactNode;
  title: string;
};

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  action?: {
    href: string;
    label: string;
  };
};

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
};

export default function SparePartsClient({
  initialCategories,
  initialPopularParts,
  apiUrl,
}: SparePartsClientProps) {
  const router = useRouter();
  const params = useSearchParams();

  const [categories, setCategories] = useState<any[]>(
    initialCategories || [],
  );

  const [query, setQuery] = useState(params.get("q") || "");
  const [parts, setParts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0 });

  const [loading, setLoading] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeType = params.get("type");
  const activeCat = params.get("cat");
  const activeBrand = params.get("brand");
  const activeSort = params.get("sort") || "newest";

  const universalOnly = params.get("isUniversal") === "true";

  const isBrowsing = Boolean(
    query || activeType || activeCat || activeBrand,
  );

  const activeTypeData = useMemo(
    () =>
      categories.find(
        (item: any) => item.applianceTypeSlug === activeType,
      ),
    [categories, activeType],
  );

  /*
   * Keep the category tree fresh.
   * Initial server-rendered categories are still used immediately,
   * so the page does not start blank while this request runs.
   */
  useEffect(() => {
    let cancelled = false;

    fetchCategoryTree(apiUrl)
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length) {
          setCategories(data);
        }
      })
      .catch((error) => {
        console.error("Failed to load spare-parts categories:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  /*
   * Fetch results whenever URL-driven search/filter state changes.
   * The URL remains the source of truth for browsing state.
   */
  useEffect(() => {
    if (!isBrowsing) {
      setParts([]);
      setMeta({ total: 0 });
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadParts = async () => {
      setLoading(true);

      try {
        const searchQuery = Object.fromEntries(
          params.entries(),
        ) as Record<string, string>;

        delete searchQuery.type;
        delete searchQuery.cat;
        delete searchQuery.focus;

        if (activeType) {
          searchQuery.applianceType = activeType;
        }

        if (universalOnly) {
          searchQuery.isUniversal = "true";
        }

        const resultPromise =
          activeType && activeCat
            ? fetchPartsByCategory(apiUrl, activeType, activeCat, {
                brand: activeBrand || undefined,
                universal: universalOnly,
                limit: 24,
              })
            : searchParts(apiUrl, {
                ...searchQuery,
              });

        const result = await resultPromise;

        if (cancelled) return;

        setParts(Array.isArray(result?.data) ? result.data : []);

        setMeta(
          result?.metadata || {
            total: 0,
          },
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load spare parts:", error);
          setParts([]);
          setMeta({ total: 0 });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadParts();

    return () => {
      cancelled = true;
    };
  }, [
    apiUrl,
    isBrowsing,
    params,
    activeType,
    activeCat,
    activeBrand,
    universalOnly,
  ]);

  /*
   * Closing the mobile filter sheet after navigation keeps
   * the mobile experience predictable.
   */
  useEffect(() => {
    setMobileFiltersOpen(false);
  }, [params]);

  /*
   * Search keeps existing URL state instead of destroying filters.
   */
  const search = (value: string) => {
    setQuery(value);

    const next = new URLSearchParams(params.toString());
    const trimmed = value.trim();

    if (trimmed) {
      next.set("q", trimmed);
    } else {
      next.delete("q");
    }

    next.delete("page");

    router.push(
      `/spare-parts${next.toString() ? `?${next.toString()}` : ""}`,
      {
        scroll: false,
      },
    );
  };

  /*
   * Appliance/category navigation.
   */
  const browse = (type: string, cat?: string) => {
    const next = new URLSearchParams();

    next.set("type", type);

    if (cat) {
      next.set("cat", cat);
    }

    router.push(`/spare-parts?${next.toString()}`);
  };

  /*
   * Generic filter updater.
   */
  const updateFilter = (key: string, value?: string) => {
    const next = new URLSearchParams(params.toString());

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    next.delete("page");

    router.push(`/spare-parts?${next.toString()}`, {
      scroll: false,
    });
  };

  /*
   * Clear filters while intentionally preserving the search query.
   */
  const clearFilters = () => {
    const next = new URLSearchParams();

    if (query.trim()) {
      next.set("q", query.trim());
    }

    router.push(
      `/spare-parts${next.toString() ? `?${next.toString()}` : ""}`,
      {
        scroll: false,
      },
    );
  };

  const categoryName = activeCat
    ? activeTypeData?.partCategories?.find(
        (category: any) => category.slug === activeCat,
      )?.name || activeCat
    : null;

  const activeFilterCount = [
    activeType,
    activeCat,
    activeBrand,
    universalOnly ? "universal" : null,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-slate-950">
      <ShopHeader
        value={query}
        onSearch={search}
        autoFocusSearch={params.get("focus") === "search"}
      />

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-24 pt-4 sm:px-6 sm:pb-12 sm:pt-6 lg:px-8">
        {!isBrowsing ? (
          <ShopHome
            categories={categories}
            popularParts={initialPopularParts}
            onBrowse={browse}
          />
        ) : (
          <PartsResults
            query={query}
            activeTypeData={activeTypeData}
            categoryName={categoryName}
            activeCat={activeCat}
            activeSort={activeSort}
            universalOnly={universalOnly}
            activeFilterCount={activeFilterCount}
            parts={parts}
            meta={meta}
            loading={loading}
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            browse={browse}
          />
        )}
      </main>
    </div>
  );
}

/* ============================================================
   SHOP HOME
============================================================ */

function ShopHome({
  categories,
  popularParts,
  onBrowse,
}: {
  categories: any[];
  popularParts: any[];
  onBrowse: (type: string, cat?: string) => void;
}) {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Hero / primary intent */}
      <section className="relative overflow-hidden rounded-[28px] bg-[#15171b] px-5 py-7 text-white shadow-[0_18px_50px_rgba(15,23,42,0.12)] sm:rounded-[34px] sm:px-10 sm:py-11 lg:px-14 lg:py-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white/75">
            <Sparkles className="h-3.5 w-3.5 text-red-300" />
            Fixxer Shop
          </div>

          <h1 className="mt-4 text-[clamp(2rem,7vw,4.5rem)] font-black leading-[0.98] tracking-[-0.045em]">
            Find the right part.
            <span className="block text-white/55">
              Without the guesswork.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
            Know the part? Search it. Not sure? Ask Fixxer and our team can help
            identify what you need.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link
              href="/spare-parts?focus=search"
              className="group flex min-h-[92px] items-center justify-between rounded-2xl bg-primary px-5 py-4 shadow-lg shadow-black/10 transition-transform active:scale-[0.99] sm:min-h-[108px]"
            >
              <span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Search className="h-5 w-5" />
                </span>

                <strong className="mt-3 block text-base font-black sm:text-lg">
                  I know the part
                </strong>

                <span className="mt-0.5 block text-xs text-white/75">
                  Search by name, brand or model.
                </span>
              </span>

              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/spare-parts/help"
              className="group flex min-h-[92px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.07] px-5 py-4 backdrop-blur transition-colors hover:bg-white/10 active:scale-[0.99] sm:min-h-[108px]"
            >
              <span>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                  <HelpCircle className="h-5 w-5 text-white" />
                </span>

                <strong className="mt-3 block text-base font-black sm:text-lg">
                  I need help
                </strong>

                <span className="mt-0.5 block text-xs text-white/55">
                  Tell us what is wrong.
                </span>
              </span>

              <ArrowRight className="h-5 w-5 text-white/70 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        <TrustItem
          icon={<ShieldCheck className="h-4.5 w-4.5" />}
          title="Verified parts"
        />

        <TrustItem
          icon={<Wrench className="h-4.5 w-4.5" />}
          title="Technician support"
        />

        <TrustItem
          icon={<PackageSearch className="h-4.5 w-4.5" />}
          title="Request before payment"
        />

        <TrustItem
          icon={<CheckCircle2 className="h-4.5 w-4.5" />}
          title="Clear order status"
        />
      </section>

      {/* Appliance categories */}
      <section>
        <SectionHeading
          eyebrow="Start here"
          title="What appliance is it for?"
          action={{
            href: "/spare-parts?focus=search",
            label: "Search parts",
          }}
        />

        {categories.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {categories.map((category: any) => (
              <button
                key={category.applianceTypeSlug}
                type="button"
                onClick={() => onBrowse(category.applianceTypeSlug)}
                className="group min-h-[132px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] active:scale-[0.99]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Wrench className="h-5 w-5" />
                </span>

                <span className="mt-5 block line-clamp-2 text-sm font-black leading-5 text-slate-900">
                  {category.applianceTypeName}
                </span>

                <span className="mt-1 block text-[11px] font-medium text-slate-500">
                  {category.totalPartsCount ||
                    category.partCount ||
                    0}{" "}
                  parts
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Appliance categories are temporarily unavailable.
          </div>
        )}
      </section>

      {/* Popular parts */}
      {popularParts.length > 0 ? (
        <section>
          <SectionHeading
            eyebrow="Popular now"
            title="Frequently requested parts"
            action={{
              href: "/spare-parts?sort=popular",
              label: "View all",
            }}
          />

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {popularParts.map((part) => (
              <ShopProductCard key={part.sku} part={part} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Appliance bridge */}
      <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-5 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
              Need a complete appliance?
            </p>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              Shop appliances with Fixxer support.
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Browse available models, compare important specifications and send
              an enquiry when you are ready.
            </p>

            <Link
              href="/spare-parts/appliances"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-primary active:scale-[0.99]"
            >
              Browse appliances
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="hidden min-h-[230px] bg-gradient-to-br from-primary/10 via-primary/5 to-slate-100 lg:block" />
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   RESULTS
============================================================ */

function PartsResults({
  query,
  activeTypeData,
  categoryName,
  activeCat,
  activeSort,
  universalOnly,
  activeFilterCount,
  parts,
  meta,
  loading,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  updateFilter,
  clearFilters,
  browse,
}: {
  query: string;
  activeTypeData: any;
  categoryName: string | null;
  activeCat: string | null;
  activeSort: string;
  universalOnly: boolean;
  activeFilterCount: number;
  parts: any[];
  meta: any;
  loading: boolean;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: (value: boolean) => void;
  updateFilter: (key: string, value?: string) => void;
  clearFilters: () => void;
  browse: (type: string, cat?: string) => void;
}) {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-1.5 overflow-x-auto whitespace-nowrap text-xs text-slate-500">
        <Link
          href="/spare-parts"
          className="font-semibold hover:text-primary"
        >
          Spare parts
        </Link>

        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

        <span className="font-semibold text-slate-800">
          {activeTypeData?.applianceTypeName || "Search"}
        </span>

        {categoryName ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />

            <span className="font-semibold text-slate-800">
              {categoryName}
            </span>
          </>
        ) : null}
      </div>

      {/* Results header */}
      <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_3px_15px_rgba(15,23,42,0.035)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                Spare parts
              </span>

              {universalOnly ? (
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600">
                  Universal
                </span>
              ) : null}
            </div>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
              {query
                ? `Results for “${query}”`
                : categoryName ||
                  activeTypeData?.applianceTypeName ||
                  "Spare parts"}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Finding matching parts…"
                : `${meta.total || 0} parts found`}
            </p>
          </div>

          <div className="flex w-full gap-2 lg:w-auto">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-800 shadow-sm lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />

              Filters

              {activeFilterCount ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <select
              aria-label="Sort spare parts"
              value={activeSort}
              onChange={(event) =>
                updateFilter(
                  "sort",
                  event.target.value === "newest"
                    ? undefined
                    : event.target.value,
                )
              }
              className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 lg:w-48 lg:flex-none"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </div>
        </div>

        {/* Mobile category rail */}
        {activeTypeData &&
        !activeCat &&
        !query &&
        activeTypeData.partCategories?.length ? (
          <div className="-mx-1 mt-5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex w-max gap-2">
              {activeTypeData.partCategories.map((cat: any) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() =>
                    browse(activeTypeData.applianceTypeSlug, cat.slug)
                  }
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  {cat.name}

                  <span className="ml-1 text-slate-400">
                    {cat.partCount || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Desktop category rail */}
      <div className="mt-4 hidden items-center justify-between gap-3 lg:flex">
        <div className="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeTypeData?.partCategories
            ?.slice(0, 8)
            .map((cat: any) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() =>
                  browse(activeTypeData.applianceTypeSlug, cat.slug)
                }
                className={`whitespace-nowrap rounded-full border px-3 py-2 text-xs font-bold transition ${
                  activeCat === cat.slug
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {cat.name}
              </button>
            ))}
        </div>

        <button
          type="button"
          onClick={() =>
            updateFilter(
              "isUniversal",
              universalOnly ? undefined : "true",
            )
          }
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
            universalOnly
              ? "border-primary bg-primary/5 text-primary"
              : "border-slate-200 bg-white text-slate-700 hover:border-primary/30"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Universal parts
        </button>
      </div>

      {/* Active filters */}
      {activeFilterCount || query ? (
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {query ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white">
              “{query}”
            </span>
          ) : null}

          {categoryName ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-[11px] font-bold text-primary">
              {categoryName}
            </span>
          ) : null}

          {universalOnly ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1.5 text-[11px] font-bold text-primary">
              Universal only
            </span>
          ) : null}

          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex shrink-0 items-center gap-1 px-2 py-1.5 text-[11px] font-bold text-slate-500 hover:text-primary"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      ) : null}

      {/* Product results */}
      <section className="mt-5">
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : parts.length ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {parts.map((part) => (
              <ShopProductCard
                key={part._id || part.sku}
                part={part}
              />
            ))}
          </div>
        ) : (
          <EmptyResults />
        )}
      </section>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen ? (
        <div
          className="fixed inset-0 z-[80] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Spare part filters"
        >
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
            onClick={() => setMobileFiltersOpen(false)}
          />

          <div className="absolute inset-x-0 bottom-0 max-h-[82svh] overflow-y-auto rounded-t-[28px] bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-[0_-20px_60px_rgba(15,23,42,0.2)]">
            <div className="mx-auto mb-5 h-1.5 w-10 rounded-full bg-slate-200" />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Filter parts
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  Narrow the results without losing your search.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              <FilterButton
                active={universalOnly}
                onClick={() =>
                  updateFilter(
                    "isUniversal",
                    universalOnly ? undefined : "true",
                  )
                }
                title="Universal parts"
                description="Parts designed to work across compatible models"
              />
            </div>

            {activeTypeData?.partCategories?.length ? (
              <div className="mt-7">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Categories
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  {activeTypeData.partCategories.map((cat: any) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        browse(
                          activeTypeData.applianceTypeSlug,
                          cat.slug,
                        );

                        setMobileFiltersOpen(false);
                      }}
                      className={`min-h-11 rounded-xl border px-3 text-left text-xs font-bold ${
                        activeCat === cat.slug
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => {
                clearFilters();
                setMobileFiltersOpen(false);
              }}
              className="mt-7 min-h-11 w-full rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-700"
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ============================================================
   SHARED UI
============================================================ */

function SectionHeading({
  eyebrow,
  title,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.17em] text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h2>
      </div>

      {action ? (
        <Link
          href={action.href}
          className="hidden shrink-0 items-center gap-1 text-xs font-black text-primary sm:inline-flex"
        >
          {action.label}

          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}

function TrustItem({ icon, title }: TrustItemProps) {
  return (
    <div className="flex min-h-[66px] items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.025)] sm:px-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
        {icon}
      </span>

      <span className="text-[11px] font-extrabold leading-4 text-slate-700 sm:text-xs">
        {title}
      </span>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  title,
  description,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-primary bg-primary/5"
          : "border-slate-200 bg-white"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          active
            ? "bg-primary text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <CheckCircle2 className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-slate-900">
          {title}
        </span>

        <span className="mt-0.5 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <span
        className={`h-5 w-5 rounded-full border-2 ${
          active
            ? "border-primary bg-primary"
            : "border-slate-300"
        }`}
      />
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="aspect-square animate-pulse bg-slate-100" />

      <div className="space-y-2 p-3.5">
        <div className="h-2.5 w-1/3 animate-pulse rounded bg-slate-100" />

        <div className="h-4 w-4/5 animate-pulse rounded bg-slate-100" />

        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />

        <div className="mt-3 h-9 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-5 py-14 text-center shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:py-20">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <PackageSearch className="h-7 w-7" />
      </span>

      <h2 className="mt-5 text-lg font-black text-slate-950">
        We couldn't find that part
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Try another search, browse by appliance, or ask the Fixxer team to help
        identify the right part.
      </p>

      <Link
        href="/spare-parts/help"
        className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-sm transition hover:brightness-95 active:scale-[0.99]"
      >
        I need help

        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}