"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, formatPrice } from '@/app/lib/utils';
import { ShoppingCart, Plus, CheckCircle2, AlertCircle } from 'lucide-react';

interface PartCardProps {
  part: any;
  onAddToCart?: (sku: string) => void;
}

export const PartCard: React.FC<PartCardProps> = ({ part, onAddToCart }) => {
  const discount = part.mrp ? Math.round((1 - part.price / part.mrp) * 100) : 0;

  return (
    <article className="flex flex-row gap-4 p-4 border border-zinc-100 rounded-3xl bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-zinc-200/40 transition-all duration-300">
      <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-zinc-50 flex-shrink-0">
        <Image
          src={part.imageUrls?.[0] || "https://images.unsplash.com/photo-1581092160562-40aa08e78837"}
          alt={part.name}
          fill
          className="object-cover"
        />
        {part.isUniversal && (
          <div className="absolute top-2 left-2 bg-teal-600/90 backdrop-blur-sm text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
            Universal
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <Link href={`/spare-parts/${part.sku}`} className="group">
            <h3 className="text-sm md:text-base font-black text-zinc-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {part.name}
            </h3>
          </Link>
          <span className={cn(
            "text-[8px] md:text-[10px] uppercase font-black px-2 py-0.5 rounded-md",
            part.partType?.type === 'OEM' ? "bg-blue-50 text-blue-600 border border-blue-100" :
            part.partType?.type === 'Universal' ? "bg-teal-50 text-teal-600 border border-teal-100" :
            "bg-zinc-50 text-zinc-500 border border-zinc-100"
          )}>
            {part.partType?.type || 'Part'}
          </span>
        </div>

        <p className="text-[10px] md:text-xs text-zinc-400 mt-1 uppercase tracking-wider font-black">
          OEM #{part.partNumber || "N/A"}
        </p>

        <div className="mt-2 flex flex-wrap gap-1">
           {part.installationDifficulty?.type && (
             <span className={cn(
               "text-[9px] px-2 py-0.5 rounded-full font-bold",
               part.installationDifficulty.type === 'Professional Only' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600"
             )}>
               {part.installationDifficulty.type}
             </span>
           )}
           {part.warrantyMonths && (
             <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 text-zinc-600">
               {part.warrantyMonths}m Warranty
             </span>
           )}
        </div>

        <div className="mt-auto pt-3 flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base md:text-xl font-black text-zinc-900">
                {formatPrice(part.price)}
              </span>
              {discount > 0 && (
                <span className="text-[10px] md:text-xs text-zinc-400 line-through">
                  {formatPrice(part.mrp)}
                </span>
              )}
            </div>
            {discount > 0 && (
              <span className="text-[10px] font-black text-teal-600">
                SAVE {discount}% OFF
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart?.(part.sku)}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-[11px] md:text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:scale-[0.98] transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
};

export const FilterChips: React.FC<{
  items: any[];
  activeValue: any;
  onSelect: (value: any) => void;
  label: string;
}> = ({ items, activeValue, onSelect, label }) => {
  return (
    <div className="flex flex-col gap-2 my-4">
      <span className="text-[10px] uppercase font-black text-zinc-400 tracking-widest px-1">
        {label}
      </span>
      <div className="flex flex-row overflow-x-auto no-scrollbar gap-2 pb-1">
        <button
          onClick={() => onSelect(null)}
          className={cn(
            "h-8 px-4 rounded-full text-[11px] font-black uppercase transition-all whitespace-nowrap",
            activeValue === null 
              ? "bg-primary text-white" 
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
          )}
        >
          All
        </button>
        {items.map((item) => {
          const value = item.value || item;
          const displayLabel = item.label || item;
          const isActive = activeValue === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={cn(
                "h-8 px-4 rounded-full text-[11px] font-black uppercase transition-all whitespace-nowrap",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              )}
            >
              {displayLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
};
