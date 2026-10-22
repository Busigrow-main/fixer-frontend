"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, Heart, Image as ImageIcon, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

interface ShopProductCardProps {
  part: {
    _id?: string;
    id?: string;
    sku?: string;
    slug?: string;
    name: string;
    brand?: string;
    price?: number;
    mrp?: number;
    imageUrls?: string[];
    imageUrl?: string;
    isUniversal?: boolean;
    bestSeller?: boolean;
    isInStock?: boolean;
    stock?: number;
    warrantyMonths?: number;
    partNumber?: string;
    description?: string;
    rating?: string;
    reviews?: number;
    detailHref?: string;
    enquiryHref?: string;
    cartProductType?: "part" | "appliance";
    cartProductId?: string;
  };
  onRequest?: () => void;
  inCart?: boolean;
}

export default function ShopProductCard({ part, onRequest, inCart = false }: ShopProductCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading: authLoading } = useAuth();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState("");

  const identifier = part.slug || part.sku || part._id || part.id || "";
  const detailHref = part.detailHref || `/shop/spare-parts/${encodeURIComponent(part.sku || identifier)}`;
  const image = part.imageUrls?.[0] || part.imageUrl;

  const hasPrice = typeof part.price === "number" && part.price > 0;
  const hasMrp =
    typeof part.mrp === "number" && part.mrp > 0 && part.mrp > (part.price || 0);
  const discount =
    hasMrp && hasPrice
      ? Math.round(((part.mrp! - part.price!) / part.mrp!) * 100)
      : 0;

  const stockKnown = typeof part.isInStock === "boolean" || typeof part.stock === "number";
  const inStock =
    part.isInStock !== false && (typeof part.stock !== "number" || part.stock > 0);

  const isAdded = inCart || added;
  const cta = (
    <>
      {adding ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : isAdded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
      <span>{adding ? "Adding…" : isAdded ? "Added to Cart" : "Add to Cart"}</span>
    </>
  );

  const addToCart = async () => {
    if (adding || authLoading || !inStock) return;
    if (!token) {
      const returnTo = typeof window === "undefined" ? pathname : `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(returnTo || detailHref)}`);
      return;
    }

    const productId = part.cartProductId || part._id || part.id;
    if (!productId) {
      setAddError("This item can’t be added to the cart right now.");
      return;
    }

    setAdding(true);
    setAddError("");
    setAdded(false);
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productType: part.cartProductType || "part", productId, quantity: 1 }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) {
        const returnTo = typeof window === "undefined" ? pathname : `${window.location.pathname}${window.location.search}`;
        router.push(`/login?redirect=${encodeURIComponent(returnTo || detailHref)}`);
        return;
      }
      if (!response.ok) throw new Error(body.message || "Could not add this item to your cart.");
      setAdded(true);
      onRequest?.();
      window.dispatchEvent(new Event("shop-cart-updated"));
    } catch (error) {
      setAddError(error instanceof Error ? error.message : "Could not add this item to your cart.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="shop-product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e0e2e5] bg-white shadow-[0_2px_7px_rgba(20,20,20,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
      {/* Image */}
      <div className="shop-product-card__image-wrap relative m-2.5 aspect-square overflow-hidden rounded-[18px] bg-[#f7f7f7]">
        <Link href={detailHref} aria-label={`View ${part.name}`} className="absolute inset-0">
          {image ? (
            <Image
              src={image}
              alt={part.name}
              fill
              unoptimized
              sizes="(max-width: 1023px) 50vw, 280px"
              className="shop-product-card__image object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-slate-300" aria-label="Product image unavailable">
              <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
            </span>
          )}
        </Link>

        {part.bestSeller && (
          <span className="shop-product-card__badge pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-[#e9002d] px-2.5 py-1.5 text-[10px] font-extrabold uppercase leading-none tracking-wide text-white">
            Bestseller
          </span>
        )}

        <button
          type="button"
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wished}
          onClick={() => setWished((w) => !w)}
          className="shop-product-card__wishlist absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition active:scale-90"
        >
          <Heart
            className={`h-4 w-4 ${
              wished ? "fill-[#e9002d] text-[#e9002d]" : "text-slate-500"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="shop-product-card__content flex flex-1 flex-col px-3 pb-3 pt-1.5">
        <p className="shop-product-card__rating flex items-center gap-1 text-[13px] font-medium leading-none text-slate-700">
          {part.rating && <><Star className="h-3 w-3 fill-emerald-600 text-emerald-600" /><span>{part.rating}</span>{part.reviews !== undefined && <span className="text-slate-400">({part.reviews})</span>}</>}
          {!stockKnown ? null : inStock ? (
            <span className="ml-auto hidden items-center gap-1 font-semibold text-emerald-600 md:inline-flex">
              <CheckCircle2 className="h-3 w-3" /> In stock
            </span>
          ) : (
            <span className="ml-auto font-semibold text-slate-400">Out of stock</span>
          )}
        </p>

        <Link
          href={detailHref}
        className="shop-product-card__title mt-2 line-clamp-2 min-h-[2.5em] text-[15px] font-bold leading-[1.25] text-slate-900 transition-colors hover:text-[#e9002d]"
        >
          {part.name}
        </Link>

        {part.description && (
          <p className="shop-product-card__description mt-1 hidden min-w-0 max-w-full truncate text-[11px] font-medium leading-4 text-emerald-700" title={part.description}>
            {part.description}
          </p>
        )}

        {(part.partNumber || part.sku) && (
          <p className="shop-product-card__sku mt-0.5 hidden truncate text-[10px] font-medium text-slate-400">
            {part.partNumber ? `Part no. ${part.partNumber}` : `SKU ${part.sku}`}
          </p>
        )}

        {/* Price + CTA pinned to the bottom so cards align in a row */}
        <div className="shop-product-card__pricing mt-auto pt-1.5">
          {hasPrice ? (
            <div className="flex flex-wrap items-baseline gap-x-2 leading-tight">
              <span className="shop-product-card__price text-[21px] font-extrabold tracking-tight text-slate-950">
                ₹{part.price!.toLocaleString("en-IN")}
              </span>
              {hasMrp && (
                <span className="shop-product-card__mrp text-[12px] text-slate-400 line-through">
                  ₹{part.mrp!.toLocaleString("en-IN")}
                </span>
              )}
              {hasMrp && (
                <span className="shop-product-card__discount text-[12px] font-semibold text-[#e9002d]">
                  {discount}% off
                </span>
              )}
            </div>
          ) : (
            <p className="text-[13px] font-extrabold text-slate-700">Price on request</p>
          )}

          {part.warrantyMonths && part.warrantyMonths > 0 ? (
            <p className="shop-product-card__warranty mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ShieldCheck className="h-3 w-3" />
              {part.warrantyMonths}M warranty
            </p>
          ) : null}

          <button
            type="button"
            onClick={addToCart}
            disabled={adding || authLoading || !inStock || isAdded}
            aria-label={isAdded ? `${part.name} added to cart` : `Add ${part.name} to cart`}
            className={`shop-product-card__cta mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#e9002d] px-2 text-[13px] font-bold text-white shadow-[0_3px_6px_rgba(233,0,45,0.18)] transition hover:bg-[#d60029] active:scale-[0.98] ${isAdded ? "bg-emerald-600 hover:bg-emerald-600" : ""} disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {cta}
          </button>
          {addError && <p role="status" className="mt-1.5 text-center text-[11px] leading-tight text-red-600">{addError}</p>}
        </div>
      </div>
    </article>
  );
}
