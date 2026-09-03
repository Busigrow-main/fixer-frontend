"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { PendingBookingConfirmDialog } from "@/app/components/PendingBookingConfirmDialog";
import {
  BOOKING_FLOW_SOURCE,
  loadPendingBookingDraft,
  safeAppRedirect,
} from "@/app/lib/pending-booking";
import type { PendingBookingDraft } from "@/app/lib/pending-booking";
import { isValidPhone } from "@/app/lib/auth";

function LoginFormInner() {
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<PendingBookingDraft | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { continueWithPhone, token } = useAuth();

  const redirect = safeAppRedirect(searchParams.get("redirect"));
  const source = searchParams.get("source");
  const isBookingFlow = source === BOOKING_FLOW_SOURCE;
  const authQuery = searchParams.toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);

    try {
      await continueWithPhone(phone, fullName);
      const draft = loadPendingBookingDraft();
      if (draft && isBookingFlow) {
        setPendingDraft(draft);
        return;
      }
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not continue. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20 bg-surface min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-outline rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 transition-all">
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl text-on-surface">
              {isBookingFlow ? "One more step" : "Continue with phone"}
            </h1>
            <p className="text-on-surface-variant text-sm mt-3 font-medium">
              {isBookingFlow
                ? "Enter your mobile number to finish your booking — no password needed."
                : "Use your mobile number to view bookings and track repairs."}
            </p>
          </div>

          {isBookingFlow && (
            <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/15 text-sm text-on-surface">
              <p className="font-semibold text-on-surface mb-1">Your booking is saved</p>
              <p className="text-on-surface-variant text-xs">
                After this step we&apos;ll show your details so you can confirm in one tap.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/20 flex items-center gap-3 text-error text-sm font-bold">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Mobile number
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors group-focus-within:text-primary">
                  call
                </span>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Your name <span className="font-medium normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                autoComplete="name"
                placeholder="For technician visit updates"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isBookingFlow ? (
                "Continue to booking"
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-on-surface-variant leading-relaxed">
            New here? We&apos;ll create your account automatically. No password to remember.
          </p>

          <div className="mt-8 pt-8 border-t border-outline text-center">
            <Link
              href="/"
              className="text-xs text-on-surface-variant hover:text-on-surface font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      {pendingDraft && token && (
        <PendingBookingConfirmDialog
          draft={pendingDraft}
          token={token}
          onDismiss={() => setPendingDraft(null)}
          redirectTo={redirect}
        />
      )}
    </>
  );
}

function LoginFallback() {
  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20 bg-surface min-h-screen flex items-center justify-center px-6">
        <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
      <Footer />
    </>
  );
}

export default function LoginPageClient() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginFormInner />
    </Suspense>
  );
}
