"use client";

import Image from "next/image";
import type { ACDescriptionSection } from "../types";
import { sanitizeProductHtml } from "./sanitizeProductHtml";

interface ACDescriptionSectionsProps {
  sections: ACDescriptionSection[];
  compact?: boolean;
}

function sortSections(sections: ACDescriptionSection[]): ACDescriptionSection[] {
  return [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function hasHeroSection(sections?: ACDescriptionSection[]): boolean {
  return Boolean(sections?.some((s) => s.type === "hero"));
}

export function ACDescriptionSections({ sections, compact = false }: ACDescriptionSectionsProps) {
  const sorted = sortSections(sections);
  if (sorted.length === 0) return null;

  return (
    <div className={compact ? "space-y-5" : "space-y-0"}>
      {sorted.map((section, index) => (
        <SectionBlock key={`${section.type}-${index}`} section={section} index={index} compact={compact} />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  index,
  compact,
}: {
  section: ACDescriptionSection;
  index: number;
  compact: boolean;
}) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} compact={compact} />;
    case "image_text":
      return <ImageTextSection section={section} index={index} compact={compact} />;
    case "image_full":
      return <ImageFullSection section={section} compact={compact} />;
    case "feature_grid":
      return <FeatureGridSection section={section} compact={compact} />;
    case "banner":
      return <BannerSection section={section} compact={compact} />;
    case "html":
      return <HtmlSection section={section} compact={compact} />;
    default:
      return null;
  }
}

function HeroSection({ section, compact }: { section: ACDescriptionSection; compact: boolean }) {
  return (
    <section
      className={
        compact
          ? "rounded-xl overflow-hidden bg-gradient-to-br from-[#1A1A1C] via-[#252528] to-[#1A1A1C] text-white p-4"
          : "bg-gradient-to-r from-[#1A1A1C] to-[#2d2d30] text-white px-6 md:px-10 py-8 md:py-10"
      }
    >
      {section.title && (
        <h2
          className={
            compact
              ? "text-lg font-black leading-snug mb-2"
              : "text-xl md:text-3xl font-black leading-snug mb-3"
          }
        >
          {section.title}
        </h2>
      )}
      {section.subtitle && (
        <p className="text-gray-300 text-xs md:text-sm leading-relaxed max-w-2xl">{section.subtitle}</p>
      )}
    </section>
  );
}

function ImageTextSection({
  section,
  index,
  compact,
}: {
  section: ACDescriptionSection;
  index: number;
  compact: boolean;
}) {
  const imageRight = index % 2 === 1;
  const pad = compact ? "px-0" : "px-4 md:px-8";

  return (
    <section className={`ac-desc-image-text ${pad} ${compact ? "py-0" : "py-6 md:py-8"}`}>
      <div
        className={`flex flex-col gap-4 md:gap-8 md:items-center ${
          imageRight ? "md:flex-row-reverse" : "md:flex-row"
        }`}
      >
        {section.imageUrl && (
          <div className="relative w-full md:w-1/2 aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
            <ProductImage src={section.imageUrl} alt={section.imageAlt ?? section.title ?? "Product"} fill />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {section.title && (
            <h3 className="text-base md:text-xl font-black text-gray-900 mb-2">{section.title}</h3>
          )}
          {section.subtitle && (
            <p className="text-sm md:text-base text-gray-600 leading-relaxed">{section.subtitle}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ImageFullSection({ section, compact }: { section: ACDescriptionSection; compact: boolean }) {
  if (!section.imageUrl) return null;
  const pad = compact ? "" : "px-0";

  return (
    <figure className={`ac-desc-image-full ${pad} ${compact ? "" : "w-full"}`}>
      <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-100">
        <ProductImage
          src={section.imageUrl}
          alt={section.imageAlt ?? section.title ?? "Product feature"}
          fill
          sizes="100vw"
          priority={false}
        />
      </div>
      {(section.title || section.subtitle) && (
        <figcaption className={`${compact ? "px-0 pt-2" : "px-4 md:px-8 pt-3"} text-center`}>
          {section.title && <p className="text-sm font-bold text-gray-900">{section.title}</p>}
          {section.subtitle && <p className="text-xs text-gray-500 mt-0.5">{section.subtitle}</p>}
        </figcaption>
      )}
    </figure>
  );
}

function FeatureGridSection({ section, compact }: { section: ACDescriptionSection; compact: boolean }) {
  const features = section.features ?? [];
  if (features.length === 0) return null;
  const pad = compact ? "px-0" : "px-4 md:px-8";

  return (
    <section className={`ac-desc-feature-grid ${pad} ${compact ? "py-0" : "py-6 md:py-8"}`}>
      {section.title && (
        <h3 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-wide mb-3 md:mb-4">
          {section.title}
        </h3>
      )}
      {section.subtitle && <p className="text-xs text-gray-500 mb-3">{section.subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-xl border border-gray-100 bg-gradient-to-br from-white to-gray-50 p-4 md:p-5"
          >
            <div className="w-11 h-11 rounded-xl bg-[#FDE7E9] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[#C8102E] text-2xl">{f.icon}</span>
            </div>
            <p className="font-bold text-gray-900 text-sm md:text-base leading-snug mb-1">{f.title}</p>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BannerSection({ section, compact }: { section: ACDescriptionSection; compact: boolean }) {
  return (
    <section
      className={`ac-desc-banner bg-[#C8102E] text-white text-center ${
        compact ? "rounded-xl px-4 py-4 mx-0" : "px-6 md:px-10 py-6 md:py-8"
      }`}
    >
      {section.title && <p className="text-sm md:text-lg font-black">{section.title}</p>}
      {section.subtitle && (
        <p className="text-xs md:text-sm text-white/90 mt-1 max-w-xl mx-auto">{section.subtitle}</p>
      )}
    </section>
  );
}

function HtmlSection({ section, compact }: { section: ACDescriptionSection; compact: boolean }) {
  const html = section.html ? sanitizeProductHtml(section.html) : "";
  if (!html) return null;
  const pad = compact ? "px-0" : "px-4 md:px-8";

  return (
    <section className={`ac-desc-html ${pad} ${compact ? "py-0" : "py-4 md:py-6"}`}>
      {section.title && (
        <h3 className="text-sm md:text-base font-black text-gray-900 uppercase tracking-wide mb-3">
          {section.title}
        </h3>
      )}
      <div
        className="ac-product-description bg-white rounded-xl border border-gray-100 p-4 md:p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}

function ProductImage({
  src,
  alt,
  fill = true,
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      unoptimized
      className="object-cover"
    />
  );
}
