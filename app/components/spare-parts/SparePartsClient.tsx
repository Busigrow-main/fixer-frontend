"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { ApplianceTypeSidebar, ApplianceTabRail } from "./ApplianceNavigation";
import { BrandGrid } from "./BrandGrid";
import { ApplianceCategoryGrid } from "./ApplianceCategoryGrid";
import { PartCategoryGrid } from "./PartCategoryGrid";
import { PartCard, FilterChips } from "./PartComponents";
import PopularPartsSection from "./PopularPartsSection";
import IndiaMartHero from "@/app/components/IndiaMartHero";
import {
  Search,
  Package,
  Info,
  ChevronRight,
  X,
  Filter,
  ShoppingCart,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import { 
  fetchCategoryTree, 
  fetchTypeTree, 
  fetchPartsByCategory, 
  searchParts 
} from "@/app/lib/spareParts";

export default function SparePartsClient({
  initialCategories,
  apiUrl,
}: {
  initialCategories: any[];
  apiUrl: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // --- 4-State Navigation State ---
  const [activeType, setActiveType] = useState<string | null>(searchParams.get("type"));
  const [activeCat, setActiveCat] = useState<string | null>(searchParams.get("cat"));
  const [activeBrand, setActiveBrand] = useState<string | null>(searchParams.get("brand"));
  
  // --- Other UI State ---
  const [searchInput, setSearchInput] = useState<string>(searchParams.get("q") || "");
  const [isUniversal, setIsUniversal] = useState<boolean>(searchParams.get("universal") === "true");
  const [loading, setLoading] = useState(false);
  
  // --- Data State ---
  const [categoryTree, setCategoryTree] = useState<any[]>(initialCategories);
  const [currentTypeData, setCurrentTypeData] = useState<any | null>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0 });

  // Sync URL params to state
  useEffect(() => {
    const type = searchParams.get("type");
    const cat = searchParams.get("cat");
    const brand = searchParams.get("brand");
    const q = searchParams.get("q") || "";
    const uni = searchParams.get("universal") === "true";

    setActiveType(type);
    setActiveCat(cat);
    setActiveBrand(brand);
    setIsUniversal(uni);
    if (q !== searchInput) setSearchInput(q);
  }, [searchParams]);

  // Fetch Category Tree (Appliance Types) on mount
  useEffect(() => {
    const loadTree = async () => {
      const tree = await fetchCategoryTree(apiUrl);
      if (tree && tree.length > 0) setCategoryTree(tree);
    };
    loadTree();
  }, [apiUrl]);

  // Fetch specific type data (Part Categories) when type changes
  useEffect(() => {
    if (activeType) {
      const loadTypeData = async () => {
        const data = await fetchTypeTree(apiUrl, activeType);
        setCurrentTypeData(data);
      };
      loadTypeData();
    } else {
      setCurrentTypeData(null);
    }
  }, [activeType, apiUrl]);

  // Fetch Parts based on active state
  useEffect(() => {
    const loadParts = async () => {
      const q = searchParams.get("q");
      if (q) {
        setLoading(true);
        const result = await searchParts(apiUrl, Object.fromEntries(searchParams.entries()));
        setParts(result.data || []);
        setMeta(result.metadata || { total: 0 });
        setLoading(false);
        return;
      }

      if (activeType && activeCat) {
        setLoading(true);
        const result = await fetchPartsByCategory(apiUrl, activeType, activeCat, {
          brand: activeBrand || undefined,
          universal: isUniversal || undefined,
        });
        setParts(result.data || []);
        setMeta(result.metadata || { total: 0 });
        setLoading(false);
      } else {
        setParts([]);
      }
    };
    loadParts();
  }, [activeType, activeCat, activeBrand, isUniversal, searchParams, apiUrl]);

  // --- Navigation Handlers ---
  const updateParams = (updates: Record<string, string | null | boolean>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.push(`/spare-parts?${params.toString()}`, { scroll: false });
  };

  const handleTypeSelect = (slug: string) => {
    updateParams({ type: slug, cat: null, brand: null, q: null, universal: null });
  };

  const handleSubSelect = (typeSlug: string, catSlug: string) => {
    updateParams({ type: typeSlug, cat: catSlug, brand: null, q: null, universal: null });
  };

  const handleCatSelect = (slug: string) => {
    updateParams({ cat: slug, brand: null, q: null });
  };

  const handleBrandSelect = (slug: string | null) => {
    updateParams({ brand: slug, universal: null });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      updateParams({ q: searchInput });
    }
  };

  // --- Render Helpers ---
  const activeTypeInfo = categoryTree.find(t => t.applianceTypeSlug === activeType);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex flex-col md:flex-row pt-4 md:pt-20">
        {/* Sidebar Navigation */}
        {activeType && (
          <ApplianceTypeSidebar
            items={categoryTree}
            activeSlug={activeType}
            onSelect={handleTypeSelect}
          />
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* LANDING STATE */}
          {!activeType && !searchInput && (
            <div className="flex-1 pb-20">
              <IndiaMartHero />
              
              {/* Popular Parts Header */}
              <div className="px-4 md:px-12 pt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-zinc-900">
                    Commonly Bought Spares
                  </h2>
                </div>
                <PopularPartsSection apiUrl={apiUrl} onPartSelect={() => {}} />
              </div>

              {/* Browse Catalog Header */}
              <div className="px-4 md:px-12 py-16 bg-zinc-50 mt-12">
                 <ApplianceCategoryGrid 
                    categories={categoryTree.map(item => ({
                      slug: item.applianceTypeSlug,
                      name: item.applianceTypeName,
                      icon: item.applianceTypeIcon,
                      partCount: item.totalPartsCount,
                      subCategories: item.partCategories || []
                    }))} 
                    onSelect={handleTypeSelect} 
                    onSubSelect={handleSubSelect}
                 />
              </div>

              {/* Why Choose Us / Trust Section */}
              <div className="px-4 md:px-12 py-20 text-center space-y-4">
                 <h3 className="text-xl font-black text-zinc-900">Need help finding a part?</h3>
                 <p className="text-zinc-500 max-w-lg mx-auto font-medium">Our experts are available in Patna to help you identify the correct spare for your appliance model.</p>
                 <div className="flex items-center justify-center gap-4 pt-4">
                    <Link href="/contact" className="h-12 px-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all">
                      Contact Expert
                    </Link>
                 </div>
              </div>
            </div>
          )}

          {/* Type/Category/Search State */}
          {(activeType || searchInput) && (
            <div className="flex-1 flex flex-col">
              {/* Sticky Header */}
              <div className="sticky top-14 md:top-20 z-30 bg-white border-b border-zinc-100 p-4 md:px-12 flex flex-col gap-4">
                 {/* Breadcrumbs */}
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                    <button onClick={() => updateParams({ type: null, cat: null, brand: null, q: null })}>Home</button>
                    {activeType && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <button onClick={() => updateParams({ cat: null, brand: null, q: null })}>
                          {activeTypeInfo?.applianceTypeName}
                        </button>
                      </>
                    )}
                    {activeCat && (
                      <>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-zinc-900">{activeCat}</span>
                      </>
                    )}
                 </div>

                 {/* Search Bar */}
                 <form onSubmit={handleSearch} className="relative w-full max-w-2xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search for parts..." 
                      className="w-full h-12 pl-11 pr-12 bg-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                      <button onClick={() => { setSearchInput(""); updateParams({ q: null }); }} className="absolute right-4 top-1/2 -translate-y-1/2">
                        <X className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                 </form>
              </div>

              {/* View Content */}
              <div className="flex-1 p-4 md:p-12 overflow-y-auto">
                {/* State 2: Part Categories for a Type */}
                {activeType && !activeCat && !searchInput && currentTypeData && (
                   <PartCategoryGrid 
                      categories={currentTypeData.partCategories} 
                      applianceName={currentTypeData.applianceTypeName}
                      onSelect={handleCatSelect}
                   />
                )}

                {/* State 3 & 4: Parts Listing (Search or Category) */}
                {(activeCat || searchInput) && (
                  <div className="space-y-8">
                     {/* Header */}
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                           <h1 className="text-3xl font-black text-zinc-900">
                             {searchInput ? `Results for "${searchInput}"` : `${activeCat} Spares`}
                           </h1>
                           <p className="text-sm font-bold text-zinc-500 mt-1 uppercase tracking-widest">
                             {meta.total} Parts found in {activeTypeInfo?.applianceTypeName || "All Categories"}
                           </p>
                        </div>
                        
                        {/* Filters */}
                        {!searchInput && currentTypeData && activeCat && (
                          <div className="flex items-center gap-2">
                             <FilterChips 
                                label="Brand"
                                items={currentTypeData.partCategories.find((c: any) => c.slug === activeCat)?.brands.map((b: any) => ({
                                  label: b.brandName,
                                  value: b.brandSlug
                                })) || []}
                                activeValue={activeBrand}
                                onSelect={handleBrandSelect}
                             />
                             <button 
                                onClick={() => updateParams({ universal: !isUniversal })}
                                className={cn(
                                  "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                  isUniversal ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
                                )}
                             >
                                Universal
                             </button>
                          </div>
                        )}
                     </div>

                     {/* Grid */}
                     {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-zinc-100 rounded-3xl animate-pulse" />)}
                        </div>
                     ) : parts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                           {parts.map(part => <PartCard key={part.sku} part={part} />)}
                        </div>
                     ) : (
                        <div className="py-20 text-center flex flex-col items-center">
                           <Package className="w-16 h-16 text-zinc-200 mb-4" />
                           <h3 className="text-lg font-black text-zinc-900">No parts found</h3>
                           <p className="text-zinc-500 text-sm">Try broadening your search or choosing a different brand.</p>
                           <button onClick={() => updateParams({ brand: null, universal: null, q: null })} className="mt-6 text-primary font-black uppercase text-xs tracking-widest hover:underline">
                              Clear all filters
                           </button>
                        </div>
                     )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
