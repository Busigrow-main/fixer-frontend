"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import ShopProductCard from "@/app/components/shop/ShopProductCard";
import { listWishlist, SHOP_WISHLIST_EVENT, type WishlistProduct } from "@/app/lib/shop-wishlist";

export default function ShopWishlistPage() {
  const [items, setItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    const sync = () => setItems(listWishlist());
    sync();
    window.addEventListener(SHOP_WISHLIST_EVENT, sync);
    return () => window.removeEventListener(SHOP_WISHLIST_EVENT, sync);
  }, []);

  return (
    <div className="shop-shell -mt-14 min-h-screen bg-[#f4f4f6] md:mt-0 md:bg-[#f6f6f6]">
      <ShopNavbar />
      <main className="mx-auto flex w-full max-w-[560px] flex-col gap-3 px-3 pb-28 pt-3 sm:max-w-[720px] sm:px-4 md:max-w-[1440px] md:gap-8 md:px-8 md:pb-28 md:pt-10">
        <h1 className="text-[16px] font-medium text-slate-900 md:text-2xl md:font-semibold">Wishlist</h1>
        {items.length === 0 ? (
          <div className="rounded-[20px] bg-white px-4 py-10 text-center">
            <p className="text-sm text-slate-600">Saved products will show up here.</p>
            <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-[#e9002d]">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 items-stretch gap-2.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {items.map((product) => (
              <ShopProductCard key={product.cartProductId || product.id || product.name} part={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
