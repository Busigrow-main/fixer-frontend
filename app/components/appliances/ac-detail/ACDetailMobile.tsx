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

interface ACDetailMobileProps {
  product: ACProduct;
}

export function ACDetailMobile({
  product,
}: ACDetailMobileProps) {
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
    <div className="md:hidden">
      <div className="mx-auto w-full max-w-xl px-4 pb-8 pt-5">
        {/* Product media */}
        <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-square bg-slate-50">
            {product.images?.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                unoptimized
                priority
                sizes="100vw"
                className="object-contain p-6"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Wrench className="h-10 w-10 text-slate-300" />
              </div>
            )}

            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              <span className="rounded-lg bg-slate-950/90 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wide text-white">
                {product.brand}
              </span>

              {product.isInverter ? (
                <span className="rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-black text-slate-800 shadow-sm">
                  Inverter
                </span>
              ) : null}
            </div>

            <div className="absolute right-3 top-3">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[9px] font-black text-white shadow-sm">
                  <CheckCircle2 className="h-3 w-3" />
                  In stock
                </span>
              ) : (
                <span className="rounded-lg bg-slate-950/90 px-2.5 py-1.5 text-[9px] font-black text-white">
                  Check availability
                </span>
              )}
            </div>

            {discountPercent > 0 ? (
              <span className="absolute bottom-3 left-3 rounded-lg bg-primary px-2.5 py-1.5 text-[9px] font-black text-white">
                {discountPercent}% OFF
              </span>
            ) : null}
          </div>
        </section>

        {/* Product identity */}
        <section className="mt-5">
          <p className="text-[9px] font-black uppercase tracking-[0.14em] text-slate-400">
            {product.modelNumber}
          </p>

          <h1 className="mt-1.5 text-[22px] font-black leading-7 tracking-[-0.035em] text-slate-950">
            {product.name}
          </h1>

          {product.shortDescription ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {product.shortDescription}
            </p>
          ) : null}

          {/* Key specs */}
          <div className="mt-4 flex flex-wrap gap-1.5">
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
        </section>

        {/* Price summary */}
        <section className="mt-5 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.12em] text-slate-400">
                Product price
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-950">
                  ₹
                  {Number(
                    product.price || 0,
                  ).toLocaleString("en-IN")}
                </span>

                {hasDiscount ? (
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    ₹
                    {product.originalPrice!.toLocaleString(
                      "en-IN",
                    )}
                  </span>
                ) : null}
              </div>
            </div>

            {discountPercent > 0 ? (
              <span className="rounded-lg bg-primary/[0.07] px-2 py-1 text-[9px] font-black text-primary">
                Save {discountPercent}%
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <InfoTile
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

            <InfoTile
              icon={<ShieldCheck />}
              title="Warranty"
              value={`${product.warrantyYears} year${
                product.warrantyYears === 1
                  ? ""
                  : "s"
              }`}
              positive
            />
          </div>

          <p className="mt-3 text-[9px] leading-4 text-slate-400">
            Final availability, delivery and installation
            details are confirmed by Fixxer after your enquiry.
          </p>
        </section>

        {/* Primary action */}
        <section className="mt-4">
          <Link
            href={enquiryHref}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-black text-white shadow-lg shadow-primary/15 transition-colors active:scale-[0.99]"
          >
            Enquire about this AC
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-2 text-center text-[9px] font-semibold text-slate-400">
            No payment required to send an enquiry
          </p>
        </section>

        {/* Why this model */}
        <section className="mt-6 rounded-[22px] border border-slate-200 bg-white p-4">
          <SectionHeading>
            Why this model may fit
          </SectionHeading>

          <div className="mt-4 space-y-3">
            <Reason
              icon={<CheckCircle2 />}
              title={`${product.capacityTon} Ton capacity`}
              description="Suitable capacity for the room size this model is designed for."
            />

            <Reason
              icon={<Star />}
              title={`${product.starRating}-star efficiency`}
              description="A higher star rating can help reduce energy use over time."
            />

            <Reason
              icon={<Wrench />}
              title={
                product.installationIncluded
                  ? "Installation included"
                  : "Installation support available"
              }
              description={
                product.installationIncluded
                  ? "Installation is included with this product listing."
                  : "Ask Fixxer about installation availability and charges."
              }
            />

            <Reason
              icon={<ShieldCheck />}
              title={`${product.warrantyYears}-year warranty`}
              description="Warranty coverage is shown for quick comparison."
            />
          </div>
        </section>

        {/* Description */}
        {product.description ? (
          <section className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4">
            <SectionHeading>
              About this AC
            </SectionHeading>

            <p className="mt-3 whitespace-pre-line text-xs leading-5 text-slate-600">
              {product.description}
            </p>
          </section>
        ) : null}

        {/* Specifications */}
        {product.specifications &&
        Object.keys(product.specifications).length >
          0 ? (
          <section className="mt-4 rounded-[22px] border border-slate-200 bg-white p-4">
            <SectionHeading>
              Specifications
            </SectionHeading>

            <div className="mt-3 divide-y divide-slate-100">
              {Object.entries(
                product.specifications,
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-[10px] font-semibold text-slate-400">
                    {formatSpecificationKey(
                      key,
                    )}
                  </span>

                  <span className="max-w-[58%] text-right text-[10px] font-black text-slate-700">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* Help */}
        <section className="mt-4 rounded-[22px] bg-slate-950 p-4 text-white">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/50">
            Need help choosing?
          </p>

          <h2 className="mt-1.5 text-base font-black">
            Not sure if this AC is right for you?
          </h2>

          <p className="mt-1.5 text-[10px] leading-4 text-white/60">
            Send an enquiry and the Fixxer team can confirm
            availability, installation and the next steps.
          </p>

          <Link
            href={enquiryHref}
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-white px-4 text-[10px] font-black text-slate-950 transition-colors hover:bg-slate-100"
          >
            Ask Fixxer
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </section>
      </div>
    </div>
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
      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[9px] font-black ${
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

function InfoTile({
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
    <div className="rounded-xl bg-slate-50 p-3">
      <div className="flex items-center gap-1.5">
        <span
          className={
            positive
              ? "text-primary"
              : "text-slate-400"
          }
        >
          {icon}
        </span>

        <span className="text-[8px] font-black uppercase tracking-wide text-slate-400">
          {title}
        </span>
      </div>

      <p className="mt-1 text-[10px] font-black text-slate-700">
        {value}
      </p>
    </div>
  );
}

function Reason({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.07] text-primary">
        {icon}
      </span>

      <div>
        <h3 className="text-[10px] font-black text-slate-800">
          {title}
        </h3>

        <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </div>
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