"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/app/config";
import type { PendingBookingDraft } from "@/app/lib/pending-booking";
import { clearPendingBookingDraft, safeAppRedirect } from "@/app/lib/pending-booking";
import { useBooking } from "@/app/context/BookingContext";

type Props = {
  draft: PendingBookingDraft;
  token: string;
  onDismiss: () => void;
  /** After successful submit */
  redirectTo?: string;
};

export function PendingBookingConfirmDialog({ draft, token, onDismiss, redirectTo }: Props) {
  const router = useRouter();
  const { openBookingResumeFromPending } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitBooking = async () => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: draft.serviceId,
          subCategoryId: draft.subCategoryId,
          contactPhone: draft.phone,
          ...(draft.brand
            ? { productDetails: { brand: draft.brand } }
            : {}),
          addressData: {
            zip: draft.zip,
            text: draft.address,
          },
          description: draft.description,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          typeof err.message === "string" ? err.message : "Could not complete your booking. Try again.",
        );
      }
      clearPendingBookingDraft();
      onDismiss();
      router.push(safeAppRedirect(redirectTo ?? null, "/my-bookings"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    onDismiss();
    openBookingResumeFromPending();
    router.push(safeAppRedirect(draft.returnPath, "/"));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pending-booking-title"
        className="w-full max-w-md rounded-2xl border border-outline bg-white p-6 shadow-2xl"
      >
        <h2 id="pending-booking-title" className="font-headline text-2xl text-on-surface mb-1">
          Confirm your booking
        </h2>
        <p className="text-sm text-on-surface-variant mb-5">
          Your details were saved. Submit now or edit in the booking form.
        </p>

        <div className="rounded-xl border border-outline bg-surface-container-low/50 p-4 space-y-3 text-sm mb-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Service</p>
            <p className="font-semibold text-on-surface">
              {[draft.serviceName, draft.subCategoryName].filter(Boolean).join(" · ") || "Selected service"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Name</p>
              <p className="text-on-surface">{draft.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Phone</p>
              <p className="text-on-surface">{draft.phone}</p>
            </div>
          </div>
          {draft.brand ? (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Brand</p>
              <p className="text-on-surface">{draft.brand}</p>
            </div>
          ) : null}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Address</p>
            <p className="text-on-surface">
              {draft.address}
              {draft.zip ? ` · ${draft.zip}` : ""}
            </p>
          </div>
          {draft.description ? (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Problem</p>
              <p className="text-on-surface whitespace-pre-wrap">{draft.description}</p>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-semibold flex gap-2 items-start">
            <span className="material-symbols-outlined text-lg shrink-0">error</span>
            {error}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleEdit}
            disabled={submitting}
            className="flex-1 h-12 rounded-xl border-2 border-outline font-bold text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50"
          >
            Edit details
          </button>
          <button
            type="button"
            onClick={submitBooking}
            disabled={submitting}
            className="flex-1 h-12 rounded-xl bg-primary text-on-primary font-bold uppercase tracking-wide shadow-lg shadow-primary/20 hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-lg icon-filled">check_circle</span>
                Confirm booking
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
