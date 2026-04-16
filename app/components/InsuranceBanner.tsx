"use client";

import React from "react";
import { useBooking } from "@/app/context/BookingContext";

export default function InsuranceBanner() {
  const { openBooking } = useBooking();

  return (
    <section className="container mx-auto px-4 sm:px-6 mb-12 md:my-20">
      <div className="relative bg-zinc-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] -translate-y-1/2 translate-x-1/4 rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary/10 blur-[80px] translate-y-1/2 -translate-x-1/4 rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full mb-6 border border-primary/20">
            <span className="material-symbols-outlined text-xs icon-filled">
              security
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Exclusive Protection
            </span>
          </div>
          <h2 className="text-3xl md:text-6xl font-headline text-white mb-6 leading-tight tracking-tight">
            Free Service Charge <br />{" "}
            <span className="italic text-primary">for a full year.</span>
          </h2>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed max-w-xl">
            Introducing{" "}
            <span className="text-white font-bold">
              Fixxer Appliance Insurance
            </span>
            . Get zero service charges for 12 months and up to{" "}
            <span className="text-primary font-black">50% OFF</span> on every
            spare part.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center md:items-end gap-4 shrink-0">
          <button
            onClick={() => openBooking()}
            className="bg-primary text-on-primary px-10 h-16 rounded-2xl font-black uppercase tracking-widest hover:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined icon-filled">bolt</span>
            Get Protected
          </button>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
            *Available on all major home appliances
          </p>
        </div>
      </div>
    </section>
  );
}
