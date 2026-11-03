"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const POINTS = [
  {
    icon: "verified_user",
    eyebrow: "EXPERTISE",
    title: "25+ Years Experience",
    body: "Two decades of technical mastery. Every Fixxer pro is background-checked and highly trained for your complete peace of mind.",
    highlight: "Background-checked professionals",
    color: "bg-primary-container",
    iconColor: "text-primary",
    glow: "bg-primary/10",
    href: "/services",
  },
  {
    icon: "security",
    eyebrow: "PROTECTION",
    title: "Appliance Insurance",
    body: "Free service charge for a full year and up to 50% off on every spare part. Ultimate protection for your home essentials.",
    highlight: "1 year service protection",
    color: "bg-secondary-container",
    iconColor: "text-secondary",
    glow: "bg-secondary/10",
    href: "/services",
  },
  {
    icon: "workspace_premium",
    eyebrow: "GUARANTEE",
    title: "60-Day Service Warranty",
    body: "We stand by our mastery. All repairs include a 60-day service warranty and upto 6 months on genuine Fixxer-installed on selected parts.",
    highlight: "6 months on genuine parts",
    color: "bg-tertiary-container",
    iconColor: "text-tertiary",
    glow: "bg-tertiary/10",
    href: "/warranty",
  },
] as const;

const AUTO_SLIDE_DELAY = 4800;

