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
    if (!part || !/^\d{6}$/.test(pincode)) { setNotice("Enter a valid 6-digit pincode to see installation options."); return; }
    try {
      const params = new URLSearchParams({ productId: part._id, productType: "part", pincode });
      const response = await fetch(`${API_URL}/installation/options?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load installation options.");
      setInstallOptions(data.options || []); setInstallId(data.options?.[0]?.id || ""); setNotice("");
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not load installation options."); }
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
      setCartCount((n) => n + qty); setNotice("Added to cart"); window.dispatchEvent(new Event("shop-cart-updated")); return true;
    } catch (e) { setNotice(e instanceof Error ? e.message : "Could not add this part to your cart."); return false; }
    finally { setBusy(false); }
  }, [part, token, authLoading, router, qty, installId, pincode]);

  if (!part) return <div className="min-h-screen bg-zinc-50"><ShopNavbar hideMobileHeader showMobileBottomNav={false} /><DetailHeader cartCount={cartCount} fallbackHref="/shop/spare-parts" /><main className="mx-auto min-h-screen max-w-3xl px-4 pb-8 pt-20 md:pt-24">{error ? <div role="alert" className="rounded-2xl bg-white p-8 text-center"><h1 className="font-bold">Unable to load part</h1><p className="mt-2 text-sm text-zinc-600">{error}</p><button className="mt-5 rounded-xl bg-primary px-5 py-3 font-bold text-white" onClick={() => setRetry((n) => n + 1)}>Try again</button></div> : <div className="animate-pulse rounded-2xl bg-white p-8 text-zinc-500">Loading part details…</div>}</main></div>;

  const images = part.imageUrls?.filter(Boolean) || [];
  const models = [...new Set((part.compatibleModels || []).map((m) => m.modelNumber || m.displayName).filter((m): m is string => Boolean(m)))];
  const price = Number(part.price || 0) / 100;
  const mrp = part.mrp ? Number(part.mrp) / 100 : undefined;
  const specs: Spec[] = [
    ["Part Number", part.partNumber], ["Category", part.partCategory], ["Appliance Type", part.applianceTypeSlug?.replaceAll("-", " ")],
    ["Part Type", part.partType?.type], ["Installation", part.installationDifficulty?.type],
    ["Warranty", part.warrantyMonths ? `${part.warrantyMonths} months` : undefined],
    ["Alternate Part Numbers", part.alternatePartNumbers?.join(", ")], ["Cross Brand Compatibility", part.crossBrandCompatibility?.join(", ")],
  ].filter((row): row is [string, string] => typeof row[1] === "string" && row[1].length > 0).map(([label, value]) => ({ label, value }));
  const trust = [part.warrantyMonths ? { icon: "verified_user", label: `${part.warrantyMonths} Month Warranty` } : null,
    part.partType?.type ? { icon: "workspace_premium", label: part.partType.type } : null,
    part.isInStock === true ? { icon: "inventory_2", label: "In Stock" } : null].filter((x): x is { icon: string; label: string } => Boolean(x));

  return <div className="min-h-screen bg-[#f5f5f6]"><ShopNavbar hideMobileHeader showMobileBottomNav={false} /><DetailHeader title={part.name} cartCount={cartCount} fallbackHref="/shop/spare-parts" />
    <main className="mx-auto w-full max-w-[1280px] px-3 pb-28 pt-14 sm:px-5 md:pt-20 lg:px-10 lg:pb-28 lg:pt-24">
      <nav className="mb-5 hidden text-sm text-zinc-500 lg:block"><Link href="/shop">Shop</Link> <span className="px-1">/</span> <Link href="/shop/spare-parts">Spare Parts</Link> <span className="px-1">/</span> <span className="text-zinc-900">{part.name}</span></nav>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,.92fr)] lg:gap-8 xl:gap-12">
        <section className="rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm sm:p-5 lg:sticky lg:top-20"><ImageGallery images={images} alt={part.name} /></section>
        <div className="space-y-3 sm:space-y-4">
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"><ProductSummary name={part.name} price={price} mrp={mrp} rating={Number(part.rating?.average || 0)} reviews={Number(part.rating?.count || 0)} description={part.description || ""} inStock={part.isInStock ?? Number(part.stock || 0) > 0} productLabel={part.partType?.type} /><div className="mt-3">{trust.length > 0 && <TrustChips items={trust} />}</div></section>
          {models.length > 0 && <CompatibilityChecker models={models} />}
          <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-bold">Installation service</h2><p className="text-xs text-zinc-500">Check options for your area</p></div><input aria-label="Pincode" inputMode="numeric" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))} placeholder="Pincode" className="w-28 rounded-lg bg-zinc-100 px-3 py-2 text-sm" /></div><button onClick={loadInstallation} className="mt-3 rounded-lg border px-3 py-2 text-sm font-semibold">Check installation</button>{installOptions.length > 0 && <div className="mt-3 space-y-2">{installOptions.map((option) => <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm"><input type="radio" checked={installId === option.id} onChange={() => setInstallId(option.id)} name="installation" /><span className="flex-1">{option.label}</span><b>{option.included ? "Included" : option.charge ? inr(option.charge) : "Free"}</b></label>)}</div>}</section>
          {specs.length > 0 && <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6"><h2 className="mb-3 font-bold">Part Specifications</h2><SpecsGrid specs={specs} cols="2" /></section>}
          {notice && <p role="status" className="rounded-xl bg-white p-3 text-sm text-zinc-700">{notice}{notice === "Added to cart" && <> · <Link className="font-bold text-primary" href="/cart">View cart</Link></>}</p>}
        </div>
      </div>
    </main>
    <QuantityAddToCart qty={qty} onQty={setQty} onAdd={addToCart} price={price} max={Math.max(1, Math.min(10, Number(part.stock || 1)))} disabled={busy || authLoading || part.isInStock === false || (!part.isInStock && Number(part.stock || 0) <= 0)} />
  </div>;
}
