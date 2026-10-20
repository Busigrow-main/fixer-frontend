
"use client";

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
  placeholder = "Search for genuine spare parts, model no...",
  className = "",
}: Props) {
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={`relative w-full ${className}`}
    >
      {/* Search icon */}
      <span
        aria-hidden="true"
        className="material-symbols-outlined pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[17px] text-[#9A9BA1] sm:left-3 sm:text-[19px]"
      >
        search
      </span>

      {/* Search input */}
      <input
        data-shop-search
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search spare parts"
        className="h-[38px] w-full rounded-[10px] border border-[#E5E5E9] bg-white pl-9 pr-9 text-[11px] font-normal text-[#292929] outline-none transition placeholder:text-[#999AA0] focus:border-[#D8102B] focus:ring-2 focus:ring-[#D8102B]/10 sm:h-10 sm:rounded-xl sm:pl-10 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
      />

      {/* Microphone / clear button */}
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#77787D] transition hover:bg-[#F5F5F6] active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">
            close
          </span>
        </button>
      ) : onVoice ? (
        <button
          type="button"
          aria-label="Search by voice"
          onClick={onVoice}
          className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#77787D] transition hover:bg-[#F5F5F6] active:scale-95"
        >
          <span className="material-symbols-outlined text-[17px]">
            mic
          </span>
        </button>
      ) : null}
    </form>
  );
}
