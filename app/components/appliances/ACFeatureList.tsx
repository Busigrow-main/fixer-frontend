"use client";

import {
  CheckCircle2,
  Gauge,
  Leaf,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Zap,
} from "lucide-react";

interface ACFeatureListProps {
  capacityTon?: number | string;
  starRating?: number | string;
  acType?: string;
  isInverter?: boolean;
  roomSizeRecommendation?: string;
  installationIncluded?: boolean;
  compressorWarrantyYears?: number | string;
  productWarrantyYears?: number | string;
  compact?: boolean;
}

export default function ACFeatureList({
  capacityTon,
  starRating,
  acType,
  isInverter,
  roomSizeRecommendation,
  installationIncluded,
  compressorWarrantyYears,
  productWarrantyYears,
  compact = false,
}: ACFeatureListProps) {
  const features = [
    capacityTon
      ? {
          icon: Snowflake,
          label: "Capacity",
          value: `${capacityTon} Ton`,
        }
      : null,

    starRating
      ? {
          icon: Sparkles,
          label: "Energy Rating",
          value: `${starRating} Star`,
        }
      : null,

    acType
      ? {
          icon: Gauge,
          label: "AC Type",
          value: formatValue(acType),
        }
      : null,

    typeof isInverter === "boolean"
      ? {
          icon: Zap,
          label: "Technology",
          value: isInverter
            ? "Inverter"
            : "Non-Inverter",
        }
      : null,

    roomSizeRecommendation
      ? {
          icon: Gauge,
          label: "Recommended Room",
          value: roomSizeRecommendation,
        }
      : null,

    installationIncluded
      ? {
          icon: CheckCircle2,
          label: "Installation",
          value: "Included",
        }
      : null,

    compressorWarrantyYears
      ? {
          icon: ShieldCheck,
          label: "Compressor Warranty",
          value: `${compressorWarrantyYears} ${
            Number(compressorWarrantyYears) === 1
              ? "Year"
              : "Years"
          }`,
        }
      : null,

    productWarrantyYears
      ? {
          icon: ShieldCheck,
          label: "Product Warranty",
          value: `${productWarrantyYears} ${
            Number(productWarrantyYears) === 1
              ? "Year"
              : "Years"
          }`,
        }
      : null,

    starRating && Number(starRating) >= 4
      ? {
          icon: Leaf,
          label: "Efficiency",
          value: "Energy Efficient",
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: typeof Snowflake;
    label: string;
    value: string;
  }>;

  if (!features.length) {
    return null;
  }

  return (
    <section
      aria-label="AC features"
      className="w-full"
    >
      <div
        className={`grid ${
          compact
            ? "grid-cols-2 gap-2"
            : "grid-cols-2 gap-2.5 sm:grid-cols-3"
        }`}
      >
        {features.map(
          ({
            icon: Icon,
            label,
            value,
          }) => (
            <div
              key={`${label}-${value}`}
              className={`group border border-zinc-200 bg-white transition-colors hover:border-primary/20 ${
                compact
                  ? "rounded-xl p-3"
                  : "rounded-2xl p-3.5 sm:p-4"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`flex shrink-0 items-center justify-center rounded-lg bg-primary/[0.06] text-primary ${
                    compact
                      ? "h-8 w-8"
                      : "h-9 w-9"
                  }`}
                >
                  <Icon
                    className={
                      compact
                        ? "h-4 w-4"
                        : "h-[18px] w-[18px]"
                    }
                    strokeWidth={2.2}
                  />
                </span>

                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-zinc-400">
                    {label}
                  </p>

                  <p
                    className={`mt-1 break-words font-black tracking-tight text-zinc-900 ${
                      compact
                        ? "text-xs"
                        : "text-sm"
                    }`}
                  >
                    {value}
                  </p>
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function formatValue(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(
      /\w\S*/g,
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    );
}