"use client";

import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";

interface TrustBadgeStripProps {
  installationIncluded: boolean;
  warrantyYears?: number; // kept for backwards compatibility
  oemBrand?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TrustBadgeStrip({
  installationIncluded,
  warrantyYears: _warrantyYears,
  oemBrand = true,
  size = "md",
}: TrustBadgeStripProps) {
  const sizeConfig = {
    sm: {
      wrapper: "gap-2",
      badge: "rounded-lg px-2.5 py-1.5",
      icon: "h-3.5 w-3.5",
      text: "text-[10px]",
    },
    md: {
      wrapper: "gap-2.5",
      badge: "rounded-xl px-3 py-2",
      icon: "h-4 w-4",
      text: "text-[11px]",
    },
    lg: {
      wrapper: "gap-3",
      badge: "rounded-xl px-3.5 py-2.5",
      icon: "h-[18px] w-[18px]",
      text: "text-xs",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={`flex flex-wrap items-center ${config.wrapper}`}
      aria-label="Product benefits"
    >
      {installationIncluded && (
        <Badge
          icon={
            <Wrench
              className={`${config.icon} text-primary`}
              strokeWidth={2.4}
            />
          }
          label="Fixxer Installation"
          size={size}
          className="border-primary/15 bg-primary/[0.045] text-zinc-800"
        />
      )}

      {oemBrand && (
        <Badge
          icon={
            <CheckCircle2
              className={`${config.icon} text-emerald-600`}
              strokeWidth={2.4}
            />
          }
          label="OEM Brand"
          size={size}
          className="border-emerald-200/80 bg-emerald-50/70 text-emerald-800"
        />
      )}

      <Badge
        icon={
          <ShieldCheck
            className={`${config.icon} text-zinc-600`}
            strokeWidth={2.3}
          />
        }
        label="60-Day Service Warranty"
        size={size}
        className="border-zinc-200 bg-zinc-50 text-zinc-700"
      />

      <Badge
        icon={
          <Truck
            className={`${config.icon} text-zinc-500`}
            strokeWidth={2.2}
          />
        }
        label="Reliable Delivery"
        size={size}
        className="border-zinc-200 bg-white text-zinc-700"
      />
    </div>
  );
}

function Badge({
  icon,
  label,
  size,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  size: "sm" | "md" | "lg";
  className: string;
}) {
  const textSize = {
    sm: "text-[10px]",
    md: "text-[11px]",
    lg: "text-xs",
  }[size];

  const padding = {
    sm: "px-2.5 py-1.5",
    md: "px-3 py-2",
    lg: "px-3.5 py-2.5",
  }[size];

  return (
    <div
      className={`inline-flex min-h-8 items-center gap-1.5 border font-bold leading-none ${padding} ${className}`}
    >
      <span className="flex shrink-0 items-center justify-center">
        {icon}
      </span>

      <span className={`whitespace-nowrap ${textSize}`}>
        {label}
      </span>
    </div>
  );
}