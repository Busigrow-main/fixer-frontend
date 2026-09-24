"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const POINTS = [
  {
    icon: "verified_user",
    title: "25 Years Experience",
    body: "Two decades of technical mastery. Every Fixxer pro is background-checked and highly trained for your complete peace of mind.",
    color: "bg-primary-container",
    iconColor: "text-primary",
    href: "/services",
  },
  {
    icon: "security",
    title: "Appliance Insurance",
    body: "Free service charge for a full year and up to 50% off on every spare part. Ultimate protection for your home essentials.",
    color: "bg-secondary-container",
    iconColor: "text-secondary",
    href: "/services",
  },
  {
    icon: "workspace_premium",
    title: "60-Day Warranty",
    body: "We stand by our mastery. All repairs include a 60-day service warranty and 6 months on genuine Fixxer-installed parts.",
    color: "bg-tertiary-container",
    iconColor: "text-tertiary",
    href: "/warranty",
  },
] as const;

export default function DifferenceSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * Keep the active indicator synchronized
   * with the card currently visible on mobile.
   */
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;

    if (!container) return;

    const cards = Array.from(
      container.querySelectorAll<HTMLElement>(
        "[data-difference-card]"
      )
    );

    if (!cards.length) return;

    const containerCenter =
      container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2;

      const distance = Math.abs(
        cardCenter - containerCenter
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  /*
   * Move to a selected card when
   * the user taps a dot.
   */
  const scrollToCard = (index: number) => {
    const container = scrollRef.current;

    if (!container) return;

    const cards = container.querySelectorAll<HTMLElement>(
      "[data-difference-card]"
    );

    const card = cards[index];

    if (!card) return;

    container.scrollTo({
      left: card.offsetLeft,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  /*
   * Listen for manual scrolling.
   */
  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    handleScroll();

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [handleScroll]);

  return (
    <section
      id="services"
      className="relative overflow-hidden bg-surface-container-low py-14 sm:py-16 md:py-20 lg:py-24"
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-full bg-primary/5 blur-3xl sm:h-80 sm:w-80"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-secondary/5 blur-3xl sm:h-80 sm:w-80"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-primary sm:text-xs">
            Why Fixxer
          </p>

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
            <h2 className="font-headline text-[2rem] leading-[1.05] tracking-tight text-on-surface sm:text-4xl md:text-5xl lg:text-[3.5rem]">
              The{" "}
              <span className="italic text-primary">
                Fixxer
              </span>{" "}
              Difference
            </h2>

            <p className="max-w-xs text-[11px] font-bold uppercase leading-5 tracking-[0.18em] text-on-surface-variant/60 sm:text-xs md:text-right">
              Why 150k+ neighbors choose us
            </p>
          </div>
        </div>

        {/* Cards */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex w-full snap-x snap-mandatory gap-0 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] md:grid md:grid-cols-2 md:gap-5 md:overflow-visible lg:grid-cols-3 lg:gap-6"
        >
          {POINTS.map(
            (
              {
                icon,
                title,
                body,
                color,
                iconColor,
                href,
              },
              index
            ) => (
              <article
                key={title}
                data-difference-card
                className="group relative flex w-full min-w-full shrink-0 snap-start flex-col overflow-hidden rounded-3xl border border-outline/50 bg-surface-container-lowest p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 sm:p-7 md:min-w-0 md:p-8 md:hover:-translate-y-1 md:hover:shadow-lg lg:min-h-[330px] lg:p-9"
              >
                {/* Top accent */}
                <div
                  aria-hidden="true"
                  className={`absolute left-0 top-0 h-1 w-full ${color}`}
                />

                {/* Icon + number */}
                <div className="mb-7 flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${color} sm:h-14 sm:w-14`}
                  >
                    <span
                      className={`material-symbols-outlined text-[23px] sm:text-[25px] ${iconColor}`}
                    >
                      {icon}
                    </span>
                  </div>

                  <span className="text-[10px] font-black tracking-[0.2em] text-on-surface-variant/35">
                    0{index + 1}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="mb-3 text-xl font-bold leading-tight tracking-tight text-on-surface sm:text-[1.4rem]">
                    {title}
                  </h3>

                  <p className="max-w-lg text-sm leading-6 text-on-surface-variant sm:text-[15px] sm:leading-7">
                    {body}
                  </p>
                </div>

                {/* Bottom link */}
                <div className="mt-auto pt-7">
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-on-surface transition-colors duration-200 hover:text-primary"
                  >
                    <span>Learn more</span>

                    <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </article>
            )
          )}
        </div>

        {/* Mobile controls */}
        <div className="mt-5 flex flex-col items-center gap-2.5 md:hidden">
          {/* Dots */}
          <div
            className="flex items-center gap-1.5"
            role="tablist"
            aria-label="Why Fixxer cards"
          >
            {POINTS.map((point, index) => (
              <button
                key={point.title}
                type="button"
                role="tab"
                aria-selected={activeIndex === index}
                aria-label={`Show ${point.title}`}
                onClick={() => scrollToCard(index)}
                className="flex h-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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

          {/* Swipe hint */}
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-on-surface-variant/50">
            <span>Swipe to explore</span>

            <span className="material-symbols-outlined text-[14px]">
              swipe
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}