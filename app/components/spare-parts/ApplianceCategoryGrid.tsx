"use client";

import React from 'react';
import { ApplianceTypeCategory } from '@/app/lib/spareParts';
import { cn } from '@/app/lib/utils';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { getApplianceIcon } from './IconMap';

interface ApplianceCategoryGridProps {
  categories: ApplianceTypeCategory[];
  onSelect: (slug: string) => void;
  loading?: boolean;
}

export const ApplianceCategoryGrid: React.FC<ApplianceCategoryGridProps> = ({
  categories,
  onSelect,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-40 bg-zinc-100 rounded-3xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl md:text-4xl font-black text-zinc-900">
          What Appliance Needs Repair?
        </h2>
        <p className="text-base text-zinc-600 max-w-2xl">
          Select your appliance type to browse compatible spare parts. We have thousands of genuine & aftermarket options.
        </p>
      </div>

      {/* Grid: 1 col mobile, 2 col tablet, 3-4 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <ApplianceCategoryCard
            key={category.slug}
            category={category}
            onSelect={onSelect}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-zinc-600 font-medium">No appliance types available</p>
        </div>
      )}
    </div>
  );
};

interface ApplianceCategoryCardProps {
  category: ApplianceTypeCategory;
  onSelect: (slug: string) => void;
}

const ApplianceCategoryCard: React.FC<ApplianceCategoryCardProps> = ({
  category,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect(category.slug)}
      className={cn(
        "relative overflow-hidden rounded-3xl border-2 border-zinc-200 bg-white h-40",
        "p-5 text-left transition-all duration-300",
        "hover:border-primary hover:shadow-xl hover:shadow-primary/15",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
        "group active:scale-95"
      )}
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Icon Section - Larger */}
        <div className="mb-3 flex-shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:from-primary/25 group-hover:to-primary/10 transition-colors duration-300">
            {getApplianceIcon(category.icon, "w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300")}
          </div>
        </div>

        {/* Text Section */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <h3 className="text-base font-black text-zinc-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors duration-300">
              {category.name}
            </h3>
          </div>
          
          {/* Part Count Badge */}
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg group-hover:bg-primary/20 transition-colors">
              {category.partCount}+ Parts
            </span>
            <ChevronRight className="w-4 h-4 text-primary/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>
    </button>
  );
};
