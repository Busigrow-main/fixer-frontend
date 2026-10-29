"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useBooking } from "@/app/context/BookingContext";
import { getServiceImage } from "@/app/lib/services";

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
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
        {initialServices.map((s) => {
          const features: string[] = s.features ?? [];

          return (
            <article key={s._id} className="group h-full">
              {/* ───────── Phones (under 640px): compact card ───────── */}
              <div className="rounded-2xl border border-outline bg-white p-3 shadow-sm sm:hidden">
                <div className="flex gap-3">
                  {/* Small thumbnail */}
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface-container">
                    <Image
                      src={getServiceImage(s.slug)}
                      alt={s.title || s.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="flex min-w-0 items-start gap-1.5 font-headline text-base leading-tight text-on-surface">
                        <span className="material-symbols-outlined icon-filled mt-px shrink-0 text-[18px] text-primary">
                          {s.icon}
                        </span>
                        <span className="min-w-0">{s.name} Repair</span>
                      </h3>

                      <div className="shrink-0 whitespace-nowrap text-right">
                        <p className="text-[10px] font-bold uppercase leading-none tracking-wider text-on-surface-variant">
                          From
                        </p>
                        <p className="mt-0.5 text-base font-black leading-none text-primary">{s.startingPrice}</p>
                      </div>
                    </div>

                    <p className="mt-1.5 line-clamp-2 text-xs leading-snug text-on-surface-variant">
                      {s.description}
                    </p>
                  </div>
                </div>

                {/* Two key points only, the full list is on the details page */}
                {features.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {features.slice(0, 2).map((f) => (
                      <li
                        key={f}
                        className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-semibold leading-none text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openBooking(s.slug)}
                    aria-label={`Book ${s.name} repair`}
                    className="h-11 flex-1 rounded-xl bg-zinc-900 text-[11px] font-black uppercase tracking-wider text-white transition-all active:scale-[0.98] active:bg-primary"
                  >
                    Book Now
                  </button>
                  <Link
                    href={`/services/${s.slug}`}
                    aria-label={`View ${s.name} repair details`}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-outline text-on-surface transition-all active:scale-95 active:bg-surface-container"
                  >
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>

              {/* ───────── 640px and up: full card ───────── */}
              <div className="relative hidden h-full flex-row overflow-hidden rounded-2xl border border-outline bg-white shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-zinc-200/50 sm:flex md:rounded-[2.5rem]">
                {/* Image Side */}
                <div className="relative w-[240px] shrink-0 overflow-hidden lg:w-[340px]">
                  <Image
                    src={getServiceImage(s.slug)}
                    alt={s.title || s.name}
                    fill
                    sizes="(min-width: 1024px) 340px, 240px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Category Chip */}
                  <div className="absolute left-4 top-4">
                    <div className="rounded-full border border-white/20 bg-white/90 px-3 py-1 shadow-sm backdrop-blur-md">
                      <span className="text-[9px] font-black uppercase tracking-widest text-primary">{s.name}</span>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex min-w-0 flex-1 flex-col p-6 lg:p-10">
                  <div className="flex-1">
                    {/* Header: top-aligned, price never wraps */}
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <span className="material-symbols-outlined icon-filled mt-[3px] shrink-0 text-[20px] text-primary">
                          {s.icon}
                        </span>
                        {/* Reserves two lines so every card's text starts at the same height */}
                        <h3 className="min-h-[2.5em] font-headline text-xl leading-tight text-on-surface">
                          {s.name} Repair
                        </h3>
                      </div>

                      <div className="shrink-0 whitespace-nowrap text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
                          Starts at
                        </p>
                        <p className="text-lg font-black leading-tight text-primary">{s.startingPrice}</p>
                      </div>
                    </div>

                    {/* Max two lines, fixed height so the list below lines up */}
                    <p className="mb-5 line-clamp-2 min-h-[2.9rem] text-sm leading-relaxed text-on-surface-variant opacity-80">
                      {s.description}
                    </p>

                    <ul className="mb-6 space-y-2">
                      {features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2 text-xs font-bold leading-snug text-on-surface-variant"
                        >
                          <span className="material-symbols-outlined shrink-0 text-lg text-primary">check_circle</span>
                          <span className="min-w-0">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buttons stay pinned to the bottom of every card */}
                  <div className="mt-auto flex items-center gap-3">
                    <button
                      onClick={() => openBooking(s.slug)}
                      aria-label={`Book ${s.name} repair`}
                      className="h-12 flex-1 rounded-xl bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-black/10 transition-all hover:bg-primary active:scale-95"
                    >
                      Book Now
                    </button>
                    <Link
                      href={`/services/${s.slug}`}
                      aria-label={`View ${s.name} repair details`}
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-outline text-on-surface transition-all hover:bg-surface-container active:scale-95"
                    >
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}