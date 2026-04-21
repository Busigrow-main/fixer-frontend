"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { Sparkles, ChevronRight } from 'lucide-react';

interface BrandCardProps {
  name: string;
  logoUrl?: string;
  partCount: number;
  isSelected?: boolean;
  onSelect: () => void;
}

export const BrandCard: React.FC<BrandCardProps> = ({
  name,
  logoUrl,
  partCount,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 h-full w-full",
        isSelected 
          ? "border-primary bg-primary/5 shadow-sm" 
          : "border-zinc-100 bg-white hover:border-primary/50 hover:shadow-md"
      )}
    >
      {logoUrl ? (
        <div className="relative w-12 h-12 mb-2">
           <Image src={logoUrl} alt={name} fill className="object-contain" />
        </div>
      ) : (
        <div className="w-12 h-12 mb-2 flex items-center justify-center bg-zinc-100 rounded-full text-lg font-black text-zinc-400">
          {name.charAt(0)}
        </div>
      )}
      <span className="text-xs font-black text-zinc-900 text-center leading-tight">{name}</span>
      <span className="text-[10px] text-zinc-400 mt-1">{partCount} parts</span>
    </button>
  );
};

export const GenericPartsCard: React.FC<{ partCount: number; onSelect: () => void; isSelected?: boolean }> = ({
  partCount,
  onSelect,
  isSelected
}) => {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 col-span-2 group",
        isSelected
          ? "bg-teal-600 border-teal-600"
          : "bg-teal-50 border-teal-100 hover:border-teal-300"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
        isSelected ? "bg-white/20 text-white" : "bg-teal-600 text-white"
      )}>
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="flex-1 text-left">
        <h4 className={cn(
          "text-sm font-black",
          isSelected ? "text-white" : "text-teal-900"
        )}>Generic / Universal Parts</h4>
        <p className={cn(
          "text-xs mt-0.5",
          isSelected ? "text-teal-100" : "text-teal-600"
        )}>Fits all or most brands • {partCount} Available</p>
      </div>
      <ChevronRight className={cn(
        "w-5 h-5 transition-transform group-hover:translate-x-1",
        isSelected ? "text-white" : "text-teal-400"
      )} />
    </button>
  );
};

interface BrandGridProps {
  brands: any[];
  onBrandSelect: (slug: string) => void;
  onUniversalSelect: () => void;
  selectedBrandSlug?: string | null;
  universalPartCount: number;
  selectedUniversal?: boolean;
}

export const BrandGrid: React.FC<BrandGridProps> = ({
  brands,
  onBrandSelect,
  onUniversalSelect,
  selectedBrandSlug,
  universalPartCount,
  selectedUniversal
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {universalPartCount > 0 && (
        <GenericPartsCard 
          partCount={universalPartCount} 
          onSelect={onUniversalSelect}
          isSelected={selectedUniversal}
        />
      )}
      {brands.map((brand) => (
        <BrandCard
          key={brand.brandSlug}
          name={brand.brandName}
          logoUrl={brand.logoUrl}
          partCount={brand.partCount}
          isSelected={selectedBrandSlug === brand.brandSlug}
          onSelect={() => onBrandSelect(brand.brandSlug)}
        />
      ))}
    </div>
  );
};
