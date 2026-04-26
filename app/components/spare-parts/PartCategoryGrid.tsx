"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { ChevronRight } from 'lucide-react';

// Curated Unsplash images per part category keyword
const PART_CATEGORY_IMAGES: Record<string, string> = {
  compressor:        'https://images.unsplash.com/photo-1609621838510-5ad474b7d25d?q=80&w=600&auto=format&fit=crop',
  thermostat:        'https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?q=80&w=600&auto=format&fit=crop',
  motor:             'https://images.unsplash.com/photo-1621905251918-44b7a1d1ccf6?q=80&w=600&auto=format&fit=crop',
  filter:            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
  pump:              'https://images.unsplash.com/photo-1622372738946-62e02505f2b1?q=80&w=600&auto=format&fit=crop',
  drum:              'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop',
  belt:              'https://images.unsplash.com/photo-1630569267625-157f8f9d1a7e?q=80&w=600&auto=format&fit=crop',
  heater:            'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop',
  capacitor:         'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  sensor:            'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  pcb:               'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  board:             'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop',
  fan:               'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
  coil:              'https://images.unsplash.com/photo-1609621838510-5ad474b7d25d?q=80&w=600&auto=format&fit=crop',
  valve:             'https://images.unsplash.com/photo-1622372738946-62e02505f2b1?q=80&w=600&auto=format&fit=crop',
  door:              'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=600&auto=format&fit=crop',
  seal:              'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=600&auto=format&fit=crop',
  gasket:            'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=600&auto=format&fit=crop',
  default:           'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=600&auto=format&fit=crop',
};

function getCategoryImage(name: string, slug: string): string {
  const text = `${name} ${slug}`.toLowerCase();
  for (const [key, url] of Object.entries(PART_CATEGORY_IMAGES)) {
    if (key !== 'default' && text.includes(key)) return url;
  }
  return PART_CATEGORY_IMAGES['default'];
}

interface PartCategory {
  slug: string;
  name: string;
  icon: string;
  partCount: number;
}

interface PartCategoryGridProps {
  categories: PartCategory[];
  onSelect: (slug: string) => void;
  applianceName: string;
}

export const PartCategoryGrid: React.FC<PartCategoryGridProps> = ({
  categories,
  onSelect,
  applianceName,
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl md:text-4xl font-black text-zinc-900">
          {applianceName} Parts
        </h2>
        <p className="text-base text-zinc-600 max-w-2xl font-medium">
          Browse specific part categories for your {applianceName}. We stock everything from compressors to tiny sensors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const imgSrc = getCategoryImage(category.name, category.slug);
          return (
            <button
              key={category.slug}
              onClick={() => onSelect(category.slug)}
              className={cn(
                "relative overflow-hidden rounded-3xl border border-zinc-200 bg-white h-32",
                "text-left transition-all duration-300",
                "hover:border-primary hover:shadow-xl hover:shadow-primary/10",
                "group active:scale-95 flex items-stretch"
              )}
            >
              {/* Left: Category Photo */}
              <div className="relative w-28 shrink-0 overflow-hidden rounded-l-3xl">
                <Image
                  src={imgSrc}
                  alt={category.name}
                  fill
                  sizes="112px"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
              </div>

              {/* Right: Info */}
              <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                    {category.name}
                  </h3>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1 block">
                    {category.partCount} Items
                  </span>
                </div>
                <div className="flex justify-end">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 group-hover:bg-primary flex items-center justify-center transition-all">
                    <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
