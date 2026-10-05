"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn, formatPrice } from "@/app/lib/utils";
import { AC_SERVICE_IMAGE } from "@/app/lib/services";
import { ShoppingCart, Plus, CheckCircle2, AlertCircle } from "lucide-react";

interface PartCardProps {
  part: any;
  onAddToCart?: (sku: string) => void;
}

// Context-aware fallback images per appliance type
const FALLBACK_IMAGES: Record<string, string> = {
  refrigerator:     'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=600&auto=format&fit=crop',
  'washing-machine': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=600&auto=format&fit=crop',
  microwave:        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=600&auto=format&fit=crop',
  ac: AC_SERVICE_IMAGE,
  "air-conditioner": AC_SERVICE_IMAGE,
  television:       'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=600&auto=format&fit=crop',
  geyser:           'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=600&auto=format&fit=crop',
  default:          'https://images.unsplash.com/photo-1621905251918-44b7a1d1ccf6?q=80&w=600&auto=format&fit=crop',
};

function getPartFallbackImage(applianceSlug?: string): string {
  return FALLBACK_IMAGES[applianceSlug?.toLowerCase() || ''] || FALLBACK_IMAGES['default'];
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
      <div className="relative w-full h-28 sm:h-36 md:h-44 bg-zinc-50 shrink-0 overflow-hidden border-b border-zinc-100">
        <Image
          src={
            part.imageUrls?.[0] ||
            getPartFallbackImage(part.applianceTypeSlug)
          }
          alt={part.name}
          fill
          className="object-contain p-2.5 sm:p-4 group-hover:scale-110 transition-transform duration-500"
        />
        {part.isUniversal && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-zinc-900 text-[8px] font-black text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm uppercase tracking-widest">
            Universal
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-primary text-[9px] font-black text-white px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        {/* Title */}
        <Link href={`/spare-parts/${part.sku}`} className="group/link">
          <h3 className="text-xs sm:text-sm font-bold text-zinc-900 line-clamp-2 leading-snug group-hover/link:text-primary transition-colors min-h-[2rem] sm:min-h-[2.5rem]">
            {part.name}
          </h3>
        </Link>

        {/* Brand + SKU */}
        <p className="text-[9px] sm:text-[10px] text-zinc-500 mt-1 sm:mt-2 font-bold uppercase tracking-widest truncate">
          {part.brandSlug || "Standard"} • {part.partNumber || part.sku}
        </p>

        {/* Price */}
        <div className="mt-2 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
          <span className="text-base sm:text-xl font-black text-zinc-900">
            {formatPrice(part.price)}
          </span>
          {discount > 0 && (
            <span className="text-[10px] sm:text-xs text-zinc-400 line-through">
              {formatPrice(part.mrp)}
            </span>
          )}
        </div>

        {/* Product details are opened before requesting a part. */}
        {onAddToCart ? (
          <button
            onClick={handleRequestPart}
            className="mt-2.5 sm:mt-4 w-full h-9 sm:h-11 bg-primary text-white text-[10px] sm:text-[11px] font-black rounded-lg uppercase tracking-[0.08em] sm:tracking-[0.1em] shadow-lg shadow-primary/20 hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to cart
          </button>
        ) : (
          <Link
            href={`/spare-parts/${part.sku}`}
            className="mt-2.5 sm:mt-4 flex h-9 sm:h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-primary text-[10px] sm:text-[11px] font-black uppercase tracking-[0.08em] sm:tracking-[0.1em] text-primary transition-colors hover:bg-primary hover:text-white"
          >
            View details
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </Link>
        )}
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
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type Part = {
  _id?: string;
  sku?: string;
  slug?: string;
  name?: string;
  title?: string;

  brand?: string;
  brandName?: string;
  manufacturer?: string;
  maker?: string;

  partNumber?: string;

  image?: string;
  imageUrl?: string;
  imageUrls?: string[];
  images?: string[];

  price?: number | string;
  mrp?: number | string;

  stock?: number | string;
  isInStock?: boolean;

  isUniversal?: boolean;
  universal?: boolean;

  warrantyMonths?: number | string;
  warranty?: number | string;

  applianceTypeSlug?: string;
  applianceTypeName?: string;
  partCategory?: string;
  category?: string;

  compatibleModels?: Array<
    | string
    | {
        modelNumber?: string;
        modelName?: string;
      }
  >;
};

type PartComponentsProps = {
  parts?: Part[];
  items?: Part[];
  onAddToCart?: (part: Part) => void;
  className?: string;
};

export default function PartComponents({
  parts,
  items,
  onAddToCart,
  className = "",
}: PartComponentsProps) {
  const list = parts ?? items ?? [];

  if (!list.length) {
    return (
      <div
        className={`rounded-2xl border border-slate-200 bg-white px-5 py-10 text-center ${className}`}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <Package className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-sm font-black text-slate-900">
          No spare parts found
        </h3>

        <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
          Try another search, appliance type, brand, or part category.
        </p>

        <Link
          href="/spare-parts"
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white transition-colors hover:bg-primary/90"
        >
          Browse spare parts
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {list.map((part, index) => (
        <PartCard
          key={
            part._id ||
            part.sku ||
            part.slug ||
            `part-${index}`
          }
          part={part}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

function PartCard({
  part,
  onAddToCart,
}: {
  part: Part;
  onAddToCart?: (part: Part) => void;
}) {
  const id = part._id || "";

  const sku =
    part.sku ||
    part.slug ||
    id;

  const name =
    part.name ||
    part.title ||
    "Spare part";

  const brand =
    part.brandName ||
    part.brand ||
    part.manufacturer ||
    part.maker ||
    "";

  const partNumber =
    part.partNumber ||
    part.sku ||
    "";

  const image =
    part.image ||
    part.imageUrl ||
    part.imageUrls?.[0] ||
    part.images?.[0] ||
    "";

  const numericPrice =
    typeof part.price === "number"
      ? part.price
      : Number(part.price);

  const numericMrp =
    typeof part.mrp === "number"
      ? part.mrp
      : Number(part.mrp);

  const hasPrice =
    Number.isFinite(numericPrice) &&
    numericPrice > 0;

  const hasMrp =
    Number.isFinite(numericMrp) &&
    numericMrp > numericPrice;

  const stock =
    typeof part.stock === "number"
      ? part.stock
      : Number(part.stock);

  const hasStock =
    Number.isFinite(stock);

  const isInStock =
    typeof part.isInStock === "boolean"
      ? part.isInStock
      : hasStock
        ? stock > 0
        : true;

  const isUniversal =
    Boolean(
      part.isUniversal ||
        part.universal,
    );

  const warranty =
    part.warrantyMonths ||
    part.warranty;

  const detailHref = sku
    ? `/spare-parts/${encodeURIComponent(sku)}`
    : "/spare-parts";

  const enquiryHref = id
    ? `/spare-parts/enquiry?part=${encodeURIComponent(id)}`
    : detailHref;

  const compatibleModelCount =
    Array.isArray(part.compatibleModels)
      ? part.compatibleModels.length
      : 0;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.09)]">
      {/* Image */}
      <Link
        href={detailHref}
        className="relative block aspect-square overflow-hidden bg-slate-50"
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 240px"
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.04]"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <Package className="h-10 w-10" />
          </div>
        )}

        {/* Top badges */}
        <div className="absolute left-2.5 top-2.5 flex max-w-[calc(100%-20px)] flex-wrap gap-1.5">
          {isUniversal ? (
            <span className="rounded-full bg-slate-950 px-2 py-1 text-[8px] font-black uppercase tracking-wide text-white">
              Universal
            </span>
          ) : null}

          {isInStock ? (
            <span className="rounded-full border border-emerald-100 bg-white/95 px-2 py-1 text-[8px] font-black text-emerald-700 shadow-sm">
              In stock
            </span>
          ) : (
            <span className="rounded-full border border-amber-100 bg-white/95 px-2 py-1 text-[8px] font-black text-amber-700 shadow-sm">
              Request availability
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {brand ? (
          <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-primary">
            {brand}
          </p>
        ) : null}

        <Link
          href={detailHref}
          className="mt-1.5 line-clamp-2 min-h-[36px] text-xs font-black leading-[1.45] text-slate-950 transition-colors hover:text-primary sm:text-sm"
        >
          {name}
        </Link>

        {/* Part number */}
        {partNumber ? (
          <p className="mt-1 truncate font-mono text-[9px] font-semibold text-slate-400">
            {partNumber}
          </p>
        ) : null}

        {/* Compatibility */}
        <div className="mt-3 min-h-[22px]">
          {isUniversal ? (
            <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              Universal fit
            </div>
          ) : compatibleModelCount > 0 ? (
            <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
              <CheckCircle2 className="h-3 w-3 text-primary" />
              {compatibleModelCount} compatible{" "}
              {compatibleModelCount === 1
                ? "model"
                : "models"}
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
              <Wrench className="h-3 w-3" />
              Check compatibility
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-3">
          {hasPrice ? (
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-base font-black tracking-tight text-slate-950 sm:text-lg">
                ₹{numericPrice.toLocaleString("en-IN")}
              </span>

              {hasMrp ? (
                <span className="text-[10px] font-semibold text-slate-400 line-through">
                  ₹{numericMrp.toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs font-black text-slate-800">
              Price on request
            </span>
          )}

          {warranty ? (
            <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-slate-400">
              <ShieldCheck className="h-3 w-3" />
              {formatWarranty(warranty)}
            </div>
          ) : null}
        </div>

        {/* Stock */}
        <div className="mt-2 min-h-[16px]">
          {!isInStock ? (
            <p className="text-[9px] font-bold text-amber-600">
              Availability will be confirmed
            </p>
          ) : hasStock ? (
            <p className="text-[9px] font-bold text-emerald-600">
              {stock} available
            </p>
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3">
          <Link
            href={enquiryHref}
            onClick={() => {
              if (onAddToCart) {
                onAddToCart(part);
              }
            }}
            className="flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black text-white transition-all hover:bg-primary/90 active:scale-[0.98] sm:text-xs"
          >
            {isInStock
              ? "Request this part"
              : "Request availability"}

            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href={detailHref}
            className="mt-1.5 flex min-h-8 w-full items-center justify-center text-[9px] font-bold text-slate-500 transition-colors hover:text-primary sm:text-[10px]"
          >
            View part details
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatWarranty(value: number | string) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return String(value);
  }

  return `${numeric} month${numeric === 1 ? "" : "s"} warranty`;
}