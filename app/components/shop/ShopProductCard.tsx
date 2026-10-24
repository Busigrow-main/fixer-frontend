"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Image as ImageIcon, ShieldCheck, Star } from "lucide-react";
import { warrantyInWords } from "@/app/lib/shop-copy";

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
    detailHref?: string;
    enquiryHref?: string;
    cartProductType?: "part" | "appliance";
    cartProductId?: string;
    fitCount?: number;
  };
  onRequest?: () => void;
  inCart?: boolean;
}

export default function ShopProductCard({ part }: ShopProductCardProps) {
  const identifier = part.slug || part.sku || part._id || part.id || "";
  const detailHref = part.detailHref || `/shop/spare-parts/${encodeURIComponent(part.sku || identifier)}`;
  const image = part.imageUrls?.[0] || part.imageUrl;
  const hasPrice = typeof part.price === "number" && part.price > 0;
  const hasMrp = typeof part.mrp === "number" && part.mrp > 0 && part.mrp > (part.price || 0);
  const stockKnown = typeof part.isInStock === "boolean" || typeof part.stock === "number";
  const inStock = part.isInStock !== false && (typeof part.stock !== "number" || part.stock > 0);
  const warranty = warrantyInWords(part.warrantyMonths);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)]">
      <Link href={detailHref} aria-label={`View ${part.name}`} className="flex h-full flex-col">
        <div className="relative m-2.5 aspect-square overflow-hidden rounded-xl bg-[#f6f6f6]">
          {image ? (
            <Image
              src={image}
              alt={part.name}
              fill
              unoptimized
              sizes="(max-width: 1023px) 50vw, 280px"
              className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-zinc-300" aria-label="Product image unavailable">
              <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
            </span>
          )}
          {part.bestSeller && (
            <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm">
              Bestseller
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col px-3 pb-4 pt-1">
          {part.brand && <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{part.brand}</p>}
          <h3 className="mt-1 line-clamp-2 min-h-[2.5em] text-[15px] font-bold leading-snug text-zinc-900 group-hover:text-primary">
            {part.name}
          </h3>
          {part.description && (
            <p className="mt-1 hidden truncate text-[12px] text-zinc-500 md:block" title={part.description}>
              {part.description}
            </p>
          )}
          {typeof part.fitCount === "number" && part.fitCount > 0 && (
            <p className="mt-1 text-[12px] text-zinc-600">Fits {part.fitCount} models</p>
          )}

          <div className="mt-auto pt-2">
            {part.rating && (
              <p className="mb-1 flex items-center gap-1 text-[13px] font-medium text-zinc-700">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                <span>{part.rating}</span>
                {part.reviews !== undefined && <span className="text-zinc-400">({part.reviews})</span>}
              </p>
            )}
            {hasPrice ? (
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-lg font-extrabold tracking-tight text-zinc-950">₹{part.price!.toLocaleString("en-IN")}</span>
                {hasMrp && <span className="text-xs text-zinc-400 line-through">₹{part.mrp!.toLocaleString("en-IN")}</span>}
              </p>
            ) : (
              <p className="text-sm font-bold text-zinc-700">Price on request</p>
            )}
            {warranty && (
              <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-zinc-600">
                <ShieldCheck className="h-3.5 w-3.5" /> {warranty}
              </p>
            )}
            {stockKnown && (
              inStock ? (
                <p className="mt-1 hidden items-center gap-1 text-[12px] font-semibold text-emerald-700 md:flex">
                  <CheckCircle2 className="h-3.5 w-3.5" /> In stock
                </p>
              ) : (
                <p className="mt-1 text-[12px] font-semibold text-zinc-500">Out of stock</p>
              )
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
