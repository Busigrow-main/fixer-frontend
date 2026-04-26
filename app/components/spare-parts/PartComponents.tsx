"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/app/lib/utils";
import { ShoppingCart, Plus, CheckCircle2, AlertCircle, MapPin, Mail } from "lucide-react";

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
    <article className="flex flex-col border border-zinc-200 rounded-xl bg-white hover:shadow-xl hover:border-indiamart-teal/20 transition-all duration-300 overflow-hidden group">
      {/* Image Container */}
      <div className="relative w-full h-44 bg-zinc-50 shrink-0 overflow-hidden border-b border-zinc-100">
        <Image
          src={
            part.imageUrls?.[0] ||
            "https://images.unsplash.com/photo-1581092160562-40aa08e78837"
          }
          alt={part.name}
          fill
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
        />
        {part.isUniversal && (
          <div className="absolute top-3 left-3 bg-zinc-900 text-[8px] font-black text-white px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">
            Universal
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-primary text-[9px] font-black text-white px-2 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title */}
        <Link href={`/spare-parts/${part.sku}`} className="group/link">
          <h3 className="text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover/link:text-primary transition-colors min-h-[2.5rem]">
            {part.name}
          </h3>
        </Link>

        {/* Brand + SKU */}
        <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">
          {part.brandSlug || "Standard"} • {part.partNumber || part.sku}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-black text-zinc-900">
            {formatPrice(part.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(part.mrp)}
            </span>
          )}
        </div>

        {/* Location / Trust Info */}
        <div className="mt-4 pt-3 border-t border-zinc-50 flex items-center gap-2 text-zinc-400">
          <MapPin className="w-3.5 h-3.5 text-zinc-300" />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Ready in Patna, Bihar
          </span>
        </div>

        {/* CTA Button - IndiaMART Style */}
        <button
          onClick={handleRequestPart}
          className="mt-4 w-full h-11 bg-primary text-white text-[11px] font-black rounded-lg uppercase tracking-[0.1em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" />
          Get Best Price
        </button>
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
