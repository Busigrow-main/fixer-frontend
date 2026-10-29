"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronDown, Heart, MapPin, ShieldCheck } from "lucide-react";
import DetailHeader from "@/app/components/shop/detail/DetailHeader";
import ImageGallery from "@/app/components/shop/detail/ImageGallery";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { API_URL } from "@/app/config";
import { useAuth } from "@/app/context/AuthContext";
import { applianceProductHref } from "@/app/lib/shop-copy";
import { sanitizeProductHtml } from "@/app/components/appliances/ac-detail/sanitizeProductHtml";
import {
  isWished,
  SHOP_WISHLIST_EVENT,
  toggleWishlist,
  wishlistKey,
  type WishlistProduct,
} from "@/app/lib/shop-wishlist";

type Appliance = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  modelNumber?: string;
  sku?: string;
  price?: number;
  originalPrice?: number;
  capacityTon?: number;
  starRating?: number;
  acType?: string;
  isInverter?: boolean;
  roomSizeRecommendation?: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  highlights?: (string | { title?: string; description?: string })[];
  whatsInBox?: string[];
  inStock?: boolean;
  installationIncluded?: boolean;
  compressorWarrantyYears?: number;
  productWarrantyYears?: number;
  applianceCategory?: string;
  rating?: number;
  reviewCount?: number;
  specsPerformance?: Record<string, unknown>;
  specsSmart?: Record<string, unknown>;
  specsPhysical?: Record<string, unknown>;
  isBestseller?: boolean;
};

