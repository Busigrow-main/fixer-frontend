"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, LoaderCircle, PackageCheck, Truck } from "lucide-react";
import ShopNavbar from "@/app/components/shop/ShopNavbar";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";

type Order = {
  _id: string;
  orderType?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
  contactData?: { name?: string; phone?: string; email?: string; address?: string; notes?: string };
  items?: { quantity?: number; priceAtPurchase?: number | string; partId?: { name?: string; sku?: string; imageUrls?: string[]; warrantyMonths?: number } }[];
  applianceItem?: { name?: string; brand?: string; modelNumber?: string; quantity?: number; price?: number; slug?: string };
  invoiceData?: { totalAmount?: number; lineItems?: { description: string; quantity: number; unitPrice: number; amount: number }[] };
  courierTracking?: { courierName?: string; trackingNumber?: string };
};
type Tracking = { status?: string; paymentStatus?: string; paymentMethod?: string | null; courierTracking?: { courierName?: string; trackingNumber?: string } | null; createdAt?: string; updatedAt?: string };
const money = (value: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value?: string) => value ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "";

export default function OrderDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(false);

  useEffect(() => { setPlaced(new URLSearchParams(window.location.search).get("placed") === "1"); }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!token) { router.replace(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`); return; }
    const controller = new AbortController();
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/user/part-orders/${encodeURIComponent(id)}`, { headers, cache: "no-store", signal: controller.signal }),
      fetch(`${API_URL}/user/part-orders/${encodeURIComponent(id)}/tracking`, { headers, cache: "no-store", signal: controller.signal }),
    ]).then(async ([orderResponse, trackingResponse]) => {
      const body = await orderResponse.json().catch(() => ({}));
      if (orderResponse.status === 401) { router.replace(`/login?redirect=${encodeURIComponent(`/orders/${id}`)}`); return; }
      if (!orderResponse.ok) throw new Error(body.message || "Could not load this order.");
      setOrder(body);
      if (trackingResponse.ok) setTracking(await trackingResponse.json());
    }).catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this order."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [authLoading, token, id, router]);

  const status = String(tracking?.status || order?.status || "PENDING").toUpperCase();
  const appliance = order?.orderType === "appliance";
  const stages = ["PENDING", "PROCESSING", "DISPATCHED", "DELIVERED"];
  const stage = stages.indexOf(status);
  const items = order?.items || [];
  const title = appliance ? order?.applianceItem?.name || "Appliance order" : items[0]?.partId?.name || "Spare part order";
  const total = Number(order?.invoiceData?.totalAmount || (appliance ? (order?.applianceItem?.price || 0) * (order?.applianceItem?.quantity || 1) : 0));

  return <div className="shop-shell -mt-14 min-h-screen bg-[#f6f6f6] md:mt-0"><ShopNavbar mobileTitle="Order" mobileBackHref="/orders" /><main className="mx-auto w-full max-w-3xl px-3 pb-28 pt-2 sm:px-5 md:pt-8">
    <Link href="/orders" className="hidden items-center gap-2 text-sm font-medium text-zinc-600 hover:text-primary md:inline-flex"><ArrowLeft className="h-4 w-4" /> All orders</Link>
    {loading ? <div role="status" className="mt-5 flex min-h-64 items-center justify-center gap-2 rounded-2xl bg-white text-sm text-zinc-600"><LoaderCircle className="h-5 w-5 animate-spin text-primary" /> Loading order…</div> : error || !order ? <div role="alert" className="mt-5 rounded-2xl border border-zinc-200 bg-white p-8 text-center"><h1 className="text-base font-medium text-zinc-900">Order unavailable</h1><p className="mt-2 text-sm text-zinc-600">{error || "This order could not be found."}</p><Link href="/orders" className="mt-4 inline-flex font-medium text-primary">Return to orders</Link></div> : <>
      <header className="mb-4 mt-1 hidden md:block"><p className="text-xs font-medium uppercase tracking-[.14em] text-zinc-500">Order #{order._id.slice(-8).toUpperCase()}</p><h1 className="mt-1 text-2xl font-semibold text-zinc-950">{title}</h1><p className="mt-1 text-sm text-zinc-500">Placed {date(order.createdAt)}</p></header>
      {placed && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Order placed successfully. We’ll update its status here.</p>}

      <section id="tracking" className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[15px] font-medium text-zinc-900">Order status</h2><p className="mt-1 text-xs text-zinc-500">Status last updated {date(tracking?.updatedAt || order.updatedAt)}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium ${status === "CANCELLED" || status === "RETURNED" ? "bg-red-50 text-red-700" : status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>{status.replaceAll("_", " ")}</span></div>
        {stage >= 0 ? <ol className="mt-6 grid grid-cols-4 gap-1" aria-label="Order progress">{["Order placed", "Processing", "Dispatched", "Delivered"].map((label, index) => <li key={label} className="relative text-center"><div className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${index <= stage ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-400"}`}>{index <= stage ? <Check className="h-4 w-4" /> : <span className="text-[10px]">{index + 1}</span>}</div><p className={`mt-2 text-[10px] sm:text-xs ${index <= stage ? "text-zinc-600" : "text-zinc-400"}`}>{label}</p></li>)}</ol> : <p className="mt-4 rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">This order is {status.toLowerCase().replaceAll("_", " ")}.</p>}
        {(tracking?.courierTracking?.trackingNumber || order.courierTracking?.trackingNumber) && <div className="mt-4 flex items-start gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900"><Truck className="mt-0.5 h-4 w-4 shrink-0" /><p><span className="font-medium">{tracking?.courierTracking?.courierName || order.courierTracking?.courierName || "Courier"}</span><br />Tracking number: {tracking?.courierTracking?.trackingNumber || order.courierTracking?.trackingNumber}</p></div>}
      </section>

      <section className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"><h2 className="text-[15px] font-medium text-zinc-900">Items</h2><div className="mt-3 divide-y divide-zinc-100">{appliance ? <div className="flex items-center gap-3 py-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400"><PackageCheck className="h-5 w-5" /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-zinc-900">{order.applianceItem?.name}</p><p className="text-xs text-zinc-500">Qty {order.applianceItem?.quantity || 1}</p></div><span className="text-sm font-medium">{money((order.applianceItem?.price || 0) * (order.applianceItem?.quantity || 1))}</span></div> : items.map((item, index) => <div key={`${item.partId?.sku || "part"}-${index}`} className="flex items-center gap-3 py-3"><div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-50 text-zinc-300">{item.partId?.imageUrls?.[0] ? <Image src={item.partId.imageUrls[0]} alt={item.partId.name || "Spare part"} fill unoptimized sizes="48px" className="object-contain p-1" /> : <PackageCheck className="h-5 w-5" />}</div><div className="min-w-0 flex-1"><p className="text-sm font-medium text-zinc-900">{item.partId?.name || "Spare part"}</p><p className="text-xs text-zinc-500">{item.partId?.sku || ""} · Qty {item.quantity || 1}</p></div></div>)}</div>
        {order.invoiceData?.lineItems?.map((line, index) => <div key={`${line.description}-${index}`} className="flex justify-between gap-3 py-1.5 text-xs text-zinc-500"><span>{line.description} × {line.quantity}</span><span>{money(line.amount)}</span></div>)}
        <div className="mt-2 flex justify-between border-t border-zinc-100 pt-3 text-[15px] font-semibold text-zinc-950"><span>Order total</span><span>{total ? money(total) : "To be confirmed"}</span></div>
      </section>

      {order.contactData && <section className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5"><h2 className="text-[15px] font-medium text-zinc-900">Delivery details</h2><p className="mt-2 text-sm font-medium text-zinc-800">{order.contactData.name}</p><p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-600">{order.contactData.address}</p><p className="mt-1 text-sm text-zinc-600">{order.contactData.phone}{order.contactData.email ? ` · ${order.contactData.email}` : ""}</p>{order.contactData.notes && <p className="mt-2 text-xs text-zinc-500">{order.contactData.notes}</p>}</section>}
      <div className="mt-4 flex flex-wrap gap-2"><Link href="/shop" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-800 sm:flex-none">Continue shopping</Link><Link href="/orders" className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white sm:flex-none">All orders</Link></div>
    </>}
  </main></div>;
}
