
"use client";

export type Category = {
  key: string;
  label: string;
  count?: string | number;
};

type Props = {
  items: Category[];
  selected: string;
  onSelect: (key: string) => void;
  className?: string;
};

export default function CategoryChips({
  items,
  selected,
  onSelect,
  className = "",
}: Props) {
  return (
    <div
      role="tablist"
      aria-label="Part categories"
      className={`no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto overflow-y-hidden sm:gap-2 ${className}`}
    >
      {items.map((category) => {
        const active = category.key === selected;

        return (
          <button
            key={category.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(category.key)}
            className={`inline-flex h-[30px] shrink-0 snap-start items-center justify-center gap-1 whitespace-nowrap rounded-full border px-3 text-[10px] font-medium transition-colors active:scale-[0.98] sm:h-9 sm:px-4 sm:text-xs ${
              active
                ? "border-primary bg-primary text-white"
                : "border-[#E5E5E9] bg-white text-[#55565B] hover:border-primary/40"
            }`}
          >
            <span>{category.label}</span>

            {category.count != null && (
              <span
                className={`rounded-full px-1.5 text-[9px] font-medium leading-[15px] ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-[#F1F1F3] text-[#77787D]"
                }`}
              >
                {category.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
