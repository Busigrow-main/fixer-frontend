"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "rating_desc", label: "Top rated" },
] as const;

export function ACSortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex min-w-0 items-center gap-2.5">
      <span className="shrink-0 font-label text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
        Sort
      </span>
      <div
        className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar"
        role="tablist"
        aria-label="Sort products"
      >
        {SORT_OPTIONS.map((option) => {
          const active = currentSort === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSortChange(option.value)}
              className={`h-8 shrink-0 rounded-full px-4 font-label text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200 active:scale-[0.98] ${
                active
                  ? "bg-primary text-on-primary shadow-md shadow-primary/20"
                  : "border border-outline bg-surface-container text-on-surface-variant hover:border-primary/25 hover:text-on-surface"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
