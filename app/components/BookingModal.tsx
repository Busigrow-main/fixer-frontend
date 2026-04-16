"use client";

import React, { useEffect, useState } from "react";
import { useBooking } from "@/app/context/BookingContext";
import BookingForm from "./BookingForm";

export default function BookingModal() {
  const { isOpen, closeBooking, selectedService } = useBooking();
  const [mounted, setMounted] = useState(false);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeBooking]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setMounted(true);
    } else {
      document.body.style.overflow = "unset";
      // Delay unmounting for exit animation
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeBooking}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl shadow-black/20 overflow-hidden transition-all duration-300 transform pb-safe ${
          isOpen ? "translate-y-0 sm:scale-100 opacity-100" : "translate-y-full sm:translate-y-8 sm:scale-95 opacity-0"
        }`}
      >
        {/* Drag Handle (Mobile only) */}
        <div className="flex justify-center pt-4 sm:hidden">
          <div className="w-10 h-1.5 bg-surface-container-highest rounded-full" />
        </div>

        {/* Header */}
        <div className="relative px-6 sm:px-8 pt-6 sm:pt-10 pb-2 text-center">
          <button
            onClick={closeBooking}
            className="absolute top-4 sm:top-6 right-4 sm:right-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
          
          <div className="inline-flex items-center gap-2 bg-primary-container text-primary px-3 py-1 rounded-full mb-4">
            <span className="material-symbols-outlined text-sm icon-filled">verified</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Priority Dispatch</span>
          </div>
          
          <h2 className="font-headline text-2xl sm:text-4xl text-on-surface tracking-tight">
            Book your <span className="italic text-primary">Master</span> Repair
          </h2>
          <p className="text-on-surface-variant text-xs sm:text-sm mt-3 max-w-sm mx-auto opacity-80">
            Professional dispatch to your neighborhood.
          </p>
        </div>

        {/* Scrollable Form Area */}
        <div className="px-6 sm:px-8 pb-10 pt-4 max-h-[75vh] lg:max-h-[70vh] overflow-y-auto custom-scrollbar">
          <BookingForm 
            initialServiceSlug={selectedService} 
            onSuccess={closeBooking} 
          />
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0e0e0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bdbdbd;
        }
      `}</style>
    </div>
  );
}
