"use client";

import { useState } from "react";
import ShopProductCard from "../ShopProductCard";

type SparePart = {
  id: string; sku?: string; slug?: string; name: string; imageUrl?: string;
  price?: number; mrp?: number; rating?: string; reviews?: number;
  bestSeller?: boolean; isInStock?: boolean; stock?: number; warrantyMonths?: number;
  cartProductType?: "part" | "appliance";
  cartProductId?: string;
  detailHref?: string;
};

export default function RelatedParts({ parts }: { parts: SparePart[] }) {
  const [cart, setCart] = useState<Set<string>>(new Set());

  return (
    <section aria-labelledby="related-title" className="hidden md:block">
      <div className="mb-4 flex items-end justify-between">
        <h2 id="related-title" className="font-headline text-2xl text-zinc-900">
          You may also need
        </h2>
        <a href="/shop/spare-parts" className="text-sm font-semibold text-primary hover:underline">
          View all parts
        </a>
      </div>
      <div className="grid grid-cols-3 gap-5 lg:grid-cols-4">
        {parts.map((p) => <ShopProductCard key={p.id} part={{ ...p, cartProductType: "part", cartProductId: p.id, detailHref: `/shop/spare-parts/${encodeURIComponent(p.sku || p.id)}` }} inCart={cart.has(p.id)} onRequest={() => setCart((prev) => new Set(prev).add(p.id))} />)}
      </div>
    </section>
  );
}
