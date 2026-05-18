"use client";

import type { ACProduct } from "../types";
import { getDescriptionSections } from "../types";
import { ACDescriptionSections, hasHeroSection } from "./ACDescriptionSections";

interface ACProductOverviewProps {
  product: ACProduct;
  /** Tighter spacing inside mobile accordion */
  compact?: boolean;
}

const INSTALLATION_SERVICES = [
  { icon: "handyman", title: "Free Installation", desc: "Certified Fixxer technicians" },
  { icon: "local_shipping", title: "Home Delivery", desc: "Patna & Bihar — 2–4 days" },
  { icon: "support_agent", title: "60-Day Service", desc: "Post-install support included" },
];

export function ACProductOverview({ product, compact = false }: ACProductOverviewProps) {
  const sections = getDescriptionSections(product);
  const pad = compact ? "px-0" : "px-4 md:px-8";
  const sectionGap = compact ? "space-y-5" : "space-y-8";

  return (
    <div className={sectionGap}>
      {!hasHeroSection(sections) && product.shortDescription && (
        <section className={compact ? "px-0" : "px-4 md:px-8"}>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">{product.shortDescription}</p>
        </section>
      )}

      {sections.length > 0 && <ACDescriptionSections sections={sections} compact={compact} />}

      {product.whatsInBox && product.whatsInBox.length > 0 && (
        <section className={pad}>
          <SectionHeading title="What's in the Box" icon="inventory_2" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-0 md:border md:border-gray-100 md:rounded-xl md:overflow-hidden md:divide-x md:divide-y md:divide-gray-100">
            {product.whatsInBox.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 bg-white border border-gray-100 md:border-0 rounded-lg md:rounded-none px-3 py-3 md:px-5 md:py-4"
              >
                <span className="material-symbols-outlined text-[#C8102E] text-lg flex-shrink-0">package_2</span>
                <span className="text-xs md:text-sm font-semibold text-gray-800">{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {product.roomSizeRecommendation && (
        <section className={pad}>
          <div className="bg-gradient-to-r from-[#FFF5F5] to-white border border-[#FBCFCF] rounded-xl p-4 md:p-5 flex items-center gap-4">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#C8102E]/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[#C8102E] text-2xl md:text-3xl">home</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#C8102E] uppercase tracking-wide mb-0.5">Ideal Room Size</p>
              <p className="text-sm md:text-base font-bold text-gray-900">{product.roomSizeRecommendation}</p>
              <p className="text-xs text-gray-500 mt-1">
                Recommended for {product.capacityTon} Ton split AC installations
              </p>
            </div>
          </div>
        </section>
      )}

      {product.installationIncluded && (
        <section className={pad}>
          <SectionHeading title="Included with Your Purchase" />
          <div className="space-y-2">
            {INSTALLATION_SERVICES.map((s) => (
              <div
                key={s.title}
                className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FDE7E9] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#C8102E]">{s.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{s.title}</p>
                  <p className="text-xs text-gray-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="mb-3 md:mb-4">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="material-symbols-outlined text-[#C8102E] text-xl">{icon}</span>
        )}
        <h3 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-wide">{title}</h3>
      </div>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}
