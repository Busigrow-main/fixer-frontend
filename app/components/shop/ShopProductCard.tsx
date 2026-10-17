"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Heart, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import sparePartMotor from "../../public/images/shop/spare-part-motor.png";

interface ShopProductCardProps {
  part: {
    _id?: string;
    id?: string;
    sku?: string;
    slug?: string;
    name: string;
    brand?: string;
    price?: number;
    mrp?: number;
    imageUrls?: string[];
    imageUrl?: string;
    isUniversal?: boolean;
    bestSeller?: boolean;
    isInStock?: boolean;
    stock?: number;
    warrantyMonths?: number;
    partNumber?: string;
    description?: string;
    rating?: string;
    reviews?: number;
  };
  onRequest?: () => void;
}

const ctaClass =
  "mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#e9002d] px-3 text-[12px] font-bold text-white shadow-sm transition hover:bg-[#d60029] active:scale-[0.98] sm:text-[13px] md:h-10";

export default function ShopProductCard({ part, onRequest }: ShopProductCardProps) {
  const [wished, setWished] = useState(false);

  const identifier = part.slug || part.sku || part._id || part.id || "";
  const detailHref = `/spare-parts/${encodeURIComponent(part.sku || identifier)}`;
  const enquiryHref = `/spare-parts/enquiry?part=${encodeURIComponent(
    part._id || part.id || identifier,
  )}`;

  const image = part.imageUrls?.[0] || part.imageUrl || sparePartMotor;

  const hasPrice = typeof part.price === "number" && part.price > 0;
  const hasMrp =
    typeof part.mrp === "number" && part.mrp > 0 && part.mrp > (part.price || 0);
  const discount =
    hasMrp && hasPrice
      ? Math.round(((part.mrp! - part.price!) / part.mrp!) * 100)
      : 0;

  const inStock =
    part.isInStock !== false && (typeof part.stock !== "number" || part.stock > 0);

  const cta = (
    <>
      <ShoppingCart className="h-3.5 w-3.5" />
      <span>Add to Cart</span>
    </>
  );

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg sm:rounded-2xl">
      {/* Image */}
      <div className="relative aspect-[1.4] bg-[#f3f3f4] md:aspect-[1.5]">
        <Link href={detailHref} aria-label={`View ${part.name}`} className="absolute inset-0">
          <Image
            src={image}
            alt={part.name}
            fill
            unoptimized
            sizes="(max-width: 1023px) 50vw, 280px"
            className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105 sm:p-3.5 md:p-4"
          />
        </Link>

        {part.bestSeller ? (
          <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded bg-[#e9002d] px-1.5 py-[3px] text-[8px] font-extrabold uppercase leading-none tracking-wide text-white sm:text-[9px]">
            Bestseller
          </span>
        ) : discount > 0 ? (
          <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded bg-[#e9002d] px-1.5 py-[3px] text-[8px] font-extrabold uppercase leading-none text-white sm:text-[9px]">
            {discount}% off
          </span>
        ) : null}

        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => setWished((w) => !w)}
          className="absolute right-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition active:scale-90"
        >
          <Heart
            className={`h-3.5 w-3.5 ${
              wished ? "fill-[#e9002d] text-[#e9002d]" : "text-slate-500"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-2.5 pb-2.5 pt-2 sm:px-3 sm:pb-3">
        <p className="flex items-center gap-1 text-[10px] font-medium leading-none text-slate-600 sm:text-[11px]">
          <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
          <span>{part.rating ?? "4.8"}</span>
          <span className="text-slate-400">({part.reviews ?? 124})</span>
          {inStock ? (
            <span className="ml-auto hidden items-center gap-1 font-semibold text-emerald-600 md:inline-flex">
              <CheckCircle2 className="h-3 w-3" /> In stock
            </span>
          ) : (
            <span className="ml-auto font-semibold text-slate-400">Out of stock</span>
          )}
        </p>

        <Link
          href={detailHref}
          className="mt-1 line-clamp-2 min-h-[2.6em] text-[12px] font-bold leading-[1.3] text-slate-900 transition-colors hover:text-[#e9002d] sm:text-[13px] md:text-sm"
        >
          {part.name}
        </Link>

        {(part.partNumber || part.sku) && (
          <p className="mt-0.5 hidden truncate text-[10px] font-medium text-slate-400 lg:block">
            {part.partNumber ? `Part no. ${part.partNumber}` : `SKU ${part.sku}`}
          </p>
        )}

        {/* Price + CTA pinned to the bottom so cards align in a row */}
        <div className="mt-auto pt-1.5">
          {hasPrice ? (
            <div className="flex flex-wrap items-baseline gap-x-1.5 leading-tight">
              <span className="text-[15px] font-extrabold tracking-tight text-slate-950 md:text-lg">
                ₹{part.price!.toLocaleString("en-IN")}
              </span>
              {hasMrp && (
                <span className="text-[10px] text-slate-400 line-through md:text-xs">
                  ₹{part.mrp!.toLocaleString("en-IN")}
                </span>
              )}
              {hasMrp && (
                <span className="text-[10px] font-semibold text-[#e9002d] md:text-xs">
                  {discount}% off
                </span>
              )}
            </div>
          ) : (
            <p className="text-[13px] font-extrabold text-slate-700">Price on request</p>
          )}

          {part.warrantyMonths && part.warrantyMonths > 0 ? (
            <p className="mt-1 hidden items-center gap-1 text-[10px] font-semibold text-slate-500 lg:flex">
              <ShieldCheck className="h-3 w-3" />
              {part.warrantyMonths}M warranty
            </p>
          ) : null}

          {onRequest ? (
            <button type="button" onClick={onRequest} className={ctaClass}>
              {cta}
            </button>
          ) : (
            <Link href={enquiryHref} className={ctaClass}>
              {cta}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}