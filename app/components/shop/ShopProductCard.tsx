"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { CheckCircle2, Heart, Image as ImageIcon, ShieldCheck, ShoppingCart, Star } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import { warrantyInWords } from "@/app/lib/shop-copy";

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
    fitCount?: number;
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
  const hasMrp = typeof part.mrp === "number" && part.mrp > 0 && part.mrp > (part.price || 0);
  const discount = hasMrp && hasPrice ? Math.round(((part.mrp! - part.price!) / part.mrp!) * 100) : 0;
  const stockKnown = typeof part.isInStock === "boolean" || typeof part.stock === "number";
  const inStock = part.isInStock !== false && (typeof part.stock !== "number" || part.stock > 0);
  const isAdded = inCart || added;
  const warranty = warrantyInWords(part.warrantyMonths);

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

  const cta = (
    <>
      {adding ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : isAdded ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
      <span>{adding ? "Adding…" : isAdded ? "Added to Cart" : "Add to Cart"}</span>
    </>
  );

  return (
    <>
      <article className="shop-product-card group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#e0e2e5] bg-white shadow-[0_2px_7px_rgba(20,20,20,0.07)] transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg md:hidden">
        <div className="shop-product-card__image-wrap relative m-2.5 aspect-square overflow-hidden rounded-[18px] bg-[#f7f7f7]">
          <Link href={detailHref} aria-label={`View ${part.name}`} className="absolute inset-0">
            {image ? (
              <Image src={image} alt={part.name} fill unoptimized sizes="50vw" className="shop-product-card__image object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" />
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
            <Heart className={`h-4 w-4 ${wished ? "fill-[#e9002d] text-[#e9002d]" : "text-slate-500"}`} />
          </button>
        </div>
        <div className="shop-product-card__content flex flex-1 flex-col px-3 pb-3 pt-1.5">
          <p className="shop-product-card__rating flex items-center gap-1 text-[13px] font-medium leading-none text-slate-700">
            {part.rating && <><Star className="h-3 w-3 fill-emerald-600 text-emerald-600" /><span>{part.rating}</span>{part.reviews !== undefined && <span className="text-slate-400">({part.reviews})</span>}</>}
            {!stockKnown ? null : inStock ? null : (
              <span className="ml-auto font-semibold text-slate-400">Out of stock</span>
            )}
          </p>
          <Link href={detailHref} className="shop-product-card__title mt-2 line-clamp-2 min-h-[2.5em] text-[15px] font-bold leading-[1.25] text-slate-900 transition-colors hover:text-[#e9002d]">
            {part.name}
          </Link>
          <div className="shop-product-card__pricing mt-auto pt-1.5">
            {hasPrice ? (
              <div className="flex flex-wrap items-baseline gap-x-2 leading-tight">
                <span className="shop-product-card__price text-[21px] font-extrabold tracking-tight text-slate-950">₹{part.price!.toLocaleString("en-IN")}</span>
                {hasMrp && <span className="shop-product-card__mrp text-[12px] text-slate-400 line-through">₹{part.mrp!.toLocaleString("en-IN")}</span>}
                {hasMrp && <span className="shop-product-card__discount text-[12px] font-semibold text-[#e9002d]">{discount}% off</span>}
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

      <article className="group hidden h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition duration-200 hover:shadow-[0_8px_20px_rgba(15,23,42,0.08)] md:flex">
        <Link href={detailHref} aria-label={`View ${part.name}`} className="flex h-full flex-col">
          <div className="relative m-2.5 aspect-square overflow-hidden rounded-xl bg-[#f6f6f6]">
            {image ? (
              <Image src={image} alt={part.name} fill unoptimized sizes="280px" className="object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03]" />
            ) : (
              <span className="flex h-full items-center justify-center text-zinc-300" aria-label="Product image unavailable">
                <ImageIcon className="h-10 w-10" strokeWidth={1.25} />
              </span>
            )}
            {part.bestSeller && (
              <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-zinc-800 shadow-sm">Bestseller</span>
            )}
          </div>
          <div className="flex flex-1 flex-col px-3 pb-4 pt-1">
            {part.brand && <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">{part.brand}</p>}
            <h3 className="mt-1 line-clamp-2 min-h-[2.5em] text-[15px] font-bold leading-snug text-zinc-900 group-hover:text-primary">{part.name}</h3>
            {part.description && <p className="mt-1 truncate text-[12px] text-zinc-500" title={part.description}>{part.description}</p>}
            {typeof part.fitCount === "number" && part.fitCount > 0 && <p className="mt-1 text-[12px] text-zinc-600">Fits {part.fitCount} models</p>}
            <div className="mt-auto pt-2">
              {part.rating && (
                <p className="mb-1 flex items-center gap-1 text-[13px] font-medium text-zinc-700">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  <span>{part.rating}</span>
                  {part.reviews !== undefined && <span className="text-zinc-400">({part.reviews})</span>}
                </p>
              )}
              {hasPrice ? (
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-lg font-extrabold tracking-tight text-zinc-950">₹{part.price!.toLocaleString("en-IN")}</span>
                  {hasMrp && <span className="text-xs text-zinc-400 line-through">₹{part.mrp!.toLocaleString("en-IN")}</span>}
                </p>
              ) : (
                <p className="text-sm font-bold text-zinc-700">Price on request</p>
              )}
              {warranty && <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-zinc-600"><ShieldCheck className="h-3.5 w-3.5" /> {warranty}</p>}
              {stockKnown && (inStock ? (
                <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> In stock</p>
              ) : (
                <p className="mt-1 text-[12px] font-semibold text-zinc-500">Out of stock</p>
              ))}
            </div>
          </div>
        </Link>
      </article>
    </>
  );
}
