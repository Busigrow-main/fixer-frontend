"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, Tag, Layers, X, TrendingUp } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { fetchSuggestions } from "@/app/lib/spareParts";

export interface SearchSuggestion {
  type: "part" | "category" | "brand";
  title: string;
  subtitle: string;
  sku?: string;
  slug?: string;
  appliance?: string;
  price?: number;
  count?: number;
}

interface SearchBarProps {
  /** Visual variant */
  variant?: "hero" | "compact";
  /** Placeholder text */
  placeholder?: string;
  /** Initial value */
  defaultValue?: string;
  /** Extra classes on the wrapper */
  className?: string;
  /** Called when user submits (hits Enter or clicks Search) */
  onSearch?: (query: string) => void;
  /** Called when a suggestion is selected — if omitted, default navigation is used */
  onSelect?: (suggestion: SearchSuggestion) => void;
  /** API base URL — defaults to NEXT_PUBLIC_API_URL */
  apiUrl?: string;
}

const DEBOUNCE_MS = 250;

export default function SearchBar({
  variant = "compact",
  placeholder = "Search for spare parts…",
  defaultValue = "",
  className,
  onSearch,
  onSelect,
  apiUrl,
}: SearchBarProps) {
  const router = useRouter();
  const resolvedApiUrl =
    apiUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000/api/v1";

  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<{
    parts: SearchSuggestion[];
    categories: SearchSuggestion[];
    brands: SearchSuggestion[];
  } | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Flatten all suggestion groups into a single navigable list
  const allSuggestions: SearchSuggestion[] = suggestions
    ? [...suggestions.parts, ...suggestions.categories, ...suggestions.brands]
    : [];

  // ── Fetch suggestions with debounce ──────────────────────────────
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query || query.length < 1) {
      setSuggestions(null);
      setOpen(false);
      setActiveIdx(-1);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchSuggestions(resolvedApiUrl, query);
        setSuggestions(data);
        setOpen(true);
        setActiveIdx(-1);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, resolvedApiUrl]);

  // ── Click-outside to close ────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Navigation helper ─────────────────────────────────────────────
  const navigateTo = useCallback(
    (s: SearchSuggestion) => {
      setOpen(false);
      setQuery(s.title);

      if (onSelect) {
        onSelect(s);
        return;
      }

      if (s.type === "part" && s.sku) {
        router.push(`/spare-parts/${s.sku}`);
      } else if (s.type === "category") {
        const params = new URLSearchParams();
        if (s.appliance) params.set("type", s.appliance);
        if (s.slug) params.set("cat", s.slug);
        router.push(`/spare-parts?${params.toString()}`);
      } else if (s.type === "brand") {
        router.push(
          `/spare-parts?q=${encodeURIComponent(s.title)}&brand=${s.slug}`,
        );
      }
    },
    [onSelect, router],
  );

  const submitSearch = useCallback(
    (q: string) => {
      if (!q.trim()) return;
      setOpen(false);
      if (onSearch) {
        onSearch(q.trim());
      } else {
        router.push(`/spare-parts?q=${encodeURIComponent(q.trim())}`);
      }
    },
    [onSearch, router],
  );

  // ── Keyboard navigation ───────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || allSuggestions.length === 0) {
      if (e.key === "Enter") submitSearch(query);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, allSuggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && allSuggestions[activeIdx]) {
        navigateTo(allSuggestions[activeIdx]);
      } else {
        submitSearch(query);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  // ── Icon per suggestion type ──────────────────────────────────────
  const SuggIcon = ({ type }: { type: string }) => {
    if (type === "part")
      return (
        <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-primary" />
        </div>
      );
    if (type === "category")
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
          <Layers className="w-4 h-4 text-emerald-600" />
        </div>
      );
    return (
      <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
        <Tag className="w-4 h-4 text-amber-600" />
      </div>
    );
  };

  // Global flat index tracker for keyboard highlight
  let globalIdx = 0;

  const renderGroup = (
    label: string,
    items: SearchSuggestion[],
    startIdx: number,
  ) => {
    if (!items.length) return null;
    return (
      <div>
        <p className="px-4 pt-3 pb-1 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          {label}
        </p>
        {items.map((s, i) => {
          const flatIdx = startIdx + i;
          const isActive = flatIdx === activeIdx;
          return (
            <button
              key={`${s.type}-${i}`}
              onMouseDown={(e) => {
                e.preventDefault(); // prevent input blur before click registers
                navigateTo(s);
              }}
              onMouseEnter={() => setActiveIdx(flatIdx)}
              className={cn(
                "w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors",
                isActive ? "bg-zinc-50" : "hover:bg-zinc-50/60",
              )}
            >
              <SuggIcon type={s.type} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-zinc-900 truncate">
                  {s.title}
                </p>
                <p className="text-xs text-zinc-500 truncate">{s.subtitle}</p>
              </div>
              {s.type === "part" && s.price ? (
                <span className="text-xs font-black text-primary shrink-0">
                  ₹{Math.round(s.price / 100)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  };

  const hasResults =
    suggestions &&
    (suggestions.parts.length ||
      suggestions.categories.length ||
      suggestions.brands.length);

  // ── HERO variant ──────────────────────────────────────────────────
  if (variant === "hero") {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="flex items-center bg-zinc-100 rounded-xl px-4 h-14 gap-3">
          <Search
            className={cn(
              "w-5 h-5 shrink-0 transition-colors",
              query ? "text-primary" : "text-zinc-400",
            )}
          />
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 1 && setOpen(true)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-zinc-400 text-zinc-900"
          />
          {loading && (
            <span className="w-4 h-4 border-2 border-zinc-300 border-t-primary rounded-full animate-spin shrink-0" />
          )}
          {query && !loading && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                setQuery("");
                setSuggestions(null);
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="text-zinc-400 hover:text-zinc-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50"
          >
            {hasResults ? (
              <>
                {renderGroup("Parts", suggestions!.parts, 0)}
                {renderGroup(
                  "Categories",
                  suggestions!.categories,
                  suggestions!.parts.length,
                )}
                {renderGroup(
                  "Brands",
                  suggestions!.brands,
                  suggestions!.parts.length + suggestions!.categories.length,
                )}
                <div className="px-4 py-3 border-t border-zinc-50">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      submitSearch(query);
                    }}
                    className="w-full h-10 bg-primary/5 hover:bg-primary/10 text-primary font-black text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search all results for &quot;{query}&quot;
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-8 text-center">
                <TrendingUp className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-zinc-500">
                  No results found for &quot;{query}&quot;
                </p>
                <p className="text-xs text-zinc-400 mt-1">
                  Try a different keyword or browse categories below
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── COMPACT variant (sticky header inside spare-parts page) ───────
  return (
    <div className={cn("relative w-full", className)}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitSearch(query);
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 1 && setOpen(true)}
          className="w-full h-12 pl-11 pr-12 bg-zinc-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm text-zinc-900 placeholder:font-medium placeholder:text-zinc-400"
        />
        {loading && (
          <span className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-zinc-300 border-t-primary rounded-full animate-spin" />
        )}
        {query && !loading && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setQuery("");
              setSuggestions(null);
              setOpen(false);
              inputRef.current?.focus();
              if (onSearch) onSearch("");
              else router.push("/spare-parts");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {hasResults ? (
            <>
              {renderGroup("Parts", suggestions!.parts, 0)}
              {renderGroup(
                "Categories",
                suggestions!.categories,
                suggestions!.parts.length,
              )}
              {renderGroup(
                "Brands",
                suggestions!.brands,
                suggestions!.parts.length + suggestions!.categories.length,
              )}
              <div className="px-4 py-3 border-t border-zinc-50">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    submitSearch(query);
                  }}
                  className="w-full h-9 bg-primary/5 hover:bg-primary/10 text-primary font-black text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3 h-3" />
                  See all results for &quot;{query}&quot;
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-bold text-zinc-500">
                No matches found
              </p>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  submitSearch(query);
                }}
                className="mt-2 text-xs text-primary font-bold hover:underline"
              >
                Search anyway →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
