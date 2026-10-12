"use client";

import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type PromotionalSectionsProps = {
  className?: string;
};

export default function PromotionalSections({
  className = "",
}: PromotionalSectionsProps) {
  return (
    <section
      className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-3 ${className}`}
      aria-label="Fixxer Shop help and support"
    >
      {/* Identify a part */}
      <Link
        href="/spare-parts/help"
        className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
      >
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/[0.045] transition-transform duration-500 group-hover:scale-125" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
              <HelpCircle className="h-5 w-5" />
            </span>

            <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <h3 className="mt-4 text-sm font-black text-slate-950 sm:text-base">
            Not sure which part you need?
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Tell us about your appliance and the problem. We&apos;ll help
            identify the right part.
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black text-primary">
            Get help identifying it
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

      {/* Photo help */}
      <Link
        href="/spare-parts/help"
        className="group relative overflow-hidden rounded-[22px] border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_35px_rgba(15,23,42,0.08)]"
      >
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-primary/[0.08] group-hover:text-primary">
              <Camera className="h-5 w-5" />
            </span>

            <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
          </div>

          <h3 className="mt-4 text-sm font-black text-slate-950 sm:text-base">
            Have the old part?
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            Use our assisted request flow to describe what you have and what
            needs replacing.
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black text-primary">
            Start a part request
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </Link>

      {/* Trust / support */}
      <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 p-5 text-white sm:col-span-2 lg:col-span-1">
        <div className="absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-primary/20 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-white/60">
              Fixxer support
            </span>
          </div>

          <h3 className="mt-4 text-sm font-black sm:text-base">
            Buy with confidence
          </h3>

          <div className="mt-3 space-y-2">
            <TrustRow
              icon={<CheckCircle2 />}
              text="Verified catalog information"
            />

            <TrustRow
              icon={<Wrench />}
              text="Technician support when needed"
            />

            <TrustRow
              icon={<ShieldCheck />}
              text="Request first — no payment required"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustRow({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2.5 text-[10px] font-semibold text-white/65">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.08] text-primary">
        {icon}
      </span>

      <span>{text}</span>
    </div>
  );
}