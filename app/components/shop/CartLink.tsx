"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

export default function CartLink({ count: countProp }: { count?: number } = {}) {
  const { token } = useAuth();
  const [loadedCount, setLoadedCount] = useState(0);
  useEffect(() => {
    if (countProp != null) return;
    if (!token) { setLoadedCount(0); return; }
    const controller = new AbortController();
    const load = () => fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((cart: { items?: { quantity?: number }[] } | null) => {
        if (cart) setLoadedCount((cart.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
      })
      .catch(() => undefined);
    window.addEventListener("shop-cart-updated", load);
    void load();
    return () => { controller.abort(); window.removeEventListener("shop-cart-updated", load); };
  }, [countProp, token]);
  const count = countProp ?? (token ? loadedCount : 0);

  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95"
    >
      <ShoppingCart className="h-[18px] w-[18px]" aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
