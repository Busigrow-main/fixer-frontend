"use client";

import type { ACProduct } from "../types";
import { formatSpecKey, formatSpecValue } from "../types";

interface ACTechnicalDescriptionProps {
  product: ACProduct;
  compact?: boolean;
}

export function hasTechnicalDescription(product: ACProduct): boolean {
  return Boolean(product.technicalDescription?.sections?.length);
}

export function hasLegacySpecs(product: ACProduct): boolean {
  return Boolean(
    (product.specsPerformance && Object.keys(product.specsPerformance).length > 0) ||
      (product.specsSmart && Object.keys(product.specsSmart).length > 0) ||
      (product.specsPhysical && Object.keys(product.specsPhysical).length > 0),
  );
}

export function ACTechnicalDescription({ product, compact = false }: ACTechnicalDescriptionProps) {
  const technicalSections = product.technicalDescription?.sections ?? [];
  const gap = compact ? "space-y-4" : "space-y-8";

  return (
    <div className={gap}>
      {technicalSections.map((section, si) => (
        <div key={si}>
          <h3
            className={`font-bold text-gray-900 uppercase tracking-wide mb-2 md:mb-4 ${
              compact ? "text-xs text-gray-500" : "text-sm"
            }`}
          >
            {section.title}
          </h3>
          <div className="rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
            {section.specs.map((spec, i) => (
              <div
                key={`${spec.label}-${i}`}
                className={`flex justify-between gap-3 px-3 py-2.5 md:px-5 md:py-3.5 ${
                  compact ? "text-xs" : "text-sm"
                } ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <span className="text-gray-500 shrink-0">{spec.label}</span>
                <span className="font-semibold text-gray-900 text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <LegacySpecsTables product={product} compact={compact} />

      {(product.productWarrantyYears || product.compressorWarrantyYears) && (
        <div>
          <h3
            className={`font-bold text-gray-900 uppercase tracking-wide mb-2 md:mb-4 ${
              compact ? "text-xs text-gray-500" : "text-sm"
            }`}
          >
            Warranty
          </h3>
          <div className="rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
            {product.productWarrantyYears && (
              <div
                className={`flex justify-between px-3 py-2.5 md:px-5 md:py-3.5 bg-white ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                <span className="text-gray-500">Product warranty</span>
                <span className="font-semibold text-gray-900">{product.productWarrantyYears} years</span>
              </div>
            )}
            {product.compressorWarrantyYears && (
              <div
                className={`flex justify-between px-3 py-2.5 md:px-5 md:py-3.5 bg-gray-50 ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                <span className="text-gray-500">Compressor warranty</span>
                <span className="font-semibold text-gray-900">{product.compressorWarrantyYears} years</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LegacySpecsTables({ product, compact }: { product: ACProduct; compact: boolean }) {
  const legacySections = [
    { label: "Performance", data: product.specsPerformance },
    { label: "Smart Features", data: product.specsSmart },
    { label: "Physical", data: product.specsPhysical },
  ].filter((s) => s.data && Object.keys(s.data).length > 0);

  if (legacySections.length === 0) return null;

  const showHeading = hasTechnicalDescription(product);

  return (
    <>
      {legacySections.map(({ label, data }) => (
        <div key={label}>
          <h3
            className={`font-bold text-gray-900 uppercase tracking-wide mb-2 md:mb-4 ${
              compact ? "text-xs text-gray-500" : "text-sm"
            }`}
          >
            {showHeading ? `Additional — ${label}` : label}
          </h3>
          <div className="rounded-lg md:rounded-xl border border-gray-100 overflow-hidden">
            {Object.entries(data!).map(([k, v], i) => (
              <div
                key={k}
                className={`flex justify-between gap-3 px-3 py-2.5 md:px-5 md:py-3.5 ${
                  compact ? "text-xs" : "text-sm"
                } ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                <span className="text-gray-500 capitalize">{formatSpecKey(k)}</span>
                <span className="font-semibold text-gray-900 text-right">{formatSpecValue(v)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
