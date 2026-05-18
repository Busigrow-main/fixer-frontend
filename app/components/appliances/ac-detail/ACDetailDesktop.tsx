"use client";

import Link from "next/link";
import { useState } from "react";
import { ACImageGallery } from "../ACImageGallery";
import { ACProductOverview } from "./ACProductOverview";
import { ACTechnicalDescription, hasLegacySpecs, hasTechnicalDescription } from "./ACTechnicalDescription";
import type { ACProduct } from "../types";
import { getDiscount } from "../types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <div className="flex items-center gap-0.5">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <span
              key={i}
              className={`material-symbols-outlined text-base ${
                i < rating ? "icon-filled text-amber-400" : "text-gray-300"
              }`}
            >
              star
            </span>
          ))}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating} / 5</span>
      <span className="text-xs text-gray-400">BEE Rating</span>
    </div>
  );
}

interface ACDetailDesktopProps {
  product: ACProduct;
}

export function ACDetailDesktop({ product }: ACDetailDesktopProps) {
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "installation">("description");
  const { discountPercent, savings } = getDiscount(product);

  return (
    <div className="hidden md:block pb-16">
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-4 flex items-center gap-1.5 text-xs text-gray-500 flex-wrap"
      >
        {[
          { href: "/", label: "Home" },
          { href: "/spare-parts", label: "Spare Parts" },
          { href: "/spare-parts/appliances", label: "Appliances" },
          { href: "/spare-parts/appliances/ac", label: "Air Conditioners" },
        ].map(({ href, label }) => (
          <span key={href} className="flex items-center gap-1.5">
            <Link href={href} className="hover:text-[#C8102E] transition-colors">
              {label}
            </Link>
            <span className="material-symbols-outlined text-gray-300" style={{ fontSize: 12 }}>
              chevron_right
            </span>
          </span>
        ))}
        <span className="text-gray-800 font-medium truncate max-w-md">{product.name}</span>
      </nav>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)] gap-8 xl:gap-12 items-start">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="relative">
              <ACImageGallery images={product.images} productName={product.name} />
              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 z-20 bg-[#C8102E] text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md pointer-events-none">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-xl bg-white overflow-hidden text-center shadow-sm">
              {[
                { icon: "verified", label: "Genuine Product" },
                { icon: "local_shipping", label: "Fast Delivery" },
                { icon: "support_agent", label: "Expert Support" },
              ].map(({ icon, label }) => (
                <div key={label} className="py-3.5 px-2 flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-[#C8102E] text-lg">{icon}</span>
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {product.brand}
              </span>
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined icon-filled text-sm">check_circle</span>
                  In Stock · Ready to Ship
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  <span className="material-symbols-outlined text-sm">cancel</span>
                  Out of Stock
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-gray-400 font-mono mb-1.5">Model: {product.modelNumber}</p>
              <h1 className="font-headline text-2xl lg:text-[1.75rem] font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>
              <div className="mt-3">
                <StarRating rating={product.starRating} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FFF5F5] to-white border border-[#FBCFCF] rounded-xl p-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="bg-[#C8102E] text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
              {savings > 0 && (
                <p className="text-sm text-[#C8102E] font-semibold mt-1.5">
                  You save ₹{savings.toLocaleString("en-IN")} on this purchase
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1.5">
                Inclusive of all taxes · Installation included
              </p>
            </div>

            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                At a Glance
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { icon: "air", label: "Capacity", value: `${product.capacityTon} Ton` },
                  {
                    icon: "category",
                    label: "Type",
                    value: product.acType.charAt(0).toUpperCase() + product.acType.slice(1),
                  },
                  { icon: "star", label: "Star Rating", value: `${product.starRating} ★` },
                  { icon: "speed", label: "Inverter", value: product.isInverter ? "Yes" : "No" },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-[#F8F8F9] border border-gray-100 rounded-xl p-3 flex flex-col gap-1"
                  >
                    <span className="material-symbols-outlined text-[#C8102E] text-base">{icon}</span>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {product.highlights && product.highlights.length > 0 && (
              <div className="border-t border-gray-100 pt-5">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Key Highlights
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-[#FDE7E9] flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-[#C8102E] text-sm">{h.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 leading-tight">{h.title}</p>
                        <p className="text-[11px] text-gray-500 leading-snug mt-0.5">{h.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href={`/spare-parts/enquiry?product=${product.slug}&type=appliance`}
                className="flex-1 bg-[#C8102E] hover:bg-[#A00826] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#C8102E]/20"
              >
                <span className="material-symbols-outlined text-xl">mail</span>
                Enquire Now
              </Link>
              <a
                href={`https://wa.me/917004771388?text=${encodeURIComponent(`Hi Fixxer! I'm interested in the ${product.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#25D366] hover:bg-[#1ebe5a] active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20"
              >
                <span className="material-symbols-outlined text-xl">chat</span>
                WhatsApp Us
              </a>
            </div>

            <div className="flex flex-col gap-2 text-sm border-t border-gray-100 pt-5">
              <div className="flex items-start gap-3 rounded-xl bg-[#F8F8F9] px-4 py-3">
                <span className="material-symbols-outlined text-emerald-600 flex-shrink-0">local_shipping</span>
                <div>
                  <span className="font-semibold text-gray-800">Delivery across Patna &amp; Bihar</span>
                  <p className="text-xs text-gray-500 mt-0.5">Estimated delivery in 2–4 working days</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-[#F8F8F9] px-4 py-3">
                <span className="material-symbols-outlined text-[#C8102E] flex-shrink-0">handyman</span>
                <div>
                  <span className="font-semibold text-gray-800">Professional Installation Included</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Certified Fixxer technicians · 60-day free service
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-10 mt-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {(
              [
                { id: "description" as const, label: "Product Overview", icon: "info" },
                { id: "specs" as const, label: "Specifications", icon: "tune" },
                { id: "installation" as const, label: "Installation", icon: "handyman" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 lg:px-8 py-4 font-bold text-sm transition-colors border-b-2 flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-[#C8102E] text-[#C8102E] bg-[#FFF5F5]/50"
                    : "border-transparent text-gray-400 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "description" && (
            <div className="py-6 lg:py-8">
              <ACProductOverview product={product} />
            </div>
          )}

          {activeTab === "specs" &&
            (hasTechnicalDescription(product) || hasLegacySpecs(product)) && (
              <div className="p-6 lg:p-8">
                <ACTechnicalDescription product={product} />
              </div>
            )}

          {activeTab === "installation" && (
            <div className="p-6 lg:p-8">
              <h2 className="font-headline text-xl font-bold text-gray-900 mb-2">
                Professional Installation — Included Free
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Every Fixxer appliance purchase includes end-to-end installation by certified
                technicians.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: "schedule", title: "2–3 Day Turnaround", sub: "Installation within 2–3 working days" },
                  { icon: "support_agent", title: "60-Day Free Service", sub: "Post-install support at zero cost" },
                  { icon: "calendar_month", title: "Flexible Slots", sub: "8 AM to 8 PM, 7 days a week" },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="rounded-xl border border-gray-100 p-5 bg-[#F8F8F9]">
                    <span className="material-symbols-outlined text-[#C8102E] text-xl">{icon}</span>
                    <p className="font-bold text-gray-900 text-sm mt-2">{title}</p>
                    <p className="text-xs text-gray-500 mt-1">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
