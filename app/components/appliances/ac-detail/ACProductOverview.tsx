"use client";

import {
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  Tag,
  Wrench,
} from "lucide-react";

interface ACProductOverviewProps {
  product: {
    name?: string;
    brand?: string;
    modelNumber?: string;
    sku?: string;
    series?: string;
    price?: number | string;
    originalPrice?: number | string;
    starRating?: number | string;
    capacityTon?: number | string;
    acType?: string;
    isInverter?: boolean;
    inStock?: boolean;
    installationIncluded?: boolean;
    compressorWarrantyYears?: number | string;
    productWarrantyYears?: number | string;
  };
  onEnquire?: () => void;
  compact?: boolean;
}

export default function ACProductOverview({
  product,
  onEnquire,
  compact = false,
}: ACProductOverviewProps) {
  const price = toNumber(product.price);
  const originalPrice = toNumber(
    product.originalPrice,
  );

  const discount =
    price &&
    originalPrice &&
    originalPrice > price
      ? Math.round(
          ((originalPrice - price) /
            originalPrice) *
            100,
        )
      : null;

  const formattedPrice =
    price !== null
      ? formatCurrency(price)
      : null;

  const formattedOriginalPrice =
    originalPrice !== null
      ? formatCurrency(originalPrice)
      : null;

  return (
    <section className="w-full">
      {/* Brand */}
      {product.brand && (
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
            {product.brand}
          </span>

          {product.inStock && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              In stock
            </span>
          )}
        </div>
      )}

      {/* Product title */}
      <h1
        className={`font-black tracking-tight text-zinc-950 ${
          compact
            ? "text-xl leading-7"
            : "text-2xl leading-tight sm:text-3xl sm:leading-[1.15]"
        }`}
      >
        {product.name ||
          `${product.brand || ""} Air Conditioner`}
      </h1>

      {/* Model / SKU */}
      {(product.modelNumber ||
        product.sku ||
        product.series) && (
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-400">
          {product.modelNumber && (
            <>
              <span>
                Model:{" "}
                <strong className="font-bold text-zinc-600">
                  {product.modelNumber}
                </strong>
              </span>
            </>
          )}

          {product.modelNumber &&
            product.sku && (
              <span aria-hidden="true">
                •
              </span>
            )}

          {product.sku && (
            <span>
              SKU:{" "}
              <strong className="font-bold text-zinc-600">
                {product.sku}
              </strong>
            </span>
          )}

          {product.series && (
            <>
              <span aria-hidden="true">
                •
              </span>
              <span>
                {product.series}
              </span>
            </>
          )}
        </div>
      )}

      {/* Quick highlights */}
      <div
        className={`mt-5 grid grid-cols-2 gap-2 ${
          compact
            ? "sm:grid-cols-4"
            : "sm:grid-cols-4"
        }`}
      >
        {product.capacityTon && (
          <Highlight
            label="Capacity"
            value={`${product.capacityTon} Ton`}
          />
        )}

        {product.starRating && (
          <Highlight
            label="Energy rating"
            value={`${product.starRating} Star`}
            icon={
              <Star
                className="h-3 w-3 fill-current"
              />
            }
          />
        )}

        {product.acType && (
          <Highlight
            label="Type"
            value={formatText(product.acType)}
          />
        )}

        {typeof product.isInverter ===
          "boolean" && (
          <Highlight
            label="Technology"
            value={
              product.isInverter
                ? "Inverter"
                : "Non-Inverter"
            }
          />
        )}
      </div>

      {/* Pricing */}
      {(formattedPrice ||
        formattedOriginalPrice ||
        discount !== null) && (
        <div className="mt-5 border-y border-zinc-100 py-5">
          <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
            {formattedPrice && (
              <span
                className={`font-black tracking-tight text-zinc-950 ${
                  compact
                    ? "text-2xl"
                    : "text-3xl sm:text-[34px]"
                }`}
              >
                {formattedPrice}
              </span>
            )}

            {formattedOriginalPrice &&
              originalPrice !== price && (
                <span className="pb-1 text-sm font-medium text-zinc-400 line-through">
                  {formattedOriginalPrice}
                </span>
              )}

            {discount !== null && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                <Tag className="h-3 w-3" />
                {discount}% OFF
              </span>
            )}
          </div>

          <p className="mt-1.5 text-[11px] text-zinc-400">
            Final price and availability will be
            confirmed by Fixxer after your enquiry.
          </p>
        </div>
      )}

      {/* Service benefits */}
      <div className="mt-5 grid gap-2">
        {product.installationIncluded && (
          <Benefit
            icon={
              <Wrench className="h-4 w-4" />
            }
            title="Installation included"
            description="Installation support is included with this product."
          />
        )}

        {product.productWarrantyYears && (
          <Benefit
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
            title={`${product.productWarrantyYears}-year product warranty`}
            description="Warranty information is based on the catalog listing."
          />
        )}

        {product.compressorWarrantyYears && (
          <Benefit
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
            title={`${product.compressorWarrantyYears}-year compressor warranty`}
            description="Compressor warranty is shown in the product details."
          />
        )}
      </div>

      {/* CTA */}
      {onEnquire && (
        <button
          type="button"
          onClick={onEnquire}
          className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-black text-white shadow-sm transition hover:brightness-95 active:scale-[0.99]"
        >
          Enquire about this AC
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </section>
  );
}

function Highlight({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50/70 px-3 py-2.5">
      <p className="text-[9px] font-black uppercase tracking-[0.1em] text-zinc-400">
        {label}
      </p>

      <div className="mt-1 flex min-w-0 items-center gap-1 text-xs font-black text-zinc-800">
        {icon && (
          <span className="shrink-0 text-amber-500">
            {icon}
          </span>
        )}

        <span className="truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

function Benefit({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06] text-primary">
        {icon}
      </span>

      <div className="min-w-0">
        <p className="text-xs font-black text-zinc-800">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] leading-4 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function toNumber(
  value: number | string | undefined,
): number | null {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const parsed =
    typeof value === "number"
      ? value
      : Number(
          String(value).replace(
            /[^0-9.-]/g,
            "",
          ),
        );

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatText(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\w\S*/g,
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    );
}