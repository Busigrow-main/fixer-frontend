"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle, PackageCheck, ShoppingBag } from "lucide-react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

type OrderItem = { partId?: { _id?: string; name?: string; imageUrls?: string[]; price?: number; sku?: string; compatibility?: string[] }; quantity?: number; warrantyMonthsAtPurchase?: number };
type Order = {
  _id: string;
  orderType?: "part" | "appliance" | string;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: OrderItem[];
  applianceItem?: { applianceId?: string; name?: string; brand?: string; modelNumber?: string; quantity?: number; price?: number; slug?: string };
  invoiceData?: { totalAmount?: number; lineItems?: { description?: string }[] };
  courierTracking?: { courierName?: string; trackingNumber?: string };
};
type Filter = "all" | "part" | "appliance" | "installation";

const money = (value: number) => `\u20B9${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
const hasInstallation = (order: Order) => Boolean(order.invoiceData?.lineItems?.some((line) => /installation|install/i.test(line.description || "")));
const orderSteps = ["Order received", "Processing", "Dispatched", "Delivered"];
const statusStep: Record<string, number> = { PENDING: 0, PROCESSING: 1, DISPATCHED: 2, DELIVERED: 3 };

function responseOrders(payload: unknown): Order[] {
  if (Array.isArray(payload)) return payload as Order[];
  if (payload && typeof payload === "object") {
    const data = payload as { data?: unknown; orders?: unknown };
    if (Array.isArray(data.data)) return data.data as Order[];
    if (Array.isArray(data.orders)) return data.orders as Order[];
  }
  return [];
}

export default function OrdersPage() {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [applianceImages, setApplianceImages] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingOrder, setAddingOrder] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.replace(`/login?redirect=${encodeURIComponent("/orders")}`); return; }
    const controller = new AbortController();
    fetch(`${API_URL}/user/part-orders`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (response.status === 401) { router.replace(`/login?redirect=${encodeURIComponent("/orders")}`); return []; }
        if (!response.ok) throw new Error(body.message || "Could not load your orders.");
        return responseOrders(body);
      })
      .then((data) => { if (!controller.signal.aborted) setOrders(data); })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load your orders."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [authLoading, token, router]);

  useEffect(() => {
    const slugs = [...new Set(orders.filter((order) => order.orderType === "appliance" && order.applianceItem?.slug).map((order) => order.applianceItem!.slug!))];
    if (!slugs.length) return;
    const controller = new AbortController();
    Promise.all(slugs.map(async (slug) => {
      try {
        const response = await fetch(`${API_URL}/appliances/${encodeURIComponent(slug)}`, { cache: "no-store", signal: controller.signal });
        const body = await response.json().catch(() => ({}));
        const image = body.product?.images?.[0] || body.product?.imageUrl;
        return image ? [slug, image] as const : null;
      } catch {
        return null;
      }
    })).then((items) => {
      if (!controller.signal.aborted) setApplianceImages((current) => ({ ...current, ...Object.fromEntries(items.filter((item): item is readonly [string, string] => Boolean(item))) }));
    });
    return () => controller.abort();
  }, [orders]);

  const filtered = useMemo(() => filter === "all" ? orders : filter === "installation" ? orders.filter(hasInstallation) : orders.filter((order) => (order.orderType || "part") === filter), [orders, filter]);
  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All orders", count: orders.length },
    { id: "part", label: "Spare parts", count: orders.filter((order) => (order.orderType || "part") === "part").length },
    { id: "appliance", label: "Appliances", count: orders.filter((order) => order.orderType === "appliance").length },
    { id: "installation", label: "With installation", count: orders.filter(hasInstallation).length },
  ];

  const buyAgain = async (order: Order) => {
    if (!token) return;
    setAddingOrder(order._id); setError("");
    try {
      let applianceId = order.applianceItem?.applianceId;
      if (order.orderType === "appliance" && !applianceId && order.applianceItem?.slug) {
        const productResponse = await fetch(`${API_URL}/appliances/${encodeURIComponent(order.applianceItem.slug)}`, { cache: "no-store" });
        const productBody = await productResponse.json().catch(() => ({}));
        if (productResponse.ok) applianceId = productBody.product?.id || productBody.product?._id || productBody.id || productBody._id;
      }
      const lines = order.orderType === "appliance"
        ? applianceId ? [{ productType: "appliance", productId: applianceId, quantity: order.applianceItem?.quantity || 1 }] : []
        : (order.items || []).filter((item) => item.partId?._id).map((item) => ({ productType: "part", productId: item.partId!._id!, quantity: item.quantity || 1 }));
      if (!lines.length) throw new Error("This order’s items are no longer available to add again.");
      for (const line of lines) {
        const response = await fetch(`${API_URL}/cart/items`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(line) });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || "Could not add this order to your cart.");
      }
      window.dispatchEvent(new Event("shop-cart-updated"));
      router.push("/cart");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not add this order to your cart."); }
    finally { setAddingOrder(""); }
  };

  return (
    <div className="shop-shell min-h-screen bg-[#f6f6f6]">
      <ShopNavbar mobileTitle="Orders" mobileBackHref="/shop" />
      <main className="mx-auto w-full max-w-3xl px-3 pb-28 pt-5 sm:px-5 md:pt-8">
        <div className="mb-4 hidden items-end justify-between gap-3 md:flex">
          <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-zinc-500">Fixxer Shop</p><h1 className="mt-1 text-2xl font-extrabold tracking-tight text-zinc-950 sm:text-3xl">Orders</h1><p className="mt-1 text-sm text-zinc-500">Track your Fixxer Shop deliveries and installation services.</p></div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-primary sm:inline-flex">Continue shopping <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="sticky top-14 z-30 -mx-3 mb-3 border-y border-zinc-200 bg-[#f8f9fa]/95 px-3 py-2 backdrop-blur sm:static sm:mx-0 sm:rounded-xl sm:border sm:bg-white sm:p-1.5">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setFilter(tab.id)} aria-pressed={filter === tab.id} className={`min-h-10 shrink-0 rounded-lg px-3 text-xs font-semibold transition sm:text-sm ${filter === tab.id ? "bg-primary text-white shadow-sm" : "text-zinc-600 hover:bg-zinc-100"}`}>{tab.label}<span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${filter === tab.id ? "bg-white/20" : "bg-zinc-100"}`}>{tab.count}</span></button>)}
          </div>
        </div>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}<button type="button" onClick={() => window.location.reload()} className="ml-2 font-bold underline">Retry</button></div>}
        {loading ? <div aria-busy="true" className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-2xl bg-white" />)}</div> : filtered.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white px-6 text-center shadow-sm"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-500"><ShoppingBag className="h-5 w-5" /></span><h2 className="mt-3 text-lg font-bold text-zinc-900">No {filter === "all" ? "orders" : filter === "part" ? "spare part orders" : filter === "appliance" ? "appliance orders" : "installation orders"} yet</h2><p className="mt-1 max-w-sm text-sm text-zinc-500">Orders placed through the Fixxer shop will appear here with their latest status.</p><Link href="/shop" className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-white">Browse the shop</Link></div>
        ) : <div className="space-y-3">{filtered.map((order) => {
          const appliance = order.orderType === "appliance";
          const firstPart = order.items?.[0]?.partId;
          const title = appliance ? order.applianceItem?.name || "Appliance order" : firstPart?.name || "Spare part order";
          const image = appliance ? applianceImages[order.applianceItem?.slug || ""] : firstPart?.imageUrls?.[0];
          const status = String(order.status || "PENDING").replaceAll("_", " ");
          const step = statusStep[order.status] ?? -1;
          const total = Number(order.invoiceData?.totalAmount || (appliance ? (order.applianceItem?.price || 0) * (order.applianceItem?.quantity || 1) : 0));
          return <article key={order._id} className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-[0_2px_10px_rgba(15,23,42,.05)]">
            <div className="flex items-center justify-between gap-2 px-3.5 pt-3.5 sm:px-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${order.status === "CANCELLED" || order.status === "RETURNED" ? "bg-rose-100 text-rose-700" : order.status === "DELIVERED" ? "bg-teal-100 text-teal-800" : "bg-blue-100 text-blue-800"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span><span className="text-[10px] text-zinc-500">#{order._id.slice(-8).toUpperCase()} <span className="ml-2">{date(order.createdAt)}</span></span></div>
            <div className="flex gap-3 px-3.5 py-3.5 sm:px-4"><div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100 sm:h-14 sm:w-14 text-zinc-400">{image ? <Image src={image} alt={title} fill unoptimized sizes="56px" className="object-contain p-1" /> : appliance ? <span className="material-symbols-outlined text-2xl">devices</span> : <PackageCheck className="h-6 w-6" />}</div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-[13px] font-bold leading-snug text-zinc-900">{title}</p><p className="mt-0.5 text-[11px] text-zinc-500">{appliance ? `${order.applianceItem?.brand || "Appliance"}${order.applianceItem?.modelNumber ? ` · ${order.applianceItem.modelNumber}` : ""} · Qty ${order.applianceItem?.quantity || 1}` : `${order.items?.length || 0} item${order.items?.length === 1 ? "" : "s"} · Qty ${order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}`}</p><div className="mt-1 flex items-center gap-2"><strong className="text-sm font-extrabold text-zinc-950">{total ? money(total) : "Total on invoice"}</strong>{order.paymentStatus === "PAID" && <span className="text-[10px] font-semibold text-teal-700">Paid</span>}</div>{!appliance && order.items?.[0]?.warrantyMonthsAtPurchase ? <p className="mt-0.5 text-[10px] font-medium text-teal-700">✓ {order.items[0].warrantyMonthsAtPurchase} month warranty</p> : null}</div></div>
            {order.status !== "CANCELLED" && order.status !== "RETURNED" && step >= 0 && <div className="px-4 pb-3"><ol className="relative grid grid-cols-4 gap-1" aria-label="Shop order progress"><span aria-hidden="true" className="absolute left-[12.5%] right-[12.5%] top-[9px] h-0.5 bg-zinc-200"><span className="block h-full bg-teal-700" style={{ width: `${(step / 3) * 100}%` }} /></span>{orderSteps.map((label, index) => <li key={label} className="relative text-center"><div className={`relative z-10 mx-auto flex h-5 w-5 items-center justify-center rounded-full ${index <= step ? "bg-teal-700 text-white" : "bg-zinc-200 text-zinc-400"}`}>{index <= step ? <Check className="h-3 w-3" /> : <span className="text-[9px] font-bold">{index + 1}</span>}</div><p className={`mt-1 text-[9px] font-semibold leading-tight ${index <= step ? "text-zinc-700" : "text-zinc-400"}`}>{label}</p></li>)}</ol></div>}
            {order.status === "CANCELLED" || order.status === "RETURNED" ? <p className="mx-3.5 mb-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-800 sm:mx-4">This shop order was {status.toLowerCase()}.</p> : null}
            {hasInstallation(order) && <div className="mx-3.5 mb-3 flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-2 text-[10px] font-semibold text-teal-800 sm:mx-4"><Check className="h-3.5 w-3.5" /> Installation service included with this shop order</div>}
            {order.courierTracking?.trackingNumber && <div className="mx-3.5 mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800 sm:mx-4"><b>{order.courierTracking.courierName || "Courier"}</b> · {order.courierTracking.trackingNumber}</div>}
            <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 bg-zinc-50/70 p-2.5"><button type="button" onClick={() => void buyAgain(order)} disabled={addingOrder === order._id} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-white text-[10px] font-bold text-zinc-700 disabled:opacity-50">{addingOrder === order._id ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ShoppingBag className="h-3.5 w-3.5" />} Buy again</button><Link href={`/orders/${encodeURIComponent(order._id)}#tracking`} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg bg-primary text-[10px] font-bold text-white">View / track order <ArrowRight className="h-3 w-3" /></Link></div>
          </article>;
        })}</div>}
      </main>
    </div>
  );
}
