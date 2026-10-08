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
import {
  buildCustomerPricingSummary,
  formatInr,
  formatScheduleLabel,
  getCustomerStatusView,
  statusToneClasses,
} from "@/app/lib/customer-booking";

type TabType = "repairs" | "parts" | "help" | "appliances";
type CancellationFeedback = {
  tone: "success" | "error";
  message: string;
} | null;

type PartOrderHistoryItem = {
  _id: string;
  orderType?: "part" | "appliance" | string;
  applianceItem?: unknown;
  items?: unknown[];
  [key: string]: unknown;
};

function isPartOrder(order: PartOrderHistoryItem) {
  return order.orderType?.toLowerCase() === "part";
}

function isApplianceOrder(order: PartOrderHistoryItem) {
  return order.orderType?.toLowerCase() === "appliance";
}

function normalizePartOrdersResponse(payload: unknown): PartOrderHistoryItem[] {
  if (Array.isArray(payload)) return payload as PartOrderHistoryItem[];
  if (payload && typeof payload === "object") {
    const response = payload as { data?: unknown; orders?: unknown };
    if (Array.isArray(response.data)) return response.data as PartOrderHistoryItem[];
    if (Array.isArray(response.orders)) return response.orders as PartOrderHistoryItem[];
  }
  throw new Error("Unexpected /user/part-orders response shape.");
}

/* =====================================================================
   PRESENTATION HELPERS (no data logic)
   ===================================================================== */

const cardCls =
  "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-12px_rgba(0,0,0,0.12)]";

const outlineBtn =
  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-3.5 text-[13px] font-semibold text-zinc-800 transition hover:bg-zinc-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:flex-none";

const softBtn =
  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-primary/20 bg-primary/10 px-3.5 text-[13px] font-semibold text-primary transition hover:bg-primary/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:flex-none";

const darkBtn =
  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-zinc-900 px-3.5 text-[13px] font-semibold text-white transition hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-300 sm:flex-none";

function orderTone(status: string) {
  if (status === "CANCELLED")
    return { dot: "bg-red-500", pill: "border-red-200 bg-red-50 text-red-700" };
  if (status === "PENDING")
    return { dot: "bg-amber-500", pill: "border-amber-200 bg-amber-50 text-amber-800" };
  return { dot: "bg-green-500", pill: "border-green-200 bg-green-50 text-green-800" };
}

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({ dot, pill, label }: { dot: string; pill: string; label: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function IconTile({ icon, filled = false }: { icon: string; filled?: boolean }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <span className={`material-symbols-outlined text-[22px] ${filled ? "icon-filled" : ""}`}>{icon}</span>
    </span>
  );
}

function MetaRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 text-[13px] leading-snug text-zinc-700">
      <span className="material-symbols-outlined mt-px text-[18px] text-primary/70">{icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Label({ icon, children }: { icon?: string; children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-500">
      {icon && <span className="material-symbols-outlined text-[16px] text-primary/70">{icon}</span>}
      {children}
    </p>
  );
}

/* =====================================================================
   PAGE
   ===================================================================== */

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f4f3]" />}>
      <MyBookingsContent />
    </Suspense>
  );
}

