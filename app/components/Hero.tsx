"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBooking } from "@/app/context/BookingContext";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDA9mgV-aJUlhsUCFdpsjAh68ldSYuVZG2VUmsj7OENR0BXA1gTDTblJEOs-o4QuxoYqOB3ATEbqXfQnlhhnTZfaLr4GrDJKb_KKZNCgj4MuVslFnjNnpt2vimmj3KSRaUMnWW3aOKkFhPUbZYgwTswXCRlDchT9CFwlo-S87VSmDqAODSSoXuAhh3nRB-oLg8wsMqBtMAbN7re1oHbiaipdcAUnMuDbw2bg8bMhqlgrPfpSIcTXcmvTpPQ3uPQ1jSpFqSg9IrarOA";

/** Animated number counter */
function CountUp({
  target,
  suffix = "",
  duration = 1600,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let start: number | null = null;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

const STATS = [
  { value: 4.9, display: "4.9", suffix: "/5", label: "Top Rated" },
  { value: 30, display: "30", suffix: "m", label: "Avg. Arrival" },
  { value: 12000, display: "12", suffix: "k+", label: "Happy Clients" },
] as const;

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const { openBooking } = useBooking();
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-center bg-white overflow-hidden pt-4 md:pt-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary-container/25 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/4" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[100px] translate-x-1/3 translate-y-1/4" />
      </div>

      <div className="container mx-auto px-6 md:px-10 max-w-screen-2xl flex flex-col lg:flex-row items-center gap-10 lg:gap-20 py-6 lg:py-12">
        {/* ── Content (Now First for Mobile) ── */}
        <div className="w-full lg:w-1/2 flex flex-col order-first lg:order-none">
          {/* Badge */}
          <span
            className={`inline-flex self-start items-center px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-primary-container text-primary font-bold text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] whitespace-nowrap mb-4 lg:mb-6 transition-all duration-500 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
            25 Years of Technical Mastery
          </span>

          {/* Headline */}
          <h1
            className={`font-headline text-4xl sm:text-5xl md:text-[4.5rem] lg:text-[5.5rem] text-on-surface leading-[1.05] lg:leading-[0.92] tracking-tight md:tracking-tighter mb-5 lg:mb-7 transition-all duration-600 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            Your <span className="italic text-primary">Fixxer</span>
            <br />
            for Master
            <br className="hidden lg:block" /> Repairs.
          </h1>

          {/* Subhead */}
          <p
            className={`text-base md:text-xl text-on-surface-variant max-w-lg mb-6 lg:mb-8 leading-relaxed transition-all duration-600 delay-300 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            India&apos;s trusted platform for appliance repair.{" "}
            <span className="font-bold text-on-surface">60-day warranty</span> &{" "}
            <span className="font-bold text-on-surface">
              Appliance Insurance
            </span>{" "}
            included. Free service charge for a year & up to 50% off on every
            spare part.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row gap-4 mb-8 lg:mb-10 transition-all duration-600 delay-400 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <button
              onClick={() => openBooking()}
              className="group relative bg-primary text-on-primary px-8 h-14 rounded-xl font-extrabold text-base overflow-hidden shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[0.97] hover:shadow-2xl hover:shadow-primary/30 active:scale-95"
            >
              <span className="material-symbols-outlined icon-filled text-xl">
                build
              </span>
              <span>Book Master Service</span>
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
            <Link
              href="/services"
              className="bg-white text-on-surface border-2 border-outline px-8 h-14 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 hover:bg-surface-container hover:border-primary/20 hover:scale-[0.97] active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">
                grid_view
              </span>
              <span>View Categories</span>
            </Link>
          </div>

          {/* Stats */}
          <div
            className={`pt-5 lg:pt-8 border-t border-outline flex justify-between sm:justify-start sm:gap-12 lg:gap-16 transition-all duration-600 delay-500 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {STATS.map(({ display, suffix, label }, i) => (
              <div key={label} className="group">
                <p className="text-2xl lg:text-3xl font-headline font-bold text-on-surface tabular-nums">
                  {mounted ? (
                    <>
                      {display}
                      {suffix}
                    </>
                  ) : (
                    `${display}${suffix}`
                  )}
                </p>
                <p className="text-[9px] lg:text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-1">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Image Card (Below on Mobile, Smaller) ── */}
        <div
          className={`w-full lg:w-1/2 relative transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Card - Reduced aspect ratio on mobile */}
          <div className="relative rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-200/80 aspect-video lg:aspect-auto lg:h-[660px] group">
            <Image
              src={HERO_IMAGE}
              alt="A master technician in a navy Fixxer uniform expertly repairing a high-end appliance"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

            {/* Trust badge - Smaller on mobile */}
            <div className="absolute bottom-4 left-4 right-4 lg:bottom-8 lg:left-8 lg:right-8">
              <div className="bg-white/92 backdrop-blur-md p-3 lg:p-5 rounded-xl lg:rounded-2xl border border-white/30 shadow-xl flex items-center gap-3 lg:gap-4 transition-all duration-300">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                  <span className="material-symbols-outlined icon-filled text-lg lg:text-xl">
                    verified
                  </span>
                </div>
                <div>
                  <p className="font-bold text-sm lg:text-base text-zinc-900 leading-tight">
                    Master Technician
                  </p>
                  <p className="text-[9px] lg:text-xs text-zinc-500 uppercase tracking-widest font-bold mt-0.5">
                    Background Checked
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
