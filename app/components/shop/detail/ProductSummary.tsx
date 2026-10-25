"use client";

import { warrantyInWords } from "@/app/lib/shop-copy";

type Props = {
  name: string;
  price: number;
  mrp?: number;
  rating: number;
  reviews: number;
  description: string;
  inStock?: boolean;
  productLabel?: string;
  verified?: boolean;
  warrantyMonths?: number;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function ProductSummary({ name, price, mrp, rating, reviews, description, inStock = true, productLabel, verified = false, warrantyMonths }: Props) {
  const off = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {productLabel && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">{productLabel}</span>}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white ${
            inStock ? "bg-teal-700" : "bg-zinc-500"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <h1 className="mt-3 text-[22px] font-extrabold leading-[1.15] tracking-tight text-zinc-900 sm:text-[26px] lg:text-4xl">
        {name}
      </h1>

      {(rating > 0 || reviews > 0 || verified) && <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-zinc-600">
        {rating > 0 && <>
        <a href="#reviews" className="inline-flex items-center gap-1 font-bold text-zinc-900 hover:text-primary">
          <span className="material-symbols-outlined icon-filled text-[16px] text-amber-500">star</span>
          {rating}
          {reviews > 0 && <span className="font-normal text-zinc-500">({reviews} reviews)</span>}
        </a>
        </>}
        <span className="text-zinc-300">·</span>
        {verified && <span className="inline-flex items-center gap-1 font-semibold text-green-700">
          <span className="material-symbols-outlined icon-filled text-[16px]">verified</span>
          Fixxer Verified
        </span>}
      </p>}

      <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-[29px] font-extrabold leading-none tracking-tight text-zinc-900 lg:text-4xl">
          {inr(price)}
        </span>
        {mrp && mrp > price && <span className="text-sm text-zinc-400 line-through">{inr(mrp)}</span>}
        {off > 0 && (
          <span className="rounded-md bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">{off}% off</span>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-500">Inclusive of taxes{warrantyInWords(warrantyMonths) ? ` · ${warrantyInWords(warrantyMonths)}` : ""}</p>

      <p className="mt-2.5 text-[13px] leading-relaxed text-zinc-600">{description}</p>
    </div>
  );
}
