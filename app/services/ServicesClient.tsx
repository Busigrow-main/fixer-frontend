"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useBooking } from "@/app/context/BookingContext";

// ── Curated appliance-specific images ──────────────────────────────
// These override whatever is stored in the DB so we always show the
// correct, high-quality photo for each service type.
const SERVICE_IMAGES: Record<string, string> = {
  // A technician inspecting the inside of a fridge
  refrigerator:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1200&auto=format&fit=crop",
  // Modern front-loader washing machine drum
  "washing-machine":
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1200&auto=format&fit=crop",
  // Clean countertop microwave oven (stainless)
  microwave:
    "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?q=80&w=1200&auto=format&fit=crop",
  // Wall-mounted split AC unit in a bright room
  ac:
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?q=80&w=1200&auto=format&fit=crop",
  // Generic electronics technician fallback
  default:
    "https://images.unsplash.com/photo-1621905251918-44b7a1d1ccf6?q=80&w=1200&auto=format&fit=crop",
};

function getServiceImage(slug: string): string {
  return SERVICE_IMAGES[slug] ?? SERVICE_IMAGES["default"];
}

interface ServicesClientProps {
  initialServices?: any[];
  isBannerOnly?: boolean;
}

export default function ServicesClient({ initialServices = [], isBannerOnly = false }: ServicesClientProps) {
  const { openBooking } = useBooking();

  if (isBannerOnly) {
    return (
      <button
        onClick={() => openBooking()}
        className="inline-flex items-center gap-3 bg-on-primary-container text-white px-10 h-14 rounded-xl font-extra-bold uppercase tracking-widest hover:scale-[0.98] transition-all"
      >
        <span className="material-symbols-outlined icon-filled">support_agent</span>
        Request Assistance
      </button>
    );
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 md:px-10 max-w-screen-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {initialServices.map((s) => (
          <div
            key={s._id}
            className="group relative flex flex-col sm:flex-row bg-white rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-outline shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500"
          >
            {/* Image Side */}
            <div className="relative w-full sm:w-[280px] lg:w-[340px] aspect-square sm:aspect-auto overflow-hidden">
              <Image
                src={getServiceImage(s.slug)}
                alt={s.title || s.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent sm:hidden" />

              {/* Category Chip */}
              <div className="absolute top-4 left-4">
                <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm border border-white/20">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">{s.name}</span>
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="flex-1 p-6 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-on-surface-variant font-bold">
                    <span className="material-symbols-outlined text-[20px] text-primary icon-filled">{s.icon}</span>
                    <span className="text-xl font-headline text-on-surface">{s.name} Repair</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Starts at</p>
                    <p className="text-lg font-black text-primary">{s.startingPrice}</p>
                  </div>
                </div>

                <p className="text-sm text-on-surface-variant mb-6 leading-relaxed opacity-80">
                  {s.description}
                </p>

                <ul className="space-y-2 mb-8">
                  {s.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant font-bold">
                      <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => openBooking(s.slug)}
                  className="flex-1 bg-zinc-900 text-white h-12 rounded-xl font-black uppercase tracking-wider text-[10px] shadow-lg shadow-black/10 transition-all hover:bg-primary active:scale-95"
                >
                  Book Now
                </button>
                <Link
                  href={`/services/${s.slug}`}
                  className="w-12 h-12 flex items-center justify-center border-2 border-outline rounded-xl text-on-surface hover:bg-surface-container transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
