"use client";

import {
  CheckCircle2,
  Info,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

interface ACDescriptionSectionsProps {
  description?: string;
  features?: string[];
  installationIncluded?: boolean;
  compressorWarrantyYears?: number | string;
  productWarrantyYears?: number | string;
  compact?: boolean;
}

export default function ACDescriptionSections({
  description,
  features = [],
  installationIncluded,
  compressorWarrantyYears,
  productWarrantyYears,
  compact = false,
}: ACDescriptionSectionsProps) {
  const cleanFeatures = features.filter(
    (feature): feature is string =>
      typeof feature === "string" &&
      feature.trim().length > 0,
  );

  const hasWarranty =
    compressorWarrantyYears ||
    productWarrantyYears;

  const hasServiceInfo =
    installationIncluded || hasWarranty;

  if (
    !description &&
    cleanFeatures.length === 0 &&
    !hasServiceInfo
  ) {
    return null;
  }

  return (
    <section className="w-full">
      {/* Description */}
      {description && (
        <div>
          <SectionHeading
            icon={
              <Info className="h-4 w-4" />
            }
            eyebrow="About this product"
            title="Product overview"
          />

          <div
            className={`mt-4 rounded-2xl border border-zinc-200 bg-white ${
              compact ? "p-4" : "p-5 sm:p-6"
            }`}
          >
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-600">
              {description}
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      {cleanFeatures.length > 0 && (
        <div
          className={
            description ? "mt-7" : ""
          }
        >
          <SectionHeading
            icon={
              <Sparkles className="h-4 w-4" />
            }
            eyebrow="Key highlights"
            title="Why this AC"
          />

          <div
            className={`mt-4 grid gap-2.5 ${
              compact
                ? "grid-cols-1"
                : "sm:grid-cols-2"
            }`}
          >
            {cleanFeatures.map(
              (feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </span>

                  <p className="text-sm font-semibold leading-5 text-zinc-700">
                    {feature}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Installation & warranty */}
      {hasServiceInfo && (
        <div
          className={`${
            description ||
            cleanFeatures.length > 0
              ? "mt-7"
              : ""
          }`}
        >
          <SectionHeading
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
            eyebrow="After-sales support"
            title="Installation & warranty"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {installationIncluded && (
              <ServiceCard
                icon={
                  <Wrench className="h-5 w-5" />
                }
                title="Installation included"
                description="Installation support is included with this product."
              />
            )}

            {productWarrantyYears && (
              <ServiceCard
                icon={
                  <ShieldCheck className="h-5 w-5" />
                }
                title={`${productWarrantyYears}-year product warranty`}
                description="Warranty information is based on the product catalog."
              />
            )}

            {compressorWarrantyYears && (
              <ServiceCard
                icon={
                  <ShieldCheck className="h-5 w-5" />
                }
                title={`${compressorWarrantyYears}-year compressor warranty`}
                description="Compressor warranty information is shown in the product details."
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 px-3.5 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

        <p className="text-[11px] leading-5 text-amber-800/80">
          Product specifications, installation and
          warranty details are based on the information
          available in the Fixxer catalog. Our team can
          confirm model-specific details before your
          request is finalized.
        </p>
      </div>
    </section>
  );
}

function SectionHeading({
  icon,
  eyebrow,
  title,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
        {icon}
      </span>

      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl">
          {title}
        </h2>
      </div>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/[0.06] text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <h3 className="text-sm font-black text-zinc-900">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}