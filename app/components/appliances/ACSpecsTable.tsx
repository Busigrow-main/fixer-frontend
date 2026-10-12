"use client";

import {
  CheckCircle2,
  Cpu,
  Gauge,
  Info,
  Leaf,
  ShieldCheck,
  Snowflake,
  Zap,
} from "lucide-react";

interface ACSpecsTableProps {
  product?: {
    brand?: string;
    modelNumber?: string;
    sku?: string;
    series?: string;
    capacityTon?: number | string;
    starRating?: number | string;
    acType?: string;
    isInverter?: boolean;
    roomSizeRecommendation?: string;
    installationIncluded?: boolean;
    compressorWarrantyYears?: number | string;
    productWarrantyYears?: number | string;
  };

  specs?: Record<string, unknown>;
  compact?: boolean;
}

interface SpecRow {
  label: string;
  value: string;
  icon: React.ElementType;
}

export default function ACSpecsTable({
  product,
  specs,
  compact = false,
}: ACSpecsTableProps) {
  const rows: SpecRow[] = [];

  const add = (
    label: string,
    value: unknown,
    icon: React.ElementType,
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return;
    }

    rows.push({
      label,
      value: formatValue(value),
      icon,
    });
  };

  add("Brand", product?.brand, ShieldCheck);
  add("Model Number", product?.modelNumber, Cpu);
  add("SKU", product?.sku, Info);
  add("Series", product?.series, Info);
  add(
    "Capacity",
    product?.capacityTon
      ? `${product.capacityTon} Ton`
      : undefined,
    Snowflake,
  );
  add(
    "Energy Rating",
    product?.starRating
      ? `${product.starRating} Star`
      : undefined,
    Leaf,
  );
  add("AC Type", product?.acType, Snowflake);

  if (typeof product?.isInverter === "boolean") {
    add(
      "Technology",
      product.isInverter
        ? "Inverter"
        : "Non-Inverter",
      Zap,
    );
  }

  add(
    "Recommended Room Size",
    product?.roomSizeRecommendation,
    Gauge,
  );

  if (
    typeof product?.installationIncluded ===
    "boolean"
  ) {
    add(
      "Installation",
      product.installationIncluded
        ? "Included"
        : "Not Included",
      CheckCircle2,
    );
  }

  add(
    "Compressor Warranty",
    product?.compressorWarrantyYears
      ? `${product.compressorWarrantyYears} ${
          Number(
            product.compressorWarrantyYears,
          ) === 1
            ? "Year"
            : "Years"
        }`
      : undefined,
    ShieldCheck,
  );

  add(
    "Product Warranty",
    product?.productWarrantyYears
      ? `${product.productWarrantyYears} ${
          Number(
            product.productWarrantyYears,
          ) === 1
            ? "Year"
            : "Years"
        }`
      : undefined,
    ShieldCheck,
  );

  if (specs) {
    Object.entries(specs).forEach(
      ([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return;
        }

        const alreadyExists = rows.some(
          (row) =>
            normalise(row.label) ===
            normalise(key),
        );

        if (alreadyExists) {
          return;
        }

        add(
          humanise(key),
          value,
          Info,
        );
      },
    );
  }

  if (!rows.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="ac-specifications-heading"
      className="w-full"
    >
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
          Product information
        </p>

        <h2
          id="ac-specifications-heading"
          className="mt-1 text-xl font-black tracking-tight text-zinc-950 sm:text-2xl"
        >
          Specifications
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <dl>
          {rows.map((row, index) => {
            const Icon = row.icon;
            const isLast =
              index === rows.length - 1;

            return (
              <div
                key={`${row.label}-${index}`}
                className={`grid grid-cols-[36px_minmax(0,1fr)] gap-3 px-4 py-3.5 sm:grid-cols-[40px_minmax(150px,0.8fr)_minmax(0,1.5fr)] sm:items-center sm:gap-4 sm:px-5 ${
                  !isLast
                    ? "border-b border-zinc-100"
                    : ""
                } ${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-zinc-50/50"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.055] text-primary">
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={2.2}
                  />
                </div>

                <dt className="min-w-0">
                  <span className="block text-[10px] font-black uppercase tracking-[0.1em] text-zinc-400">
                    {row.label}
                  </span>
                </dt>

                <dd className="col-start-2 break-words text-sm font-bold leading-5 text-zinc-900 sm:col-start-auto">
                  {row.value}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>

      {!compact && (
        <div className="mt-3 flex gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" />

          <p className="text-[11px] leading-5 text-zinc-500">
            Specifications are based on the product
            information available in the Fixxer catalog.
            Confirm model-specific details with our team
            before placing your request.
          </p>
        </div>
      )}
    </section>
  );
}

function formatValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .join(", ");
  }

  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${humanise(key)}: ${formatValue(item)}`,
      )
      .join(" • ");
  }

  return String(value);
}

function humanise(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\w\S*/g,
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    );
}

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}