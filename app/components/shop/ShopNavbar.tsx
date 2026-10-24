"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import { Button } from "@/app/components/ui/button";
import ShopCommand from "@/app/components/shop/ShopCommand";
import ShopDock from "@/app/components/shop/ShopDock";

export default function ShopNavbar({
  mobileTitle,
  mobileBackHref = "/shop",
  searchValue = "",
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

  return (
    <>
      {mobileTitle && (
        <header className="sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-zinc-200/80 bg-white/90 px-2 backdrop-blur md:hidden">
          <Button variant="ghost" size="icon" asChild>
            <Link href={mobileBackHref} aria-label="Go back">
              <ArrowLeft />
            </Link>
          </Button>
          <p className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">{mobileTitle}</p>
        </header>
      )}

      <ShopCommand
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onQuery={onSearchChange}
      />

      {showDock && (
        <ShopDock
          cartCount={token ? cartCount : 0}
          onSearch={() => setCommandOpen(true)}
          className={hideDockOnMobile ? "hidden md:flex" : undefined}
        />
      )}
    </>
  );
}
