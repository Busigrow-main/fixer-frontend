"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DetailHeader from "@/app/components/shop/detail/DetailHeader";
import ImageGallery from "@/app/components/shop/detail/ImageGallery";
import SpecsGrid, { type Spec } from "@/app/components/shop/detail/SpecsGrid";
import { API_URL } from "@/app/config";
import { useAuth } from "@/app/context/AuthContext";

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
  const router = useRouter(); const { token, loading: authLoading } = useAuth();
  const [product, setProduct] = useState<Appliance | null>(null); const [error, setError] = useState("");
  const [retry, setRetry] = useState(0); const qty = 1; const [cartCount, setCartCount] = useState(0);
  const [busy, setBusy] = useState(false); const [notice, setNotice] = useState("");
  const [pincode, setPincode] = useState(""); const [options, setOptions] = useState<InstallOption[]>([]); const [optionId, setOptionId] = useState("");

  useEffect(() => { const controller = new AbortController(); setProduct(null); setError("");
    fetch(`${API_URL}/appliances/${encodeURIComponent(slug)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error(r.status === 404 ? "This appliance could not be found." : "Could not load this appliance."); return r.json(); })
      .then((data) => setProduct(data.product || null))
      .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Could not load this appliance."); });
    return () => controller.abort();
  }, [slug, retry]);
  useEffect(() => { if (!token) return; fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.ok ? r.json() : null).then((cart) => { if (cart) setCartCount((cart.items || []).reduce((n: number, i: { quantity?: number }) => n + (i.quantity || 0), 0)); }).catch(() => undefined); }, [token]);

  const loadOptions = async () => {
    if (!product || !/^\d{6}$/.test(pincode)) { setNotice("Enter a valid 6-digit pincode to see service options."); return; }
    try { const q = new URLSearchParams({ productId: product.id, productType: "appliance", pincode }); const r = await fetch(`${API_URL}/installation/options?${q}`); const data = await r.json(); if (!r.ok) throw new Error(data.message || "Could not load options."); setOptions(data.options || []); setOptionId(data.options?.[0]?.id || ""); setNotice(""); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Could not load options."); }
  };
  const addToCart = useCallback(async () => {
    if (!product || authLoading) return; if (!token) { router.push(`/login?redirect=${encodeURIComponent(`/shop/appliances/${product.applianceCategory || "all"}/${product.slug}`)}`); return; }
    setBusy(true); setNotice(""); try { const r = await fetch(`${API_URL}/cart/items`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ productType: "appliance", productId: product.id, quantity: qty, ...(optionId ? { installationOptionId: optionId } : {}), ...(pincode ? { pincode } : {}) }) }); const data = await r.json().catch(() => ({})); if (r.status === 401) { router.push(`/login?redirect=${encodeURIComponent(`/shop/appliances/${product.applianceCategory || "all"}/${product.slug}`)}`); return; } if (!r.ok) throw new Error(data.message || "Could not add this appliance to your cart."); setCartCount((n) => n + qty); window.dispatchEvent(new Event("shop-cart-updated")); setNotice("Added to cart"); }
    catch (e) { setNotice(e instanceof Error ? e.message : "Could not add this appliance to your cart."); } finally { setBusy(false); }
  }, [product, token, authLoading, router, qty, optionId, pincode]);

  if (!product) return <div className="min-h-screen bg-zinc-50"><DetailHeader title="Appliance Detail Page" cartCount={cartCount} fallbackHref="/shop/appliances"/><main className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-20 md:pt-24">{error ? <section role="alert" className="rounded-2xl bg-white p-8 text-center"><h1 className="font-bold">Unable to load appliance</h1><p className="mt-2 text-sm text-zinc-600">{error}</p><button onClick={() => setRetry((n) => n + 1)} className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-white">Try again</button></section> : <div className="animate-pulse rounded-2xl bg-white p-8 text-zinc-500">Loading appliance details…</div>}</main></div>;

  const images = product.images?.filter(Boolean) || [];
  const specs: Spec[] = Object.entries({ ...product.specsPerformance, ...product.specsSmart, ...product.specsPhysical }).filter(([, v]) => v != null && ["string", "number", "boolean"].includes(typeof v)).map(([label, value]) => ({ label: label.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " "), value: String(value) }));
  const mrp = product.originalPrice && product.originalPrice > (product.price || 0) ? product.originalPrice : undefined;
  const discount = mrp && product.price ? Math.round((mrp - product.price) / mrp * 100) : 0;
  const warranty: string[] = [product.productWarrantyYears ? `${product.productWarrantyYears} Year Product Warranty` : undefined, product.compressorWarrantyYears ? `${product.compressorWarrantyYears} Year Compressor Warranty` : undefined].filter((value): value is string => Boolean(value));

  return <div className="min-h-screen bg-[#f5f5f6]"><DetailHeader title={product.name} cartCount={cartCount} fallbackHref="/shop/appliances"/>
    <main className="mx-auto w-full max-w-[1280px] px-3 pb-28 pt-14 sm:px-5 md:pt-20 lg:px-10 lg:pb-12 lg:pt-24"><nav className="mb-5 hidden text-sm text-zinc-500 lg:block"><Link href="/shop">Shop</Link> <span className="px-1">/</span> <Link href="/shop/appliances">Appliances</Link> <span className="px-1">/</span> <span className="text-zinc-900">{product.name}</span></nav>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.92fr)] lg:gap-8 xl:gap-12"><section className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-5 lg:sticky lg:top-20"><ImageGallery images={images} alt={product.name}/></section>
        <div className="space-y-3 sm:space-y-4"><section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"><div className="flex flex-wrap gap-1.5">{product.isBestseller && <span className="rounded-full bg-primary px-2 py-1 text-[10px] font-bold text-white">BEST SELLER</span>}{product.brand && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold uppercase text-zinc-700">{product.brand}</span>}{product.isInverter && <span className="rounded-full bg-zinc-100 px-2 py-1 text-[10px] font-bold text-zinc-700">Inverter</span>}{product.inStock != null && <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${product.inStock ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"}`}>{product.inStock ? "In Stock" : "Out of Stock"}</span>}</div>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-zinc-900 sm:text-3xl">{product.name}</h1><div className="mt-2 flex flex-wrap gap-x-2 text-xs text-zinc-600">{product.starRating != null && <span>{product.starRating}★</span>}{product.rating != null && product.rating > 0 && <span>{product.rating} ★ ({product.reviewCount || 0} reviews)</span>}{product.modelNumber && <span>Model: {product.modelNumber}</span>}</div>
          <div className="mt-3 flex flex-wrap items-baseline gap-2"><strong className="text-3xl font-extrabold">{inr(Number(product.price || 0))}</strong>{mrp && <span className="text-sm text-zinc-400 line-through">{inr(mrp)}</span>}{discount > 0 && <span className="rounded bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{discount}% off</span>}</div>
          {product.shortDescription && <p className="mt-2 text-sm text-zinc-600">{product.shortDescription}</p>}<button onClick={() => addToCart()} disabled={busy || authLoading || product.inStock === false} className="mt-5 hidden min-h-12 w-full rounded-xl bg-primary font-bold text-white disabled:opacity-50 lg:block">{busy ? "Adding..." : "Add to Cart"}</button></section>
          {(product.installationIncluded != null || warranty.length > 0) && <section className="grid grid-cols-1 gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2">{product.installationIncluded != null && <Info label="Installation" value={product.installationIncluded ? "Included" : "Available options vary by area"} />}{warranty.map((w) => <Info key={w} label="Warranty" value={w} />)}</section>}
          {(product.highlights?.length || 0) > 0 && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="font-bold">Key Features</h2><ul className="mt-3 list-inside list-disc space-y-2 text-sm text-zinc-700">{product.highlights!.map((item, i) => <li key={`${i}-${typeof item === "string" ? item : item.title ?? "feature"}`}>{typeof item === "string" ? item : <>{item.title}{item.description ? `: ${item.description}` : ""}</>}</li>)}</ul></section>}
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">Select Installation Option</h2><p className="text-xs text-zinc-500">Options and charges depend on serviceable pincode.</p></div><input aria-label="Pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="Pincode" className="w-28 rounded-lg bg-zinc-100 px-3 py-2 text-sm"/></div><button onClick={loadOptions} className="mt-3 rounded-lg border px-3 py-2 text-sm font-semibold">Check options</button>{options.map((o) => <label key={o.id} className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm"><input type="radio" name="appliance-install" checked={optionId === o.id} onChange={() => setOptionId(o.id)}/><span className="flex-1">{o.label}</span><b>{o.included ? "Included" : o.charge ? inr(o.charge) : "Free"}</b></label>)}</section>
          {product.whatsInBox?.length ? <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><h2 className="font-bold">What’s in the box</h2><ul className="mt-2 list-inside list-disc space-y-1 text-sm text-zinc-600">{product.whatsInBox.map((x, i) => <li key={`${i}-${x}`}>{x}</li>)}</ul></section> : null}
          {specs.length > 0 && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="mb-3 font-bold">Specifications</h2><SpecsGrid specs={specs}/></section>}
          {product.description && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><h2 className="font-bold">Product details</h2><p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{product.description}</p></section>}
          {notice && <p role="status" className="rounded-xl bg-white p-3 text-sm text-zinc-700">{notice}{notice === "Added to cart" && <> · <Link className="font-bold text-primary" href="/cart">View cart</Link></>}</p>}
        </div>
      </div></main>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-3 pt-3 pb-[max(.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-20px_rgba(0,0,0,.35)] backdrop-blur lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-3"><div className="min-w-0 flex-1"><p className="text-[10px] text-zinc-500">Price</p><p className="truncate text-lg font-extrabold text-zinc-900">{inr(Number(product.price || 0))}</p></div><button onClick={() => addToCart()} disabled={busy || authLoading || product.inStock === false} className="min-h-12 flex-1 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md disabled:opacity-50">{busy ? "Adding…" : "Add to Cart"}</button></div></div>
    </div>;
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-zinc-50 p-3"><p className="text-[10px] font-bold uppercase text-zinc-500">{label}</p><p className="mt-1 text-sm font-semibold text-zinc-800">{value}</p></div>; }
