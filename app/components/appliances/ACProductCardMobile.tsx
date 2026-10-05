"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";

interface ACProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string;
  price: number;
  originalPrice?: number;
  capacityTon: number;
  starRating: number;
  acType: string;
  isInverter: boolean;
  shortDescription?: string;
  images: string[];
  inStock: boolean;
  installationIncluded: boolean;
  warrantyYears: number;
}

interface ACProductCardMobileProps {
  product: ACProduct;
}

export function ACProductCardMobile({
  product,
}: ACProductCardMobileProps) {
  const detailHref = `/spare-parts/appliances/ac/${encodeURIComponent(
    product.slug,
  )}`;

  const enquiryHref = `/spare-parts/enquiry?product=${encodeURIComponent(
    product.slug,
  )}&type=appliance`;

  const hasOriginalPrice =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const discountPercent = hasOriginalPrice
    ? Math.round(
        ((product.originalPrice! - product.price) /
          product.originalPrice!) *
          100,
      )
    : 0;

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm">
      {/* Product image */}
      <Link
        href={detailHref}
        className="block"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
          {product.images?.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              unoptimized
              sizes="50vw"
              className="object-contain p-3.5"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Wrench className="h-7 w-7 text-slate-300" />
            </div>
          )}

          {/* Brand */}
          <span className="absolute left-2.5 top-2.5 max-w-[calc(100%-5rem)] truncate rounded-md bg-slate-950/90 px-1.5 py-1 text-[8px] font-black uppercase tracking-wide text-white">
            {product.brand}
          </span>

          {/* Stock */}
          <span
            className={`absolute right-2.5 top-2.5 rounded-md px-1.5 py-1 text-[8px] font-black ${
              product.inStock
                ? "bg-emerald-600 text-white"
                : "bg-slate-900/90 text-white"
            }`}
          >
            {product.inStock
              ? "In stock"
              : "Check availability"}
          </span>

          {discountPercent > 0 ? (
            <span className="absolute bottom-2.5 left-2.5 rounded-md bg-primary px-1.5 py-1 text-[8px] font-black text-white">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        <p className="truncate text-[8px] font-black uppercase tracking-[0.1em] text-slate-400">
          {product.modelNumber}
        </p>

        <Link
          href={detailHref}
          className="mt-1"
        >
          <h3 className="line-clamp-2 text-[12px] font-black leading-[1.35] text-slate-950">
            {product.name}
          </h3>
        </Link>

        {/* High-signal specs only */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[8px] font-black text-slate-600">
            {product.capacityTon}T
          </span>

          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-1 text-[8px] font-black text-slate-600">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            {product.starRating}
          </span>

          <span className="rounded-md bg-slate-100 px-1.5 py-1 text-[8px] font-black text-slate-600">
            {formatAcType(product.acType)}
          </span>

          {product.isInverter ? (
            <span className="rounded-md bg-primary/[0.07] px-1.5 py-1 text-[8px] font-black text-primary">
              Inverter
            </span>
          ) : null}
        </div>

        {/* Price */}
        <div className="mt-3">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-[15px] font-black tracking-tight text-slate-950">
              ₹
              {Number(
                product.price || 0,
              ).toLocaleString("en-IN")}
            </span>

            {hasOriginalPrice ? (
              <span className="text-[8px] font-semibold text-slate-400 line-through">
                ₹
                {product.originalPrice!.toLocaleString(
                  "en-IN",
                )}
              </span>
            ) : null}
          </div>
        </div>

        {/* Service reassurance */}
        <div className="mt-2.5 space-y-1">
          {product.installationIncluded ? (
            <div className="flex items-center gap-1 text-[8px] font-bold text-primary">
              <Wrench className="h-3 w-3 shrink-0" />
              Installation included
            </div>
          ) : null}

          <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500">
            <ShieldCheck className="h-3 w-3 shrink-0" />
            {product.warrantyYears}Y warranty
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-3">
          <Link
            href={enquiryHref}
            className="flex min-h-10 w-full items-center justify-center gap-1 rounded-xl bg-primary px-2 text-[9px] font-black text-white active:scale-[0.98]"
          >
            Enquire now
            <ArrowRight className="h-3 w-3" />
          </Link>

          <Link
            href={detailHref}
            className="mt-2 flex min-h-8 items-center justify-center text-[9px] font-black text-slate-500"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}

function formatAcType(value: string) {
  if (!value) {
    return "AC";
  }

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}