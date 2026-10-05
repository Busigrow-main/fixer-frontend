"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Check,
  CircleDollarSign,
  Filter,
  PackageCheck,
  RotateCcw,
  Ruler,
  SlidersHorizontal,
  Star,
  Wind,
  X,
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

interface FilterState {
  capacity: string;
  stars: string;
  type: string;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  capacity: "",
  stars: "",
  type: "",
  minPrice: "",
  maxPrice: "100000",
  inStock: false,
};

export function ACFilterDrawer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);

  const [filters, setFilters] =
    useState<FilterState>(() =>
      getFiltersFromParams(searchParams),
    );

  useEffect(() => {
    setFilters(getFiltersFromParams(searchParams));
  }, [searchParams]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const activeFilterCount = getActiveFilterCount(
    filters,
  );

  const updateFilter = <
    K extends keyof FilterState,
  >(
    key: K,
    value: FilterState[K],
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (filters.capacity) {
      params.set(
        "capacity",
        filters.capacity,
      );
    }

    if (filters.stars) {
      params.set(
        "stars",
        filters.stars,
      );
    }

    if (filters.type) {
      params.set(
        "type",
        filters.type,
      );
    }

    if (filters.minPrice) {
      params.set(
        "minPrice",
        filters.minPrice,
      );
    }

    if (
      filters.maxPrice &&
      filters.maxPrice !== "100000"
    ) {
      params.set(
        "maxPrice",
        filters.maxPrice,
      );
    }

    if (filters.inStock) {
      params.set(
        "inStock",
        "true",
      );
    }

    params.set("page", "1");

    const query = params.toString();

    router.push(
      query
        ? `/spare-parts/appliances/ac?${query}`
        : "/spare-parts/appliances/ac",
    );

    setOpen(false);
  };

  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);

    router.push(
      "/spare-parts/appliances/ac",
    );

    setOpen(false);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 text-left shadow-sm transition-colors hover:border-primary/30"
      >
        <span className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
            <SlidersHorizontal className="h-4 w-4" />
          </span>

          <span>
            <span className="block text-[10px] font-black text-slate-900">
              Filter ACs
            </span>

            <span className="block text-[8px] font-semibold text-slate-400">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${
                    activeFilterCount === 1
                      ? ""
                      : "s"
                  } applied`
                : "Capacity, price, type & more"}
            </span>
          </span>
        </span>

        <span className="flex items-center gap-1.5">
          {activeFilterCount > 0 ? (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-black text-white">
              {activeFilterCount}
            </span>
          ) : null}

          <Filter className="h-4 w-4 text-slate-400" />
        </span>
      </button>

      {/* Backdrop + sheet */}
      {open ? (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="AC filters"
            className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
          >
            {/* Sheet header */}
            <div className="shrink-0 border-b border-slate-100 px-4 pb-3 pt-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-950">
                      Filter ACs
                    </h2>

                    {activeFilterCount > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[9px] font-black text-white">
                        {activeFilterCount}
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    Find the right AC faster
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() =>
                    setOpen(false)
                  }
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scrollable filters */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="divide-y divide-slate-100">
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
                            updateFilter(
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
                          <OptionRow
                            key={star}
                            active={active}
                            onClick={() =>
                              updateFilter(
                                "stars",
                                active
                                  ? ""
                                  : String(
                                      star,
                                    ),
                              )
                            }
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
                          </OptionRow>
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
                  <div className="grid grid-cols-2 gap-2">
                    {TYPE_OPTIONS.map(
                      (option) => (
                        <ChoiceButton
                          key={option.value}
                          active={
                            filters.type ===
                            option.value
                          }
                          onClick={() =>
                            updateFilter(
                              "type",
                              filters.type ===
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

                {/* Price */}
                <FilterSection
                  icon={<CircleDollarSign />}
                  title="Price range"
                  subtitle="Set your preferred budget"
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <PriceInput
                      label="Minimum"
                      value={
                        filters.minPrice
                      }
                      placeholder="0"
                      onChange={(value) =>
                        updateFilter(
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
                      placeholder="1,00,000"
                      onChange={(value) =>
                        updateFilter(
                          "maxPrice",
                          value ||
                            "100000",
                        )
                      }
                    />
                  </div>
                </FilterSection>

                {/* Stock */}
                <div className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      updateFilter(
                        "inStock",
                        !filters.inStock,
                      )
                    }
                    className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-3.5 transition-colors ${
                      filters.inStock
                        ? "border-primary/20 bg-primary/[0.05]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
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
                              : "text-slate-800"
                          }`}
                        >
                          In stock only
                        </span>

                        <span className="mt-0.5 block text-[8px] font-semibold text-slate-400">
                          Show ACs currently available
                        </span>
                      </span>
                    </span>

                    <span
                      className={`relative h-6 w-11 rounded-full transition-colors ${
                        filters.inStock
                          ? "bg-primary"
                          : "bg-slate-200"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                          filters.inStock
                            ? "translate-x-6"
                            : "translate-x-1"
                        }`}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-[10px] font-black text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Clear all
                </button>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="inline-flex min-h-12 flex-[1.5] items-center justify-center gap-1.5 rounded-xl bg-primary text-[10px] font-black text-white shadow-lg shadow-primary/15 transition-colors hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" />
                  Show ACs
                  {activeFilterCount > 0
                    ? ` (${activeFilterCount})`
                    : ""}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
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
    <section className="px-4 py-5">
      <div className="mb-3.5 flex items-start gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </span>

        <div>
          <h3 className="text-[11px] font-black text-slate-950">
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
      className={`min-h-11 rounded-xl border px-3 text-[10px] font-black transition-all active:scale-[0.98] ${
        active
          ? "border-primary bg-primary text-white shadow-sm shadow-primary/15"
          : "border-slate-200 bg-white text-slate-600 hover:border-primary/30 hover:text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function OptionRow({
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
      className={`flex min-h-11 w-full items-center justify-between rounded-xl px-3 text-left transition-colors ${
        active
          ? "bg-primary/[0.06] text-primary"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {children}

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
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
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
          ₹
        </span>

        <input
          type="number"
          min="0"
          inputMode="numeric"
          value={value}
          placeholder={placeholder}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-7 pr-2 text-[10px] font-bold text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
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

function getActiveFilterCount(
  filters: FilterState,
) {
  return [
    filters.capacity,
    filters.stars,
    filters.type,
    filters.minPrice,
    filters.maxPrice !== "100000"
      ? filters.maxPrice
      : "",
    filters.inStock ? "stock" : "",
  ].filter(Boolean).length;
}