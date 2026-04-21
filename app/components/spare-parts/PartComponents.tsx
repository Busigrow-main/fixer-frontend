"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/app/lib/utils";
import { ShoppingCart, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface PartCardProps {
  part: any;
  onAddToCart?: (sku: string) => void;
}

export const PartCard: React.FC<PartCardProps> = ({ part, onAddToCart }) => {
  const router = useRouter();
  const discount = part.mrp ? Math.round((1 - part.price / part.mrp) * 100) : 0;

  const handleRequestPart = () => {
    if (onAddToCart) {
      onAddToCart(part.sku);
      return;
    }

    router.push(`/spare-parts/enquiry?part=${part._id}`);
  };

  return (
    <article className="flex flex-col border border-zinc-100 rounded-2xl bg-white hover:border-primary/50 hover:shadow-md hover:shadow-zinc-200/50 transition-all duration-300 overflow-hidden group">
      {/* Image Container - Compact */}
      <div className="relative w-full h-40 bg-gradient-to-br from-zinc-50 to-zinc-100 shrink-0 overflow-hidden">
        <Image
          src={
            part.imageUrls?.[0] ||
            "https://images.unsplash.com/photo-1581092160562-40aa08e78837"
          }
          alt={part.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {part.isUniversal && (
          <div className="absolute top-2 left-2 bg-teal-600/95 text-[7px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">
            Universal
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-orange-600/95 text-[9px] font-black text-white px-2 py-0.5 rounded-lg">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content Container - Compact */}
      <div className="flex flex-col flex-1 min-w-0 p-3">
        {/* Title */}
        <Link href={`/spare-parts/${part.sku}`} className="group/link">
          <h3 className="text-xs font-black text-zinc-900 line-clamp-2 leading-tight group-hover/link:text-primary transition-colors">
            {part.name}
          </h3>
        </Link>

        {/* Brand + SKU */}
        <p className="text-[9px] text-zinc-500 mt-1 font-medium line-clamp-1">
          {part.brandSlug || "Generic"}
        </p>

        {/* Quick Info Tags - Compact */}
        <div className="mt-2 flex flex-wrap gap-1">
          {part.installationDifficulty?.type && (
            <span
              className={cn(
                "text-[7px] px-1.5 py-0.5 rounded-md font-bold whitespace-nowrap",
                part.installationDifficulty.type === "Professional Only"
                  ? "bg-orange-50 text-orange-600"
                  : part.installationDifficulty.type === "Easy"
                    ? "bg-green-50 text-green-600"
                    : "bg-blue-50 text-blue-600",
              )}
            >
              {part.installationDifficulty.type === "Professional Only"
                ? "Pro"
                : "Easy"}
            </span>
          )}
          {part.warrantyMonths && (
            <span className="text-[7px] px-1.5 py-0.5 rounded-md font-bold bg-zinc-100 text-zinc-600 whitespace-nowrap">
              {part.warrantyMonths}mo
            </span>
          )}
        </div>

        {/* Price & CTA - Compact */}
        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-base font-black text-zinc-900">
              {formatPrice(part.price)}
            </span>
            {discount > 0 && (
              <span className="text-[8px] text-zinc-400 line-through">
                {formatPrice(part.mrp)}
              </span>
            )}
          </div>

          <button
            onClick={handleRequestPart}
            className="flex items-center justify-center w-8 h-8 bg-primary text-white text-[10px] font-black rounded-lg shadow-md shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 shrink-0"
            title="Request part"
          >
            <Plus className="w-4 h-4" />
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
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
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
                  : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200",
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
