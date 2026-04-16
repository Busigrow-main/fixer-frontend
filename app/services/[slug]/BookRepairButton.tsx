"use client";

import React from "react";
import { useBooking } from "@/app/context/BookingContext";

export default function BookRepairButton({ serviceSlug }: { serviceSlug: string }) {
  const { openBooking } = useBooking();

  return (
    <button 
      onClick={() => openBooking(serviceSlug)}
      className="bg-primary text-on-primary px-8 md:px-10 h-13 md:h-14 rounded-xl font-extra-bold uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[0.98] transition-all transform active:scale-95 flex items-center justify-center gap-2 text-xs md:text-base"
    >
       <span className="material-symbols-outlined icon-filled text-lg">calendar_month</span>
       Instant Booking
    </button>
  );
}
