
"use client";

import ShopProductCard from "../ShopProductCard";
import ShopProductGridSkeleton from "../ShopProductGridSkeleton";
import { SearchX } from "lucide-react";

export type SparePart = {
  id: string;
  name: string;
  image: string;
  sku?: string;
  brand?: string;
  price: number;
  mrp?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  bestSeller?: boolean;
  highlight?: string;
  stock?: number;
  isInStock?: boolean;
  warrantyMonths?: number;
  detailHref?: string;
  cartProductType?: "part" | "appliance";
};

type Props = {
  parts: SparePart[];
  loading?: boolean;
  cartIds: Set<string>;
  onAddToCart: (id: string) => void;
  promo?: React.ReactNode;
  error?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export default function ProductGrid({
  parts,
  loading = false,
  cartIds,
  onAddToCart,
  promo,
  error,
  onRetry,
  emptyTitle = "No parts found",
  emptyDescription = "Try another part name or model number, or clear your filters.",
}: Props) {
  const gridClass =
    "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5";

  if (loading) {
    return <ShopProductGridSkeleton className={gridClass} />;
  }

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-zinc-200 bg-white px-4 py-10 text-center sm:rounded-2xl sm:px-6 sm:py-14">
        <p className="text-sm font-semibold text-zinc-900">Products could not be loaded.</p>
        {onRetry && <button type="button" onClick={onRetry} className="mt-3 text-sm font-bold text-primary hover:underline">Try again</button>}
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
          {emptyTitle}
        </p>

        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-zinc-500 sm:text-[13px]">
          {emptyDescription}
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
              sku: part.sku,
              brand: part.brand,
              name: part.name,
              imageUrl: part.image,
              description: part.highlight,
              price: part.price,
              mrp: part.mrp,
              rating: part.rating?.toString(),
              reviews: part.reviews,
              bestSeller: part.bestSeller ?? /best\s*seller/i.test(part.badge ?? ""),
              isInStock: part.isInStock,
              stock: part.stock,
              warrantyMonths: part.warrantyMonths,
              detailHref: part.detailHref,
              cartProductId: part.id,
              cartProductType: part.cartProductType ?? "part",
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
