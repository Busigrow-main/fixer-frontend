"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

type Props = {
  qty: number;
  onQty: (n: number) => void;
  onAdd: () => Promise<boolean>;
  max?: number;
  disabled?: boolean;
  outOfStock?: boolean;
  price: number;
};

export default function QuantityAddToCart({ qty, onQty, onAdd, max = 10, disabled, outOfStock, price }: Props) {
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-20px_rgba(0,0,0,.35)] backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 sm:gap-4">
      <div className="hidden min-w-0 flex-1 sm:block">
        <p className="text-[11px] font-medium text-zinc-500">Price</p>
        <p className="truncate text-lg font-extrabold text-zinc-900">₹{price.toLocaleString("en-IN")}</p>
      </div>
      <div className="flex shrink-0 items-center rounded-xl border border-zinc-200" role="group" aria-label="Quantity">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= 1}
          onClick={() => onQty(qty - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition active:bg-zinc-100 disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[22px]">remove</span>
        </button>
        <span aria-live="polite" className="w-7 text-center text-base font-bold text-zinc-900">
          {qty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={qty >= max}
          onClick={() => onQty(qty + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition active:bg-zinc-100 disabled:opacity-30"
        >
          <span className="material-symbols-outlined text-[22px]">add</span>
        </button>
      </div>

      <button
        type="button"
        disabled={disabled || adding}
        onClick={async () => {
          setAdding(true);
          setAdded(false);
          try {
            if (await onAdd()) setAdded(true);
          } finally {
            setAdding(false);
          }
        }}
        className={`flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl text-[15px] font-bold transition active:scale-[0.98] disabled:cursor-not-allowed ${
          added
            ? "border border-green-200 bg-green-50 text-green-700"
            : outOfStock
              ? "bg-zinc-200 text-zinc-600"
              : "bg-primary text-white shadow-[0_10px_20px_-10px_rgba(200,16,46,0.8)] hover:brightness-105 disabled:opacity-50"
        }`}
      >
        {outOfStock ? null : added ? <span className="material-symbols-outlined text-[20px]">check</span> : <ShoppingCart className="h-5 w-5" aria-hidden="true" />}
        {outOfStock ? "Out of stock" : adding ? "Adding…" : added ? "Added to cart" : "Add to cart"}
      </button>
      {added && <Link href="/cart" className="whitespace-nowrap text-xs font-bold text-primary">View cart</Link>}
      </div>
    </div>
  );
}
