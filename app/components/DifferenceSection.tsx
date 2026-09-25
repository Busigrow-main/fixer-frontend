"use client";

import Link from "next/link";

const POINTS = [
  {
    icon: "verified_user",
    eyebrow: "EXPERTISE",
    title: "25 Years Experience",
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
    title: "60-Day Warranty",
    body: "We stand by our mastery. All repairs include a 60-day service warranty and 6 months on genuine Fixxer-installed parts.",
    highlight: "6 months on genuine parts",
    color: "bg-tertiary-container",
    iconColor: "text-tertiary",
    glow: "bg-tertiary/10",
    href: "/warranty",
  },
] as const;

export default function DifferenceSection() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#F7F5F0]
        py-14
        sm:py-16
        md:py-20
        lg:py-24
      "
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          -top-40
          h-80
          w-80
          rounded-full
          bg-primary/[0.035]
          blur-[110px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -bottom-40
          -left-40
          h-80
          w-80
          rounded-full
          bg-secondary/[0.035]
          blur-[110px]
        "
      />

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          md:px-8
          lg:px-10
        "
      >
        {/* =========================================================
            HEADER
        ========================================================= */}

        <div className="mb-8 sm:mb-11 md:mb-14">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="h-[2px] w-7 rounded-full bg-primary" />

                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.3em]
                    text-primary
                    sm:text-[10px]
                  "
                >
                  Why Fixxer
                </p>
              </div>

              <h2
                className="
                  font-headline
                  text-[2rem]
                  font-medium
                  leading-[1.02]
                  tracking-[-0.045em]
                  text-on-surface
                  sm:text-4xl
                  md:text-5xl
                  lg:text-[3.75rem]
                "
              >
                More than a repair.
                <br />
                <span className="italic text-primary">
                  Peace of mind.
                </span>
              </h2>
            </div>

            <p
              className="
                max-w-[300px]
                text-[10px]
                font-bold
                uppercase
                leading-5
                tracking-[0.17em]
                text-on-surface-variant/55
                sm:text-xs
                md:pb-1
                md:text-right
              "
            >
              Trusted by 150k+ households for the moments that matter.
            </p>
          </div>
        </div>

        {/* =========================================================
            CARDS
        ========================================================= */}

        <div
          className="
            -mx-4
            flex
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            px-4
            pb-2
            scrollbar-none

            sm:-mx-6
            sm:gap-5
            sm:px-6

            md:mx-0
            md:grid
            md:grid-cols-3
            md:gap-6
            md:overflow-visible
            md:px-0
            md:pb-0
          "
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
                className="
                  group
                  block
                  w-full
                  shrink-0
                  snap-center
                  md:w-auto
                "
              >
                <article
                  className="
                    relative
                    flex
                    min-h-[300px]
                    flex-col
                    overflow-hidden
                    rounded-[1.5rem]
                    border
                    border-[#EAE3D6]
                    bg-[#FFFDF8]
                    p-5
                    shadow-[0_12px_35px_rgba(75,60,40,0.07)]
                    transition-all
                    duration-500

                    active:scale-[0.99]

                    sm:min-h-[320px]
                    sm:p-6

                    md:min-h-[390px]
                    md:rounded-[1.75rem]
                    md:p-7

                    lg:min-h-[410px]
                    lg:p-8

                    md:hover:-translate-y-1.5
                    md:hover:shadow-[0_20px_45px_rgba(75,60,40,0.10)]
                  "
                >
                  {/* =================================================
                      BACKGROUND NUMBER
                  ================================================= */}

                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-4
                      select-none
                      font-headline
                      text-[7rem]
                      font-bold
                      leading-[0.8]
                      tracking-[-0.11em]
                      text-on-surface/[0.045]
                      transition-all
                      duration-500

                      sm:right-5
                      sm:top-5
                      sm:text-[8rem]

                      lg:text-[9rem]

                      group-hover:text-on-surface/[0.065]
                    "
                  >
                    0{index + 1}
                  </span>

                  {/* Soft glow */}
                  <div
                    aria-hidden="true"
                    className={`
                      pointer-events-none
                      absolute
                      -right-12
                      -top-12
                      h-40
                      w-40
                      rounded-full
                      ${glow}
                      opacity-50
                      blur-[55px]
                      transition-all
                      duration-700
                      group-hover:scale-125
                    `}
                  />

                  {/* =================================================
                      ICON
                  ================================================= */}

                  <div className="relative z-10">
                    <div
                      className={`
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-[1rem]
                        ${color}
                        shadow-[0_6px_18px_rgba(24,24,27,0.07)]
                        transition-all
                        duration-500

                        sm:h-14
                        sm:w-14

                        group-hover:-translate-y-1
                        group-hover:rotate-[-4deg]
                        group-hover:scale-105
                      `}
                    >
                      <span
                        className={`
                          material-symbols-outlined
                          ${iconColor}
                          text-[25px]
                          transition-transform
                          duration-500
                          group-hover:scale-110
                        `}
                      >
                        {icon}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="relative z-10 mt-7 sm:mt-8">
                    <p
                      className="
                        mb-2
                        text-[8px]
                        font-black
                        uppercase
                        tracking-[0.28em]
                        text-primary
                        sm:text-[9px]
                      "
                    >
                      {eyebrow}
                    </p>

                    <h3
                      className="
                        max-w-[280px]
                        text-[1.45rem]
                        font-bold
                        leading-[1.05]
                        tracking-[-0.035em]
                        text-on-surface
                        sm:text-[1.7rem]
                      "
                    >
                      {title}
                    </h3>

                    <div className="mt-4 flex items-center gap-2">
                      <span className="h-[2px] w-7 rounded-full bg-primary transition-all duration-500 group-hover:w-10" />
                      <span className="h-px w-10 bg-outline/20" />
                    </div>

                    <p
                      className="
                        mt-4
                        max-w-[330px]
                        text-[11px]
                        leading-5
                        text-on-surface-variant
                        sm:text-xs
                        sm:leading-6
                        md:text-[13px]
                      "
                    >
                      {body}
                    </p>

                    {/* Highlight */}
                    <div
                      className="
                        mt-4
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-primary/10
                        bg-primary/[0.035]
                        px-3
                        py-2
                        transition-all
                        duration-300

                        group-hover:border-primary/20
                        group-hover:bg-primary/[0.06]
                      "
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">
                        check_circle
                      </span>

                      <span
                        className="
                          text-[9px]
                          font-bold
                          tracking-wide
                          text-on-surface
                          sm:text-[10px]
                        "
                      >
                        {highlight}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      CTA
                  ================================================= */}

                  <div className="relative z-10 mt-auto pt-6">
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        border-t
                        border-outline/15
                        pt-4
                      "
                    >
                      <span
                        className="
                          text-[8px]
                          font-black
                          uppercase
                          tracking-[0.2em]
                          text-on-surface-variant/50
                          sm:text-[9px]
                        "
                      >
                        Learn more
                      </span>

                      <span
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-primary
                          text-white
                          transition-all
                          duration-300

                          group-hover:w-11
                        "
                      >
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

        {/* =========================================================
            MOBILE SWIPE HINT
        ========================================================= */}

        <div
          className="
            mt-5
            flex
            flex-col
            items-center
            gap-2
            md:hidden
          "
        >
          <div className="flex items-center gap-2">
            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.22em]
                text-on-surface-variant/55
              "
            >
              Swipe to explore
            </span>

            <span
              className="
                material-symbols-outlined
                animate-[pulse_1.8s_ease-in-out_infinite]
                text-[15px]
                text-primary
              "
            >
              east
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-5 rounded-full bg-primary" />
            <span className="h-1.5 w-1.5 rounded-full bg-on-surface/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-on-surface/15" />
          </div>
        </div>
      </div>
    </section>
  );
}