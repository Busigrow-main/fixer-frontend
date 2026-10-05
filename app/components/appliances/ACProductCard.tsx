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

interface ACProductCardProps {
  product: ACProduct;
}

export function ACProductCard({
  product,
}: ACProductCardProps) {
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

  const detailHref = `/spare-parts/appliances/ac/${encodeURIComponent(
    product.slug,
  )}`;

  const enquiryHref = `/spare-parts/enquiry?product=${encodeURIComponent(
    product.slug,
  )}&type=appliance`;

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60">
      {/* Image */}
      <Link
        href={detailHref}
        aria-label={`View ${product.name}`}
        className="block"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
          {product.images?.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              unoptimized
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04] sm:p-7"
              sizes="(max-width: 767px) 50vw, (max-width: 1023px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
                <Wrench className="h-6 w-6" />
              </div>
            </div>
          )}

          {/* Top badges */}
          <div className="absolute left-3 top-3 flex max-w-[calc(100%-24px)] flex-wrap gap-1.5">
            <span className="rounded-lg bg-slate-950/90 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">
              {product.brand}
            </span>

            {product.isInverter ? (
              <span className="rounded-lg bg-white/95 px-2 py-1 text-[9px] font-black text-slate-800 shadow-sm">
                Inverter
              </span>
            ) : null}
          </div>

          {/* Availability */}
          <div className="absolute right-3 top-3">
            {product.inStock ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[9px] font-black text-white shadow-sm">
                <CheckCircle2 className="h-3 w-3" />
                In stock
              </span>
            ) : (
              <span className="rounded-lg bg-slate-900/90 px-2 py-1 text-[9px] font-black text-white">
                Check availability
              </span>
            )}
          </div>

          {/* Discount */}
          {discountPercent > 0 ? (
            <span className="absolute bottom-3 left-3 rounded-lg bg-primary px-2 py-1 text-[9px] font-black text-white shadow-sm">
              {discountPercent}% OFF
            </span>
          ) : null}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        {/* Model */}
        <p className="truncate text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
          {product.modelNumber}
        </p>

        {/* Name */}
        <Link
          href={detailHref}
          className="mt-1.5 block"
        >
          <h3 className="line-clamp-2 text-sm font-black leading-5 tracking-[-0.015em] text-slate-950 transition-colors group-hover:text-primary sm:text-[15px]">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        {product.shortDescription ? (
          <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-slate-500 sm:text-xs">
            {product.shortDescription}
          </p>
        ) : null}

        {/* Specs */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <SpecChip>
            {product.capacityTon}T
          </SpecChip>

          <SpecChip icon={<Star />}>
            {product.starRating}
          </SpecChip>

          <SpecChip>
            {formatAcType(product.acType)}
          </SpecChip>
        </div>

        {/* Service information */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 border-t border-slate-100 pt-3">
          {product.installationIncluded ? (
            <div className="inline-flex items-center gap-1 text-[9px] font-bold text-primary sm:text-[10px]">
              <Wrench className="h-3.5 w-3.5" />
              Installation included
            </div>
          ) : null}

          <div className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 sm:text-[10px]">
            <ShieldCheck className="h-3.5 w-3.5" />
            {product.warrantyYears}Y warranty
          </div>
        </div>

        {/* Price */}
        <div className="mt-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>

            {hasOriginalPrice ? (
              <span className="text-[10px] font-semibold text-slate-400 line-through sm:text-xs">
                ₹
                {product.originalPrice!.toLocaleString(
                  "en-IN",
                )}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
            Final availability and installation details confirmed by Fixxer.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-4">
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Link
              href={enquiryHref}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 text-[10px] font-black text-white transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/15 sm:text-xs"
            >
              Enquire now
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href={detailHref}
              aria-label={`View details for ${product.name}`}
              className="inline-flex min-h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary/30 hover:text-primary"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-2 text-center text-[8px] font-semibold text-slate-400 sm:text-[9px]">
            No payment required to send an enquiry
          </p>
        </div>
      </div>
    </article>
  );
}

function SpecChip({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-[9px] font-black text-slate-600 sm:text-[10px]">
      {icon ? (
        <span className="text-amber-500">
          {icon}
        </span>
      ) : null}

      {children}
    </span>
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