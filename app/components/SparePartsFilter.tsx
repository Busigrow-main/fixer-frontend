"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface SparePartsFilterProps {
  categories: string[];
  initialCategory?: string;
  initialQuery?: string;
}

export default function SparePartsFilter({
  categories = [],
  initialCategory = "All",
  initialQuery = "",
}: SparePartsFilterProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);

  const applyFilters = (newCategory: string, newQuery: string) => {
    const params = new URLSearchParams();
    if (newQuery) params.set("q", newQuery);
    if (newCategory && newCategory !== "All") params.set("category", newCategory);
    params.set("page", "1"); // Reset to page 1 on filter
    
    router.push(`/spare-parts?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(category, query);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCategory(val);
    applyFilters(val, query);
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-3xl border border-outline shadow-xl shadow-black/5 mb-8">
      <form
        onSubmit={handleSearch}
        className="flex flex-col md:flex-row gap-4 items-center"
      >
        <div className="relative flex-1 w-full relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by part name or part number..."
            className="w-full h-14 pl-12 pr-4 rounded-xl border border-outline bg-surface-container-lowest outline-none focus:border-primary transition-colors text-on-surface"
          />
        </div>

        <div className="w-full md:w-64 relative">
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full h-14 pl-4 pr-10 appearance-none rounded-xl border border-outline bg-surface-container-lowest outline-none focus:border-primary transition-colors text-on-surface font-medium cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
            expand_more
          </span>
        </div>

        <button
          type="submit"
          className="w-full md:w-auto h-14 px-8 rounded-xl bg-primary text-on-primary font-black uppercase tracking-wider hover:bg-primary/90 hover:scale-[0.98] transition-all"
        >
          Search
        </button>
      </form>
    </div>
  );
}
