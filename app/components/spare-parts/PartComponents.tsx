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