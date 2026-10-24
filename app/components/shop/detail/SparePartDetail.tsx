"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DetailHeader from "./DetailHeader";
import ImageGallery from "./ImageGallery";
import ProductSummary from "./ProductSummary";
import TrustChips from "./TrustChips";
import CompatibilityChecker from "./CompactibilityChecker";
import QuantityAddToCart from "./QuantityAddToCart";
import SpecsGrid, { type Spec } from "./SpecsGrid";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { API_URL } from "@/app/config";
import { useAuth } from "@/app/context/AuthContext";
import { warrantyInWords } from "@/app/lib/shop-copy";

type Part = {
  _id: string; sku: string; slug: string; name: string; description?: string;
  imageUrls?: string[]; price: number; mrp?: number; stock?: number; isInStock?: boolean;
  partType?: { type?: string }; partNumber?: string; alternatePartNumbers?: string[];
  partCategory?: string; applianceTypeSlug?: string; isUniversal?: boolean;
  compatibleModels?: { modelNumber?: string; displayName?: string }[];
  crossBrandCompatibility?: string[]; installationDifficulty?: { type?: string };
  warrantyMonths?: number; rating?: { average?: number; count?: number };
};
type InstallOption = { id: string; label: string; charge: number; included: boolean };
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function SparePartDetail({ id }: { id: string }) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [part, setPart] = useState<Part | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [qty, setQty] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [pincode, setPincode] = useState("");
  const [installOptions, setInstallOptions] = useState<InstallOption[]>([]);
  const [installId, setInstallId] = useState("");
  const [delivery, setDelivery] = useState<"idle" | "ok" | "no">("idle");

  useEffect(() => {
    const controller = new AbortController();
    setPart(null); setError("");
    fetch(`${API_URL}/spare-parts/${encodeURIComponent(id)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => { if (!r.ok) throw new Error(r.status === 404 ? "This part could not be found." : "Could not load this part."); return r.json(); })
      .then((data: Part) => setPart(data))
      .catch((e: unknown) => { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Could not load this part."); });
    return () => controller.abort();
  }, [id, retry]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null).then((cart) => {
        if (cart) setCartCount((cart.items || []).reduce((n: number, item: { quantity?: number }) => n + (item.quantity || 0), 0));
      }).catch(() => undefined);
  }, [token]);

  const loadInstallation = async () => {
    if (!part || !/^\d{6}$/.test(pincode)) { setNotice("Enter a valid 6-digit pincode to see delivery."); setDelivery("idle"); return; }
    try {
      const params = new URLSearchParams({ productId: part._id, productType: "part", pincode });
      const response = await fetch(`${API_URL}/installation/options?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not check delivery.");
      setInstallOptions(data.options || []);
      setInstallId(data.options?.[0]?.id || "");
      setDelivery((data.options || []).length > 0 ? "ok" : "no");
      setNotice("");
    } catch (e) {
      setDelivery("no");
      setNotice(e instanceof Error ? e.message : "Could not check delivery.");
    }
  };

  const addToCart = useCallback(async (): Promise<boolean> => {
    if (!part) return false;
    if (authLoading) return false;
    if (!token) { router.push(`/login?redirect=${encodeURIComponent(`/shop/spare-parts/${part.sku}`)}`); return false; }
    setBusy(true); setNotice("");
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productType: "part", productId: part._id, quantity: qty, ...(installId ? { installationOptionId: installId } : {}), ...(pincode ? { pincode } : {}) }),
      });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) { router.push(`/login?redirect=${encodeURIComponent(`/shop/spare-parts/${part.sku}`)}`); return false; }
      if (!response.ok) throw new Error(body.message || "Could not add this part to your cart.");
      setCartCount((n) => n + qty);
      setNotice(`Added ${part.name} to your cart`);
      window.dispatchEvent(new Event("shop-cart-updated"));
      return true;
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not add this part to your cart."); return false; }
    finally { setBusy(false); }
  }, [part, token, authLoading, router, qty, installId, pincode]);

  if (!part) return (
    <div className="shop-shell min-h-screen bg-[#f6f6f6]">
      <ShopNavbar hideDockOnMobile />
      <div className="lg:hidden"><DetailHeader cartCount={cartCount} fallbackHref="/shop/spare-parts" /></div>
      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-20 md:pt-8">
        {error ? (
          <div role="alert" className="rounded-2xl bg-white p-8 text-center">
            <h1 className="font-bold">Unable to load part</h1>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
            <button className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-white" onClick={() => setRetry((n) => n + 1)}>Try again</button>
          </div>
        ) : (
          <div className="animate-pulse rounded-2xl bg-white p-8 text-zinc-500">Loading part details…</div>
        )}
      </main>
    </div>
  );

  const images = part.imageUrls?.filter(Boolean) || [];
  const models = [...new Set((part.compatibleModels || []).map((m) => m.modelNumber || m.displayName).filter((m): m is string => Boolean(m)))];
  const price = Number(part.price || 0) / 100;
  const mrp = part.mrp ? Number(part.mrp) / 100 : undefined;
  const inStock = part.isInStock ?? Number(part.stock || 0) > 0;
  const warranty = warrantyInWords(part.warrantyMonths);
  const specs: Spec[] = [
    ["Part Number", part.partNumber], ["Category", part.partCategory], ["Appliance Type", part.applianceTypeSlug?.replaceAll("-", " ")],
    ["Part Type", part.partType?.type], ["Installation", part.installationDifficulty?.type],
    ["Warranty", warranty || undefined],
    ["Alternate Part Numbers", part.alternatePartNumbers?.join(", ")], ["Cross Brand Compatibility", part.crossBrandCompatibility?.join(", ")],
  ].filter((row): row is [string, string] => typeof row[1] === "string" && row[1].length > 0).map(([label, value]) => ({ label, value }));
  const trust = [
    warranty ? { icon: "verified_user", label: warranty } : null,
    part.partType?.type ? { icon: "workspace_premium", label: part.partType.type } : null,
    inStock ? { icon: "inventory_2", label: "In stock" } : { icon: "inventory_2", label: "Out of stock" },
  ].filter((x): x is { icon: string; label: string } => Boolean(x));
  const maxQty = Math.max(1, Math.min(10, Number(part.stock || 1)));

  return (
    <div className="shop-shell min-h-screen bg-[#f6f6f6]">
      <ShopNavbar hideDockOnMobile />
      <div className="lg:hidden"><DetailHeader title={part.name} cartCount={cartCount} fallbackHref="/shop/spare-parts" /></div>
      <main className="mx-auto w-full max-w-[1280px] px-3 pb-28 pt-14 sm:px-5 md:pt-8 lg:px-10 lg:pb-28 lg:pt-8">
        <nav className="mb-5 hidden text-sm text-zinc-500 lg:block">
          <Link href="/shop">Shop</Link> <span className="px-1">/</span> <Link href="/shop/spare-parts">Spare parts</Link> <span className="px-1">/</span> <span className="text-zinc-900">{part.name}</span>
        </nav>
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)] lg:gap-8 xl:gap-12">
          <section className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-5 lg:sticky lg:top-24">
            <ImageGallery images={images} alt={part.name} />
          </section>
          <div className="space-y-3 sm:space-y-4">
            <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <ProductSummary name={part.name} price={price} mrp={mrp} rating={Number(part.rating?.average || 0)} reviews={Number(part.rating?.count || 0)} description={part.description || ""} inStock={inStock} productLabel={part.partType?.type} warrantyMonths={part.warrantyMonths} />
              <div className="mt-3">{trust.length > 0 && <TrustChips items={trust} />}</div>
              <p className="mt-3 text-sm text-zinc-600">{part.isUniversal ? "Universal fit" : "Compatible replacement"} · {warranty || "Warranty as listed"} · 7-day replacement · Serviced in Patna</p>
              <p className="mt-2 text-xs text-zinc-500">Inspected before dispatch · {warranty || "Warranty as listed"} · 7-day replacement</p>
              <div className="mt-4 border-t border-zinc-100 pt-4">
                <label className="block text-sm font-semibold text-zinc-900">Deliver to</label>
                <div className="mt-2 flex gap-2">
                  <input aria-label="Pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => { setPincode(e.target.value.replace(/\D/g, "")); setDelivery("idle"); }} placeholder="Enter pincode" className="h-11 w-36 rounded-xl border border-zinc-200 bg-[#f6f6f6] px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary" />
                  <button type="button" onClick={loadInstallation} className="h-11 rounded-xl border border-zinc-200 px-4 text-sm font-semibold">Check</button>
                </div>
                {delivery === "ok" && <p className="mt-2 text-sm text-emerald-700">Delivered in Patna in 2–4 days</p>}
                {delivery === "no" && <p className="mt-2 text-sm text-amber-800">We currently deliver in Patna, 800001–800014.</p>}
                {installOptions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold text-zinc-900">Installation</p>
                    {installOptions.map((option) => (
                      <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 p-3 text-sm">
                        <input type="radio" checked={installId === option.id} onChange={() => setInstallId(option.id)} name="installation" />
                        <span className="flex-1">{option.label}</span>
                        <b>{option.included ? "Included" : option.charge ? inr(option.charge) : "Free"}</b>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-5 hidden items-center gap-3 lg:flex">
                <div className="flex items-center rounded-xl border border-zinc-200" role="group" aria-label="Quantity">
                  <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(qty - 1)} className="flex h-11 w-11 items-center justify-center disabled:opacity-30">−</button>
                  <span className="w-8 text-center text-sm font-bold">{qty}</span>
                  <button type="button" aria-label="Increase quantity" disabled={qty >= maxQty} onClick={() => setQty(qty + 1)} className="flex h-11 w-11 items-center justify-center disabled:opacity-30">+</button>
                </div>
                <button type="button" onClick={() => void addToCart()} disabled={busy || authLoading || !inStock} className="min-h-12 flex-1 rounded-xl bg-primary font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600">
                  {busy ? "Adding…" : inStock ? "Add to cart" : "Out of stock"}
                </button>
              </div>
            </section>
            {models.length > 0 && <CompatibilityChecker models={models} />}
            {specs.length > 0 && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="mb-3 font-bold">Part specifications</h2><SpecsGrid specs={specs} cols="2" /></section>}
            <section id="reviews" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="font-bold">Reviews</h2>
              <p className="mt-2 text-sm text-zinc-600">
                {Number(part.rating?.count || 0) > 0
                  ? `${Number(part.rating?.average || 0)} average from ${part.rating?.count} reviews. Written reviews will appear here as customers leave them.`
                  : "No reviews yet for this part."}
              </p>
            </section>
            {notice && <p role="status" className="rounded-xl bg-white p-3 text-sm text-zinc-700">{notice}{notice.startsWith("Added ") && <> · <Link className="font-bold text-primary" href="/cart">View cart</Link></>}</p>}
          </div>
        </div>
      </main>
      <QuantityAddToCart qty={qty} onQty={setQty} onAdd={addToCart} price={price} max={maxQty} disabled={busy || authLoading || !inStock} outOfStock={!inStock} />
    </div>
  );
}
