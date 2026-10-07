"use client";

import { useEffect, useState } from "react";
import HeroOffersCarousel from "@/app/components/HeroOffersCarousel";
import { useBooking } from "@/app/context/BookingContext";

const TRUST_ITEMS = [
  {
    icon: "verified_user",
    value: "60-Day",
    label: "Warranty",
  },
  {
    icon: "schedule",
    value: "30-Min",
    label: "Avg. arrival",
  },
  {
    icon: "groups",
    value: "150k+",
    label: "Repairs",
  },
] as const;

export default function Hero() {
  const { openBooking } = useBooking();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-white pb-7 pt-3 sm:pb-10 md:pb-14 md:pt-20 lg:pb-16 lg:pt-24 xl:pt-28">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute -left-40 -top-32 h-[28rem] w-[28rem] rounded-full bg-primary/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute -right-32 top-24 h-[24rem] w-[24rem] rounded-full bg-primary-container/[0.35] blur-[110px]" />

      <div
        className="
          relative z-10 container mx-auto
          grid max-w-screen-2xl
          items-stretch
          gap-x-10 gap-y-8
          px-5
          sm:px-6
          md:gap-x-12 md:px-10
          lg:grid-cols-[minmax(0,0.94fr)_minmax(460px,1.06fr)]
          lg:gap-x-14
          xl:gap-x-20
          xl:px-12
        "
      >
        {/* =====================================================
            LEFT SIDE
        ===================================================== */}
        <div
          className={`
            order-1
            flex h-full flex-col
            transition-all duration-700
            lg:order-none
            lg:min-h-full
            lg:pt-3
            xl:pt-5
            ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }
          `}
        >
          {/* Top content */}
          <div>
            {/* Eyebrow */}
            <span
              className="
                mb-3 inline-flex w-fit
                items-center gap-2
                rounded-full
                bg-primary
                px-3 py-1.5
                font-label text-[9px] font-black uppercase
                tracking-[0.16em]
                text-white
                shadow-sm shadow-primary/15
                sm:text-[10px]
                md:mb-5
                md:px-3.5 md:py-1.5
              "
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              25 Years of Technical Mastery
            </span>

            {/* Main headline */}
            <h1
              className="
                max-w-[760px]
                font-headline
                text-[2.15rem]
                font-medium
                leading-[1.04]
                tracking-[-0.035em]
                text-on-surface
                sm:text-[2.7rem]
                md:text-[4rem]
                lg:text-[4.35rem]
                xl:text-[5.15rem]
                2xl:text-[5.5rem]
              "
            >
              Your{" "}
              <span className="italic text-primary">
                Fixxer
              </span>
              <br />
              for Master Repairs.
            </h1>

            {/* Supporting copy */}
            <p
              className="
                mt-5 hidden
                max-w-xl
                text-sm
                leading-7
                text-on-surface-variant
                lg:block
                xl:mt-6
                xl:text-[15px]
              "
            >
              Reliable repair expertise, backed by decades of technical
              experience and a commitment to getting the job done right.
            </p>
          </div>

          {/* Bottom proof section */}
          <div
            className="
              mt-auto
              hidden
              pt-12
              lg:block
              xl:pt-16
            "
          >
          {/* Trust stats */}
          <div className="grid grid-cols-3">
              {TRUST_ITEMS.map(({ icon, value, label }) => (
                      <div
                        key={label}
                        className={`
                        group
                        relative
                        flex min-w-0
                        items-center
                        gap-4
                        px-5 py-6
                        focus-visible:z-10
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-inset
                        focus-visible:ring-primary
                        xl:px-6
                        xl:py-7
                      `}
                    >
                      <span
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-primary-container
                          text-[38px]
                          leading-none
                          text-primary
                          transition-transform
                          duration-300
                          group-hover:scale-110
                          lg:h-14
                          lg:w-14
                          lg:text-[44px]
                          xl:h-16
                          xl:w-16
                          xl:rounded-[1.25rem]
                          xl:text-[50px]
                        "
                      >
                        <span className="material-symbols-outlined">
                          {icon}
                        </span>
                      </span>

                      <span className="min-w-0">
                        <span
                          className="
                            block
                            text-sm
                            font-extrabold
                            leading-tight
                            text-on-surface
                            transition-colors
                            group-hover:text-primary
                            xl:text-[15px]
                          "
                        >
                          {value}
                        </span>

                        <span
                          className="
                            mt-1
                            block
                            text-[10px]
                            font-medium
                            leading-tight
                            text-on-surface-variant
                            xl:text-[11px]
                          "
                        >
                          {label}
                        </span>
                      </span>

                    </div>
            ))}
          </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ===================================================== */}
        <div
          className={`
            order-2
            flex h-full w-full flex-col
            transition-all
            delay-150
            duration-700
            lg:order-none
            lg:col-start-2
            lg:row-start-1
            ${
              mounted
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }
          `}
        >
          {/* Carousel */}
          <HeroOffersCarousel
            className="
              w-full
              rounded-[1.25rem]
              border border-outline/50
              shadow-lg shadow-black/[0.07]
              sm:rounded-2xl
              md:rounded-[1.75rem]
              md:shadow-xl md:shadow-black/[0.08]
              lg:rounded-[2rem]
              xl:rounded-[2.25rem]
            "
          />

          {/* CTA */}
          <div className="mt-4 flex flex-col items-center lg:mt-5">
            <button
              type="button"
              onClick={() => openBooking()}
              className="
                group
                inline-flex
                h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                text-sm
                font-extrabold
                text-on-primary
                shadow-md
                shadow-primary/20
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-lg
                hover:shadow-primary/25
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
                focus-visible:ring-offset-2
                active:translate-y-0
                active:scale-[0.985]
                md:h-[3.25rem]
                md:text-[15px]
              "
            >
              <span
                className="
                  material-symbols-outlined
                  icon-filled
                  text-[19px]
                  transition-transform
                  duration-200
                  group-hover:rotate-[-8deg]
                  md:text-[20px]
                "
              >
                build
              </span>

              Book Fixxer
            </button>
          </div>

          {/* =================================================
              MOBILE TRUST STATS
          ================================================= */}
          <div
            className="
              mt-4
              grid
              w-full
              grid-cols-3
              border-t border-outline/60
              pt-4
              lg:hidden
            "
          >
            {TRUST_ITEMS.map(
              ({ icon, value, label }, index) => (
                <div
                  key={label}
                  className={`
                    group
                    flex
                    min-w-0
                    items-center
                    justify-center
                    gap-2
                    px-2
                    py-1
                    transition-colors
                    hover:text-primary
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-inset
                    focus-visible:ring-primary
                    ${
                      index > 0
                        ? "border-l border-outline/60"
                        : ""
                    }
                  `}
                >
                  <span
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-primary-container
                      text-[26px]
                      leading-none
                      text-primary
                      transition-transform
                      duration-200
                      group-hover:scale-105
                      sm:h-9
                      sm:w-9
                      sm:text-[28px]
                    "
                  >
                    <span className="material-symbols-outlined">
                      {icon}
                    </span>
                  </span>

                  <span className="min-w-0">
                    <span
                      className="
                        block
                        text-[11px]
                        font-extrabold
                        leading-none
                        text-on-surface
                        sm:text-xs
                      "
                    >
                      {value}
                    </span>

                    <span
                      className="
                        mt-1
                        block
                        truncate
                        text-[8px]
                        leading-none
                        text-on-surface-variant
                        sm:text-[9px]
                      "
                    >
                      {label}
                    </span>
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}