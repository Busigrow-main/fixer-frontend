"use client";

import React from "react";
import { useBooking } from "@/app/context/BookingContext";

export default function BookRepairButton({ serviceSlug }: { serviceSlug: string }) {
  const { openBooking } = useBooking();

  return (
    <button
      type="button"
      onClick={() => openBooking(serviceSlug)}
      className="bg-primary text-on-primary px-8 md:px-10 min-h-[56px] rounded-xl font-extrabold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[0.98] transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs md:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
    >
      <span className="material-symbols-outlined icon-filled text-lg">calendar_month</span>
      Instant Booking
    </button>
  );
}