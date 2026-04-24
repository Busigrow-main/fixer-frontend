"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { ApplianceTypeSidebar, ApplianceTabRail } from "./ApplianceNavigation";
import { BrandGrid } from "./BrandGrid";
import { ApplianceCategoryGrid } from "./ApplianceCategoryGrid";
import { PartCard, FilterChips } from "./PartComponents";
import PopularPartsSection from "./PopularPartsSection";
import IndiaMartHero from "@/app/components/IndiaMartHero";
import IndiaMartCategorization from "@/app/components/IndiaMartCategorization";
import {
  Search,
  SlidersHorizontal,
  Package,
  Info,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import type { ApplianceTypeCategory } from "@/app/lib/spareParts";

export default function SparePartsClient({
  initialCategories,
  apiUrl,
}: {
  initialCategories: any[];
  apiUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Convert initialCategories to ApplianceTypeCategory format
  const applianceTypes: ApplianceTypeCategory[] = initialCategories.map(
    (item: any) => ({
      slug: item.applianceTypeSlug,
      name: item.applianceTypeName,
      icon: item.icon || "wrench",
      partCount: item.partCount || 0,
    }),
  );

  // Navigation State
  const [activeType, setActiveType] = useState<string | null>(
    searchParams.get("type") || null,
  );
  const [activeBrand, setActiveBrand] = useState<string | null>(
    searchParams.get("brand"),
  );
  const [isUniversal, setIsUniversal] = useState<boolean>(
    searchParams.get("universal") === "true",
  );
  const [activeModel, setActiveModel] = useState<string | null>(
    searchParams.get("model"),
  );
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get("category"),
  );
  const [searchInput, setSearchInput] = useState<string>(
    searchParams.get("q") || "",
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || "",
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Data State
  const [parts, setParts] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [partCategories, setPartCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>({ total: 0 });

  // Sync state with searchParams when URL changes
  useEffect(() => {
    const type = searchParams.get("type");
    const brand = searchParams.get("brand");
    const universal = searchParams.get("universal") === "true";
    const model = searchParams.get("model");
    const category = searchParams.get("category");
    const q = searchParams.get("q") || "";

    if (type !== activeType) setActiveType(type);
    if (brand !== activeBrand) setActiveBrand(brand);
    if (universal !== isUniversal) setIsUniversal(universal);
    if (model !== activeModel) setActiveModel(model);
    if (category !== activeCategory) setActiveCategory(category);
    if (q !== searchQuery) {
      setSearchQuery(q);
      setSearchInput(q);
    }
  }, [searchParams]); // Only depend on searchParams to avoid infinite loops

  // Find active type data from tree
  const activeTypeData = initialCategories.find(
    (c: any) => c.applianceTypeSlug === activeType,
  );

  const buildPartsUrl = useCallback(
    (overrides?: {
      type?: string | null;
      brand?: string | null;
      universal?: boolean;
      model?: string | null;
      category?: string | null;
      query?: string;
    }) => {
      const params = new URLSearchParams();
      const type = overrides?.type ?? activeType;
      const brand = overrides?.brand ?? activeBrand;
      const universal = overrides?.universal ?? isUniversal;
      const model = overrides?.model ?? activeModel;
      const category = overrides?.category ?? activeCategory;
      const query = overrides?.query ?? searchInput;

      if (type) params.set("type", type);
      if (brand && !universal) params.set("brand", brand);
      if (universal) params.set("universal", "true");
      if (model) params.set("model", model);
      if (category) params.set("category", category);
      if (query) params.set("q", query);

      return `/spare-parts?${params.toString()}`;
    },
    [
      activeType,
      activeBrand,
      isUniversal,
      activeModel,
      activeCategory,
      searchInput,
    ],
  );

  const fetchParts = useCallback(async () => {
    if (!activeType) return; // Don't fetch if no type selected

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("applianceType", activeType);
      if (activeBrand && !isUniversal) params.append("brand", activeBrand);
      if (isUniversal) params.append("isUniversal", "true");
      if (activeModel) params.append("model", activeModel);
      if (activeCategory) params.append("partCategory", activeCategory);
      if (searchQuery) params.append("q", searchQuery);
      params.append("limit", "24");

      const res = await fetch(`${apiUrl}/spare-parts?${params.toString()}`);
      if (res.ok) {
        const result = await res.json();
        setParts(result.data);
        setMeta(result.metadata);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [
    activeType,
    activeBrand,
    isUniversal,
    activeModel,
    activeCategory,
    searchQuery,
    apiUrl,
  ]);

  const fetchModels = useCallback(async () => {
    if (!activeBrand || isUniversal) return;
    try {
      const res = await fetch(
        `${apiUrl}/spare-parts/categories/${activeType}/brands/${activeBrand}/models`,
      );
      if (res.ok) {
        const data = await res.json();
        setModels(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [activeType, activeBrand, isUniversal, apiUrl]);

  const fetchPartCategories = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/spare-parts/meta/categories`);
      if (res.ok) {
        const data = await res.json();
        setPartCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (activeType) {
      // Fetch parts whenever appliance type changes
      fetchParts();
    }
  }, [
    activeType,
    activeBrand,
    isUniversal,
    activeModel,
    activeCategory,
    searchQuery,
    fetchParts,
  ]);

  useEffect(() => {
    if (activeBrand && !isUniversal) {
      fetchModels();
    }
  }, [fetchModels, activeBrand, isUniversal]);

  useEffect(() => {
    if (!activeType) return;

    const timer = window.setTimeout(() => {
      setSearchQuery(searchInput);
      router.replace(buildPartsUrl({ query: searchInput }), { scroll: false });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchInput, activeType, buildPartsUrl, router]);

  useEffect(() => {
    fetchPartCategories();
  }, [fetchPartCategories]);

  // Handle Navigation
  const handleTypeSelect = (slug: string) => {
    setActiveType(slug);
    // Reset filters when switching appliance type
    setActiveBrand(null);
    setIsUniversal(false);
    setActiveModel(null);
    setActiveCategory(null);
    setSearchInput("");
    setSearchQuery("");
    setShowAllBrands(false);

    // Update URL
    router.push(
      buildPartsUrl({
        type: slug,
        brand: null,
        universal: false,
        model: null,
        category: null,
        query: "",
      }),
      { scroll: false },
    );
  };

  const handleBrandSelect = (slug: string) => {
    setActiveBrand(slug);
    setIsUniversal(false);
    setActiveModel(null);

    router.push(buildPartsUrl({ brand: slug, universal: false, model: null }), {
      scroll: false,
    });
  };

  const handleUniversalSelect = () => {
    setActiveBrand(null);
    setIsUniversal(true);
    setActiveModel(null);

    router.push(buildPartsUrl({ brand: null, universal: true, model: null }), {
      scroll: false,
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    router.replace(buildPartsUrl({ query: searchInput }), { scroll: false });
    fetchParts();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row pt-4 md:pt-20">
        {/* Navigation Sidebar (Desktop) - Hidden on landing */}
        {activeType && (
          <ApplianceTypeSidebar
            items={initialCategories}
            activeSlug={activeType}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Tab Rail (Mobile) - Hidden on landing */}
        {activeType && (
          <ApplianceTabRail
            items={initialCategories}
            activeSlug={activeType}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* LANDING STATE: Show Popular Parts + Appliance Categories */}
          {!activeType ? (
            <div className="flex-1 overflow-y-auto pb-20">
              <IndiaMartHero />
              <IndiaMartCategorization />
              
              <div className="px-4 md:px-12 py-8">
                <PopularPartsSection
                  apiUrl={apiUrl}
                  onBrowseAll={() => {}}
                />
              </div>
            </div>
          ) : (
            <>
              {/* ===== STICKY HEADER WITH SEARCH + FILTER ===== */}
              <div className="sticky top-14 md:top-20 z-30 bg-white border-b border-zinc-100 shadow-sm">
                {/* Breadcrumb */}
                <div className="px-4 md:px-12 pt-4 md:pb-4 flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                  <Link
                    href="/"
                    className="hover:text-primary transition-colors"
                  >
                    Home
                  </Link>
                  <ChevronRight className="w-3 h-3" />
                  <button
                    onClick={() => setActiveType(null)}
                    className="hover:text-primary transition-colors"
                  >
                    Spare Parts
                  </button>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-zinc-900 truncate">
                    {activeTypeData?.applianceTypeName}
                  </span>
                </div>

                {/* Search + Filter Bar */}
                <div className="px-4 md:px-12 py-3 flex gap-3 items-center">
                  {/* Search */}
                  <form onSubmit={handleSearch} className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search parts, models, or SKU..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 bg-zinc-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput("");
                          setSearchQuery("");
                          router.replace(buildPartsUrl({ query: "" }), {
                            scroll: false,
                          });
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4 text-zinc-600" />
                      </button>
                    )}
                  </form>

                  {/* Filter Button (Mobile) */}
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="md:hidden h-10 px-3 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-zinc-600" />
                    <span className="text-xs font-bold text-zinc-600">
                      Filters
                    </span>
                  </button>
                </div>

                {/* Title */}
                <div className="px-4 md:px-12 pb-4">
                  <h1 className="text-xl md:text-2xl font-black text-zinc-900">
                    {activeBrand
                      ? `${activeBrand}`
                      : isUniversal
                        ? `Universal Parts`
                        : `All Parts`}
                  </h1>
                  {activeTypeData?.applianceTypeName && (
                    <p className="text-sm text-zinc-500 font-medium mt-1">
                      {activeTypeData.applianceTypeName} Parts{" "}
                      {parts.length > 0 && `(${meta.total || parts.length})`}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* ===== MOBILE FILTERS PANEL ===== */}
                {showMobileFilters && (
                  <div className="md:hidden bg-zinc-50 border-b border-zinc-200 p-4 space-y-4">
                    {/* Brand Selection */}
                    {!isUniversal &&
                      initialCategories.length > 0 &&
                      activeTypeData?.brands && (
                        <div>
                          <h3 className="text-xs font-black text-zinc-600 uppercase tracking-wide mb-2">
                            Brand
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {(showAllBrands
                              ? activeTypeData.brands
                              : activeTypeData.brands.slice(0, 8)
                            ).map((brand: any) => (
                              <button
                                key={brand.slug}
                                onClick={() => {
                                  handleBrandSelect(brand.slug);
                                  setShowMobileFilters(false);
                                }}
                                className={cn(
                                  "px-3 py-2 text-xs font-bold rounded-lg transition-all",
                                  activeBrand === brand.slug
                                    ? "bg-primary text-white"
                                    : "bg-white border border-zinc-200 text-zinc-700 hover:border-primary",
                                )}
                              >
                                {brand.name}
                              </button>
                            ))}
                          </div>
                          {activeTypeData.brands.length > 8 && (
                            <button
                              type="button"
                              onClick={() =>
                                setShowAllBrands((value) => !value)
                              }
                              className="text-[10px] text-primary font-bold mt-2 w-full py-2 border border-primary/30 rounded-lg hover:bg-primary/5"
                            >
                              {showAllBrands
                                ? "Show Fewer Brands"
                                : "View All Brands"}
                            </button>
                          )}
                        </div>
                      )}

                    {/* Universal */}
                    {!activeBrand && (
                      <div>
                        <button
                          onClick={() => {
                            handleUniversalSelect();
                            setShowMobileFilters(false);
                          }}
                          className={cn(
                            "w-full px-4 py-3 rounded-lg font-bold text-sm transition-all",
                            isUniversal
                              ? "bg-primary text-white"
                              : "bg-white border border-zinc-200 text-zinc-700 hover:border-primary",
                          )}
                        >
                          🌍 Universal Parts
                        </button>
                      </div>
                    )}

                    {/* Model Filter */}
                    {!isUniversal && models.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-zinc-600 uppercase tracking-wide mb-2">
                          Model
                        </h3>
                        <FilterChips
                          label=""
                          items={models.map((m) => ({
                            label: m.displayName,
                            value: m.modelNumber,
                          }))}
                          activeValue={activeModel}
                          onSelect={setActiveModel}
                        />
                      </div>
                    )}

                    {/* Part Category Filter */}
                    {partCategories.length > 0 && (
                      <div>
                        <h3 className="text-xs font-black text-zinc-600 uppercase tracking-wide mb-2">
                          Category
                        </h3>
                        <FilterChips
                          label=""
                          items={partCategories}
                          activeValue={activeCategory}
                          onSelect={setActiveCategory}
                        />
                      </div>
                    )}

                    {/* Clear Filters */}
                    {(activeBrand ||
                      isUniversal ||
                      activeModel ||
                      activeCategory) && (
                      <button
                        onClick={() => {
                          setActiveBrand(null);
                          setIsUniversal(false);
                          setActiveModel(null);
                          setActiveCategory(null);
                          setShowMobileFilters(false);
                        }}
                        className="w-full py-2 text-xs font-black text-primary uppercase border border-primary/30 rounded-lg hover:bg-primary/5"
                      >
                        Clear All Filters
                      </button>
                    )}
                  </div>
                )}

                <div className="p-4 md:p-12 pb-24">
                  {/* ===== STATE 1: SELECT BRAND ===== */}
                  {!activeBrand &&
                  !isUniversal &&
                  !searchQuery &&
                  parts.length === 0 ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-3 text-zinc-600 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-blue-900">
                            Select a brand below
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Choose from compatible brands, or browse universal
                            components that work with any model.
                          </p>
                        </div>
                      </div>

                      {initialCategories.length > 0 &&
                        activeTypeData?.brands && (
                          <BrandGrid
                            brands={activeTypeData.brands || []}
                            onBrandSelect={handleBrandSelect}
                            onUniversalSelect={handleUniversalSelect}
                            universalPartCount={
                              activeTypeData?.universalPartsCount || 0
                            }
                          />
                        )}
                    </div>
                  ) : (
                    /* ===== STATE 2: PARTS LISTING ===== */
                    <div className="space-y-4">
                      {/* Active Filters Summary */}
                      {(activeBrand ||
                        isUniversal ||
                        activeModel ||
                        activeCategory ||
                        searchQuery) && (
                        <div className="flex flex-wrap items-center gap-2 py-3 px-3 bg-zinc-50 rounded-xl">
                          <span className="text-xs font-bold text-zinc-500 uppercase">
                            Active:
                          </span>
                          {activeBrand && (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-2">
                              {activeBrand}
                              <button
                                onClick={() => setActiveBrand(null)}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {isUniversal && (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-2">
                              Universal
                              <button
                                onClick={() => setIsUniversal(false)}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {activeModel && (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-2">
                              {activeModel}
                              <button
                                onClick={() => setActiveModel(null)}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {activeCategory && (
                            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-2">
                              {activeCategory}
                              <button
                                onClick={() => setActiveCategory(null)}
                                className="hover:opacity-70"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )}
                          {(activeBrand ||
                            isUniversal ||
                            activeModel ||
                            activeCategory) && (
                            <button
                              onClick={() => {
                                setActiveBrand(null);
                                setIsUniversal(false);
                                setActiveModel(null);
                                setActiveCategory(null);
                              }}
                              className="ml-auto text-[10px] font-bold text-primary uppercase border-b border-primary/30 hover:border-primary"
                            >
                              Clear All
                            </button>
                          )}
                        </div>
                      )}

                      {/* Parts Grid */}
                      {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div
                              key={i}
                              className="h-56 bg-zinc-100 rounded-2xl animate-pulse"
                            />
                          ))}
                        </div>
                      ) : parts.length === 0 ? (
                        <div className="text-center py-24 flex flex-col items-center">
                          <div className="w-20 h-20 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-10 h-10 text-zinc-300" />
                          </div>
                          <h3 className="text-lg font-black text-zinc-900 mt-4">
                            No parts found
                          </h3>
                          <p className="text-sm text-zinc-500 mt-2 max-w-xs">
                            Try a different brand, model, or search term. Check
                            universal parts if available.
                          </p>
                          <button
                            onClick={() => setActiveType(null)}
                            className="mt-6 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Browse Other Categories
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                          {parts.map((part) => (
                            <PartCard key={part.sku} part={part} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
