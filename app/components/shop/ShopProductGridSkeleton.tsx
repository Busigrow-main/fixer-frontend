type Props = {
  count?: number;
  className?: string;
};

function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-[22px] border border-[#e0e2e5] bg-white p-2.5 shadow-[0_2px_7px_rgba(20,20,20,0.07)] sm:p-3">
      <div className="aspect-square animate-pulse rounded-[18px] bg-zinc-100" />
      <div className="mt-3 h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-100" />
      <div className="mt-1.5 h-4 w-3/4 animate-pulse rounded bg-zinc-100" />
      <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-zinc-100" />
      <div className="mt-3 h-12 animate-pulse rounded-xl bg-zinc-100" />
    </div>
  );
}

export default function ShopProductGridSkeleton({ count = 8, className }: Props) {
  return (
    <div role="status" aria-label="Loading products" aria-busy="true">
      <span className="sr-only">Loading products...</span>
      <div className={className ?? "grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-6"}>
        {Array.from({ length: count }, (_, index) => <ProductCardSkeleton key={index} />)}
      </div>
    </div>
  );
}
