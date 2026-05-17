"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface ACImageGalleryProps {
  images: string[];
  productName: string;
}

export function ACImageGallery({ images, productName }: ACImageGalleryProps) {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (next === active || fading) return;
      setFading(true);
      setTimeout(() => {
        setActive(next);
        setFading(false);
      }, 180);
    },
    [active, fading],
  );

  const prev = () => go(active === 0 ? images.length - 1 : active - 1);
  const next = () => go(active === images.length - 1 ? 0 : active + 1);

  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center h-80">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-gray-300 block mb-2">
            image_not_supported
          </span>
          <p className="text-sm text-gray-400">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none">
      {/* ── Main viewer ─────────────────────────────────────── */}
      <div className="relative bg-[#F5F5F7] rounded-2xl overflow-hidden aspect-square group">
        {/* Slides – all rendered, only active is visible */}
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 flex items-center justify-center p-6"
            style={{
              opacity: i === active ? (fading ? 0 : 1) : 0,
              transition: "opacity 0.18s ease",
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            <Image
              src={src}
              alt={`${productName} – view ${i + 1}`}
              fill
              className="object-contain p-6"
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        ))}

        {/* Arrows — only when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="
                absolute left-3 top-1/2 -translate-y-1/2 z-10
                w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow
                flex items-center justify-center
                md:opacity-0 md:group-hover:opacity-100
                hover:bg-white active:scale-95
                transition-all duration-200
              "
            >
              <span className="material-symbols-outlined text-gray-700 text-[18px]">
                chevron_left
              </span>
            </button>

            <button
              onClick={next}
              aria-label="Next image"
              className="
                absolute right-3 top-1/2 -translate-y-1/2 z-10
                w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow
                flex items-center justify-center
                md:opacity-0 md:group-hover:opacity-100
                hover:bg-white active:scale-95
                transition-all duration-200
              "
            >
              <span className="material-symbols-outlined text-gray-700 text-[18px]">
                chevron_right
              </span>
            </button>

            {/* Counter pill */}
            <div className="absolute bottom-3 right-3 z-10 bg-black/50 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* ── Dot indicators (mobile) ──────────────────────────── */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 md:hidden">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to image ${i + 1}`}
              className="transition-all duration-200"
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                borderRadius: 99,
                background: i === active ? "#C8102E" : "#D1D5DB",
              }}
            />
          ))}
        </div>
      )}

      {/* ── Thumbnail strip (desktop) ────────────────────────── */}
      {images.length > 1 && (
        <div className="hidden md:flex gap-2.5 mt-3">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`View image ${i + 1}`}
              className={`
                relative flex-shrink-0 w-[72px] h-[72px] rounded-xl overflow-hidden
                bg-[#F5F5F7] transition-all duration-200
                ${
                  i === active
                    ? "ring-2 ring-[#C8102E] ring-offset-2"
                    : "ring-1 ring-gray-200 hover:ring-gray-400 opacity-60 hover:opacity-100"
                }
              `}
            >
              <Image
                src={src}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-contain p-2"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