export default function DifferenceSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Scrolls only the card row (never the whole page).
  const scrollToCard = (index: number) => {
    const container = carouselRef.current;
    const card = cardRefs.current[index];

    if (!container || !card) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    container.scrollTo({
      left: Math.max(0, card.offsetLeft),
      behavior: reduceMotion ? "auto" : "smooth",
    });

    setActiveIndex(index);
  };

  const goToNextCard = () => {
    scrollToCard(activeIndex >= POINTS.length - 1 ? 0 : activeIndex + 1);
  };

  const goToPreviousCard = () => {
    scrollToCard(activeIndex <= 0 ? POINTS.length - 1 : activeIndex - 1);
  };

  const pauseCarousel = () => {
    setIsPaused(true);

    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  };

  const resumeCarousel = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 1800);
  };

  // Auto-slide: phones only, and not for people who prefer reduced motion.
  useEffect(() => {
    if (isPaused) return;

    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!isPhone || reduceMotion) return;

    const interval = setInterval(() => {
      goToNextCard();
    }, AUTO_SLIDE_DELAY);

    return () => {
      clearInterval(interval);
    };
  }, [activeIndex, isPaused]);

  // Keep the dots in sync after manual swiping.
  useEffect(() => {
    const container = carouselRef.current;

    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        cardRefs.current.forEach((card, index) => {
          if (!card) return;

          const distance = Math.abs(card.offsetLeft - container.scrollLeft);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);
      }, 80);
    };

    container.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      container.removeEventListener("scroll", handleScroll);

      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] py-8 sm:py-12 md:py-20">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-80 w-80 rounded-full bg-primary/[0.035] blur-[110px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-secondary/[0.035] blur-[110px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-5 sm:px-6 md:px-10 xl:px-12">
        {/* Header */}
        <div className="mb-4 sm:mb-8 md:mb-14">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-5">
            <div>
              <div className="mb-2 flex items-center gap-2.5 md:mb-3">
                <span className="h-[2px] w-7 rounded-full bg-primary" />

                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Why Fixxer
                </p>
              </div>

              <h2 className="font-headline text-[1.6rem] font-medium leading-[1.05] tracking-[-0.045em] text-on-surface sm:text-4xl md:text-5xl lg:text-[3.75rem]">
                More than a repair.
                <br />
                <span className="italic text-primary">
                  Peace of mind.
                </span>
              </h2>
            </div>

            <p className="hidden max-w-[300px] text-xs font-bold uppercase leading-5 tracking-[0.17em] text-on-surface-variant/55 md:block md:pb-1 md:text-right">
              Trusted by 150k+ households for the moments that matter.
            </p>
          </div>
        </div>

        {/* Phones: one card at a time, centered. md and up: 3-column grid. */}
        <div className="mx-auto w-full max-w-[420px] md:max-w-none">
          <div
            ref={carouselRef}
            onTouchStart={pauseCarousel}
            onTouchEnd={resumeCarousel}
            onMouseEnter={pauseCarousel}
            onMouseLeave={resumeCarousel}
            className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2 pt-0.5 md:grid md:grid-cols-3 md:snap-none md:gap-6 md:overflow-visible md:pb-0 md:pt-0"
          >
            {POINTS.map(
              (
                {
                  icon,
                  eyebrow,
                  title,
                  body,
                  highlight,
                  color,
                  iconColor,
                  glow,
                  href,
                },
                index,
              ) => (
                <Link
                  key={title}
                  href={href}
                  ref={(element) => {
                    cardRefs.current[index] = element;
                  }}
                  className="group block w-full shrink-0 snap-start md:w-auto"
                >
                  <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#EAE3D6] bg-[#FFFDF8] p-3.5 shadow-[0_6px_18px_rgba(75,60,40,0.07)] transition-all duration-500 active:scale-[0.99] sm:p-4 md:min-h-[390px] md:rounded-[1.75rem] md:p-7 md:shadow-[0_12px_35px_rgba(75,60,40,0.07)] md:hover:-translate-y-1.5 md:hover:shadow-[0_20px_45px_rgba(75,60,40,0.10)] lg:min-h-[410px] lg:p-8">
                    {/* Background number (desktop only) */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-4 top-4 hidden select-none font-headline text-[8rem] font-bold leading-[0.8] tracking-[-0.11em] text-on-surface/[0.045] transition-all duration-500 md:block lg:text-[9rem] group-hover:text-on-surface/[0.065]"
                    >
                      0{index + 1}
                    </span>

                    {/* Soft glow */}
                    <div
                      aria-hidden="true"
                      className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full ${glow} opacity-50 blur-[55px] transition-all duration-700 group-hover:scale-125`}
                    />

                    {/* Icon + title. One row on phones, stacked on desktop. */}
                    <div className="relative z-10 flex items-center gap-3 md:block">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color} shadow-[0_6px_18px_rgba(24,24,27,0.07)] transition-all duration-500 md:h-14 md:w-14 md:rounded-[1rem] group-hover:-translate-y-1 group-hover:rotate-[-4deg] group-hover:scale-105`}
                      >
                        <span
                          className={`material-symbols-outlined ${iconColor} text-[22px] transition-transform duration-500 md:text-[25px] group-hover:scale-110`}
                        >
                          {icon}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1 md:mt-8">
                        <p className="mb-0.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary md:mb-2 md:tracking-[0.28em]">
                          {eyebrow}
                        </p>

                        {/* Two-line minimum on desktop so all three titles
                            start their text at the same height. */}
                        <h3 className="max-w-[300px] text-base font-bold leading-tight tracking-[-0.02em] text-on-surface md:min-h-[2.1em] md:text-[1.7rem] md:leading-[1.05] md:tracking-[-0.035em]">
                          {title}
                        </h3>
                      </div>
                    </div>

                    {/* Body, divider and highlight */}
                    <div className="relative z-10">
                      {/* Divider (desktop only) */}
                      <div className="mt-4 hidden items-center gap-2 md:flex">
                        <span className="h-[2px] w-7 rounded-full bg-primary transition-all duration-500 group-hover:w-10" />
                        <span className="h-px w-10 bg-outline/20" />
                      </div>

                      {/* 3 lines max on phones, full text on desktop */}
                      <p className="mt-2.5 line-clamp-3 max-w-[330px] text-xs leading-[1.1rem] text-on-surface-variant md:mt-4 md:line-clamp-none md:text-[13px] md:leading-6">
                        {body}
                      </p>

                      {/* Highlight (desktop only) */}
                      <div className="mt-4 hidden items-center gap-2 rounded-full border border-primary/10 bg-primary/[0.035] px-3 py-2 transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary/[0.06] md:inline-flex">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          check_circle
                        </span>

                        <span className="text-[10px] font-bold tracking-wide text-on-surface">
                          {highlight}
                        </span>
                      </div>
                    </div>

                    {/* CTA (desktop only) */}
                    <div className="relative z-10 mt-auto hidden pt-6 md:block">
                      <div className="flex items-center justify-between border-t border-outline/15 pt-4">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/60">
                          Learn more
                        </span>

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition-all duration-300 group-hover:w-11">
                          <span className="material-symbols-outlined text-[17px]">
                            arrow_forward
                          </span>
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ),
            )}
          </div>

          {/* Phones only: previous, dots with count, next */}
          <div
            className="mt-2 flex items-center justify-between md:hidden"
            role="group"
            aria-label={`Showing card ${activeIndex + 1} of ${POINTS.length}`}
          >
            <button
              type="button"
              aria-label="Previous card"
              onClick={() => {
                pauseCarousel();
                goToPreviousCard();
                resumeCarousel();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE3D6] bg-white text-on-surface transition-colors active:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_left
              </span>
            </button>

            <div className="flex flex-col items-center">
              <div className="flex items-center">
                {POINTS.map((point, index) => (
                  <button
                    key={point.title}
                    type="button"
                    aria-label={`Go to ${point.title}`}
                    aria-current={activeIndex === index ? "true" : undefined}
                    onClick={() => {
                      pauseCarousel();
                      scrollToCard(index);
                      resumeCarousel();
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span
                      className={`block h-1.5 rounded-full transition-all duration-500 ${
                        activeIndex === index
                          ? "w-5 bg-primary"
                          : "w-1.5 bg-on-surface/25"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <span className="text-[11px] font-semibold tabular-nums text-on-surface-variant">
                {activeIndex + 1} / {POINTS.length}
              </span>
            </div>

            <button
              type="button"
              aria-label="Next card"
              onClick={() => {
                pauseCarousel();
                goToNextCard();
                resumeCarousel();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#EAE3D6] bg-white text-on-surface transition-colors active:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="material-symbols-outlined text-[20px]">
                chevron_right
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}