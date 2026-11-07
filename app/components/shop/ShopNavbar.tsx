"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, ClipboardList, Heart, MapPin } from "lucide-react";
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
  isSparePartsShopRoute,
} from "@/app/lib/shop-routes";

const APPLIANCE_LINK_COUNT = 5;

const DEPARTMENT_LINKS: { label: string; href: string; match?: (pathname: string) => boolean }[] = [
  { label: "All appliances", href: SHOP_APPLIANCES_HREF, match: (pathname) => pathname === SHOP_APPLIANCES_HREF },
  { label: "Refrigerators", href: `${SHOP_APPLIANCES_HREF}?type=refrigerator` },
  { label: "Washing machines", href: `${SHOP_APPLIANCES_HREF}?type=washing-machine` },
  { label: "Air conditioners", href: `${SHOP_APPLIANCES_HREF}?type=ac` },
  { label: "Microwaves", href: `${SHOP_APPLIANCES_HREF}?type=microwave` },
  { label: "Spare parts", href: SHOP_SPARE_PARTS_HREF, match: isSparePartsShopRoute },
  { label: "All products", href: SHOP_ALL_PRODUCTS_HREF, match: (pathname) => pathname === SHOP_ALL_PRODUCTS_HREF },
  { label: "Request a part", href: "/shop/requests", match: (pathname) => pathname === "/shop/requests" },
];

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

      <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-slate-200 bg-white md:block">
        <div className="mx-auto flex h-[72px] w-full max-w-[1440px] items-center gap-6 px-8 lg:gap-10 lg:px-12">
          <Link
            href="/"
            aria-label="Back to Fixxer home"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Home</span>
          </Link>
          <Link href="/shop" className="inline-flex shrink-0 items-baseline gap-1.5" aria-label="Fixxer Shop home">
            <FixxerLogo className="text-[26px] leading-none" />
            <span className="text-[20px] font-semibold tracking-tight text-zinc-800">Shop</span>
          </Link>

          <div className="mx-auto min-w-0 max-w-[760px] flex-1">
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

        <div className="border-t border-slate-100">
          <div className="mx-auto flex h-11 w-full max-w-[1440px] items-center justify-between gap-6 px-8 lg:px-12">
            <nav aria-label="Shop departments" className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
              {DEPARTMENT_LINKS.map((item, index) => {
                const active = item.match?.(pathname) ?? false;
                return (
                  <Fragment key={item.href}>
                    {index === APPLIANCE_LINK_COUNT && (
                      <span aria-hidden="true" className="mx-2 h-4 w-px shrink-0 bg-slate-200" />
                    )}
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </Fragment>
                );
              })}
            </nav>
            <p className="hidden shrink-0 items-center gap-1.5 text-[13px] text-zinc-500 lg:flex">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Delivery and installation across Patna
            </p>
          </div>
        </div>
      </header>

      {!hideMobileHeader && !flowOnMobile && <div aria-hidden="true" className="h-14 md:hidden" />}
      <div aria-hidden="true" className="hidden h-[118px] md:block" />

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
