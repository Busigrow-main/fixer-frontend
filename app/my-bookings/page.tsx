"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { API_URL } from "@/app/config";
import { openRetailInvoice } from "@/app/admin/utils/jobsheet";
import {
  buildCustomerPricingSummary,
  formatInr,
  formatScheduleLabel,
  getCustomerStatusView,
  statusToneClasses,
} from "@/app/lib/customer-booking";

type TabType = "repairs";

type CancellationFeedback = {
  tone: "success" | "error";
  message: string;
} | null;

/* =====================================================================
   PRESENTATION HELPERS
   ===================================================================== */

const cardCls =
  "overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-12px_rgba(0,0,0,0.12)]";

const outlineBtn =
  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-zinc-200 bg-white px-3.5 text-[13px] font-semibold text-zinc-800 transition hover:bg-zinc-50 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:flex-none";

const softBtn =
  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-primary/20 bg-primary/10 px-3.5 text-[13px] font-semibold text-primary transition hover:bg-primary/15 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15 sm:flex-none";

const darkBtn =
  "inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-zinc-900 px-3.5 text-[13px] font-semibold text-white transition hover:bg-black active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-300 sm:flex-none";

function formatDate(value?: string) {
  if (!value) return "";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatusPill({
  dot,
  pill,
  label,
}: {
  dot: string;
  pill: string;
  label: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function IconTile({
  icon,
  filled = false,
}: {
  icon: string;
  filled?: boolean;
}) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <span
        className={`material-symbols-outlined text-[22px] ${
          filled ? "icon-filled" : ""
        }`}
      >
        {icon}
      </span>
    </span>
  );
}

function MetaRow({
  icon,
  children,
}: {
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5 text-[13px] leading-snug text-zinc-700">
      <span className="material-symbols-outlined mt-px text-[18px] text-primary/70">
        {icon}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Label({
  icon,
  children,
}: {
  icon?: string;
  children: React.ReactNode;
}) {
  return (
    <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-zinc-500">
      {icon && (
        <span className="material-symbols-outlined text-[16px] text-primary/70">
          {icon}
        </span>
      )}
      {children}
    </p>
  );
}

/* =====================================================================
   PAGE
   ===================================================================== */

export default function MyBookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <MyBookingsContent />
    </Suspense>
  );
}

function MyBookingsContent() {
  const { token, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();

  const [showSuccess, setShowSuccess] = useState(
    searchParams.get("success") === "true",
  );

  const [activeTab, setActiveTab] = useState<TabType>("repairs");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelTarget, setCancelTarget] = useState<{ id: string } | null>(null);

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

  useEffect(() => {
    if (token) {
      fetchAllHistory();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [token, authLoading]);

  const fetchAllHistory = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/user/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Could not load technician bookings.");

      const data = await response.json();
      setBookings(Array.isArray(data) ? data : []);
      setError("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Network error. Could not load technician bookings.",
      );
    } finally {
      setLoading(false);
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
      const res = await fetch(
        `${API_URL}/user/bookings/${bookingId}/claim-warranty`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        alert(
          "Warranty claim received! A new check-up booking has been created.",
        );
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
        },
      );

      if (res.ok) {
        setCancellationFeedback({
          tone: "success",
          message: "Your booking has been cancelled successfully.",
        });

        await fetchAllHistory();
        return true;
      }

      const data = await res.json().catch(() => ({}));

      const message = Array.isArray(data.message)
        ? data.message.join(" ")
        : data.message;

      setCancellationFeedback({
        tone: "error",
        message: message || "Could not cancel booking. Please try again.",
      });
    } catch {
      setCancellationFeedback({
        tone: "error",
        message: "Network error. Your booking was not cancelled.",
      });
    }

    return false;
  };

  const openCancellationModal = (id: string) => {
    setCancelTarget({ id });
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
      const cancelled = await handleCancelBooking(cancelTarget.id, reason);

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

    const diffDays = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays <= 0) {
      return { label: "Expired", isActive: false };
    }

    return { label: `Active (${diffDays} Days Left)`, isActive: true };
  };

  const activeCount = bookings.length;

  const emptyCopy = {
    icon: "construction",
    title: "No technician bookings yet",
    body: "You haven't booked a technician visit yet. Schedule one from the services page.",
    href: "/services",
    cta: "Browse Services",
  } as const;

  const tabs: {
    key: TabType;
    label: string;
    icon: string;
    count: number;
  }[] = [
    {
      key: "repairs",
      label: "Technician visits",
      icon: "home_repair_service",
      count: bookings.length,
    },
  ];

  return (
    <>
      <Navbar />

      {/* Cancellation toast */}
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
                {cancellationFeedback.tone === "success"
                  ? "check_circle"
                  : "error"}
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
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>

          <div
            className={`h-0.5 ${
              cancellationFeedback.tone === "success"
                ? "bg-green-500"
                : "bg-red-500"
            }`}
          />
        </div>
      )}

      <main className="min-h-screen bg-white pb-14 pt-0 md:pb-16 md:pt-20">
        {/* Header */}
        <div className="bg-white">
          <div className="mx-auto w-full max-w-[720px] px-4 pb-1 pt-6 md:max-w-[960px] md:px-6 md:pb-4 md:pt-10 xl:max-w-[1040px] xl:px-8">
            {showSuccess && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-green-200 bg-green-50 p-3.5 animate-in fade-in slide-in-from-top-4 duration-500">
                <span className="material-symbols-outlined icon-filled text-[22px] text-green-600">check_circle</span>
                <div>
                  <h3 className="text-sm font-semibold text-green-900">Booking request received</h3>
                  <p className="text-[13px] text-green-800/80">Your technician booking request is being processed.</p>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-[13px] font-medium text-red-700"
              >
                <span className="material-symbols-outlined text-[18px]">
                  error
                </span>
                <span>{error}</span>
              </div>
            )}

            <header className="mb-4 md:mb-5">
              <h1 className="font-headline text-[1.75rem] leading-tight tracking-tight text-zinc-900 sm:text-3xl md:text-[2rem]">
                My Bookings
              </h1>

              <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 sm:text-sm">
                Technician service visits, updates, and warranty details.
              </p>
            </header>
          </div>
        </div>

        <section className="mx-auto w-full max-w-[720px] px-4 md:max-w-[960px] md:px-6 xl:max-w-[1040px] xl:px-8">
          {/* Tabs */}
          <div
            className="sticky top-14 z-30 -mx-4 mb-4 bg-white/95 px-4 py-2 backdrop-blur md:top-20 md:mx-0 md:rounded-2xl md:border md:border-zinc-200/80 md:bg-white/95 md:px-2 md:py-2 md:shadow-sm"
            role="tablist"
            aria-label="Booking categories"
          >
            <div
              className="grid gap-1 rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-sm md:border-0 md:p-0 md:shadow-none"
              style={{
                gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
              }}
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
                      <span className="material-symbols-outlined block text-[21px] sm:text-[19px]">
                        {t.icon}
                      </span>

                      {t.count > 0 && (
                        <span
                          className={`absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none sm:hidden ${
                            active
                              ? "bg-white text-primary"
                              : "bg-primary text-on-primary"
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
                          active
                            ? "bg-white/25 text-on-primary"
                            : "bg-primary/10 text-primary"
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

          {/* Content */}
          {!token && !authLoading ? (
            <div className={`${cardCls} px-5 py-10 text-center md:py-14`}>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  lock
                </span>
              </span>

              <p className="mt-3 text-base font-semibold text-zinc-900">
                Authentication required
              </p>

              <p className="mx-auto mt-1 max-w-xs text-[13px] text-zinc-500">
                Enter your mobile number to view your technician bookings.
              </p>

              <a
                href="/login"
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-on-primary shadow-[0_8px_18px_-8px_rgba(200,16,46,0.6)] transition active:scale-[0.98] sm:w-auto"
              >
                Continue with phone
              </a>
            </div>
          ) : loading ? (
            <div
              className="space-y-3"
              aria-busy="true"
              aria-label="Syncing records"
            >
              {[0, 1, 2].map((i) => (
                <div key={i} className={`${cardCls} p-4 md:p-5`}>
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
            <div className={`${cardCls} px-5 py-10 text-center md:py-14`}>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[28px]">
                  {emptyCopy.icon}
                </span>
              </span>

              <p className="mt-3 text-base font-semibold text-zinc-900">
                {emptyCopy.title}
              </p>

              <p className="mx-auto mt-1 max-w-xs text-[13px] leading-relaxed text-zinc-500">
                {emptyCopy.body}
              </p>

              <a
                href={emptyCopy.href}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-on-primary shadow-[0_8px_18px_-8px_rgba(200,16,46,0.6)] transition active:scale-[0.98] sm:w-auto"
              >
                {emptyCopy.cta}
              </a>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in duration-300 md:space-y-4">
              {activeTab === "repairs" &&
                bookings.map((booking) => (
                  <RepairBookingCard
                    key={booking._id}
                    booking={booking}
                    getWarrantyStatus={getWarrantyStatus}
                    onClaimWarranty={handleClaimWarranty}
                    onCancelBooking={(id) =>
                      openCancellationModal(id)
                    }
                  />
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
                  <span className="material-symbols-outlined text-[22px]">
                    cancel
                  </span>
                </span>

                <div>
                  <h2
                    id="cancellation-dialog-title"
                    className="font-headline text-xl font-bold leading-tight text-zinc-900"
                  >
                    Cancel{" "}
                    booking?
                  </h2>

                  <p className="mt-1 text-[13px] leading-snug text-zinc-500">
                    Tell us why. This is saved with your{" "}
                    booking.
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
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <label
              htmlFor="cancellation-reason"
              className="mb-1.5 mt-4 block text-[13px] font-semibold text-zinc-800"
            >
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
              <span className="font-semibold">
                {cancellationReason.length}/500
              </span>
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
                Keep booking
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
  getWarrantyStatus: (b: any) => {
    label: string;
    isActive: boolean;
  } | null;
  onClaimWarranty: (id: string) => void;
  onCancelBooking: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const warranty = getWarrantyStatus(booking);

  const technician =
    booking.technician ||
    (typeof booking.technicianId === "object" &&
    booking.technicianId?.name
      ? booking.technicianId
      : null);

  const techName =
    typeof technician === "object" && technician?.name
      ? technician.name
      : null;

  const techPhone =
    typeof technician === "object" && technician?.phone
      ? technician.phone
      : null;

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
      isWarrantyClaim:
        booking.isWarrantyClaim ||
        booking.serviceType === "WARRANTY_CHECK",
      arrivalAt: booking.arrivalAt,
    });

  const tone = statusToneClasses(statusView.tone);
  const pricing = buildCustomerPricingSummary(booking);
  const scheduleLabel = formatScheduleLabel(booking);

  const showAmount =
    pricing.estimatedAmount > 0 || pricing.totalAmount > 0;

  const displayAmount =
    pricing.isFinal || pricing.hasExtras
      ? pricing.totalAmount
      : pricing.estimatedAmount || pricing.serviceTotal;

  const partsList = booking.isWarrantyClaim
    ? booking.originalParts
    : booking.installedParts;

  const hasParts =
    (booking.installedParts?.length ?? 0) > 0 ||
    (booking.originalParts?.length ?? 0) > 0;

  const canClaim = warranty?.isActive && !booking.claimBookingIds?.length;

  const canBill =
    booking.isBilled ||
    booking.jobClosed ||
    booking.paymentStatus === "PAID_CASH" ||
    booking.paymentStatus === "PAID_ONLINE";

  const canCancel = [
    "PENDING",
    "CONFIRMED",
    "ASSIGNED",
    "EN_ROUTE",
    "RESCHEDULED",
  ].includes(booking.status);

  return (
    <article className={cardCls}>
      <div className="p-4 md:p-5 lg:p-6">
        {/* Title and status */}
        <div className="flex items-start gap-3">
          <IconTile icon={booking.serviceId?.icon || "settings"} filled />

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-[15px] font-semibold leading-snug text-zinc-900">
                {booking.serviceId?.name} Service
              </h3>

              <StatusPill
                dot={tone.dot}
                pill={tone.badge}
                label={statusView.label}
              />
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

        {/* Metadata */}
        <div className="mt-3 space-y-2 rounded-xl bg-zinc-50 p-3 md:mt-4 md:p-4">
          <MetaRow icon="engineering">
            {techName ? (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate font-medium text-zinc-900">
                  {techName}
                </span>

                {techPhone ? (
                  <a
                    href={`tel:${techPhone}`}
                    className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-on-primary shadow-[0_6px_14px_-6px_rgba(200,16,46,0.6)] transition active:scale-95"
                  >
                    <span className="material-symbols-outlined icon-filled text-[15px]">
                      call
                    </span>
                    Call
                  </a>
                ) : null}
              </div>
            ) : hasTechnicianAssigned ||
              (booking.status &&
                booking.status !== "PENDING" &&
                booking.status !== "CANCELLED") ? (
              <span className="text-zinc-500">
                Master technician assigned
              </span>
            ) : (
              <span className="font-medium text-amber-700">
                Awaiting assignment
              </span>
            )}
          </MetaRow>

          {booking.fixxerCode && booking.status !== "COMPLETED" && !booking.jobClosed ? (
            <div className="rounded-xl bg-primary-container px-3 py-2">
              <p className="text-[10px] uppercase tracking-widest font-black text-primary">
                FIXXER CODE
              </p>
              <p className="mt-1 font-headline text-2xl tracking-[0.28em] text-on-surface">
                {booking.fixxerCode}
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant">
                Give this code to your technician when the job is finished.
              </p>
            </div>
          ) : null}

          <MetaRow icon="schedule">
            {scheduleLabel || (
              <span className="text-zinc-500">
                We&apos;ll share arrival timing once a technician is scheduled.
              </span>
            )}
          </MetaRow>

          <MetaRow icon="location_on">
            {booking.addressData?.text}, {booking.addressData?.zip}
          </MetaRow>

          <MetaRow
            icon={
              warranty && !warranty.isActive
                ? "history"
                : "verified_user"
            }
          >
            <span className="flex flex-wrap items-center gap-x-2">
              <span
                className={
                  warranty?.isActive
                    ? "font-medium text-green-700"
                    : undefined
                }
              >
                {warranty
                  ? `Warranty ${warranty.label}`
                  : `${booking.jobDetails?.warrantyPeriod || "60 Days"} Service warranty included`}
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
                      {formatInr(
                        pricing.serviceTotal || pricing.estimatedAmount,
                      )}
                    </span>
                  </div>

                  {pricing.partsTotal > 0 && (
                    <div className="flex justify-between gap-3">
                      <span>Parts</span>
                      <span className="font-medium text-zinc-900">
                        {formatInr(pricing.partsTotal)}
                      </span>
                    </div>
                  )}

                  {pricing.additionalChargesTotal > 0 && (
                    <div className="flex justify-between gap-3">
                      <span>Additional</span>
                      <span className="font-medium text-zinc-900">
                        {formatInr(pricing.additionalChargesTotal)}
                      </span>
                    </div>
                  )}

                  {(booking.invoiceData?.additionalCharges || []).map(
                    (c: { label?: string; amount?: number }, i: number) =>
                      c?.label && Number(c.amount) > 0 ? (
                        <div
                          key={`${c.label}-${i}`}
                          className="flex justify-between gap-3 pl-3 text-zinc-500"
                        >
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
                  {booking.isWarrantyClaim
                    ? "Parts from original job"
                    : "Parts installed"}
                </Label>

                <div className="divide-y divide-zinc-100">
                  {partsList?.map((p: any) => (
                    <div
                      key={p.usageId}
                      className="flex items-start justify-between gap-3 py-2 text-[13px] first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-900">
                          {p.partName}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {p.serialNumber
                            ? `Serial ${p.serialNumber}`
                            : "No serial"}
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

                {booking.isWarrantyClaim &&
                (booking.installedParts?.length ?? 0) > 0 ? (
                  <div className="mt-3 border-t border-zinc-100 pt-3">
                    <Label icon="swap_horiz">
                      Replacements on this claim
                    </Label>

                    <div className="divide-y divide-zinc-100">
                      {booking.installedParts.map((p: any) => (
                        <div
                          key={p.usageId}
                          className="flex items-start justify-between gap-3 py-2 text-[13px] first:pt-0 last:pb-0"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900">
                              {p.partName}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {p.serialNumber
                                ? `Serial ${p.serialNumber}`
                                : "No serial"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-bold text-green-700">
                            {p.warrantyCovered || p.cost === 0
                              ? "No charge"
                              : `₹${p.cost}`}
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

      {/* Footer */}
      <div className="border-t border-primary/10 bg-primary/[0.04] px-4 py-3 md:px-5 md:py-4 lg:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-zinc-500">
              {pricing.displayLabel} charge
            </p>

            {showAmount ? (
              <p className="text-xl font-bold leading-tight text-primary">
                {formatInr(displayAmount)}
              </p>
            ) : (
              <p className="text-sm font-semibold leading-tight text-zinc-700">
                Pending quote
              </p>
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
                className={`material-symbols-outlined text-[18px] transition-transform ${
                  open ? "rotate-180" : ""
                }`}
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
              <button
                type="button"
                onClick={() => onClaimWarranty(booking._id)}
                className={softBtn}
              >
                <span className="material-symbols-outlined text-[17px]">
                  medical_services
                </span>
                Claim warranty
              </button>
            )}

            {canBill && (
              <button
                type="button"
                onClick={() => openRetailInvoice(booking)}
                className={darkBtn}
              >
                <span className="material-symbols-outlined text-[17px]">
                  description
                </span>
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
