"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownAZ,
  ArrowDownUp,
  ChevronDown,
  SlidersHorizontal,
  Star,
} from "lucide-react";

const SORT_OPTIONS = [
  {
    value: "relevance",
    label: "Recommended",
  },
  {
    value: "price_asc",
    label: "Price: Low to High",
  },
  {
    value: "price_desc",
    label: "Price: High to Low",
  },
  {
    value: "rating_desc",
    label: "Top Rated",
  },
  {
    value: "name_asc",
    label: "Name: A to Z",
  },
];

export function ACSortBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort =
    searchParams.get("sort") ||
    "relevance";

  const currentLabel = useMemo(() => {
    return (
      SORT_OPTIONS.find(
        (option) =>
          option.value === currentSort,
      )?.label || "Recommended"
    );
  }, [currentSort]);

  const updateSort = (
    value: string,
  ) => {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (
      !value ||
      value === "relevance"
    ) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    params.set("page", "1");

    const query = params.toString();

    router.push(
      query
        ? `${pathname}?${query}`
        : pathname,
    );
  };

  return (
    <div className="flex min-h-[58px] items-center justify-between gap-3 px-3.5 sm:px-4">
      {/* Result context */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:flex">
          <ArrowDownUp className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
            Sort
          </p>

          <p className="truncate text-[10px] font-black text-slate-800 sm:text-xs">
            {currentLabel}
          </p>
        </div>
      </div>

      {/* Desktop sort buttons */}
      <div className="hidden items-center gap-1 md:flex">
        {SORT_OPTIONS.map(
          (option) => {
            const active =
              currentSort ===
              option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateSort(
                    option.value,
                  )
                }
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[9px] font-black transition-colors ${
                  active
                    ? "bg-primary text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {getSortIcon(
                  option.value,
                )}

                {option.label}
              </button>
            );
          },
        )}
      </div>

      {/* Mobile dropdown */}
      <label className="relative flex min-w-[150px] items-center md:hidden">
        <SlidersHorizontal className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />

        <select
          value={currentSort}
          onChange={(event) =>
            updateSort(
              event.target.value,
            )
          }
          aria-label="Sort AC products"
          className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-[10px] font-black text-slate-700 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        >
          {SORT_OPTIONS.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ),
          )}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-slate-400" />
      </label>
    </div>
  );
}

function getSortIcon(
  value: string,
) {
  if (value === "price_asc") {
    return (
      <span className="text-[10px]">
        ₹↑
      </span>
    );
  }

  if (value === "price_desc") {
    return (
      <span className="text-[10px]">
        ₹↓
      </span>
    );
  }

  if (value === "rating_desc") {
    return (
      <Star className="h-3 w-3" />
    );
  }

  if (value === "name_asc") {
    return (
      <ArrowDownAZ className="h-3 w-3" />
    );
  }

  return (
    <ArrowDownUp className="h-3 w-3" />
  );
}