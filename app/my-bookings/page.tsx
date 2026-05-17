"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import { openRetailInvoice } from "@/app/admin/utils/jobsheet";
import { openOrderInvoice } from "@/app/admin/utils/order-invoice";
import { SHOP_APPLIANCES_HREF } from "@/app/lib/shop-routes";

type TabType = "repairs" | "parts" | "appliances";

function isApplianceOrder(order: { orderType?: string }) {
  return order.orderType === "appliance";
}

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface" />}>
      <MyBookingsContent />
    </Suspense>
  );
}

function MyBookingsContent() {
  const { token, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const showSuccess = searchParams.get("success") === "true";
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TabType>("repairs");
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const partOrders = useMemo(
    () => orders.filter((o) => !isApplianceOrder(o)),
    [orders],
  );
  const applianceOrders = useMemo(
    () => orders.filter(isApplianceOrder),
    [orders],
  );
  const hasApplianceBookings = applianceOrders.length > 0;

  useEffect(() => {
    if (token) {
      fetchAllHistory();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  useEffect(() => {
    if (loading) return;
    if (tabParam === "appliances" && hasApplianceBookings) {
      setActiveTab("appliances");
    } else if (tabParam === "parts") {
      setActiveTab("parts");
    } else if (tabParam === "repairs") {
      setActiveTab("repairs");
    }
  }, [loading, hasApplianceBookings, tabParam]);

  const fetchAllHistory = async () => {
    setLoading(true);
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/user/part-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/user/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
    } catch {
      setError("Network error. Could not load history.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaimWarranty = async (bookingId: string) => {
    if (
      !token ||
      !confirm(
        "Are you sure you want to claim warranty for this service? We will dispatch a master technician for a warranty check.",
      )
    )
      return;

    try {
      const res = await fetch(`${API_URL}/user/bookings/${bookingId}/claim-warranty`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Warranty claim received! A new check-up booking has been created.");
        fetchAllHistory();
      } else {
        const data = await res.json();
        alert(data.message || "Could not claim warranty.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const getWarrantyStatus = (booking: any) => {
    if (booking.status !== "COMPLETED" || !booking.warrantyExpiry) return null;

    const expiry = new Date(booking.warrantyExpiry);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: "Expired", isActive: false };
    return { label: `Active (${diffDays} Days Left)`, isActive: true };
  };

  const activeCount =
    activeTab === "repairs"
      ? bookings.length
      : activeTab === "appliances"
        ? applianceOrders.length
        : partOrders.length;

  const emptyCopy = {
    repairs: {
      icon: "construction",
      title: "No repairs found",
      body: "You haven't booked any master technician visits yet. Schedule one from the services page.",
      href: "/services",
      cta: "Browse Services",
    },
    parts: {
      icon: "shopping_basket",
      title: "No spare part orders found",
      body: "Your spare part enquiries will appear here once you place them.",
      href: "/spare-parts",
      cta: "Browse Spare Parts",
    },
    appliances: {
      icon: "ac_unit",
      title: "No appliance enquiries found",
      body: "Your AC and appliance enquiries will appear here after you submit one from the shop.",
      href: SHOP_APPLIANCES_HREF,
      cta: "Browse Appliances",
    },
  } as const;

  return (
    <>
      <Navbar />
      <main className="pt-14 md:pt-20 pb-14 bg-surface min-h-screen">
        <section className="container mx-auto px-6 md:px-10 max-w-7xl pt-8 md:pt-14">
          {showSuccess && (
            <div className="mb-8 p-6 rounded-3xl bg-primary/10 border border-primary/20 flex items-center gap-4 text-primary animate-in fade-in slide-in-from-top-4 duration-500">
              <span className="material-symbols-outlined text-3xl">check_circle</span>
              <div>
                <h3 className="font-bold text-lg">Request Successful!</h3>
                <p className="text-sm opacity-90">
                  Your request has been received. You can track its live status below.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/20 text-error text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="font-headline text-4xl md:text-6xl text-on-surface">
                My Bookings
              </h1>
              <p className="mt-3 text-sm md:text-base text-on-surface-variant max-w-xl leading-relaxed">
                Track repair visits, spare part orders
                {hasApplianceBookings ? ", and appliance enquiries" : ""} in one place.
              </p>
            </div>

            <div
              className="w-full min-w-0 -mx-6 px-6 md:mx-0 md:px-0"
              role="tablist"
              aria-label="Booking categories"
            >
              <div className="flex flex-nowrap items-center gap-1 overflow-x-auto no-scrollbar rounded-2xl border border-outline bg-surface-container-low p-1.5">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "repairs"}
                  onClick={() => setActiveTab("repairs")}
                  className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 ${activeTab === "repairs" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  <span className="material-symbols-outlined text-lg">home_repair_service</span>
                  Repairs
                  {bookings.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center">
                      {bookings.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "parts"}
                  onClick={() => setActiveTab("parts")}
                  className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 ${activeTab === "parts" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  <span className="material-symbols-outlined text-lg">package_2</span>
                  Spare Parts
                  {partOrders.length > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center">
                      {partOrders.length}
                    </span>
                  )}
                </button>
                {hasApplianceBookings && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === "appliances"}
                    onClick={() => setActiveTab("appliances")}
                    className={`shrink-0 whitespace-nowrap px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 ${activeTab === "appliances" ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    <span className="material-symbols-outlined text-lg">ac_unit</span>
                    Appliances
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-[10px] flex items-center justify-center">
                      {applianceOrders.length}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {!token && !authLoading ? (
            <div className="rounded-3xl border border-outline bg-white p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">lock</span>
              <p className="mt-4 text-on-surface text-lg font-bold">Authentication Required</p>
              <p className="mt-2 text-sm text-on-surface-variant max-w-md mx-auto">
                Please login to view your order history and tracking details.
              </p>
              <a
                href="/login"
                className="mt-8 inline-flex h-12 px-8 bg-primary text-on-primary rounded-xl items-center font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-95 transition-transform"
              >
                Login Now
              </a>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-on-surface-variant font-medium">Syncing records...</p>
            </div>
          ) : activeCount === 0 ? (
            <div className="rounded-3xl border border-outline bg-white p-14 text-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-4 block">
                {emptyCopy[activeTab].icon}
              </span>
              <p className="text-on-surface text-xl font-headline">{emptyCopy[activeTab].title}</p>
              <p className="mt-2 text-sm text-on-surface-variant max-w-xs mx-auto">
                {emptyCopy[activeTab].body}
              </p>
              <a
                href={emptyCopy[activeTab].href}
                className="mt-8 inline-flex text-xs font-black text-primary uppercase tracking-widest hover:underline"
              >
                {emptyCopy[activeTab].cta}
              </a>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "repairs" &&
                bookings.map((booking) => (
                  <RepairBookingCard
                    key={booking._id}
                    booking={booking}
                    getWarrantyStatus={getWarrantyStatus}
                    onClaimWarranty={handleClaimWarranty}
                  />
                ))}

              {activeTab === "parts" &&
                partOrders.map((order) => (
                  <PartOrderCard key={order._id} order={order} />
                ))}

              {activeTab === "appliances" &&
                applianceOrders.map((order) => (
                  <ApplianceEnquiryCard key={order._id} order={order} />
                ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

function RepairBookingCard({
  booking,
  getWarrantyStatus,
  onClaimWarranty,
}: {
  booking: any;
  getWarrantyStatus: (b: any) => { label: string; isActive: boolean } | null;
  onClaimWarranty: (id: string) => void;
}) {
  const warranty = getWarrantyStatus(booking);

  return (
    <article className="rounded-3xl border border-outline bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="bg-surface-container-low px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-outline gap-3">
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 rounded-lg bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest">
            Repair #{booking._id.slice(-6).toUpperCase()}
          </div>
          <p className="text-xs text-on-surface-variant font-medium">
            Ref: {booking.serviceId?.name || "Appliance Repair"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${booking.status === "PENDING" ? "bg-amber-500 animate-pulse" : "bg-green-500"}`}
          />
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
            {booking.status}
          </span>
        </div>
      </div>

      <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl icon-filled">
                {booking.serviceId?.icon || "settings"}
              </span>
            </div>
            <div>
              <h3 className="font-headline text-2xl text-on-surface">
                {booking.serviceId?.name} Service
              </h3>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed max-w-lg">
                {booking.description ||
                  "Detailed inspection and repair of your appliance by a certified master technician."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant/40">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-2">
                Technician Status
              </p>
              {booking.status === "PENDING" ? (
                <p className="text-sm font-medium text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 inline-block">
                  Awaiting Dispatch
                </p>
              ) : (
                <p className="text-sm font-medium text-primary">Assigned to Master Tech</p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-black text-on-surface-variant mb-2">
                Visit Address
              </p>
              <p className="text-sm font-medium text-on-surface">
                {booking.addressData?.text}, {booking.addressData?.zip}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline flex flex-col justify-center text-center">
          <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-2">
            Service Charges
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface">Verified</p>
          <p className="text-xs text-on-surface-variant mt-2">
            Final pricing shared after inspection. No upfront payment.
          </p>
          <div className="flex flex-col items-center justify-center gap-2 my-4">
            {warranty ? (
              <div
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${warranty.isActive ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-50 text-gray-500 border border-gray-100"}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {warranty.isActive ? "verified_user" : "history"}
                </span>
                Warranty {warranty.label}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-xs">
                <span className="material-symbols-outlined text-sm">shield_with_heart</span>
                {booking.jobDetails?.warrantyPeriod || "60 Days"} Warranty Included
              </div>
            )}
          </div>

          {booking.status === "COMPLETED" && warranty?.isActive && (
            <button
              type="button"
              onClick={() => onClaimWarranty(booking._id)}
              className="mb-3 w-full h-11 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors border border-primary/20"
            >
              <span className="material-symbols-outlined text-lg">medical_services</span>
              Claim Warranty
            </button>
          )}

          {booking.isBilled && (
            <button
              type="button"
              onClick={() => openRetailInvoice(booking)}
              className="mt-4 w-full h-11 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
              <span className="material-symbols-outlined text-lg">description</span>
              Download Service Bill
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function PartOrderCard({ order }: { order: any }) {
  return (
    <article className="rounded-3xl border border-outline bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <OrderCardHeader order={order} label={`Order #${order._id.slice(-8).toUpperCase()}`} />
      <div className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ContactBlock order={order} title="Shipping To" icon="local_shipping" />
          <ItemsBlock order={order} showInvoice />
        </div>
      </div>
    </article>
  );
}

function ApplianceEnquiryCard({ order }: { order: any }) {
  const item = order.applianceItem;
  const productHref = item?.slug
    ? `${SHOP_APPLIANCES_HREF}/ac/${item.slug}`
    : SHOP_APPLIANCES_HREF;

  return (
    <article className="rounded-3xl border border-outline bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <OrderCardHeader
        order={order}
        label={`Enquiry #${order._id.slice(-8).toUpperCase()}`}
        badge="Appliance"
      />
      <div className="p-6 md:p-8 space-y-8">
        {item && (
          <div className="rounded-2xl border border-primary/15 bg-primary/5 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-3">
              Product Enquired
            </p>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h3 className="font-headline text-xl text-on-surface leading-snug">{item.name}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {item.brand}
                  {item.modelNumber ? ` · Model ${item.modelNumber}` : ""}
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">Quantity: {item.quantity}</p>
              </div>
              <p className="text-2xl font-headline font-bold text-primary shrink-0">
                {item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "Price on request"}
              </p>
            </div>
            <Link
              href={productHref}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-primary hover:underline"
            >
              View product
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ContactBlock order={order} title="Your Details & Visit" icon="person" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">support_agent</span>
              What happens next
            </p>
            <ul className="space-y-3 text-sm text-on-surface-variant">
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                Our team confirms stock and final pricing
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                We call you to schedule delivery or installation
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary text-lg shrink-0">check_circle</span>
                Status updates appear here as your enquiry progresses
              </li>
            </ul>
          </div>
        </div>

        {order.isBilled && (
          <OrderInvoiceButton order={order} label="Download Invoice" />
        )}
      </div>
    </article>
  );
}

function OrderInvoiceButton({ order, label }: { order: any; label: string }) {
  return (
    <button
      type="button"
      onClick={() => openOrderInvoice(order)}
      className="w-full h-11 rounded-xl bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[0.98] transition-all shadow-lg shadow-primary/20"
    >
      <span className="material-symbols-outlined text-lg">receipt_long</span>
      {label}
    </button>
  );
}

function OrderCardHeader({
  order,
  label,
  badge,
}: {
  order: any;
  label: string;
  badge?: string;
}) {
  return (
    <div className="bg-surface-container-low px-6 py-4 flex flex-col md:flex-row md:items-center justify-between border-b border-outline gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="px-3 py-1 rounded-lg bg-white border border-outline text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          {label}
        </div>
        {badge && (
          <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider">
            {badge}
          </span>
        )}
        <p className="text-xs text-on-surface-variant font-medium">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${order.status === "PENDING" ? "bg-amber-500" : "bg-green-500"}`}
        />
        <span className="text-[10px] font-black uppercase tracking-widest text-on-surface">
          {order.status}
        </span>
      </div>
    </div>
  );
}

function ContactBlock({
  order,
  title,
  icon,
}: {
  order: any;
  title: string;
  icon: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">{icon}</span>
        {title}
      </p>
      <h3 className="font-bold text-on-surface">{order.contactData.name}</h3>
      <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
        {order.contactData.address}
        <br />
        Phone: {order.contactData.phone}
        {order.contactData.email && (
          <>
            <br />
            Email: {order.contactData.email}
          </>
        )}
        {order.contactData.preferredDate && (
          <>
            <br />
            Preferred visit: {order.contactData.preferredDate}
            {order.contactData.preferredTime ? ` at ${order.contactData.preferredTime}` : ""}
          </>
        )}
        {order.contactData.notes && (
          <>
            <br />
            Notes: {order.contactData.notes}
          </>
        )}
      </p>
    </div>
  );
}

function ItemsBlock({ order, showInvoice }: { order: any; showInvoice?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] font-black text-on-surface-variant mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-lg">inventory_2</span>
        Items Summary
      </p>
      <div className="space-y-3">
        {(order.items ?? []).map((item: any, idx: number) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center font-bold text-xs">
                {item.quantity}x
              </span>
              <span className="text-on-surface font-medium">
                {item.partId?.name || "Genuine Component"}
              </span>
            </div>
            <span className="font-bold text-primary">{item.partId?.price || "TBD"}</span>
          </div>
        ))}
      </div>

      {order.courierTracking && (
        <div className="mt-6 p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Live Tracking</p>
          <p className="text-sm mt-1 font-bold">
            {order.courierTracking.courierName}: {order.courierTracking.trackingNumber}
          </p>
        </div>
      )}

      {showInvoice && order.isBilled && (
        <div className="mt-6">
          <OrderInvoiceButton order={order} label="Download Invoice" />
        </div>
      )}
    </div>
  );
}
