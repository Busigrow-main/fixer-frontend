"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, CheckCircle2, Heart, Image as ImageIcon, Plus, ShieldCheck, Star } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import { warrantyInWords } from "@/app/lib/shop-copy";
import { isWished, SHOP_WISHLIST_EVENT, toggleWishlist, wishlistKey } from "@/app/lib/shop-wishlist";

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
  const savedKey = wishlistKey(part);

  useEffect(() => {
    const sync = () => setWished(isWished(part));
    sync();
    window.addEventListener(SHOP_WISHLIST_EVENT, sync);
    return () => window.removeEventListener(SHOP_WISHLIST_EVENT, sync);
  }, [savedKey]);
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

  const hasReviews = Boolean(part.rating && part.reviews);
  const meta = [
    hasReviews ? `★ ${part.rating} (${part.reviews})` : null,
    stockKnown && !inStock ? "Out of stock" : warranty,
  ].filter(Boolean);

  return (
    <>
      <article className="group flex h-full min-w-0 flex-col rounded-[18px] bg-white p-1.5 shadow-[0_1px_2px_rgba(16,16,20,0.04),0_6px_18px_-10px_rgba(16,16,20,0.14)] transition-transform duration-200 active:scale-[0.985] md:hidden">
        <div className="relative aspect-[5/4] overflow-hidden rounded-[13px] bg-gradient-to-b from-[#f7f7f8] to-[#ededf0]">
          <Link href={detailHref} aria-label={`View ${part.name}`} className="absolute inset-0">
            {image ? (
              <Image src={image} alt={part.name} fill unoptimized sizes="50vw" className="object-contain p-2.5 mix-blend-multiply" />
            ) : (
              <span className="flex h-full items-center justify-center text-[#c7c7cc]" aria-label="Product image unavailable">
                <ImageIcon className="h-8 w-8" strokeWidth={1.25} />
              </span>
            )}
          </Link>
          {part.bestSeller && (
            <span className="pointer-events-none absolute left-1.5 top-1.5 z-10 rounded-full bg-white/90 px-1.5 py-1 text-[8px] font-semibold uppercase leading-none tracking-[0.08em] text-[#1d1d1f] backdrop-blur">
              Bestseller
            </span>
          )}
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            aria-pressed={wished}
            onClick={() => setWished(toggleWishlist(part))}
            className="absolute right-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 backdrop-blur transition before:absolute before:-inset-1.5 before:content-[''] active:scale-90"
          >
            <Heart className={`h-[13px] w-[13px] ${wished ? "fill-[#e9002d] text-[#e9002d]" : "text-[#3a3a3c]"}`} strokeWidth={2} />
          </button>
        </div>

        <div className="flex flex-1 flex-col px-1 pt-2">
          {part.brand && (
            <p className="truncate text-[9px] font-medium uppercase tracking-[0.08em] text-[#8e8e93]">{part.brand}</p>
          )}
          <Link href={detailHref} className="mt-0.5 line-clamp-2 min-h-[2.6em] text-[12px] font-medium leading-[1.3] tracking-[-0.01em] text-[#1d1d1f]">
            {part.name}
          </Link>
          {meta.length > 0 && (
            <p className="mt-0.5 truncate text-[10px] text-[#8e8e93]">
              {meta.join(" · ")}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-1.5 pb-0.5 pt-2">
            <div className="min-w-0">
              {hasPrice ? (
                <>
                  <p className="text-[15px] font-semibold leading-none tracking-[-0.02em] text-[#1d1d1f] tabular-nums">
                    ₹{part.price!.toLocaleString("en-IN")}
                  </p>
                  {hasMrp && (
                    <p className="mt-1 flex items-baseline gap-1 whitespace-nowrap text-[10px] leading-none tabular-nums">
                      <span className="text-[#aeaeb2] line-through">₹{part.mrp!.toLocaleString("en-IN")}</span>
                      <span className="font-semibold text-[#e9002d]">−{discount}%</span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13px] font-medium text-[#3a3a3c]">Price on request</p>
              )}
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={adding || authLoading || !inStock || isAdded}
              aria-label={!inStock ? `${part.name} is out of stock` : isAdded ? `${part.name} added to cart` : `Add ${part.name} to cart`}
              className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition before:absolute before:-inset-2 before:content-[''] active:scale-90 disabled:cursor-not-allowed ${
                !inStock
                  ? "bg-[#f2f2f4] text-[#c7c7cc]"
                  : isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#1d1d1f] text-white shadow-[0_4px_10px_-2px_rgba(16,16,20,0.35)]"
              }`}
            >
              {adding ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : isAdded ? (
                <Check className="h-4 w-4" strokeWidth={2.5} />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2.25} />
              )}
            </button>
          </div>
          {addError && <p role="status" className="pb-1 pt-1.5 text-[11px] leading-tight text-red-600">{addError}</p>}
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
            {part.brand && <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{part.brand}</p>}
            <h3 className="mt-1 line-clamp-2 min-h-[2.5em] text-[15px] font-medium leading-snug text-zinc-900 group-hover:text-primary">{part.name}</h3>
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
                  <span className="text-lg font-semibold tracking-tight text-zinc-950">₹{part.price!.toLocaleString("en-IN")}</span>
                  {hasMrp && <span className="text-xs text-zinc-400 line-through">₹{part.mrp!.toLocaleString("en-IN")}</span>}
                </p>
              ) : (
                <p className="text-sm font-medium text-zinc-700">Price on request</p>
              )}
              {warranty && <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-zinc-600"><ShieldCheck className="h-3.5 w-3.5" /> {warranty}</p>}
              {stockKnown && (inStock ? (
                <p className="mt-1 flex items-center gap-1 text-[12px] font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" /> In stock</p>
              ) : (
                <p className="mt-1 text-[12px] font-medium text-zinc-500">Out of stock</p>
              ))}
            </div>
          </div>
        </Link>
      </article>
    </>
  );
}
