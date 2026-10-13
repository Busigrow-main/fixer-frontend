"use client";

import {
  ChevronDown,
  FileText,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useState } from "react";

interface ACDetailAccordionProps {
  description?: string;
  specifications?: Record<string, unknown>;
  features?: string[];
  installationIncluded?: boolean;
  compressorWarrantyYears?: number | string;
  productWarrantyYears?: number | string;
  defaultOpen?: string;
}

interface AccordionItemProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  openId: string;
  setOpenId: (id: string) => void;
  children: React.ReactNode;
}

export default function ACDetailAccordion({
  description,
  specifications,
  features = [],
  installationIncluded,
  compressorWarrantyYears,
  productWarrantyYears,
  defaultOpen = "description",
}: ACDetailAccordionProps) {
  const [openId, setOpenId] =
    useState(defaultOpen);

  const hasSpecifications =
    specifications &&
    Object.keys(specifications).length > 0;

  const cleanFeatures = features.filter(
    (feature): feature is string =>
      typeof feature === "string" &&
      feature.trim().length > 0,
  );

  const hasWarranty =
    installationIncluded ||
    compressorWarrantyYears ||
    productWarrantyYears;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {description && (
        <AccordionItem
          id="description"
          title="Product description"
          icon={<FileText className="h-4 w-4" />}
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className="pb-5 pt-1">
            <p className="whitespace-pre-line text-sm leading-7 text-zinc-600">
              {description}
            </p>
          </div>
        </AccordionItem>
      )}

      {cleanFeatures.length > 0 && (
        <AccordionItem
          id="features"
          title="Key features"
          icon={
            <Sparkles className="h-4 w-4" />
          }
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className="grid gap-2 pb-5 pt-1 sm:grid-cols-2">
            {cleanFeatures.map(
              (feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="flex items-start gap-2.5 rounded-xl bg-zinc-50 px-3.5 py-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  </span>

                  <span className="text-xs font-semibold leading-5 text-zinc-700">
                    {feature}
                  </span>
                </div>
              ),
            )}
          </div>
        </AccordionItem>
      )}

      {hasSpecifications && (
        <AccordionItem
          id="specifications"
          title="Specifications"
          icon={<FileText className="h-4 w-4" />}
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className="overflow-hidden rounded-xl border border-zinc-200 pb-0">
            {Object.entries(
              specifications || {},
            ).map(([key, value], index, array) => (
              <div
                key={key}
                className={`grid grid-cols-[minmax(110px,0.8fr)_minmax(0,1.2fr)] gap-3 px-3.5 py-3 sm:grid-cols-2 ${
                  index < array.length - 1
                    ? "border-b border-zinc-100"
                    : ""
                } ${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-zinc-50/50"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-[0.08em] text-zinc-400">
                  {humanise(key)}
                </span>

                <span className="break-words text-xs font-bold leading-5 text-zinc-700">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        </AccordionItem>
      )}

      {hasWarranty && (
        <AccordionItem
          id="installation"
          title="Installation & warranty"
          icon={
            <ShieldCheck className="h-4 w-4" />
          }
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className="grid gap-2.5 pb-5 pt-1">
            {installationIncluded && (
              <ServiceRow
                icon={
                  <Wrench className="h-4 w-4" />
                }
                title="Installation included"
                description="Installation support is included with this product."
              />
            )}

            {productWarrantyYears && (
              <ServiceRow
                icon={
                  <ShieldCheck className="h-4 w-4" />
                }
                title={`${productWarrantyYears}-year product warranty`}
                description="Warranty details are based on the product catalog."
              />
            )}

            {compressorWarrantyYears && (
              <ServiceRow
                icon={
                  <ShieldCheck className="h-4 w-4" />
                }
                title={`${compressorWarrantyYears}-year compressor warranty`}
                description="Compressor warranty details are shown in the listing."
              />
            )}
          </div>
        </AccordionItem>
      )}

      <AccordionItem
        id="help"
        title="Need help choosing?"
        icon={
          <HelpCircle className="h-4 w-4" />
        }
        openId={openId}
        setOpenId={setOpenId}
      >
        <div className="pb-5 pt-1">
          <div className="rounded-xl bg-primary/[0.045] p-4">
            <p className="text-sm font-black text-zinc-900">
              Not sure if this AC is right for
              your room?
            </p>

            <p className="mt-1.5 text-xs leading-5 text-zinc-600">
              Our team can help you confirm the
              suitable capacity, model and
              installation requirements before you
              submit your enquiry.
            </p>
          </div>
        </div>
      </AccordionItem>
    </div>
  );
}

function AccordionItem({
  id,
  title,
  icon,
  openId,
  setOpenId,
  children,
}: AccordionItemProps) {
  const isOpen = openId === id;

  return (
    <div className="border-b border-zinc-100 last:border-b-0">
      <button
        type="button"
        onClick={() =>
          setOpenId(isOpen ? "" : id)
        }
        aria-expanded={isOpen}
        className="flex min-h-[58px] w-full items-center gap-3 px-4 text-left transition-colors hover:bg-zinc-50 sm:px-5"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
            isOpen
              ? "bg-primary/[0.07] text-primary"
              : "bg-zinc-100 text-zinc-500"
          }`}
        >
          {icon}
        </span>

        <span
          className={`flex-1 text-sm font-black transition-colors ${
            isOpen
              ? "text-zinc-950"
              : "text-zinc-700"
          }`}
        >
          {title}
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-primary" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          isOpen
            ? "grid-rows-[1fr]"
            : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden px-4 sm:px-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function ServiceRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50/60 p-3.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/[0.06] text-primary">
        {icon}
      </span>

      <div>
        <p className="text-xs font-black text-zinc-800">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function humanise(value: string) {
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

function formatValue(value: unknown): string {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => formatValue(item))
      .join(", ");
  }

  if (
    typeof value === "object" &&
    value !== null
  ) {
    return Object.entries(value)
      .map(
        ([key, item]) =>
          `${humanise(key)}: ${formatValue(item)}`,
      )
      .join(" • ");
  }

  return String(value);
}