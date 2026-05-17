"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

const CAPACITY_OPTIONS = [0.75, 1.0, 1.5, 2.0];
const STAR_OPTIONS = [3, 4, 5];
const TYPE_OPTIONS = [
  { value: "split", label: "Split" },
  { value: "window", label: "Window" },
  { value: "inverter", label: "Inverter" },
  { value: "portable", label: "Portable" },
];

export function ACFilterSidebar({ onApply }: { onApply?: () => void } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    capacity: searchParams.get("capacity") || "",
    stars: searchParams.get("stars") || "",
    type: searchParams.get("type") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "100000",
    inStock: searchParams.get("inStock") === "true",
  });

  const updateURL = useCallback(
    (filterState: typeof filters) => {
      const params = new URLSearchParams();

      if (filterState.capacity) params.set("capacity", filterState.capacity);
      if (filterState.stars) params.set("stars", filterState.stars);
      if (filterState.type) params.set("type", filterState.type);
      if (filterState.minPrice) params.set("minPrice", filterState.minPrice);
      if (filterState.maxPrice && filterState.maxPrice !== "100000") {
        params.set("maxPrice", filterState.maxPrice);
      }
      if (filterState.inStock) params.set("inStock", "true");

      params.set("page", "1"); // Reset to first page on filter change
      router.push(`?${params.toString()}`);
    },
    [router],
  );

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
    onApply?.();
  };

  const handleClearFilters = () => {
    const cleared = {
      capacity: "",
      stars: "",
      type: "",
      minPrice: "",
      maxPrice: "100000",
      inStock: false,
    };
    setFilters(cleared);
    router.push("");
  };

  return (
    <aside className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-24 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        <button
          onClick={handleClearFilters}
          className="text-xs text-[#C8102E] hover:text-[#A00826] font-semibold transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Capacity Filter */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">straighten</span>
          Capacity (Tons)
        </h3>
        <div className="space-y-2">
          {CAPACITY_OPTIONS.map((cap) => (
            <label
              key={cap}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
            >
              <input
                type="radio"
                name="capacity"
                value={cap}
                checked={filters.capacity === cap.toString()}
                onChange={(e) =>
                  handleFilterChange(
                    "capacity",
                    e.target.checked ? cap.toString() : "",
                  )
                }
                className="w-4 h-4 text-[#C8102E] cursor-pointer"
              />
              <span className="text-sm text-gray-700 flex-grow">{cap} Ton</span>
            </label>
          ))}
        </div>
      </div>

      {/* Star Rating Filter */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">star</span>
          Star Rating
        </h3>
        <div className="space-y-2">
          {STAR_OPTIONS.map((star) => (
            <label
              key={star}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
            >
              <input
                type="radio"
                name="stars"
                value={star}
                checked={filters.stars === star.toString()}
                onChange={(e) =>
                  handleFilterChange(
                    "stars",
                    e.target.checked ? star.toString() : "",
                  )
                }
                className="w-4 h-4 text-[#C8102E] cursor-pointer"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1">
                {Array.from({ length: star }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-xs icon-filled text-amber-500">star</span>
                ))}
                <span className="ml-1">& above</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* AC Type Filter */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">ac_unit</span>
          AC Type
        </h3>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors"
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={filters.type === option.value}
                onChange={(e) =>
                  handleFilterChange(
                    "type",
                    e.target.checked ? option.value : "",
                  )
                }
                className="w-4 h-4 text-[#C8102E] cursor-pointer"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">
            price_change
          </span>
          Price Range (₹)
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-600 block mb-1">Minimum</label>
            <input
              type="number"
              placeholder="₹0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange("minPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 block mb-1">Maximum</label>
            <input
              type="number"
              placeholder="₹100000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
            />
          </div>
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="mb-6">
        <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange("inStock", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#C8102E] cursor-pointer"
          />
          <span className="text-sm text-gray-700 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              local_shipping
            </span>
            In Stock Only
          </span>
        </label>
      </div>
    </aside>
  );
}
