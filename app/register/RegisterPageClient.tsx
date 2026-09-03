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

function RegisterFormInner() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
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
      setError(err instanceof Error ? err.message : "Could not create your account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="pt-20 pb-20 bg-surface min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white border border-outline rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5">
          <div className="text-center mb-10">
            <h1 className="font-headline text-4xl md:text-5xl text-on-surface">Get started</h1>
            <p className="text-on-surface-variant text-sm mt-3 font-medium">
              Just your name and mobile — we&apos;ll handle the rest
            </p>
          </div>

          {isBookingFlow && (
            <div className="mb-6 p-4 rounded-2xl bg-primary/5 border border-primary/15 text-sm text-on-surface">
              <p className="font-semibold text-on-surface mb-1">Almost there</p>
              <p className="text-on-surface-variant text-xs">
                Your booking details are saved. Confirm right after this step.
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
                Full name
              </label>
              <input
                name="fullName"
                type="text"
                required
                autoComplete="name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-on-surface-variant ml-1">
                Mobile number
              </label>
              <input
                name="phone"
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl bg-surface-container-low border-2 border-outline outline-none focus:border-primary transition-all text-on-surface font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary text-on-primary rounded-2xl font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[0.98] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Continue"
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-outline text-center">
            <p className="text-sm text-on-surface-variant">
              Already used Fixxer?{" "}
              <Link href={authQuery ? `/login?${authQuery}` : "/login"} className="text-primary font-black hover:underline">
                Continue with phone
              </Link>
            </p>
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

function RegisterFallback() {
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

export default function RegisterPageClient() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterFormInner />
    </Suspense>
  );
}
