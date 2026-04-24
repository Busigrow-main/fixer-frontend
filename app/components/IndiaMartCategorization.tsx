"use client";

import Image from "next/image";
import Link from "next/link";
import { SERVICES } from "@/app/lib/services";
import { ChevronRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

export default function IndiaMartCategorization() {
  return (
    <section className="py-8 bg-zinc-50">
      <div className="container mx-auto px-4 md:px-10 max-w-screen-xl relative">
        {/* Section Header */}
        <div className="flex items-start justify-between mb-6 gap-3">
          <h2 className="text-xl md:text-2xl font-black text-zinc-900 leading-tight">
            Appliance Spares, <br className="md:hidden" />
            Components & Accessories
          </h2>
          <Link 
            href="/spare-parts" 
            className="flex-shrink-0 px-4 py-1.5 border-2 border-primary text-primary font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all whitespace-nowrap mt-1"
          >
            View All
          </Link>
        </div>

        {/* Categories List */}
        <div className="flex flex-col gap-6">
          {SERVICES.map((service) => (
            <div 
              key={service.id} 
              className="bg-white rounded-2xl overflow-hidden border border-zinc-200 shadow-sm"
            >
              {/* Card Header (Light Blue/Gray bar) */}
              <div className="px-5 py-3 bg-blue-50/30 border-b border-zinc-100 flex items-center justify-between">
                <h3 className="text-base font-black text-zinc-800">{service.name} Spares</h3>
                <Link 
                  href={`/spare-parts?type=${service.slug}`}
                  className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                >
                  View All
                </Link>
              </div>

              {/* Card Body */}
              <div className="flex items-stretch min-h-[160px]">
                {/* Left Side: Category Image */}
                <div className="relative w-[100px] md:w-[200px] border-r border-zinc-100 p-3 shrink-0 flex items-center justify-center bg-zinc-50/50">
                  <div className="relative w-full h-full min-h-[120px]">
                    <Image 
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Right Side: Links List */}
                <div className="flex-1 flex flex-col min-w-0">
                  {(service.subCategories?.slice(0, 4) || []).map((sub, idx) => (
                    <Link 
                      key={sub.id}
                      href={`/spare-parts?type=${service.slug}&q=${encodeURIComponent(sub.name)}`}
                      className={cn(
                        "flex items-center justify-between px-4 md:px-8 py-3 md:py-4 hover:bg-zinc-50 transition-all group min-h-[44px]",
                        idx !== 3 ? "border-b border-zinc-50" : ""
                      )}
                    >
                      <span className="text-sm font-bold text-zinc-900 group-hover:text-primary transition-colors truncate pr-2">
                        {sub.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-primary transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                  
                  {/* Empty State / Extra Link */}
                  {(!service.subCategories || service.subCategories.length === 0) && (
                     <Link 
                        href={`/spare-parts?type=${service.slug}`}
                        className="flex-1 flex items-center justify-between px-5 md:px-8 py-5 hover:bg-zinc-50 transition-all text-primary font-black text-xs uppercase tracking-widest"
                      >
                        Explore {service.name} Parts
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
