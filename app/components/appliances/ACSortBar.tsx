"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First", icon: "new_releases" },
  { value: "price_asc", label: "Price: Low to High", icon: "trending_down" },
  { value: "price_desc", label: "Price: High to Low", icon: "trending_up" },
  { value: "rating_desc", label: "Highest Rated", icon: "star_rate" },
];

export function ACSortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    params.set("page", "1"); // Reset to first page when sorting
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
      <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">Sort by:</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
              currentSort === option.value
                ? "bg-[#C8102E] text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {option.icon}
            </span>
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.label.split(":")[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
