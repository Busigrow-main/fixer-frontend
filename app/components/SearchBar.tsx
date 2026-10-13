"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Package,
  Tag,
  Layers,
  X,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
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
  variant?: "hero" | "compact";
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  onSearch?: (query: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  apiUrl?: string;
}

const DEBOUNCE_MS = 250;

type SuggestionGroups = {
  parts: SearchSuggestion[];
  categories: SearchSuggestion[];
  brands: SearchSuggestion[];
};

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
  const listboxId = useId();

  const resolvedApiUrl =
    apiUrl ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api";

  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] =
    useState<SuggestionGroups | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const allSuggestions: SearchSuggestion[] = suggestions
    ? [
        ...suggestions.parts,
        ...suggestions.categories,
        ...suggestions.brands,
      ]
    : [];

  const hasResults = allSuggestions.length > 0;

  const clearSearch = useCallback(
    (focusInput = true) => {
      setQuery("");
      setSuggestions(null);
      setOpen(false);
      setActiveIdx(-1);

      if (onSearch) {
        onSearch("");
      } else if (variant === "compact") {
        router.push("/spare-parts");
      }

      if (focusInput) {
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [onSearch, router, variant],
  );

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const trimmed = query.trim();

    if (!trimmed) {
      setSuggestions(null);
      setOpen(false);
      setActiveIdx(-1);
      setLoading(false);
      return;
    }

    if (trimmed.length < 1) {
      setSuggestions(null);
      setOpen(false);
      return;
    }

    const requestId = ++requestIdRef.current;

    timerRef.current = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await fetchSuggestions(
          resolvedApiUrl,
          trimmed,
        );

        if (requestId !== requestIdRef.current) return;

        if (data) {
          setSuggestions({
            parts: Array.isArray(data.parts) ? data.parts : [],
            categories: Array.isArray(data.categories)
              ? data.categories
              : [],
            brands: Array.isArray(data.brands) ? data.brands : [],
          });
        } else {
          setSuggestions({
            parts: [],
            categories: [],
            brands: [],
          });
        }

        setOpen(true);
        setActiveIdx(-1);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [query, resolvedApiUrl]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        dropdownRef.current?.contains(target) ||
        inputRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
      setActiveIdx(-1);
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const navigateTo = useCallback(
    (suggestion: SearchSuggestion) => {
      setOpen(false);
      setActiveIdx(-1);
      setQuery(suggestion.title);

      if (onSelect) {
        onSelect(suggestion);
        return;
      }

      if (suggestion.type === "part" && suggestion.sku) {
        router.push(
          `/spare-parts/${encodeURIComponent(suggestion.sku)}`,
        );
        return;
      }

      if (suggestion.type === "category") {
        const params = new URLSearchParams();

        if (suggestion.appliance) {
          params.set("type", suggestion.appliance);
        }

        if (suggestion.slug) {
          params.set("cat", suggestion.slug);
        }

        const queryString = params.toString();

        router.push(
          `/spare-parts${queryString ? `?${queryString}` : ""}`,
        );
        return;
      }

      if (suggestion.type === "brand") {
        const params = new URLSearchParams();

        params.set("q", suggestion.title);

        if (suggestion.slug) {
          params.set("brand", suggestion.slug);
        }

        router.push(`/spare-parts?${params.toString()}`);
      }
    },
    [onSelect, router],
  );

  const submitSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();

      if (!trimmed) return;

      setOpen(false);
      setActiveIdx(-1);

      if (onSearch) {
        onSearch(trimmed);
      } else {
        router.push(
          `/spare-parts?q=${encodeURIComponent(trimmed)}`,
        );
      }
    },
    [onSearch, router],
  );

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActiveIdx(-1);
      return;
    }

    if (event.key === "ArrowDown") {
      if (!open || allSuggestions.length === 0) return;

      event.preventDefault();

      setActiveIdx((current) =>
        current >= allSuggestions.length - 1
          ? 0
          : current + 1,
      );

      return;
    }

    if (event.key === "ArrowUp") {
      if (!open || allSuggestions.length === 0) return;

      event.preventDefault();

      setActiveIdx((current) =>
        current <= 0
          ? allSuggestions.length - 1
          : current - 1,
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (
        open &&
        activeIdx >= 0 &&
        allSuggestions[activeIdx]
      ) {
        navigateTo(allSuggestions[activeIdx]);
      } else {
        submitSearch(query);
      }
    }
  };

  const handleFocus = () => {
    if (query.trim()) {
      setOpen(true);
    }
  };

  const getSuggestionIcon = (
    type: SearchSuggestion["type"],
  ) => {
    if (type === "part") {
      return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/8 text-primary">
          <Package className="h-4.5 w-4.5" />
        </span>
      );
    }

    if (type === "category") {
      return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          <Layers className="h-4.5 w-4.5" />
        </span>
      );
    }

    return (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Tag className="h-4.5 w-4.5" />
      </span>
    );
  };

  let globalIdx = 0;

  const renderGroup = (
    label: string,
    items: SearchSuggestion[],
  ) => {
    if (!items.length) return null;

    const startIdx = globalIdx;
    globalIdx += items.length;

    return (
      <div className="border-b border-slate-100 last:border-b-0">
        <div className="px-4 pb-2 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
        </div>

        <div className="px-2 pb-2">
          {items.map((suggestion, index) => {
            const flatIdx = startIdx + index;
            const isActive = flatIdx === activeIdx;

            return (
              <button
                key={`${suggestion.type}-${suggestion.sku || suggestion.slug || suggestion.title}-${index}`}
                type="button"
                role="option"
                aria-selected={isActive}
                onMouseDown={(event) => {
                  event.preventDefault();
                  navigateTo(suggestion);
                }}
                onMouseEnter={() => setActiveIdx(flatIdx)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-slate-50"
                    : "hover:bg-slate-50",
                )}
              >
                {getSuggestionIcon(suggestion.type)}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-slate-900">
                    {suggestion.title}
                  </span>

                  <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
                    {suggestion.subtitle}
                  </span>
                </span>

                {suggestion.type === "part" &&
                typeof suggestion.price === "number" &&
                suggestion.price > 0 ? (
                  <span className="shrink-0 text-xs font-black text-primary">
                    ₹{Math.round(suggestion.price / 100)}
                  </span>
                ) : null}

                <ArrowRight
                  className={cn(
                    "h-4 w-4 shrink-0 transition-all",
                    isActive
                      ? "translate-x-0 text-primary opacity-100"
                      : "-translate-x-1 text-slate-300 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDropdown = (compact: boolean) => {
    if (!open) return null;

    return (
      <div
        ref={dropdownRef}
        id={listboxId}
        role="listbox"
        className={cn(
          "absolute left-0 right-0 z-[70] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.16)]",
          compact
            ? "max-h-[min(70vh,520px)] overflow-y-auto"
            : "max-h-[min(72vh,560px)] overflow-y-auto",
        )}
      >
        {loading && !suggestions ? (
          <div className="flex items-center gap-3 px-4 py-5">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm font-semibold text-slate-500">
              Finding matching parts…
            </span>
          </div>
        ) : hasResults ? (
          <>
            {renderGroup("Parts", suggestions?.parts || [])}
            {renderGroup(
              "Categories",
              suggestions?.categories || [],
            )}
            {renderGroup(
              "Brands",
              suggestions?.brands || [],
            )}

            <div className="border-t border-slate-100 bg-slate-50/70 p-3">
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  submitSearch(query);
                }}
                className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary/8 px-4 text-xs font-black text-primary transition-colors hover:bg-primary/12"
              >
                <Search className="h-3.5 w-3.5" />
                Search all results for &quot;{query}&quot;
              </button>
            </div>
          </>
        ) : (
          <div className="px-5 py-8 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <TrendingUp className="h-5 w-5" />
            </span>

            <p className="mt-3 text-sm font-black text-slate-800">
              No exact matches yet
            </p>

            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
              Try a part name, brand, appliance model or SKU.
            </p>

            <button
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                submitSearch(query);
              }}
              className="mt-4 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-black text-white transition hover:brightness-95"
            >
              Search anyway
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (variant === "hero") {
    return (
      <div className={cn("relative w-full", className)}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitSearch(query);
          }}
          className="relative"
        >
          <div
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm transition-all",
              open
                ? "border-primary/30 ring-4 ring-primary/8"
                : "focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/8",
            )}
          >
            <Search
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                query
                  ? "text-primary"
                  : "text-slate-400",
              )}
            />

            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              autoComplete="off"
              spellCheck={false}
              aria-label="Search spare parts"
              aria-controls={listboxId}
              aria-expanded={open}
              aria-activedescendant={
                activeIdx >= 0
                  ? `${listboxId}-option-${activeIdx}`
                  : undefined
              }
              placeholder={placeholder}
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              className="min-w-0 flex-1 border-none bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
            />

            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
            ) : query ? (
              <button
                type="button"
                aria-label="Clear search"
                onMouseDown={(event) => {
                  event.preventDefault();
                  clearSearch();
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>

        {renderDropdown(false)}
      </div>
    );
  }

  return (
    <div className={cn("relative w-full", className)}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(query);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          aria-label="Search spare parts"
          aria-controls={listboxId}
          aria-expanded={open}
          placeholder={placeholder}
          value={query}
          onChange={(event) =>
            setQuery(event.target.value)
          }
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          className={cn(
            "h-12 w-full rounded-2xl border bg-slate-50 pl-11 pr-20 text-sm font-bold text-slate-900 outline-none transition-all placeholder:font-medium placeholder:text-slate-400",
            open
              ? "border-primary/30 bg-white ring-4 ring-primary/8"
              : "border-transparent focus:border-primary/30 focus:bg-white focus:ring-4 focus:ring-primary/8",
          )}
        />

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          ) : null}

          {query && !loading ? (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(event) => {
                event.preventDefault();
                clearSearch();
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </form>

      {renderDropdown(true)}
    </div>
  );
}