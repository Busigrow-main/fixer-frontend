"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import CartLink from "@/app/components/shop/CartLink";

type Props = {
  title?: string;
  cartCount: number;
  fallbackHref: string;
};

export default function DetailHeader({ title = "Spare Parts Detail Page", cartCount, fallbackHref }: Props) {
  const router = useRouter();
  const onBack = useCallback(() => {
    let referrerIsLocal = false;
    try {
      referrerIsLocal = Boolean(document.referrer) && new URL(document.referrer).origin === window.location.origin;
    } catch {
      referrerIsLocal = false;
    }
    if (window.history.length > 1 && referrerIsLocal) router.back();
    else router.push(fallbackHref);
  }, [fallbackHref, router]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center gap-1 border-b border-zinc-200/80 bg-white/95 px-2 shadow-sm backdrop-blur md:h-16 md:px-4 lg:hidden">
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-800 transition active:bg-zinc-100"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[24px]">arrow_back</span>
      </button>

      <p className="mx-auto min-w-0 flex-1 truncate text-[12px] font-extrabold uppercase tracking-wide text-zinc-900 md:text-sm">{title}</p>

      <CartLink count={cartCount} />
    </header>
  );
}
