"use client";

import Link from "next/link";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";

export default function VerifiedSparePartPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 md:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
        <section className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm md:p-9">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/[0.07] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fixxer verified
          </div>

          <h1 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-950 md:text-3xl">
            Your part request is verified
          </h1>

          <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-slate-500">
            Your request has been successfully verified.
            Fixxer can now continue with availability and
            compatibility confirmation.
          </p>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />

              <div>
                <p className="text-[10px] font-black text-slate-800">
                  What happens next?
                </p>

                <p className="mt-1 text-[9px] leading-5 text-slate-500">
                  Fixxer will confirm the requested part,
                  availability and the next steps with you.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            <Link
              href="/my-bookings?tab=parts"
              className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[10px] font-black text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 active:scale-[0.98]"
            >
              View my requests
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <Link
              href="/spare-parts"
              className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-[10px] font-black text-slate-700 transition-colors hover:border-primary/20 hover:text-primary"
            >
              Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}