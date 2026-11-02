"use client";

import { Search, X } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  onVoice?: () => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  onVoice,
  placeholder = "Search ACs, parts, brands…",
  className = "",
}: Props) {
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
      className={`relative w-full ${className}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-[#e9002d]/10 text-[#e9002d] sm:left-2.5"
      >
        <Search className="h-[15px] w-[15px]" strokeWidth={2.25} />
      </span>

      <input
        data-shop-search
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="h-11 w-full rounded-full border-0 bg-white pl-[42px] pr-11 text-[13px] font-medium tracking-[-0.01em] text-[#1d1d1f] outline-none shadow-[0_1px_2px_rgba(16,16,20,0.06),0_0_0_1px_rgba(16,16,20,0.05)] placeholder:font-normal placeholder:text-[#8e8e93] transition focus:shadow-[0_1px_3px_rgba(233,0,45,0.12),0_0_0_1.5px_rgba(233,0,45,0.38)] sm:h-12 sm:pl-12 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />

      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#6e6e73] transition hover:bg-[#f2f2f4] active:scale-95"
        >
          <X className="h-4 w-4" strokeWidth={2.2} />
        </button>
      ) : onVoice ? (
        <button
          type="button"
          aria-label="Search by voice"
          onClick={onVoice}
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#6e6e73] transition hover:bg-[#f2f2f4] active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">mic</span>
        </button>
      ) : null}
    </form>
  );
}
