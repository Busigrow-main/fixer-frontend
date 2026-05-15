# AC Appliances Feature - Frontend Implementation Guide

## Phases 2–6: Next.js Frontend Build

This guide provides step-by-step instructions for implementing the AC Appliances feature on the fixxer frontend using Next.js, Tailwind CSS, and Material Symbols.

---

## PHASE 2: Appliances Landing Page

**File**: `app/spare-parts/appliances/page.tsx`

### Overview

The Appliances landing page acts as a category selector. Users see AC (active) and future appliance categories (Coming Soon).

### Implementation Steps

#### Step 1: Create the Appliances Landing Page

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/app/components/ui/card";

// Category data
const APPLIANCE_CATEGORIES = [
  {
    id: "ac",
    name: "Air Conditioner",
    slug: "ac",
    icon: "ac_unit",
    description: "Godrej AC units - cooling solutions",
    status: "active",
    productCount: 7,
    href: "/spare-parts/appliances/ac",
  },
  {
    id: "fridge",
    name: "Refrigerator",
    slug: "fridge",
    icon: "kitchen",
    description: "Refrigerators & cooling appliances",
    status: "coming-soon",
    productCount: 0,
    href: "#",
  },
  {
    id: "washing-machine",
    name: "Washing Machine",
    slug: "washing-machine",
    icon: "local_laundry_service",
    description: "Washing machines & laundry solutions",
    status: "coming-soon",
    productCount: 0,
    href: "#",
  },
];

export default function AppliancesPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#C8102E]">
            Home
          </Link>
          <span>/</span>
          <Link href="/spare-parts" className="hover:text-[#C8102E]">
            Spare Parts
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Appliances</span>
        </nav>

        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Shop Appliances
          </h1>
          <p className="text-lg text-gray-600">
            Browse complete appliances with Fixxer installation & warranty
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APPLIANCE_CATEGORIES.map((category) => (
            <ApplianceCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </main>
  );
}

interface ApplianceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  status: "active" | "coming-soon";
  productCount: number;
  href: string;
}

