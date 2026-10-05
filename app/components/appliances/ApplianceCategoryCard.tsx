"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Package,
} from "lucide-react";
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

export function ApplianceCategoryCard({
  category,
}: ApplianceCategoryCardProps) {
  const isActive = category.status === "active";

  const card = (
    <article
      className={`group ${
        isActive
          ? "cursor-pointer"
          : "cursor-default opacity-75"
      }`}
    >
      {/* Image card */}
      <div
        className={`relative aspect-[4/5] overflow-hidden rounded-[24px] border border-black/[0.06] bg-zinc-100 shadow-[0_6px_24px_rgba(15,23,42,0.06)] transition-all duration-300 sm:rounded-[28px] ${
          isActive
            ? "group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(15,23,42,0.14)]"
            : ""
        }`}
      >
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${
            isActive
              ? "group-hover:scale-[1.06]"
              : "grayscale-[0.45]"
          }`}
        />

        {/* Image overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent ${
            isActive
              ? "transition-opacity duration-300 group-hover:from-black/90"
              : ""
          }`}
        />

        {/* Top status */}
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between sm:left-5 sm:right-5 sm:top-5">
          {isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-zinc-800 shadow-sm backdrop-blur sm:px-3 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white backdrop-blur sm:px-3 sm:text-[10px]">
              <Clock3 className="h-3 w-3" />
              Coming soon
            </span>
          )}

          {category.icon ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/25 text-lg text-white backdrop-blur sm:h-10 sm:w-10">
              {category.icon}
            </span>
          ) : null}
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/60 sm:text-[10px]">
                {isActive
                  ? "Shop appliances"
                  : "Available soon"}
              </p>

              <p className="text-base font-black tracking-tight text-white sm:text-lg">
                {isActive
                  ? `${category.productCount} ${
                      category.productCount === 1
                        ? "model"
                        : "models"
                    } available`
                  : "Catalog coming soon"}
              </p>
            </div>

            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg transition-all duration-300 sm:h-11 sm:w-11 ${
                isActive
                  ? "bg-white text-zinc-900 group-hover:scale-105 group-hover:bg-primary group-hover:text-white"
                  : "bg-white/15 text-white backdrop-blur"
              }`}
            >
              {isActive ? (
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Text content */}
      <div className="mt-3 flex items-start justify-between gap-3 px-1 sm:mt-4">
        <div className="min-w-0">
          <h3
            className={`text-lg font-black tracking-tight transition-colors duration-200 sm:text-xl ${
              isActive
                ? "text-zinc-950 group-hover:text-primary"
                : "text-zinc-500"
            }`}
          >
            {category.name}
          </h3>

          {category.tagline ? (
            <p
              className={`mt-1 line-clamp-1 text-[10px] font-bold uppercase tracking-[0.13em] sm:text-[11px] ${
                isActive
                  ? "text-zinc-400"
                  : "text-zinc-400"
              }`}
            >
              {category.tagline}
            </p>
          ) : null}
        </div>

        {isActive ? (
          <span className="mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white sm:flex">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        ) : null}
      </div>

      {/* Small mobile description */}
      {category.description ? (
        <p
          className={`mt-2 line-clamp-2 px-1 text-xs leading-5 ${
            isActive
              ? "text-zinc-500"
              : "text-zinc-400"
          }`}
        >
          {category.description}
        </p>
      ) : null}

      {/* Active mobile action */}
      {isActive ? (
        <div className="mt-3 flex items-center gap-1.5 px-1 text-xs font-black text-primary sm:hidden">
          <Package className="h-3.5 w-3.5" />
          Browse models
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      ) : null}
    </article>
  );

  if (!isActive) {
    return card;
  }

  return (
    <Link
      href={category.href}
      className="block rounded-[26px] outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
      aria-label={`Browse ${category.name}`}
    >
      {card}
    </Link>
  );
}

export const APPLIANCE_CATEGORY_IMAGES = {
  ac: AC_SERVICE_IMAGE,

  fridge:
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=2000&auto=format&fit=crop",

  "washing-machine":
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=2000&auto=format&fit=crop",
} as const;