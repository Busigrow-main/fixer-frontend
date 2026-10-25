"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  onCheck: (model: string) => void;
  result?: string;
  inputId?: string;
};

export default function FitmentBanner({ onCheck, result, inputId = "appliance-model" }: Props) {
  const [model, setModel] = useState("");

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onCheck(model.trim());
      }}
      className="w-full rounded-2xl border border-zinc-200 bg-white p-3 sm:p-4"
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
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white"
        >
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
  );
}
