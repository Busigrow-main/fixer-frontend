"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Headphones,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import ShopHeader from "@/app/components/shop/ShopHeader";
import { APPLIANCE_CATEGORY_IMAGES } from "@/app/components/appliances/ApplianceCategoryCard";

const APPLIANCE_CATEGORIES = [
  {
    id: "ac",
    name: "Air Conditioners",
    slug: "ac",
    description:
      "Browse available ACs with professional installation and Fixxer support.",
    status: "active" as const,
    productCount: 7,
    href: "/spare-parts/appliances/ac",
    image: APPLIANCE_CATEGORY_IMAGES.ac,
    tagline: "Installation available",
  },
  {
    id: "fridge",
    name: "Refrigerators",
    slug: "fridge",
    description:
      "Cooling appliances for your home will be available here soon.",
    status: "coming-soon" as const,
    productCount: 0,
    href: "#",
    image: APPLIANCE_CATEGORY_IMAGES.fridge,
    tagline: "Coming soon",
  },
  {
    id: "washing-machine",
    name: "Washing Machines",
    slug: "washing-machine",
    description:
      "Laundry appliances and solutions will be available here soon.",
    status: "coming-soon" as const,
    productCount: 0,
    href: "#",
    image: APPLIANCE_CATEGORY_IMAGES["washing-machine"],
    tagline: "Coming soon",
  },
] as const;

const TRUST_ITEMS = [
  {
    icon: Wrench,
    title: "Professional installation",
    body:
      "Get support from Fixxer technicians for installation and setup.",
  },
  {
    icon: ShieldCheck,
    title: "Service support",
    body:
      "Get help from enquiry through installation and after-sales service.",
  },
  {
    icon: Headphones,
    title: "Dedicated assistance",
    body:
      "Our team can help you understand products, availability and next steps.",
  },
] as const;

export default function AppliancesPage() {
  const activeCategories = APPLIANCE_CATEGORIES.filter(
    (category) => category.status === "active",
  );

  const comingSoonCategories = APPLIANCE_CATEGORIES.filter(
    (category) => category.status === "coming-soon",
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopHeader />

      <main className="mx-auto w-full max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pt-8 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs">
          <Link
            href="/spare-parts"
            className="font-bold text-slate-400 transition-colors hover:text-primary"
          >
            Fixxer Shop
          </Link>

          <ChevronRight className="h-3.5 w-3.5 text-slate-300" />

          <span className="font-bold text-slate-600">
            Appliances
          </span>
        </div>

        {/* Hero */}
        <section className="relative mt-5 overflow-hidden rounded-[28px] bg-slate-950 px-5 py-8 text-white sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/70">
                Fixxer Appliances
              </span>
            </div>

            <h1 className="mt-4 max-w-xl text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-4xl lg:text-5xl">
              Find the right appliance for your home.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
              Browse available appliances, compare the important details,
              and enquire with Fixxer when you&apos;re ready.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <TrustPill icon={<Wrench />} text="Installation support" />
              <TrustPill icon={<ShieldCheck />} text="Service support" />
              <TrustPill icon={<CheckCircle2 />} text="Request before payment" />
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 right-10 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
        </section>

        {/* Active categories */}
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                Available now
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                Browse appliances
              </h2>
            </div>

            <span className="hidden text-xs font-semibold text-slate-400 sm:block">
              {activeCategories.length} category
              {activeCategories.length === 1 ? "" : "ies"} available
            </span>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeCategories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_3px_18px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />

                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />

                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black uppercase tracking-wide text-emerald-700 shadow-sm">
                      Available
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-950">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {category.description}
                      </p>
                    </div>

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/[0.07] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold text-slate-400">
                      {category.productCount} products
                    </span>

                    <span className="text-[10px] font-black text-primary">
                      {category.tagline}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        {comingSoonCategories.length > 0 ? (
          <section className="mt-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                More categories
              </p>

              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                Coming soon
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                We&apos;re expanding the Fixxer appliance catalogue.
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {comingSoonCategories.map((category) => (
                <div
                  key={category.id}
                  className="overflow-hidden rounded-[22px] border border-slate-200 bg-white"
                >
                  <div className="flex min-h-[150px]">
                    <div className="relative w-36 shrink-0 overflow-hidden bg-slate-100 sm:w-44">
                      <Image
                        src={category.image}
                        alt={category.name}
                        fill
                        sizes="176px"
                        className="object-cover grayscale"
                        unoptimized
                      />

                      <div className="absolute inset-0 bg-white/20" />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                      <span className="flex w-fit items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-wide text-slate-500">
                        <Clock3 className="h-3 w-3" />
                        Coming soon
                      </span>

                      <h3 className="mt-3 text-sm font-black text-slate-900">
                        {category.name}
                      </h3>

                      <p className="mt-1 text-[10px] leading-5 text-slate-500">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Trust */}
        <section className="mt-10 border-t border-slate-200 pt-8">
          <div className="max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              Why Fixxer
            </p>

            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
              More than just a product listing.
            </h2>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              When you enquire, Fixxer helps you move from choosing a
              product to getting it installed and supported.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {TRUST_ITEMS.map(
              ({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-[20px] border border-slate-200 bg-white p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/[0.07] text-primary">
                    <Icon className="h-4 w-4" />
                  </div>

                  <h3 className="mt-3 text-xs font-black text-slate-900">
                    {title}
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    {body}
                  </p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* Mobile reassurance */}
        <div className="mt-6 rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-slate-200 sm:hidden">
          <p className="text-[10px] font-black text-slate-800">
            Need help choosing?
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-400">
            Open an appliance category and enquire with Fixxer for
            availability and next steps.
          </p>
        </div>
      </main>
    </div>
  );
}

function TrustPill({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[9px] font-bold text-white/70">
      <span className="text-primary">
        {React.cloneElement(
          icon as React.ReactElement,
          {
            className: "h-3.5 w-3.5",
          },
        )}
      </span>
      {text}
    </span>
  );
}