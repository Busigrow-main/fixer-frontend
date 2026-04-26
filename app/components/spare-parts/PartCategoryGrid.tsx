"use client";

import React from 'react';
import { cn } from '@/app/lib/utils';
import { ChevronRight } from 'lucide-react';
import { getApplianceIcon } from './IconMap';

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
        <p className="text-base text-zinc-600 max-w-2xl">
          Browse specific part categories for your {applianceName}. We stock everything from compressors to tiny sensors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <button
            key={category.slug}
            onClick={() => onSelect(category.slug)}
            className={cn(
              "relative overflow-hidden rounded-3xl border-2 border-zinc-200 bg-white h-32",
              "p-5 text-left transition-all duration-300",
              "hover:border-primary hover:shadow-xl hover:shadow-primary/15",
              "group active:scale-95"
            )}
          >
            <div className="relative z-10 flex items-center h-full gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                 {getApplianceIcon(category.icon || 'settings', "w-8 h-8 text-zinc-400 group-hover:text-primary transition-colors")}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-black text-zinc-900 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <span className="text-xs font-bold text-zinc-400">
                  {category.partCount} Items
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-200 group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
