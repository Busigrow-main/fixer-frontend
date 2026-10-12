"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

export default function PartRequestAction({
  partId,
  compact = false,
}: {
  partId: string;
  compact?: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const href = `/spare-parts/enquiry?part=${encodeURIComponent(partId)}&quantity=${quantity}`;

  return (
    <div className={compact ? "flex items-center gap-2" : "space-y-3"}>
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
        <span className="text-xs font-bold text-slate-500">Quantity</span>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="rounded-md p-1 text-slate-600 hover:bg-slate-100">
            <Minus className="h-4 w-4" />
          </button>
          <span className="min-w-5 text-center text-sm font-black text-slate-900">{quantity}</span>
          <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)} className="rounded-md p-1 text-slate-600 hover:bg-slate-100">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Link href={href} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-lg shadow-primary/15 transition hover:brightness-95">
        <ShoppingBag className="h-4 w-4" />
        Request this part
      </Link>
    </div>
  );
}
