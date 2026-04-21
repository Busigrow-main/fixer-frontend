"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { ApplianceTypeSidebar, ApplianceTabRail } from './ApplianceNavigation';
import { BrandGrid } from './BrandGrid';
import { PartCard, FilterChips } from './PartComponents';
import { Search, SlidersHorizontal, Package, Info, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';

export default function SparePartsClient({ 
  initialCategories,
  apiUrl
}: { 
  initialCategories: any[],
  apiUrl: string
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation State
  const [activeType, setActiveType] = useState<string>(searchParams.get('type') || (initialCategories[0]?.applianceTypeSlug || ''));
  const [activeBrand, setActiveBrand] = useState<string | null>(searchParams.get('brand'));
  const [isUniversal, setIsUniversal] = useState<boolean>(searchParams.get('universal') === 'true');
  const [activeModel, setActiveModel] = useState<string | null>(searchParams.get('model'));
  const [activeCategory, setActiveCategory] = useState<string | null>(searchParams.get('category'));
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');

  // Data State
  const [parts, setParts] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [partCategories, setPartCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState<any>({ total: 0 });

  // Find active type data from tree
  const activeTypeData = initialCategories.find(c => c.applianceTypeSlug === activeType);

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeType) params.append('applianceType', activeType);
      if (activeBrand && !isUniversal) params.append('brand', activeBrand);
      if (isUniversal) params.append('isUniversal', 'true');
      if (activeModel) params.append('model', activeModel);
      if (activeCategory) params.append('partCategory', activeCategory);
      if (searchQuery) params.append('q', searchQuery);
      params.append('limit', '40');

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
  }, [activeType, activeBrand, isUniversal, activeModel, activeCategory, searchQuery, apiUrl]);

  const fetchModels = useCallback(async () => {
    if (!activeBrand || isUniversal) return;
    try {
      const res = await fetch(`${apiUrl}/spare-parts/categories/${activeType}/brands/${activeBrand}/models`);
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
    if (activeBrand || isUniversal || searchQuery) {
      fetchParts();
    }
  }, [fetchParts, activeBrand, isUniversal, searchQuery]);

  useEffect(() => {
    if (activeBrand && !isUniversal) {
      fetchModels();
    }
  }, [fetchModels, activeBrand, isUniversal]);

  useEffect(() => {
    fetchPartCategories();
  }, [fetchPartCategories]);

  // Handle Navigation
  const handleTypeSelect = (slug: string) => {
    setActiveType(slug);
    setActiveBrand(null);
    setIsUniversal(false);
    setActiveModel(null);
    setActiveCategory(null);
    setSearchQuery('');
    
    // Update URL
    router.push(`/spare-parts?type=${slug}`, { scroll: false });
  };

  const handleBrandSelect = (slug: string) => {
    setActiveBrand(slug);
    setIsUniversal(false);
    setActiveModel(null);
    
    router.push(`/spare-parts?type=${activeType}&brand=${slug}`, { scroll: false });
  };

  const handleUniversalSelect = () => {
    setActiveBrand(null);
    setIsUniversal(true);
    setActiveModel(null);
    
    router.push(`/spare-parts?type=${activeType}&universal=true`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchParts();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 flex flex-col md:flex-row pt-14 md:pt-20">
        
        {/* Navigation Sidebar (Desktop) / Rail (Mobile) */}
        <ApplianceTypeSidebar 
          items={initialCategories} 
          activeSlug={activeType} 
          onSelect={handleTypeSelect} 
        />
        <ApplianceTabRail 
          items={initialCategories} 
          activeSlug={activeType} 
          onSelect={handleTypeSelect} 
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header & Internal Search */}
          <header className="px-5 py-4 border-b border-zinc-100 flex flex-col gap-4">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <button onClick={() => { setActiveBrand(null); setIsUniversal(false); }} className="hover:text-primary transition-colors">
                  {activeTypeData?.applianceTypeName}
                </button>
                {(activeBrand || isUniversal) && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-zinc-900">{isUniversal ? 'Universal' : activeBrand}</span>
                  </>
                )}
             </div>

             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900">
                  {activeBrand ? `${activeBrand} ${activeTypeData?.applianceTypeName}` : 
                   isUniversal ? `Universal ${activeTypeData?.applianceTypeName} Parts` :
                   `${activeTypeData?.applianceTypeName} Parts`}
                </h1>
                
                <form onSubmit={handleSearch} className="relative w-full md:w-64 lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Search by part or model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 bg-zinc-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </form>
             </div>
          </header>

          <div className="flex-1 overflow-y-auto p-5 pb-20">
            
            {/* STATE 1: Select Brand (Default when type selected) */}
            {(!activeBrand && !isUniversal && !searchQuery) ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2 text-zinc-600 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                   <Info className="w-5 h-5 text-primary flex-shrink-0" />
                   <p className="text-xs md:text-sm font-bold">Select your appliance brand to see compatible spare parts, or browse universal components.</p>
                </div>
                
                <BrandGrid 
                  brands={activeTypeData?.brands || []}
                  onBrandSelect={handleBrandSelect}
                  onUniversalSelect={handleUniversalSelect}
                  universalPartCount={activeTypeData?.universalPartsCount || 0}
                />
              </div>
            ) : (
              /* STATE 2: Parts Listing (Brand or Universal or Search active) */
              <div className="space-y-4">
                
                {/* Filters */}
                <div className="bg-zinc-50/50 p-4 rounded-3xl border border-zinc-100 mb-6">
                   {!isUniversal && models.length > 0 && (
                     <FilterChips 
                       label="Select Model"
                       items={models.map(m => ({ label: m.displayName, value: m.modelNumber }))}
                       activeValue={activeModel}
                       onSelect={setActiveModel}
                     />
                   )}
                   <FilterChips 
                     label="Part Category"
                     items={partCategories}
                     activeValue={activeCategory}
                     onSelect={setActiveCategory}
                   />
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center px-1">
                   <p className="text-xs font-black text-zinc-400 uppercase tracking-widest leading-none">
                     Showing {parts.length} {parts.length === 1 ? 'Part' : 'Parts'}
                   </p>
                   {(activeBrand || isUniversal || activeModel || activeCategory) && (
                     <button 
                       onClick={() => { setActiveBrand(null); setIsUniversal(false); setActiveModel(null); setActiveCategory(null); }}
                       className="text-[10px] font-black text-primary uppercase border-b border-primary/30"
                     >
                       Clear All
                     </button>
                   )}
                </div>

                {/* Parts List */}
                {loading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-32 bg-zinc-100 rounded-3xl animate-pulse" />
                    ))}
                  </div>
                ) : parts.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-zinc-300" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900">No parts found</h3>
                    <p className="text-sm text-zinc-500 mt-2">Try a different brand, model, or check universal parts.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {parts.map(part => (
                      <PartCard key={part.sku} part={part} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
