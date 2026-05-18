"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import { optimizeGalleryImages } from "@/app/lib/cloudinary";

interface ACMobileImageGalleryProps {
  images: string[];
  productName: string;
  discountPercent?: number;
}

export function ACMobileImageGallery({
  images,
  productName,
  discountPercent = 0,
}: ACMobileImageGalleryProps) {
  const displayImages = useMemo(() => optimizeGalleryImages(images, 900), [images]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || displayImages.length <= 1) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActive(Math.min(idx, displayImages.length - 1));
  }, [displayImages.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  if (!displayImages.length) {
    return (
      <div className="bg-gray-100 aspect-[4/3] flex items-center justify-center">
        <span className="material-symbols-outlined text-5xl text-gray-300">image_not_supported</span>
      </div>
    );
  }

  return (
    <div className="relative bg-white">
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {displayImages.map((src, i) => (
          <div
            key={i}
            className="relative flex-shrink-0 w-full snap-center aspect-[4/3] bg-[#F5F5F7]"
          >
            <Image
              src={src}
              alt={`${productName} – ${i + 1}`}
              fill
              className="object-contain p-4"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}
      </div>

      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-[#C8102E] text-white text-[11px] font-bold px-2 py-1 rounded-md shadow">
          {discountPercent}% OFF
        </span>
      )}

      {displayImages.length > 1 && (
        <>
          <div className="absolute bottom-3 right-3 z-10 bg-black/55 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            {active + 1}/{displayImages.length}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10 pointer-events-none">
            {displayImages.map((_, i) => (
              <span
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === active ? 18 : 6,
                  height: 6,
                  background: i === active ? "#C8102E" : "rgba(0,0,0,0.25)",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
