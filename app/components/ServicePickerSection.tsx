"use client";

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
  return (
    <section
      id="service-picker"
      aria-labelledby="service-picker-heading"
      className="overflow-hidden bg-white py-8 sm:py-10 md:py-16 lg:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 md:px-8 lg:px-10 xl:px-12">

        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="mb-2 text-[8px] font-black uppercase tracking-[0.22em] text-primary sm:text-[10px] md:text-xs">
                Repair services
              </p>

              <h2
                id="service-picker-heading"
                className="font-headline text-[1.65rem] font-medium leading-[1.08] tracking-tight text-on-surface sm:text-3xl md:text-4xl lg:text-5xl"
              >
                What needs fixing?
              </h2>

              <p className="mt-2 max-w-xl text-[11px] leading-4 text-on-surface-variant sm:text-sm sm:leading-6 md:mt-3 md:text-base lg:text-lg">
                Choose your appliance and we&apos;ll take it from there.
              </p>
            </div>

            {/* Desktop CTA */}
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

        {/* Service Cards */}
        <div
          aria-label="Repair service categories"
          className="grid grid-cols-4 gap-1.5 sm:gap-3 md:grid-cols-2 md:gap-5 lg:grid-cols-4 lg:gap-5 xl:gap-6"
        >
          {SERVICE_CARDS.map((item) => (
            <Link
              key={item.id}
              href={`/services/${item.slug}`}
              aria-label={`View ${item.name} repair`}
              className={`group relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-white shadow-[0_4px_16px_rgba(0,0,0,0.05)] transition-all duration-300 sm:rounded-2xl md:rounded-3xl lg:rounded-[1.75rem] ${
                item.mostBooked
                  ? "border-primary/60 ring-1 ring-primary/10"
                  : "border-outline/60 hover:border-primary/30"
              }`}
            >
              {/* Most Booked Badge */}
              {item.mostBooked && (
                <span className="absolute left-1.5 top-1.5 z-20 rounded-full bg-primary px-1.5 py-1 text-[5px] font-black uppercase tracking-[0.08em] text-white shadow-md sm:left-3 sm:top-3 sm:px-2.5 sm:text-[8px]">
                  🔥 Most Booked
                </span>
              )}

              {/* Image */}
              <div className="relative aspect-[0.9] overflow-hidden bg-surface-container-low sm:aspect-[5/4] md:aspect-[4/3] lg:aspect-[5/4]">
                <Image
                  src={item.image}
                  alt={`${item.name} repair service`}
                  fill
                  sizes="(max-width: 639px) 25vw, (max-width: 1023px) 50vw, 25vw"
                  className="object-cover"
                />
              </div>

              {/* Card Content */}
              <div className="flex min-h-[68px] items-center justify-between gap-1 px-2 py-2 sm:min-h-[84px] sm:gap-3 sm:px-4 sm:py-4 md:min-h-[88px] lg:min-h-[92px]">
                <div className="min-w-0">
                  <h3 className="truncate text-[10px] font-bold leading-tight text-on-surface sm:text-base md:text-base lg:text-lg">
                    {item.name}
                  </h3>

                  <p className="mt-1 truncate text-[8px] leading-3 text-on-surface-variant sm:text-xs sm:leading-4">
                    {item.prompt}
                  </p>
                </div>

                {/* Arrow */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-container text-primary sm:h-9 sm:w-9">
                  <span className="material-symbols-outlined text-[13px] sm:text-[18px]">
                    arrow_forward
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-5 border-t border-outline/40 pt-5 md:hidden">
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
    </section>
  );
}