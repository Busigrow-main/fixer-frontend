"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  ChevronDown,
  CircleDollarSign,
  RotateCcw,
  Ruler,
  Star,
  Wind,
  PackageCheck,
} from "lucide-react";

const CAPACITY_OPTIONS = [
  { value: "0.75", label: "0.75 Ton" },
  { value: "1", label: "1 Ton" },
  { value: "1.5", label: "1.5 Ton" },
  { value: "2", label: "2 Ton" },
];

const STAR_OPTIONS = [3, 4, 5];

const TYPE_OPTIONS = [
  { value: "split", label: "Split" },
  { value: "window", label: "Window" },
  { value: "inverter", label: "Inverter" },
  { value: "portable", label: "Portable" },
];

type FilterState = {
  capacity: string;
  stars: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
};

const DEFAULT_FILTERS: FilterState = {
  capacity: "",
  stars: "",
  type: "",
  minPrice: "",
  maxPrice: "100000",
  inStock: false,
};

export function ACFilterSidebar({
  onApply,
}: {
  onApply?: () => void;
} = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] =
    useState<FilterState>(() =>
      getFiltersFromParams(searchParams),
    );

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

  const updateURL = useCallback(
    (nextFilters: FilterState) => {
      const params = new URLSearchParams();

      if (nextFilters.capacity) {
        params.set(
          "capacity",
          nextFilters.capacity,
        );
      }

      if (nextFilters.stars) {
        params.set(
          "stars",
          nextFilters.stars,
        );
      }

      if (nextFilters.type) {
        params.set(
          "type",
          nextFilters.type,
        );
      }

      if (nextFilters.minPrice) {
        params.set(
          "minPrice",
          nextFilters.minPrice,
        );
      }

      if (
        nextFilters.maxPrice &&
        nextFilters.maxPrice !== "100000"
      ) {
        params.set(
          "maxPrice",
          nextFilters.maxPrice,
        );
      }

      if (nextFilters.inStock) {
        params.set("inStock", "true");
      }

      params.set("page", "1");

      const query = params.toString();

      router.push(
        query
          ? `?${query}`
          : "?page=1",
      );

      onApply?.();
    },
    [router, onApply],
  );

  const handleFilterChange = <
    K extends keyof FilterState,
  >(
    key: K,
    value: FilterState[K],
  ) => {
    const nextFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(nextFilters);
    updateURL(nextFilters);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);

    router.push(
      "/spare-parts/appliances/ac",
    );

    onApply?.();
  };

  const activeFilterCount =
    [
      filters.capacity,
      filters.stars,
      filters.type,
      filters.minPrice,
      filters.maxPrice !== "100000"
        ? filters.maxPrice
        : "",
      filters.inStock ? "stock" : "",
    ].filter(Boolean).length;

  return (
    <aside className="w-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black text-slate-950">
              Filters
            </h2>

            {activeFilterCount > 0 ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-black text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </div>

          <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
            Narrow down the right AC
          </p>
        </div>

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[9px] font-black text-primary transition-colors hover:bg-primary/[0.06]"
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </button>
        ) : null}
      </div>

      {/* Capacity */}
      <FilterSection
        icon={<Ruler />}
        title="Capacity"
        subtitle="Choose based on room size"
      >
        <div className="grid grid-cols-2 gap-2">
          {CAPACITY_OPTIONS.map(
            (option) => (
              <ChoiceButton
                key={option.value}
                active={
                  filters.capacity ===
                  option.value
                }
                onClick={() =>
                  handleFilterChange(
                    "capacity",
                    filters.capacity ===
                      option.value
                      ? ""
                      : option.value,
                  )
                }
              >
                {option.label}
              </ChoiceButton>
            ),
          )}
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection
        icon={<Star />}
        title="Star rating"
        subtitle="Energy efficiency"
      >
        <div className="space-y-1">
          {STAR_OPTIONS.map(
            (star) => {
              const active =
                filters.stars ===
                String(star);

              return (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    handleFilterChange(
                      "stars",
                      active
                        ? ""
                        : String(star),
                    )
                  }
                  className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-left transition-colors ${
                    active
                      ? "bg-primary/[0.06] text-primary"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {Array.from({
                      length: star,
                    }).map(
                      (_, index) => (
                        <Star
                          key={index}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                        />
                      ),
                    )}

                    <span className="ml-1 text-[10px] font-bold">
                      & above
                    </span>
                  </span>

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200"
                    }`}
                  >
                    {active ? (
                      <Check className="h-3 w-3" />
                    ) : null}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </FilterSection>

      {/* Type */}
      <FilterSection
        icon={<Wind />}
        title="AC type"
        subtitle="Select the installation style"
      >
        <div className="space-y-1">
          {TYPE_OPTIONS.map(
            (option) => {
              const active =
                filters.type ===
                option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleFilterChange(
                      "type",
                      active
                        ? ""
                        : option.value,
                    )
                  }
                  className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-left transition-colors ${
                    active
                      ? "bg-primary/[0.06] text-primary"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-[10px] font-bold">
                    {option.label}
                  </span>

                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-slate-200"
                    }`}
                  >
                    {active ? (
                      <Check className="h-3 w-3" />
                    ) : null}
                  </span>
                </button>
              );
            },
          )}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection
        icon={<CircleDollarSign />}
        title="Price range"
        subtitle="Set your preferred budget"
      >
        <div className="grid grid-cols-2 gap-2">
          <PriceInput
            label="Minimum"
            value={filters.minPrice}
            placeholder="₹0"
            onChange={(value) =>
              handleFilterChange(
                "minPrice",
                value,
              )
            }
          />

          <PriceInput
            label="Maximum"
            value={
              filters.maxPrice ===
              "100000"
                ? ""
                : filters.maxPrice
            }
            placeholder="₹1,00,000"
            onChange={(value) =>
              handleFilterChange(
                "maxPrice",
                value || "100000",
              )
            }
          />
        </div>
      </FilterSection>

      {/* Stock */}
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={() =>
            handleFilterChange(
              "inStock",
              !filters.inStock,
            )
          }
          className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-3.5 transition-colors ${
            filters.inStock
              ? "border-primary/20 bg-primary/[0.05]"
              : "border-slate-200 bg-white hover:bg-slate-50"
          }`}
        >
          <span className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                filters.inStock
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <PackageCheck className="h-4 w-4" />
            </span>

            <span className="text-left">
              <span
                className={`block text-[10px] font-black ${
                  filters.inStock
                    ? "text-primary"
                    : "text-slate-700"
                }`}
              >
                In stock only
              </span>

              <span className="block text-[8px] font-semibold text-slate-400">
                Show currently available ACs
              </span>
            </span>
          </span>

          <span
            className={`relative h-5 w-9 rounded-full transition-colors ${
              filters.inStock
                ? "bg-primary"
                : "bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-1 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
                filters.inStock
                  ? "translate-x-5"
                  : "translate-x-1"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Bottom reassurance */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        <p className="text-[9px] leading-4 text-slate-500">
          Filters are saved in the URL, so you can
          refresh or share this listing without losing
          your selection.
        </p>
      </div>
    </aside>
  );
}

function FilterSection({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-100 px-5 py-5">
      <div className="mb-3.5 flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </span>

        <div className="min-w-0">
          <h3 className="text-[11px] font-black text-slate-900">
            {title}
          </h3>

          <p className="mt-0.5 text-[8px] font-semibold text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

function ChoiceButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-10 rounded-xl border px-2 text-[9px] font-black transition-all ${
        active
          ? "border-primary bg-primary text-white shadow-sm shadow-primary/15"
          : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function PriceInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[8px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </span>

      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
          ₹
        </span>

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          placeholder={placeholder.replace(
            "₹",
            "",
          )}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-6 pr-2 text-[10px] font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
        />
      </div>
    </label>
  );
}

function getFiltersFromParams(
  searchParams: URLSearchParams,
): FilterState {
  return {
    capacity:
      searchParams.get("capacity") || "",
    stars:
      searchParams.get("stars") || "",
    type:
      searchParams.get("type") || "",
    minPrice:
      searchParams.get("minPrice") || "",
    maxPrice:
      searchParams.get("maxPrice") ||
      "100000",
    inStock:
      searchParams.get("inStock") ===
      "true",
  };
}