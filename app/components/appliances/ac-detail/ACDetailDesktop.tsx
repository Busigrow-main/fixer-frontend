"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  Wrench,
} from "lucide-react";

export interface ACProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  modelNumber: string;
  price: number;
  originalPrice?: number;
  capacityTon: number;
  starRating: number;
  acType: string;
  isInverter: boolean;
  shortDescription?: string;
  description?: string;
  images: string[];
  inStock: boolean;
  installationIncluded: boolean;
  warrantyYears: number;
  specifications?: Record<string, string | number>;
}

interface ACDetailDesktopProps {
  product: ACProduct;
}

export function ACDetailDesktop({
  product,
}: ACDetailDesktopProps) {
  const enquiryHref = `/spare-parts/enquiry?product=${encodeURIComponent(
    product.slug,
  )}&type=appliance`;

  const hasDiscount =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.originalPrice! -
          product.price) /
          product.originalPrice!) *
          100,
      )
    : 0;

  return (
    <div className="mx-auto hidden w-full max-w-7xl px-6 pb-12 pt-7 md:block lg:px-8">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] xl:gap-12">
        {/* LEFT — Product media */}
        <section className="min-w-0">
          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="relative aspect-square bg-slate-50">
              {product.images?.length > 0 ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  unoptimized
                  priority
                  sizes="(max-width: 1279px) 55vw, 600px"
                  className="object-contain p-10 transition-transform duration-500 hover:scale-[1.025] xl:p-14"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Wrench className="h-14 w-14 text-slate-300" />
                </div>
              )}

              {/* Product badges */}
              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                <span className="rounded-xl bg-slate-950/90 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-white">
                  {product.brand}
                </span>

                {product.isInverter ? (
                  <span className="rounded-xl bg-white px-3 py-2 text-[10px] font-black text-slate-800 shadow-sm">
                    Inverter
                  </span>
                ) : null}
              </div>

              {/* Availability */}
              <div className="absolute right-5 top-5">
                {product.inStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-[10px] font-black text-white shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    In stock
                  </span>
                ) : (
                  <span className="rounded-xl bg-slate-950/90 px-3 py-2 text-[10px] font-black text-white">
                    Check availability
                  </span>
                )}
              </div>

              {discountPercent > 0 ? (
                <span className="absolute bottom-5 left-5 rounded-xl bg-primary px-3 py-2 text-[10px] font-black text-white shadow-sm">
                  {discountPercent}% OFF
                </span>
              ) : null}
            </div>
          </div>

          {/* Service reassurance */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <ServiceCard
              icon={<Wrench />}
              title="Installation"
              value={
                product.installationIncluded
                  ? "Included"
                  : "Confirm with Fixxer"
              }
              positive={
                product.installationIncluded
              }
            />

            <ServiceCard
              icon={<ShieldCheck />}
              title="Warranty"
              value={`${product.warrantyYears} year${
                product.warrantyYears === 1
                  ? ""
                  : "s"
              }`}
              positive
            />

            <ServiceCard
              icon={<CheckCircle2 />}
              title="Availability"
              value={
                product.inStock
                  ? "In stock"
                  : "Check with Fixxer"
              }
              positive={product.inStock}
            />
          </div>
        </section>

        {/* RIGHT — Product information */}
        <section className="min-w-0 lg:sticky lg:top-[88px]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:p-7">
            {/* Brand / model */}
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/[0.07] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-primary">
                {product.brand}
              </span>

              <span className="text-[9px] font-bold text-slate-400">
                {product.modelNumber}
              </span>
            </div>

            {/* Title */}
            <h1 className="mt-3 text-2xl font-black leading-8 tracking-[-0.035em] text-slate-950 xl:text-3xl">
              {product.name}
            </h1>

            {product.shortDescription ? (
              <p className="mt-2.5 max-w-xl text-sm leading-6 text-slate-500">
                {product.shortDescription}
              </p>
            ) : null}

            {/* Key specs */}
            <div className="mt-5 flex flex-wrap gap-2">
              <SpecPill>
                {product.capacityTon} Ton
              </SpecPill>

              <SpecPill icon={<Star />}>
                {product.starRating} Star
              </SpecPill>

              <SpecPill>
                {formatAcType(product.acType)}
              </SpecPill>

              {product.isInverter ? (
                <SpecPill highlighted>
                  Inverter
                </SpecPill>
              ) : null}
            </div>

            {/* Price */}
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
                    Product price
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5">
                    <span className="text-3xl font-black tracking-tight text-slate-950">
                      ₹
                      {Number(
                        product.price || 0,
                      ).toLocaleString("en-IN")}
                    </span>

                    {hasDiscount ? (
                      <span className="text-sm font-semibold text-slate-400 line-through">
                        ₹
                        {product.originalPrice!.toLocaleString(
                          "en-IN",
                        )}
                      </span>
                    ) : null}
                  </div>
                </div>

                {discountPercent > 0 ? (
                  <span className="rounded-lg bg-primary/[0.07] px-2.5 py-1.5 text-[10px] font-black text-primary">
                    Save {discountPercent}%
                  </span>
                ) : null}
              </div>

              <p className="mt-3 text-[10px] leading-4 text-slate-400">
                Final availability, delivery and installation
                details are confirmed by Fixxer after your enquiry.
              </p>
            </div>

            {/* Main CTA */}
            <div className="mt-5">
              <Link
                href={enquiryHref}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-xs font-black text-white shadow-lg shadow-primary/15 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20"
              >
                Enquire about this AC
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-2 text-center text-[9px] font-semibold text-slate-400">
                No payment required to send an enquiry
              </p>
            </div>

            {/* Decision-support cards */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <h2 className="text-xs font-black text-slate-950">
                Why consider this model?
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <DecisionCard
                  icon={<Wrench />}
                  title="Installation"
                  value={
                    product.installationIncluded
                      ? "Included"
                      : "Ask Fixxer"
                  }
                />

                <DecisionCard
                  icon={<ShieldCheck />}
                  title="Warranty"
                  value={`${product.warrantyYears} year${
                    product.warrantyYears === 1
                      ? ""
                      : "s"
                  }`}
                />

                <DecisionCard
                  icon={<Star />}
                  title="Efficiency"
                  value={`${product.starRating} Star`}
                />

                <DecisionCard
                  icon={<CheckCircle2 />}
                  title="Availability"
                  value={
                    product.inStock
                      ? "In stock"
                      : "Check"
                  }
                />
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description ? (
            <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6">
              <SectionHeading>
                About this AC
              </SectionHeading>

              <p className="mt-3 max-w-3xl whitespace-pre-line text-xs leading-6 text-slate-600">
                {product.description}
              </p>
            </section>
          ) : null}

          {/* Specifications */}
          {product.specifications &&
          Object.keys(product.specifications).length >
            0 ? (
            <section className="mt-4 rounded-[24px] border border-slate-200 bg-white p-6">
              <SectionHeading>
                Specifications
              </SectionHeading>

              <div className="mt-4 grid grid-cols-2 gap-x-8 border-t border-slate-100">
                {Object.entries(
                  product.specifications,
                ).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-start justify-between gap-4 border-b border-slate-100 py-3"
                  >
                    <span className="text-[10px] font-semibold text-slate-400">
                      {formatSpecificationKey(
                        key,
                      )}
                    </span>

                    <span className="text-right text-[10px] font-black text-slate-700">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {/* Help banner */}
          <section className="mt-4 rounded-[24px] bg-slate-950 p-6 text-white">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
                  Need help choosing?
                </p>

                <h2 className="mt-2 text-lg font-black">
                  Not sure which AC is right for you?
                </h2>

                <p className="mt-1.5 max-w-lg text-[10px] leading-5 text-white/60">
                  Send an enquiry and the Fixxer team can
                  confirm availability, installation and the
                  next steps.
                </p>
              </div>

              <Link
                href={enquiryHref}
                className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[10px] font-black text-slate-950 transition-colors hover:bg-slate-100 sm:inline-flex"
              >
                Ask Fixxer
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  value,
  positive = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          positive
            ? "bg-primary/[0.07] text-primary"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {icon}
      </span>

      <p className="mt-3 text-[9px] font-black uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-[10px] font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function DecisionCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-primary shadow-sm">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-wide text-slate-400">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-black text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function SpecPill({
  children,
  icon,
  highlighted = false,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  highlighted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-black ${
        highlighted
          ? "bg-primary/[0.07] text-primary"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {icon ? (
        <span className="text-amber-500">
          {icon}
        </span>
      ) : null}

      {children}
    </span>
  );
}

function SectionHeading({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-sm font-black tracking-tight text-slate-950">
      {children}
    </h2>
  );
}

function formatAcType(value: string) {
  if (!value) {
    return "AC";
  }

  return value
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatSpecificationKey(
  key: string,
) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}