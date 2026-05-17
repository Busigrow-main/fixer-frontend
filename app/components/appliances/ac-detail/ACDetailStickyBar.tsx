"use client";

import Link from "next/link";
import type { ACProduct } from "../types";

interface ACDetailStickyBarProps {
  product: ACProduct;
}

export function ACDetailStickyBar({ product }: ACDetailStickyBarProps) {
  const waText = encodeURIComponent(
    `Hi Fixxer! I'm interested in the ${product.name}. Please share more details.`,
  );

  return (
    <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] px-3 py-2.5 pb-safe">
      <div className="grid grid-cols-3 gap-2.5">
        <a
          href="tel:+917004771388"
          className="min-w-0 h-11 border-2 border-[#C8102E] text-[#C8102E] font-bold text-[10px] uppercase tracking-wide rounded-lg flex flex-col items-center justify-center gap-0.5 active:bg-[#FFF5F5]"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
          Call
        </a>
        <a
          href={`https://wa.me/917004771388?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 h-11 bg-[#25D366] text-white font-bold text-[10px] uppercase tracking-wide rounded-lg flex flex-col items-center justify-center gap-0.5 active:brightness-95"
        >
          <span className="material-symbols-outlined text-[18px]">chat</span>
          WhatsApp
        </a>
        <Link
          href={`/spare-parts/enquiry?product=${product.slug}&type=appliance`}
          className="min-w-0 h-11 bg-[#C8102E] text-white font-bold text-[10px] uppercase tracking-wide rounded-lg flex flex-col items-center justify-center gap-0.5 shadow-md shadow-[#C8102E]/20 active:brightness-110"
        >
          <span className="material-symbols-outlined text-[18px]">mail</span>
          Enquire Now
        </Link>
      </div>
    </div>
  );
}
