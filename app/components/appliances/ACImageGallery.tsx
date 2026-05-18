"use client";

import { useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { optimizeCloudinaryUrl, optimizeGalleryImages } from "@/app/lib/cloudinary";

interface ACImageGalleryProps {
  images: string[];
  productName: string;
}

export function ACImageGallery({ images, productName }: ACImageGalleryProps) {
  const displayImages = useMemo(
    () => optimizeGalleryImages(images, 1200),
    [images],
  );

  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  const go = useCallback(
    (next: number) => {
      if (next === active || fading || displayImages.length === 0) return;
      setFading(true);
      setTimeout(() => {
        setActive(next);
        setFading(false);
      }, 180);
    },
    [active, fading, displayImages.length],
  );

  const prev = () =>
    go(active === 0 ? displayImages.length - 1 : active - 1);
  const next = () =>
    go(active === displayImages.length - 1 ? 0 : active + 1);

  if (!displayImages.length) {
    return (
      <div className="bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center aspect-[4/5] max-h-[min(72vh,560px)]">
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
      <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm aspect-[4/5] max-h-[min(72vh,560px)] w-full group">
        {displayImages.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="absolute inset-0 flex items-center justify-center bg-[#F5F5F7]"
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
              className="object-contain"
              priority={i === 0}
              sizes="(max-width: 1024px) 90vw, 520px"
              quality={90}
            />
          </div>
        ))}

        {displayImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-gray-100 flex items-center justify-center opacity-100 hover:bg-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-gray-800 text-[22px]">
                chevron_left
              </span>
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm shadow-md border border-gray-100 flex items-center justify-center opacity-100 hover:bg-white active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-gray-800 text-[22px]">
                chevron_right
              </span>
            </button>

            <div className="absolute bottom-3 right-3 z-10 bg-black/55 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {active + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {displayImages.map((src, i) => (
            <button
              key={`thumb-${src}-${i}`}
              type="button"
              onClick={() => go(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={`relative flex-shrink-0 w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden bg-white border-2 transition-all ${
                i === active
                  ? "border-[#C8102E] shadow-md"
                  : "border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-300"
              }`}
            >
              <Image
                src={optimizeCloudinaryUrl(src, 200)}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-contain p-1.5"
                sizes="72px"
                quality={85}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
