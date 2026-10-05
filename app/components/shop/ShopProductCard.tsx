"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Package,
  ShieldCheck,
} from "lucide-react";

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
    isInStock?: boolean;
    stock?: number;
    warrantyMonths?: number;
    partNumber?: string;
    description?: string;
  };
  onRequest?: () => void;
}

export default function ShopProductCard({
  part,
  onRequest,
}: ShopProductCardProps) {
  const identifier =
    part.slug || part.sku || part._id || part.id || "";

  const detailHref = `/spare-parts/${encodeURIComponent(
    part.sku || identifier,
  )}`;

  const enquiryHref = `/spare-parts/enquiry?part=${encodeURIComponent(
    part._id || part.id || identifier,
  )}`;

  const image =
    part.imageUrls?.[0] ||
    part.imageUrl ||
    "/images/placeholder-part.png";

  const hasPrice =
    typeof part.price === "number" &&
    part.price > 0;

  const hasMrp =
    typeof part.mrp === "number" &&
    part.mrp > 0 &&
    part.mrp > (part.price || 0);

  const discount =
    hasMrp && hasPrice
      ? Math.round(
          ((part.mrp! - part.price!) /
            part.mrp!) *
            100,
        )
      : 0;

  const inStock =
    part.isInStock !== false &&
    (typeof part.stock !== "number" ||
      part.stock > 0);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      {/* Product image */}
      <Link
        href={detailHref}
        className="relative block aspect-[1.08] overflow-hidden bg-slate-50"
        aria-label={`View ${part.name}`}
      >
        <Image
          src={image}
          alt={part.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
          className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.04]"
        />

        {discount > 0 ? (
          <span className="absolute left-2.5 top-2.5 rounded-lg bg-primary px-2 py-1 text-[8px] font-black text-white">
            {discount}% OFF
          </span>
        ) : null}

        {part.isUniversal ? (
          <span className="absolute right-2.5 top-2.5 rounded-lg bg-white px-2 py-1 text-[8px] font-black text-slate-700 shadow-sm">
            Universal
          </span>
        ) : null}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 md:p-4">
        {/* Brand */}
        <div className="flex min-w-0 items-center justify-between gap-2">
          {part.brand ? (
            <span className="truncate text-[9px] font-black uppercase tracking-[0.1em] text-primary">
              {part.brand}
            </span>
          ) : (
            <span />
          )}

          {inStock ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[8px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              In stock
            </span>
          ) : (
            <span className="shrink-0 text-[8px] font-bold text-slate-400">
              Check availability
            </span>
          )}
        </div>

        {/* Name */}
        <Link
          href={detailHref}
          className="mt-2 line-clamp-2 text-[12px] font-black leading-4 text-slate-900 transition-colors hover:text-primary md:text-sm md:leading-5"
        >
          {part.name}
        </Link>

        {/* SKU / part number */}
        {(part.partNumber || part.sku) ? (
          <p className="mt-1.5 truncate text-[8px] font-semibold text-slate-400">
            {part.partNumber
              ? `Part no. ${part.partNumber}`
              : `SKU ${part.sku}`}
          </p>
        ) : null}

        {/* Price */}
        <div className="mt-3">
          {hasPrice ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-black tracking-tight text-slate-950">
                ₹{part.price!.toLocaleString("en-IN")}
              </span>

              {hasMrp ? (
                <span className="text-[10px] font-semibold text-slate-400 line-through">
                  ₹{part.mrp!.toLocaleString("en-IN")}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-xs font-black text-slate-700">
              Price on request
            </span>
          )}
        </div>

        {/* Trust signals */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {part.warrantyMonths &&
          part.warrantyMonths > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[7px] font-bold text-slate-500">
              <ShieldCheck className="h-2.5 w-2.5" />
              {part.warrantyMonths}M warranty
            </span>
          ) : null}

          {part.isUniversal ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 text-[7px] font-bold text-slate-500">
              <Package className="h-2.5 w-2.5" />
              Universal fit
            </span>
          ) : null}
        </div>

        {/* CTA */}
        <div className="mt-auto pt-4">
          {onRequest ? (
            <button
              type="button"
              onClick={onRequest}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[9px] font-black text-white shadow-md shadow-primary/10 transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
            >
              Add to request
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              href={enquiryHref}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[9px] font-black text-white shadow-md shadow-primary/10 transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
            >
              Request this part
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}