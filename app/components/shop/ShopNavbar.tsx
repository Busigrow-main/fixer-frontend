"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Heart } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import FixxerLogo from "@/app/components/FixxerLogo";
import CartLink from "@/app/components/shop/CartLink";
import SearchBar from "@/app/components/shop/spare-parts/SearchBar";
import ShopSearchDialog from "@/app/components/shop/ShopSearchDialog";
import ShopDock from "@/app/components/shop/ShopDock";
import {
  SHOP_ALL_PRODUCTS_HREF,
  SHOP_APPLIANCES_HREF,
  SHOP_SPARE_PARTS_HREF,
  isAppliancesShopRoute,
  isSparePartsShopRoute,
} from "@/app/lib/shop-routes";

const DESKTOP_LINKS = [
  { label: "Spare parts", href: SHOP_SPARE_PARTS_HREF, match: isSparePartsShopRoute },
  { label: "Appliances", href: SHOP_APPLIANCES_HREF, match: isAppliancesShopRoute },
] as const;

export default function ShopNavbar({
  hideMobileHeader = false,
  flowOnMobile = false,
  mobileTitle,
  mobileBackHref = "/shop",
  searchValue,
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
  const pathname = usePathname();
  const router = useRouter();
  const [cartCount, setCartCount] = useState(0);
  const [commandOpen, setCommandOpen] = useState(false);
  const [desktopQuery, setDesktopQuery] = useState(searchValue ?? "");
  const { token } = useAuth();

  useEffect(() => {
    setDesktopQuery(searchValue ?? "");
  }, [searchValue]);

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
  const query = searchValue ?? desktopQuery;

  const changeQuery = (value: string) => {
    setDesktopQuery(value);
    onSearchChange?.(value);
  };

  const submitSearch = () => {
    const next = query.trim();
    if (!next || onSearchChange) return;
    router.push(`${SHOP_ALL_PRODUCTS_HREF}?q=${encodeURIComponent(next)}`);
  };

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
            className="inline-flex items-baseline gap-1 whitespace-nowrap"
            aria-label="Fixxer Shop home"
          >
            <FixxerLogo className="text-[22px] leading-none" />
            <span className="text-[16px] font-semibold tracking-tight text-zinc-800">Shop</span>
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

      <header className="fixed inset-x-0 top-0 z-50 hidden h-[72px] border-b border-slate-200 bg-white md:block">
        <div className="mx-auto flex h-full w-full max-w-[1480px] items-center gap-6 px-8 lg:gap-8 lg:px-12">
          <Link href="/shop" className="inline-flex shrink-0 items-baseline gap-1.5" aria-label="Fixxer Shop home">
            <FixxerLogo className="text-[26px] leading-none" />
            <span className="text-[20px] font-semibold tracking-tight text-zinc-800">Shop</span>
          </Link>

          <nav aria-label="Shop sections" className="hidden shrink-0 items-center gap-6 lg:flex">
            {DESKTOP_LINKS.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1">
            <SearchBar
              value={query}
              onChange={changeQuery}
              onSubmit={submitSearch}
              placeholder="Search appliances, spare parts, brands, or models"
              className="[&_input]:h-11 [&_input]:bg-[#f4f4f6] [&_input]:shadow-[0_0_0_1px_rgba(16,16,20,0.08)] sm:[&_input]:h-11"
            />
          </div>

          <div className="flex w-fit min-w-max shrink-0 items-center gap-2">
            <Link
              href="/shop/wishlist"
              aria-label="Wishlist"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95"
            >
              <Heart className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/orders"
              aria-label="Your orders"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E6E7EB] bg-[#F7F7F8] text-slate-900 transition-colors hover:bg-slate-100 active:scale-95 md:w-auto md:gap-2 md:px-3"
            >
              <ClipboardList className="h-[18px] w-[18px]" />
              <span className="hidden text-xs font-semibold md:inline">Orders</span>
            </Link>
            <CartLink count={visibleCartCount} />
          </div>
        </div>
      </header>

      {!hideMobileHeader && !flowOnMobile && <div aria-hidden="true" className="h-14 md:hidden" />}
      <div aria-hidden="true" className="hidden h-[72px] md:block" />

      <ShopSearchDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onQuery={onSearchChange}
      />

      {showDock && (
        <ShopDock
          cartCount={visibleCartCount}
          onSearch={() => setCommandOpen(true)}
          className={hideDockOnMobile ? "hidden" : "md:hidden"}
        />
      )}
    </>
  );
}
