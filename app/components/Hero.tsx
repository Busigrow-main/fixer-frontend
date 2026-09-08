"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/app/lib/services";
import { useBooking } from "@/app/context/BookingContext";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDA9mgV-aJUlhsUCFdpsjAh68ldSYuVZG2VUmsj7OENR0BXA1gTDTblJEOs-o4QuxoYqOB3ATEbqXfQnlhhnTZfaLr4GrDJKb_KKZNCgj4MuVslFnjNnpt2vimmj3KSRaUMnWW3aOKkFhPUbZYgwTswXCRlDchT9CFwlo-S87VSmDqAODSSoXuAhh3nRB-oLg8wsMqBtMAbN7re1oHbiaipdcAUnMuDbw2bg8bMhqlgrPfpSIcTXcmvTpPQ3uPQ1jSpFqSg9IrarOA";

const PROMPTS: Record<string, string> = {
  refrigerator: "Not cooling?",
  "washing-machine": "Not spinning?",
  ac: "Not cooling?",
  microwave: "Not heating?",
};

const SHORT_NAMES: Record<string, string> = {
  ac: "AC",
};

/** Unique hero appliances — one card per service id, mock order, no duplicates. */
const HERO_ORDER = ["refrigerator", "washing-machine", "ac", "microwave"] as const;

const HERO_APPLIANCES = HERO_ORDER.map((id) => {
  const s = SERVICES.find((svc) => svc.id === id);
  if (!s) return null;
  return {
    id: s.id,
    slug: s.slug,
    name: SHORT_NAMES[s.id] ?? s.name,
    prompt: PROMPTS[s.id] ?? "Need repair?",
    image: s.image,
    mostBooked: s.id === "refrigerator",
  };
}).filter((item): item is NonNullable<typeof item> => item !== null);

const TRUST_ITEMS = [
  { icon: "verified_user", label: "60-Day Warranty" },
  { icon: "schedule", label: "30-Min Avg. Arrival" },
  { icon: "groups", label: "12k+ Repairs" },
] as const;

