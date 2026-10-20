
"use client";

import { ChevronRight, ShieldCheck } from "lucide-react";

type Props = {
  onCheck: () => void;
};

export default function FitmentBanner({ onCheck }: Props) {
  return (
    <section className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#F0DADD] bg-white p-2.5 sm:gap-3 sm:rounded-2xl sm:p-3.5">
      {/* Icon */}
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F2] text-[#D8102B] sm:h-11 sm:w-11 sm:rounded-xl">
        <ShieldCheck
          aria-hidden="true"
          className="h-[19px] w-[19px] sm:h-6 sm:w-6"
          strokeWidth={1.8}
        />
      </span>

      {/* Copy */}
      <div className="min-w-0 flex-1 leading-tight">
        <p className="text-[11px] font-bold text-[#292929] sm:text-sm">
          Guaranteed Exact Fitment
        </p>

        <p className="mt-1 text-[9px] leading-snug text-[#85858B] sm:text-xs">
          Enter appliance model number
        </p>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onCheck}
        className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-lg bg-[#D8102B] pl-2.5 pr-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#B90D25] active:scale-[0.97] sm:h-9 sm:gap-1 sm:rounded-xl sm:pl-3.5 sm:pr-2.5 sm:text-xs"
      >
        <span className="whitespace-nowrap">Check Model</span>
        <ChevronRight
          aria-hidden="true"
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
        />
      </button>
    </section>
  );
}
