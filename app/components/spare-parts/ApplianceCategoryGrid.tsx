"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { ChevronRight } from 'lucide-react';

// High-quality Unsplash images keyed by appliance slug/icon
const APPLIANCE_IMAGES: Record<string, string> = {
  // by slug
  'refrigerator':     'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=800&auto=format&fit=crop',
  'washing-machine':  'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=800&auto=format&fit=crop',
  'microwave':        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=800&auto=format&fit=crop',
  'ac':               'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop',
  'air-conditioner':  'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop',
  'television':       'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
  'tv':               'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
  'water-purifier':   'https://images.unsplash.com/photo-1622372738946-62e02505f2b1?q=80&w=800&auto=format&fit=crop',
  'geyser':           'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800&auto=format&fit=crop',
  'water-heater':     'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=800&auto=format&fit=crop',
  'dishwasher':       'https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=800&auto=format&fit=crop',
  'chimney':          'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800&auto=format&fit=crop',
  'fan':              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  'cooler':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
  // fallback
  'default':          'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=800&auto=format&fit=crop',
};

function getApplianceImage(slug: string, iconHint?: string): string {
  return (
    APPLIANCE_IMAGES[slug.toLowerCase()] ||
    APPLIANCE_IMAGES[iconHint?.toLowerCase() || ''] ||
    APPLIANCE_IMAGES['default']
  );
}

interface SubCategory {
  slug: string;
  name: string;
}

interface ApplianceCatalogItem {
  slug: string;
  name: string;
  icon: string;
  partCount: number;
  subCategories: SubCategory[];
}

interface ApplianceCategoryGridProps {
  categories: ApplianceCatalogItem[];
  onSelect: (slug: string) => void;
  onSubSelect: (typeSlug: string, catSlug: string) => void;
}

export const ApplianceCategoryGrid: React.FC<ApplianceCategoryGridProps> = ({
  categories,
  onSelect,
  onSubSelect
}) => {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl md:text-4xl font-black text-zinc-900">
          Browse by Appliance
        </h2>
        <p className="text-base text-zinc-600 max-w-2xl font-medium">
          Find genuine parts for all major home appliances. Select a category or browse specific sub-categories below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((appliance) => {
          const imgSrc = getApplianceImage(appliance.slug, appliance.icon);
          return (
            <div
              key={appliance.slug}
              className="flex flex-row bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group"
            >
              {/* Left: Appliance Photo */}
              <button
                onClick={() => onSelect(appliance.slug)}
                className="relative w-[130px] md:w-[150px] shrink-0 overflow-hidden bg-zinc-100 group-hover:brightness-95 transition-all"
                aria-label={`Browse ${appliance.name} parts`}
              >
                <Image
                  src={imgSrc}
                  alt={appliance.name}
                  fill
                  sizes="150px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Dark gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Part count badge */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className="text-[9px] font-black text-white/90 uppercase tracking-widest bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    {appliance.partCount} Parts
                  </span>
                </div>
              </button>

              {/* Right: Info & Subcategories */}
              <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                <div>
                  <button
                    onClick={() => onSelect(appliance.slug)}
                    className="text-lg font-black text-zinc-900 group-hover:text-primary transition-colors text-left leading-tight"
                  >
                    {appliance.name}
                  </button>

                  <div className="mt-3 flex flex-col gap-1.5">
                    {appliance.subCategories.slice(0, 4).map((sub) => (
                      <button
                        key={sub.slug}
                        onClick={() => onSubSelect(appliance.slug, sub.slug)}
                        className="text-sm font-semibold text-zinc-500 hover:text-primary flex items-center gap-2 group/sub text-left truncate"
                      >
                        <ChevronRight className="w-3 h-3 text-zinc-300 group-hover/sub:text-primary transition-colors shrink-0" />
                        <span className="truncate">{sub.name}</span>
                      </button>
                    ))}
                    {appliance.subCategories.length > 4 && (
                      <button
                        onClick={() => onSelect(appliance.slug)}
                        className="text-[10px] font-black uppercase text-primary mt-1 hover:underline tracking-widest text-left"
                      >
                        + {appliance.subCategories.length - 4} More Categories
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-zinc-50 pt-3">
                  <button
                    onClick={() => onSelect(appliance.slug)}
                    className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
