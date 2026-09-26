"use client";

import React from "react";

const PHONE_NUMBER = "+917004771388";

export default function FloatingCallButton() {
  return (
    <a
      href={`tel:${PHONE_NUMBER}`}
      aria-label="Call Fixxer"
      className="
        group
        fixed
        right-3
        bottom-[calc(5.25rem+env(safe-area-inset-bottom))]
        z-[90]

        xs:right-4
        xs:bottom-[calc(5.5rem+env(safe-area-inset-bottom))]

        sm:right-5
        sm:bottom-[calc(5.75rem+env(safe-area-inset-bottom))]

        md:right-6
        md:bottom-6
      "
    >
      {/* Ambient glow */}
      <span
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-10
          rounded-full
          bg-primary/20
          blur-lg
          transition-all
          duration-500
          group-hover:bg-primary/35
          group-hover:blur-xl
        "
      />

      {/* Pulse ring */}
      <span
        aria-hidden="true"
        className="
          absolute
          inset-0
          rounded-full
          bg-primary/25
          animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite]
        "
      />

      {/* Main button */}
      <span
        className="
          relative
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-full
          bg-primary
          text-white
          shadow-[0_8px_24px_rgba(0,0,0,0.18)]
          ring-3
          ring-white/85
          transition-all
          duration-300

          xs:h-[52px]
          xs:w-[52px]

          sm:h-14
          sm:w-14

          md:h-[58px]
          md:w-[58px]

          lg:h-15
          lg:w-15

          group-hover:scale-105
          group-hover:shadow-[0_14px_32px_rgba(0,0,0,0.22)]
          group-active:scale-95
        "
      >
        {/* Inner icon surface */}
        <span
          className="
            relative
            flex
            h-[36px]
            w-[36px]
            items-center
            justify-center
            rounded-full
            bg-white/10
            backdrop-blur-sm

            xs:h-10
            xs:w-10

            sm:h-11
            sm:w-11

            md:h-12
            md:w-12
          "
        >
          <span
            className="
              material-symbols-outlined
              font-semibold
              text-[20px]
              leading-none
              transition-transform
              duration-300

              xs:text-[21px]
              sm:text-[23px]
              md:text-[24px]

              group-hover:rotate-[-10deg]
            "
          >
            call
          </span>
        </span>

        {/* Availability indicator */}
        <span
          aria-hidden="true"
          className="
            absolute
            right-0
            top-0
            h-3
            w-3
            rounded-full
            border-2
            border-white
            bg-emerald-500
            shadow-sm

            xs:h-3.5
            xs:w-3.5

            sm:right-0.5
            sm:top-0.5
          "
        />
      </span>
    </a>
  );
}