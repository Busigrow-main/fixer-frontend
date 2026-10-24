"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

type Quote = { serviceable: boolean; itemsSubtotal: number; installationCharge: number; deliveryCharge: number; discount: number; total: number; issues: string[]; coupons?: { code: string; title: string }[] };
type Cart = { items?: { itemId: string; name: string; quantity: number; image?: string | null; unitPrice?: number; installationCharge?: number; productType?: string; sku?: string; slug?: string }[] };
type Contact = { name: string; phone: string; email: string; address: string; notes: string };
const money = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function CheckoutPage() {
  const router = useRouter();
  const { token, user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [contact, setContact] = useState<Contact>({ name: "", phone: "", email: "", address: "", notes: "" });
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) setContact((current) => ({ ...current, name: current.name || user.fullName || "", phone: current.phone || user.phone || "", email: current.email || user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.replace(`/login?redirect=${encodeURIComponent("/checkout")}`); return; }
    const controller = new AbortController();
    fetch(`${API_URL}/cart`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal })
      .then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message || "Could not load your cart."); return body as Cart; })
      .then((body) => { setCart(body); if (!body.items?.length) router.replace("/cart"); })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load your cart."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [authLoading, token, router]);

  useEffect(() => {
    if (!token || !cart?.items?.length || !/^\d{6}$/.test(pincode)) { setQuote(null); setQuoteLoading(false); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setQuoteLoading(true); setError("");
      try {
        const response = await fetch(`${API_URL}/checkout/quote`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ pincode }), signal: controller.signal });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Could not validate your order.");
        setQuote(body);
      } catch (cause) { if (!controller.signal.aborted) { setQuote(null); setError(cause instanceof Error ? cause.message : "Could not validate your order."); } }
      finally { if (!controller.signal.aborted) setQuoteLoading(false); }
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [token, pincode, cart?.items?.length]);

  const updateContact = (key: keyof Contact, value: string) => setContact((current) => ({ ...current, [key]: value }));
  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !quote || !quote.serviceable || quote.issues.length) return;
    setSubmitting(true); setError("");
    try {
      const response = await fetch(`${API_URL}/checkout`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ pincode, paymentMethod: "COD", contactData: { name: contact.name.trim(), phone: contact.phone.trim(), ...(contact.email.trim() ? { email: contact.email.trim() } : {}), address: contact.address.trim(), ...(contact.notes.trim() ? { notes: contact.notes.trim() } : {}) } }) });
      const body = await response.json().catch(() => ({}));
      if (response.status === 401) { router.replace(`/login?redirect=${encodeURIComponent("/checkout")}`); return; }
      if (!response.ok) throw new Error(body.message || "Could not place your order.");
      window.dispatchEvent(new Event("shop-cart-updated"));
      const orderId = body.orders?.[0]?._id;
      router.replace(orderId ? `/orders/${encodeURIComponent(orderId)}?placed=1` : "/orders");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not place your order."); }
    finally { setSubmitting(false); }
  };

  const canPlace = Boolean(quote?.serviceable && quote.issues.length === 0 && contact.name.trim() && contact.phone.trim() && contact.address.trim() && /^\d{6}$/.test(pincode));

  const placeDisabledWhy = !/^\d{6}$/.test(pincode)
    ? "Enter a 6-digit pincode to continue."
    : quote && !quote.serviceable
      ? "Enter a Patna pincode to place this order."
      : !contact.name.trim() || !contact.phone.trim() || !contact.address.trim()
        ? "Add your name, phone, and address to place this order."
        : "";

  return <div className="shop-shell min-h-screen bg-[#f6f6f6]"><ShopNavbar /><main className="mx-auto w-full max-w-5xl px-3 pb-28 pt-5 sm:px-5 md:pt-8">
    <Link href="/cart" className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-primary"><ArrowLeft className="h-4 w-4" /> Back to cart</Link>
    <header className="mb-5 mt-3"><p className="text-xs font-semibold uppercase tracking-[.14em] text-zinc-500">Fixxer Shop</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">Checkout</h1><p className="mt-1 text-sm text-zinc-500">Confirm delivery details and review the live order total.</p></header>
    {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    {loading ? <div role="status" className="flex min-h-56 items-center justify-center gap-2 rounded-2xl bg-white text-sm text-zinc-600"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /> Loading checkout…</div> : <form onSubmit={placeOrder} className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5"><h2 className="text-base font-extrabold text-zinc-950">Delivery contact</h2><p className="mt-1 text-xs text-zinc-500">We’ll use these details to arrange delivery and contact you about your order.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Full name" value={contact.name} onChange={(value) => updateContact("name", value)} required autoComplete="name" />
          <Field label="Phone number" value={contact.phone} onChange={(value) => updateContact("phone", value)} required inputMode="tel" autoComplete="tel" />
          <Field label="Email (optional)" value={contact.email} onChange={(value) => updateContact("email", value)} type="email" autoComplete="email" />
          <Field label="Delivery pincode" value={pincode} onChange={(value) => setPincode(value.replace(/\D/g, "").slice(0, 6))} required inputMode="numeric" autoComplete="postal-code" />
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-zinc-700">Full delivery address</span><textarea required autoComplete="street-address" value={contact.address} onChange={(event) => updateContact("address", event.target.value)} rows={3} maxLength={500} placeholder="House/flat, street, area, city" className="w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary" /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-xs font-semibold text-zinc-700">Delivery notes (optional)</span><textarea value={contact.notes} onChange={(event) => updateContact("notes", event.target.value)} rows={2} maxLength={500} placeholder="Landmark or instructions for the delivery team" className="w-full resize-y rounded-xl border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-primary" /></label>
        </div>
        <div className="mt-4 rounded-xl bg-zinc-50 p-3"><p className="text-xs font-bold text-zinc-800">Payment method</p><p className="mt-1 text-sm text-zinc-600">Cash on delivery</p><p className="mt-0.5 text-xs text-zinc-500">Payment is collected when your order is delivered.</p></div>
      </section>
      <aside className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 sm:p-5"><h2 className="text-base font-extrabold text-zinc-950">Order review</h2>
        <ul className="mt-4 space-y-3 border-b border-zinc-100 pb-4">
          {(cart?.items || []).map((item) => (
            <li key={item.itemId} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f6f6f6]">
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain p-1" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-zinc-900">{item.name}</p>
                <p className="mt-1 text-xs text-zinc-500">Qty {item.quantity}{item.installationCharge ? ` · Installation ${money(item.installationCharge)}` : ""}</p>
              </div>
              <p className="text-sm font-bold text-zinc-900">{money(Number(item.unitPrice || 0) * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-3 border-b border-zinc-100 pb-4 text-sm text-zinc-600"><Row label="Items total" value={quote ? money(quote.itemsSubtotal) : "Enter pincode"} /><Row label="Installation" value={quote ? (quote.installationCharge ? money(quote.installationCharge) : "—") : "—"} /><Row label="Delivery" value={quote ? (quote.deliveryCharge ? money(quote.deliveryCharge) : quote.serviceable ? "Free" : "Unavailable") : "Check pincode"} />{quote?.discount ? <Row label="Discount" value={`−${money(quote.discount)}`} positive /> : null}</div>
        <div className="mt-4 flex justify-between gap-3 text-lg font-extrabold text-zinc-950"><span>Total</span><span>{quoteLoading ? <LoaderCircle className="h-5 w-5 animate-spin" /> : quote ? money(quote.total) : "—"}</span></div>
        {quote?.issues?.length ? <ul className="mt-3 space-y-1 rounded-lg bg-red-50 p-3 text-xs text-red-700">{quote.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul> : null}
        {quote && !quote.serviceable && <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">We currently deliver in Patna. Try 800001 or 800014.</p>}
        <button type="submit" disabled={submitting || !canPlace} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-extrabold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-45">{submitting ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Placing order…</> : <>Place order <ArrowRight className="h-4 w-4" /></>}</button>
        {!canPlace && placeDisabledWhy && <p className="mt-2 text-center text-xs text-zinc-500">{placeDisabledWhy}</p>}
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Cash on delivery · pay when it arrives</p>
      </aside>
    </form>}
  </main></div>;
}

function Field({ label, value, onChange, required, type = "text", inputMode, autoComplete }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; inputMode?: "text" | "tel" | "numeric"; autoComplete?: string }) {
  return <label><span className="mb-1.5 block text-xs font-semibold text-zinc-700">{label}{required ? " *" : ""}</span><input type={type} inputMode={inputMode} autoComplete={autoComplete} required={required} maxLength={label === "Phone number" ? 15 : 120} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-zinc-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary" /></label>;
}

function Row({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className={`flex justify-between gap-3 ${positive ? "font-semibold text-emerald-700" : ""}`}><span>{label}</span><span>{value}</span></div>;
}
