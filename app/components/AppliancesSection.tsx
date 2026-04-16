"use client";

import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/app/lib/services";
import { useBooking } from "@/app/context/BookingContext";

export default function AppliancesSection() {
  const { openBooking } = useBooking();

  return (
    <section id="catalog" className="pt-8 pb-10 md:py-20 bg-surface">
      <div className="container mx-auto px-6 md:px-10 max-w-screen-2xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <p className="font-label text-[10px] md:text-xs uppercase tracking-[0.28em] font-bold text-primary mb-3">
            Master Solutions
          </p>
          <h2 className="font-headline text-3xl md:text-6xl tracking-tight text-on-surface leading-tight">
            Professional Service for{" "}
            <span className="italic text-primary">Every</span> Appliance
          </h2>
          <div className="h-0.5 w-12 md:w-16 bg-primary mx-auto mt-4 md:mt-6 rounded-full" />
        </div>

        {/* Grid: 2 columns on mobile, 4 on large */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {SERVICES.map(({ id, name, startingPrice, image, slug }) => (
            <div key={id} className="group cursor-pointer active:scale-[0.98] transition-transform duration-200">
              {/* Image Container */}
              <div className="relative aspect-[4/5] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-3 md:mb-5 shadow-sm border border-outline/50">
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Clickable Overlay to Detail Page */}
                <Link href={`/services/${slug}`} className="absolute inset-0 z-10" aria-label={`View ${name} details`} />

                {/* Overlay Background */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

                {/* Starting Price & Instant Book */}
                <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 right-3 md:right-6 flex items-end justify-between z-20">
                  <div>
                    <p className="text-white/60 font-label text-[7px] md:text-[9px] uppercase tracking-[0.2em] font-bold mb-0.5">
                      Starting From
                    </p>
                    <p className="text-white font-headline text-sm md:text-lg font-black">
                      {startingPrice}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       openBooking(id);
                    }}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white text-zinc-900 flex items-center justify-center shadow-xl transition-all duration-300 hover:bg-primary hover:text-white hover:scale-110 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm md:text-lg icon-filled">
                      bolt
                    </span>
                  </button>
                </div>
              </div>

              {/* Label */}
              <div className="flex justify-between items-center px-1">
                <div>
                  <h3 className="font-headline text-lg md:text-2xl text-on-surface group-hover:text-primary transition-colors duration-300">
                    {name}
                  </h3>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-60 group-hover:text-primary/60 transition-colors">
                     Expert Repair
                  </p>
                </div>
                <Link href={`/services/${slug}`} className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full border border-outline text-on-surface-variant hover:border-primary hover:text-primary transition-all">
                  <span className="material-symbols-outlined text-sm">arrow_outward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 md:mt-16 text-center">
          <Link 
            href="/services"
            className="inline-flex items-center gap-3 bg-zinc-900 text-white px-8 md:px-12 h-14 md:h-16 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-black/10 hover:bg-primary hover:scale-[0.98] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg md:text-xl">apps</span>
            Explore Full Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
