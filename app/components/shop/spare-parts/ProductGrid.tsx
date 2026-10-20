
"use client";

import ShopProductCard from "../ShopProductCard";
import { SearchX } from "lucide-react";

export type SparePart = {
  id: string;
  name: string;
  image: string;
  price: number;
  mrp?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  highlight?: string;
};

type Props = {
  parts: SparePart[];
  loading?: boolean;
  cartIds: Set<string>;
  onAddToCart: (id: string) => void;
  promo?: React.ReactNode;
};

function Skeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-2 sm:rounded-2xl sm:p-3">
      <div className="aspect-square animate-pulse rounded-lg bg-zinc-100" />
      <div className="mt-2.5 h-2.5 w-1/3 animate-pulse rounded bg-zinc-100 sm:mt-3 sm:h-3" />
      <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-100" />
      <div className="mt-1.5 h-3 w-3/4 animate-pulse rounded bg-zinc-100" />
      <div className="mt-3 h-8 animate-pulse rounded-lg bg-zinc-100 sm:h-10" />
    </div>
  );
}

export default function ProductGrid({
  parts,
  loading = false,
  cartIds,
  onAddToCart,
  promo,
}: Props) {
  const gridClass =
    "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5";

  if (loading) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading spare parts">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-10 text-center sm:rounded-2xl sm:px-6 sm:py-14">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#D8102B] sm:h-14 sm:w-14">
          <SearchX size={25} strokeWidth={1.8} />
        </span>

        <p className="mt-3 text-sm font-semibold text-zinc-900 sm:text-base">
          No parts found
        </p>

        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-zinc-500 sm:text-[13px]">
          Try another part name or model number, or clear your filters.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {parts.map((part, index) => (
        <div key={part.id} className="contents">
          <ShopProductCard
            part={{
              id: part.id,
              name: part.name,
              imageUrl: part.image,
              description: part.highlight,
              price: part.price,
              mrp: part.mrp,
              rating: part.rating?.toString(),
              reviews: part.reviews,
              bestSeller: part.badge?.toLowerCase() === "bestseller",
              isInStock: true,
            }}
            onRequest={() => onAddToCart(part.id)}
            inCart={cartIds.has(part.id)}
          />

          {promo && index === 3 && (
            <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-4">
              {promo}
            </div>
          )}
        </div>
      ))}

      {promo && parts.length <= 3 && (
        <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-4">
          {promo}
        </div>
      )}
    </div>
  );
}
