"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/app/lib/services";

const PROMPTS: Record<string, string> = {
  refrigerator: "Not cooling?",
  "washing-machine": "Not spinning?",
  ac: "Not cooling?",
  microwave: "Not heating?",
};

const SHORT_NAMES: Record<string, string> = { ac: "AC" };
const SERVICE_ORDER = [
  "refrigerator",
  "washing-machine",
  "ac",
  "microwave",
] as const;

const SERVICE_CARDS = SERVICE_ORDER.map((id) => {
  const service = SERVICES.find((item) => item.id === id);
  if (!service) return null;
  return {
    id: service.id,
    slug: service.slug,
    name: SHORT_NAMES[service.id] ?? service.name,
    prompt: PROMPTS[service.id] ?? "Need repair?",
    image: service.image,
    mostBooked: service.id === "refrigerator",
  };
}).filter((item): item is NonNullable<typeof item> => item !== null);

export default function ServicePickerSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef<number | null>(null);

  const syncActiveCard = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-service-card]"),
    );
    if (!cards.length) return;

    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft + card.offsetWidth / 2 - center,
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });
    setActiveIndex(nearestIndex);
  }, []);

  const showCard = useCallback((index: number, smooth = true) => {
    const scroller = scrollerRef.current;
    const card = scroller?.querySelectorAll<HTMLElement>(
      "[data-service-card]",
    )[index];
    if (!scroller || !card) return;
    scroller.scrollTo({
      left: Math.max(card.offsetLeft, 0),
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    syncActiveCard();
    scroller.addEventListener("scroll", syncActiveCard, { passive: true });
    return () => scroller.removeEventListener("scroll", syncActiveCard);
  }, [syncActiveCard]);

  useEffect(() => {
    if (paused) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(min-width: 768px)").matches) return;

    const timer = window.setInterval(() => {
      const next = (activeIndex + 1) % SERVICE_CARDS.length;
      showCard(next);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [activeIndex, paused, showCard]);

  useEffect(
    () => () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    },
    [],
  );

  const pauseBriefly = () => {
    setPaused(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => setPaused(false), 5000);
  };

  return (
    <section
      id="service-picker"
      className="overflow-hidden bg-white py-7 md:py-16"
      aria-labelledby="service-picker-heading"
    >
      <div className="container mx-auto max-w-screen-2xl px-5 md:px-10">
        <div className="mb-4 flex items-end justify-between gap-6 md:mb-9">
          <div>
            <h2
              id="service-picker-heading"
              className="inline-flex rounded-lg bg-primary px-3 py-1.5 font-headline text-lg font-medium tracking-tight text-white md:rounded-xl md:bg-transparent md:p-0 md:text-5xl md:text-on-surface"
            >
              What needs fixing?
            </h2>
            <p className="mt-2 text-xs font-semibold text-on-surface-variant md:mt-3 md:text-lg md:text-on-surface">
              Choose your appliance and we&apos;ll take it from there.
            </p>
          </div>
          <Link
            href="/services"
            className="hidden items-center gap-2 font-label text-xs font-black uppercase tracking-widest text-primary hover:text-primary/70 md:inline-flex"
          >
            All repair services
            <span className="material-symbols-outlined text-base">
              arrow_forward
            </span>
          </Link>
        </div>

        <div
          ref={scrollerRef}
          className="-mr-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto scroll-pl-1 pr-5 pb-1 no-scrollbar md:mx-auto md:mr-auto md:grid md:max-w-3xl md:grid-cols-4 md:gap-4 md:overflow-visible md:pr-0 lg:max-w-4xl"
          aria-label="Repair service categories"
          onTouchStart={pauseBriefly}
          onPointerDown={pauseBriefly}
        >
          {SERVICE_CARDS.map((item) => (
            <Link
              key={item.id}
              data-service-card
              href={`/services/${item.slug}`}
              className={`group relative flex w-34 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] md:w-auto md:max-w-none ${
                item.mostBooked
                  ? "border-primary ring-1 ring-primary/10"
                  : "border-outline/70 hover:border-primary/30"
              }`}
              aria-label={`View ${item.name} repair`}
            >
              {item.mostBooked && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-primary px-2 py-0.5 font-label text-[7px] font-black uppercase tracking-wider text-white shadow-sm">
                  Most booked
                </span>
              )}
              <div className="relative aspect-3/4 overflow-hidden bg-surface-container-low">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 767px) 136px, 180px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between gap-1.5 px-2.5 py-2 md:px-3 md:py-2.5">
                <div className="min-w-0">
                  <h3 className="truncate font-headline text-[13px] font-bold leading-tight text-on-surface md:text-sm">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 truncate text-[10px] text-on-surface-variant">
                    {item.prompt}
                  </p>
                </div>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary transition-all group-hover:bg-primary group-hover:text-white">
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between md:hidden">
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Service carousel position"
          >
            {SERVICE_CARDS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={`Show ${item.name}`}
                onClick={() => {
                  pauseBriefly();
                  showCard(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  activeIndex === index ? "w-5 bg-primary" : "w-1.5 bg-outline"
                }`}
              />
            ))}
          </div>
          <span className="font-label text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Swipe for more →
          </span>
        </div>
      </div>
    </section>
  );
}
