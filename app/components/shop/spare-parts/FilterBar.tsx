
"use client";

import type { ReactNode } from "react";
import { ChevronDown, SlidersHorizontal, ArrowDownUp } from "lucide-react";

type Props = {
  activeFilterCount?: number;
  brandLabel?: string;
  capacityLabel?: string;
  onSort: () => void;
  onFilter: () => void;
  onBrand: () => void;
  onCapacity: () => void;
  className?: string;
};

function Chip({
  icon,
  children,
  onClick,
  active = false,
  chevron = false,
  badge,
}: {
  icon?: ReactNode;
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
  chevron?: boolean;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-[30px] min-w-0 shrink-0 items-center justify-center gap-1 rounded-[9px] border px-2 text-[10px] font-medium transition-colors active:scale-[0.98] sm:h-9 sm:gap-1.5 sm:rounded-xl sm:px-3 sm:text-xs ${
        active
          ? "border-[#D8102B] bg-[#FFF5F6] text-[#D8102B]"
          : "border-[#E5E5E9] bg-white text-[#505158] hover:border-[#D8102B]/40"
      }`}
    >
      {icon && (
        <span className="shrink-0 [&>svg]:h-3 [&>svg]:w-3 sm:[&>svg]:h-3.5 sm:[&>svg]:w-3.5">
          {icon}
        </span>
      )}

      <span className="truncate">{children}</span>

      {typeof badge === "number" && badge > 0 && (
        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#D8102B] px-1 text-[9px] font-bold leading-none text-white">
          {badge}
        </span>
      )}

      {chevron && (
        <ChevronDown
          aria-hidden="true"
          className="h-3 w-3 shrink-0 text-[#92939A] sm:h-3.5 sm:w-3.5"
        />
      )}
    </button>
  );
}

export default function FilterBar({
  activeFilterCount = 0,
  brandLabel = "Brand",
  capacityLabel = "Capacity",
  onSort,
  onFilter,
  onBrand,
  onCapacity,
  className = "",
}: Props) {
  return (
    <div
      aria-label="Product sorting and filters"
      className={`no-scrollbar flex min-w-0 gap-1.5 overflow-x-auto py-0.5 sm:gap-2 ${className}`}
    >
      <Chip icon={<ArrowDownUp />} onClick={onSort}>
        Sort
      </Chip>

      <Chip
        icon={<SlidersHorizontal />}
        onClick={onFilter}
        active={activeFilterCount > 0}
        badge={activeFilterCount}
      >
        Filter
      </Chip>

      <Chip
        onClick={onBrand}
        active={brandLabel !== "Brand"}
        chevron
      >
        {brandLabel}
      </Chip>

      <Chip
        onClick={onCapacity}
        active={capacityLabel !== "Capacity"}
        chevron
      >
        {capacityLabel}
      </Chip>
    </div>
  );
}
