"use client";

import Link from "next/link";
import type { ACProduct } from "../types";
import { getDiscount } from "../types";
import { ACMobileImageGallery } from "./ACMobileImageGallery";
import { ACDetailAccordion } from "./ACDetailAccordion";
import { ACProductOverview } from "./ACProductOverview";
import {
  ACTechnicalDescription,
  hasLegacySpecs,
  hasTechnicalDescription,
} from "./ACTechnicalDescription";

function StarRow({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 bg-emerald-700 text-white text-xs font-bold px-1.5 py-0.5 rounded">
      <span>{rating}</span>
      <span className="material-symbols-outlined text-[12px] icon-filled">star</span>
      <span className="font-normal text-emerald-100">| BEE</span>
    </span>
  );
}

function SpecChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-shrink-0 w-[88px] bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-center">
      <p className="text-[9px] text-gray-400 uppercase font-semibold leading-tight">{label}</p>
      <p className="text-xs font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function TrustPill({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
      <span className="material-symbols-outlined text-[#C8102E] text-base">{icon}</span>
      <span className="text-[11px] font-semibold text-gray-700 whitespace-nowrap">{label}</span>
    </div>
  );
}

interface ACDetailMobileProps {
  product: ACProduct;
}

export function ACDetailMobile({ product }: ACDetailMobileProps) {
  const { discountPercent, savings } = getDiscount(product);

  const showTechnical = hasTechnicalDescription(product);
  const showLegacySpecs = hasLegacySpecs(product) && !showTechnical;

  return (
    <article className="md:hidden bg-[#F1F2F4] min-h-screen pb-mobile-cta">
      {/* Back + share row */}
      <div className="bg-white px-3 py-2 flex items-center gap-2 border-b border-gray-100">
        <Link
          href="/spare-parts/appliances/ac"
          className="flex items-center gap-0.5 text-sm font-semibold text-[#2874F0]"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
          ACs
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-500 truncate flex-1">{product.brand}</span>
      </div>

      <ACMobileImageGallery
        images={product.images}
        productName={product.name}
        discountPercent={discountPercent}
      />

      {/* Product summary card */}
      <div className="bg-white px-4 pt-3 pb-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <StarRow rating={product.starRating} />
          {product.inStock ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">In Stock</span>
          ) : (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
          )}
        </div>

        <h1 className="text-base font-medium text-gray-900 leading-snug line-clamp-3">{product.name}</h1>
        <p className="text-[11px] text-gray-400 mt-1">Model {product.modelNumber}</p>

        <div className="mt-3 flex items-baseline flex-wrap gap-2">
          <span className="text-2xl font-bold text-gray-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.originalPrice && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-sm font-bold text-[#388E3C]">{discountPercent}% off</span>
            </>
          )}
        </div>
        {savings > 0 && (
          <p className="text-xs text-[#388E3C] font-semibold mt-0.5">
            You save ₹{savings.toLocaleString("en-IN")}
          </p>
        )}
        <p className="text-[10px] text-gray-400 mt-1">Inclusive of all taxes · Installation included</p>
      </div>

      {/* Horizontal trust pills */}
      <div className="bg-white mt-1 px-4 py-3 overflow-x-auto flex gap-2 [&::-webkit-scrollbar]:hidden">
        <TrustPill icon="verified" label="Genuine Product" />
        <TrustPill icon="handyman" label="Free Installation" />
        <TrustPill icon="local_shipping" label="Patna Delivery" />
        <TrustPill icon="support_agent" label="Expert Support" />
      </div>

      {/* Spec chips — horizontal scroll */}
      <div className="bg-white mt-1 px-4 py-3">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Highlights</p>
        <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          <SpecChip label="Capacity" value={`${product.capacityTon} Ton`} />
          <SpecChip label="Type" value={product.acType.charAt(0).toUpperCase() + product.acType.slice(1)} />
          <SpecChip label="Inverter" value={product.isInverter ? "Yes" : "No"} />
          <SpecChip label="Star" value={`${product.starRating} ★`} />
          {product.roomSizeRecommendation && (
            <SpecChip label="Room" value={product.roomSizeRecommendation} />
          )}
        </div>
      </div>

      {/* Key highlights — snap scroll cards */}
      {product.highlights && product.highlights.length > 0 && (
        <div className="bg-white mt-1 px-4 py-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Why this AC</p>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden">
            {product.highlights.map((h, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[72%] snap-start border border-gray-100 rounded-xl p-3 bg-gradient-to-br from-white to-gray-50"
              >
                <div className="w-9 h-9 rounded-lg bg-[#FDE7E9] flex items-center justify-center mb-2">
                  <span className="material-symbols-outlined text-[#C8102E] text-lg">{h.icon}</span>
                </div>
                <p className="text-sm font-bold text-gray-900 leading-tight">{h.title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug line-clamp-2">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery & install */}
      <div className="bg-white mt-1 px-4 py-3 space-y-2">
        <div className="flex gap-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
          <span className="material-symbols-outlined text-emerald-600">local_shipping</span>
          <div>
            <p className="text-sm font-bold text-gray-900">Delivery across Patna & Bihar</p>
            <p className="text-[11px] text-gray-500">2–4 working days</p>
          </div>
        </div>
        <div className="flex gap-3 p-3 rounded-xl bg-[#FFF5F5] border border-[#FBCFCF]">
          <span className="material-symbols-outlined text-[#C8102E]">handyman</span>
          <div>
            <p className="text-sm font-bold text-gray-900">Installation included</p>
            <p className="text-[11px] text-gray-500">Certified technicians · 60-day service</p>
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="mt-2">
        <ACDetailAccordion
          sections={[
            {
              id: "overview",
              title: "Product Overview",
              icon: "info",
              children: <ACProductOverview product={product} compact />,
            },
            ...(showTechnical
              ? [
                  {
                    id: "technical",
                    title: "Technical Description",
                    icon: "description",
                    children: <ACTechnicalDescription product={product} compact />,
                  },
                ]
              : []),
            ...(showLegacySpecs
              ? [
                  {
                    id: "specs",
                    title: "Specifications",
                    icon: "tune",
                    children: <ACTechnicalDescription product={product} compact />,
                  },
                ]
              : []),
            {
              id: "installation",
              title: "Installation & Service",
              icon: "handyman",
              children: (
                <div className="space-y-3 text-xs text-gray-600">
                  {[
                    "Order confirmed — we call within 4 hours",
                    "Safe delivery of indoor & outdoor units",
                    "Certified technician installs & pressure-tests",
                    "Trial run + 60-day free post-install service",
                  ].map((step, i) => (
                    <div key={i} className="flex gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#C8102E] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed pt-0.5">{step}</span>
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
        />
      </div>
    </article>
  );
}
