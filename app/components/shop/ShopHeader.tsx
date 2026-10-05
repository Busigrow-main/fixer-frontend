"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
} from "lucide-react";
import { useEffect, useRef } from "react";

export default function ShopHeader({
  value = "",
  onSearch,
  autoFocusSearch = false,
}: {
  value?: string;
  onSearch?: (value: string) => void;
  autoFocusSearch?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isShopHome = pathname === "/spare-parts";

  return (
    <header className="relative z-10 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2.5 px-3 sm:px-4 md:h-16 md:gap-4">
        {/* Back */}
        {!isShopHome ? (
          <button
            type="button"
            aria-label="Go back"
            onClick={() => router.back()}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 active:bg-slate-100 md:h-10 md:w-10"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
          </button>
        ) : null}

        {/* Brand */}
        <Link
          href="/spare-parts"
          className="shrink-0 text-[17px] font-black tracking-[-0.04em] text-slate-950 sm:text-lg"
          aria-label="Fixxer Shop home"
        >
          FIXER{" "}
          <span className="text-primary">
            Shop
          </span>
        </Link>

        {/* Desktop search */}
        <div className="hidden min-w-0 flex-1 md:block">
          {onSearch ? (
            <ShopSearch
              value={value}
              onSearch={onSearch}
              autoFocus={autoFocusSearch}
            />
          ) : null}
        </div>
      </div>

      {/* Mobile search */}
      {onSearch ? (
        <div className="border-t border-slate-100 px-3 py-2.5 md:hidden">
          <ShopSearch
            value={value}
            onSearch={onSearch}
            autoFocus={autoFocusSearch}
          />
        </div>
      ) : null}
    </header>
  );
}

function ShopSearch({
  value,
  onSearch,
  autoFocus = false,
}: {
  value: string;
  onSearch: (value: string) => void;
  autoFocus?: boolean;
}) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSearch(value);
      }}
      className="relative"
    >
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input
        ref={inputRef}
        value={value}
        onChange={(event) =>
          onSearch(event.target.value)
        }
        placeholder="Search spare parts, brands, models..."
        aria-label="Search spare parts, brands and models"
        autoComplete="off"
        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[12px] font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
      />
    </form>
  );
}