"use client";

import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Phone,
} from "lucide-react";

interface ACDetailStickyBarProps {
  product: {
    slug: string;
    name?: string;
  };
}

export default function ACDetailStickyBar({
  product,
}: ACDetailStickyBarProps) {
  const enquiryHref = `/spare-parts/enquiry?product=${encodeURIComponent(
    product.slug,
  )}&type=appliance`;

  const whatsappMessage = encodeURIComponent(
    `Hi Fixxer, I am interested in ${product.name || "this AC"}. Please help me with availability, pricing and installation.`,
  );

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-2">
        {/* Call */}
        <a
          href="tel:+919999999999"
          aria-label="Call Fixxer"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors active:bg-slate-50"
        >
          <Phone className="h-4.5 w-4.5" />
        </a>

        {/* WhatsApp */}
        <a
          href={`https://wa.me/919999999999?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Fixxer on WhatsApp"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors active:bg-emerald-100"
        >
          <MessageCircle className="h-4.5 w-4.5" />
        </a>

        {/* Primary enquiry */}
        <Link
          href={enquiryHref}
          className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[11px] font-black text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.98] active:bg-primary/90"
        >
          <span className="truncate">
            Enquire Now
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </Link>
      </div>

      <p className="mx-auto mt-1.5 max-w-lg text-center text-[8px] font-semibold text-slate-400">
        No payment required · Fixxer will confirm availability
      </p>
    </div>
  );
}