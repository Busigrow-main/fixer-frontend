"use client";

import { useRef, useState } from "react";

const POINTS = [
  {
    icon: "verified_user",
    title: "25 Years Experience",
    body: "Two decades of technical mastery. Every Fixxer pro is background-checked and highly trained for your complete peace of mind.",
    color: "bg-primary-container",
    iconColor: "text-primary",
  },
  {
    icon: "security",
    title: "Appliance Insurance",
    body: "Free service charge for a full year and up to 50% off on every spare part. Ultimate protection for your home essentials.",
    color: "bg-secondary-container",
    iconColor: "text-secondary",
  },
  {
    icon: "workspace_premium",
    title: "60-Day Warranty",
    body: "We stand by our mastery. All repairs come with a rock-solid 60-day service warranty and up to 30 days on parts.",
    color: "bg-tertiary-container",
    iconColor: "text-tertiary",
  },
] as const;

export default function DifferenceSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const cardWidth = scrollRef.current.offsetWidth * 0.85; // Card width on mobile
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(index);
  };

  return (
    <section
      id="services"
      className="pt-10 pb-8 md:py-20 bg-surface-container-low carbon-texture relative overflow-hidden"
    >
      <div className="relative z-10 container mx-auto px-6 md:px-10 max-w-screen-2xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-8 md:mb-12 gap-4 md:gap-5">
          <div className="text-center md:text-left">
            <h2 className="font-headline text-4xl md:text-6xl text-on-surface tracking-tight leading-tight">
              The <span className="italic text-primary">Fixxer</span> Difference
            </h2>
          </div>
          <p className="font-label text-[10px] md:text-xs uppercase tracking-[0.28em] text-on-surface-variant font-bold max-w-xs text-center md:text-right opacity-70">
            Why 12,000+ neighbors choose us
          </p>
        </div>

        {/* Cards Wrapper */}
        <div className="relative">
          {/* Scrollable Container (Mobile) / Grid (Desktop) */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex md:grid md:grid-cols-3 gap-5 md:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory hide-scrollbar pb-6 md:pb-0"
          >
            {POINTS.map(({ icon, title, body, color, iconColor }, i) => (
              <div
                key={title}
                className="group flex-shrink-0 w-[86%] md:w-full snap-center bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] md:rounded-3xl border border-outline shadow-sm hover:shadow-xl hover:shadow-black/[0.04] transition-all duration-300 hover:-translate-y-1 cursor-default active:scale-[0.98]"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${color} flex items-center justify-center mb-6 md:mb-8 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <span
                    className={`material-symbols-outlined icon-filled text-2xl md:text-3xl ${iconColor}`}
                  >
                    {icon}
                  </span>
                </div>

                {/* Number */}
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 mb-2 md:mb-3 block">
                  0{i + 1}
                </span>

                <h3 className="font-headline text-xl md:text-2xl mb-3 md:mb-4 text-on-surface group-hover:text-primary transition-colors duration-300">
                  {title}
                </h3>
                <p className="text-sm md:text-base text-on-surface-variant leading-relaxed">
                  {body}
                </p>

                {/* Link */}
                <div className="mt-6 md:mt-8 flex items-center gap-2 text-xs md:text-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors duration-300">
                  <span>Learn more</span>
                  <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators (Mobile Only) */}
          <div className="flex md:hidden justify-center items-center gap-2 mt-4">
            {POINTS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === i
                    ? "bg-primary w-6"
                    : "bg-outline w-1.5 opacity-40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </section>
  );
}
