"use client";

interface TrustBadgeStripProps {
  installationIncluded: boolean;
  warrantyYears?: number; // kept for backwards compat; badge removed
  oemBrand?: boolean;
  size?: "sm" | "md" | "lg";
}

export function TrustBadgeStrip({
  installationIncluded,
  oemBrand = true,
  size = "md",
}: TrustBadgeStripProps) {
  const sizeClasses = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  const badgePaddingClasses = {
    sm: "px-2 py-1",
    md: "px-3 py-2",
    lg: "px-4 py-3",
  };

  return (
    <div className={`flex flex-wrap items-center ${sizeClasses[size]}`}>
      {installationIncluded && (
        <div
          className={`flex items-center gap-1 ${badgePaddingClasses[size]} bg-blue-50 border border-blue-200 rounded-lg`}
        >
          <span
            className={`material-symbols-outlined ${iconSizeClasses[size]} text-blue-600`}
          >
            verified
          </span>
          <span
            className={`${textSizeClasses[size]} font-semibold text-blue-900`}
          >
            Fixxer Installation
          </span>
        </div>
      )}


      {oemBrand && (
        <div
          className={`flex items-center gap-1 ${badgePaddingClasses[size]} bg-green-50 border border-green-200 rounded-lg`}
        >
          <span
            className={`material-symbols-outlined ${iconSizeClasses[size]} text-green-600`}
          >
            check_circle
          </span>
          <span
            className={`${textSizeClasses[size]} font-semibold text-green-900`}
          >
            OEM Brand
          </span>
        </div>
      )}

      <div
        className={`flex items-center gap-1 ${badgePaddingClasses[size]} bg-orange-50 border border-orange-200 rounded-lg`}
      >
        <span
          className={`material-symbols-outlined ${iconSizeClasses[size]} text-orange-600`}
        >
          local_shipping
        </span>
        <span
          className={`${textSizeClasses[size]} font-semibold text-orange-900`}
        >
          60-Day Service Warranty
        </span>
      </div>
    </div>
  );
}