function MyBookingsContent() {
  const { token, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(searchParams.get("success") === "true");
  const tabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState<TabType>("repairs");
  const [orders, setOrders] = useState<PartOrderHistoryItem[]>([]);
  const [helpRequests, setHelpRequests] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [appliances, setAppliances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelTarget, setCancelTarget] = useState<{
    type: "booking" | "order";
    id: string;
  } | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancellationFeedback, setCancellationFeedback] =
    useState<CancellationFeedback>(null);

  useEffect(() => {
    if (!showSuccess) return;

    const timer = setTimeout(() => {
      setShowSuccess(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showSuccess]);

  useEffect(() => {
    if (!cancellationFeedback) return;

    const timer = setTimeout(() => {
      setCancellationFeedback(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [cancellationFeedback]);

  useEffect(() => {
    if (!cancelTarget) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cancelTarget]);

  const partOrders = useMemo(() => orders.filter(isPartOrder), [orders]);
  const applianceOrders = useMemo(() => orders.filter(isApplianceOrder), [orders]);
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
    } else if (tabParam === "help") {
      setActiveTab("help");
    } else if (tabParam === "repairs") {
      setActiveTab("repairs");
    }
  }, [loading, hasApplianceBookings, tabParam]);

  const fetchAllHistory = async () => {
    setLoading(true);
    try {
      const [ordersRes, bookingsRes, appliancesRes, helpRes] = await Promise.all([
        fetch(`${API_URL}/user/part-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/user/bookings`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/user/appliances`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/user/part-help`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ordersRes.ok) {
        const payload = await ordersRes.json();
        setOrders(normalizePartOrdersResponse(payload));
      } else {
        setError("Could not load spare part orders.");
      }
      if (bookingsRes.ok) setBookings(await bookingsRes.json());
      if (appliancesRes.ok) {
        const data = await appliancesRes.json();
        setAppliances(Array.isArray(data) ? data : []);
      }
      if (helpRes.ok) {
        const data = await helpRes.json();
        setHelpRequests(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Network error. Could not load history.");
    } finally {
      setLoading(false);
    }
  };

  const updateHelpRequest = async (id: string, action: "accept" | "decline") => {
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/user/part-help/${id}/${action}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Could not update this request.");
      }
      await fetchAllHistory();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update this request.");
    }
  };

  const handleClaimWarranty = async (bookingId: string) => {
    if (!token) return;
    const confirmed = confirm(
      "Claim warranty for this completed service?\n\n" +
        "We will create a warranty-check visit with a master technician.\n\n" +
        "Coverage: labour for the same fault (60 days from completion) and genuine Fixxer-installed parts (6 months), subject to exclusions in the Warranty Policy.\n\n" +
        "Open /warranty for full terms before confirming.",
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/user/bookings/${bookingId}/claim-warranty`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert("Warranty claim received! A new check-up booking has been created.");
        fetchAllHistory();
      } else {
        const data = await res.json().catch(() => ({}));
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
        alert(message || "Could not claim warranty.");
      }
    } catch {
      alert("Network error.");
    }
  };

  const handleCancelBooking = async (
    bookingId: string,
    reason: string,
  ): Promise<boolean> => {
    if (!token) return false;

    try {
      const res = await fetch(
        `${API_URL}/user/bookings/${bookingId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (res.ok) {
        setCancellationFeedback({
          tone: "success",
          message: "Your booking has been cancelled successfully.",
        });
        await fetchAllHistory();
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
        setCancellationFeedback({
          tone: "error",
          message: message || "Could not cancel booking. Please try again.",
        });
      }
    } catch {
      setCancellationFeedback({
        tone: "error",
        message: "Network error. Your booking was not cancelled.",
      });
    }
    return false;
  };

  const handleCancelOrder = async (
    orderId: string,
    reason: string,
  ): Promise<boolean> => {
    if (!token) return false;

    try {
      const res = await fetch(
        `${API_URL}/user/part-orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (res.ok) {
        setCancellationFeedback({
          tone: "success",
          message: "Your order has been cancelled successfully.",
        });
        await fetchAllHistory();
        return true;
      } else {
        const data = await res.json().catch(() => ({}));
        const message = Array.isArray(data.message)
          ? data.message.join(" ")
          : data.message;
        setCancellationFeedback({
          tone: "error",
          message: message || "Could not cancel order. Please try again.",
        });
      }
    } catch {
      setCancellationFeedback({
        tone: "error",
        message: "Network error. Your order was not cancelled.",
      });
    }
    return false;
  };

  const openCancellationModal = (type: "booking" | "order", id: string) => {
    setCancelTarget({ type, id });
    setCancellationReason("");
  };

  const closeCancellationModal = () => {
    if (cancelling) return;
    setCancelTarget(null);
    setCancellationReason("");
  };

  const submitCancellation = async () => {
    const reason = cancellationReason.trim();

    if (!cancelTarget) return;

    if (!reason) {
      setCancellationFeedback({
        tone: "error",
        message: "Please enter a cancellation reason before continuing.",
      });
      return;
    }

    if (reason.length > 500) {
      setCancellationFeedback({
        tone: "error",
        message: "Cancellation reason cannot exceed 500 characters.",
      });
      return;
    }

    setCancelling(true);

    try {
      const cancelled =
        cancelTarget.type === "booking"
          ? await handleCancelBooking(cancelTarget.id, reason)
          : await handleCancelOrder(cancelTarget.id, reason);

      if (cancelled) {
        setCancelTarget(null);
        setCancellationReason("");
      }
    } finally {
      setCancelling(false);
    }
  };

  const getWarrantyStatus = (booking: any) => {
    const finished =
      booking.jobClosed ||
      booking.status === "COMPLETED" ||
      booking.status === "PAYMENT_COLLECTED";
    if (!finished) return null;

    const expiry = booking.warrantyExpiry
      ? new Date(booking.warrantyExpiry)
      : null;
    if (!expiry) {
      return { label: "Active (60 Days)", isActive: true };
    }

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
        : activeTab === "help"
          ? helpRequests.length
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
    help: {
      icon: "support_agent",
      title: "No part-help requests found",
      body: "Not sure which part you need? Ask a Fixxer expert to identify it for you.",
      href: "/spare-parts/help",
      cta: "Ask an Expert",
    },
    appliances: {
      icon: "ac_unit",
      title: "No appliance enquiries found",
      body: "Your AC and appliance enquiries will appear here after you submit one from the shop.",
      href: SHOP_APPLIANCES_HREF,
      cta: "Browse Appliances",
    },
  } as const;

  const tabs: { key: TabType; label: string; icon: string; count: number }[] = [
    { key: "repairs", label: "Repairs", icon: "home_repair_service", count: bookings.length },
    { key: "help", label: "Part help", icon: "support_agent", count: helpRequests.length },
    { key: "parts", label: "Parts", icon: "package_2", count: partOrders.length },
    ...(hasApplianceBookings
      ? [{ key: "appliances" as TabType, label: "Appliances", icon: "ac_unit", count: applianceOrders.length }]
      : []),
  ];

  return (
    <>
      <Navbar />

      {/* Toast */}
      {cancellationFeedback && (
        <div
          className="fixed inset-x-3 top-[68px] z-[110] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-300 sm:inset-x-auto sm:right-4 sm:top-24 sm:w-96"
          role={cancellationFeedback.tone === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <div className="flex items-start gap-3 p-3.5">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                cancellationFeedback.tone === "success"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <span className="material-symbols-outlined icon-filled text-[20px]">
                {cancellationFeedback.tone === "success" ? "check_circle" : "error"}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">
                {cancellationFeedback.tone === "success"
                  ? "Cancellation complete"
                  : "Cancellation not completed"}
              </p>
              <p className="mt-0.5 text-[13px] leading-snug text-zinc-600">
                {cancellationFeedback.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCancellationFeedback(null)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100"
              aria-label="Dismiss cancellation message"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div
            className={`h-0.5 ${cancellationFeedback.tone === "success" ? "bg-green-500" : "bg-red-500"}`}
          />
        </div>
      )}

      <main className="min-h-screen bg-[#f7f4f3] pb-14 pt-0 md:pt-20">
        {/* soft warm glow behind the header */}
        <div className="bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-transparent">
          <div className="mx-auto w-full max-w-[720px] px-4 pb-1 pt-6 md:pt-10">
            {showSuccess && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="material-symbols-outlined icon-filled text-[22px] text-green-600">check_circle</span>
                <div>
                  <h3 className="text-sm font-semibold text-green-900">Request successful</h3>
                  <p className="text-[13px] text-green-800/80">
                    Your request has been received. Track its live status below.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] font-medium text-red-700"
              >
                <span className="material-symbols-outlined text-[18px]">error</span>
                <span>{error}</span>
              </div>
            )}

            <header className="mb-4">
              <h1 className="font-headline text-[1.75rem] leading-tight tracking-tight text-zinc-900 sm:text-3xl">
                My activity
              </h1>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
                Repairs, spare parts, part help
                {hasApplianceBookings ? " and appliance enquiries" : ""} in one place.
              </p>
            </header>
          </div>
        </div>

        <section className="mx-auto w-full max-w-[720px] px-4">
          {/* Tabs: white pill bar, active tab filled red */}
          <div
            className="sticky top-14 z-30 -mx-4 mb-4 bg-[#f7f4f3]/90 px-4 py-2 backdrop-blur md:top-20"
            role="tablist"
            aria-label="Booking categories"
          >
            <div
              className="grid gap-1 rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-sm"
              style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}
            >
              {tabs.map((t) => {
                const active = activeTab === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 sm:min-h-[44px] sm:flex-row sm:gap-2 sm:px-3 sm:text-[13px] ${
                      active
                        ? "bg-primary text-on-primary shadow-[0_6px_16px_-6px_rgba(200,16,46,0.6)]"
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    <span className="relative">
                      <span className="material-symbols-outlined block text-[21px] sm:text-[19px]">{t.icon}</span>
                      {t.count > 0 && (
                        <span
                          className={`absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none sm:hidden ${
                            active ? "bg-white text-primary" : "bg-primary text-on-primary"
                          }`}
                        >
                          {t.count}
                        </span>
                      )}
                    </span>
                    <span className="truncate">{t.label}</span>
                    {t.count > 0 && (
                      <span
                        className={`hidden rounded-full px-1.5 text-[11px] font-bold leading-[18px] sm:inline ${
                          active ? "bg-white/25 text-on-primary" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {t.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Registered appliances */}
          {appliances.length > 0 && (
            <div className={`${cardCls} mb-4 p-3.5`}>
              <div className="flex items-start gap-2.5">
                <IconTile icon="qr_code_2" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-zinc-900">Your registered appliances</p>
                  <p className="text-xs text-zinc-500">Linked to your phone by serial number.</p>
                </div>
              </div>
              <div className="no-scrollbar -mx-3.5 mt-3 flex gap-2 overflow-x-auto px-3.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                {appliances.map((a) => (
                  <div
                    key={a._id || a.serialNumber}
                    className="shrink-0 rounded-xl border border-primary/15 bg-primary/[0.04] px-3 py-2"
                  >
                    <p className="break-all text-[13px] font-semibold text-zinc-900">{a.serialNumber}</p>
                    <p className="text-xs text-zinc-500">
                      {[a.brand, a.modelNumber].filter(Boolean).join(" · ") || "Appliance"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {!token && !authLoading ? (
            <div className={`${cardCls} px-5 py-10 text-center`}>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[28px]">lock</span>
              </span>
              <p className="mt-3 text-base font-semibold text-zinc-900">Authentication required</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] text-zinc-500">
                Enter your mobile number to view order history and tracking.
              </p>
              <a
                href="/login"
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-on-primary shadow-[0_8px_18px_-8px_rgba(200,16,46,0.6)] transition active:scale-[0.98] sm:w-auto"
              >
                Continue with phone
              </a>
            </div>
          ) : loading ? (
            <div className="space-y-3" aria-busy="true" aria-label="Syncing records">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`${cardCls} p-4`}>
                  <div className="flex gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-primary/10" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/2 animate-pulse rounded bg-zinc-100" />
                      <div className="h-3 w-1/3 animate-pulse rounded bg-zinc-100" />
                    </div>
                  </div>
                  <div className="mt-4 h-3 w-full animate-pulse rounded bg-zinc-100" />
                  <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          ) : activeCount === 0 ? (
            <div className={`${cardCls} px-5 py-10 text-center`}>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[28px]">{emptyCopy[activeTab].icon}</span>
              </span>
              <p className="mt-3 text-base font-semibold text-zinc-900">{emptyCopy[activeTab].title}</p>
              <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                {emptyCopy[activeTab].body}
              </p>
              <a
                href={emptyCopy[activeTab].href}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-on-primary shadow-[0_8px_18px_-8px_rgba(200,16,46,0.6)] transition active:scale-[0.98] sm:w-auto"
              >
                {emptyCopy[activeTab].cta}
              </a>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300">
              {activeTab === "repairs" &&
                bookings.map((booking) => (
                  <RepairBookingCard
                    key={booking._id}
                    booking={booking}
                    getWarrantyStatus={getWarrantyStatus}
                    onClaimWarranty={handleClaimWarranty}
                    onCancelBooking={(id) => openCancellationModal("booking", id)}
                  />
                ))}

              {activeTab === "parts" &&
                partOrders.map((order) => (
                  <PartOrderCard
                    key={order._id}
                    order={order}
                    onCancelOrder={(id) => openCancellationModal("order", id)}
                  />
                ))}

              {activeTab === "help" &&
                helpRequests.map((request) => (
                  <article key={request._id} className={cardCls}>
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        <IconTile icon="support_agent" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <h2 className="text-[15px] font-semibold leading-snug text-zinc-900">
                              {request.applianceType}
                              {request.applianceBrand ? ` · ${request.applianceBrand}` : ""}
                            </h2>
                            <StatusPill
                              dot="bg-primary"
                              pill="border-primary/20 bg-primary/10 text-primary"
                              label={request.status}
                            />
                          </div>
                          <p className="mt-0.5 text-xs text-zinc-500">
                            Part help #{String(request._id).slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-[13px] leading-relaxed text-zinc-600">
                        {request.partDescription}
                      </p>

                      {request.adminResponse && (
                        <div className="mt-3 rounded-xl border border-primary/15 bg-primary/[0.05] p-3">
                          <p className="text-xs font-bold text-primary">Fixxer&apos;s response</p>
                          <p className="mt-1 text-[13px] leading-relaxed text-zinc-800">
                            {request.adminResponse}
                          </p>
                          {request.quotedPrice != null && (
                            <p className="mt-2 text-xl font-bold text-primary">
                              {formatInr(request.quotedPrice)}
                              <span className="ml-2 text-xs font-medium text-zinc-500">
                                {request.isAvailable ? "Available" : "Currently unavailable"}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {request.status === "QUOTED" && (
                      <div className="grid grid-cols-2 gap-2 border-t border-zinc-100 bg-zinc-50/60 p-3">
                        <button
                          type="button"
                          onClick={() => updateHelpRequest(request._id, "decline")}
                          className="h-11 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 active:scale-[0.98]"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => updateHelpRequest(request._id, "accept")}
                          className="h-11 rounded-xl bg-primary text-sm font-semibold text-on-primary shadow-[0_8px_18px_-8px_rgba(200,16,46,0.6)] transition active:scale-[0.98]"
                        >
                          Accept quote
                        </button>
                      </div>
                    )}
                  </article>
                ))}

              {activeTab === "appliances" &&
                applianceOrders.map((order) => (
                  <ApplianceEnquiryCard key={order._id} order={order} />
                ))}
            </div>
          )}
        </section>
      </main>

      {/* Cancellation dialog */}
      {cancelTarget && (
        <div
          className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overflow-y-auto overscroll-contain bg-black/40 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancellation-dialog-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeCancellationModal();
            }
          }}
        >
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-2xl animate-in fade-in duration-200 sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <span className="material-symbols-outlined text-[22px]">cancel</span>
                </span>
                <div>
                  <h2
                    id="cancellation-dialog-title"
                    className="font-headline text-xl font-bold leading-tight text-zinc-900"
                  >
                    Cancel {cancelTarget.type === "booking" ? "booking" : "order"}?
                  </h2>
                  <p className="mt-1 text-[13px] leading-snug text-zinc-500">
                    Tell us why. This is saved with your {cancelTarget.type === "booking" ? "booking" : "order"}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeCancellationModal}
                disabled={cancelling}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 disabled:opacity-50"
                aria-label="Close cancellation dialog"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <label htmlFor="cancellation-reason" className="mb-1.5 mt-4 block text-[13px] font-semibold text-zinc-800">
              Cancellation reason
            </label>
            <textarea
              id="cancellation-reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              maxLength={500}
              rows={4}
              autoFocus
              placeholder="Tell us why you want to cancel..."
              disabled={cancelling}
              style={{ fontSize: "16px" }}
              className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-base leading-6 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60 sm:text-sm"
            />
            <div className="mt-1.5 flex items-center justify-between text-xs text-zinc-500">
              <span>A short explanation is enough.</span>
              <span className="font-semibold">{cancellationReason.length}/500</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={submitCancellation}
                disabled={cancelling || !cancellationReason.trim()}
                className="order-1 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 sm:order-2"
              >
                {cancelling ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Cancelling...
                  </>
                ) : (
                  "Confirm cancellation"
                )}
              </button>
              <button
                type="button"
                onClick={closeCancellationModal}
                disabled={cancelling}
                className="order-2 h-11 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50 sm:order-1"
              >
                Keep {cancelTarget.type === "booking" ? "booking" : "order"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

/* =====================================================================
   REPAIR CARD
   ===================================================================== */

function RepairBookingCard({
  booking,
  getWarrantyStatus,
  onClaimWarranty,
  onCancelBooking,
}: {
  booking: any;
  getWarrantyStatus: (b: any) => { label: string; isActive: boolean } | null;
  onClaimWarranty: (id: string) => void;
  onCancelBooking: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const warranty = getWarrantyStatus(booking);
  const technician = booking.technician || (
    typeof booking.technicianId === "object" && booking.technicianId?.name
      ? booking.technicianId
      : null
  );
  const techName =
    typeof technician === "object" && technician?.name ? technician.name : null;
  const techPhone =
    typeof technician === "object" && technician?.phone ? technician.phone : null;
  const hasTechnicianAssigned = !!(
    booking.hasTechnicianAssigned ||
    techName ||
    (booking.technicianId &&
      (typeof booking.technicianId === "string" ||
        typeof booking.technicianId === "object"))
  );

  const statusView =
    booking.statusView ||
    getCustomerStatusView(booking.status, {
      isWarrantyClaim: booking.isWarrantyClaim || booking.serviceType === "WARRANTY_CHECK",
      arrivalAt: booking.arrivalAt,
    });
  const tone = statusToneClasses(statusView.tone);
  const pricing = buildCustomerPricingSummary(booking);
  const scheduleLabel = formatScheduleLabel(booking);
  const showAmount = pricing.estimatedAmount > 0 || pricing.totalAmount > 0;
  const displayAmount = pricing.isFinal || pricing.hasExtras
    ? pricing.totalAmount
    : pricing.estimatedAmount || pricing.serviceTotal;

  const partsList = booking.isWarrantyClaim ? booking.originalParts : booking.installedParts;
  const hasParts =
    (booking.installedParts?.length ?? 0) > 0 || (booking.originalParts?.length ?? 0) > 0;

  const canClaim = warranty?.isActive && !booking.claimBookingIds?.length;
  const canBill =
    booking.isBilled ||
    booking.jobClosed ||
    booking.paymentStatus === "PAID_CASH" ||
    booking.paymentStatus === "PAID_ONLINE";
  const canCancel = ["PENDING", "CONFIRMED", "ASSIGNED", "EN_ROUTE", "RESCHEDULED"].includes(
    booking.status,
  );

  return (
    <article className={cardCls}>
      <div className="p-4">
        {/* Title + status */}
        <div className="flex items-start gap-3">
          <IconTile icon={booking.serviceId?.icon || "settings"} filled />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-semibold leading-snug text-zinc-900">
                {booking.serviceId?.name} Service
              </h3>
              <StatusPill dot={tone.dot} pill={tone.badge} label={statusView.label} />
            </div>
            <p className="mt-0.5 text-xs text-zinc-500">
              Repair #{booking._id.slice(-6).toUpperCase()}
              {booking.createdAt ? ` · ${formatDate(booking.createdAt)}` : ""}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-zinc-600">
          {booking.description ||
            "Detailed inspection and repair of your appliance by a certified master technician."}
        </p>

        {/* Meta */}
        <div className="mt-3 space-y-2 rounded-xl bg-zinc-50 p-3">
          <MetaRow icon="engineering">
            {techName ? (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-zinc-900">{techName}</span>
                {techPhone ? (
                  <a
                    href={`tel:${techPhone}`}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-on-primary shadow-[0_6px_14px_-6px_rgba(200,16,46,0.6)] transition active:scale-95"
                  >
                    <span className="material-symbols-outlined icon-filled text-[15px]">call</span>
                    Call
                  </a>
                ) : null}
              </div>
            ) : hasTechnicianAssigned ||
              (booking.status && booking.status !== "PENDING" && booking.status !== "CANCELLED") ? (
              <span className="text-zinc-500">Master technician assigned</span>
            ) : (
              <span className="font-medium text-amber-700">Awaiting assignment</span>
            )}
          </MetaRow>

          <MetaRow icon="schedule">
            {scheduleLabel ? (
              scheduleLabel
            ) : (
              <span className="text-zinc-500">
                We&apos;ll share arrival timing once a technician is scheduled.
              </span>
            )}
          </MetaRow>

          <MetaRow icon="location_on">
            {booking.addressData?.text}, {booking.addressData?.zip}
          </MetaRow>

          <MetaRow icon={warranty && !warranty.isActive ? "history" : "verified_user"}>
            <span className="flex flex-wrap items-center gap-x-2">
              <span className={warranty?.isActive ? "font-medium text-green-700" : undefined}>
                {warranty
                  ? `Warranty ${warranty.label}`
                  : `${booking.jobDetails?.warrantyPeriod || "60 Days"} warranty included`}
              </span>
              <Link
                href="/warranty"
                className="text-xs font-semibold text-primary underline underline-offset-2"
              >
                Policy
              </Link>
            </span>
          </MetaRow>
        </div>

        {/* Expandable details */}
        {open && (
          <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4 animate-in fade-in duration-200">
            {showAmount && (
              <div>
                <Label icon="receipt_long">Price breakdown</Label>
                <div className="space-y-1.5 text-[13px] text-zinc-600">
                  <div className="flex justify-between gap-3">
                    <span>Base service</span>
                    <span className="font-medium text-zinc-900">
                      {formatInr(pricing.serviceTotal || pricing.estimatedAmount)}
                    </span>
                  </div>
                  {pricing.partsTotal > 0 ? (
                    <div className="flex justify-between gap-3">
                      <span>Parts</span>
                      <span className="font-medium text-zinc-900">{formatInr(pricing.partsTotal)}</span>
                    </div>
                  ) : null}
                  {pricing.additionalChargesTotal > 0 ? (
                    <div className="flex justify-between gap-3">
                      <span>Additional</span>
                      <span className="font-medium text-zinc-900">
                        {formatInr(pricing.additionalChargesTotal)}
                      </span>
                    </div>
                  ) : null}
                  {(booking.invoiceData?.additionalCharges || []).map(
                    (c: { label?: string; amount?: number }, i: number) =>
                      c?.label && Number(c.amount) > 0 ? (
                        <div key={`${c.label}-${i}`} className="flex justify-between gap-3 pl-3 text-zinc-500">
                          <span>{c.label}</span>
                          <span>{formatInr(Number(c.amount))}</span>
                        </div>
                      ) : null,
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {pricing.isFinal
                    ? "Final amount after approved work. No upfront payment required at booking."
                    : pricing.hasExtras
                      ? "Includes approved parts or extras. Final bill available after job close."
                      : "Base estimate includes visit. Parts or extra repairs are confirmed before charge."}
                </p>
              </div>
            )}

            {hasParts && (
              <div>
                <Label icon="settings_suggest">
                  {booking.isWarrantyClaim ? "Parts from original job" : "Parts installed"}
                </Label>
                <div className="divide-y divide-zinc-100">
                  {partsList?.map((p: any) => (
                    <div key={p.usageId} className="flex items-start justify-between gap-3 py-2 text-[13px] first:pt-0 last:pb-0">
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900">{p.partName}</p>
                        <p className="text-xs text-zinc-500">
                          {p.serialNumber ? `Serial ${p.serialNumber}` : "No serial"}
                          {p.covered
                            ? " · still under warranty"
                            : p.warrantyStatus && p.warrantyStatus !== "NONE"
                              ? ` · ${p.warrantyStatus.toLowerCase()}`
                              : ""}
                        </p>
                      </div>
                      {p.covered ? (
                        <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                          Covered
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                {booking.isWarrantyClaim && (booking.installedParts?.length ?? 0) > 0 ? (
                  <div className="mt-3 border-t border-zinc-100 pt-3">
                    <Label icon="swap_horiz">Replacements on this claim</Label>
                    <div className="divide-y divide-zinc-100">
                      {booking.installedParts.map((p: any) => (
                        <div key={p.usageId} className="flex items-start justify-between gap-3 py-2 text-[13px] first:pt-0 last:pb-0">
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900">{p.partName}</p>
                            <p className="text-xs text-zinc-500">
                              {p.serialNumber ? `Serial ${p.serialNumber}` : "No serial"}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                            {p.warrantyCovered || p.cost === 0 ? "No charge" : `₹${p.cost}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {booking.isWarrantyClaim ? (
                  <p className="mt-2 text-xs text-zinc-500">
                    Covered parts replaced on this claim are not charged.
                  </p>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: price + toggle, then actions */}
      <div className="border-t border-primary/10 bg-primary/[0.04] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500">{pricing.displayLabel} charge</p>
            {showAmount ? (
              <p className="text-xl font-bold leading-tight text-primary">{formatInr(displayAmount)}</p>
            ) : (
              <p className="text-sm font-semibold leading-tight text-zinc-700">Pending quote</p>
            )}
          </div>
          {(showAmount || hasParts) && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-[13px] font-semibold text-primary transition hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
            >
              {open ? "Hide details" : "Details"}
              <span
                className={`material-symbols-outlined text-[18px] transition-transform ${open ? "rotate-180" : ""}`}
              >
                expand_more
              </span>
            </button>
          )}
        </div>

        {!showAmount && (
          <p className="mt-1 text-xs text-zinc-500">
            Pricing will appear once your service charge is confirmed.
          </p>
        )}

        {(canClaim || canBill || canCancel) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {canClaim && (
              <button type="button" onClick={() => onClaimWarranty(booking._id)} className={softBtn}>
                <span className="material-symbols-outlined text-[17px]">medical_services</span>
                Claim warranty
              </button>
            )}
            {canBill && (
              <button type="button" onClick={() => openRetailInvoice(booking)} className={darkBtn}>
                <span className="material-symbols-outlined text-[17px]">description</span>
                Service bill
              </button>
            )}
            {canCancel && (
              <button
                type="button"
                onClick={() => onCancelBooking(booking._id)}
                className={`${outlineBtn} !border-red-200 !text-red-700 hover:!bg-red-50`}
              >
                Cancel booking
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* =====================================================================
   PART ORDER CARD
   ===================================================================== */

function PartOrderCard({ order, onCancelOrder }: { order: any; onCancelOrder: (id: string) => void }) {
  return (
    <article className={cardCls}>
      <OrderCardHeader order={order} label={`Order #${order._id.slice(-8).toUpperCase()}`} icon="package_2" />
      <div className="space-y-4 px-4 pb-4">
        <ItemsBlock order={order} showInvoice />
        <ContactBlock order={order} title="Shipping to" icon="local_shipping" />
      </div>

      {["PENDING", "PROCESSING"].includes(order.status) && (
        <div className="border-t border-primary/10 bg-primary/[0.04] px-4 py-3">
          <button
            type="button"
            onClick={() => onCancelOrder(order._id)}
            className={`${outlineBtn} w-full !border-red-200 !text-red-700 hover:!bg-red-50 sm:w-auto`}
          >
            Cancel order
          </button>
        </div>
      )}
    </article>
  );
}

/* =====================================================================
   APPLIANCE ENQUIRY CARD
   ===================================================================== */

function ApplianceEnquiryCard({ order }: { order: any }) {
  const item = order.applianceItem;
  const productHref = item?.slug
    ? `${SHOP_APPLIANCES_HREF}/ac/${item.slug}`
    : SHOP_APPLIANCES_HREF;

  return (
    <article className={cardCls}>
      <OrderCardHeader
        order={order}
        label={`Enquiry #${order._id.slice(-8).toUpperCase()}`}
        badge="Appliance"
        icon="ac_unit"
      />
      <div className="space-y-4 px-4 pb-4">
        {item && (
          <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-3.5">
            <Label icon="ac_unit">Product enquired</Label>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[15px] font-semibold leading-snug text-zinc-900">{item.name}</h3>
                <p className="mt-0.5 text-[13px] text-zinc-500">
                  {item.brand}
                  {item.modelNumber ? ` · Model ${item.modelNumber}` : ""}
                </p>
                <p className="mt-1 text-[13px] text-zinc-500">Quantity: {item.quantity}</p>
              </div>
              <p className="shrink-0 text-lg font-bold text-primary">
                {item.price ? `₹${Number(item.price).toLocaleString("en-IN")}` : "Price on request"}
              </p>
            </div>
            <Link
              href={productHref}
              className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
            >
              View product
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        )}

        <ContactBlock order={order} title="Your details & visit" icon="person" />

        <div>
          <Label icon="support_agent">What happens next</Label>
          <ul className="space-y-1.5 text-[13px] text-zinc-600">
            {[
              "Our team confirms stock and final pricing",
              "We call you to schedule delivery or installation",
              "Status updates appear here as your enquiry progresses",
            ].map((text) => (
              <li key={text} className="flex items-start gap-2">
                <span className="material-symbols-outlined mt-px text-[16px] text-primary">check_circle</span>
                <span className="leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {order.isBilled && (
        <div className="border-t border-primary/10 bg-primary/[0.04] px-4 py-3">
          <button type="button" onClick={() => openOrderInvoice(order)} className={`${darkBtn} w-full sm:w-auto`}>
            <span className="material-symbols-outlined text-[17px]">receipt_long</span>
            Download Invoice
          </button>
        </div>
      )}
    </article>
  );
}

/* =====================================================================
   SHARED ORDER PIECES
   ===================================================================== */

function OrderCardHeader({
  order,
  label,
  badge,
  icon,
}: {
  order: any;
  label: string;
  badge?: string;
  icon: string;
}) {
  const tone = orderTone(order.status);
  return (
    <div className="flex items-start gap-3 p-4 pb-3">
      <IconTile icon={icon} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] font-semibold leading-snug text-zinc-900">
            {label}
            {badge && (
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                {badge}
              </span>
            )}
          </p>
          <StatusPill dot={tone.dot} pill={tone.pill} label={order.status} />
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">{formatDate(order.createdAt)}</p>
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
      <Label icon={icon}>{title}</Label>
      <h3 className="text-[13px] font-semibold text-zinc-900">{order.contactData.name}</h3>
      <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-600">
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
      <Label icon="inventory_2">Items</Label>
      <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200 bg-zinc-50/60">
        {(order.items ?? []).map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-3 px-3 py-2.5 text-[13px]">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="shrink-0 rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-bold text-primary">
                {item.quantity}×
              </span>
              <span className="truncate font-medium text-zinc-900">
                {item.partId?.name || "Genuine Component"}
              </span>
            </div>
            <span className="shrink-0 font-semibold text-zinc-900">{item.partId?.price || "TBD"}</span>
          </div>
        ))}
      </div>

      {order.courierTracking && (
        <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/[0.05] p-3 text-[13px]">
          <span className="material-symbols-outlined text-[18px] text-primary">local_shipping</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-primary">Live tracking</p>
            <p className="break-all font-semibold text-zinc-900">
              {order.courierTracking.courierName}: {order.courierTracking.trackingNumber}
            </p>
          </div>
        </div>
      )}

      {showInvoice && order.isBilled && (
        <button
          type="button"
          onClick={() => openOrderInvoice(order)}
          className={`${darkBtn} mt-2.5 w-full`}
        >
          <span className="material-symbols-outlined text-[17px]">receipt_long</span>
          Download Invoice
        </button>
      )}
    </div>
  );
}