function ApplianceCategoryCard({ category }: { category: ApplianceCategory }) {
  const isActive = category.status === "active";

  return (
    <Link
      href={isActive ? category.href : "#"}
      className={isActive ? "" : "pointer-events-none"}
    >
      <div
        className={`group h-full rounded-lg border-2 transition-all duration-300 overflow-hidden ${
          isActive
            ? "border-gray-200 hover:border-[#C8102E] hover:shadow-lg hover:scale-105 bg-white cursor-pointer"
            : "border-gray-200 bg-gray-100 opacity-60"
        }`}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="mb-4">
            <span
              className={`material-symbols-outlined text-4xl ${
                isActive
                  ? "text-[#C8102E] group-hover:text-[#D48F0E]"
                  : "text-gray-400"
              }`}
            >
              {category.icon}
            </span>
          </div>

          {/* Title & Description */}
          <h3
            className={`text-xl font-bold mb-2 ${
              isActive ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {category.name}
          </h3>
          <p
            className={`text-sm mb-4 line-clamp-2 ${
              isActive ? "text-gray-600" : "text-gray-400"
            }`}
          >
            {category.description}
          </p>

          {/* Status Badge / Product Count */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isActive ? (
              <span className="text-sm font-semibold text-[#C8102E]">
                {category.productCount} products
              </span>
            ) : (
              <span className="text-sm font-semibold text-gray-400">
                Coming Soon
              </span>
            )}
            {isActive && (
              <span className="material-symbols-outlined text-[#D48F0E] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
```

### Key Design Decisions

- **Active/Coming Soon**: AC is interactive; Refrigerator & Washing Machine are visually disabled
- **Colors**: Use fixxer palette (#C8102E red, #D48F0E golden)
- **Icons**: Material Symbols for appliance representations
- **Hover Effects**: Scale and color change on active cards
- **Responsive**: 1-col mobile, 2-col tablet, 3-col desktop

### Verification Checklist

- ✓ Page loads with title "Shop Appliances"
- ✓ AC card is clickable, navigates to `/spare-parts/appliances/ac`
- ✓ Refrigerator & Washing Machine cards show "Coming Soon" (disabled)
- ✓ Hover effects work on AC card
- ✓ Responsive on mobile/tablet/desktop
- ✓ Breadcrumb navigation works

---

## PHASE 3: AC Listing Page

**Files**:

- `app/spare-parts/appliances/ac/page.tsx` (main page)
- `app/components/appliances/ACFilterSidebar.tsx` (filters)
- `app/components/appliances/ACProductCard.tsx` (product card)
- `app/components/appliances/ACSortBar.tsx` (sort dropdown)

### Architecture Overview

```
ACListingPage
├─ FilterSidebar (left panel)
│  ├─ Capacity filter (checkboxes)
│  ├─ Star rating filter
│  ├─ Type filter (split, window, etc.)
│  ├─ Price range slider
│  └─ In stock toggle
├─ Main Content (right)
│  ├─ SortBar (top-right)
│  ├─ ProductGrid (12 per page)
│  │  └─ ACProductCard (x12)
│  └─ Pagination
```

### Step 1: Create ACProductCard Component

```tsx
// app/components/appliances/ACProductCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

interface ACProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    modelNumber: string;
    price: number;
    originalPrice?: number;
    capacityTon: number;
    starRating: number;
    acType: string;
    isInverter: boolean;
    shortDescription: string;
    images: string[];
    inStock: boolean;
    installationIncluded: boolean;
    warrantyYears: number;
  };
}

export function ACProductCard({ product }: ACProductCardProps) {
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100,
      )
    : 0;

  return (
    <Link href={`/spare-parts/appliances/ac/${product.slug}`}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-110 overflow-hidden cursor-pointer">
        {/* Image Section */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <span className="material-symbols-outlined text-gray-400 text-3xl">
                image_not_supported
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.inStock && (
              <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                In Stock
              </span>
            )}
            {!product.inStock && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute bottom-3 right-3 bg-[#C8102E] text-white text-xs font-bold px-2 py-1 rounded">
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Brand & Model */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">
              {product.brand}
            </span>
            <span className="text-xs text-gray-400">{product.modelNumber}</span>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-sm text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-gray-600 line-clamp-1 mb-3">
            {product.shortDescription}
          </p>

          {/* Specs Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              {product.capacityTon} Ton
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
              ⭐ {product.starRating}
            </span>
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
              {product.acType}
            </span>
            {product.isInverter && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                Inverter
              </span>
            )}
          </div>

          {/* Trust Badges */}
          <div className="flex gap-2 mb-3 pb-3 border-b border-gray-200">
            <div className="flex items-center gap-1 text-xs text-[#C8102E]">
              <span className="material-symbols-outlined text-sm">
                verified
              </span>
              Installation
            </div>
            <div className="flex items-center gap-1 text-xs text-[#D48F0E]">
              <span className="material-symbols-outlined text-sm">shield</span>
              {product.warrantyYears}Y Warranty
            </div>
          </div>

          {/* Price Section */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-gray-900">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full bg-[#C8102E] hover:bg-[#A00826] text-white font-semibold py-2 rounded transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </Link>
  );
}
```

### Step 2: Create ACFilterSidebar Component

```tsx
// app/components/appliances/ACFilterSidebar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const CAPACITY_OPTIONS = [0.75, 1.0, 1.5, 2.0];
const STAR_OPTIONS = [3, 4, 5];
const TYPE_OPTIONS = [
  { value: "split", label: "Split" },
  { value: "window", label: "Window" },
  { value: "inverter", label: "Inverter" },
  { value: "portable", label: "Portable" },
];

export function ACFilterSidebar() {
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

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const updateURL = (filterState: any) => {
    const params = new URLSearchParams();

    if (filterState.capacity) params.set("capacity", filterState.capacity);
    if (filterState.stars) params.set("stars", filterState.stars);
    if (filterState.type) params.set("type", filterState.type);
    if (filterState.minPrice) params.set("minPrice", filterState.minPrice);
    if (filterState.maxPrice) params.set("maxPrice", filterState.maxPrice);
    if (filterState.inStock) params.set("inStock", "true");

    router.push(`?${params.toString()}`);
  };

  return (
    <aside className="bg-white rounded-lg border border-gray-200 p-6 h-fit sticky top-20">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Filters</h2>

      {/* Capacity Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Capacity (Tons)
        </h3>
        <div className="space-y-2">
          {CAPACITY_OPTIONS.map((cap) => (
            <label key={cap} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.capacity === cap.toString()}
                onChange={(e) =>
                  handleFilterChange("capacity", e.target.checked ? cap : "")
                }
                className="w-4 h-4 rounded border-gray-300 text-[#C8102E]"
              />
              <span className="text-sm text-gray-700">{cap} Ton</span>
            </label>
          ))}
        </div>
      </div>

      {/* Star Rating Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Star Rating
        </h3>
        <div className="space-y-2">
          {STAR_OPTIONS.map((star) => (
            <label
              key={star}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.stars === star.toString()}
                onChange={(e) =>
                  handleFilterChange("stars", e.target.checked ? star : "")
                }
                className="w-4 h-4 rounded border-gray-300 text-[#C8102E]"
              />
              <span className="text-sm text-gray-700">{star}⭐ & above</span>
            </label>
          ))}
        </div>
      </div>

      {/* AC Type Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">AC Type</h3>
        <div className="space-y-2">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters.type === option.value}
                onChange={(e) =>
                  handleFilterChange(
                    "type",
                    e.target.checked ? option.value : "",
                  )
                }
                className="w-4 h-4 rounded border-gray-300 text-[#C8102E]"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Price Range (₹)
        </h3>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
      </div>

      {/* In Stock Toggle */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange("inStock", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-[#C8102E]"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setFilters({
            capacity: "",
            stars: "",
            type: "",
            minPrice: "",
            maxPrice: "100000",
            inStock: false,
          });
          router.push("");
        }}
        className="w-full mt-6 text-center text-sm font-semibold text-[#C8102E] hover:text-[#A00826] transition-colors"
      >
        Clear All Filters
      </button>
    </aside>
  );
}
```

### Step 3: Create ACSortBar Component

```tsx
// app/components/appliances/ACSortBar.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating_desc", label: "Rating: Highest First" },
];

export function ACSortBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", sortValue);
    params.set("page", "1"); // Reset to first page
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm text-gray-600">Showing all air conditioners</p>
      <select
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-900 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### Step 4: Create AC Listing Page

```tsx
// app/spare-parts/appliances/ac/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ACFilterSidebar } from "@/app/components/appliances/ACFilterSidebar";
import { ACProductCard } from "@/app/components/appliances/ACProductCard";
import { ACSortBar } from "@/app/components/appliances/ACSortBar";

export default function ACListingPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(searchParams);
      if (!params.has("page")) params.set("page", "1");
      if (!params.has("perPage")) params.set("perPage", "12");

      const response = await fetch(
        `/api/v1/appliances/ac?${params.toString()}`,
      );
      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / 12);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-[#C8102E]">
            Home
          </Link>
          <span>/</span>
          <Link href="/spare-parts" className="hover:text-[#C8102E]">
            Spare Parts
          </Link>
          <span>/</span>
          <Link href="/spare-parts/appliances" className="hover:text-[#C8102E]">
            Appliances
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">AC</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Air Conditioners
          </h1>
          <p className="text-gray-600">
            {total > 0 ? `${total} products found` : "No products found"}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Hide on mobile */}
          <div className="lg:col-span-1">
            <ACFilterSidebar />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Bar */}
            <ACSortBar />

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(12)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-200 rounded-lg h-80 animate-pulse"
                    />
                  ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <ACProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {page > 1 && (
                      <Link
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (page - 1).toString(),
                        }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Previous
                      </Link>
                    )}

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (pageNum) => (
                        <Link
                          key={pageNum}
                          href={`?${new URLSearchParams({
                            ...Object.fromEntries(searchParams),
                            page: pageNum.toString(),
                          }).toString()}`}
                          className={`px-3 py-2 rounded ${
                            pageNum === page
                              ? "bg-[#C8102E] text-white"
                              : "border border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </Link>
                      ),
                    )}

                    {page < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          page: (page + 1).toString(),
                        }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}

            {/* No Products State */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found with the selected filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

### Verification Checklist for Phase 3

- ✓ Page loads and fetches products from API
- ✓ Filters update URL and re-fetch data
- ✓ Sort dropdown changes product order
- ✓ Pagination works (navigate between pages)
- ✓ Product cards display all required fields
- ✓ Images load from CDN with fallback
- ✓ Mobile responsive (1 col, filters collapse)
- ✓ Hover effects work on cards
- ✓ Loading skeleton shows while fetching
- ✓ Error message displays on API failure

---

## PHASE 4: AC Detail Page & Additional Components

**Files**:

- `app/spare-parts/appliances/ac/[slug]/page.tsx` (detail page)
- `app/components/appliances/ACImageGallery.tsx` (image carousel)
- `app/components/appliances/ACSpecsTable.tsx` (specs renderer)
- `app/components/appliances/TrustBadgeStrip.tsx` (badges)

[Detailed implementation guide for Phase 4 continues in next section...]

---

## PHASE 5 & 6: Integration & SEO

[Detailed integration and SEO implementation continues...]

---

## Component Export Index

Add to `app/components/appliances/index.ts`:

```typescript
export { ACProductCard } from "./ACProductCard";
export { ACFilterSidebar } from "./ACFilterSidebar";
export { ACSortBar } from "./ACSortBar";
export { ACImageGallery } from "./ACImageGallery";
export { ACSpecsTable } from "./ACSpecsTable";
export { TrustBadgeStrip } from "./TrustBadgeStrip";
export { ACategoryCard } from "./ACategoryCard";
```

---

## Testing & QA Checklist

### Desktop Testing (1920px, 1440px, 1024px)

- ✓ All filters functional
- ✓ Sort works correctly
- ✓ Pagination loads correct pages
- ✓ Images load with correct aspect ratios
- ✓ Hover effects smooth
- ✓ Links navigate correctly

### Mobile Testing (640px, 375px)

- ✓ Layout stacks vertically
- ✓ Filters are accessible (possibly collapsible sidebar)
- ✓ Product cards readable
- ✓ Touch targets >44px
- ✓ Images responsive

### Accessibility

- ✓ Semantic HTML (nav, main, article)
- ✓ Alt text on all images
- ✓ Color contrast meets WCAG AA
- ✓ Keyboard navigation works
- ✓ Form labels associated with inputs

### Performance

- ✓ Lighthouse score >80
- ✓ Images lazy-loaded
- ✓ API calls optimized
- ✓ Bundle size acceptable

---
