"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';

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

interface BrandGridProps {
  brands: any[];
  onBrandSelect: (slug: string) => void;
  selectedBrandSlug?: string | null;
}

export const BrandGrid: React.FC<BrandGridProps> = ({
  brands,
  onBrandSelect,
  selectedBrandSlug,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {brands.map((brand) => (
        <BrandCard
          key={brand.brandSlug || brand.slug}
          name={brand.brandName || brand.name}
          logoUrl={brand.logoUrl}
          partCount={brand.partCount}
          isSelected={selectedBrandSlug === (brand.brandSlug || brand.slug)}
          onSelect={() => onBrandSelect(brand.brandSlug || brand.slug)}
        />
      ))}
    </div>
  );
};