export default function Hero() {
  const { openBooking } = useBooking();
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>("[data-hero-card]"));
    if (!cards.length) return;

    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, i) => {
      const center = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    setActiveIndex(best);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncActiveFromScroll();
    el.addEventListener("scroll", syncActiveFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", syncActiveFromScroll);
  }, [syncActiveFromScroll]);

  const scrollToIndex = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>("[data-hero-card]")[index];
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-white pt-2 md:pt-24 lg:pt-28">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-40 h-56 w-56 rounded-full bg-primary-container/40 blur-[80px]" />

      <div className="relative z-10 container mx-auto flex max-w-screen-2xl flex-col px-5 md:px-10 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(460px,1.1fr)] lg:gap-x-16">
        {/* Intro */}
        <div
          className={`order-1 max-w-2xl self-center transition-all duration-500 lg:col-start-1 lg:row-start-1 lg:order-none lg:self-end lg:pb-5 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary px-3.5 py-1.5 font-label text-[9px] font-black uppercase tracking-[0.14em] text-white md:text-[10px] md:tracking-[0.2em]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            25 Years of Technical Mastery
          </span>

          <h1 className="font-headline text-[2.35rem] leading-[1.08] tracking-tight text-on-surface sm:text-5xl md:text-6xl lg:text-[4.65rem] xl:text-[5.25rem]">
            Your <span className="italic text-primary">Fixxer</span> for Master
            Repairs.
          </h1>
          <p className="mt-5 hidden max-w-xl text-lg leading-relaxed text-on-surface-variant lg:block">
            Trusted appliance care, genuine parts, and experienced technicians
            at your doorstep across Patna.
          </p>
        </div>

        {/* Technician visual — right column on desktop, lower band on mobile */}
        <div
          className={`relative order-6 mt-8 aspect-[16/10] w-full overflow-hidden md:mt-12 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:order-none lg:mt-0 lg:h-[570px] lg:aspect-auto lg:rounded-[2.25rem] lg:border lg:border-outline/60 lg:shadow-2xl lg:shadow-black/10 xl:h-[620px] transition-all duration-700 delay-400 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          <Image
            src={HERO_IMAGE}
            alt="Fixxer technician repairing a home appliance"
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 52vw"
            className="object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-10 md:right-auto md:max-w-md lg:left-7 lg:right-7">
            <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/92 p-3 shadow-xl backdrop-blur-md md:p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                <span className="material-symbols-outlined icon-filled text-xl">
                  verified
                </span>
              </span>
              <div>
                <p className="font-bold text-sm text-zinc-900">Master Technician</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Background checked · Patna
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appliance picker */}
        <div
          className={`order-2 mt-7 transition-all duration-500 delay-100 md:mt-10 lg:col-span-2 lg:row-start-4 lg:order-none lg:mt-16 lg:rounded-[2rem] lg:border lg:border-outline/60 lg:bg-surface-container-low/70 lg:p-8 xl:p-10 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="lg:flex lg:items-end lg:justify-between lg:gap-8">
            <div>
              <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface md:text-2xl lg:text-3xl">
                What needs fixing?
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant md:text-base">
                Choose your appliance and we&apos;ll take it from there.
              </p>
            </div>
            <Link
              href="/services"
              className="hidden items-center gap-2 font-label text-xs font-black uppercase tracking-widest text-primary transition-colors hover:text-primary/70 lg:inline-flex"
            >
              View all services
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          {/* Carousel */}
          <div className="relative mt-5 -mx-5 md:mx-0 lg:mt-7">
            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-2 no-scrollbar md:gap-4 md:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0"
              aria-label="Appliance services"
            >
              {HERO_APPLIANCES.map((item) => (
                <Link
                  key={item.id}
                  data-hero-card
                  href={`/services/${item.slug}`}
                  className={`group relative flex w-[42vw] max-w-[168px] shrink-0 snap-center flex-col items-center rounded-[1.35rem] border bg-white px-3 pb-4 pt-3 shadow-sm transition-all duration-300 active:scale-[0.97] sm:w-[160px] md:w-[180px] md:max-w-none md:rounded-[1.5rem] md:hover:-translate-y-1 md:hover:shadow-lg lg:w-full ${
                    item.mostBooked
                      ? "border-primary/70 ring-1 ring-primary/15"
                      : "border-outline/70 hover:border-primary/30"
                  }`}
                  aria-label={`Book ${item.name} repair`}
                >
                  {item.mostBooked && (
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 font-label text-[8px] font-black uppercase tracking-wide text-white">
                      Most Booked
                    </span>
                  )}

                  <div className="relative mb-3 mt-4 aspect-square w-full overflow-hidden rounded-2xl bg-surface-container-low">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="180px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <p className="text-center font-headline text-[15px] font-bold leading-tight text-on-surface md:text-base">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-center text-[11px] text-on-surface-variant md:text-xs">
                    {item.prompt}
                  </p>

                  <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/25 transition-transform duration-300 group-hover:scale-110">
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_forward
                    </span>
                  </span>
                </Link>
              ))}
              {/* Trailing spacer so last card can center on mobile */}
              <div className="w-2 shrink-0 md:hidden" aria-hidden />
            </div>

            <div className="mt-3 flex items-center justify-between px-5 md:px-0 lg:hidden">
              <div className="flex items-center gap-1.5" role="tablist" aria-label="Carousel position">
                {HERO_APPLIANCES.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={activeIndex === i}
                    aria-label={`Show ${item.name}`}
                    onClick={() => scrollToIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeIndex === i
                        ? "w-5 bg-primary"
                        : "w-1.5 bg-outline hover:bg-on-surface-variant"
                    }`}
                  />
                ))}
              </div>
              <p className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Swipe for more →
              </p>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div
          className={`order-3 mt-6 flex flex-col gap-3 transition-all duration-500 delay-200 sm:flex-row md:mt-8 lg:col-start-1 lg:row-start-2 lg:order-none lg:mt-7 lg:self-start ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            type="button"
            onClick={() => openBooking()}
            className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-[15px] font-extrabold text-on-primary shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] sm:w-auto sm:min-w-[190px]"
          >
            <span className="material-symbols-outlined icon-filled text-[21px]">
              build
            </span>
            Book Fixxer
          </button>
          <Link
            href="#shop"
            className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-xl border border-outline bg-white px-5 text-[15px] font-bold text-on-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md active:scale-[0.98] sm:w-auto sm:min-w-[230px]"
          >
            <span className="material-symbols-outlined text-[21px]">storefront</span>
            Shop Parts & Appliances
          </Link>
        </div>

        {/* Trust row */}
        <div
          className={`order-4 mt-7 grid grid-cols-3 gap-2 border-t border-outline pt-5 transition-all duration-500 delay-300 md:mt-9 md:flex md:justify-start md:gap-8 lg:col-start-1 lg:row-start-3 lg:order-none lg:mb-3 lg:mt-5 lg:self-end ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {TRUST_ITEMS.map(({ icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 text-center md:flex-row md:gap-2 md:text-left"
            >
              <span className="material-symbols-outlined text-[22px] text-on-surface-variant md:text-2xl">
                {icon}
              </span>
              <span className="font-label text-[9px] font-bold uppercase leading-tight tracking-wide text-on-surface-variant md:text-[11px]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* 1,50,000+ social proof */}
        <div
          className={`order-5 mt-8 overflow-hidden rounded-[1.5rem] border border-outline bg-surface-container-low p-5 transition-all duration-500 delay-300 md:mt-10 md:flex md:items-center md:justify-between md:rounded-[2rem] md:p-8 lg:col-span-2 lg:row-start-5 lg:order-none lg:mt-6 lg:bg-white lg:px-10 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div>
            <span className="inline-flex rounded-full bg-primary px-3 py-1 font-label text-[9px] font-black uppercase tracking-widest text-white">
              Fixxer has served
            </span>
            <p className="mt-3 text-sm text-on-surface md:text-base">
              Your appliances know us. You probably do too.
            </p>
            <p className="mt-2 flex items-start gap-1 font-headline text-4xl font-black tracking-tight text-primary md:text-5xl">
              <span>1,50,000+</span>
              <span className="material-symbols-outlined icon-filled mt-1 text-lg text-primary md:text-xl">
                check_circle
              </span>
            </p>
            <p className="mt-1 text-lg font-bold text-on-surface md:text-xl">
              Customers{" "}
              <span className="font-headline italic font-medium">in Patna</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => openBooking()}
            className="mt-5 hidden h-12 items-center gap-2 rounded-xl bg-zinc-900 px-6 font-label text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-primary md:inline-flex"
          >
            Book Fixxer
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </div>
      </div>
    </section>
  );
}
