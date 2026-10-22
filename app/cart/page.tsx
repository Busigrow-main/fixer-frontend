"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, MapPin, Minus, Plus, ShieldCheck, ShoppingCart, Trash2 } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

type CartItem = {
  itemId: string;
  productId: string;
  productType: "part" | "appliance";
  sku?: string;
  slug?: string;
  name: string;
  image?: string | null;
  unitPrice: number;
  originalPrice?: number | null;
  quantity: number;
  installationOptionId?: string | null;
  installationCharge: number;
  lineTotal: number;
  installationTotal: number;
};
type Coupon = { code: string; title: string; discountText: string };
type Cart = { cartId: string; items: CartItem[]; coupons: Coupon[]; itemsSubtotal: number; installationCharge: number; discount: number; total: number };
type InstallOption = { id: string; label: string; charge: number; included: boolean };
type Quote = { serviceable: boolean; deliveryCharge: number; itemsSubtotal: number; installationCharge: number; discount: number; total: number; issues: string[] };

const money = (amount: number) => `₹${Number(amount || 0).toLocaleString("en-IN")}`;

export default function CartPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyItem, setBusyItem] = useState("");
  const [busyAction, setBusyAction] = useState(false);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showCouponEntry, setShowCouponEntry] = useState(false);
  const [showPincodeEntry, setShowPincodeEntry] = useState(false);
  const [pincode, setPincode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [expandedInstall, setExpandedInstall] = useState("");
  const [installOptions, setInstallOptions] = useState<Record<string, InstallOption[]>>({});
  const [selectedInstall, setSelectedInstall] = useState<Record<string, string>>({});
  const [installError, setInstallError] = useState("");

  const loadCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      if (response.status === 401) { router.replace(`/login?redirect=${encodeURIComponent("/cart")}`); return; }
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || "Could not load your cart.");
      setCart(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your cart.");
    } finally { setLoading(false); }
  }, [token, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.replace(`/login?redirect=${encodeURIComponent("/cart")}`); return; }
    void loadCart();
  }, [authLoading, token, router, loadCart]);

  useEffect(() => {
    if (!token || !cart?.items.length || !/^\d{6}$/.test(pincode)) { setQuote(null); setQuoteError(""); setQuoteLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setQuoteLoading(true); setQuoteError("");
      try {
        const response = await fetch(`${API_URL}/checkout/quote`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ pincode }), signal: controller.signal });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Could not check delivery for this pincode.");
        setQuote(body);
      } catch (cause) {
        if (!controller.signal.aborted) { setQuote(null); setQuoteError(cause instanceof Error ? cause.message : "Could not check delivery for this pincode."); }
      } finally { if (!controller.signal.aborted) setQuoteLoading(false); }
    }, 350);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [token, pincode, cart?.cartId, cart?.itemsSubtotal, cart?.installationCharge, cart?.discount, cart?.items.length]);

  const changeItem = async (item: CartItem, quantity: number) => {
    if (!token) return;
    setBusyItem(item.itemId); setError("");
    try {
      const response = quantity < 1
        ? await fetch(`${API_URL}/cart/items/${encodeURIComponent(item.itemId)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
        : await fetch(`${API_URL}/cart/items/${encodeURIComponent(item.itemId)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ quantity }) });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) { router.replace(`/login?redirect=${encodeURIComponent("/cart")}`); return; }
      if (!response.ok) throw new Error(body.message || "Could not update your cart.");
      setCart(body); window.dispatchEvent(new Event("shop-cart-updated"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update your cart."); }
    finally { setBusyItem(""); }
  };

  const clearCart = async () => {
    if (!token || !cart?.items.length || !window.confirm("Remove all items from your cart?")) return;
    setBusyAction(true); setError("");
    try {
      const response = await fetch(`${API_URL}/cart/items`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Could not clear your cart.");
      setCart(body); window.dispatchEvent(new Event("shop-cart-updated"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not clear your cart."); }
    finally { setBusyAction(false); }
  };

  const applyCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !couponCode.trim()) return;
    setBusyAction(true); setError("");
    try {
      const response = await fetch(`${API_URL}/cart/coupons`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: couponCode.trim() }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "This coupon could not be applied.");
      setCart(body); setCouponCode(""); window.dispatchEvent(new Event("shop-cart-updated"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "This coupon could not be applied."); }
    finally { setBusyAction(false); }
  };

  const removeCoupon = async (code: string) => {
    if (!token) return;
    setBusyAction(true); setError("");
    try {
      const response = await fetch(`${API_URL}/cart/coupons/${encodeURIComponent(code)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Could not remove coupon.");
      setCart(body);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not remove coupon."); }
    finally { setBusyAction(false); }
  };

  const loadInstallOptions = async (item: CartItem) => {
    if (!token || !/^\d{6}$/.test(pincode)) { setShowPincodeEntry(true); setInstallError("Enter a valid 6-digit delivery pincode first."); return; }
    setInstallError(""); setBusyItem(item.itemId);
    try {
      const params = new URLSearchParams({ productId: item.productId, productType: item.productType, pincode });
      const response = await fetch(`${API_URL}/installation/options?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Could not load installation options.");
      setInstallOptions((current) => ({ ...current, [item.itemId]: body.options || [] }));
      setSelectedInstall((current) => ({ ...current, [item.itemId]: item.installationOptionId || body.options?.[0]?.id || "" }));
      setExpandedInstall(item.itemId);
    } catch (cause) { setInstallError(cause instanceof Error ? cause.message : "Could not load installation options."); }
    finally { setBusyItem(""); }
  };

  const saveInstallOption = async (item: CartItem) => {
    const installationOptionId = selectedInstall[item.itemId];
    if (!token || !installationOptionId) return;
    setBusyItem(item.itemId); setInstallError("");
    try {
      const response = await fetch(`${API_URL}/cart/items/${encodeURIComponent(item.itemId)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ installationOptionId, pincode }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || "Could not update installation.");
      setCart(body); setExpandedInstall(""); window.dispatchEvent(new Event("shop-cart-updated"));
    } catch (cause) { setInstallError(cause instanceof Error ? cause.message : "Could not update installation."); }
    finally { setBusyItem(""); }
  };

  const finalTotal = quote?.total ?? cart?.total ?? 0;

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <ShopNavbar mobileTitle="Cart" mobileBackHref="/shop" showMobileBottomNav={false} />
      <main className="mx-auto w-full max-w-6xl px-3 pb-32 pt-5 sm:px-5 md:pb-16 md:pt-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-zinc-500">Fixxer Shop</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">My Cart <span className="text-base font-medium text-zinc-500">{cart ? `(${cart.items.length} ${cart.items.length === 1 ? "item" : "items"})` : ""}</span></h1>
          </div>
          {!!cart?.items.length && <button type="button" onClick={() => void clearCart()} disabled={busyAction} className="text-xs font-semibold text-zinc-500 underline decoration-zinc-300 underline-offset-4 hover:text-primary disabled:opacity-50">Clear all</button>}
        </div>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        {loading ? (
          <div role="status" className="flex min-h-64 items-center justify-center gap-3 rounded-2xl bg-white text-sm font-medium text-zinc-600"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /> Loading your cart…</div>
        ) : error && !cart ? (
          <div className="rounded-2xl bg-white p-8 text-center"><p className="text-sm text-zinc-600">{error}</p><button type="button" onClick={() => void loadCart()} className="mt-4 font-semibold text-primary">Try again</button></div>
        ) : !cart?.items.length ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-center shadow-sm">
            <ShoppingCart className="h-9 w-9 text-zinc-300" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold text-zinc-900">Your cart is empty</h2>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">Browse genuine spare parts and appliances, then add what you need here.</p>
            <Link href="/shop" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white">Explore the shop</Link>
          </div>
        ) : (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
            <section aria-label="Cart items" className="space-y-3">
              {cart.items.map((item) => {
                const detailHref = item.productType === "part" ? `/shop/spare-parts/${encodeURIComponent(item.sku || item.slug || "")}` : SHOP_APPLIANCES_HREF;
                const busy = busyItem === item.itemId;
                const isExpanded = expandedInstall === item.itemId;
                return (
                  <article key={item.itemId} className="rounded-2xl border border-zinc-100 bg-white p-3 shadow-[0_2px_10px_rgba(15,23,42,.04)] sm:p-4">
                    <div className="grid grid-cols-[56px_minmax(0,1fr)] gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
                      <Link href={detailHref} aria-label={`View ${item.name}`} className="relative aspect-square overflow-hidden rounded-xl bg-zinc-50">
                        {item.image ? <Image src={item.image} alt={item.name} fill unoptimized sizes="96px" className="object-contain p-2" /> : <span className="flex h-full items-center justify-center text-xs text-zinc-400">No image</span>}
                      </Link>
                      <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link href={detailHref} className="line-clamp-2 text-sm font-bold leading-snug text-zinc-900 hover:text-primary sm:text-base">{item.name}</Link>
                            <p className="mt-1 text-xs text-zinc-500">{item.productType === "part" ? "Spare part" : "Appliance"}{item.sku ? ` · SKU ${item.sku}` : ""}</p>
                          </div>
                          <button type="button" aria-label={`Remove ${item.name}`} disabled={busy} onClick={() => void changeItem(item, 0)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-rose-50 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
                        </div>
                        <div className="mt-2 flex flex-wrap items-baseline gap-2">
                          <strong className="text-lg font-extrabold text-zinc-950">{money(item.unitPrice)}</strong>
                          {item.originalPrice && item.originalPrice > item.unitPrice && <span className="text-xs text-zinc-400 line-through">{money(item.originalPrice)}</span>}
                          <span className="ml-auto hidden text-xs text-zinc-500 sm:block">Line total <b className="text-zinc-800">{money(item.lineTotal)}</b></span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <div className="inline-flex h-9 items-center rounded-lg border border-zinc-200" aria-label={`Quantity ${item.quantity}`}>
                            <button type="button" aria-label="Decrease quantity" disabled={busy || item.quantity <= 1} onClick={() => void changeItem(item, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center text-zinc-700 disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                            <span className="min-w-7 text-center text-sm font-semibold">{busy ? <LoaderCircle className="mx-auto h-3.5 w-3.5 animate-spin" /> : item.quantity}</span>
                            <button type="button" aria-label="Increase quantity" disabled={busy} onClick={() => void changeItem(item, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-zinc-700 disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                          <button type="button" disabled={busy} onClick={() => isExpanded ? setExpandedInstall("") : void loadInstallOptions(item)} className="inline-flex min-h-9 items-center justify-end gap-1 rounded-lg bg-zinc-50 px-2.5 text-right text-[11px] font-semibold text-zinc-700 disabled:opacity-50 sm:text-xs">{busy && isExpanded ? "Loading…" : item.installationOptionId === "included" ? "Standard installation included" : item.installationCharge > 0 ? `Installation · ${money(item.installationCharge)} each` : item.installationOptionId === "skip" ? "No installation · Change" : "Add installation service"}<ArrowRight className="h-3 w-3 shrink-0" /></button>
                        </div>
                      </div>
                    </div>
                    {isExpanded && <div className="mt-3 rounded-xl bg-zinc-50 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-bold text-zinc-900">Installation options</h3><p className="text-xs text-zinc-500">Options and pricing for your pincode</p></div><label className="flex items-center gap-1.5 text-xs text-zinc-500"><MapPin className="h-3.5 w-3.5" /><input inputMode="numeric" maxLength={6} value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))} placeholder="6-digit pincode" className="w-28 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-primary" /></label></div>
                      {installOptions[item.itemId]?.map((option) => <label key={option.id} className="mt-2 flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-200 bg-white p-2.5 text-xs"><input type="radio" name={`install-${item.itemId}`} checked={selectedInstall[item.itemId] === option.id} onChange={() => setSelectedInstall((current) => ({ ...current, [item.itemId]: option.id }))} /><span className="flex-1 font-medium text-zinc-800">{option.label}</span><b>{option.included ? "Included" : option.charge ? money(option.charge) : "Free"}</b></label>)}
                      {installError && <p role="alert" className="mt-2 text-xs text-red-600">{installError}</p>}
                      <button type="button" onClick={() => void saveInstallOption(item)} disabled={busy || !installOptions[item.itemId]?.length || !selectedInstall[item.itemId]} className="mt-3 min-h-10 w-full rounded-lg bg-zinc-900 px-3 text-xs font-bold text-white disabled:opacity-40">Save installation choice</button>
                    </div>}
                  </article>
                );
              })}
            </section>

            <section className="rounded-2xl border border-zinc-100 bg-white p-3.5 shadow-sm sm:p-4 lg:col-start-1 lg:row-start-2">
              <button type="button" onClick={() => setShowCouponEntry((open) => !open)} className="flex w-full items-center gap-3 text-left">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-primary"><span className="text-sm font-black">%</span></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-zinc-900">Apply coupon</span><span className="block text-[11px] text-zinc-500">{cart.coupons.length ? `${cart.coupons.length} coupon${cart.coupons.length === 1 ? "" : "s"} applied` : "Enter a coupon code to save"}</span></span>
                <ArrowRight className={`h-4 w-4 text-zinc-400 transition-transform ${showCouponEntry ? "rotate-90" : ""}`} />
              </button>
              {showCouponEntry && <form onSubmit={applyCoupon} className="mt-3 flex gap-2"><input value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} maxLength={24} placeholder="Enter coupon code" className="h-10 min-w-0 flex-1 rounded-lg border border-zinc-200 px-3 text-sm uppercase outline-none focus:border-primary" /><button type="submit" disabled={busyAction || !couponCode.trim()} className="rounded-lg bg-primary px-4 text-xs font-bold text-white disabled:opacity-40">Apply</button></form>}
              {cart.coupons.map((coupon) => <div key={coupon.code} className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><span><b>{coupon.code}</b> · {coupon.title} ({coupon.discountText})</span><button type="button" onClick={() => void removeCoupon(coupon.code)} className="font-bold underline">Remove</button></div>)}
            </section>

            <aside className="space-y-3 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
              <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="text-base font-extrabold text-zinc-950">Price details</h2>
                <div className="mt-3 space-y-2.5 border-b border-zinc-100 pb-3 text-sm">
                  <div className="flex justify-between gap-3 text-zinc-600"><span>Items total</span><span>{money(quote?.itemsSubtotal ?? cart.itemsSubtotal)}</span></div>
                  <div className="flex justify-between gap-3 text-zinc-600"><span>Installation</span><span>{(quote?.installationCharge ?? cart.installationCharge) ? money(quote?.installationCharge ?? cart.installationCharge) : "—"}</span></div>
                  <div className="flex justify-between gap-3 text-zinc-600"><span>Delivery charges</span><button type="button" onClick={() => setShowPincodeEntry((open) => !open)} className={quote?.serviceable ? "font-semibold text-emerald-700" : "font-semibold text-teal-700 underline underline-offset-2"}>{quoteLoading ? "Checking…" : quote?.serviceable ? (quote.deliveryCharge ? money(quote.deliveryCharge) : "Free") : "Check pincode"}</button></div>
                  {(quote?.discount ?? cart.discount) > 0 && <div className="flex justify-between gap-3 text-emerald-700"><span>Discount</span><span>−{money(quote?.discount ?? cart.discount)}</span></div>}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-lg font-extrabold text-zinc-950"><span>Total</span><span>{quoteLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : money(finalTotal)}</span></div>
                <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">Final delivery availability is confirmed for your pincode during checkout.</p>
                <Link href="/checkout" className="mt-4 hidden h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white shadow-md transition hover:brightness-105 lg:flex"><ShieldCheck className="h-4 w-4" /> Proceed to checkout <ArrowRight className="h-4 w-4" /></Link>
                {(showPincodeEntry || pincode) && <label className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5"><MapPin className="h-4 w-4 shrink-0 text-primary" /><input inputMode="numeric" maxLength={6} value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))} placeholder="Enter 6-digit pincode" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400" /></label>}
                {quoteError && <p role="alert" className="mt-2 text-xs text-red-600">{quoteError}</p>}
                {quote && !quote.serviceable && <p role="status" className="mt-2 text-xs text-red-600">Delivery is not available for this pincode.</p>}
              </section>

            </aside>
          </div>
        )}
      </main>

      {!!cart?.items.length && !loading && <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white px-3 pb-[calc(0.5rem_+_env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-8px_20px_-16px_rgba(0,0,0,.35)] md:hidden"><Link href="/checkout" className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white shadow-md"><span>Proceed to Checkout</span><ArrowRight className="h-4 w-4" /></Link><p className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-zinc-500"><ShieldCheck className="h-3 w-3" /> Secure payment · UPI, Cards, Net Banking, COD</p></div>}
    </div>
  );
}
