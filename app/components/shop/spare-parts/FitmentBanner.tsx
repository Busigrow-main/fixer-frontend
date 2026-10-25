"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";

type Props = {
  onCheck: (model?: string) => void;
  result?: string;
  inputId?: string;
};

export default function FitmentBanner({ onCheck, result, inputId = "appliance-model" }: Props) {
  const [model, setModel] = useState("");

  return (
    <>
      <section className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#F0DADD] bg-white p-2.5 sm:gap-3 sm:rounded-2xl sm:p-3.5 md:hidden">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F2] text-[#D8102B] sm:h-11 sm:w-11 sm:rounded-xl">
          <ShieldCheck aria-hidden="true" className="h-[19px] w-[19px] sm:h-6 sm:w-6" strokeWidth={1.8} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="text-[11px] font-bold text-[#292929] sm:text-sm">Guaranteed Exact Fitment</p>
          <p className="mt-1 text-[9px] leading-snug text-[#85858B] sm:text-xs">Enter appliance model number</p>
        </div>
        <button
          type="button"
          onClick={() => onCheck(model.trim())}
          className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-lg bg-[#D8102B] pl-2.5 pr-1.5 text-[10px] font-semibold text-white transition-colors hover:bg-[#B90D25] active:scale-[0.97] sm:h-9 sm:gap-1 sm:rounded-xl sm:pl-3.5 sm:pr-2.5 sm:text-xs"
        >
          <span className="whitespace-nowrap">Check Model</span>
          <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          onCheck(model.trim());
        }}
        className="hidden w-full rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4 md:block"
      >
        <label htmlFor={inputId} className="block text-sm font-bold text-zinc-900">
          What is the model on the appliance?
        </label>
        <p className="mt-1 text-xs text-zinc-500">Example: WW70T4020EE or RT28M3022S8</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id={inputId}
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="Enter model number"
            className="h-11 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary"
          />
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white">
            Check
          </button>
        </div>
        {result && (
          <p role="status" className="mt-3 text-sm text-zinc-700">
            {result}{" "}
            {result.includes("could not match") && (
              <Link href="/shop/requests" className="font-semibold text-primary">
                Request help
              </Link>
            )}
          </p>
        )}
      </form>
    </>
  );
}
