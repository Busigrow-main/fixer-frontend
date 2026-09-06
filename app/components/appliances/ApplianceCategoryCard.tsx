"use client";

import Image from "next/image";
import Link from "next/link";
import { AC_SERVICE_IMAGE } from "@/app/lib/services";

interface ApplianceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  status: "active" | "coming-soon";
  productCount: number;
  href: string;
  image: string;
  tagline: string;
}

interface ApplianceCategoryCardProps {
  category: ApplianceCategory;
}

export function ApplianceCategoryCard({ category }: ApplianceCategoryCardProps) {
  const isActive = category.status === "active";

  const card = (
    <div
      className={`group transition-transform duration-200 ${
        isActive ? "cursor-pointer active:scale-[0.98]" : "opacity-70"
      }`}
    >
      <div className="relative mb-3 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-outline/50 shadow-sm md:mb-5 md:rounded-[2rem]">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 ${
            isActive ? "group-hover:scale-110" : "grayscale"
          }`}
        />

        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 ${
            isActive ? "opacity-60 group-hover:opacity-90" : "opacity-70"
          }`}
        />

        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between md:bottom-6 md:left-6 md:right-6">
          <div>
            <p className="mb-0.5 font-label text-[7px] font-bold uppercase tracking-[0.2em] text-white/60 md:text-[9px]">
              {isActive ? "In stock" : "Status"}
            </p>
            <p className="font-headline text-sm font-black text-white md:text-lg">
              {isActive
                ? `${category.productCount} ${category.productCount === 1 ? "model" : "models"}`
                : "Coming soon"}
            </p>
          </div>
          {isActive ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-zinc-900 shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white md:h-12 md:w-12">
              <span className="material-symbols-outlined text-sm icon-filled md:text-lg">
                arrow_forward
              </span>
            </span>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white md:h-12 md:w-12">
              <span className="material-symbols-outlined text-sm md:text-lg">
                schedule
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div>
          <h3
            className={`font-headline text-lg transition-colors duration-300 md:text-2xl ${
              isActive
                ? "text-on-surface group-hover:text-primary"
                : "text-on-surface-variant"
            }`}
          >
            {category.name}
          </h3>
          <p
            className={`text-[9px] font-bold uppercase tracking-widest md:text-[10px] ${
              isActive
                ? "text-on-surface-variant opacity-60 group-hover:text-primary/60"
                : "text-on-surface-variant opacity-50"
            }`}
          >
            {category.tagline}
          </p>
        </div>
        {isActive && (
          <span className="hidden h-8 w-8 items-center justify-center rounded-full border border-outline text-on-surface-variant transition-all group-hover:border-primary group-hover:text-primary sm:flex">
            <span className="material-symbols-outlined text-sm">arrow_outward</span>
          </span>
        )}
      </div>
    </div>
  );

  if (isActive) {
    return (
      <Link href={category.href} className="block" aria-label={`Browse ${category.name}`}>
        {card}
      </Link>
    );
  }

  return card;
}

export const APPLIANCE_CATEGORY_IMAGES = {
  ac: AC_SERVICE_IMAGE,
  fridge:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=2000&auto=format&fit=crop",
  "washing-machine":
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=2000&auto=format&fit=crop",
} as const;
