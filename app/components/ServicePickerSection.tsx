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

const SHORT_NAMES: Record<string, string> = {
  ac: "AC",
};

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
}).filter(
  (item): item is NonNullable<typeof item> => item !== null
);

export default function ServicePickerSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const syncActiveCard = useCallback(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    const cards = Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-service-card]")
    );

    if (!cards.length) return;

    const containerCenter =
      scroller.scrollLeft + scroller.clientWidth / 2;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  }, []);

  const showCard = useCallback(
    (index: number, smooth = true) => {
      const scroller = scrollerRef.current;

      if (!scroller) return;

      const cards = scroller.querySelectorAll<HTMLElement>(
        "[data-service-card]"
      );

      const card = cards[index];

      if (!card) return;

      scroller.scrollTo({
        left: card.offsetLeft,
        behavior: smooth ? "smooth" : "auto",
      });

      setActiveIndex(index);
    },
    []
  );

  useEffect(() => {
    const scroller = scrollerRef.current;

    if (!scroller) return;

    syncActiveCard();

    scroller.addEventListener("scroll", syncActiveCard, {
      passive: true,
    });

    window.addEventListener("resize", syncActiveCard);

    return () => {
      scroller.removeEventListener("scroll", syncActiveCard);
      window.removeEventListener("resize", syncActiveCard);
    };
  }, [syncActiveCard]);

  useEffect(() => {
    if (paused) return;

    if (typeof window === "undefined") return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (window.matchMedia("(min-width: 768px)").matches) {
      return;
    }

    const timer = window.setInterval(() => {
      const nextIndex =
        (activeIndex + 1) % SERVICE_CARDS.length;

      showCard(nextIndex);
    }, 4500);

    return () => {
      window.clearInterval(timer);
    };
  }, [activeIndex, paused, showCard]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) {
        window.clearTimeout(resumeTimer.current);
      }
    };
  }, []);

  const pauseBriefly = () => {
    setPaused(true);

    if (resumeTimer.current) {
      window.clearTimeout(resumeTimer.current);
    }

    resumeTimer.current = window.setTimeout(() => {
      setPaused(false);
    }, 5000);
  };

  return (
    <section
      id="service-picker"
      aria-labelledby="service-picker-heading"
      className="overflow-hidden bg-white py-10 sm:py-12 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="mb-7 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="flex items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.25em] text-primary sm:text-[10px] md:text-xs">
                Repair services
              </p>

              <h2
                id="service-picker-heading"
                className="font-headline text-[1.8rem] font-medium leading-[1.08] tracking-tight text-on-surface sm:text-3xl md:text-4xl lg:text-5xl"
              >
                What needs fixing?
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-on-surface-variant sm:text-sm sm:leading-6 md:mt-3 md:text-base lg:text-lg">
                Choose your appliance and we&apos;ll take it from there.
              </p>
            </div>

            <Link
              href="/services"
              className="group hidden shrink-0 items-center gap-2 pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/70 md:inline-flex lg:text-xs"
            >
              <span>All repair services</span>

              <span className="material-symbols-outlined text-[17px] transition-transform duration-200 group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile carousel / Tablet + Desktop grid */}
        <div
          ref={scrollerRef}
          aria-label="Repair service categories"
          onTouchStart={pauseBriefly}
          onPointerDown={pauseBriefly}
          className="flex w-full snap-x snap-mandatory gap-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 lg:gap-5 xl:gap-6"
        >
          {SERVICE_CARDS.map((item) => (
            <Link
              key={item.id}
              href={`/services/${item.slug}`}
              data-service-card
              aria-label={`View ${item.name} repair`}
              className={`group relative flex w-full min-w-full shrink-0 snap-start flex-col overflow-hidden rounded-[1.4rem] border bg-white shadow-[0_5px_20px_rgba(0,0,0,0.05)] transition-all duration-300 active:scale-[0.99] sm:rounded-[1.5rem] md:min-w-0 md:rounded-3xl md:hover:-translate-y-1 md:hover:shadow-lg lg:rounded-[1.75rem] ${
                item.mostBooked
                  ? "border-primary/60 ring-1 ring-primary/10"
                  : "border-outline/60 hover:border-primary/30"
              }`}
            >
              {/* Badge */}
              {item.mostBooked && (
                <span className="absolute left-3 top-3 z-20 rounded-full bg-primary px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.14em] text-white shadow-md sm:text-[8px]">
                  Most booked
                </span>
              )}

              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-low sm:aspect-[5/4] md:aspect-[4/3] lg:aspect-[5/4]">
                <Image
                  src={item.image}
                  alt={`${item.name} repair service`}
                  fill
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>

              {/* Content */}
              <div className="flex min-h-[78px] items-center justify-between gap-3 px-4 py-3.5 sm:min-h-[86px] sm:px-5 sm:py-4 md:min-h-[88px] lg:min-h-[92px]">
                <div className="min-w-0">
                  <h3 className="truncate font-headline text-base font-bold leading-tight text-on-surface sm:text-lg md:text-base lg:text-lg">
                    {item.name}
                  </h3>

                  <p className="mt-1 truncate text-[11px] leading-4 text-on-surface-variant sm:text-xs">
                    {item.prompt}
                  </p>
                </div>

                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-white sm:h-10 sm:w-10">
                  <span className="material-symbols-outlined text-[17px] sm:text-[18px]">
                    arrow_forward
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile controls */}
        <div className="mt-4 md:hidden">
          <div className="flex items-center justify-between gap-3">
            {/* Dots */}
            <div
              className="flex shrink-0 items-center gap-1"
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
                  className="flex h-6 items-center justify-center rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <span
                    className={
                      activeIndex === index
                        ? "h-1.5 w-6 rounded-full bg-primary transition-all duration-300"
                        : "h-1.5 w-1.5 rounded-full bg-outline/40 transition-all duration-300"
                    }
                  />
                </button>
              ))}
            </div>

            {/* Position */}
            <span className="text-[9px] font-bold tabular-nums tracking-[0.12em] text-on-surface-variant/50">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(SERVICE_CARDS.length).padStart(2, "0")}
            </span>

            {/* Swipe hint */}
            <div className="flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/50">
              <span>Swipe</span>

              <span className="material-symbols-outlined text-[14px]">
                swipe
              </span>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="mt-5 border-t border-outline/40 pt-5">
            <Link
              href="/services"
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-outline/60 bg-white px-4 text-[10px] font-black uppercase tracking-[0.14em] text-on-surface transition-all duration-200 hover:border-primary/40 hover:text-primary active:scale-[0.99]"
            >
              <span>View all repair services</span>

              <span className="material-symbols-outlined text-[16px] transition-transform duration-200 group-hover:translate-x-0.5">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}