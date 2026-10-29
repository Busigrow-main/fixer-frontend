"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useBooking } from "@/app/context/BookingContext";
import BookingForm from "./BookingForm";

const DESKTOP_POINTS = [
  { icon: "notifications_active", title: "Assigned right away", text: "Nearby technicians are notified as soon as you book." },
  { icon: "call", title: "They call to confirm", text: "Your technician contacts you before arriving." },
  { icon: "verified_user", title: "60-day service warranty", text: "Warranty starts when the job is completed." },
];

export default function BookingModal() {
  const pathname = usePathname();
  const { isOpen, closeBooking, selectedService } = useBooking();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!pathname) return;
    if (pathname === "/login" || pathname === "/register") closeBooking();
  }, [pathname, closeBooking]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeBooking]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setMounted(true);
    } else {
      document.body.style.overflow = "unset";
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted && !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <div
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[5px]"
        onClick={closeBooking}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Book a repair"
        className={`relative flex min-h-0 w-full max-w-[460px] flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06),0_40px_100px_-16px_rgba(0,0,0,0.45)] transition-all duration-300 ease-out max-h-[min(720px,calc(100dvh-32px))] md:max-h-[min(840px,calc(100dvh-48px))] md:max-w-4xl md:flex-row lg:max-w-5xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.96] opacity-0"
        }`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="relative flex shrink-0 items-center justify-between gap-3 bg-gradient-to-b from-primary/[0.08] to-white px-5 pb-3 pt-4 sm:px-6 sm:pt-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-primary text-white shadow-[0_8px_18px_-6px_rgba(200,16,46,0.65)]">
                <span className="material-symbols-outlined icon-filled text-[21px]">home_repair_service</span>
              </span>
              <div className="min-w-0 leading-tight">
                <h2 className="font-headline text-[18px] tracking-tight text-zinc-900 md:text-[22px]">Book a repair</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-zinc-500">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Technicians assigned right away
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeBooking}
              aria-label="Close booking form"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-zinc-600 ring-1 ring-zinc-200/80 transition hover:bg-white hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[19px]">close</span>
            </button>
          </header>

          <div className="booking-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <BookingForm initialServiceSlug={selectedService} onSuccess={closeBooking} />
          </div>
        </div>

        <aside className="hidden w-[300px] shrink-0 flex-col justify-between border-l border-zinc-100 bg-zinc-50/80 px-6 py-6 md:flex lg:w-[340px]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">What happens next</p>
            <ul className="mt-5 space-y-5">
              {DESKTOP_POINTS.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-zinc-200/80">
                    <span className="material-symbols-outlined icon-filled text-[20px]">{item.icon}</span>
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-zinc-900">{item.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-zinc-500">{item.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 rounded-2xl bg-white px-4 py-4 ring-1 ring-zinc-200/80">
            <p className="text-sm font-semibold text-zinc-900">Need help booking?</p>
            <a href="tel:+917004771388" className="mt-1 block text-sm font-bold text-primary">
              +91 70047 71388
            </a>
            <p className="mt-1 text-xs text-zinc-500">8 AM – 11 PM Daily · Patna</p>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .booking-scroll {
          scrollbar-width: thin;
          scrollbar-color: #e4e4e7 transparent;
          -webkit-overflow-scrolling: touch;
        }
        .booking-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .booking-scroll::-webkit-scrollbar-thumb {
          background: #e4e4e7;
          border-radius: 999px;
        }
        @media (max-width: 767px) {
          .booking-scroll {
            scrollbar-width: none;
          }
          .booking-scroll::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
