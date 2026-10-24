"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DetailHeader from "@/app/components/shop/detail/DetailHeader";
import ImageGallery from "@/app/components/shop/detail/ImageGallery";
import SpecsGrid, { type Spec } from "@/app/components/shop/detail/SpecsGrid";
import QuantityAddToCart from "@/app/components/shop/detail/QuantityAddToCart";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { API_URL } from "@/app/config";
import { useAuth } from "@/app/context/AuthContext";
import { warrantyInWords } from "@/app/lib/shop-copy";

type Appliance = {
  id: string; slug: string; name: string; brand?: string; modelNumber?: string; sku?: string;
  price?: number; originalPrice?: number; capacityTon?: number; starRating?: number; acType?: string;
  isInverter?: boolean; shortDescription?: string; description?: string; images?: string[];
  highlights?: (string | { title?: string; description?: string })[]; whatsInBox?: string[]; inStock?: boolean; installationIncluded?: boolean;
  compressorWarrantyYears?: number; productWarrantyYears?: number; applianceCategory?: string;
  rating?: number; reviewCount?: number; specsPerformance?: Record<string, unknown>;
  specsSmart?: Record<string, unknown>; specsPhysical?: Record<string, unknown>; isBestseller?: boolean;
};
type InstallOption = { id: string; label: string; charge: number; included: boolean };
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function ApplianceDetail({ slug }: { slug: string }) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Appliance | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [pincode, setPincode] = useState("");
  const [options, setOptions] = useState<InstallOption[]>([]);
  const [optionId, setOptionId] = useState("");
  const [delivery, setDelivery] = useState<"idle" | "ok" | "no">("idle");

  useEffect(() => {
    const controller = new AbortController();
    setProduct(null);
    setError("");
    fetch(`${API_URL}/appliances/${encodeURIComponent(slug)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error(r.status === 404 ? "This appliance could not be found." : "Could not load this appliance."); return r.json(); })
      .then((data) => {
        if (!data?.product) throw new Error("This appliance could not be found.");
        setProduct(data.product);
      })
      .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Could not load this appliance."); });
    return () => controller.abort();
  }, [slug, retry]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((cart) => { if (cart) setCartCount((cart.items || []).reduce((n: number, i: { quantity?: number }) => n + (i.quantity || 0), 0)); })
      .catch(() => undefined);
  }, [token]);

  const loadOptions = async () => {
    if (!product || !/^\d{6}$/.test(pincode)) { setNotice("Enter a valid 6-digit pincode to see delivery."); setDelivery("idle"); return; }
    try {
      const q = new URLSearchParams({ productId: product.id, productType: "appliance", pincode });
      const r = await fetch(`${API_URL}/installation/options?${q}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data.message || "Could not check delivery.");
      setOptions(data.options || []);
      setOptionId(data.options?.[0]?.id || "");
      setDelivery((data.options || []).length > 0 ? "ok" : "no");
      setNotice("");
    } catch (e) {
      setDelivery("no");
      setNotice(e instanceof Error ? e.message : "Could not check delivery.");
    }
  };

  const addToCart = useCallback(async () => {
    if (!product || authLoading) return false;
    if (!token) { router.push(`/login?redirect=${encodeURIComponent(`/shop/appliances/${product.applianceCategory || "all"}/${product.slug}`)}`); return false; }
    setBusy(true);
    setNotice("");
    try {
      const r = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productType: "appliance", productId: product.id, quantity: qty, ...(optionId ? { installationOptionId: optionId } : {}), ...(pincode ? { pincode } : {}) }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 401) { router.push(`/login?redirect=${encodeURIComponent(`/shop/appliances/${product.applianceCategory || "all"}/${product.slug}`)}`); return false; }
      if (!r.ok) throw new Error(data.message || "Could not add this appliance to your cart.");
      setCartCount((n) => n + qty);
      window.dispatchEvent(new Event("shop-cart-updated"));
      setNotice(`Added ${product.name} to your cart`);
      return true;
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Could not add this appliance to your cart.");
      return false;
    } finally {
      setBusy(false);
    }
  }, [product, token, authLoading, router, qty, optionId, pincode]);

  if (!product) return (
    <div className="shop-shell min-h-screen bg-[#f6f6f6]">
      <ShopNavbar hideDockOnMobile />
      <div className="lg:hidden"><DetailHeader title="Appliance" cartCount={cartCount} fallbackHref="/shop/appliances" /></div>
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-20 md:pt-8">
        {error ? (
          <section role="alert" className="rounded-2xl bg-white p-8 text-center">
            <h1 className="font-bold">Unable to load appliance</h1>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
            <button onClick={() => setRetry((n) => n + 1)} className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-white">Try again</button>
          </section>
        ) : (
          <div className="animate-pulse rounded-2xl bg-white p-8 text-zinc-500">Loading appliance details…</div>
        )}
      </main>
    </div>
  );

  const images = product.images?.filter(Boolean) || [];
  const specs: Spec[] = Object.entries({ ...product.specsPerformance, ...product.specsSmart, ...product.specsPhysical })
    .filter(([, v]) => v != null && ["string", "number", "boolean"].includes(typeof v))
    .map(([label, value]) => ({ label: label.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " "), value: String(value) }));
  const mrp = product.originalPrice && product.originalPrice > (product.price || 0) ? product.originalPrice : undefined;
  const discount = mrp && product.price ? Math.round((mrp - product.price) / mrp * 100) : 0;
  const productWarranty = warrantyInWords((product.productWarrantyYears || 0) * 12);
  const compressorWarranty = warrantyInWords((product.compressorWarrantyYears || 0) * 12);
  const inStock = product.inStock !== false;
  const reviews = Number(product.reviewCount || 0);

  return (
    <div className="shop-shell min-h-screen bg-[#f6f6f6]">
      <ShopNavbar hideDockOnMobile />
      <div className="lg:hidden"><DetailHeader title={product.name} cartCount={cartCount} fallbackHref="/shop/appliances" /></div>
      <main className="mx-auto w-full max-w-[1280px] px-3 pb-28 pt-14 sm:px-5 md:pt-8 lg:px-10 lg:pb-28 lg:pt-8">
        <nav className="mb-5 hidden text-sm text-zinc-500 lg:block">
          <Link href="/shop">Shop</Link> <span className="px-1">/</span> <Link href="/shop/appliances">Appliances</Link> <span className="px-1">/</span> <span className="text-zinc-900">{product.name}</span>
        </nav>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)] lg:gap-8 xl:gap-12">
          <section className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <ImageGallery images={images} alt={product.name} />
          </section>
          <div className="space-y-3 sm:space-y-4">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap gap-1.5">
                {product.isBestseller && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-700">Bestseller</span>}
                {product.brand && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase text-zinc-700">{product.brand}</span>}
                {product.isInverter && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-700">Inverter</span>}
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${inStock ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{inStock ? "In stock" : "Out of stock"}</span>
              </div>
              <h1 className="mt-3 text-2xl font-extrabold leading-tight text-zinc-900 sm:text-3xl">{product.name}</h1>
              <div className="mt-2 flex flex-wrap gap-x-2 text-sm text-zinc-600">
                {product.rating != null && product.rating > 0 && (
                  <a href="#reviews" className="inline-flex items-center gap-1 font-semibold text-zinc-900 hover:text-primary">
                    <span className="material-symbols-outlined icon-filled text-[16px] text-amber-500">star</span>
                    {product.rating} {reviews > 0 && <span className="font-normal text-zinc-500">({reviews} reviews)</span>}
                  </a>
                )}
                {product.starRating != null && <span>{product.starRating} star</span>}
                {product.modelNumber && <span>Model: {product.modelNumber}</span>}
              </div>
              <div className="mt-3 flex flex-wrap items-baseline gap-2">
                <strong className="text-3xl font-extrabold">{inr(Number(product.price || 0))}</strong>
                {mrp && <span className="text-sm text-zinc-400 line-through">{inr(mrp)}</span>}
                {discount > 0 && <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{discount}% off</span>}
              </div>
              <p className="mt-1 text-xs text-zinc-500">Inclusive of taxes</p>
              {product.shortDescription && <p className="mt-2 text-sm text-zinc-600">{product.shortDescription}</p>}
              <p className="mt-3 text-sm text-zinc-600">Genuine appliance · {productWarranty || "Warranty as listed"} · 7-day replacement · Serviced in Patna</p>
              <p className="mt-2 text-xs text-zinc-500">Inspected before dispatch · {productWarranty || "1-year warranty"} · 7-day replacement</p>
              <div className="mt-4 border-t border-zinc-100 pt-4">
                <label className="block text-sm font-semibold text-zinc-900">Deliver to</label>
                <div className="mt-2 flex gap-2">
                  <input aria-label="Pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setDelivery("idle"); }} placeholder="Enter pincode" className="h-11 w-36 rounded-xl border border-zinc-200 bg-[#f6f6f6] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={loadOptions} className="h-11 rounded-xl border border-zinc-200 px-4 text-sm font-semibold">Check</button>
                </div>
                {delivery === "ok" && <p className="mt-2 text-sm text-emerald-700">Delivered in Patna in 2–4 days</p>}
                {delivery === "no" && <p className="mt-2 text-sm text-amber-800">We currently deliver in Patna, 800001–800014.</p>}
                {(product.installationIncluded != null || options.length > 0) && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold text-zinc-900">Installation</p>
                    {product.installationIncluded != null && options.length === 0 && (
                      <p className="text-sm text-zinc-600">{product.installationIncluded ? "Included with this appliance." : "Available options vary by area."}</p>
                    )}
                    {options.map((o) => (
                      <label key={o.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 p-3 text-sm">
                        <input type="radio" name="appliance-install" checked={optionId === o.id} onChange={() => setOptionId(o.id)} />
                        <span className="flex-1">{o.label}</span>
                        <b>{o.included ? "Included" : o.charge ? inr(o.charge) : "Free"}</b>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5 hidden items-center gap-3 lg:flex">
                <div className="flex items-center rounded-xl border border-zinc-200" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="flex h-11 w-11 items-center justify-center disabled:opacity-30">−</button>
                  <span className="w-8 text-center text-sm font-bold">{qty}</span>
                  <button type="button" aria-label="Increase quantity" disabled={qty >= 10} onClick={() => setQty(qty + 1)} className="flex h-11 w-11 items-center justify-center disabled:opacity-30">+</button>
                </div>
                <button type="button" onClick={() => void addToCart()} disabled={busy || authLoading || !inStock} className="min-h-12 flex-1 rounded-xl bg-primary font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600">
                  {busy ? "Adding…" : inStock ? "Add to cart" : "Out of stock"}
                </button>
              </div>
            </section>
            {(productWarranty || compressorWarranty) && (
              <section className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2">
                {productWarranty && <Info label="Product warranty" value={productWarranty} />}
                {compressorWarranty && <Info label="Compressor warranty" value={compressorWarranty} />}
              </section>
            )}
            {(product.highlights?.length || 0) > 0 && (
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="font-bold">Key features</h2>
                <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-700">
                  {product.highlights!.map((item, i) => <li key={`${i}-${typeof item === "string" ? item : item.title ?? "feature"}`}>{typeof item === "string" ? item : <>{item.title}{item.description ? `: ${item.description}` : ""}</>}</li>)}
                </ul>
              </section>
            )}
            {product.whatsInBox?.length ? (
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="font-bold">What’s in the box</h2>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600">{product.whatsInBox.map((x, i) => <li key={`${i}-${x}`}>{x}</li>)}</ul>
              </section>
            ) : null}
            {specs.length > 0 && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="mb-3 font-bold">Specifications</h2><SpecsGrid specs={specs} /></section>}
            {product.description && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><h2 className="font-bold">Product details</h2><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{product.description}</p></section>}
            <section id="reviews" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="font-bold">Reviews</h2>
              <p className="mt-2 text-sm text-zinc-600">
                {reviews > 0
                  ? `${product.rating} average from ${reviews} reviews. Written reviews will appear here as customers leave them.`
                  : "No reviews yet for this appliance."}
              </p>
            </section>
            {notice && <p role="status" className="rounded-xl bg-white p-3 text-sm text-zinc-700">{notice}{notice.startsWith("Added ") && <> · <Link className="font-bold text-primary" href="/cart">View cart</Link></>}</p>}
          </div>
        </div>
      </main>
      <QuantityAddToCart qty={qty} onQty={setQty} onAdd={addToCart} price={Number(product.price || 0)} max={10} disabled={busy || authLoading || !inStock} outOfStock={!inStock} />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-[#f6f6f6] p-3"><p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-800">{value}</p></div>;
}