type InstallOption = { id: string; label: string; charge: number; included: boolean };
type Spec = { label: string; value: string };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function humanizeKey(key: string) {
  return key
    .replace(/pm25/i, "PM 2.5 ")
    .replace(/wifi/i, "Wi-Fi ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .replace(/\bbtu\b/i, "BTU")
    .replace(/\bC\b/, "°C")
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatSpecValue(value: unknown) {
  if (value == null || value === "") return null;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const joined = value.map(String).filter(Boolean).join(", ");
    return joined || null;
  }
  if (typeof value === "object") return null;
  return String(value);
}

function specsFrom(record?: Record<string, unknown>): Spec[] {
  if (!record) return [];
  return Object.entries(record).flatMap(([key, raw]) => {
    const value = formatSpecValue(raw);
    return value ? [{ label: humanizeKey(key), value }] : [];
  });
}

export default function ApplianceDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Appliance | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [pincode, setPincode] = useState("");
  const [options, setOptions] = useState<InstallOption[]>([]);
  const [optionId, setOptionId] = useState("");
  const [checkingPin, setCheckingPin] = useState(false);
  const [wished, setWished] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setProduct(null);
    setError("");
    fetch(`${API_URL}/appliances/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(response.status === 404 ? "This appliance could not be found." : "Could not load this appliance.");
        return response.json();
      })
      .then((data) => setProduct(data.product || null))
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this appliance.");
      });
    return () => controller.abort();
  }, [slug, retry]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => (response.ok ? response.json() : null))
      .then((cart) => {
        if (cart) setCartCount((cart.items || []).reduce((sum: number, item: { quantity?: number }) => sum + (item.quantity || 0), 0));
      })
      .catch(() => undefined);
  }, [token]);

  const wishlistItem: WishlistProduct | null = product
    ? {
        name: product.name,
        brand: product.brand,
        price: product.price,
        mrp: product.originalPrice,
        imageUrl: product.images?.[0],
        isInStock: product.inStock,
        warrantyMonths: product.productWarrantyYears ? product.productWarrantyYears * 12 : undefined,
        detailHref: applianceProductHref(product.slug, product.applianceCategory),
        cartProductType: "appliance",
        cartProductId: product.id,
      }
    : null;

  const savedKey = wishlistItem ? wishlistKey(wishlistItem) : "";

  useEffect(() => {
    if (!wishlistItem) return;
    const sync = () => setWished(isWished(wishlistItem));
    sync();
    window.addEventListener(SHOP_WISHLIST_EVENT, sync);
    return () => window.removeEventListener(SHOP_WISHLIST_EVENT, sync);
  }, [savedKey]);

  useEffect(() => {
    if (!product || !/^\d{6}$/.test(pincode)) {
      setOptions([]);
      setOptionId("");
      setCheckingPin(false);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCheckingPin(true);
      try {
        const query = new URLSearchParams({ productId: product.id, productType: "appliance", pincode });
        const response = await fetch(`${API_URL}/installation/options?${query}`, { signal: controller.signal });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Could not check this pincode.");
        setOptions(data.options || []);
        setOptionId(data.options?.[0]?.id || "");
        setNotice("");
      } catch (cause) {
        if (!controller.signal.aborted) {
          setOptions([]);
          setNotice(cause instanceof Error ? cause.message : "Could not check this pincode.");
        }
      } finally {
        if (!controller.signal.aborted) setCheckingPin(false);
      }
    }, 280);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [pincode, product]);

  const addToCart = useCallback(async () => {
    if (!product || authLoading) return false;
    const href = applianceProductHref(product.slug, product.applianceCategory);
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return false;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productType: "appliance",
          productId: product.id,
          quantity: 1,
          ...(optionId ? { installationOptionId: optionId } : {}),
          ...(pincode ? { pincode } : {}),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        router.push(`/login?redirect=${encodeURIComponent(href)}`);
        return false;
      }
      if (!response.ok) throw new Error(data.message || "Could not add this appliance to your cart.");
      setCartCount((count) => count + 1);
      window.dispatchEvent(new Event("shop-cart-updated"));
      setNotice("Added to cart");
      return true;
    } catch (cause) {
      setNotice(cause instanceof Error ? cause.message : "Could not add this appliance to your cart.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [product, token, authLoading, router, optionId, pincode]);

  const buyNow = useCallback(async () => {
    const addedItem = await addToCart();
    if (addedItem) router.push("/checkout");
  }, [addToCart, router]);

  const facts = useMemo(() => {
    if (!product) return [];
    return [
      product.capacityTon ? { label: "Capacity", value: `${product.capacityTon} Ton` } : null,
      product.starRating ? { label: "Energy", value: `${product.starRating} Star` } : null,
      product.acType ? { label: "Type", value: `${titleCase(product.acType)} AC` } : null,
      product.isInverter != null ? { label: "Compressor", value: product.isInverter ? "Inverter" : "Fixed speed" } : null,
      product.roomSizeRecommendation ? { label: "Room size", value: product.roomSizeRecommendation } : null,
    ].filter((item): item is { label: string; value: string } => Boolean(item));
  }, [product]);

  const specs = useMemo(() => {
    if (!product) return [];
    return [
      ...specsFrom(product.specsPerformance),
      ...specsFrom(product.specsSmart),
      ...specsFrom(product.specsPhysical),
      product.modelNumber ? { label: "Model", value: product.modelNumber } : null,
      product.sku ? { label: "SKU", value: product.sku } : null,
    ].filter((item): item is Spec => Boolean(item));
  }, [product]);

  const highlights = useMemo(() => {
    if (!product?.highlights?.length) return [];
    return product.highlights.map((item) =>
      typeof item === "string" ? item : [item.title, item.description].filter(Boolean).join(" — "),
    ).filter(Boolean);
  }, [product]);

  if (!product) {
    return (
      <div className="shop-shell -mt-14 min-h-screen bg-[#f4f4f6] md:mt-0">
        <ShopNavbar hideMobileHeader />
        <DetailHeader title="Appliance" cartCount={cartCount} fallbackHref="/shop/appliances" />
        <main className="mx-auto min-h-[60vh] max-w-3xl px-4 pb-24 pt-[52px] md:pt-10">
          {error ? (
            <section role="alert" className="rounded-2xl bg-white px-5 py-10 text-center">
              <h1 className="text-lg font-semibold text-zinc-950">Unable to load this appliance</h1>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{error}</p>
              <button type="button" onClick={() => setRetry((count) => count + 1)} className="mt-5 h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white">
                Try again
              </button>
            </section>
          ) : (
            <div className="animate-pulse rounded-2xl bg-white p-8 text-sm text-zinc-500">Loading product…</div>
          )}
        </main>
      </div>
    );
  }

  const images = product.images?.filter(Boolean) || [];
  const price = Number(product.price || 0);
  const mrp = product.originalPrice && product.originalPrice > price ? product.originalPrice : undefined;
  const discount = mrp ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const inStock = product.inStock !== false;
  const added = notice === "Added to cart";
  const categoryLabel = product.applianceCategory ? titleCase(product.applianceCategory === "ac" ? "Air conditioners" : product.applianceCategory) : "Appliances";

  const trust = [
    product.productWarrantyYears ? `${product.productWarrantyYears}-year warranty` : null,
    product.compressorWarrantyYears ? `${product.compressorWarrantyYears}-year compressor` : null,
    product.installationIncluded ? "Installation included" : "Installation available",
  ].filter((item): item is string => Boolean(item));

  const ctaDisabled = busy || authLoading || !inStock;

  return (
    <div className="shop-shell -mt-14 min-h-screen bg-[#f4f4f6] md:mt-0 md:bg-[#f6f6f6]">
      <ShopNavbar hideMobileHeader />
      <DetailHeader title={product.brand ? `${product.brand}` : "Appliance"} cartCount={cartCount} fallbackHref="/shop/appliances" />

      <main className="mx-auto w-full max-w-[1240px] px-0 pb-mobile-cta pt-[52px] md:px-6 md:pt-8 lg:px-10 lg:pb-16">
        <nav className="mb-6 hidden text-[13px] text-zinc-500 md:block">
          <Link href="/shop" className="hover:text-zinc-800">Shop</Link>
          <span className="px-1.5 text-zinc-300">/</span>
          <Link href="/shop/appliances" className="hover:text-zinc-800">Appliances</Link>
          <span className="px-1.5 text-zinc-300">/</span>
          <span className="text-zinc-800">{product.name}</span>
        </nav>

        <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start lg:gap-12">
          <section className="lg:sticky lg:top-8">
            <ImageGallery images={images} alt={product.name} />
          </section>

          <section className="px-4 pb-2 pt-5 md:px-0 md:pt-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              {product.brand || categoryLabel}
            </p>

            <div className="mt-1.5 flex items-start gap-3">
              <h1 className="min-w-0 flex-1 text-[1.375rem] font-semibold leading-snug tracking-tight text-zinc-950 md:text-[1.75rem]">
                {product.name}
              </h1>
              {wishlistItem && (
                <button
                  type="button"
                  aria-label={wished ? "Remove from wishlist" : "Save to wishlist"}
                  aria-pressed={wished}
                  onClick={() => toggleWishlist(wishlistItem)}
                  className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50"
                >
                  <Heart className={`h-[18px] w-[18px] ${wished ? "fill-primary text-primary" : ""}`} />
                </button>
              )}
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-zinc-500">
              {product.modelNumber && <span>Model {product.modelNumber}</span>}
              {Number(product.rating) > 0 && Number(product.reviewCount) > 0 && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="font-medium text-zinc-800">{product.rating!.toFixed(1)}</span>
                  <span>({product.reviewCount} reviews)</span>
                </>
              )}
              {product.isBestseller && (
                <>
                  <span className="text-zinc-300">·</span>
                  <span className="font-medium text-primary">Bestseller</span>
                </>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <p className="text-[1.75rem] font-semibold leading-none tracking-tight text-zinc-950 md:text-[2rem]">{inr(price)}</p>
              {mrp && <p className="text-sm text-zinc-400 line-through">{inr(mrp)}</p>}
              {discount > 0 && <p className="text-sm font-medium text-emerald-700">{discount}% off</p>}
            </div>
            <p className="mt-1.5 text-[12px] text-zinc-500">Inclusive of taxes</p>
            <p className={`mt-1 text-[12px] font-medium ${inStock ? "text-emerald-700" : "text-zinc-500"}`}>
              {inStock ? "In stock" : "Out of stock"}
            </p>

            {product.shortDescription && (
              <p className="mt-4 text-[14px] leading-6 text-zinc-600">{product.shortDescription}</p>
            )}

            {facts.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-3">
                {facts.map((fact) => (
                  <div key={fact.label} className="bg-white px-3 py-2.5">
                    <dt className="text-[11px] text-zinc-500">{fact.label}</dt>
                    <dd className="mt-0.5 text-[13px] font-medium text-zinc-900">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {trust.length > 0 && (
              <ul className="mt-4 flex flex-col gap-2">
                {trust.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[13px] text-zinc-700">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-zinc-500" />
                    {item}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 border-t border-zinc-200 pt-5">
              <p className="text-[13px] font-semibold text-zinc-950">Delivery &amp; installation</p>
              <p className="mt-1 text-[12px] leading-5 text-zinc-500">Enter your 6-digit pincode to see options for your area.</p>
              <label className="mt-3 flex h-11 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3">
                <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                <input
                  aria-label="Delivery pincode"
                  inputMode="numeric"
                  maxLength={6}
                  value={pincode}
                  onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
                  placeholder="Pincode"
                  className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
                />
                {checkingPin && <span className="text-[11px] text-zinc-400">Checking…</span>}
              </label>

              {options.length > 0 && (
                <fieldset className="mt-3 space-y-2">
                  <legend className="sr-only">Installation option</legend>
                  {options.map((option) => {
                    const selected = optionId === option.id;
                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-[13px] transition ${
                          selected ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white"
                        }`}
                      >
                        <input
                          type="radio"
                          name="appliance-install"
                          className="sr-only"
                          checked={selected}
                          onChange={() => setOptionId(option.id)}
                        />
                        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? "border-zinc-900" : "border-zinc-300"}`}>
                          {selected && <span className="h-2 w-2 rounded-full bg-zinc-900" />}
                        </span>
                        <span className="min-w-0 flex-1 text-zinc-800">{option.label}</span>
                        <span className="font-medium text-zinc-950">
                          {option.included ? "Included" : option.charge ? inr(option.charge) : "Free"}
                        </span>
                      </label>
                    );
                  })}
                </fieldset>
              )}
            </div>

            <div className="mt-6 hidden lg:block">
              <PurchaseActions
                busy={busy}
                added={added}
                inStock={inStock}
                disabled={ctaDisabled}
                onAdd={() => void addToCart()}
                onBuy={() => void buyNow()}
              />
              {added && (
                <Link href="/cart" className="mt-3 block text-center text-[13px] font-medium text-primary">
                  View cart
                </Link>
              )}
            </div>

            {notice && !added && (
              <p role="status" className="mt-4 text-[13px] text-red-600">{notice}</p>
            )}
          </section>
        </div>

        <div className="mt-4 overflow-hidden border-y border-zinc-200 bg-white md:mt-10 md:rounded-2xl md:border">
          {highlights.length > 0 && (
            <Accordion title="Highlights" defaultOpen>
              <ul className="space-y-2 text-[14px] leading-6 text-zinc-700">
                {highlights.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Accordion>
          )}
          {specs.length > 0 && (
            <Accordion title="Specifications" defaultOpen={highlights.length === 0}>
              <dl className="divide-y divide-zinc-100">
                {specs.map((spec) => (
                  <div key={spec.label} className="grid grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] gap-4 py-2.5 text-[13px]">
                    <dt className="text-zinc-500">{spec.label}</dt>
                    <dd className="font-medium text-zinc-900">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion>
          )}
          {product.whatsInBox?.length ? (
            <Accordion title="What’s in the box">
              <ul className="space-y-2 text-[14px] leading-6 text-zinc-700">
                {product.whatsInBox.map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Accordion>
          ) : null}
          {product.description && (
            <Accordion title="Product details">
              <ProductCopy value={product.description} />
            </Accordion>
          )}
        </div>
      </main>

      <div className="mobile-bottom-cta fixed inset-x-0 z-40 border-t border-zinc-200 bg-white/95 px-3 py-2 shadow-[0_-8px_20px_-16px_rgba(0,0,0,.35)] backdrop-blur lg:hidden">
        <PurchaseActions
          price={price}
          mrp={mrp}
          busy={busy}
          added={added}
          inStock={inStock}
          disabled={ctaDisabled}
          onAdd={() => void addToCart()}
          onBuy={() => void buyNow()}
        />
      </div>
    </div>
  );
}

function PurchaseActions({
  price,
  mrp,
  busy,
  added,
  inStock,
  disabled,
  onAdd,
  onBuy,
}: {
  price?: number;
  mrp?: number;
  busy: boolean;
  added: boolean;
  inStock: boolean;
  disabled: boolean;
  onAdd: () => void;
  onBuy: () => void;
}) {
  const addLabel = !inStock ? "Out of stock" : busy ? "Adding…" : added ? "Added" : "Add to cart";
  const buyLabel = !inStock ? "Out of stock" : busy ? "Please wait…" : "Buy now";
  return (
    <div className={price != null ? "flex items-center gap-2" : "grid grid-cols-2 gap-2"}>
      {price != null && (
        <div className="min-w-0 shrink-0 pr-1">
          <p className="text-[15px] font-semibold tabular-nums leading-none text-zinc-950">{inr(price)}</p>
          {mrp != null && mrp > price && (
            <p className="mt-1 text-[10px] leading-none text-zinc-400 line-through">{inr(mrp)}</p>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-xl border border-zinc-300 bg-white px-2 text-[12px] font-semibold text-zinc-900 transition enabled:active:scale-[0.99] disabled:opacity-45 lg:h-12 lg:text-[13px]"
      >
        {addLabel}
      </button>
      <button
        type="button"
        onClick={onBuy}
        disabled={disabled}
        className="inline-flex h-11 min-w-0 flex-1 items-center justify-center rounded-xl bg-primary px-2 text-[12px] font-semibold text-white transition enabled:active:scale-[0.99] disabled:opacity-45 lg:h-12 lg:text-[13px]"
      >
        {buyLabel}
      </button>
    </div>
  );
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function ProductCopy({ value }: { value: string }) {
  if (looksLikeHtml(value)) {
    return (
      <div
        className="ac-product-description"
        dangerouslySetInnerHTML={{ __html: sanitizeProductHtml(value) }}
      />
    );
  }
  return <p className="text-[14px] leading-7 text-zinc-600 whitespace-pre-line">{value}</p>;
}

function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-zinc-200 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium text-zinc-950 md:px-5 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 transition group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4 md:px-5">{children}</div>
    </details>
  );
}
