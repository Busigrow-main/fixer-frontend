"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/lib/utils';
import { ChevronRight } from 'lucide-react';
import { getApplianceIcon } from './IconMap';
import Link from 'next/link';

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((appliance) => (
          <div
            key={appliance.slug}
            className="flex flex-row bg-white border border-zinc-200 rounded-3xl overflow-hidden hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group"
          >
            {/* Left: Image/Icon Section */}
            <div 
              className="w-1/3 min-w-[120px] bg-zinc-50 flex items-center justify-center p-6 cursor-pointer border-r border-zinc-100 group-hover:bg-primary/5 transition-colors"
              onClick={() => onSelect(appliance.slug)}
            >
              <div className="relative w-full aspect-square flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                {getApplianceIcon(appliance.icon, "w-16 h-16 text-zinc-300 group-hover:text-primary transition-colors")}
              </div>
            </div>

            {/* Right: Info & Subcategories */}
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <button 
                  onClick={() => onSelect(appliance.slug)}
                  className="text-xl font-black text-zinc-900 group-hover:text-primary transition-colors text-left"
                >
                  {appliance.name}
                </button>
                
                <div className="mt-4 flex flex-col gap-2">
                  {appliance.subCategories.slice(0, 4).map((sub) => (
                    <button
                      key={sub.slug}
                      onClick={() => onSubSelect(appliance.slug, sub.slug)}
                      className="text-sm font-bold text-zinc-500 hover:text-primary flex items-center gap-2 group/sub text-left"
                    >
                      <ChevronRight className="w-3 h-3 text-zinc-300 group-hover/sub:text-primary transition-colors" />
                      {sub.name}
                    </button>
                  ))}
                  {appliance.subCategories.length > 4 && (
                    <button 
                      onClick={() => onSelect(appliance.slug)}
                      className="text-[10px] font-black uppercase text-primary mt-1 hover:underline tracking-widest"
                    >
                      + {appliance.subCategories.length - 4} More Categories
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-zinc-50 pt-4">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  {appliance.partCount} Genuine Parts
                </span>
                <button 
                  onClick={() => onSelect(appliance.slug)}
                  className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
