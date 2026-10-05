"use client";

import type { ACProduct } from "../types";
import {
  formatSpecKey,
  formatSpecValue,
} from "../types";

interface ACTechnicalDescriptionProps {
  product: ACProduct;
  compact?: boolean;
}

export function hasTechnicalDescription(
  product: ACProduct,
): boolean {
  return Boolean(
    product.technicalDescription?.sections?.length,
  );
}

export function hasLegacySpecs(
  product: ACProduct,
): boolean {
  return Boolean(
    (product.specsPerformance &&
      Object.keys(product.specsPerformance).length > 0) ||
      (product.specsSmart &&
        Object.keys(product.specsSmart).length > 0) ||
      (product.specsPhysical &&
        Object.keys(product.specsPhysical).length > 0),
  );
}

export function ACTechnicalDescription({
  product,
  compact = false,
}: ACTechnicalDescriptionProps) {
  const technicalSections =
    product.technicalDescription?.sections ?? [];

  const gap = compact
    ? "space-y-4"
    : "space-y-6 md:space-y-8";

  return (
    <div className={gap}>
      {technicalSections.map(
        (section, sectionIndex) => (
          <TechnicalSection
            key={`${section.title}-${sectionIndex}`}
            title={section.title}
            specs={section.specs}
            compact={compact}
          />
        ),
      )}

      <LegacySpecsTables
        product={product}
        compact={compact}
      />

      {(product.productWarrantyYears ||
        product.compressorWarrantyYears) && (
        <WarrantySection
          product={product}
          compact={compact}
        />
      )}
    </div>
  );
}

interface TechnicalSectionProps {
  title: string;
  specs: Array<{
    label: string;
    value: string;
  }>;
  compact: boolean;
}

function TechnicalSection({
  title,
  specs,
  compact,
}: TechnicalSectionProps) {
  if (!specs?.length) {
    return null;
  }

  return (
    <section>
      <SectionHeading
        title={title}
        compact={compact}
      />

      <SpecsTable
        specs={specs.map((spec) => ({
          label: spec.label,
          value: spec.value,
        }))}
        compact={compact}
      />
    </section>
  );
}

function LegacySpecsTables({
  product,
  compact,
}: {
  product: ACProduct;
  compact: boolean;
}) {
  const legacySections = [
    {
      label: "Performance",
      data: product.specsPerformance,
    },
    {
      label: "Smart Features",
      data: product.specsSmart,
    },
    {
      label: "Physical",
      data: product.specsPhysical,
    },
  ].filter(
    (
      section,
    ): section is {
      label: string;
      data: Record<string, unknown>;
    } =>
      Boolean(
        section.data &&
          Object.keys(section.data).length > 0,
      ),
  );

  if (legacySections.length === 0) {
    return null;
  }

  const showAdditionalHeading =
    hasTechnicalDescription(product);

  return (
    <>
      {legacySections.map(
        ({ label, data }) => (
          <section key={label}>
            <SectionHeading
              title={
                showAdditionalHeading
                  ? `Additional — ${label}`
                  : label
              }
              compact={compact}
            />

            <SpecsTable
              specs={Object.entries(data).map(
                ([key, value]) => ({
                  label: formatSpecKey(key),
                  value: formatSpecValue(value),
                }),
              )}
              compact={compact}
            />
          </section>
        ),
      )}
    </>
  );
}

function WarrantySection({
  product,
  compact,
}: {
  product: ACProduct;
  compact: boolean;
}) {
  const specs: Array<{
    label: string;
    value: string;
  }> = [];

  if (product.productWarrantyYears) {
    specs.push({
      label: "Product warranty",
      value: `${product.productWarrantyYears} years`,
    });
  }

  if (product.compressorWarrantyYears) {
    specs.push({
      label: "Compressor warranty",
      value: `${product.compressorWarrantyYears} years`,
    });
  }

  if (!specs.length) {
    return null;
  }

  return (
    <section>
      <SectionHeading
        title="Warranty"
        compact={compact}
      />

      <SpecsTable
        specs={specs}
        compact={compact}
      />
    </section>
  );
}

function SectionHeading({
  title,
  compact,
}: {
  title: string;
  compact: boolean;
}) {
  return (
    <h3
      className={`mb-2 flex items-center gap-2 font-black uppercase tracking-[0.08em] text-zinc-900 md:mb-3 ${
        compact
          ? "text-[10px] text-zinc-500"
          : "text-xs md:text-sm"
      }`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      {title}
    </h3>
  );
}

function SpecsTable({
  specs,
  compact,
}: {
  specs: Array<{
    label: string;
    value: string;
  }>;
  compact: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200">
      {specs.map((spec, index) => (
        <div
          key={`${spec.label}-${index}`}
          className={`grid grid-cols-[minmax(110px,0.9fr)_minmax(0,1.1fr)] gap-4 px-3.5 py-3 md:grid-cols-2 md:px-5 md:py-3.5 ${
            index < specs.length - 1
              ? "border-b border-zinc-100"
              : ""
          } ${
            index % 2 === 0
              ? "bg-white"
              : "bg-zinc-50/60"
          } ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          <span className="self-center break-words text-zinc-500">
            {spec.label}
          </span>

          <span className="self-center break-words text-right font-bold leading-5 text-zinc-900">
            {spec.value}
          </span>
        </div>
      ))}
    </div>
  );
}