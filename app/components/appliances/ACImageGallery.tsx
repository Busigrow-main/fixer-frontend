"use client";

import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";

interface ACImageGalleryProps {
  images?: string[];
  productName?: string;
}

export default function ACImageGallery({
  images = [],
  productName = "Air Conditioner",
}: ACImageGalleryProps) {
  const validImages = useMemo(
    () =>
      images.filter(
        (image): image is string =>
          typeof image === "string" &&
          image.trim().length > 0,
      ),
    [images],
  );

  const [activeIndex, setActiveIndex] =
    useState(0);
  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const currentImage =
    validImages[activeIndex] || null;

  const previousImage = () => {
    if (!validImages.length) return;

    setActiveIndex((current) =>
      current === 0
        ? validImages.length - 1
        : current - 1,
    );
  };

  const nextImage = () => {
    if (!validImages.length) return;

    setActiveIndex((current) =>
      current === validImages.length - 1
        ? 0
        : current + 1,
    );
  };

  if (!validImages.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[24px] border border-zinc-200 bg-zinc-50 sm:rounded-[28px]">
        <div className="px-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-zinc-300 shadow-sm">
            <span className="text-2xl">❄</span>
          </div>

          <p className="mt-3 text-sm font-bold text-zinc-500">
            Product image unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full">
        {/* Main image */}
        <div className="group relative overflow-hidden rounded-[24px] border border-zinc-200 bg-zinc-50 shadow-sm sm:rounded-[28px]">
          <div className="relative aspect-square">
            <img
              src={currentImage || ""}
              alt={`${productName} - image ${
                activeIndex + 1
              }`}
              className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 sm:p-8"
            />

            {/* Image counter */}
            {validImages.length > 1 && (
              <div className="absolute left-4 top-4 rounded-full bg-black/55 px-2.5 py-1.5 text-[10px] font-black text-white backdrop-blur sm:left-5 sm:top-5">
                {activeIndex + 1} /{" "}
                {validImages.length}
              </div>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() =>
                setIsFullscreen(true)
              }
              aria-label="View product image fullscreen"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white hover:text-primary sm:right-5 sm:top-5"
            >
              <Maximize2 className="h-4 w-4" />
            </button>

            {/* Previous */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={previousImage}
                aria-label="Previous product image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-zinc-700 opacity-100 shadow-md backdrop-blur transition hover:bg-white hover:text-primary sm:left-4"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}

            {/* Next */}
            {validImages.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next product image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/90 text-zinc-700 opacity-100 shadow-md backdrop-blur transition hover:bg-white hover:text-primary sm:right-4"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {validImages.length > 1 && (
          <div className="mt-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2.5">
              {validImages.map(
                (image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setActiveIndex(index)
                    }
                    aria-label={`View image ${
                      index + 1
                    }`}
                    aria-current={
                      activeIndex === index
                        ? "true"
                        : undefined
                    }
                    className={`relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all sm:h-20 sm:w-20 ${
                      activeIndex === index
                        ? "border-primary shadow-sm"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-contain p-1.5"
                    />

                    {activeIndex ===
                      index && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ),
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
          onClick={() =>
            setIsFullscreen(false)
          }
        >
          <button
            type="button"
            onClick={() =>
              setIsFullscreen(false)
            }
            aria-label="Close fullscreen image"
            className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="relative flex h-full w-full max-w-6xl items-center justify-center"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <img
              src={currentImage || ""}
              alt={`${productName} - image ${
                activeIndex + 1
              }`}
              className="max-h-[88vh] max-w-full object-contain"
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={previousImage}
                  aria-label="Previous product image"
                  className="absolute left-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:left-4"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next product image"
                  className="absolute right-0 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:right-4"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-black text-white backdrop-blur">
                  {activeIndex + 1} /{" "}
                  {validImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}