
"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";

type Props = {
  image: string;
  onBook: () => void;
};

export default function ServicePromoBanner({ image, onBook }: Props) {
  return (
    <section className="flex min-h-[108px] w-full items-center gap-2.5 overflow-hidden rounded-[22px] border border-[#F4D9DE] bg-[#FFF1F3] p-1.5 sm:gap-4 sm:p-2 md:min-h-[144px] md:gap-6 md:rounded-[28px] md:p-2.5">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[16px] bg-[#FFF1F3] max-[380px]:h-[88px] max-[380px]:w-[88px] md:h-[124px] md:w-[124px] md:rounded-[22px]">
        <Image
          src={image}
          alt="Fixxer technician helping with an installation"
          fill
          sizes="(max-width: 380px) 88px, (max-width: 767px) 96px, 124px"
          className="object-cover object-center"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-[14px] font-medium leading-[1.2] text-[#202124] sm:text-base md:text-xl">
          Need Installation or Repair?
        </h3>
        <p className="mt-1 text-[11px] leading-snug text-[#72747B] sm:text-xs md:mt-1.5 md:text-sm">
          Book a service with Fixxer experts.
        </p>
      </div>
      <button
        type="button"
        onClick={onBook}
        className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border-[1.5px] border-primary px-2.5 text-[11px] font-medium text-primary transition hover:bg-primary hover:text-white sm:px-4 sm:text-xs md:h-11 md:gap-1.5 md:px-5 md:text-sm"
      >
        Book Now
        <ArrowRight size={14} />
      </button>
    </section>
  );
}
