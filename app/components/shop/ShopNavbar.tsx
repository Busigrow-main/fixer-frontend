"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Heart } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import FixxerLogo from "@/app/components/FixxerLogo";
import ShopSearchDialog from "@/app/components/shop/ShopSearchDialog";
import ShopDock from "@/app/components/shop/ShopDock";

export default function ShopNavbar({
  hideMobileHeader = false,
  flowOnMobile = false,
  mobileTitle,
  mobileBackHref = "/shop",
  showMobileBottomNav = true,
  onSearchChange,
  showDock = true,
  hideDockOnMobile = false,
}: {
  hideMobileHeader?: boolean;
  flowOnMobile?: boolean;
  mobileTitle?: string;
  mobileBackHref?: string;
  showMobileBottomNav?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showDock?: boolean;
  hideDockOnMobile?: boolean;
}) {
  const [cartCount, setCartCount] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      setCartCount(0);
      return;
    }
    const controller = new AbortController();
    const loadCart = () => {
      fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Could not load cart");
          return response.json();
        })
        .then((cart: { items?: { quantity?: number }[] }) => {
          setCartCount((cart.items ?? []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0));
        })
        .catch((error) => {
          if (error?.name !== "AbortError") setCartCount(0);
        });
    };
    window.addEventListener("shop-cart-updated", loadCart);
    loadCart();
    return () => {
      controller.abort();
      window.removeEventListener("shop-cart-updated", loadCart);
    };
  }, [token]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visibleCartCount = token ? cartCount : 0;

  return (
    <>
      <header
        className={`${hideMobileHeader ? "hidden" : ""} ${
          flowOnMobile ? "relative" : "fixed left-0 right-0 top-0"
        } z-50 h-14 shrink-0 border-b border-slate-200 bg-white md:hidden`}
      >
        <div
          className={`mx-auto flex h-full w-full items-center justify-between gap-3 px-3 ${
            mobileTitle ? "hidden" : ""
          }`}
        >
          <Link
            href="/shop"
            className="whitespace-nowrap text-[22px] leading-none"
            aria-label="Fixxer Shop home"
          >
            <FixxerLogo className="align-middle text-[22px] leading-none" />
            <span aria-hidden="true" className="mx-1.5 inline-block h-3 w-px align-middle bg-zinc-300" />
            <span className="inline-block align-middle text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-zinc-500">
              Shop
            </span>
          </Link>
          <Link
            href="/shop/wishlist"
            aria-label="Wishlist"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>
        </div>

        {mobileTitle && (
          <div className="absolute inset-x-0 top-0 flex h-14 items-center gap-3 px-3">
            <Link
              href={mobileBackHref}
              aria-label="Go back"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-800 active:bg-zinc-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-[16px] font-medium tracking-tight text-zinc-900">{mobileTitle}</h1>
          </div>
        )}
      </header>

      {!hideMobileHeader && !flowOnMobile && <div aria-hidden="true" className="h-14 md:hidden" />}

      <ShopSearchDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onQuery={onSearchChange}
      />

      {showDock && (
        <ShopDock
          cartCount={visibleCartCount}
          onSearch={() => setCommandOpen(true)}
          className="flex"
        />
      )}
    </>
  );
}
